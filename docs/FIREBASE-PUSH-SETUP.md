# Juntô — Firebase Push Android e emissor HTTP v1

Estado em 13/10/2026: **PR #39 foi mesclado por outro fluxo em 10/10; esta revisão prepara correções em uma nova branch, sem merge ou deploy de produção.** Configuração do secret com chave nova e entrega real ainda não comprovadas.

## Evidências de acesso

- O conector Supabase confirmou o projeto `junto-app` / `sbquedasoydfsvbarvos`, ativo e saudável.
- Consulta somente de leitura confirmou `junto_push_devices` com RLS ativo e leitura negada a `anon`. A tabela já havia sido aplicada antes desta revisão.
- Havia **0 dispositivos registrados, 0 Edge Functions, 0 branches DEV e 0 triggers no snapshot**. Não foram gerados dados, enviadas notificações ou aplicadas migrações nesse projeto.
- O login do dashboard Supabase bloqueia a configuração de secrets; o conector disponível não oferece gravação de secrets.
- O Firebase `junto-apk` exige login Google. O login seguro do Supabase foi interrompido antes de haver evidência de autenticação. **Uma chave nova não foi gerada; nenhum JSON antigo foi lido ou reutilizado.**
- A CI original do PR (`f14bf1c`) compilou o APK, mas informou Firebase não configurado. O `main` posterior já contém `android/app/google-services.json`, validado nesta revisão como configuração Android de `junto-apk` / `br.com.junto.app`, sem chave privada. Build e configuração pública não comprovam token ou entrega real.

## Implementação no PR

- Plugin oficial `@capacitor/push-notifications@8.0.0`, canal `junto_avisos`, ícone, permissões, recebimento e abertura da central de avisos após login.
- Consentimento por conta e aparelho. O consentimento antigo, global ao aparelho, não é transferido automaticamente para outra conta.
- Desativação aguarda as gravações de token em andamento antes de remover o aparelho. Falha/timeout de rede não comprova revogação remota; o app também solicita a invalidação nativa e informa erro se a remoção falhar.
- Registro do dispositivo após autenticação. A nova migração vincula o token à sessão real do Supabase, obtida do JWT no servidor. Sessão falsa é ignorada/rejeitada; exclusão da sessão remove o dispositivo por FK.
- Emissor `supabase/functions/junto-push` com `verify_jwt = true`, validação adicional em Auth, membro/dupla conferidos e sessão do remetente revalidada no banco.
- FCM HTTP v1 com JWT RS256 assinado via Web Crypto, OAuth de curta duração com cache, escopo `firebase.messaging` e endpoints Google fixos.
- Compatibilidade com as chaves modernas publicável/secreta do Supabase e com as legadas. Uma chave `sb_secret_...` segue apenas no header `apikey`, nunca como Bearer.
- O cliente só pode fornecer `spaceId`. Destinatários, tokens, tipo de evento e conteúdo do push são selecionados no backend.
- Push genérico, sem nomes, valores financeiros ou conteúdo das conversas na tela bloqueada. O aviso completo continua no aplicativo.

## Eventos, autorização e deduplicação

`supabase/migrations/20261010190919_junto_fcm_outbox.sql` adiciona a fila privada e funções exclusivas de `service_role`. Ela requer o `setup.sql` e a tabela de dispositivos já existentes; não substitui as funções financeiras.

O trigger captura apenas avisos novos, não lidos, recentes e confirmados em `junto_snapshots`, com `from` igual ao membro autenticado e `to` igual ao outro membro. Pedidos, aprovações, recusas, compras e cancelamentos também precisam corresponder ao pedido persistido e ao seu estado. Os demais avisos do casal usam uma mensagem genérica. Avisos antigos sem `from` continuam funcionando dentro do app, sem envio remoto retroativo.

Há unicidade de evento por `(space_id, notification_id)` e de envio por `(event_id, user_id, device_id)`. Claims usam `FOR UPDATE SKIP LOCKED`, são persistidos antes do envio e têm identificador próprio. Token, consentimento, sessão, membros atuais e aviso não lido são conferidos novamente imediatamente antes do FCM. Um token trocado, sessão encerrada ou dupla desconectada invalida o claim.

O estado **`accepted` significa aceitação pelo FCM, não recebimento no celular**. Timeout, resposta ambígua ou interrupção do worker ficam em `unknown` e não são reenviados automaticamente. Uma entrega já consumida nunca é retomada por outra chamada. Só o erro FCM específico `UNREGISTERED` desativa o token exato usado no claim; `INVALID_ARGUMENT` não revoga o aparelho.

Isso evita repetição de tentativas pela aplicação. Não promete entrega exatamente uma vez pelo provedor. O `tag` Android usa o ID do evento para reduzir avisos repetidos na bandeja. Falhas definitivas ficam registradas para inspeção, sem repetição automática.

