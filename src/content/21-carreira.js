CC.tracks.push({
  id: 'car', ord: 21, name: 'Engenharia & Carreira', short: 'Carreira', glyph: '★', hue: 45,
  desc: 'Código limpo, testes, arquitetura, como estudar, montar portfólio e conseguir a primeira vaga.',
  test: [
    { d: 1, q: 'Um bom nome de variável é:', o: ['x', 'aux2', 'total_parcelas_vencidas', 'a1b2'], a: 2 },
    { d: 1, q: 'Testar o código serve para:', o: ['Deixar mais lento', 'Ter certeza de que funciona e continua funcionando', 'Gastar tempo', 'Nada'], a: 1 },
    { d: 2, q: 'Teste unitário testa:', o: ['O sistema inteiro com navegador', 'Uma função/unidade isolada', 'O servidor de produção', 'O banco de backup'], a: 1 },
    { d: 2, q: 'DRY significa:', o: ['Do Repeat Yourself', 'Don’t Repeat Yourself', 'Data Ready Yes', 'Deploy Right Yesterday'], a: 1 },
    { d: 3, q: 'TDD é:', o: ['Escrever o teste antes do código', 'Testar só no final', 'Não testar', 'Teste em produção'], a: 0 },
    { d: 3, q: 'Acoplamento alto significa:', o: ['Módulos independentes', 'Mudar uma parte obriga mudar muitas outras', 'Código rápido', 'Muitos testes'], a: 1 }
  ],
  lessons: [
    {
      id: 'car1', title: 'Código limpo', min: { b: 10, i: 18, a: 20 },
      b: [
        ['an', '🧹', 'Quarto arrumado', "Num quarto bagunçado você demora para achar a meia. No código bagunçado, você demora para achar o erro.\nCódigo limpo é código fácil de **ler**, porque a gente lê código muito mais do que escreve."]
      ],
      i: [
        ['code', 'py', `# antes
def c(l):
    t = 0
    for i in l:
        if i[2] == 1 and i[1] > 0:
            t += i[1] * 0.02
    return t

# depois
MULTA_ATRASO = 0.02

def calcular_multa_total(parcelas):
    vencidas = (p for p in parcelas if p.vencida and p.valor > 0)
    return sum(p.valor * MULTA_ATRASO for p in vencidas)`, "Nomes que explicam, sem números mágicos, função com uma responsabilidade."],
        ['list', 'Hábitos', ['Funções pequenas que fazem uma coisa', 'Nome bom > comentário explicando nome ruim', 'Comente o **porquê**, não o quê', 'Formatter automático (Black, Prettier) e linter (Ruff, ESLint)', 'Revisão de código: peça e faça']]
      ],
      a: [
        ['t', 'Coesão e acoplamento', "Alta coesão: o que muda junto fica junto. Baixo acoplamento: módulos conversam por interfaces pequenas. Abstrações prematuras custam caro: espere o terceiro caso repetido para generalizar (regra de três)."],
        ['t', 'Dívida técnica', "Atalhos geram juros: cada mudança futura fica mais cara. Registre a dívida, pague aos poucos (regra do escoteiro: deixe o código melhor do que encontrou) e refatore com testes cobrindo."]
      ],
      quiz: [
        { lv: '*', q: 'Por que código limpo importa?', o: ['Porque código é lido muito mais do que escrito', 'Para ficar colorido', 'Para rodar em mais idiomas', 'Não importa'], a: 0, w: 'Leitura.' },
        { lv: 'b', q: 'Código bagunçado é como:', o: ['Quarto bagunçado', 'Jardim florido', 'Carro novo', 'Bolo'], a: 0, w: 'Difícil achar as coisas.' },
        { lv: 'i', q: 'Um comentário bom explica:', o: ['O que cada linha faz', 'Por que uma decisão foi tomada', 'O nome do autor', 'A data'], a: 1, w: 'O porquê.' },
        { lv: 'a', q: 'A regra de três sugere:', o: ['Abstrair na primeira repetição', 'Generalizar quando o padrão aparecer pela terceira vez', 'Três testes por função', 'Três camadas sempre'], a: 1, w: 'Evita abstração prematura.' }
      ]
    },
    {
      id: 'car2', title: 'Testes automatizados', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '✅', 'Conferir a lição de casa', "Depois da conta, você confere: 2 + 2 deu 4? Um **teste** é um mini programa que confere se o seu programa acerta. E ele confere sozinho, toda vez!"],
        ['run', 'py', `def dobro(n):
    return n * 2

assert dobro(2) == 4
assert dobro(0) == 0
assert dobro(-3) == -6
print("Todos os testes passaram! 🎉")`, "Se alguma conta estiver errada, o `assert` reclama."]
      ],
      i: [
        ['code', 'py', `# test_cobranca.py  →  rode com: pytest
import pytest
from cobranca import calcular_juros

def test_sem_atraso_nao_cobra():
    assert calcular_juros(1000, dias=0) == 0

def test_juros_um_porcento_ao_mes_pro_rata():
    assert calcular_juros(1000, dias=30) == pytest.approx(10.0)

@pytest.mark.parametrize("dias", [-1, -30])
def test_dias_negativos_erro(dias):
    with pytest.raises(ValueError):
        calcular_juros(1000, dias=dias)`, "Um teste por comportamento, nome que descreve a regra, casos de borda."],
        ['tbl', 'Pirâmide de testes', ['Tipo', 'Testa', 'Ferramentas'], [['Unitário (muitos)', 'funções isoladas', 'pytest, Vitest, Jest'], ['Integração', 'partes juntas (API + banco)', 'pytest + banco de teste, Supertest'], ['Ponta a ponta (poucos)', 'fluxo real no navegador', 'Playwright, Cypress']]]
      ],
      a: [
        ['list', 'Testes que dão confiança', ['TDD: vermelho → verde → refatorar', 'Teste comportamento público, não detalhes internos', 'Mocks só nas bordas (rede, relógio, pagamento)', 'Testes determinísticos: fixe datas e seeds', 'Property-based testing (Hypothesis) para achar casos que você não pensou', 'Cobertura é indicador, não meta']]
      ],
      quiz: [
        { lv: '*', q: 'Um teste automatizado:', o: ['Confere sozinho se o código faz o esperado', 'Substitui o programador', 'Deixa o app lento', 'É opcional sempre'], a: 0, w: 'Rede de segurança.' },
        { lv: 'b', q: 'Se `assert dobro(2) == 5` rodar, o que acontece?', o: ['Passa', 'Dá erro, avisando que algo está errado', 'Imprime 5', 'Nada'], a: 1, w: 'AssertionError.' },
        { lv: 'i', q: 'Na pirâmide, devemos ter mais testes:', o: ['Ponta a ponta', 'Unitários', 'Manuais', 'Nenhum'], a: 1, w: 'Rápidos e baratos.' },
        { lv: 'a', q: 'Ciclo do TDD:', o: ['Verde → vermelho → deploy', 'Vermelho → verde → refatorar', 'Refatorar → testar → codar', 'Codar → deploy → testar'], a: 1, w: 'Teste falha, implementa, melhora.' }
      ],
      lab: { lang: 'py', task: 'A função `valida_cpf_formato(cpf)` deve retornar True se, tirando pontos e traço, sobrarem exatamente 11 dígitos. Implemente e os testes vão conferir.', start: 'def valida_cpf_formato(cpf):\n    pass\n', check: { tests: 'assert valida_cpf_formato("123.456.789-09") is True\nassert valida_cpf_formato("12345678909") is True\nassert valida_cpf_formato("123.456.789") is False\nassert valida_cpf_formato("abc.def.ghi-jk") is False' }, hint: 'limpo = cpf.replace(".", "").replace("-", ""); return len(limpo) == 11 and limpo.isdigit()', sol: 'def valida_cpf_formato(cpf):\n    limpo = cpf.replace(".", "").replace("-", "")\n    return len(limpo) == 11 and limpo.isdigit()' }
    },
    {
      id: 'car3', title: 'Como estudar e entrar na área', min: { b: 10, i: 15, a: 18 },
      b: [
        ['an', '🚲', 'Aprender a andar de bicicleta', "Ninguém aprende bicicleta só lendo. Você cai, levanta e tenta de novo. Programar é igual: **faça projetos**, erre, conserte. Um pouquinho todo dia vale mais que muito de vez em quando."],
        ['list', 'Seu plano', ['20–40 minutos por dia, todo dia', 'Uma trilha por vez', 'Depois de cada aula, crie algo seu (mesmo pequeno)', 'Quando travar, explique o problema em voz alta (método do patinho de borracha)']]
      ],
      i: [
        ['list', 'Portfólio que chama atenção', ['3 projetos que resolvem problemas reais (ex.: painel de cobrança, agenda, automação de relatório)', 'README com prints, o problema, a solução e como rodar', 'Deploy funcionando (link clicável)', 'Commits frequentes e bem descritos', 'LinkedIn com os projetos e o que você aprendeu']],
        ['tbl', 'Caminhos', ['Área', 'Base'], [['Front-end', 'HTML, CSS, JS, React'], ['Back-end', 'Python/Node, SQL, APIs, deploy'], ['Dados/BI', 'SQL, Python, Power BI, estatística'], ['Automação/IA', 'Python, APIs, n8n, LLMs, agentes'], ['Mobile', 'JS/React Native ou Flutter'], ['DevOps/Cloud', 'Linux, Docker, CI/CD, nuvem']]]
      ],
      a: [
        ['list', 'Subindo de nível', ['Leia código de projetos open source e contribua', 'Escreva sobre o que aprendeu (ensinar fixa)', 'Pratique design de sistemas: desenhe a arquitetura antes de codar', 'Entrevistas: algoritmos (LeetCode leve), system design, histórias STAR de projetos', 'Use IA como tutor e par de programação, mas garanta que você entende cada linha']],
        ['t', 'Experiência que você já tem', "Quem constrói ferramentas internas (painéis, automações, integrações com CRM/ERP) já faz trabalho de desenvolvedor. Documente impacto em números: “reduzi de 3h para 10min o fechamento diário da cobrança”."]
      ],
      quiz: [
        { lv: '*', q: 'O melhor jeito de aprender a programar é:', o: ['Só assistir vídeos', 'Praticar com projetos, um pouco todo dia', 'Decorar sintaxe', 'Estudar 10h uma vez por mês'], a: 1, w: 'Prática constante.' },
        { lv: 'b', q: 'Errar enquanto aprende é:', o: ['Proibido', 'Normal e parte do caminho', 'Sinal para desistir', 'Raro'], a: 1, w: 'Cair da bicicleta.' },
        { lv: 'i', q: 'Um bom projeto de portfólio tem:', o: ['Só código sem explicação', 'README, deploy funcionando e problema real', 'Nome engraçado', '1 commit gigante'], a: 1, w: 'Mostra resultado.' },
        { lv: 'a', q: 'Como descrever um projeto no currículo?', o: ['Listar tecnologias apenas', 'Mostrar impacto mensurável (tempo, dinheiro, erros evitados)', 'Dizer que é fácil', 'Não citar'], a: 1, w: 'Resultado > ferramenta.' }
      ]
    }
  ]
});
