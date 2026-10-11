CC.tracks.push({
  id: 'ppt', ord: -2, name: 'PowerPoint e Apresentações', short: 'PowerPoint', glyph: 'P', hue: 12,
  desc: 'Slides bonitos e claros, design, animações na medida certa e como apresentar com segurança.',
  test: [
    { d: 1, q: 'Para criar um slide novo:', o: ['Página Inicial → Novo Slide', 'Arquivo → Imprimir', 'Revisão → Ortografia', 'Exibir → Zoom'], a: 0 },
    { d: 1, q: 'F5 no PowerPoint:', o: ['Fecha o programa', 'Inicia a apresentação do começo', 'Salva', 'Imprime'], a: 1 },
    { d: 2, q: 'O ideal por slide é:', o: ['Um parágrafo inteiro de texto', 'Uma ideia principal com pouco texto', 'Todas as informações', '10 imagens'], a: 1 },
    { d: 2, q: 'O Slide Mestre serve para:', o: ['Mudar o layout de todos os slides de uma vez', 'Apagar slides', 'Gravar vídeo', 'Traduzir'], a: 0 },
    { d: 3, q: 'A transição “Transformar” (Morph) cria:', o: ['Som', 'Animação suave entre objetos iguais em slides seguidos', 'Um PDF', 'Legendas'], a: 1 },
    { d: 3, q: 'Modo do Apresentador mostra para quem apresenta:', o: ['Anotações, próximo slide e tempo', 'Só o slide atual', 'Os e-mails', 'Nada'], a: 0 }
  ],
  exam: [
    { t: 'order', q: 'Ordene a preparação de uma apresentação:', items: ['Definir a mensagem principal e o público', 'Escrever o roteiro (tópicos)', 'Montar os slides', 'Ensaiar com cronômetro', 'Apresentar'], w: 'Conteúdo antes do design.' },
    { t: 'tf', q: 'Ler o texto do slide em voz alta é a melhor forma de apresentar.', a: false, w: 'O slide apoia; quem conta a história é você.' },
    { q: 'Regra prática de texto em slide:', o: ['Frases completas e longas', 'Poucas palavras, fonte grande, uma ideia por slide', 'Fonte 10', 'Texto em todas as cores'], a: 1, w: 'Menos é mais.' },
    { t: 'fill', q: 'Tecla que inicia a apresentação do slide atual: Shift + ___', ans: ['f5'], w: 'F5 do início; Shift+F5 do atual.' },
    { q: 'Para mudar a fonte de todos os títulos de uma vez:', o: ['Editar o Slide Mestre', 'Mudar slide por slide', 'Imprimir', 'Trocar de computador'], a: 0, w: 'Exibir → Slide Mestre.' }
  ],
  lessons: [
    {
      id: 'ppt1', title: 'Slides que todo mundo entende', min: { b: 15, i: 15, a: 15 },
      b: [
        ['an', '🎞️', 'Slides são cartazes, não livros', "Cada slide é como um cartaz: alguém olha por poucos segundos. Por isso: **uma ideia por slide**, poucas palavras e letras grandes."],
        ['flow', 'Montando a primeira apresentação', ['Abra o PowerPoint e escolha um Design', 'Escreva o título no primeiro slide', 'Novo Slide para cada ideia', 'Inserir → Imagens para ilustrar', 'F5 para apresentar']],
        ['tip', "Regra fácil: se precisar de óculos para ler da última fileira, tem texto demais."]
      ],
      i: [
        ['list', 'Estrutura que convence', ['Abertura: o problema ou a pergunta', 'Meio: 3 pontos principais, no máximo', 'Dados: um gráfico simples por slide, com a conclusão no título', 'Fechamento: o que você quer que a pessoa faça (decisão, aprovação, próximo passo)', 'Títulos que afirmam: “Inadimplência caiu 18%” em vez de “Inadimplência”']],
        ['tip', "Designer (Página Inicial → Designer) sugere layouts prontos a partir do seu conteúdo."]
      ],
      a: [
        ['list', 'Design de apresentação', ['Grade e alinhamento: tudo alinhado a margens comuns', 'Hierarquia: tamanho e peso mostram o que é mais importante', 'No máximo 2 fontes e uma cor de destaque', 'Espaço em branco é design, não desperdício', 'Imagens de alta resolução e com direitos de uso']]
      ],
      rec: ['Uma ideia por slide, com pouco texto', 'Títulos que afirmam a conclusão', 'Três pontos principais no máximo', 'Feche com a ação que você quer da plateia', 'Alinhamento, contraste e espaço em branco fazem o design'],
      quiz: [
        { lv: '*', q: 'Quantas ideias principais por slide?', o: ['Uma', 'Cinco', 'Dez', 'Todas'], a: 0, w: 'Slide é cartaz.' },
        { lv: '*', t: 'tf', q: 'Títulos que afirmam a conclusão ajudam a plateia a entender.', a: true, w: '“Vendas subiram 20%” > “Vendas”.' },
        { lv: 'b', q: 'Qual tecla começa a apresentação?', o: ['F5', 'F1', 'Esc', 'Enter'], a: 0, w: 'F5.' },
        { lv: 'b', t: 'order', q: 'Ordene para montar a primeira apresentação:', items: ['Escolher um Design', 'Escrever o título', 'Criar um slide por ideia', 'Apresentar com F5'], w: 'Do modelo à apresentação.' },
        { lv: 'i', q: 'Melhor título para um slide de cobrança:', o: ['Cobrança', 'Dados', 'Inadimplência caiu 18% após lembretes automáticos', 'Slide 4'], a: 2, w: 'Afirma a mensagem.' },
        { lv: 'i', q: 'Recurso que sugere layouts automaticamente:', o: ['Designer', 'Ortografia', 'Slide Mestre', 'Zoom'], a: 0, w: 'Página Inicial → Designer.' },
        { lv: 'a', t: 'fill', q: 'Número máximo recomendado de fontes diferentes numa apresentação: ___', ans: ['2', 'duas', 'dois'], w: 'Uma para títulos, outra para texto.' },
        { lv: 'a', t: 'tf', q: 'Espaço em branco no slide é desperdício.', a: false, w: 'Ele dá respiro e foco.' }
      ]
    },
    {
      id: 'ppt2', title: 'Design, mestre e animações', min: { b: 12, i: 18, a: 18 },
      b: [
        ['an', '🎨', 'O molde de todos os slides', "O **Slide Mestre** é o molde: muda a fonte, a cor ou o logo nele, e todos os slides mudam juntos."],
        ['an', '✨', 'Animação com moderação', "Animação é tempero: um pouco deixa gostoso, muito estraga. Use para mostrar passos um de cada vez, não para fazer letras girarem."]
      ],
      i: [
        ['list', 'Recursos úteis', ['Exibir → Slide Mestre: fontes, cores, logo e rodapé', 'Transição “Transformar” (Morph): movimento suave entre slides', 'Animação “Surgir” por tópico para revelar passos', 'Ícones e modelos 3D: Inserir → Ícones', 'SmartArt transforma listas em diagramas']],
        ['tip', "Use a mesma transição em toda a apresentação. Trocar a cada slide distrai."]
      ],
      a: [
        ['list', 'Nível agência', ['Morph com objetos nomeados (!!nome) para animações cinematográficas', 'Zoom de resumo para navegar entre seções sem ordem fixa', 'Modelos (.potx) corporativos com layouts travados', 'Exportar como vídeo (Arquivo → Exportar) com narração gravada', 'Acessibilidade: ordem de leitura e texto alternativo']]
      ],
      rec: ['Slide Mestre muda todos os slides de uma vez', 'Animação é tempero: use para revelar passos', 'Mesma transição em toda a apresentação', 'Transformar (Morph) cria movimento suave', 'Dá para exportar a apresentação como vídeo'],
      quiz: [
        { lv: '*', q: 'Para mudar o logo de todos os slides de uma vez:', o: ['Slide Mestre', 'Copiar em cada slide', 'Imprimir', 'Animações'], a: 0, w: 'Exibir → Slide Mestre.' },
        { lv: '*', t: 'tf', q: 'Usar uma transição diferente em cada slide deixa a apresentação mais profissional.', a: false, w: 'Consistência é profissional.' },
        { lv: 'b', q: 'Animações devem ser usadas:', o: ['Em todas as letras', 'Com moderação, para revelar passos', 'Nunca', 'Só em títulos girando'], a: 1, w: 'Tempero.' },
        { lv: 'b', t: 'tf', q: 'O Slide Mestre é o molde dos slides.', a: true, w: 'Mude nele, muda em todos.' },
        { lv: 'i', q: 'Transição que move objetos suavemente entre slides:', o: ['Transformar (Morph)', 'Cortar', 'Esmaecer', 'Nenhuma'], a: 0, w: 'Morph.' },
        { lv: 'i', q: 'Transformar uma lista em diagrama:', o: ['SmartArt', 'Tabela', 'WordArt', 'Comentário'], a: 0, w: 'Inserir → SmartArt.' },
        { lv: 'a', t: 'fill', q: 'Extensão de modelo do PowerPoint: .___', ans: ['potx'], w: '.potx.' },
        { lv: 'a', q: 'Para navegar entre seções sem ordem fixa durante a apresentação:', o: ['Zoom de resumo', 'Imprimir', 'Ocultar slides', 'Tabela'], a: 0, w: 'Inserir → Zoom.' }
      ]
    },
    {
      id: 'ppt3', title: 'Apresentar com segurança', min: { b: 12, i: 15, a: 15 },
      b: [
        ['an', '🎤', 'Você é o filme, o slide é a legenda', "As pessoas vieram ouvir você. O slide só ajuda. Olhe para as pessoas, fale com calma e use o slide como apoio."],
        ['list', 'Antes de apresentar', ['Ensaie em voz alta pelo menos 2 vezes', 'Cronometre', 'Teste o projetor ou o compartilhamento de tela antes', 'Leve o arquivo também em PDF']]
      ],
      i: [
        ['tbl', 'Durante a apresentação', ['Tecla', 'Faz'], [['F5 / Shift+F5', 'começar do início / do slide atual'], ['B', 'tela preta (chama atenção para você)'], ['W', 'tela branca'], ['número + Enter', 'ir para o slide'], ['Ctrl + L', 'ponteiro laser'], ['Esc', 'sair']]],
        ['tip', "Modo do Apresentador mostra suas anotações, o próximo slide e o cronômetro só para você."]
      ],
      a: [
        ['list', 'Apresentações que decidem', ['Abra com a recomendação e depois sustente (pirâmide de Minto)', 'Antecipe objeções e tenha slides de apoio no apêndice', 'Pausas de 2 segundos depois de números importantes', 'Em reuniões online: câmera na altura dos olhos, compartilhe só a janela', 'Termine pedindo a decisão: “Aprovamos o plano de renegociação?”']]
      ],
      rec: ['Você é a apresentação; o slide é apoio', 'Ensaie em voz alta e cronometre', 'Tecla B deixa a tela preta para focar em você', 'Modo do Apresentador mostra anotações e tempo', 'Termine pedindo a decisão ou ação'],
      quiz: [
        { lv: '*', q: 'Qual a melhor forma de apresentar?', o: ['Ler os slides', 'Falar com as pessoas usando os slides como apoio', 'Ficar de costas', 'Mostrar 50 slides em 5 minutos'], a: 1, w: 'Slide apoia, você conta.' },
        { lv: '*', t: 'tf', q: 'Ensaiar em voz alta ajuda a apresentar melhor.', a: true, w: 'E cronometre.' },
        { lv: 'b', q: 'Levar o arquivo também em PDF serve para:', o: ['Garantir que abre em qualquer computador', 'Deixar colorido', 'Ter animações', 'Nada'], a: 0, w: 'Plano B.' },
        { lv: 'b', t: 'order', q: 'Ordene a preparação:', items: ['Montar os slides', 'Ensaiar em voz alta', 'Testar o projetor', 'Apresentar'], w: 'Preparação evita sustos.' },
        { lv: 'i', q: 'Tecla que deixa a tela preta durante a apresentação:', o: ['B', 'P', 'F1', 'Tab'], a: 0, w: 'B de black.' },
        { lv: 'i', t: 'fill', q: 'Para começar do slide atual: Shift + ___', ans: ['f5'], w: 'Shift+F5.' },
        { lv: 'a', q: 'A pirâmide de Minto recomenda começar por:', o: ['O histórico completo', 'A recomendação/conclusão', 'Os dados brutos', 'Agradecimentos'], a: 1, w: 'Conclusão primeiro, depois argumentos.' },
        { lv: 'a', t: 'tf', q: 'Numa reunião online, compartilhar só a janela da apresentação evita expor notificações.', a: true, w: 'Em vez da tela inteira.' }
      ]
    }
  ]
});

