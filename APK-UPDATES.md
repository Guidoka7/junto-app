# APK automático e central de atualizações

Cada push na main executa .github/workflows/android.yml: check, testes Node, parser Java, testes de navegador, sincronização Capacitor, testes Android e assembleDebug. O APK passa por apksigner verify antes da publicação.

A versão Android usa package.json + SHA curto + run_number + run_attempt, por exemplo 1.1.1-abc1234.3.1. O versionCode continua usando github.run_number. Não é preciso editar package.json a cada commit. O version.json embarcado recebe a mesma versão e o SHA do build.

O job rolling serializa publicações e atualiza somente a release/tag latest, marcada como prerelease. Releases v* continuam versionadas e conservam o fluxo opcional de assinatura existente. A rolling usa make_latest=false, preservando /releases/latest para releases versionadas; a central consulta explicitamente /releases/tags/latest.

O script confere tamanho e SHA-256, envia um APK com nome único, atualiza os metadados da release e só então remove assets antigos. Falha de upload preserva o APK anterior. Um build validado pode ser publicado enquanto o próximo commit compila; uma execução mais antiga que a já publicada não pode substituí-la. Commits retirados do histórico da main são rejeitados.

A assinatura automática é DEBUG. O workflow restaura o cache junto-debug-key-REPOSITORY_ID-v1 existente; se faltar na primeira execução, cria e salva uma chave de teste antes do build. O Gradle usa explicitamente esse arquivo. Após salvar, o workflow restaura a chave canônica para evitar divergência em execuções concorrentes. É um build de teste. Atualização por cima requer a mesma assinatura; o certificado público SHA-256 é registrado e uma mudança de assinatura bloqueia a substituição da entrega anterior. O cache antigo apontava para um arquivo inexistente, portanto as assinaturas anteriores não foram preservadas. Nenhuma chave de produção nova é criada. Secrets de assinatura existentes são usados apenas para tags v*.

A central existente junto-updates.vercel.app tem seu código preservado em updates/. O endpoint /version.json lê os metadados do APK publicado e /apk redireciona para browser_download_url do mesmo asset, nunca para uma página de release. As respostas não são armazenadas em cache. A página atualiza os dados a cada minuto. Quando o novo build falha, continua mostrando a última entrega publicada.

Publicação da central: implantar os arquivos de updates/ na raiz do projeto Vercel EXISTENTE junto-updates (prj_wpOzgNGZqS0RfFY5EPNDmRGLWnrV), equipe Junto app. Ela permanece separada do deploy web principal. Sua consulta dinâmica dispensa novos deploys da central a cada APK.

Os artifacts do Actions expiram em 7 dias; somente o APK atual permanece na release rolling. Releases versionadas por tag não são removidas.

## Atualizações dentro do próprio aplicativo

O APK tem o painel **Ajustes → Atualizações** com o identificador do build instalado, checagem manual e botão de download quando a release rolling possui build mais recente. Na abertura, uma consulta à API pública da release `latest` compara o runNumber e a tentativa do APK com os metadados da última release. Quando há novidade e o usuário está logado, aparece um modal com **Baixar APK atualizado** e **Agora não**. A recusa vale para aquele build, e a notificação retorna apenas quando aparecer outro. O app também verifica ao voltar ao primeiro plano e, se permanecer aberto, no máximo a cada hora, sem consultas repetidas a cada render.

O download agora é realizado **dentro do aplicativo** pelo plugin Android Capacitor `JuntoUpdater`, registrado em `MainActivity`. Ao tocar **Baixar e instalar dentro do app**, o APK oficial é transferido via HTTPS com redirecionamentos restritos, progresso no modal e cache privado do Juntô. Antes da instalação, o plugin confere tamanho, SHA-256, nome do pacote, assinatura Android do app atual e impede downgrade. O arquivo não é aberto no navegador, no gerenciador de arquivos nem na página do GitHub. O botão permite cancelar o download e tentar novamente. 

A instalação **precisa obrigatoriamente da confirmação do Android** (não é silenciosa). Na primeira atualização, o sistema pode pedir autorização para o Juntô instalar apps; a pessoa libera em Ajustes e retorna ao modal, tocando **Instalar atualização** para abrir a tela oficial do instalador. A permissão `REQUEST_INSTALL_PACKAGES` existe apenas para o fluxo de APK distribuído diretamente; distribuições futuras pela Play Store devem rever essa permissão e usar o fluxo de atualizações da loja. A atualização por cima exige a mesma assinatura debug, não apaga os registros e não executa conteúdo remoto como código.

**Compatibilidade:** APKs já instalados que só possuem `openDownload()` não conseguem ganhar capacidades nativas pelo PWA. Exigem uma última instalação manual de um APK que contenha `downloadAndInstall()`; a partir dessa versão, novos APKs baixam dentro do app. A versão web segue com Service Worker, sem APK.

O site PWA continua usando o Service Worker para atualizações sem APK; o item **Atualizações** nas configurações também permite verificar a versão web. O verificador nativo usa o `dist/version.json` gerado no próprio build e os metadados assinados do fluxo de release. Para ativar o novo **instalador integrado** em um APK antigo, é necessária uma **única atualização manual** para uma versão que já inclua o plugin novo. Daí em diante, o download será interno, com confirmação no instalador do sistema.
