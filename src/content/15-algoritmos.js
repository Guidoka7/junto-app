CC.tracks.push({
  id: 'algo', ord: 15, name: 'Algoritmos & Estruturas', short: 'Algoritmos', glyph: 'O(n)', hue: 310,
  desc: 'Big-O, pilhas, filas, hash, árvores, grafos, busca e ordenação: a base das entrevistas técnicas.',
  test: [
    { d: 1, q: 'Para achar um nome numa lista de 1 milhão, olhando um por um, no pior caso você olha:', o: ['1', '1.000', '1 milhão', '20'], a: 2 },
    { d: 1, q: 'Uma pilha funciona como:', o: ['Fila de banco', 'Pilha de pratos: o último que entra é o primeiro que sai', 'Árvore', 'Círculo'], a: 1 },
    { d: 2, q: 'Busca binária exige que a lista esteja:', o: ['Vazia', 'Ordenada', 'Com números pares', 'Duplicada'], a: 1 },
    { d: 2, q: 'Complexidade de buscar uma chave num dicionário (hash) em média:', o: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], a: 0 },
    { d: 3, q: 'Melhor estrutura para menor caminho em grafo sem pesos:', o: ['DFS', 'BFS', 'Pilha', 'Heap de máximo'], a: 1 },
    { d: 3, q: 'Complexidade do merge sort:', o: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], a: 1 }
  ],
  lessons: [
    {
      id: 'algo1', title: 'Big-O: medindo a velocidade', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🔎', 'Procurar um brinquedo', "Se você procura um brinquedo olhando caixa por caixa, com 10 caixas é rápido. Com 1.000 caixas, demora muito mais!\n**Big-O** é um jeito de dizer: “quanto mais coisas, quanto mais demora?”"],
        ['list', 'Jeitos de demorar', ['**O(1)**: sempre igual, tipo abrir a gaveta certa', '**O(n)**: olhar uma por uma', '**O(n²)**: comparar todo mundo com todo mundo (demora MUITO)']]
      ],
      i: [
        ['tbl', 'Crescimento para n = 1.000.000', ['Complexidade', 'Operações', 'Exemplo'], [['O(1)', '1', 'dict[chave]'], ['O(log n)', '~20', 'busca binária'], ['O(n)', '1.000.000', 'percorrer lista'], ['O(n log n)', '~20.000.000', 'ordenar'], ['O(n²)', '10¹²', 'dois loops aninhados']]],
        ['run', 'py', `import time
dados = list(range(20000))
alvos = list(range(0, 20000, 7))

t = time.time()
achados = [x for x in alvos if x in dados]        # O(n*m)
print("lista:", round(time.time() - t, 3), "s")

conjunto = set(dados)
t = time.time()
achados = [x for x in alvos if x in conjunto]     # O(m)
print("set:  ", round(time.time() - t, 3), "s")`, "Mesmo resultado, estrutura diferente, tempo muito diferente."]
      ],
      a: [
        ['t', 'Além do pior caso', "Big-O descarta constantes e foca em n grande; na prática, constantes e cache importam (O(n) com acesso sequencial pode vencer O(log n) com saltos). Considere também **memória** (complexidade de espaço) e **custo amortizado** (append de lista: O(1) amortizado, apesar de realocações ocasionais O(n))."],
        ['code', 'py', `# detectar duplicados
def tem_dup_lento(xs):            # O(n²)
    return any(xs[i] == xs[j] for i in range(len(xs)) for j in range(i + 1, len(xs)))
def tem_dup_rapido(xs):           # O(n) tempo, O(n) espaço
    return len(set(xs)) != len(xs)
def tem_dup_sem_memoria(xs):      # O(n log n) tempo, O(1) extra se ordenar in-place
    xs.sort()
    return any(a == b for a, b in zip(xs, xs[1:]))`]
      ],
      quiz: [
        { lv: '*', q: 'O(1) significa:', o: ['Tempo constante', 'Uma linha de código', 'Um segundo', 'Lento'], a: 0, w: 'Não depende de n.' },
        { lv: 'b', q: 'Comparar todo mundo com todo mundo é:', o: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], a: 2, w: 'Dois loops aninhados.' },
        { lv: 'i', q: '`x in conjunto` (set) é em média:', o: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], a: 0, w: 'Hash.' },
        { lv: 'a', q: 'Append em lista Python é:', o: ['O(n) sempre', 'O(1) amortizado', 'O(log n)', 'O(n²)'], a: 1, w: 'Realoca com folga geométrica.' }
      ],
      lab: { lang: 'py', task: 'Crie `tem_repetido(lista)` que retorna True se algum valor aparece mais de uma vez. Faça em O(n) usando set.', start: 'def tem_repetido(lista):\n    vistos = set()\n    # seu código\n    return False\n', check: { tests: 'assert tem_repetido([1,2,3,1]) is True\nassert tem_repetido([1,2,3]) is False\nassert tem_repetido([]) is False\nassert tem_repetido(list(range(5000)) + [4999]) is True' }, hint: 'for x in lista: if x in vistos: return True; vistos.add(x)', sol: 'def tem_repetido(lista):\n    vistos = set()\n    for x in lista:\n        if x in vistos:\n            return True\n        vistos.add(x)\n    return False' }
    },
    {
      id: 'algo2', title: 'Pilhas, filas e hash', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🍽️', 'Pilha de pratos', "Você coloca prato em cima de prato. Para tirar, pega o de **cima** (o último que colocou). Isso é uma **pilha**. O botão “desfazer” funciona assim!"],
        ['an', '🎢', 'Fila do brinquedo', "Quem chega primeiro, brinca primeiro. Isso é uma **fila**."],
        ['run', 'py', `pilha = []
pilha.append("prato 1")
pilha.append("prato 2")
pilha.append("prato 3")
print("Tirei:", pilha.pop())
print("Sobrou:", pilha)`]
      ],
      i: [
        ['run', 'py', `from collections import deque
fila = deque(["Ana", "Bia"])
fila.append("Caio")          # entra no fim
print(fila.popleft())        # sai do começo
print(fila)

def balanceado(s):
    pares = {")": "(", "]": "[", "}": "{"}
    pilha = []
    for c in s:
        if c in "([{":
            pilha.append(c)
        elif c in pares:
            if not pilha or pilha.pop() != pares[c]:
                return False
    return not pilha
print(balanceado("{[()]}"), balanceado("([)]"))`, "Pilha resolve o clássico “parênteses balanceados” (é assim que editores validam código)."],
        ['tbl', 'Quando usar', ['Estrutura', 'Use para'], [['Lista/array', 'acesso por posição'], ['Pilha', 'desfazer, recursão, parsing'], ['Fila', 'processar em ordem de chegada'], ['Hash (dict/set)', 'buscar por chave, contar, deduplicar'], ['Heap', 'pegar sempre o menor/maior (prioridade)']]]
      ],
      a: [
        ['code', 'py', `import heapq
tarefas = []
heapq.heappush(tarefas, (2, "enviar relatório"))
heapq.heappush(tarefas, (1, "cobrar vencidos"))
heapq.heappush(tarefas, (3, "organizar pasta"))
while tarefas:
    print(heapq.heappop(tarefas))
print(heapq.nlargest(2, [5, 1, 9, 3]))`, "Heap: inserir e remover o menor em O(log n). Base de agendadores e do algoritmo de Dijkstra."],
        ['t', 'Hash por dentro', "A função hash transforma a chave num índice do array. Colisões são resolvidas por encadeamento ou endereçamento aberto (Python usa sondagem). Quando enche, redimensiona (rehash). Hash ruim ou adversarial degrada para O(n): por isso Python randomiza hash de strings."]
      ],
      quiz: [
        { lv: '*', q: 'Numa fila, quem sai primeiro?', o: ['Quem chegou por último', 'Quem chegou primeiro', 'O maior', 'Aleatório'], a: 1, w: 'FIFO.' },
        { lv: 'b', q: 'O botão “desfazer” funciona como:', o: ['Fila', 'Pilha', 'Árvore', 'Círculo'], a: 1, w: 'Desfaz o último.' },
        { lv: 'i', q: 'Para fila eficiente em Python:', o: ['list.pop(0)', 'deque.popleft()', 'set.pop()', 'dict'], a: 1, w: 'O(1).' },
        { lv: 'a', q: 'Heap entrega o menor elemento em:', o: ['O(1) para ver, O(log n) para remover', 'O(n)', 'O(n log n)', 'O(1) para remover'], a: 0, w: 'Topo do heap.' }
      ],
      lab: { lang: 'py', task: 'Crie `inverte(texto)` que usa uma pilha (lista com append/pop) para devolver o texto ao contrário. Ex.: "abc" → "cba".', start: 'def inverte(texto):\n    pilha = []\n    # empilhe cada letra, depois desempilhe\n    return ""\n', check: { tests: 'assert inverte("abc") == "cba"\nassert inverte("") == ""\nassert inverte("Gui") == "iuG"' }, hint: 'for c in texto: pilha.append(c); depois while pilha: resultado += pilha.pop()', sol: 'def inverte(texto):\n    pilha = []\n    for c in texto:\n        pilha.append(c)\n    resultado = ""\n    while pilha:\n        resultado += pilha.pop()\n    return resultado' }
    },
    {
      id: 'algo3', title: 'Busca e ordenação', min: { b: 15, i: 20, a: 25 },
      b: [
        ['an', '📖', 'Achar uma palavra no dicionário', "Você não lê o dicionário inteiro! Abre no meio: se a palavra vem antes, olha a metade da esquerda. Senão, a da direita. Vai cortando pela metade até achar.\nIsso é **busca binária**: com 1 milhão de palavras, você acha em uns 20 passos!"],
        ['run', 'py', `numeros = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
alvo = 23
esq, dir = 0, len(numeros) - 1
passos = 0
while esq <= dir:
    passos += 1
    meio = (esq + dir) // 2
    if numeros[meio] == alvo:
        print("Achei na posição", meio, "em", passos, "passos")
        break
    elif numeros[meio] < alvo:
        esq = meio + 1
    else:
        dir = meio - 1`]
      ],
      i: [
        ['run', 'py', `def bubble(xs):
    xs = xs[:]
    for i in range(len(xs)):
        for j in range(len(xs) - 1 - i):
            if xs[j] > xs[j + 1]:
                xs[j], xs[j + 1] = xs[j + 1], xs[j]
    return xs

def merge_sort(xs):
    if len(xs) <= 1:
        return xs
    m = len(xs) // 2
    a, b = merge_sort(xs[:m]), merge_sort(xs[m:])
    out = []
    while a and b:
        out.append(a.pop(0) if a[0] <= b[0] else b.pop(0))
    return out + a + b

print(bubble([5, 2, 9, 1]), merge_sort([5, 2, 9, 1, 7]))`, "Bubble sort: O(n²), didático. Merge sort: O(n log n), dividir e conquistar. Na vida real: `sorted()`."],
        ['tip', "Use `bisect` do Python para busca binária pronta em listas ordenadas."]
      ],
      a: [
        ['list', 'Ordenações que importam', ['**Timsort** (Python, Java objetos): híbrido merge+insertion, ótimo em dados quase ordenados, estável', '**Quicksort**: O(n log n) médio, in-place, O(n²) no pior caso sem pivô aleatório', '**Heapsort**: O(n log n) garantido, não estável', '**Counting/Radix**: O(n) para inteiros em faixa limitada', 'Limite inferior de ordenação por comparação: Ω(n log n)']],
        ['code', 'py', `# busca binária na resposta: menor capacidade diária para pagar tudo em D dias
def cabe(cap, valores, dias):
    usados, atual = 1, 0
    for v in valores:
        if atual + v > cap:
            usados, atual = usados + 1, 0
        atual += v
    return usados <= dias

def menor_capacidade(valores, dias):
    lo, hi = max(valores), sum(valores)
    while lo < hi:
        mid = (lo + hi) // 2
        if cabe(mid, valores, dias): hi = mid
        else: lo = mid + 1
    return lo`, "Padrão avançado: buscar binariamente no espaço de respostas quando a verificação é monotônica."]
      ],
      quiz: [
        { lv: '*', q: 'Busca binária funciona em listas:', o: ['Desordenadas', 'Ordenadas', 'Vazias', 'De texto só'], a: 1, w: 'Precisa estar ordenada.' },
        { lv: 'b', q: 'A cada passo, a busca binária:', o: ['Olha tudo de novo', 'Corta a busca pela metade', 'Dobra', 'Para'], a: 1, w: 'Metade.' },
        { lv: 'i', q: 'Bubble sort é:', o: ['O(n log n)', 'O(n²)', 'O(n)', 'O(1)'], a: 1, w: 'Dois loops.' },
        { lv: 'a', q: 'Ordenação estável significa:', o: ['Nunca falha', 'Elementos iguais mantêm a ordem relativa original', 'É rápida', 'Não usa memória'], a: 1, w: 'Importa ao ordenar por várias chaves.' }
      ],
      lab: { lang: 'py', task: 'Implemente `busca_binaria(lista, alvo)` que retorna o índice do alvo numa lista ordenada, ou -1 se não existir.', start: 'def busca_binaria(lista, alvo):\n    esq, dir = 0, len(lista) - 1\n    # seu código\n    return -1\n', check: { tests: 'L=[1,3,5,7,9,11]\nassert busca_binaria(L, 7) == 3\nassert busca_binaria(L, 1) == 0\nassert busca_binaria(L, 11) == 5\nassert busca_binaria(L, 4) == -1\nassert busca_binaria([], 1) == -1' }, hint: 'while esq <= dir: meio = (esq+dir)//2 ...', sol: 'def busca_binaria(lista, alvo):\n    esq, dir = 0, len(lista) - 1\n    while esq <= dir:\n        meio = (esq + dir) // 2\n        if lista[meio] == alvo:\n            return meio\n        if lista[meio] < alvo:\n            esq = meio + 1\n        else:\n            dir = meio - 1\n    return -1' }
    },
    {
      id: 'algo4', title: 'Árvores e grafos', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🌳', 'Árvore genealógica', "Vovó no topo, filhos embaixo, netos mais embaixo. Cada um tem um “pai”. Pastas do computador também são assim!"],
        ['an', '🗺️', 'Mapa de cidades', "Cidades ligadas por estradas formam um **grafo**. O GPS usa grafos para achar o caminho mais curto até a escola."]
      ],
      i: [
        ['run', 'py', `from collections import deque
mapa = {
    "Planaltina": ["Sobradinho", "Formosa"],
    "Sobradinho": ["Planaltina", "Brasília"],
    "Formosa": ["Planaltina"],
    "Brasília": ["Sobradinho", "Taguatinga"],
    "Taguatinga": ["Brasília"],
}
def caminho(origem, destino):
    fila = deque([[origem]])
    visitados = {origem}
    while fila:
        rota = fila.popleft()
        if rota[-1] == destino:
            return rota
        for viz in mapa[rota[-1]]:
            if viz not in visitados:
                visitados.add(viz)
                fila.append(rota + [viz])
print(caminho("Planaltina", "Taguatinga"))`, "BFS (busca em largura) acha o caminho com menos paradas."],
        ['t', 'Árvore binária de busca', "Cada nó: menores à esquerda, maiores à direita. Busca em O(log n) se balanceada. Bancos usam **B-trees** (muitos filhos por nó) nos índices; o DOM e o JSON também são árvores."]
      ],
      a: [
        ['code', 'py', `import heapq
def dijkstra(grafo, origem):
    dist = {origem: 0}
    heap = [(0, origem)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist.get(u, float("inf")):
            continue
        for v, peso in grafo[u]:
            nd = d + peso
            if nd < dist.get(v, float("inf")):
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist`, "Dijkstra: menor caminho com pesos positivos, O((V+E) log V)."],
        ['list', 'Algoritmos de grafo úteis', ['DFS: ciclos, componentes, ordenação topológica (ordem de dependências)', 'BFS: menor número de arestas', 'Dijkstra / A*: rotas com custo', 'Union-Find: conectividade dinâmica', 'Programação dinâmica: problemas com subproblemas repetidos (memoização)']]
      ],
      quiz: [
        { lv: '*', q: 'Pastas dentro de pastas formam:', o: ['Uma fila', 'Uma árvore', 'Uma pilha', 'Um número'], a: 1, w: 'Hierarquia.' },
        { lv: 'b', q: 'Cidades e estradas podem ser representadas por:', o: ['Grafo', 'Lista de compras', 'Texto', 'Cor'], a: 0, w: 'Nós e arestas.' },
        { lv: 'i', q: 'BFS encontra:', o: ['O caminho com menos arestas', 'O caminho mais caro', 'Ciclos negativos', 'Nada'], a: 0, w: 'Explora por camadas.' },
        { lv: 'a', q: 'Ordenação topológica serve para:', o: ['Ordenar números', 'Ordenar tarefas respeitando dependências', 'Comprimir', 'Criptografar'], a: 1, w: 'Ex.: ordem de build.' }
      ]
    }
  ]
});
