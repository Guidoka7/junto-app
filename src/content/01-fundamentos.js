CC.tracks.push({
  id: 'fund', ord: 1, name: 'Fundamentos & Lógica', short: 'Lógica', glyph: '{ }', hue: 38,
  desc: 'O jeito de pensar de quem programa: algoritmos, variáveis, decisões e repetições.',
  test: [
    { d: 1, q: 'O que é um algoritmo?', o: ['Um tipo de computador', 'Uma sequência de passos para resolver um problema', 'Uma linguagem de programação', 'Um vírus'], a: 1 },
    { d: 1, q: 'Para que serve uma variável?', o: ['Guardar um valor com um nome', 'Desligar o computador', 'Desenhar na tela', 'Conectar na internet'], a: 0 },
    { d: 2, q: 'Quantas vezes o laço roda? `para i de 0 até 4 (sem incluir o 4)`', o: ['3', '4', '5', 'infinitas'], a: 1 },
    { d: 2, q: '`(verdadeiro E falso) OU verdadeiro` resulta em:', o: ['verdadeiro', 'falso', 'erro', 'depende'], a: 0 },
    { d: 3, q: 'Qual a diferença entre passar um valor por cópia e por referência?', o: ['Nenhuma', 'Por referência, a função mexe no mesmo objeto original', 'Por cópia é mais lento sempre', 'Por referência só funciona com números'], a: 1 },
    { d: 3, q: 'Recursão sem caso base leva a:', o: ['Resultado mais rápido', 'Estouro de pilha (stack overflow)', 'Erro de sintaxe', 'Loop que termina sozinho'], a: 1 }
  ],
  lessons: [
    {
      id: 'fund1', title: 'O que é programar', min: { b: 12, i: 15, a: 18 },
      b: [
        ['an', '🤖', 'O computador é um robô muito obediente', "Imagine um robô que faz **exatamente** o que você manda. Nem mais, nem menos.\nSe você disser “pega o copo”, mas esquecer de dizer “abre a mão”, ele fica ali parado segurando o ar."],
        ['t', 'Programar é dar ordens bem explicadinhas', "Programar é escrever uma lista de ordens para o computador, numa língua que ele entende.\nEssa língua se chama **linguagem de programação**. Python, JavaScript e SQL são algumas delas."],
        ['flow', 'Receita de sanduíche (um programa!)', ['Pegar 2 pães', 'Passar manteiga', 'Colocar queijo', 'Fechar o sanduíche', 'Servir 🥪']],
        ['run', 'py', `print("Olá! Eu sou seu primeiro programa!")
print("2 + 2 é", 2 + 2)`, "Aperta **Rodar**. O `print` é o jeito do computador **falar** com você."],
        ['tip', "Errar faz parte. Todo programador vê mensagens de erro o dia inteiro. O erro só está te dizendo: “ei, explica melhor”."]
      ],
      i: [
        ['t', 'Código-fonte, compilador e interpretador', "Você escreve **código-fonte** (texto). Ele precisa virar instruções de máquina.\n**Compiladas** (C, Go, Rust): um compilador traduz tudo antes de rodar.\n**Interpretadas** (Python, JS): um interpretador lê e executa enquanto roda (com otimizações por baixo, como JIT no JS)."],
        ['list', 'As 4 peças de quase todo programa', ['**Entrada**: dados que chegam (teclado, arquivo, API)', '**Processamento**: cálculos e decisões', '**Saída**: resultado (tela, arquivo, resposta HTTP)', '**Estado**: o que o programa lembra entre um passo e outro']],
        ['run', 'py', `preco = 25.90
quantidade = 3
total = preco * quantidade
print(f"Total: R$ {total:.2f}")`, "Entrada (preço e quantidade) → processamento (multiplicar) → saída (mostrar formatado)."]
      ],
      a: [
        ['t', 'Paradigmas', "**Imperativo**: passo a passo mudando estado. **Orientado a objetos**: dados + comportamento juntos. **Funcional**: funções puras, imutabilidade, composição. **Declarativo**: você diz *o quê*, não *como* (SQL, HTML).\nLinguagens modernas são multiparadigma; escolher o estilo certo por problema é o que separa código bom de código que só funciona."],
        ['t', 'Determinismo e efeitos colaterais', "Uma função pura sempre devolve o mesmo resultado para a mesma entrada e não mexe no mundo externo. Isso facilita testar, cachear e paralelizar.\nI/O (rede, disco, relógio, aleatório) é efeito colateral: isole nas bordas do sistema."],
        ['run', 'py', `# pura
def soma(a, b):
    return a + b

# impura: depende de estado externo
contador = 0
def incrementa():
    global contador
    contador += 1
    return contador

print(soma(2, 3), soma(2, 3))
print(incrementa(), incrementa())`, "Repara: `soma` repete o resultado; `incrementa` não."]
      ],
      quiz: [
        { lv: '*', q: 'Programar é, essencialmente:', o: ['Decorar comandos', 'Escrever instruções precisas para o computador executar', 'Montar peças de hardware', 'Usar o Excel'], a: 1, w: 'O computador só executa o que está escrito, na ordem escrita.' },
        { lv: 'b', q: 'O que o `print` faz em Python?', o: ['Imprime no papel', 'Mostra uma mensagem na tela', 'Apaga o programa', 'Salva um arquivo'], a: 1, w: 'print = mostrar na tela.' },
        { lv: 'i', q: 'Python é tipicamente:', o: ['Compilado para binário antes de rodar', 'Interpretado', 'Uma linguagem de marcação', 'Um banco de dados'], a: 1, w: 'O CPython compila para bytecode e interpreta esse bytecode.' },
        { lv: 'a', q: 'SQL é um exemplo de paradigma:', o: ['Imperativo', 'Declarativo', 'Orientado a eventos', 'Assembly'], a: 1, w: 'Você declara o resultado desejado e o banco decide como buscar.' }
      ],
      lab: { lang: 'py', task: 'Faça o programa mostrar exatamente: `Eu vou aprender a programar!`', start: '# escreva abaixo\n', check: { out: 'Eu vou aprender a programar!' }, hint: 'Use print("...") com o texto entre aspas.', sol: 'print("Eu vou aprender a programar!")' }
    },
    {
      id: 'fund2', title: 'Variáveis e tipos de dados', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '📦', 'Variável é uma caixinha com etiqueta', "Imagine uma caixa escrito **idade**. Dentro você coloca o número 7.\nQuando quiser saber a idade, é só olhar dentro da caixa chamada idade."],
        ['run', 'py', `idade = 7
nome = "Lia"
print(nome)
print(idade)`, "O sinal `=` aqui não é “igual” da matemática. Ele quer dizer **guarde isso na caixa**."],
        ['list', 'Cada caixinha guarda um tipo de coisa', ['**Número inteiro**: 7, 100, -3', '**Número com vírgula**: 3.5 (em programação usamos ponto!)', '**Texto**: "banana" (sempre entre aspas)', '**Verdadeiro ou falso**: True / False']],
        ['run', 'py', `doces = 3
doces = doces + 2
print("Agora eu tenho", doces, "doces")`, "Dá para trocar o que está na caixa. Ela tinha 3, ganhou mais 2."]
      ],
      i: [
        ['t', 'Tipos primitivos e conversões', "Python: `int`, `float`, `str`, `bool`, `None`. JavaScript: `number`, `string`, `boolean`, `null`, `undefined`, `bigint`.\nDados vindos de formulário/arquivo chegam como **texto**: converta antes de calcular."],
        ['run', 'py', `entrada = "42"
print(entrada + "1")        # junta texto
print(int(entrada) + 1)     # soma número
print(type(3.0), type("a"), type(True))
print(0.1 + 0.2)            # cuidado com float!`, "`0.1 + 0.2` não dá 0.3 exato: float é binário. Para dinheiro use centavos inteiros ou `Decimal`."],
        ['tip', "Nomes bons: `total_pedidos`, `data_vencimento`. Nomes ruins: `x`, `aux2`, `coisa`."]
      ],
      a: [
        ['t', 'Nome, objeto e referência', "Em Python, variável é um **nome que aponta para um objeto**. `a = b` não copia: os dois nomes apontam para o mesmo objeto. Tipos imutáveis (int, str, tuple) mascaram isso; mutáveis (list, dict) revelam."],
        ['run', 'py', `a = [1, 2]
b = a
b.append(3)
print(a)          # [1, 2, 3] !
c = list(a)       # cópia rasa
c.append(4)
print(a, c)
print(a is b, a is c)`, "`is` compara identidade; `==` compara valor."],
        ['t', 'Tipagem forte, fraca, estática, dinâmica', "Python: **dinâmica e forte** (`'1' + 1` dá erro). JS: **dinâmica e fraca** (`'1' + 1` vira `'11'`). TypeScript/Java/Go: **estática** (checada antes de rodar). Type hints em Python + mypy dão parte desse benefício."]
      ],
      quiz: [
        { lv: '*', q: 'Depois de `x = 5` e `x = x + 1`, quanto vale x?', o: ['5', '6', '51', 'erro'], a: 1, w: 'Pega o valor atual (5), soma 1 e guarda de novo em x.' },
        { lv: 'b', q: 'Qual destes é um texto?', o: ['42', 'True', '"42"', '4.2'], a: 2, w: 'Texto sempre vem entre aspas.' },
        { lv: 'i', q: 'Melhor forma de guardar dinheiro sem erro de arredondamento:', o: ['float', 'Centavos inteiros ou Decimal', 'string sempre', 'bool'], a: 1, w: 'float tem erro binário; centavos em int são exatos.' },
        { lv: 'a', q: 'Após `a=[1]; b=a; b+=[2]`, `a` vale:', o: ['[1]', '[1, 2]', '[2]', 'erro'], a: 1, w: '`+=` em lista modifica o mesmo objeto (in-place).' }
      ],
      lab: { lang: 'py', task: 'Crie a variável `nome` com seu nome e `idade` com sua idade. Depois crie `ano_que_vem` com a idade + 1.', start: 'nome = \nidade = \n', check: { tests: 'assert isinstance(nome, str) and len(nome) > 0, "nome precisa ser um texto"\nassert isinstance(idade, int), "idade precisa ser número inteiro"\nassert ano_que_vem == idade + 1, "ano_que_vem deve ser idade + 1"' }, hint: 'ano_que_vem = idade + 1', sol: 'nome = "Gui"\nidade = 30\nano_que_vem = idade + 1' }
    },
    {
      id: 'fund3', title: 'Decisões: se, senão', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '☔', 'Se chover, leva guarda-chuva', "Todo dia você decide coisas: **se** estiver chovendo, leva guarda-chuva. **Senão**, leva boné.\nO computador também pode decidir, usando `if` (se) e `else` (senão)."],
        ['run', 'py', `chovendo = True
if chovendo:
    print("Leva o guarda-chuva ☔")
else:
    print("Leva o boné 🧢")`, "Troca `True` por `False` e roda de novo!"],
        ['list', 'Perguntas que o computador sabe fazer', ['`>` maior que', '`<` menor que', '`==` é igual? (dois iguais!)', '`!=` é diferente?']],
        ['run', 'py', `idade = 6
if idade >= 18:
    print("Pode dirigir")
else:
    print("Ainda não pode dirigir")`, "Os espaços no começo da linha (a **indentação**) mostram o que está “dentro” do if."]
      ],
      i: [
        ['run', 'py', `nota = 7.5
if nota >= 9:
    conceito = "A"
elif nota >= 7:
    conceito = "B"
elif nota >= 5:
    conceito = "C"
else:
    conceito = "D"
print(conceito)`, "`elif` testa em ordem e para no primeiro verdadeiro."],
        ['tbl', 'Lógica booleana', ['A', 'B', 'A and B', 'A or B'], [['V', 'V', 'V', 'V'], ['V', 'F', 'F', 'V'], ['F', 'V', 'F', 'V'], ['F', 'F', 'F', 'F']]],
        ['tip', "Valores “falsy” em Python: `0`, `''`, `[]`, `{}`, `None`, `False`. Em JS também `NaN` e `undefined`."]
      ],
      a: [
        ['t', 'Curto-circuito e guard clauses', "`and`/`or` param assim que sabem o resultado: `user and user.ativo` não quebra se `user` for None.\nPrefira **retornos antecipados** a ifs aninhados: o caminho feliz fica no fim, sem pirâmide de indentação."],
        ['run', 'py', `def pode_liberar(pedido):
    if not pedido:
        return "sem pedido"
    if pedido["valor"] <= 0:
        return "valor inválido"
    if pedido["status"] != "aprovado":
        return "aguardando aprovação"
    return "liberado"

print(pode_liberar({"valor": 500, "status": "aprovado"}))
print(pode_liberar({"valor": 500, "status": "pendente"}))`],
        ['code', 'py', `status = "pago"
match status:
    case "pago" | "liquidado":
        print("ok")
    case "vencido":
        print("cobrar")
    case _:
        print("desconhecido")`, "`match` (Python 3.10+) faz pattern matching estrutural. Rode no Python do seu computador: o interpretador do app cobre o Python essencial, sem `match`."]
      ],
      quiz: [
        { lv: '*', q: 'Para comparar se dois valores são iguais em Python usamos:', o: ['=', '==', '===', ':='], a: 1, w: '`=` guarda valor; `==` compara.' },
        { lv: 'b', q: 'O `else` roda quando:', o: ['Sempre', 'Quando o if for falso', 'Quando o if for verdadeiro', 'Nunca'], a: 1, w: 'else = senão.' },
        { lv: 'i', q: '`not (True and False)` resulta em:', o: ['True', 'False', 'None', 'erro'], a: 0, w: 'True and False = False; not False = True.' },
        { lv: 'a', q: 'Em `x = a or "padrão"`, se `a = ""`, x vale:', o: ['""', '"padrão"', 'False', 'None'], a: 1, w: 'String vazia é falsy, então `or` devolve o segundo operando.' }
      ],
      lab: { lang: 'py', task: 'Complete a função `classifica(idade)` que retorna `"criança"` (menor que 12), `"adolescente"` (12 a 17) ou `"adulto"` (18+).', start: 'def classifica(idade):\n    # seu código\n    pass\n', check: { tests: 'assert classifica(5) == "criança"\nassert classifica(12) == "adolescente"\nassert classifica(17) == "adolescente"\nassert classifica(18) == "adulto"' }, hint: 'Use if idade < 12 / elif idade < 18 / else, com return.', sol: 'def classifica(idade):\n    if idade < 12:\n        return "criança"\n    elif idade < 18:\n        return "adolescente"\n    else:\n        return "adulto"' }
    },
    {
      id: 'fund4', title: 'Repetições e funções', min: { b: 18, i: 20, a: 22 },
      b: [
        ['an', '🔁', 'Repetir sem cansar', "Se a professora pedir para escrever “eu sou legal” 100 vezes, você cansa. O computador não!\nO **loop** (laço) repete coisas para a gente."],
        ['run', 'py', `for i in range(5):
    print("Pulo número", i + 1, "🐸")`, "`range(5)` conta 0, 1, 2, 3, 4. Por isso somamos 1 para ficar bonito."],
        ['an', '🧃', 'Função é uma máquina de suco', "Você coloca laranja (entrada), a máquina trabalha e sai suco (saída).\nVocê cria a máquina uma vez e usa quantas vezes quiser."],
        ['run', 'py', `def dobro(numero):
    return numero * 2

print(dobro(3))
print(dobro(10))`, "`def` cria a máquina. `return` é o suco saindo."]
      ],
      i: [
        ['run', 'py', `saldo = 1000
mes = 0
while saldo < 2000:
    saldo *= 1.10
    mes += 1
print(f"Dobrou em {mes} meses: R$ {saldo:.2f}")`, "`while` repete enquanto a condição for verdadeira. Cuidado: se nunca ficar falsa, é loop infinito."],
        ['run', 'py', `def parcela(valor, n=12, juros=0.0):
    total = valor * (1 + juros)
    return round(total / n, 2)

print(parcela(1200))
print(parcela(1200, n=6, juros=0.05))`, "Parâmetros com valor padrão e argumentos nomeados deixam a chamada legível."],
        ['tip', "Regra prática: se você copiou e colou o mesmo código 3 vezes, ele quer virar função."]
      ],
      a: [
        ['run', 'py', `def fatorial(n):
    if n <= 1:          # caso base
        return 1
    return n * fatorial(n - 1)

print(fatorial(5))`, "Recursão: a função chama ela mesma até o caso base. Cada chamada ocupa um frame na pilha."],
        ['run', 'py', `def multiplicador(fator):
    def mult(x):
        return x * fator     # "lembra" do fator
    return mult

dobro = multiplicador(2)
triplo = multiplicador(3)
print(dobro(5), triplo(5))`, "**Closure**: a função interna lembra o escopo onde nasceu. Base de decorators, callbacks e muito do JS. Para *alterar* a variável de fora, Python usa `nonlocal`."],
        ['t', 'Funções de primeira classe', "Funções são valores: dá para guardar em variável, passar como argumento (`sorted(lista, key=fn)`) e retornar. Isso habilita `map`, `filter`, decorators e injeção de dependência simples."]
      ],
      quiz: [
        { lv: '*', q: '`for i in range(3)` executa o bloco quantas vezes?', o: ['2', '3', '4', 'infinitas'], a: 1, w: '0, 1, 2 → 3 vezes.' },
        { lv: 'b', q: 'O `return` dentro de uma função serve para:', o: ['Repetir', 'Devolver o resultado', 'Apagar a função', 'Imprimir'], a: 1, w: 'É a saída da máquina.' },
        { lv: 'i', q: 'Um `while` vira loop infinito quando:', o: ['A condição nunca fica falsa', 'Tem print dentro', 'Usa números', 'Tem break'], a: 0, w: 'Garanta que algo dentro do laço mude a condição.' },
        { lv: 'a', q: 'Uma closure é:', o: ['Um loop fechado', 'Uma função que captura variáveis do escopo onde foi criada', 'Um erro de memória', 'Uma classe abstrata'], a: 1, w: 'Ela “fecha” sobre o escopo externo.' }
      ],
      lab: { lang: 'py', task: 'Crie `soma_ate(n)` que retorna a soma de 1 até n (ex.: soma_ate(4) = 1+2+3+4 = 10). Use um loop.', start: 'def soma_ate(n):\n    total = 0\n    # seu loop aqui\n    return total\n', check: { tests: 'assert soma_ate(4) == 10\nassert soma_ate(1) == 1\nassert soma_ate(100) == 5050' }, hint: 'for i in range(1, n + 1): total += i', sol: 'def soma_ate(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total' }
    }
  ]
});
