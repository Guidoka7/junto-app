# Juntô 1.1.1

Controle financeiro individual ou em dupla, com a interface original preservada. O mesmo app funciona no navegador, como PWA offline e como APK Android.

O layout móvel da versão 1.1.1 usa cards e cabeçalho mais compactos, com o resumo do saldo e a projeção ocupando menos espaço.

A versão 1.1 acrescenta **sugestões a partir de notificações bancárias**, **contas reais com login**, **convites para a dupla** e **sincronização com fila offline**. A configuração de um projeto Supabase próprio do Juntô é necessária para ligar a sincronização. Sem ela, o controle local continua funcionando.

## Rodar no computador

Use Node.js 22 ou mais recente.

```bash
npm ci
npm run dev
```

Abra http://localhost:5173. Edite os arquivos em `src/`. O servidor gera e serve o app compilado; recarregue a página depois das mudanças.

## Movimentos do banco no Android

1. Instale o APK e crie seu controle pessoal, saindo dos números de demonstração.
2. Abra **Ajustes → Movimentos do banco → Configurar**.
3. Escolha os bancos e confirme a autorização.
4. Na tela de acesso às notificações do Android, autorize o Juntô. A permissão do Android permite acesso às notificações; o código do Juntô filtra apenas os aplicativos bancários escolhidos.
5. Opcionalmente, permita os avisos do Juntô para receber lembretes de movimentos pendentes.
6. Ao chegar uma nova notificação reconhecida, abra o aviso ou **Conferir movimentos**. Confira valor, data, descrição, categoria e forma de pagamento antes de confirmar.

Pix e débito podem descontar do saldo. Recebimentos podem somar ao saldo e se relacionar a uma entrada prevista. Se você já atualizou o saldo após o movimento, desmarque o ajuste. Compras no crédito entram como contas a pagar; o saldo só muda quando a conta for paga. Um pagamento pode ser associado a uma conta aberta do mesmo valor para evitar um segundo lançamento.

Notificações repetidas são identificadas; **Já registrei / ignorar** retira uma sugestão sem alterar as finanças. Desativar a captura apaga a lista de pendentes. A leitura começa desligada e não adiciona gastos automaticamente.

Bancos e carteiras configuráveis: Nubank, Inter, Itaú, Itaú Cartões, Banco do Brasil, Caixa, Santander, Bradesco, C6 Bank, PicPay, Mercado Pago, PagBank, Neon, Next, InfinitePay, Wise, BTG Pactual, Banco PAN, Banco BV, Sicoob, Sicredi, Safra e Google Wallet. A tela permite busca, seleção por grupos e mostra os bancos em cartões com suas marcas. A presença na lista não significa que todos os formatos enviados por cada banco foram testados.

A captura depende de notificações novas, com texto e valor reconhecíveis. Avisos ocultos, extratos, saldos e mensagens ambíguas não são importados. Formatos com vários valores, falhas, cancelamentos ou pagamentos agendados são descartados para evitar lançamentos incorretos. O navegador/PWA não lê as notificações de outros aplicativos.

## Ativar login e sincronização entre celulares

Use um **projeto Supabase dedicado ao Juntô**. Nenhum servidor está pré-configurado neste pacote.

1. Crie ou selecione o projeto.
2. No **SQL Editor**, execute todo o arquivo `supabase/setup.sql`. Ele cria as tabelas, regras de acesso e funções do Juntô; pode ser executado novamente sem apagar os dados.
3. Ative o login por e-mail e senha em **Authentication**. Configure o envio dos e-mails de confirmação e recuperação.
4. Nas configurações de URL da autenticação, informe o endereço público do site e permita estes redirecionamentos:
   - `https://SEU-USUARIO.github.io/junto-app/`
   - `junto://auth-callback`
   - `http://localhost:5173/`, apenas para desenvolvimento.
5. Copie a URL do projeto e a chave **publishable** (ou a chave legada **anon**).

Para desenvolvimento local:

```bash
cp .env.example .env
```

Preencha somente as duas variáveis:

