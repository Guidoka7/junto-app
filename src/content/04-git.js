CC.tracks.push({
  id: 'git', ord: 4, name: 'Git & GitHub', short: 'Git', glyph: '⑂', hue: 15,
  desc: 'Salvar versões do código, voltar no tempo, trabalhar em equipe e publicar no GitHub.',
  test: [
    { d: 1, q: 'Para que serve o Git?', o: ['Hospedar sites', 'Guardar o histórico de versões do código', 'Escrever código', 'Testar internet'], a: 1 },
    { d: 1, q: 'GitHub é:', o: ['O mesmo que Git', 'Um site que guarda repositórios Git na nuvem', 'Uma linguagem', 'Um editor'], a: 1 },
    { d: 2, q: 'Qual a ordem certa?', o: ['commit → add → push', 'add → commit → push', 'push → add → commit', 'add → push → commit'], a: 1 },
    { d: 2, q: 'Uma branch serve para:', o: ['Apagar commits', 'Desenvolver algo em paralelo sem mexer na principal', 'Baixar o repositório', 'Criar senha'], a: 1 },
    { d: 3, q: 'Diferença entre merge e rebase:', o: ['Nenhuma', 'Rebase reescreve os commits sobre outra base; merge cria commit de junção', 'Merge apaga a branch', 'Rebase só funciona no GitHub'], a: 1 },
    { d: 3, q: 'Você commitou uma senha e já fez push. O certo é:', o: ['Apagar o arquivo e commitar', 'Revogar/trocar a senha imediatamente (e depois limpar o histórico)', 'Tornar o repo privado e pronto', 'Ignorar'], a: 1 }
  ],
  lessons: [
    {
      id: 'git1', title: 'Fotos do seu código', min: { b: 12, i: 16, a: 18 },
      b: [
        ['an', '📸', 'Git tira fotos do seu trabalho', "Imagina fazer um desenho e tirar uma foto a cada passo. Se estragar, você volta para a foto anterior!\nCada foto no Git se chama **commit**."],
        ['flow', 'O caminho de uma foto', ['Você muda arquivos', '`git add`: escolhe o que vai na foto', '`git commit`: tira a foto com um recado', '`git push`: manda a foto para o GitHub']],
        ['an', '☁️', 'GitHub é o álbum na nuvem', "Se o computador quebrar, as fotos estão salvas no GitHub. E seus amigos podem ver e ajudar."]
      ],
      i: [
        ['code', 'bash', `git init
git status
git add index.html estilo.css
git commit -m "feat: página inicial"
git log --oneline
git remote add origin https://github.com/gui/meu-app.git
git push -u origin main`, "Mensagens no padrão **Conventional Commits** (`feat:`, `fix:`, `docs:`) deixam o histórico legível."],
        ['code', 'bash', `# .gitignore
node_modules/
.env
dist/
*.log`, "Nunca versionar dependências baixadas nem segredos."],
        ['tbl', 'Desfazer coisas', ['Situação', 'Comando'], [['Descartar mudança num arquivo', 'git restore arq'], ['Tirar do stage', 'git restore --staged arq'], ['Corrigir último commit (local)', 'git commit --amend'], ['Desfazer commit já publicado', 'git revert <hash>']]]
      ],
      a: [
        ['t', 'O modelo interno', "Git guarda **objetos** endereçados por hash: blob (conteúdo), tree (pasta), commit (tree + pais + autor). Branch é só um ponteiro para um commit; `HEAD` aponta para a branch atual. Por isso criar branch é instantâneo."],
        ['code', 'bash', `git reflog                 # histórico de onde o HEAD esteve: salva-vidas
git bisect start; git bisect bad; git bisect good v1.2
git stash push -m "wip"; git stash pop
git cherry-pick a1b2c3d`, "`bisect` faz busca binária no histórico para achar o commit que introduziu um bug."]
      ],
      quiz: [
        { lv: '*', q: 'Um commit é:', o: ['Um arquivo novo', 'Um ponto salvo no histórico', 'Um servidor', 'Um erro'], a: 1, w: 'É a “foto”.' },
        { lv: 'b', q: 'Qual comando manda as fotos para o GitHub?', o: ['git add', 'git push', 'git init', 'git log'], a: 1, w: 'push = empurrar para o remoto.' },
        { lv: 'i', q: 'Onde colocar `.env` para não ir ao repositório?', o: ['README', '.gitignore', 'package.json', 'commit'], a: 1, w: '.gitignore lista o que o Git ignora.' },
        { lv: 'a', q: 'Uma branch no Git é:', o: ['Cópia completa da pasta', 'Um ponteiro para um commit', 'Um servidor', 'Um arquivo zip'], a: 1, w: 'Por isso é barata.' }
      ]
    },
    {
      id: 'git2', title: 'Branches e trabalho em equipe', min: { b: 12, i: 16, a: 20 },
      b: [
        ['an', '🌳', 'Galhos de uma árvore', "O tronco é a versão principal (**main**). Para testar uma ideia, você cria um **galho** (branch). Se a ideia ficar boa, junta no tronco. Se não, corta o galho e ninguém se machuca."],
        ['an', '🙋', 'Pedir para juntar', "No GitHub, você abre um **Pull Request**: “Ei, olhem minha mudança, posso juntar no tronco?”. Os colegas revisam e aprovam."]
      ],
      i: [
        ['code', 'bash', `git switch -c feat/carteira-cobranca
# ... trabalha e commita ...
git push -u origin feat/carteira-cobranca
# abre Pull Request no GitHub, revisão, merge
git switch main && git pull`],
        ['t', 'Conflitos', "Quando duas pessoas mudam a mesma linha, o Git pede para você escolher. O arquivo fica com marcadores `<<<<<<<`, `=======`, `>>>>>>>`. Edite para o resultado final, remova os marcadores, `git add` e `git commit`."],
        ['tip', "Branches pequenas e PRs curtos geram menos conflito e revisão melhor."]
      ],
      a: [
        ['t', 'Estratégias', "**Trunk-based**: branches de vida curta, merge diário, feature flags para código incompleto (preferida com CI/CD). **GitFlow**: develop/release/hotfix, útil para software com versões pesadas. Proteja `main`: PR obrigatório + checks verdes."],
        ['code', 'bash', `git fetch origin
git rebase origin/main          # reaplica seus commits sobre o main atual
git rebase -i HEAD~4            # squash/reword antes do PR
git push --force-with-lease     # nunca --force puro em branch compartilhada`]
      ],
      quiz: [
        { lv: '*', q: 'Pull Request é:', o: ['Baixar código', 'Pedido para juntar mudanças numa branch', 'Apagar repo', 'Um tipo de commit'], a: 1, w: 'Proposta de merge com revisão.' },
        { lv: 'b', q: 'A branch principal costuma se chamar:', o: ['tronco', 'main', 'root', 'master-key'], a: 1, w: 'main (antigamente master).' },
        { lv: 'i', q: 'Marcadores `<<<<<<<` aparecem quando há:', o: ['Sucesso', 'Conflito de merge', 'Commit vazio', 'Push'], a: 1, w: 'Você resolve manualmente.' },
        { lv: 'a', q: 'Por que `--force-with-lease` em vez de `--force`?', o: ['É mais rápido', 'Recusa sobrescrever se alguém publicou algo novo', 'Apaga o remoto', 'Assina o commit'], a: 1, w: 'Protege o trabalho dos outros.' }
      ]
    },
    {
      id: 'git3', title: 'GitHub além do código', min: { b: 10, i: 15, a: 18 },
      b: [
        ['an', '🏆', 'Seu portfólio', "O GitHub é uma vitrine. Quem quer te contratar olha seus projetos lá. Um bom **README** explica o que o projeto faz, com prints."]
      ],
      i: [
        ['list', 'Recursos úteis', ['**Issues**: lista de tarefas e bugs', '**Actions**: robôs que rodam testes e builds sozinhos', '**Pages**: hospeda site estático grátis', '**Releases**: publica versões (ex.: seu .apk!)', '**Secrets**: guarda chaves para as Actions']],
        ['code', 'yaml', `# .github/workflows/testes.yml
name: testes
on: [push, pull_request]
jobs:
  testar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: pytest`, "A cada push, o GitHub sobe uma máquina, instala e testa. É assim que este app gera o APK."]
      ],
      a: [
        ['list', 'Fluxo profissional', ['CODEOWNERS para revisão obrigatória por área', 'Dependabot para atualizar dependências', 'Checks obrigatórios (lint, testes, build) antes do merge', 'Tags semânticas v1.4.2 + changelog automático', 'Assinatura de commits (SSH/GPG)']],
        ['t', 'Segredos vazados', "GitHub faz secret scanning, mas o histórico é eterno para quem já clonou. Ao vazar uma chave: **revogue primeiro**, depois limpe com `git filter-repo` e force-push coordenado."]
      ],
      quiz: [
        { lv: '*', q: 'GitHub Actions serve para:', o: ['Conversar', 'Automatizar tarefas (testes, build, deploy)', 'Editar fotos', 'Criar domínio'], a: 1, w: 'CI/CD dentro do GitHub.' },
        { lv: 'b', q: 'O README serve para:', o: ['Guardar senhas', 'Explicar o projeto', 'Rodar o código', 'Apagar arquivos'], a: 1, w: 'É a capa do projeto.' },
        { lv: 'i', q: 'Onde guardar uma API key usada no workflow?', o: ['No código', 'Em Secrets do repositório', 'No README', 'No nome da branch'], a: 1, w: 'Acesse via `${{ secrets.NOME }}`.' },
        { lv: 'a', q: 'Primeira ação ao vazar uma chave:', o: ['git revert', 'Revogar a chave', 'Apagar o repo', 'Mudar o nome do arquivo'], a: 1, w: 'A chave já pode ter sido copiada.' }
      ]
    }
  ]
});
