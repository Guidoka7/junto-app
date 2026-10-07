import {createClient} from '@supabase/supabase-js';
import {Capacitor} from '@capacitor/core';
import {clone,equal,mergeStates,validateState,conflictLabel} from '../features/sync-core.js';
import {escapeHTML as esc,formatMoney,timedFetch,timeoutSignal} from '../features/ui.js';
import {saveDownload as download} from '../features/download.js';
const app=window.JuntoApp,PERSONAL_KEY='junto-personal-backup-v1';
let client=null,user=null,sessionReady=false,checkpoint=null,subscription=null,authLoading=null,authLoadingUID=null,authGeneration=0;
let syncRunning=false,syncTimer=null,conflict=null,authView='login',passwordRecovery=false;
let syncCompletion=Promise.resolve(),spaceSwitching=false;
let message='Dados neste aparelho',lastSync=null,restoreDraft=null;
const PENDING_EMAIL_KEY='junto-auth-pending-email';
let pendingEmail=localStorage.getItem(PENDING_EMAIL_KEY)||'',authNotice=pendingEmail?'Confirme seu e-mail pelo link recebido e entre com sua senha.':'';
const confirmationCallback=new URLSearchParams(location.search).has('code')||/access_token=|error_description=/.test(location.hash);
function confirmationFallback(){authView='login';authNotice='Após confirmar seu e-mail, entre com sua senha para continuar.';open();}
const parse=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
const config=()=>window.JuntoCloudConfig;
let expiryTimer=null,sessionExpiresAt=0;
function lock(){app.setAccess(false);}
function showLoading(){lock();document.getElementById('auth-gate').innerHTML='<div class="auth-card"><h1>Juntô</h1><p>Verificando acesso…</p></div>';}
function deploymentError(){lock();document.getElementById('auth-gate').innerHTML='<div class="auth-card"><h1>Implantação incompleta</h1><p role="alert">Administrador: configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no build e publique novamente o Juntô.</p></div>';}
function accessError(e){lock();document.getElementById('auth-gate').innerHTML=`<div class="auth-card"><h1>Não foi possível verificar o acesso</h1><p role="alert">${esc(errorMessage(e))}</p><button class="btn primary wide" data-feature="cloud-retry">Tentar novamente</button>${user?'<button class="btn ghost wide" data-feature="cloud-signout-confirm">Sair da conta</button>':''}</div>`;}
function scheduleExpiry(session){clearTimeout(expiryTimer);sessionExpiresAt=(session?.expires_at||0)*1000;const ms=sessionExpiresAt-Date.now();if(session)expiryTimer=setTimeout(()=>handleSession(null),Math.max(0,Math.min(ms,2147483647)));}
const checkpointKey=uid=>`junto-cloud-checkpoint:${config()?.url}:${uid}`;
const archiveKey=()=>`junto-cloud-personal-archive:${config()?.url}:${user?.id}`;
function saveCheckpoint(){if(checkpoint&&user)localStorage.setItem(checkpointKey(user.id),JSON.stringify(checkpoint));}
function backupPersonal(){if(!app.getSlot())localStorage.setItem(PERSONAL_KEY,JSON.stringify(app.getState()));}
const userName=()=>user?.user_metadata?.display_name||app.getState().users.find(u=>u.id===app.getActive())?.name||'';
const connectionMessage=()=>checkpoint?.members===2?'Dupla conectada':'Conta conectada';
function accountIcon(name){
  const paths={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 18"/>',sync:'<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M18 18a8 8 0 0 1-13-3"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4"/>',archive:'<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8M10 12h4"/>',chevron:'<path d="m9 5 7 7-7 7"/>',exit:'<path d="M9 5H4v14h5m0-7h12m-4-4 4 4-4 4"/>'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
function accountAction(feature,icon,title,description,primary=false){return `<button class="cloud-action${primary?' cloud-action-primary':''}" data-feature="${feature}"><span class="cloud-action-icon">${accountIcon(icon)}</span><span class="cloud-action-copy"><strong>${title}</strong><small>${description}</small></span><span class="cloud-action-chevron">${accountIcon('chevron')}</span></button>`;}
function accountHTML(){
  const profiles=app.getState().users,profile=profiles.find(u=>u.id===checkpoint.slot),name=profile?.name||userName()||'Sua conta',paired=checkpoint.members===2;
  const connection=paired
    ?`<div class="cloud-connected"><span class="cloud-action-icon">${accountIcon('heart')}</span><div><strong>${profiles.map(u=>esc(u.name)).join(' &amp; ')}</strong><p>Duas contas no mesmo espaço.</p></div></div>`
    :`<p class="cloud-section-description">Escolha como juntar as duas contas.</p><div class="cloud-connect-actions">${checkpoint.slot==='a'?accountAction('cloud-invite','heart','Convidar meu amor','Gerar um código para compartilhar',true)+accountAction('cloud-join-open','code','Já tenho um código','Usar o convite que recebi'):''}</div>`;
  return `<div class="cloud-account-layout">
    <div class="cloud-profile"><span class="cloud-profile-avatar" aria-hidden="true">${esc(Array.from(name.trim())[0]?.toUpperCase()||'J')}</span><div><strong>${esc(name)}</strong><span>${esc(user.email||'Sua conta')}</span></div></div>
    <section class="cloud-couple" aria-labelledby="cloud-couple-title"><div class="cloud-section-head"><h3 id="cloud-couple-title">${paired?'Nossa dupla':'Conectar meu amor'}</h3><span class="cloud-membership${paired?' is-paired':''}">${paired?'Conectados':'Modo solo'}</span></div>${connection}</section>
    ${checkpoint.archivePending?'<div class="cloud-restore-notice"><strong>Seus registros solo estão guardados</strong><p>Traga os dados anteriores para esta dupla.</p><button class="btn secondary wide" data-feature="cloud-restore-open">Recuperar meus registros</button></div>':''}
    <section class="cloud-sync-section" aria-label="Sincronização">
      <div class="cloud-sync-row"><div><h3>Sincronização</h3><p id="cloud-live-status" role="status" aria-live="polite">${esc(message)}</p></div><button class="cloud-sync-button" data-feature="cloud-sync">${accountIcon('sync')}<span>Sincronizar</span></button></div>
      ${checkpoint.dirty?'<p class="cloud-pending-note">Há alterações neste aparelho aguardando envio. Mantenha o app instalado até sincronizar.</p>':''}
    </section>
    <details class="cloud-backups">
      <summary><span class="cloud-action-icon">${accountIcon('archive')}</span><span class="cloud-action-copy"><strong>Meus backups</strong><small>Baixar uma cópia dos seus dados</small></span><span class="cloud-action-chevron">${accountIcon('chevron')}</span></summary>
      <div class="cloud-backup-actions">${accountAction('cloud-export','download','Exportar registros atuais','Salvar os dados deste espaço')}${accountAction('cloud-export-personal','archive','Exportar dados anteriores','Baixar uma cópia do modo solo')}</div>
    </details>
    <div class="cloud-account-footer"><button class="cloud-signout-button" data-feature="cloud-signout">${accountIcon('exit')}Sair da conta</button></div>
  </div>`;
}
function setMessage(text){message=text;updateStatus();}
function updateStatus(){let button=document.getElementById('cloud-account-button');if(!button){button=document.createElement('button');button.id='cloud-account-button';button.className='cloud-account-pill';button.dataset.feature='cloud-open';document.querySelector('.topbar')?.after(button);}button.textContent=message;button.classList.toggle('has-pending',Boolean(checkpoint?.dirty));const status=document.getElementById('cloud-live-status');if(status)status.textContent=message;}
function settingsHTML(){return `<div class="feature-card"><div><span class="feature-eyebrow">Sua conta</span><h3>Juntô em dois celulares</h3><p>${esc(message)}. Cada pessoa entra na própria conta; os registros da dupla ficam juntos.</p></div><button class="btn primary" data-feature="cloud-open">${user?'Ver minha conta':'Entrar / criar conta'}</button><button class="btn secondary" data-feature="cloud-export">Exportar meus dados</button></div>`;}
const errorMessage=e=>{
  const text=String(e?.message||e||'Não foi possível conectar.');
  const errors={LOGIN_REQUIRED:'Entre na sua conta.',ALREADY_MEMBER:'Esta conta já está conectada a uma dupla. Não é possível entrar em outra dupla.',NOT_OWNER:'Só quem criou a dupla pode gerar um convite.',COUPLE_FULL:'Essa dupla já tem duas pessoas.',INVITE_INVALID:'O convite está incorreto, expirou ou já foi usado.',INVITE_OWN:'Esse código é seu. Peça o código gerado pela outra pessoa.',INVALID_NAME:'Informe seu nome com até 24 caracteres.',TOO_MANY_ATTEMPTS:'Muitas tentativas de convite. Aguarde uma hora.',ACCESS_DENIED:'Sua conta não tem acesso a esta dupla.',MISSING_MEMBER_PROFILE:'Os dois perfis precisam permanecer no espaço.',RESTORE_CHANGED:'As finanças mudaram. Volte à conta e confira a recuperação novamente.',INVALID_SOLO_PROFILE:'O arquivo anterior precisa conter apenas o seu perfil individual.',INVALID_PAYLOAD:'Os dados não puderam ser sincronizados. Exporte um backup para conferir.'};
  for(const[key,value]of Object.entries(errors))if(text.includes(key))return value;
  if(/invalid login credentials/i.test(text))return 'E-mail ou senha incorretos.';
  if(/email not confirmed/i.test(text))return 'Seu e-mail ainda não foi confirmado. Abra o link recebido e depois entre com sua senha.';
  if(/fetch|network|abort/i.test(text))return 'Sem conexão. Os registros continuam salvos neste aparelho.';
  if(/junto_.*does not exist|could not find.*junto_/i.test(text))return 'O servidor do Juntô ainda precisa ser ativado.';
  return text;
};
async function rpc(name,args={}){const{data,error}=await client.rpc(name,args).abortSignal(timeoutSignal(15000));if(error){if(/^PGRST30[123]$/.test(error.code||'')||/jwt.*expired|LOGIN_REQUIRED/i.test(error.message||''))await handleSession(null);throw error;}if(data?.error)throw new Error(data.error);return data;}
function redirectURL(){return Capacitor.isNativePlatform()?'junto://auth-callback':`${location.origin}${location.pathname}`;}
function configure(value){
  const url=String(value?.url||'').replace(/\/+$/,''),key=String(value?.publishableKey||'').trim();
  if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(url))throw new Error('Informe o endereço HTTPS do projeto Supabase.');
  let valid=key.startsWith('sb_publishable_')&&key.length>25;
  if(key.startsWith('eyJ')){try{valid=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{valid=false;}}
  if(!valid)throw new Error('Use somente a chave publicável (publishable ou anon). Chaves secretas não entram no app.');
  return{url,publishableKey:key};
}
async function startClient(){
  showLoading();const value=config();if(!value?.url||!value?.publishableKey){deploymentError();return;}
  let checked;try{checked=configure(value);}catch{deploymentError();return;}
  client=createClient(checked.url,checked.publishableKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:!Capacitor.isNativePlatform()},global:{fetch:timedFetch}});
  client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')passwordRecovery=true;setTimeout(()=>handleSession(session).catch(accessError),0);});
  const{data,error}=await client.auth.getSession();if(error){if(confirmationCallback){confirmationFallback();return;}accessError(error);return;}await handleSession(data.session);
}
async function handleSession(session){
  if(session&&(!session.expires_at||session.expires_at*1000<=Date.now()))session=null;
  scheduleExpiry(session);
  if(session){authView='login';authNotice='';pendingEmail='';localStorage.removeItem(PENDING_EMAIL_KEY);}
  if(!session){lock();passwordRecovery=false;authGeneration++;authLoading=null;authLoadingUID=null;sessionReady=false;if(subscription){client.removeChannel(subscription);subscription=null;}if(user&&localStorage.getItem('junto-cloud-account')){if(checkpoint)saveCheckpoint();const personal=parse(PERSONAL_KEY);app.setSlot(null);if(personal)app.applyState(personal);localStorage.removeItem('junto-cloud-account');}user=null;checkpoint=null;conflict=null;setMessage('Entre na sua conta');open();return;}
  if(user?.id===session.user.id&&sessionReady&&(app.hasAccess()||spaceSwitching)){if(passwordRecovery&&!spaceSwitching)open();return;}
  if(authLoading&&authLoadingUID===session.user.id)return authLoading;
  showLoading();const generation=++authGeneration,sessionUID=session.user.id;authLoadingUID=sessionUID;
  const loading=(async()=>{
    const previous=localStorage.getItem('junto-cloud-account');user=session.user;sessionReady=true;
    const saved=parse(checkpointKey(user.id)),local=previous===user.id?app.getState():saved?.pending;
    if(!previous)backupPersonal();checkpoint=saved;localStorage.setItem('junto-cloud-account',user.id);if(checkpoint)app.setSlot(checkpoint.slot);
    try{const remote=await rpc('junto_read_space');if(generation!==authGeneration||user?.id!==sessionUID)return;if(!remote){checkpoint=null;app.setSlot(null);app.applyState(app.freshState(userName()));setMessage('Escolha seu espaço');open();return;}
      validateState(remote.payload);
      if(checkpoint?.spaceId===remote.space_id&&checkpoint.base&&local){const result=mergeStates(checkpoint.base,local,remote.payload);
        if(result.conflicts.length){conflict={base:clone(saved.base),local:clone(local),remote:clone(remote.payload),revision:remote.revision,conflicts:result.conflicts};checkpoint={...checkpoint,pending:clone(local),dirty:true,members:remote.members};app.applyState(local);setMessage('Alterações para conferir');}
        else{checkpoint={...checkpoint,revision:remote.revision,base:clone(remote.payload),pending:result.state,dirty:!equal(result.state,remote.payload),members:remote.members};app.applyState(result.state);}
      }else{checkpoint={spaceId:remote.space_id,slot:remote.slot,revision:remote.revision,base:clone(remote.payload),pending:clone(remote.payload),dirty:false,members:remote.members};app.applyState(remote.payload);}
      app.setSlot(remote.slot);checkpoint.slot=remote.slot;checkpoint.archivePending=Boolean(remote.personal_archive_pending);saveCheckpoint();subscribe();app.setAccess(true);if(!conflict){setMessage(checkpoint.dirty?'Mudanças aguardando sincronização':connectionMessage());if(checkpoint.dirty)syncSoon();}if(passwordRecovery)open();
    }catch(e){if(generation!==authGeneration||user?.id!==sessionUID)return;if(checkpoint?.spaceId&&checkpoint?.pending&&Date.now()<sessionExpiresAt&&/fetch|network|abort/i.test(String(e?.message||e))){validateState(local||checkpoint.pending);app.setSlot(checkpoint.slot);app.applyState(local||checkpoint.pending);app.setAccess(true);setMessage('Sem conexão · dados salvos');return;}setMessage(errorMessage(e));accessError(e);throw e;}
  })();authLoading=loading;try{await loading;}finally{if(authLoading===loading){authLoading=null;authLoadingUID=null;}}
}
function subscribe(){if(subscription)client.removeChannel(subscription);subscription=client.channel(`junto:${checkpoint.spaceId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'junto_snapshots',filter:`space_id=eq.${checkpoint.spaceId}`},()=>syncSoon()).subscribe();}
function syncSoon(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>synchronize(),500);}
async function synchronize(force=false){
  if(!client||!user||!sessionReady||!checkpoint||conflict||spaceSwitching)return;
  if(syncRunning)return syncCompletion;
  if(!force&&navigator.onLine===false){setMessage('Sem conexão · mudanças no aparelho');return;}
  const currentCheckpoint=checkpoint,currentUserID=user.id;
  syncRunning=true;
  let finish;syncCompletion=new Promise(resolve=>{finish=resolve;});
  try{
    // One explicit sync should converge clean, non-conflicting edits from both
    // devices. Retrying here avoids depending on a later timer after a revision
    // conflict or after state changed while a request was in flight.
    for(let pass=0;pass<4;pass++){
      if(checkpoint!==currentCheckpoint||user?.id!==currentUserID)return;
      if(checkpoint.dirty){
        const sent=app.getState();validateState(sent);setMessage('Sincronizando…');
        const response=await rpc('junto_sync_space',{p_space_id:checkpoint.spaceId,p_revision:checkpoint.revision,p_payload:sent});
        if(checkpoint!==currentCheckpoint||user?.id!==currentUserID)return;
        if(response.conflict){
          const local=app.getState(),oldBase=clone(checkpoint.base),result=mergeStates(oldBase,local,response.payload);
          if(result.conflicts.length){
            conflict={base:oldBase,local,remote:clone(response.payload),revision:response.revision,conflicts:result.conflicts};
            checkpoint.pending=clone(local);checkpoint.dirty=true;setMessage('Alterações para conferir');saveCheckpoint();return;
          }
          checkpoint.base=clone(response.payload);checkpoint.revision=response.revision;checkpoint.pending=result.state;
          checkpoint.dirty=!equal(result.state,response.payload);app.applyState(result.state);
          if(checkpoint.dirty)continue;
          lastSync=Date.now();break;
        }
        checkpoint.base=clone(sent);checkpoint.revision=response.revision;checkpoint.pending=app.getState();
        checkpoint.dirty=!equal(checkpoint.pending,sent);lastSync=Date.now();
        if(checkpoint.dirty)continue;
        break;
      }

      const remote=await rpc('junto_read_space');
      if(checkpoint!==currentCheckpoint||user?.id!==currentUserID)return;
      if(!remote)throw new Error('ACCESS_DENIED');
      checkpoint.members=remote.members;checkpoint.archivePending=Boolean(remote.personal_archive_pending);
      if(remote.revision!==checkpoint.revision){
        const local=app.getState(),oldBase=clone(checkpoint.base),result=mergeStates(oldBase,local,remote.payload);
        if(result.conflicts.length){
          conflict={base:oldBase,local,remote:clone(remote.payload),revision:remote.revision,conflicts:result.conflicts};
          checkpoint.pending=clone(local);checkpoint.dirty=true;setMessage('Alterações para conferir');saveCheckpoint();return;
        }
        checkpoint.base=clone(remote.payload);checkpoint.revision=remote.revision;checkpoint.pending=result.state;
        checkpoint.dirty=!equal(result.state,remote.payload);app.applyState(result.state);
        if(checkpoint.dirty)continue;
      }
      lastSync=Date.now();break;
    }
    saveCheckpoint();
    setMessage(checkpoint.dirty?'Mudanças aguardando sincronização':`Sincronizado${lastSync?' · '+new Date(lastSync).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):''}`);
    if(checkpoint.dirty&&!conflict)syncSoon();
  }catch(e){
    setMessage(errorMessage(e));try{saveCheckpoint();}catch{setMessage('Não foi possível salvar a fila. Exporte um backup.');}
  }finally{syncRunning=false;finish();}
}
function joinForm(){
  return `<form class="form" data-feature-form="cloud-join"><div class="field"><label for="cloud-join-name">Seu nome</label><input id="cloud-join-name" name="name" maxlength="24" autocomplete="given-name" value="${esc(userName())}" required></div><div class="field"><label for="cloud-invite">Código recebido do seu amor</label><input id="cloud-invite" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" placeholder="XXXX-XXXX-XXXX-XXXX" aria-describedby="cloud-join-note" required><small>Cole o código que a outra pessoa gerou. Ele vale por 48 horas.</small></div><p class="form-note" id="cloud-join-note">${checkpoint?'Seu saldo, gastos, contas, entradas e planos serão levados para a dupla. Os registros da outra pessoa também serão mantidos. Uma cópia do seu espaço solo continuará guardada.':'Cada pessoa usa sua própria conta. Os registros ficam juntos no mesmo espaço.'}</p>${checkpoint?'<label class="check"><input type="checkbox" name="confirm-space" required><span>Quero juntar meus registros com os do meu amor.</span></label>':''}<p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Conectar com esse código</button></form>`;
}
async function openRestore(){
  const generation=authGeneration,uid=user?.id;
  await synchronize(true);
  if(generation!==authGeneration||uid!==user?.id)return;
  if(!checkpoint?.archivePending)return open();
  if(checkpoint.dirty||conflict)throw new Error('Sincronize ou confira suas alterações antes de recuperar os registros.');
  const personal=await rpc('junto_read_personal_archive');
  if(generation!==authGeneration||uid!==user?.id)return;
  if(!personal)throw new Error('Não há um espaço individual anterior para recuperar.');
  validateState(personal);
  const state=app.getState(),slot=checkpoint.slot,current=state.users.find(u=>u.id===slot).balance,previous=personal.users[0].balance;
  const hasOwnRecords=['transactions','bills','incomes','received','saves','requests'].some(k=>(state[k]||[]).some(row=>['payer','person','actor','by','author'].some(field=>row[field]===slot)||row.split?.some(part=>part.id===slot)));
  const usePrevious=current===0&&!hasOwnRecords;
  restoreDraft={spaceId:checkpoint.spaceId,revision:checkpoint.revision,generation,uid};
  const counts=[['transactions','gastos'],['bills','contas'],['incomes','entradas'],['received','recebimentos'],['goals','planos']].filter(([key])=>personal[key]?.length).map(([key,label])=>`<li>${personal[key].length} ${label}</li>`).join('');
  app.openModal('Recuperar registros solo',`<p class="modal-sub">Seus registros anteriores serão adicionados aos desta dupla. Os registros do seu amor serão mantidos.</p>${counts?`<ul class="cloud-restore-counts">${counts}</ul>`:''}<form class="form" data-feature-form="cloud-restore"><fieldset class="conflict-choice"><legend>Como recuperar seu saldo?</legend><label><input type="radio" name="restore-balance" value="solo" ${usePrevious?'checked':''} required><span>Somar o saldo solo ao atual: <strong>${formatMoney(previous+current)}</strong><small>Recuperar ${formatMoney(previous)} e manter os movimentos feitos na dupla.</small></span></label><label><input type="radio" name="restore-balance" value="current" ${usePrevious?'':'checked'} required><span>Manter saldo atual: <strong>${formatMoney(current)}</strong></span></label></fieldset><p class="form-note">Os gastos antigos não serão descontados novamente. A cópia original continuará disponível em “Meus backups”.</p><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Trazer meus registros para a dupla</button></form><button class="btn ghost wide" data-feature="cloud-open">Voltar</button>`,'cloud-restore');
}
function openJoin(){
  if(!user)return open();
  if(checkpoint&&(checkpoint.slot!=='a'||checkpoint.members>=2))throw new Error('ALREADY_MEMBER');
  app.openModal('Já tenho um código',`<p class="modal-sub">Bora juntar as duas contas? Insira o convite recebido do seu amor.</p>${joinForm()}<button class="btn ghost wide" data-feature="cloud-open">Voltar</button>`,'cloud-join');
}
function open(){
  if(conflict)return showConflicts();
  if(passwordRecovery){app.openModal('Criar nova senha',`<p class="modal-sub">Escolha uma senha nova para sua conta.</p><form class="form" data-feature-form="cloud-password"><div class="field"><label for="cloud-new-password">Nova senha</label><input id="cloud-new-password" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></div><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Salvar nova senha</button></form>`,'cloud-password');return;}
  if(!client){deploymentError();return;}
  if(!user){lock();const signup=authView==='signup';app.openModal(signup?'Criar minha conta':'Entrar no Juntô',`<p class="modal-sub">Entre ou crie sua conta para continuar.</p>${authNotice?`<div class="auth-notice" role="status">${esc(authNotice)}${pendingEmail?`<span>${esc(pendingEmail)}</span>`:''}</div>`:''}<form class="form" data-feature-form="cloud-auth" data-mode="${signup?'signup':'login'}">${signup?'<div class="field"><label for="cloud-name">Seu nome</label><input id="cloud-name" name="name" maxlength="24" autocomplete="given-name" required></div>':''}<div class="field"><label for="cloud-email">E-mail</label><input id="cloud-email" name="email" type="email" autocomplete="email" value="${esc(pendingEmail)}" required></div><div class="field"><label for="cloud-password">Senha</label><input id="cloud-password" name="password" type="password" minlength="8" maxlength="128" autocomplete="${signup?'new-password':'current-password'}" required></div><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">${signup?'Criar minha conta':'Entrar'}</button></form><div class="feature-actions"><button class="btn secondary" data-feature="cloud-auth-toggle">${signup?'Já tenho conta':'Criar conta'}</button><button class="btn ghost" data-feature="cloud-forgot">Esqueci minha senha</button></div>${pendingEmail&&!signup?'<div class="auth-confirm-actions"><button class="btn secondary wide" data-feature="cloud-confirmed">Já confirmei meu e-mail</button><button class="btn ghost wide" data-feature="cloud-resend">Reenviar confirmação</button></div>':''}`,'cloud-auth');return;}
  if(!checkpoint){app.openModal('Seu espaço no Juntô',`<p class="modal-sub">${esc(user.email||'Sua conta')} está conectada.</p><form class="form" data-feature-form="cloud-create"><div class="field"><label for="cloud-space-name">Seu nome</label><input id="cloud-space-name" name="name" maxlength="24" value="${esc(userName())}" required></div><p class="form-note">Seu espaço começa vazio. Você pode começar sozinho e convidar seu amor depois.</p><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Criar meu espaço</button></form><hr class="feature-divider"><h3>Já tenho um código</h3>${joinForm()}<button class="btn ghost wide" data-feature="cloud-signout">Sair da conta</button>`,'cloud-space');return;}
  app.openModal('Minha conta',accountHTML(),'cloud-account');
}
function showConflicts(){const result=mergeStates(conflict.base,app.getState(),conflict.remote);conflict.conflicts=result.conflicts;if(!result.conflicts.length){checkpoint.base=clone(conflict.remote);checkpoint.revision=conflict.revision;checkpoint.pending=result.state;checkpoint.dirty=!equal(result.state,conflict.remote);conflict=null;app.applyState(result.state);saveCheckpoint();syncSoon();return open();}
  const describe=(value,path)=>{
    if(value===undefined)return 'Removido';
    if(Number.isSafeInteger(value)&&['balance','amount','saved','target'].includes(path.at(-1)))return formatMoney(value);
    if(value&&typeof value==='object'&&Number.isSafeInteger(value.amount)){
      const owner=value.payer||value.person||value.actor,who=app.getState().users.find(u=>u.id===owner)?.name||({half:'meio a meio',prop:'proporcional à renda'}[owner]||'');
      const role=path[0]==='received'?'recebido por':path[0]==='saves'?'guardado por':'pago por';
      return [value.name||value.title||'Registro',formatMoney(value.amount),who?`${role} ${who}`:'',value.balanceDelta===0?'saldo já atualizado':'',value.status==='skipped'?'não recebido':''].filter(Boolean).join(' · ');
    }
    return typeof value==='object'?JSON.stringify(value).slice(0,500):String(value);
  };
  app.openModal('Conferir alterações simultâneas',`<p class="modal-sub">Os dois celulares alteraram o mesmo campo. Os outros registros serão combinados; escolha apenas o valor que precisa prevalecer.</p><form class="form" data-feature-form="cloud-conflicts">${result.conflicts.map((c,i)=>`<fieldset class="conflict-choice"><legend>${esc(conflictLabel(c.path))}</legend><label><input type="radio" name="choice-${i}" value="local" required><span>Neste aparelho: ${esc(describe(c.local,c.path))}</span></label><label><input type="radio" name="choice-${i}" value="remote"><span>Na nuvem: ${esc(describe(c.remote,c.path))}</span></label></fieldset>`).join('')}<p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Combinar e sincronizar</button></form><button class="btn secondary wide" data-feature="cloud-export-conflict">Baixar as duas versões</button>`,'cloud-conflicts');
}
window.addEventListener('junto:state-changed',event=>{if(!checkpoint||!user)return;checkpoint.pending=clone(event.detail);checkpoint.dirty=!equal(checkpoint.pending,checkpoint.base);try{saveCheckpoint();setMessage(conflict?'Alterações para conferir':checkpoint.dirty?'Mudanças aguardando sincronização':message);if(!conflict)syncSoon();}catch{setMessage('Não foi possível salvar a fila. Exporte um backup.');}});
document.addEventListener('click',async event=>{const button=event.target.closest('[data-feature]');if(!button?.dataset.feature.startsWith('cloud-'))return;event.preventDefault();try{const action=button.dataset.feature;
  if(action==='cloud-retry'){if(!client)return startClient();const{data,error}=await client.auth.getSession();if(error)throw error;return handleSession(data.session);}
  if(action==='cloud-open')return open();if(action==='cloud-join-open')return openJoin();if(action==='cloud-restore-open')return await openRestore();if(action==='cloud-export')return app.exportBackup();if(action==='cloud-export-personal'){const previous=parse(archiveKey())||await rpc('junto_read_personal_archive')||parse(PERSONAL_KEY);if(!previous)throw new Error('Não há um espaço individual anterior para exportar.');await download(previous,'Junto-dados-anteriores.json');return;}
  if(action==='cloud-auth-toggle'){authView=authView==='login'?'signup':'login';authNotice='';return open();}
  if(action==='cloud-confirmed'){authView='login';authNotice='Entre com seu e-mail e senha para continuar.';return open();}
  if(action==='cloud-resend'){button.disabled=true;try{const{error}=await client.auth.resend({type:'signup',email:pendingEmail,options:{emailRedirectTo:redirectURL()}});if(error)throw error;authNotice='Solicitação enviada. Confira sua caixa de entrada e a pasta de spam.';}catch(e){authNotice=errorMessage(e);}finally{button.disabled=false;}return open();}
  if(action==='cloud-auth-login'){authView='login';return open();}
  if(action==='cloud-forgot'){app.openModal('Recuperar minha senha','<form class="form" data-feature-form="cloud-forgot"><div class="field"><label for="recover-email">Seu e-mail</label><input name="email" id="recover-email" type="email" required autocomplete="email"></div><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">Enviar recuperação</button></form>','cloud-forgot');return;}
  if(action==='cloud-sync'){await synchronize(true);return open();}
  if(action==='cloud-invite'){await synchronize();if(checkpoint.dirty||conflict)throw new Error('Sincronize as alterações antes de convidar.');const invite=await rpc('junto_make_invite',{p_space_id:checkpoint.spaceId}),code=invite.code.match(/.{1,4}/g).join('-');app.openModal('Convide seu amor',`<p class="modal-sub">A outra pessoa entra na própria conta, toca em “Já tenho um código” e insere este convite. Ele vale por 48 horas e só pode ser usado uma vez.</p><div class="invite-code"><strong id="real-invite-code">${esc(code)}</strong><p>Válido até ${new Date(invite.expires_at).toLocaleString('pt-BR')}</p></div><button class="btn primary wide" data-feature="cloud-copy-invite" data-code="${esc(code)}">Copiar código</button><button class="btn secondary wide" data-feature="cloud-join-open">Já tenho um código</button><button class="btn ghost wide" data-feature="cloud-open">Voltar</button>`,'cloud-invite');return;}
  if(action==='cloud-copy-invite'){try{await navigator.clipboard.writeText(button.dataset.code);app.toast('Código copiado.');}catch{app.toast('Selecione e copie o código exibido.');}return;}
  if(action==='cloud-signout'){if(checkpoint?.dirty){app.openModal('Alterações ainda neste aparelho','<p class="modal-sub">Sincronize ou exporte uma cópia antes de sair. Assim, seus últimos registros ficam protegidos.</p><button class="btn primary wide" data-feature="cloud-sync">Sincronizar agora</button><button class="btn secondary wide" data-feature="cloud-export">Exportar registros</button><button class="btn ghost wide" data-feature="cloud-signout-confirm">Sair mantendo a fila neste aparelho</button>','cloud-signout');return;}return signOut();}
  if(action==='cloud-signout-confirm')return signOut();if(action==='cloud-export-conflict'){download({base:conflict.base,nesteAparelho:app.getState(),nuvem:conflict.remote},'Junto-conferencia-duas-versoes.json');return;}
}catch(e){app.toast('Não foi possível concluir.',errorMessage(e));}});
async function signOut(){restoreDraft=null;lock();if(checkpoint)saveCheckpoint();const{error}=await client.auth.signOut({scope:'local'});if(error)throw error;await handleSession(null);}
document.addEventListener('submit',async event=>{const form=event.target.closest('[data-feature-form]');if(!form?.dataset.featureForm.startsWith('cloud-'))return;event.preventDefault();const error=form.querySelector('.feature-error'),button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;error.textContent='';const data=new FormData(form),type=form.dataset.featureForm;
  try{
    if(type==='cloud-auth'){backupPersonal();const email=String(data.get('email')).trim(),password=String(data.get('password')),response=form.dataset.mode==='signup'?await client.auth.signUp({email,password,options:{data:{display_name:String(data.get('name')).trim()},emailRedirectTo:redirectURL()}}):await client.auth.signInWithPassword({email,password});if(response.error)throw response.error;if(!response.data.session){pendingEmail=email;localStorage.setItem(PENDING_EMAIL_KEY,email);authView='login';authNotice='Conta criada. Confirme seu e-mail pelo link recebido e depois entre com sua senha.';open();return;}await handleSession(response.data.session);return open();}
    if(type==='cloud-create'){const generation=authGeneration,uid=user?.id,name=String(data.get('name')).trim(),remote=await rpc('junto_create_space',{p_name:name,p_payload:app.freshState(name)});await adopt(remote,generation,uid);return open();}
    if(type==='cloud-join'){
      const code=String(data.get('code')||'').replace(/[\s-]/g,'').toUpperCase(),name=String(data.get('name')||'').trim();
      if(!/^[A-F0-9]{16}$/.test(code))throw new Error('Confira o código: são 16 letras de A a F e números, em quatro grupos.');
      if(!name||name.length>24)throw new Error('INVALID_NAME');
      if(checkpoint){
        if(data.get('confirm-space')!=='on')throw new Error('Confirme que deseja entrar no espaço da dupla.');
        await synchronize(true);if(checkpoint?.dirty)await synchronize(true);
        if(!user||!checkpoint)throw new Error('LOGIN_REQUIRED');
        if(checkpoint.slot!=='a'||checkpoint.members>=2)throw new Error('ALREADY_MEMBER');
        if(checkpoint.dirty||conflict)throw new Error('Sincronize ou confira suas alterações antes de conectar a dupla.');
        localStorage.setItem(archiveKey(),JSON.stringify(app.getState()));
      }
      const generation=authGeneration,uid=user?.id;spaceSwitching=true;clearTimeout(syncTimer);
      app.setAccess(false);document.getElementById('auth-gate').innerHTML='<div class="auth-card"><h1>Juntô</h1><p role="status">Conectando sua dupla…</p></div>';
      try{const remote=await rpc('junto_join_space',{p_code:code,p_name:name});await adopt(remote,generation,uid);open();}
      catch(e){if(generation===authGeneration&&user?.id===uid){if(checkpoint)app.setAccess(true);openJoin();document.querySelector('[data-feature-form="cloud-join"] .feature-error').textContent=errorMessage(e);document.getElementById('cloud-invite').value=String(data.get('code'));document.getElementById('cloud-join-name').value=name;}else throw e;}
      finally{spaceSwitching=false;if(checkpoint?.dirty)syncSoon();}
      return;
    }
    if(type==='cloud-forgot'){const{error:e}=await client.auth.resetPasswordForEmail(String(data.get('email')).trim(),{redirectTo:redirectURL()});if(e)throw e;error.textContent='Se esse e-mail estiver cadastrado, o link de recuperação será enviado.';return;}
    if(type==='cloud-restore'){
      if(!restoreDraft||restoreDraft.generation!==authGeneration||restoreDraft.uid!==user?.id||restoreDraft.spaceId!==checkpoint?.spaceId)throw new Error('LOGIN_REQUIRED');
      const choice=data.get('restore-balance');if(!['solo','current'].includes(choice))throw new Error('Escolha o saldo para seu perfil.');
      await synchronize(true);
      if(!checkpoint||checkpoint.dirty||conflict||checkpoint.revision!==restoreDraft.revision)throw new Error('RESTORE_CHANGED');
      const generation=authGeneration,uid=user.id;spaceSwitching=true;clearTimeout(syncTimer);
      app.setAccess(false);document.getElementById('auth-gate').innerHTML='<div class="auth-card"><h1>Juntô</h1><p role="status">Recuperando seus registros…</p></div>';
      try{const remote=await rpc('junto_restore_personal_archive',{p_revision:restoreDraft.revision,p_restore_balance:choice==='solo'});await adopt(remote,generation,uid);restoreDraft=null;open();app.toast('Seus registros voltaram.','Os dados do modo solo agora estão na dupla.');}
      catch(e){if(generation===authGeneration&&user?.id===uid){app.setAccess(true);open();app.toast('Não foi possível recuperar.',errorMessage(e));}else throw e;}
      finally{spaceSwitching=false;if(checkpoint?.dirty)syncSoon();}
      return;
    }
    if(type==='cloud-password'){const{error:e}=await client.auth.updateUser({password:String(data.get('password'))});if(e)throw e;passwordRecovery=false;app.toast('Senha atualizada.');return open();}
    if(type==='cloud-conflicts'){const choices={};conflict.conflicts.forEach((c,i)=>{const v=data.get(`choice-${i}`);if(!['local','remote'].includes(v))throw new Error('Escolha um valor para cada alteração.');choices[c.key]=v;});const result=mergeStates(conflict.base,app.getState(),conflict.remote,choices);if(result.conflicts.length)return showConflicts();checkpoint.base=clone(conflict.remote);checkpoint.revision=conflict.revision;checkpoint.pending=result.state;checkpoint.dirty=!equal(result.state,conflict.remote);conflict=null;app.applyState(result.state);saveCheckpoint();await synchronize();return open();}
  }catch(e){error.textContent=errorMessage(e);}finally{button.disabled=false;}
});
async function adopt(remote,generation,uid){if(generation!==authGeneration||!user||user.id!==uid||!sessionReady||Date.now()>=sessionExpiresAt)throw new Error('LOGIN_REQUIRED');validateState(remote.payload);checkpoint={spaceId:remote.space_id,slot:remote.slot,revision:remote.revision,base:clone(remote.payload),pending:clone(remote.payload),dirty:false,members:remote.members,archivePending:Boolean(remote.personal_archive_pending)};app.applyState(remote.payload);app.setSlot(remote.slot);saveCheckpoint();subscribe();app.setAccess(true);setMessage(connectionMessage());}
const handledURLs=new Set();async function authURL(url){if(!client||handledURLs.has(url))return;const parsed=new URL(url);if(parsed.protocol!=='junto:'||parsed.hostname!=='auth-callback')return;const code=parsed.searchParams.get('code');if(!code)return;handledURLs.add(url);const{data,error}=await client.auth.exchangeCodeForSession(code);if(error){confirmationFallback();return;}if(parsed.searchParams.get('type')==='recovery')passwordRecovery=true;await handleSession(data.session);open();}
window.addEventListener('junto:auth-url',event=>authURL(event.detail).catch(e=>app.toast('Não foi possível entrar.',errorMessage(e))));
window.addEventListener('online',()=>synchronize(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSoon();});setInterval(()=>{if(!document.hidden)syncSoon();},30000);
async function getAccessToken(){if(!client)return null;const{data,error}=await client.auth.getSession();if(error||!data?.session)return null;return data.session.access_token||null;}
window.JuntoCloud={open,synchronize:()=>synchronize(true),settingsHTML,getAccessToken};window.JuntoFeatures={settingsHTML:()=>settingsHTML()+(window.JuntoBank?.settingsHTML()||'')};
updateStatus();startClient().then(()=>{if(window.JuntoAuthURL)authURL(window.JuntoAuthURL);}).catch(accessError);
