CC.tracks.push({
  id: 'langs', ord: 6.5, name: 'Panorama das Linguagens', short: 'Linguagens', glyph: 'λ', hue: 250,
  desc: 'Java, C#, C e C++, Go, Rust, PHP, Kotlin, Swift e Dart: para que serve cada uma e como escolher.',
  test: [
    { d: 1, q: 'Qual linguagem é usada principalmente para apps de iPhone?', o: ['Swift', 'PHP', 'SQL', 'COBOL'], a: 0 },
    { d: 1, q: 'O WordPress é feito principalmente em:', o: ['PHP', 'Rust', 'Swift', 'Go'], a: 0 },
    { d: 2, q: 'Java e C# rodam sobre:', o: ['Máquinas virtuais (JVM e .NET CLR)', 'Só no navegador', 'Excel', 'Nada'], a: 0 },
    { d: 2, q: 'Linguagem criada no Google, popular em servidores e ferramentas de nuvem como Docker e Kubernetes:', o: ['Go', 'Ruby', 'Perl', 'Pascal'], a: 0 },
    { d: 3, q: 'Rust se destaca por:', o: ['Segurança de memória sem coletor de lixo', 'Ser interpretada', 'Rodar só no Windows', 'Não ter tipos'], a: 0 },
    { d: 3, q: 'Compilação para bytecode + JIT acontece em:', o: ['Java/C#', 'HTML', 'CSS', 'SQL puro'], a: 0 }
  ],
  exam: [
    { q: 'Para um sistema bancário corporativo grande, linguagens tradicionais são:', o: ['Java e C#', 'HTML e CSS', 'Bash', 'Markdown'], a: 0, w: 'Ecossistemas maduros e tipagem estática.' },
    { t: 'tf', q: 'Aprender a lógica em uma linguagem facilita muito aprender outras.', a: true, w: 'Variáveis, condições, laços e funções existem em todas.' },
    { t: 'order', q: 'Ordene do nível mais baixo (perto do hardware) ao mais alto:', items: ['Assembly', 'C', 'Java', 'Python'], w: 'Quanto mais alto, mais abstração.' },
    { t: 'fill', q: 'Linguagem oficial moderna para Android: ___', ans: ['kotlin'], w: 'Kotlin.' },
    { q: 'Para apps multiplataforma com Flutter, a linguagem é:', o: ['Dart', 'Swift', 'PHP', 'R'], a: 0, w: 'Dart.' }
  ],
  lessons: [
    {
      id: 'lang1', title: 'Mapa das linguagens', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🗣️', 'Idiomas diferentes, mesma ideia', "Português, inglês e espanhol dizem as mesmas coisas com palavras diferentes. Linguagens de programação também: quase todas têm variáveis, decisões (se), repetições e funções. Quem aprende uma, aprende as outras mais rápido."],
        ['tbl', 'Cada linguagem tem sua casa', ['Linguagem', 'Mora em'], [['JavaScript/TypeScript', 'sites e apps web'], ['Python', 'dados, IA, automação'], ['Java / Kotlin', 'Android e sistemas de empresas'], ['C#', 'sistemas Windows, jogos (Unity)'], ['Swift', 'iPhone e Mac'], ['PHP', 'sites (WordPress, Laravel)'], ['SQL', 'bancos de dados']]]
      ],
      i: [
        ['code', 'text', `Python:      print("Olá")
JavaScript:  console.log("Olá");
Java:        System.out.println("Olá");
C#:          Console.WriteLine("Olá");
Go:          fmt.Println("Olá")
Rust:        println!("Olá");
PHP:         echo "Olá";
Kotlin:      println("Olá")
Swift:       print("Olá")`, "O mesmo programa em 9 linguagens: muda a escrita, a ideia é igual."],
        ['tbl', 'Como escolher', ['Objetivo', 'Comece por'], [['Primeira linguagem e automação', 'Python'], ['Web completo', 'JavaScript/TypeScript'], ['Emprego em grandes empresas/bancos', 'Java ou C#'], ['Apps mobile', 'Kotlin/Swift ou Flutter/React Native'], ['Jogos', 'C# (Unity) ou C++ (Unreal)'], ['Infra e performance', 'Go ou Rust']]]
      ],
      a: [
        ['tbl', 'Eixos técnicos', ['Eixo', 'Exemplos'], [['Compilada nativa', 'C, C++, Rust, Go'], ['VM + JIT', 'Java, Kotlin, C#'], ['Interpretada/JIT', 'Python, JavaScript, PHP, Ruby'], ['Tipagem estática', 'Java, C#, Go, Rust, TypeScript'], ['Coleta de lixo', 'Java, C#, Go, Python, JS'], ['Gerência manual/ownership', 'C, C++ (manual), Rust (ownership)']]],
        ['t', 'Concorrência por linguagem', "Go: goroutines e canais. Java 21+: virtual threads. C#: async/await maduro. Rust: async + garantias de ausência de data race em tempo de compilação. JavaScript/Python: event loop/asyncio para I/O, workers/processos para CPU."]
      ],
      rec: ['Todas as linguagens têm variáveis, decisões, laços e funções', 'Cada linguagem tem um território: web, dados, mobile, sistemas', 'Python e JavaScript são ótimas primeiras linguagens', 'Java e C# dominam sistemas corporativos', 'Go e Rust brilham em infraestrutura e performance'],
      quiz: [
        { lv: '*', q: 'Qual é a linguagem dos bancos de dados?', o: ['SQL', 'Swift', 'Dart', 'Kotlin'], a: 0, w: 'SQL.' },
        { lv: '*', t: 'tf', q: 'Quem aprende bem uma linguagem tem mais facilidade para aprender outras.', a: true, w: 'Os conceitos se repetem.' },
        { lv: 'b', q: 'Para criar sites e apps web, a linguagem central é:', o: ['JavaScript', 'COBOL', 'Fortran', 'Assembly'], a: 0, w: 'Roda nos navegadores.' },
        { lv: 'b', q: 'Para apps de iPhone:', o: ['Swift', 'PHP', 'SQL', 'R'], a: 0, w: 'Swift.' },
        { lv: 'i', t: 'fill', q: 'Em Java, imprimir na tela: System.out.___("Olá");', ans: ['println'], w: 'System.out.println.' },
        { lv: 'i', q: 'Para jogos na Unity, a linguagem é:', o: ['C#', 'PHP', 'SQL', 'Bash'], a: 0, w: 'C#.' },
        { lv: 'a', q: 'Qual garante ausência de data races em tempo de compilação?', o: ['Rust', 'Python', 'PHP', 'JavaScript'], a: 0, w: 'Sistema de ownership e borrowing.' },
        { lv: 'a', t: 'order', q: 'Ordene do menos para o mais abstrato:', items: ['Assembly', 'C', 'Java', 'Python'], w: 'Abstração cresce.' }
      ]
    },
    {
      id: 'lang2', title: 'Java, C# e o mundo corporativo', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🏦', 'As linguagens dos grandes prédios', "Bancos, seguradoras e governos usam muito **Java** e **C#**. São linguagens organizadas, com regras rígidas, ótimas para sistemas enormes que muitas pessoas mantêm por anos."]
      ],
      i: [
        ['code', 'java', `public class Cliente {
    private final String nome;
    private double saldo;

    public Cliente(String nome) { this.nome = nome; }

    public void depositar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("valor inválido");
        saldo += valor;
    }
    public double getSaldo() { return saldo; }
}`, "Java: tudo dentro de classes, tipos declarados, encapsulamento. Spring Boot é o framework web dominante."],
        ['code', 'cs', `public record Parcela(int Numero, decimal Valor, DateOnly Vencimento, bool Pago);

var vencidas = parcelas
    .Where(p => !p.Pago && p.Vencimento < DateOnly.FromDateTime(DateTime.Today))
    .OrderBy(p => p.Vencimento)
    .ToList();`, "C#: LINQ consulta coleções com uma sintaxe parecida com SQL; `decimal` é o tipo certo para dinheiro. ASP.NET Core para APIs."]
      ],
      a: [
        ['list', 'Ecossistemas', ['Java: Maven/Gradle, Spring Boot, Hibernate/JPA, JUnit, Kafka', 'C#: NuGet, ASP.NET Core, Entity Framework, xUnit, Azure', 'Ambos: injeção de dependência, testes, arquitetura em camadas', 'GraalVM e .NET Native AOT reduzem tempo de inicialização para containers', 'Kotlin roda na JVM e convive com Java no mesmo projeto']]
      ],
      rec: ['Java e C# dominam sistemas corporativos e bancos', 'Tudo fica dentro de classes, com tipos declarados', 'Spring Boot (Java) e ASP.NET Core (C#) criam APIs', 'decimal é o tipo certo para dinheiro em C#', 'LINQ consulta coleções parecido com SQL'],
      quiz: [
        { lv: '*', q: 'Onde Java e C# são muito usados?', o: ['Sistemas corporativos e bancos', 'Só em jogos de celular', 'Só em planilhas', 'Em nenhum lugar'], a: 0, w: 'Sistemas grandes e duradouros.' },
        { lv: '*', t: 'tf', q: 'Em Java, o código fica organizado dentro de classes.', a: true, w: 'Orientação a objetos.' },
        { lv: 'b', q: 'Por que empresas grandes gostam de Java e C#?', o: ['São organizadas e boas para sistemas grandes', 'São as mais curtas', 'Não precisam de computador', 'São só para jogos'], a: 0, w: 'Estrutura e ferramentas maduras.' },
        { lv: 'b', t: 'tf', q: 'C# é usado para criar jogos na Unity.', a: true, w: 'E sistemas Windows e web.' },
        { lv: 'i', q: 'Framework web mais popular em Java:', o: ['Spring Boot', 'Laravel', 'Django', 'Rails'], a: 0, w: 'Spring Boot.' },
        { lv: 'i', t: 'fill', q: 'Tipo do C# indicado para valores monetários: ___', ans: ['decimal'], w: 'Evita erros de ponto flutuante.' },
        { lv: 'a', q: 'Em C#, `.Where().OrderBy()` faz parte de:', o: ['LINQ', 'JDBC', 'Maven', 'Razor'], a: 0, w: 'Language Integrated Query.' },
        { lv: 'a', t: 'tf', q: 'Kotlin pode conviver com Java no mesmo projeto porque ambos rodam na JVM.', a: true, w: 'Interoperabilidade total.' }
      ]
    },
    {
      id: 'lang3', title: 'C, Go, Rust e PHP', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🔧', 'Ferramentas para trabalhos diferentes', "**C** é a linguagem dos motores: sistemas operacionais e aparelhos. **Go** e **Rust** são modernas, rápidas e usadas na nuvem. **PHP** move uma enorme parte dos sites, como o WordPress."]
      ],
      i: [
        ['code', 'go', `package main

import ("fmt"; "net/http")

func main() {
    http.HandleFunc("/saude", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "ok")
    })
    http.ListenAndServe(":8080", nil)
}`, "Go: um servidor web com a biblioteca padrão, compila para um binário único. Docker e Kubernetes são escritos em Go."],
        ['code', 'php', `<?php
$clientes = [["nome" => "Ana", "valor" => 1200], ["nome" => "Bruno", "valor" => 850]];
$total = array_sum(array_column($clientes, "valor"));
echo "Total: R$ " . number_format($total, 2, ",", ".");`, "PHP moderno (8.x) com Laravel é produtivo para sistemas web; WordPress para sites e lojas."]
      ],
      a: [
        ['code', 'rust', `fn total_vencido(parcelas: &[Parcela]) -> f64 {
    parcelas.iter().filter(|p| !p.pago).map(|p| p.valor).sum()
}
// O compilador garante: sem ponteiros nulos, sem uso após liberar, sem data race.`, "Rust: performance de C com segurança de memória verificada pelo compilador (ownership/borrowing)."],
        ['code', 'c', `#include <stdio.h>
int main(void) {
    int valores[] = {1200, 850, 3100};
    int soma = 0;
    for (int i = 0; i < 3; i++) soma += valores[i];
    printf("Total: %d\\n", soma);
    return 0;
}`, "C: você controla a memória diretamente. Base de Linux, Python (CPython), SQLite e firmwares."]
      ],
      rec: ['C é a base de sistemas operacionais e aparelhos', 'Go é simples, rápido e domina ferramentas de nuvem', 'Rust une performance e segurança de memória', 'PHP move grande parte da web, como o WordPress', 'Escolha a linguagem pelo tipo de problema'],
      quiz: [
        { lv: '*', q: 'Qual linguagem é base de sistemas operacionais e de muitos aparelhos?', o: ['C', 'HTML', 'CSS', 'SQL'], a: 0, w: 'C.' },
        { lv: '*', t: 'tf', q: 'O WordPress é feito em PHP.', a: true, w: 'PHP.' },
        { lv: 'b', q: 'Docker e Kubernetes foram escritos em:', o: ['Go', 'Swift', 'Dart', 'R'], a: 0, w: 'Go.' },
        { lv: 'b', t: 'tf', q: 'Cada linguagem é melhor para alguns tipos de trabalho.', a: true, w: 'Ferramenta certa para o problema.' },
        { lv: 'i', q: 'Uma vantagem do Go é:', o: ['Compilar para um binário único e simples de distribuir', 'Não precisar de computador', 'Ser só para jogos', 'Rodar só no Excel'], a: 0, w: 'Deploy fácil.' },
        { lv: 'i', t: 'fill', q: 'Framework PHP mais popular para sistemas web: ___', ans: ['laravel'], w: 'Laravel.' },
        { lv: 'a', q: 'Em C, o programador:', o: ['Gerencia a memória manualmente', 'Não usa memória', 'Tem coletor de lixo', 'Não compila'], a: 0, w: 'malloc/free.' },
        { lv: 'a', q: 'O mecanismo do Rust que garante segurança de memória se chama:', o: ['Ownership e borrowing', 'Garbage collector', 'JIT', 'Eval'], a: 0, w: 'Verificado pelo compilador.' }
      ]
    }
  ]
});

