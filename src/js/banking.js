import {Capacitor,registerPlugin} from '@capacitor/core';
import {escapeHTML,formatMoney,localDate,parseCents} from '../features/ui.js';
import {bankIconSvg} from '../features/bank-icons.js';
const api=window.JuntoApp;
const native=Capacitor.isNativePlatform();
const plugin=native?registerPlugin('BankNotifications'):null;
let events=[],status={enabled:false,accessGranted:false,promptsGranted:false,packages:[]},banks=[],selected=null;
let loading=false,refreshQueued=false,requestedId=null;
const BANK_META={
  'com.nu.production':{key:'nubank',group:'main'},'com.itau':{key:'itau',group:'main'},'com.bradesco':{key:'bradesco',group:'main'},
  'br.com.bb.android':{key:'bancodobrasil',group:'main'},'br.com.gabba.Caixa':{key:'caixa',group:'main'},'com.santander.app':{key:'santander',group:'main'},
  'br.com.intermedium':{key:'inter',group:'main'},'com.c6bank.app':{key:'c6',group:'main'},
  'com.picpay':{key:'picpay',group:'digital'},'com.mercadopago.wallet':{key:'mercadopago',group:'digital'},'br.com.uol.ps.myaccount':{key:'pagbank',group:'digital'},
  'br.com.neon':{key:'neon',group:'digital'},'br.com.bradesco.next':{key:'next',group:'digital'},'io.cloudwalk.infinitepaydash':{key:'infinitepay',group:'digital'},'com.transferwise.android':{key:'wise',group:'digital'},
  'com.google.android.apps.walletnfcrel':{key:'googlewallet',group:'digital'},
  'com.itaucard':{key:'itau',group:'other'},'com.btg.pactual.digital.mobile':{key:'btg',group:'other'},'br.com.bancopan.cartoes':{key:'pan',group:'other'},
  'com.votorantim.bvpd':{key:'bv',group:'other'},'br.com.sicoobnet':{key:'sicoob',group:'other'},'br.com.sicredi.app':{key:'sicredi',group:'other'},
  'br.livetouch.safra.net':{key:'safra',group:'other'}
};
function bankMeta(bank){return BANK_META[bank.packageName]||{key:'',group:'other'};}
function bankCard(bank){
  const meta=bankMeta(bank),checked=status.packages.includes(bank.packageName),search=(bank.name+' '+meta.key).toLocaleLowerCase('pt-BR');
  return `<label class="bank-choice-card ${checked?'selected':''}" data-bank-card data-group="${meta.group}" data-search="${escapeHTML(search)}">
    <input type="checkbox" name="packages" value="${escapeHTML(bank.packageName)}" ${checked?'checked':''}>
    <span class="bank-choice-check" aria-hidden="true"></span>
    <span class="bank-choice-logo">${bankIconSvg(meta.key,{size:42})}</span>
    <span class="bank-choice-name">${escapeHTML(bank.name)}</span>
    <small class="bank-choice-device ${bank.installed?'installed':''}">${bank.installed?'Neste aparelho':'Não detectado'}</small>
  </label>`;
}
function bankSection(group,title,rows,{collapsible=false}={}){
  if(!rows.length)return '';
  const body=`<div class="bank-choice-grid" data-bank-grid="${group}">${rows.map(bankCard).join('')}</div>`;
  if(collapsible)return `<details class="bank-other" data-bank-section="${group}"><summary><span><b>${title}</b><small>${rows.length} opções</small></span><span class="bank-chevron">⌄</span></summary><div class="bank-section-tools"><button type="button" class="bank-select-link" data-bank-select="${group}">Selecionar todos</button></div>${body}</details>`;
  return `<section class="bank-picker-section" data-bank-section="${group}"><div class="bank-section-head"><h3>${title}</h3><button type="button" class="bank-select-link" data-bank-select="${group}">Selecionar todos</button></div>${body}</section>`;
}
function updateBankCardState(input){const card=input?.closest('[data-bank-card]');if(card)card.classList.toggle('selected',input.checked);}

