/* Complementos — APIs, Hospedagem, DevOps, Segurança */
CC.patch({
  api1: {
    rec: ['API é o garçom entre programas', 'JSON é o formato do bilhete', 'REST: recursos nas rotas e verbos HTTP', 'Status certos: 201 criou, 422 dado inválido, 404 não existe', 'POST não é idempotente; use chave de idempotência em pagamentos'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Método HTTP para buscar dados: ___', ans: ['get'], w: 'GET.' },
      { lv: 'b', t: 'tf', q: 'JSON é um formato de texto para trocar dados entre sistemas.', a: true, w: 'Parece com dicionário/objeto.' },
      { lv: 'i', t: 'order', q: 'Ordene as partes de uma requisição HTTP:', items: ['Método e caminho', 'Cabeçalhos', 'Corpo (opcional)'], w: 'Linha inicial, headers, body.' },
      { lv: 'a', q: 'Para evitar sobrescrever mudanças de outra pessoa numa API:', o: ['ETag + If-Match', 'Mais servidores', 'Cookies', 'CORS'], a: 0, w: 'Controle otimista.' }
    ]
  },
  api2: {
    rec: ['Backend é a fábrica escondida: regras, dados e segurança', 'Rotas recebem pedidos e respondem', 'Valide toda entrada', 'Supabase e Firebase entregam backend pronto', 'Comece com monólito modular'],
    quiz: [
      { lv: '*', t: 'tf', q: 'O usuário vê diretamente o código do backend.', a: false, w: 'Ele roda no servidor.' },
      { lv: 'b', q: 'Onde ficam as regras de negócio e o acesso ao banco?', o: ['Backend', 'CSS', 'Monitor', 'Teclado'], a: 0, w: 'Servidor.' },
      { lv: 'i', t: 'fill', q: 'Endpoint comum para checar se a API está viva: /___', ans: ['health', 'healthz'], w: '/health.' },
      { lv: 'a', t: 'order', q: 'Ordene as camadas de uma API bem organizada:', items: ['Rotas/controllers', 'Serviços (regras)', 'Repositórios (banco)'], w: 'HTTP → negócio → dados.' }
    ]
  },
  api3: {
    rec: ['Autenticação prova quem é; autorização define o que pode', 'Token/sessão é a pulseirinha da festa', 'JWT é assinado, não criptografado', 'Senhas com argon2id ou bcrypt', 'RLS no Supabase filtra linhas por usuário'],
    quiz: [
      { lv: '*', q: 'Autorização responde:', o: ['Quem é você', 'O que você pode fazer', 'Onde você está', 'Que horas são'], a: 1, w: 'Permissões.' },
      { lv: 'b', t: 'tf', q: 'Depois do login, o app usa um token para provar que você entrou.', a: true, w: 'A pulseira.' },
      { lv: 'i', t: 'fill', q: 'Login com conta Google usa o protocolo ___', ans: ['oauth', 'oauth2', 'oauth 2.0', 'oidc'], w: 'OAuth 2.0 / OpenID Connect.' },
      { lv: 'a', q: 'Cookie seguro para sessão deve ter:', o: ['HttpOnly, Secure e SameSite', 'Nenhuma flag', 'Só Path', 'Expires em 10 anos'], a: 0, w: 'Protege contra XSS e CSRF.' }
    ]
  },
  api4: {
    rec: ['Webhook é a campainha: o sistema avisa quando algo acontece', 'Valide a assinatura do webhook', 'Responda rápido e processe em fila', 'Ignore eventos duplicados pelo id', 'Reconciliação diária pega o que se perdeu'],
    quiz: [
      { lv: '*', t: 'order', q: 'Ordene o tratamento de um webhook de pagamento:', items: ['Validar a assinatura', 'Checar se o evento já foi processado', 'Colocar na fila', 'Responder 200'], w: 'Seguro e rápido.' },
      { lv: 'b', t: 'tf', q: 'Polling é perguntar de tempos em tempos; webhook é ser avisado.', a: true, w: 'Campainha.' },
      { lv: 'i', t: 'fill', q: 'Status HTTP de “muitas requisições”: ___', ans: ['429'], w: 'Espere e tente de novo.' },
      { lv: 'a', q: 'Comparar assinaturas de webhook deve usar:', o: ['Comparação em tempo constante', '== simples', 'Regex', 'toUpperCase'], a: 0, w: 'Evita ataque de tempo.' }
    ]
  },
  host1: {
    rec: ['Hospedagem é o terreno; IP o endereço; domínio a placa', '.com.br se compra no Registro.br', 'Registro A aponta para IP; CNAME para outro nome', 'Mudanças de DNS dependem do TTL', 'SPF, DKIM e DMARC evitam spam'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Registro DNS que aponta o domínio para um IPv4: ___', ans: ['a'], w: 'Registro A.' },
      { lv: 'b', t: 'tf', q: 'O domínio é o nome do site, como minhaloja.com.br.', a: true, w: 'A placa.' },
      { lv: 'i', q: 'Para usar Cloudflare como DNS, você troca no Registro.br:', o: ['Os nameservers', 'A senha', 'O CNPJ', 'O e-mail'], a: 0, w: 'Delegação de DNS.' },
      { lv: 'a', t: 'order', q: 'Ordene uma migração de DNS sem susto:', items: ['Baixar o TTL um dia antes', 'Trocar os registros', 'Validar o novo destino', 'Subir o TTL de volta'], w: 'Propagação rápida.' }
    ]
  },
  host2: {
    rec: ['Estático + CDN para sites e front-ends', 'PaaS para APIs sem cuidar de servidor', 'Serverless paga por uso, mas tem cold start', 'VPS dá controle total e trabalho de operação', 'Planos grátis têm limites: orce a produção'],
    quiz: [
      { lv: '*', q: 'Para uma API Node sem administrar servidor:', o: ['PaaS como Render ou Railway', 'Pendrive', 'Excel', 'Impressora'], a: 0, w: 'Plataforma gerenciada.' },
      { lv: 'b', t: 'tf', q: 'Netlify e Vercel hospedam sites estáticos de graça para começar.', a: true, w: 'Com CDN.' },
      { lv: 'i', t: 'fill', q: 'Atraso na primeira execução de uma função serverless ociosa: cold ___', ans: ['start'], w: 'Cold start.' },
      { lv: 'a', q: 'Proteção essencial em qualquer nuvem paga:', o: ['Alertas e limite de gastos', 'Senha 1234', 'Desligar logs', 'Usar root sempre'], a: 0, w: 'Evita sustos na fatura.' }
    ]
  },
  host3: {
    rec: ['Deploy é publicar para uso real', 'GitHub + Netlify/Vercel publica a cada push', 'Variáveis de ambiente guardam configurações e chaves', 'No front-end toda variável vira pública', 'Preview deploy e rollback evitam sustos'],
    quiz: [
      { lv: '*', t: 'tf', q: 'A chave service_role do Supabase pode ir no código do site.', a: false, w: 'Ela ignora o RLS: só no servidor.' },
      { lv: 'b', t: 'order', q: 'Ordene o deploy contínuo:', items: ['Push no GitHub', 'Plataforma faz o build', 'Site publicado', 'Visitantes veem a nova versão'], w: 'Automático.' },
      { lv: 'i', t: 'fill', q: 'Pasta publicada normalmente após `npm run build` no Vite: ___', ans: ['dist'], w: 'dist.' },
      { lv: 'a', q: 'Proxy reverso comum em VPS:', o: ['Nginx', 'Excel', 'Paint', 'Redis'], a: 0, w: 'Nginx/Caddy.' }
    ]
  },
  host4: {
    rec: ['Monitore disponibilidade, erros e desempenho', 'Uptime avisa quando cai', 'Sentry mostra onde o código quebrou', 'CDN entrega arquivos perto do usuário', 'SLO define a meta de qualidade'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Ferramenta popular para rastrear erros de aplicação: ___', ans: ['sentry'], w: 'Sentry.' },
      { lv: 'b', t: 'tf', q: 'Monitoramento avisa quando o site cai.', a: true, w: 'Uptime.' },
      { lv: 'i', q: 'CDN serve para:', o: ['Entregar arquivos de servidores perto do usuário', 'Guardar senhas', 'Programar', 'Editar fotos'], a: 0, w: 'Menor latência.' },
      { lv: 'a', q: 'Os três pilares da observabilidade:', o: ['Métricas, logs e traces', 'HTML, CSS e JS', 'CPU, RAM e disco', 'Git, npm e pip'], a: 0, w: 'OpenTelemetry cobre os três.' }
    ]
  },
  devops1: {
    rec: ['Docker empacota o programa com tudo que precisa', 'Imagem é o molde; container é o que roda', 'Dockerfile é a receita', 'docker compose sobe vários serviços juntos', 'Em produção: imagem pequena, usuário não-root, tag fixa'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Arquivo que descreve como construir a imagem: ___', ans: ['dockerfile'], w: 'Dockerfile.' },
      { lv: 'b', t: 'tf', q: 'Docker ajuda o programa a rodar igual em qualquer computador.', a: true, w: 'Contêiner padrão.' },
      { lv: 'i', t: 'order', q: 'Ordene o uso básico do Docker:', items: ['docker build', 'docker run', 'docker logs'], w: 'Construir, rodar, observar.' },
      { lv: 'a', t: 'tf', q: 'Usar sempre a tag `latest` em produção é boa prática.', a: false, w: 'Use tags imutáveis.' }
    ]
  },
  devops2: {
    rec: ['CI testa a cada mudança; CD publica quando passa', 'Pipeline: lint, testes, build, deploy', 'Segredos ficam nos secrets do CI', 'Construa o artefato uma vez e promova', 'DORA mede a saúde da entrega'],
    quiz: [
      { lv: '*', q: 'CI significa:', o: ['Integração contínua', 'Código inteligente', 'Cliente interno', 'Cache imediato'], a: 0, w: 'Continuous Integration.' },
      { lv: 'b', t: 'tf', q: 'A esteira automática testa e publica sem você fazer à mão.', a: true, w: 'CI/CD.' },
      { lv: 'i', t: 'fill', q: 'Pasta onde ficam os workflows do GitHub Actions: .github/___', ans: ['workflows'], w: '.github/workflows.' },
      { lv: 'a', q: 'Métrica DORA que mede o tempo para recuperar de uma falha:', o: ['MTTR', 'LCP', 'TTL', 'RPS'], a: 0, w: 'Mean Time To Restore.' }
    ]
  },
  devops3: {
    rec: ['Nuvem é alugar computação sob demanda', 'IaaS, PaaS e SaaS dividem quem cuida de quê', 'Escalar vertical é máquina maior; horizontal é mais máquinas', 'App sem estado escala horizontalmente', 'Infraestrutura como código versiona a nuvem'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Serviço de armazenamento de objetos da AWS: ___', ans: ['s3'], w: 'S3.' },
      { lv: 'b', t: 'tf', q: 'Gmail é um exemplo de SaaS.', a: true, w: 'Software usado pela internet.' },
      { lv: 'i', q: 'Adicionar mais instâncias atrás de um balanceador é escalar:', o: ['Horizontalmente', 'Verticalmente', 'Diagonalmente', 'Nunca'], a: 0, w: 'Scale out.' },
      { lv: 'a', q: 'Ferramenta clássica de infraestrutura como código:', o: ['Terraform', 'Photoshop', 'Excel', 'Postman'], a: 0, w: 'Ou OpenTofu, Pulumi.' }
    ]
  },
  sec1: {
    rec: ['Criptografia é o baú com cadeado', 'Sites guardam hash da senha, não a senha', 'Base64 não protege nada', 'Senhas longas, únicas e com gerenciador', 'Verificação em duas etapas sempre'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Usar a mesma senha em vários sites é seguro.', a: false, w: 'Um vazamento abre todos.' },
      { lv: 'b', q: 'Gerenciador de senhas serve para:', o: ['Guardar senhas fortes e diferentes', 'Formatar o PC', 'Acelerar a internet', 'Imprimir'], a: 0, w: 'Bitwarden, 1Password.' },
      { lv: 'i', t: 'fill', q: 'Algoritmo recomendado para hash de senhas: ___', ans: ['argon2id', 'argon2', 'bcrypt'], w: 'argon2id ou bcrypt.' },
      { lv: 'a', t: 'order', q: 'Ordene a resposta a uma chave de API vazada:', items: ['Revogar/rotacionar a chave', 'Verificar uso indevido nos logs', 'Remover do histórico', 'Corrigir o processo'], w: 'Contenção primeiro.' }
    ]
  },
  sec2: {
    rec: ['Phishing engana com pressa e links falsos', 'SQL injection: nunca cole texto do usuário no SQL', 'Consultas parametrizadas resolvem injeção', 'XSS: escape a saída e use textContent', 'IDOR: sempre confira se o recurso é do usuário'],
    quiz: [
      { lv: '*', t: 'tf', q: 'Consultas parametrizadas protegem contra SQL injection.', a: true, w: 'Dado nunca vira código.' },
      { lv: 'b', q: 'Uma mensagem “seu banco será bloqueado, clique aqui” deve:', o: ['Gerar desconfiança', 'Ser clicada rápido', 'Ser encaminhada', 'Ser respondida com a senha'], a: 0, w: 'Golpe clássico.' },
      { lv: 'i', t: 'fill', q: 'Ataque que injeta script na página de outro usuário: ___', ans: ['xss'], w: 'Cross-Site Scripting.' },
      { lv: 'a', q: 'Cabeçalho que restringe de onde scripts podem carregar:', o: ['Content-Security-Policy', 'Accept', 'Host', 'ETag'], a: 0, w: 'CSP.' }
    ]
  },
  sec3: {
    rec: ['Segurança em camadas: se uma falha, outra segura', 'LGPD: colete o mínimo e cuide dos dados', 'Dados de saúde são sensíveis', 'Logs de auditoria mostram quem fez o quê', 'Zero trust: verificar em cada acesso'],
    quiz: [
      { lv: '*', t: 'fill', q: 'Lei brasileira de proteção de dados: ___', ans: ['lgpd'], w: 'Lei 13.709/2018.' },
      { lv: 'b', t: 'tf', q: 'Dados pessoais devem ser usados só para a finalidade combinada.', a: true, w: 'Princípio da finalidade.' },
      { lv: 'i', q: 'Órgão que fiscaliza a LGPD:', o: ['ANPD', 'ANATEL', 'ANVISA', 'BACEN'], a: 0, w: 'Autoridade Nacional de Proteção de Dados.' },
      { lv: 'a', t: 'order', q: 'Ordene a resposta a um incidente:', items: ['Conter', 'Investigar', 'Corrigir', 'Comunicar (titulares/ANPD quando aplicável)', 'Aprender e prevenir'], w: 'Plano de resposta.' }
    ]
  }
}, {
  api: [
    { t: 'fill', q: 'Status HTTP para “criado com sucesso”: ___', ans: ['201'], w: '201 Created.' },
    { q: 'Webhook é:', o: ['Uma chamada que outro sistema faz para avisar um evento', 'Um banco', 'Um CSS', 'Uma senha'], a: 0, w: 'Campainha.' },
    { t: 'tf', q: 'O conteúdo de um JWT é criptografado e ninguém consegue ler.', a: false, w: 'Base64 + assinatura.' },
    { t: 'order', q: 'Ordene o login com token:', items: ['Enviar e-mail e senha', 'Servidor confere o hash', 'Servidor gera o token', 'App envia o token nas próximas chamadas'], w: 'Autenticação.' },
    { q: 'Atualizar parte de um recurso:', o: ['PATCH', 'GET', 'DELETE', 'HEAD'], a: 0, w: 'PATCH.' }
  ],
  host: [
    { q: 'Onde comprar domínio .com.br?', o: ['Registro.br', 'GitHub', 'Netflix', 'Excel'], a: 0, w: 'Registro.br.' },
    { t: 'tf', q: 'Let\'s Encrypt fornece certificados HTTPS gratuitos.', a: true, w: 'Renovação automática.' },
    { t: 'fill', q: 'Registro DNS de servidor de e-mail: ___', ans: ['mx'], w: 'MX.' },
    { t: 'order', q: 'Ordene a publicação de um site com Netlify:', items: ['Subir o código no GitHub', 'Conectar o repositório na Netlify', 'Configurar build e pasta', 'Apontar o domínio'], w: 'Deploy contínuo.' },
    { q: 'Para APIs sem servidor fixo, pagando por execução:', o: ['Serverless', 'VPS', 'Servidor físico', 'FTP'], a: 0, w: 'Funções.' }
  ],
  devops: [
    { t: 'fill', q: 'Comando que sobe vários containers definidos num arquivo: docker ___ up', ans: ['compose'], w: 'docker compose up.' },
    { q: 'Imagem x container:', o: ['Imagem é o molde; container é a instância rodando', 'São iguais', 'Container é o molde', 'Nenhum dos dois'], a: 0, w: 'Classe e objeto.' },
    { t: 'tf', q: 'Kubernetes é sempre a melhor escolha para times pequenos.', a: false, w: 'Complexo; PaaS resolve muitos casos.' },
    { t: 'order', q: 'Ordene um pipeline típico:', items: ['Lint', 'Testes', 'Build', 'Deploy'], w: 'Falha cedo, barato.' },
    { q: 'Escala horizontal exige app:', o: ['Sem estado (stateless)', 'Com sessão em memória local', 'Monothread', 'Em Java'], a: 0, w: 'Qualquer instância atende.' }
  ],
  sec: [
    { q: 'Defesa principal contra SQL injection:', o: ['Consultas parametrizadas', 'Esconder o banco', 'Senha longa', 'HTTPS'], a: 0, w: 'Dado separado do código.' },
    { t: 'tf', q: 'Base64 é uma forma de criptografia segura.', a: false, w: 'É só codificação.' },
    { t: 'fill', q: 'Verificação em duas etapas, em sigla: ___', ans: ['mfa', '2fa'], w: 'MFA/2FA.' },
    { t: 'order', q: 'Ordene do mais ao menos recomendado para guardar senhas de usuários:', items: ['argon2id', 'bcrypt', 'SHA-256 puro', 'Texto puro'], w: 'Funções lentas com sal primeiro.' },
    { q: 'Trocar o ID na URL e ver dados de outro cliente é:', o: ['IDOR / controle de acesso quebrado', 'XSS', 'DDoS', 'Phishing'], a: 0, w: 'Confira o dono no servidor.' }
  ]
});
