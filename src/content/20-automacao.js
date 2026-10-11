CC.tracks.push({
  id: 'auto', ord: 20, name: 'Automação', short: 'Automação', glyph: '⟳', hue: 120,
  desc: 'Robôs que trabalham por você: scripts, agendamentos, planilhas, n8n/Zapier/Make, webhooks, bots, scraping e IA.',
  test: [
    { d: 1, q: 'Automatizar é:', o: ['Fazer tudo à mão', 'Fazer o computador repetir uma tarefa sozinho', 'Comprar um robô', 'Desligar o computador'], a: 1 },
    { d: 1, q: 'Qual tarefa é boa para automatizar?', o: ['Algo que se repete toda semana igual', 'Decidir uma estratégia nova uma vez', 'Conversa difícil com cliente', 'Nada'], a: 0 },
    { d: 2, q: 'Cron serve para:', o: ['Agendar tarefas para rodar em horários definidos', 'Comprimir arquivos', 'Criar banco', 'Editar imagens'], a: 0 },
    { d: 2, q: 'n8n, Zapier e Make são:', o: ['Linguagens', 'Plataformas para montar automações ligando apps', 'Bancos', 'Navegadores'], a: 1 },
    { d: 3, q: 'Antes de fazer scraping de um site, você deve checar:', o: ['A cor do site', 'Termos de uso, robots.txt e se existe API oficial', 'O DNS', 'Nada'], a: 1 },
    { d: 3, q: 'Uma automação robusta precisa de:', o: ['Rodar sem logs', 'Tratamento de erro, retentativas, alertas e idempotência', 'Senha no código', 'Rodar no notebook pessoal'], a: 1 }
  ],
  lessons: [
    {
      id: 'auto1', title: 'Pensar como automatizador', min: { b: 10, i: 15, a: 18 },
      b: [
        ['an', '🤖', 'Um robozinho ajudante', "Toda segunda você copia números de uma planilha para outra? Um robozinho pode fazer isso por você, sem errar e sem cansar. Você só ensina uma vez."],
        ['flow', 'Toda automação tem', ['Gatilho: quando começa (todo dia 8h, chegou e-mail)', 'Ações: o que faz', 'Resultado: onde entrega (planilha, WhatsApp, e-mail)']]
      ],
      i: [
        ['list', 'Vale automatizar quando', ['Repete com frequência (diária/semanal)', 'Tem regras claras', 'Erro humano custa caro', 'Tempo economizado × tempo para construir e manter compensa']],
        ['tbl', 'Exemplos reais de escritório', ['Tarefa manual', 'Automação'], [['Baixar relatório do banco e conferir pagos', 'Parser lê o arquivo e dá baixa no sistema'], ['Mandar lembrete de vencimento', 'Agendamento diário + mensagem padrão'], ['Copiar leads do formulário para o CRM', 'Webhook do formulário → API do CRM'], ['Montar relatório mensal', 'Consulta SQL + planilha gerada + e-mail']]]
      ],
      a: [
        ['list', 'Projeto de automação', ['Mapeie o processo atual e as exceções (onde humanos decidem)', 'Comece pelo caminho feliz, mas registre o que caiu fora', 'Humano no circuito para casos ambíguos', 'Métricas: horas economizadas, erros evitados', 'Dono definido e documentação de como desligar/rodar à mão']]
      ],
      quiz: [
        { lv: '*', q: 'Toda automação começa com um:', o: ['Gatilho', 'Domínio', 'Banco NoSQL', 'Certificado'], a: 0, w: 'O que dispara.' },
        { lv: 'b', q: 'O robozinho é bom para tarefas:', o: ['Repetitivas', 'Que acontecem uma vez na vida', 'Emocionais', 'Impossíveis'], a: 0, w: 'Repetição.' },
        { lv: 'i', q: 'Quando NÃO vale automatizar?', o: ['Tarefa diária com regras claras', 'Tarefa rara, cheia de exceções e julgamento', 'Copiar dados entre sistemas', 'Lembretes'], a: 1, w: 'Custo > benefício.' },
        { lv: 'a', q: 'Por que ter “humano no circuito”?', o: ['Para atrasar', 'Para tratar casos ambíguos com segurança', 'Exigência do Python', 'Para gastar menos'], a: 1, w: 'Exceções.' }
      ]
    },
    {
      id: 'auto2', title: 'Scripts e agendamentos', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '⏰', 'O despertador do computador', "Você coloca o despertador para tocar todo dia às 7h. O computador também tem despertador: na hora marcada, ele roda um programa sozinho."],
        ['run', 'py', `boletos = [
    {"cliente": "Ana", "dias": 3},
    {"cliente": "Bruno", "dias": 0},
    {"cliente": "Gabi", "dias": 15},
]
for b in boletos:
    if b["dias"] > 0:
        print(f"Oi {b['cliente']}! Seu boleto venceu há {b['dias']} dia(s). Posso ajudar? 😊")`, "Um robozinho que monta as mensagens de cobrança. Agora imagina ele rodando todo dia às 9h."]
      ],
      i: [
        ['tbl', 'Expressões cron', ['Cron', 'Quando roda'], [['0 9 * * *', 'todo dia às 9h'], ['*/15 * * * *', 'a cada 15 minutos'], ['0 8 * * 1-5', 'dias úteis às 8h'], ['0 7 1 * *', 'dia 1 de cada mês às 7h']]],
        ['list', 'Onde agendar', ['Linux: `crontab -e`', 'Windows: Agendador de Tarefas', 'GitHub Actions: `on: schedule: - cron: \"0 12 * * *\"` (UTC!)', 'Supabase: pg_cron', 'Nuvem: Cloud Scheduler, EventBridge', 'n8n/Zapier: nó de agendamento']],
        ['code', 'py', `# automação de planilha com openpyxl
from openpyxl import load_workbook
wb = load_workbook("cobranca.xlsx")
ws = wb["Parcelas"]
for linha in ws.iter_rows(min_row=2):
    venc, status = linha[3].value, linha[5]
    if status.value == "aberto" and venc < hoje:
        status.value = "vencido"
wb.save("cobranca_atualizada.xlsx")`]
      ],
      a: [
        ['list', 'Jobs confiáveis', ['Idempotente: rodar duas vezes não manda duas cobranças', 'Lock para não executar em paralelo consigo mesmo', 'Logs + alerta quando falhar ou quando **não rodar** (heartbeat, ex.: healthchecks.io)', 'Fuso horário explícito (cron de servidor costuma ser UTC)', 'Retentativa com backoff para erros temporários']]
      ],
      quiz: [
        { lv: '*', q: '`0 9 * * *` no cron significa:', o: ['A cada 9 minutos', 'Todo dia às 9h', 'Dia 9 do mês', 'Nove vezes'], a: 1, w: 'minuto 0, hora 9.' },
        { lv: 'b', q: 'Agendar uma tarefa é como:', o: ['Colocar um despertador', 'Desligar o computador', 'Apagar arquivos', 'Comprar domínio'], a: 0, w: 'Hora marcada.' },
        { lv: 'i', q: 'O cron do GitHub Actions usa qual fuso?', o: ['Brasília', 'UTC', 'O do usuário', 'Nenhum'], a: 1, w: 'UTC (9h BRT = 12h UTC).' },
        { lv: 'a', q: 'Heartbeat monitoring detecta:', o: ['Job que falhou com erro apenas', 'Job que simplesmente não rodou', 'Senha fraca', 'DNS lento'], a: 1, w: 'Ausência de sinal.' }
      ],
      lab: { lang: 'py', task: 'Crie `mensagens(boletos)` que recebe uma lista de dicts com `cliente` e `dias` e retorna uma lista de textos `"Oi NOME, venceu há N dias"` **só** para quem tem dias > 0.', start: 'def mensagens(boletos):\n    pass\n', check: { tests: 'r = mensagens([{"cliente":"Ana","dias":3},{"cliente":"Bia","dias":0}])\nassert r == ["Oi Ana, venceu há 3 dias"], r\nassert mensagens([]) == []' }, hint: '[f"Oi {b[\'cliente\']}, venceu há {b[\'dias\']} dias" for b in boletos if b["dias"] > 0]', sol: 'def mensagens(boletos):\n    return [f"Oi {b[\'cliente\']}, venceu há {b[\'dias\']} dias" for b in boletos if b["dias"] > 0]' }
    },
    {
      id: 'auto3', title: 'n8n, Zapier, Make e webhooks', min: { b: 10, i: 18, a: 20 },
      b: [
        ['an', '🧱', 'Lego de aplicativos', "Em vez de programar, você monta blocos: “quando chegar um formulário” → “salva na planilha” → “manda mensagem no WhatsApp”. Ferramentas como **n8n**, **Zapier** e **Make** são esse Lego."]
      ],
      i: [
        ['tbl', 'Comparando', ['Ferramenta', 'Destaque', 'Preço'], [['Zapier', 'Mais fácil, milhares de apps', 'Paga por tarefa, caro em volume'], ['Make', 'Visual, bom custo-benefício', 'Por operação'], ['n8n', 'Open source, pode hospedar você mesmo, nós de código e IA', 'Grátis self-hosted ou nuvem paga'], ['Power Automate', 'Integra com Microsoft 365', 'Licença Microsoft']]],
        ['flow', 'Lead do site → CRM → aviso', ['Webhook recebe formulário', 'Limpa telefone e e-mail', 'Cria contato no RD Station', 'Se “cirurgia” no interesse → avisa consultora no WhatsApp', 'Registra na planilha de controle']],
        ['code', 'js', `// nó "Code" no n8n: normalizar telefone
return items.map(item => {
  const tel = String(item.json.telefone || "").replace(/\\D/g, "");
  item.json.whatsapp = tel.length === 11 ? "55" + tel : null;
  return item;
});`, "Quando o bloco pronto não basta, um nó de código resolve."]
      ],
      a: [
        ['list', 'No-code em produção', ['Versione os fluxos (export JSON no Git)', 'Credenciais no cofre da ferramenta, nunca no corpo do nó', 'Tratamento de erro: error workflow com alerta', 'Cuidado com limites de taxa das APIs', 'Quando a lógica crescer muito, migre partes para código testável']]
      ],
      quiz: [
        { lv: '*', q: 'n8n, Zapier e Make servem para:', o: ['Ligar apps em automações sem (ou com pouco) código', 'Editar vídeo', 'Hospedar banco', 'Comprar domínio'], a: 0, w: 'Integração low-code.' },
        { lv: 'b', q: 'Montar automação com blocos é como:', o: ['Brincar de Lego', 'Ler um livro', 'Dormir', 'Cozinhar'], a: 0, w: 'Blocos.' },
        { lv: 'i', q: 'Qual pode ser hospedado por você de graça (open source)?', o: ['Zapier', 'n8n', 'Make', 'Nenhum'], a: 1, w: 'n8n.' },
        { lv: 'a', q: 'Boa prática com fluxos no-code:', o: ['Senha dentro do nó', 'Exportar e versionar os fluxos', 'Sem tratamento de erro', 'Um fluxo gigante só'], a: 1, w: 'Git.' }
      ]
    },
    {
      id: 'auto4', title: 'Bots, scraping, RPA e IA', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🦾', 'Um robô que usa o computador', "Às vezes o sistema não tem API. Aí dá para ensinar um robô a **clicar e digitar** igual uma pessoa: abrir o site, preencher, baixar o relatório."],
        ['an', '💬', 'Bots de conversa', "Bots de WhatsApp e Telegram respondem mensagens sozinhos: “Digite 1 para segunda via do boleto”."]
      ],
      i: [
        ['code', 'py', `# Playwright: robô de navegador
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page()
    pg.goto("https://portal.exemplo.com/login")
    pg.fill("#email", os.environ["PORTAL_USER"])
    pg.fill("#senha", os.environ["PORTAL_PASS"])
    pg.click("text=Entrar")
    with pg.expect_download() as d:
        pg.click("text=Exportar extrato")
    d.value.save_as("extrato.csv")
    nav.close()`, "Automatiza um portal sem API. Credenciais sempre em variáveis de ambiente."],
        ['list', 'Ordem de preferência', ['1º API oficial', '2º Exportação/arquivo (CSV, OFX, CNAB)', '3º Integração pronta (n8n/Zapier)', '4º Robô de interface (Playwright, RPA): quebra quando o site muda']],
        ['t', 'WhatsApp', "Para empresa, use a **API oficial do WhatsApp Business** (Cloud API ou parceiros como Z-API, Twilio, Gupshup). Mensagens iniciadas pela empresa exigem templates aprovados. Soluções não oficiais podem ter o número banido."]
      ],
      a: [
        ['list', 'Automação inteligente (com IA)', ['Classificar e-mails/mensagens e rotear para a fila certa', 'Extrair dados de PDFs e contratos para JSON', 'Resumir conversas para o CRM', 'Agentes que operam o navegador (computer use) para tarefas sem API, com supervisão', 'Sempre: confirmação humana antes de enviar, pagar ou apagar']],
        ['t', 'Scraping responsável', "Leia termos de uso e robots.txt, respeite limites (pausas entre requisições), identifique seu user-agent, não colete dados pessoais sem base legal (LGPD) e prefira API quando existir."]
      ],
      quiz: [
        { lv: '*', q: 'Quando um sistema não tem API, dá para:', o: ['Desistir sempre', 'Usar um robô que clica e digita (RPA/Playwright)', 'Usar DNS', 'Usar CSS'], a: 1, w: 'Automação de interface.' },
        { lv: 'b', q: 'Um bot de WhatsApp:', o: ['Responde mensagens sozinho', 'Conserta celular', 'Faz ligação de vídeo', 'Compra crédito'], a: 0, w: 'Atendimento automático.' },
        { lv: 'i', q: 'Primeira opção para integrar sistemas:', o: ['Robô de interface', 'API oficial', 'Copiar e colar', 'Print de tela'], a: 1, w: 'Mais estável.' },
        { lv: 'a', q: 'Ao usar IA para enviar mensagens a clientes automaticamente:', o: ['Envie sem revisão', 'Mantenha confirmação humana ou regras rígidas e logs', 'Use temperatura máxima', 'Desative logs'], a: 1, w: 'Ação irreversível.' }
      ]
    }
  ]
});
