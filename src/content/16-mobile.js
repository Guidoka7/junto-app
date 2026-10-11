CC.tracks.push({
  id: 'mob', ord: 16, name: 'Apps Mobile', short: 'Mobile', glyph: '▯', hue: 160,
  desc: 'Nativo, híbrido ou PWA; React Native, Flutter, Capacitor; como gerar APK e publicar na Play Store.',
  test: [
    { d: 1, q: 'APK é:', o: ['Um site', 'O arquivo de instalação de app Android', 'Uma linguagem', 'Um banco'], a: 1 },
    { d: 1, q: 'Android e iOS são:', o: ['Linguagens', 'Sistemas operacionais de celular', 'Bancos de dados', 'Navegadores'], a: 1 },
    { d: 2, q: 'React Native e Flutter permitem:', o: ['Um código para Android e iOS', 'Só sites', 'Só iOS', 'Só jogos'], a: 0 },
    { d: 2, q: 'Para publicar na Play Store hoje é exigido o formato:', o: ['APK', 'AAB (Android App Bundle)', 'ZIP', 'EXE'], a: 1 },
    { d: 3, q: 'Capacitor empacota:', o: ['Um app web dentro de um app nativo com WebView e plugins nativos', 'Código Swift em Android', 'Bancos SQL', 'Vídeos'], a: 0 },
    { d: 3, q: 'Perder a keystore de assinatura significa:', o: ['Nada', 'Não conseguir mais publicar atualizações com a mesma chave (sem o Play App Signing)', 'Perder o código', 'Perder o domínio'], a: 1 }
  ],
  lessons: [
    {
      id: 'mob1', title: 'Jeitos de fazer um app', min: { b: 12, i: 18, a: 20 },
      b: [
        ['an', '🗣️', 'Falar a língua de cada país', "O Android fala uma língua (Kotlin), o iPhone fala outra (Swift). Fazer um app em cada língua é **nativo**: fica perfeito, mas dá o dobro de trabalho.\nOutra opção é um **tradutor**: você escreve uma vez e ele roda nos dois. Isso é **multiplataforma**."],
        ['list', 'Os jeitos', ['**Nativo**: Kotlin (Android), Swift (iPhone)', '**Multiplataforma**: Flutter, React Native', '**Híbrido**: um site dentro de um app (Capacitor) — como este!', '**PWA**: site que instala na tela inicial']]
      ],
      i: [
        ['tbl', 'Comparando', ['Abordagem', 'Linguagem', 'Prós', 'Contras'], [['Nativo', 'Kotlin / Swift', 'Máximo desempenho e acesso total', '2 códigos'], ['Flutter', 'Dart', 'UI idêntica e rápida', 'Linguagem menos comum'], ['React Native (Expo)', 'JS/TS', 'Reaproveita React e devs web', 'Pontes nativas às vezes'], ['Capacitor', 'HTML/CSS/JS', 'Reaproveita o site inteiro', 'Desempenho de WebView'], ['PWA', 'HTML/CSS/JS', 'Sem loja, atualiza na hora', 'Limitações no iOS']]],
        ['tip', "Para quem já sabe web: comece com PWA ou Capacitor; para apps grandes com UX nativa, Expo (React Native) ou Flutter."]
      ],
      a: [
        ['t', 'Ciclo de vida e restrições', "O SO pode matar seu app em segundo plano a qualquer momento: salve estado ao pausar. Tarefas em background são limitadas (WorkManager no Android, BGTaskScheduler no iOS). Push exige FCM/APNs. Permissões são pedidas em tempo de uso, com justificativa."],
        ['t', 'Offline-first', "Banco local (SQLite, WatermelonDB, IndexedDB) + fila de sincronização + resolução de conflitos (última escrita vence, ou merge por campo). O app abre instantaneamente e sincroniza quando houver rede."]
      ],
      quiz: [
        { lv: '*', q: 'Um app multiplataforma:', o: ['Roda só no Android', 'Usa um código para Android e iPhone', 'É um site', 'Não usa internet'], a: 1, w: 'Escreve uma vez.' },
        { lv: 'b', q: 'Este app de estudos foi feito com:', o: ['Swift', 'Capacitor (web dentro de app)', 'Excel', 'Java puro'], a: 1, w: 'Híbrido.' },
        { lv: 'i', q: 'Flutter usa a linguagem:', o: ['Dart', 'Kotlin', 'Swift', 'PHP'], a: 0, w: 'Dart.' },
        { lv: 'a', q: 'No mobile, o SO pode encerrar o app em segundo plano. Você deve:', o: ['Ignorar', 'Salvar estado ao pausar e restaurar ao voltar', 'Desativar o SO', 'Usar só online'], a: 1, w: 'Ciclo de vida.' }
      ]
    },
    {
      id: 'mob2', title: 'Do código ao APK', min: { b: 12, i: 20, a: 22 },
      b: [
        ['an', '🎁', 'Embrulhar o presente', "Seu app é o presente. Para dar para alguém, você embrulha numa caixa: o **APK**. A pessoa abre a caixa no celular e o app aparece instalado."],
        ['flow', 'Como este app virou APK', ['Página web (HTML/CSS/JS)', 'Capacitor coloca dentro de um app Android', 'Gradle monta o APK', 'GitHub Actions faz isso sozinho na nuvem', 'Você baixa e instala']]
      ],
      i: [
        ['code', 'bash', `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Meu App" br.com.meuapp --web-dir=www
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# APK em android/app/build/outputs/apk/debug/app-debug.apk`, "Precisa de Java (JDK 21) e Android SDK — ou deixe o GitHub Actions fazer."],
        ['code', 'bash', `# Expo / React Native
npx create-expo-app meu-app
npx expo start                 # testa no celular com o app Expo Go
eas build -p android --profile preview   # APK na nuvem da Expo`],
        ['tip', "Para instalar um APK baixado, o Android pede para permitir “instalar apps desconhecidos” para o navegador/arquivos. É normal para apps fora da loja."]
      ],
      a: [
        ['list', 'Build de release', ['Gerar keystore: `keytool -genkey -v -keystore app.jks -keyalg RSA -keysize 2048 -validity 10000 -alias app`', 'Guardar keystore e senhas em cofre + secrets do CI', '`./gradlew bundleRelease` gera o AAB para a Play Store', 'Ativar Play App Signing (Google guarda a chave final)', 'Versionar `versionCode` (inteiro crescente) e `versionName`', 'R8/ProGuard para reduzir tamanho']]
      ],
      quiz: [
        { lv: '*', q: 'APK é:', o: ['O instalador do app Android', 'Um site', 'Uma senha', 'Uma imagem'], a: 0, w: 'Android Package.' },
        { lv: 'b', q: 'Quem monta o APK sozinho na nuvem, neste projeto?', o: ['GitHub Actions', 'O Excel', 'O DNS', 'O roteador'], a: 0, w: 'CI.' },
        { lv: 'i', q: '`npx cap sync` faz:', o: ['Apaga o projeto', 'Copia o build web e plugins para o projeto nativo', 'Publica na loja', 'Cria domínio'], a: 1, w: 'Sincroniza.' },
        { lv: 'a', q: 'Para cada atualização na Play Store, você precisa aumentar:', o: ['versionCode', 'O nome do pacote', 'A keystore', 'O ícone'], a: 0, w: 'Inteiro crescente.' }
      ]
    },
    {
      id: 'mob3', title: 'Publicar na loja', min: { b: 10, i: 16, a: 20 },
      b: [
        ['an', '🏪', 'Colocar na vitrine', "A **Play Store** é uma loja gigante. Para colocar seu app lá, você paga uma taxa uma vez, preenche a ficha (nome, fotos, descrição) e o Google revisa."]
      ],
      i: [
        ['list', 'Passo a passo Play Store', ['Conta Google Play Console (taxa única de US$ 25)', 'Criar app: nome, idioma, gratuito/pago', 'Ficha: ícone 512px, prints, descrição', 'Política de privacidade (URL)', 'Questionário de classificação e segurança de dados', 'Enviar AAB para teste interno → fechado → produção', 'Contas novas pessoais precisam de teste fechado com testadores por alguns dias antes da produção']],
        ['t', 'App Store (iPhone)', "Exige Mac (ou build na nuvem), conta Apple Developer (US$ 99/ano) e revisão mais rigorosa. Distribuição para testes via TestFlight."]
      ],
      a: [
        ['list', 'Depois do lançamento', ['Crashlytics/Sentry para falhas', 'Lançamento gradual (staged rollout: 5% → 100%)', 'Atualizações OTA do código web (Capgo, Expo Updates) respeitando as regras da loja', 'ASO: título, palavras-chave e prints otimizados', 'Responder avaliações']]
      ],
      quiz: [
        { lv: '*', q: 'Para publicar na Play Store você precisa:', o: ['De uma conta no Play Console', 'De um Mac', 'De um domínio .gov', 'Nada'], a: 0, w: 'Play Console.' },
        { lv: 'b', q: 'Antes de aparecer na loja, o app:', o: ['É revisado', 'É apagado', 'Fica secreto para sempre', 'Vira site'], a: 0, w: 'Revisão do Google.' },
        { lv: 'i', q: 'Para testar no iPhone antes de publicar:', o: ['TestFlight', 'Play Console', 'Netlify', 'Docker'], a: 0, w: 'TestFlight.' },
        { lv: 'a', q: 'Staged rollout serve para:', o: ['Liberar para uma porcentagem e ampliar se estiver estável', 'Testar só no emulador', 'Trocar keystore', 'Mudar preço'], a: 0, w: 'Lançamento gradual.' }
      ]
    }
  ]
});
