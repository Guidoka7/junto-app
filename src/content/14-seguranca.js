CC.tracks.push({
  id: 'sec', ord: 14, name: 'Segurança', short: 'Segurança', glyph: '⛨', hue: 0,
  desc: 'Senhas, criptografia, ataques comuns (SQL injection, XSS) e como proteger sistemas e dados (LGPD).',
  test: [
    { d: 1, q: 'Senha forte é:', o: ['123456', 'Longa, única e difícil de adivinhar', 'Seu aniversário', 'O nome do pet'], a: 1 },
    { d: 1, q: 'Phishing é:', o: ['Pescaria', 'Golpe que engana a pessoa para entregar dados', 'Um antivírus', 'Uma linguagem'], a: 1 },
    { d: 2, q: 'SQL injection acontece quando:', o: ['O banco está lento', 'Texto do usuário é colado direto dentro da consulta SQL', 'Usa muitos JOINs', 'Falta índice'], a: 1 },
    { d: 2, q: 'HTTPS protege:', o: ['Contra todos os ataques', 'Os dados em trânsito entre navegador e servidor', 'O banco de dados', 'Senhas fracas'], a: 1 },
    { d: 3, q: 'Hash de senha deve ser:', o: ['Rápido como SHA-256', 'Lento e com sal (argon2/bcrypt)', 'Reversível', 'Base64'], a: 1 },
    { d: 3, q: 'Princípio do menor privilégio:', o: ['Dar admin para todos', 'Cada parte só tem o acesso mínimo necessário', 'Não usar senhas', 'Usar só HTTP'], a: 1 }
  ],
  lessons: [
    {
      id: 'sec1', title: 'Senhas e criptografia', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🔐', 'Cadeado e chave', "Criptografar é colocar a mensagem num baú com cadeado. Só quem tem a chave abre. Se um ladrão pegar o baú no caminho, não consegue ler nada."],
        ['an', '🧂', 'O site não guarda sua senha', "Um site bom não guarda sua senha de verdade. Ele guarda uma **impressão digital** dela (hash). Quando você digita, ele faz a impressão de novo e compara."],
        ['list', 'Senha de campeão', ['Frase longa: `pao-de-queijo-no-cafe-da-manha`', 'Uma senha diferente para cada site', 'Gerenciador de senhas (Bitwarden)', 'Verificação em duas etapas ligada']]
      ],
      i: [
        ['tbl', 'Três ferramentas diferentes', ['Técnica', 'Volta ao original?', 'Uso'], [['Codificação (base64)', 'Sim, qualquer um', 'Transportar dados, NÃO é segurança'], ['Criptografia', 'Sim, com a chave', 'Proteger dados (HTTPS, disco)'], ['Hash', 'Não', 'Senhas, integridade de arquivos']]],
        ['run', 'js', `const texto = "senha123";
console.log("base64:", btoa(texto), "→", atob(btoa(texto)));
const dados = new TextEncoder().encode(texto);
crypto.subtle.digest("SHA-256", dados).then(h => {
  console.log("sha256:", [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join(""));
});`, "Base64 volta fácil. SHA-256 não volta, mas é rápido demais para senha: atacantes testam bilhões por segundo."]
      ],
      a: [
        ['t', 'Simétrica x assimétrica', "Simétrica (AES-GCM): mesma chave cifra e decifra, rápida. Assimétrica (RSA, Ed25519, X25519): par pública/privada, usada para troca de chaves e assinatura. TLS usa assimétrica para combinar uma chave e simétrica para o tráfego."],
        ['list', 'Segredos na aplicação', ['Nunca no código nem no Git', 'Cofre: variáveis do provedor, Vault, AWS Secrets Manager', 'Rotação periódica e imediata se vazar', 'Criptografia em repouso para dados sensíveis (CPF, documentos)', 'Não invente criptografia: use bibliotecas consagradas (libsodium)']]
      ],
      quiz: [
        { lv: '*', q: 'Criptografia serve para:', o: ['Deixar o site bonito', 'Proteger informações para que só quem tem a chave leia', 'Acelerar', 'Apagar'], a: 1, w: 'Baú com cadeado.' },
        { lv: 'b', q: 'Qual é a melhor senha?', o: ['123456', 'gato', 'pao-de-queijo-no-cafe-da-manha', 'senha'], a: 2, w: 'Longa e única.' },
        { lv: 'i', q: 'Base64 é:', o: ['Criptografia forte', 'Só uma codificação reversível por qualquer um', 'Hash', 'Assinatura'], a: 1, w: 'Não protege nada.' },
        { lv: 'a', q: 'Por que SHA-256 puro é ruim para senhas?', o: ['É reversível', 'É rápido demais, facilita força bruta', 'Gera colisões fáceis', 'É muito lento'], a: 1, w: 'Use funções lentas e com sal.' }
      ]
    },
    {
      id: 'sec2', title: 'Ataques mais comuns', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🎣', 'O golpe do bilhete falso', "Um bandido manda mensagem fingindo ser o banco: “clique aqui para não bloquear sua conta”. O link leva a um site falso. Isso é **phishing**. Desconfie de pressa e de links estranhos."],
        ['an', '🧙', 'O feitiço escondido no formulário', "Se o sistema não toma cuidado, uma pessoa malvada digita um “feitiço” no campo de nome e o banco obedece! Isso é **SQL injection**."]
      ],
      i: [
        ['run', 'sql', `-- o sistema montou a consulta colando o que o usuário digitou:
-- digitado: ' OR '1'='1
SELECT * FROM clientes WHERE nome = '' OR '1'='1';`, "Repara: a condição `'1'='1'` é sempre verdadeira. O atacante viu **todos** os clientes."],
        ['code', 'py', `# ERRADO
cur.execute(f"SELECT * FROM clientes WHERE nome = '{nome}'")
# CERTO: parâmetros (o banco trata como dado, nunca como código)
cur.execute("SELECT * FROM clientes WHERE nome = %s", (nome,))`, "Consulta parametrizada resolve SQL injection. ORMs e o client do Supabase já fazem isso."],
        ['tbl', 'OWASP Top 10 (resumo)', ['Risco', 'Exemplo'], [['Controle de acesso quebrado', 'Trocar /contratos/41 por /42 e ver o de outro cliente'], ['Falhas criptográficas', 'Senha em texto puro'], ['Injeção', 'SQL injection'], ['Configuração insegura', 'Bucket público, debug ligado'], ['Componentes vulneráveis', 'Biblioteca desatualizada'], ['Falhas de autenticação', 'Sem limite de tentativas']]]
      ],
      a: [
        ['t', 'XSS e CSRF', "**XSS**: atacante injeta script na sua página (comentário com `<script>`). Defesa: escapar saída, `textContent`, CSP restritiva, cookies HttpOnly. **CSRF**: outro site faz o navegador da vítima enviar uma ação autenticada. Defesa: SameSite, tokens anti-CSRF, exigir header customizado."],
        ['t', 'IDOR e SSRF', "**IDOR**: a API não confere se o recurso pertence ao usuário (o erro nº 1 do OWASP). Sempre filtre por dono no servidor/RLS. **SSRF**: o servidor busca uma URL fornecida pelo usuário e acaba acessando a rede interna (ex.: metadados da nuvem). Valide e restrinja destinos."]
      ],
      quiz: [
        { lv: '*', q: 'Phishing tenta:', o: ['Enganar você para entregar dados', 'Acelerar a internet', 'Atualizar o celular', 'Fazer backup'], a: 0, w: 'Golpe de engano.' },
        { lv: 'b', q: 'Uma mensagem urgente com link pedindo senha deve:', o: ['Ser respondida rápido', 'Gerar desconfiança', 'Ser encaminhada', 'Ser salva'], a: 1, w: 'Pressa é sinal de golpe.' },
        { lv: 'i', q: 'A defesa principal contra SQL injection:', o: ['Esconder o banco', 'Consultas parametrizadas', 'Usar HTTPS', 'Senha forte'], a: 1, w: 'Dado nunca vira código.' },
        { lv: 'a', q: 'Trocar o ID na URL e acessar dados de outro usuário é:', o: ['XSS', 'IDOR / controle de acesso quebrado', 'CSRF', 'DDoS'], a: 1, w: 'Falta checar o dono.' }
      ]
    },
    {
      id: 'sec3', title: 'Protegendo sistemas e dados (LGPD)', min: { b: 10, i: 18, a: 22 },
      b: [
        ['an', '🏰', 'Castelo com várias muralhas', "Um castelo seguro não tem só um portão: tem fosso, muralha, guardas e torre. Na computação também: várias camadas de proteção, para que se uma falhar, as outras seguram."],
        ['an', '🤫', 'Segredo dos outros', "Dados das pessoas (CPF, endereço, saúde) são como segredos que te contaram. A lei (**LGPD**) diz que você precisa cuidar bem deles e só usar para o que combinou."]
      ],
      i: [
        ['list', 'Checklist de um sistema seguro', ['HTTPS em tudo', 'Atualizar dependências (Dependabot)', 'Permissões por papel (consultor, financeiro, admin)', 'Logs de auditoria: quem fez o quê', 'Backup criptografado e testado', 'MFA para todos os acessos administrativos']],
        ['t', 'LGPD no dia a dia', "Colete só o necessário, informe a finalidade, tenha base legal (contrato, consentimento), permita que a pessoa acesse/corrija/apague dados, e comunique incidentes à ANPD. Dados de saúde (como em cirurgias) são **sensíveis** e exigem cuidado extra."]
      ],
      a: [
        ['list', 'Defesa em profundidade', ['Zero trust: autenticar e autorizar cada chamada, até interna', 'Segmentação de rede; banco sem IP público', 'WAF e rate limiting na borda', 'Secret scanning + SAST/DAST no CI', 'Plano de resposta a incidentes ensaiado', 'Pseudonimização e minimização de dados em ambientes de teste']],
        ['t', 'Modelagem de ameaças', "Pergunte para cada fluxo: o que pode dar errado? (STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege). Priorize pelo impacto × probabilidade."]
      ],
      quiz: [
        { lv: '*', q: 'A LGPD trata de:', o: ['Proteção de dados pessoais', 'Velocidade de internet', 'Impostos', 'Design'], a: 0, w: 'Lei Geral de Proteção de Dados.' },
        { lv: 'b', q: 'Várias camadas de proteção são como:', o: ['Um castelo com muralhas e guardas', 'Uma porta aberta', 'Um rio', 'Um jardim'], a: 0, w: 'Defesa em profundidade.' },
        { lv: 'i', q: 'Dados de saúde na LGPD são:', o: ['Públicos', 'Sensíveis, com proteção reforçada', 'Livres para marketing', 'Ignorados'], a: 1, w: 'Categoria especial.' },
        { lv: 'a', q: 'Zero trust significa:', o: ['Não confiar em ninguém e não usar sistema', 'Verificar identidade e permissão em cada acesso, mesmo dentro da rede', 'Só usar VPN', 'Desligar firewall'], a: 1, w: 'Rede interna não é confiável por padrão.' }
      ]
    }
  ]
});
