/* Complementos — Python, JavaScript, HTML & CSS */
CC.patch({
  py1: {
    rec: ['print mostra resultados na tela', 'f-strings colocam variáveis dentro do texto: f"Oi {nome}"', '// divisão inteira, % resto, ** potência', 'Strings são imutáveis: métodos devolvem uma nova', 'Fatiamento [início:fim] pega pedaços do texto'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Complete para mostrar Oi Ana: print(f"Oi {___}") com nome = "Ana"', ans: ['nome'], w: 'A variável vai entre chaves.' },
      { lv: 'b', t: 'tf', q: '`"oi" * 3` em Python resulta em "oioioi".', a: true, w: '* repete textos.' },
      { lv: 'i', q: '`"Brasília".upper()[:3]` resulta em:', o: ['"Bra"', '"BRA"', '"bra"', 'erro'], a: 1, w: 'Maiúsculas e depois os 3 primeiros.' },
      { lv: 'a', q: 'Para extrair todas as datas dd/mm/aaaa de um texto, use:', o: ['re.findall', 'str.upper', 'len', 'split(" ")'], a: 0, w: 'Expressões regulares.' }
    ]
  },
  py2: {
    rec: ['Lista guarda vários itens em ordem; o índice começa em 0', 'append coloca no fim; len conta', 'for percorre cada item', 'List comprehension transforma e filtra numa linha', 'Para filas use deque; para buscas rápidas, set'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Último item de uma lista l: l[___]', ans: ['-1'], w: 'Índices negativos contam do fim.' },
      { lv: 'b', t: 'order', q: 'Ordene para mostrar cada fruta de uma lista:', items: ['frutas = ["maçã", "uva"]', 'for fruta in frutas:', '    print(fruta)'], w: 'Cria, percorre, mostra.' },
      { lv: 'i', q: '`sorted([3, 1, 2], reverse=True)` resulta em:', o: ['[1, 2, 3]', '[3, 2, 1]', '[3, 1, 2]', 'erro'], a: 1, w: 'Do maior para o menor.' },
      { lv: 'a', t: 'tf', q: '`x in lista` tem custo O(1) em listas Python.', a: false, w: 'É O(n); em set é O(1) em média.' }
    ]
  },
  py3: {
    rec: ['Dicionário liga chave a valor', '.get(chave, padrão) evita erro quando a chave falta', '.items() percorre chave e valor juntos', 'set guarda itens únicos e faz união e interseção', 'Counter e defaultdict resolvem contagens e agrupamentos'],
    quiz: [
      { lv: '*', q: 'Para percorrer chave e valor de um dict d:', o: ['for k, v in d.items()', 'for k in d.values()', 'for d in k', 'd.loop()'], a: 0, w: '.items().' },
      { lv: 'b', t: 'tf', q: 'Num dicionário, você pega o valor pela chave.', a: true, w: 'd["nome"].' },
      { lv: 'i', t: 'fill', q: 'Interseção dos sets a e b: a ___ b', ans: ['&'], w: '& interseção, | união, - diferença.' },
      { lv: 'a', q: 'Desde o Python 3.7, os dicionários:', o: ['Mantêm a ordem de inserção', 'Ordenam por chave', 'São aleatórios', 'Não aceitam texto'], a: 0, w: 'Ordem garantida pela linguagem.' }
    ]
  },
  py4: {
    rec: ['Parâmetros são os ingredientes; return é o prato', 'Valores padrão e argumentos nomeados deixam chamadas claras', '*args e **kwargs recebem argumentos extras', 'Decorators embrulham funções com comportamento extra', 'Nunca use lista como valor padrão: use None'],
    quiz: [
      { lv: '*', q: '`def f(x=2): return x*3` — quanto vale f()?', o: ['2', '3', '6', 'erro'], a: 2, w: 'Usa o padrão 2.' },
      { lv: 'b', t: 'tf', q: 'Uma função pode ser usada muitas vezes depois de criada.', a: true, w: 'Máquina de suco.' },
      { lv: 'i', t: 'fill', q: 'Função anônima curta em Python: ___ x: x * 2', ans: ['lambda'], w: 'lambda.' },
      { lv: 'a', q: 'yield transforma a função em:', o: ['Gerador', 'Classe', 'Decorator', 'Módulo'], a: 0, w: 'Produz valores sob demanda.' }
    ]
  },
  py5: {
    rec: ['try/except trata erros sem quebrar o programa', 'Capture exceções específicas', 'with abre e fecha arquivos sozinho', 'import traz módulos; pip instala bibliotecas', 'Ambiente virtual isola as dependências do projeto'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene os blocos de tratamento de erro:', items: ['try', 'except', 'finally'], w: 'finally sempre roda.' },
      { lv: 'b', t: 'fill', q: 'Para usar o módulo random: ___ random', ans: ['import'], w: 'import random.' },
      { lv: 'i', q: 'Comando que cria um ambiente virtual:', o: ['python -m venv .venv', 'pip freeze', 'python run', 'venv start'], a: 0, w: 'python -m venv.' },
      { lv: 'a', t: 'tf', q: 'logging é preferível a print em aplicações reais.', a: true, w: 'Níveis, formato e destino configuráveis.' }
    ]
  },
  py6: {
    rec: ['Classe é o molde; objeto é o que sai dele', '__init__ prepara o objeto ao ser criado', 'self é o próprio objeto', 'Herança reaproveita; polimorfismo dá respostas diferentes à mesma chamada', 'Prefira composição e dataclasses para dados'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Nome do método chamado automaticamente ao criar o objeto: ___', ans: ['__init__', 'init'], w: '__init__.' },
      { lv: 'b', t: 'tf', q: 'Vários objetos podem sair da mesma classe.', a: true, w: 'Vários biscoitos da mesma forminha.' },
      { lv: 'i', q: '`class Gato(Animal)` indica:', o: ['Gato herda de Animal', 'Animal herda de Gato', 'Erro', 'Duas classes iguais'], a: 0, w: 'Herança.' },
      { lv: 'a', q: 'Qual princípio diz “dependa de abstrações”?', o: ['S', 'O', 'L', 'D'], a: 3, w: 'Dependency Inversion.' }
    ]
  },
  py7: {
    rec: ['requests conversa com APIs; sempre use timeout', 'pandas lê, filtra e agrupa planilhas grandes', 'FastAPI cria APIs com validação e documentação automática', 'asyncio faz muitas requisições ao mesmo tempo', 'Python serve para automação, dados, IA e backend'],
    quiz: [
      { lv: '*', t: 'tf', q: 'pandas consegue ler arquivos do Excel.', a: true, w: 'pd.read_excel.' },
      { lv: 'b', q: 'Para conversar com uma API em Python:', o: ['requests', 'turtle', 'tkinter', 'math'], a: 0, w: 'requests (ou httpx).' },
      { lv: 'i', t: 'fill', q: 'Agrupar por banco e somar valores no pandas: df.___("banco")["valor"].sum()', ans: ['groupby'], w: 'groupby.' },
      { lv: 'a', q: 'Comando para rodar uma API FastAPI em desenvolvimento:', o: ['uvicorn main:app --reload', 'python -m http', 'npm start', 'flask go'], a: 0, w: 'Servidor ASGI uvicorn.' }
    ]
  },
  js1: {
    rec: ['console.log mostra mensagens', 'const por padrão, let quando reatribuir, nunca var', 'Compare com === (sem conversão de tipo)', 'Template string: `Total: ${x}`', 'Intl formata moeda e data no padrão brasileiro'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Declaração para um valor que não será reatribuído: ___', ans: ['const'], w: 'const.' },
      { lv: 'b', t: 'tf', q: 'No JavaScript, os blocos do if ficam entre chaves { }.', a: true, w: 'Chaves delimitam blocos.' },
      { lv: 'i', q: '`"5" === 5` resulta em:', o: ['true', 'false', 'erro', 'undefined'], a: 1, w: 'Tipos diferentes.' },
      { lv: 'a', q: 'Para ordenar números corretamente:', o: ['arr.sort()', 'arr.sort((a, b) => a - b)', 'arr.reverse()', 'arr.order()'], a: 1, w: 'sort padrão compara como texto.' }
    ]
  },
  js2: {
    rec: ['Objetos guardam pares chave: valor', 'map transforma, filter filtra, reduce acumula, find acha um', 'Arrow functions: (x) => x * 2', 'Desestruturação e spread copiam e combinam dados', '?. e ?? evitam erros com valores ausentes'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene para obter a soma dos pedidos pagos:', items: ['filter (só pagos)', 'map (pegar o valor)', 'reduce (somar)'], w: 'Filtra, transforma, acumula.' },
      { lv: 'b', t: 'tf', q: 'map cria uma nova lista transformando cada item.', a: true, w: '[1,2].map(x => x*2) = [2,4].' },
      { lv: 'i', t: 'fill', q: 'Método que retorna o primeiro item que satisfaz a condição: ___', ans: ['find'], w: 'find.' },
      { lv: 'a', q: 'Cópia profunda nativa de um objeto:', o: ['structuredClone(obj)', '{...obj}', 'Object.assign', 'obj.copy()'], a: 0, w: 'Spread é cópia rasa.' }
    ]
  },
  js3: {
    rec: ['Promise é a senha da lanchonete: o valor chega depois', 'async/await deixa código assíncrono legível', 'fetch não lança erro em 404: confira r.ok', 'Promise.all dispara tarefas independentes juntas', 'Microtasks (promises) rodam antes de setTimeout'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Palavra que espera uma Promise dentro de função async: ___', ans: ['await'], w: 'await.' },
      { lv: 'b', t: 'tf', q: 'setTimeout executa uma função depois de um tempo.', a: true, w: 'Em milissegundos.' },
      { lv: 'i', q: 'Tratar erro de uma função async:', o: ['try/catch em volta do await', 'if (erro)', 'Ignorar', 'console.clear()'], a: 0, w: 'try/catch.' },
      { lv: 'a', q: 'Para obter todos os resultados, mesmo se algumas promises falharem:', o: ['Promise.allSettled', 'Promise.all', 'Promise.race', 'await sozinho'], a: 0, w: 'Retorna status de cada uma.' }
    ]
  },
  js4: {
    rec: ['DOM é a árvore da página que o JS manipula', 'addEventListener reage a cliques e formulários', 'Use textContent com dados do usuário', 'Frameworks desenham a tela a partir do estado', 'TypeScript acusa erros de tipo antes de rodar'],
    quiz: [
      { lv: '*', q: 'Selecionar o elemento com id "botao":', o: ['document.querySelector("#botao")', 'select(botao)', 'getId botao', 'document.botao'], a: 0, w: '# = id.' },
      { lv: 'b', t: 'tf', q: 'O JavaScript pode trocar o texto de um título da página.', a: true, w: 'Manipulando o DOM.' },
      { lv: 'i', t: 'fill', q: 'Em formulário, para impedir o recarregamento da página: e.___()', ans: ['preventdefault'], w: 'preventDefault.' },
      { lv: 'a', q: 'Em TypeScript, `type Status = "pago" | "aberto"` é:', o: ['União de literais', 'Classe', 'Enum em runtime', 'Interface'], a: 0, w: 'Só aceita esses valores.' }
    ]
  },
  web1: {
    rec: ['HTML diz o que cada parte é: título, parágrafo, link', 'Tags abrem e fecham: <p>...</p>', 'alt descreve imagens para quem não enxerga', 'Tags semânticas: header, main, section, footer', 'label ligado a cada input'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Tag de link: <___ href="...">', ans: ['a'], w: '<a>.' },
      { lv: 'b', t: 'tf', q: 'h1 é usado para o título principal da página.', a: true, w: 'Um h1 por página.' },
      { lv: 'i', t: 'order', q: 'Ordene a estrutura básica do documento:', items: ['<!doctype html>', '<html>', '<head>', '<body>'], w: 'Doctype, raiz, cabeçalho, corpo.' },
      { lv: 'a', q: 'Para navegação use <a>; para ações use:', o: ['<button>', '<div onclick>', '<span>', '<p>'], a: 0, w: 'Botão nativo é acessível.' }
    ]
  },
  web2: {
    rec: ['CSS define cores, tamanhos e posições', 'Toda caixa tem conteúdo, padding, borda e margin', 'Flex para linhas; Grid para grades', 'Mobile first com @media para telas maiores', 'Anime só transform e opacity'],
    quiz: [
      { lv: '*', q: 'Seletor de classe no CSS:', o: ['#nome', '.nome', 'nome()', '@nome'], a: 1, w: '. para classe, # para id.' },
      { lv: 'b', t: 'tf', q: 'margin é o espaço de fora da caixa.', a: true, w: 'padding é o de dentro.' },
      { lv: 'i', t: 'fill', q: 'Para centralizar itens na horizontal num flex: justify-content: ___', ans: ['center'], w: 'center.' },
      { lv: 'a', q: 'Qual seletor tem mais especificidade?', o: ['p', '.texto', '#principal', '*'], a: 2, w: 'id > classe > tag.' }
    ]
  },
  web3: {
    rec: ['Responsivo: a página se adapta a qualquer tela', 'Acessibilidade: funciona para todas as pessoas', 'Contraste, foco visível e uso por teclado', 'Lighthouse audita desempenho e acessibilidade', 'PWA instala o site como app'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Uma página acessível pode ser usada só com o teclado.', a: true, w: 'Tab, Enter e foco visível.' },
      { lv: 'b', q: 'Página responsiva é a que:', o: ['Se adapta ao tamanho da tela', 'Responde e-mail', 'Tem som', 'Não tem imagens'], a: 0, w: 'Celular, tablet e computador.' },
      { lv: 'i', t: 'fill', q: 'Contraste mínimo recomendado para texto normal: ___:1', ans: ['4.5', '4,5'], w: 'WCAG AA.' },
      { lv: 'a', q: 'Para o site funcionar offline como app, use:', o: ['Service worker + manifest (PWA)', 'Mais imagens', 'iframe', 'Flash'], a: 0, w: 'PWA.' }
    ]
  }
}, {
  py: [
    { t: 'fill', q: 'Função que retorna o tamanho de uma lista: ___(lista)', ans: ['len'], w: 'len.' },
    { q: '`[x for x in range(5) if x > 2]` resulta em:', o: ['[3, 4]', '[2, 3, 4]', '[0, 1, 2]', '[3, 4, 5]'], a: 0, w: 'range(5) vai até 4.' },
    { t: 'tf', q: 'Em Python, a indentação define os blocos de código.', a: true, w: 'Quatro espaços por nível.' },
    { t: 'order', q: 'Ordene para ler um CSV com segurança:', items: ['with open("arq.csv", encoding="utf-8") as f:', '    leitor = csv.DictReader(f)', '    for linha in leitor:', '        print(linha["nome"])'], w: 'Abrir, criar leitor, percorrer.' },
    { q: 'Qual exceção ocorre ao acessar chave inexistente em dict?', o: ['KeyError', 'IndexError', 'ValueError', 'TypeError'], a: 0, w: 'Use .get para evitar.' },
    { q: 'O que `@dataclass` faz?', o: ['Gera __init__, __repr__ e __eq__ automaticamente', 'Conecta ao banco', 'Cria API', 'Acelera loops'], a: 0, w: 'Menos código repetitivo.' }
  ],
  js: [
    { t: 'fill', q: 'Converter texto JSON em objeto: JSON.___(texto)', ans: ['parse'], w: 'JSON.parse.' },
    { q: '`[1, 2, 3].reduce((s, x) => s + x, 0)` resulta em:', o: ['6', '123', '0', '[1,2,3]'], a: 0, w: 'Soma.' },
    { t: 'tf', q: '`fetch` rejeita a promise quando o servidor responde 404.', a: false, w: 'Só em falha de rede; confira r.ok.' },
    { t: 'order', q: 'Ordene o tratamento de um formulário em JS:', items: ['Ouvir o evento submit', 'Chamar e.preventDefault()', 'Ler os dados com FormData', 'Enviar com fetch'], w: 'Captura, impede recarregar, lê, envia.' },
    { q: 'Qual declaração tem escopo de bloco?', o: ['let', 'var', 'function', 'global'], a: 0, w: 'let e const.' }
  ],
  web: [
    { t: 'fill', q: 'Meta tag essencial para celular: <meta name="___" ...>', ans: ['viewport'], w: 'viewport.' },
    { q: 'Para uma grade responsiva de cards:', o: ['display: grid com auto-fit/minmax', 'float', 'table', 'position absolute'], a: 0, w: 'Grid.' },
    { t: 'tf', q: 'Toda imagem informativa deve ter texto alternativo (alt).', a: true, w: 'Acessibilidade.' },
    { t: 'order', q: 'Ordene do mais ao menos específico:', items: ['#id', '.classe', 'tag'], w: 'Especificidade.' },
    { q: 'Ferramenta do Chrome para auditar a página:', o: ['Lighthouse', 'Paint', 'Excel', 'Git'], a: 0, w: 'DevTools.' }
  ]
});
