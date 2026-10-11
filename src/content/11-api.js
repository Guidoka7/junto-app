CC.tracks.push({
  id: 'api', ord: 11, name: 'APIs & Backend', short: 'Backend', glyph: '⇄', hue: 290,
  desc: 'HTTP, REST, JSON, autenticação, webhooks e como montar o servidor que fica por trás dos apps.',
  test: [
    { d: 1, q: 'Uma API é:', o: ['Um tipo de tela', 'Um jeito de um programa conversar com outro', 'Um banco de dados', 'Um vírus'], a: 1 },
    { d: 1, q: 'JSON é:', o: ['Um formato de texto para trocar dados', 'Uma linguagem de banco', 'Um servidor', 'Uma senha'], a: 0 },
    { d: 2, q: 'Qual método HTTP cria um recurso?', o: ['GET', 'POST', 'DELETE', 'HEAD'], a: 1 },
    { d: 2, q: 'Status 401 significa:', o: ['Não encontrado', 'Não autenticado', 'Erro do servidor', 'Criado'], a: 1 },
    { d: 3, q: 'Um método idempotente é aquele que:', o: ['Nunca falha', 'Repetido várias vezes tem o mesmo efeito que uma vez', 'É mais rápido', 'Não tem corpo'], a: 1 },
    { d: 3, q: 'Onde é mais seguro guardar um token de sessão num app web?', o: ['localStorage', 'Cookie HttpOnly, Secure, SameSite', 'Na URL', 'No HTML'], a: 1 }
  ],
  lessons: [
    {
      id: 'api1', title: 'O que é uma API', min: { b: 12, i: 16, a: 20 },
      b: [
        ['an', '🧑‍🍳', 'O garçom do restaurante', "Você não entra na cozinha. Você fala com o **garçom**, ele leva o pedido para a cozinha e traz a comida.\nA **API** é o garçom: o app pede, a API leva para o sistema e traz a resposta."],
        ['an', '✉️', 'JSON é o bilhetinho', "O pedido e a resposta vão escritos num bilhetinho organizado chamado **JSON**: `{\"lanche\": \"pizza\", \"quantidade\": 2}`."],
        ['run', 'js', `const bilhete = '{"lanche": "pizza", "quantidade": 2}';
const pedido = JSON.parse(bilhete);
console.log("Pediram", pedido.quantidade, pedido.lanche);
console.log(JSON.stringify({ status: "a caminho 🛵" }));`, "`JSON.parse` lê o bilhete; `JSON.stringify` escreve um."]
      ],
      i: [
        ['tbl', 'REST: recursos + verbos', ['Método', 'Rota', 'Faz'], [['GET', '/clientes', 'lista'], ['GET', '/clientes/42', 'um cliente'], ['POST', '/clientes', 'cria'], ['PUT/PATCH', '/clientes/42', 'substitui/atualiza parte'], ['DELETE', '/clientes/42', 'remove']]],
        ['code', 'bash', `curl -X POST https://api.exemplo.com/v1/clientes \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Ana","cidade":"Brasília"}'`, "Teste APIs com curl, Postman, Insomnia ou Bruno."],
        ['list', 'Boas práticas', ['Substantivos no plural nas rotas', 'Paginação: `?page=2&limit=50` ou cursor', 'Versão na URL ou header (`/v1`)', 'Erros com corpo claro: `{\"erro\": \"email já cadastrado\"}`', 'Status certo: 201 ao criar, 422 para validação']]
      ],
      a: [
        ['t', 'Além do REST', "**GraphQL**: o cliente escolhe os campos (bom para telas variadas, cuidado com N+1 e custo de query). **gRPC**: binário com Protobuf, rápido entre serviços. **WebSocket/SSE**: tempo real. **tRPC**: tipos compartilhados em TypeScript."],
        ['t', 'Idempotência e concorrência', "GET, PUT e DELETE são idempotentes; POST não. Para pagamentos, aceite um header `Idempotency-Key` e guarde a resposta da primeira execução. Para evitar sobrescrita, use ETag + `If-Match` (controle otimista)."]
      ],
      quiz: [
        { lv: '*', q: 'Na analogia do restaurante, a API é:', o: ['A cozinha', 'O garçom', 'O cliente', 'O prato'], a: 1, w: 'Leva e traz.' },
        { lv: 'b', q: '`JSON.parse` faz:', o: ['Transforma texto JSON em objeto', 'Apaga JSON', 'Envia e-mail', 'Desenha'], a: 0, w: 'Lê o bilhete.' },
        { lv: 'i', q: 'Para atualizar parte de um cliente:', o: ['GET', 'PATCH', 'DELETE', 'OPTIONS'], a: 1, w: 'PATCH = atualização parcial.' },
        { lv: 'a', q: 'Qual NÃO é idempotente por natureza?', o: ['GET', 'PUT', 'DELETE', 'POST'], a: 3, w: 'Cada POST pode criar algo novo.' }
      ],
      lab: { lang: 'js', task: 'A função `resumo(json)` recebe um texto JSON com uma lista de pedidos `[{"valor":10},...]`. Retorne o total somado.', start: 'function resumo(json) {\n  const pedidos = JSON.parse(json);\n  // some os valores\n}\n', check: { tests: 'if (resumo(\'[{"valor":10},{"valor":5.5}]\') !== 15.5) throw new Error("esperado 15.5");\nif (resumo("[]") !== 0) throw new Error("vazio deve dar 0");' }, hint: 'return pedidos.reduce((s, p) => s + p.valor, 0);', sol: 'function resumo(json) {\n  const pedidos = JSON.parse(json);\n  return pedidos.reduce((s, p) => s + p.valor, 0);\n}' }
    },
    {
      id: 'api2', title: 'Construindo um backend', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🏭', 'A fábrica escondida', "O app que você vê é a **loja** (frontend). Atrás dela tem uma **fábrica** (backend) que guarda os dados, faz as contas e conversa com o banco. O usuário nunca vê a fábrica."],
        ['flow', 'Caminho de um clique', ['Você clica “Pagar”', 'App manda pedido para a API', 'Backend confere tudo', 'Grava no banco', 'Responde “Pago ✅”']]
      ],
      i: [
        ['code', 'js', `// Node + Express
import express from "express";
const app = express();
app.use(express.json());

const clientes = [];
app.get("/clientes", (req, res) => res.json(clientes));
app.post("/clientes", (req, res) => {
  const { nome, cidade } = req.body;
  if (!nome) return res.status(422).json({ erro: "nome é obrigatório" });
  const novo = { id: clientes.length + 1, nome, cidade };
  clientes.push(novo);
  res.status(201).json(novo);
});
app.listen(3000, () => console.log("API em http://localhost:3000"));`, "Rotas, validação mínima e status corretos. Em Python o equivalente é FastAPI (trilha Python)."],
        ['tbl', 'Stacks populares', ['Linguagem', 'Frameworks'], [['JavaScript/TS', 'Express, Fastify, NestJS, Next.js API'], ['Python', 'FastAPI, Django, Flask'], ['PHP', 'Laravel'], ['Java/Kotlin', 'Spring Boot'], ['Go', 'net/http, Gin'], ['C#', 'ASP.NET']]],
        ['t', 'Backend sem servidor próprio (BaaS)', "Supabase e Firebase dão banco, autenticação, storage, funções e tempo real prontos. Você escreve regras de acesso (RLS no Supabase) e funções só para lógica especial."]
      ],
      a: [
        ['list', 'Arquitetura em camadas', ['**Rotas/controllers**: HTTP entra e sai', '**Serviços**: regras de negócio', '**Repositórios**: acesso ao banco', '**Domínio**: entidades e validações puras', 'Injeção de dependência para testar cada camada']],
        ['list', 'Prontidão para produção', ['Validação de entrada com schema (Zod, Pydantic)', 'Logs estruturados (JSON) com request-id', 'Rate limiting e timeouts para chamadas externas', 'Health check `/health`', 'Config por variáveis de ambiente (12-factor)', 'Migrações versionadas e seeds']],
        ['t', 'Monolito primeiro', "Microsserviços resolvem problemas de organização de times grandes e criam problemas de rede, consistência e observabilidade. Comece com um monólito modular; separe quando houver motivo medido."]
      ],
      quiz: [
        { lv: '*', q: 'Backend é:', o: ['A parte que o usuário vê', 'A parte que roda no servidor com dados e regras', 'O monitor', 'O CSS'], a: 1, w: 'A fábrica.' },
        { lv: 'b', q: 'Quem guarda os dados no banco?', o: ['O botão', 'O backend', 'O mouse', 'O CSS'], a: 1, w: 'Backend.' },
        { lv: 'i', q: 'Status ideal ao criar com sucesso:', o: ['200', '201', '204', '302'], a: 1, w: '201 Created.' },
        { lv: 'a', q: '12-factor recomenda configurar a aplicação via:', o: ['Arquivos dentro do código', 'Variáveis de ambiente', 'Banco de dados', 'Comentários'], a: 1, w: 'Config separada do código.' }
      ]
    },
    {
      id: 'api3', title: 'Login e autenticação', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🎫', 'A pulseirinha da festa', "Na entrada da festa, mostram seu documento (login). Você ganha uma **pulseirinha**. Depois disso, é só mostrar a pulseira para entrar em qualquer sala.\nNo app, a pulseira se chama **token** ou **sessão**."],
        ['an', '🚪', 'Quem é você x o que pode fazer', "**Autenticação**: provar quem você é (login).\n**Autorização**: o que você pode fazer (só o gerente aprova desconto)."]
      ],
      i: [
        ['flow', 'Login com token (JWT)', ['Usuário envia e-mail + senha', 'Servidor confere o hash da senha', 'Gera token assinado com expiração', 'App manda o token em cada pedido', 'Servidor valida a assinatura']],
        ['code', 'text', `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJmaW5hbmNlaXJvIiwiZXhwIjoxNzYwMTAwMDAwfQ.assinatura
   cabeçalho          .            dados (base64, NÃO criptografado)                 .  assinatura`, "Qualquer um lê o conteúdo de um JWT. A assinatura só impede alteração. Nunca coloque segredo dentro."],
        ['list', 'Opções', ['Sessão com cookie (clássico, simples e seguro para web)', 'JWT (APIs, mobile)', 'OAuth / “Entrar com Google”', 'Magic link e passkeys (sem senha)', 'Serviços prontos: Supabase Auth, Firebase Auth, Clerk, Auth0']]
      ],
      a: [
        ['list', 'Detalhes que derrubam sistemas', ['Senha com **argon2id** ou bcrypt, nunca MD5/SHA puro', 'Access token curto (15 min) + refresh token rotativo', 'Cookie `HttpOnly; Secure; SameSite=Lax` contra roubo via XSS e CSRF', 'Mensagem de erro genérica (não revele se o e-mail existe)', 'Rate limit no login + MFA para admins', 'Revogação: lista de sessões ativas no banco']],
        ['code', 'sql', `-- Supabase: Row Level Security
alter table contratos enable row level security;
create policy "cada consultor vê os seus"
on contratos for select
using (auth.uid() = consultor_id);`, "Com RLS, mesmo que o app peça tudo, o banco só devolve as linhas permitidas para aquele usuário."]
      ],
      quiz: [
        { lv: '*', q: 'Autenticação responde:', o: ['O que você pode fazer', 'Quem é você', 'Onde você está', 'Quanto custa'], a: 1, w: 'Identidade.' },
        { lv: 'b', q: 'Na festa, o token é como:', o: ['O bolo', 'A pulseirinha', 'A música', 'A porta'], a: 1, w: 'Prova que você já entrou.' },
        { lv: 'i', q: 'O conteúdo de um JWT é:', o: ['Criptografado', 'Apenas codificado em base64 e assinado', 'Invisível', 'Comprimido'], a: 1, w: 'Qualquer um decodifica.' },
        { lv: 'a', q: 'Melhor algoritmo para guardar senhas:', o: ['MD5', 'SHA-256 puro', 'argon2id', 'base64'], a: 2, w: 'Lento de propósito e com sal.' }
      ]
    },
    {
      id: 'api4', title: 'Webhooks e integrações', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🔔', 'A campainha', "Em vez de você ir até a porta toda hora ver se o carteiro chegou, ele **toca a campainha**.\nWebhook é isso: quando algo acontece (o boleto foi pago), o outro sistema **avisa** o seu sozinho."]
      ],
      i: [
        ['flow', 'Pagamento confirmado via webhook', ['Cliente paga o Pix', 'Banco/gateway chama POST /webhooks/pagamento', 'Sua API confere a assinatura', 'Marca a parcela como paga', 'Responde 200 rapidinho']],
        ['code', 'js', `app.post("/webhooks/pagamento", express.raw({ type: "application/json" }), (req, res) => {
  const assinatura = req.get("X-Assinatura");
  const esperado = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(req.body).digest("hex");
  if (assinatura !== esperado) return res.sendStatus(401);
  const evento = JSON.parse(req.body);
  fila.add("baixa-pagamento", evento);   // processa depois
  res.sendStatus(200);
});`, "Valide a assinatura, responda rápido e processe em fila."],
        ['tip', "Polling = perguntar de tempos em tempos. Webhook = ser avisado. Webhook economiza chamadas e chega na hora."]
      ],
      a: [
        ['list', 'Webhook robusto', ['Comparação de assinatura em tempo constante (`timingSafeEqual`)', 'Rejeite eventos antigos (timestamp) para evitar replay', 'Guarde `event_id` e ignore duplicados (idempotência)', 'Responda 2xx em < 5s; o trabalho pesado vai para fila', 'Reconciliação diária: busque na API do parceiro o que pode ter se perdido']],
        ['t', 'Integrações com ERPs e CRMs', "Conta Azul, RD Station, Omie, Asaas e afins usam OAuth2 + REST + webhooks. Trate refresh de token, limites de requisição (429 → espere e tente de novo) e paginação. Registre cada sincronização numa tabela de log para auditoria."]
      ],
      quiz: [
        { lv: '*', q: 'Webhook é:', o: ['Um anzol', 'Uma chamada que outro sistema faz para avisar um evento', 'Um tipo de banco', 'Um framework'], a: 1, w: 'A campainha.' },
        { lv: 'b', q: 'Webhook evita que você:', o: ['Tenha internet', 'Fique perguntando toda hora se algo aconteceu', 'Use banco', 'Faça login'], a: 1, w: 'Você é avisado.' },
        { lv: 'i', q: 'Por que validar a assinatura do webhook?', o: ['Para ficar mais rápido', 'Para garantir que veio mesmo do parceiro', 'É enfeite', 'Para comprimir'], a: 1, w: 'Qualquer um pode chamar sua URL.' },
        { lv: 'a', q: 'Status 429 de uma API parceira pede:', o: ['Tentar de novo imediatamente em loop', 'Esperar (backoff) e tentar depois', 'Trocar a senha', 'Ignorar'], a: 1, w: 'Too Many Requests.' }
      ]
    }
  ]
});
