CC.tracks.push({
  id: 'term', ord: 3, name: 'Terminal & Linux', short: 'Terminal', glyph: '>_', hue: 140,
  desc: 'Comandos, arquivos, permissões e o Linux que roda em quase todo servidor do mundo.',
  test: [
    { d: 1, q: 'O terminal é:', o: ['Um jogo', 'Uma tela onde você digita comandos para o computador', 'Um tipo de mouse', 'Um site'], a: 1 },
    { d: 1, q: 'Qual comando lista os arquivos de uma pasta no Linux?', o: ['ls', 'cd', 'rm', 'cat'], a: 0 },
    { d: 2, q: 'O que `cd ..` faz?', o: ['Apaga a pasta', 'Volta uma pasta acima', 'Cria pasta', 'Lista arquivos ocultos'], a: 1 },
    { d: 2, q: '`chmod +x script.sh` serve para:', o: ['Apagar o script', 'Tornar o script executável', 'Copiar', 'Mudar o dono'], a: 1 },
    { d: 3, q: 'O que faz `ps aux | grep node`?', o: ['Instala o node', 'Lista processos e filtra linhas com “node”', 'Mata o node', 'Atualiza o sistema'], a: 1 },
    { d: 3, q: 'Permissão `755` significa:', o: ['Todos podem tudo', 'Dono lê/escreve/executa; grupo e outros leem/executam', 'Ninguém executa', 'Só root lê'], a: 1 }
  ],
  lessons: [
    {
      id: 'term1', title: 'Primeiros comandos', min: { b: 12, i: 15, a: 18 },
      b: [
        ['an', '🗣️', 'Falar com o computador por escrito', "Em vez de clicar em pastinhas, você **escreve** o que quer. É como mandar mensagem para o computador.\nEssa tela preta se chama **terminal**."],
        ['an', '🏠', 'Pastas são cômodos de uma casa', "Você está sempre em algum cômodo. `pwd` pergunta: “onde eu estou?”. `ls` pergunta: “o que tem aqui?”. `cd quarto` quer dizer: “vai para o quarto”."],
        ['code', 'bash', `pwd           # onde estou?
ls            # o que tem aqui?
cd Documentos # entra na pasta
cd ..         # volta uma pasta`, "O que vem depois do `#` é um comentário, só para a gente ler."],
        ['tip', "No Windows, você pode usar o terminal Linux instalando o **WSL**. No Android existe o app **Termux**."]
      ],
      i: [
        ['tbl', 'Comandos do dia a dia', ['Comando', 'Faz'], [['mkdir app', 'cria pasta'], ['touch a.txt', 'cria arquivo vazio'], ['cp a b', 'copia'], ['mv a b', 'move/renomeia'], ['rm a.txt', 'apaga (sem lixeira!)'], ['cat a.txt', 'mostra conteúdo'], ['less log.txt', 'lê arquivo grande'], ['nano a.txt', 'editor simples']]],
        ['t', 'Caminhos', "**Absoluto** começa na raiz: `/home/gui/projeto`. **Relativo** parte de onde você está: `./src`, `../outro`. `~` é a sua pasta pessoal. Arquivos que começam com ponto (`.env`) são ocultos: veja com `ls -la`."],
        ['tip', "Tab completa nomes. Seta para cima repete comandos. Ctrl+C cancela o que está rodando."]
      ],
      a: [
        ['code', 'bash', `# pipes e redirecionamento
cat acesso.log | grep " 500 " | wc -l
grep -i erro app.log > so_erros.txt   # sobrescreve
echo "deploy ok" >> historico.txt      # acrescenta
comando 2>&1 | tee saida.txt           # stdout + stderr`, "Cada programa lê da entrada padrão e escreve na saída padrão: o pipe `|` liga um no outro."],
        ['code', 'bash', `find . -name "*.py" -mtime -1
du -sh * | sort -h
awk -F, '{s+=$3} END {print s}' vendas.csv
sed -i 's/http:/https:/g' config.txt
xargs -n1 -P4 curl -sO < urls.txt`, "find, sort, awk, sed e xargs resolvem 80% das tarefas de manipulação de texto em servidor."],
        ['t', 'Variáveis de ambiente', "`export API_KEY=...` cria variável para os processos filhos. `$PATH` define onde o shell procura programas. Configurações persistentes vão em `~/.bashrc` ou `~/.zshrc`."]
      ],
      quiz: [
        { lv: '*', q: 'Qual comando entra numa pasta?', o: ['ls', 'cd', 'pwd', 'rm'], a: 1, w: 'cd = change directory.' },
        { lv: 'b', q: '`ls` serve para:', o: ['Apagar', 'Listar o que tem na pasta', 'Desligar', 'Copiar'], a: 1, w: 'ls = list.' },
        { lv: 'i', q: 'Como ver arquivos ocultos?', o: ['ls -la', 'cd -h', 'rm -a', 'cat .'], a: 0, w: '-a mostra os que começam com ponto.' },
        { lv: 'a', q: 'Em `cmd >> arq`, o `>>`:', o: ['Sobrescreve', 'Acrescenta ao fim', 'Lê do arquivo', 'Apaga'], a: 1, w: '`>` sobrescreve, `>>` acrescenta.' }
      ]
    },
    {
      id: 'term2', title: 'Permissões, usuários e pacotes', min: { b: 12, i: 16, a: 18 },
      b: [
        ['an', '🔑', 'Cada arquivo tem chave', "Alguns arquivos qualquer um pode ver. Outros só o dono. E alguns só o **chefe** (no Linux o chefe se chama **root**).\n`sudo` é pedir: “deixa eu fazer isso como chefe?”"],
        ['an', '🛒', 'Loja de programas', "No celular você instala apps pela loja. No Linux, você instala pelo terminal: `sudo apt install git`."],
        ['tip', "Com `sudo` dá para quebrar o sistema. Só use quando souber o que o comando faz."]
      ],
      i: [
        ['code', 'bash', `ls -l deploy.sh
# -rwxr-xr--  1 gui equipe 512 deploy.sh
#  dono  grupo  outros
chmod 750 deploy.sh
chown gui:equipe deploy.sh`, "r=4, w=2, x=1. 7 = 4+2+1 (tudo), 5 = 4+1 (ler e executar), 0 = nada."],
        ['tbl', 'Gerenciadores de pacote', ['Sistema', 'Comando'], [['Ubuntu/Debian', 'apt install'], ['Fedora', 'dnf install'], ['macOS', 'brew install'], ['Windows', 'winget install'], ['Python', 'pip install'], ['Node', 'npm install']]]
      ],
      a: [
        ['t', 'Princípio do menor privilégio', "Aplicação nunca roda como root. Crie um usuário de serviço (`useradd --system app`), dê permissão só às pastas necessárias e use grupos. Chaves SSH com `chmod 600`."],
        ['code', 'bash', `# serviço systemd: /etc/systemd/system/api.service
[Unit]
Description=API Sra Luck
After=network.target

[Service]
User=app
WorkingDirectory=/srv/api
ExecStart=/srv/api/.venv/bin/uvicorn main:app --port 8000
Restart=always
EnvironmentFile=/srv/api/.env

[Install]
WantedBy=multi-user.target`, "`systemctl enable --now api` sobe no boot e reinicia se cair. Logs: `journalctl -u api -f`."]
      ],
      quiz: [
        { lv: '*', q: '`sudo` serve para:', o: ['Desligar', 'Executar como administrador (root)', 'Listar pastas', 'Criar usuário'], a: 1, w: 'super user do.' },
        { lv: 'b', q: 'Quem é o “chefe” no Linux?', o: ['admin', 'root', 'boss', 'master'], a: 1, w: 'root.' },
        { lv: 'i', q: 'chmod 644 dá ao dono:', o: ['ler e escrever', 'só ler', 'tudo', 'nada'], a: 0, w: '6 = 4+2 = ler+escrever.' },
        { lv: 'a', q: 'Para ver logs ao vivo de um serviço systemd:', o: ['cat /var/api', 'journalctl -u api -f', 'ls -l api', 'top api'], a: 1, w: 'journalctl lê o journal do systemd.' }
      ]
    },
    {
      id: 'term3', title: 'Servidor remoto com SSH', min: { b: 10, i: 15, a: 18 },
      b: [
        ['an', '🎮', 'Controle remoto de computador', "SSH é um controle remoto seguro: você digita no seu computador e o comando roda num computador que está longe, num data center."],
        ['code', 'bash', `ssh gui@meuservidor.com`, "Depois disso, tudo que você digitar acontece lá no servidor."]
      ],
      i: [
        ['code', 'bash', `ssh-keygen -t ed25519 -C "gui@notebook"
ssh-copy-id gui@203.0.113.10
scp backup.sql gui@203.0.113.10:/srv/backups/
rsync -avz ./site/ gui@203.0.113.10:/var/www/site/`, "Chave em vez de senha: mais seguro e sem digitar senha. `scp`/`rsync` copiam arquivos."],
        ['tip', "Chave **privada** nunca sai do seu computador. Só a **pública** (`.pub`) vai para o servidor."]
      ],
      a: [
        ['code', 'bash', `# ~/.ssh/config
Host prod
  HostName 203.0.113.10
  User deploy
  IdentityFile ~/.ssh/prod_ed25519

ssh prod
ssh -L 5433:localhost:5432 prod   # túnel: banco remoto na sua porta 5433`, "Túnel SSH expõe o banco só para você, sem abrir a porta 5432 para a internet."],
        ['list', 'Endurecer o servidor', ['Desativar login por senha e root via SSH', 'Firewall: `ufw allow 22,80,443/tcp`', 'fail2ban contra força bruta', 'Atualizações automáticas de segurança']]
      ],
      quiz: [
        { lv: '*', q: 'SSH serve para:', o: ['Acessar outro computador com segurança pelo terminal', 'Criar sites', 'Fazer backup na nuvem', 'Formatar disco'], a: 0, w: 'Secure Shell.' },
        { lv: 'b', q: 'Com SSH, onde os comandos rodam?', o: ['No meu computador', 'No computador remoto', 'Em lugar nenhum', 'No navegador'], a: 1, w: 'Rodam no servidor.' },
        { lv: 'i', q: 'Qual arquivo vai para o servidor?', o: ['id_ed25519', 'id_ed25519.pub', 'os dois', 'nenhum'], a: 1, w: 'Só a pública.' },
        { lv: 'a', q: 'Melhor forma de acessar o Postgres de produção do seu PC:', o: ['Abrir a 5432 para 0.0.0.0', 'Túnel SSH', 'Desativar senha', 'FTP'], a: 1, w: 'O banco continua fechado para a internet.' }
      ]
    }
  ]
});
