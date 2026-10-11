CC.tracks.push({
  id: 'devops', ord: 13, name: 'Nuvem & DevOps', short: 'DevOps', glyph: '☁', hue: 190,
  desc: 'Docker, CI/CD, AWS/Google Cloud/Azure, escalabilidade e infraestrutura como código.',
  test: [
    { d: 1, q: 'A “nuvem” é:', o: ['Vapor d’água', 'Computadores de empresas que você aluga pela internet', 'Um app de fotos só', 'Wi‑Fi'], a: 1 },
    { d: 1, q: 'Docker serve para:', o: ['Editar fotos', 'Empacotar um programa com tudo que ele precisa para rodar igual em qualquer lugar', 'Comprar domínio', 'Fazer login'], a: 1 },
    { d: 2, q: 'CI/CD é:', o: ['Um banco de dados', 'Automação de testes, build e deploy a cada mudança', 'Um tipo de cabo', 'Uma linguagem'], a: 1 },
    { d: 2, q: 'Diferença entre imagem e container:', o: ['Nenhuma', 'Imagem é o molde; container é a instância rodando', 'Container é maior', 'Imagem roda sozinha'], a: 1 },
    { d: 3, q: 'Escalar horizontalmente é:', o: ['Comprar máquina maior', 'Adicionar mais máquinas/instâncias', 'Reduzir código', 'Mudar de banco'], a: 1 },
    { d: 3, q: 'Terraform é usado para:', o: ['Testes unitários', 'Infraestrutura como código', 'Banco NoSQL', 'Frontend'], a: 1 }
  ],
  lessons: [
    {
      id: 'devops1', title: 'Containers com Docker', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🚢', 'O contêiner de navio', "Antigamente cada carga ia solta no navio, uma bagunça. Aí inventaram o **contêiner**: uma caixa padrão que cabe em qualquer navio, caminhão ou trem.\nO **Docker** faz isso com programas: põe o programa e tudo que ele precisa numa caixa que roda igual em qualquer computador."],
        ['tip', "Acabou o famoso “na minha máquina funciona!”."]
      ],
      i: [
        ['code', 'dockerfile', `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`, "Receita da imagem. Copiar o requirements antes do código aproveita o cache das camadas."],
        ['code', 'yaml', `# docker-compose.yml
services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: segredo
    volumes: ["dados:/var/lib/postgresql/data"]
volumes:
  dados:`, "`docker compose up` sobe API + banco juntos. O volume mantém os dados."],
        ['code', 'bash', `docker build -t minha-api .
docker run -p 8000:8000 minha-api
docker ps
docker logs -f <id>
docker exec -it <id> sh`]
      ],
      a: [
        ['list', 'Imagens de produção', ['Multi-stage build: compila numa etapa, copia só o binário/dist para uma imagem mínima', 'Rodar como usuário não-root', 'Tags imutáveis (nunca só `latest`)', 'Scan de vulnerabilidades (Trivy, Docker Scout)', 'Um processo por container; logs para stdout']],
        ['t', 'Kubernetes', "Orquestra centenas de containers: agenda em máquinas, reinicia o que cai, escala, faz rolling update e service discovery. Poderoso e complexo: para times pequenos, Cloud Run, Fly.io, ECS ou Render resolvem com bem menos operação."]
      ],
      quiz: [
        { lv: '*', q: 'Docker resolve principalmente:', o: ['“Na minha máquina funciona”', 'Falta de internet', 'Design feio', 'Senha fraca'], a: 0, w: 'Ambiente igual em todo lugar.' },
        { lv: 'b', q: 'Na analogia, o contêiner do navio é:', o: ['O programa empacotado', 'O mar', 'O capitão', 'O porto'], a: 0, w: 'Caixa padrão.' },
        { lv: 'i', q: 'docker compose serve para:', o: ['Subir vários serviços juntos (API + banco)', 'Compilar Python', 'Criar domínio', 'Editar imagens'], a: 0, w: 'Multi-container.' },
        { lv: 'a', q: 'Multi-stage build reduz:', o: ['Tempo de DNS', 'O tamanho e a superfície de ataque da imagem final', 'Número de usuários', 'Custo do domínio'], a: 1, w: 'Só o necessário vai para produção.' }
      ]
    },
    {
      id: 'devops2', title: 'CI/CD: a esteira automática', min: { b: 12, i: 18, a: 22 },
      b: [
        ['an', '🏭', 'A esteira da fábrica de chocolate', "Cada chocolate passa pela esteira: alguém confere, embala, coloca na caixa. Tudo automático.\nNo código, a cada mudança uma esteira **testa**, **monta** e **publica** sozinha. Isso é **CI/CD**."]
      ],
      i: [
        ['flow', 'Pipeline típico', ['push / pull request', 'lint + testes', 'build', 'deploy em preview', 'aprovação', 'deploy em produção']],
        ['code', 'yaml', `name: deploy
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npx netlify-cli deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}`, "GitHub Actions. Também existem GitLab CI, Bitbucket Pipelines, CircleCI."],
        ['tip', "**CI** (integração contínua) = testar sempre. **CD** (entrega/deploy contínuo) = publicar sempre que passa."]
      ],
      a: [
        ['list', 'Pipelines maduros', ['Cache de dependências e jobs em paralelo (matriz)', 'Artefato construído uma vez e promovido entre ambientes', 'OIDC para acessar a nuvem sem chaves longas', 'Gates: cobertura mínima, SAST, scan de dependências', 'Deploy progressivo com rollback automático por métricas']],
        ['t', 'DORA', "Quatro métricas de times de alta performance: frequência de deploy, lead time de mudança, taxa de falha de mudança e tempo de recuperação. CI/CD bom melhora as quatro."]
      ],
      quiz: [
        { lv: '*', q: 'CI/CD automatiza:', o: ['Testes, build e deploy', 'Compras', 'Contratações', 'Design'], a: 0, w: 'A esteira.' },
        { lv: 'b', q: 'Na esteira, o que acontece com cada mudança?', o: ['É testada e publicada automaticamente', 'É apagada', 'É impressa', 'Nada'], a: 0, w: 'Automação.' },
        { lv: 'i', q: 'Onde ficam as chaves usadas pelo pipeline?', o: ['No YAML em texto', 'Em secrets do repositório/CI', 'No README', 'No commit'], a: 1, w: 'Secrets.' },
        { lv: 'a', q: 'OIDC no CI serve para:', o: ['Acelerar testes', 'Obter credenciais temporárias da nuvem sem guardar chaves fixas', 'Compilar Docker', 'Fazer lint'], a: 1, w: 'Federação de identidade.' }
      ]
    },
    {
      id: 'devops3', title: 'Nuvem e escala', min: { b: 12, i: 20, a: 25 },
      b: [
        ['an', '🏢', 'Alugar em vez de construir', "Em vez de comprar computadores e montar uma sala gelada cheia de máquinas, você **aluga** pedaços dos computadores da Amazon, Google ou Microsoft. Isso é a **nuvem**."],
        ['an', '🛝', 'Mais escorregadores no parque', "Se chegam muitas crianças, o parque coloca mais escorregadores. Se vão embora, tira. Na nuvem, quando muita gente usa o app, liga mais máquinas sozinho: isso é **escalar**."]
      ],
      i: [
        ['tbl', 'Serviços equivalentes', ['Função', 'AWS', 'Google Cloud', 'Azure'], [['Máquina virtual', 'EC2', 'Compute Engine', 'Virtual Machines'], ['Container gerenciado', 'ECS / App Runner', 'Cloud Run', 'Container Apps'], ['Funções', 'Lambda', 'Cloud Functions', 'Functions'], ['Arquivos', 'S3', 'Cloud Storage', 'Blob Storage'], ['Postgres', 'RDS', 'Cloud SQL', 'Database for PostgreSQL'], ['Data warehouse', 'Redshift', 'BigQuery', 'Synapse']]],
        ['t', 'IaaS, PaaS, SaaS', "**IaaS**: você aluga máquina e cuida do resto. **PaaS**: você entrega o código. **SaaS**: você usa o software pronto (Gmail, Conta Azul)."]
      ],
      a: [
        ['list', 'Escalabilidade', ['**Vertical**: máquina maior (simples, tem teto)', '**Horizontal**: mais instâncias atrás de um load balancer (exige app sem estado)', 'Estado vai para fora: sessão no Redis, arquivos no S3', 'Banco: réplicas de leitura, pool de conexões (PgBouncer), particionamento', 'Assíncrono: filas para picos']],
        ['code', 'hcl', `resource "google_cloud_run_v2_service" "api" {
  name     = "api-cobranca"
  location = "southamerica-east1"
  template {
    containers { image = "gcr.io/meu-proj/api:1.4.2" }
    scaling { min_instance_count = 0  max_instance_count = 10 }
  }
}`, "Infraestrutura como código (Terraform/OpenTofu): a infra versionada no Git, revisada em PR e recriável."]
      ],
      quiz: [
        { lv: '*', q: 'Usar a nuvem é:', o: ['Alugar recursos de computação pela internet', 'Guardar fotos só', 'Usar Wi‑Fi', 'Comprar servidores'], a: 0, w: 'Aluguel sob demanda.' },
        { lv: 'b', q: 'Escalar é:', o: ['Subir escada', 'Aumentar a capacidade quando mais gente usa', 'Apagar dados', 'Trocar senha'], a: 1, w: 'Mais escorregadores.' },
        { lv: 'i', q: 'Equivalente do S3 no Google Cloud:', o: ['BigQuery', 'Cloud Storage', 'Cloud Run', 'Firestore'], a: 1, w: 'Armazenamento de objetos.' },
        { lv: 'a', q: 'Para escalar horizontalmente, a aplicação deve ser:', o: ['Stateful em memória', 'Stateless (estado em serviços externos)', 'Escrita em Java', 'Monothread'], a: 1, w: 'Qualquer instância atende qualquer pedido.' }
      ]
    }
  ]
});
