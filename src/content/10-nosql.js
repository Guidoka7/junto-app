CC.tracks.push({
  id: 'nosql', ord: 10, name: 'NoSQL, Cache & Filas', short: 'NoSQL', glyph: '{…}', hue: 95,
  desc: 'MongoDB, Redis, Firebase, filas de mensagens e quando escolher cada um.',
  test: [
    { d: 1, q: 'NoSQL significa, na prática:', o: ['Bancos que proíbem SQL', 'Bancos que não seguem o modelo de tabelas relacionais', 'Bancos sem dados', 'Bancos mais antigos'], a: 1 },
    { d: 1, q: 'MongoDB guarda dados como:', o: ['Tabelas', 'Documentos parecidos com JSON', 'Imagens', 'Planilhas'], a: 1 },
    { d: 2, q: 'Redis é muito usado para:', o: ['Cache e filas em memória', 'Edição de vídeo', 'Data warehouse', 'E-mail'], a: 0 },
    { d: 2, q: 'TTL numa chave de cache significa:', o: ['Tamanho', 'Tempo até expirar', 'Tipo', 'Senha'], a: 1 },
    { d: 3, q: 'Teorema CAP diz que, durante uma partição de rede, você escolhe entre:', o: ['Custo e performance', 'Consistência e disponibilidade', 'SQL e NoSQL', 'Leitura e escrita'], a: 1 },
    { d: 3, q: 'Uma fila de mensagens ajuda a:', o: ['Tornar tudo síncrono', 'Desacoplar serviços e processar tarefas em segundo plano', 'Substituir o banco', 'Criptografar'], a: 1 }
  ],
  lessons: [
    {
      id: 'nosql1', title: 'Documentos e chave-valor', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '📒', 'Um caderno de fichas soltas', "No banco de tabelas, toda ficha tem as mesmas colunas. No **MongoDB**, cada ficha é uma folha solta: uma pode ter telefone, outra pode ter três endereços. É mais flexível."],
        ['code', 'json', `{
  "nome": "Ana",
  "cidade": "Brasília",
  "pets": ["Rex", "Mimi"],
  "endereco": { "rua": "Q. 12", "cep": "73300-000" }
}`, "Isso é um **documento**. Parece o dicionário do Python, né?"],
        ['an', '🔑', 'Armário de chaves', "No **Redis**, você guarda coisas com uma etiqueta (chave) e pega pela etiqueta, super rápido, porque fica tudo na memória."]
      ],
      i: [
        ['code', 'js', `// MongoDB (driver Node)
await db.collection("clientes").insertOne({ nome: "Ana", cidade: "Brasília", tags: ["vip"] });
const vips = await db.collection("clientes")
  .find({ tags: "vip", cidade: "Brasília" })
  .sort({ nome: 1 }).limit(10).toArray();
await db.collection("clientes").updateOne({ nome: "Ana" }, { $set: { cidade: "Planaltina" } });`],
        ['code', 'bash', `SET sessao:abc123 "user=42" EX 3600   # expira em 1h
GET sessao:abc123
INCR acessos:2026-10-10
LPUSH fila:emails "boleto:991"
ZADD ranking 1500 "ana" 900 "bia"
ZREVRANGE ranking 0 2 WITHSCORES`, "Strings, contadores, listas (filas), sorted sets (rankings)."],
        ['tip', "Firebase Firestore e Supabase Realtime entregam mudanças ao vivo para o app, sem você escrever servidor."]
      ],
      a: [
        ['t', 'Modelar por padrão de acesso', "Em documento, você modela pelo jeito que vai **ler**: embute o que é lido junto (itens dentro do pedido), referencia o que cresce sem limite (comentários). Documento tem limite (16 MB no Mongo) e transações multi-documento custam caro."],
        ['t', 'Postgres faz muito disso', "Antes de adicionar um banco novo, lembre: Postgres tem `jsonb` com índice GIN, busca textual, `pgvector`, filas com `SKIP LOCKED` e LISTEN/NOTIFY. Um banco a menos é um backup, um monitoramento e uma conta a menos."]
      ],
      quiz: [
        { lv: '*', q: 'Documento no MongoDB parece com:', o: ['Planilha', 'JSON', 'Imagem', 'PDF'], a: 1, w: 'BSON, um JSON binário.' },
        { lv: 'b', q: 'Redis é rápido porque guarda os dados:', o: ['No papel', 'Na memória', 'No e-mail', 'Na impressora'], a: 1, w: 'Em RAM.' },
        { lv: 'i', q: '`SET chave valor EX 60` faz a chave:', o: ['Durar 60 dias', 'Expirar em 60 segundos', 'Ter 60 bytes', 'Repetir 60 vezes'], a: 1, w: 'EX em segundos.' },
        { lv: 'a', q: 'No modelo de documentos, o que normalmente se embute?', o: ['Dados que crescem sem limite', 'Dados lidos sempre junto com o pai e de tamanho limitado', 'Tudo', 'Nada'], a: 1, w: 'Itens do pedido, por exemplo.' }
      ]
    },
    {
      id: 'nosql2', title: 'Cache: memória curta e rápida', min: { b: 10, i: 16, a: 20 },
      b: [
        ['an', '🍪', 'O pote de biscoito na mesa', "Em vez de ir ao armário toda hora, você deixa alguns biscoitos num pote na mesa. Bem mais rápido! Mas de vez em quando precisa trocar, senão ficam velhos.\nIsso é **cache**."]
      ],
      i: [
        ['code', 'py', `import json, redis
r = redis.Redis()

def dashboard(mes):
    chave = f"dash:{mes}"
    if (em_cache := r.get(chave)):
        return json.loads(em_cache)          # cache hit
    dados = consulta_pesada_no_banco(mes)    # cache miss
    r.set(chave, json.dumps(dados), ex=300)  # guarda por 5 min
    return dados`, "Padrão **cache-aside**: tenta o cache, senão busca e guarda."],
        ['list', 'Onde há cache', ['Navegador (Cache-Control)', 'CDN (Cloudflare) na borda', 'Aplicação (Redis/memória)', 'Banco (buffer cache)']]
      ],
      a: [
        ['t', 'Os dois problemas difíceis', "Invalidação: atualize/apague a chave na escrita, ou use TTL curto + versão na chave (`dash:v3:2026-10`). **Stampede**: quando uma chave popular expira, mil requisições vão ao banco ao mesmo tempo; resolva com lock (só um recalcula), TTL com jitter ou stale-while-revalidate."],
        ['t', 'Cache não é fonte da verdade', "Tudo no cache precisa poder ser recriado. Defina política de memória (`maxmemory-policy allkeys-lru`) e monitore taxa de acerto (hit ratio)."]
      ],
      quiz: [
        { lv: '*', q: 'Cache serve para:', o: ['Guardar cópias rápidas de dados usados com frequência', 'Apagar dados', 'Criptografar', 'Fazer login'], a: 0, w: 'Pote na mesa.' },
        { lv: 'b', q: 'Por que trocar o que está no cache de vez em quando?', o: ['Para não ficar desatualizado', 'Porque pesa', 'Porque é proibido', 'Não precisa'], a: 0, w: 'Biscoito velho!' },
        { lv: 'i', q: 'No cache-aside, num cache miss você:', o: ['Retorna erro', 'Busca na fonte e grava no cache', 'Apaga o banco', 'Reinicia o servidor'], a: 1, w: 'Busca e popula.' },
        { lv: 'a', q: 'Cache stampede é:', o: ['Cache cheio', 'Muitas requisições recalculando a mesma chave expirada ao mesmo tempo', 'Chave duplicada', 'Erro de rede'], a: 1, w: 'Manada no banco.' }
      ]
    },
    {
      id: 'nosql3', title: 'Filas e mensageria', min: { b: 10, i: 16, a: 22 },
      b: [
        ['an', '🎟️', 'A fila do pão', "Quando chega muita gente, não dá para atender todo mundo de uma vez. Cada um pega uma senha e espera a vez. Os atendentes vão chamando.\nNo computador, tarefas demoradas (mandar 1.000 e-mails) vão para uma **fila**, e “trabalhadores” vão fazendo uma por uma."]
      ],
      i: [
        ['flow', 'Envio de boletos sem travar o sistema', ['Usuário clica “gerar boletos”', 'API coloca 500 tarefas na fila e responde na hora', 'Workers pegam tarefas em paralelo', 'Cada boleto é gerado e enviado', 'Falhas voltam para a fila com nova tentativa']],
        ['tbl', 'Ferramentas', ['Ferramenta', 'Uso típico'], [['Redis + BullMQ / RQ / Celery', 'Jobs de aplicação'], ['RabbitMQ', 'Mensageria com roteamento'], ['Kafka', 'Streams de eventos em altíssimo volume'], ['AWS SQS / Google Pub/Sub', 'Filas gerenciadas na nuvem'], ['Supabase Queues (pgmq)', 'Fila dentro do Postgres']]]
      ],
      a: [
        ['list', 'Garantias e cuidados', ['Entrega **pelo menos uma vez**: o consumidor precisa ser **idempotente**', 'Retentativa com backoff exponencial e dead-letter queue', 'Ordenação só é garantida por partição/chave', 'Padrão **outbox**: grave o evento na mesma transação do dado e publique depois']],
        ['code', 'sql', `-- fila simples no Postgres
SELECT id, payload FROM jobs
WHERE status = 'pendente'
ORDER BY id
FOR UPDATE SKIP LOCKED
LIMIT 10;`, "`SKIP LOCKED` permite vários workers sem pegar o mesmo job."]
      ],
      quiz: [
        { lv: '*', q: 'Uma fila de tarefas serve para:', o: ['Fazer trabalho demorado em segundo plano', 'Guardar senhas', 'Desenhar telas', 'Hospedar sites'], a: 0, w: 'Background jobs.' },
        { lv: 'b', q: 'Quem pega as tarefas da fila e executa?', o: ['O usuário', 'Os trabalhadores (workers)', 'O DNS', 'O navegador'], a: 1, w: 'Workers.' },
        { lv: 'i', q: 'Para eventos em altíssimo volume com reprocessamento, o mais comum é:', o: ['Kafka', 'Excel', 'FTP', 'SQLite'], a: 0, w: 'Log de eventos distribuído.' },
        { lv: 'a', q: 'Entrega “at-least-once” exige que o consumidor seja:', o: ['Rápido', 'Idempotente', 'Síncrono', 'Escrito em Java'], a: 1, w: 'A mesma mensagem pode chegar duas vezes.' }
      ]
    }
  ]
});
