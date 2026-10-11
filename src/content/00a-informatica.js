CC.tracks.push({
  id: 'inf', ord: -10, name: 'Informática do Zero', short: 'Informática', glyph: '⌂', hue: 28,
  desc: 'Para quem nunca usou bem um computador: ligar, mouse, teclado, arquivos, programas, internet e e-mail.',
  test: [
    { d: 1, q: 'Para abrir um arquivo com o mouse, normalmente você:', o: ['Clica uma vez com o botão direito', 'Dá dois cliques com o botão esquerdo', 'Arrasta para a lixeira', 'Aperta Esc'], a: 1 },
    { d: 1, q: 'O que é o navegador?', o: ['Um programa para acessar sites, como Chrome ou Edge', 'O cabo da internet', 'Um antivírus', 'Uma impressora'], a: 0 },
    { d: 2, q: 'O atalho Ctrl + Z serve para:', o: ['Copiar', 'Desfazer a última ação', 'Salvar', 'Fechar o programa'], a: 1 },
    { d: 2, q: 'Num e-mail, o campo CCO serve para:', o: ['Enviar cópia oculta: os outros não veem quem recebeu', 'Anexar arquivos', 'Marcar como urgente', 'Agendar o envio'], a: 0 },
    { d: 3, q: 'Um arquivo chamado `relatorio.pdf.exe` deve gerar desconfiança porque:', o: ['PDF é sempre perigoso', 'A extensão real é .exe (programa), disfarçada de PDF', 'Nomes com ponto não abrem', 'Não há problema'], a: 1 },
    { d: 3, q: 'Qual a diferença entre RAM e armazenamento (SSD)?', o: ['Nenhuma', 'RAM é memória temporária de trabalho; SSD guarda os arquivos permanentemente', 'SSD é mais rápida que RAM', 'RAM guarda fotos'], a: 1 }
  ],
  exam: [
    { t: 'order', q: 'Coloque em ordem para salvar um documento com outro nome:', items: ['Clicar em Arquivo', 'Escolher Salvar como', 'Escolher a pasta', 'Digitar o novo nome', 'Clicar em Salvar'], w: 'Salvar como cria uma cópia com novo nome ou local.' },
    { t: 'tf', q: 'Desligar o computador direto na tomada é a forma correta de desligar.', a: false, w: 'Use Iniciar → Desligar para o sistema fechar os arquivos com segurança.' },
    { q: 'Onde ficam os arquivos apagados no Windows antes de sumirem de vez?', o: ['Na Área de Trabalho', 'Na Lixeira', 'Na pasta Downloads', 'No navegador'], a: 1, w: 'A Lixeira permite restaurar enquanto não for esvaziada.' },
    { t: 'fill', q: 'Complete o atalho para colar o que foi copiado: Ctrl + ___', ans: ['v'], w: 'Ctrl+C copia, Ctrl+X recorta, Ctrl+V cola.' },
    { q: 'Um site seguro para digitar senha normalmente mostra:', o: ['Muitas propagandas', 'O cadeado e o endereço começando com https, no domínio certo', 'Letras coloridas', 'Pop-ups'], a: 1, w: 'Confira também se o domínio é o verdadeiro (ex.: banco.com.br).' }
  ],
  lessons: [
    {
      id: 'inf1', title: 'Conhecendo o computador', min: { b: 15, i: 15, a: 18 },
      b: [
        ['an', '🖥️', 'Um ajudante de mesa', "O computador é uma máquina que guarda, mostra e transforma informações: textos, fotos, músicas, contas. Ele tem partes que a gente vê e toca, e partes que a gente não toca."],
        ['list', 'As partes que você vê', ['**Monitor**: a tela, onde tudo aparece', '**Teclado**: para escrever', '**Mouse**: para apontar e clicar', '**Gabinete** (ou o próprio notebook): onde fica o “cérebro”', '**Caixas de som e fone**: para ouvir']],
        ['an', '🧠', 'Hardware e software', "**Hardware** é tudo que você pode tocar: tela, teclado, peças.\n**Software** são os programas: as “instruções” que fazem o hardware trabalhar. Sem software, o computador é só uma caixa parada."],
        ['flow', 'Ligar e desligar do jeito certo', ['Aperte o botão liga/desliga uma vez', 'Espere aparecer a tela de entrada', 'Digite sua senha ou PIN', 'Para desligar: Iniciar → ícone de energia → Desligar']],
        ['tip', "Nunca desligue puxando da tomada: o computador pode perder o que estava salvando."]
      ],
      i: [
        ['tbl', 'Tipos de computador', ['Tipo', 'Bom para'], [['Desktop (de mesa)', 'trabalho fixo, mais potência pelo preço, fácil de consertar'], ['Notebook', 'levar para todo lado, bateria'], ['Tablet', 'ler, assistir, desenhar'], ['Celular', 'tudo no bolso: é um computador também'], ['Servidor', 'fica ligado o tempo todo servindo sites e sistemas']]],
        ['list', 'O que olhar ao comprar', ['**Processador**: Intel Core i3/i5/i7 ou AMD Ryzen 3/5/7 (quanto maior, mais rápido)', '**Memória RAM**: 8 GB é o mínimo confortável hoje; 16 GB para trabalho pesado', '**Armazenamento**: prefira **SSD** (muito mais rápido que HD); 256 GB ou mais', '**Tela**: Full HD (1920×1080) para trabalhar bem']],
        ['t', 'Sistema operacional', "É o programa principal, que organiza todos os outros. **Windows** é o mais comum em escritórios, **macOS** nos computadores da Apple, **Linux** em servidores e para quem gosta de liberdade, **Android** e **iOS** nos celulares."]
      ],
      a: [
        ['t', 'Como o computador inicia (boot)', "Ao ligar, o firmware da placa-mãe (**UEFI**, sucessor da BIOS) testa o hardware (POST), encontra o disco de inicialização e carrega o gerenciador de boot, que carrega o núcleo (kernel) do sistema operacional. Recursos como **Secure Boot** impedem carregar sistemas não assinados."],
        ['tbl', 'Unidades de medida', ['Unidade', 'Tamanho', 'Exemplo'], [['1 KB', '1.024 bytes', 'um texto curto'], ['1 MB', '1.024 KB', 'uma foto de celular (2–5 MB)'], ['1 GB', '1.024 MB', 'um filme em boa qualidade'], ['1 TB', '1.024 GB', 'um HD externo comum']]],
        ['tip', "Fabricantes de disco usam 1 TB = 1.000.000.000.000 bytes; o Windows conta em base 1.024. Por isso um disco de 1 TB aparece como uns 931 GB."]
      ],
      rec: ['Hardware é o que se toca; software são os programas', 'O sistema operacional (Windows, macOS, Linux) organiza tudo', 'RAM é a memória de trabalho; SSD guarda os arquivos', 'Desligue sempre pelo menu Iniciar, nunca pela tomada', 'Para trabalhar bem hoje: 8 GB de RAM e SSD'],
      quiz: [
        { lv: '*', q: 'Qual destes é **software**?', o: ['Teclado', 'Monitor', 'Navegador Chrome', 'Mouse'], a: 2, w: 'Programas são software; peças físicas são hardware.' },
        { lv: '*', t: 'tf', q: 'O sistema operacional é o programa principal que organiza os outros programas.', a: true, w: 'Exemplos: Windows, macOS, Linux, Android.' },
        { lv: 'b', q: 'Qual o jeito certo de desligar o computador?', o: ['Puxar da tomada', 'Iniciar → Energia → Desligar', 'Fechar a tampa e tirar a bateria', 'Apertar o botão por 10 segundos sempre'], a: 1, w: 'Assim o sistema salva e fecha tudo antes.' },
        { lv: 'b', t: 'order', q: 'Coloque em ordem para começar a usar o computador:', items: ['Apertar o botão liga/desliga', 'Esperar a tela de entrada', 'Digitar a senha', 'Usar os programas'], w: 'Liga, espera, entra, usa.' },
        { lv: 'i', q: 'Para deixar um computador antigo bem mais rápido, a troca mais eficaz costuma ser:', o: ['Trocar o mouse', 'Trocar o HD por SSD', 'Trocar o monitor', 'Trocar o teclado'], a: 1, w: 'O SSD acelera muito a inicialização e a abertura de programas.' },
        { lv: 'i', t: 'fill', q: 'Hoje, o mínimo confortável de memória RAM é ___ GB.', ans: ['8', '8gb', '8 gb'], w: '8 GB para uso geral; 16 GB para trabalho pesado.' },
        { lv: 'a', q: 'O que o Secure Boot faz?', o: ['Acelera o boot', 'Impede carregar sistemas e carregadores não assinados', 'Criptografa o disco', 'Faz backup'], a: 1, w: 'É uma proteção da UEFI contra malware de inicialização.' },
        { lv: 'a', q: 'Um disco de 500 GB aparece no Windows com cerca de:', o: ['500 GB', '465 GB', '512 GB', '400 GB'], a: 1, w: '500×10⁹ bytes ÷ 1024³ ≈ 465 GB.' }
      ]
    },
    {
      id: 'inf2', title: 'Mouse, teclado e atalhos', min: { b: 15, i: 15, a: 15 },
      b: [
        ['an', '🖱️', 'O mouse é o seu dedo na tela', "Você mexe o mouse na mesa e uma setinha anda na tela. Onde a setinha está, é ali que o computador vai agir."],
        ['list', 'Os movimentos do mouse', ['**Clique** (botão esquerdo, uma vez): escolher algo', '**Duplo clique** (dois rapidinho): abrir', '**Botão direito**: abre um menu com opções', '**Arrastar**: segurar o botão e mover, para levar algo de um lugar a outro', '**Rodinha**: rolar a página para cima e para baixo']],
        ['an', '⌨️', 'O teclado tem teclas mágicas', "Além das letras, algumas teclas especiais: **Enter** confirma, **Backspace** apaga para trás, **Shift** faz letra maiúscula, **Espaço** separa palavras, **Esc** cancela."],
        ['list', 'Três atalhos que todo mundo usa', ['**Ctrl + C**: copiar', '**Ctrl + V**: colar', '**Ctrl + Z**: desfazer (voltar o erro)']]
      ],
      i: [
        ['tbl', 'Atalhos que economizam horas', ['Atalho', 'Faz'], [['Ctrl + X', 'recortar'], ['Ctrl + A', 'selecionar tudo'], ['Ctrl + S', 'salvar'], ['Ctrl + F', 'procurar na página/documento'], ['Ctrl + P', 'imprimir'], ['Alt + Tab', 'alternar entre janelas'], ['Win + D', 'mostrar a área de trabalho'], ['Win + V', 'histórico da área de transferência'], ['Win + Shift + S', 'recortar parte da tela (print)'], ['Ctrl + Shift + T', 'reabrir aba fechada no navegador']]],
        ['tip', "Selecionar texto: clique duplo seleciona uma palavra, clique triplo seleciona o parágrafo, Shift + setas aumenta a seleção."]
      ],
      a: [
        ['tbl', 'Atalhos de produtividade avançada', ['Atalho', 'Faz'], [['Win + seta', 'encaixar janela na metade da tela'], ['Win + Ctrl + D', 'nova área de trabalho virtual'], ['Win + .', 'emojis e símbolos'], ['Ctrl + Shift + Esc', 'Gerenciador de Tarefas direto'], ['Win + R', 'Executar (ex.: digite `cmd`, `calc`)'], ['Ctrl + Backspace', 'apagar a palavra inteira']]],
        ['t', 'Digitação de verdade', "Digitar sem olhar (touch typing) com os dedos na linha base (ASDF JKLÇ) dobra a produtividade de quem trabalha com computador. Meta realista: 40 palavras por minuto com 95% de precisão. Treine 10 minutos por dia em sites como Keybr ou TypingClub."]
      ],
      rec: ['Clique escolhe, duplo clique abre, botão direito mostra opções', 'Arrastar é segurar o botão e mover', 'Ctrl+C copia, Ctrl+V cola, Ctrl+Z desfaz', 'Alt+Tab troca de janela; Win+Shift+S tira print de uma parte da tela', 'Digitar sem olhar dobra a produtividade'],
      quiz: [
        { lv: '*', q: 'Para abrir um programa ou pasta com o mouse, você costuma:', o: ['Clicar uma vez com o direito', 'Dar dois cliques com o esquerdo', 'Rolar a rodinha', 'Arrastar para fora'], a: 1, w: 'Duplo clique abre.' },
        { lv: '*', t: 'fill', q: 'O atalho para desfazer é Ctrl + ___', ans: ['z'], w: 'Ctrl+Z desfaz; Ctrl+Y refaz.' },
        { lv: 'b', q: 'Qual tecla apaga a letra que está antes do cursor?', o: ['Enter', 'Backspace', 'Shift', 'Esc'], a: 1, w: 'Backspace apaga para trás.' },
        { lv: 'b', t: 'tf', q: 'O botão direito do mouse abre um menu com opções.', a: true, w: 'É o chamado menu de contexto.' },
        { lv: 'i', q: 'Qual atalho tira print de uma parte da tela no Windows?', o: ['Ctrl + P', 'Win + Shift + S', 'Alt + F4', 'Ctrl + S'], a: 1, w: 'Abre a Ferramenta de Captura.' },
        { lv: 'i', t: 'order', q: 'Coloque em ordem para mover um texto de lugar:', items: ['Selecionar o texto', 'Ctrl + X', 'Clicar no novo lugar', 'Ctrl + V'], w: 'Recortar e colar move o conteúdo.' },
        { lv: 'a', q: 'Para abrir o Gerenciador de Tarefas direto:', o: ['Ctrl + Shift + Esc', 'Win + E', 'Alt + Tab', 'Ctrl + T'], a: 0, w: 'Mais rápido que Ctrl+Alt+Del.' },
        { lv: 'a', q: 'Win + seta para a esquerda faz:', o: ['Fecha a janela', 'Encaixa a janela na metade esquerda da tela', 'Muda o idioma', 'Minimiza tudo'], a: 1, w: 'Snap: ótimo para trabalhar com duas janelas lado a lado.' }
      ]
    },
    {
      id: 'inf3', title: 'Arquivos e pastas', min: { b: 18, i: 18, a: 18 },
      b: [
        ['an', '📁', 'Gavetas dentro de gavetas', "Um **arquivo** é uma coisa guardada: uma foto, um texto, uma planilha. Uma **pasta** é uma gaveta para organizar arquivos. Dentro de uma pasta pode ter outras pastas, como gavetas dentro de gavetas."],
        ['flow', 'Criar uma pasta', ['Abra o Explorador de Arquivos (ícone de pasta amarela)', 'Escolha onde, por exemplo Documentos', 'Botão direito → Novo → Pasta', 'Digite o nome e aperte Enter']],
        ['an', '🗑️', 'A lixeira guarda o que você jogou fora', "Apagou sem querer? Calma: o arquivo vai para a **Lixeira**. Abra a Lixeira, clique com o botão direito no arquivo e escolha **Restaurar**."],
        ['tip', "Dê nomes que expliquem o conteúdo: `Contrato Ana Souza 2026.pdf` é muito melhor que `documento1.pdf`."]
      ],
      i: [
        ['tbl', 'Extensões: o sobrenome do arquivo', ['Extensão', 'Tipo', 'Abre com'], [['.docx', 'documento de texto', 'Word, Google Docs'], ['.xlsx', 'planilha', 'Excel, Google Planilhas'], ['.pptx', 'apresentação', 'PowerPoint'], ['.pdf', 'documento fechado', 'navegador, Acrobat'], ['.jpg / .png', 'imagem', 'Fotos'], ['.mp4', 'vídeo', 'player de vídeo'], ['.zip', 'pacote compactado', 'Windows já abre'], ['.exe', 'programa (Windows)', 'executa: cuidado!']]],
        ['list', 'Organização que funciona', ['Uma pasta por área: Financeiro, Clientes, Pessoal', 'Dentro, por ano ou cliente', 'Datas no formato `2026-10-11` ordenam certo', 'Evite salvar tudo na Área de Trabalho', 'Ative a exibição de extensões: Explorador → Exibir → Mostrar → Extensões']],
        ['tip', "Ctrl + clique seleciona vários arquivos soltos; Shift + clique seleciona uma sequência."]
      ],
      a: [
        ['t', 'Caminhos e sistemas de arquivos', "Todo arquivo tem um endereço (caminho): `C:\\Users\\gui\\Documentos\\contratos\\2026.pdf`. O disco é formatado com um sistema de arquivos: **NTFS** (Windows, permissões e arquivos grandes), **exFAT** (pendrives entre Windows e Mac), **APFS** (Mac), **ext4** (Linux)."],
        ['list', 'Práticas profissionais', ['Backup 3-2-1: 3 cópias, 2 mídias, 1 fora de casa (nuvem)', 'Sincronização (OneDrive/Drive) não é backup: apagou lá, apaga aqui', 'Use versões de arquivos (histórico do OneDrive/Drive)', 'Pesquisa avançada no Explorador: `tipo:pdf modificado:esta semana`', 'Compacte (.zip) para enviar muitos arquivos de uma vez']]
      ],
      rec: ['Arquivo é o conteúdo; pasta é a gaveta que organiza', 'Apagou sem querer? Restaure pela Lixeira', 'A extensão (.pdf, .xlsx, .exe) diz o tipo do arquivo', 'Nomes claros e pastas por área e ano', 'Sincronizar não é backup: tenha cópias separadas'],
      quiz: [
        { lv: '*', q: 'Qual extensão é de planilha?', o: ['.docx', '.xlsx', '.mp4', '.png'], a: 1, w: 'xlsx = Excel.' },
        { lv: '*', t: 'tf', q: 'Um arquivo apagado normalmente vai para a Lixeira e pode ser restaurado.', a: true, w: 'Até a Lixeira ser esvaziada.' },
        { lv: 'b', t: 'order', q: 'Coloque em ordem para criar uma pasta:', items: ['Abrir o Explorador de Arquivos', 'Ir até Documentos', 'Botão direito → Novo → Pasta', 'Digitar o nome e Enter'], w: 'Abre, escolhe o lugar, cria e nomeia.' },
        { lv: 'b', q: 'Qual o melhor nome de arquivo?', o: ['doc1.pdf', 'final_final2.pdf', 'Contrato Ana Souza 2026.pdf', 'aaa.pdf'], a: 2, w: 'O nome deve dizer o que tem dentro.' },
        { lv: 'i', q: 'Para selecionar vários arquivos que não estão em sequência:', o: ['Shift + clique', 'Ctrl + clique', 'Alt + clique', 'Duplo clique'], a: 1, w: 'Shift seleciona intervalo; Ctrl, itens soltos.' },
        { lv: 'i', q: 'Por que é perigoso abrir `foto.jpg.exe` recebido por e-mail?', o: ['Fotos são perigosas', 'É um programa disfarçado de imagem', 'Pode ocupar espaço', 'Não abre'], a: 1, w: 'A extensão real é a última: .exe executa.' },
        { lv: 'a', q: 'Para um pendrive usado no Windows e no Mac, o sistema de arquivos mais prático é:', o: ['NTFS', 'exFAT', 'ext4', 'APFS'], a: 1, w: 'exFAT é lido e gravado nos dois.' },
        { lv: 'a', t: 'tf', q: 'Ter os arquivos sincronizados no OneDrive já substitui o backup.', a: false, w: 'Se apagar ou um vírus criptografar, a sincronização replica o estrago.' }
      ]
    },
    {
      id: 'inf4', title: 'Programas e aplicativos', min: { b: 15, i: 15, a: 18 },
      b: [
        ['an', '🧰', 'Cada programa é uma ferramenta', "Para escrever, você usa o Word. Para ver sites, o navegador. Para fazer contas, a planilha. Cada **programa** (ou **aplicativo**, ou **app**) é uma ferramenta para um tipo de trabalho."],
        ['flow', 'Instalar um programa com segurança', ['Abra a Microsoft Store ou o site oficial', 'Procure o programa pelo nome', 'Clique em Instalar ou Baixar', 'Siga as telas e leia antes de aceitar', 'Abra pelo menu Iniciar']],
        ['tip', "Baixe só de lojas oficiais ou do site do fabricante. Programa “craqueado” (pirata) é a porta de entrada nº 1 de vírus."]
      ],
      i: [
        ['list', 'Cuidados na instalação', ['Desmarque ofertas extras (barra de ferramentas, “otimizadores”)', 'Prefira instaladores do site oficial ou loja', 'Desinstale pelo caminho certo: Configurações → Aplicativos', 'Atualize programas: atualização corrige falhas de segurança', 'Desconfie de programas que pedem para desativar o antivírus']],
        ['tbl', 'Programas essenciais de escritório', ['Para', 'Exemplos'], [['Navegar', 'Chrome, Edge, Firefox'], ['Documentos e planilhas', 'Microsoft 365, Google Workspace, LibreOffice (grátis)'], ['PDF', 'navegador, Acrobat Reader'], ['Compactar', 'nativo do Windows, 7-Zip'], ['Reuniões', 'Teams, Meet, Zoom'], ['Senhas', 'Bitwarden, 1Password']]]
      ],
      a: [
        ['code', 'bash', `# Windows: instalar e atualizar pelo terminal (winget)
winget search chrome
winget install Google.Chrome
winget upgrade --all`, "Gerenciadores de pacote instalam e atualizam dezenas de programas com um comando: é assim que equipes de TI configuram máquinas."],
        ['t', 'Licenças', "**Proprietário** (Office, Windows): paga licença ou assinatura. **Freeware**: grátis, código fechado. **Open source** (LibreOffice, Firefox, VS Code): código aberto, geralmente grátis. **SaaS**: você usa pela internet e paga assinatura (Google Workspace, Conta Azul)."]
      ],
      rec: ['Programa (app) é uma ferramenta para um tipo de trabalho', 'Instale só de lojas oficiais ou do site do fabricante', 'Pirataria é a principal porta de entrada de vírus', 'Desinstale por Configurações → Aplicativos', 'Atualizações corrigem falhas de segurança'],
      quiz: [
        { lv: '*', q: 'De onde é mais seguro baixar programas?', o: ['De qualquer site de download', 'Da loja oficial ou do site do fabricante', 'De links no WhatsApp', 'De sites de pirataria'], a: 1, w: 'Fontes oficiais evitam programas adulterados.' },
        { lv: '*', t: 'tf', q: 'Atualizar programas ajuda a proteger o computador.', a: true, w: 'Atualizações corrigem falhas exploradas por vírus.' },
        { lv: 'b', q: 'Para escrever um texto, o programa mais comum é:', o: ['Excel', 'Word', 'Paint', 'Calculadora'], a: 1, w: 'Word (ou Google Docs).' },
        { lv: 'b', t: 'order', q: 'Coloque em ordem para instalar um app:', items: ['Abrir a Microsoft Store', 'Procurar o programa', 'Clicar em Instalar', 'Abrir pelo menu Iniciar'], w: 'Loja, busca, instala, usa.' },
        { lv: 'i', q: 'Onde desinstalar um programa no Windows 11?', o: ['Arrastando o ícone para a lixeira', 'Configurações → Aplicativos', 'Apagando a pasta do programa', 'No navegador'], a: 1, w: 'Assim o desinstalador remove tudo corretamente.' },
        { lv: 'i', q: 'Um suíte de escritório gratuita e de código aberto é:', o: ['Microsoft 365', 'LibreOffice', 'Photoshop', 'Windows'], a: 1, w: 'LibreOffice: Writer, Calc, Impress.' },
        { lv: 'a', t: 'fill', q: 'Complete o comando para atualizar todos os programas: winget upgrade --___', ans: ['all'], w: 'winget upgrade --all.' },
        { lv: 'a', q: 'Google Workspace é um exemplo de:', o: ['Freeware', 'SaaS (software como serviço)', 'Hardware', 'Sistema operacional'], a: 1, w: 'Usado pela internet, pago por assinatura.' }
      ]
    },
    {
      id: 'inf5', title: 'Internet, navegador e pesquisa', min: { b: 15, i: 18, a: 18 },
      b: [
        ['an', '🌍', 'Uma biblioteca do tamanho do mundo', "A internet liga computadores do mundo todo. O **navegador** (Chrome, Edge) é a janela para visitar os **sites**. Cada site tem um endereço, como `gov.br` ou `wikipedia.org`."],
        ['list', 'Partes do navegador', ['**Barra de endereço**: digite o site ou o que quer pesquisar', '**Abas**: várias páginas abertas ao mesmo tempo (Ctrl + T abre uma nova)', '**Voltar**: a setinha para a esquerda', '**Favoritos**: a estrela guarda sites que você usa sempre']],
        ['an', '🔎', 'Perguntar bem para achar bem', "Para pesquisar, use poucas palavras importantes: em vez de “como eu faço para tirar segunda via do boleto da conta de luz”, tente `segunda via conta de luz Neoenergia`."]
      ],
      i: [
        ['tbl', 'Truques de pesquisa no Google', ['Digite', 'Para'], [['"frase exata"', 'achar exatamente essa frase'], ['site:gov.br imposto de renda', 'pesquisar só dentro de um site'], ['filetype:pdf contrato modelo', 'achar só PDFs'], ['excel -mac', 'excluir uma palavra'], ['procv OR proch', 'um ou outro termo']]],
        ['list', 'Navegar com segurança', ['Confira o endereço antes de digitar senha (bancodobrasil.com.br, não b4nco-brasil.com)', 'Cadeado + https protegem a conexão, mas não garantem que o site é honesto', 'Janela anônima não deixa histórico no aparelho, mas não te deixa invisível', 'Bloqueie notificações de sites desconhecidos']]
      ],
      a: [
        ['list', 'Avaliar se uma informação é confiável', ['Quem publicou? Tem autor e data?', 'Fonte primária (órgão oficial, documentação) > blog > rede social', 'Confirme em duas fontes independentes', 'Desconfie de títulos alarmistas', 'Para código: documentação oficial, depois Stack Overflow, depois IA (conferindo)']],
        ['t', 'DevTools: o raio-x do site', "F12 abre as ferramentas do desenvolvedor: aba Elements mostra o HTML, Console mostra erros, Network mostra cada arquivo baixado e seu tempo. É a primeira ferramenta para investigar um site lento ou quebrado."]
      ],
      rec: ['O navegador é a janela para os sites', 'Abas deixam várias páginas abertas (Ctrl+T)', 'Pesquise com poucas palavras-chave', 'Use aspas para frase exata e site: para buscar num site', 'Confira o endereço antes de digitar senha'],
      quiz: [
        { lv: '*', q: 'Qual é um navegador?', o: ['Word', 'Chrome', 'Excel', 'Windows'], a: 1, w: 'Chrome, Edge, Firefox e Safari são navegadores.' },
        { lv: '*', t: 'tf', q: 'Ver o cadeado no navegador garante que o site é honesto.', a: false, w: 'O cadeado protege a conexão; golpistas também usam https. Confira o endereço.' },
        { lv: 'b', q: 'Qual pesquisa tende a dar resultados melhores?', o: ['“oi tudo bem, me ajuda a achar o boleto”', 'segunda via boleto energia', 'boleto??', 'me ajuda'], a: 1, w: 'Poucas palavras-chave.' },
        { lv: 'b', t: 'fill', q: 'O atalho para abrir uma nova aba é Ctrl + ___', ans: ['t'], w: 'Ctrl+T = nova aba; Ctrl+W fecha.' },
        { lv: 'i', q: 'Para buscar só dentro do site gov.br, você digita:', o: ['gov.br only', 'site:gov.br assunto', '"gov.br"', 'filetype:gov.br'], a: 1, w: 'O operador site: limita a busca.' },
        { lv: 'i', q: 'A janela anônima:', o: ['Esconde você da internet', 'Não guarda histórico neste aparelho', 'Deixa a internet mais rápida', 'Protege contra vírus'], a: 1, w: 'Sites e provedor ainda veem o acesso.' },
        { lv: 'a', q: 'Qual aba do DevTools mostra cada arquivo baixado e o tempo que levou?', o: ['Elements', 'Console', 'Network', 'Application'], a: 2, w: 'Network = rede.' },
        { lv: 'a', t: 'order', q: 'Ordene as fontes da mais para a menos confiável para uma regra de imposto:', items: ['Site da Receita Federal', 'Artigo de contador com fontes', 'Post em rede social'], w: 'Fonte primária primeiro.' }
      ]
    },
    {
      id: 'inf6', title: 'E-mail e comunicação profissional', min: { b: 15, i: 18, a: 15 },
      b: [
        ['an', '📧', 'A carta que chega na hora', "O e-mail é uma carta digital. Tem um **endereço** (como `ana@empresa.com.br`), um **assunto** (o título da carta) e o **texto**. Também dá para mandar arquivos junto: os **anexos**."],
        ['flow', 'Mandar um e-mail', ['Clique em Escrever (ou Novo e-mail)', 'Em Para: digite o endereço', 'Escreva um Assunto claro', 'Escreva a mensagem', 'Anexe arquivos no clipe 📎 se precisar', 'Clique em Enviar']],
        ['tip', "Banco e governo nunca pedem senha por e-mail. Se pedirem, é golpe."]
      ],
      i: [
        ['tbl', 'Campos do e-mail', ['Campo', 'Uso'], [['Para', 'quem precisa agir'], ['Cc (cópia)', 'quem precisa saber'], ['Cco (cópia oculta)', 'enviar a muitos sem expor os endereços'], ['Responder', 'só ao remetente'], ['Responder a todos', 'a todos da conversa (use com cuidado)'], ['Encaminhar', 'enviar a mensagem para outra pessoa']]],
        ['code', 'text', `Assunto: Renegociação do contrato 4521 – proposta até 15/10

Olá, Ana, tudo bem?

Conforme conversamos, segue a proposta de renegociação em anexo:
• entrada de R$ 500,00
• saldo em 6 parcelas de R$ 380,00

Se estiver de acordo, basta responder este e-mail até 15/10.

Atenciosamente,
Gui · Financeiro · (61) 9xxxx-xxxx`, "Assunto específico com prazo, saudação, contexto em uma linha, pontos em lista, ação clara, assinatura."]
      ],
      a: [
        ['list', 'E-mail em escala', ['Regras e pastas automáticas (filtros) por remetente e assunto', 'Modelos (respostas prontas) para mensagens repetidas', 'Agendar envio para o horário comercial', 'Inbox zero: processe (responder, delegar, arquivar, agendar) em blocos de tempo', 'Para envio em massa (cobrança, marketing) use ferramenta própria, com descadastro e domínio autenticado (SPF/DKIM/DMARC)']],
        ['t', 'Reconhecendo phishing', "Sinais: urgência (“sua conta será bloqueada hoje”), remetente parecido mas diferente (`suporte@itau-seguranca.com`), links que, ao passar o mouse, mostram outro endereço, anexos inesperados (.zip, .html, .exe). Na dúvida, acesse o serviço digitando o endereço oficial."]
      ],
      rec: ['E-mail tem endereço, assunto, texto e anexos', 'Para: quem age; Cc: quem acompanha; Cco: cópia oculta', 'Assunto específico e ação clara no texto', 'Responder a todos só quando todos precisam', 'Urgência, remetente estranho e links trocados = phishing'],
      quiz: [
        { lv: '*', q: 'Para enviar a 50 clientes sem que um veja o e-mail do outro, use:', o: ['Para', 'Cc', 'Cco', 'Responder a todos'], a: 2, w: 'Cco = cópia oculta.' },
        { lv: '*', t: 'tf', q: 'Seu banco pode pedir sua senha por e-mail.', a: false, w: 'Nunca. Pedido de senha por e-mail é golpe.' },
        { lv: 'b', q: 'O que é um anexo?', o: ['Um arquivo enviado junto com o e-mail', 'O assunto', 'A assinatura', 'Um vírus'], a: 0, w: 'O clipe 📎 adiciona anexos.' },
        { lv: 'b', t: 'order', q: 'Coloque em ordem para enviar um e-mail:', items: ['Clicar em Escrever', 'Digitar o endereço em Para', 'Escrever o assunto e a mensagem', 'Clicar em Enviar'], w: 'Novo, destinatário, conteúdo, enviar.' },
        { lv: 'i', q: 'Qual é o melhor assunto?', o: ['Oi', 'Urgente!!!', 'Renegociação contrato 4521 – proposta até 15/10', 'Documento'], a: 2, w: 'Específico, com contexto e prazo.' },
        { lv: 'i', q: 'Cc deve ser usado para:', o: ['Quem precisa agir', 'Quem só precisa ficar sabendo', 'Esconder destinatários', 'Anexar'], a: 1, w: 'Quem age vai no Para.' },
        { lv: 'a', q: 'Qual é um sinal típico de phishing?', o: ['Assinatura com telefone', 'Urgência e link que aponta para outro domínio', 'E-mail em português', 'Anexo PDF esperado de um colega'], a: 1, w: 'Passe o mouse no link antes de clicar.' },
        { lv: 'a', t: 'fill', q: 'Os três registros que autenticam o envio de e-mail do domínio são SPF, DKIM e ___', ans: ['dmarc'], w: 'Sem eles, e-mails em massa caem no spam.' }
      ]
    }
  ]
});
