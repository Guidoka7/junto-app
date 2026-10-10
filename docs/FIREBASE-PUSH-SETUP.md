# Juntô — Firebase Push no APK Android

Estado: código preparado em branch de homologação. Ainda falta configurar o Firebase, aplicar a tabela no Supabase, compilar e testar em aparelho real.

## O que foi implementado

- Plugin oficial de push compatível com Capacitor 8, com permissão Android, token FCM, avisos recebidos e toque no aviso.
- Canal Android `junto_avisos`, apresentação em primeiro plano e ícone de notificação.
- Botão opcional em Ajustes (somente no Android). Sem credenciais Firebase o controle fica desabilitado.
- Token vinculado à identidade Supabase autenticada, ao aparelho e à opção de consentimento.
- No logout, o Juntô tenta excluir o token do banco e sempre tenta invalidar o token nativo.
- O toque em uma notificação sincroniza e abre os avisos da própria conta.
- Não altera a leitura das notificações dos bancos nem o financeiro do app.

## O que você precisa configurar

1. Abra https://console.firebase.google.com/ e crie/selecione o projeto Firebase para o Juntô.
2. Adicione um app Android com o package name **`br.com.junto.app`** (exatamente este).
3. Baixe o arquivo **`google-services.json`** do app Android.
4. No GitHub, acesse **Guidoka7/junto-app → Settings → Secrets and variables → Actions → New repository secret**.
5. Crie o secret **`FIREBASE_GOOGLE_SERVICES_JSON_BASE64`** com o arquivo JSON convertido integralmente para Base64. No PowerShell, use:

    [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\caminho\google-services.json')) | Set-Clipboard

6. No **Supabase do Juntô**, aplique o SQL de `supabase/push-devices.sql` depois de revisar o schema atual. Não altere as tabelas financeiras ou o setup existente.
7. Gere **um APK novo** pelo workflow GitHub Actions `Gerar APK Android` ou pelo Gradle. A versão instalada atualmente não incorpora o plug-in automaticamente.

O GitHub Actions lê o secret sem imprimi-lo, valida o pacote e habilita a conexão. Se o secret não existir, a Action continua produzindo APK sem push, preservando o comportamento atual.

Para build local, copie `google-services.json` para `android/app/` (ignorando-o no Git), defina `JUNTO_PUSH_ENABLED=true` e execute `npm ci`, `npm run android:sync` e o build Gradle.

## Etapa separada: envio automático de avisos

O APK assim preparado consegue registrar token e receber mensagens de teste enviadas pelo Console Firebase. Para transformar eventos do Juntô (pedidos, contas e metas) em push automático precisamos de **emissor autenticado no backend**, preferencialmente Supabase Edge Function com FCM HTTP v1 e credencial Firebase Admin protegida como secret de servidor.

O serviço ainda precisa identificar destinatários pelo usuário real do Supabase, consumir eventos confirmados do banco com idempotência, respeitar preferências e evitar mostrar valores sensíveis na tela bloqueada. **Nunca coloque a chave privada da conta de serviço no APK ou no repositório.**

## Homologação necessária

- [ ] `npm ci`, `npm run check`, `npm test`, `npm run android:sync` e compilação Android sem erros.
- [ ] APK com `google-services.json` válido exibe o botão em Ajustes e permite receber um token FCM.
- [ ] O token é associado ao usuário correto, e RLS nega leitura dos tokens de outro usuário.
- [ ] Push de teste recebido com app aberto, em segundo plano e fechado.
- [ ] Toque no aviso abre a área de notificações após autenticação.
- [ ] Logout, troca de conta e desativação param a entrega ao usuário anterior.
- [ ] Sem o JSON, o APK anterior ainda compila e o push permanece desabilitado.
- [ ] O emissor servidor envia eventos reais sem duplicidades e sem vazamentos entre membros da dupla.

Não declare o push homologado apenas por haver código, commit ou APK: falta a prova de envio e recebimento real.
