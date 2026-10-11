CC.tracks.push({
  id: 'word', ord: -5, name: 'Word e Documentos', short: 'Word', glyph: 'W', hue: 215,
  desc: 'Do primeiro texto a documentos profissionais: formatação, estilos, sumário automático, revisão e mala direta.',
  test: [
    { d: 1, q: 'Para deixar um texto em negrito no Word:', o: ['Ctrl + N', 'Ctrl + B ou o botão N', 'Ctrl + P', 'F5'], a: 1 },
    { d: 1, q: 'Para salvar o documento rapidamente:', o: ['Ctrl + S', 'Ctrl + Q', 'Alt + F4', 'Ctrl + D'], a: 0 },
    { d: 2, q: 'Por que usar Estilos (Título 1, Título 2)?', o: ['Para colorir', 'Para formatar com consistência e gerar sumário automático', 'Para imprimir', 'Não servem para nada'], a: 1 },
    { d: 2, q: 'Para começar o próximo capítulo numa nova página, o certo é:', o: ['Apertar Enter várias vezes', 'Inserir quebra de página (Ctrl + Enter)', 'Usar espaço', 'Criar outro arquivo'], a: 1 },
    { d: 3, q: 'Mala direta serve para:', o: ['Enviar spam', 'Gerar vários documentos personalizados a partir de uma lista (ex.: contratos por cliente)', 'Compactar arquivos', 'Corrigir ortografia'], a: 1 },
    { d: 3, q: 'Numerar páginas a partir da 3ª, sem numerar capa e sumário, exige:', o: ['Apagar as páginas', 'Quebra de seção e desvincular do anterior no rodapé', 'Escrever o número à mão', 'Imprimir separado'], a: 1 }
  ],
  exam: [
    { t: 'order', q: 'Ordene para criar um sumário automático:', items: ['Aplicar Título 1 e Título 2 nos títulos', 'Posicionar o cursor onde ficará o sumário', 'Referências → Sumário', 'Escolher um modelo', 'Atualizar o sumário depois de editar'], w: 'O sumário lê os estilos de título.' },
    { t: 'tf', q: 'Usar várias linhas em branco (Enter) é a forma correta de pular para a próxima página.', a: false, w: 'Use Ctrl+Enter (quebra de página): o layout não quebra quando o texto muda.' },
    { q: 'Para revisar um contrato mostrando o que cada pessoa mudou:', o: ['Controlar alterações', 'Salvar como PDF', 'Mala direta', 'Modo de leitura'], a: 0, w: 'Revisão → Controlar Alterações.' },
    { t: 'fill', q: 'Atalho para inserir quebra de página: Ctrl + ___', ans: ['enter'], w: 'Ctrl+Enter.' },
    { q: 'Na mala direta, a lista de clientes geralmente vem de:', o: ['Uma planilha do Excel', 'Uma foto', 'Um PDF escaneado', 'Um vídeo'], a: 0, w: 'Cada linha vira um documento.' }
  ],
  lessons: [
    {
      id: 'word1', title: 'Primeiros passos no Word', min: { b: 15, i: 15, a: 15 },
      b: [
        ['an', '📝', 'Um caderno que não acaba', "O Word é um caderno digital: você escreve, apaga sem rasura, muda a letra, coloca imagens e imprime quantas vezes quiser."],
        ['list', 'O básico', ['**Digitar**: clique na página e escreva', '**Selecionar**: arraste o mouse por cima do texto', '**Negrito** (Ctrl + N), *itálico* (Ctrl + I), sublinhado (Ctrl + S no Word em português)', 'Tamanho e tipo de letra no topo, na guia **Página Inicial**', '**Salvar**: Arquivo → Salvar como (ou Ctrl + B no Word em português)']],
        ['tip', "No Word em português, alguns atalhos mudam: Ctrl+N é negrito, Ctrl+S é sublinhado e Ctrl+B é salvar. No Word em inglês: Ctrl+B negrito, Ctrl+U sublinhado, Ctrl+S salvar."]
      ],
      i: [
        ['tbl', 'Guias da faixa de opções', ['Guia', 'Tem'], [['Página Inicial', 'fonte, parágrafo, estilos'], ['Inserir', 'tabela, imagem, ícones, cabeçalho, número de página'], ['Design / Layout', 'margens, orientação, colunas, quebras'], ['Referências', 'sumário, notas, legendas'], ['Correspondências', 'mala direta'], ['Revisão', 'ortografia, comentários, controlar alterações'], ['Exibir', 'modo de leitura, régua, zoom']]],
        ['list', 'Hábitos que separam amador de profissional', ['Alinhamento justificado só se o texto for longo; à esquerda é mais legível', 'Espaçamento entre parágrafos pelo menu Parágrafo, não com Enter extra', 'Mostrar marcas de formatação (¶) para ver o que está escondido', 'Ctrl + Shift + V cola sem trazer a formatação de onde copiou']]
      ],
      a: [
        ['list', 'Velocidade de especialista', ['F4 repete a última ação (aplicar a mesma formatação em vários lugares)', 'Pincel de formatação: clique duplo para aplicar várias vezes', 'Localizar e substituir (Ctrl + U no Word PT) com curingas: trocar formatos inteiros', 'Partes rápidas / AutoTexto para cláusulas que você sempre usa', 'Atalhos personalizados e macros para tarefas repetitivas']],
        ['t', 'Formato .docx por dentro', "Um .docx é um ZIP com arquivos XML (document.xml, styles.xml). Por isso dá para gerar contratos por código (python-docx, docxtemplater) preenchendo modelos com dados do sistema."]
      ],
      rec: ['O Word é um caderno digital: escreve, formata e imprime', 'Formatação básica fica na guia Página Inicial', 'Atalhos mudam entre Word em português e inglês', 'Espaçamento pelo menu Parágrafo, não com Enter extra', 'Ctrl+Shift+V cola sem a formatação de origem'],
      quiz: [
        { lv: '*', q: 'Onde fica a escolha de fonte e tamanho da letra?', o: ['Guia Página Inicial', 'Guia Correspondências', 'Menu Iniciar do Windows', 'Na Lixeira'], a: 0, w: 'Página Inicial → Fonte.' },
        { lv: '*', t: 'tf', q: 'No Word em português, Ctrl + N deixa o texto em negrito.', a: true, w: 'No Word em inglês é Ctrl + B.' },
        { lv: 'b', t: 'order', q: 'Ordene para deixar uma palavra em negrito:', items: ['Selecionar a palavra', 'Clicar no botão N (ou Ctrl+N)', 'Clicar fora para conferir'], w: 'Primeiro seleciona, depois formata.' },
        { lv: 'b', q: 'Para guardar o trabalho e não perder:', o: ['Salvar', 'Imprimir', 'Fechar sem salvar', 'Copiar'], a: 0, w: 'Salve com frequência.' },
        { lv: 'i', q: 'Colar um texto da internet sem trazer cores e fontes estranhas:', o: ['Ctrl + Shift + V (colar só texto)', 'Ctrl + V duas vezes', 'Ctrl + Z', 'Imprimir'], a: 0, w: 'Colar somente texto.' },
        { lv: 'i', q: 'A guia com Sumário e Notas de rodapé é:', o: ['Referências', 'Exibir', 'Inserir', 'Design'], a: 0, w: 'Referências.' },
        { lv: 'a', q: 'Qual tecla repete a última ação de formatação?', o: ['F4', 'F1', 'F12', 'Esc'], a: 0, w: 'Muito útil para formatar vários trechos.' },
        { lv: 'a', t: 'tf', q: 'Um arquivo .docx é internamente um pacote ZIP com XML.', a: true, w: 'Permite gerar documentos por código.' }
      ]
    },
    {
      id: 'word2', title: 'Estilos, listas, tabelas e imagens', min: { b: 15, i: 18, a: 18 },
      b: [
        ['an', '👕', 'Estilos são uniformes', "Em vez de formatar cada título na mão, você veste todos com o mesmo uniforme: o **estilo** “Título 1”. Mudou o uniforme? Todos os títulos mudam juntos."],
        ['list', 'Deixando o texto organizado', ['**Listas com marcadores** (•) para itens soltos', '**Listas numeradas** (1, 2, 3) para passos', '**Tabelas**: Inserir → Tabela, escolha linhas e colunas', '**Imagens**: Inserir → Imagens']]
      ],
      i: [
        ['list', 'Estilos na prática', ['Título 1 para capítulos, Título 2 para seções', 'Modifique o estilo (botão direito → Modificar) em vez de formatar à mão', 'Painel de Navegação (Exibir) mostra os títulos e permite arrastar seções', 'Estilos também definem espaçamento antes/depois']],
        ['list', 'Tabelas e imagens sem bagunça', ['Tabelas: use Design da Tabela para estilos prontos e repetir a linha de cabeçalho em cada página', 'Imagens: Layout → Alinhado com o texto evita que fujam de lugar', 'Comprimir imagens para o arquivo não ficar gigante', 'Legendas (Referências → Inserir legenda) numeram figuras e tabelas sozinhas']]
      ],
      a: [
        ['list', 'Modelos (.dotx) da empresa', ['Defina fontes, cores e estilos no modelo uma vez', 'Inclua cabeçalho com logo e rodapé padrão', 'Controles de conteúdo (Desenvolvedor) criam campos preenchíveis', 'Proteja partes do documento e deixe só os campos editáveis', 'Distribua o modelo pela pasta de modelos compartilhada']],
        ['t', 'Acessibilidade', "Estilos de título corretos, texto alternativo nas imagens, tabelas com linha de cabeçalho e contraste adequado deixam o documento legível para leitores de tela. O Verificador de Acessibilidade (Revisão) aponta problemas."]
      ],
      rec: ['Estilos formatam todos os títulos de uma vez', 'Marcadores para itens soltos; numeração para passos', 'Imagem alinhada com o texto não foge de lugar', 'Legendas numeram figuras e tabelas sozinhas', 'Modelos .dotx padronizam os documentos da empresa'],
      quiz: [
        { lv: '*', q: 'Qual a vantagem de usar estilos?', o: ['Mudar todos os títulos de uma vez e gerar sumário', 'Deixar o arquivo menor', 'Imprimir colorido', 'Nenhuma'], a: 0, w: 'Consistência e automação.' },
        { lv: '*', t: 'tf', q: 'Lista numerada é ideal para passos em sequência.', a: true, w: 'Marcadores para itens sem ordem.' },
        { lv: 'b', q: 'Para inserir uma tabela:', o: ['Inserir → Tabela', 'Arquivo → Salvar', 'Revisão → Ortografia', 'Exibir → Zoom'], a: 0, w: 'Escolha linhas e colunas.' },
        { lv: 'b', t: 'order', q: 'Ordene para aplicar o estilo Título 1:', items: ['Clicar na linha do título', 'Ir em Página Inicial → Estilos', 'Clicar em Título 1'], w: 'Selecione e aplique.' },
        { lv: 'i', q: 'Uma tabela longa passa de página. Para o cabeçalho repetir:', o: ['Copiar à mão', 'Repetir linhas de cabeçalho (Layout da tabela)', 'Quebrar a tabela', 'Diminuir a fonte'], a: 1, w: 'Opção da tabela.' },
        { lv: 'i', q: 'A imagem fica pulando quando você edita o texto. Configure:', o: ['Alinhado com o texto', 'Atrás do texto', 'Cor sépia', 'Brilho'], a: 0, w: 'Ela passa a se comportar como um caractere.' },
        { lv: 'a', t: 'fill', q: 'Extensão de um modelo do Word: .___', ans: ['dotx'], w: '.dotx (ou .dotm com macros).' },
        { lv: 'a', q: 'Para criar campos preenchíveis e proteger o resto do documento:', o: ['Controles de conteúdo + restrição de edição', 'Imagens', 'Cores', 'Colunas'], a: 0, w: 'Guia Desenvolvedor.' }
      ]
    },
    {
      id: 'word3', title: 'Documentos longos: sumário e numeração', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '📚', 'O livro que se organiza sozinho', "Num trabalho grande, o Word monta o **sumário** sozinho a partir dos títulos e numera as páginas. Você só precisa usar os estilos de título."],
        ['flow', 'Sumário automático', ['Use Título 1 e Título 2 nos títulos', 'Clique onde quer o sumário', 'Referências → Sumário', 'Escolha um modelo pronto']]
      ],
      i: [
        ['list', 'Estrutura de documento longo', ['Quebra de página (Ctrl + Enter) para começar capítulos', 'Cabeçalho e rodapé: Inserir → Número de Página', 'Notas de rodapé: Referências → Inserir Nota de Rodapé', 'Atualizar sumário: botão direito → Atualizar campo', 'Normas ABNT: margens 3/2 cm, fonte 12, espaçamento 1,5']],
        ['tip', "Clique com Ctrl num item do sumário para pular direto para o capítulo."]
      ],
      a: [
        ['list', 'Seções', ['Quebra de seção permite orientação diferente (uma página em paisagem)', 'Numeração diferente por seção: desmarque “Vincular ao anterior” no rodapé', 'Primeira página diferente para capas', 'Referências cruzadas: “veja a Tabela 3” atualiza sozinho', 'Gerenciador de fontes bibliográficas e citações (ABNT/APA)']]
      ],
      rec: ['O sumário automático lê os estilos de título', 'Ctrl+Enter começa uma nova página do jeito certo', 'Número de página fica no cabeçalho ou rodapé', 'Atualize o sumário depois de editar', 'Quebras de seção permitem numerações e orientações diferentes'],
      quiz: [
        { lv: '*', q: 'O sumário automático é montado a partir de:', o: ['Estilos de título', 'Negritos', 'Cores', 'Imagens'], a: 0, w: 'Título 1, Título 2...' },
        { lv: '*', t: 'tf', q: 'Depois de mudar o texto, é preciso atualizar o sumário.', a: true, w: 'Botão direito → Atualizar campo.' },
        { lv: 'b', t: 'order', q: 'Ordene para inserir o sumário:', items: ['Aplicar estilos nos títulos', 'Clicar onde ficará o sumário', 'Referências → Sumário'], w: 'Os estilos vêm antes.' },
        { lv: 'b', q: 'Onde ficam os números de página?', o: ['No cabeçalho ou rodapé', 'No meio do texto', 'Na capa sempre', 'Na Lixeira'], a: 0, w: 'Inserir → Número de Página.' },
        { lv: 'i', t: 'fill', q: 'Atalho para quebra de página: Ctrl + ___', ans: ['enter'], w: 'Ctrl+Enter.' },
        { lv: 'i', q: 'Normas ABNT pedem fonte tamanho:', o: ['10', '12', '16', '8'], a: 1, w: 'Fonte 12 no corpo do texto.' },
        { lv: 'a', q: 'Para uma única página em paisagem no meio do documento:', o: ['Quebras de seção antes e depois', 'Girar a impressora', 'Outro arquivo', 'Diminuir a fonte'], a: 0, w: 'Cada seção tem orientação própria.' },
        { lv: 'a', q: 'Numerar a partir da página 3, sem número na capa e no sumário, exige:', o: ['Quebra de seção e desvincular do anterior', 'Apagar a capa', 'Fonte branca', 'Imprimir separado'], a: 0, w: 'Cada seção pode ter sua numeração.' }
      ]
    },
    {
      id: 'word4', title: 'Revisão, mala direta e colaboração', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '✍️', 'Professor corrigindo com caneta vermelha', "O **Controlar Alterações** mostra tudo que alguém mudou no texto: o que entrou, o que saiu, quem mudou. Depois você aceita ou rejeita cada mudança."],
        ['an', '💌', 'Mala direta: 100 cartas num clique', "Tem uma lista de 100 clientes numa planilha? A **mala direta** cria uma carta (ou contrato) para cada um, já com nome, valor e data de cada pessoa."]
      ],
      i: [
        ['flow', 'Mala direta com Excel', ['Prepare a planilha: uma coluna por campo (Nome, CPF, Valor)', 'No Word: Correspondências → Iniciar Mala Direta → Cartas', 'Selecionar Destinatários → Usar lista existente (o Excel)', 'Inserir Campo de Mesclagem onde vai cada dado', 'Visualizar Resultados', 'Concluir e Mesclar → Editar documentos individuais ou Imprimir']],
        ['list', 'Colaboração', ['Comentários (Revisão → Novo comentário) com @menção avisa a pessoa', 'Coautoria em tempo real com o arquivo no OneDrive/SharePoint', 'Histórico de versões para recuperar o texto de ontem', 'Comparar documentos mostra diferenças entre duas versões de contrato']]
      ],
      a: [
        ['list', 'Automação de documentos', ['Campos de mesclagem com formatação: valores em moeda com {MERGEFIELD Valor \\# "R$ #.##0,00"}', 'Regras Se...Então...Senão na mala direta para cláusulas condicionais', 'Gerar um PDF por cliente com nome de arquivo do campo (via add-in, VBA ou Power Automate)', 'Por código: python-docx/docxtemplater preenchendo modelos a partir do banco', 'Assinatura eletrônica em lote depois da geração']]
      ],
      rec: ['Controlar Alterações mostra quem mudou o quê', 'Aceite ou rejeite cada alteração', 'Mala direta gera um documento por linha da planilha', 'Comentários com @menção avisam a pessoa', 'Comparar documentos revela diferenças entre versões'],
      quiz: [
        { lv: '*', q: 'Mala direta serve para:', o: ['Gerar documentos personalizados a partir de uma lista', 'Enviar vírus', 'Corrigir ortografia', 'Fazer backup'], a: 0, w: 'Uma carta por linha da planilha.' },
        { lv: '*', t: 'tf', q: 'Com Controlar Alterações ligado, o Word marca tudo que foi mudado.', a: true, w: 'Revisão → Controlar Alterações.' },
        { lv: 'b', q: 'Em qual guia fica o Controlar Alterações?', o: ['Revisão', 'Inserir', 'Design', 'Exibir'], a: 0, w: 'Revisão.' },
        { lv: 'b', q: 'A lista de clientes para a mala direta costuma ficar:', o: ['Numa planilha', 'Numa foto', 'No papel de parede', 'No Paint'], a: 0, w: 'Excel ou Google Planilhas.' },
        { lv: 'i', t: 'order', q: 'Ordene os passos da mala direta:', items: ['Preparar a planilha', 'Iniciar Mala Direta', 'Selecionar destinatários', 'Inserir campos de mesclagem', 'Concluir e mesclar'], w: 'Dados, modelo, campos, gerar.' },
        { lv: 'i', q: 'Para ver as diferenças entre a versão 1 e a 2 de um contrato:', o: ['Revisão → Comparar', 'Imprimir as duas', 'Contar palavras', 'Modo de leitura'], a: 0, w: 'Gera um documento com as diferenças marcadas.' },
        { lv: 'a', q: 'Para incluir uma cláusula só para clientes de certa cidade na mala direta:', o: ['Regra Se...Então...Senão', 'Fonte vermelha', 'Imagem', 'Sumário'], a: 0, w: 'Regras condicionais da mala direta.' },
        { lv: 'a', t: 'tf', q: 'É possível gerar contratos em .docx por código a partir de um modelo.', a: true, w: 'python-docx, docxtemplater e afins.' }
      ]
    }
  ]
});