function settingsHTML(){return `<div class="feature-card"><div><span class="feature-eyebrow">Seu dinheiro, sem esquecer</span><h3>Movimentos do banco</h3><p>${native?'Pix, pagamentos e recebimentos viram sugestões. Você confere antes de registrar.':'A leitura dos avisos do banco funciona no APK Android.'}</p></div><button class="btn secondary" data-feature="bank-settings">${native?'Configurar':'Como funciona'}</button>${events.length?`<button class="btn primary wide" data-feature="bank-inbox">Conferir ${events.length} movimento${events.length===1?'':'s'}</button>`:''}</div>`;}
let pendingOpenId=null;
async function refresh(openId){if(!api.hasAccess()){if(openId)pendingOpenId=openId;return;}openId=openId||pendingOpenId;pendingOpenId=null;
  if(!plugin)return;if(openId)requestedId=openId;if(loading){refreshQueued=true;return;}loading=true;
  try{const [s,q,b]=await Promise.all([plugin.getStatus(),plugin.getPending(),plugin.listBanks()]);status=s;events=q.events||[];banks=b.banks||[];updateBadge();
    if(requestedId&&events.some(e=>e.id===requestedId)){const id=requestedId;requestedId=null;review(id);}
  }catch(e){api.toast('Não foi possível ler os movimentos.',e.message||'Abra novamente o app.');}finally{loading=false;if(refreshQueued){refreshQueued=false;refresh();}}
}
function updateBadge(){let button=document.getElementById('bank-inbox-button');if(!button){button=document.createElement('button');button.id='bank-inbox-button';button.className='bank-inbox-pill';button.dataset.feature='bank-inbox';document.querySelector('.topbar')?.after(button);}button.hidden=!events.length;button.textContent=`${events.length} movimento${events.length===1?'':'s'} do banco para conferir`;}
async function openSettings(){await refresh();
  if(!native){api.openModal('Movimentos bancários no Android',`<p class="modal-sub">Instale o APK do Juntô para usar a captura. O navegador não consegue ler notificações de outros aplicativos.</p><p>Depois de autorizar, o Juntô identifica movimentos nas notificações dos bancos escolhidos e pergunta como registrar. Nenhum gasto entra automaticamente.</p><button class="btn primary wide" data-action="close">Entendi</button>`,'bank-settings');return;}
  const groups={main:[],digital:[],other:[]};for(const bank of banks)(groups[bankMeta(bank).group]||groups.other).push(bank);
  Object.values(groups).forEach(list=>list.sort((a,b)=>Number(b.installed)-Number(a.installed)||a.name.localeCompare(b.name,'pt-BR')));
  const active=status.enabled&&status.accessGranted;
  api.openModal('Conectar seus bancos',`<div class="bank-settings-screen">
    <div class="bank-settings-intro"><p>Selecione os bancos que você usa para o Juntô identificar movimentações pelas notificações. Nada entra nas suas finanças sem sua confirmação.</p><span class="bank-status-chip ${active?'ok':''}">${active?'Leitura ativa':status.enabled?'Falta autorizar no Android':'Leitura desligada'}</span></div>
    <label class="bank-search"><span aria-hidden="true">⌕</span><input type="search" data-bank-search autocomplete="off" placeholder="Buscar banco ou carteira..." aria-label="Buscar banco ou carteira"></label>
    <form data-feature-form="bank-settings" class="form bank-picker-form">
      ${bankSection('main','Bancos principais',groups.main)}
      ${bankSection('digital','Bancos digitais e carteiras',groups.digital)}
      ${bankSection('other','Outras instituições',groups.other,{collapsible:true})}
      <label class="bank-consent-card"><span class="bank-consent-icon" aria-hidden="true">♢</span><span class="bank-consent-copy"><b>Autorizar notificações</b><small>O texto fica neste aparelho. Só o movimento que você confirmar entra nas suas finanças.</small></span><span class="bank-switch"><input type="checkbox" name="consent" required ${status.enabled?'checked':''}><i></i></span></label>
      <p class="feature-error" role="alert"></p>
      <button class="btn primary wide bank-save" type="submit">Salvar e ativar <span aria-hidden="true">→</span></button>
    </form>
    <div class="bank-quick-actions">
      <button class="btn secondary" data-feature="bank-permission"><span aria-hidden="true">⚙</span><span>Autorizar<br>no Android</span></button>
      <button class="btn secondary" data-feature="bank-prompts"><span aria-hidden="true">♢</span><span>Permitir avisos<br>do Juntô</span></button>
      <button class="btn secondary" data-feature="bank-inbox"><span aria-hidden="true">☷</span><span>Conferir<br>movimentos</span></button>
    </div>
    ${status.enabled?'<button class="bank-disable-link" data-feature="bank-disable">Desativar captura e apagar pendentes</button>':''}
    <div class="bank-privacy-note"><span aria-hidden="true">▣</span><p><b>Seus dados ficam no seu celular</b><small>Não acessamos senhas, saldo bancário ou extratos. A captura depende do texto das notificações enviadas pelo banco.</small></p></div>
  </div>`,'bank-settings');
}
async function inbox(){await refresh();api.openModal('Conferir movimentos',`<p class="modal-sub">Nada foi lançado ainda. Confira um por vez; o texto original não sai deste aparelho.</p><div class="bank-inbox">${events.length?events.map(e=>`<button class="bank-candidate" data-feature="bank-review" data-id="${e.id}"><span><b>${escapeHTML(e.bank)}</b><small>${e.direction==='income'?'Entrada':'Saída'} · ${new Date(e.timestamp).toLocaleDateString('pt-BR')}</small></span><strong>${formatMoney(e.amount)}</strong></button>`).join(''):'<div class="empty"><p>Nenhum movimento pendente.</p></div>'}</div><button class="btn secondary wide" data-feature="bank-settings">Configurar captura</button>`,'bank-inbox');}
function review(id){selected=events.find(e=>e.id===id);if(!selected)return;
  const e=selected,s=api.getState(),who=api.getActive(),income=e.direction==='income',date=localDate(e.timestamp);
  if(s.demo){api.openModal('Primeiro, seu controle real',`<p class="modal-sub">Os números de exemplo estão ativos. Crie seu controle pessoal para manter os movimentos reais separados.</p><button class="btn primary wide" data-action="onboard">Criar meu controle</button><button class="btn secondary wide" data-feature="bank-inbox">Voltar aos movimentos</button>`,'bank-start');return;}
  const similar=(income?s.received:s.transactions).filter(t=>t.amount===e.amount&&(t.actualDate||t.date)===date);
  const bills=s.bills.filter(b=>b.status==='open'&&b.amount===e.amount);
  const incomes=s.incomes.filter(i=>i.person===who);
  const billGuess=!income&&e.method!=='card'&&bills.length===1?bills[0]:null;
  const incomeMatches=income?incomes.filter(i=>i.amount===e.amount):[],incomeGuess=incomeMatches.length===1?incomeMatches[0]:null;
  api.openModal(income?'Esse dinheiro entrou?':'Com o que você gastou?',`<p class="modal-sub">${escapeHTML(e.bank)} · ${formatMoney(e.amount)} · ${e.method==='card'?'cartão':e.method==='pix'?'Pix':'pagamento'}</p><details class="bank-original"><summary>Ver o aviso original</summary><p>${escapeHTML(e.preview||'')}</p></details>${similar.length?'<div class="form-note warn">Já há um movimento do mesmo valor neste dia. Confira se é o mesmo antes de registrar.</div>':''}<form class="form" data-feature-form="bank-confirm"><div class="field"><label for="bank-name">${income?'De onde veio?':'O que foi?'}</label><input id="bank-name" name="name" maxlength="60" minlength="2" required value="${escapeHTML(billGuess?.name||incomeGuess?.name||'')}" placeholder="${income?'Ex.: salário, freela':'Ex.: mercado, almoço, aluguel'}"></div><div class="field-pair"><div class="field"><label for="bank-amount">Valor</label><input id="bank-amount" name="amount" inputmode="decimal" value="${(e.amount/100).toFixed(2).replace('.',',')}" required></div><div class="field"><label for="bank-date">Data</label><input id="bank-date" name="date" type="date" value="${date}" max="${localDate()}" required></div></div>${income?`<div class="field"><label for="bank-income">Relacionar a uma entrada prevista</label><select name="incomeId" id="bank-income"><option value="">Entrada avulsa</option>${incomes.map(i=>`<option value="${escapeHTML(i.id)}" ${incomeGuess?.id===i.id?'selected':''}>${escapeHTML(i.name)}</option>`).join('')}</select></div><div class="field"><label for="bank-expected-date">Data prevista, se houver</label><input type="date" name="expectedDate" id="bank-expected-date" value="${date}"></div>`:`<div class="field"><label for="bank-category">Categoria</label><select id="bank-category" name="category">${api.getCategories().map(c=>`<option ${c===(billGuess?.category||'Outros')?'selected':''}>${escapeHTML(c)}</option>`).join('')}</select></div><div class="field"><label for="bank-payment">Como foi pago?</label><select id="bank-payment" name="payment"><option value="cash" ${e.method!=='card'?'selected':''}>Pix, débito ou dinheiro</option><option value="credit" ${e.method==='card'?'selected':''}>Cartão de crédito: ainda vou pagar</option></select></div><div class="field" id="bank-credit-due" ${e.method==='card'?'':'hidden'}><label for="bank-due">Vencimento no cartão</label><input type="date" id="bank-due" name="due" min="${date}" ${e.method==='card'?'required':''}></div><div class="field"><label for="bank-bill">Essa conta já está no app?</label><select name="billId" id="bank-bill"><option value="">Registrar novo movimento</option>${bills.map(b=>`<option value="${escapeHTML(b.id)}" ${billGuess?.id===b.id?'selected':''}>${escapeHTML(b.name)} · ${escapeHTML(b.due)}</option>`).join('')}</select></div>`}<label class="check-row" id="bank-balance-option" ${!income&&e.method==='card'?'hidden':''}><input type="checkbox" name="adjustBalance" checked><span>${income?'Somar essa entrada ao':'Descontar esse gasto do'} saldo do app. Desmarque se você já atualizou o saldo depois desse movimento.</span></label><p class="feature-error" role="alert"></p><button class="btn primary wide" type="submit">${income?'Confirmar recebimento':'Confirmar registro'}</button></form><div class="feature-actions"><button class="btn secondary" data-feature="bank-ack">Já registrei / ignorar</button><button class="btn ghost" data-feature="bank-inbox">Conferir depois</button></div>`,'bank-review');}
