CC.tracks.push({
  id: 'sql', ord: 9, name: 'SQL', short: 'SQL', glyph: 'SQL', hue: 175,
  desc: 'A língua dos bancos de dados. Pratique num banco real de uma padaria: clientes, produtos e pedidos.',
  test: [
    { d: 1, q: 'Qual comando busca dados?', o: ['GET', 'SELECT', 'FIND', 'SHOW ME'], a: 1 },
    { d: 1, q: '`SELECT nome FROM clientes` retorna:', o: ['Todas as colunas', 'Só a coluna nome de todos os clientes', 'Só o primeiro cliente', 'Erro'], a: 1 },
    { d: 2, q: 'Para filtrar linhas usamos:', o: ['ORDER BY', 'WHERE', 'GROUP BY', 'LIMIT'], a: 1 },
    { d: 2, q: 'COUNT(*) com GROUP BY cidade retorna:', o: ['Total geral', 'Quantidade por cidade', 'As cidades sem repetir', 'Erro'], a: 1 },
    { d: 3, q: 'LEFT JOIN clientes→pedidos inclui:', o: ['Só clientes com pedidos', 'Todos os clientes, mesmo sem pedidos', 'Só pedidos sem cliente', 'Produto cartesiano'], a: 1 },
    { d: 3, q: 'Para ranking por grupo sem colapsar linhas, usamos:', o: ['GROUP BY', 'Funções de janela (OVER/PARTITION BY)', 'DISTINCT', 'HAVING'], a: 1 }
  ],
  lessons: [
    {
      id: 'sql1', title: 'SELECT: pedindo dados', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🗣️', 'SQL é pedir com educação', "SQL é a língua para conversar com o banco de dados. Você pede assim:\n**SELECIONE** o nome **DA** gaveta clientes.\nEm inglês: `SELECT nome FROM clientes`."],
        ['run', 'sql', `SELECT nome FROM clientes;`, "Aperta Rodar. O banco te devolve uma tabelinha com os nomes."],
        ['run', 'sql', `SELECT nome, cidade FROM clientes;`, "Quer mais de uma coluna? Separa com vírgula."],
        ['run', 'sql', `SELECT * FROM produtos;`, "O `*` quer dizer **tudo**: todas as colunas."]
      ],
      i: [
        ['tbl', 'Nosso banco de prática', ['Tabela', 'Colunas'], [['clientes', 'id, nome, cidade, idade, email'], ['produtos', 'id, nome, categoria, preco'], ['pedidos', 'id, cliente_id, produto_id, quantidade, data, status']]],
        ['run', 'sql', `SELECT nome AS produto,
       preco,
       ROUND(preco * 1.1, 2) AS preco_com_aumento
FROM produtos;`, "`AS` dá apelido; dá para calcular colunas na hora."],
        ['run', 'sql', `SELECT DISTINCT cidade FROM clientes;`, "`DISTINCT` remove repetidos."]
      ],
      a: [
        ['t', 'Ordem lógica de execução', "Você escreve SELECT primeiro, mas o banco processa: **FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT**. Por isso um apelido do SELECT não pode ser usado no WHERE (na maioria dos bancos), mas pode no ORDER BY."],
        ['run', 'sql', `SELECT nome,
       CASE
         WHEN preco < 5 THEN 'barato'
         WHEN preco < 20 THEN 'médio'
         ELSE 'caro'
       END AS faixa,
       COALESCE(NULL, 'sem valor') AS exemplo_coalesce
FROM produtos;`, "CASE é o if/else do SQL; COALESCE devolve o primeiro valor não nulo."],
        ['tip', "Em produção evite `SELECT *`: traga só as colunas necessárias (menos I/O, e mudanças no schema não quebram o app)."]
      ],
      quiz: [
        { lv: '*', q: '`SELECT * FROM produtos` traz:', o: ['Só o nome', 'Todas as colunas de produtos', 'Só um produto', 'Nada'], a: 1, w: '* = todas as colunas.' },
        { lv: 'b', q: 'Depois do FROM vem:', o: ['O nome da tabela', 'A coluna', 'Um número', 'A senha'], a: 0, w: 'FROM tabela.' },
        { lv: 'i', q: 'Para listar as categorias sem repetir:', o: ['SELECT UNIQUE categoria', 'SELECT DISTINCT categoria FROM produtos', 'SELECT categoria ONCE', 'GROUP categoria'], a: 1, w: 'DISTINCT.' },
        { lv: 'a', q: 'Qual cláusula é processada antes do SELECT?', o: ['ORDER BY', 'LIMIT', 'WHERE', 'DISTINCT'], a: 2, w: 'FROM → WHERE → ... → SELECT.' }
      ],
      lab: { lang: 'sql', task: 'Liste o `nome` e o `preco` de todos os produtos.', start: '-- escreva sua consulta\n', check: { q: 'SELECT nome, preco FROM produtos' }, hint: 'SELECT coluna1, coluna2 FROM tabela', sol: 'SELECT nome, preco FROM produtos;' }
    },
    {
      id: 'sql2', title: 'WHERE: filtrando', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🔍', 'Peneira de areia', "O `WHERE` é uma peneira: só passa o que você quer.\n“Me dá os clientes **onde** a cidade é Brasília.”"],
        ['run', 'sql', `SELECT nome, cidade
FROM clientes
WHERE cidade = 'Brasília';`, "Texto vai entre aspas simples `' '`."],
        ['run', 'sql', `SELECT nome, preco
FROM produtos
WHERE preco < 10;`, "Números vão sem aspas. `<` é menor que."]
      ],
      i: [
        ['run', 'sql', `SELECT nome, idade, cidade
FROM clientes
WHERE (cidade = 'Brasília' OR cidade = 'Planaltina')
  AND idade BETWEEN 20 AND 40;`, "Use parênteses quando misturar AND e OR."],
        ['run', 'sql', `SELECT nome FROM clientes WHERE cidade IN ('Goiânia', 'São Paulo');
SELECT nome FROM clientes WHERE nome LIKE 'B%';
SELECT nome FROM clientes WHERE email IS NULL;`, "IN (lista), LIKE com `%` (qualquer coisa), e `IS NULL` — nunca `= NULL`. O app mostra o resultado da última consulta."],
        ['tip', "NULL significa “não sei”. `NULL = NULL` não é verdadeiro, é desconhecido. Por isso existe `IS NULL`."]
      ],
      a: [
        ['run', 'sql', `SELECT id, data, status
FROM pedidos
WHERE data >= '2026-09-15' AND data < '2026-10-01'
  AND status <> 'cancelado';`, "Intervalo semiaberto (`>=` início, `<` fim) é o jeito certo para datas: não perde o último dia com horário."],
        ['t', 'Filtros e índices (sargability)', "`WHERE date(data) = '2026-09-10'` ou `WHERE UPPER(nome) = 'ANA'` impedem o uso do índice da coluna. Prefira comparar a coluna crua com um intervalo, ou crie índice de expressão. `LIKE '%ana'` (curinga no começo) também não usa B-tree: use busca textual (`tsvector`, trigramas)."]
      ],
      quiz: [
        { lv: '*', q: 'Qual consulta traz produtos com preço maior que 20?', o: ['SELECT * FROM produtos IF preco > 20', 'SELECT * FROM produtos WHERE preco > 20', 'SELECT preco > 20', 'WHERE produtos > 20'], a: 1, w: 'WHERE coluna > valor.' },
        { lv: 'b', q: 'Texto no SQL fica entre:', o: ['Aspas simples', 'Parênteses', 'Colchetes', 'Nada'], a: 0, w: "'Brasília'." },
        { lv: 'i', q: 'Para achar clientes sem e-mail:', o: ['email = NULL', 'email IS NULL', 'email = ""', 'NOT email'], a: 1, w: 'IS NULL.' },
        { lv: 'a', q: 'Qual filtro aproveita índice em `nome`?', o: ["UPPER(nome) = 'ANA'", "nome LIKE '%na'", "nome = 'Ana Souza'", "LENGTH(nome) = 9"], a: 2, w: 'Comparação direta na coluna.' }
      ],
      lab: { lang: 'sql', task: 'Liste o `nome` e a `idade` dos clientes de **Planaltina**.', start: 'SELECT \nFROM clientes\nWHERE ', check: { q: "SELECT nome, idade FROM clientes WHERE cidade = 'Planaltina'" }, hint: "WHERE cidade = 'Planaltina'", sol: "SELECT nome, idade\nFROM clientes\nWHERE cidade = 'Planaltina';" }
    },
    {
      id: 'sql3', title: 'Ordenar, limitar e agrupar', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '📏', 'Fila por tamanho', "`ORDER BY` coloca em fila: do menor para o maior, ou do maior para o menor (`DESC`)."],
        ['run', 'sql', `SELECT nome, preco
FROM produtos
ORDER BY preco DESC
LIMIT 3;`, "Os 3 produtos mais caros. `LIMIT` corta a fila."],
        ['an', '🧮', 'Contar e somar', "`COUNT` conta, `SUM` soma, `AVG` faz a média, `MAX` acha o maior, `MIN` o menor."],
        ['run', 'sql', `SELECT COUNT(*) AS total_clientes FROM clientes;`]
      ],
      i: [
        ['run', 'sql', `SELECT cidade,
       COUNT(*) AS clientes,
       ROUND(AVG(idade), 1) AS idade_media
FROM clientes
GROUP BY cidade
ORDER BY clientes DESC;`, "`GROUP BY` junta as linhas por cidade e calcula para cada grupo."],
        ['run', 'sql', `SELECT status, COUNT(*) AS qtd, SUM(quantidade) AS itens
FROM pedidos
GROUP BY status
HAVING COUNT(*) >= 2;`, "`WHERE` filtra linhas antes de agrupar; `HAVING` filtra os grupos depois."]
      ],
      a: [
        ['run', 'sql', `SELECT strftime('%Y-%m', data) AS mes,
       COUNT(*) AS pedidos,
       SUM(CASE WHEN status = 'pago' THEN 1 ELSE 0 END) AS pagos,
       ROUND(100.0 * SUM(status = 'pago') / COUNT(*), 1) AS pct_pago
FROM pedidos
GROUP BY mes
ORDER BY mes;`, "Agregação condicional: várias métricas em uma passada. No Postgres: `COUNT(*) FILTER (WHERE status='pago')` e `date_trunc('month', data)`."],
        ['t', 'Paginação', "`LIMIT 20 OFFSET 10000` lê e descarta 10 mil linhas. Para listas longas use **keyset pagination**: `WHERE (data, id) < (:ultima_data, :ultimo_id) ORDER BY data DESC, id DESC LIMIT 20`."]
      ],
      quiz: [
        { lv: '*', q: 'Para ordenar do maior para o menor:', o: ['ORDER BY x ASC', 'ORDER BY x DESC', 'SORT x', 'GROUP BY x'], a: 1, w: 'DESC = descendente.' },
        { lv: 'b', q: '`COUNT(*)` faz:', o: ['Soma valores', 'Conta linhas', 'Apaga linhas', 'Ordena'], a: 1, w: 'Conta.' },
        { lv: 'i', q: 'Filtrar grupos com total > 10 usa:', o: ['WHERE', 'HAVING', 'LIMIT', 'ORDER BY'], a: 1, w: 'HAVING atua após o GROUP BY.' },
        { lv: 'a', q: 'Problema do OFFSET alto:', o: ['Ordem errada', 'O banco precisa ler e descartar todas as linhas puladas', 'Duplica linhas', 'Não funciona com índice nunca'], a: 1, w: 'Custo cresce com o offset.' }
      ],
      lab: { lang: 'sql', task: 'Mostre cada `categoria` de produto e quantos produtos ela tem (coluna `qtd`), ordenado por `qtd` do maior para o menor.', start: 'SELECT categoria, \nFROM produtos\n', check: { q: 'SELECT categoria, COUNT(*) AS qtd FROM produtos GROUP BY categoria ORDER BY qtd DESC', ordered: false }, hint: 'COUNT(*) AS qtd ... GROUP BY categoria ORDER BY qtd DESC', sol: 'SELECT categoria, COUNT(*) AS qtd\nFROM produtos\nGROUP BY categoria\nORDER BY qtd DESC;' }
    },
    {
      id: 'sql4', title: 'JOIN: juntando tabelas', min: { b: 18, i: 22, a: 25 },
      b: [
        ['an', '🧩', 'Encaixar peças', "O pedido sabe só o **número** do cliente. Para ver o **nome**, a gente encaixa a gaveta de pedidos com a de clientes, onde os números batem. Isso é o `JOIN`."],
        ['run', 'sql', `SELECT pedidos.id, clientes.nome
FROM pedidos
JOIN clientes ON clientes.id = pedidos.cliente_id;`, "“Junta pedidos com clientes onde o id do cliente é igual ao cliente_id do pedido.”"]
      ],
      i: [
        ['run', 'sql', `SELECT pe.id, c.nome AS cliente, pr.nome AS produto,
       pe.quantidade, ROUND(pe.quantidade * pr.preco, 2) AS total
FROM pedidos pe
JOIN clientes c  ON c.id  = pe.cliente_id
JOIN produtos pr ON pr.id = pe.produto_id
WHERE pe.status = 'pago'
ORDER BY total DESC;`, "Apelidos curtos (pe, c, pr) deixam a consulta legível."],
        ['run', 'sql', `SELECT c.nome, COUNT(pe.id) AS pedidos
FROM clientes c
LEFT JOIN pedidos pe ON pe.cliente_id = c.id
GROUP BY c.id, c.nome
ORDER BY pedidos;`, "`LEFT JOIN` mantém todos os clientes, até quem nunca comprou (a Íris aparece com 0)."],
        ['tbl', 'Tipos de JOIN', ['JOIN', 'Traz'], [['INNER JOIN', 'só o que casa nos dois lados'], ['LEFT JOIN', 'tudo da esquerda + o que casar'], ['RIGHT JOIN', 'tudo da direita + o que casar'], ['FULL JOIN', 'tudo dos dois lados']]]
      ],
      a: [
        ['run', 'sql', `-- clientes que nunca compraram: anti-join
SELECT c.nome
FROM clientes c
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id);`, "`NOT EXISTS` é seguro com NULLs (ao contrário de `NOT IN` com subconsulta que retorna NULL)."],
        ['t', 'Armadilha da multiplicação', "Juntar pedidos **e** pagamentos ao cliente na mesma consulta multiplica linhas (cada pedido × cada pagamento) e infla somas. Agregue cada lado numa subconsulta/CTE antes de juntar."],
        ['t', 'Como o banco junta', "Nested loop (pequeno × indexado), hash join (grandes sem índice, igualdade) e merge join (entradas ordenadas). O planner escolhe pelas estatísticas: `ANALYZE` desatualizado gera planos ruins."]
      ],
      quiz: [
        { lv: '*', q: 'JOIN serve para:', o: ['Apagar tabelas', 'Combinar linhas de tabelas relacionadas', 'Ordenar', 'Criar índice'], a: 1, w: 'Encaixar peças.' },
        { lv: 'b', q: 'O `ON` no JOIN diz:', o: ['Quando ligar o banco', 'Quais colunas precisam bater', 'O nome da tabela', 'A ordem'], a: 1, w: 'Condição de junção.' },
        { lv: 'i', q: 'Para listar todos os clientes, inclusive sem pedidos:', o: ['INNER JOIN', 'LEFT JOIN a partir de clientes', 'CROSS JOIN', 'UNION'], a: 1, w: 'LEFT preserva o lado esquerdo.' },
        { lv: 'a', q: '`NOT IN (subconsulta)` falha quando a subconsulta retorna:', o: ['Zero linhas', 'Algum NULL', 'Muitas linhas', 'Texto'], a: 1, w: 'Com NULL o resultado vira desconhecido e nada passa.' }
      ],
      lab: { lang: 'sql', task: 'Liste o `nome` do cliente e o `nome` do produto (apelide como `produto`) de cada pedido com status `aberto`.', start: 'SELECT c.nome, pr.nome AS produto\nFROM pedidos pe\n', check: { q: "SELECT c.nome, pr.nome AS produto FROM pedidos pe JOIN clientes c ON c.id = pe.cliente_id JOIN produtos pr ON pr.id = pe.produto_id WHERE pe.status = 'aberto'" }, hint: 'Dois JOINs: um com clientes, outro com produtos. Depois WHERE pe.status = \'aberto\'', sol: "SELECT c.nome, pr.nome AS produto\nFROM pedidos pe\nJOIN clientes c ON c.id = pe.cliente_id\nJOIN produtos pr ON pr.id = pe.produto_id\nWHERE pe.status = 'aberto';" }
    },
    {
      id: 'sql5', title: 'INSERT, UPDATE e DELETE', min: { b: 15, i: 18, a: 22 },
      b: [
        ['an', '✍️', 'Escrever no caderno', "Até agora só **lemos**. Agora vamos **escrever**: colocar coisa nova (`INSERT`), mudar (`UPDATE`) e apagar (`DELETE`)."],
        ['run', 'sql', `INSERT INTO clientes (nome, cidade, idade)
VALUES ('Joana', 'Brasília', 8);
SELECT * FROM clientes WHERE nome = 'Joana';`, "Cada Rodar começa com o banco novinho: pode testar à vontade!"],
        ['run', 'sql', `UPDATE produtos SET preco = 1.00 WHERE nome = 'Pão francês';
SELECT nome, preco FROM produtos;`, "Sempre com `WHERE`! Sem ele, **todos** os produtos iam custar 1 real."]
      ],
      i: [
        ['run', 'sql', `UPDATE pedidos
SET status = 'cancelado'
WHERE status = 'aberto' AND data < '2026-09-20';
SELECT id, data, status FROM pedidos ORDER BY id;`],
        ['run', 'sql', `DELETE FROM pedidos WHERE status = 'cancelado';
SELECT COUNT(*) AS restantes FROM pedidos;`, "Dica de ouro: rode o `SELECT` com o mesmo WHERE antes de rodar o UPDATE/DELETE."],
        ['code', 'sql', `CREATE TABLE contatos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, tel TEXT);
ALTER TABLE contatos ADD COLUMN email TEXT;
DROP TABLE contatos;`, "DDL: criar e alterar a estrutura. `DROP` apaga a tabela inteira."]
      ],
      a: [
        ['code', 'sql', `INSERT INTO produtos (id, nome, categoria, preco)
VALUES (3, 'Café 500g', 'mercearia', 24.50)
ON CONFLICT (id) DO UPDATE SET preco = excluded.preco;

UPDATE parcelas SET status = 'pago'
WHERE id = 991 AND status = 'aberto'
RETURNING id, status;`, "Upsert com ON CONFLICT e RETURNING (Postgres/SQLite). O `AND status='aberto'` evita pagar duas vezes (idempotência)."],
        ['t', 'Migrações seguras em produção', "Adicionar coluna NOT NULL com default em tabela gigante pode travar escrita. Faça em etapas: adiciona nullable → backfill em lotes → constraint `NOT VALID` → `VALIDATE`. Toda mudança de schema versionada em arquivos de migração (Supabase CLI, Alembic, Prisma)."]
      ],
      quiz: [
        { lv: '*', q: 'Qual comando adiciona uma linha nova?', o: ['UPDATE', 'INSERT', 'SELECT', 'ADD'], a: 1, w: 'INSERT INTO.' },
        { lv: 'b', q: 'UPDATE sem WHERE:', o: ['Não faz nada', 'Muda todas as linhas', 'Dá erro sempre', 'Muda só a primeira'], a: 1, w: 'Perigo!' },
        { lv: 'i', q: 'Antes de um DELETE importante, o ideal é:', o: ['Rodar o SELECT com o mesmo WHERE', 'Desligar o banco', 'Criar índice', 'Nada'], a: 0, w: 'Confira o que vai apagar.' },
        { lv: 'a', q: '`RETURNING` serve para:', o: ['Desfazer', 'Devolver as linhas afetadas pelo comando', 'Repetir a query', 'Criar backup'], a: 1, w: 'Evita um SELECT extra.' }
      ],
      lab: { lang: 'sql', task: 'Aumente em 10% o preço de todos os produtos da categoria `bebidas`.', start: 'UPDATE produtos\n', check: { verify: 'SELECT id, ROUND(preco, 2) FROM produtos ORDER BY id' }, hint: "SET preco = preco * 1.1 WHERE categoria = 'bebidas'", sol: "UPDATE produtos\nSET preco = preco * 1.1\nWHERE categoria = 'bebidas';" }
    },
    {
      id: 'sql6', title: 'Subconsultas, CTEs e janelas', min: { b: 15, i: 22, a: 28 },
      b: [
        ['an', '🪆', 'Pergunta dentro de pergunta', "Como bonecas russas: uma pergunta dentro da outra.\n“Quais produtos custam **mais que a média**?” Primeiro descobre a média, depois compara."],
        ['run', 'sql', `SELECT nome, preco
FROM produtos
WHERE preco > (SELECT AVG(preco) FROM produtos);`, "A parte entre parênteses roda primeiro."]
      ],
      i: [
        ['run', 'sql', `WITH gasto AS (
  SELECT pe.cliente_id, SUM(pe.quantidade * pr.preco) AS total
  FROM pedidos pe
  JOIN produtos pr ON pr.id = pe.produto_id
  WHERE pe.status = 'pago'
  GROUP BY pe.cliente_id
)
SELECT c.nome, ROUND(g.total, 2) AS total
FROM gasto g
JOIN clientes c ON c.id = g.cliente_id
ORDER BY total DESC;`, "`WITH` (CTE) dá nome a um passo intermediário: SQL legível de cima para baixo."],
        ['run', 'sql', `CREATE VIEW vw_pedidos AS
SELECT pe.id, c.nome AS cliente, pr.nome AS produto, pe.quantidade * pr.preco AS total, pe.status
FROM pedidos pe JOIN clientes c ON c.id = pe.cliente_id JOIN produtos pr ON pr.id = pe.produto_id;
SELECT * FROM vw_pedidos WHERE total > 30;`, "View é uma consulta salva com nome, usada como tabela."]
      ],
      a: [
        ['run', 'sql', `SELECT c.cidade, c.nome,
       SUM(pe.quantidade * pr.preco) AS total,
       RANK() OVER (PARTITION BY c.cidade ORDER BY SUM(pe.quantidade * pr.preco) DESC) AS posicao
FROM pedidos pe
JOIN clientes c ON c.id = pe.cliente_id
JOIN produtos pr ON pr.id = pe.produto_id
GROUP BY c.cidade, c.nome
ORDER BY c.cidade, posicao;`, "Funções de janela calculam sobre um grupo **sem** colapsar as linhas: ranking por cidade."],
        ['run', 'sql', `SELECT data,
       SUM(quantidade) AS itens,
       SUM(SUM(quantidade)) OVER (ORDER BY data) AS acumulado,
       LAG(SUM(quantidade)) OVER (ORDER BY data) AS dia_anterior
FROM pedidos
GROUP BY data
ORDER BY data;`, "Total acumulado e comparação com a linha anterior (LAG/LEAD)."],
        ['code', 'sql', `WITH RECURSIVE hierarquia AS (
  SELECT id, nome, gestor_id, 1 AS nivel FROM funcionarios WHERE gestor_id IS NULL
  UNION ALL
  SELECT f.id, f.nome, f.gestor_id, h.nivel + 1
  FROM funcionarios f JOIN hierarquia h ON f.gestor_id = h.id
)
SELECT * FROM hierarquia;`, "CTE recursiva percorre árvores (organogramas, categorias)."]
      ],
      quiz: [
        { lv: '*', q: 'Uma subconsulta é:', o: ['Um SELECT dentro de outro', 'Um erro', 'Uma tabela temporária física', 'Um índice'], a: 0, w: 'Pergunta dentro de pergunta.' },
        { lv: 'b', q: 'Na consulta com `(SELECT AVG(preco) ...)`, o que roda primeiro?', o: ['A de fora', 'A de dentro (média)', 'Ao mesmo tempo', 'Nenhuma'], a: 1, w: 'Primeiro a média.' },
        { lv: 'i', q: 'CTE (`WITH`) serve principalmente para:', o: ['Deixar a consulta organizada em etapas nomeadas', 'Criar usuário', 'Fazer backup', 'Apagar dados'], a: 0, w: 'Legibilidade e reuso.' },
        { lv: 'a', q: 'Diferença entre GROUP BY e janela:', o: ['Nenhuma', 'Janela calcula por grupo sem reduzir o número de linhas', 'Janela é mais lenta sempre', 'GROUP BY não ordena'], a: 1, w: 'OVER preserva linhas.' }
      ],
      lab: { lang: 'sql', task: 'Liste `nome` e `preco` dos produtos que custam **mais que a média** de preços, do mais caro para o mais barato.', start: 'SELECT nome, preco\nFROM produtos\n', check: { q: 'SELECT nome, preco FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC', ordered: true }, hint: 'WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC', sol: 'SELECT nome, preco\nFROM produtos\nWHERE preco > (SELECT AVG(preco) FROM produtos)\nORDER BY preco DESC;' }
    }
  ]
});
