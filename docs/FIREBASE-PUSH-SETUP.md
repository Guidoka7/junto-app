# Juntô — Notificações push (Firebase)

## Como funciona

1. No APK, a pessoa ativa **Ajustes → Notificações do Juntô**. O app pede a permissão do Android, recebe o token do Firebase (projeto `junto-apk`) e o salva em `junto_push_devices`, ligado à conta logada (RLS: cada conta só vê os próprios tokens).
2. Quando alguém cria um aviso para a outra pessoa da dupla (pedido de gasto, resposta, conta registrada…) e o app sincroniza, ele chama a Edge Function `junto-push` passando **só os ids** dos avisos novos.
3. A função confere a conta, lê o aviso **no espaço salvo no servidor**, confirma que ele é para a outra pessoa do mesmo espaço, registra em `junto_push_log` (um envio por aviso) e manda pelo FCM HTTP v1. Tokens inválidos são apagados.
4. Na tela bloqueada o aviso aparece como privado. Tocar abre os avisos do Juntô.

A Virada nunca gera avisos para a dupla.

## O que já está no repositório

- `android/app/google-services.json` do projeto Firebase `junto-apk`, pacote `br.com.junto.app`. Ele identifica o projeto e não é credencial. Se o secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` existir no GitHub, ele tem prioridade.
- O workflow **Gerar APK Android** liga o push automaticamente quando há configuração do Firebase.
- `supabase/push-devices.sql`: tabelas `junto_push_devices` e `junto_push_log`.
- `supabase/functions/junto-push/index.ts`: o emissor.

## Passos no Supabase do Juntô (projeto `sbquedasoydfsvbarvos`)

1. **SQL Editor** → cole e execute todo o `supabase/push-devices.sql` (pode repetir sem apagar nada).
2. **Firebase Console → projeto junto-apk → ⚙️ Configurações do projeto → Contas de serviço → Gerar nova chave privada**. Baixa um JSON. Ele é secreto: não envie para o GitHub nem para o app.
3. **Supabase → Edge Functions → Secrets** → crie `FIREBASE_SERVICE_ACCOUNT` e cole o conteúdo inteiro desse JSON.
4. **Edge Functions → Deploy a new function → Via editor**, nome `junto-push`, cole o `supabase/functions/junto-push/index.ts` e publique (mantenha "Verify JWT" ligado).
   Pelo terminal: `npx supabase functions deploy junto-push --project-ref sbquedasoydfsvbarvos`.

## Teste

- Instale o APK novo nos dois celulares, entre em cada conta e ative as notificações em Ajustes.
- Firebase Console → Messaging → "Enviar mensagem de teste" para o token (opcional) confirma o recebimento.
- Em um celular, faça um pedido "Amor, posso gastar?". O outro deve receber o push em segundos, com o app aberto, em segundo plano ou fechado.
- Sair da conta remove o token: o celular para de receber.