CC.tracks.push({
  id: 'ws', ord: -1, name: 'Google Workspace e Microsoft 365', short: 'Google e 365', glyph: '⧉', hue: 48,
  desc: 'Gmail e Outlook, agenda, Drive e OneDrive, Docs e Planilhas Google, Teams e Meet, Forms e trabalho em equipe.',
  test: [
    { d: 1, q: 'Google Planilhas é parecido com:', o: ['Excel', 'Paint', 'Windows', 'Chrome'], a: 0 },
    { d: 1, q: 'Para marcar uma reunião com convite para várias pessoas:', o: ['Google Agenda ou Outlook Calendário', 'Bloco de notas', 'Calculadora', 'Lixeira'], a: 0 },
    { d: 2, q: 'Vantagem de editar um documento online com a equipe:', o: ['Todos editam ao mesmo tempo, na mesma versão', 'Fica mais lento', 'Precisa de pendrive', 'Nenhuma'], a: 0 },
    { d: 2, q: 'Google Forms serve para:', o: ['Criar formulários e pesquisas que alimentam uma planilha', 'Editar vídeo', 'Antivírus', 'Desenhar'], a: 0 },
    { d: 3, q: 'Apps Script e Power Automate permitem:', o: ['Automatizar tarefas entre os apps do Google/Microsoft', 'Montar computador', 'Criar Wi-Fi', 'Formatar disco'], a: 0 },
    { d: 3, q: 'No Google Planilhas, IMPORTRANGE serve para:', o: ['Importar dados de outra planilha', 'Importar fotos', 'Imprimir', 'Traduzir'], a: 0 }
  ],
  exam: [
    { t: 'order', q: 'Ordene a criação de um formulário de cadastro:', items: ['Criar o Google Forms', 'Adicionar as perguntas', 'Vincular a uma planilha', 'Compartilhar o link', 'Analisar as respostas na planilha'], w: 'As respostas caem na planilha.' },
    { t: 'tf', q: 'Num documento compartilhado, dá para ver o histórico de versões e restaurar uma anterior.', a: true, w: 'Arquivo → Histórico de versões.' },
    { q: 'Para mencionar alguém num comentário e avisá-lo:', o: ['Digitar @ e o nome', 'Escrever em vermelho', 'Mandar print', 'Imprimir'], a: 0, w: '@menção notifica a pessoa.' },
    { t: 'fill', q: 'Função do Google Planilhas que traduz texto: =___(A2;"en";"pt")', ans: ['googletranslate'], w: 'GOOGLETRANSLATE.' },
    { q: 'Melhor lugar para arquivos que pertencem à equipe, não a uma pessoa:', o: ['Drive compartilhado / SharePoint da equipe', 'Meu Drive pessoal', 'Área de Trabalho', 'Pendrive'], a: 0, w: 'Se a pessoa sair, os arquivos ficam.' }
  ],
  lessons: [
    {
      id: 'ws1', title: 'E-mail, agenda e reuniões', min: { b: 12, i: 15, a: 15 },
      b: [
        ['an', '📅', 'A agenda que lembra por você', "No Google Agenda ou no Outlook, você marca compromissos e o computador avisa antes. Pode convidar outras pessoas: elas recebem o convite e respondem Sim, Não ou Talvez."],
        ['flow', 'Marcar uma reunião online', ['Abra a Agenda e clique no horário', 'Escreva o título', 'Adicione os convidados pelo e-mail', 'Adicione videochamada (Meet ou Teams)', 'Salvar e enviar']]
      ],
      i: [
        ['list', 'Produtividade no e-mail e agenda', ['Marcadores (Gmail) ou pastas (Outlook) e filtros automáticos', 'Respostas prontas para mensagens repetidas', 'Agendar envio', 'Bloquear tempo de foco na agenda', 'Ver disponibilidade dos colegas antes de marcar', 'Página de agendamento para clientes escolherem horário']]
      ],
      a: [
        ['list', 'Administração e integração', ['Caixas compartilhadas (financeiro@, cobranca@) com responsáveis', 'Grupos de e-mail para equipes', 'Regras de retenção e DLP', 'Integração com CRM: e-mails e reuniões registrados no cliente', 'APIs (Gmail, Graph) para automatizar envios e leituras']]
      ],
      rec: ['A agenda avisa e envia convites', 'Videochamada (Meet/Teams) direto no convite', 'Filtros e marcadores organizam o e-mail sozinhos', 'Respostas prontas e envio agendado poupam tempo', 'Caixas compartilhadas para setores como financeiro'],
      quiz: [
        { lv: '*', q: 'Para convidar pessoas para uma reunião:', o: ['Criar evento na agenda e adicionar convidados', 'Mandar um print', 'Ligar para cada um sempre', 'Imprimir'], a: 0, w: 'Convite pelo calendário.' },
        { lv: '*', t: 'tf', q: 'Dá para adicionar o link do Meet ou Teams direto no convite.', a: true, w: 'Videochamada integrada.' },
        { lv: 'b', t: 'order', q: 'Ordene para marcar uma reunião online:', items: ['Clicar no horário', 'Escrever o título', 'Adicionar convidados', 'Adicionar videochamada', 'Salvar'], w: 'O convite chega por e-mail.' },
        { lv: 'b', q: 'A agenda digital serve para:', o: ['Lembrar compromissos e convidar pessoas', 'Editar fotos', 'Instalar programas', 'Limpar vírus'], a: 0, w: 'Organiza o tempo.' },
        { lv: 'i', q: 'Para organizar automaticamente e-mails de um banco numa pasta:', o: ['Filtro/regra', 'Apagar todos', 'Imprimir', 'Cco'], a: 0, w: 'Regras por remetente ou assunto.' },
        { lv: 'i', q: 'Para clientes escolherem um horário livre sozinhos:', o: ['Página de agendamento', 'Planilha impressa', 'Ligação', 'Pendrive'], a: 0, w: 'Reservas de horário.' },
        { lv: 'a', t: 'fill', q: 'API da Microsoft para e-mail, agenda e arquivos do 365: Microsoft ___', ans: ['graph'], w: 'Microsoft Graph.' },
        { lv: 'a', q: 'Para o e-mail do setor financeiro ser lido por toda a equipe:', o: ['Caixa compartilhada', 'Senha compartilhada no papel', 'Encaminhar tudo manualmente', 'Cco'], a: 0, w: 'Acesso por permissão, sem dividir senha.' }
      ]
    },
    {
      id: 'ws2', title: 'Docs, Planilhas e Drive em equipe', min: { b: 12, i: 18, a: 18 },
      b: [
        ['an', '👥', 'Todo mundo no mesmo caderno', "Com Google Docs, Planilhas ou o Word online, várias pessoas escrevem no **mesmo arquivo ao mesmo tempo**. Nada de “versão final 3 corrigida.docx”."],
        ['list', 'Recursos de equipe', ['Compartilhar com e-mail e escolher: ver, comentar ou editar', 'Comentários com @nome avisam a pessoa', 'Histórico de versões: volta ao texto de ontem', 'Funciona no navegador e no celular']]
      ],
      i: [
        ['tbl', 'Excel x Google Planilhas', ['Recurso', 'Excel', 'Google Planilhas'], [['Fórmulas', '; separador (pt-BR)', '; separador (pt-BR)'], ['Busca', 'PROCV, PROCX', 'PROCV, PROCX, QUERY'], ['Extra', 'Power Query, Power Pivot', 'IMPORTRANGE, GOOGLETRANSLATE, GOOGLEFINANCE'], ['Automação', 'VBA, Office Scripts', 'Apps Script'], ['Grandes volumes', 'melhor', 'limite ~10 milhões de células']]],
        ['code', 'text', `=QUERY(A1:D100; "select A, sum(B) where C = 'vencido' group by A"; 1)
=IMPORTRANGE("url-da-outra-planilha"; "Base!A1:D500")
=FILTER(A2:D100; D2:D100="vencido")`, "QUERY usa uma linguagem parecida com SQL dentro da planilha: um ótimo trampolim para aprender SQL."]
      ],
      a: [
        ['code', 'js', `// Apps Script: e-mail de lembrete para cada parcela vencida
function lembrarVencidos() {
  const dados = SpreadsheetApp.getActive().getSheetByName("Parcelas").getDataRange().getValues();
  dados.slice(1).forEach(([cliente, email, valor, status]) => {
    if (status === "vencido") {
      GmailApp.sendEmail(email, "Lembrete de pagamento",
        \`Olá, \${cliente}! Identificamos a parcela de R$ \${valor} em aberto.\`);
    }
  });
}`, "Apps Script é JavaScript na nuvem do Google: com um gatilho diário, vira uma automação de cobrança. Teste com seu e-mail antes de ligar para clientes."],
        ['list', 'Governança', ['Drives compartilhados por área', 'Rótulos e classificação de dados sensíveis', 'Auditoria de compartilhamento externo', 'Transferência de propriedade na saída de funcionários']]
      ],
      rec: ['Várias pessoas editam o mesmo arquivo ao mesmo tempo', 'Comentário com @ avisa a pessoa', 'Histórico de versões recupera o texto anterior', 'QUERY traz uma linguagem parecida com SQL para a planilha', 'Apps Script automatiza Gmail, Planilhas e Drive'],
      quiz: [
        { lv: '*', q: 'Qual a vantagem de editar online em equipe?', o: ['Todos trabalham na mesma versão ao mesmo tempo', 'Precisa de pendrive', 'Fica offline sempre', 'Não salva'], a: 0, w: 'Fim das várias versões.' },
        { lv: '*', t: 'tf', q: 'Dá para restaurar uma versão anterior de um Google Doc.', a: true, w: 'Histórico de versões.' },
        { lv: 'b', q: 'Para alguém só ler sem mudar nada, compartilhe como:', o: ['Leitor', 'Editor', 'Proprietário', 'Administrador'], a: 0, w: 'Menor permissão necessária.' },
        { lv: 'b', t: 'fill', q: 'Para avisar a colega num comentário, digite ___ e o nome dela', ans: ['@'], w: '@menção.' },
        { lv: 'i', q: 'Função do Google Planilhas parecida com SQL:', o: ['QUERY', 'SOMA', 'MÉDIA', 'ARRED'], a: 0, w: 'QUERY.' },
        { lv: 'i', q: 'Trazer dados de outra planilha do Google:', o: ['IMPORTRANGE', 'PROCV sozinho', 'COPIAR', 'GOOGLEFINANCE'], a: 0, w: 'Precisa autorizar o acesso na primeira vez.' },
        { lv: 'a', q: 'Apps Script é baseado em:', o: ['JavaScript', 'Python', 'C#', 'VBA'], a: 0, w: 'Roda na nuvem do Google.' },
        { lv: 'a', t: 'tf', q: 'Antes de rodar uma automação de e-mail para clientes, é prudente testar com seu próprio e-mail.', a: true, w: 'Evita mandar mensagens erradas para todos.' }
      ]
    },
    {
      id: 'ws3', title: 'Formulários, Teams e automação sem código', min: { b: 12, i: 15, a: 18 },
      b: [
        ['an', '📋', 'Formulário que preenche a planilha', "Com Google Forms ou Microsoft Forms você cria uma ficha (nome, telefone, interesse). As pessoas respondem pelo celular e as respostas caem sozinhas numa planilha."],
        ['an', '💬', 'Teams e chats de equipe', "Teams, Slack e Google Chat organizam conversas por **canais** (Financeiro, Comercial). Arquivos, reuniões e conversas ficam juntos."]
      ],
      i: [
        ['list', 'Ideias práticas', ['Formulário de solicitação de reembolso → planilha → aprovação', 'Pesquisa de satisfação depois do atendimento', 'Cadastro de leads do Instagram → planilha → CRM', 'Canal de avisos com mensagens fixadas', 'Aprovações no Teams com Power Automate']]
      ],
      a: [
        ['list', 'Automação no ecossistema', ['Power Automate: gatilho (formulário enviado) → ações (criar item, mandar Teams, salvar PDF)', 'AppSheet / Power Apps: transformar planilha em aplicativo sem código', 'Webhooks de Forms/Typeform para seu backend', 'Conectores com Conta Azul, RD Station, Asaas via n8n ou Make', 'Logs e responsáveis definidos para cada fluxo']]
      ],
      rec: ['Formulários enviam respostas direto para a planilha', 'Teams/Slack organizam conversas por canais', 'Power Automate liga gatilhos a ações', 'Power Apps e AppSheet viram app a partir de planilha', 'Toda automação precisa de dono e registro'],
      quiz: [
        { lv: '*', q: 'As respostas de um Google Forms podem cair automaticamente em:', o: ['Uma planilha', 'O papel de parede', 'O Paint', 'A Lixeira'], a: 0, w: 'Vincule a uma planilha.' },
        { lv: '*', t: 'tf', q: 'Power Apps e AppSheet transformam planilhas em aplicativos sem programar.', a: true, w: 'Low-code.' },
        { lv: 'b', q: 'No Teams, conversas da equipe ficam organizadas em:', o: ['Canais', 'Pastas do Paint', 'Planilhas', 'Impressoras'], a: 0, w: 'Canais por assunto ou setor.' },
        { lv: 'b', t: 'order', q: 'Ordene o caminho de uma pesquisa de satisfação:', items: ['Criar o formulário', 'Enviar o link ao cliente', 'Cliente responde', 'Resposta cai na planilha'], w: 'Automático depois de criado.' },
        { lv: 'i', q: 'Um bom uso de formulário numa clínica:', o: ['Pré-cadastro e pesquisa de satisfação', 'Guardar senhas', 'Editar fotos', 'Formatar PC'], a: 0, w: 'Coleta estruturada.' },
        { lv: 'i', t: 'fill', q: 'Ferramenta da Microsoft que liga “quando acontecer X, faça Y”: Power ___', ans: ['automate'], w: 'Power Automate.' },
        { lv: 'a', q: 'Para enviar respostas de formulário direto ao seu sistema:', o: ['Webhook', 'Imprimir', 'Pendrive', 'Print de tela'], a: 0, w: 'Chamada HTTP automática.' },
        { lv: 'a', t: 'tf', q: 'Automações devem ter um responsável e registro de execuções.', a: true, w: 'Senão ninguém percebe quando quebram.' }
      ]
    }
  ]
});
