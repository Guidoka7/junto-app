CC.tracks.push({
  id: 'excelpro', ord: -3, name: 'Excel Avançado e Power BI', short: 'Excel Pro', glyph: 'BI', hue: 100,
  desc: 'Tabelas, tabela dinâmica, gráficos, dashboards, Power Query, Power BI com DAX e automação com macros.',
  test: [
    { d: 1, q: 'Ctrl + T transforma um intervalo em:', o: ['Texto', 'Tabela (com filtros e formatação automática)', 'Gráfico', 'PDF'], a: 1 },
    { d: 1, q: 'Tabela dinâmica serve para:', o: ['Desenhar', 'Resumir muitos dados em poucos cliques (somar, contar por categoria)', 'Corrigir ortografia', 'Enviar e-mail'], a: 1 },
    { d: 2, q: 'Formatação condicional é:', o: ['Pintar células automaticamente conforme uma regra', 'Mudar a fonte do arquivo', 'Proteger a planilha', 'Imprimir'], a: 0 },
    { d: 2, q: 'Power Query é usado para:', o: ['Importar, limpar e combinar dados de forma repetível', 'Desenhar gráficos 3D', 'Enviar WhatsApp', 'Gravar vídeos'], a: 0 },
    { d: 3, q: 'No Power BI, uma medida DAX como `Total = SUM(Vendas[Valor])`:', o: ['É calculada no contexto de cada filtro do relatório', 'É uma coluna fixa', 'Só funciona no Excel', 'É um gráfico'], a: 0 },
    { d: 3, q: 'Modelo estrela tem:', o: ['Uma tabela só', 'Tabela fato no centro ligada a tabelas de dimensão', 'Só gráficos', 'Abas coloridas'], a: 1 }
  ],
  exam: [
    { t: 'order', q: 'Ordene a criação de uma tabela dinâmica:', items: ['Clicar em qualquer célula da base', 'Inserir → Tabela Dinâmica', 'Arrastar campo para Linhas', 'Arrastar valor para Valores', 'Aplicar filtros ou segmentações'], w: 'A base precisa estar organizada em tabela.' },
    { t: 'tf', q: 'Ao atualizar a base, a tabela dinâmica se atualiza sozinha sem precisar clicar em nada.', a: false, w: 'Clique em Atualizar (ou configure atualizar ao abrir).' },
    { q: 'Para mostrar a evolução do faturamento mês a mês, o gráfico mais indicado é:', o: ['Pizza', 'Linha ou colunas', 'Radar', 'Dispersão 3D'], a: 1, w: 'Tempo no eixo X.' },
    { t: 'fill', q: 'Linguagem de fórmulas do Power BI: ___', ans: ['dax'], w: 'Data Analysis Expressions.' },
    { q: 'Qual a vantagem do Power Query sobre limpar dados à mão?', o: ['É colorido', 'Os passos ficam gravados e se repetem com um clique a cada novo arquivo', 'Não precisa de dados', 'É mais lento'], a: 1, w: 'Automatiza a preparação dos dados.' }
  ],
  lessons: [
    {
      id: 'xp1', title: 'Tabelas, filtros e formatação condicional', min: { b: 15, i: 18, a: 18 },
      b: [
        ['an', '🗂️', 'Arrumar a bagunça de uma vez', "Selecione os dados e aperte **Ctrl + T**: vira uma **Tabela**, com cabeçalho fixo, listras e filtros. Fórmulas novas se copiam sozinhas para as linhas novas."],
        ['list', 'Ferramentas que salvam o dia', ['**Classificar**: ordenar de A a Z ou do maior para o menor', '**Filtrar**: mostrar só o que interessa (só “vencido”)', '**Formatação condicional**: pintar de vermelho valores atrasados', '**Validação de dados**: lista suspensa para ninguém digitar errado']]
      ],
      i: [
        ['list', 'Formatação condicional útil', ['Realçar regras → Maior que: valores acima da meta', 'Barras de dados: tamanho visual do valor', 'Escala de cor: do verde ao vermelho', 'Fórmula personalizada: `=$D2="vencido"` pinta a linha inteira', 'Remover duplicadas: Dados → Remover Duplicatas (confira antes)']],
        ['sheet', 'Limpando dados com funções de texto', [['Nome digitado', 'Limpo'], ['  ana   souza ', '=PRI.MAIÚSCULA(ARRUMAR(A2))'], ['BRUNO LIMA', '=PRI.MAIÚSCULA(ARRUMAR(A3))'], ['carla  dias', '=PRI.MAIÚSCULA(ARRUMAR(A4))']], "ARRUMAR tira espaços sobrando; PRI.MAIÚSCULA deixa só a primeira letra de cada palavra em maiúscula."]
      ],
      a: [
        ['list', 'Planilha à prova de erro', ['Validação com lista vinda de outra aba (=Listas!A:A)', 'Proteger planilha liberando só células de entrada', 'Referências estruturadas: `=SOMA(Tabela1[Valor])` não quebra quando a tabela cresce', 'Segmentações (slicers) também funcionam em tabelas comuns', 'Evitar funções voláteis (DESLOC, INDIRETO) em bases grandes']]
      ],
      rec: ['Ctrl+T transforma dados em Tabela com filtros', 'Classificar ordena; filtrar mostra só o que interessa', 'Formatação condicional pinta células por regra', 'Validação de dados cria listas suspensas', 'ARRUMAR e PRI.MAIÚSCULA limpam textos'],
      quiz: [
        { lv: '*', q: 'Qual atalho transforma o intervalo em Tabela?', o: ['Ctrl + T', 'Ctrl + P', 'Alt + F4', 'F5'], a: 0, w: 'Ctrl+T (ou Ctrl+Alt+T em algumas versões).' },
        { lv: '*', t: 'tf', q: 'Formatação condicional muda a cor da célula automaticamente conforme uma regra.', a: true, w: 'Ex.: vermelho para vencidos.' },
        { lv: 'b', q: 'Para mostrar só os clientes vencidos, use:', o: ['Filtro', 'Negrito', 'Zoom', 'Mesclar'], a: 0, w: 'Filtro na coluna Status.' },
        { lv: 'b', q: 'Para criar uma lista suspensa numa célula:', o: ['Validação de dados', 'Formatação condicional', 'Gráfico', 'Imprimir'], a: 0, w: 'Dados → Validação → Lista.' },
        { lv: 'i', t: 'fill', q: 'Função que remove espaços extras de um texto: =___(A2)', ans: ['arrumar', 'trim'], w: 'ARRUMAR.' },
        { lv: 'i', q: 'Regra de formatação para pintar a linha inteira quando D for “vencido”:', o: ['=$D2="vencido"', '=D$2="vencido"', '=SOMA(D2)', '="vencido"'], a: 0, w: 'Coluna fixa ($D), linha relativa.' },
        { lv: 'a', q: '`=SOMA(Tabela1[Valor])` é um exemplo de:', o: ['Referência estruturada', 'Erro', 'Macro', 'Gráfico'], a: 0, w: 'Cresce com a tabela.' },
        { lv: 'a', t: 'tf', q: 'DESLOC e INDIRETO são funções voláteis que podem deixar planilhas grandes lentas.', a: true, w: 'Recalculam a cada alteração.' }
      ],
      lab: { lang: 'xls', task: 'Limpe os nomes: em **B2:B4**, use ARRUMAR e MAIÚSCULA para deixar tudo sem espaços extras e em maiúsculas.', grid: [['Nome digitado', 'Limpo'], ['  ana   souza ', ''], ['bruno lima', ''], [' carla  dias', '']], targets: ['B2', 'B3', 'B4'], sol: { B2: '=MAIÚSCULA(ARRUMAR(A2))', B3: '=MAIÚSCULA(ARRUMAR(A3))', B4: '=MAIÚSCULA(ARRUMAR(A4))' }, hint: '=MAIÚSCULA(ARRUMAR(A2)) e copie para baixo.' }
    },
    {
      id: 'xp2', title: 'Tabela dinâmica', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🧲', 'O ímã que organiza', "Imagine 10 mil vendas bagunçadas. A **tabela dinâmica** é um ímã: você diz “junte por cidade e some os valores” e em segundos aparece um resumo arrumado."],
        ['flow', 'Montando em 4 passos', ['Clique na base de dados', 'Inserir → Tabela Dinâmica', 'Arraste Cidade para Linhas', 'Arraste Valor para Valores']],
        ['sheet', 'O que a tabela dinâmica faz por baixo', [['Cidade', 'Valor', '', 'Resumo', 'Total'], ['Brasília', '1200', '', 'Brasília', '=SOMASE(A2:A6;D2;B2:B6)'], ['Planaltina', '850', '', 'Planaltina', '=SOMASE(A2:A6;D3;B2:B6)'], ['Brasília', '3100', '', 'Goiânia', '=SOMASE(A2:A6;D4;B2:B6)'], ['Goiânia', '430', '', '', ''], ['Brasília', '990', '', '', '']], "Este resumo foi feito com SOMASE. A tabela dinâmica faz o mesmo arrastando campos, para qualquer volume de dados."]
      ],
      i: [
        ['list', 'Recursos que impressionam', ['Colunas: cruzar Cidade × Mês', 'Valores: trocar Soma por Contagem, Média, % do total', 'Agrupar datas por mês, trimestre, ano', 'Segmentação de dados: botões para filtrar', 'Clique duplo num número abre os registros por trás dele', 'Atualizar: Dados → Atualizar tudo depois de mudar a base']],
        ['tip', "Base para tabela dinâmica: uma linha por registro, cabeçalho único, sem linhas em branco. Formate como Tabela (Ctrl+T) e ela cresce sozinha."]
      ],
      a: [
        ['list', 'Além do básico', ['Campos calculados (ex.: margem = lucro/receita)', 'Mostrar valores como: % da linha, diferença do mês anterior, ranking', 'Modelo de dados (Power Pivot): relacionar várias tabelas sem PROCV', 'Medidas DAX dentro do Excel', 'Linha do tempo para filtrar datas visualmente']]
      ],
      rec: ['Tabela dinâmica resume milhares de linhas arrastando campos', 'Linhas agrupam; Valores somam, contam ou fazem média', 'Datas podem ser agrupadas por mês e ano', 'Segmentações viram botões de filtro', 'Atualize depois de mudar a base'],
      quiz: [
        { lv: '*', q: 'Para somar as vendas por cidade em segundos, use:', o: ['Tabela dinâmica', 'Corretor ortográfico', 'Mesclar células', 'Zoom'], a: 0, w: 'Cidade em Linhas, Valor em Valores.' },
        { lv: '*', t: 'tf', q: 'Depois de mudar a base, é preciso atualizar a tabela dinâmica.', a: true, w: 'Dados → Atualizar tudo.' },
        { lv: 'b', t: 'order', q: 'Ordene a montagem da tabela dinâmica:', items: ['Clicar na base', 'Inserir → Tabela Dinâmica', 'Cidade em Linhas', 'Valor em Valores'], w: 'Quatro passos.' },
        { lv: 'b', q: 'Na tabela dinâmica, o campo que vai em Valores é geralmente:', o: ['Um número para somar ou contar', 'Um título', 'Uma cor', 'Uma imagem'], a: 0, w: 'Valores agrega números.' },
        { lv: 'i', q: 'Para ver vendas por mês tendo datas diárias:', o: ['Agrupar datas por mês', 'Digitar meses à mão', 'Apagar os dias', 'Usar PROCV'], a: 0, w: 'Botão direito → Agrupar.' },
        { lv: 'i', q: 'Clique duplo num total da tabela dinâmica:', o: ['Apaga o valor', 'Abre os registros que formam aquele total', 'Muda a cor', 'Fecha o Excel'], a: 1, w: 'Detalhamento (drill-through).' },
        { lv: 'a', q: 'Para relacionar Vendas e Clientes sem PROCV:', o: ['Modelo de dados (Power Pivot) com relacionamento', 'Copiar e colar', 'Mesclar células', 'Gráfico'], a: 0, w: 'Relacionamentos como num banco de dados.' },
        { lv: 'a', t: 'fill', q: 'Botões visuais para filtrar a tabela dinâmica se chamam segmentação de ___', ans: ['dados'], w: 'Slicers.' }
      ],
      lab: { lang: 'xls', task: 'Monte o resumo à mão: em **E2:E4**, some os valores de cada status (D) usando SOMASE.', grid: [['Cliente', 'Valor', 'Status', 'Status', 'Total'], ['Ana', '1200', 'pago', 'pago', ''], ['Bruno', '850', 'vencido', 'vencido', ''], ['Carla', '3100', 'pago', 'aberto', ''], ['Diego', '430', 'vencido', '', ''], ['Elisa', '990', 'aberto', '', '']], targets: ['E2', 'E3', 'E4'], sol: { E2: '=SOMASE(C2:C6;D2;B2:B6)', E3: '=SOMASE(C2:C6;D3;B2:B6)', E4: '=SOMASE(C2:C6;D4;B2:B6)' }, hint: '=SOMASE(C2:C6;D2;B2:B6) e copie para baixo. Ou use $ para travar os intervalos.' }
    },
    {
      id: 'xp3', title: 'Gráficos e dashboards', min: { b: 12, i: 18, a: 18 },
      b: [
        ['an', '📊', 'Um desenho vale mil números', "Uma coluna de números é difícil de entender. Um **gráfico** mostra num relance o que subiu, o que caiu e o que é maior."],
        ['tbl', 'Qual gráfico usar', ['Pergunta', 'Gráfico'], [['Como evoluiu no tempo?', 'Linha'], ['Quem é maior?', 'Barras'], ['Qual a parte de cada um no todo (poucas partes)?', 'Rosca/pizza'], ['Duas medidas se relacionam?', 'Dispersão']]]
      ],
      i: [
        ['list', 'Gráfico profissional', ['Título que diz a conclusão: “Vencidos caíram 30% em setembro”', 'Tire o que não ajuda: linhas de grade fortes, 3D, legendas óbvias', 'Barras sempre começando do zero', 'Destaque com cor só o que importa; o resto em cinza', 'Rótulos de dados no lugar de eixos poluídos']],
        ['list', 'Dashboard no Excel', ['Aba Base (dados), aba Cálculos, aba Painel', 'Indicadores no topo: total, % vencido, ticket médio', 'Gráficos dinâmicos ligados a tabelas dinâmicas', 'Segmentações para filtrar o painel inteiro', 'Atualizar tudo com um botão']]
      ],
      a: [
        ['list', 'Visualização de dados com rigor', ['Uma mensagem por gráfico', 'Comparações lado a lado, mesma escala', 'Evite pizza com mais de 4 fatias; prefira barras ordenadas', 'Cores acessíveis (daltonismo) e contraste', 'Mostre a meta e o período de comparação (mês anterior, mesmo mês do ano passado)']]
      ],
      rec: ['Linha para tempo, barras para comparar, pizza só com poucas partes', 'Título com a conclusão do gráfico', 'Barras começam do zero', 'Cor para destacar, cinza para o resto', 'Dashboard: indicadores no topo e filtros que controlam tudo'],
      quiz: [
        { lv: '*', q: 'Para mostrar a evolução das vendas mês a mês:', o: ['Pizza', 'Linha', 'Radar', 'Rosca 3D'], a: 1, w: 'Tempo pede linha.' },
        { lv: '*', t: 'tf', q: 'Gráfico de pizza com 12 fatias é fácil de ler.', a: false, w: 'Use barras ordenadas.' },
        { lv: 'b', q: 'Para comparar o faturamento de 5 lojas:', o: ['Barras', 'Linha do tempo', 'Mapa', 'Texto'], a: 0, w: 'Barras comparam tamanhos.' },
        { lv: 'b', t: 'tf', q: 'Um gráfico ajuda a entender números rapidamente.', a: true, w: 'Visual é mais rápido que tabela.' },
        { lv: 'i', q: 'Melhor título de gráfico:', o: ['Gráfico 1', 'Vendas', 'Vencidos caíram 30% em setembro', 'Dados'], a: 2, w: 'Título com a conclusão.' },
        { lv: 'i', t: 'order', q: 'Ordene as abas de um dashboard bem organizado:', items: ['Base (dados)', 'Cálculos', 'Painel'], w: 'Dados separados da apresentação.' },
        { lv: 'a', q: 'Por que o eixo de barras deve começar no zero?', o: ['Estética', 'Para não exagerar visualmente as diferenças', 'Obrigatório no Excel', 'Para caber mais'], a: 1, w: 'O comprimento da barra representa o valor.' },
        { lv: 'a', t: 'fill', q: 'Para comparar com o mesmo mês do ano anterior usa-se a sigla em inglês ___', ans: ['yoy'], w: 'Year over year.' }
      ]
    },
    {
      id: 'xp4', title: 'Power Query: dados no automático', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🤖', 'Um robô que limpa os dados', "Todo mês chega o mesmo relatório do banco, e você perde uma hora limpando? O **Power Query** grava os passos de limpeza uma vez. No mês seguinte, é só clicar em **Atualizar**."],
        ['flow', 'O ciclo', ['Dados → Obter Dados (Excel, CSV, pasta, web, banco)', 'Limpar no editor (tirar colunas, trocar tipos, filtrar)', 'Fechar e Carregar', 'Mês que vem: Atualizar']]
      ],
      i: [
        ['list', 'Transformações mais usadas', ['Usar primeira linha como cabeçalho', 'Alterar tipo (data, número decimal, texto)', 'Dividir coluna por delimitador', 'Remover linhas em branco e duplicatas', 'Substituir valores', 'Mesclar consultas (como PROCV entre tabelas)', 'Acrescentar consultas (empilhar meses)', 'Importar uma pasta inteira: junta todos os CSVs de uma vez']],
        ['tip', "Cada clique vira um passo em “Etapas aplicadas”. Errou? Apague só aquele passo."]
      ],
      a: [
        ['code', 'm', `let
    Fonte = Csv.Document(File.Contents("C:\\relatorios\\banco.csv"), [Delimiter=";", Encoding=65001]),
    Cab = Table.PromoteHeaders(Fonte),
    Tipos = Table.TransformColumnTypes(Cab, {{"Vencimento", type date}, {"Valor", type number}}, "pt-BR"),
    Vencidos = Table.SelectRows(Tipos, each [Vencimento] < Date.From(DateTime.LocalNow()) and [Status] <> "LIQUIDADO")
in
    Vencidos`, "Por trás dos cliques existe a linguagem M. Editar o código permite parametrizar caminhos e criar funções."],
        ['list', 'Boas práticas', ['Defina a cultura (pt-BR) ao converter números e datas', 'Parâmetros para caminhos de pasta', 'Dobramento de consulta (query folding): filtre cedo quando a fonte é banco', 'A mesma consulta funciona no Power BI']]
      ],
      rec: ['Power Query grava os passos de limpeza e repete com um clique', 'Obter Dados aceita Excel, CSV, pasta, web e banco', 'Mesclar consultas é como PROCV entre tabelas', 'Acrescentar consultas empilha meses', 'Por trás dos cliques existe a linguagem M'],
      quiz: [
        { lv: '*', q: 'A principal vantagem do Power Query é:', o: ['Desenhar', 'Repetir a limpeza de dados automaticamente', 'Enviar e-mail', 'Proteger senhas'], a: 1, w: 'Grava e repete os passos.' },
        { lv: '*', t: 'tf', q: 'Dá para importar todos os CSVs de uma pasta de uma vez com Power Query.', a: true, w: 'Obter Dados → Pasta.' },
        { lv: 'b', t: 'order', q: 'Ordene o ciclo do Power Query:', items: ['Obter Dados', 'Limpar no editor', 'Fechar e Carregar', 'Atualizar no mês seguinte'], w: 'Uma vez montado, só atualizar.' },
        { lv: 'b', q: 'Onde fica o Power Query no Excel?', o: ['Guia Dados → Obter Dados', 'Guia Inserir → Imagens', 'Guia Revisão', 'Arquivo → Imprimir'], a: 0, w: 'Obter e Transformar Dados.' },
        { lv: 'i', q: 'Juntar a tabela de Vendas com a de Clientes pela coluna ID:', o: ['Mesclar consultas', 'Acrescentar consultas', 'Dividir coluna', 'Remover duplicatas'], a: 0, w: 'Mesclar = juntar colunas por chave.' },
        { lv: 'i', q: 'Empilhar os relatórios de janeiro, fevereiro e março:', o: ['Acrescentar consultas', 'Mesclar consultas', 'Classificar', 'Gráfico'], a: 0, w: 'Acrescentar = juntar linhas.' },
        { lv: 'a', t: 'fill', q: 'A linguagem por trás do Power Query se chama ___', ans: ['m', 'linguagem m', 'power query m'], w: 'M (Power Query Formula Language).' },
        { lv: 'a', q: 'Ao importar “1.234,56” como número, é essencial definir:', o: ['A cor', 'A cultura/localidade pt-BR', 'A fonte', 'O zoom'], a: 1, w: 'Senão vírgula e ponto se invertem.' }
      ]
    },
    {
      id: 'xp5', title: 'Power BI e DAX', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🛰️', 'O painel de controle da empresa', "O **Power BI** é como o painel de um avião: junta dados de vários lugares (planilhas, sistemas, banco) e mostra em gráficos que se atualizam sozinhos, no computador e no celular."],
        ['flow', 'Do dado ao painel', ['Obter Dados (Power Query)', 'Modelar: ligar as tabelas', 'Criar medidas (DAX)', 'Montar o relatório visual', 'Publicar e agendar atualização']]
      ],
      i: [
        ['t', 'Modelo estrela', "No centro, a **tabela fato** com os eventos (parcelas, pagamentos, vendas). Em volta, **dimensões** com descrições (Clientes, Consultores, Calendário). Relacionamentos 1 para muitos, das dimensões para a fato."],
        ['code', 'dax', `Total Vendido = SUM ( Vendas[Valor] )
Qtd Vencidas = CALCULATE ( COUNTROWS ( Parcelas ), Parcelas[Status] = "vencido" )
% Inadimplência = DIVIDE ( [Valor Vencido], [Valor Total] )
Vendas Mês Anterior = CALCULATE ( [Total Vendido], DATEADD ( Calendario[Data], -1, MONTH ) )`, "Medidas são calculadas no contexto de cada filtro do relatório: a mesma medida mostra o total por consultor, por mês, por cidade."]
      ],
      a: [
        ['list', 'Power BI profissional', ['Tabela Calendário marcada como tabela de datas', 'Evite colunas calculadas onde uma medida resolve', 'CALCULATE muda o contexto de filtro: é o coração do DAX', 'Segurança em nível de linha (RLS): cada consultor vê só seus clientes', 'Atualização agendada com gateway para fontes locais; incremental para tabelas grandes', 'Integração com BigQuery, Postgres/Supabase e APIs via Power Query']]
      ],
      rec: ['Power BI junta várias fontes num painel que se atualiza', 'Modelo estrela: fato no centro, dimensões em volta', 'Medidas DAX calculam no contexto de cada filtro', 'CALCULATE é o coração do DAX', 'RLS faz cada pessoa ver só os seus dados'],
      quiz: [
        { lv: '*', q: 'Power BI serve para:', o: ['Editar fotos', 'Criar painéis de dados que se atualizam', 'Escrever contratos', 'Formatar o PC'], a: 1, w: 'Business Intelligence.' },
        { lv: '*', t: 'tf', q: 'O Power BI usa o mesmo Power Query do Excel para importar e limpar dados.', a: true, w: 'Mesma tecnologia e linguagem M.' },
        { lv: 'b', t: 'order', q: 'Ordene o caminho do dado ao painel:', items: ['Obter dados', 'Ligar as tabelas', 'Criar medidas', 'Montar gráficos', 'Publicar'], w: 'Dados, modelo, cálculo, visual, compartilhamento.' },
        { lv: 'b', q: 'Um painel do Power BI pode ser visto:', o: ['Só no computador de quem criou', 'No navegador e no celular, por quem tiver acesso', 'Só impresso', 'Só no Excel'], a: 1, w: 'Publicado no serviço Power BI.' },
        { lv: 'i', q: 'No modelo estrela, a tabela de parcelas costuma ser:', o: ['Dimensão', 'Fato', 'Calendário', 'Parâmetro'], a: 1, w: 'Eventos com valores.' },
        { lv: 'i', t: 'fill', q: 'Função DAX que divide tratando divisão por zero: ___', ans: ['divide'], w: 'DIVIDE(numerador; denominador).' },
        { lv: 'a', q: 'Para cada consultor ver só os próprios clientes no mesmo relatório:', o: ['RLS (segurança em nível de linha)', 'Um arquivo por consultor', 'Esconder colunas', 'Senha no Excel'], a: 0, w: 'Row-Level Security.' },
        { lv: 'a', q: 'A função que altera o contexto de filtro de uma medida é:', o: ['SUM', 'CALCULATE', 'FILTER sozinho', 'RELATED'], a: 1, w: 'CALCULATE.' }
      ]
    },
    {
      id: 'xp6', title: 'Macros, VBA e automação', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🎙️', 'Um gravador de cliques', "A **macro** grava o que você faz (formatar, copiar, filtrar) e repete tudo com um botão. É a primeira automação de muita gente."],
        ['flow', 'Gravando sua primeira macro', ['Ative a guia Desenvolvedor (Arquivo → Opções → Personalizar Faixa)', 'Gravar Macro', 'Faça as ações normalmente', 'Parar Gravação', 'Execute quando quiser (salve como .xlsm)']]
      ],
      i: [
        ['code', 'vba', `Sub MarcarVencidos()
    Dim linha As Long
    For linha = 2 To Cells(Rows.Count, "A").End(xlUp).Row
        If Cells(linha, "D").Value = "vencido" Then
            Rows(linha).Interior.Color = RGB(255, 220, 220)
        End If
    Next linha
    MsgBox "Pronto!"
End Sub`, "VBA é a linguagem das macros: dá para usar laços, condições e variáveis, como em qualquer linguagem."],
        ['tip', "Macros podem conter vírus. Só habilite macros de arquivos de fontes confiáveis."]
      ],
      a: [
        ['list', 'Automação moderna no Office', ['Office Scripts (TypeScript) no Excel web, acionados pelo Power Automate', 'Power Automate: “quando chegar e-mail com anexo, salvar no SharePoint e atualizar a planilha”', 'Python no Excel (função PY) para análise com pandas dentro da célula', 'Para processos grandes, migre a lógica para Python + banco e use o Excel só como visual']],
        ['code', 'ts', `function main(workbook: ExcelScript.Workbook) {
  const ws = workbook.getWorksheet("Base");
  const dados = ws.getUsedRange().getValues();
  dados.forEach((linha, i) => {
    if (i > 0 && linha[3] === "vencido") ws.getRange(\`A\${i + 1}:E\${i + 1}\`).getFormat().getFill().setColor("#FFDCDC");
  });
}`, "O mesmo exemplo em Office Scripts: roda na nuvem e pode ser agendado."]
      ],
      rec: ['Macro grava ações e repete com um clique', 'Arquivos com macro são salvos como .xlsm', 'VBA permite laços, condições e variáveis', 'Só habilite macros de fontes confiáveis', 'Office Scripts e Power Automate automatizam na nuvem'],
      quiz: [
        { lv: '*', q: 'Uma macro serve para:', o: ['Repetir ações automaticamente', 'Desenhar', 'Proteger o Wi-Fi', 'Trocar a fonte'], a: 0, w: 'Grava e repete.' },
        { lv: '*', t: 'tf', q: 'Habilitar macros de qualquer arquivo recebido por e-mail é seguro.', a: false, w: 'Macros podem conter código malicioso.' },
        { lv: 'b', t: 'fill', q: 'Extensão de planilha com macros: .___', ans: ['xlsm'], w: '.xlsx não guarda macros.' },
        { lv: 'b', t: 'order', q: 'Ordene a gravação de uma macro:', items: ['Gravar Macro', 'Fazer as ações', 'Parar Gravação', 'Executar quando precisar'], w: 'Gravar, agir, parar, usar.' },
        { lv: 'i', q: 'A linguagem das macros clássicas do Excel é:', o: ['VBA', 'SQL', 'HTML', 'DAX'], a: 0, w: 'Visual Basic for Applications.' },
        { lv: 'i', q: 'No VBA, `For linha = 2 To 100` é:', o: ['Uma condição', 'Um laço de repetição', 'Uma função de texto', 'Um gráfico'], a: 1, w: 'Repete da linha 2 até 100.' },
        { lv: 'a', q: 'Para automatizar no Excel web acionado por e-mail recebido:', o: ['Office Scripts + Power Automate', 'Macro VBA local', 'Tabela dinâmica', 'Imprimir'], a: 0, w: 'Rodam na nuvem.' },
        { lv: 'a', t: 'tf', q: 'Office Scripts são escritos em TypeScript.', a: true, w: 'Baseados em TypeScript/JavaScript.' }
      ]
    }
  ]
});
