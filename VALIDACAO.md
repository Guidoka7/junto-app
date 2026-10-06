# Validação — Juntô 1.1.1

Atualização do layout sobre a base 1.1.0, preservando o controle financeiro existente. Os testes de banco e parser abaixo foram reaproveitados da base validada: essas regras não foram alteradas nesta atualização.

| Verificação | Resultado |
|---|---|
| Arquivos e sintaxe JavaScript | Passou (`npm run check`) |
| Build web e sincronização Capacitor | Passou (`npm run android:sync`) |
| Banco e combinação de registros | 11 testes passaram (`npm test`) |
| Parser bancário em Java | 15 verificações passaram (`npm run test:android-parser`) |
| Navegador Chromium | 7 testes passaram (`npm run test:browser`) |
| APK Android | Passou: `testDebugUnitTest assembleDebug`, Java 21 e SDK 36 |
| Assinatura e conteúdo do APK | Assinatura v2 válida, mesma chave da 1.1.0; versão 1.1.1, código 2, pacote `br.com.junto.app`; arquivos web iguais ao build validado |

## Layout móvel

Alturas em pixels CSS no Chromium, com viewport de 390 × 844 e os mesmos dados de demonstração:

| Card | Antes | Depois | Redução |
|---|---:|---:|---:|
| Saldo individual | 383 | 243 | 36% |
| Saldo em dupla | 398 | 299 | 25% |
| Projeção | 712 | 374 | 47% |

- Conferidos também 360 × 800 e 412 × 915, nos modos individual e dupla, e 1280 × 900 no desktop.
- Cabeçalho, espaçamentos e cards secundários mais compactos; os três indicadores abaixo do saldo aparecem na mesma linha.
- O saldo individual mantém o botão de edição ao lado do valor principal, sem repetir o mesmo saldo em outra linha.
- A projeção mantém o gráfico e os três indicadores à vista. A explicação completa e a confiança ficam no painel expansível **Entenda a projeção**, que abre e fecha com o controle nativo do navegador.
- Sem rolagem horizontal nas telas conferidas. Barra inferior fixa após rolar a página; botões de saldo, ocultação dos valores e expansão da explicação verificados.
- Sete testes de navegador passaram novamente na versão 1.1.1.

## O que os testes cobrem

- Interface móvel, navegação, barra inferior fixa e ausência de erros de execução.
- Reabertura do PWA offline com os scripts e fontes embutidos.
- Sequência do botão Voltar: modal, chat, tela Hoje e saída.
- Confirmação de notificações bancárias, persistência, prevenção de repetição e exclusão do texto original do estado financeiro.
- Exportação do backup pelo caminho nativo do Android, com o conteúdo financeiro confirmado enviado à ponte de teste.
- Compra no crédito como conta a pagar, preservando o saldo disponível; recebimento como entrada.
- Dois usuários em sessões independentes, convite, entrada na dupla, gastos feitos offline e combinação após reconexão.
- Perfil de cada conta e descarte de resposta atrasada que chega depois da saída da conta.
- Isolamento dos dados para contas sem acesso, restrição a participantes autenticados, bloqueio de gravações diretas, convites de uso único e limite de tentativas.
- Controle de revisões e conflitos; combinação de gastos iguais feitos em aparelhos diferentes; proteção contra dupla confirmação de recebimentos e combinação de contribuições para metas.

## Ambiente e limites

Os testes do banco executaram o SQL do projeto em PostgreSQL local via PGlite, com usuários e papéis de teste. Os testes de navegador usaram Chromium real, com respostas de autenticação e canal de tempo real simulados; as operações de finanças executaram as funções SQL desse banco local.

O parser bancário foi compilado e executado em Java. O projeto Android completo compilou e o APK de teste foi gerado e verificado com as ferramentas do SDK. A ponte Android e o botão Voltar foram simulados nos testes de navegador. Isso não verifica a concessão da permissão, o recebimento de notificações pelo sistema ou a gravação de um backup em um provedor de arquivos de um telefone físico.

Nenhum projeto Supabase de produção foi configurado. A sincronização entre celulares reais depende de um projeto dedicado, da execução de `supabase/setup.sql`, das configurações de e-mail/redirecionamento e da URL/chave publicável descritas no README.

Os formatos de notificações variam entre bancos e versões. A confirmação humana permanece obrigatória. O app não foi publicado no GitHub Pages nem enviado à Play Store durante esta implementação.

APK entregue: `Junto-1.1.1-teste.apk`, 5,374,732 bytes, assinatura de desenvolvimento. SHA-256: `75b7465c48a48e7f174d75548ce76539f39535794bf29a023090b9250e75e4da`.
