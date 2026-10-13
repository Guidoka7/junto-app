# Revisão PR #39 — Juntô / Firebase Cloud Messaging

## Resultado e limites

O PR #39 foi mesclado por outro fluxo em 10/10/2026, enquanto esta tarefa aguardava autenticação. A revisão foi retomada sobre `main` / `1a8afe1`, com as correções na branch `feat/fcm-secure-outbox-20261013`. Implementação de servidor, fila persistente, isolamento de destinatários, deduplicação e integração pós-sincronização preparada para um novo PR em rascunho. **Não houve merge, deploy de Edge Function ou alteração do banco de produção nesta revisão.**

`FIREBASE_SERVICE_ACCOUNT_JSON` com chave nova **não está configurado nem validado**. O acesso de secrets exige login do dashboard Supabase; o fluxo seguro de login foi interrompido. O Firebase exige autenticação Google. Não foram lidas ou reutilizadas as chaves privadas antigas.

## Achados corrigidos

1. O PR original preparava recepção Android. O `main` posterior acrescentou um remetente simples com secret `FIREBASE_SERVICE_ACCOUNT`. Substituído por OAuth/FCM HTTP v1 testável, secret solicitado `FIREBASE_SERVICE_ACCOUNT_JSON` e fila dos eventos confirmados do casal, com autenticação e sessão verificadas.
2. Consentimento era global no aparelho e podia acompanhar outra conta. Agora é individual por usuário, e callbacks atrasados de registro são descartados após mudança da autenticação/desativação.
3. Tokens não estavam vinculados à sessão real. A migração preparada deriva a sessão do JWT no servidor, impede a atribuição de sessão alheia e remove tokens quando a sessão é excluída.
4. O remetente posterior registrava dedupe antes de consultar aparelhos ou obter OAuth, podendo consumir avisos sem uma tentativa de envio. Agora há entrega por aparelho, pré-validação OAuth, claims exclusivos e estados terminais. Falhas ambíguas não são reenviadas automaticamente; só UNREGISTERED comprovado revoga o token exato, sem revogar por INVALID_ARGUMENT.
5. Avisos completos continham valores e texto financeiro. O push externo usa conteúdo genérico; o aviso original dentro do app é mantido.
6. Build aceitava qualquer projeto Firebase com o pacote correto e podia emitir erro de parsing com conteúdo do arquivo. Agora exige `junto-apk` / `br.com.junto.app`, rejeita Admin SDK e emite apenas erro genérico.
7. Eventos criados durante uma chamada/inibição inicial poderiam ficar na fila sem novo despertar. Implementado despertar posterior agrupado e processamento de lotes limitados. Removido o emissor antigo do cliente para evitar duas chamadas/protocolos concorrentes.
8. Dois testes de navegador falhavam também no head original f14bf1c: seletor oculto do perfil e timeout padrão de 45s num longo ciclo com dois contextos e PGlite. Corrigido o seletor visível; ampliado somente o timeout desse ciclo para 120s, mantendo suas verificações.

9. Confirmada e corrigida uma corrida entre upsert do token e desativação: a revogação agora aguarda as gravações já iniciadas, com timeout, para que DELETE seja a última gravação confirmada. O novo teste reproduziu a falha antes da correção e passou depois. Resultados tardios também não alteram o estado da conta seguinte.

## Evidências reproduzíveis

| Verificação | Resultado |
|---|---|
| `npm ci` | Instalado a partir do lockfile |
| Sintaxe / ações / formulários (`npm run check`) | Passou |
| `node --test --test-concurrency=2 tests/*.test.mjs` | **137 testes passaram**, 0 falhas |
| Parser Android (`npm run test:android-parser`) | **15 verificações passaram** |
| `deno check .../junto-push/index.ts` com Deno 2.9.6 | Passou |
| Testes novos do despertar no navegador | **2 passaram**; falha do emissor não prejudicou sync/avisos |
| Regressão completa no navegador | **67 testes passaram**, 0 falhas, incluindo Virada, sincronização entre duas contas, financeiro, tema, avisos e os dois testes FCM novos |
| Banco local PGlite | 12 cenários de fila, RLS, autorização, sessão, token, isolamento, dedupe e desconexão passaram; migração reaplicada nos fixtures |
| OAuth e FCM | JWT RS256 verificado com Web Crypto real; transportes HTTP simulados, sem chave Firebase real |
| APK original `f14bf1c` | CI compilou; log informou **Firebase não configurado** |
| APK do `main` atual `1a8afe1` | CI 38094155385 / job 114336474959 passou; log real informou **Firebase: projeto junto-apk** e **BUILD SUCCESSFUL**. Não prova entrega |
| Dependências de produção | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades |
| Vercel no head anterior | Preview recusado por limite de builds; não foi corrigido ou publicado em produção |

Todos os testes novos usam usuários, sessões, tokens e chave RSA **sintéticos**. Testes de build usam cópia temporária isolada e verificam que secret de servidor não entra no bundle. Testes do emissor negam pedido sem autenticação, usuário anônimo, sessão inválida, dupla alheia e tentativa de fornecer tokens/destinatários/conteúdo.

PGlite comprova comportamento SQL e permissões nos fixtures; não substitui teste de concorrência com conexões reais no Supabase DEV. Não havia Docker/SDK Android/Java 21 neste ambiente para compilar o APK localmente; a compilação final da branch deve ser comprovada na CI, e execução em aparelho continua pendente.

## Estado do Supabase confirmado em 13/10

Consulta somente de leitura: 0 dispositivos registrados/ativos, 0 Edge Functions, 0 branches DEV, fila nova ausente e tabela legacy junto_push_log ausente. Nenhuma migration desta revisão foi aplicada.

Advisors existentes: um WARN por [proteção contra senhas vazadas desabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), e cinco INFO por [RLS sem políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) em tabelas privadas que operam com acesso negado ao cliente. Não alterados nesta tarefa. Advisors da migração nova em Supabase DEV seguem pendentes.

## Condições para avançar

- Recuperar o acesso e configurar a **nova** credencial de servidor, com prova de OAuth válido e do secret salvo.
- Homologar migration/advisors e Edge Function em DEV, sem usar dados financeiros de produção.
- Confirmar a configuração pública Android no secret de build e gerar APK com push efetivamente habilitado.
- Testar dois aparelhos reais, destinatário correto, foreground/background, toque, logout, troca de conta e ausência de duplicação.

Referência oficial conferida: [autenticação de Edge Functions](https://supabase.com/docs/guides/functions/auth). A função voltada ao usuário conserva `verify_jwt = true` e valida o usuário/sessão adicionalmente.

O guia completo e os limites de entrega estão em `docs/FIREBASE-PUSH-SETUP.md`. Nenhuma dessas etapas pendentes está marcada como concluída.
