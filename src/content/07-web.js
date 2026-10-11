CC.tracks.push({
  id: 'web', ord: 7, name: 'HTML & CSS', short: 'Web', glyph: '</>', hue: 330,
  desc: 'Estrutura e visual de páginas: tags, layout com flex e grid, responsivo e acessível.',
  test: [
    { d: 1, q: 'HTML serve para:', o: ['Dar estilo', 'Estruturar o conteúdo da página', 'Guardar dados', 'Programar servidores'], a: 1 },
    { d: 1, q: 'Qual tag cria um link?', o: ['<link>', '<a>', '<href>', '<url>'], a: 1 },
    { d: 2, q: 'No CSS, `.card` seleciona:', o: ['O id card', 'Elementos com a classe card', 'A tag card', 'Nada'], a: 1 },
    { d: 2, q: 'Para alinhar itens em linha e centralizar, o mais comum é:', o: ['float', 'display: flex', 'position: absolute', 'table'], a: 1 },
    { d: 3, q: 'Especificidade: qual vence?', o: ['.btn', '#salvar', 'button', 'Depende da ordem só'], a: 1 },
    { d: 3, q: 'Por que usar <button> em vez de <div onclick>?', o: ['É mais bonito', 'Acessibilidade: foco, teclado e leitor de tela já funcionam', 'É obrigatório no HTML5', 'Carrega mais rápido'], a: 1 }
  ],
  lessons: [
    {
      id: 'web1', title: 'HTML: o esqueleto', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🦴', 'HTML é o esqueleto da página', "Toda página tem partes: título, textos, imagens, botões. O HTML diz **o que** cada coisa é, usando **etiquetas** (tags) que abrem `<p>` e fecham `</p>`."],
        ['code', 'html', `<h1>Meu cachorro</h1>
<p>O nome dele é <strong>Rex</strong>.</p>
<img src="rex.jpg" alt="Rex deitado na grama">
<a href="https://wikipedia.org">Saiba mais</a>`, "`h1` é título grande, `p` é parágrafo, `img` é imagem, `a` é link."],
        ['tip', "O `alt` da imagem descreve a foto para quem não enxerga. Sempre coloque!"]
      ],
      i: [
        ['code', 'html', `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sra. Luck — Agendamento</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header><nav>...</nav></header>
  <main>
    <section>
      <h1>Agende sua avaliação</h1>
      <form>
        <label for="nome">Nome</label>
        <input id="nome" name="nome" required>
        <label for="data">Data</label>
        <input id="data" name="data" type="date">
        <button type="submit">Agendar</button>
      </form>
    </section>
  </main>
  <footer>© 2026</footer>
  <script src="app.js" defer></script>
</body>
</html>`, "Tags **semânticas** (header, main, section, footer) ajudam Google e leitores de tela. `viewport` faz funcionar no celular."]
      ],
      a: [
        ['list', 'HTML que profissional escreve', ['Um único `h1` e hierarquia de títulos sem pular nível', '`label` ligado a cada input; `type` certo (email, tel, number)', 'Botão é `<button>`, navegação é `<a>`', 'Imagens com `width/height`, `loading="lazy"` e `srcset`', 'Meta tags Open Graph para links bonitos no WhatsApp']],
        ['code', 'html', `<dialog id="confirma">
  <form method="dialog">
    <p>Cancelar o contrato 4521?</p>
    <button value="nao">Voltar</button>
    <button value="sim">Cancelar contrato</button>
  </form>
</dialog>
<details><summary>Ver parcelas</summary> ... </details>`, "Elementos nativos (`dialog`, `details`) já vêm acessíveis."]
      ],
      quiz: [
        { lv: '*', q: 'Qual tag é para um parágrafo?', o: ['<p>', '<par>', '<text>', '<h1>'], a: 0, w: 'p = paragraph.' },
        { lv: 'b', q: 'Para que serve o `alt` da imagem?', o: ['Mudar a cor', 'Descrever a imagem', 'Deixar maior', 'Criar link'], a: 1, w: 'Texto alternativo.' },
        { lv: 'i', q: 'Qual meta tag é essencial para celular?', o: ['charset', 'viewport', 'author', 'robots'], a: 1, w: 'Sem ela a página fica minúscula.' },
        { lv: 'a', q: 'Liga um label a um input:', o: ['label name=', 'label for= igual ao id do input', 'label class=', 'Não precisa'], a: 1, w: 'for/id.' }
      ],
      lab: { lang: 'html', task: 'Monte uma página com um título `h1` dizendo "Minha página", um parágrafo `p` qualquer e um botão `button` escrito "Enviar".', start: '<!-- escreva seu HTML -->\n', check: { tests: 'const h=doc.querySelector("h1"); if(!h||!/minha página/i.test(h.textContent)) throw new Error("Falta o h1 com Minha página");\nif(!doc.querySelector("p")) throw new Error("Falta um parágrafo <p>");\nconst b=doc.querySelector("button"); if(!b||!/enviar/i.test(b.textContent)) throw new Error("Falta o botão Enviar");' }, hint: '<h1>Minha página</h1>\n<p>...</p>\n<button>Enviar</button>', sol: '<h1>Minha página</h1>\n<p>Estou aprendendo HTML!</p>\n<button>Enviar</button>' }
    },
    {
      id: 'web2', title: 'CSS: a roupa e o layout', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '👗', 'CSS veste a página', "O HTML é o boneco. O CSS escolhe a roupa: cor, tamanho, onde fica cada coisa."],
        ['code', 'css', `h1 {
  color: purple;
  font-size: 40px;
}
p {
  background: yellow;
}`, "“Todo h1 fica roxo e grande. Todo parágrafo ganha fundo amarelo.”"],
        ['an', '📦', 'Tudo é uma caixa', "Cada coisa na página é uma caixa com **recheio** (padding), **borda** (border) e **espaço de fora** (margin)."]
      ],
      i: [
        ['code', 'css', `* { box-sizing: border-box; }
:root { --cor: #6d28d9; --raio: 12px; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.card {
  padding: 16px;
  border-radius: var(--raio);
  border: 1px solid #ddd;
}
.barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}`, "**Flex** para uma linha/coluna; **Grid** para grades. Variáveis CSS (`--cor`) centralizam o tema."],
        ['code', 'css', `.menu { display: none; }
@media (min-width: 768px) {
  .menu { display: flex; }
}
@media (prefers-color-scheme: dark) {
  :root { --fundo: #111; --texto: #eee; }
}`, "**Mobile first**: estilo base para celular e `@media` para telas maiores."]
      ],
      a: [
        ['t', 'Cascata e especificidade', "Peso: inline > #id > .classe/[atributo]/:pseudo > tag. Empate: vence quem vem depois. `!important` é dívida técnica. `@layer` organiza a cascata (reset, base, componentes, utilitários) e `:where()` zera especificidade."],
        ['code', 'css', `.card { container-type: inline-size; }
@container (min-width: 400px) {
  .card .conteudo { display: grid; grid-template-columns: 120px 1fr; }
}
.titulo { font-size: clamp(1.5rem, 1rem + 2vw, 3rem); }
.botao:has(svg) { padding-inline-start: 8px; }`, "Container queries, `clamp()` fluido e `:has()` (seletor pai)."],
        ['list', 'Animação performática', ['Anime só `transform` e `opacity` (GPU)', 'Respeite `prefers-reduced-motion`', 'Evite animar width/height/top (recalcula layout)']]
      ],
      quiz: [
        { lv: '*', q: 'Qual propriedade muda a cor do texto?', o: ['background', 'color', 'font', 'text'], a: 1, w: 'color.' },
        { lv: 'b', q: 'O espaço dentro da caixa, entre a borda e o conteúdo, é:', o: ['margin', 'padding', 'border', 'gap'], a: 1, w: 'Recheio = padding.' },
        { lv: 'i', q: 'Para uma grade de cards responsiva:', o: ['float: left', 'display: grid com auto-fit/minmax', 'table', 'position: fixed'], a: 1, w: 'Grid.' },
        { lv: 'a', q: 'O que anima com melhor desempenho?', o: ['width', 'top', 'transform', 'margin'], a: 2, w: 'transform/opacity vão para o compositor.' }
      ],
      lab: { lang: 'html', task: 'Crie uma `div` com classe `caixa` e, numa tag `<style>`, deixe `.caixa` com `display: flex` e `gap: 10px`. Coloque 3 `span` dentro.', start: '<style>\n  /* seu CSS */\n</style>\n\n<div class="caixa">\n</div>\n', check: { tests: 'const c=doc.querySelector(".caixa"); if(!c) throw new Error("Falta a div .caixa");\nif(c.querySelectorAll("span").length<3) throw new Error("Coloque 3 span dentro da caixa");\nconst css=[...doc.querySelectorAll("style")].map(s=>s.textContent).join(" ").replace(/\\s+/g," ");\nif(!/\\.caixa\\s*\\{[^}]*display\\s*:\\s*flex/.test(css)) throw new Error(".caixa precisa de display: flex");\nif(!/\\.caixa\\s*\\{[^}]*gap\\s*:\\s*10px/.test(css)) throw new Error(".caixa precisa de gap: 10px");' }, hint: '.caixa { display: flex; gap: 10px; }', sol: '<style>\n  .caixa { display: flex; gap: 10px; }\n</style>\n\n<div class="caixa">\n  <span>A</span><span>B</span><span>C</span>\n</div>' }
    },
    {
      id: 'web3', title: 'Responsivo, acessível e rápido', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '📱', 'Uma página para todas as telas', "A mesma página precisa ficar bonita no celular, no tablet e no computador. Isso se chama **responsivo**: a página se ajeita igual água no copo."],
        ['an', '🦮', 'Uma página para todas as pessoas', "Tem gente que não enxerga, usa só o teclado ou precisa de letra grande. **Acessibilidade** é fazer a página funcionar para todo mundo."]
      ],
      i: [
        ['list', 'Checklist rápido', ['Contraste de texto suficiente (4.5:1)', 'Tudo dá para usar com Tab + Enter', 'Foco visível nos botões', 'Botões de pelo menos 44×44px no celular', 'Imagens otimizadas (WebP/AVIF) e com tamanho certo', 'Fontes com `font-display: swap`']],
        ['tip', "Abra o DevTools (F12) → Lighthouse e rode uma auditoria: ele dá nota e lista o que corrigir."]
      ],
      a: [
        ['t', 'ARIA com moderação', "Primeira regra do ARIA: não use ARIA se existir elemento nativo. Use `aria-live` para anunciar atualizações (toasts), `aria-expanded` em menus, e gerencie foco ao abrir modais (foco preso dentro, volta ao botão ao fechar)."],
        ['t', 'PWA', "Com **manifest** + **service worker**, um site vira instalável, funciona offline e recebe push. É uma alternativa leve ao APK (e base de apps híbridos como este)."]
      ],
      quiz: [
        { lv: '*', q: 'Página responsiva é a que:', o: ['Responde e-mails', 'Se adapta a vários tamanhos de tela', 'Carrega rápido', 'Tem chat'], a: 1, w: 'Se ajusta à tela.' },
        { lv: 'b', q: 'Acessibilidade é:', o: ['Ter senha', 'Fazer funcionar para todas as pessoas', 'Ter muitas cores', 'Usar animações'], a: 1, w: 'Para todo mundo.' },
        { lv: 'i', q: 'Ferramenta do Chrome para auditar a página:', o: ['Lighthouse', 'Photoshop', 'Postman', 'Git'], a: 0, w: 'DevTools → Lighthouse.' },
        { lv: 'a', q: 'Primeira regra do ARIA:', o: ['Use em tudo', 'Prefira elementos HTML nativos', 'Só em imagens', 'Substitui o HTML'], a: 1, w: 'Nativo primeiro.' }
      ]
    }
  ]
});
