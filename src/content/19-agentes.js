CC.tracks.push({
  id: 'agent', ord: 19, name: 'Agentes de IA', short: 'Agentes', glyph: '◎', hue: 330,
  desc: 'IA que age: ferramentas (function calling), o loop do agente, RAG, memória, MCP, multiagentes e avaliação.',
  test: [
    { d: 1, q: 'Um agente de IA é diferente de um chat comum porque:', o: ['Escreve mais bonito', 'Pode usar ferramentas e tomar ações em várias etapas para cumprir um objetivo', 'É mais barato', 'Não usa modelo de linguagem'], a: 1 },
    { d: 1, q: 'Uma “ferramenta” para um agente pode ser:', o: ['Um martelo', 'Uma função que busca dados, envia e-mail ou consulta um banco', 'Um monitor', 'Uma senha'], a: 1 },
    { d: 2, q: 'No function calling, quem executa a função de verdade?', o: ['O modelo, dentro dele', 'O seu código, que recebe o pedido do modelo e devolve o resultado', 'O navegador do usuário sempre', 'Ninguém'], a: 1 },
    { d: 2, q: 'RAG significa:', o: ['Gerar imagens', 'Buscar informação relevante e colocar no contexto antes de gerar', 'Treinar o modelo do zero', 'Um banco NoSQL'], a: 1 },
    { d: 3, q: 'MCP (Model Context Protocol) serve para:', o: ['Comprimir modelos', 'Padronizar como apps de IA se conectam a ferramentas e dados', 'Medir custo', 'Treinar embeddings'], a: 1 },
    { d: 3, q: 'Principal cuidado em agentes com permissão de escrita:', o: ['Fonte bonita', 'Confirmação humana e permissões mínimas para ações irreversíveis', 'Usar temperatura alta', 'Desligar logs'], a: 1 }
  ],
  lessons: [
    {
      id: 'agent1', title: 'O loop do agente', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🕵️', 'O detetive com uma maleta', "Um chat comum só **conversa**. Um agente é um detetive com uma maleta de ferramentas: lupa, telefone, caderno.\nVocê dá uma missão (“descubra quem não pagou”), e ele pensa, usa uma ferramenta, olha o resultado, pensa de novo... até resolver."],
        ['flow', 'O ciclo do detetive', ['Recebe a missão', 'Pensa no próximo passo', 'Usa uma ferramenta', 'Olha o resultado', 'Repete até terminar', 'Entrega a resposta']]
      ],
      i: [
        ['run', 'js', `// Simulação: um "modelo" falso que decide usar ferramentas
const ferramentas = {
  buscar_vencidos: () => [{ cliente: "Bruno", dias: 12 }, { cliente: "Gabi", dias: 40 }],
  enviar_lembrete: ({ cliente }) => \`lembrete enviado para \${cliente}\`,
};
function modelo(historico) {          // no mundo real: chamada à API do LLM
  const ultimo = historico.at(-1);
  if (ultimo.role === "user") return { ferramenta: "buscar_vencidos", args: {} };
  if (ultimo.ferramenta === "buscar_vencidos") {
    const alvo = ultimo.resultado.find(r => r.dias > 30);
    return { ferramenta: "enviar_lembrete", args: { cliente: alvo.cliente } };
  }
  return { resposta: "Pronto: 1 cliente com mais de 30 dias foi lembrado." };
}
const historico = [{ role: "user", content: "Lembre quem está há mais de 30 dias em atraso" }];
for (let passo = 1; passo <= 5; passo++) {
  const decisao = modelo(historico);
  if (decisao.resposta) { console.log("✅", decisao.resposta); break; }
  const resultado = ferramentas[decisao.ferramenta](decisao.args);
  console.log(\`passo \${passo}: \${decisao.ferramenta}\`, JSON.stringify(resultado));
  historico.push({ role: "tool", ferramenta: decisao.ferramenta, resultado });
}`, "Esse é o esqueleto de todo agente: **decidir → agir → observar → repetir**, com limite de passos."],
        ['t', 'Workflow ou agente?', "**Workflow**: você define os passos fixos e a IA preenche partes (previsível e barato). **Agente**: a IA decide os passos (flexível, mais caro e imprevisível). Use o mais simples que resolve."]
      ],
      a: [
        ['list', 'Padrões de arquitetura', ['**Encadeamento**: saída de um passo vira entrada do próximo', '**Roteamento**: classifica e manda para o especialista certo', '**Paralelização**: várias chamadas ao mesmo tempo e junta', '**Orquestrador–trabalhadores**: um planeja e delega subtarefas', '**Avaliador–otimizador**: um gera, outro critica, repete']],
        ['t', 'Controle do loop', "Limite de passos e de custo, timeout, detecção de repetição, checkpoints para retomar, e um critério claro de “terminei”. Ferramentas devem retornar erros úteis (“cliente não encontrado; ids válidos começam com C-”) para o agente se corrigir."]
      ],
      quiz: [
        { lv: '*', q: 'O ciclo básico de um agente é:', o: ['Escrever e apagar', 'Pensar → usar ferramenta → observar → repetir', 'Só responder uma vez', 'Treinar o modelo'], a: 1, w: 'Loop de ação.' },
        { lv: 'b', q: 'Na história, as ferramentas do detetive são como:', o: ['Funções que o agente pode usar', 'Senhas', 'Cores', 'Arquivos de música'], a: 0, w: 'A maleta.' },
        { lv: 'i', q: 'Quando a sequência de passos é sempre a mesma, o mais indicado é:', o: ['Agente autônomo', 'Workflow com passos fixos', 'Nada', 'Treinar um modelo'], a: 1, w: 'Mais previsível e barato.' },
        { lv: 'a', q: 'Por que limitar o número de passos?', o: ['Por estética', 'Evitar loops infinitos e custo descontrolado', 'O modelo exige', 'Melhora o português'], a: 1, w: 'Segurança de custo.' }
      ]
    },
    {
      id: 'agent2', title: 'Ferramentas (function calling)', min: { b: 10, i: 20, a: 22 },
      b: [
        ['an', '📋', 'O cardápio de ferramentas', "Você entrega para a IA um cardápio: “você pode usar: *ver agenda*, *buscar cliente*, *calcular parcela*”. A IA escolhe do cardápio e diz o que precisa. **Seu programa** é quem faz e devolve o resultado."]
      ],
      i: [
        ['code', 'py', `tools = [{
    "name": "buscar_parcelas",
    "description": "Busca parcelas de um cliente. Use quando perguntarem sobre pagamentos ou atrasos.",
    "input_schema": {
        "type": "object",
        "properties": {
            "cliente": {"type": "string", "description": "Nome completo do cliente"},
            "status": {"type": "string", "enum": ["aberto", "pago", "vencido"]}
        },
        "required": ["cliente"]
    }
}]
msgs = [{"role": "user", "content": "A Ana Souza tem parcela vencida?"}]
r = client.messages.create(model="claude-sonnet-5-5", max_tokens=800, tools=tools, messages=msgs)

while r.stop_reason == "tool_use":
    msgs.append({"role": "assistant", "content": r.content})
    resultados = []
    for bloco in r.content:
        if bloco.type == "tool_use":
            saida = minhas_funcoes[bloco.name](**bloco.input)     # SEU código executa
            resultados.append({"type": "tool_result", "tool_use_id": bloco.id, "content": json.dumps(saida)})
    msgs.append({"role": "user", "content": resultados})
    r = client.messages.create(model="claude-sonnet-5-5", max_tokens=800, tools=tools, messages=msgs)
print(r.content[0].text)`, "O modelo devolve um bloco `tool_use`; você executa e responde com `tool_result`; repete até ele responder em texto."],
        ['tip', "A **descrição** da ferramenta é o que faz o modelo escolher certo. Escreva como se fosse para um colega novo."]
      ],
      a: [
        ['list', 'Projetando boas ferramentas', ['Poucas ferramentas, bem nomeadas, com propósito claro (evite sobreposição)', 'Parâmetros com enum e exemplos; valide tudo no servidor', 'Respostas enxutas e com IDs úteis para o próximo passo; pagine resultados grandes', 'Separar leitura de escrita; escrita exige confirmação', 'Idempotência em ações (enviar cobrança com chave única)']]
      ],
      quiz: [
        { lv: '*', q: 'No function calling, o modelo:', o: ['Executa o código no seu servidor sozinho', 'Pede para usar uma ferramenta e seu código executa', 'Ignora ferramentas', 'Apaga o banco'], a: 1, w: 'Seu código executa.' },
        { lv: 'b', q: 'O “cardápio” entregue à IA é:', o: ['A lista de ferramentas disponíveis', 'O menu do restaurante', 'A senha', 'O banco'], a: 0, w: 'Tools.' },
        { lv: 'i', q: 'O que mais influencia a IA a escolher a ferramenta certa?', o: ['A cor', 'Nome e descrição claros da ferramenta', 'O tamanho do código', 'A linguagem'], a: 1, w: 'Descrição.' },
        { lv: 'a', q: 'Ferramenta de envio de mensagens deve ter:', o: ['Execução automática sem limite', 'Confirmação e idempotência', 'Temperatura alta', 'Sem logs'], a: 1, w: 'Ação irreversível.' }
      ]
    },
    {
      id: 'agent3', title: 'RAG e memória', min: { b: 10, i: 20, a: 22 },
      b: [
        ['an', '🎒', 'Colar na prova (permitido!)', "A IA não sabe as regras da **sua** empresa. Então, antes de responder, a gente procura as páginas certas do manual e entrega junto com a pergunta: “responde usando isto aqui”.\nIsso é **RAG**: buscar e depois gerar."]
      ],
      i: [
        ['flow', 'RAG passo a passo', ['Fatiar documentos em trechos', 'Gerar embeddings e guardar (pgvector)', 'Pergunta chega → vira embedding', 'Busca os trechos mais parecidos', 'Coloca os trechos no prompt', 'Modelo responde citando as fontes']],
        ['run', 'py', `def fatiar(texto, tamanho=60, sobra=15):
    pedacos, i = [], 0
    while i < len(texto):
        pedacos.append(texto[i:i + tamanho])
        i += tamanho - sobra
    return pedacos

manual = "Cancelamento até 7 dias após a assinatura tem reembolso integral. Após 7 dias, aplica-se multa de 20% sobre o valor pago, salvo indicação médica documentada."
for p in fatiar(manual):
    print("•", p)`, "Sobreposição entre trechos evita cortar uma regra no meio."],
        ['tbl', 'Tipos de memória de agente', ['Memória', 'Exemplo'], [['Curto prazo', 'o histórico da conversa atual'], ['Longo prazo', 'arquivo/banco com preferências e fatos do usuário'], ['Conhecimento', 'base de documentos via RAG'], ['Procedural', 'instruções e “skills” reutilizáveis']]]
      ],
      a: [
        ['list', 'RAG que funciona em produção', ['Avaliar recuperação separado da geração (o trecho certo veio?)', 'Contextual retrieval: prefixar cada trecho com contexto do documento', 'Busca híbrida + reranking', 'Pedir citações e recusar quando a base não cobre', 'Controle de acesso por documento (o usuário só recupera o que pode ver)', 'Janelas grandes não eliminam RAG: custo, latência e foco ainda importam']]
      ],
      quiz: [
        { lv: '*', q: 'RAG serve para:', o: ['Dar à IA informação específica e atual antes de responder', 'Treinar do zero', 'Desenhar', 'Hospedar'], a: 0, w: 'Retrieval-Augmented Generation.' },
        { lv: 'b', q: 'No RAG, antes de responder a IA:', o: ['Recebe trechos relevantes dos documentos', 'Dorme', 'Apaga a pergunta', 'Liga para alguém'], a: 0, w: 'Busca primeiro.' },
        { lv: 'i', q: 'Por que fatiar com sobreposição?', o: ['Para gastar mais', 'Para não perder informação cortada entre trechos', 'Obrigatório', 'Para ordenar'], a: 1, w: 'Continuidade.' },
        { lv: 'a', q: 'Se o usuário não pode ver um documento, no RAG você deve:', o: ['Recuperar e pedir para a IA não contar', 'Filtrar na busca para nem recuperar', 'Ignorar', 'Usar temperatura 0'], a: 1, w: 'Controle de acesso na recuperação.' }
      ],
      lab: { lang: 'py', task: 'Crie `fatiar(texto, tamanho)` que divide o texto em pedaços de no máximo `tamanho` caracteres, sem sobreposição. Ex.: fatiar("abcdefg", 3) → ["abc","def","g"]', start: 'def fatiar(texto, tamanho):\n    pass\n', check: { tests: 'assert fatiar("abcdefg", 3) == ["abc","def","g"]\nassert fatiar("", 3) == []\nassert fatiar("abcdef", 2) == ["ab","cd","ef"]' }, hint: 'return [texto[i:i+tamanho] for i in range(0, len(texto), tamanho)]', sol: 'def fatiar(texto, tamanho):\n    return [texto[i:i + tamanho] for i in range(0, len(texto), tamanho)]' }
    },
    {
      id: 'agent4', title: 'MCP, multiagentes e avaliação', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🔌', 'A tomada universal', "Antes, cada aparelho tinha um carregador diferente. Aí veio o USB‑C, que serve em quase tudo.\nO **MCP** é o “USB‑C” da IA: um jeito padrão de ligar a IA no Gmail, no banco de dados, no Figma, no GitHub..."],
        ['an', '👥', 'Um time de ajudantes', "Às vezes, em vez de um agente fazendo tudo, você tem um time: um pesquisa, outro escreve, outro revisa. Isso é **multiagente**."]
      ],
      i: [
        ['t', 'O que é o MCP', "Model Context Protocol: protocolo aberto (criado pela Anthropic e adotado amplamente) em que um **servidor MCP** expõe ferramentas, recursos e prompts, e um **cliente** (Claude, IDEs, outros apps) se conecta e os oferece ao modelo. Você escreve a integração uma vez e ela funciona em vários apps de IA."],
        ['code', 'py', `# servidor MCP mínimo (SDK Python, FastMCP)
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("cobranca")

@mcp.tool()
def parcelas_vencidas(dias_minimos: int = 30) -> list[dict]:
    """Lista parcelas vencidas há pelo menos N dias."""
    return consultar_banco(dias_minimos)

if __name__ == "__main__":
    mcp.run()`, "Uma função Python vira ferramenta para qualquer cliente MCP."],
        ['list', 'Frameworks e ferramentas', ['Claude Agent SDK, OpenAI Agents SDK', 'LangGraph, LlamaIndex, CrewAI', 'n8n e Make com nós de IA (sem código)', 'Agentes de código: Claude Code, Cursor, Copilot']]
      ],
      a: [
        ['list', 'Multiagentes com os pés no chão', ['Vale a pena quando subtarefas são independentes e paralelizáveis (pesquisa ampla)', 'Custa mais tokens; coordene com um orquestrador e contexto enxuto por subagente', 'Defina contratos claros de entrada/saída entre agentes', 'Um revisor independente que não viu a produção pega mais erros']],
        ['list', 'Avaliar agentes', ['Conjunto de tarefas reais com critério de sucesso verificável', 'Medir: taxa de sucesso, passos, custo, tempo', 'Inspecionar trajetórias (logs de cada passo), não só a resposta final', 'Testes adversariais: prompt injection em e-mails e páginas', 'Rodar os evals a cada mudança de prompt, ferramenta ou modelo']]
      ],
      quiz: [
        { lv: '*', q: 'MCP é como:', o: ['Um carregador universal para conectar IA a ferramentas', 'Um novo modelo', 'Uma linguagem de banco', 'Um antivírus'], a: 0, w: 'Padrão de conexão.' },
        { lv: 'b', q: 'Multiagente é:', o: ['Um agente gigante', 'Um time de agentes dividindo tarefas', 'Um robô físico', 'Um site'], a: 1, w: 'Time.' },
        { lv: 'i', q: 'Num servidor MCP você expõe principalmente:', o: ['Ferramentas, recursos e prompts', 'Imagens e vídeos', 'Domínios', 'Senhas'], a: 0, w: 'Primitivas do MCP.' },
        { lv: 'a', q: 'Ao avaliar agentes, além da resposta final, examine:', o: ['A fonte', 'As trajetórias (cada passo e chamada de ferramenta)', 'A cor do terminal', 'Nada mais'], a: 1, w: 'Processo importa.' }
      ]
    }
  ]
});
