CC.tracks.push({
  id: 'dados', ord: 17, name: 'Dados & Machine Learning', short: 'Dados', glyph: '∿', hue: 230,
  desc: 'Análise de dados, estatística essencial, dashboards (Power BI) e como as máquinas aprendem com exemplos.',
  test: [
    { d: 1, q: 'A média de 2, 4 e 6 é:', o: ['3', '4', '6', '12'], a: 1 },
    { d: 1, q: 'Machine learning é:', o: ['Robôs físicos', 'Programas que aprendem padrões a partir de exemplos', 'Um tipo de banco', 'Uma linguagem'], a: 1 },
    { d: 2, q: 'Quando há valores extremos (outliers), qual descreve melhor o “típico”?', o: ['Média', 'Mediana', 'Máximo', 'Soma'], a: 1 },
    { d: 2, q: 'ETL significa:', o: ['Extrair, Transformar, Carregar', 'Editar, Testar, Lançar', 'Enviar, Trocar, Ler', 'Erro, Teste, Log'], a: 0 },
    { d: 3, q: 'Overfitting é:', o: ['Modelo simples demais', 'Modelo decorou o treino e generaliza mal', 'Falta de dados de teste', 'Erro de sintaxe'], a: 1 },
    { d: 3, q: 'Correlação implica causalidade?', o: ['Sempre', 'Não necessariamente', 'Só em amostras grandes', 'Só em dados financeiros'], a: 1 }
  ],
  lessons: [
    {
      id: 'dados1', title: 'Analisando dados', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🍬', 'Contar balas', "Se você tem um saco de balas, pode perguntar: quantas tem? qual cor aparece mais? qual a maior? Isso já é **analisar dados**!"],
        ['run', 'py', `vendas = [30, 45, 20, 60, 45]
print("Total vendido:", sum(vendas))
print("Melhor dia:", max(vendas))
print("Média por dia:", sum(vendas) / len(vendas))`]
      ],
      i: [
        ['run', 'py', `from collections import Counter
import math
dias_atraso = [0, 2, 3, 3, 5, 7, 8, 90]
n = len(dias_atraso)
media = sum(dias_atraso) / n
ordenado = sorted(dias_atraso)
mediana = (ordenado[n // 2 - 1] + ordenado[n // 2]) / 2
moda = Counter(dias_atraso).most_common(1)[0][0]
desvio = math.sqrt(sum((x - media) ** 2 for x in dias_atraso) / n)
print("média:", round(media, 1))
print("mediana:", mediana)
print("moda:", moda)
print("desvio padrão:", round(desvio, 1))`, "Um único atraso de 90 dias puxa a média para cima. A **mediana** mostra o típico. No seu computador, o módulo `statistics` faz isso pronto."],
        ['flow', 'Pipeline de dados (ETL/ELT)', ['Extrair: Conta Azul, RD Station, planilhas, banco', 'Transformar: limpar, padronizar datas, juntar tabelas', 'Carregar: BigQuery / Postgres', 'Visualizar: Power BI, Looker Studio, Metabase']],
        ['tip', "80% do trabalho com dados é limpeza: datas em formatos diferentes, nomes com espaço, valores “R$ 1.234,56” como texto."]
      ],
      a: [
        ['code', 'py', `import pandas as pd
df = pd.read_csv("parcelas.csv", sep=";", decimal=",", parse_dates=["vencimento", "pagamento"], dayfirst=True)
df["dias_atraso"] = (df["pagamento"].fillna(pd.Timestamp.today()) - df["vencimento"]).dt.days.clip(lower=0)
df["faixa"] = pd.cut(df["dias_atraso"], [-1, 0, 30, 60, 90, 10**6], labels=["em dia", "1-30", "31-60", "61-90", "90+"])
aging = df.pivot_table(index="consultor", columns="faixa", values="valor", aggfunc="sum", fill_value=0, observed=False)
print(aging.style.format("R$ {:,.2f}"))`, "Aging de inadimplência por consultor com pandas: cálculo de atraso, faixas e tabela dinâmica."],
        ['list', 'Modelagem para BI', ['Esquema estrela: fatos (parcelas, pagamentos) + dimensões (cliente, consultor, data)', 'Tabela calendário', 'Medidas DAX: `Inadimplência % = DIVIDE([Vencido], [Total])`', 'Atualização incremental para tabelas grandes']]
      ],
      quiz: [
        { lv: '*', q: 'A média de 10, 20 e 30 é:', o: ['10', '20', '30', '60'], a: 1, w: '60 ÷ 3.' },
        { lv: 'b', q: 'O maior valor de uma lista em Python:', o: ['max()', 'big()', 'top()', 'len()'], a: 0, w: 'max.' },
        { lv: 'i', q: 'Com um outlier enorme, o melhor resumo do “típico” é:', o: ['Média', 'Mediana', 'Soma', 'Máximo'], a: 1, w: 'Mediana é robusta.' },
        { lv: 'a', q: 'No esquema estrela, “parcelas” normalmente é:', o: ['Dimensão', 'Tabela fato', 'Tabela calendário', 'View'], a: 1, w: 'Eventos com valores numéricos.' }
      ],
      lab: { lang: 'py', task: 'Crie `mediana(valores)` sem usar a biblioteca statistics. Para quantidade par, é a média dos dois do meio.', start: 'def mediana(valores):\n    v = sorted(valores)\n    n = len(v)\n    # seu código\n', check: { tests: 'assert mediana([3,1,2]) == 2\nassert mediana([4,1,3,2]) == 2.5\nassert mediana([10]) == 10' }, hint: 'Se n for ímpar: v[n//2]. Se par: (v[n//2 - 1] + v[n//2]) / 2', sol: 'def mediana(valores):\n    v = sorted(valores)\n    n = len(v)\n    if n % 2 == 1:\n        return v[n // 2]\n    return (v[n // 2 - 1] + v[n // 2]) / 2' }
    },
    {
      id: 'dados2', title: 'Como a máquina aprende', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🐶', 'Ensinar com exemplos', "Como você aprendeu o que é um cachorro? Alguém mostrou vários cachorros: “isso é cachorro”. Depois de muitos exemplos, você reconhece um que nunca viu.\nO computador aprende igual: mostramos milhares de exemplos e ele descobre o padrão sozinho. Isso é **machine learning**."],
        ['list', 'Coisas que aprendem assim', ['Filtro de spam do e-mail', 'Recomendações da Netflix e do YouTube', 'Reconhecer rosto para desbloquear o celular', 'Prever quem pode atrasar um pagamento']]
      ],
      i: [
        ['tbl', 'Tipos de aprendizado', ['Tipo', 'Ideia', 'Exemplo'], [['Supervisionado', 'aprende com exemplos rotulados', 'prever atraso (sim/não)'], ['Não supervisionado', 'acha grupos sozinho', 'segmentar clientes'], ['Por reforço', 'aprende por tentativa e recompensa', 'jogos, robôs']]],
        ['run', 'py', `# regressão linear "na mão": prever valor a partir de x
xs = [1, 2, 3, 4, 5]          # meses
ys = [110, 205, 290, 410, 495] # vendas
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
a = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
b = my - a * mx
print(f"y = {a:.1f}x + {b:.1f}")
print("previsão mês 6:", round(a * 6 + b))`, "O modelo encontrou a reta que melhor passa pelos pontos: isso é “aprender” os parâmetros."]
      ],
      a: [
        ['code', 'py', `from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report

X = df[["valor", "parcelas", "dias_ate_1o_venc", "score_interno"]]
y = df["atrasou_mais_30"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
modelo = GradientBoostingClassifier().fit(X_tr, y_tr)
print(classification_report(y_te, modelo.predict(X_te)))`, "Separe treino e teste; avalie com precisão, recall e F1 (acurácia engana em classes desbalanceadas)."],
        ['list', 'Armadilhas', ['**Vazamento de dados**: usar informação que só existe depois do evento', '**Overfitting**: ótimo no treino, ruim no mundo real (use validação cruzada)', 'Viés: o modelo repete injustiças do histórico', 'Drift: o mundo muda; monitore e retreine']]
      ],
      quiz: [
        { lv: '*', q: 'Machine learning aprende a partir de:', o: ['Exemplos (dados)', 'Sorte', 'Senhas', 'Cores'], a: 0, w: 'Dados.' },
        { lv: 'b', q: 'O filtro de spam é um exemplo de:', o: ['Machine learning', 'Banco de dados', 'DNS', 'CSS'], a: 0, w: 'Aprendeu com e-mails marcados.' },
        { lv: 'i', q: 'Agrupar clientes parecidos sem rótulo é:', o: ['Supervisionado', 'Não supervisionado', 'Reforço', 'Regressão'], a: 1, w: 'Clustering.' },
        { lv: 'a', q: 'Por que separar treino e teste?', o: ['Para economizar memória', 'Para medir desempenho em dados que o modelo não viu', 'É exigência do Python', 'Para treinar mais rápido'], a: 1, w: 'Avalia generalização.' }
      ]
    },
    {
      id: 'dados3', title: 'Redes neurais e deep learning', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🧠', 'Muitas pecinhas que votam', "Imagina mil formiguinhas olhando uma foto. Cada uma vê um pedacinho e dá um palpite. Juntando os palpites em várias camadas, elas descobrem: “é um gato!”. Isso é uma **rede neural**."]
      ],
      i: [
        ['t', 'Neurônio artificial', "Recebe números, multiplica cada um por um **peso**, soma, aplica uma função de ativação e passa adiante. Treinar é ajustar os pesos para errar menos, usando **gradiente descendente** (pequenos passos na direção que reduz o erro)."],
        ['run', 'py', `# um "neurônio" aprendendo y = 2x com gradiente descendente
w = 0.0
dados = [(1, 2), (2, 4), (3, 6)]
for epoca in range(30):
    grad = sum(2 * (w * x - y) * x for x, y in dados) / len(dados)
    w -= 0.05 * grad
print("peso aprendido:", round(w, 3))`]
      ],
      a: [
        ['list', 'Arquiteturas', ['**MLP**: camadas densas, dados tabulares', '**CNN**: convoluções, imagens', '**RNN/LSTM**: sequências (antes dos transformers)', '**Transformer**: atenção; base dos LLMs (GPT, Claude, Gemini)', '**Difusão**: geração de imagens']],
        ['t', 'Treino em escala', "Backpropagation calcula gradientes camada a camada; otimizadores como Adam ajustam o passo; GPUs fazem multiplicação de matrizes em paralelo. PyTorch é o framework dominante em pesquisa e produção."]
      ],
      quiz: [
        { lv: '*', q: 'Os LLMs (como o ChatGPT e o Claude) são baseados em:', o: ['Planilhas', 'Redes neurais Transformer', 'Bancos SQL', 'Regras if/else'], a: 1, w: 'Transformers.' },
        { lv: 'b', q: 'Uma rede neural é como:', o: ['Muitas pecinhas votando em camadas', 'Uma calculadora simples', 'Um cabo', 'Uma senha'], a: 0, w: 'Camadas de neurônios.' },
        { lv: 'i', q: 'Treinar uma rede é ajustar:', o: ['As cores', 'Os pesos', 'O teclado', 'O DNS'], a: 1, w: 'Pesos.' },
        { lv: 'a', q: 'Para imagens, a arquitetura clássica é:', o: ['CNN', 'SQL', 'RNN', 'B-tree'], a: 0, w: 'Convolucional.' }
      ]
    }
  ]
});
