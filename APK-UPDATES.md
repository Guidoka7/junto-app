# APK automático e central de atualizações

Cada push na main executa .github/workflows/android.yml: check, testes Node, parser Java, testes de navegador, sincronização Capacitor, testes Android e assembleDebug. O APK passa por apksigner verify antes da publicação.

A versão Android usa package.json + SHA curto + run_number + run_attempt, por exemplo 1.1.1-abc1234.3.1. O versionCode continua usando github.run_number. Não é preciso editar package.json a cada commit. O version.json embarcado recebe a mesma versão e o SHA do build.

O job rolling serializa publicações e atualiza somente a release/tag latest, marcada como prerelease. Releases v* continuam versionadas e conservam o fluxo opcional de assinatura existente. A rolling usa make_latest=false, preservando /releases/latest para releases versionadas; a central consulta explicitamente /releases/tags/latest.

O script confere tamanho e SHA-256, envia um APK com nome único, atualiza os metadados da release e só então remove assets antigos. Falha de upload preserva o APK anterior. Um build validado pode ser publicado enquanto o próximo commit compila; uma execução mais antiga que a já publicada não pode substituí-la. Commits retirados do histórico da main são rejeitados.

A assinatura automática é DEBUG, usando o cache junto-debug-key-REPOSITORY_ID-v1 existente. É um build de teste. Atualização por cima requer a mesma assinatura; perda do cache pode gerar outra chave debug. Nenhuma chave de produção nova é criada. Secrets de assinatura existentes são usados apenas para tags v*.

A central existente junto-updates.vercel.app tem seu código preservado em updates/. O endpoint /version.json lê os metadados do APK publicado e /apk redireciona para browser_download_url do mesmo asset, nunca para uma página de release. As respostas não são armazenadas em cache. A página atualiza os dados a cada minuto. Quando o novo build falha, continua mostrando a última entrega publicada.

Publicação da central: implantar os arquivos de updates/ na raiz do projeto Vercel EXISTENTE junto-updates (prj_wpOzgNGZqS0RfFY5EPNDmRGLWnrV), equipe Junto app. Ela permanece separada do deploy web principal. Sua consulta dinâmica dispensa novos deploys da central a cada APK.

Os artifacts do Actions expiram em 7 dias; somente o APK atual permanece na release rolling. Releases versionadas por tag não são removidas.
