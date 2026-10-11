/* Complementos — Banco de Dados, SQL, NoSQL, Dados & ML */
CC.patch({
  bd1: {
    rec: ['Banco de dados é um armário organizado em tabelas', 'Linha é um registro; coluna é uma informação', 'Relacional (SQL), documento, chave-valor, colunar e vetorial', 'O SGBD guarda, protege e consulta os dados', 'OLTP para o dia a dia, OLAP para análise'],
    quiz: [
      { lv: '*', t: 'tf', q: 'PostgreSQL, MySQL e SQLite são bancos relacionais.', a: true, w: 'Usam tabelas e SQL.' },
      { lv: 'b', q: 'Cada coluna de uma tabela de clientes guarda:', o: ['Um tipo de informação (nome, cidade)', 'Um cliente inteiro', 'Uma senha', 'Uma foto do banco'], a: 0, w: 'Linha = cliente; coluna = atributo.' },
      { lv: 'i', t: 'fill', q: 'Banco relacional que está por trás do Supabase: ___', ans: ['postgres', 'postgresql'], w: 'PostgreSQL.' },
      { lv: 'a', q: 'Para dashboards sobre bilhões de linhas, o mais indicado é:', o: ['Banco colunar (BigQuery, ClickHouse)', 'Planilha', 'Redis', 'SQLite no celular'], a: 0, w: 'OLAP.' }
    ]
  },
  bd2: {
    rec: ['Chave primária identifica cada linha de forma única', 'Chave estrangeira liga uma tabela a outra', '1:N com FK no lado N; N:N com tabela de ligação', 'Restrições impedem dados errados', 'Defina o comportamento ao excluir de propósito'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Coluna que identifica cada linha de forma única: chave ___', ans: ['primaria', 'primária', 'primary key', 'pk'], w: 'Chave primária.' },
      { lv: 'b', t: 'tf', q: 'Duas linhas podem ter a mesma chave primária.', a: false, w: 'Ela é única.' },
      { lv: 'i', t: 'order', q: 'Ordene a modelagem de alunos e cursos (N:N):', items: ['Tabela alunos', 'Tabela cursos', 'Tabela matriculas(aluno_id, curso_id)'], w: 'Tabela de ligação.' },
      { lv: 'a', q: 'Por que evitar CPF como chave primária?', o: ['É curto', 'Pode precisar ser corrigido e se espalha por várias tabelas', 'É ilegal', 'Ocupa muito'], a: 1, w: 'Use chave substituta + UNIQUE.' }
    ]
  },
  bd3: {
    rec: ['Guarde cada informação em um lugar só', 'Desenhe o modelo antes de criar tabelas', '1FN: um valor por célula; 3FN: nada depende do que não é chave', 'Desnormalize só quando medir necessidade', 'Congele preços no item do pedido para preservar o histórico'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Repetir o endereço do cliente em todos os pedidos é uma boa prática.', a: false, w: 'Atualizar vira pesadelo.' },
      { lv: 'b', q: 'Ferramenta para desenhar o modelo do banco:', o: ['dbdiagram.io', 'Paint 3D', 'Calculadora', 'Bloco de notas'], a: 0, w: 'Ou o editor do Supabase.' },
      { lv: 'i', t: 'fill', q: 'Coluna “cidade → UF” em pedidos viola a ___FN', ans: ['3', 'terceira'], w: 'Dependência transitiva.' },
      { lv: 'a', q: 'Para auditoria completa de mudanças em contratos:', o: ['Tabela de eventos append-only', 'Apagar e recriar linhas', 'Planilha paralela', 'Logs no console'], a: 0, w: 'Histórico imutável.' }
    ]
  },
  bd4: {
    rec: ['Índice é o sumário: acha dados rápido', 'Índice acelera leitura e deixa escrita mais lenta', 'Transação: tudo ou nada', 'ACID: atomicidade, consistência, isolamento, durabilidade', 'Backup só vale se a restauração for testada'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene uma transferência segura:', items: ['BEGIN', 'Tirar da conta A', 'Colocar na conta B', 'COMMIT'], w: 'Se falhar no meio: ROLLBACK.' },
      { lv: 'b', t: 'tf', q: 'Backup é uma cópia de segurança dos dados.', a: true, w: 'Para recuperar após falhas.' },
      { lv: 'i', t: 'fill', q: 'Comando que desfaz uma transação: ___', ans: ['rollback'], w: 'ROLLBACK.' },
      { lv: 'a', q: 'Índice composto (cliente_id, criado_em DESC) atende bem:', o: ['WHERE cliente_id = ? ORDER BY criado_em DESC', 'WHERE criado_em LIKE "%x"', 'SELECT COUNT(*) sem filtro', 'UPDATE de todas as linhas'], a: 0, w: 'Filtro + ordenação no mesmo índice.' }
    ]
  },
  sql1: {
    rec: ['SELECT colunas FROM tabela', '* traz todas as colunas', 'AS dá apelido; dá para calcular colunas', 'DISTINCT remove repetidos', 'Ordem lógica: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Complete: SELECT nome ___ clientes', ans: ['from'], w: 'FROM indica a tabela.' },
      { lv: 'b', t: 'tf', q: '`SELECT nome, cidade FROM clientes` traz duas colunas.', a: true, w: 'Separadas por vírgula.' },
      { lv: 'i', t: 'order', q: 'Ordene as cláusulas como se escreve:', items: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT'], w: 'Ordem de escrita.' },
      { lv: 'a', q: 'Equivalente SQL de “se/senão” numa coluna:', o: ['CASE WHEN ... THEN ... ELSE ... END', 'IF THEN', 'SWITCH', 'COALESCE'], a: 0, w: 'CASE.' }
    ]
  },
  sql2: {
    rec: ['WHERE filtra linhas', 'Texto entre aspas simples; números sem aspas', 'AND, OR e parênteses combinam condições', 'IN, LIKE e BETWEEN simplificam filtros', 'NULL se testa com IS NULL'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Filtro para nomes que começam com A: WHERE nome ___ \'A%\'', ans: ['like'], w: 'LIKE com %.' },
      { lv: 'b', t: 'tf', q: 'WHERE serve para filtrar as linhas.', a: true, w: 'A peneira.' },
      { lv: 'i', q: '`WHERE idade BETWEEN 20 AND 30` inclui 20 e 30?', o: ['Sim, os dois', 'Não', 'Só 20', 'Só 30'], a: 0, w: 'BETWEEN é inclusivo.' },
      { lv: 'a', t: 'tf', q: '`WHERE email = NULL` encontra emails vazios corretamente.', a: false, w: 'Use IS NULL.' }
    ]
  },
  sql3: {
    rec: ['ORDER BY ordena; DESC do maior para o menor', 'LIMIT corta o resultado', 'COUNT, SUM, AVG, MAX e MIN agregam', 'GROUP BY calcula por grupo', 'WHERE filtra linhas; HAVING filtra grupos'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene para os 3 produtos mais caros:', items: ['SELECT nome, preco FROM produtos', 'ORDER BY preco DESC', 'LIMIT 3'], w: 'Ordena e corta.' },
      { lv: 'b', t: 'fill', q: 'Função que conta linhas: ___(*)', ans: ['count'], w: 'COUNT(*).' },
      { lv: 'i', t: 'tf', q: 'HAVING filtra depois do GROUP BY.', a: true, w: 'Filtra grupos.' },
      { lv: 'a', q: 'Paginação eficiente em tabelas enormes:', o: ['Keyset (WHERE id < último ORDER BY id DESC LIMIT n)', 'OFFSET 100000', 'Trazer tudo e cortar no app', 'ORDER BY RANDOM()'], a: 0, w: 'Não lê o que pula.' }
    ]
  },
  sql4: {
    rec: ['JOIN junta tabelas pelas chaves', 'ON diz quais colunas precisam bater', 'INNER traz só o que casa; LEFT mantém tudo da esquerda', 'Apelidos curtos deixam a consulta legível', 'Agregue antes de juntar para não multiplicar linhas'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Complete: JOIN clientes c ___ c.id = p.cliente_id', ans: ['on'], w: 'ON.' },
      { lv: 'b', t: 'tf', q: 'JOIN combina informações de duas tabelas.', a: true, w: 'Encaixa as peças.' },
      { lv: 'i', q: 'Clientes que nunca compraram aparecem com:', o: ['INNER JOIN', 'LEFT JOIN a partir de clientes', 'CROSS JOIN', 'UNION'], a: 1, w: 'LEFT preserva todos.' },
      { lv: 'a', q: 'Juntar pedidos E pagamentos ao cliente na mesma consulta e somar os dois pode:', o: ['Inflar as somas por multiplicação de linhas', 'Deixar a soma exata sempre', 'Apagar dados', 'Criar índice'], a: 0, w: 'Agregue cada lado antes de juntar.' }
    ]
  },
  sql5: {
    rec: ['INSERT adiciona; UPDATE muda; DELETE apaga', 'UPDATE e DELETE sempre com WHERE', 'Teste o WHERE com SELECT antes', 'CREATE/ALTER/DROP mudam a estrutura', 'Upsert com ON CONFLICT e RETURNING'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene a forma segura de apagar registros:', items: ['SELECT com o WHERE pretendido', 'Conferir as linhas', 'DELETE com o mesmo WHERE'], w: 'Confira antes.' },
      { lv: 'b', t: 'fill', q: 'Comando para mudar dados existentes: ___', ans: ['update'], w: 'UPDATE.' },
      { lv: 'i', t: 'tf', q: 'DROP TABLE apaga a tabela inteira com os dados.', a: true, w: 'Cuidado.' },
      { lv: 'a', q: '`... WHERE id = 991 AND status = \'aberto\'` ao dar baixa garante:', o: ['Idempotência (não paga duas vezes)', 'Velocidade', 'Backup', 'Criptografia'], a: 0, w: 'Só muda se ainda estiver aberto.' }
    ]
  },
  sql6: {
    rec: ['Subconsulta é uma pergunta dentro de outra', 'CTE (WITH) organiza a consulta em etapas', 'View salva uma consulta com nome', 'Funções de janela calculam por grupo sem colapsar linhas', 'LAG/LEAD comparam com a linha anterior/seguinte'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Palavra que inicia uma CTE: ___', ans: ['with'], w: 'WITH.' },
      { lv: 'b', t: 'tf', q: 'Numa subconsulta, a parte entre parênteses roda primeiro.', a: true, w: 'Pergunta interna.' },
      { lv: 'i', q: 'Uma VIEW é:', o: ['Uma consulta salva usada como tabela', 'Um índice', 'Um backup', 'Um usuário'], a: 0, w: 'Tabela virtual.' },
      { lv: 'a', q: 'Ranking de clientes por cidade:', o: ['RANK() OVER (PARTITION BY cidade ORDER BY total DESC)', 'GROUP BY cidade LIMIT 1', 'ORDER BY RAND()', 'DISTINCT cidade'], a: 0, w: 'Função de janela.' }
    ]
  },
  nosql1: {
    rec: ['Documentos guardam dados flexíveis parecidos com JSON', 'Redis guarda chave-valor na memória', 'Modele documentos pelo jeito que você vai ler', 'Postgres com jsonb resolve muitos casos', 'Um banco a menos é menos coisa para operar'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Num banco de documentos, cada registro pode ter campos diferentes.', a: true, w: 'Esquema flexível.' },
      { lv: 'b', q: 'Redis é rápido porque guarda dados:', o: ['Na memória', 'Em papel', 'Em fita', 'No e-mail'], a: 0, w: 'RAM.' },
      { lv: 'i', t: 'fill', q: 'Comando Redis que lê o valor de uma chave: ___ chave', ans: ['get'], w: 'GET.' },
      { lv: 'a', q: 'Tipo do Postgres para documentos com índice GIN:', o: ['jsonb', 'text', 'xml', 'bytea'], a: 0, w: 'jsonb.' }
    ]
  },
  nosql2: {
    rec: ['Cache guarda cópias rápidas do que é usado muito', 'Cache-aside: tenta o cache, senão busca e guarda', 'TTL faz o dado expirar', 'Invalidação é o desafio: atualize na escrita', 'Cache não é a fonte da verdade'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o padrão cache-aside:', items: ['Procurar no cache', 'Se não achar, buscar no banco', 'Guardar no cache com TTL', 'Responder'], w: 'Hit ou miss.' },
      { lv: 'b', t: 'tf', q: 'Dados em cache podem ficar desatualizados.', a: true, w: 'Por isso há TTL e invalidação.' },
      { lv: 'i', t: 'fill', q: 'Tempo de vida de uma chave em cache: ___', ans: ['ttl'], w: 'TTL.' },
      { lv: 'a', q: 'Para evitar stampede quando a chave popular expira:', o: ['Lock/recalcular por um só e TTL com jitter', 'Apagar o cache', 'Aumentar o banco', 'Desligar o cache'], a: 0, w: 'Evita manada.' }
    ]
  },
  nosql3: {
    rec: ['Filas processam tarefas demoradas em segundo plano', 'Workers pegam as tarefas e executam', 'Retentativas com backoff e fila de mortos', 'Consumidor precisa ser idempotente', 'SKIP LOCKED cria filas no Postgres'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Gerar 500 boletos é bom candidato para fila.', a: true, w: 'Responde rápido e processa em segundo plano.' },
      { lv: 'b', q: 'Quem executa as tarefas da fila?', o: ['Workers', 'O usuário', 'O DNS', 'O CSS'], a: 0, w: 'Trabalhadores.' },
      { lv: 'i', t: 'fill', q: 'Fila para mensagens que falharam muitas vezes: dead-letter ___', ans: ['queue'], w: 'DLQ.' },
      { lv: 'a', q: 'Padrão para publicar eventos sem perder consistência com o banco:', o: ['Outbox', 'Singleton', 'MVC', 'Cron'], a: 0, w: 'Grava o evento na mesma transação.' }
    ]
  },
  dados1: {
    rec: ['Analisar dados é responder perguntas com números', 'Média resume; mediana resiste a valores extremos', 'ETL: extrair, transformar, carregar', '80% do trabalho é limpar dados', 'Esquema estrela organiza dados para BI'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Valor do meio de uma lista ordenada: ___', ans: ['mediana'], w: 'Mediana.' },
      { lv: 'b', t: 'tf', q: 'Somar e contar já é análise de dados.', a: true, w: 'Começa simples.' },
      { lv: 'i', t: 'order', q: 'Ordene o pipeline de dados:', items: ['Extrair', 'Transformar', 'Carregar', 'Visualizar'], w: 'ETL + BI.' },
      { lv: 'a', q: 'No aging de inadimplência, a faixa “31-60” agrupa:', o: ['Parcelas com 31 a 60 dias de atraso', 'Clientes de 31 a 60 anos', 'Valores de 31 a 60 reais', 'Meses'], a: 0, w: 'Faixas de atraso.' }
    ]
  },
  dados2: {
    rec: ['Máquinas aprendem padrões a partir de exemplos', 'Supervisionado usa rótulos; não supervisionado acha grupos', 'Separe treino e teste', 'Overfitting é decorar o treino', 'Vazamento de dados engana a avaliação'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Um modelo deve ser avaliado em dados que não viu no treino.', a: true, w: 'Teste separado.' },
      { lv: 'b', q: 'Machine learning aprende com:', o: ['Exemplos', 'Sorte', 'Senhas', 'Cores'], a: 0, w: 'Dados.' },
      { lv: 'i', t: 'fill', q: 'Biblioteca Python clássica de machine learning: scikit-___', ans: ['learn'], w: 'scikit-learn.' },
      { lv: 'a', q: 'Classes desbalanceadas (5% de inadimplentes): métrica enganosa é:', o: ['Acurácia', 'Recall', 'F1', 'Precisão'], a: 0, w: 'Prever “todos pagam” dá 95%.' }
    ]
  },
  dados3: {
    rec: ['Redes neurais são camadas de neurônios artificiais', 'Treinar é ajustar pesos para errar menos', 'Gradiente descendente dá pequenos passos', 'CNN para imagens; Transformer para linguagem', 'PyTorch e GPUs aceleram o treino'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Arquitetura por trás dos LLMs: ___', ans: ['transformer', 'transformers'], w: 'Transformer.' },
      { lv: 'b', t: 'tf', q: 'Rede neural aprende ajustando números chamados pesos.', a: true, w: 'Pesos.' },
      { lv: 'i', q: 'Gradiente descendente:', o: ['Ajusta pesos na direção que reduz o erro', 'Aumenta o erro', 'Desenha gráficos', 'Compacta dados'], a: 0, w: 'Otimização.' },
      { lv: 'a', q: 'Hardware que mais acelera treino de redes neurais:', o: ['GPU', 'HD mecânico', 'Teclado', 'Roteador'], a: 0, w: 'Multiplicação de matrizes em paralelo.' }
    ]
  }
}, {
  bd: [
    { t: 'fill', q: 'Ligação de pedidos com clientes se faz com chave ___', ans: ['estrangeira', 'foreign key', 'fk'], w: 'Chave estrangeira.' },
    { q: 'O “A” de ACID significa:', o: ['Atomicidade', 'Autenticação', 'Agilidade', 'Arquivo'], a: 0, w: 'Tudo ou nada.' },
    { t: 'tf', q: 'Índices deixam inserções mais rápidas.', a: false, w: 'Aceleram leituras; escritas ficam mais lentas.' },
    { t: 'order', q: 'Ordene a regra 3-2-1 de backup:', items: ['3 cópias', '2 mídias diferentes', '1 fora do local'], w: '3-2-1.' },
    { q: 'Relacionamento alunos ↔ cursos é:', o: ['N:N', '1:1', '1:N', 'nenhum'], a: 0, w: 'Tabela de ligação.' }
  ],
  sql: [
    { t: 'fill', q: 'Cláusula que agrupa linhas: GROUP ___', ans: ['BY'], w: 'GROUP BY.' },
    { q: '`SELECT COUNT(*) FROM pedidos WHERE status = \'pago\'` retorna:', o: ['Quantidade de pedidos pagos', 'Soma dos valores', 'Lista de pedidos', 'Erro'], a: 0, w: 'Conta.' },
    { t: 'tf', q: 'LEFT JOIN pode trazer NULL nas colunas da tabela da direita.', a: true, w: 'Quando não há correspondência.' },
    { t: 'order', q: 'Ordene a execução lógica:', items: ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'], w: 'O SELECT vem depois do agrupamento.' },
    { q: 'Inserir um novo cliente:', o: ['INSERT INTO clientes (nome) VALUES (\'Ana\')', 'ADD clientes Ana', 'UPDATE clientes Ana', 'SELECT Ana'], a: 0, w: 'INSERT INTO.' },
    { q: 'Para somar o total acumulado por data:', o: ['SUM(...) OVER (ORDER BY data)', 'SUM(...) GROUP BY tudo', 'COUNT(*)', 'MAX(data)'], a: 0, w: 'Janela acumulada.' }
  ],
  nosql: [
    { q: 'Melhor uso do Redis:', o: ['Cache e sessões', 'Data warehouse', 'Planilha', 'Editor de texto'], a: 0, w: 'Memória.' },
    { t: 'tf', q: 'Entrega “pelo menos uma vez” exige consumidor idempotente.', a: true, w: 'Mensagens podem repetir.' },
    { t: 'fill', q: 'Banco de documentos mais conhecido: ___', ans: ['mongodb', 'mongo'], w: 'MongoDB.' },
    { q: 'Kafka é usado para:', o: ['Streams de eventos em alto volume', 'Planilhas', 'Imagens', 'DNS'], a: 0, w: 'Log distribuído.' },
    { t: 'order', q: 'Ordene a resposta a uma requisição com cache:', items: ['Checar cache', 'Buscar no banco se faltar', 'Salvar no cache', 'Responder'], w: 'Cache-aside.' }
  ],
  dados: [
    { q: 'Com um outlier enorme, o melhor resumo do típico é:', o: ['Mediana', 'Média', 'Soma', 'Máximo'], a: 0, w: 'Robusta.' },
    { t: 'tf', q: 'Correlação sempre prova causalidade.', a: false, w: 'Pode haver terceira causa.' },
    { t: 'fill', q: 'Biblioteca Python para tabelas de dados: ___', ans: ['pandas'], w: 'pandas.' },
    { t: 'order', q: 'Ordene o projeto de machine learning:', items: ['Definir a pergunta', 'Preparar os dados', 'Separar treino e teste', 'Treinar', 'Avaliar'], w: 'Pergunta antes do modelo.' },
    { q: 'Agrupar clientes parecidos sem rótulo é:', o: ['Não supervisionado', 'Supervisionado', 'Reforço', 'Regressão'], a: 0, w: 'Clustering.' }
  ]
});
