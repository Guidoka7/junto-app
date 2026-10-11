CC.tracks.push({
  id: 'js', ord: 6, name: 'JavaScript', short: 'JavaScript', glyph: 'JS', hue: 50,
  desc: 'A linguagem dos navegadores e de muito backend (Node). Funções, objetos, assincronia e o DOM.',
  test: [
    { d: 1, q: 'Onde o JavaScript roda originalmente?', o: ['No navegador', 'Só no Excel', 'Na impressora', 'No roteador'], a: 0 },
    { d: 1, q: 'Como mostrar algo no console?', o: ['print()', 'console.log()', 'echo', 'say()'], a: 1 },
    { d: 2, q: 'Diferença entre `let` e `const`:', o: ['Nenhuma', 'const não pode ser reatribuída', 'let é global', 'const é mais lento'], a: 1 },
    { d: 2, q: '`[1,2,3].map(x => x * 2)` retorna:', o: ['[1,2,3]', '[2,4,6]', '6', 'undefined'], a: 1 },
    { d: 3, q: 'O que `await` faz?', o: ['Para o navegador inteiro', 'Pausa a função async até a Promise resolver', 'Cria uma thread', 'Repete o código'], a: 1 },
    { d: 3, q: '`0.1 + 0.2 === 0.3` em JS é:', o: ['true', 'false', 'erro', 'undefined'], a: 1 }
  ],
  lessons: [
    {
      id: 'js1', title: 'Primeiros passos em JS', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🎬', 'JavaScript dá vida às páginas', "Quando você aperta um botão e aparece uma mensagem, ou um jogo roda no navegador, quase sempre é JavaScript trabalhando."],
        ['run', 'js', `console.log("Olá do JavaScript!");
let pontos = 10;
pontos = pontos + 5;
console.log("Pontos:", pontos);`, "`console.log` é o print do JavaScript. O `;` no fim é como um ponto final."],
        ['run', 'js', `const nome = "Lia";
let idade = 6;
if (idade < 10) {
  console.log(nome + " é criança");
} else {
  console.log(nome + " já cresceu");
}`, "As chaves `{ }` mostram o que está dentro do if."]
      ],
      i: [
        ['run', 'js', `const preco = 19.9;
let qtd = 3;
const total = preco * qtd;
console.log(\`Total: R$ \${total.toFixed(2)}\`);
console.log(typeof total, typeof "a", typeof null, typeof undefined);
console.log("5" + 1, "5" - 1, "5" == 5, "5" === 5);`, "Use `const` por padrão, `let` quando reatribuir, nunca `var`. Compare sempre com `===`."],
        ['run', 'js', `for (let i = 1; i <= 3; i++) console.log("volta", i);
const frutas = ["maçã", "uva"];
for (const f of frutas) console.log(f);
const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
console.log(fmt.format(1234.5));`, "`Intl` formata moeda e data no padrão brasileiro."]
      ],
      a: [
        ['run', 'js', `console.log([] + [], [] + {}, [10, 9, 1].sort());
console.log(0.1 + 0.2, Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(Number.MAX_SAFE_INTEGER, 2n ** 64n);`, "`sort()` sem comparador ordena como texto! Use `(a, b) => a - b`. BigInt para inteiros grandes."],
        ['t', 'Escopo, hoisting e this', "`var` tem escopo de função e sofre hoisting; `let/const` têm escopo de bloco e “zona morta” antes da declaração. `this` depende de **como** a função é chamada; arrow functions herdam o `this` léxico."]
      ],
      quiz: [
        { lv: '*', q: 'Qual comando mostra mensagens no console do JS?', o: ['print', 'console.log', 'echo', 'printf'], a: 1, w: 'console.log.' },
        { lv: 'b', q: 'Para guardar um valor que muda, usamos:', o: ['let', 'const', 'stop', 'fix'], a: 0, w: 'let pode mudar.' },
        { lv: 'i', q: '`"5" + 1` resulta em:', o: ['6', '"51"', 'erro', 'NaN'], a: 1, w: 'Com texto, + concatena.' },
        { lv: 'a', q: '`[10, 9, 1].sort()` retorna:', o: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', 'erro'], a: 1, w: 'Ordena como string: "1" < "10" < "9".' }
      ],
      lab: { lang: 'js', task: 'Escreva a função `maior(a, b)` que retorna o maior dos dois números.', start: 'function maior(a, b) {\n  // seu código\n}\n', check: { tests: 'if (maior(3, 7) !== 7) throw new Error("maior(3,7) deveria ser 7");\nif (maior(10, 2) !== 10) throw new Error("maior(10,2) deveria ser 10");\nif (maior(-1, -5) !== -1) throw new Error("negativos");' }, hint: 'return a > b ? a : b;', sol: 'function maior(a, b) {\n  return a > b ? a : b;\n}' }
    },
    {
      id: 'js2', title: 'Arrays, objetos e funções', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '🧸', 'Objeto é uma ficha', "Uma ficha de brinquedo: nome, cor, tamanho. Em JS, um **objeto** guarda essas informações juntinhas."],
        ['run', 'js', `const brinquedo = { nome: "Robô", cor: "azul", pilhas: 2 };
console.log(brinquedo.nome);
brinquedo.cor = "vermelho";
console.log(brinquedo);`],
        ['run', 'js', `const dobro = (n) => n * 2;
console.log(dobro(4));
console.log([1, 2, 3].map(dobro));`, "A flechinha `=>` é um jeito curto de criar função."]
      ],
      i: [
        ['run', 'js', `const pedidos = [
  { cliente: "Ana", valor: 300, status: "pago" },
  { cliente: "Bia", valor: 120, status: "aberto" },
  { cliente: "Caio", valor: 980, status: "pago" },
];
const pagos = pedidos.filter(p => p.status === "pago");
const total = pagos.reduce((soma, p) => soma + p.valor, 0);
const nomes = pagos.map(p => p.cliente);
console.log(total, nomes);
console.log(pedidos.find(p => p.valor > 500));`, "filter, map, reduce e find são o pão com manteiga do JS."],
        ['run', 'js', `const { cliente, valor = 0 } = { cliente: "Ana" };
const base = { tema: "escuro", idioma: "pt" };
const config = { ...base, idioma: "en" };
const [primeiro, ...resto] = [10, 20, 30];
console.log(cliente, valor, config, primeiro, resto);`, "Desestruturação e spread."]
      ],
      a: [
        ['run', 'js', `function criaContador() {
  let n = 0;
  return { inc: () => ++n, valor: () => n };
}
const c = criaContador();
c.inc(); c.inc();
console.log(c.valor());

const grupo = Object.groupBy
  ? Object.groupBy([1,2,3,4,5], x => x % 2 ? "impar" : "par")
  : "Object.groupBy indisponível";
console.log(grupo);`, "Closures; `Object.groupBy` é recente (ES2024)."],
        ['run', 'js', `const usuario = { perfil: null };
console.log(usuario.perfil?.foto ?? "avatar-padrao.png");
const congelado = Object.freeze({ a: 1 });
const copiaProfunda = structuredClone({ x: { y: [1, 2] } });
console.log(copiaProfunda);`, "Optional chaining `?.`, nullish coalescing `??`, `structuredClone` para cópia profunda."]
      ],
      quiz: [
        { lv: '*', q: 'Em `const p = {nome: "Ana"}`, como ler o nome?', o: ['p[nome]', 'p.nome', 'p->nome', 'nome.p'], a: 1, w: 'Notação de ponto.' },
        { lv: 'b', q: '`(n) => n * 2` é:', o: ['Uma flecha de desenho', 'Uma função', 'Um objeto', 'Um erro'], a: 1, w: 'Arrow function.' },
        { lv: 'i', q: 'Qual método soma todos os valores de um array?', o: ['map', 'filter', 'reduce', 'find'], a: 2, w: 'reduce acumula.' },
        { lv: 'a', q: '`null ?? "x"` e `0 ?? "x"` retornam:', o: ['"x" e "x"', '"x" e 0', 'null e 0', '0 e "x"'], a: 1, w: '?? só troca null/undefined.' }
      ],
      lab: { lang: 'js', task: 'Crie `totalPago(pedidos)` que soma o `valor` só dos pedidos com `status === "pago"`.', start: 'function totalPago(pedidos) {\n  // use filter e reduce\n}\n', check: { tests: 'const t = totalPago([{valor:100,status:"pago"},{valor:50,status:"aberto"},{valor:25,status:"pago"}]);\nif (t !== 125) throw new Error("esperado 125, veio " + t);\nif (totalPago([]) !== 0) throw new Error("lista vazia deve dar 0");' }, hint: 'pedidos.filter(p => p.status === "pago").reduce((s, p) => s + p.valor, 0)', sol: 'function totalPago(pedidos) {\n  return pedidos\n    .filter(p => p.status === "pago")\n    .reduce((s, p) => s + p.valor, 0);\n}' }
    },
    {
      id: 'js3', title: 'Assíncrono: promises e fetch', min: { b: 15, i: 20, a: 25 },
      b: [
        ['an', '🍔', 'A senha da lanchonete', "Você pede o lanche e recebe uma **senha**. Não precisa ficar parado no balcão: vai sentar, conversar, e quando chamam sua senha, você pega o lanche.\nNo JavaScript, essa senha é uma **Promise** (promessa)."],
        ['run', 'js', `console.log("1. Pedi o lanche");
setTimeout(() => console.log("3. Lanche pronto! 🍔"), 1000);
console.log("2. Fui sentar");`, "Repara a ordem: o 3 aparece por último, porque esperou 1 segundo."]
      ],
      i: [
        ['run', 'js', `const espera = (ms) => new Promise(ok => setTimeout(ok, ms));

async function buscarCliente(id) {
  await espera(300);              // simula a rede
  if (id < 0) throw new Error("id inválido");
  return { id, nome: "Ana" };
}

(async () => {
  try {
    const c = await buscarCliente(7);
    console.log("achei", c);
    await buscarCliente(-1);
  } catch (e) {
    console.log("erro:", e.message);
  }
})();`, "`async/await` deixa código assíncrono com cara de síncrono; erros com `try/catch`."],
        ['code', 'js', `const r = await fetch("https://viacep.com.br/ws/70040010/json/");
if (!r.ok) throw new Error("HTTP " + r.status);
const dados = await r.json();
console.log(dados.logradouro);`, "`fetch` não lança erro em 404/500: confira `r.ok`."]
      ],
      a: [
        ['run', 'js', `const espera = (ms, v) => new Promise(ok => setTimeout(() => ok(v), ms));
(async () => {
  console.time("paralelo");
  const r = await Promise.all([espera(300, "A"), espera(300, "B"), espera(300, "C")]);
  console.timeEnd("paralelo");
  console.log(r);
  const s = await Promise.allSettled([Promise.reject(new Error("x")), espera(10, "ok")]);
  console.log(s.map(x => x.status));
})();`, "Requisições independentes: dispare juntas com `Promise.all` (~300ms, não 900ms)."],
        ['t', 'Event loop', "JS roda em uma thread. Call stack → quando vazia, executa **microtasks** (promises) todas, depois uma **macrotask** (setTimeout, eventos de I/O). Por isso `Promise.resolve().then(...)` roda antes de `setTimeout(..., 0)`. Trabalho pesado de CPU trava a página: use Web Workers."],
        ['code', 'js', `const ctrl = new AbortController();
const t = setTimeout(() => ctrl.abort(), 5000);
try {
  const r = await fetch(url, { signal: ctrl.signal });
} finally { clearTimeout(t); }`, "Timeout de fetch com AbortController."]
      ],
      quiz: [
        { lv: '*', q: 'Uma Promise representa:', o: ['Um valor que vai chegar no futuro', 'Um erro', 'Um loop', 'Uma variável global'], a: 0, w: 'A senha da lanchonete.' },
        { lv: 'b', q: 'setTimeout serve para:', o: ['Rodar algo depois de um tempo', 'Parar o computador', 'Medir internet', 'Criar página'], a: 0, w: 'Agenda uma função.' },
        { lv: 'i', q: '`fetch` para uma URL que dá 404:', o: ['Lança erro', 'Resolve normalmente com r.ok = false', 'Trava', 'Retorna null'], a: 1, w: 'Só rejeita em falha de rede.' },
        { lv: 'a', q: 'O que roda primeiro?', o: ['setTimeout(f, 0)', 'Promise.resolve().then(g)', 'Tanto faz', 'Nenhum'], a: 1, w: 'Microtasks antes de macrotasks.' }
      ],
      lab: { lang: 'js', task: 'Crie `async function somaAsync(a, b)` que espera 100ms (use a função `espera` já pronta) e retorna a + b.', start: 'const espera = (ms) => new Promise(ok => setTimeout(ok, ms));\n\nasync function somaAsync(a, b) {\n  // await espera(100) e retorne a soma\n}\n', check: { tests: 'const r = await somaAsync(2, 3);\nif (r !== 5) throw new Error("esperado 5, veio " + r);' }, hint: 'await espera(100); return a + b;', sol: 'const espera = (ms) => new Promise(ok => setTimeout(ok, ms));\n\nasync function somaAsync(a, b) {\n  await espera(100);\n  return a + b;\n}' }
    },
    {
      id: 'js4', title: 'DOM, eventos e TypeScript', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '🌲', 'A página é uma árvore', "O navegador transforma a página numa árvore de pecinhas: título, parágrafo, botão. Essa árvore se chama **DOM**. O JavaScript pode pegar qualquer pecinha e mudar."],
        ['code', 'js', `const botao = document.querySelector("#botao");
botao.addEventListener("click", () => {
  document.querySelector("h1").textContent = "Você clicou! 🎉";
});`, "“Quando clicar no botão, troca o texto do título.”"]
      ],
      i: [
        ['code', 'js', `const lista = document.querySelector("#clientes");
async function carregar() {
  const r = await fetch("/api/clientes");
  const clientes = await r.json();
  lista.replaceChildren(...clientes.map(c => {
    const li = document.createElement("li");
    li.textContent = \`\${c.nome} — \${c.cidade}\`;   // textContent evita XSS
    return li;
  }));
}
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(new FormData(e.target));
  console.log(dados);
});`, "Ler formulário, buscar dados, renderizar lista. Use `textContent`, não `innerHTML`, com dados do usuário."],
        ['t', 'Frameworks', "Quando a interface cresce, manipular DOM na mão vira bagunça. **React**, **Vue**, **Svelte** e **Angular** renderizam a tela a partir do **estado**: você muda os dados e a tela se atualiza."]
      ],
      a: [
        ['code', 'ts', `type Status = "pago" | "aberto" | "vencido";
interface Parcela { id: number; valor: number; status: Status; vencimento: Date }

function emAberto(ps: Parcela[]): number {
  return ps.filter(p => p.status !== "pago").reduce((s, p) => s + p.valor, 0);
}
// emAberto([{ id: 1, valor: "100" }])  ← erro em tempo de compilação`, "TypeScript adiciona tipos estáticos ao JS: erros aparecem no editor, antes de rodar."],
        ['code', 'tsx', `function Contador() {
  const [n, setN] = useState(0);
  useEffect(() => { document.title = \`Cliques: \${n}\`; }, [n]);
  return <button onClick={() => setN(n + 1)}>Cliquei {n}x</button>;
}`, "React: componente = função que devolve UI a partir de estado. Delegação de eventos e reconciliação ficam com o framework."]
      ],
      quiz: [
        { lv: '*', q: 'DOM é:', o: ['Um banco de dados', 'A árvore de elementos da página que o JS manipula', 'Um servidor', 'Um tipo de CSS'], a: 1, w: 'Document Object Model.' },
        { lv: 'b', q: '`addEventListener("click", ...)` faz:', o: ['Cria botão', 'Executa algo quando clicam', 'Apaga a página', 'Muda a cor'], a: 1, w: 'Ouve o clique.' },
        { lv: 'i', q: 'Para exibir texto vindo do usuário com segurança:', o: ['innerHTML', 'textContent', 'eval', 'document.write'], a: 1, w: 'textContent não interpreta HTML.' },
        { lv: 'a', q: 'TypeScript verifica tipos:', o: ['Em tempo de execução no navegador', 'Em tempo de compilação/edição', 'Só no servidor', 'Nunca'], a: 1, w: 'Os tipos somem no JS gerado.' }
      ]
    }
  ]
});
