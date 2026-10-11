/* Complementos: pontos de recapitulação, questões extras e prova final
   — Fundamentos, Computador & Internet, Terminal, Git */
CC.patch({
  fund1: {
    rec: ['Programar é escrever instruções precisas que o computador executa na ordem', 'Linguagens de programação são a ponte entre nós e a máquina', 'Programas têm entrada, processamento, saída e estado', 'Compiladas traduzem antes; interpretadas executam enquanto leem', 'Erros fazem parte: a mensagem de erro é uma pista'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene as partes de um programa simples de compra:', items: ['Receber preço e quantidade (entrada)', 'Multiplicar (processamento)', 'Mostrar o total (saída)'], w: 'Entrada → processamento → saída.' },
      { lv: 'b', t: 'tf', q: 'O computador adivinha o que você quis dizer quando a instrução está incompleta.', a: false, w: 'Ele faz exatamente o que está escrito.' },
      { lv: 'i', t: 'fill', q: 'Programa que traduz todo o código antes de rodar: ___', ans: ['compilador'], w: 'Compilador (C, Go, Rust).' },
      { lv: 'a', q: 'Uma função que lê a hora atual do sistema é:', o: ['Pura', 'Impura (depende de estado externo)', 'Recursiva', 'Declarativa'], a: 1, w: 'O resultado muda sem a entrada mudar.' }
    ]
  },
  fund2: {
    rec: ['Variável é uma caixa com nome que guarda um valor', 'O sinal = guarda; não compara', 'Tipos básicos: inteiro, decimal, texto e verdadeiro/falso', 'Dados de formulário chegam como texto: converta antes de calcular', 'Para dinheiro, use centavos inteiros ou Decimal'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Depois de `x = 3` e `x = x * 2`, x vale ___', ans: ['6'], w: '3 × 2.' },
      { lv: 'b', t: 'tf', q: 'Texto em Python fica entre aspas.', a: true, w: '"banana".' },
      { lv: 'i', q: '`int("42") + 1` resulta em:', o: ['"421"', '43', 'erro', '42'], a: 1, w: 'int converte texto em número.' },
      { lv: 'a', t: 'tf', q: 'Em Python, `a = b` cria uma cópia independente de uma lista.', a: false, w: 'Os dois nomes apontam para o mesmo objeto.' }
    ]
  },
  fund3: {
    rec: ['if executa um bloco se a condição for verdadeira', 'else é o caminho do senão; elif testa outras condições em ordem', '== compara; = guarda', 'and exige tudo verdadeiro; or exige um verdadeiro', 'Retornos antecipados evitam ifs aninhados'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene a estrutura de uma decisão com três caminhos:', items: ['if', 'elif', 'else'], w: 'Testa em ordem e para no primeiro verdadeiro.' },
      { lv: 'b', q: 'Qual sinal significa “maior ou igual”?', o: ['=>', '>=', '==', '!='], a: 1, w: '>=.' },
      { lv: 'i', t: 'tf', q: '`True or False` resulta em True.', a: true, w: 'or precisa de um verdadeiro.' },
      { lv: 'a', t: 'fill', q: 'Valores falsy em Python incluem 0, "", [], {} e ___', ans: ['none', 'false'], w: 'None (e False).' }
    ]
  },
  fund4: {
    rec: ['for repete para cada item; while repete enquanto a condição for verdadeira', 'range(n) conta de 0 até n−1', 'Função é uma máquina: entra parâmetro, sai return', 'Copiou o mesmo código três vezes? Vire função', 'Recursão precisa de caso base'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Palavra que devolve o resultado de uma função: ___', ans: ['return'], w: 'return.' },
      { lv: 'b', t: 'tf', q: 'Um loop serve para repetir instruções.', a: true, w: 'Sem cansar.' },
      { lv: 'i', q: '`range(2, 6)` gera:', o: ['2,3,4,5,6', '2,3,4,5', '3,4,5,6', '0..6'], a: 1, w: 'O fim não entra.' },
      { lv: 'a', t: 'tf', q: 'Recursão sem caso base termina sozinha.', a: false, w: 'Estoura a pilha.' }
    ]
  },
  comp1: {
    rec: ['CPU calcula, RAM é a mesa de trabalho, disco é o armário', 'Tudo vira zeros e uns; 8 bits = 1 byte', 'O sistema operacional organiza o uso do hardware', 'UTF-8 representa textos de todos os idiomas', 'Processos isolam programas; threads dividem trabalho'],
    quiz: [
      { lv: '*', t: 'fill', q: '1 byte tem ___ bits', ans: ['8', 'oito'], w: '8 bits.' },
      { lv: 'b', t: 'tf', q: 'A memória RAM apaga quando o computador desliga.', a: true, w: 'É volátil.' },
      { lv: 'i', t: 'fill', q: 'O número 5 em binário é ___', ans: ['101', '0101'], w: '4 + 1.' },
      { lv: 'a', q: 'Percorrer um array em sequência é mais rápido que saltar na memória por causa de:', o: ['Localidade e cache', 'Antivírus', 'DNS', 'Wi-Fi'], a: 0, w: 'Menos cache misses.' }
    ]
  },
  comp2: {
    rec: ['Cada aparelho tem um endereço IP', 'DNS traduz nomes em IPs', 'Portas identificam o programa: 443 é HTTPS', 'TCP garante entrega e ordem; UDP é rápido e sem garantias', 'TLS cifra a conexão e comprova o dono do domínio'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o que acontece ao abrir um site:', items: ['Digitar o endereço', 'DNS encontra o IP', 'Pedido vai ao servidor', 'Servidor responde', 'Navegador desenha a página'], w: 'Do nome à tela.' },
      { lv: 'b', t: 'tf', q: 'Servidor é um computador que responde pedidos pela rede.', a: true, w: 'Fica ligado esperando.' },
      { lv: 'i', q: 'Registro DNS que aponta um nome para outro nome:', o: ['A', 'CNAME', 'MX', 'TXT'], a: 1, w: 'CNAME.' },
      { lv: 'a', t: 'fill', q: 'Tempo que uma resposta DNS fica em cache: ___', ans: ['ttl'], w: 'Time To Live.' }
    ]
  },
  comp3: {
    rec: ['O navegador faz uma requisição e recebe uma resposta', 'HTML estrutura, CSS veste, JavaScript dá movimento', 'Status 2xx deu certo, 4xx erro do cliente, 5xx erro do servidor', 'Cookies permitem lembrar que você está logado', 'Cache em camadas deixa sites rápidos'],
    quiz: [
      { lv: '*', q: 'Status 500 indica:', o: ['Sucesso', 'Erro do servidor', 'Não encontrado', 'Redirecionamento'], a: 1, w: '5xx = servidor.' },
      { lv: 'b', t: 'order', q: 'Ordene as camadas de uma página:', items: ['HTML (esqueleto)', 'CSS (roupa)', 'JavaScript (movimento)'], w: 'Estrutura, estilo, comportamento.' },
      { lv: 'i', t: 'tf', q: 'HTTP guarda memória entre requisições sem cookies ou tokens.', a: false, w: 'HTTP é sem estado.' },
      { lv: 'a', t: 'fill', q: 'Métrica dos Core Web Vitals para resposta a interações: ___', ans: ['inp'], w: 'Interaction to Next Paint.' }
    ]
  },
  term1: {
    rec: ['pwd mostra onde você está; ls lista; cd entra', 'cd .. volta uma pasta', 'Tab completa nomes; Ctrl+C cancela', 'rm apaga sem lixeira', 'Pipe | liga a saída de um comando à entrada de outro'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Comando que mostra a pasta atual: ___', ans: ['pwd'], w: 'print working directory.' },
      { lv: 'b', t: 'tf', q: 'Ctrl + C cancela o comando que está rodando.', a: true, w: 'Interrompe o processo.' },
      { lv: 'i', q: 'Para criar uma pasta chamada app:', o: ['mkdir app', 'touch app', 'cd app', 'rm app'], a: 0, w: 'make directory.' },
      { lv: 'a', q: '`grep -i erro app.log | wc -l` faz:', o: ['Apaga erros', 'Conta linhas com “erro”, ignorando maiúsculas', 'Cria log', 'Lista pastas'], a: 1, w: 'Filtra e conta.' }
    ]
  },
  term2: {
    rec: ['root é o administrador; sudo executa como ele', 'Permissões: ler (4), escrever (2), executar (1)', 'chmod muda permissões; chown muda o dono', 'Instale programas pelo gerenciador de pacotes', 'Serviços rodam com systemd e usuário próprio'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Permissão total para o dono, ler/executar para os outros: chmod ___', ans: ['755'], w: '7=rwx, 5=r-x.' },
      { lv: 'b', t: 'tf', q: 'Usar sudo sem saber o que o comando faz é seguro.', a: false, w: 'Pode quebrar o sistema.' },
      { lv: 'i', q: 'Gerenciador de pacotes do Ubuntu:', o: ['apt', 'brew', 'winget', 'npm'], a: 0, w: 'apt.' },
      { lv: 'a', q: 'Aplicação em produção deve rodar como:', o: ['root', 'Usuário de serviço com permissões mínimas', 'Seu usuário pessoal', 'Qualquer um'], a: 1, w: 'Menor privilégio.' }
    ]
  },
  term3: {
    rec: ['SSH é um controle remoto seguro', 'Use chave em vez de senha', 'A chave privada nunca sai do seu computador', 'scp e rsync copiam arquivos', 'Túnel SSH acessa o banco sem expô-lo à internet'],
    quiz: [
      { lv: '*', t: 'tf', q: 'A chave privada SSH pode ser enviada para colegas.', a: false, w: 'Só a pública vai para os servidores.' },
      { lv: 'b', q: 'SSH serve para:', o: ['Controlar outro computador com segurança', 'Editar fotos', 'Imprimir', 'Jogar'], a: 0, w: 'Secure Shell.' },
      { lv: 'i', t: 'fill', q: 'Comando para gerar um par de chaves: ssh-___ -t ed25519', ans: ['keygen'], w: 'ssh-keygen.' },
      { lv: 'a', t: 'order', q: 'Ordene o endurecimento básico de um servidor:', items: ['Criar usuário com chave SSH', 'Desativar login root e por senha', 'Ativar firewall (22, 80, 443)', 'Instalar fail2ban'], w: 'Acesso seguro antes de fechar portas.' }
    ]
  },
  git1: {
    rec: ['Commit é uma foto do código com recado', 'add escolhe, commit salva, push envia', '.gitignore impede subir node_modules e .env', 'git revert desfaz commit publicado com segurança', 'Branch é só um ponteiro para um commit'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o fluxo básico do Git:', items: ['git add', 'git commit', 'git push'], w: 'Escolher, salvar, enviar.' },
      { lv: 'b', t: 'tf', q: 'GitHub guarda seus commits na nuvem.', a: true, w: 'É o álbum na nuvem.' },
      { lv: 'i', t: 'fill', q: 'Comando que mostra o estado dos arquivos: git ___', ans: ['status'], w: 'git status.' },
      { lv: 'a', q: 'Perdeu um commit depois de um reset? Use:', o: ['git reflog', 'git init', 'git clone', 'git rm'], a: 0, w: 'O reflog lembra por onde o HEAD passou.' }
    ]
  },
  git2: {
    rec: ['Branch é um galho para desenvolver sem mexer na principal', 'Pull Request pede revisão antes de juntar', 'Conflito: escolha o resultado e remova os marcadores', 'Branches pequenas geram menos conflitos', 'Nunca force push em branch compartilhada sem lease'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Comando para criar e mudar para uma branch: git switch ___ nome', ans: ['-c'], w: 'git switch -c.' },
      { lv: 'b', t: 'tf', q: 'Uma branch permite testar ideias sem estragar a versão principal.', a: true, w: 'Galho da árvore.' },
      { lv: 'i', q: 'Depois de resolver um conflito, você:', o: ['git add e git commit', 'Apaga o repositório', 'git init', 'Formata o PC'], a: 0, w: 'Marca resolvido e conclui.' },
      { lv: 'a', q: 'Trunk-based development usa:', o: ['Branches de vida curta e merge frequente', 'Branches de 6 meses', 'Nenhum controle de versão', 'Só tags'], a: 0, w: 'Integração contínua.' }
    ]
  },
  git3: {
    rec: ['README é a capa do projeto', 'Issues organizam tarefas e bugs', 'Actions automatizam testes, builds e deploy', 'Segredos ficam em Secrets, nunca no código', 'Chave vazada: revogue primeiro'],
    quiz: [
      { lv: '*', t: 'tf', q: 'GitHub Actions pode gerar o APK automaticamente a cada push.', a: true, w: 'É assim que este app é compilado.' },
      { lv: 'b', q: 'Onde anotar bugs e tarefas do projeto no GitHub?', o: ['Issues', 'README', 'Releases', 'Pages'], a: 0, w: 'Issues.' },
      { lv: 'i', t: 'fill', q: 'Serviço do GitHub que hospeda site estático grátis: GitHub ___', ans: ['pages'], w: 'GitHub Pages.' },
      { lv: 'a', q: 'Ferramenta que reescreve o histórico para remover um arquivo vazado:', o: ['git filter-repo', 'git status', 'git log', 'git tag'], a: 0, w: 'Depois de revogar a chave.' }
    ]
  }
}, {
  fund: [
    { t: 'order', q: 'Ordene para resolver um problema programando:', items: ['Entender o problema', 'Pensar nos passos (algoritmo)', 'Escrever o código', 'Testar e corrigir'], w: 'Pensar antes de digitar.' },
    { q: '`for i in range(3): print(i)` mostra:', o: ['1 2 3', '0 1 2', '0 1 2 3', 'nada'], a: 1, w: 'range(3) = 0, 1, 2.' },
    { t: 'fill', q: 'Palavra do Python para criar uma função: ___', ans: ['def'], w: 'def nome():' },
    { t: 'tf', q: '`5 == 5.0` é verdadeiro em Python.', a: true, w: 'Comparação por valor.' },
    { q: 'Qual estrutura repete enquanto a condição for verdadeira?', o: ['if', 'while', 'def', 'return'], a: 1, w: 'while.' }
  ],
  comp: [
    { q: 'Porta padrão do HTTPS:', o: ['80', '443', '22', '3306'], a: 1, w: '443.' },
    { t: 'tf', q: 'UTF-8 consegue representar emojis e acentos.', a: true, w: 'De 1 a 4 bytes por caractere.' },
    { t: 'order', q: 'Ordene do mais rápido ao mais lento:', items: ['Cache da CPU', 'Memória RAM', 'SSD', 'Rede'], w: 'Hierarquia de memória.' },
    { t: 'fill', q: 'Protocolo que cifra a conexão no HTTPS: ___', ans: ['tls', 'ssl/tls'], w: 'TLS.' },
    { q: 'Status 404 significa:', o: ['OK', 'Não encontrado', 'Erro do servidor', 'Sem permissão'], a: 1, w: 'Not Found.' }
  ],
  term: [
    { t: 'fill', q: 'Comando que lista arquivos, incluindo ocultos: ls ___', ans: ['-la', '-a', '-al'], w: 'ls -la.' },
    { q: 'O que faz `cd ~`?', o: ['Vai para a pasta pessoal', 'Apaga tudo', 'Volta uma pasta', 'Lista arquivos'], a: 0, w: '~ é a home.' },
    { t: 'tf', q: 'No Linux, arquivos apagados com rm vão para a lixeira.', a: false, w: 'Somem direto.' },
    { t: 'order', q: 'Ordene para conectar com chave a um servidor novo:', items: ['ssh-keygen', 'ssh-copy-id usuario@servidor', 'ssh usuario@servidor'], w: 'Gera, envia a pública, conecta.' },
    { q: 'Para ver logs de um serviço systemd ao vivo:', o: ['journalctl -u nome -f', 'ls -l', 'cat /etc', 'top -s'], a: 0, w: 'journalctl.' }
  ],
  git: [
    { t: 'order', q: 'Ordene para publicar uma mudança via Pull Request:', items: ['Criar branch', 'Commitar', 'Push da branch', 'Abrir Pull Request', 'Revisão e merge'], w: 'Fluxo de equipe.' },
    { q: 'Onde colocar `.env` para não ir ao GitHub?', o: ['.gitignore', 'README', 'package.json', 'LICENSE'], a: 0, w: '.gitignore.' },
    { t: 'tf', q: 'git revert cria um novo commit que desfaz outro.', a: true, w: 'Seguro para histórico publicado.' },
    { t: 'fill', q: 'Comando que baixa um repositório pela primeira vez: git ___', ans: ['clone'], w: 'git clone url.' },
    { q: 'Marcadores <<<<<<< aparecem em caso de:', o: ['Conflito', 'Sucesso', 'Erro de rede', 'Push'], a: 0, w: 'Resolva manualmente.' }
  ]
});