```dotenv
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

Para o GitHub, cadastre os mesmos nomes em **Settings → Secrets and variables → Actions → Variables**. As automações do site e do Android incluem essa configuração no build.

Também é possível configurar URL e chave publicável no próprio app, em **Ajustes → Entrar / criar conta → Configurar servidor do Juntô**. Isso permite ativar um APK já instalado sem recompilar.

**Nunca use `service_role`, `sb_secret`, senha do banco ou chave privada no app, no código ou nessas variáveis.** As duas variáveis acima são públicas; a proteção dos dados vem da autenticação e das regras do banco.

### Conectar a dupla

1. Cada pessoa cria sua própria conta e confirma seu e-mail.
2. A primeira entra e escolhe **Criar meu espaço**. Seus registros locais reais são mantidos. Os números de demonstração são substituídos por um controle vazio.
3. Ela gera um convite e compartilha o código diretamente com seu amor.
4. A outra pessoa entra com sua própria conta e usa o código recebido.

O convite vale por 48 horas, pode ser usado uma vez e admite no máximo duas contas por espaço. A segunda pessoa passa a usar as finanças compartilhadas; seus dados locais anteriores ficam preservados em um backup no aparelho. Exportar os dados antes de conectar continua sendo uma boa forma de guardá-los.

Cada conta usa seu próprio perfil. Registros feitos offline ficam salvos no aparelho e são enviados após a reconexão. Alterações em registros diferentes são combinadas. Quando duas pessoas mudam o mesmo campo de formas incompatíveis, o app pede para conferir os valores. Nenhuma sincronização acontece enquanto essa revisão estiver pendente.

Se sair da conta com mudanças não enviadas, a fila permanece no aparelho para a próxima entrada na mesma conta. Apagar os dados do app ou desinstalar antes da sincronização remove essa fila. A foto do casal é reduzida antes de ser salva.

## Publicar o site no GitHub

Crie o repositório `junto-app` e execute na pasta do projeto:

```bash
git init
git add .
git update-index --chmod=+x android/gradlew
git commit -m "Juntô 1.1.1"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/junto-app.git
git push -u origin main
```

Em **Settings → Pages → Source**, escolha **GitHub Actions**. A Action **Publicar site** publica a cada push na `main`. O link fica em **Settings → Pages**.

O PWA guarda os arquivos e fontes para uso offline. Quando houver uma nova versão, o app oferece **Nova versão disponível · atualizar**. As requisições de autenticação e sincronização não entram no cache do site.

## Gerar e instalar o APK

No GitHub, abra **Actions → Gerar APK Android → Run workflow**. Baixe o APK na seção **Artifacts** quando a execução terminar.

Para publicar uma versão na aba **Releases**:

```bash
git tag v1.1.1
git push origin v1.1.1
```

No celular, abra `Junto-1.1.1-teste.apk` e permita instalar aplicativos dessa fonte. O app requer Android 7 ou mais recente.

O APK de teste usa uma chave de desenvolvimento. A Action guarda essa chave no cache para favorecer atualizações entre builds de teste, mas o cache pode ser removido. APKs assinados com chaves diferentes não se atualizam sobre a mesma instalação. Exporte ou sincronize os registros antes de uma eventual reinstalação. Para distribuição permanente, use sua chave de assinatura.

Para compilar no computador, instale Java 21 e o SDK Android, com plataforma 36 e Build Tools 36.0.0 e 35.0.0. Configure `ANDROID_HOME` ou `android/local.properties`:

```bash
npm run android:apk
npm run android:open
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Assinatura e Play Store

Crie e guarde sua chave fora do repositório:

```bash
keytool -genkeypair -v -keystore junto-release.keystore -alias junto \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 junto-release.keystore > keystore.txt
```

No macOS, o comando de conversão é `base64 -i junto-release.keystore -o keystore.txt`.

Cadastre em **Settings → Secrets and variables → Actions → Secrets**:

