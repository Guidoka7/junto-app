CC.tracks.push({
  id: 'py', ord: 5, name: 'Python', short: 'Python', glyph: 'py', hue: 210,
  desc: 'A linguagem mais usada para automação, dados, IA e backend. Do primeiro print a classes e bibliotecas.',
  test: [
    { d: 1, q: 'O que `print("oi")` faz?', o: ['Mostra oi na tela', 'Cria variável oi', 'Imprime no papel', 'Dá erro'], a: 0 },
    { d: 1, q: 'Como criar uma lista em Python?', o: ['{1, 2}', '[1, 2]', '(1; 2)', '<1, 2>'], a: 1 },
    { d: 2, q: 'O que `{"a": 1}["a"]` retorna?', o: ['"a"', '1', 'erro', 'None'], a: 1 },
    { d: 2, q: 'Resultado de `[x*2 for x in range(3)]`:', o: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', 'erro'], a: 0 },
    { d: 3, q: 'O que um decorator faz?', o: ['Formata o código', 'Envolve uma função adicionando comportamento', 'Cria uma classe', 'Importa módulos'], a: 1 },
    { d: 3, q: 'Problema de `def f(x, lista=[])`:', o: ['Nenhum', 'A lista padrão é criada uma vez e compartilhada entre chamadas', 'Sintaxe inválida', 'Lista não pode ser parâmetro'], a: 1 }
  ],
  lessons: [
    {
      id: 'py1', title: 'Textos e números', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '🐍', 'Python é uma linguagem simpática', "Python foi feita para parecer quase inglês. Por isso é ótima para começar, e também é usada por cientistas, robôs e inteligência artificial."],
        ['run', 'py', `print(10 + 5)
print(10 - 5)
print(10 * 5)
print(10 / 5)`, "Python é uma calculadora gigante. `*` é vezes e `/` é dividir."],
        ['run', 'py', `nome = "Ana"
print("Oi, " + nome + "!")
print(nome * 3)
print(len(nome))`, "Dá para juntar textos com `+`, repetir com `*` e contar letras com `len`."],
        ['run', 'py', `bichinho = "gato"
print(f"Eu tenho um {bichinho} fofinho")`, "O `f` antes das aspas deixa você colocar variáveis dentro do texto usando `{ }`."]
      ],
      i: [
        ['run', 'py', `print(7 // 2, 7 % 2, 2 ** 10)
valor = 1234.5
print(f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))`, "`//` divisão inteira, `%` resto, `**` potência. Formatando no padrão brasileiro."],
        ['run', 'py', `cpf = "  123.456.789-09 "
limpo = cpf.strip().replace(".", "").replace("-", "")
print(limpo, limpo.isdigit(), len(limpo))
print("maria silva".title(), "ABC".lower())
print("ana;bia;caio".split(";"))
print("-".join(["2026", "10", "10"]))
print(limpo[:3], limpo[-2:])`, "Strings são imutáveis: cada método devolve uma string nova. Fatiamento `[início:fim]`."],
        ['tip', "Leia entrada do usuário com `input()` — no app, prefira variáveis, porque não há teclado de console."]
      ],
      a: [
        ['code', 'py', `from decimal import Decimal, ROUND_HALF_UP
total = Decimal("0.10") + Decimal("0.20")
print(total)
juros = (Decimal("1999.90") * Decimal("0.0333")).quantize(Decimal("0.01"), ROUND_HALF_UP)
print(juros)`, "Decimal com string evita erro binário; `quantize` define arredondamento explícito. Rode no Python do seu computador (o módulo decimal não existe no Python do app)."],
        ['t', 'Strings por dentro', "`str` é Unicode; `bytes` é dado bruto. `'é'.encode('utf-8')` → 2 bytes. Concatenar em loop com `+=` é O(n²) no pior caso: monte uma lista e use `''.join()`."],
        ['code', 'py', `import re
texto = "Pedido 4521 em 03/10/2026, pedido 4522 em 05/10/2026"
print(re.findall(r"\\d{2}/\\d{2}/\\d{4}", texto))
print(re.sub(r"pedido (\\d+)", r"#\\1", texto, flags=re.I))`, "Expressões regulares: poderosas para extrair padrões (datas, CPFs, valores)."]
      ],
      quiz: [
        { lv: '*', q: '`len("python")` retorna:', o: ['5', '6', '7', 'erro'], a: 1, w: '6 letras.' },
        { lv: 'b', q: 'Qual linha mostra `Oi Bia`?', o: ['print(Oi Bia)', 'print("Oi Bia")', 'print[Oi Bia]', 'say("Oi Bia")'], a: 1, w: 'Texto entre aspas dentro do print.' },
        { lv: 'i', q: '`17 % 5` é:', o: ['3', '2', '3.4', '12'], a: 1, w: '17 = 3×5 + 2.' },
        { lv: 'a', q: 'Melhor forma de juntar 10 mil strings:', o: ['s += x em loop', '"".join(lista)', 'str.format repetido', 'print'], a: 1, w: 'join aloca uma vez.' }
      ],
      lab: { lang: 'py', task: 'Crie `saudacao(nome)` que retorne `"Olá, NOME!"` com o nome em maiúsculas. Ex.: saudacao("gui") → "Olá, GUI!"', start: 'def saudacao(nome):\n    pass\n', check: { tests: 'assert saudacao("gui") == "Olá, GUI!", saudacao("gui")\nassert saudacao("Ana") == "Olá, ANA!"' }, hint: 'Use nome.upper() e uma f-string.', sol: 'def saudacao(nome):\n    return f"Olá, {nome.upper()}!"' }
    },
    {
      id: 'py2', title: 'Listas e tuplas', min: { b: 15, i: 18, a: 22 },
      b: [
        ['an', '🛒', 'Lista é a lista do mercado', "Uma variável guarda uma coisa. Uma **lista** guarda várias, em fila, uma depois da outra."],
        ['run', 'py', `frutas = ["maçã", "banana", "uva"]
print(frutas[0])
frutas.append("manga")
print(frutas)
print(len(frutas))`, "A primeira posição é a **0**, não a 1! O computador começa a contar do zero."],
        ['run', 'py', `frutas = ["maçã", "banana", "uva"]
for fruta in frutas:
    print("Eu gosto de", fruta)`, "O `for` passa por cada item da lista, um de cada vez."],
        ['tip', "Lista pode guardar qualquer coisa: números, textos e até outras listas."]
      ],
      i: [
        ['run', 'py', `vendas = [1200, 850, 3100, 430, 990]
print(sum(vendas), max(vendas), min(vendas))
print(sorted(vendas, reverse=True)[:3])
acima = [v for v in vendas if v > 1000]
print(acima)
for i, v in enumerate(vendas, start=1):
    print(f"Dia {i}: {v}")`, "**List comprehension** `[expr for x in lista if cond]` é o jeito pythônico de transformar e filtrar."],
        ['run', 'py', `ponto = (10, 20)          # tupla: imutável
x, y = ponto              # desempacotar
nomes = ["Ana", "Bia"]
idades = [30, 25]
for n, i in zip(nomes, idades):
    print(n, i)`, "Tupla serve para registros fixos; `zip` anda em várias listas juntas."]
      ],
      a: [
        ['run', 'py', `matriz = [[0] * 3 for _ in range(3)]
matriz[0][0] = 1
print(matriz)
errado = [[0] * 3] * 3
errado[0][0] = 1
print(errado)`, "`[[0]*3]*3` repete a **mesma** lista interna 3 vezes: armadilha clássica."],
        ['t', 'Complexidade das operações', "`append`/`pop()` no fim: O(1). `insert(0, x)`/`pop(0)`: O(n) — para fila use `collections.deque`. `x in lista`: O(n) — para muitas buscas use `set`. `sort` usa Timsort, O(n log n), estável."],
        ['run', 'py', `pedidos = [("Ana", 300), ("Bia", 120), ("Caio", 300)]
print(sorted(pedidos, key=lambda p: (-p[1], p[0])))
total = sum(v for _, v in pedidos)   # expressão geradora, não cria lista
print(total)`]
      ],
      quiz: [
        { lv: '*', q: 'Em `l = ["a","b","c"]`, `l[1]` é:', o: ['"a"', '"b"', '"c"', 'erro'], a: 1, w: 'Índice começa em 0.' },
        { lv: 'b', q: 'Para colocar um item no fim da lista:', o: ['lista.add(x)', 'lista.append(x)', 'lista.push(x)', 'lista + x'], a: 1, w: 'append = anexar.' },
        { lv: 'i', q: '`[n for n in range(6) if n % 2]` resulta em:', o: ['[0,2,4]', '[1,3,5]', '[1,2,3]', '[]'], a: 1, w: 'n % 2 é truthy para ímpares.' },
        { lv: 'a', q: 'Para fila FIFO eficiente em Python:', o: ['list.pop(0)', 'collections.deque', 'tuple', 'dict'], a: 1, w: 'deque.popleft() é O(1).' }
      ],
      lab: { lang: 'py', task: 'Crie `pares(numeros)` que retorne uma nova lista só com os números pares, na mesma ordem.', start: 'def pares(numeros):\n    pass\n', check: { tests: 'assert pares([1,2,3,4,5,6]) == [2,4,6]\nassert pares([]) == []\nassert pares([7, 9]) == []' }, hint: 'return [n for n in numeros if n % 2 == 0]', sol: 'def pares(numeros):\n    return [n for n in numeros if n % 2 == 0]' }
    },
    {
      id: 'py3', title: 'Dicionários e conjuntos', min: { b: 15, i: 18, a: 20 },
      b: [
        ['an', '📖', 'Dicionário é como um dicionário de verdade', "Você procura a **palavra** e acha o **significado**. Em Python: procura a **chave** e acha o **valor**."],
        ['run', 'py', `pet = {"nome": "Rex", "idade": 3, "late": True}
print(pet["nome"])
pet["idade"] = 4
pet["cor"] = "caramelo"
print(pet)`, "Chave e valor separados por `:`. Dá para mudar e adicionar."],
        ['an', '🎒', 'Conjunto não aceita repetidos', "Um **set** é uma mochila mágica: se você tentar colocar duas bolas iguais, ela guarda só uma."],
        ['run', 'py', `figurinhas = {"leão", "tigre", "leão", "zebra"}
print(figurinhas)
print(len(figurinhas))`]
      ],
      i: [
        ['run', 'py', `cliente = {"nome": "Ana", "cidade": "Brasília"}
print(cliente.get("telefone", "sem telefone"))
for chave, valor in cliente.items():
    print(chave, "→", valor)

contagem = {}
for status in ["pago", "vencido", "pago", "pago"]:
    contagem[status] = contagem.get(status, 0) + 1
print(contagem)`, "`.get(chave, padrão)` evita KeyError. Contar ocorrências é um padrão muito comum."],
        ['run', 'py', `a = {"ana", "bia", "caio"}
b = {"bia", "dani"}
print(a & b, a | b, a - b)
precos = {"pão": 1.5, "café": 8.0}
com_aumento = {k: round(v * 1.1, 2) for k, v in precos.items()}
print(com_aumento)`, "Operações de conjunto e dict comprehension."]
      ],
      a: [
        ['run', 'py', `from collections import Counter, defaultdict
print(Counter("abracadabra").most_common(2))
por_cidade = defaultdict(list)
for nome, cidade in [("Ana","DF"),("Bia","GO"),("Caio","DF")]:
    por_cidade[cidade].append(nome)
print(dict(por_cidade))`],
        ['t', 'Hash table por dentro', "dict e set são tabelas hash: busca, inserção e remoção O(1) em média. Chaves precisam ser **hashable** (imutáveis): str, int, tuple de imutáveis. Desde o Python 3.7, dict preserva ordem de inserção."],
        ['run', 'py', `base = {"tema": "escuro", "idioma": "pt"}
user = {"idioma": "en"}
print(base | user)
copia = dict(base)
copia.update(user)
print(copia)`, "Mesclar dicionários: o da direita vence. Antes do Python 3.9 se escrevia `{**base, **user}`."]
      ],
      quiz: [
        { lv: '*', q: 'Em `d = {"a": 1}`, como pegar o 1?', o: ['d[0]', 'd["a"]', 'd.1', 'd(a)'], a: 1, w: 'Pela chave.' },
        { lv: 'b', q: 'Um set com {1, 1, 2} tem quantos itens?', o: ['3', '2', '1', '0'], a: 1, w: 'Repetidos somem.' },
        { lv: 'i', q: '`d.get("x", 0)` quando x não existe retorna:', o: ['erro', 'None', '0', '"x"'], a: 2, w: 'Retorna o padrão.' },
        { lv: 'a', q: 'Qual NÃO pode ser chave de dict?', o: ['(1, 2)', '"id"', '[1, 2]', '42'], a: 2, w: 'Lista é mutável → não hashable.' }
      ],
      lab: { lang: 'py', task: 'Crie `conta_status(lista)` que receba uma lista de status (ex.: ["pago","vencido","pago"]) e retorne um dicionário com a contagem: {"pago": 2, "vencido": 1}.', start: 'def conta_status(lista):\n    contagem = {}\n    # seu código\n    return contagem\n', check: { tests: 'assert conta_status(["pago","vencido","pago"]) == {"pago": 2, "vencido": 1}\nassert conta_status([]) == {}' }, hint: 'contagem[s] = contagem.get(s, 0) + 1', sol: 'def conta_status(lista):\n    contagem = {}\n    for s in lista:\n        contagem[s] = contagem.get(s, 0) + 1\n    return contagem' }
    },
    {
      id: 'py4', title: 'Funções a fundo', min: { b: 15, i: 20, a: 25 },
      b: [
        ['an', '🍳', 'Receita com ingredientes', "Uma função é uma receita. Os **parâmetros** são os ingredientes que você entrega. O **return** é o prato pronto."],
        ['run', 'py', `def bolo(sabor, velas):
    return f"Bolo de {sabor} com {velas} velinhas 🎂"

print(bolo("chocolate", 5))
print(bolo("morango", 7))`],
        ['tip', "Dê nomes que digam o que a função faz: `calcular_total`, `enviar_email`."]
      ],
      i: [
        ['run', 'py', `def resumo(*valores, moeda="R$", **extras):
    total = sum(valores)
    texto = f"{moeda} {total:.2f}"
    if extras.get("detalhe"):
        texto += f" ({len(valores)} itens)"
    return texto

print(resumo(10, 20.5, 30))
print(resumo(10, 20, moeda="US$", detalhe=True))`, "`*args` recebe vários posicionais; `**kwargs` recebe nomeados extras."],
        ['run', 'py', `def media(notas: list[float]) -> float:
    """Retorna a média; lista vazia retorna 0."""
    return sum(notas) / len(notas) if notas else 0.0

print(media([7, 8, 9]))
print(media.__doc__)`, "Type hints e docstring: documentação que ferramentas entendem."],
        ['run', 'py', `nums = [3, 1, 4, 1, 5]
print(list(map(lambda n: n * 10, nums)))
print(list(filter(lambda n: n > 2, nums)))`]
      ],
      a: [
        ['run', 'py', `import time
def cronometra(func):
    def embrulho(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        print(f"{func.__name__} levou {time.time() - inicio:.4f}s")
        return resultado
    return embrulho

@cronometra
def soma_grande(n):
    return sum(range(n))

print(soma_grande(100000))`, "Decorator = função que recebe função e devolve outra. Use `functools.wraps` para preservar metadados."],
        ['run', 'py', `def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

g = fib()
print([next(g) for _ in range(10)])`, "Geradores produzem valores sob demanda: memória constante, até para sequências infinitas."],
        ['run', 'py', `def ruim(item, lista=[]):
    lista.append(item)
    return lista
print(ruim(1), ruim(2))

def bom(item, lista=None):
    lista = [] if lista is None else lista
    lista.append(item)
    return lista
print(bom(1), bom(2))`, "Padrão mutável é avaliado uma vez só: use `None`."]
      ],
      quiz: [
        { lv: '*', q: 'O que acontece se a função não tiver `return`?', o: ['Erro', 'Retorna None', 'Retorna 0', 'Repete'], a: 1, w: 'Python retorna None implicitamente.' },
        { lv: 'b', q: 'Em `def bolo(sabor)`, `sabor` é:', o: ['O retorno', 'Um parâmetro (ingrediente)', 'Um loop', 'Uma lista'], a: 1, w: 'Parâmetro.' },
        { lv: 'i', q: '`**kwargs` recebe:', o: ['Lista', 'Argumentos nomeados extras como dict', 'Só números', 'Funções'], a: 1, w: 'keyword arguments.' },
        { lv: 'a', q: 'Vantagem de um gerador sobre lista:', o: ['Ordena sozinho', 'Gera valores sob demanda com pouca memória', 'É mais legível sempre', 'Permite índice'], a: 1, w: 'Avaliação preguiçosa.' }
      ],
      lab: { lang: 'py', task: 'Crie `aplica_desconto(valor, pct=10)` que retorne o valor com desconto, arredondado em 2 casas. Ex.: aplica_desconto(200) → 180.0; aplica_desconto(99.9, pct=15) → 84.92', start: 'def aplica_desconto(valor, pct=10):\n    pass\n', check: { tests: 'assert aplica_desconto(200) == 180.0\nassert aplica_desconto(99.9, pct=15) == 84.92, aplica_desconto(99.9, pct=15)\nassert aplica_desconto(50, 0) == 50' }, hint: 'round(valor * (1 - pct / 100), 2)', sol: 'def aplica_desconto(valor, pct=10):\n    return round(valor * (1 - pct / 100), 2)' }
    },
    {
      id: 'py5', title: 'Erros, arquivos e módulos', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '🩹', 'Plano B para quando dá errado', "Às vezes algo dá errado: dividir por zero, arquivo sumiu. Com `try` você diz: “tenta fazer isso; se der ruim, faz aquilo”."],
        ['run', 'py', `try:
    resultado = 10 / 0
except ZeroDivisionError:
    resultado = 0
    print("Não dá para dividir por zero! Usei 0.")
print(resultado)`],
        ['an', '🧰', 'Módulos são caixas de ferramentas', "Python já vem com várias caixas. Você pega uma com `import`."],
        ['run', 'py', `import random
print("Dado:", random.randint(1, 6))
import math
print("Raiz de 81:", math.sqrt(81))`]
      ],
      i: [
        ['run', 'py', `def para_numero(texto):
    try:
        return float(texto.replace(",", "."))
    except ValueError:
        return None
    finally:
        pass  # sempre roda (fechar conexões etc.)

print(para_numero("12,50"), para_numero("abc"))`, "Capture exceções **específicas**. `except:` vazio esconde bugs."],
        ['code', 'py', `import csv, json
from pathlib import Path

with open("clientes.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f, delimiter=";"):
        print(linha["nome"], linha["valor"])

dados = {"total": 3, "ok": True}
Path("saida.json").write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")`, "`with` fecha o arquivo sozinho. Sempre informe `encoding`. (Rode no seu PC: o app não tem disco.)"],
        ['code', 'bash', `python -m venv .venv
source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
pip install requests pandas
pip freeze > requirements.txt`, "Ambiente virtual isola as bibliotecas de cada projeto."]
      ],
      a: [
        ['run', 'py', `class PagamentoRecusado(Exception):
    def __init__(self, motivo, codigo):
        super().__init__(motivo)
        self.codigo = codigo

def cobrar(valor):
    if valor > 5000:
        raise PagamentoRecusado("limite excedido", codigo=51)
    return "ok"

try:
    cobrar(9000)
except PagamentoRecusado as e:
    print(f"Recusado [{e.codigo}]: {e}")`, "Exceções de domínio deixam o fluxo de erro explícito."],
        ['t', 'Organização de projeto', "`src/pacote/__init__.py`, módulos pequenos, `if __name__ == '__main__':` para scripts, `pyproject.toml` para dependências (com uv ou poetry), logging em vez de print, e `pathlib` em vez de concatenar caminhos."],
        ['code', 'py', `import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("cobranca")
log.info("processando %d boletos", 42)
try:
    1 / 0
except Exception:
    log.exception("falhou")   # inclui o traceback`]
      ],
      quiz: [
        { lv: '*', q: '`try/except` serve para:', o: ['Repetir', 'Tratar erros sem o programa quebrar', 'Importar', 'Criar classes'], a: 1, w: 'Plano B.' },
        { lv: 'b', q: 'Para usar a caixa de ferramentas `math`:', o: ['get math', 'import math', 'use math', 'open math'], a: 1, w: 'import.' },
        { lv: 'i', q: 'Por que usar `with open(...)`?', o: ['É mais rápido', 'Fecha o arquivo automaticamente', 'Abre em binário', 'Cria pasta'], a: 1, w: 'Gerenciador de contexto.' },
        { lv: 'a', q: '`except:` sem tipo é ruim porque:', o: ['Não compila', 'Captura tudo, até KeyboardInterrupt, escondendo bugs', 'É lento', 'Não existe'], a: 1, w: 'Seja específico.' }
      ],
      lab: { lang: 'py', task: 'Crie `divide_seguro(a, b)` que retorne a / b, mas retorne `None` se b for zero (use try/except).', start: 'def divide_seguro(a, b):\n    pass\n', check: { tests: 'assert divide_seguro(10, 2) == 5\nassert divide_seguro(1, 0) is None' }, hint: 'try: return a / b / except ZeroDivisionError: return None', sol: 'def divide_seguro(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None' }
    },
    {
      id: 'py6', title: 'Classes e objetos', min: { b: 18, i: 22, a: 25 },
      b: [
        ['an', '🍪', 'Classe é a forminha, objeto é o biscoito', "A forminha de estrela é a **classe**. Cada biscoito que sai dela é um **objeto**. Todos têm formato de estrela, mas cada um pode ter um sabor."],
        ['run', 'py', `class Cachorro:
    def __init__(self, nome):
        self.nome = nome

    def latir(self):
        return f"{self.nome} diz: Au au!"

rex = Cachorro("Rex")
bolt = Cachorro("Bolt")
print(rex.latir())
print(bolt.latir())`, "`self` quer dizer “eu mesmo”: cada cachorro sabe o próprio nome."],
        ['tip', "Objetos têm **características** (nome, cor) e **ações** (latir, correr)."]
      ],
      i: [
        ['run', 'py', `class Conta:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self._saldo = saldo

    def depositar(self, valor):
        if valor <= 0:
            raise ValueError("valor inválido")
        self._saldo += valor

    @property
    def saldo(self):
        return self._saldo

    def __repr__(self):
        return f"Conta({self.titular!r}, saldo={self._saldo})"

c = Conta("Gui")
c.depositar(150)
print(c, c.saldo)`, "Encapsulamento: o saldo só muda por métodos que validam. `_` indica “uso interno”."],
        ['run', 'py', `class Animal:
    def falar(self): return "..."
class Gato(Animal):
    def falar(self): return "Miau"
class Vaca(Animal):
    def falar(self): return "Muu"
for a in [Gato(), Vaca(), Animal()]:
    print(a.falar())`, "Herança + polimorfismo: mesma chamada, comportamentos diferentes."]
      ],
      a: [
        ['code', 'py', `from dataclasses import dataclass, field
from datetime import date

@dataclass(frozen=True)
class Parcela:
    numero: int
    valor: float
    vencimento: date
    pago: bool = False

@dataclass
class Contrato:
    cliente: str
    parcelas: list[Parcela] = field(default_factory=list)

    @property
    def em_aberto(self) -> float:
        return sum(p.valor for p in self.parcelas if not p.pago)`, "dataclasses geram `__init__`, `__repr__`, `__eq__`. `frozen=True` deixa imutável."],
        ['t', 'Composição > herança', "Herança acopla forte. Prefira compor objetos (um Contrato **tem** Parcelas) e usar protocolos/interfaces (`typing.Protocol`) para trocar implementações (ex.: GatewayPagamento → Asaas ou Stripe)."],
        ['list', 'SOLID em uma linha cada', ['**S**: uma razão para mudar por classe', '**O**: aberto para extensão, fechado para modificação', '**L**: subclasses substituem a base sem surpresa', '**I**: interfaces pequenas', '**D**: dependa de abstrações, não de implementações']]
      ],
      quiz: [
        { lv: '*', q: 'Uma classe é:', o: ['Um objeto pronto', 'Um molde para criar objetos', 'Uma função de loop', 'Um módulo'], a: 1, w: 'Forminha.' },
        { lv: 'b', q: 'Se `rex = Cachorro("Rex")`, rex é:', o: ['Uma classe', 'Um objeto', 'Um número', 'Um erro'], a: 1, w: 'Um biscoito da forminha.' },
        { lv: 'i', q: '`__init__` é chamado:', o: ['Ao apagar o objeto', 'Ao criar o objeto', 'Ao imprimir', 'Nunca'], a: 1, w: 'Construtor/inicializador.' },
        { lv: 'a', q: '`@dataclass(frozen=True)` torna a instância:', o: ['Mais rápida de criar', 'Imutável (e hashable)', 'Singleton', 'Assíncrona'], a: 1, w: 'Atributos não podem ser reatribuídos.' }
      ],
      lab: { lang: 'py', task: 'Crie a classe `Retangulo` com `largura` e `altura` no `__init__` e um método `area()` que retorna largura × altura.', start: 'class Retangulo:\n    pass\n', check: { tests: 'r = Retangulo(3, 4)\nassert r.area() == 12\nassert Retangulo(1, 1).area() == 1' }, hint: 'def __init__(self, largura, altura): self.largura = largura ...', sol: 'class Retangulo:\n    def __init__(self, largura, altura):\n        self.largura = largura\n        self.altura = altura\n\n    def area(self):\n        return self.largura * self.altura' }
    },
    {
      id: 'py7', title: 'Python no mundo real', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🦸', 'O que dá para fazer com Python', "Robôs que preenchem planilhas, sites, jogos, análise de dados, inteligência artificial, bots de WhatsApp... Quase tudo!"],
        ['list', 'Super-poderes (bibliotecas)', ['**requests**: conversar com sites e APIs', '**pandas**: mexer em planilhas gigantes', '**FastAPI / Django**: criar sites e APIs', '**openpyxl**: Excel', '**selenium / playwright**: controlar o navegador']]
      ],
      i: [
        ['code', 'py', `import requests
r = requests.get("https://viacep.com.br/ws/73300000/json/", timeout=10)
r.raise_for_status()
cep = r.json()
print(cep["localidade"], cep["uf"])`, "Consumir uma API pública. Sempre use `timeout`."],
        ['code', 'py', `import pandas as pd
df = pd.read_excel("cobranca.xlsx")
df["vencimento"] = pd.to_datetime(df["vencimento"], dayfirst=True)
vencidos = df[(df["status"] == "aberto") & (df["vencimento"] < pd.Timestamp.today())]
print(vencidos.groupby("banco")["valor"].agg(["count", "sum"]))
vencidos.to_csv("vencidos.csv", index=False, sep=";")`, "Em 6 linhas: ler planilha, filtrar vencidos, agrupar por banco e exportar."]
      ],
      a: [
        ['code', 'py', `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Pedido(BaseModel):
    cliente: str
    valor: float

PEDIDOS: dict[int, Pedido] = {}

@app.post("/pedidos", status_code=201)
def criar(p: Pedido):
    pid = len(PEDIDOS) + 1
    PEDIDOS[pid] = p
    return {"id": pid, **p.model_dump()}

@app.get("/pedidos/{pid}")
def ler(pid: int):
    if pid not in PEDIDOS:
        raise HTTPException(404, "não encontrado")
    return PEDIDOS[pid]`, "`uvicorn main:app --reload` e abra `/docs`: documentação automática."],
        ['code', 'py', `import asyncio, httpx
async def buscar(cliente, cep):
    r = await cliente.get(f"https://viacep.com.br/ws/{cep}/json/")
    return r.json().get("localidade")

async def main():
    async with httpx.AsyncClient(timeout=10) as c:
        print(await asyncio.gather(*(buscar(c, x) for x in ["70040010", "73300000"])))
asyncio.run(main())`, "asyncio faz centenas de requisições concorrentes em uma thread."]
      ],
      quiz: [
        { lv: '*', q: 'Qual biblioteca é famosa para planilhas e análise de dados?', o: ['pandas', 'flask', 'pygame', 'turtle'], a: 0, w: 'pandas.' },
        { lv: 'b', q: 'Com Python dá para criar:', o: ['Só jogos', 'Só sites', 'Automação, sites, dados, IA e muito mais', 'Nada sem internet'], a: 2, w: 'Linguagem de propósito geral.' },
        { lv: 'i', q: 'Por que passar `timeout` no requests?', o: ['Fica mais bonito', 'Sem ele, a chamada pode travar para sempre', 'É obrigatório', 'Acelera'], a: 1, w: 'O padrão é esperar indefinidamente.' },
        { lv: 'a', q: 'No FastAPI, o Pydantic serve para:', o: ['Rotas', 'Validar e serializar dados', 'Servidor HTTP', 'Banco'], a: 1, w: 'Modelos com validação.' }
      ]
    }
  ]
});