document.addEventListener('change',event=>{
  if(event.target.id==='bank-category')event.target.dataset.touched='1';
  if(event.target.matches('[data-bank-card] input[name="packages"]'))updateBankCardState(event.target);
  if(event.target.id==='bank-payment'){const credit=event.target.value==='credit';document.getElementById('bank-credit-due').hidden=!credit;document.getElementById('bank-balance-option').hidden=credit;document.getElementById('bank-bill').disabled=credit;document.getElementById('bank-due').required=credit;}
});
document.addEventListener('input',event=>{
  if(event.target.id==='bank-name'){
    const form=event.target.closest('[data-feature-form="bank-confirm"]'),category=form?.querySelector('#bank-category');
    if(category&&category.dataset.touched!=='1'){
      const suggestion=api.suggestEntry?.(event.target.value);
      if(suggestion?.category&&api.getCategories().includes(suggestion.category))category.value=suggestion.category;
      const bill=form.querySelector('#bank-bill');
      if(bill&&suggestion?.openBillId&&[...bill.options].some(o=>o.value===suggestion.openBillId))bill.value=suggestion.openBillId;
    }
    return;
  }
  if(!event.target.matches('[data-bank-search]'))return;const q=event.target.value.trim().toLocaleLowerCase('pt-BR');
  document.querySelectorAll('[data-bank-card]').forEach(card=>{card.hidden=Boolean(q)&&!card.dataset.search.includes(q);});
  document.querySelectorAll('[data-bank-section]').forEach(section=>{const cards=[...section.querySelectorAll('[data-bank-card]')],none=cards.length>0&&cards.every(card=>card.hidden);section.hidden=none;if(q&&!none&&section.tagName==='DETAILS')section.open=true;});
});
document.addEventListener('click',event=>{
  const select=event.target.closest('[data-bank-select]');if(!select)return;event.preventDefault();
  const section=document.querySelector(`[data-bank-section="${select.dataset.bankSelect}"]`);if(!section)return;
  const inputs=[...section.querySelectorAll('input[name="packages"]')].filter(input=>!input.closest('[data-bank-card]').hidden);
  const shouldCheck=inputs.some(input=>!input.checked);for(const input of inputs){input.checked=shouldCheck;updateBankCardState(input);}
  select.textContent=shouldCheck?'Desmarcar todos':'Selecionar todos';
});
document.addEventListener('click',async event=>{const button=event.target.closest('[data-feature]');if(!button?.dataset.feature.startsWith('bank-'))return;event.preventDefault();try{const action=button.dataset.feature;
  if(action==='bank-settings')return openSettings();if(action==='bank-inbox')return inbox();if(action==='bank-review')return review(button.dataset.id);
  if(action==='bank-permission'){await plugin.openNotificationSettings();return;}
  if(action==='bank-prompts'){await plugin.requestPrompts();return openSettings();}
  if(action==='bank-disable'){await plugin.setEnabled({enabled:false});events=[];updateBadge();return openSettings();}
  if(action==='bank-ack'&&selected){await plugin.acknowledge({id:selected.id});selected=null;return inbox();}
}catch(e){api.toast('Não foi possível concluir.',e.message||'Tente novamente.');}});
document.addEventListener('submit',async event=>{const form=event.target.closest('[data-feature-form]');if(!form?.dataset.featureForm.startsWith('bank-'))return;event.preventDefault();const error=form.querySelector('.feature-error'),button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;error.textContent='';const data=new FormData(form);
  try{if(form.dataset.featureForm==='bank-settings'){await plugin.setEnabled({enabled:true,consent:data.get('consent')==='on',packages:data.getAll('packages')});await plugin.requestPrompts();if(!status.accessGranted)await plugin.openNotificationSettings();await openSettings();}
    else {const result=api.confirmBankMovement(selected,{name:data.get('name'),amount:parseCents(data.get('amount')),date:data.get('date'),category:data.get('category'),payment:data.get('payment'),due:data.get('due'),billId:data.get('billId'),incomeId:data.get('incomeId'),expectedDate:data.get('expectedDate'),subtractBalance:data.get('adjustBalance')==='on'});
      await plugin.acknowledge({id:selected.id});selected=null;api.toast(result.duplicate?'Esse movimento já estava registrado.':result.kind==='bill'?'Compra no cartão planejada.':'Movimento confirmado.');await inbox();}
  }catch(e){error.textContent=e.message||'Não foi possível salvar.';}finally{button.disabled=false;}
});
window.JuntoBank={settingsHTML,openSettings,refresh};
window.addEventListener('junto:access-ready',()=>refresh());
if(plugin){plugin.addListener('bankEvent',event=>refresh(event?.id)).catch(()=>{});window.addEventListener('focus',async()=>{const launch=await plugin.getLaunchEvent();await refresh(launch.id);});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});plugin.getLaunchEvent().then(x=>refresh(x.id));}
