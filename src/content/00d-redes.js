CC.tracks.push({
  id: 'redes', ord: -7, name: 'Redes e Wi-Fi', short: 'Redes', glyph: '⌬', hue: 185,
  desc: 'Roteador, Wi-Fi, IP, DNS, cabos, rede da empresa, VPN e segurança de rede na prática.',
  test: [
    { d: 1, q: 'O roteador serve para:', o: ['Imprimir', 'Distribuir a internet para os aparelhos da casa ou empresa', 'Guardar arquivos', 'Carregar o celular'], a: 1 },
    { d: 1, q: 'Senha do Wi-Fi forte é:', o: ['12345678', 'O nome da rua', 'Longa e misturada, com protocolo WPA2/WPA3', 'Sem senha'], a: 2 },
    { d: 2, q: 'O comando que mostra o IP do computador no Windows é:', o: ['ipconfig', 'dir', 'cls', 'help'], a: 0 },
    { d: 2, q: 'Wi-Fi 5 GHz em relação ao 2,4 GHz:', o: ['Alcança mais longe e é mais lento', 'É mais rápido, mas alcança menos e atravessa menos paredes', 'É igual', 'Só funciona com cabo'], a: 1 },
    { d: 3, q: 'DHCP faz:', o: ['Criptografa o Wi-Fi', 'Distribui IPs automaticamente para os aparelhos', 'Traduz nomes em IP', 'Bloqueia vírus'], a: 1 },
    { d: 3, q: 'Uma rede de visitantes separada serve para:', o: ['Deixar a internet mais rápida', 'Isolar aparelhos de visitantes dos computadores da empresa', 'Economizar energia', 'Nada'], a: 1 }
  ],
  exam: [
    { t: 'order', q: 'Ordene a investigação de “sem internet” num computador:', items: ['Testar outro site e outro aparelho', 'Rodar ipconfig e ver se tem IP', 'ping 8.8.8.8 (teste sem DNS)', 'ping google.com (teste com DNS)', 'Reiniciar roteador ou chamar o provedor'], w: 'Isola rede local, internet e DNS.' },
    { t: 'tf', q: 'Esconder o nome da rede Wi-Fi (SSID) é uma proteção forte por si só.', a: false, w: 'É fácil de descobrir. O que protege é WPA2/WPA3 com senha forte.' },
    { q: 'O endereço 192.168.0.10 é:', o: ['Um IP público', 'Um IP privado, da rede local', 'Um domínio', 'Um DNS do Google'], a: 1, w: 'Faixas 192.168.x.x, 10.x.x.x e 172.16–31.x.x são privadas.' },
    { t: 'fill', q: 'Comando para testar se um servidor responde: ___ 8.8.8.8', ans: ['ping'], w: 'ping mede resposta e latência.' },
    { q: 'Para acessar com segurança o sistema interno da empresa de casa, usa-se:', o: ['VPN ou acesso zero trust', 'Wi-Fi aberto', 'Pendrive', 'Abrir a porta do banco para a internet'], a: 0, w: 'Túnel criptografado com autenticação.' }
  ],
  lessons: [
    {
      id: 'redes1', title: 'Roteador e Wi-Fi', min: { b: 15, i: 18, a: 18 },
      b: [
        ['an', '📡', 'O roteador é o carteiro da casa', "A internet chega pelo cabo da operadora até o **modem/roteador**. Ele distribui a internet para o celular, o computador e a TV, por **Wi-Fi** (sem fio) ou por **cabo**."],
        ['list', 'Para um Wi-Fi bom', ['Roteador no centro da casa, alto e longe de micro-ondas', 'Senha forte e diferente da que veio de fábrica', 'Reiniciar o roteador de vez em quando resolve lentidão', 'Cabo é sempre mais estável que Wi-Fi']]
      ],
      i: [
        ['tbl', '2,4 GHz x 5 GHz x 6 GHz', ['Faixa', 'Alcance', 'Velocidade', 'Uso'], [['2,4 GHz', 'maior', 'menor, mais interferência', 'aparelhos longe, casa inteligente'], ['5 GHz', 'menor', 'alta', 'notebooks e celulares perto'], ['6 GHz (Wi-Fi 6E/7)', 'menor ainda', 'muito alta', 'ambientes com muitos aparelhos']]],
        ['list', 'Configurando o roteador (geralmente 192.168.0.1 ou 192.168.1.1)', ['Troque a senha de administrador do roteador', 'Segurança WPA2-AES ou WPA3', 'Desative WPS', 'Crie rede de convidados', 'Atualize o firmware']],
        ['tip', "Casa grande ou com paredes grossas? Sistemas **mesh** (vários pontos que formam uma rede só) resolvem melhor que repetidores simples."]
      ],
      a: [
        ['list', 'Rede de escritório', ['Switch gerenciável e cabeamento Cat6', 'Access points de teto com gerência central (Ubiquiti, TP-Link Omada, Aruba)', 'VLANs: separar câmeras, visitantes, financeiro e servidores', 'WPA2/3-Enterprise com login por usuário (RADIUS) em vez de senha única', 'Nobreak no rack e link de internet redundante']],
        ['t', 'Canais e interferência', "Em 2,4 GHz só os canais 1, 6 e 11 não se sobrepõem. Ferramentas de análise (WiFi Analyzer) mostram as redes vizinhas: escolha o canal menos ocupado e larguras de canal adequadas (20 MHz em 2,4; 80 MHz em 5 GHz quando há espaço)."]
      ],
      rec: ['O roteador distribui a internet por Wi-Fi e por cabo', 'Senha forte com WPA2 ou WPA3 e WPS desligado', '5 GHz é mais rápido; 2,4 GHz alcança mais longe', 'Mesh cobre casas grandes melhor que repetidor', 'Em empresas: VLANs e rede de visitantes separada'],
      quiz: [
        { lv: '*', q: 'O que é mais estável?', o: ['Wi-Fi 2,4 GHz', 'Cabo de rede', 'Bluetooth', 'Dados móveis'], a: 1, w: 'Cabo não sofre interferência.' },
        { lv: '*', t: 'tf', q: 'Manter a senha que veio de fábrica no roteador é seguro.', a: false, w: 'Troque a senha do Wi-Fi e a de administrador.' },
        { lv: 'b', q: 'Onde é melhor colocar o roteador?', o: ['Dentro do armário', 'No centro da casa e no alto', 'Atrás da geladeira', 'No chão do banheiro'], a: 1, w: 'Menos obstáculos, melhor sinal.' },
        { lv: 'b', t: 'order', q: 'Ordene o caminho da internet até seu celular:', items: ['Cabo da operadora', 'Modem/roteador', 'Wi-Fi', 'Celular'], w: 'A internet chega e é distribuída.' },
        { lv: 'i', q: 'Qual segurança de Wi-Fi usar?', o: ['WEP', 'WPA2-AES ou WPA3', 'Aberta', 'WPS'], a: 1, w: 'WEP é quebrado; WPS é vulnerável.' },
        { lv: 'i', q: 'Para cobrir uma casa grande, o mais indicado é:', o: ['Mesh', 'Mais um modem', 'Desligar o 5 GHz', 'Papel alumínio'], a: 0, w: 'Pontos coordenados com roaming.' },
        { lv: 'a', q: 'Em 2,4 GHz, os canais que não se sobrepõem são:', o: ['1, 6 e 11', '1, 2 e 3', '5, 10 e 15', 'Todos'], a: 0, w: 'Os demais se sobrepõem.' },
        { lv: 'a', t: 'fill', q: 'Separar câmeras, visitantes e financeiro na mesma infraestrutura é feito com ___', ans: ['vlan', 'vlans'], w: 'Redes locais virtuais.' }
      ]
    },
    {
      id: 'redes2', title: 'IP, DNS e diagnóstico', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🏷️', 'Todo aparelho tem um número', "Na rede de casa, cada aparelho ganha um número, o **IP** (como 192.168.0.15). O roteador dá esses números automaticamente, como um porteiro que entrega crachás."],
        ['an', '📒', 'DNS: a agenda', "Você digita `google.com` e o **DNS** descobre o número do servidor do Google. Se o DNS falha, parece que “a internet caiu”, mesmo com a conexão funcionando."]
      ],
      i: [
        ['code', 'bash', `ipconfig            # mostra seu IP, máscara e gateway (o roteador)
ipconfig /flushdns  # limpa o cache de DNS
ping 192.168.0.1    # o roteador responde?
ping 8.8.8.8        # a internet responde (sem usar DNS)?
ping google.com     # o DNS está funcionando?
tracert google.com  # por onde os pacotes passam`, "Com 3 pings você descobre se o problema é na sua rede, na internet ou no DNS."],
        ['tbl', 'Lendo o resultado', ['Resultado', 'Conclusão'], [['ping no roteador falha', 'problema no Wi-Fi/cabo local'], ['roteador ok, 8.8.8.8 falha', 'internet da operadora'], ['8.8.8.8 ok, google.com falha', 'DNS: troque para 1.1.1.1 ou 8.8.8.8'], ['IP começa com 169.254', 'não recebeu IP do DHCP']]]
      ],
      a: [
        ['t', 'Endereçamento', "**Máscara** /24 (255.255.255.0) = 254 hosts na rede. **Gateway** é a porta de saída. **DHCP** distribui IP, máscara, gateway e DNS; reserve IPs fixos para impressoras e servidores. **NAT** permite muitos IPs privados saírem por um IP público. IPv6 elimina a escassez e o NAT tradicional."],
        ['code', 'bash', `nslookup minhaempresa.com.br 1.1.1.1
Test-NetConnection servidor.local -Port 5432   # PowerShell: porta aberta?
netstat -ano | findstr :3000                    # quem está usando a porta 3000`, "Ferramentas para investigar DNS e portas."]
      ],
      rec: ['IP é o número de cada aparelho na rede', 'O roteador distribui IPs automaticamente (DHCP)', 'DNS traduz nomes em IPs', 'ping no roteador, em 8.8.8.8 e em google.com isola o problema', 'IP 169.254 indica que o aparelho não recebeu IP'],
      quiz: [
        { lv: '*', q: 'O que o DNS faz?', o: ['Dá energia', 'Traduz nomes de sites em IPs', 'Imprime', 'Bloqueia vírus'], a: 1, w: 'A agenda da internet.' },
        { lv: '*', t: 'fill', q: 'Comando do Windows que mostra o IP: ___', ans: ['ipconfig'], w: 'No Linux/Mac: ip a / ifconfig.' },
        { lv: 'b', q: 'Quem entrega os IPs na rede de casa?', o: ['O roteador', 'O monitor', 'O teclado', 'A impressora'], a: 0, w: 'Pelo DHCP.' },
        { lv: 'b', t: 'tf', q: 'Se o DNS falha, parece que a internet caiu.', a: true, w: 'Os sites não são encontrados pelo nome.' },
        { lv: 'i', q: 'ping 8.8.8.8 funciona, mas ping google.com falha. O problema é:', o: ['Cabo', 'DNS', 'Placa de vídeo', 'Roteador desligado'], a: 1, w: 'A conexão existe; a tradução de nomes não.' },
        { lv: 'i', t: 'order', q: 'Ordene os pings do mais próximo ao mais distante:', items: ['ping no roteador', 'ping 8.8.8.8', 'ping google.com'], w: 'Rede local → internet → DNS.' },
        { lv: 'a', q: 'Uma rede /24 comporta quantos hosts utilizáveis?', o: ['24', '254', '256', '1024'], a: 1, w: '256 endereços menos rede e broadcast.' },
        { lv: 'a', q: 'Para ver qual processo usa a porta 3000 no Windows:', o: ['netstat -ano | findstr :3000', 'ipconfig /all', 'ping 3000', 'tracert 3000'], a: 0, w: 'Mostra o PID do processo.' }
      ]
    },
    {
      id: 'redes3', title: 'Rede da empresa, VPN e segurança', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🏢', 'O prédio com portaria', "Numa empresa, a rede é como um prédio: tem portaria (**firewall**), crachá para entrar (**login**) e salas separadas (redes separadas). Visitante não entra na sala do financeiro."],
        ['an', '🚇', 'VPN: o túnel secreto', "Trabalhando de casa, a **VPN** cria um túnel protegido até a empresa. Quem estiver no meio do caminho não consegue ver o que passa."]
      ],
      i: [
        ['list', 'Boas práticas de rede no escritório', ['Rede de visitantes separada da rede interna', 'Impressoras e câmeras em rede própria', 'Firewall do roteador ativo; nada de abrir portas sem necessidade', 'Wi-Fi público (aeroporto, café): evite acessar sistemas sensíveis sem VPN', 'Desconfie de redes com nome parecido com a da empresa (evil twin)']],
        ['tbl', 'Formas de acesso remoto', ['Opção', 'Uso'], [['VPN (WireGuard, OpenVPN)', 'acesso à rede interna inteira'], ['Zero trust (Cloudflare Access, Tailscale)', 'acesso por aplicativo, com login e regras'], ['Área de trabalho remota (RDP, AnyDesk)', 'controlar um computador; nunca exponha RDP direto na internet']]]
      ],
      a: [
        ['list', 'Segurança de rede madura', ['Segmentação e regras de firewall “negar tudo, liberar o necessário”', 'MFA em VPN e acesso remoto', 'Monitoramento de logs (firewall, DNS) e alertas', 'DNS filtrado para bloquear domínios maliciosos', 'Inventário de dispositivos; o que não é conhecido não entra (NAC)']],
        ['t', 'Portas e exposição', "Cada serviço escuta numa porta. Expor RDP (3389), banco (5432/3306) ou painéis de administração direto na internet é convite a ataques automatizados. Use VPN/zero trust, e verifique sua exposição com ferramentas como Shodan ou scanners de porta autorizados."]
      ],
      rec: ['Firewall é a portaria da rede', 'Visitantes, câmeras e financeiro em redes separadas', 'VPN cria um túnel protegido até a empresa', 'Nunca exponha RDP ou banco de dados direto na internet', 'MFA em todo acesso remoto'],
      quiz: [
        { lv: '*', q: 'A VPN serve para:', o: ['Deixar o Wi-Fi mais forte', 'Criar um túnel protegido até a rede da empresa', 'Imprimir à distância', 'Trocar o IP do celular para sempre'], a: 1, w: 'Conexão criptografada.' },
        { lv: '*', t: 'tf', q: 'Visitantes devem usar a mesma rede dos computadores do financeiro.', a: false, w: 'Separe com rede de convidados.' },
        { lv: 'b', q: 'O firewall é como:', o: ['A portaria do prédio', 'A cozinha', 'O elevador', 'O jardim'], a: 0, w: 'Decide o que entra e sai.' },
        { lv: 'b', t: 'tf', q: 'Wi-Fi público de café é seguro para tudo, sem cuidado.', a: false, w: 'Evite sistemas sensíveis sem VPN.' },
        { lv: 'i', q: 'Uma rede chamada “Empresa_WiFi_Gratis” perto do escritório pode ser:', o: ['Um presente', 'Um evil twin para roubar dados', 'A rede oficial sempre', 'Um roteador do vizinho inofensivo'], a: 1, w: 'Confirme o nome oficial com a TI.' },
        { lv: 'i', q: 'Expor o RDP (área de trabalho remota) direto na internet é:', o: ['Recomendado', 'Muito arriscado', 'Obrigatório', 'Indiferente'], a: 1, w: 'É alvo constante de ataques de força bruta.' },
        { lv: 'a', t: 'fill', q: 'Princípio de firewall: negar tudo e ___ só o necessário', ans: ['liberar', 'permitir'], w: 'Default deny.' },
        { lv: 'a', q: 'Zero trust difere da VPN tradicional porque:', o: ['É mais lento', 'Autoriza por aplicativo e por usuário em cada acesso, não a rede inteira', 'Não usa login', 'Só funciona em Linux'], a: 1, w: 'Menor privilégio por aplicação.' }
      ]
    }
  ]
});
