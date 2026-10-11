CC.tracks.push({
  id: 'excel', ord: -4, name: 'Excel Essencial', short: 'Excel', glyph: 'X', hue: 140,
  desc: 'Planilhas do zero: fórmulas, funções, SE, CONT.SE, SOMASE e PROCV, praticando numa planilha de verdade.',
  test: [
    { d: 1, q: 'Toda fórmula no Excel começa com:', o: ['#', '=', '@', '*'], a: 1 },
    { d: 1, q: 'A célula na coluna B, linha 3 se chama:', o: ['3B', 'B3', 'B-3', 'L3CB'], a: 1 },
    { d: 2, q: '`=SOMA(A1:A10)` faz:', o: ['Soma A1 e A10', 'Soma de A1 até A10', 'Conta células', 'Média'], a: 1 },
    { d: 2, q: 'Para fixar a célula C1 ao copiar a fórmula, use:', o: ['C1', '$C$1', '#C1', 'C1!'], a: 1 },
    { d: 3, q: '`=PROCV(1050;A2:D100;3;FALSO)` procura 1050:', o: ['Na coluna C e retorna da A', 'Na primeira coluna (A) e retorna o valor da 3ª coluna (C)', 'Em qualquer coluna', 'Na linha 3'], a: 1 },
    { d: 3, q: 'Qual fórmula conta quantos “vencido” há em D2:D50?', o: ['=SOMA(D2:D50;"vencido")', '=CONT.SE(D2:D50;"vencido")', '=CONT(D2:D50)', '=SE(D2:D50="vencido")'], a: 1 }
  ],
  exam: [
    { t: 'fill', q: 'Escreva a fórmula que soma de B2 até B20:', ans: ['=soma(b2:b20)', '=sum(b2:b20)'], ph: '=...', w: '=SOMA(B2:B20).' },
    { t: 'tf', q: 'No Excel em português, os argumentos são separados por ponto e vírgula.', a: true, w: 'Ex.: =SE(A1>10;"alto";"baixo").' },
    { q: '`=SE(C2>=7;"Aprovado";"Reprovado")` com C2 = 6,5 retorna:', o: ['Aprovado', 'Reprovado', '6,5', 'Erro'], a: 1, w: '6,5 não é maior ou igual a 7.' },
    { t: 'order', q: 'Ordene os argumentos do PROCV:', items: ['Valor procurado', 'Tabela (matriz)', 'Número da coluna de retorno', 'FALSO para correspondência exata'], w: 'PROCV(valor; tabela; coluna; FALSO).' },
    { q: 'O erro #DIV/0! aparece quando:', o: ['A célula está vazia', 'Uma fórmula divide por zero', 'O texto é longo', 'Falta memória'], a: 1, w: 'Trate com SEERRO ou SE.' },
    { q: 'Para somar os valores de B2:B50 apenas quando a cidade em A2:A50 é “Brasília”:', o: ['=SOMA(B2:B50)', '=SOMASE(A2:A50;"Brasília";B2:B50)', '=CONT.SE(A2:A50;"Brasília")', '=PROCV("Brasília";A2:B50;2;FALSO)'], a: 1, w: 'SOMASE(intervalo do critério; critério; intervalo da soma).' }
  ],
  lessons: [
    {
      id: 'xl1', title: 'A planilha por dentro', min: { b: 15, i: 15, a: 15 },
      b: [
        ['an', '🔲', 'Um tabuleiro de batalha naval', "A planilha é um tabuleiro gigante. As **colunas** têm letras (A, B, C...) e as **linhas** têm números (1, 2, 3...). Cada quadradinho é uma **célula**, e o nome dela é letra + número: **B3** é coluna B, linha 3."],
        ['sheet', 'Experimente: toque numa célula', [['Produto', 'Quantidade', 'Preço'], ['Pão', '10', '0,75'], ['Leite', '2', '5,49'], ['Café', '1', '22,9']], "Toque em uma célula, veja o nome dela no canto (A1, B2...), digite algo na barra **fx** e aperte OK."],
        ['tip', "Números no Excel em português usam vírgula para decimais: 5,49. Datas: 11/10/2026."]
      ],
      i: [
        ['list', 'Navegação rápida', ['Ctrl + setas: pula para o fim dos dados', 'Ctrl + Shift + setas: seleciona até o fim', 'Ctrl + Home: volta para A1', 'F2: editar a célula', 'Ctrl + ; insere a data de hoje', 'Alt + Enter: quebra de linha dentro da célula']],
        ['tbl', 'Formatos de número', ['Formato', 'Exemplo', 'Uso'], [['Moeda', 'R$ 1.234,50', 'valores financeiros'], ['Porcentagem', '12,5%', 'taxas, metas'], ['Data', '11/10/2026', 'vencimentos'], ['Texto', '00123', 'CPF, CEP (não perder zeros)'], ['Número', '1.234,50', 'quantidades']]],
        ['tip', "O valor da célula e o que ela mostra podem ser diferentes: 0,125 formatado como % aparece 12,5%."]
      ],
      a: [
        ['list', 'Estrutura de dados que funciona', ['Uma linha por registro, uma coluna por atributo', 'Cabeçalho em uma única linha, sem células mescladas', 'Nada de linhas em branco no meio dos dados', 'Datas como datas de verdade (não texto)', 'Separar dados (aba Base) de relatórios (abas de análise)']],
        ['t', 'Datas são números', "Internamente, 1 = 01/01/1900 e cada dia soma 1. Por isso `=B2-A2` dá dias entre datas e `=HOJE()-vencimento` dá dias de atraso. Horas são frações do dia (12:00 = 0,5)."]
      ],
      rec: ['Colunas têm letras, linhas têm números, célula é letra+número (B3)', 'Decimais com vírgula no Excel em português', 'Formato muda a aparência, não o valor', 'Uma linha por registro e uma coluna por informação', 'Datas são números: subtrair dá dias'],
      quiz: [
        { lv: '*', q: 'Como se chama a célula da coluna C, linha 5?', o: ['5C', 'C5', 'CC5', 'L5C3'], a: 1, w: 'Letra da coluna + número da linha.' },
        { lv: '*', t: 'tf', q: 'No Excel em português, 5,49 usa vírgula como separador decimal.', a: true, w: 'Ponto separa milhar: 1.234,50.' },
        { lv: 'b', q: 'As colunas da planilha são identificadas por:', o: ['Números', 'Letras', 'Cores', 'Emojis'], a: 1, w: 'A, B, C... e as linhas por números.' },
        { lv: 'b', t: 'fill', q: 'A primeira célula da planilha se chama ___', ans: ['a1'], w: 'Coluna A, linha 1.' },
        { lv: 'i', q: 'Para guardar um CEP sem perder o zero inicial, formate como:', o: ['Número', 'Texto', 'Moeda', 'Porcentagem'], a: 1, w: 'Como número, 01234 vira 1234.' },
        { lv: 'i', q: 'Qual atalho insere a data de hoje?', o: ['Ctrl + ;', 'Ctrl + D', 'F5', 'Alt + H'], a: 0, w: 'Ctrl+; data; Ctrl+Shift+; hora.' },
        { lv: 'a', q: 'Por que evitar células mescladas na base de dados?', o: ['Ficam feias', 'Quebram filtros, ordenação e tabelas dinâmicas', 'Gastam memória', 'Não imprimem'], a: 1, w: 'Base tabular sem mesclagem.' },
        { lv: 'a', t: 'tf', q: 'Subtrair duas datas no Excel retorna a quantidade de dias entre elas.', a: true, w: 'Datas são números seriais.' }
      ],
      lab: { lang: 'xls', task: 'Na célula **D2**, escreva uma fórmula que some a quantidade de B2 com C2. (Comece com `=`.)', grid: [['Item', 'Manhã', 'Tarde', 'Total'], ['Pães vendidos', '120', '85', '']], targets: ['D2'], sol: { D2: '=B2+C2' }, hint: 'Digite =B2+C2 na barra fx com a célula D2 selecionada e aperte OK.' }
    },
    {
      id: 'xl2', title: 'Fórmulas, referências e o $', min: { b: 18, i: 18, a: 18 },
      b: [
        ['an', '🧮', 'Uma calculadora que lembra', "Fórmula é uma conta que começa com **=**. Em vez de números, você usa o nome das células: `=B2*C2` multiplica o que estiver em B2 pelo que estiver em C2. Mudou o número? A conta muda sozinha!"],
        ['tbl', 'Sinais de conta', ['Sinal', 'Conta', 'Exemplo'], [['+', 'somar', '=A1+A2'], ['-', 'subtrair', '=A1-A2'], ['*', 'multiplicar', '=A1*A2'], ['/', 'dividir', '=A1/A2'], ['^', 'potência', '=A1^2'], ['%', 'porcentagem', '=A1*10%']]],
        ['sheet', 'Veja a mágica: mude a quantidade', [['Produto', 'Qtd', 'Preço', 'Total'], ['Pão', '10', '0,75', '=B2*C2'], ['Leite', '2', '5,49', '=B3*C3'], ['Café', '1', '22,9', '=B4*C4'], ['', '', 'Soma', '=D2+D3+D4']], "Troque a quantidade de pães (B2) para 20 e veja o total mudar sozinho.", ['D2']]
      ],
      i: [
        ['t', 'Copiar fórmula para baixo', "Escreva a fórmula na primeira linha e copie para baixo (no Excel: clique duplo na alcinha do canto da célula). As referências se ajustam: `=B2*C2` vira `=B3*C3`, `=B4*C4`... Isso é **referência relativa**."],
        ['t', 'O cifrão trava a referência', "Às vezes uma célula não pode andar: uma taxa em F1 usada por todas as linhas. Escreva `$F$1` (F4 no Excel alterna os cifrões). `$F1` trava só a coluna; `F$1` trava só a linha."],
        ['sheet', 'Experimente o $', [['Cliente', 'Valor', 'Com juros', '', 'Taxa'], ['Ana', '1000', '=B2*(1+$E$2)', '', '2%'], ['Bruno', '850', '', '', ''], ['Carla', '3100', '', '', '']], "Selecione C2 e toque em **Copiar para baixo**. Repare que `B2` vira `B3`, mas `$E$2` continua fixo.", ['C2']]
      ],
      a: [
        ['list', 'Ordem das operações e armadilhas', ['Precedência: ( ) → % → ^ → * / → + − → & → comparações', '`=-2^2` dá 4 no Excel (o sinal negativo vem antes da potência)', 'Referências 3D: `=SOMA(Jan:Dez!B2)` soma B2 de todas as abas entre Jan e Dez', 'Nomes definidos (Fórmulas → Gerenciador de Nomes): `=Valor*Taxa` fica legível', 'Erros comuns: #REF! (célula apagada), #VALOR! (texto em conta), #NOME? (função escrita errada)']],
        ['t', 'Matrizes dinâmicas', "No Excel 365, uma fórmula pode devolver vários valores que “transbordam” para as células vizinhas: `=FILTRO(A2:D100;D2:D100=\"vencido\")` ou `=ÚNICO(B2:B100)`. Se algo bloquear o espaço, aparece #DESPEJAR!."]
      ],
      rec: ['Fórmula começa com = e usa nomes de células', 'Mudou o número, a conta atualiza sozinha', 'Copiar para baixo ajusta as referências (relativas)', '$ trava a referência: $E$2 não anda', 'Parênteses definem a ordem das contas'],
      quiz: [
        { lv: '*', q: 'Qual sinal multiplica no Excel?', o: ['x', '*', '#', '·'], a: 1, w: '* multiplica, / divide.' },
        { lv: '*', t: 'fill', q: 'Fórmula que multiplica B2 por C2:', ans: ['=b2*c2', '=c2*b2'], ph: '=...', w: '=B2*C2.' },
        { lv: 'b', t: 'tf', q: 'Se você mudar um número usado numa fórmula, o resultado atualiza sozinho.', a: true, w: 'Essa é a grande vantagem da planilha.' },
        { lv: 'b', q: '`=10+5*2` resulta em:', o: ['30', '20', '25', '17'], a: 1, w: 'Multiplicação antes da soma: 10 + 10.' },
        { lv: 'i', q: 'Ao copiar `=B2*$E$2` uma linha para baixo, vira:', o: ['=B3*$E$3', '=B3*$E$2', '=B2*$E$2', '=C2*$E$2'], a: 1, w: 'B2 é relativa; $E$2 é absoluta.' },
        { lv: 'i', q: 'Qual tecla alterna os cifrões numa referência no Excel?', o: ['F4', 'F2', 'F9', 'F1'], a: 0, w: 'F4 cicla entre $A$1, A$1, $A1 e A1.' },
        { lv: 'a', q: 'O erro #REF! geralmente indica:', o: ['Divisão por zero', 'Referência a uma célula que foi apagada', 'Função inexistente', 'Texto longo'], a: 1, w: 'A fórmula aponta para algo que não existe mais.' },
        { lv: 'a', t: 'order', q: 'Ordene da maior para a menor prioridade:', items: ['Parênteses', 'Potência ^', 'Multiplicação *', 'Soma +'], w: 'Como na matemática.' }
      ],
      lab: { lang: 'xls', task: 'Calcule o **Total** (Qtd × Preço) em D2, D3 e D4. Dica: escreva em D2 e use **Copiar para baixo**.', grid: [['Produto', 'Qtd', 'Preço', 'Total'], ['Bolo', '3', '28', ''], ['Croissant', '12', '9,5', ''], ['Suco', '5', '12', '']], targets: ['D2', 'D3', 'D4'], sol: { D2: '=B2*C2', D3: '=B3*C3', D4: '=B4*C4' }, hint: 'Em D2: =B2*C2. Depois selecione D2 e toque em “Copiar para baixo”.' }
    },
    {
      id: 'xl3', title: 'Funções essenciais', min: { b: 18, i: 18, a: 18 },
      b: [
        ['an', '🪄', 'Funções são atalhos prontos', "Somar 100 células com + seria cansativo. A **função** SOMA faz isso: `=SOMA(B2:B101)`. O `:` quer dizer **até**: de B2 até B101."],
        ['tbl', 'As 5 funções do dia a dia', ['Função', 'Faz', 'Exemplo'], [['SOMA', 'soma tudo', '=SOMA(B2:B10)'], ['MÉDIA', 'média', '=MÉDIA(B2:B10)'], ['MÁXIMO', 'maior valor', '=MÁXIMO(B2:B10)'], ['MÍNIMO', 'menor valor', '=MÍNIMO(B2:B10)'], ['CONT.NÚM', 'quantos números', '=CONT.NÚM(B2:B10)']]],
        ['sheet', 'Teste as funções', [['Dia', 'Vendas'], ['Seg', '1200'], ['Ter', '850'], ['Qua', '3100'], ['Qui', '430'], ['Sex', '990'], ['Total', '=SOMA(B2:B6)'], ['Média', '=MÉDIA(B2:B6)'], ['Melhor dia', '=MÁXIMO(B2:B6)']], "Mude as vendas e veja total, média e máximo se ajustarem."]
      ],
      i: [
        ['tbl', 'Mais funções úteis', ['Função', 'Exemplo', 'Resultado'], [['ARRED', '=ARRED(10/3;2)', '3,33'], ['CONT.VALORES', '=CONT.VALORES(A2:A50)', 'células não vazias'], ['CONTAR.VAZIO', '=CONTAR.VAZIO(C2:C50)', 'células vazias'], ['HOJE', '=HOJE()', 'data atual'], ['MAIÚSCULA', '=MAIÚSCULA(A2)', 'ANA SOUZA'], ['ARRUMAR', '=ARRUMAR(A2)', 'tira espaços extras'], ['CONCATENAR ou &', '=A2&" - "&B2', 'junta textos']]],
        ['tip', "Comece a digitar `=SO` e o Excel sugere SOMA: aperte Tab para completar."]
      ],
      a: [
        ['list', 'Funções modernas (Excel 365)', ['SOMARPRODUTO para somas ponderadas: `=SOMARPRODUTO(Qtd;Preço)`', 'ÚNICO, CLASSIFICAR, FILTRO devolvem listas inteiras', 'LET dá nomes a partes da fórmula: `=LET(t;SOMA(B:B);t*1,1)`', 'LAMBDA cria suas próprias funções sem VBA', 'TEXTO formata números dentro de textos: `=TEXTO(B2;"R$ #.##0,00")`']],
        ['t', 'Média x mediana', "MÉDIA é distorcida por valores extremos; MED (mediana) mostra o valor típico. Em atrasos de pagamento, com um cliente devendo há 300 dias, a mediana de dias de atraso conta uma história mais honesta."]
      ],
      rec: ['Funções são atalhos prontos: SOMA, MÉDIA, MÁXIMO, MÍNIMO', 'Dois-pontos significa “até”: B2:B10', 'ARRED controla as casas decimais', '& ou CONCATENAR juntam textos', 'Mediana resiste a valores extremos melhor que a média'],
      quiz: [
        { lv: '*', q: 'Qual fórmula soma de B2 até B10?', o: ['=SOMA(B2;B10)', '=SOMA(B2:B10)', '=B2+B10', '=SOMA B2-B10'], a: 1, w: 'B2:B10 é o intervalo inteiro.' },
        { lv: '*', t: 'fill', q: 'Função que encontra o maior valor: =___(B2:B10)', ans: ['maximo', 'máximo', 'max'], w: 'MÁXIMO.' },
        { lv: 'b', t: 'tf', q: 'O sinal : (dois-pontos) num intervalo significa “até”.', a: true, w: 'A1:A5 = de A1 até A5.' },
        { lv: 'b', q: 'A média de 4, 6 e 8 é:', o: ['18', '6', '8', '4'], a: 1, w: '18 ÷ 3.' },
        { lv: 'i', q: '`=ARRED(2,567;1)` resulta em:', o: ['2,5', '2,6', '3', '2,57'], a: 1, w: 'Arredonda para 1 casa.' },
        { lv: 'i', q: 'Para juntar nome (A2) e sobrenome (B2) com espaço:', o: ['=A2+B2', '=A2&" "&B2', '=SOMA(A2;B2)', '=A2 B2'], a: 1, w: '& concatena textos.' },
        { lv: 'a', q: 'Total de vendas = soma de Qtd × Preço linha a linha numa só fórmula:', o: ['=SOMA(Qtd)*SOMA(Preço)', '=SOMARPRODUTO(Qtd;Preço)', '=MÉDIA(Qtd;Preço)', '=PROCV(Qtd;Preço)'], a: 1, w: 'Multiplica par a par e soma.' },
        { lv: 'a', t: 'tf', q: 'A média é sempre o melhor resumo de um conjunto de valores.', a: false, w: 'Com valores extremos, prefira a mediana (MED).' }
      ],
      lab: { lang: 'xls', task: 'Preencha: **B7** com o total das vendas, **B8** com a média e **B9** com a menor venda (use funções).', grid: [['Dia', 'Vendas'], ['Seg', '1200'], ['Ter', '850'], ['Qua', '3100'], ['Qui', '430'], ['Sex', '990'], ['Total', ''], ['Média', ''], ['Menor', '']], targets: ['B7', 'B8', 'B9'], sol: { B7: '=SOMA(B2:B6)', B8: '=MÉDIA(B2:B6)', B9: '=MÍNIMO(B2:B6)' }, hint: '=SOMA(B2:B6), =MÉDIA(B2:B6) e =MÍNIMO(B2:B6).' }
    },
    {
      id: 'xl4', title: 'Decisões com SE, E e OU', min: { b: 18, i: 18, a: 20 },
      b: [
        ['an', '🚦', 'O semáforo da planilha', "A função **SE** decide: “SE a nota for maior ou igual a 7, escreva Aprovado; SENÃO, escreva Reprovado”.\n`=SE(B2>=7;\"Aprovado\";\"Reprovado\")`\nSão 3 partes: a pergunta; o que fazer se sim; o que fazer se não."],
        ['sheet', 'Mude as notas', [['Aluno', 'Nota', 'Situação'], ['Ana', '8,5', '=SE(B2>=7;"Aprovado";"Reprovado")'], ['Bia', '6', '=SE(B3>=7;"Aprovado";"Reprovado")'], ['Caio', '7', '=SE(B4>=7;"Aprovado";"Reprovado")']], "Troque a nota da Bia para 9 e veja a situação mudar."],
        ['tip', "Texto dentro de fórmula vai entre aspas: \"Aprovado\". Números não."]
      ],
      i: [
        ['tbl', 'Combinando condições', ['Fórmula', 'Lê-se'], [['=SE(E(B2>=7;C2>=75%);"Aprovado";"Reprovado")', 'nota ≥ 7 E frequência ≥ 75%'], ['=SE(OU(D2="vencido";D2="protesto");"Cobrar";"OK")', 'um OU outro'], ['=SE(B2>1000;B2*5%;0)', 'comissão só acima de 1000'], ['=SEERRO(A2/B2;0)', 'se der erro, mostre 0']]],
        ['sheet', 'Multa só para vencidos', [['Cliente', 'Valor', 'Status', 'Multa 2%'], ['Ana', '1200', 'pago', '=SE(C2="vencido";B2*2%;0)'], ['Bruno', '850', 'vencido', '=SE(C3="vencido";B3*2%;0)'], ['Diego', '430', 'vencido', '=SE(C4="vencido";B4*2%;0)']], "Mude o status da Ana para vencido."]
      ],
      a: [
        ['list', 'SE aninhado x SES x PROCV', ['SE dentro de SE vira labirinto depois de 3 níveis', '`=SES(B2>=9;"A";B2>=7;"B";B2>=5;"C";VERDADEIRO;"D")` testa em sequência', 'Faixas grandes (tabela de comissão, IR): PROCV com correspondência aproximada numa tabela de faixas', 'Regras de negócio em tabela auxiliar facilitam manutenção', 'SEERRO esconde erros: use com cuidado para não mascarar dados ruins']],
        ['t', 'Lógica booleana na planilha', "VERDADEIRO vale 1 e FALSO vale 0 em contas: `=SOMARPRODUTO((D2:D100=\"vencido\")*(B2:B100))` soma valores vencidos sem SOMASE. É a base de fórmulas de matriz poderosas."]
      ],
      rec: ['SE tem 3 partes: pergunta; se sim; se não', 'Texto vai entre aspas; números não', 'E exige todas as condições; OU, pelo menos uma', 'SEERRO troca erros por um valor', 'Muitas faixas: prefira SES ou tabela com PROCV'],
      quiz: [
        { lv: '*', q: '`=SE(B2>=7;"Aprovado";"Reprovado")` com B2 = 8 retorna:', o: ['Reprovado', 'Aprovado', '8', 'Erro'], a: 1, w: '8 ≥ 7 é verdadeiro.' },
        { lv: '*', t: 'tf', q: 'Dentro de fórmulas, textos devem ficar entre aspas.', a: true, w: '"Aprovado".' },
        { lv: 'b', t: 'order', q: 'Ordene as partes da função SE:', items: ['A pergunta (teste)', 'O valor se for verdadeiro', 'O valor se for falso'], w: 'SE(teste; sim; não).' },
        { lv: 'b', q: 'Quantas partes tem a função SE?', o: ['1', '2', '3', '5'], a: 2, w: 'Teste; se sim; se não.' },
        { lv: 'i', q: 'Aprovado só se nota ≥ 7 E frequência ≥ 75%. Use:', o: ['OU', 'E', 'SEERRO', 'SOMA'], a: 1, w: 'E exige as duas.' },
        { lv: 'i', t: 'fill', q: 'Complete para mostrar 0 se a divisão der erro: =___(A2/B2;0)', ans: ['seerro', 'iferror'], w: 'SEERRO.' },
        { lv: 'a', q: 'Para classificar notas em A, B, C, D sem SE aninhado:', o: ['SES', 'SOMA', 'CONT.SE', 'ARRED'], a: 0, w: 'SES testa várias condições em sequência.' },
        { lv: 'a', t: 'tf', q: 'Em contas, VERDADEIRO vale 1 e FALSO vale 0.', a: true, w: 'Permite somas condicionais com SOMARPRODUTO.' }
      ],
      lab: { lang: 'xls', task: 'Em **D2:D4**, mostre "Atrasado" se os dias de atraso (C) forem maiores que 0, senão "Em dia".', grid: [['Cliente', 'Valor', 'Dias de atraso', 'Situação'], ['Ana', '1200', '0', ''], ['Bruno', '850', '12', ''], ['Gabi', '430', '40', '']], targets: ['D2', 'D3', 'D4'], sol: { D2: '=SE(C2>0;"Atrasado";"Em dia")', D3: '=SE(C3>0;"Atrasado";"Em dia")', D4: '=SE(C4>0;"Atrasado";"Em dia")' }, hint: '=SE(C2>0;"Atrasado";"Em dia") e copie para baixo.' }
    },
    {
      id: 'xl5', title: 'Contar e somar com critério', min: { b: 18, i: 18, a: 20 },
      b: [
        ['an', '🧺', 'Separar as frutas', "Numa cesta com maçãs e bananas, quantas maçãs tem? **CONT.SE** conta só o que obedece à regra. **SOMASE** soma só o que obedece à regra."],
        ['sheet', 'Contando e somando por status', [['Cliente', 'Valor', 'Status'], ['Ana', '1200', 'pago'], ['Bruno', '850', 'vencido'], ['Carla', '3100', 'pago'], ['Diego', '430', 'vencido'], ['', '', ''], ['Qtd vencidos', '=CONT.SE(C2:C5;"vencido")', ''], ['Valor vencido', '=SOMASE(C2:C5;"vencido";B2:B5)', '']], "Mude o status da Carla para vencido."]
      ],
      i: [
        ['tbl', 'Critérios', ['Critério', 'Significa'], [['"vencido"', 'igual a vencido'], ['">1000"', 'maior que 1000'], ['"<>pago"', 'diferente de pago'], ['"Ana*"', 'começa com Ana'], ['">"&F1', 'maior que o valor em F1'], ['""', 'vazio']]],
        ['code', 'text', `=CONT.SES(C2:C100;"vencido";E2:E100;"Brasília")
=SOMASES(B2:B100;C2:C100;"vencido";E2:E100;"Brasília")
=MÉDIASE(C2:C100;"pago";B2:B100)`, "Com várias condições: CONT.SES e SOMASES. Repare que no SOMASES o intervalo da soma vem primeiro."]
      ],
      a: [
        ['list', 'Relatórios dinâmicos', ['Critérios em células (F1 = mês escolhido) deixam o relatório interativo', 'Datas: `=SOMASES(B:B;A:A;">="&DATA(2026;10;1);A:A;"<"&DATA(2026;11;1))`', 'Intervalos de tamanho igual são obrigatórios nas funções SES', 'Para muitos critérios e cortes, a Tabela Dinâmica é mais rápida de montar', 'Em bases muito grandes, Power Pivot/DAX escala melhor']]
      ],
      rec: ['CONT.SE conta o que obedece a uma regra', 'SOMASE soma só o que obedece à regra', 'Critérios usam aspas: ">1000", "<>pago"', 'Várias condições: CONT.SES e SOMASES', 'No SOMASES o intervalo da soma vem primeiro'],
      quiz: [
        { lv: '*', q: 'Para contar quantos clientes estão “vencido”:', o: ['=SOMA(C2:C50)', '=CONT.SE(C2:C50;"vencido")', '=MÉDIA(C2:C50)', '=SE(C2="vencido")'], a: 1, w: 'CONT.SE(intervalo; critério).' },
        { lv: '*', t: 'tf', q: 'SOMASE soma apenas os valores que atendem a um critério.', a: true, w: 'SOMASE(intervalo critério; critério; intervalo soma).' },
        { lv: 'b', q: 'CONT.SE serve para:', o: ['Somar tudo', 'Contar só o que obedece a uma regra', 'Achar o maior', 'Arredondar'], a: 1, w: 'Contagem condicional.' },
        { lv: 'b', t: 'fill', q: 'Critério para valores maiores que 1000: "___"', ans: ['>1000', '">1000"'], w: 'Operador e número dentro das aspas.' },
        { lv: 'i', q: 'Critério “diferente de pago”:', o: ['"!pago"', '"<>pago"', '"não pago"', '"-pago"'], a: 1, w: '<> é diferente.' },
        { lv: 'i', t: 'order', q: 'Ordene os argumentos do SOMASES:', items: ['Intervalo da soma', 'Intervalo do critério 1', 'Critério 1'], w: 'No SOMASES a soma vem primeiro.' },
        { lv: 'a', q: 'Para somar só valores de outubro/2026 na coluna B com datas em A:', o: ['=SOMASES(B:B;A:A;">="&DATA(2026;10;1);A:A;"<"&DATA(2026;11;1))', '=SOMA(B:B;"outubro")', '=CONT.SE(A:A;10)', '=PROCV(10;A:B;2)'], a: 0, w: 'Intervalo semiaberto de datas.' },
        { lv: 'a', t: 'tf', q: 'Nas funções SES, os intervalos precisam ter o mesmo tamanho.', a: true, w: 'Senão retorna #VALOR!.' }
      ],
      lab: { lang: 'xls', task: 'Em **B7** conte quantos pedidos são de **Brasília**; em **B8** some o valor dos pedidos de **Brasília**.', grid: [['Cidade', 'Valor'], ['Brasília', '1200'], ['Planaltina', '850'], ['Brasília', '3100'], ['Goiânia', '430'], ['Brasília', '990'], ['Qtd Brasília', ''], ['Total Brasília', '']], targets: ['B7', 'B8'], sol: { B7: '=CONT.SE(A2:A6;"Brasília")', B8: '=SOMASE(A2:A6;"Brasília";B2:B6)' }, hint: '=CONT.SE(A2:A6;"Brasília") e =SOMASE(A2:A6;"Brasília";B2:B6)' }
    },
    {
      id: 'xl6', title: 'Procurar dados: PROCV, PROCX, ÍNDICE', min: { b: 18, i: 20, a: 20 },
      b: [
        ['an', '📇', 'A agenda que busca pelo nome', "Você tem uma lista de clientes com telefone. Quer o telefone da Carla? O **PROCV** procura “Carla” na primeira coluna e devolve a informação de outra coluna da mesma linha."],
        ['sheet', 'Procurando o valor da Carla', [['Cliente', 'Cidade', 'Valor'], ['Ana', 'Brasília', '1200'], ['Bruno', 'Planaltina', '850'], ['Carla', 'Goiânia', '3100'], ['', '', ''], ['Buscar:', 'Carla', ''], ['Valor:', '=PROCV(B6;A2:C4;3;FALSO)', '']], "Troque “Carla” em B6 por “Bruno” e veja o valor mudar."]
      ],
      i: [
        ['t', 'PROCV em 4 partes', "`=PROCV(o que procurar; onde procurar; número da coluna; FALSO)`\nO valor tem que estar na **primeira coluna** da tabela. O número da coluna conta a partir da primeira (1, 2, 3...). FALSO = busca exata (use quase sempre)."],
        ['code', 'text', `=PROCX(B6; A2:A100; C2:C100; "não encontrado")
=ÍNDICE(C2:C100; CORRESP(B6; A2:A100; 0))`, "PROCX (Excel 365) é mais simples: procura numa coluna e retorna de outra, em qualquer posição, com valor padrão. ÍNDICE+CORRESP funciona em qualquer versão."],
        ['tip', "#N/D significa “não encontrado”: confira espaços extras (use ARRUMAR) e se número não está guardado como texto."]
      ],
      a: [
        ['list', 'Buscas de profissional', ['Correspondência aproximada (VERDADEIRO) com tabela ordenada para faixas: comissão, IR, frete', 'Busca por duas chaves: coluna auxiliar `=A2&"|"&B2` ou PROCX com matriz `(A:A=x)*(B:B=y)`', 'PROCX retorna várias colunas de uma vez e busca de baixo para cima (último registro)', 'Evite colunas inteiras em bases gigantes com fórmulas voláteis', 'Para cruzar bases grandes, Power Query (Mesclar Consultas) é mais robusto']]
      ],
      rec: ['PROCV procura na primeira coluna e devolve de outra coluna da mesma linha', 'PROCV(valor; tabela; coluna; FALSO)', 'FALSO = correspondência exata', 'PROCX procura em qualquer coluna e aceita valor padrão', '#N/D = não encontrado: confira espaços e tipos'],
      quiz: [
        { lv: '*', q: 'No PROCV, onde o valor procurado precisa estar?', o: ['Na última coluna', 'Na primeira coluna da tabela', 'Em qualquer célula', 'Na linha 1'], a: 1, w: 'Limitação clássica do PROCV.' },
        { lv: '*', t: 'tf', q: 'O erro #N/D no PROCV significa que o valor não foi encontrado.', a: true, w: 'Não disponível.' },
        { lv: 'b', q: 'Para achar o telefone de um cliente pelo nome, use:', o: ['SOMA', 'PROCV', 'MÉDIA', 'ARRED'], a: 1, w: 'Busca vertical.' },
        { lv: 'b', t: 'order', q: 'Ordene as partes do PROCV:', items: ['O que procurar', 'Onde procurar (tabela)', 'Número da coluna', 'FALSO'], w: 'PROCV(valor; tabela; coluna; FALSO).' },
        { lv: 'i', q: '`=PROCV("Bruno";A2:C10;3;FALSO)` retorna:', o: ['A coluna A', 'O valor da coluna C na linha do Bruno', 'O número 3', 'Bruno'], a: 1, w: 'Terceira coluna da tabela.' },
        { lv: 'i', t: 'fill', q: 'Função para limpar espaços extras antes de buscar: =___(A2)', ans: ['arrumar', 'trim'], w: 'ARRUMAR.' },
        { lv: 'a', q: 'Qual combinação busca à esquerda em qualquer versão do Excel?', o: ['ÍNDICE + CORRESP', 'SOMA + SE', 'CONT.SE + MÉDIA', 'ARRED + INT'], a: 0, w: 'CORRESP acha a linha; ÍNDICE devolve o valor.' },
        { lv: 'a', q: 'Para tabela de comissão por faixas de venda, use PROCV com:', o: ['FALSO', 'VERDADEIRO (aproximado) e tabela ordenada', 'Texto', 'Zero'], a: 1, w: 'Retorna a faixa imediatamente inferior.' }
      ],
      lab: { lang: 'xls', task: 'Em **B8**, use PROCV para trazer a **cidade** do cliente escrito em B7. Em **B9**, traga o **valor**.', grid: [['Cliente', 'Cidade', 'Valor'], ['Ana', 'Brasília', '1200'], ['Bruno', 'Planaltina', '850'], ['Carla', 'Goiânia', '3100'], ['Diego', 'Brasília', '430'], ['', '', ''], ['Buscar', 'Diego', ''], ['Cidade', '', ''], ['Valor', '', '']], targets: ['B8', 'B9'], sol: { B8: '=PROCV(B7;A2:C5;2;FALSO)', B9: '=PROCV(B7;A2:C5;3;FALSO)' }, hint: '=PROCV(B7;A2:C5;2;FALSO) e =PROCV(B7;A2:C5;3;FALSO)' }
    }
  ]
});
