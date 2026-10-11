CC.tracks.push({
  id: 'hw', ord: -8, name: 'Hardware e Manutenção', short: 'Hardware', glyph: '▣', hue: 160,
  desc: 'As peças do computador, como escolher e montar, formatar, instalar drivers e diagnosticar defeitos.',
  test: [
    { d: 1, q: 'Qual peça é o “cérebro” que faz os cálculos?', o: ['Fonte', 'Processador (CPU)', 'Gabinete', 'Cooler'], a: 1 },
    { d: 1, q: 'O que guarda os arquivos permanentemente?', o: ['RAM', 'SSD/HD', 'Placa de vídeo', 'Fonte'], a: 1 },
    { d: 2, q: 'Para jogos e edição de vídeo, a peça mais importante além da CPU é:', o: ['Placa de vídeo (GPU)', 'Teclado', 'Gabinete', 'Placa de som'], a: 0 },
    { d: 2, q: 'Para formatar e instalar o Windows você precisa normalmente de:', o: ['Um pendrive de instalação (8 GB+) criado com a ferramenta oficial', 'Um CD de música', 'Um cabo HDMI', 'Nada'], a: 0 },
    { d: 3, q: 'Antes de comprar memória RAM nova, é essencial conferir:', o: ['A cor', 'O padrão (DDR4/DDR5) e a frequência suportados pela placa-mãe', 'A marca do monitor', 'O tamanho do gabinete'], a: 1 },
    { d: 3, q: 'Tela azul com código MEMORY_MANAGEMENT sugere problema em:', o: ['Teclado', 'Memória RAM ou drivers', 'Monitor', 'Internet'], a: 1 }
  ],
  exam: [
    { t: 'order', q: 'Ordene a montagem básica de um PC:', items: ['Instalar CPU e cooler na placa-mãe', 'Encaixar a memória RAM', 'Instalar o SSD M.2', 'Colocar a placa-mãe no gabinete', 'Ligar cabos da fonte', 'Instalar a placa de vídeo e ligar'], w: 'CPU, RAM e M.2 são mais fáceis de instalar com a placa fora do gabinete.' },
    { t: 'tf', q: 'Uma fonte genérica barata é tão segura quanto uma fonte certificada de boa marca.', a: false, w: 'Fonte ruim pode queimar todas as peças. Prefira certificação 80 Plus de marcas confiáveis.' },
    { q: 'O PC não liga, nem ventoinha gira. Primeiro teste:', o: ['Trocar o processador', 'Conferir tomada, cabo, chave da fonte e botão', 'Formatar', 'Trocar o monitor'], a: 1, w: 'Comece pelo mais simples e barato.' },
    { t: 'fill', q: 'O firmware moderno que substituiu a BIOS se chama ___', ans: ['uefi'], w: 'UEFI.' },
    { q: 'Depois de instalar o Windows, o próximo passo é:', o: ['Instalar drivers e atualizações', 'Desligar a internet para sempre', 'Desativar o antivírus', 'Instalar 10 navegadores'], a: 0, w: 'Drivers do chipset, vídeo e rede, mais Windows Update.' }
  ],
  lessons: [
    {
      id: 'hw1', title: 'As peças do computador', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🧍', 'O computador é um corpo', "**Processador** é o cérebro. **Memória RAM** é a memória de curto prazo (o que você está pensando agora). **SSD** é a memória de longo prazo (o que você lembra para sempre). **Placa-mãe** é o esqueleto que liga tudo. **Fonte** é o coração que manda energia."],
        ['list', 'E mais', ['**Placa de vídeo**: desenha as imagens (essencial para jogos)', '**Cooler**: ventilador que esfria o processador', '**Gabinete**: a caixa que protege tudo']],
        ['tip', "Calor é o maior inimigo do computador: deixe as saídas de ar livres e limpe a poeira."]
      ],
      i: [
        ['tbl', 'Peça por peça', ['Peça', 'O que olhar'], [['CPU', 'núcleos, geração (Intel Core Ultra/14ª, Ryzen 7000/9000), soquete'], ['Placa-mãe', 'soquete compatível, slots M.2, padrão de RAM'], ['RAM', 'capacidade (16 GB), DDR4 ou DDR5, dual channel (2 pentes)'], ['SSD', 'NVMe M.2 (muito mais rápido que SATA), 512 GB+'], ['GPU', 'VRAM e desempenho no seu uso'], ['Fonte', 'potência com folga, 80 Plus, marca confiável']]],
        ['t', 'Gargalo', "O computador é tão rápido quanto sua peça mais fraca para aquela tarefa. Planilha grande lenta? Provavelmente RAM. Abre programas devagar? Disco. Jogo travando? GPU ou CPU."]
      ],
      a: [
        ['list', 'Detalhes que pegam', ['Dual channel: 2×8 GB é mais rápido que 1×16 GB', 'Linhas PCIe: alguns slots M.2 dividem banda com SATA/GPU (leia o manual)', 'TDP e cooler: CPU forte com cooler fraco reduz clock (thermal throttling)', 'XMP/EXPO: ative no firmware para a RAM rodar na velocidade anunciada', 'Fonte: potência real e qualidade importam mais que o número no rótulo']],
        ['t', 'Monitorando', "HWiNFO mostra temperaturas, clocks e voltagens; CrystalDiskInfo mostra a saúde (SMART) do disco; MemTest86 testa a RAM. Temperaturas acima de ~90 °C na CPU em uso constante indicam refrigeração insuficiente."]
      ],
      rec: ['CPU é o cérebro; RAM, a memória de trabalho; SSD guarda tudo', 'A placa-mãe liga as peças e define a compatibilidade', 'Fonte de qualidade protege o computador inteiro', 'O gargalo é a peça mais fraca para a tarefa', 'Calor e poeira encurtam a vida das peças'],
      quiz: [
        { lv: '*', q: 'Qual peça manda energia para todas as outras?', o: ['CPU', 'Fonte', 'SSD', 'RAM'], a: 1, w: 'A fonte converte a energia da tomada.' },
        { lv: '*', t: 'tf', q: 'Calor e poeira prejudicam o computador.', a: true, w: 'Superaquecimento reduz desempenho e vida útil.' },
        { lv: 'b', q: 'Qual peça desenha as imagens e é essencial para jogos?', o: ['Placa de vídeo', 'Fonte', 'Gabinete', 'Teclado'], a: 0, w: 'GPU.' },
        { lv: 'b', t: 'order', q: 'Ligue cada parte ao corpo, na ordem cérebro → memória curta → memória longa:', items: ['Processador', 'Memória RAM', 'SSD'], w: 'Cérebro, curto prazo, longo prazo.' },
        { lv: 'i', q: 'Planilhas enormes deixam o PC lento e a memória está em 95%. O que melhorar?', o: ['RAM', 'Mouse', 'Fonte', 'Monitor'], a: 0, w: 'Falta de RAM obriga o sistema a usar o disco.' },
        { lv: 'i', q: 'Qual SSD é mais rápido?', o: ['SATA 2,5"', 'NVMe M.2', 'HD 7200 rpm', 'Pendrive'], a: 1, w: 'NVMe usa PCIe.' },
        { lv: 'a', q: '2×8 GB costuma ser melhor que 1×16 GB porque:', o: ['Ocupa menos espaço', 'Ativa dual channel, dobrando a largura de banda', 'Consome menos', 'É obrigatório'], a: 1, w: 'Dois canais de memória.' },
        { lv: 'a', t: 'fill', q: 'Perfil que faz a RAM rodar na velocidade anunciada (Intel): ___', ans: ['xmp'], w: 'XMP (Intel) / EXPO (AMD).' }
      ]
    },
    {
      id: 'hw2', title: 'Formatar e instalar o Windows', min: { b: 15, i: 20, a: 20 },
      b: [
        ['an', '🧹', 'Faxina completa', "Formatar é apagar tudo e reinstalar o sistema do zero, como mudar para uma casa limpa. Antes, você precisa tirar as coisas que quer guardar (o **backup**)."],
        ['flow', 'O caminho', ['Fazer backup dos arquivos', 'Criar o pendrive de instalação', 'Iniciar o PC pelo pendrive', 'Instalar o Windows', 'Instalar drivers e atualizações', 'Devolver os arquivos']],
        ['tip', "Muitas vezes nem precisa de pendrive: Configurações → Sistema → Recuperação → Restaurar o PC."]
      ],
      i: [
        ['list', 'Passo a passo real', ['Baixe a “Ferramenta de Criação de Mídia” no site da Microsoft', 'Use um pendrive de 8 GB ou mais (será apagado)', 'Reinicie e aperte a tecla do menu de boot (F12, F11, F8 ou Esc, depende da marca)', 'Escolha o pendrive, idioma, “Não tenho chave” se o PC já tinha Windows ativado', 'Instalação personalizada → apague as partições do disco do sistema → avançar', 'Depois: Windows Update, drivers do fabricante, programas e arquivos']],
        ['tip', "Anote antes: senha do Wi-Fi, logins importantes e a chave do Office (ou confirme que está na sua conta Microsoft)."]
      ],
      a: [
        ['list', 'Para quem cuida de vários PCs', ['Imagem padrão + Autopilot/Intune para empresas', 'Drivers do fabricante (Dell Command, Lenovo Vantage) em vez de “driver booster”', 'Clonar SSD (Macrium, Clonezilla) ao trocar de disco', 'GPT + UEFI + Secure Boot e TPM 2.0 são exigidos pelo Windows 11', 'Script pós-instalação com winget instala todos os programas de uma vez']],
        ['code', 'powershell', `winget import -i programas.json   # reinstala sua lista de apps
# programas.json gerado antes com:
winget export -o programas.json`, "Exporte seus programas antes de formatar e reinstale tudo com um comando."]
      ],
      rec: ['Formatar é apagar e reinstalar o sistema do zero', 'Backup sempre antes de formatar', 'Pendrive de 8 GB+ com a ferramenta oficial da Microsoft', 'Depois de instalar: atualizações e drivers do fabricante', 'Restaurar o PC pelas Configurações resolve muitos casos sem pendrive'],
      quiz: [
        { lv: '*', q: 'O que fazer ANTES de formatar?', o: ['Backup dos arquivos', 'Desligar o monitor', 'Trocar o teclado', 'Nada'], a: 0, w: 'Formatar apaga tudo.' },
        { lv: '*', t: 'tf', q: 'Dá para reinstalar o Windows pelas Configurações, sem pendrive.', a: true, w: 'Sistema → Recuperação → Restaurar o PC.' },
        { lv: 'b', t: 'order', q: 'Ordene os passos de uma formatação:', items: ['Fazer backup', 'Criar o pendrive', 'Iniciar pelo pendrive', 'Instalar o Windows', 'Instalar drivers'], w: 'Backup sempre primeiro.' },
        { lv: 'b', q: 'Formatar é:', o: ['Limpar a tela', 'Apagar tudo e reinstalar o sistema', 'Trocar o mouse', 'Atualizar o navegador'], a: 1, w: 'Começar do zero.' },
        { lv: 'i', q: 'Qual tamanho mínimo de pendrive para instalar o Windows?', o: ['1 GB', '8 GB', '64 GB', '512 MB'], a: 1, w: '8 GB ou mais.' },
        { lv: 'i', q: 'Onde baixar drivers com segurança?', o: ['Site do fabricante do notebook/placa-mãe ou Windows Update', 'Qualquer site de download', 'Programas “atualizador milagroso”', 'Grupos de WhatsApp'], a: 0, w: 'Fonte oficial.' },
        { lv: 'a', q: 'O Windows 11 exige, entre outros:', o: ['TPM 2.0 e Secure Boot', 'HD mecânico', 'BIOS legada', '4 GB de disco'], a: 0, w: 'Requisitos de segurança do Windows 11.' },
        { lv: 'a', t: 'fill', q: 'Comando para exportar a lista de programas: winget ___ -o programas.json', ans: ['export'], w: 'Depois: winget import.' }
      ]
    },
    {
      id: 'hw3', title: 'Diagnóstico de defeitos', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🕵️', 'Seja um detetive', "Quando algo dá errado, não chute. Pergunte: o que mudou? O problema acontece sempre ou às vezes? Teste uma coisa de cada vez, começando pela mais simples."],
        ['list', 'Antes de chamar o técnico', ['Desligar e ligar de novo (reiniciar resolve muita coisa)', 'Conferir cabos e tomadas', 'Ver se o problema é só num programa', 'Anotar a mensagem de erro exata']]
      ],
      i: [
        ['tbl', 'Sintoma → suspeitos', ['Sintoma', 'Verificar'], [['Não liga nada', 'tomada, cabo, chave da fonte, botão'], ['Liga mas sem imagem', 'cabo do monitor, entrada certa, RAM mal encaixada, GPU'], ['Desliga sozinho', 'superaquecimento, fonte'], ['Tela azul', 'código do erro, driver novo, RAM, disco'], ['Muito lento', 'Gerenciador de Tarefas, disco, RAM, malware'], ['Sem internet', 'outros aparelhos funcionam? reiniciar roteador, driver de rede']]],
        ['tip', "Pesquise o código exato da tela azul (ex.: `IRQL_NOT_LESS_OR_EQUAL`): ele aponta o caminho."]
      ],
      a: [
        ['list', 'Método profissional', ['Reproduzir: descobrir o passo a passo que causa o erro', 'Isolar: trocar uma variável por vez (peça, driver, cabo)', 'Evidência: Visualizador de eventos, minidumps (WinDbg/BlueScreenView), SMART do disco', 'Hipótese → teste → conclusão, documentando', 'Corrigir a causa, não o sintoma, e registrar para a próxima vez']],
        ['t', 'Saúde do disco', "Atributos SMART como Reallocated Sectors e Pending Sectors subindo indicam disco morrendo: faça backup imediato. SSDs informam o desgaste em % (Percentage Used)."]
      ],
      rec: ['Diagnosticar é testar uma coisa de cada vez, da mais simples à mais cara', 'Reiniciar e conferir cabos resolve muitos casos', 'Anote o código exato do erro', 'Desligamentos sozinhos costumam ser calor ou fonte', 'Disco com SMART ruim: backup imediato'],
      quiz: [
        { lv: '*', q: 'O computador não liga. Qual teste fazer primeiro?', o: ['Trocar a placa-mãe', 'Conferir tomada e cabo', 'Formatar', 'Comprar outro'], a: 1, w: 'Comece pelo mais simples.' },
        { lv: '*', t: 'tf', q: 'Anotar a mensagem de erro exata ajuda a resolver o problema.', a: true, w: 'É a principal pista.' },
        { lv: 'b', q: 'O que costuma resolver muitos problemas simples?', o: ['Reiniciar', 'Gritar com o PC', 'Desligar o monitor', 'Mudar o papel de parede'], a: 0, w: 'Reiniciar limpa estados travados.' },
        { lv: 'b', t: 'order', q: 'Ordene os testes quando a internet cai:', items: ['Ver se outros aparelhos têm internet', 'Reiniciar o roteador', 'Reiniciar o computador', 'Ligar para o provedor'], w: 'Do mais simples ao mais trabalhoso.' },
        { lv: 'i', q: 'O PC desliga sozinho durante tarefas pesadas. Suspeito principal:', o: ['Teclado', 'Superaquecimento ou fonte', 'Mouse', 'Navegador'], a: 1, w: 'Verifique temperaturas e a fonte.' },
        { lv: 'i', q: 'Liga, ventoinhas giram, mas sem imagem. Verifique:', o: ['Cabo do monitor e encaixe da RAM', 'Senha do Wi-Fi', 'O antivírus', 'O papel de parede'], a: 0, w: 'RAM mal encaixada é clássico.' },
        { lv: 'a', q: 'Para analisar a causa de telas azuis, use:', o: ['Minidumps com WinDbg/BlueScreenView', 'Paint', 'Calculadora', 'Bloco de notas'], a: 0, w: 'Os dumps indicam o driver/módulo.' },
        { lv: 'a', t: 'fill', q: 'O sistema de autodiagnóstico dos discos se chama ___', ans: ['smart', 's.m.a.r.t', 's.m.a.r.t.'], w: 'Self-Monitoring, Analysis and Reporting Technology.' }
      ]
    }
  ]
});
