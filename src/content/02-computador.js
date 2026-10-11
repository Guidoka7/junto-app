CC.tracks.push({
  id: 'comp', ord: 2, name: 'Computador & Internet', short: 'Internet', glyph: '01', hue: 200,
  desc: 'Como a máquina pensa em zeros e uns, o que é sistema operacional e como a internet entrega uma página.',
  test: [
    { d: 1, q: 'O que guarda os arquivos mesmo com o computador desligado?', o: ['Memória RAM', 'Disco (HD/SSD)', 'Processador', 'Monitor'], a: 1 },
    { d: 1, q: 'O que é um navegador?', o: ['Um programa que abre sites', 'Um cabo de rede', 'Um banco de dados', 'Uma linguagem'], a: 0 },
    { d: 2, q: 'O DNS serve para:', o: ['Criptografar senhas', 'Traduzir nomes (google.com) em endereços IP', 'Guardar cookies', 'Acelerar o Wi‑Fi'], a: 1 },
    { d: 2, q: 'Em binário, 101 vale quanto em decimal?', o: ['3', '5', '101', '7'], a: 1 },
    { d: 3, q: 'Qual a principal diferença entre TCP e UDP?', o: ['UDP é criptografado', 'TCP garante entrega e ordem; UDP não', 'TCP só funciona em LAN', 'Não há diferença'], a: 1 },
    { d: 3, q: 'No HTTPS, o que o certificado TLS comprova?', o: ['Que o site é rápido', 'Que o servidor é dono daquele domínio e permite criptografar a conexão', 'Que o site não tem bugs', 'Que o usuário está logado'], a: 1 }
  ],
  lessons: [
    {
      id: 'comp1', title: 'Por dentro do computador', min: { b: 12, i: 15, a: 18 },
      b: [
        ['an', '🧠', 'O computador tem cérebro, mesa e armário', "**Processador (CPU)** é o cérebro: faz as contas.\n**Memória RAM** é a mesa: onde ficam as coisas que você está usando agora. Rápida, mas apaga quando desliga.\n**Disco (SSD/HD)** é o armário: guarda tudo para sempre, mas é mais devagar de abrir."],
        ['an', '💡', 'Tudo é liga e desliga', "Lá dentro só existem luzinhas ligadas (1) e desligadas (0). Juntando muitos 0 e 1 dá para escrever números, letras, fotos e músicas!\nCada 0 ou 1 é um **bit**. 8 bits fazem um **byte**."],
        ['an', '👮', 'O sistema operacional é o síndico', "Windows, Android, Linux e macOS são **sistemas operacionais**. Eles organizam o prédio: dizem qual programa usa a tela, a memória, a internet."],
        ['tip', "Quando o celular fica lento com muitos apps abertos, é a mesa (RAM) que ficou cheia!"]
      ],
      i: [
        ['tbl', 'Binário na prática', ['Binário', 'Decimal', 'Como ler'], [['0001', '1', '1'], ['0010', '2', '2'], ['0101', '5', '4+1'], ['1010', '10', '8+2'], ['1111', '15', '8+4+2+1']]],
        ['t', 'Texto vira número', "Cada caractere tem um código. ASCII cobre 128 (A=65). **UTF‑8** cobre todos os idiomas e emojis usando 1 a 4 bytes. Erros tipo “Ã§” aparecem quando um texto UTF‑8 é lido como outra codificação."],
        ['t', 'Processos e threads', "Cada programa aberto é um **processo**, com memória própria. Dentro dele, **threads** executam tarefas em paralelo dividindo a mesma memória. O SO alterna entre eles milhares de vezes por segundo (escalonamento)."]
      ],
      a: [
        ['t', 'Hierarquia de memória', "Registradores → cache L1/L2/L3 → RAM → SSD → rede. Cada degrau é ~10–1000× mais lento. Por isso **localidade** importa: percorrer um array em sequência é muito mais rápido que pular na memória (cache miss)."],
        ['list', 'Latências aproximadas', ['Cache L1: ~1 ns', 'RAM: ~100 ns', 'SSD: ~100 µs', 'Ida e volta Brasil–EUA: ~120 ms']],
        ['t', 'Concorrência x paralelismo', "Concorrência é lidar com várias tarefas intercaladas (ex.: async I/O). Paralelismo é executar ao mesmo tempo em núcleos diferentes. Em Python, o GIL limita paralelismo de CPU em threads; use multiprocessing para CPU e asyncio/threads para I/O."]
      ],
      quiz: [
        { lv: '*', q: 'Qual parte apaga o que tem quando o computador desliga?', o: ['SSD', 'RAM', 'HD', 'Pendrive'], a: 1, w: 'RAM é memória volátil.' },
        { lv: 'b', q: 'Quantos bits tem um byte?', o: ['2', '8', '10', '100'], a: 1, w: '8 bits = 1 byte.' },
        { lv: 'i', q: '`1100` em binário é:', o: ['12', '6', '1100', '3'], a: 0, w: '8 + 4 = 12.' },
        { lv: 'a', q: 'Para tarefa pesada de CPU em Python puro, o mais eficaz é:', o: ['threading', 'multiprocessing', 'asyncio', 'time.sleep'], a: 1, w: 'Processos separados contornam o GIL.' }
      ]
    },
    {
      id: 'comp2', title: 'Como a internet funciona', min: { b: 14, i: 18, a: 20 },
      b: [
        ['an', '📮', 'A internet é um correio gigante', "Cada computador tem um **endereço**, como uma casa. Esse endereço se chama **IP** (tipo 142.250.78.4).\nQuando você abre um site, seu celular manda uma cartinha pedindo a página, e o outro computador manda a página de volta."],
        ['an', '📒', 'DNS é a agenda de contatos', "Ninguém decora números. Você procura “Vovó” na agenda e o celular liga para o número dela.\nO **DNS** faz isso: você digita `google.com` e ele descobre o IP."],
        ['flow', 'Abrindo um site', ['Você digita o endereço', 'DNS acha o IP', 'Seu celular pede a página', 'O servidor responde', 'O navegador desenha a tela']],
        ['tip', "Servidor é só um computador que fica ligado o tempo todo esperando pedidos."]
      ],
      i: [
        ['flow', 'Camadas (modelo TCP/IP)', ['Aplicação: HTTP, DNS, SMTP', 'Transporte: TCP / UDP (portas)', 'Rede: IP (roteamento)', 'Enlace: Wi‑Fi, Ethernet']],
        ['t', 'IP, porta e protocolo', "IP acha a máquina; a **porta** acha o programa dentro dela. HTTP usa 80, HTTPS 443, PostgreSQL 5432, MySQL 3306, SSH 22.\n**IPv4** (4 números) está esgotado; **IPv6** tem endereços enormes. Em casa, o roteador usa **NAT**: vários aparelhos saem com um IP público só."],
        ['tbl', 'Registros DNS que você vai usar', ['Tipo', 'Para quê'], [['A', 'nome → IPv4'], ['AAAA', 'nome → IPv6'], ['CNAME', 'nome → outro nome'], ['MX', 'servidor de e-mail'], ['TXT', 'verificações (Google, SPF)']]]
      ],
      a: [
        ['t', 'TCP, UDP e QUIC', "TCP faz handshake (SYN, SYN‑ACK, ACK), garante ordem e reenvia perdas: bom para web e banco. UDP só dispara pacotes: bom para vídeo/jogo/DNS. **HTTP/3** roda sobre **QUIC** (UDP) para reduzir latência e evitar o bloqueio de cabeça de fila do TCP."],
        ['t', 'TLS em 1 minuto', "O cliente valida o certificado do servidor (assinado por uma autoridade certificadora), as partes combinam uma chave de sessão (troca Diffie‑Hellman) e o resto vai cifrado com criptografia simétrica. TLS 1.3 faz isso em 1 ida e volta."],
        ['t', 'Resolução DNS e TTL', "Navegador → cache do SO → resolvedor (provedor, 1.1.1.1, 8.8.8.8) → raiz → TLD (.br) → servidor autoritativo. O **TTL** define quanto tempo a resposta fica em cache: por isso mudanças de DNS “demoram a propagar”."]
      ],
      quiz: [
        { lv: '*', q: 'O que o DNS faz?', o: ['Desenha a página', 'Converte nome do site em IP', 'Guarda senhas', 'Bloqueia vírus'], a: 1, w: 'É a agenda de contatos da internet.' },
        { lv: 'b', q: 'Um servidor é:', o: ['Um garçom', 'Um computador que responde pedidos', 'Um navegador', 'Um cabo'], a: 1, w: 'Ele fica ligado esperando pedidos.' },
        { lv: 'i', q: 'Porta padrão do HTTPS:', o: ['80', '22', '443', '3306'], a: 2, w: '443 = HTTPS.' },
        { lv: 'a', q: 'HTTP/3 roda sobre:', o: ['TCP', 'QUIC/UDP', 'FTP', 'SMTP'], a: 1, w: 'QUIC é baseado em UDP.' }
      ]
    },
    {
      id: 'comp3', title: 'Do link à página na tela', min: { b: 12, i: 16, a: 20 },
      b: [
        ['an', '🍕', 'Pedir um site é pedir pizza', "Você liga (faz o **pedido**), a pizzaria prepara e entrega (**resposta**).\nNa web, o pedido se chama **requisição** e a resposta vem com a página."],
        ['list', 'A página vem em 3 partes', ['**HTML**: o esqueleto (títulos, textos, botões)', '**CSS**: a roupa (cores, tamanhos, posições)', '**JavaScript**: o movimento (o que acontece quando você clica)']],
        ['an', '🎨', 'O navegador é um pintor', "Ele lê as instruções e pinta a tela bem rapidinho, de cima para baixo."]
      ],
      i: [
        ['code', 'http', `GET /produtos?categoria=pao HTTP/1.1
Host: padaria.com.br
Accept: text/html

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=60

<!doctype html>...`, "Requisição: método + caminho + cabeçalhos. Resposta: status + cabeçalhos + corpo."],
        ['tbl', 'Códigos de status', ['Faixa', 'Significado', 'Exemplos'], [['2xx', 'Deu certo', '200 OK, 201 Created'], ['3xx', 'Redirecionamento', '301, 304 Not Modified'], ['4xx', 'Erro do cliente', '400, 401, 403, 404'], ['5xx', 'Erro do servidor', '500, 502, 503']]],
        ['t', 'Cookies e sessões', "HTTP não tem memória. Para lembrar que você está logado, o servidor manda um **cookie**, e o navegador devolve ele em toda requisição seguinte."]
      ],
      a: [
        ['flow', 'Caminho crítico de renderização', ['HTML → DOM', 'CSS → CSSOM', 'DOM + CSSOM → árvore de render', 'Layout (posições)', 'Paint e composição']],
        ['t', 'Performance que importa', "CSS bloqueia renderização; JS síncrono bloqueia o parser (use `defer`/`module`). Métricas Core Web Vitals: **LCP** (maior conteúdo visível), **INP** (resposta à interação), **CLS** (estabilidade do layout)."],
        ['t', 'Cache em camadas', "Cache do navegador (Cache-Control, ETag) → CDN na borda → cache da aplicação (Redis) → banco. Arquivos com hash no nome (`app.3f9a.js`) podem ter cache de 1 ano; HTML, cache curto."]
      ],
      quiz: [
        { lv: '*', q: 'Qual parte cuida das cores e do visual?', o: ['HTML', 'CSS', 'SQL', 'DNS'], a: 1, w: 'CSS = estilo.' },
        { lv: 'b', q: 'Quando você clica num botão e algo acontece, quem faz isso normalmente?', o: ['JavaScript', 'HTML', 'Wi‑Fi', 'Teclado'], a: 0, w: 'JS dá comportamento.' },
        { lv: 'i', q: 'Status 404 significa:', o: ['Servidor caiu', 'Recurso não encontrado', 'Sem permissão', 'Tudo certo'], a: 1, w: '4xx = erro do cliente; 404 = não encontrado.' },
        { lv: 'a', q: 'Qual métrica mede estabilidade visual (coisas pulando)?', o: ['LCP', 'CLS', 'TTFB', 'INP'], a: 1, w: 'Cumulative Layout Shift.' }
      ]
    }
  ]
});
