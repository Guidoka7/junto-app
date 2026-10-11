CC.tracks.push({
  id: 'bd', ord: 8, name: 'Banco de Dados', short: 'Banco', glyph: '◫', hue: 265,
  desc: 'Como os dados são organizados: tabelas, chaves, relacionamentos, modelagem, índices e transações.',
  test: [
    { d: 1, q: 'Um banco de dados serve para:', o: ['Guardar e organizar dados', 'Desenhar telas', 'Acessar a internet', 'Compilar código'], a: 0 },
    { d: 1, q: 'Numa tabela, cada linha costuma representar:', o: ['Uma coluna', 'Um registro (ex.: um cliente)', 'Um banco', 'Um servidor'], a: 1 },
    { d: 2, q: 'Chave primária (PK) é:', o: ['Senha do banco', 'Coluna que identifica cada linha de forma única', 'Primeira coluna sempre', 'Um índice de texto'], a: 1 },
    { d: 2, q: 'Uma chave estrangeira (FK) serve para:', o: ['Criptografar', 'Ligar uma tabela a outra', 'Acelerar backups', 'Guardar arquivos'], a: 1 },
    { d: 3, q: 'O “I” de ACID significa:', o: ['Index', 'Isolamento', 'Integridade', 'Imutável'], a: 1 },
    { d: 3, q: 'Um índice B-tree em `email` acelera principalmente:', o: ['WHERE email = ...', 'INSERTs em massa', 'Backups', 'ALTER TABLE'], a: 0 }
  ],
  lessons: [
    {
      id: 'bd1', title: 'O que é um banco de dados', min: { b: 12, i: 15, a: 18 },
      b: [
        ['an', '🗄️', 'Um armário super organizado', "Imagina um armário com gavetas. Cada gaveta guarda um tipo de coisa: uma de meias, outra de camisetas.\nNo banco de dados, cada gaveta é uma **tabela**: uma de clientes, outra de produtos, outra de pedidos."],
        ['tbl', 'A gaveta “clientes”', ['id', 'nome', 'cidade'], [['1', 'Ana', 'Brasília'], ['2', 'Bruno', 'Planaltina'], ['3', 'Carla', 'Goiânia']]],
        ['an', '📏', 'Linhas e colunas', "Cada **linha** é uma pessoa. Cada **coluna** é uma informação sobre ela (nome, cidade). Igual uma planilha!"],
        ['tip', "Por que não usar só planilha? Porque o banco aguenta milhões de linhas, muita gente mexendo ao mesmo tempo e não deixa você salvar bobagem."]
      ],
      i: [
        ['tbl', 'Famílias de bancos', ['Tipo', 'Exemplos', 'Bom para'], [['Relacional (SQL)', 'PostgreSQL, MySQL, SQLite, SQL Server', 'Dados estruturados e consistentes'], ['Documento', 'MongoDB, Firestore', 'JSON flexível'], ['Chave-valor', 'Redis, DynamoDB', 'Cache, sessões'], ['Colunar', 'BigQuery, ClickHouse', 'Análise de bilhões de linhas'], ['Vetorial', 'pgvector, Pinecone', 'Busca semântica com IA']]],
        ['t', 'SGBD', "O **SGBD** (sistema gerenciador) é o programa que guarda os dados, entende SQL, controla acesso, faz backup e garante consistência. **Supabase**, por exemplo, é um PostgreSQL hospedado com API, autenticação e storage em volta."],
        ['run', 'sql', `SELECT * FROM clientes;`, "Este app tem um banco SQLite de verdade rodando aqui dentro. Aperta Rodar!"]
      ],
      a: [
        ['t', 'Como o banco grava', "Postgres escreve primeiro no **WAL** (write-ahead log) e depois nas páginas de dados (8 KB). Isso garante durabilidade após crash e permite réplicas e backup contínuo (PITR). Atualizações criam novas versões da linha (MVCC); o **VACUUM** limpa as antigas."],
        ['t', 'OLTP x OLAP', "OLTP: muitas transações pequenas (sistema de cobrança). OLAP: consultas enormes de leitura (dashboard, BigQuery). Misturar os dois no mesmo banco derruba performance: replique para um data warehouse."]
      ],
      quiz: [
        { lv: '*', q: 'Cada gaveta do banco de dados relacional é uma:', o: ['Coluna', 'Tabela', 'Linha', 'Senha'], a: 1, w: 'Tabela.' },
        { lv: 'b', q: 'Numa tabela de clientes, cada linha é:', o: ['Um cliente', 'Um banco', 'Uma cor', 'Uma senha'], a: 0, w: 'Uma linha = um registro.' },
        { lv: 'i', q: 'Para cache de sessão muito rápido, o mais indicado é:', o: ['Redis', 'BigQuery', 'Excel', 'CSV'], a: 0, w: 'Chave-valor em memória.' },
        { lv: 'a', q: 'O WAL do Postgres garante principalmente:', o: ['Velocidade de leitura', 'Durabilidade e recuperação após falha', 'Compressão', 'Busca textual'], a: 1, w: 'Grava o log antes dos dados.' }
      ]
    },
    {
      id: 'bd2', title: 'Chaves e relacionamentos', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🪪', 'Cada um tem seu RG', "Pode ter duas Anas, mas cada uma tem um número de RG diferente. No banco, esse número único é a **chave primária** (o `id`)."],
        ['an', '🧵', 'Barbantes entre as gavetas', "O pedido número 5 foi de quem? Em vez de escrever o nome todo de novo, o pedido guarda só o **id do cliente**. É um barbante ligando as gavetas: a **chave estrangeira**."],
        ['tbl', 'Pedidos apontam para clientes', ['pedido', 'cliente_id', 'produto'], [['1', '1 (Ana)', 'Pão'], ['2', '1 (Ana)', 'Café'], ['3', '2 (Bruno)', 'Bolo']]]
      ],
      i: [
        ['tbl', 'Tipos de relacionamento', ['Tipo', 'Exemplo', 'Como modelar'], [['1:1', 'usuário ↔ perfil', 'FK única'], ['1:N', 'cliente → pedidos', 'FK no lado N (pedidos.cliente_id)'], ['N:N', 'alunos ↔ cursos', 'tabela de ligação matriculas(aluno_id, curso_id)']]],
        ['code', 'sql', `CREATE TABLE clientes (
  id      INTEGER PRIMARY KEY,
  nome    TEXT NOT NULL,
  email   TEXT UNIQUE,
  cidade  TEXT DEFAULT 'Brasília'
);
CREATE TABLE pedidos (
  id          INTEGER PRIMARY KEY,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
  valor       NUMERIC(10,2) CHECK (valor > 0),
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`, "Restrições (NOT NULL, UNIQUE, CHECK, REFERENCES) são o banco recusando dado errado por você."]
      ],
      a: [
        ['t', 'Chaves naturais x substitutas', "CPF parece ótima PK, até alguém digitar errado e você precisar alterar em 12 tabelas. Use chave **substituta** (`bigint identity` ou UUID) e mantenha a natural com `UNIQUE`. UUIDv7 é ordenável no tempo e se comporta melhor em índices que UUIDv4."],
        ['code', 'sql', `ALTER TABLE pedidos
  ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id)
  REFERENCES clientes(id)
  ON DELETE RESTRICT      -- não deixa apagar cliente com pedidos
  ON UPDATE CASCADE;`, "Defina o comportamento de exclusão de propósito: RESTRICT, CASCADE ou SET NULL. Em sistemas financeiros, prefira **soft delete** (`deletado_em`)."]
      ],
      quiz: [
        { lv: '*', q: 'A chave primária deve ser:', o: ['Repetida', 'Única para cada linha', 'Sempre texto', 'Opcional'], a: 1, w: 'Identifica a linha.' },
        { lv: 'b', q: 'O `cliente_id` dentro de pedidos é como:', o: ['Um barbante ligando ao cliente', 'Uma senha', 'O nome do produto', 'Uma cor'], a: 0, w: 'Chave estrangeira.' },
        { lv: 'i', q: 'Relacionamento N:N se modela com:', o: ['Uma coluna de lista', 'Tabela de ligação', 'Duas PKs na mesma coluna', 'JSON sempre'], a: 1, w: 'Tabela associativa.' },
        { lv: 'a', q: 'ON DELETE RESTRICT faz:', o: ['Apaga os filhos junto', 'Impede apagar o pai se houver filhos', 'Seta NULL', 'Nada'], a: 1, w: 'Restringe.' }
      ]
    },
    {
      id: 'bd3', title: 'Modelagem e normalização', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🧩', 'Não repetir é a regra de ouro', "Se o endereço da Ana estiver escrito em 50 pedidos e ela mudar de casa, você teria que trocar 50 vezes! Melhor guardar o endereço **uma vez só**, na ficha dela."],
        ['an', '✏️', 'Desenhar antes de construir', "Antes de criar as tabelas, a gente desenha caixinhas e flechas no papel. Esse desenho chama **modelo**."]
      ],
      i: [
        ['t', 'Formas normais na prática', "**1FN**: cada célula guarda um valor só (nada de “tel1, tel2” na mesma coluna). **2FN**: tudo depende da chave inteira. **3FN**: nada depende de outra coluna que não seja a chave (cidade → UF vai para outra tabela)."],
        ['tbl', 'Antes (planilha) → depois (tabelas)', ['Antes', 'Depois'], [['pedido: Ana, ana@x.com, Brasília, Pão, 0.75', 'clientes(id, nome, email, cidade)'], ['pedido: Ana, ana@x.com, Brasília, Café, 22.90', 'produtos(id, nome, preco)'], ['(dados repetidos em cada linha)', 'pedidos(id, cliente_id, produto_id, qtd)']]],
        ['tip', "Ferramentas para desenhar: dbdiagram.io, drawSQL, ou o próprio editor de tabelas do Supabase."]
      ],
      a: [
        ['t', 'Desnormalizar de propósito', "Normalize para escrever com segurança; desnormalize para ler rápido quando medir que precisa: colunas calculadas, views materializadas, tabelas de agregação. Em finanças, **congele** o preço no item do pedido (preço do produto muda, o histórico não)."],
        ['code', 'sql', `-- histórico imutável + estado atual
CREATE TABLE eventos_contrato (
  id bigint generated always as identity primary key,
  contrato_id bigint not null,
  tipo text not null,            -- criado, alterado, cancelado
  dados jsonb not null,
  ocorrido_em timestamptz not null default now()
);`, "Tabela de eventos (append-only) dá auditoria completa: quem mudou o quê e quando."]
      ],
      quiz: [
        { lv: '*', q: 'Por que evitar dados repetidos?', o: ['Para economizar teclado', 'Para não ficar inconsistente ao atualizar', 'Porque é proibido', 'Para ficar bonito'], a: 1, w: 'Atualizar em um lugar só.' },
        { lv: 'b', q: 'Antes de criar as tabelas, é bom:', o: ['Desenhar o modelo', 'Apagar tudo', 'Criar senha', 'Comprar servidor'], a: 0, w: 'Planejar.' },
        { lv: 'i', q: 'Coluna “telefones” com “6199..., 6198...” viola:', o: ['1FN', '3FN', 'ACID', 'Nada'], a: 0, w: 'Valor não atômico.' },
        { lv: 'a', q: 'Por que copiar o preço para o item do pedido?', o: ['Erro de modelagem', 'Preservar o valor histórico da venda', 'Para acelerar índices', 'Obrigatório no SQL'], a: 1, w: 'Preço do produto muda depois.' }
      ]
    },
    {
      id: 'bd4', title: 'Índices, transações e backup', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '📚', 'Índice é o sumário do livro', "Para achar um capítulo, você não lê o livro inteiro: olha o **sumário**. O índice do banco faz isso: acha a informação rapidinho."],
        ['an', '🤝', 'Tudo ou nada', "Quando você passa Pix: sai dinheiro de uma conta **e** entra na outra. Se faltar luz no meio, não pode sumir o dinheiro! Uma **transação** garante: ou faz tudo, ou não faz nada."],
        ['an', '💾', 'Cópia de segurança', "**Backup** é guardar uma cópia. Se algo quebrar, você recupera."]
      ],
      i: [
        ['code', 'sql', `CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_parcelas_venc ON parcelas(vencimento) WHERE status = 'aberto';

BEGIN;
UPDATE contas SET saldo = saldo - 500 WHERE id = 1;
UPDATE contas SET saldo = saldo + 500 WHERE id = 2;
COMMIT;   -- ou ROLLBACK se algo falhar`, "Índice parcial: só indexa parcelas em aberto (menor e mais rápido)."],
        ['list', 'ACID', ['**Atomicidade**: tudo ou nada', '**Consistência**: regras sempre respeitadas', '**Isolamento**: transações simultâneas não se atrapalham', '**Durabilidade**: confirmou, está gravado']],
        ['tip', "Índice acelera leitura mas deixa escrita mais lenta e ocupa espaço. Crie para colunas usadas em WHERE, JOIN e ORDER BY."]
      ],
      a: [
        ['code', 'sql', `EXPLAIN ANALYZE
SELECT * FROM pedidos WHERE cliente_id = 42 ORDER BY criado_em DESC LIMIT 20;
-- Seq Scan → ruim em tabela grande
-- Index Scan using idx_pedidos_cliente_data → bom
CREATE INDEX idx_pedidos_cliente_data ON pedidos(cliente_id, criado_em DESC);`, "Índice composto na ordem certa atende filtro + ordenação de uma vez."],
        ['tbl', 'Níveis de isolamento', ['Nível', 'Evita'], [['Read Committed (padrão PG)', 'leitura suja'], ['Repeatable Read', '+ leitura não repetível'], ['Serializable', '+ fantasmas / anomalias de escrita']]],
        ['t', 'Backup de verdade', "Regra 3-2-1: 3 cópias, 2 mídias, 1 fora do local. Backup que nunca foi restaurado não é backup: teste a restauração. Postgres: `pg_dump` lógico + PITR com WAL para voltar a qualquer segundo."]
      ],
      quiz: [
        { lv: '*', q: 'Índice serve para:', o: ['Apagar dados', 'Encontrar dados mais rápido', 'Criar tabelas', 'Fazer backup'], a: 1, w: 'Sumário.' },
        { lv: 'b', q: 'Transação garante que:', o: ['Faz tudo ou nada', 'Sempre falha', 'É mais lenta', 'Apaga backup'], a: 0, w: 'Atomicidade.' },
        { lv: 'i', q: 'Desvantagem de muitos índices:', o: ['Leitura lenta', 'Escritas mais lentas e mais espaço', 'Perde dados', 'Nenhuma'], a: 1, w: 'Cada INSERT atualiza todos.' },
        { lv: 'a', q: 'No EXPLAIN, “Seq Scan” numa tabela enorme com filtro seletivo indica:', o: ['Ótimo', 'Provável falta de índice adequado', 'Erro de sintaxe', 'Backup rodando'], a: 1, w: 'Leu tudo.' }
      ]
    }
  ]
});