| Nome | Valor |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Conteúdo de `keystore.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | Senha da keystore |
| `ANDROID_KEY_ALIAS` | `junto` |
| `ANDROID_KEY_PASSWORD` | Senha da chave |

Com esses quatro secrets, a Action também gera APK e AAB assinados. O AAB é o arquivo para enviar à Play Console. Guarde a chave e as senhas para futuras atualizações; configure o Play App Signing conforme o processo da loja. O `versionCode` da Action usa o número da execução e precisa ser maior que a versão anteriormente publicada.

O identificador é `br.com.junto.app`. Antes do primeiro envio, se quiser alterá-lo, ajuste `capacitor.config.json`, `android/app/build.gradle`, `strings.xml` e os packages dos arquivos Java. Depois da publicação, outro identificador representa outro app.

A leitura de notificações deve ser explicada na política de privacidade e nas declarações da loja. Este pacote não foi enviado nem aprovado pela Play Store.

## Dados e privacidade

- Sem login, as finanças ficam no armazenamento local.
- Com login, os registros do espaço são enviados ao projeto Supabase configurado e compartilhados somente com as contas participantes. As tabelas expostas usam RLS; gravações passam por funções que conferem a conta e a revisão.
- O texto original das notificações fica somente na fila privada deste Android. A confirmação salva descrição informada por você, valor, data, categoria, banco e identificador para evitar repetição; o texto original não entra no estado sincronizado.
- O backup automático do Android está desativado nesta versão. Exporte seus dados ou use a sincronização.
- No APK, **Exportar meus dados** abre o seletor de arquivos do Android para você escolher o destino do JSON. No navegador, baixa o arquivo. A exportação só informa sucesso depois da gravação; cancelar o seletor mantém seus dados no app.
- Web e APK mantêm armazenamento local separado; só compartilham registros quando entram no mesmo espaço.
- A integração opcional com Gemini continua na base. Quando ativada com sua chave, envia o contexto financeiro das perguntas à API do Google. Essa chave fica no aparelho e não participa da sincronização.

## Estrutura e comandos

| Caminho | Função |
|---|---|
| `src/js/app.js`, `src/css/app.css` | App e interface originais |
| `src/js/banking.js` | Configuração e confirmação de movimentos |
| `src/js/cloud.js` | Login, convites e sincronização |
| `src/features/` | Integração com a base, merge e utilitários |
| `android/` | Projeto Capacitor e serviço de notificações |
| `supabase/setup.sql` | Configuração do banco dedicado |
| `tests/` | Testes de banco, merge, parser e navegador |
| `.github/workflows/` | Verificação, Pages e APK |
| `VALIDACAO.md` | Resultado das verificações e limites |

| Comando | Função |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Site e cache offline em `dist/` |
| `npm run check` | Verificação de arquivos e sintaxe |
| `npm test` | Banco local e combinação dos registros |
| `npm run test:android-parser` | Leitura de textos bancários em Java |
| `npm run test:browser` | Fluxos do app no Chromium |
| `npm run android:sync` | Build web e cópia para o Android |
| `npm run android:apk` | APK de teste |
| `npm run android:release` | APK e AAB de release |
| `npm run icons` | Ícones e splash a partir de `assets/` |

Para os testes de navegador, rode `npx playwright install chromium` uma vez. `node_modules/`, `dist/`, arquivos de ambiente, builds locais e chaves não devem ser enviados ao GitHub. A pasta `dist/` incluída no pacote é uma prévia gerada; o GitHub a reconstrói.

Se o login informar que o servidor precisa ser ativado, confira a execução de `supabase/setup.sql`. Se o Android não detectar movimentos, confira a permissão de acesso às notificações, a seleção do banco e o texto enviado por ele. Teste com uma nova notificação real; a lista histórica de notificações do sistema não é importada.


### Créditos de terceiros

Os vetores usados para representar as marcas bancárias na tela de seleção foram adaptados de `@edusites/bancos-brasil` (MIT). Consulte `THIRD_PARTY_NOTICES.md`. As marcas e logotipos pertencem aos seus respectivos titulares e são usados apenas para identificação das instituições.