CC.tracks.push({
  id: 'front', ord: 7.5, name: 'Front-end Moderno', short: 'Front-end', glyph: '⚛', hue: 195,
  desc: 'TypeScript, React, Next.js, Tailwind, gerenciamento de estado, formulários e boas práticas de interface.',
  test: [
    { d: 1, q: 'React é usado para:', o: ['Construir interfaces (telas) de sites e apps', 'Criar bancos de dados', 'Formatar PCs', 'Editar planilhas'], a: 0 },
    { d: 1, q: 'Um componente React é:', o: ['Uma peça reutilizável da tela', 'Um banco de dados', 'Uma impressora', 'Um vírus'], a: 0 },
    { d: 2, q: 'useState serve para:', o: ['Guardar estado que, ao mudar, atualiza a tela', 'Fazer requisições SQL', 'Criar CSS', 'Hospedar sites'], a: 0 },
    { d: 2, q: 'TypeScript adiciona ao JavaScript:', o: ['Tipos verificados antes de rodar', 'Banco de dados', 'Imagens', 'Servidor'], a: 0 },
    { d: 3, q: 'Server Components (Next.js) renderizam:', o: ['No servidor, enviando menos JavaScript ao navegador', 'Só no celular', 'No banco', 'Na impressora'], a: 0 },
    { d: 3, q: 'Para dados do servidor com cache e revalidação no React, é comum usar:', o: ['TanStack Query (React Query)', 'jQuery', 'PHP', 'Bash'], a: 0 }
  ],
  exam: [
    { t: 'order', q: 'Ordene o fluxo de uma tela React com dados:', items: ['Componente monta', 'Busca os dados na API', 'Guarda no estado', 'React redesenha a tela'], w: 'Estado muda → tela muda.' },
    { t: 'tf', q: 'Em React, você altera o DOM manualmente a cada mudança de dado.', a: false, w: 'Você muda o estado; o React atualiza o DOM.' },
    { q: 'Para criar um projeto React moderno rapidamente:', o: ['Vite ou Next.js', 'Excel', 'FTP', 'Bloco de notas apenas'], a: 0, w: 'npm create vite@latest ou create-next-app.' },
    { t: 'fill', q: 'Hook para executar algo depois de renderizar (efeitos): use___', ans: ['effect'], w: 'useEffect.' },
    { q: 'Tailwind CSS é:', o: ['Framework de classes utilitárias de estilo', 'Um banco de dados', 'Linguagem de servidor', 'Antivírus'], a: 0, w: 'Classes como p-4, text-lg.' },
    { q: 'Props em um componente React são:', o: ['Dados que o componente pai passa para o filho', 'Variáveis globais do navegador', 'Tabelas do banco', 'Arquivos CSS'], a: 0, w: '<Botao texto="Salvar" /> → props.texto.' },
    { t: 'tf', q: 'Em TypeScript, um erro de tipo aparece antes de o código rodar, no editor ou no build.', a: true, w: 'Essa é a vantagem: achar bugs cedo.' },
    { q: 'Em uma lista renderizada com map(), cada item precisa de:', o: ['Uma key única e estável', 'Um id de CSS', 'Um console.log', 'Um alert'], a: 0, w: 'A key ajuda o React a saber o que mudou.' },
    { t: 'fill', q: 'Em TypeScript, para declarar que nome é texto: let nome: ______', ans: ['string'], w: 'let nome: string = "Ana".' },
    { q: 'Um formulário controlado em React guarda o valor do campo:', o: ['No estado (useState) e atualiza no onChange', 'Só no HTML', 'No banco direto', 'Num cookie'], a: 0, w: 'value={nome} onChange={e => setNome(e.target.value)}.' },
    { q: 'Para o site carregar rápido no celular, uma boa prática é:', o: ['Otimizar imagens e dividir o código (lazy loading)', 'Colocar tudo num arquivo de 10 MB', 'Desativar o cache', 'Usar só GIFs'], a: 0, w: 'Menos bytes = página mais rápida.' }
  ],
  lessons: [
    {
      id: 'fe1', title: 'TypeScript e componentes React', min: { b: 15, i: 20, a: 22 },
      b: [
        ['an', '🧱', 'Telas feitas de LEGO', "No React, a tela é montada com peças: um **Botão**, um **Cartão de cliente**, uma **Lista**. Cada peça é um **componente**, e você usa a mesma peça em vários lugares."],
        ['code', 'tsx', `function CartaoCliente({ nome, valor }: { nome: string; valor: number }) {
  return (
    <div className="cartao">
      <h3>{nome}</h3>
      <p>Em aberto: R$ {valor.toFixed(2)}</p>
    </div>
  );
}`, "Um componente é uma função que devolve o pedaço de tela. Os dados entram como **props**."]
      ],
      i: [
        ['code', 'tsx', `import { useState } from "react";

export function Contador() {
  const [cliques, setCliques] = useState(0);
  return <button onClick={() => setCliques(cliques + 1)}>Cliquei {cliques} vezes</button>;
}

type Status = "pago" | "aberto" | "vencido";
interface Parcela { id: number; valor: number; status: Status }

export function Lista({ itens }: { itens: Parcela[] }) {
  return <ul>{itens.map(p => <li key={p.id}>{p.valor} · {p.status}</li>)}</ul>;
}`, "Estado (useState) muda → React redesenha. Listas precisam de `key` única. TypeScript avisa se você passar dados errados."],
        ['code', 'bash', `npm create vite@latest meu-app -- --template react-ts
cd meu-app && npm install && npm run dev`, "Um projeto React + TypeScript rodando em segundos."]
      ],
      a: [
        ['list', 'Princípios de componentes', ['Estado no menor ancestral comum que precisa dele', 'Derivar em vez de duplicar estado (total = soma das parcelas, não outro useState)', 'Componentes puros: mesma prop, mesma saída', 'useMemo/useCallback só quando medir problema de performance', 'Composição (children) em vez de props gigantes']]
      ],
      rec: ['Componentes são peças reutilizáveis da tela', 'Dados entram por props', 'useState guarda estado; mudou, a tela redesenha', 'Listas precisam de key única', 'TypeScript avisa erros de tipo antes de rodar'],
      quiz: [
        { lv: '*', q: 'O que é um componente React?', o: ['Uma peça reutilizável da interface', 'Um banco de dados', 'Um servidor', 'Uma planilha'], a: 0, w: 'Função que retorna UI.' },
        { lv: '*', t: 'tf', q: 'Quando o estado muda, o React atualiza a tela.', a: true, w: 'Renderização declarativa.' },
        { lv: 'b', q: 'Como os dados entram num componente?', o: ['Por props', 'Por e-mail', 'Por pendrive', 'Por SQL'], a: 0, w: 'Props são os parâmetros.' },
        { lv: 'b', t: 'tf', q: 'Dá para usar o mesmo componente em vários lugares da tela.', a: true, w: 'Reutilização.' },
        { lv: 'i', t: 'fill', q: 'Hook que cria estado: use___', ans: ['state'], w: 'useState.' },
        { lv: 'i', q: 'Ao renderizar uma lista com map, cada item precisa de:', o: ['key única', 'cor', 'id CSS', 'nada'], a: 0, w: 'Ajuda o React a reconciliar.' },
        { lv: 'a', q: 'Total das parcelas deve ser:', o: ['Derivado das parcelas a cada render', 'Outro useState sincronizado à mão', 'Guardado no localStorage', 'Calculado no CSS'], a: 0, w: 'Evite estado duplicado.' },
        { lv: 'a', t: 'tf', q: 'useMemo deve ser aplicado em tudo por padrão.', a: false, w: 'Use quando medir custo real.' }
      ]
    },
    {
      id: 'fe2', title: 'Dados, formulários e estilo', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '📥', 'Buscar, mostrar, salvar', "Quase toda tela faz três coisas: busca dados no servidor, mostra para a pessoa e manda de volta o que ela preencheu. Enquanto espera, mostra “Carregando...”."]
      ],
      i: [
        ['code', 'tsx', `import { useQuery } from "@tanstack/react-query";

function Vencidos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["parcelas", "vencidas"],
    queryFn: () => fetch("/api/parcelas?status=vencido").then(r => r.json()),
  });
  if (isLoading) return <p>Carregando…</p>;
  if (error) return <p>Não foi possível carregar.</p>;
  return <ul>{data.map((p: any) => <li key={p.id}>{p.cliente}: R$ {p.valor}</li>)}</ul>;
}`, "TanStack Query cuida de cache, recarregar e estados de carregamento/erro."],
        ['code', 'tsx', `<button className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-black hover:bg-amber-300">
  Gerar boletos
</button>`, "Tailwind: estilo com classes utilitárias, sem trocar de arquivo."]
      ],
      a: [
        ['list', 'Formulários e validação', ['React Hook Form + Zod: validação tipada no cliente e no servidor com o mesmo schema', 'Mostre o erro ao lado do campo, em linguagem humana', 'Desabilite o botão enquanto envia; evite envio duplo', 'Atualização otimista com rollback em caso de erro', 'Acessibilidade: label, foco visível, aria-live para mensagens']],
        ['list', 'Next.js', ['App Router: pastas viram rotas', 'Server Components buscam dados no servidor', 'Server Actions recebem formulários sem API separada', 'Deploy simples na Vercel; funciona com Supabase']]
      ],
      rec: ['Telas buscam, mostram e enviam dados', 'Sempre trate carregando e erro', 'TanStack Query faz cache e recarregamento', 'Tailwind estiliza com classes utilitárias', 'Valide formulários com um schema (Zod) no cliente e no servidor'],
      quiz: [
        { lv: '*', q: 'Enquanto os dados não chegam, a tela deve:', o: ['Mostrar um estado de carregamento', 'Ficar em branco sem aviso', 'Travar', 'Fechar'], a: 0, w: 'Feedback para a pessoa.' },
        { lv: '*', t: 'tf', q: 'Tratar o caso de erro na busca de dados é parte do trabalho do front-end.', a: true, w: 'Mensagem clara e opção de tentar de novo.' },
        { lv: 'b', t: 'order', q: 'Ordene o ciclo de uma tela de dados:', items: ['Buscar dados', 'Mostrar carregando', 'Exibir os dados', 'Enviar o que a pessoa preencheu'], w: 'Busca, espera, mostra, envia.' },
        { lv: 'b', q: 'Tailwind serve para:', o: ['Estilizar com classes prontas', 'Guardar dados', 'Fazer backup', 'Compilar Java'], a: 0, w: 'CSS utilitário.' },
        { lv: 'i', q: 'Biblioteca que gerencia cache de dados do servidor no React:', o: ['TanStack Query', 'Lodash', 'Moment', 'jQuery UI'], a: 0, w: 'Antigo React Query.' },
        { lv: 'i', t: 'fill', q: 'Biblioteca de schemas para validar formulários em TypeScript: ___', ans: ['zod'], w: 'Zod.' },
        { lv: 'a', q: 'Em Next.js com App Router, uma pasta app/clientes/page.tsx vira a rota:', o: ['/clientes', '/page', '/app', '/tsx'], a: 0, w: 'Roteamento por arquivos.' },
        { lv: 'a', t: 'tf', q: 'Atualização otimista mostra a mudança antes da resposta do servidor e desfaz se falhar.', a: true, w: 'Interface mais rápida.' }
      ]
    }
  ]
});
