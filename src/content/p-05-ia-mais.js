/* Complementos — IA, Agentes, Automação, Algoritmos, Mobile, Carreira */
CC.patch({
  llm1: {
    rec: ['LLM gera texto prevendo o próximo pedaço (token)', 'Tokens são pedacinhos de palavras', 'Contexto é tudo que o modelo enxerga na conversa', 'Temperatura baixa = previsível; alta = criativa', 'IA pode alucinar: confira fatos importantes'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Quando a IA inventa uma informação com confiança, chamamos de ___', ans: ['alucinacao', 'alucinação'], w: 'Alucinação.' },
      { lv: 'b', t: 'tf', q: 'A IA lê o texto em pedacinhos chamados tokens.', a: true, w: 'Tokens.' },
      { lv: 'i', t: 'order', q: 'Ordene o caminho do texto à resposta:', items: ['Texto vira tokens', 'Modelo calcula probabilidades', 'Escolhe o próximo token', 'Repete até terminar'], w: 'Geração autorregressiva.' },
      { lv: 'a', q: 'Prompt caching reduz:', o: ['Custo e latência de contexto repetido', 'A qualidade', 'O número de usuários', 'A segurança'], a: 0, w: 'Reaproveita o processamento do prefixo.' }
    ]
  },
  llm2: {
    rec: ['Prompt bom tem contexto, tarefa clara e formato de saída', 'Exemplos mostram o que é bom', 'Dê permissão para dizer “não sei”', 'Separe materiais com tags', 'Teste prompts com casos reais (evals)'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene a receita de um bom prompt:', items: ['Contexto e papel', 'Tarefa com verbo claro', 'Formato da saída', 'Restrições'], w: 'Quanto mais claro, melhor.' },
      { lv: 'b', t: 'tf', q: 'Pedidos vagos geram respostas genéricas.', a: true, w: 'Detalhe o que quer.' },
      { lv: 'i', t: 'fill', q: 'Para a IA não inventar valores ausentes, peça para usar ___ quando faltar', ans: ['null', 'nulo', 'não informado', 'nao informado'], w: 'Saída permitida para incerteza.' },
      { lv: 'a', q: 'Dividir uma tarefa grande em vários prompts encadeados ajuda porque:', o: ['Cada etapa fica focada e verificável', 'Gasta menos sempre', 'É obrigatório', 'Desliga a temperatura'], a: 0, w: 'Prompt chaining.' }
    ]
  },
  llm3: {
    rec: ['Seu programa chama a IA por API', 'Paga-se por tokens de entrada e saída', 'A chave da API fica só no servidor', 'Peça saída estruturada e valide', 'Trate limites (429) com nova tentativa'],
    quiz: [
      { lv: '*', t: 'tf', q: 'A chave da API de IA pode ficar no código do app do usuário.', a: false, w: 'Seria roubada e usada por outros.' },
      { lv: 'b', q: 'Usar IA por API serve para:', o: ['Colocar IA dentro do seu sistema', 'Formatar o PC', 'Trocar o Wi-Fi', 'Imprimir'], a: 0, w: 'Integração.' },
      { lv: 'i', t: 'fill', q: 'Parâmetro que limita o tamanho da resposta: max___', ans: ['_tokens', 'tokens'], w: 'max_tokens.' },
      { lv: 'a', q: 'Para processar milhares de documentos sem pressa e mais barato:', o: ['Batch API', 'Streaming', 'Temperatura alta', 'Modelo maior'], a: 0, w: 'Processamento em lote.' }
    ]
  },
  llm4: {
    rec: ['Embeddings colocam textos num mapa de significados', 'Textos parecidos ficam perto', 'Similaridade de cosseno mede a proximidade', 'pgvector guarda vetores no Postgres', 'Busca híbrida e reranking melhoram resultados'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Extensão do Postgres para vetores: pg___', ans: ['vector'], w: 'pgvector.' },
      { lv: 'b', t: 'tf', q: 'Embeddings permitem achar textos com o mesmo sentido, mesmo com palavras diferentes.', a: true, w: 'Busca semântica.' },
      { lv: 'i', q: 'Cosseno igual a 1 significa:', o: ['Mesma direção (sentido muito parecido)', 'Opostos', 'Sem relação', 'Erro'], a: 0, w: 'Vetores alinhados.' },
      { lv: 'a', q: 'Índice aproximado comum para milhões de vetores:', o: ['HNSW', 'B-tree', 'Hash', 'GIN de texto'], a: 0, w: 'Hierarchical Navigable Small World.' }
    ]
  },
  llm5: {
    rec: ['Pessoas decidem; a IA ajuda', 'Não envie senhas ou dados pessoais sem autorização', 'Confira fatos e entenda o código gerado', 'Conteúdo externo pode tentar mandar na IA (prompt injection)', 'Ações irreversíveis pedem confirmação humana'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Código gerado por IA deve ser entendido e testado antes de usar.', a: true, w: 'A responsabilidade é sua.' },
      { lv: 'b', q: 'Qual dado NÃO colar num chat de IA sem autorização?', o: ['Senha do banco', 'Uma receita de bolo', 'Uma dúvida de Excel', 'Um poema seu'], a: 0, w: 'Nunca senhas.' },
      { lv: 'i', t: 'fill', q: 'Respostas injustas com certos grupos vêm de ___ nos dados', ans: ['vies', 'viés'], w: 'Viés.' },
      { lv: 'a', q: 'Melhor defesa contra prompt injection num agente com e-mail:', o: ['Tratar conteúdo externo como dado e exigir confirmação para ações', 'Confiar em tudo', 'Temperatura zero resolve', 'Esconder o prompt'], a: 0, w: 'Permissões mínimas + confirmação.' }
    ]
  },
  agent1: {
    rec: ['Agente é IA com ferramentas e objetivo', 'Loop: decidir, agir, observar, repetir', 'Workflow fixo é mais previsível que agente autônomo', 'Limite passos e custo', 'Ferramentas devem devolver erros úteis'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o loop do agente:', items: ['Pensar no próximo passo', 'Usar uma ferramenta', 'Observar o resultado', 'Decidir se terminou'], w: 'Decidir, agir, observar.' },
      { lv: 'b', t: 'tf', q: 'Um agente pode usar ferramentas para cumprir uma missão.', a: true, w: 'O detetive com a maleta.' },
      { lv: 'i', q: 'Padrão em que um modelo gera e outro critica até melhorar:', o: ['Avaliador–otimizador', 'Singleton', 'MVC', 'Cron'], a: 0, w: 'Evaluator–optimizer.' },
      { lv: 'a', t: 'fill', q: 'Para evitar custo descontrolado, todo agente precisa de limite de ___', ans: ['passos', 'iteracoes', 'iterações'], w: 'E de orçamento.' }
    ]
  },
  agent2: {
    rec: ['O modelo pede a ferramenta; seu código executa', 'tool_use vai, tool_result volta', 'Descrição clara faz o modelo escolher certo', 'Valide parâmetros no servidor', 'Ações de escrita pedem confirmação e idempotência'],
    quiz: [
      { lv: '*', t: 'tf', q: 'No function calling, o próprio modelo executa a função no seu servidor.', a: false, w: 'Ele só pede; seu código executa.' },
      { lv: 'b', q: 'O que mais ajuda a IA a escolher a ferramenta certa?', o: ['Descrição clara', 'Cor do botão', 'Nome em maiúsculas', 'Tamanho do arquivo'], a: 0, w: 'Escreva para um colega novo.' },
      { lv: 'i', t: 'fill', q: 'Formato de esquema usado para descrever os parâmetros da ferramenta: JSON ___', ans: ['schema'], w: 'JSON Schema.' },
      { lv: 'a', t: 'order', q: 'Ordene uma rodada de ferramenta:', items: ['Modelo responde com tool_use', 'Seu código executa a função', 'Você envia tool_result', 'Modelo continua a resposta'], w: 'Ciclo do function calling.' }
    ]
  },
  agent3: {
    rec: ['RAG busca trechos relevantes antes de gerar', 'Fatie documentos com sobreposição', 'Guarde metadados para filtrar', 'Peça citações e recuse quando a base não cobre', 'Controle de acesso também na busca'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Sigla de “buscar e depois gerar”: ___', ans: ['rag'], w: 'Retrieval-Augmented Generation.' },
      { lv: 'b', t: 'tf', q: 'No RAG, a IA recebe trechos dos seus documentos junto com a pergunta.', a: true, w: 'Cola permitida.' },
      { lv: 'i', t: 'order', q: 'Ordene o RAG:', items: ['Fatiar documentos', 'Gerar embeddings', 'Buscar trechos parecidos', 'Gerar resposta com fontes'], w: 'Indexar e consultar.' },
      { lv: 'a', q: 'Contextual retrieval melhora a busca ao:', o: ['Prefixar cada trecho com contexto do documento', 'Remover metadados', 'Aumentar a temperatura', 'Usar só palavras-chave'], a: 0, w: 'Trechos ficam autoexplicativos.' }
    ]
  },
  agent4: {
    rec: ['MCP é o USB-C da IA', 'Servidor MCP expõe ferramentas, recursos e prompts', 'Multiagente vale para tarefas paralelas independentes', 'Avalie trajetórias, não só a resposta', 'Teste agentes contra prompt injection'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Uma integração MCP pode ser usada por vários aplicativos de IA.', a: true, w: 'Protocolo padrão.' },
      { lv: 'b', q: 'Multiagente é:', o: ['Um time de agentes dividindo tarefas', 'Um agente gigante', 'Um banco', 'Um navegador'], a: 0, w: 'Time.' },
      { lv: 'i', t: 'fill', q: 'MCP significa Model Context ___', ans: ['protocol'], w: 'Model Context Protocol.' },
      { lv: 'a', q: 'Ao avaliar agentes, a métrica mais importante costuma ser:', o: ['Taxa de sucesso em tarefas reais verificáveis', 'Quantidade de tokens', 'Cor da interface', 'Velocidade de digitação'], a: 0, w: 'Junto com custo e passos.' }
    ]
  },
  auto1: {
    rec: ['Automação tem gatilho, ações e resultado', 'Vale automatizar o que é repetitivo e com regras claras', 'Mapeie o processo e as exceções antes', 'Humano no circuito para casos ambíguos', 'Toda automação precisa de dono'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene as partes de uma automação:', items: ['Gatilho', 'Ações', 'Resultado entregue'], w: 'Quando, o quê, onde.' },
      { lv: 'b', t: 'tf', q: 'Tarefas que se repetem toda semana são boas para automatizar.', a: true, w: 'Robozinho ajudante.' },
      { lv: 'i', t: 'fill', q: 'O que dispara uma automação se chama ___', ans: ['gatilho', 'trigger'], w: 'Gatilho.' },
      { lv: 'a', q: 'Antes de automatizar um processo, o primeiro passo é:', o: ['Mapear o processo e as exceções', 'Comprar ferramenta', 'Escrever código', 'Demitir alguém'], a: 0, w: 'Entender antes de automatizar.' }
    ]
  },
  auto2: {
    rec: ['Agendamento roda programas na hora marcada', 'Cron: minuto, hora, dia, mês, dia da semana', 'Cron do GitHub Actions usa UTC', 'Jobs devem ser idempotentes', 'Alerte quando o job falhar ou não rodar'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Cron para todo dia às 8h: 0 ___ * * *', ans: ['8'], w: 'Minuto 0, hora 8.' },
      { lv: 'b', t: 'tf', q: 'O computador pode rodar programas sozinho na hora marcada.', a: true, w: 'Despertador.' },
      { lv: 'i', q: 'Biblioteca Python para editar arquivos Excel:', o: ['openpyxl', 'requests', 'flask', 'turtle'], a: 0, w: 'openpyxl.' },
      { lv: 'a', t: 'tf', q: 'Um job de cobrança que roda duas vezes não deve mandar duas mensagens.', a: true, w: 'Idempotência.' }
    ]
  },
  auto3: {
    rec: ['n8n, Zapier e Make ligam apps sem programar', 'n8n é open source e pode ser hospedado por você', 'Webhook recebe dados de formulários e sistemas', 'Nó de código resolve o que os blocos não fazem', 'Versione fluxos e trate erros'],
    quiz: [
      { lv: '*', t: 'tf', q: 'n8n pode ser instalado no seu próprio servidor.', a: true, w: 'Open source.' },
      { lv: 'b', q: 'Montar automação com blocos é como:', o: ['Lego', 'Pintura', 'Dança', 'Leitura'], a: 0, w: 'Blocos encaixados.' },
      { lv: 'i', t: 'order', q: 'Ordene o fluxo de lead do site para o CRM:', items: ['Webhook recebe o formulário', 'Limpa os dados', 'Cria o contato no CRM', 'Avisa o vendedor'], w: 'Gatilho → tratamento → ações.' },
      { lv: 'a', t: 'fill', q: 'Para cada fluxo falho disparar um alerta, crie um ___ workflow', ans: ['error', 'de erro'], w: 'Error workflow.' }
    ]
  },
  auto4: {
    rec: ['Prefira API oficial; robô de interface é último recurso', 'Playwright automatiza o navegador', 'WhatsApp de empresa: API oficial', 'IA classifica, extrai e resume dentro de automações', 'Scraping com respeito a termos e à LGPD'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene as formas de integrar, da mais estável à menos:', items: ['API oficial', 'Exportação de arquivo', 'Integração pronta', 'Robô de interface'], w: 'Robô quebra quando a tela muda.' },
      { lv: 'b', t: 'tf', q: 'Bots podem responder mensagens automaticamente.', a: true, w: 'Atendimento automático.' },
      { lv: 'i', t: 'fill', q: 'Biblioteca para controlar o navegador por código: ___', ans: ['playwright', 'selenium'], w: 'Playwright ou Selenium.' },
      { lv: 'a', q: 'Antes de fazer scraping de um site, confira:', o: ['Termos de uso, robots.txt e existência de API', 'A cor do site', 'O DNS', 'Nada'], a: 0, w: 'Responsabilidade legal e técnica.' }
    ]
  },
  algo1: {
    rec: ['Big-O mede como o tempo cresce com os dados', 'O(1) constante; O(n) linear; O(n²) explode', 'Busca binária é O(log n)', 'Estrutura certa muda tudo: set busca em O(1)', 'Também conta a memória usada'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene da mais rápida para a mais lenta com n grande:', items: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], w: 'Crescimento.' },
      { lv: 'b', t: 'tf', q: 'Olhar caixa por caixa demora mais quando há mais caixas.', a: true, w: 'O(n).' },
      { lv: 'i', t: 'fill', q: 'Ordenar com algoritmos eficientes custa O(n log ___)', ans: ['n'], w: 'O(n log n).' },
      { lv: 'a', q: 'Dois loops aninhados sobre a mesma lista:', o: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'], a: 0, w: 'Quadrático.' }
    ]
  },
  algo2: {
    rec: ['Pilha: último a entrar, primeiro a sair', 'Fila: primeiro a chegar, primeiro a sair', 'deque faz fila eficiente em Python', 'Hash busca por chave em O(1) médio', 'Heap entrega sempre o menor'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Estrutura “último a entrar, primeiro a sair”: ___', ans: ['pilha', 'stack'], w: 'Pilha.' },
      { lv: 'b', t: 'tf', q: 'Numa fila, quem chega primeiro é atendido primeiro.', a: true, w: 'FIFO.' },
      { lv: 'i', q: 'Verificar parênteses balanceados usa:', o: ['Pilha', 'Fila', 'Heap', 'Grafo'], a: 0, w: 'Empilha abertos, desempilha fechados.' },
      { lv: 'a', t: 'order', q: 'Ordene a complexidade do heap:', items: ['Ver o menor: O(1)', 'Inserir: O(log n)', 'Construir de uma lista: O(n)'], w: 'Operações do heap binário.' }
    ]
  },
  algo3: {
    rec: ['Busca binária corta pela metade a cada passo', 'Precisa de lista ordenada', 'Bubble sort é O(n²); merge sort O(n log n)', 'Na prática use sorted()', 'Ordenação estável mantém a ordem dos iguais'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Busca binária funciona em listas desordenadas.', a: false, w: 'Precisa estar ordenada.' },
      { lv: 'b', t: 'order', q: 'Ordene a busca binária por 23 em [2, 5, 8, 12, 16, 23, 38]:', items: ['Olhar o meio (12)', '23 é maior: ficar com a direita', 'Olhar o meio da direita (23)', 'Achou'], w: 'Corta pela metade.' },
      { lv: 'i', t: 'fill', q: 'Módulo Python com busca binária pronta: ___', ans: ['bisect'], w: 'bisect.' },
      { lv: 'a', q: 'Quicksort sem pivô aleatório tem pior caso:', o: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], a: 0, w: 'Em entradas já ordenadas.' }
    ]
  },
  algo4: {
    rec: ['Árvores têm hierarquia: pastas, organogramas, DOM', 'Grafos ligam pontos por arestas: mapas, redes', 'BFS acha o caminho com menos paradas', 'Dijkstra acha o menor custo', 'Índices de banco usam B-trees'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Busca em largura, em sigla: ___', ans: ['bfs'], w: 'Breadth-First Search.' },
      { lv: 'b', t: 'tf', q: 'Mapas de cidades e estradas podem ser grafos.', a: true, w: 'Nós e arestas.' },
      { lv: 'i', q: 'Estrutura usada por BFS:', o: ['Fila', 'Pilha', 'Heap', 'Hash'], a: 0, w: 'Camada por camada.' },
      { lv: 'a', t: 'order', q: 'Ordene um build com dependências (ordenação topológica): banco depende de nada, API do banco, front da API:', items: ['Banco', 'API', 'Front'], w: 'Dependências antes.' }
    ]
  },
  mob1: {
    rec: ['Nativo: Kotlin e Swift', 'Multiplataforma: Flutter e React Native', 'Híbrido: site dentro de app (Capacitor)', 'PWA: site instalável', 'Offline-first sincroniza quando há rede'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Linguagem do Flutter: ___', ans: ['dart'], w: 'Dart.' },
      { lv: 'b', t: 'tf', q: 'Com multiplataforma, um código roda no Android e no iPhone.', a: true, w: 'Escreve uma vez.' },
      { lv: 'i', q: 'Para quem já sabe web, o caminho mais rápido para um app é:', o: ['PWA ou Capacitor', 'Assembly', 'COBOL', 'C puro'], a: 0, w: 'Reaproveita HTML/CSS/JS.' },
      { lv: 'a', t: 'tf', q: 'O sistema pode encerrar o app em segundo plano a qualquer momento.', a: true, w: 'Salve o estado ao pausar.' }
    ]
  },
  mob2: {
    rec: ['APK é o instalador de apps Android', 'Capacitor coloca o site dentro de um app', 'Gradle monta o APK', 'GitHub Actions pode compilar na nuvem', 'Para a loja: AAB assinado e versionCode crescente'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene a criação de um APK com Capacitor:', items: ['Build do site', 'npx cap sync android', './gradlew assembleDebug', 'Instalar o APK'], w: 'Web → nativo → build.' },
      { lv: 'b', t: 'tf', q: 'Para instalar um APK fora da loja, o Android pede permissão.', a: true, w: 'Instalar apps desconhecidos.' },
      { lv: 'i', t: 'fill', q: 'Formato exigido pela Play Store: ___', ans: ['aab'], w: 'Android App Bundle.' },
      { lv: 'a', q: 'Perder a keystore sem Play App Signing impede:', o: ['Publicar atualizações com a mesma assinatura', 'Abrir o app', 'Usar internet', 'Compilar'], a: 0, w: 'Guarde a keystore em cofre.' }
    ]
  },
  mob3: {
    rec: ['Play Console tem taxa única', 'Ficha da loja: ícone, prints, descrição, privacidade', 'Contas novas passam por teste fechado', 'App Store exige conta paga e revisão rigorosa', 'Lançamento gradual reduz riscos'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Antes de aparecer na loja, o app passa por revisão.', a: true, w: 'Google e Apple revisam.' },
      { lv: 'b', q: 'Onde publicar apps Android?', o: ['Google Play', 'Registro.br', 'GitHub Pages', 'Excel'], a: 0, w: 'Play Store.' },
      { lv: 'i', t: 'fill', q: 'Ferramenta da Apple para testar apps antes da loja: Test___', ans: ['flight'], w: 'TestFlight.' },
      { lv: 'a', t: 'order', q: 'Ordene as faixas de teste até produção na Play:', items: ['Teste interno', 'Teste fechado', 'Produção'], w: 'Ampliando o público.' }
    ]
  },
  car1: {
    rec: ['Código é lido muito mais do que escrito', 'Nomes que explicam o que fazem', 'Funções pequenas com uma responsabilidade', 'Comente o porquê, não o quê', 'Pague a dívida técnica aos poucos'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Ferramenta que formata código Python automaticamente: ___', ans: ['black', 'ruff'], w: 'Black ou Ruff format.' },
      { lv: 'b', t: 'tf', q: 'Nomes como `x` e `aux2` deixam o código fácil de entender.', a: false, w: 'Use nomes descritivos.' },
      { lv: 'i', q: '“Número mágico” é:', o: ['Um valor solto sem nome explicando o significado', 'Um número primo', 'Uma senha', 'Um bug'], a: 0, w: 'Use constantes nomeadas.' },
      { lv: 'a', q: 'Regra do escoteiro:', o: ['Deixe o código melhor do que encontrou', 'Nunca mexa', 'Reescreva tudo', 'Comente cada linha'], a: 0, w: 'Melhoria contínua.' }
    ]
  },
  car2: {
    rec: ['Teste confere sozinho se o código acerta', 'assert verifica uma condição', 'Pirâmide: muitos unitários, poucos ponta a ponta', 'TDD: vermelho, verde, refatorar', 'Testes determinísticos: datas e sorteios fixos'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o ciclo do TDD:', items: ['Escrever um teste que falha', 'Fazer o mínimo para passar', 'Refatorar'], w: 'Vermelho, verde, refatorar.' },
      { lv: 'b', t: 'tf', q: 'Testes automáticos rodam sozinhos toda vez.', a: true, w: 'Rede de segurança.' },
      { lv: 'i', t: 'fill', q: 'Ferramenta de testes mais usada em Python: ___', ans: ['pytest'], w: 'pytest.' },
      { lv: 'a', q: 'Mocks devem ser usados principalmente:', o: ['Nas bordas (rede, relógio, pagamento)', 'Em toda função', 'Nunca', 'Só no front-end'], a: 0, w: 'Teste o comportamento real no núcleo.' }
    ]
  },
  car3: {
    rec: ['Pratique um pouco todo dia', 'Projetos reais ensinam mais que vídeos', 'Portfólio: README, deploy e problema real', 'Mostre impacto em números', 'Use IA como tutora, entendendo cada linha'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Estudar 20 a 40 minutos todo dia funciona melhor que 10 horas uma vez por mês.', a: true, w: 'Constância.' },
      { lv: 'b', q: 'O melhor jeito de aprender a programar:', o: ['Fazer projetos e errar', 'Só assistir', 'Decorar', 'Esperar'], a: 0, w: 'Bicicleta.' },
      { lv: 'i', t: 'fill', q: 'Arquivo que apresenta o projeto no GitHub: ___', ans: ['readme', 'readme.md'], w: 'README.' },
      { lv: 'a', t: 'order', q: 'Ordene a descrição de um projeto no currículo (STAR):', items: ['Situação', 'Tarefa', 'Ação', 'Resultado'], w: 'Método STAR.' }
    ]
  }
}, {
  llm: [
    { q: 'O que mais melhora a resposta de uma IA?', o: ['Contexto e instruções claras', 'Letras maiúsculas', 'Pedir urgência', 'Prompt curto e vago'], a: 0, w: 'Clareza.' },
    { t: 'tf', q: 'A IA sempre sabe dos acontecimentos de hoje sem ferramentas de busca.', a: false, w: 'Tem data de corte do treino.' },
    { t: 'fill', q: 'Unidade de cobrança das APIs de IA: ___', ans: ['token', 'tokens'], w: 'Tokens.' },
    { t: 'order', q: 'Ordene uma integração segura com IA:', items: ['Chave no servidor', 'Prompt com formato definido', 'Validar a saída', 'Registrar e monitorar'], w: 'Produção responsável.' },
    { q: 'Busca por significado usa:', o: ['Embeddings', 'Regex', 'CSV', 'FTP'], a: 0, w: 'Vetores semânticos.' }
  ],
  agent: [
    { q: 'Diferença entre chat comum e agente:', o: ['O agente usa ferramentas e age em várias etapas', 'O agente escreve mais bonito', 'Não há diferença', 'O chat é mais caro'], a: 0, w: 'Ação com objetivo.' },
    { t: 'tf', q: 'Ações irreversíveis de um agente devem ter confirmação humana.', a: true, w: 'Enviar, pagar, apagar.' },
    { t: 'fill', q: 'Protocolo padrão para conectar IA a ferramentas: ___', ans: ['mcp'], w: 'Model Context Protocol.' },
    { t: 'order', q: 'Ordene a criação de um agente simples:', items: ['Definir o objetivo', 'Criar as ferramentas', 'Escrever as instruções', 'Testar com casos reais', 'Limitar passos e custo'], w: 'Do objetivo à segurança.' },
    { q: 'RAG serve para:', o: ['Dar à IA informação dos seus documentos', 'Treinar do zero', 'Editar imagens', 'Hospedar sites'], a: 0, w: 'Buscar e gerar.' }
  ],
  auto: [
    { q: 'Cron `0 9 * * 1-5` roda:', o: ['Dias úteis às 9h', 'Todo dia às 1h', 'Dia 9 de cada mês', 'A cada 9 minutos'], a: 0, w: '1-5 = segunda a sexta.' },
    { t: 'tf', q: 'Robôs de interface (RPA) quebram quando o site muda.', a: true, w: 'Prefira API.' },
    { t: 'fill', q: 'Ferramenta open source de automação com blocos: ___', ans: ['n8n'], w: 'n8n.' },
    { t: 'order', q: 'Ordene a criação de uma automação responsável:', items: ['Mapear o processo', 'Construir o fluxo', 'Testar com dados reais', 'Monitorar e alertar'], w: 'Antes, durante e depois.' },
    { q: 'Mensagens de empresa no WhatsApp devem usar:', o: ['API oficial do WhatsApp Business', 'Apps não oficiais', 'Prints', 'SMS'], a: 0, w: 'Evita banimento.' }
  ],
  algo: [
    { q: 'Complexidade da busca binária:', o: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], a: 0, w: 'Corta pela metade.' },
    { t: 'tf', q: 'Buscar um item num set é mais rápido em média do que numa lista.', a: true, w: 'O(1) x O(n).' },
    { t: 'fill', q: 'Algoritmo de menor caminho com pesos positivos: ___', ans: ['dijkstra'], w: 'Dijkstra.' },
    { t: 'order', q: 'Ordene a busca em largura (BFS):', items: ['Colocar a origem na fila', 'Tirar o primeiro da fila', 'Visitar os vizinhos não vistos', 'Repetir até achar'], w: 'Camada por camada.' },
    { q: 'O botão desfazer funciona como:', o: ['Pilha', 'Fila', 'Grafo', 'Árvore'], a: 0, w: 'Último a entrar sai primeiro.' }
  ],
  mob: [
    { q: 'Arquivo de instalação Android:', o: ['APK', 'EXE', 'DMG', 'ZIP'], a: 0, w: 'APK.' },
    { t: 'tf', q: 'React Native usa JavaScript/TypeScript.', a: true, w: 'Com componentes nativos.' },
    { t: 'fill', q: 'Ferramenta deste app que transforma site em app: ___', ans: ['capacitor'], w: 'Capacitor.' },
    { t: 'order', q: 'Ordene a publicação na Play Store:', items: ['Criar conta no Play Console', 'Gerar AAB assinado', 'Preencher a ficha', 'Teste fechado', 'Produção'], w: 'Do cadastro ao lançamento.' },
    { q: 'Linguagem nativa moderna para iPhone:', o: ['Swift', 'Kotlin', 'PHP', 'Ruby'], a: 0, w: 'Swift.' }
  ],
  car: [
    { q: 'Um bom portfólio tem:', o: ['Projetos reais com README e deploy', 'Só certificados', 'Só prints', 'Nada'], a: 0, w: 'Mostra resultado.' },
    { t: 'tf', q: 'Comentários devem explicar o porquê das decisões.', a: true, w: 'O quê, o código mostra.' },
    { t: 'fill', q: 'Comando que roda os testes Python: ___', ans: ['pytest'], w: 'pytest.' },
    { t: 'order', q: 'Ordene a pirâmide de testes da base ao topo:', items: ['Unitários', 'Integração', 'Ponta a ponta'], w: 'Muitos rápidos embaixo.' },
    { q: 'Ao travar num problema, uma técnica eficaz é:', o: ['Explicar o problema em voz alta (patinho de borracha)', 'Desistir', 'Apagar tudo', 'Esperar alguém'], a: 0, w: 'Explicar organiza o raciocínio.' }
  ]
});
