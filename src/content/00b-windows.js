CC.tracks.push({
  id: 'win', ord: -9, name: 'Windows e Produtividade', short: 'Windows', glyph: '⊞', hue: 205,
  desc: 'Dominar o Windows: configurações, nuvem, manutenção, segurança, PDF, impressão e truques que poupam horas.',
  test: [
    { d: 1, q: 'Onde ficam as Configurações do Windows?', o: ['Menu Iniciar → ícone de engrenagem', 'Na Lixeira', 'No navegador', 'No Word'], a: 0 },
    { d: 1, q: 'OneDrive é:', o: ['Um antivírus', 'O armazenamento na nuvem da Microsoft', 'Um navegador', 'Uma impressora'], a: 1 },
    { d: 2, q: 'O computador está travado em um programa. O que abrir?', o: ['Paint', 'Gerenciador de Tarefas', 'Bloco de notas', 'Calculadora'], a: 1 },
    { d: 2, q: 'Para transformar um documento em PDF sem programa extra:', o: ['Imprimir → Microsoft Print to PDF', 'Renomear para .pdf', 'Enviar por e-mail', 'Compactar em .zip'], a: 0 },
    { d: 3, q: 'Para que serve o BitLocker?', o: ['Acelerar a internet', 'Criptografar o disco, protegendo dados se o notebook for roubado', 'Bloquear sites', 'Fazer backup na nuvem'], a: 1 },
    { d: 3, q: 'Um ponto de restauração do Windows permite:', o: ['Recuperar fotos apagadas', 'Voltar configurações e programas do sistema a um estado anterior', 'Formatar o disco', 'Trocar a senha'], a: 1 }
  ],
  exam: [
    { t: 'tf', q: 'Renomear um arquivo de .docx para .pdf transforma o documento em PDF.', a: false, w: 'Mudar a extensão não converte o conteúdo. Use Salvar como PDF ou Imprimir para PDF.' },
    { q: 'Qual atalho abre o Explorador de Arquivos?', o: ['Win + E', 'Win + L', 'Ctrl + E', 'Alt + E'], a: 0, w: 'Win+E = Explorer. Win+L bloqueia a tela.' },
    { t: 'order', q: 'Ordene os passos para compartilhar uma pasta do OneDrive:', items: ['Botão direito na pasta', 'Escolher Compartilhar', 'Digitar o e-mail da pessoa', 'Definir se pode editar ou só ver', 'Enviar'], w: 'Sempre defina a permissão antes de enviar.' },
    { t: 'fill', q: 'Atalho para bloquear a tela ao sair da mesa: Win + ___', ans: ['l'], w: 'Win+L: hábito obrigatório no trabalho.' },
    { q: 'O computador ficou lento de repente. Primeiro passo:', o: ['Formatar', 'Ver no Gerenciador de Tarefas o que está usando CPU, memória e disco', 'Comprar outro', 'Desligar da tomada'], a: 1, w: 'Diagnostique antes de agir.' }
  ],
  lessons: [
    {
      id: 'win1', title: 'Windows por dentro', min: { b: 15, i: 15, a: 18 },
      b: [
        ['an', '🏠', 'A casa do computador', "O Windows é como uma casa: a **Área de Trabalho** é a sala, o **menu Iniciar** é a porta de entrada para todos os cômodos, e a **Barra de Tarefas** (embaixo) é o corredor, com atalhos para o que você mais usa."],
        ['list', 'Onde fica cada coisa', ['**Menu Iniciar** (logo do Windows): abre programas e desliga', '**Barra de Tarefas**: programas abertos e fixados', '**Bandeja** (perto do relógio): Wi-Fi, som, bateria', '**Configurações** (engrenagem): tudo que dá para ajustar']],
        ['tip', "Para achar qualquer coisa, aperte a tecla do Windows e comece a digitar: “calc”, “word”, “impressora”."]
      ],
      i: [
        ['list', 'Configurações que valem ajustar', ['Sistema → Tela: tamanho do texto (escala) e modo noturno', 'Bluetooth e dispositivos: impressora, fone, mouse', 'Personalização → Barra de tarefas: fixar apps', 'Contas → Opções de entrada: PIN ou Windows Hello', 'Aplicativos → Inicialização: tire o que não precisa abrir sozinho']],
        ['t', 'Contas de usuário', "Cada pessoa deve ter sua própria conta. Uma conta **padrão** para o dia a dia e uma **administrador** só para instalar coisas reduz muito o estrago de vírus. Conta Microsoft sincroniza configurações e OneDrive entre computadores."]
      ],
      a: [
        ['tbl', 'Ferramentas do administrador', ['Ferramenta', 'Abre com', 'Para'], [['Gerenciamento do computador', 'compmgmt.msc', 'discos, usuários, serviços'], ['Visualizador de eventos', 'eventvwr', 'ver erros e travamentos'], ['Editor de política de grupo', 'gpedit.msc', 'regras (Pro/Enterprise)'], ['Serviços', 'services.msc', 'programas em segundo plano'], ['PowerShell', 'Win + X → Terminal', 'automação e administração']]],
        ['code', 'powershell', `Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
Get-ComputerInfo | Select-Object OsName, OsVersion, CsTotalPhysicalMemory
Get-ChildItem C:\\Users\\gui\\Downloads -Recurse | Where-Object Length -gt 500MB`, "PowerShell trabalha com objetos: dá para filtrar, ordenar e automatizar tarefas administrativas."]
      ],
      rec: ['Menu Iniciar, Barra de Tarefas e Configurações são o centro do Windows', 'Tecla Windows + digitar acha qualquer coisa', 'Use conta padrão no dia a dia e administrador só para instalar', 'Tire programas desnecessários da inicialização', 'PowerShell automatiza tarefas administrativas'],
      quiz: [
        { lv: '*', q: 'Qual o jeito mais rápido de abrir um programa?', o: ['Procurar ícone na Área de Trabalho', 'Tecla Windows e digitar o nome', 'Reiniciar', 'Abrir o navegador'], a: 1, w: 'A busca do Iniciar acha programas, arquivos e configurações.' },
        { lv: '*', t: 'tf', q: 'Configurações do Windows ficam no ícone de engrenagem.', a: true, w: 'Ou Win + I.' },
        { lv: 'b', q: 'Onde aparecem Wi-Fi, som e bateria?', o: ['No canto da Barra de Tarefas, perto do relógio', 'No menu do Word', 'Na Lixeira', 'No Explorador'], a: 0, w: 'Essa área é a bandeja do sistema.' },
        { lv: 'b', t: 'fill', q: 'Atalho que abre as Configurações: Win + ___', ans: ['i'], w: 'Win + I.' },
        { lv: 'i', q: 'Por que usar conta padrão no dia a dia?', o: ['Deixa o PC mais bonito', 'Limita o estrago se um vírus rodar', 'É obrigatório', 'Acelera a internet'], a: 1, w: 'Sem privilégios de administrador, o malware alcança menos.' },
        { lv: 'i', q: 'O PC demora para ligar por excesso de programas abrindo junto. Onde ajustar?', o: ['Aplicativos → Inicialização', 'Personalização → Cores', 'Rede → Wi-Fi', 'Bluetooth'], a: 0, w: 'Desative o que não precisa iniciar com o Windows.' },
        { lv: 'a', q: 'Para investigar por que o PC travou ontem às 15h:', o: ['Visualizador de eventos', 'Paint', 'Calculadora', 'Bloco de notas'], a: 0, w: 'Os logs do sistema registram erros com horário.' },
        { lv: 'a', t: 'tf', q: 'No PowerShell, os comandos trocam objetos, não só texto.', a: true, w: 'Por isso dá para filtrar e ordenar por propriedades.' }
      ]
    },
    {
      id: 'win2', title: 'Explorador, nuvem e compartilhamento', min: { b: 15, i: 18, a: 18 },
      b: [
        ['an', '☁️', 'Um armário guardado fora de casa', "A **nuvem** é guardar seus arquivos num computador de uma empresa (Microsoft, Google), pela internet. Se seu computador quebrar, os arquivos continuam lá, e você abre de qualquer lugar, até do celular."],
        ['list', 'Serviços de nuvem', ['**OneDrive**: já vem no Windows', '**Google Drive**: junto com a conta Gmail', '**Dropbox** e **iCloud**: outras opções']],
        ['flow', 'Compartilhar um arquivo', ['Botão direito no arquivo', 'Compartilhar', 'Digite o e-mail da pessoa', 'Escolha: pode editar ou só ver', 'Enviar']]
      ],
      i: [
        ['tbl', 'Ícones de status do OneDrive', ['Ícone', 'Significa'], [['Nuvem azul', 'só na nuvem (abre quando tiver internet)'], ['Visto verde', 'baixado neste PC'], ['Círculo verde cheio', 'sempre manter neste dispositivo'], ['Setas', 'sincronizando'], ['X vermelho', 'erro de sincronização']]],
        ['list', 'Permissões sem susto', ['Prefira compartilhar com pessoas específicas, não “qualquer pessoa com o link”', 'Defina “Pode exibir” quando a pessoa não precisa editar', 'Coloque data de expiração em links sensíveis', 'Revise o que você compartilhou de tempos em tempos', 'Dados de clientes: só com quem precisa (LGPD)']]
      ],
      a: [
        ['list', 'Nuvem em empresa', ['SharePoint/Teams para arquivos da equipe; OneDrive para pessoais', 'Drives compartilhados no Google: arquivos pertencem à empresa, não à pessoa', 'Histórico de versões: restaure o arquivo de ontem', 'Retenção e DLP: políticas que impedem vazamento de CPF e cartão', 'Ao desligar um funcionário, transfira a propriedade dos arquivos']],
        ['t', 'Sincronizar x espelhar x backup', "**Sincronização** replica mudanças (inclusive exclusões). **Backup** guarda versões independentes por um período. Ransomware criptografa e a sincronização sobe os arquivos criptografados: por isso histórico de versões e backup separado são essenciais."]
      ],
      rec: ['Nuvem guarda arquivos fora do computador e acessa de qualquer lugar', 'Compartilhe com pessoas específicas e escolha ver ou editar', 'Ícone de nuvem = só online; visto verde = baixado', 'Arquivos da equipe ficam em drives compartilhados da empresa', 'Sincronização não substitui backup'],
      quiz: [
        { lv: '*', q: 'Uma vantagem de guardar arquivos na nuvem é:', o: ['Não precisa de internet nunca', 'Acessar de qualquer lugar e não perder se o PC quebrar', 'Deixar o PC mais rápido', 'Não precisar de senha'], a: 1, w: 'Os arquivos ficam nos servidores do serviço.' },
        { lv: '*', t: 'tf', q: '“Qualquer pessoa com o link” é a forma mais segura de compartilhar dados de clientes.', a: false, w: 'Compartilhe com pessoas específicas.' },
        { lv: 'b', t: 'order', q: 'Ordene para compartilhar um arquivo:', items: ['Botão direito no arquivo', 'Compartilhar', 'Digitar o e-mail', 'Escolher ver ou editar', 'Enviar'], w: 'Sempre escolha a permissão.' },
        { lv: 'b', q: 'Qual serviço de nuvem já vem no Windows?', o: ['OneDrive', 'Spotify', 'Netflix', 'Paint'], a: 0, w: 'OneDrive é da Microsoft.' },
        { lv: 'i', q: 'No OneDrive, o ícone de nuvem azul significa:', o: ['Arquivo com erro', 'Arquivo só na nuvem', 'Arquivo apagado', 'Arquivo com vírus'], a: 1, w: 'Ele baixa quando você abrir.' },
        { lv: 'i', q: 'Para alguém só ler o contrato, a permissão certa é:', o: ['Pode editar', 'Pode exibir', 'Proprietário', 'Administrador'], a: 1, w: 'Menor privilégio necessário.' },
        { lv: 'a', q: 'Ransomware criptografou a pasta sincronizada. O que salva?', o: ['Esperar sincronizar', 'Histórico de versões ou backup independente', 'Renomear arquivos', 'Formatar'], a: 1, w: 'Restaure versões anteriores ao ataque.' },
        { lv: 'a', t: 'fill', q: 'No Microsoft 365, arquivos de equipe ficam no SharePoint; os pessoais no ___', ans: ['onedrive'], w: 'Teams usa SharePoint por baixo.' }
      ]
    },
    {
      id: 'win3', title: 'Manutenção e segurança do PC', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🧽', 'Cuidar do computador é como cuidar da casa', "Atualizar, limpar e trancar a porta. No computador: **atualizações** do Windows, **antivírus** ligado e **bloquear a tela** quando sair (Windows + L)."],
        ['an', '🚑', 'O pronto-socorro: Gerenciador de Tarefas', "Um programa travou? Aperte **Ctrl + Shift + Esc**, clique no programa e em **Finalizar tarefa**."],
        ['tip', "O Windows já vem com antivírus bom: o **Microsoft Defender**. Não precisa instalar outro para uso comum."]
      ],
      i: [
        ['tbl', 'PC lento: diagnóstico', ['Sintoma no Gerenciador de Tarefas', 'Causa provável', 'Ação'], [['Memória perto de 100%', 'muitos programas/abas', 'fechar abas, aumentar RAM'], ['Disco 100% (HD)', 'HD mecânico velho', 'trocar por SSD'], ['CPU alta sem motivo', 'processo travado ou malware', 'finalizar, verificar com Defender'], ['Inicialização demorada', 'muitos apps iniciando', 'desativar na aba Inicialização']]],
        ['list', 'Rotina mensal', ['Windows Update em dia (e reiniciar!)', 'Limpeza de disco / Sensor de Armazenamento', 'Desinstalar o que não usa', 'Conferir backup', 'Trocar senhas que vazaram (haveibeenpwned.com)']]
      ],
      a: [
        ['list', 'Endurecimento (hardening) do Windows', ['BitLocker ligado em notebooks (guarde a chave de recuperação)', 'Usuário padrão + senha forte + Windows Hello', 'Firewall do Windows ativo; não desative para “resolver”', 'Controle de Aplicativos/SmartScreen ligado', 'Pontos de restauração antes de mudanças grandes', 'Em empresa: Intune/políticas de grupo e EDR']],
        ['code', 'powershell', `sfc /scannow                      # repara arquivos do sistema
DISM /Online /Cleanup-Image /RestoreHealth
chkdsk C: /scan                    # verifica o disco
Get-MpComputerStatus | Select AMRunningMode, AntivirusSignatureLastUpdated`, "Comandos de reparo quando o Windows apresenta erros estranhos (rode o terminal como administrador)."]
      ],
      rec: ['Atualize o Windows e reinicie para aplicar', 'Ctrl+Shift+Esc abre o Gerenciador de Tarefas para finalizar o que travou', 'O Microsoft Defender já protege bem o uso comum', 'Win+L bloqueia a tela ao sair da mesa', 'Em notebook, ative o BitLocker e guarde a chave'],
      quiz: [
        { lv: '*', q: 'Um programa travou. O que fazer?', o: ['Desligar na tomada', 'Gerenciador de Tarefas → Finalizar tarefa', 'Apagar o programa', 'Esperar 1 hora'], a: 1, w: 'Ctrl+Shift+Esc.' },
        { lv: '*', t: 'tf', q: 'O Windows já vem com um antivírus chamado Microsoft Defender.', a: true, w: 'Mantenha-o ativo e atualizado.' },
        { lv: 'b', t: 'fill', q: 'Atalho para bloquear a tela: Win + ___', ans: ['l'], w: 'Bloqueie sempre que sair.' },
        { lv: 'b', q: 'Por que instalar as atualizações?', o: ['Para mudar as cores', 'Corrigem falhas de segurança e erros', 'Para gastar internet', 'Não precisa'], a: 1, w: 'Muitos ataques exploram falhas já corrigidas.' },
        { lv: 'i', q: 'No Gerenciador de Tarefas, o disco fica em 100% o tempo todo num PC antigo. Solução mais eficaz:', o: ['Trocar o HD por SSD', 'Trocar o mouse', 'Mudar o papel de parede', 'Instalar outro antivírus'], a: 0, w: 'HD mecânico é o gargalo mais comum.' },
        { lv: 'i', t: 'order', q: 'Ordene a investigação de um PC lento:', items: ['Abrir o Gerenciador de Tarefas', 'Ver o que usa CPU, memória e disco', 'Finalizar ou desinstalar o culpado', 'Conferir se melhorou'], w: 'Diagnóstico antes de remédio.' },
        { lv: 'a', q: 'Qual comando repara arquivos corrompidos do Windows?', o: ['sfc /scannow', 'ping', 'ipconfig', 'dir'], a: 0, w: 'Rode como administrador; DISM complementa.' },
        { lv: 'a', q: 'O BitLocker protege principalmente contra:', o: ['Vírus de e-mail', 'Leitura dos dados se o disco/notebook for roubado', 'Sites falsos', 'Lentidão'], a: 1, w: 'Criptografia do disco em repouso.' }
      ]
    },
    {
      id: 'win4', title: 'PDF, impressão, ZIP e truques', min: { b: 15, i: 15, a: 15 },
      b: [
        ['an', '📄', 'O PDF é uma foto do documento', "O PDF mantém o documento igualzinho em qualquer computador ou celular. Por isso contratos, boletos e currículos são enviados em PDF."],
        ['flow', 'Transformar qualquer documento em PDF', ['Abra o documento', 'Ctrl + P (Imprimir)', 'Em Impressora, escolha “Microsoft Print to PDF”', 'Clique em Imprimir e escolha onde salvar']],
        ['an', '🎒', 'ZIP é uma mochila de arquivos', "Precisa mandar 20 fotos? Selecione todas, botão direito → **Compactar para arquivo ZIP**. Vira um arquivo só, mais fácil de enviar."]
      ],
      i: [
        ['list', 'PDF sem sofrimento', ['Word/Excel: Arquivo → Salvar como → PDF (mantém links)', 'Juntar, dividir e girar páginas: Acrobat Reader, PDF24 ou iLovePDF (cuidado com documentos sigilosos em sites)', 'Assinar: gov.br (assinatura eletrônica válida), Acrobat, DocuSign, Clicksign', 'PDF escaneado sem texto selecionável precisa de OCR']],
        ['tbl', 'Truques do Windows', ['Atalho', 'Faz'], [['Win + V', 'histórico do copiar/colar'], ['Win + H', 'ditado por voz'], ['Win + .', 'emojis e símbolos'], ['Win + Shift + S', 'recorte de tela'], ['Win + Alt + R', 'gravar a tela (Xbox Game Bar)'], ['Win + Ctrl + seta', 'trocar de área de trabalho virtual']]]
      ],
      a: [
        ['t', 'Assinatura eletrônica x digital', "**Assinatura eletrônica** (gov.br, Clicksign) comprova a autoria por login, e-mail, IP e trilha de auditoria. **Assinatura digital** usa certificado ICP-Brasil (e-CPF/e-CNPJ) e tem a presunção legal mais forte. Para contratos comerciais, a eletrônica com trilha de auditoria costuma bastar; atos com exigência legal pedem certificado."],
        ['code', 'powershell', `Compress-Archive -Path .\\contratos\\*.pdf -DestinationPath contratos_out.zip
Expand-Archive .\\recebidos.zip -DestinationPath .\\recebidos
Get-ChildItem *.pdf | Rename-Item -NewName { "2026-10_" + $_.Name }`, "Compactar, extrair e renomear em lote pelo terminal: minutos viram segundos."]
      ],
      rec: ['PDF mantém o documento igual em qualquer aparelho', 'Ctrl+P → Microsoft Print to PDF transforma qualquer coisa em PDF', 'ZIP junta vários arquivos em um só', 'Assine contratos pelo gov.br ou plataformas de assinatura', 'Win+V, Win+H e Win+Shift+S poupam tempo todo dia'],
      quiz: [
        { lv: '*', q: 'Como gerar PDF de qualquer programa que imprime?', o: ['Renomear o arquivo', 'Imprimir → Microsoft Print to PDF', 'Copiar e colar', 'Enviar por WhatsApp'], a: 1, w: 'Uma impressora virtual cria o PDF.' },
        { lv: '*', t: 'tf', q: 'Compactar vários arquivos em .zip facilita o envio.', a: true, w: 'Vira um arquivo só, geralmente menor.' },
        { lv: 'b', t: 'order', q: 'Ordene para gerar um PDF:', items: ['Abrir o documento', 'Apertar Ctrl + P', 'Escolher Microsoft Print to PDF', 'Imprimir e salvar'], w: 'Impressora virtual.' },
        { lv: 'b', q: 'Por que contratos são enviados em PDF?', o: ['Porque é colorido', 'Porque fica igual em qualquer aparelho e é difícil de alterar sem perceber', 'Porque é menor sempre', 'Porque não abre no celular'], a: 1, w: 'Formato fiel e padrão.' },
        { lv: 'i', q: 'Qual atalho mostra o histórico de itens copiados?', o: ['Win + V', 'Ctrl + H', 'Alt + C', 'Win + C'], a: 0, w: 'Ative na primeira vez que usar.' },
        { lv: 'i', q: 'Uma forma gratuita e válida de assinar um PDF no Brasil:', o: ['Colar uma foto da assinatura', 'Assinatura eletrônica do gov.br', 'Escrever o nome em vermelho', 'Imprimir e fotografar'], a: 1, w: 'O gov.br oferece assinatura eletrônica gratuita.' },
        { lv: 'a', q: 'Assinatura digital com e-CPF usa:', o: ['Senha do e-mail', 'Certificado ICP-Brasil', 'Foto do documento', 'Código SMS'], a: 1, w: 'Infraestrutura de Chaves Públicas Brasileira.' },
        { lv: 'a', t: 'fill', q: 'Comando do PowerShell para criar um .zip: ___-Archive', ans: ['compress'], w: 'Compress-Archive / Expand-Archive.' }
      ]
    }
  ]
});
