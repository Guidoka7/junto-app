# CineCode

Escola de computação e programação cinematográfica para Android, do zero ao avançado: **32 trilhas, 123 aulas**, de "o que é um computador" até agentes de IA. Cada aula existe em 3 níveis (Básico explicado como para uma criança de 5 anos, Intermediário e Avançado) e segue o roteiro:

1. **Videoaula** com cenas animadas, narração, trilha sonora e pergunta interativa no meio
2. **Teoria** em cenas (analogias, passo a passo, tabelas, código animado e código que roda)
3. **Tarefa prática** corrigida automaticamente (SQL, Python, JavaScript, HTML ou planilha), com dicas que aparecem aos poucos
4. **Vídeo de recapitulação**
5. **Teste** com 4 tipos de questão (múltipla escolha, verdadeiro/falso, completar, ordenar)
6. **Nota de 0 a 10** — abaixo de 7 a aula vai para a lista de Reforço

Cada trilha tem vídeo de recapitulação do capítulo, **prova final** (15 questões, aprova com 7) e **certificado**. A **revisão inteligente** traz de volta as perguntas na hora certa de não esquecer (repetição espaçada).

## Trilhas

| Grupo | Trilhas |
|---|---|
| Informática do zero | Informática, Windows e arquivos, Hardware, Internet e redes |
| Office e produtividade | Word, Excel (do básico ao PROCX), Excel Pro e Power BI (tabela dinâmica, Power Query, DAX, VBA), PowerPoint, Google Workspace |
| Primeiros passos | Fundamentos, Como o computador pensa, Terminal, Git e GitHub |
| Linguagens | Python, Panorama das linguagens, JavaScript, HTML e CSS, Front-end moderno (TypeScript, React) |
| Dados | Bancos de dados, SQL, NoSQL, Análise de dados |
| Backend e infraestrutura | APIs, Hospedagem e deploy, DevOps e nuvem, Segurança |
| IA e automação | IA e LLMs, Agentes de IA, Automação |
| Mais fundo | Algoritmos, Apps mobile, Carreira |

## Como gerar o APK (sem instalar nada no computador)

O GitHub monta o APK sozinho na nuvem a cada envio.

1. Entre em github.com e crie um repositório novo, por exemplo `cinecode` (pode ser privado).
2. No repositório vazio, clique em **uploading an existing file** e arraste **todo o conteúdo** desta pasta (as pastas `src`, `android`, `.github`, `tools` e os arquivos soltos). Clique em **Commit changes**.
   - A pasta `.github` começa com ponto e alguns sistemas a escondem. Se ela não subir, crie o arquivo pelo site: **Add file → Create new file**, nome `.github/workflows/gerar-apk.yml`, e cole o conteúdo do arquivo de mesmo nome.
3. Abra a aba **Actions**. O fluxo **Gerar APK** começa sozinho e leva uns 5 a 10 minutos.
4. Quando ficar verde, abra a página **Releases** do repositório e baixe **CineCode.apk** pelo celular.
5. No Android, abra o arquivo baixado. Se pedir, permita "instalar apps desconhecidos". Pronto.

Para gerar de novo depois de mudar algo, é só enviar a alteração: um novo APK aparece em Releases.

## Narração com voz de IA

As videoaulas já vêm **narradas por voz neural** (Kokoro, voz feminina pt-BR "Dora"): cerca de 2.300 falas, ~4,6 h de áudio, em `audio/pack/` (um pacote por trilha). O app toca esses áudios; se faltar algum, usa a voz do aparelho e, por último, só legendas.

**Quando você muda ou cria aulas**, o GitHub gera sozinho só as falas novas ao montar o APK:
- sem configurar nada, com a mesma voz gratuita (Kokoro);
- ou, se cadastrar uma chave em **Settings → Secrets and variables → Actions**, com o provedor pago: `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`, `OPENAI_API_KEY`, ou `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`.

**No computador** (precisa de Python, Node e ffmpeg):

```bash
pip install kokoro-onnx soundfile
python tools/narrar_kokoro.py          # gera as falas que faltam (voz grátis)
VOZ=pm_alex python tools/narrar_kokoro.py   # outras vozes: pm_alex, pm_santa
node tools/narrar.mjs --estimar        # custo com Azure/OpenAI/ElevenLabs
node tools/narrar.mjs --tudo           # refaz o curso inteiro com o provedor pago
node tools/empacotar-audio.mjs         # junta tudo em audio/pack (vai para o app)
```

Para trocar a voz do curso inteiro com a Kokoro, apague `audio/pack` e rode os dois comandos de novo. Se o APK ficar grande demais, hospede `audio/pack` em um CDN e monte com `AUDIO_URL=https://seu-cdn/audio/ node build.mjs`.

## Vídeos reais e instrutor

- **Vídeos de fundo reais** (Pixabay ou Pexels, uso comercial liberado): cadastre o segredo `PIXABAY_API_KEY` (grátis: crie a conta em pixabay.com e a chave aparece em pixabay.com/api/docs) ou `PEXELS_API_KEY`. O GitHub baixa 2 vídeos por aula conforme as buscas de `src/midia.json`, recorta em 4:5, comprime (WebM) e salva em `media/broll/`. Para trocar um vídeo, mude a busca em `src/midia.json`, apague o arquivo em `media/broll/` e rode o fluxo de novo.
- **Instrutor realista** (avatar HeyGen com voz humana): cadastre `HEYGEN_API_KEY` e `HEYGEN_AVATAR_ID` (opcional `HEYGEN_VOICE_ID`). O GitHub gera uma abertura de ~10 s por aula em `media/instrutor/`. Estimativa: `node tools/gerar-instrutor.mjs --estimar`.
- Tudo é gerado uma vez e salvo de volta no repositório; as próximas execuções só fazem o que falta.