O despertar do emissor acontece após a sincronização confirmada, sem bloquear o financeiro. Chamadas concorrentes e eventos criados durante o intervalo de proteção são agrupados e recebem um despertar posterior. Se o remetente encerrar o app antes do primeiro despertar, a fila aguarda sua próxima sincronização. Não foi criado cron ou webhook em produção. Há validade de 24 horas, limite de 20 eventos novos por snapshot, 120 por autor/hora e 5 aparelhos ativos por conta.

## Configuração separada de cliente e servidor

| Nome | Local | Conteúdo / finalidade |
|---|---|---|
| `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` | GitHub Actions | Sobrescrita opcional do `google-services.json` **do Android**, em Base64 ou JSON direto; sem secret o workflow usa o arquivo público versionado. Projeto `junto-apk`, pacote `br.com.junto.app` |
| `JUNTO_PUSH_ENABLED` | Build do APK | `true` somente quando o JSON Android está disponível; o workflow define automaticamente após a validação |
| `JUNTO_PUSH_DISPATCH_ENABLED` | Build do web/app de homologação | Habilita chamadas ao emissor; padrão **false** |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Supabase → Edge Functions → Secrets | JSON integral de uma **nova** chave da conta de serviço do Firebase, sem Base64; exclusivo de servidor |
| `FIREBASE_PROJECT_ID` | Secrets da Edge Function | `junto-apk` |
| `JUNTO_FCM_ENABLED` | Secrets da Edge Function | Padrão desativado; usar `true` apenas no ambiente autorizado para homologação/ativação |
| `JUNTO_PUSH_ALLOWED_ORIGINS` | Secrets da Edge Function | Lista de origens autorizadas. Adicionar a origem DEV/preview explicitamente |
| `SUPABASE_URL` e chaves publicável/secreta | Ambiente da Edge Function | Fornecidos automaticamente pelo Supabase; nunca inserir a chave secreta no frontend |

O build rejeita Admin SDK JSON, projeto incorreto, pacote incorreto e JSON inválido sem imprimir seu conteúdo. Credencial Firebase privada, arquivo `.env` ou chave de serviço nunca deve entrar no Git, APK, chat ou screenshot.

## Homologação antes da produção

1. Recuperar o acesso autenticado ao Firebase e ao dashboard Supabase. Gerar uma nova chave no Firebase → Configurações → Contas de serviço → Firebase Admin SDK; guardar o download fora do repositório. Não reutilizar a chave compartilhada anteriormente.
2. Configurar `FIREBASE_SERVICE_ACCOUNT_JSON` e `FIREBASE_PROJECT_ID` diretamente nos secrets, sem habilitar o emissor de produção. Verificar a gravação e autenticação OAuth; ainda pendentes nesta revisão.
3. Escolher um ambiente DEV isolado, aplicar os pré-requisitos e a migração preparada, revisar advisors desse ambiente e publicar `junto-push` mantendo JWT obrigatório. O projeto informado não tinha branch DEV; nenhuma foi criada com custo sem autorização.
4. Habilitar os flags apenas no DEV; gerar APK de homologação apontando para esse ambiente e com `google-services.json` correto. O APK já instalado não incorpora o plugin por atualização da página.
5. Confirmar token real e testar dois usuários/aparelhos. Comparar evento, claim, resposta FCM e recebimento no destinatário correto; nunca publicar tokens ou cabeçalhos de autenticação nas evidências.

CLI conferida: Supabase `2.120.0`, com `secrets set --env-file <arquivo-privado> --project-ref <ref>` e `functions deploy junto-push --project-ref <ref> --use-api`. O arquivo privado deve ser temporário, ter permissões restritas e ser apagado após a gravação. Não desabilitar JWT, não usar `--prune` e não aplicar a migração no projeto de produção nesta etapa.

## O que depende do APK real

- APK compilado com Firebase de `junto-apk` e pacote `br.com.junto.app`; confirmação da permissão Android, criação do canal e geração do token.
- Cada membro recebe apenas os avisos destinados à sua conta, com app aberto, em segundo plano e removido dos recentes. Testar separadamente “forçar parada”, pois é uma restrição do Android.
- Toque no aviso abre a central após autenticação, com o conteúdo original sincronizado.
- Novo pedido, aprovação, recusa, compra, cancelamento e demais avisos do casal geram um evento persistido e o envio esperado.
- Cliques repetidos e sincronização simultânea nos dois celulares não criam outro envio para o mesmo evento/aparelho.
- Desativação, logout, sessão revogada, troca de conta, token atualizado e desconexão da dupla bloqueiam novos envios ao destinatário antigo. Um envio já aceito pelo provedor pode estar em trânsito; isso precisa ser observado nos testes.
- Notificações dos bancos, lembretes existentes, saldos, pedidos e demais fluxos do app continuam funcionando.

Código, teste simulado, commit ou APK gerado não comprovam entrega real. As correções desta revisão devem ser homologadas em DEV e revisadas antes de qualquer merge ou implantação.
