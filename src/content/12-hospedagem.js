CC.tracks.push({
  id: 'host', ord: 12, name: 'Hospedagem & Deploy', short: 'Hospedagem', glyph: '▲', hue: 25,
  desc: 'Domínio, DNS, tipos de hospedagem, colocar site e API no ar, HTTPS, variáveis de ambiente e custos.',
  test: [
    { d: 1, q: 'Hospedar um site é:', o: ['Desenhar o site', 'Colocar o site num computador ligado na internet para todos acessarem', 'Comprar um computador', 'Fazer backup'], a: 1 },
    { d: 1, q: 'Domínio é:', o: ['O nome do site, tipo minhaloja.com.br', 'O servidor', 'A senha', 'O código'], a: 0 },
    { d: 2, q: 'Netlify/Vercel/GitHub Pages são ótimos para:', o: ['Sites estáticos e front-ends', 'Bancos de dados grandes', 'Servidores de e-mail', 'Jogos online pesados'], a: 0 },
    { d: 2, q: 'Para apontar o domínio para o servidor você configura:', o: ['O CSS', 'Registros DNS (A, CNAME)', 'O banco', 'O Git'], a: 1 },
    { d: 3, q: 'Serverless significa:', o: ['Não há servidor nenhum', 'Você não gerencia servidor; paga por execução e escala automático', 'Só funciona offline', 'É sempre grátis'], a: 1 },
    { d: 3, q: 'Cold start é:', o: ['Servidor congelado', 'Atraso na primeira execução de uma função ociosa', 'Erro de DNS', 'Backup frio'], a: 1 }
  ],
  lessons: [
    {
      id: 'host1', title: 'Domínio, DNS e hospedagem', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🏡', 'Terreno, endereço e placa', "Para ter uma loja, você precisa de: um **terreno** com a loja construída (o **servidor/hospedagem**), um **endereço** (o **IP**) e uma **placa bonita** com o nome (o **domínio**, tipo `padariadoze.com.br`)."],
        ['an', '🗺️', 'O DNS liga a placa ao terreno', "Quando alguém procura `padariadoze.com.br`, o DNS diz: “fica no terreno número 203.0.113.10”."],
        ['list', 'Onde comprar cada coisa', ['Domínio `.com.br`: **Registro.br** (~R$ 40/ano)', 'Domínio `.com`: Cloudflare, Namecheap, GoDaddy', 'Hospedagem: Netlify, Vercel, Hostinger, AWS...']]
      ],
      i: [
        ['tbl', 'Configurando o DNS', ['Registro', 'Nome', 'Valor', 'Para'], [['A', '@', '203.0.113.10', 'domínio raiz → VPS'], ['CNAME', 'www', 'meusite.netlify.app', 'www → Netlify'], ['CNAME', 'app', 'cname.vercel-dns.com', 'subdomínio → Vercel'], ['MX', '@', 'smtp.google.com', 'e-mail'], ['TXT', '@', 'v=spf1 include:_spf.google.com ~all', 'anti-spam']]],
        ['t', 'Nameservers', "No Registro.br você pode deixar o DNS lá mesmo ou apontar os **nameservers** para a Cloudflare (DNS rápido, proxy, SSL e proteção grátis). Mudanças levam de minutos a algumas horas por causa do TTL."]
      ],
      a: [
        ['t', 'Apex e CNAME', "Pela RFC, o domínio raiz (apex) não pode ter CNAME. Provedores resolvem com ALIAS/ANAME ou CNAME flattening (Cloudflare). Antes de migrar, baixe o TTL para 300s um dia antes; depois da migração, suba de novo."],
        ['list', 'E-mail que não cai no spam', ['**SPF**: quem pode enviar pelo domínio', '**DKIM**: assinatura criptográfica das mensagens', '**DMARC**: política e relatórios (`p=quarantine`)', 'Envio transacional via Resend, Postmark, SES ou SendGrid']]
      ],
      quiz: [
        { lv: '*', q: 'O domínio é:', o: ['O nome do site', 'O servidor', 'O banco', 'O código'], a: 0, w: 'A placa.' },
        { lv: 'b', q: 'Onde comprar um domínio .com.br?', o: ['Registro.br', 'Netflix', 'GitHub', 'Google Drive'], a: 0, w: 'Registro.br.' },
        { lv: 'i', q: 'Para apontar www para a Netlify:', o: ['Registro A', 'CNAME', 'MX', 'TXT'], a: 1, w: 'CNAME para o nome da Netlify.' },
        { lv: 'a', q: 'DKIM serve para:', o: ['Acelerar DNS', 'Assinar e-mails provando que vieram do domínio', 'Redirecionar www', 'Proteger contra DDoS'], a: 1, w: 'Assinatura de e-mail.' }
      ]
    },
    {
      id: 'host2', title: 'Tipos de hospedagem', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🏘️', 'Morar de jeitos diferentes', "**Hospedagem compartilhada** é dividir apartamento: barato, mas o vizinho barulhento atrapalha.\n**VPS** é ter seu apartamento: mais caro, você cuida de tudo.\n**Plataforma pronta (PaaS)** é hotel: você só chega e usa, eles limpam.\n**Serverless** é Airbnb por hora: paga só quando usa."]
      ],
      i: [
        ['tbl', 'Qual escolher', ['Tipo', 'Exemplos', 'Bom para', 'Custo inicial'], [['Estático + CDN', 'Netlify, Vercel, Cloudflare Pages, GitHub Pages', 'Sites, React, PWA', 'Grátis'], ['PaaS', 'Render, Railway, Fly.io, Heroku', 'APIs Node/Python', 'Grátis a ~US$ 7/mês'], ['Serverless', 'Vercel/Netlify Functions, Cloudflare Workers, AWS Lambda', 'APIs leves, webhooks', 'Paga por uso'], ['BaaS', 'Supabase, Firebase', 'Banco + auth + storage', 'Grátis a ~US$ 25/mês'], ['VPS', 'Hostinger, DigitalOcean, Hetzner, Contabo', 'Controle total, vários apps', '~R$ 25–100/mês'], ['Nuvem grande', 'AWS, Google Cloud, Azure', 'Escala e serviços avançados', 'Variável']]],
        ['tip', "Combinação clássica e barata: front na **Netlify/Vercel** + banco e auth no **Supabase** + funções serverless para integrações."]
      ],
      a: [
        ['t', 'Trade-offs reais', "Serverless: zero manutenção e escala, mas cold start, limites de tempo de execução e custo que dispara com tráfego alto ou loops. VPS: custo fixo e previsível, mas você é o SRE (patches, backup, monitoramento). PaaS fica no meio."],
        ['t', 'Plano gratuito tem pegadinhas', "Projetos Supabase grátis pausam após inatividade; Render grátis “dorme”; limites de banda e de invocações. Para produção da empresa, orce o plano pago e configure alerta de gastos (billing alerts)."]
      ],
      quiz: [
        { lv: '*', q: 'Para um site estático (HTML/CSS/JS) simples, o mais prático é:', o: ['Comprar servidor físico', 'Netlify/Vercel/GitHub Pages', 'Mainframe', 'E-mail'], a: 1, w: 'Grátis e com CDN.' },
        { lv: 'b', q: 'Serverless é como:', o: ['Comprar uma casa', 'Pagar só quando usa', 'Morar na rua', 'Dividir quarto'], a: 1, w: 'Paga por execução.' },
        { lv: 'i', q: 'Supabase entrega principalmente:', o: ['Postgres + autenticação + storage + APIs', 'Só e-mail', 'Domínios', 'Editor de vídeo'], a: 0, w: 'BaaS em cima do Postgres.' },
        { lv: 'a', q: 'Desvantagem típica de VPS:', o: ['Cold start', 'Você mantém segurança, atualizações e backups', 'Não roda Python', 'Não tem IP'], a: 1, w: 'Você opera.' }
      ]
    },
    {
      id: 'host3', title: 'Colocando no ar (deploy)', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🚀', 'Lançar o foguete', "**Deploy** é pegar o que você fez no seu computador e lançar para a internet, para todo mundo usar."],
        ['flow', 'O jeito mais fácil', ['Coloca o projeto no GitHub', 'Conecta o repositório na Netlify ou Vercel', 'Eles constroem e publicam', 'A cada push, atualiza sozinho ✨']]
      ],
      i: [
        ['code', 'toml', `# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]   # SPA: todas as rotas abrem o index.html
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"`, "Build, redirect de SPA e cache longo para arquivos com hash."],
        ['t', 'Variáveis de ambiente', "Chaves e URLs ficam fora do código, no painel do provedor. No front-end, **toda variável vira pública** (Vite: `VITE_`, Next: `NEXT_PUBLIC_`): só coloque chaves públicas (como a anon key do Supabase, protegida por RLS). Chave `service_role` nunca no front."],
        ['list', 'Preview deploys', ['Cada Pull Request ganha uma URL própria', 'Teste antes de ir para produção', 'Rollback com um clique se der errado']]
      ],
      a: [
        ['code', 'bash', `# VPS: Node atrás de Nginx com HTTPS
sudo apt install nginx certbot python3-certbot-nginx
pm2 start dist/server.js --name api && pm2 save && pm2 startup
sudo certbot --nginx -d api.minhaempresa.com.br`, "Nginx como reverse proxy + Let's Encrypt (renovação automática) + PM2/systemd mantendo o processo vivo."],
        ['list', 'Deploy sem susto', ['Builds reproduzíveis (lockfile, versão do Node fixa)', 'Migrações de banco compatíveis com a versão anterior do código', 'Blue-green ou canary para trocar sem downtime', 'Feature flags para ligar funções aos poucos', 'Health check e rollback automático']]
      ],
      quiz: [
        { lv: '*', q: 'Deploy é:', o: ['Apagar o projeto', 'Publicar o projeto para uso real', 'Escrever testes', 'Comprar domínio'], a: 1, w: 'Lançar o foguete.' },
        { lv: 'b', q: 'Com Netlify + GitHub, quando você faz push:', o: ['Nada acontece', 'O site atualiza sozinho', 'O site sai do ar', 'Apaga o repo'], a: 1, w: 'Deploy contínuo.' },
        { lv: 'i', q: 'Chave service_role do Supabase pode ficar no front-end?', o: ['Sim', 'Não, ela ignora RLS e daria acesso total', 'Só em produção', 'Só no celular'], a: 1, w: 'Só no servidor.' },
        { lv: 'a', q: 'Let\'s Encrypt fornece:', o: ['Domínios grátis', 'Certificados TLS grátis', 'Servidores grátis', 'E-mail grátis'], a: 1, w: 'HTTPS gratuito.' }
      ]
    },
    {
      id: 'host4', title: 'No ar e saudável', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🩺', 'Médico do site', "Depois que o site está no ar, alguém precisa ver se ele está bem: se está rápido, se caiu, se deu erro. Ferramentas de **monitoramento** fazem isso e te avisam no celular."]
      ],
      i: [
        ['list', 'Kit básico de produção', ['Uptime: UptimeRobot / Better Stack pinga a cada minuto', 'Erros: Sentry mostra a linha que quebrou', 'Logs: painel do provedor ou Logtail', 'Analytics: Plausible, Umami, GA4', 'Backups automáticos do banco (e teste de restauração)']],
        ['t', 'CDN', "Uma CDN copia seus arquivos para servidores no mundo todo. O usuário em Planaltina baixa do servidor de São Paulo, não dos EUA. Netlify, Vercel e Cloudflare já vêm com CDN."]
      ],
      a: [
        ['list', 'Observabilidade', ['**Métricas**: latência p95/p99, taxa de erro, saturação', '**Logs** estruturados com correlação (trace id)', '**Traces** distribuídos com OpenTelemetry', 'SLO: “99,5% das requisições < 500ms”; alerte no orçamento de erro, não em cada pico']],
        ['t', 'Custos', "Monitore egress (banda de saída), invocações e armazenamento. Imagens otimizadas e cache reduzem conta. Defina limite de gastos e alertas em 50/80/100% do orçamento."]
      ],
      quiz: [
        { lv: '*', q: 'Monitoramento de uptime avisa quando:', o: ['O site cai', 'Chega e-mail', 'Muda a cor', 'Tem promoção'], a: 0, w: 'Disponibilidade.' },
        { lv: 'b', q: 'Para que serve o “médico do site”?', o: ['Ver se o site está bem e avisar problemas', 'Desenhar', 'Vender', 'Comprar domínio'], a: 0, w: 'Monitoramento.' },
        { lv: 'i', q: 'Sentry é usado para:', o: ['Pagamentos', 'Capturar e rastrear erros', 'Hospedar banco', 'Enviar SMS'], a: 1, w: 'Error tracking.' },
        { lv: 'a', q: 'p95 de latência = 400ms significa:', o: ['Média é 400ms', '95% das requisições levam até 400ms', '5% levam 400ms', 'Máximo é 400ms'], a: 1, w: 'Percentil 95.' }
      ]
    }
  ]
});