## Conta e progresso na nuvem (Supabase)

Projeto Supabase **cinecode** (região São Paulo). Na aba **Perfil** o aluno cria conta com e-mail e senha; o progresso é salvo no aparelho e copiado para a nuvem. Ao entrar em outro aparelho, o app junta os dois progressos e fica com a melhor nota de cada aula.

- Tabelas: `profiles` (nome e plano: `free`/`pro`, preparado para o pagamento) e `progress` (estado completo do aluno, XP e aulas feitas).
- Segurança: RLS ativo; cada aluno só lê e grava os próprios dados e não consegue mudar o próprio plano.
- A URL e a chave publicável ficam em `build.mjs` (podem ser trocadas com `SUPABASE_URL` e `SUPABASE_KEY`).

**Ajuste obrigatório no painel do Supabase** (Authentication → Sign In / Providers → Email): desligue **Confirm email**, ou configure um SMTP próprio em Authentication → Emails. Sem isso, o Supabase só envia e-mail de confirmação para membros da sua equipe e o cadastro dos alunos falha.

## Site na Vercel

O repositório já tem `vercel.json` (instala, roda `node build.mjs` e publica a pasta `www`). Na Vercel: **Add New → Project → Import** o repositório `cinecode` → **Deploy**. Cada envio para o GitHub publica de novo.

## Gerar no seu computador (opcional)

Precisa de Node 22, JDK 21 e Android SDK (o Android Studio instala o SDK).

```bash
npm install
npm run apk
# APK em android/app/build/outputs/apk/debug/app-debug.apk
```

Para testar só a versão web: `npm run build` e abra `dist/web/cinecode.html` no navegador.

## Estrutura

| Pasta/arquivo | O que é |
|---|---|
| `src/content/` | Conteúdo das trilhas (um arquivo por trilha) e os complementos `p-*.js` (recapitulações, questões e provas extras). |
| `src/app.js` | Motor do app: telas, aula, teste de nível, plano, laboratório, executores de código. |
| `src/videogen.js` | Transforma cada aula em roteiro de vídeo (cenas + falas). Também roda no Node. |
| `src/video.js` | Player cinematográfico: animação, narração, trilha sonora, legendas, perguntas no vídeo. |
| `src/assess.js` | Questões, nota da aula, revisão inteligente, prova final e certificado. |
| `src/sheet.js` | Planilha com fórmulas em português (SOMA, SE, PROCV, PROCX, SOMASES...). |
| `src/styles.css` | Visual. |
| `src/vendor/` | SQLite (sql.js) e Python (Skulpt) que rodam offline. |
| `tools/narrar_kokoro.py` | Gera a narração com a voz neural gratuita. |
| `tools/narrar.mjs` | Gera a narração com Azure, OpenAI ou ElevenLabs. |
| `tools/empacotar-audio.mjs` | Junta os áudios em um pacote por trilha. |
| `audio/pack/` | Narração pronta que vai dentro do app. |
| `tools/icons.py` | Gera ícones e splash. |
| `build.mjs` | Monta `www/` (versão do APK) e `dist/web/cinecode.html` (versão web). |
| `android/` | Projeto Android (Capacitor 7) com ícone, cores, botão voltar e voz nativa. |
| `.github/workflows/gerar-apk.yml` | Robô que gera a narração (se houver chave) e compila o APK no GitHub. |

## Como adicionar uma aula

Abra o arquivo da trilha em `src/content/` e acrescente um objeto em `lessons` com `id`, `title`, `min`, as cenas de cada nível (`b`, `i`, `a`), `rec` (pontos da recapitulação), `quiz` e, se quiser, `lab`.

- Cenas: `t` (texto), `an` (analogia com emoji), `list`, `tip`, `flow` (passo a passo), `tbl` (tabela), `sheet` (planilha), `code` (código animado) e `run` (código editável que roda).
- Questões: `{ lv: '*'|'b'|'i'|'a', q, o, a, w }` para múltipla escolha; `t: 'tf'` com `a: true/false`; `t: 'fill'` com `ans: [...]`; `t: 'order'` com `items` na ordem certa. `w` é a explicação mostrada depois.
- Tarefa de planilha: `lab: { lang: 'xls', task, grid, targets, sol, hint }`.

## Próxima fase (SaaS)

Planejado para depois do conteúdo: login, progresso salvo na nuvem e assinatura via Mercado Pago.

## Observações

- O progresso fica salvo no próprio aparelho.
- O Python do app cobre a linguagem essencial; bibliotecas como pandas e requests aparecem nas aulas como exemplos para rodar no computador.
- O APK gerado é de teste (assinado com chave de depuração), ideal para uso pessoal e para distribuir direto. Para publicar na Play Store é preciso gerar um AAB assinado (explicado na trilha Apps Mobile).
