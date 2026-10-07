(() => {
  'use strict';
  const KEY = 'junto-prototype-v2';
  const PROFILE = 'junto-profile-v1';
  const $ = (q) => document.querySelector(q);
  const uid = () => globalThis.crypto?.randomUUID?.() || ('j' + Date.now().toString(36) + Math.random().toString(36).slice(2));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    wallet:'<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M20 12h-5v5h5"/><path d="M17 14.5h.01"/>',
    chat:'<path d="M21 11a9 9 0 0 1-9 9H4l-2 2v-9a9 9 0 1 1 19-2Z"/><path d="M8 9h8M8 13h5"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    settings:'<path d="m9 3-.5 2-2 1-2-.5-2 3 1.5 1.5v3L2.5 15l2 3 2-.5 2 1 .5 2h4l.5-2 2-1 2 .5 2-3-1.5-2v-3L20 8l-2-3-2 .5-2-1-.5-1.5z"/><circle cx="11.5" cy="12" r="3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    sparkle:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    circleCheck:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    x:'<path d="m6 6 12 12M6 18 18 6"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
    eyeOff:'<path d="m3 3 18 18M9.8 5.2C17 3 22 12 22 12a18 18 0 0 1-3 3.8M6.3 6.3A18 18 0 0 0 2 12s4 7 10 7c1.5 0 3-.4 4.3-1.1M10 10a3 3 0 0 0 4 4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    battery:'<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 10v4M5 10h10v4H5z"/>',
    wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 11a11 11 0 0 1 14 0M8 14a6 6 0 0 1 8 0M12 18h.01"/>',
    link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
    house:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
    cart:'<path d="M2 3h3l3 13h11l3-10H6M9 20h.01M18 20h.01"/>',
    car:'<path d="m5 5-3 7v6h3v-3h14v3h3v-6l-3-7zM2 12h20M6 12h.01M18 12h.01"/>',
    coffee:'<path d="M4 8h12v7a5 5 0 0 1-10 0V8M16 8h2a3 3 0 0 1 0 6h-2M3 21h16M8 3v2M12 2v3"/>',
    plane:'<path d="m22 2-7 20-4-9-9-4Z M22 2 11 13"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3zm0 0h4a3 3 0 1 0-3-3z"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4M4 20h16"/>',
    refresh:'<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M19 11a7 7 0 0 0-12-4L4 10M5 13a7 7 0 0 0 12 4l3-3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    coins:'<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v6c0 2 5 4 9 2M15 6v4M3 9c0 2 7 4 12 1"/><ellipse cx="16" cy="13" rx="5" ry="3"/><path d="M11 13v5c0 4 10 4 10 0v-5"/>',
    shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6"/>',
    trend:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    bag:'<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    pulse:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8ZM12 9v5M9.5 11.5h5"/>',
    moto:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l3-7h3M8 10h5M15 10l3 7"/>',
    half:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>',
    scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10M7 9h6M7 15h8"/>'
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">${paths[name] || paths.wallet}</svg>`;
  const brand = () => '<svg viewBox="0 0 40 40" aria-hidden="true" class="brand-mark"><path d="M20 14c-12-13-24 9-10 12 7 2 13-14 20-12 14 4 2 25-10 12"/></svg><span>juntô<span style="color:var(--gold)">.</span></span>';
  const dateISO = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const monthDay = (day) => {const d = new Date();return dateISO(new Date(d.getFullYear(),d.getMonth(),day));};
  const money = (cents) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
  const moneyNumber = (cents) => new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
  const parseMoney = (value) => {
    let s=String(value).trim().replace(/\s/g,'').replace(/^R\$/i,'');
    if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
    else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
    if(!/^\d+(\.\d{1,2})?$/.test(s))return NaN;
    const v=Math.round(Number(s)*100);return Number.isSafeInteger(v)&&v<=1e10?v:NaN;
  };
  // ===== Datas, dias úteis e feriados nacionais =====
  function pd(iso){const [y,m,d]=String(iso).split('-').map(Number);return new Date(y,m-1,d);}
  function addDays(date,n){return new Date(date.getFullYear(),date.getMonth(),date.getDate()+n);}
  function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
  function endOfMonthISO(d=new Date()){return dateISO(new Date(d.getFullYear(),d.getMonth()+1,0));}
  function daysUntil(iso){return Math.round((pd(iso)-pd(dateISO()))/864e5);}
  function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da);}
  const holidayCache={};
  function holidays(y){if(holidayCache[y])return holidayCache[y];const s=new Set(['01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25'].map(md=>`${y}-${md}`));s.add(dateISO(addDays(easter(y),-2)));return holidayCache[y]=s;}
  function isBusinessDay(d,countSat,ignoreHolidays){const w=d.getDay();if(w===0)return false;if(w===6&&!countSat)return false;return ignoreHolidays||!holidays(d.getFullYear()).has(dateISO(d));}
  function nthBusinessDay(y,m,n,countSat,ignoreHolidays){let c=0;for(let d=1;d<=daysInMonth(y,m);d++){const dt=new Date(y,m,d);if(isBusinessDay(dt,countSat,ignoreHolidays)&&++c===n)return dt;}return new Date(y,m+1,0);}
  const WEEKDAYS=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const wdShort=(iso)=>WEEKDAYS[pd(iso).getDay()].slice(0,3);
  const dayMonth=(iso)=>{const d=pd(iso);return `${d.getDate()}/${d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}`;};
  const dateLong=(iso)=>`${WEEKDAYS[pd(iso).getDay()]}, ${dayMonth(iso)}`;
  const monthName=(d)=>d.toLocaleDateString('pt-BR',{month:'long'});
  function occurrences(inc,fromISO,toISO){
    const out=[],from=pd(fromISO),to=pd(toISO);if(from>to)return out;
    if(inc.rule==='weekly'){let d=new Date(from);while(d.getDay()!==Number(inc.weekday))d=addDays(d,1);for(;d<=to;d=addDays(d,7))out.push(dateISO(d));return out;}
    for(let cur=new Date(from.getFullYear(),from.getMonth(),1);cur<=to;cur=new Date(cur.getFullYear(),cur.getMonth()+1,1)){
      const y=cur.getFullYear(),m=cur.getMonth();
      const d=inc.rule==='monthly'?new Date(y,m,Math.min(Number(inc.day)||1,daysInMonth(y,m))):nthBusinessDay(y,m,Number(inc.nth)||5,inc.countSat!==false);
      if(d>=from&&d<=to)out.push(dateISO(d));
    }
    return out;
  }
  function ruleText(inc){if(inc.rule==='weekly'){const w=Number(inc.weekday);return `${w===0||w===6?'Todo':'Toda'} ${WEEKDAYS[w]}`;}if(inc.rule==='monthly')return `Todo dia ${inc.day}`;return `${inc.nth||5}º dia útil${inc.countSat!==false?' (sábado conta)':''}`;}
  function rng(n){let a=n>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const brl=(c)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0,minimumFractionDigits:0}).format(Math.round(c/100));
  const cashR=(c)=>hidden?'R$ •••':brl(c);
  const pct=(x)=>`${Math.round(x*100)}%`;
  const ratioText=(x)=>x.toFixed(1).replace('.',',');
  function migrate(s){
    s.incomes=Array.isArray(s.incomes)?s.incomes:[];s.received=Array.isArray(s.received)?s.received:[];s.saves=Array.isArray(s.saves)?s.saves:[];
    s.settings=s.settings&&typeof s.settings==='object'?s.settings:{};if(!Number.isSafeInteger(s.settings.variableEstimate))s.settings.variableEstimate=0;
    if(!Number.isFinite(s.settings.yieldRate))s.settings.yieldRate=10;
    if(typeof s.settings.couplePhoto!=='string')s.settings.couplePhoto='';
    if(!Number.isFinite(s.settings.profileZoom))s.settings.profileZoom=1.08;
    if(!Number.isFinite(s.settings.profileY))s.settings.profileY=50;
    if(!('plan' in s))s.plan=null;s.budgets=s.budgets&&typeof s.budgets==='object'?s.budgets:{};s.learned=s.learned&&typeof s.learned==='object'?s.learned:{};s.commitments=Array.isArray(s.commitments)?s.commitments:[];s.challenges=Array.isArray(s.challenges)?s.challenges:[];
    s.received.forEach(r=>{if(r.status!=='received')return;const inc=s.incomes.find(i=>i.id===r.incomeId);if(!r.person&&inc)r.person=inc.person;if(!Number.isSafeInteger(r.balanceDelta))r.balanceDelta=r.amount;});
    const legacySeries={};s.bills.filter(b=>b.recurring&&b.recurringKey).forEach(b=>{legacySeries[String(b.name||'').trim().toLocaleLowerCase('pt-BR')]=b.recurringKey;});
    s.bills.filter(b=>b.recurring&&!b.recurringKey).forEach(b=>{const k=String(b.name||'').trim().toLocaleLowerCase('pt-BR');b.recurringKey=legacySeries[k]||(legacySeries[k]=`legacy:${k||b.id}`);});
    return s;
  }
  // ===== Entradas =====
  function incomePeriodKey(inc,date){
    if(!inc)return date;
    if(inc.rule!=='weekly')return date.slice(0,7);
    const d=pd(date),monday=addDays(d,-((d.getDay()+6)%7));return dateISO(monday);
  }
  const handled=(incId,date)=>{
    const inc=state.incomes.find(i=>i.id===incId),exact=state.received.find(r=>r.incomeId===incId&&r.date===date);if(exact)return exact;
    if(!inc)return null;const key=incomePeriodKey(inc,date);
    return state.received.find(r=>r.incomeId===incId&&incomePeriodKey(inc,r.date)===key)||null;
  };
  function adjustedMonthIncome(y,m,id){
    const f=dateISO(new Date(y,m,1)),t=dateISO(new Date(y,m+1,0));let total=0;
    state.incomes.filter(i=>!id||i.person===id).forEach(i=>occurrences(i,f,t).filter(d=>d>=(i.since||'0000')).forEach(d=>{
      const h=handled(i.id,d);if(h?.status==='skipped')return;total+=h?.status==='received'?h.amount:i.amount;
    }));
    return total;
  }
  function pendingArrivals(lookbackDays=45){const T=dateISO(),from=dateISO(addDays(new Date(),-Math.max(1,lookbackDays))),out=[];state.incomes.forEach(i=>occurrences(i,from,T).forEach(d=>{if(d>=(i.since||'0000')&&!handled(i.id,d))out.push({inc:i,date:d});}));return out.sort((a,b)=>a.date.localeCompare(b.date)||b.inc.amount-a.inc.amount);}
  function nextArrivals(days=60){const f=dateISO(addDays(new Date(),1)),t=dateISO(addDays(new Date(),days)),out=[];state.incomes.forEach(i=>occurrences(i,f,t).filter(d=>d>=(i.since||'0000')).forEach(d=>out.push({inc:i,date:d})));return out.sort((a,b)=>a.date.localeCompare(b.date)||b.inc.amount-a.inc.amount);}
  function monthIncome(y,m,id){const f=dateISO(new Date(y,m,1)),t=dateISO(new Date(y,m+1,0));return state.incomes.filter(i=>!id||i.person===id).reduce((s,i)=>s+occurrences(i,f,t).filter(d=>d>=(i.since||'0000')).length*i.amount,0);}
  function incomeShare(){const n=new Date(),a=monthIncome(n.getFullYear(),n.getMonth(),'a'),b=monthIncome(n.getFullYear(),n.getMonth(),'b');return a+b?a/(a+b):.5;}
  function remainingMonthOcc(){const ym=dateISO().slice(0,7);return pendingArrivals().filter(p=>p.date.slice(0,7)===ym).concat(nextArrivals(31).filter(x=>x.date.slice(0,7)===ym));}
  // ===== Quem paga: um, meio a meio ou proporcional =====
  const PAYER_LABEL={half:'Meio a meio',prop:'Proporcional à renda'};
  const payerLabel=(p)=>PAYER_LABEL[p]||(user(p)?first(user(p).name):'—');
  function splitShares(amount,mode){
    if(isSolo())return [{id:'a',amount}];
    if(mode==='a'||mode==='b')return [{id:mode,amount}];
    const r=mode==='prop'?incomeShare():.5,a=Math.round(amount*r);return [{id:'a',amount:a},{id:'b',amount:amount-a}].filter(s=>s.amount>0);
  }
  function splitPreview(amount,mode){
    if(isSolo())return Number.isFinite(amount)&&amount>0?`Sai da sua conta: ${money(amount)}.`:'Sai da sua conta.';
    if(!Number.isFinite(amount)||amount<=0)return mode==='prop'?`Divide pela renda prevista do mês: ${pct(incomeShare())} para ${first(user('a').name)}, ${pct(1-incomeShare())} para ${first(user('b').name)}.`:mode==='half'?'Cada um paga a metade, da própria conta.':'';
    const s=splitShares(amount,mode);if(s.length<2)return `Sai tudo da conta de ${first(user(s[0].id).name)}.`;return s.map(x=>`${first(user(x.id).name)} paga ${money(x.amount)}`).join(' · ')+(mode==='prop'?` (renda prevista: ${pct(incomeShare())} / ${pct(1-incomeShare())})`:'');
  }  function charge(amount,mode){const shares=splitShares(amount,mode),short=shares.find(s=>s.amount>user(s.id).balance);if(short)return {error:`O saldo de ${first(user(short.id).name)} não cobre ${money(short.amount)}. Atualize o saldo ou escolha outra divisão.`};shares.forEach(s=>user(s.id).balance-=s.amount);return {shares};}
  function transactionShares(t){
    if(Number.isSafeInteger(t?.balanceDelta)){
      if(t.balanceDelta===0)return [];
      const amount=Math.abs(t.balanceDelta);
      if(Array.isArray(t.split)&&t.split.length){const total=t.split.reduce((sum,x)=>sum+x.amount,0)||1;return t.split.map(x=>({id:x.id,amount:Math.round(amount*x.amount/total)})).filter(x=>state.users.some(u=>u.id===x.id)&&Number.isSafeInteger(x.amount));}
      if(state.users.some(u=>u.id===t.payer))return [{id:t.payer,amount}];
    }
    if(Array.isArray(t?.split)&&t.split.length)return t.split.map(x=>({id:x.id,amount:x.amount})).filter(x=>state.users.some(u=>u.id===x.id)&&Number.isSafeInteger(x.amount));
    if(t&&state.users.some(u=>u.id===t.payer))return [{id:t.payer,amount:t.amount}];
    if(t&&['half','prop'].includes(t.payer))return splitShares(t.amount,t.payer);
    return [];
  }
  function applyBalanceShares(shares,direction){shares.forEach(x=>{const u=state.users.find(u=>u.id===x.id);if(u)u.balance+=direction*x.amount;});}
  function reallocateTransaction(t,amount,payer){
    if(t?.balanceDelta===0)return {shares:[]};
    const oldShares=transactionShares(t);applyBalanceShares(oldShares,1);
    const nextShares=splitShares(amount,payer),short=nextShares.find(x=>x.amount>user(x.id).balance);
    if(short){applyBalanceShares(oldShares,-1);return {error:`O saldo de ${first(user(short.id).name)} não cobre ${money(short.amount)}. Atualize o saldo ou escolha outra divisão.`};}
    applyBalanceShares(nextShares,-1);return {shares:nextShares};
  }
  function refundTransaction(t){applyBalanceShares(transactionShares(t),1);}
  const optionPayers=(selected=active)=>isSolo()?`<option value="a" selected>${esc(user('a').name)}</option>`:state.users.map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}</option>`).join('')+`<option value="half" ${selected==='half'?'selected':''}>Meio a meio</option><option value="prop" ${selected==='prop'?'selected':''}>Proporcional à renda</option>`;
  function recurringKey(b){return String(b.recurringKey||b.id);}
  function rollRecurring(){
    const now=new Date(),cm=dateISO().slice(0,7),existing=new Set(state.bills.filter(b=>b.due.slice(0,7)===cm&&b.recurring).map(recurringKey)),latest={};let changed=false;
    state.bills.filter(b=>b.recurring&&b.due.slice(0,7)<cm).forEach(b=>{const k=recurringKey(b);if(!latest[k]||b.due>latest[k].due)latest[k]=b;});
    Object.values(latest).forEach(b=>{const key=recurringKey(b);if(existing.has(key))return;const dd=Math.min(pd(b.due).getDate(),daysInMonth(now.getFullYear(),now.getMonth()));state.bills.push({id:'recurring:'+key+':'+cm,recurringKey:key,name:b.name,amount:b.amount,category:b.category,payer:b.payer,due:dateISO(new Date(now.getFullYear(),now.getMonth(),dd)),recurring:true,status:'open'});existing.add(key);changed=true;});
    return changed;
  }
  // ===== Leitura dos gastos =====
  let memo={};
  function cached(name,fn){const k=state.updatedAt+'|'+dateISO();if(memo.k!==k)memo={k};return name in memo?memo[name]:(memo[name]=fn());}
  const CUSHION=15000;
  const CUT_WEIGHT={Hábitos:.9,Delivery:.65,Lazer:.55,Compras:.6,Lanches:.5,Outros:.4,Alimentação:.15,Transporte:.15,Assinaturas:.4,Casa:.1,Saúde:0};
  const CUT_UNIT={Hábitos:['compra','compras'],Delivery:['pedido','pedidos'],Lazer:['saída','saídas'],Compras:['compra','compras'],Lanches:['lanche','lanches']};
  const isVariable=(t)=>!t.billId;
  function shareOf(t,id){if(Array.isArray(t.split))return(t.split.find(s=>s.id===id)||{}).amount||0;if(t.payer===id)return t.amount;if(['half','prop'].includes(t.payer))return(splitShares(t.amount,t.payer).find(s=>s.id===id)||{}).amount||0;return 0;}
  function history(){return cached('hist',()=>{
    const T=new Date(),firstData=state.transactions.reduce((m,t)=>t.date<m?t.date:m,dateISO(T)),months=[];
    for(let k=6;k>=0;k--){const f=new Date(T.getFullYear(),T.getMonth()-k,1),ym=dateISO(f).slice(0,7);if(k>0&&dateISO(f)<firstData)continue;
      const m={ym,date:f,partial:k===0,income:0,fixed:0,variable:0,saved:0,byCat:{},byPerson:{a:0,b:0}};
      state.transactions.forEach(t=>{if(t.date.slice(0,7)!==ym)return;if(t.billId)m.fixed+=t.amount;else{m.variable+=t.amount;m.byCat[t.category]=(m.byCat[t.category]||0)+t.amount;m.byPerson.a+=shareOf(t,'a');m.byPerson.b+=shareOf(t,'b');}});
      state.received.forEach(r=>{if(r.status==='received'&&r.date.slice(0,7)===ym)m.income+=r.amount;});
      m.saved=savedInMonth(ym);m.result=m.income-m.fixed-m.variable;months.push(m);}
    return months;});}
  function model(){return cached('model',()=>{
    const T=new Date(),today=dateISO(T),vars=state.transactions.filter(isVariable),sum=(l)=>l.reduce((a,t)=>a+t.amount,0);
    const firstDate=vars.reduce((m,t)=>t.date<m?t.date:m,today),age=daysUntil(today)-daysUntil(firstDate)+1,coverage=Math.max(1,Math.min(30,age));
    const from=dateISO(addDays(T,-(coverage-1))),last=vars.filter(t=>t.date>=from&&t.date<=today);
    const prev=vars.filter(t=>t.date>=dateISO(addDays(T,-59))&&t.date<=dateISO(addDays(T,-30)));
    const measured=last.length?sum(last)/coverage:0,est=(state.settings.variableEstimate||0)/30.4,trust=Math.min(1,coverage/14);
    const span=Math.min(56,age),tot=Array(7).fill(0),cnt=Array(7).fill(0);
    for(let i=0;i<span;i++)cnt[addDays(T,-i).getDay()]++;
    vars.filter(t=>t.date>=dateISO(addDays(T,-(span-1)))&&t.date<=today).forEach(t=>tot[pd(t.date).getDay()]+=t.amount);
    const avg=tot.map((v,i)=>cnt[i]?v/cnt[i]:null),known=avg.filter(v=>v!=null),mean=known.length?known.reduce((a,b)=>a+b,0)/known.length:0;
    let factor=avg.map(v=>v==null||!mean||span<14?1:.7*(v/mean)+.3);const fm=factor.reduce((a,b)=>a+b,0)/7;factor=factor.map(f=>f/fm);
    const byCat={},byCatPrev={},byPerson={a:0,b:0},byPersonPrev={a:0,b:0},catPerson={},count={},small={n:0,sum:0};
    last.forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+t.amount;count[t.category]=(count[t.category]||0)+1;const cp=catPerson[t.category]||(catPerson[t.category]={a:0,b:0});['a','b'].forEach(id=>{const s=shareOf(t,id);byPerson[id]+=s;cp[id]+=s;});if(t.amount<=4000){small.n++;small.sum+=t.amount;}});
    prev.forEach(t=>{byCatPrev[t.category]=(byCatPrev[t.category]||0)+t.amount;['a','b'].forEach(id=>byPersonPrev[id]+=shareOf(t,id));});
    const complete=history().filter(m=>!m.partial),scale0=30.4/coverage,fc={};let fTotal=0;
    new Set([...Object.keys(byCat),...complete.flatMap(m=>Object.keys(m.byCat))]).forEach(c=>{const hist=complete.map(m=>m.byCat[c]||0),l30=(byCat[c]||0)*scale0;let f=l30,band=l30*.18,slope=0,wma=l30,avg=l30;
      if(hist.length>=2){const n=hist.length;let sw=0,sv=0;hist.forEach((v,i)=>{sw+=i+1;sv+=v*(i+1);});wma=sv/sw;const mx=(n-1)/2;avg=hist.reduce((a,b)=>a+b,0)/n;let num=0,den=0;hist.forEach((v,i)=>{num+=(i-mx)*(v-avg);den+=(i-mx)**2;});slope=den?num/den:0;const hf=Math.max(0,wma+slope*.5);f=n>=3?.55*hf+.45*l30:.4*hf+.6*l30;band=Math.max(Math.sqrt(hist.reduce((a,v)=>a+(v-avg)**2,0)/n),f*.06);}
      fc[c]={c,hist,l30,wma,slope,f,band,avg};fTotal+=f;});
    const daily=complete.length>=2?fTotal/30.4:(est?measured*trust+est*(1-trust):measured);
    const weekAvg=[1,2,3,4,5].reduce((a,i)=>a+(avg[i]||0),0)/5,weekendAvg=((avg[0]||0)+(avg[6]||0))/2;
    return {fc,fTotal,months:complete.length,daily,measured,coverage,age,factor,byCat,byCatPrev,byPerson,byPersonPrev,catPerson,count,small,scale:30.4/coverage,spentToday:sum(vars.filter(t=>t.date===today)),weekAvg,weekendAvg,hasPrev:age>=55,confidence:coverage>=28?'alta':coverage>=14?'média':'baixa',monthlyVar:daily*30.4};
  });}
  function templates(){const map={};state.bills.filter(b=>b.recurring).forEach(b=>{const k=recurringKey(b);if(!map[k]||b.due>map[k].due)map[k]=b;});return Object.values(map);}
  const fixedMonthly=(id)=>templates().reduce((s,b)=>s+(id?((splitShares(b.amount,b.payer).find(x=>x.id===id)||{}).amount||0):b.amount),0);
  const avgIncome=()=>{const n=new Date();return (monthIncome(n.getFullYear(),n.getMonth())+monthIncome(n.getFullYear(),n.getMonth()+1)+monthIncome(n.getFullYear(),n.getMonth()+2))/3;};
  const savedInMonth=(ym)=>state.saves.filter(s=>s.date.slice(0,7)===ym).reduce((a,s)=>a+s.amount,0);
  const prevYM=()=>{const n=new Date();return dateISO(new Date(n.getFullYear(),n.getMonth()-1,1)).slice(0,7);};
  // ===== Projeção dia a dia =====
  function simulate(o={}){
    const days=o.days??45,cut=o.cut||0,extra=o.extra||0,save=o.save||0,M=model(),T=new Date(),today=dateISO(T),end=dateISO(addDays(T,days)),ev={};
    const add=(d,k,v)=>{const e=ev[d]||(ev[d]={inc:0,bill:0,save:0,extra:0});e[k]+=v;};
    pendingArrivals(45).filter(p=>Math.max(0,-daysUntil(p.date))<=3).forEach(p=>add(today,'inc',p.inc.amount));
    state.incomes.forEach(i=>occurrences(i,dateISO(addDays(T,1)),end).forEach(d=>add(d,'inc',i.amount)));
    state.bills.filter(b=>b.status==='open').forEach(b=>{const d=b.due<today?today:b.due;if(d<=end)add(d,'bill',b.amount);});
    const tpl=templates();
    for(let k=1;;k++){const f=new Date(T.getFullYear(),T.getMonth()+k,1);if(dateISO(f)>end)break;const y=f.getFullYear(),m=f.getMonth();tpl.forEach(b=>{const d=dateISO(new Date(y,m,Math.min(pd(b.due).getDate(),daysInMonth(y,m))));if(d<=end)add(d,'bill',b.amount);});if(extra){const d=dateISO(new Date(y,m,10));if(d<=end)add(d,'extra',extra);}}
    if(save){for(let k=0;;k++){const f=new Date(T.getFullYear(),T.getMonth()+k,1);if(dateISO(f)>end)break;const y=f.getFullYear(),m=f.getMonth();
      const occ=k===0?remainingMonthOcc():state.incomes.flatMap(i=>occurrences(i,dateISO(f),dateISO(new Date(y,m+1,0))).map(d=>({inc:i,date:d})));
      const totalInc=occ.reduce((s,x)=>s+x.inc.amount,0),target=k===0?Math.max(0,save-savedInMonth(today.slice(0,7))):save;if(!totalInc)continue;
      occ.forEach(x=>{const d=x.date<today?today:x.date;if(d<=end)add(d,'save',target*x.inc.amount/totalInc);});}}
    let bal=total()-approvedTotal(),cofre=protectedTotal();const pts=[];
    for(let i=0;i<=days;i++){const d=addDays(T,i),iso=dateISO(d),e=ev[iso]||{inc:0,bill:0,save:0,extra:0};
      let v=o.noVar?0:M.daily*M.factor[d.getDay()]*(1-cut);if(i===0)v=Math.max(0,v-M.spentToday*(1-cut));
      bal+=e.inc+e.extra-e.bill-v;cofre+=e.save;pts.push({date:iso,bal,cofre,free:bal-cofre,inc:e.inc+e.extra,bill:e.bill,save:e.save});}
    return pts;
  }
  function dailyCap(){return cached('cap',()=>{const days=daysUntil(endOfMonthISO()),pts=simulate({days,noVar:true,save:state.plan?.monthly||0});let cap=Infinity;pts.forEach((p,i)=>{cap=Math.min(cap,(p.free-CUSHION)/(i+1));});return Math.max(0,Math.floor(cap/100)*100);});}
  function monthSamples(pts){const byDate={};pts.forEach(p=>byDate[p.date]=p);const n=new Date(),out=[pts[0]];for(let k=0;k<12;k++){const iso=dateISO(new Date(n.getFullYear(),n.getMonth()+k+1,0));out.push(byDate[iso]||pts[pts.length-1]);}return out;}
  // ===== Plano "guardar primeiro" =====
  function planOptions(){return cached('plans',()=>{
    const M=model(),inc=avgIncome(),fixed=fixedMonthly(),variable=M.monthlyVar,base=inc-fixed-variable;
    const cuttable=Object.values(M.fc).map(x=>{const w=CUT_WEIGHT[x.c]??.3;return {c:x.c,v:x.f,cut:x.f*w};}).filter(x=>x.cut>0),C=cuttable.reduce((s,x)=>s+x.cut,0);
    return [['leve','Leve',.10],['firme','Firme',.20],['ousado','Ousado',.30]].map(([key,name,p])=>{
      const cutAmt=Math.min(variable*p,C),monthly=Math.max(0,Math.floor((base+cutAmt-CUSHION)/5000)*5000);
      const recipe=cuttable.map(x=>({...x,r:C?cutAmt*x.cut/C:0})).sort((a,b)=>b.r-a.r).slice(0,3);
      return {key,name,pct:p,cutAmt,monthly,recipe,dailyLimit:(variable-cutAmt)/30.4,inc,fixed,variable,base};
    });
  });}
  function recommendedKey(){const o=planOptions(),inc=o[0].inc;return (o.find(x=>x.monthly>=inc*.10)||o[2]).key;}
  function planShare(inc,date){
    if(!state.plan)return Math.round(inc.amount*.10/1000)*1000;
    const ym=date.slice(0,7),p=state.plan;let share;
    if(ym===dateISO().slice(0,7)){const occ=remainingMonthOcc(),tot=occ.reduce((s,x)=>s+x.inc.amount,0);share=tot?Math.max(0,p.monthly-savedInMonth(ym))*inc.amount/tot:0;}
    else{const d=pd(date),mi=monthIncome(d.getFullYear(),d.getMonth());share=mi?p.monthly*inc.amount/mi:0;}
    return Math.min(inc.amount,Math.round(share/1000)*1000);
  }
  function etaText(remaining,perMonth){if(remaining<=0)return 'já chegou';if(perMonth<=0)return 'não chega nesse ritmo';const n=Math.ceil(remaining/perMonth);if(n>72)return 'mais de 6 anos';const d=new Date();return new Date(d.getFullYear(),d.getMonth()+n,1).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','').replace(' de ','/');}
  const goalPace=(g)=>state.saves.filter(s=>s.goalId===g.id&&s.date>=dateISO(addDays(new Date(),-89))).reduce((a,s)=>a+s.amount,0)/3;
  function recipeLine(x){const M=model(),avgT=M.count[x.c]?M.byCat[x.c]/M.count[x.c]:0,unit=CUT_UNIT[x.c],n=unit&&avgT?Math.round(x.r/avgT):0,cp=M.catPerson[x.c]||{a:0,b:0},tot=cp.a+cp.b,lead=tot?(cp.a>=cp.b?'a':'b'):null,share=tot?Math.max(cp.a,cp.b)/tot:0;
    return `<li><span><b>${esc(x.c)}</b> ${cashR(x.v)} → ${cashR(x.v-x.r)}</span><small>${n>=1?`≈ ${n} ${n===1?unit[0]:unit[1]} a menos`:`−${cashR(x.r)} por mês`}${lead&&share>=.6?` · ${esc(first(user(lead).name))} faz ${pct(share)}`:''}</small></li>`;}
  // ===== Leitura individual =====
  function personReading(id){
    const M=model(),n=new Date(),inc=monthIncome(n.getFullYear(),n.getMonth(),id),incO=monthIncome(n.getFullYear(),n.getMonth(),other(id));
    const v=M.byPerson[id]*M.scale,vo=M.byPerson[other(id)]*M.scale,fixed=fixedMonthly(id),incShareV=inc+incO?inc/(inc+incO):.5,varShare=v+vo?v/(v+vo):.5;
    const fairV=(v+vo)*incShareV,excess=v-fairV,net=inc-fixed-v,prevRatio=M.hasPrev&&M.byPersonPrev[id]>0?M.byPerson[id]/M.byPersonPrev[id]-1:null;
    const cats=Object.entries(M.catPerson).map(([c,o])=>[c,o[id]*M.scale]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const status=net<0?'bad':varShare-incShareV>.07?'warn':'success';
    return {id,inc,v,fixed,net,incShare:incShareV,varShare,excess,prevRatio,cats,status};
  }
  // ===== Onde o dinheiro escapa =====
  function tips(){return cached('tips',()=>{
    const M=model(),out=[],T=new Date();if(M.measured<=0)return out;
    if(M.small.n>=8){const mth=M.small.sum*M.scale;out.push({icon:'coffee',title:`${M.small.n} gastinhos de até R$ 40 em ${M.coverage} dias.`,body:`Somaram ${cashR(M.small.sum)}. Um por um parece nada, mas no ano dá ${cashR(mth*12)}. Cortar metade guarda ${cashR(mth/2)} por mês.`,impact:mth/2});}
    const sal=state.incomes.filter(i=>i.rule==='business'),dates=[...new Set(sal.flatMap(i=>occurrences(i,dateISO(addDays(T,-60)),dateISO(addDays(T,-3)))))];
    if(dates.length){let s=0,n=0;dates.forEach(d=>{for(let k=0;k<3;k++){const iso=dateISO(addDays(pd(d),k));s+=state.transactions.filter(t=>isVariable(t)&&t.date===iso).reduce((a,t)=>a+t.amount,0);n++;}});const avg=s/n,r=avg/M.measured;
      if(r>1.35){const perMonth=Math.max(1,dates.length/2),impact=(avg-M.measured)*3*perMonth*.6;out.push({icon:'bolt',title:'Quando o salário cai, o gasto dispara.',body:`Nos 3 dias depois do pagamento, a dupla gasta ${ratioText(r)}x o normal: ${cashR(avg)} por dia, contra ${cashR(M.measured)}. Guardar no mesmo dia em que o dinheiro entra corta esse pico pela raiz.`,impact});}}
    if(M.weekAvg>0&&M.weekendAvg/M.weekAvg>1.5){const cap=Math.ceil(M.weekendAvg*.75/1000)*1000,impact=(M.weekendAvg-cap)*8.7;if(impact>0)out.push({icon:'calendar',title:`Fim de semana custa ${ratioText(M.weekendAvg/M.weekAvg)}x um dia útil.`,body:`Sábado e domingo saem, em média, ${cashR(M.weekendAvg)} por dia. Combinar um teto de ${cashR(cap)} por dia de folga guarda ${cashR(impact)} por mês.`,impact});}
    Object.entries(M.catPerson).forEach(([c,o])=>{if(isSolo())return;const tot=(o.a+o.b)*M.scale;if(tot<30000||(CUT_WEIGHT[c]??.3)<.4)return;const lead=o.a>=o.b?'a':'b',share=o[lead]/(o.a+o.b);if(share<.72)return;const mine=o[lead]*M.scale,impact=mine*.4;out.push({icon:categoryIcon(c),title:`${c}: ${pct(share)} é de ${first(user(lead).name)}.`,body:`${esc(first(user(lead).name))} gastou ${cashR(o[lead])} em ${c.toLowerCase()} nos últimos ${M.coverage} dias${M.count[c]?`, em ${Math.round(M.count[c]*share)} vezes`:''}. Reduzir 40% disso guarda ${cashR(impact)} por mês sem mexer no resto da dupla.`,impact,person:lead});});
    if(M.hasPrev)Object.entries(M.byCat).forEach(([c,v])=>{const p=M.byCatPrev[c]||0;if(p<10000||v/p<1.25||v-p<8000)return;out.push({icon:'trend',title:`${c} subiu ${pct(v/p-1)} no último mês.`,body:`Eram ${cashR(p)} nos 30 dias anteriores, agora são ${cashR(v)}. Voltar ao nível de antes guarda ${cashR(v-p)} por mês.`,impact:v-p});});
    Object.values(M.fc).forEach(x=>{const h=x.hist;if(h.length<4)return;let s=0;for(let i=h.length-1;i>0&&h[i]>h[i-1]*1.02;i--)s++;if(s>=3&&h[h.length-1]>h[h.length-1-s]*1.25&&x.f>15000)out.push({icon:'trend',title:`${x.c} sobe há ${s} meses seguidos.`,body:`Foi de ${cashR(h[h.length-1-s])} para ${cashR(h[h.length-1])} por mês. Se a curva continuar, o próximo mês chega a ${cashR(x.f)}. Uma meta fixa nessa categoria trava a subida.`,impact:Math.max(0,x.f-x.avg)});});
    const inc=avgIncome(),fixed=fixedMonthly();if(inc&&fixed/inc>.4){const subs=templates().filter(b=>['Assinaturas'].includes(b.category)).reduce((s,b)=>s+b.amount,0);if(subs)out.push({icon:'repeat',title:`Contas fixas levam ${pct(fixed/inc)} da renda.`,body:`São ${cashR(fixed)} por mês antes de qualquer escolha. Internet, celular e streaming somam ${cashR(subs)}: renegociar ou cortar um plano costuma render 20% disso.`,impact:subs*.2});}
    const seen=new Set();return out.sort((a,b)=>b.impact-a.impact).filter(t=>{const k=t.title.split(':')[0];if(seen.has(k))return false;seen.add(k);return true;}).slice(0,5);
  });}
  // ===== Leitura das entradas =====
  function incomeInsights(){
    const out=[],now=new Date(),y=now.getFullYear(),m=now.getMonth(),mi=monthIncome(y,m);
    const weekly=state.incomes.filter(i=>i.rule==='weekly');
    weekly.forEach(w=>{const five=[];for(let k=0;k<6;k++){const f=new Date(y,m+k,1);if(occurrences(w,dateISO(f),dateISO(new Date(f.getFullYear(),f.getMonth()+1,0))).length===5)five.push(f);}
      if(five.length)out.push({icon:'sparkle',title:`Meses com 5 ${WEEKDAYS[w.weekday]}s: ${five.map(monthName).join(', ')}.`,body:`Nesses meses, ${esc(w.name.toLowerCase())} de ${esc(first(user(w.person).name))} entra 5 vezes em vez de 4: ${cashR(w.amount)} a mais que nunca foi contado. Mandar essa entrada inteira pro cofre não faz falta no orçamento.`});});
    if(mi){const early=state.incomes.reduce((s,i)=>s+occurrences(i,dateISO(new Date(y,m,1)),dateISO(new Date(y,m,10))).length*i.amount,0)/mi;
      if(early>.55)out.push({icon:'calendar',title:`${pct(early)} da renda chega até o dia 10.`,body:`Depois disso, ${weekly.length?`só ${WEEKDAYS[weekly[0].weekday]==='sábado'||WEEKDAYS[weekly[0].weekday]==='domingo'?'os':'as'} ${WEEKDAYS[weekly[0].weekday]}s`:'quase nada'}. Por isso o fim do mês aperta: o que não é separado no começo some no meio. Guardar e pagar as contas grandes logo que o salário cai protege o resto do mês.`});}
    state.incomes.filter(i=>i.rule==='business').slice(0,1).forEach(i=>{const pushes=[];for(let k=0;k<6;k++){const yy=new Date(y,m+k,1).getFullYear(),mm=new Date(y,m+k,1).getMonth(),a=nthBusinessDay(yy,mm,i.nth||5,i.countSat!==false),b=nthBusinessDay(yy,mm,i.nth||5,i.countSat!==false,true);if(dateISO(a)!==dateISO(b))pushes.push(`${monthName(a)} (dia ${a.getDate()}, não ${b.getDate()})`);}
      if(pushes.length)out.push({icon:'clock',title:'Feriado atrasa o salário em alguns meses.',body:`O ${i.nth||5}º dia útil anda pra frente em ${pushes.join(', ')}. A previsão já considera isso: as contas que vencem antes disso precisam de dinheiro guardado do mês anterior.`});});
    return out;
  }
  // ===== Gráficos =====
  function chartWidth(pad){const el=$('#app-content');return Math.max(280,Math.min(860,(el?.clientWidth||620)-pad));}
  function monthChart(pts,w,eomIndex){
    const h=w<480?136:220,pl=6,pr=6,pt=30,pb=26,vals=pts.map(p=>p.free);let max=Math.max(...vals,0),min=Math.min(...vals,0);const span=(max-min)||1;max+=span*.1;min-=span*.12;
    const X=i=>pl+(w-pl-pr)*i/Math.max(1,pts.length-1),Y=v=>pt+(h-pt-pb)*(max-v)/(max-min),y0=Y(0);
    const line=pts.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(p.free).toFixed(1)}`).join(' '),cid='c'+Math.random().toString(36).slice(2,7);chartStore[cid]=pts;
    const minI=vals.indexOf(Math.min(...vals)),mx=X(minI),my=Y(vals[minI]),anchor=mx<w*.2?'start':mx>w*.8?'end':'middle';
    const tickEvery=w<350?10:7,ticks=pts.map((p,i)=>({p,i})).filter(({i})=>i%tickEvery===0);
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Projeção do dinheiro fora dos planos nos próximos ${pts.length-1} dias. Menor valor: ${brl(vals[minI])} em ${dayMonth(pts[minI].date)}."><defs><clipPath id="${cid}a"><rect x="0" y="0" width="${w}" height="${Math.max(0,y0)}"/></clipPath><clipPath id="${cid}b"><rect x="0" y="${y0}" width="${w}" height="${Math.max(0,h-y0)}"/></clipPath></defs>
      ${eomIndex>0&&eomIndex<pts.length-1?`<line x1="${X(eomIndex)}" x2="${X(eomIndex)}" y1="${pt-14}" y2="${h-pb}" class="ch-eom"/><text x="${X(eomIndex)+5}" y="${pt-6}" class="ch-label">fim de ${monthName(new Date())}</text>`:''}
      ${min<0?`<line x1="0" x2="${w}" y1="${y0}" y2="${y0}" class="ch-zero"/>`:''}
      <path d="${line} L${X(pts.length-1).toFixed(1)} ${y0} L${X(0)} ${y0} Z" class="ch-area"/>
      <path d="${line}" class="ch-line" clip-path="url(#${cid}a)"/><path d="${line}" class="ch-line neg" clip-path="url(#${cid}b)"/>
      ${pts.map((p,i)=>p.inc>0?`<circle cx="${X(i)}" cy="${Y(p.free)}" r="${p.inc>=150000?4.5:3}" class="ch-in"/>`:p.bill>=20000?`<circle cx="${X(i)}" cy="${Y(p.free)}" r="3" class="ch-out"/>`:'').join('')}
      <circle cx="${mx}" cy="${my}" r="5" class="ch-min"/><text x="${mx}" y="${my+(my>h-pb-24?-12:20)}" text-anchor="${anchor}" class="ch-minlabel">${brl(vals[minI])} · ${dayMonth(pts[minI].date)}</text>
      <line id="${cid}g" class="ch-guide" x1="0" x2="0" y1="${pt-12}" y2="${h-pb}" visibility="hidden"/>
      <text x="${X(0)}" y="14" class="ch-label">hoje ${brl(vals[0])}</text>
      ${ticks.map(({p,i})=>`<text x="${X(i)}" y="${h-6}" text-anchor="${i===0?'start':'middle'}" class="ch-tick">${dayMonth(p.date)}</text>`).join('')}<g>${pts.map((p,i)=>{const st=(w-pl-pr)/Math.max(1,pts.length-1);return `<rect class="hit" data-chart="${cid}" data-i="${i}" x="${(X(i)-st/2).toFixed(1)}" y="0" width="${st.toFixed(1)}" height="${h}"/>`;}).join('')}</g></svg><div class="ch-tip" id="${cid}t" hidden></div>`;
  }
  function yearChart(a,b,w){
    const h=w<480?180:210,pl=6,pr=6,pt=22,pb=24,base=a.map(p=>p.bal-a[0].bal),scen=b.map(p=>p.bal-b[0].bal),all=[...base,...scen,0];let max=Math.max(...all),min=Math.min(...all);const span=(max-min)||1;max+=span*.12;min-=span*.12;
    const X=i=>pl+(w-pl-pr)*i/12,Y=v=>pt+(h-pt-pb)*(max-v)/(max-min),path=(arr)=>arr.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Doze meses: ritmo atual termina em ${brl(base[12])}; o cenário termina em ${brl(scen[12])}."><line x1="0" x2="${w}" y1="${Y(0)}" y2="${Y(0)}" class="yc-zero"/><path d="${path(scen)} L${X(12)} ${Y(0)} L${X(0)} ${Y(0)} Z" class="yc-area"/><path d="${path(base)}" class="yc-base"/><path d="${path(scen)}" class="yc-scen"/>
      <circle cx="${X(12)}" cy="${Y(scen[12])}" r="4.5" class="yc-dot"/><text x="${X(12)-8}" y="${Y(scen[12])+(scen[12]>=base[12]?-10:18)}" text-anchor="end" class="yc-val">${brl(scen[12])}</text>
      <circle cx="${X(12)}" cy="${Y(base[12])}" r="3.5" class="yc-dot base"/><text x="${X(12)-8}" y="${Y(base[12])+(scen[12]>=base[12]?18:-10)}" text-anchor="end" class="yc-val base">${brl(base[12])}</text>
      ${a.map((p,i)=>i%2===0&&i<12?`<text x="${X(i)}" y="${h-6}" text-anchor="${i===0?'start':'middle'}" class="yc-tick">${i===0?'hoje':pd(p.date).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</text>`:'').join('')}</svg>`;
  }
  // ===== Demonstração rica: 60 dias de história =====
  function seed(){
    const t=Date.now(),T=new Date(),R=rng(20481),r=(a,b)=>Math.round((a+(b-a)*R())*100)/100,C=(v)=>Math.round(v*100),DAYS=200,since=dateISO(addDays(T,-(DAYS+5)));
    const incomes=[{id:'inc1',name:'Salário',person:'a',amount:320000,rule:'business',nth:5,countSat:true,since},{id:'inc2',name:'Semanal',person:'a',amount:35000,rule:'weekly',weekday:5,since,auto:true},{id:'inc3',name:'Salário',person:'b',amount:270000,rule:'business',nth:5,countSat:true,since},{id:'inc4',name:'Comissão',person:'b',amount:45000,rule:'monthly',day:20,since}];
    const tx=[],add=(name,v,category,payer,date,extra={})=>{const amount=C(v),o={id:uid(),name,amount,category,payer,date:dateISO(date),by:payer==='half'?'b':payer,...extra};if(payer==='half'){const a=Math.round(amount/2);o.split=[{id:'a',amount:a},{id:'b',amount:amount-a}];}tx.push(o);};
    const salary=new Set();incomes.filter(i=>i.rule==='business').forEach(i=>occurrences(i,dateISO(addDays(T,-(DAYS+10))),dateISO(T)).forEach(d=>{for(let k=0;k<3;k++)salary.add(dateISO(addDays(pd(d),k)));}));
    for(let i=DAYS;i>=1;i--){const d=addDays(T,-i),w=d.getDay(),iso=dateISO(d),ph=1-i/DAYS,sal=salary.has(iso),july=d.getMonth()===6;
      if(w===6)add(R()<.7?'Mercado da semana':'Atacadão',r(225,290),'Alimentação','half',d);
      if(w===3&&R()<.5)add('Hortifruti',r(38,62),'Alimentação','b',d);
      if(w===0&&R()<.35)add('Padaria',r(18,34),'Alimentação','half',d);
      if([1,3,5,0].includes(w)&&R()<.28+.36*ph)add(R()<.55?'iFood':R()<.5?'Pizza de sexta':'Hambúrguer',r(46,79),'Delivery','a',d);
      if(w===2&&R()<.5)add('iFood',r(38,56),'Delivery','b',d);
      if(w===1)add(R()<.6?'Gasolina':'Posto Shell',r(148,176),'Transporte','a',d);
      if(w===2||w===4)add(R()<.8?'Uber':'99',r(16,29),'Transporte','b',d);
      if(w>=1&&w<=5&&R()<.45+.15*ph)add(R()<.5?'Café e pão de queijo':'Lanche da tarde',r(11,27),'Lanches','a',d);
      if(w>=1&&w<=5&&R()<.28)add('Café',r(9,17),'Lanches','b',d);
      if(w===5&&R()<.66)add(R()<.5?'Barzinho na sexta':'Happy hour',r(80,135),'Lazer','a',d);
      if(w===6&&R()<(july?.95:.7))add(R()<.5?'Jantar a dois':'Cinema e pipoca',r(100,160),'Lazer',R()<.6?'a':'half',d);
      if(w===0&&R()<(july?.8:.5))add(july?'Passeio de férias':'Passeio de domingo',r(40,95),'Lazer','half',d);
      if(sal&&!salary.has(dateISO(addDays(d,-1)))){add(R()<.5?'Comprinha do salário':R()<.5?'Shopee':'Loja online',r(110,190),'Compras',R()<.55?'a':'b',d);add('Comemoração do pagamento',r(90,150),'Lazer','half',addDays(d,1));}
      if(i%30===12||i%30===27)add('Farmácia',r(55,105),'Saúde','b',d);
      if(i===27)add('Presente de aniversário',r(130,170),'Compras','b',d);
      if(i===19||i===96)add('Roupa nova',r(150,220),'Compras','a',d);
      if(i%10===0)add('Coisas de casa',r(35,75),'Outros',R()<.5?'a':'b',d);
      if(R()<.86){const q=R()<.55?2:3;add(`${q} cigarros`,q*3,'Hábitos','a',d,{item:'Cigarro',icon:'cigarette',qty:q});}
      if(w===4&&R()<.35)add('Energético',r(9,12),'Hábitos','a',d,{item:'Energético',icon:'can'});
    }
    add('Pizza de quarta',62,'Delivery','a',addDays(T,-2),{item:'Pizza',icon:'pizza'});tx[tx.length-1].contest={id:'ct1',by:'b',reason:'Não foi combinado',note:'Pizza de novo no meio da semana? A gente tinha falado de segurar o delivery até o salário.',status:'open',at:t-5400000,thread:[]};
    add('Café com a pessoa favorita',28,'Lanches','a',T,{item:'Café',icon:'coffee'});
    const today=dateISO(),defs=[['Aluguel',1850,'Casa','half',10],['Condomínio',420,'Casa','half',10],['Academia',99.9,'Saúde','a',8],['Luz',186.9,'Casa','b',12],['Internet',99,'Assinaturas','a',15],['Celulares',89.9,'Assinaturas','half',18],['Streaming',55.9,'Assinaturas','b',22]];
    for(let k=7;k>=1;k--){const f=new Date(T.getFullYear(),T.getMonth()-k,1);defs.forEach(([name,v,cat,payer,day])=>{const due=new Date(f.getFullYear(),f.getMonth(),Math.min(day,daysInMonth(f.getFullYear(),f.getMonth())));if(due<addDays(T,-DAYS))return;if(name==='Streaming'&&k>3)return;let val=v;if(name==='Luz')val=Math.round(v*(.82+.32*R())*100)/100;if(name==='Internet'&&k>2)val=89.9;add(name,val,cat,payer,due,{billId:'h'+k+name});});}
    const bills=defs.map(([name,v,cat,payer,day],k)=>{const due=monthDay(day),paid=due<today,b={id:'bill'+(k+1),name,amount:C(v),category:cat,payer,due,recurring:true,status:paid?'paid':'open'};if(paid){b.paidAt=t;add(name,v,cat,payer,pd(due),{billId:b.id});}return b;});
    const goals=[{id:'goal1',name:'Férias a dois',target:600000,saved:125000,icon:'plane'},{id:'goal2',name:'Reserva de emergência',target:1500000,saved:40000,icon:'shield'}];
    const openBills=bills.filter(b=>b.status==='open').reduce((s,b)=>s+b.amount,0),sum=openBills+165000+C(r(880,960)),aBal=Math.round(sum*.54);
    const received=[];incomes.forEach(i=>occurrences(i,since,dateISO(addDays(T,-1))).forEach(d=>received.push({id:uid(),incomeId:i.id,date:d,amount:i.amount,status:'received',at:t})));
    const saves=[[5,20000],[3,15000],[1,15000]].map(([k,v],j)=>({id:'sv'+j,goalId:j===0?'goal2':'goal1',amount:v,date:dateISO(new Date(T.getFullYear(),T.getMonth()-k,9)),actor:j===1?'a':'b',source:'manual'}));
    return {schema:1,updatedAt:t,users:[{id:'a',name:'Gui',balance:aBal,tone:'blue'},{id:'b',name:'Bia',balance:sum-aBal,tone:'pink'}],
      bills,transactions:tx.sort((a,b)=>a.date.localeCompare(b.date)),goals,incomes,received,saves,plan:null,budgets:{},learned:{},commitments:[],settings:{variableEstimate:0,yieldRate:10,couplePhoto:'',profileZoom:1.08,profileY:50},
      requests:[{id:'req1',title:'Jantar de sexta',amount:14800,category:'Lazer',note:'A gente merece um date sem lavar louça, né? 🥹',author:'a',recipient:'b',status:'pending',createdAt:t-3600000}],
      activity:[{id:'ac1',actor:'a',message:'pediu um combinado: Jantar de sexta.',createdAt:t-3600000},{id:'ac2',actor:'b',message:'configurou as entradas da dupla: salários no 5º dia útil, semanal e comissão.',createdAt:t-7200000},{id:'ac3',actor:'b',message:'separou R$ 150,00 para Férias a dois. Foi o que deu no mês passado.',createdAt:t-86400000*26}],
      notifications:[{id:'not1',to:'b',title:'Amor, posso gastar?',body:'Gui quer combinar Jantar de sexta por R$ 148,00.',kind:'request',requestId:'req1',read:false,createdAt:t-3600000}],demo:true};
  }
  const valid=(s)=>s&&s.schema===1&&Array.isArray(s.users)&&(s.users.length===2||s.users.length===1)&&s.users.every(u=>['a','b'].includes(u.id)&&typeof u.name==='string'&&Number.isSafeInteger(u.balance))&&['bills','goals','transactions','requests','activity','notifications'].every(k=>Array.isArray(s[k]));
  function validBackup(s){
    if(!valid(s))return false;
    const forbidden=new Set(['__proto__','prototype','constructor']),seen=new Set();
    const walk=(value,depth=0)=>{
      if(depth>12)return false;
      if(value===null||['string','number','boolean'].includes(typeof value))return typeof value!=='number'||Number.isFinite(value);
      if(typeof value!=='object'||seen.has(value))return false;seen.add(value);
      const keys=Object.keys(value);if(keys.some(k=>forbidden.has(k)))return false;
      if(Array.isArray(value)){if(value.length>20000)return false;return value.every(x=>walk(x,depth+1));}
      return keys.length<=200&&keys.every(k=>walk(value[k],depth+1));
    };
    if(!walk(s))return false;
    if(new Set(s.users.map(u=>u.id)).size!==s.users.length)return false;
    if(s.users.length===1&&s.users[0].id!=='a')return false;
    if(s.users.length===2&&!s.users.some(u=>u.id==='a')||s.users.length===2&&!s.users.some(u=>u.id==='b'))return false;
    if(s.users.some(u=>u.name.trim().length<1||u.name.length>24||Math.abs(u.balance)>99999999999))return false;
    const lists=['bills','goals','transactions','incomes','received','saves','requests','activity','notifications','bankImports','commitments','challenges'];
    for(const key of lists){
      const arr=Array.isArray(s[key])?s[key]:[];
      if(arr.length>20000||arr.some(x=>!x||typeof x!=='object'||Array.isArray(x)||typeof x.id!=='string'||x.id.length<1||x.id.length>250))return false;
      const ids=arr.map(x=>x.id);if(new Set(ids).size!==ids.length)return false;
    }
    const cents=['amount','balance','saved','target','monthly','balanceDelta'];
    const nonNegative=new Set(['amount','saved','target','monthly']);
    let ok=true;const scan=(value)=>{if(!ok||value===null||typeof value!=='object')return;for(const [k,v] of Object.entries(value)){if(cents.includes(k)&&v!==undefined&&(!Number.isSafeInteger(v)||Math.abs(v)>99999999999||nonNegative.has(k)&&v<0)){ok=false;return;}if(v&&typeof v==='object')scan(v);}};
    scan(s);return ok;
  }
  let state;try{const s=JSON.parse(localStorage.getItem(KEY));state=migrate(validBackup(s)?s:freshPersonalState());}catch{state=freshPersonalState();}
  let active='a';try{active=sessionStorage.getItem(PROFILE)==='b'?'b':'a';}catch{}if(state.users.length<2)active='a';
  let route='home',billFilter='all',requestFilter='all',hidden=false,noticesEnabled=true;try{noticesEnabled=localStorage.getItem('junto-notices-v1')!=='off';}catch{}
  let analysisTab='overview',analysisPerson='both',futureTab='forecast',incomeTab='overview',planTab='goals';
  let onboardDraft={},onboardStep=1,channel=null;
  try{channel=new BroadcastChannel('junto-demo-sync');}catch{}
  const user=(id=active)=>state.users.find(u=>u.id===id)||{id:'b',name:'Seu amor',balance:0,tone:'pink'};
  const hasUser=(id)=>state.users.some(u=>u.id===id);
  const other=(id=active)=>id==='a'?'b':'a';
  const first=(name)=>name.split(' ')[0];
  const avatar=(id,size='')=>`<span class="avatar ${id==='b'?'b':''} ${size}" aria-hidden="true">${esc(user(id).name.slice(0,1).toUpperCase())}</span>`;
  const profileTone=(id=active)=>user(id)?.tone||(id==='b'?'pink':'blue');
  const coupleInitials=()=>isSolo()?first(user('a').name).slice(0,1).toUpperCase():`${first(user('a').name).slice(0,1)}${first(user('b').name).slice(0,1)}`.toUpperCase();
  function profilePhotoButton(){const src=state.settings?.couplePhoto||'',tone=profileTone(active),z=Number(state.settings?.profileZoom||1.08).toFixed(2),y=Math.round(state.settings?.profileY||50),locked=Boolean(cloudSlot)&&!isSolo(),action=isSolo()||locked?'settings':'profile-photo-switch',label=isSolo()?'Ajustes':locked?'Ajustes do meu perfil':`Trocar para ${esc(first(user(other()).name))}`;return `<div class="profile-hub-clean"><button class="profile-photo-button ${tone} ${locked?'profile-locked':''}" style="--profile-zoom:${z};--profile-y:${y}%" data-action="${action}" aria-label="${label}" title="${label}"><span class="profile-photo-inner">${src?`<img src="${src}" alt="Foto do casal">`:`<span class="profile-monogram">${esc(coupleInitials())}</span>`}</span>${locked?'':`<span class="profile-switch-mark" aria-hidden="true">${icon('refresh')}</span>`}</button></div>`;}
  const cash=(cents)=>hidden?'R$ •••••':money(cents);
  const total=()=>state.users.reduce((a,u)=>a+u.balance,0);
  const billsTotal=()=>state.bills.filter(b=>b.status==='open').reduce((a,b)=>a+b.amount,0);
  const protectedTotal=()=>state.goals.reduce((a,g)=>a+g.saved,0);
  const approvedTotal=()=>state.requests.filter(r=>r.status==='approved').reduce((a,r)=>a+r.amount,0);
  const free=()=>total()-billsTotal()-protectedTotal()-approvedTotal();
  const pending=()=>state.requests.filter(r=>r.status==='pending');
  const incoming=(id=active)=>pending().filter(r=>r.recipient===id);
  const unread=(id=active)=>state.notifications.filter(n=>n.to===id&&!n.read).length;
  const dateText=(d)=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
  const timeText=(t)=>{const age=Date.now()-t;if(age<60000)return 'agora';if(age<3600000)return `${Math.max(1,Math.floor(age/60000))} min atrás`;if(age<86400000)return `${Math.floor(age/3600000)} h atrás`;return new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});};
  const categories=['Casa','Alimentação','Restaurantes','Delivery','Lanches','Transporte','Lazer','Compras','Saúde','Assinaturas','Hábitos','Educação','Pets','Beleza','Viagem','Presentes','Tecnologia','Trabalho','Impostos','Outros'];
  const categoryIcon=(cat)=>({Hábitos:'sparkle',Casa:'house',Alimentação:'cart',Restaurantes:'coffee',Delivery:'moto',Lanches:'coffee',Transporte:'car',Lazer:'heart',Compras:'bag',Saúde:'pulse',Assinaturas:'wifi',Educação:'scan',Pets:'heart',Beleza:'sparkle',Viagem:'plane',Presentes:'gift',Tecnologia:'phone',Trabalho:'scan',Impostos:'wallet',Outros:'wallet'}[cat]||'wallet');
  const categoryColor=(cat)=>({Hábitos:'orange',Casa:'',Alimentação:'orange',Restaurantes:'orange',Delivery:'orange',Lanches:'orange',Transporte:'blue',Lazer:'lilac',Compras:'lilac',Saúde:'blue',Assinaturas:'blue',Educação:'blue',Pets:'lilac',Beleza:'lilac',Viagem:'blue',Presentes:'orange',Tecnologia:'blue',Trabalho:'blue',Impostos:'orange'}[cat]||'');
  const monthSpend=()=>state.transactions.filter(t=>t.date.slice(0,7)===dateISO().slice(0,7)).reduce((sum,t)=>sum+t.amount,0);
  function quickCategorySuggestions(limit=5){
    const score={};
    state.transactions.slice().reverse().slice(0,100).forEach((t,i)=>{
      if(!categories.includes(t.category))return;
      let weight=Math.max(.25,1-i/120);
      if(!isSolo())weight*=shareOf(t,active)>0?1.7:.65;
      score[t.category]=(score[t.category]||0)+weight;
    });
    const defaults=isSolo()?['Alimentação','Transporte','Casa','Compras','Delivery']:['Alimentação','Delivery','Transporte','Casa','Lazer'];
    return [...new Set([...Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([c])=>c),...defaults])].filter(c=>categories.includes(c)).slice(0,limit);
  }
  function persist(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast("Não foi possível salvar no aparelho.","Exporte uma cópia dos dados e confira o armazenamento.");}try{channel?.postMessage(state);}catch{}render();publishChange();}
  function log(actor,message){state.activity.unshift({id:uid(),actor,message,createdAt:Date.now()});state.activity=state.activity.slice(0,100);}
  function notify(to,title,body,kind='info',requestId){if(isSolo())return;state.notifications.unshift({id:uid(),to,title,body,kind,...(requestId?{requestId}:{}),read:false,createdAt:Date.now()});state.notifications=state.notifications.slice(0,100);}
  function toast(title,body='',name='circleCheck'){
    title=soloStr(title);body=soloStr(body);
    if(!noticesEnabled)return;const el=document.createElement('div');el.className='toast';el.innerHTML=`${icon(name)}<div><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`;$('#toast-zone').append(el);setTimeout(()=>el.remove(),6500);
  }
  const routes=[['home','home','Hoje','Hoje',1],['future','trend','O que vem aí','Futuro',1],['analysis','scan','Raio-X dos gastos','Raio-X',1],['incomes','coins','Entradas','Entradas',0],['bills','wallet','Nossas contas','Contas',1],['requests','chat','Nossos combinados','Combinar',1],['goals','heart','Nossos planos','Planos',1],['activity','activity','Aconteceu por aqui','Atividade',0]];
  function switcher(){return profilePhotoButton();}
  function renderNav(){
    $('#desktop-nav').innerHTML=routes.filter(x=>!(isSolo()&&x[0]==='requests')).map(([r,i,n])=>`<button class="nav-item ${route===r?'active':''}" data-action="route" data-route="${r}" ${route===r?'aria-current="page"':''}>${icon(i)}<span>${n}</span>${r==='requests'&&pending().length?`<span class="count">${pending().length}</span>`:''}</button>`).join('')+`<button class="nav-item nav-chat" data-action="chat-open">${icon('sparkle')}<span>Pergunte ao Juntô</span></button>`;
    $('#mobile-nav').innerHTML=routes.filter(x=>x[4]&&!(isSolo()&&x[0]==='requests')).map(([r,i,,n])=>`<button class="${route===r?'active':''}" data-action="route" data-route="${r}" ${route===r?'aria-current="page"':''}>${icon(i)}<span>${n}</span>${r==='requests'&&pending().length?`<span class="count">${pending().length}</span>`:''}</button>`).join('');
    const title={home:'Nosso dinheiro',future:'Futuro',analysis:'Gastos',incomes:'Entradas',bills:'Contas fixas',requests:'Combinar',goals:'Plano',activity:'Atividade'}[route];
    $('#main-title').textContent=title;$('#couple-label').textContent=isSolo()?`${user('a').name} · modo individual`:`${user('a').name} & ${user('b').name}`;{const sc=$('.side-caption');if(sc)sc.textContent=isSolo()?'Meu espaço':'Nosso espaço';const sn=$('.side-note p'),ss=$('.side-note span');if(sn)sn.innerHTML=isSolo()?'Organizar sozinho é o primeiro passo.<br>A dois, fica ainda melhor.':'Amor não paga boleto.<br>Mas uma dupla organizada, sim.';if(ss)ss.textContent=isSolo()?'Um gasto de cada vez.':'Um combinado de cada vez.';const dx=$('.extra-demo-text');if(dx)dx.textContent=isSolo()?'Modo individual. Seu controle financeiro completo.':'Dois perfis. Uma mesma vida financeira.';const ob=document.querySelector('.demo-strip [data-action="onboard"]');if(ob)ob.textContent=isSolo()?'Criar minha conta':'Criar nossa dupla';}
    $('#month-label').innerHTML=icon('calendar')+' '+esc(new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
    $('#desktop-user-switch').innerHTML=switcher();$('#mobile-user-switch').innerHTML=switcher();
    const coupleCTA=$('#couple-cta');if(coupleCTA)coupleCTA.innerHTML=isSolo()?`<button class="couple-top-cta" data-action="connect" aria-label="Conectar no Juntô a dois">${icon('heart')}<span>Juntô a dois</span></button>`:'';
    $('#notification-button').innerHTML=icon('bell')+(unread()?`<span class="dot-count">${Math.min(9,unread())}</span>`:'');
    $('#settings-button').innerHTML=icon('settings');
    $('#side-couple').innerHTML=isSolo()?`<div class="av-stack">${avatar('a')}</div><div><strong>${esc(first(user('a').name))}</strong><small>Modo individual</small></div><button class="icon-btn" data-action="settings" aria-label="Ajustes">${icon('settings')}</button>`:`<div class="av-stack">${avatar('a')}${avatar('b')}</div><div><strong>${esc(first(user('a').name))} & ${esc(first(user('b').name))}</strong><small>Nossa dupla</small></div><button class="icon-btn" data-action="settings" aria-label="Personalizar a dupla">${icon('settings')}</button>`;
  }
  function topicTabs(kind,current,items){
    return `<nav class="topic-tabs" aria-label="Tópicos desta área">${items.map(([v,l])=>`<button class="topic-tab ${current===v?'active':''}" data-action="topic-tab" data-kind="${kind}" data-value="${v}" aria-pressed="${current===v}">${esc(l)}</button>`).join('')}</nav>`;
  }
  function goalPreview(g){
    if(!g)return `<div class="panel goal-panel"><h2>Tem um sonho aí?</h2><p class="goal-sub" style="margin-top:8px">Dá um nome pra ele. Vocês cuidam do resto juntos.</p><button class="btn secondary" data-action="new-goal">${icon('plus')}Criar um plano</button></div>`;
    const pct=Math.min(100,Math.round(g.saved/g.target*100));
    return `<div class="panel goal-panel"><div class="section-header"><h2>Nosso próximo sonho</h2>${icon('heart')}</div><div class="goal-layout"><div class="goal-emoji">${icon(g.icon)}</div><h3 class="goal-title">${esc(g.name)}</h3><p class="goal-sub">${pct>=100?'Pronto para sair do papel.':'Menos “um dia”. Mais “tá chegando”.'}</p><div class="goal-progress-area"><div class="progress" role="progressbar" aria-label="Progresso de ${esc(g.name)}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div><div class="progress-meta"><span>${cash(g.saved)} de ${cash(g.target)}</span><b>${pct}%</b></div><button class="btn secondary wide" data-action="contribute" data-id="${g.id}">${icon('plus')}Guardar um pouquinho</button></div></div></div>`;
  }
  function activityRows(items){return items.map(a=>`<div class="activity-row">${avatar(a.actor)}<div><p><b>${esc(first(user(a.actor).name))}</b> ${esc(a.message)}</p><time>${timeText(a.createdAt)}</time></div></div>`).join('');}
  function homeView(){
    const available=free(),request=pending()[0],g=state.goals[0],solo=isSolo();
    const now=new Date(),expectedIncome=adjustedMonthIncome(now.getFullYear(),now.getMonth()),spent=monthSpend();
    const spendPct=expectedIncome?Math.min(100,Math.round(spent/expectedIncome*100)):null;
    let insightTitle,insightBody;
    if(available<0){insightTitle=solo?'Seu mês pediu um ajuste.':'O mês pediu uma conversa.';insightBody=`Faltam ${cash(-available)} para cobrir contas, planos e valores reservados. Vale revisar antes do próximo gasto.`;}
    else if(request&&!solo){insightTitle=request.amount<=available?'Esse pedido cabe no mês.':'Esse pedido pede uma conversa.';insightBody=request.amount<=available?`Se vocês combinarem “${request.title}”, ainda sobram ${cash(available-request.amount)} livres.`:`“${request.title}” passa ${cash(request.amount-available)} do livre atual.`;}
    else{const tip=tips()[0];if(tip){insightTitle=tip.title;insightBody=tip.body.replace(/<[^>]+>/g,'');}else{insightTitle=solo?'Seu dinheiro está organizado para hoje.':'O dinheiro de vocês está organizado para hoje.';insightBody=`Depois das contas e dos planos, ${solo?'você tem':'vocês têm'} ${cash(Math.max(0,available))} livres.`;}}
    const goalPct=g?Math.min(100,Math.round(g.saved/g.target*100)):0;
    const alerts=radar().slice(0,2),latest=state.transactions.slice().sort((a,b)=>(b.createdAt||pd(b.date).getTime())-(a.createdAt||pd(a.date).getTime())).slice(0,3);
    const spendAction=solo?'can-spend':'ask',spendLabel=solo?'Posso gastar?':'Amor, posso gastar?',quickCats=quickCategorySuggestions();
    return `<div class="home-v2 home-v3">
      <div class="home-greeting home-greeting-v3"><div><span class="home-mode-badge">${solo?`${icon('wallet')}Modo solo`:`${icon('heart')}Juntô a dois`}</span><h2>Oi, ${esc(first(user().name))}.</h2><p>${solo?'Bora cuidar do seu hoje?':'Bora cuidar do nosso hoje?'}</p></div></div>
      ${incoming().length?`<div class="pending-banner">${icon('chat')}<p>${esc(first(user(other()).name))} quer combinar ${incoming().length===1?'um gasto.':`${incoming().length} gastos.`} Bora responder?</p><button data-action="route" data-route="requests">Ver pedido</button></div>`:''}
      ${(()=>{const arr=pendingArrivals();if(!arr.length)return '';const a=arr[0];return `<div class="pending-banner arrival">${icon('coins')}<p><b>${esc(a.inc.name)} de ${esc(first(user(a.inc.person).name))}</b> ${a.date===dateISO()?'cai hoje':`era pra ter caído ${dayMonth(a.date)}`}. Confirma e a previsão se ajusta.${arr.length>1?` (+${arr.length-1})`:''}</p><button data-action="income-arrived" data-id="${a.inc.id}" data-date="${a.date}">Confirmar</button></div>`;})()}
      ${contestBanner()}
      <section class="home-money-card home-money-card-v3" aria-label="Resumo financeiro">
        <div class="home-money-v3-top"><div class="home-money-v3-copy"><span class="home-money-eyebrow">LIVRE PRA CURTIR</span><div class="home-money-v3-value"><strong class="num" id="free-amount">${available<0?'− ':''}${cash(Math.abs(available))}</strong><button class="icon-btn" data-action="hide" aria-label="${hidden?'Mostrar':'Ocultar'} valores">${icon(hidden?'eyeOff':'eye')}</button></div><p>${available<0?'O mês está acima do livre atual.':'Contas e planos já separados.'}</p></div><div class="home-money-people">${state.users.map(u=>`<span class="home-money-person">${avatar(u.id)}<small>${u.id===active?'Você':solo?'Você':u.id==='b'?'Meu amor':esc(first(u.name))}</small></span>`).join('')}</div></div>
        <button class="home-money-link" data-action="route" data-route="bills">${icon('coins')}<span>${solo?'Ver meu dinheiro':'Ver nosso dinheiro'}</span><b>›</b></button>
        <span class="sr-only">${solo?'Seu saldo livre hoje':'Saldo livre da dupla hoje'}</span>
      </section>
      <div class="home-primary-actions">
        <button class="home-spend-cta" data-action="${spendAction}">${icon(solo?'sparkle':'chat')}<span>${spendLabel}</span></button>
        <button class="home-register-cta" data-action="expense">${icon('plus')}<span>Registrar gasto</span></button>
      </div>
      <section class="home-dream-card-v3">
        <div class="home-section-title"><h2>${solo?'Meu próximo sonho':'Nosso próximo sonho'}</h2>${g?'<button class="text-link" data-action="route" data-route="goals">Ver plano</button>':''}</div>
        ${g?`<div class="home-dream-main"><span class="home-dream-icon">${icon(g.icon||'heart')}</span><div><h3>${esc(g.name)}</h3><p>${goalPct>=100?'Já dá pra comemorar.':'Menos “um dia”. Mais “tá chegando”.'}</p></div></div><div class="home-progress dream"><span style="width:${goalPct}%"></span></div><div class="home-dream-progress"><span>${cash(g.saved)} de ${cash(g.target)}</span><b>${goalPct}%</b></div><button class="home-dream-save" data-action="contribute" data-id="${g.id}">${icon('plus')}Guardar um pouquinho</button>`:`<div class="home-empty-dream"><span class="home-dream-icon">${icon('heart')}</span><div><h3>Tem um sonho aí?</h3><p>Dá um nome pra ele e o Juntô ajuda a abrir caminho.</p></div></div><button class="home-dream-save" data-action="new-goal">${icon('plus')}Criar um plano</button>`}
        <button class="home-soft-insight" data-action="chat-open">${icon('sparkle')}<span><b>${esc(insightTitle)}</b><small>${esc(insightBody)}</small></span><strong>›</strong></button>
      </section>
      <details class="home-more home-more-v3">
        <summary>Mais do meu dia <span>＋</span></summary>
        <div class="home-more-body">
          <section class="home-quick-entry">
            <div class="home-section-title"><div><span class="home-plus-dot">${icon('plus')}</span><h2>Registrar mais rápido</h2></div><button class="text-link" data-action="expense">Abrir completo</button></div>
            <button class="home-smart-input" data-action="expense"><span>${icon('sparkle')}Escreva do seu jeito: “pizza 45”, “uber 18 ontem”…</span><b>Editar</b></button>
            <div class="home-category-chips">${quickCats.map(c=>`<button data-action="quick-expense" data-category="${esc(c)}">${icon(categoryIcon(c))}${esc(c)}</button>`).join('')}</div>
            <p>As sugestões mudam com o seu histórico. O Juntô aprende categoria, quem costuma pagar, valor habitual e data quando isso estiver claro — e você confirma antes de salvar.</p>
          </section>
          ${spendPct!=null?`<div class="home-mini-stat"><span>Gasto do mês</span><b class="num">${cash(spent)}</b><small>${spendPct}% da renda prevista</small></div>`:''}
          ${latest.length?`<section class="home-latest"><div class="home-section-title"><h2>Últimos lançamentos</h2><button class="text-link" data-action="route" data-route="bills">Ver todos</button></div>${latest.map(t=>{const it=itemOf(t);return `<button class="home-latest-row" data-action="tx-detail" data-id="${t.id}" aria-label="Ver detalhes de ${esc(t.name)}"><span class="category-icon ${categoryColor(t.category)}">${icon(it.icon)}</span><span class="home-latest-copy"><b>${esc(t.name)}</b><small>${dateText(t.date)} · ${esc(t.category)}</small></span><strong class="num">− ${cash(t.amount)}</strong><span class="home-chevron">›</span></button>`;}).join('')}</section>`:''}
          ${forecastStrip()}
          ${challengeStrip()}
          ${alerts.length?`<section class="radar compact"><div class="section-header"><h2>Radar</h2><span class="small muted">O Juntô fica de olho</span></div><div class="radar-list">${alerts.map(x=>`<button class="radar-item ${x.kind}" data-action="route" data-route="${x.route}" ${x.anchor?`data-anchor="${x.anchor}"`:''}>${icon(x.icon)}<span><b>${esc(x.title)}</b><small>${esc(x.body)}</small></span></button>`).join('')}</div></section>`:''}
        </div>
      </details>
    </div>`;
  }
  function requestCard(r){
    const mine=r.author===active,statusLabel={pending:'Em conversa',approved:'Combinado 💚',declined:'Fica pra depois',purchased:'Já comprou',cancelled:'Cancelado'}[r.status];
    return `<article class="list-card request-card" id="request-${r.id}"><div class="request-top"><span class="who">${avatar(r.author)}${mine?'Você':esc(first(user(r.author).name))} pediu para ${esc(first(user(r.recipient).name))}</span><span class="badge ${r.status==='pending'?'warn':r.status==='approved'||r.status==='purchased'?'success':''}">${statusLabel}</span></div><div class="request-main"><h3>${r.icon?`<span class="item-tile sm">${icon(r.icon)}</span>`:''}${esc(r.title)}</h3><strong class="num">${cash(r.amount)}</strong></div>${r.note?`<p class="request-text">“${esc(r.note)}”</p>`:''}${r.status==='pending'?`<div class="impact">${icon('sparkle')} ${r.amount<=free()?`Se combinarem, sobram <b>${cash(free()-r.amount)}</b> livres.`:`O pedido passa <b>${cash(r.amount-free())}</b> do saldo livre atual.`}</div>`:''}
      ${r.response?`<div class="response-text"><b>${esc(first(user(r.recipient).name))} respondeu</b>${esc(r.response)}</div>`:''}<div class="request-footer">${r.status==='pending'&&!mine?`<button class="btn primary" data-action="approve" data-id="${r.id}" data-actor="${active}">${icon('check')}Pode, amor!</button><button class="btn secondary" data-action="decline" data-id="${r.id}" data-actor="${active}">Hoje não, amor</button>`:''}${r.status==='pending'&&mine?`<span class="small muted">${icon('clock')}Esperando ${esc(first(user(r.recipient).name))} dar o toque.</span><button class="btn ghost" data-action="cancel-request" data-id="${r.id}" data-actor="${active}">Cancelar pedido</button>`:''}${r.status==='approved'&&mine?`<button class="btn primary" data-action="purchase" data-id="${r.id}" data-actor="${active}">${icon('cart')}Já comprei</button><button class="btn ghost" data-action="cancel-request" data-id="${r.id}" data-actor="${active}">Desistir da compra</button>`:''}${r.status==='approved'&&!mine?`<span class="small muted">Valor reservado. ${esc(first(user(r.author).name))} avisa quando comprar.</span>`:''}${r.status==='purchased'?`<span class="small muted">${icon('circleCheck')}O gasto já entrou na conta.</span>`:''}</div></article>`;
  }
  function requestsView(){
    const list=state.requests.filter(r=>requestFilter==='all'||requestFilter==='pending'&&r.status==='pending'||requestFilter==='mine'&&r.author===active||requestFilter==='received'&&r.recipient===active);
    return `<div class="topic-intro"><div><h2>Combinar</h2><p>Pedidos, respostas e decisões da dupla ficam separados por contexto.</p></div><button class="btn primary" data-action="ask">${icon('plus')}Novo pedido</button></div><div class="stats-row"><div class="stat"><span>Em conversa</span><strong>${pending().length} ${pending().length===1?'pedido':'pedidos'}</strong></div><div class="stat"><span>Reservado</span><strong class="num">${cash(approvedTotal())}</strong></div><div class="stat"><span>Livre agora</span><strong class="num">${cash(free())}</strong></div></div><div class="filters as-topics">${[['all','Todos'],['pending','Pendentes'],['mine','Eu pedi'],['received','Pra mim']].map(([v,n])=>`<button class="filter ${requestFilter===v?'selected':''}" data-action="request-filter" data-value="${v}" aria-pressed="${requestFilter===v}">${n}</button>`).join('')}</div>${list.length?list.slice().reverse().map(requestCard).join(''):`<div class="empty">${icon('chat')}<h3>Nenhum pedido por aqui.</h3><p>Do cafezinho ao sonho grande: bora conversar?</p><button class="btn primary" data-action="ask">Amor, posso gastar?</button></div>`}<div class="form-note" style="margin-top:19px"><strong>Combinado é combinado. Gasto é gasto.</strong>Ao aprovar, o valor fica reservado. Ao marcar “já comprei”, ele sai do saldo e entra nos gastos. Pedidos em conversa e recusados não descontam dinheiro.</div>`;
  }
  function goalsView(){
    const solo=isSolo(),ym=dateISO().slice(0,7),opts=state.incomes.length?planOptions():[],reco=opts.length?recommendedKey():null,hasGoals=state.goals.length>0;
    const tabs=`<nav class="plans-v3-tabs"><button class="${planTab==='goals'?'active':''}" data-action="topic-tab" data-kind="plan" data-value="goals">${icon('plane')}Sonhos</button><button class="${planTab==='plan'?'active':''}" data-action="topic-tab" data-kind="plan" data-value="plan">${icon('wallet')}Cofre</button><button class="${planTab==='challenges'?'active':''}" data-action="topic-tab" data-kind="plan" data-value="challenges">${icon('flag')}Desafios</button></nav><div class="plans-v3-more"><button class="${planTab==='cuts'?'active':''}" data-action="topic-tab" data-kind="plan" data-value="cuts">Cortes inteligentes</button><button class="${planTab==='sim'?'active':''}" data-action="topic-tab" data-kind="plan" data-value="sim">Simular</button></div>`;
    const head=`<div class="plans-v3-head"><span>${solo?'MEUS PLANOS':'NOSSOS PLANOS'}</span><h2>${solo?'Meus planos':'Nossos planos'}</h2><p>Um pouquinho vira muita coisa.</p></div>${tabs}`;
    let body='';
    if(planTab==='goals'){
      if(!hasGoals)body=`<div class="plans-v3-empty">${icon('heart')}<h3>Qual é o próximo sonho?</h3><p>Viagem, reserva, um cantinho ou qualquer coisa que mereça sair do “um dia”.</p><button class="btn primary" data-action="new-goal">Criar meu primeiro plano</button></div>`;
      else{
        const g=state.goals[0],p=Math.min(100,Math.round(g.saved/g.target*100)),contrib=state.saves.filter(x=>x.goalId===g.id).reduce((a,x)=>(a[x.actor]=(a[x.actor]||0)+x.amount,a),{}),known=(contrib.a||0)+(contrib.b||0),previous=Math.max(0,g.saved-known);
        const extra=state.goals.slice(1);
        body=`<section class="plans-v3-dream"><div class="plans-v3-dream-top"><div><span>${solo?'MEU PRÓXIMO SONHO':'NOSSO PRÓXIMO SONHO'}</span><h3>${esc(g.name)}</h3><p>${p>=100?'Esse já pode sair do papel.':'Menos “um dia”. Mais “a gente conseguiu”.'}</p></div><span class="plans-v3-illustration">${icon(g.icon||'plane')}</span></div><div class="plans-v3-progress"><span style="width:${p}%"></span></div><div class="plans-v3-progress-meta"><b>${cash(g.saved)} guardados</b><span>${p}% de ${cash(g.target)}</span></div><button class="plans-v3-detail-link" data-action="goal-detail" data-id="${g.id}">Ver detalhes e editar ›</button>${solo?`<div class="plans-v3-person"><span>${avatar('a')}</span><div><small>Você guardou</small><b class="num">${cash(contrib.a||g.saved)}</b></div></div>`:`<div class="plans-v3-people"><div>${avatar('a')}<span><small>${active==='a'?'Você':esc(first(user('a').name))}</small><b class="num">${cash(contrib.a||0)}</b></span></div><div>${avatar('b')}<span><small>${active==='b'?'Você':'Meu amor'}</small><b class="num">${cash(contrib.b||0)}</b></span></div></div>${previous?`<p class="plans-v3-previous">${cash(previous)} vieram do saldo inicial do plano, sem inventar quem contribuiu.</p>`:''}`}<button class="plans-v3-save" data-action="contribute" data-id="${g.id}">${icon('plus')}Guardar um pouquinho</button></section>${extra.length?`<section class="plans-v3-other"><div class="home-section-title"><h2>Outros sonhos</h2></div>${extra.map(x=>{const xp=Math.min(100,Math.round(x.saved/x.target*100));return `<button data-action="goal-detail" data-id="${x.id}" aria-label="Ver detalhes de ${esc(x.name)}"><span>${icon(x.icon||'heart')}</span><span><b>${esc(x.name)}</b><small>${cash(x.saved)} de ${cash(x.target)}</small></span><strong>${xp}%</strong></button>`;}).join('')}</section>`:''}<button class="plans-v3-create" data-action="new-goal">${icon('heart')}<span><b>Tem outro sonho aí?</b><small>${solo?'Tudo fica mais perto quando ganha um plano.':'Juntos, tudo fica mais perto.'}</small></span><strong>＋ Criar um plano</strong></button><div class="plans-v3-love">${icon('heart')}<span>${solo?'Um pouquinho hoje, um sonho mais perto amanhã.':'No mesmo time, até nos boletos.'}</span></div>`;
      }
    }
    if(planTab==='plan')body=`<section class="panel month-save"><div><h2>Guardado em ${monthName(new Date())}: ${cashR(savedInMonth(ym))}</h2><p>${state.plan?`Plano ${esc(state.plan.name)}: ${cashR(state.plan.monthly)} por mês, separado no dia em que o dinheiro cai.`:`Mês passado: ${cashR(savedInMonth(prevYM()))}. Escolha um plano para separar o dinheiro antes dos gastos.`}</p></div>${!state.incomes.length?`<button class="btn primary" data-action="route" data-route="incomes">Configurar entradas</button>`:''}</section>${state.incomes.length?(state.plan?activePlanPanel():`<section class="block"><div class="block-head"><h2>Escolher um plano de guardar</h2><p>Cada nível mostra quanto separar por mês e o que precisa mudar no dia a dia.</p></div><div class="plan-options">${opts.map(o=>planCard(o,o.key===reco)).join('')}</div></section>`):`<div class="empty">${icon('coins')}<h3>Primeiro, diga quando o dinheiro entra.</h3><p>O Juntô precisa das entradas para calcular um plano que caiba de verdade.</p><button class="btn primary" data-action="route" data-route="incomes">Configurar entradas</button></div>`}`;
    if(planTab==='cuts')body=cutBlock();
    if(planTab==='challenges')body=challengesView();
    if(planTab==='sim')body=`<section class="block"><div class="block-head"><h2>E se…?</h2><p>Teste corte de gasto e renda extra. O Juntô recalcula o próximo ano sem mudar o plano real até você decidir.</p></div><div class="panel sim"><div class="sim-controls"><label class="range"><span>Cortar do gasto do dia a dia <b id="sim-cut-out">${simCut}%</b></span><input type="range" id="sim-cut" min="0" max="40" step="5" value="${simCut}"></label><label class="range"><span>Renda extra por mês <b id="sim-extra-out">${brl(simExtra*100)}</b></span><input type="range" id="sim-extra" min="0" max="2000" step="50" value="${simExtra}"></label></div><div id="sim-out">${simOut()}</div></div></section>`;
    return head+`<div class="plans-v3-surface">${body}</div>`;
  }
  function activityView(){return `<div class="page-title-row"><div><h2>O que a gente fez acontecer.</h2><p>Gastos, respostas e planos. Tudo com quem fez e quando.</p></div></div><section class="panel activity-v3">${state.activity.length?activityRows(state.activity):`<div class="empty">${icon('activity')}<p>O primeiro passo da dupla aparece aqui.</p></div>`}</section>`;}
  function peerHTML(){
    const id=other(),u=user(id),list=incoming(id),r=list[list.length-1];
    const latest=state.notifications.find(n=>n.to===id&&!n.read&&Date.now()-n.createdAt<30000);
    return `<div class="phone"><div class="phone-status"><div class="phone-top"><span>${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span><span class="phone-island" aria-hidden="true"></span><span>${icon('wifi')}${icon('battery')}</span></div></div><div class="phone-body"><div class="phone-header"><div class="brand brand-mini">${brand()}</div>${avatar(id)}</div><h3 class="phone-greeting">Oi, ${esc(first(u.name))} <span aria-hidden="true">♡</span></h3><p class="phone-sub">O amor mandou um alô pro orçamento.</p>${latest?`<div class="phone-notice" role="status"><strong>${icon('bell')} Juntô · agora</strong>${esc(latest.body)}</div>`:''}<div class="phone-balance"><span>Nosso saldo livre</span><strong class="num">${cash(free())}</strong></div><div class="phone-label"><span>Chegou pra mim</span>${list.length?`<span class="count">${list.length}</span>`:''}</div>${r?`<article class="peer-request"><p class="request-from">${avatar(r.author)}${esc(first(user(r.author).name))} quer combinar</p><h3 class="request-title">${esc(r.title)}</h3><p class="request-amount num">${cash(r.amount)}</p>${r.note?`<p class="request-note">“${esc(r.note)}”</p>`:''}<p class="peer-impact">${r.amount<=free()?`Depois desse gasto, sobram ${cash(free()-r.amount)} livres.`:`Passa ${cash(r.amount-free())} do saldo livre. Vale conversar.`}</p><div class="peer-actions"><button class="btn primary" data-action="approve" data-id="${r.id}" data-actor="${id}">Pode, amor! ♡</button><button class="btn secondary" data-action="decline" data-id="${r.id}" data-actor="${id}">Hoje não, amor</button></div>${list.length>1?`<p class="small muted" style="font-size:10px;margin-top:10px">E mais ${list.length-1} ${list.length===2?'pedido':'pedidos'} para combinar.</p>`:''}</article>`:`<div class="peer-empty">${icon('circleCheck')}<p>${state.requests.some(q=>q.recipient===id&&q.status!=='pending')?'Combinado resolvido.':'A dupla tá em paz.'}</p><span>${state.requests.some(q=>q.recipient===id&&q.status==='approved')?'Seu amor já recebeu a resposta. O valor ficou reservado.':'Quando seu amor mandar um pedido, ele aparece aqui.'}</span></div>`}<div style="flex:1"></div><div class="phone-nav" aria-hidden="true"><span>${icon('home')}</span><span>${icon('wallet')}</span><span class="current">${icon('chat')}</span><span>${icon('heart')}</span></div></div><div class="phone-bottom"></div></div>`;
  }
  function renderPeer(){
    if(isSolo()){$('#peer-rail').innerHTML=connectCard(false);return;}
    if(cloudSlot){
      const waiting=state.requests.filter(r=>r.status==='pending'&&r.recipient===other()).length;
      $('#peer-rail').innerHTML=`<div class="peer-heading"><h2>Do outro lado</h2><span class="badge">${icon('link')}Sincronizado</span></div><div class="peer-live-card">${avatar(other(),'large')}<div><h3>${esc(first(user(other()).name))} está na própria conta</h3><p>${waiting?`${waiting} ${waiting===1?'pedido está esperando resposta':'pedidos estão esperando resposta'}.`:'Quando você mandar um pedido, ele aparece no Juntô da outra pessoa.'}</p><small>Por segurança, você não responde no lugar dela. A resposta sincroniza automaticamente quando ela usar a conta dela.</small></div></div>`;
      return;
    }
    $('#peer-rail').innerHTML=`<div class="peer-heading"><h2>Do outro lado</h2><span class="badge">${icon('phone')}${esc(first(user(other()).name))}</span></div>${peerHTML()}<p class="peer-caption">Envie um pedido e responda aqui.<br><strong>O combinado atualiza nas duas telas.</strong></p><div class="sync-line">${icon('link')}Celulares simulados nesta demonstração</div>`;
    if($('#modal').open&&$('#modal').dataset.kind==='peer')$('#modal-content').innerHTML=modalHead(`Celular de ${first(user(other()).name)}`)+peerHTML()+'<p class="peer-caption">A outra pessoa pode responder por aqui.<br>Esta é uma simulação no mesmo navegador.</p>';
  }
  // ===== Telas novas =====
  let simCut=20,simExtra=0,planPicker=false;
  function forecastStrip(){
    if(!state.incomes.length)return `<button class="forecast-strip empty-strip" data-action="route" data-route="incomes">${icon('calendar')}<span><b>Contem pro Juntô quando o dinheiro entra.</b><small>Salário no 5º dia útil, semanal, comissão. A previsão do mês nasce daqui.</small></span></button>`;
    const nx=pendingArrivals()[0]||nextArrivals(45)[0],M=model(),cap=dailyCap(),base=planOptions()[0].base;
    return `<button class="forecast-strip" data-action="route" data-route="future" aria-label="Abrir a previsão completa"><span><small>Próxima entrada</small><b class="num">${nx?cashR(nx.inc.amount):'—'}</b><em>${nx?`${esc(nx.inc.name)} de ${esc(first(user(nx.inc.person).name))} · ${nx.date<=dateISO()?'hoje':`${wdShort(nx.date)}, ${dayMonth(nx.date)}`}`:'Nenhuma prevista'}</em></span><span><small>Pode gastar hoje</small><b class="num">${cashR(cap)}</b><em>Ritmo atual: ${cashR(M.daily)}/dia</em></span><span><small>Sobra por mês</small><b class="num ${base<0?'neg':''}">${base<0?'−':''}${cashR(Math.abs(base))}</b><em>no ritmo atual, sem guardar nada</em></span></button>`;
  }
  function saveFirstPanel(){
    const ym=dateISO().slice(0,7),saved=savedInMonth(ym);
    if(!state.plan){if(!state.incomes.length)return '';const o=planOptions().find(x=>x.key===recommendedKey());
      return `<section class="save-panel">${icon('coins')}<div><h2>Guardar primeiro</h2><p>${savedInMonth(prevYM())?`Mês passado vocês guardaram ${cashR(savedInMonth(prevYM()))}.`:'Vocês ainda não têm um valor certo pra guardar.'} ${o&&o.monthly?`Dá pra separar ${cashR(o.monthly)} por mês, no dia em que o dinheiro cai.`:'No ritmo atual, não sobra. Vejam onde o dinheiro escapa.'}</p></div><button class="btn lime" data-action="route" data-route="goals">Montar o plano</button></section>`;}
    const p=state.plan,pc=Math.min(100,Math.round(saved/p.monthly*100)),nxt=remainingMonthOcc().map(x=>({...x,share:planShare(x.inc,x.date)})).find(x=>x.share>0);
    return `<section class="save-panel on">${icon('coins')}<div><h2>Guardar primeiro · ${cashR(saved)} de ${cashR(p.monthly)}</h2><div class="progress" role="progressbar" aria-label="Plano do mês" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pc}%"></span></div><p>${pc>=100?'Meta do mês cumprida. O resto é vida.':nxt?`Próximo: ${nxt.date<=dateISO()?'hoje':dayMonth(nxt.date)}, quando cai ${esc(nxt.inc.name.toLowerCase())} de ${esc(first(user(nxt.inc.person).name))}, separar ${cashR(nxt.share)}.`:'Nenhuma entrada até o fim do mês. Dá pra completar com o que sobrou.'}</p></div><button class="btn secondary" data-action="route" data-route="goals">Ver plano</button></section>`;
  }
  function planCard(o,reco){
    const g=state.goals[0];
    return `<article class="plan-option ${reco?'reco':''}"><div class="plan-option-top"><h3>${o.name}</h3>${reco?'<span class="badge success">Pra vocês agora</span>':''}</div><p class="plan-amount num">${cashR(o.monthly)}<small> por mês</small></p><p class="plan-rule">O dia a dia cabe em <b>${cashR(o.dailyLimit)} por dia</b>. Hoje: ${cashR(o.variable/30.4)}.</p><ul class="recipe">${o.recipe.map(recipeLine).join('')}</ul><p class="plan-year">Em 12 meses: <b>${cashR(o.monthly*12)}</b>${g&&o.monthly?`<br>${esc(g.name)}: ${etaText(g.target-g.saved,o.monthly)}`:''}</p><button class="btn ${reco?'primary':'secondary'} wide" data-action="plan-pick" data-key="${o.key}" ${o.monthly?'':'disabled'}>${o.monthly?`Guardar ${cashR(o.monthly)} por mês`:'Não sobra nesse nível'}</button></article>`;
  }
  function monthSchedule(){
    const n=new Date(),y=n.getFullYear(),m=n.getMonth(),today=dateISO();
    return state.incomes.flatMap(i=>occurrences(i,dateISO(new Date(y,m,1)),dateISO(new Date(y,m+1,0))).filter(d=>d>=(i.since||'0000')).map(d=>({inc:i,date:d}))).sort((a,b)=>a.date.localeCompare(b.date)).map(x=>{const h=handled(x.inc.id,x.date);return {...x,status:h?h.status:x.date<=today?'now':'future',share:h?0:planShare(x.inc,x.date)};});
  }
  function activePlanPanel(){
    const p=state.plan,ym=dateISO().slice(0,7),saved=savedInMonth(ym),pc=Math.min(100,Math.round(saved/p.monthly*100)),g=state.goals.find(x=>x.id===p.goalId),n=new Date();
    const mi=monthIncome(n.getFullYear(),n.getMonth()),got=state.received.filter(r=>r.status==='received'&&r.date.slice(0,7)===ym&&r.at>=(p.startedAt||0)).reduce((s,r)=>s+r.amount,0),expected=mi?p.monthly*got/mi:0;
    const ok=saved>=expected*.9,sched=monthSchedule();
    return `<section class="panel plan-active"><div class="section-header"><div><h2>Plano ${esc(p.name)}: ${cashR(p.monthly)} por mês</h2><p class="small muted" style="margin-top:4px">Para ${g?esc(g.name):'o cofre'}. Guardado no dia em que cada entrada cai.</p></div><span class="badge ${pc>=100||ok?'success':'warn'}">${pc>=100?'Mês cumprido':ok?'No ritmo':`Faltam ${cashR(expected-saved)} pro ritmo`}</span></div><div class="progress big"><span style="width:${pc}%"></span></div><div class="progress-meta"><span>${cashR(saved)} guardados em ${monthName(n)}</span><b>${pc}%</b></div>
      <ol class="schedule">${sched.map(x=>`<li class="${x.status}"><time><b>${pd(x.date).getDate()}</b>${wdShort(x.date)}</time><div><strong>${esc(x.inc.name)} · ${esc(first(user(x.inc.person).name))}</strong><span>${x.status==='received'?'Entrou':x.status==='skipped'?'Não entrou':x.status==='now'?'Era pra ter caído':'Previsto'} · ${cashR(x.inc.amount)}</span></div>${x.status==='now'?`<button class="btn primary" data-action="income-arrived" data-id="${x.inc.id}" data-date="${x.date}">Confirmar e guardar ${cashR(x.share)}</button>`:x.status==='future'?`<em>guardar ${cashR(x.share)}</em>`:`<em class="done">${icon('check')}</em>`}</li>`).join('')}</ol>
      <div class="autopilot"><div><h3>Piloto automático</h3><p>${p.auto!==false?'Ligado: entradas automáticas já caem guardando a parte do plano.':'Desligado: o Juntô só pergunta quando o dinheiro entra.'}</p></div><button class="toggle ${p.auto!==false?'on':''}" data-action="plan-auto" role="switch" aria-checked="${p.auto!==false}" aria-label="Piloto automático do plano"></button></div><div class="plan-actions"><button class="btn secondary" data-action="plan-change">${planPicker?'Fechar opções':'Trocar plano'}</button><button class="btn ghost" data-action="plan-off">Pausar plano</button></div></section>${planPicker?`<div class="plan-options" style="margin-top:14px">${planOptions().map(o=>planCard(o,o.key===recommendedKey())).join('')}</div>`:''}`;
  }
  function personCard(id){
    const r=personReading(id),u=user(id),nm=first(u.name);
    const label={bad:'Gasta mais do que entra',warn:'Puxando o gasto',success:'No ritmo'}[r.status];
    const line=r.status==='bad'?`No ritmo dos últimos 30 dias, ${esc(nm)} sai ${cashR(-r.net)} por mês acima do que entra pra ${esc(nm)}. Quem cobre hoje é o saldo da dupla.`:r.status==='warn'?`${esc(nm)} faz ${pct(r.varShare)} do gasto do dia a dia da dupla com ${pct(r.incShare)} da renda. Na proporção da renda, sobrariam ${cashR(r.excess)} por mês.`:`${esc(nm)} gasta dentro da parte da renda: ${pct(r.varShare)} do gasto do dia a dia, com ${pct(r.incShare)} da renda.`;
    return `<article class="person-card ${r.status}"><div class="person-top">${avatar(id,'large')}<div><h3>${esc(nm)}</h3><span class="badge ${r.status}">${label}</span></div></div>
      <div class="share-bars"><div><span>Renda</span><div class="bar"><span style="width:${pct(r.incShare)}"></span></div><b>${pct(r.incShare)}</b></div><div><span>Gasto</span><div class="bar spend"><span style="width:${pct(r.varShare)}"></span></div><b>${pct(r.varShare)}</b></div></div>
      <p class="person-line">${line}${r.prevRatio!=null&&Math.abs(r.prevRatio)>=.12?` <span class="${r.prevRatio>0?'neg':'pos'}">${r.prevRatio>0?'Subiu':'Caiu'} ${pct(Math.abs(r.prevRatio))} em relação aos 30 dias anteriores.</span>`:''}</p>
      <dl class="person-nums"><div><dt>Entra no mês</dt><dd class="num">${cashR(r.inc)}</dd></div><div><dt>Parte nas fixas</dt><dd class="num">${cashR(r.fixed)}</dd></div><div><dt>Dia a dia / mês</dt><dd class="num">${cashR(r.v)}</dd></div><div><dt>Sobra individual</dt><dd class="num ${r.net<0?'neg':''}">${r.net<0?'−':''}${cashR(Math.abs(r.net))}</dd></div></dl>
      ${r.cats.length?`<p class="person-cats">Mais pesa: ${r.cats.map(([c,v])=>`${esc(c)} <b>${cashR(v)}</b>`).join(' · ')}</p>`:''}</article>`;
  }
  function simOut(){
    const o=planOptions()[0],cut=simCut/100,extra=simExtra*100,sobra=o.inc+extra-o.fixed-o.variable*(1-cut);
    const base=monthSamples(simulate({days:366})),scen=monthSamples(simulate({days:366,cut,extra})),gB=base[12].bal-base[0].bal,gS=scen[12].bal-scen[0].bal,g=state.goals[0];
    return `<div class="sim-stats"><div><span>Sobra por mês</span><strong class="num ${sobra<0?'neg':''}">${sobra<0?'−':''}${cashR(Math.abs(sobra))}</strong></div><div><span>Em 12 meses</span><strong class="num ${gS<0?'neg':''}">${gS<0?'−':''}${cashR(Math.abs(gS))}</strong><small>no ritmo atual: ${gB<0?'−':''}${cashR(Math.abs(gB))}</small></div><div><span>${g?esc(g.name):'Primeiro plano'}</span><strong>${g?etaText(g.target-g.saved,Math.max(0,sobra-CUSHION)):'—'}</strong></div></div><div class="year-chart">${yearChart(base,scen,chartWidth(46))}<div class="legend"><span class="lg scen">Esse cenário</span><span class="lg base">Se continuar assim</span></div></div>`;
  }
  function futureView(){
    const solo=isSolo(),M=model(),n=new Date(),mName=monthName(n),dE=daysUntil(endOfMonthISO());
    const hasIncome=state.incomes.length>0,pts=hasIncome?simulate({days:Math.max(45,dE+10)}):[],eomP=pts.length?pts[dE]:null,cap=hasIncome?dailyCap():0;
    const incomeEvents=[...pendingArrivals(),...nextArrivals(45)].map(x=>({id:x.inc.id,date:x.date,name:x.inc.name,amount:x.inc.amount,kind:'in',person:x.inc.person}));
    const billEvents=state.bills.filter(b=>b.status==='open'&&b.due>=dateISO()).map(b=>({id:b.id,date:b.due,name:b.name,amount:b.amount,kind:'out',payer:b.payer}));
    const events=[...incomeEvents,...billEvents].sort((a,b)=>a.date.localeCompare(b.date)||(a.kind==='in'?-1:1)).slice(0,3);
    const ym=dateISO().slice(0,7),disc=['Delivery','Restaurantes','Lanches','Lazer','Compras','Hábitos'];
    const byDisc={};state.transactions.filter(t=>!t.billId&&t.date.slice(0,7)===ym&&disc.includes(t.category)).forEach(t=>byDisc[t.category]=(byDisc[t.category]||0)+t.amount);
    const topDisc=Object.entries(byDisc).sort((a,b)=>b[1]-a[1])[0];
    const smartCat=topDisc?.[0]||'Delivery',smartSave=topDisc?Math.max(1000,Math.round(topDisc[1]*.2/100)*100):0;
    const mainTabs=`<nav class="future-v3-tabs" aria-label="Futuro"><button class="${futureTab==='forecast'?'active':''}" data-action="topic-tab" data-kind="future" data-value="forecast">Previsão</button><button class="${futureTab==='tips'?'active':''}" data-action="topic-tab" data-kind="future" data-value="tips">Simular</button><button data-action="route" data-route="incomes">Entradas</button></nav>`;
    const head=`<div class="future-v3-head"><span>${solo?'MEU PLANEJAMENTO':'NOSSO PLANEJAMENTO'}</span><h2>${solo?'Meu futuro':'Nosso futuro'}</h2><p>Pra sonhar sem susto.</p></div>${mainTabs}<div class="future-v3-more"><button class="${futureTab==='calendar'?'active':''}" data-action="topic-tab" data-kind="future" data-value="calendar">${icon('calendar')}Calendário</button>${solo?'':`<button class="${futureTab==='people'?'active':''}" data-action="topic-tab" data-kind="future" data-value="people">${icon('heart')}Por pessoa</button>`}</div>`;
    if(!hasIncome&&futureTab==='forecast')return head+`<div class="future-v3-empty">${icon('trend')}<h3>Primeiro, conta pro Juntô o que vai cair.</h3><p>Salário, entrada semanal, comissão ou qualquer recebimento recorrente. A previsão nasce daí.</p><button class="btn primary" data-action="income-new">Configurar entrada</button></div>`;
    if(futureTab==='forecast'){
      const finalValue=eomP?eomP.free:free();
      const chart=pts.length?monthChart(pts,chartWidth(56),dE):'';
      return head+`<div class="future-v3-surface"><section class="future-v3-card"><span class="future-v3-eyebrow">NO FIM DO MÊS</span><strong class="future-v3-total num ${finalValue<0?'neg':''}">${finalValue<0?'− ':''}${cashR(Math.abs(finalValue))}</strong><p>${finalValue<0?'Se o ritmo continuar assim, o mês fecha apertado.':'Se o ritmo continuar assim.'}</p><div class="future-v3-chart">${chart}</div><div class="future-v3-cap"><span>${icon('sparkle')}Ritmo seguro hoje</span><b class="num">${cashR(cap)}</b></div><div class="future-v3-events"><div class="home-section-title"><h2>O que vem aí</h2><button class="text-link" data-action="topic-tab" data-kind="future" data-value="calendar">Ver previsão completa</button></div>${events.length?events.map(e=>`<button data-action="${e.kind==='in'?'income-edit':'bill-detail'}" data-id="${e.id}" class="future-v3-event" aria-label="${e.kind==='in'?`Editar entrada ${esc(e.name)}`:`Ver detalhes de ${esc(e.name)}`}"><span class="future-v3-event-icon ${e.kind}">${icon(e.kind==='in'?'wallet':'house')}</span><span><b>${esc(e.name)}</b><small>${dateText(e.date)}${e.kind==='in'&&e.person?` · ${esc(first(user(e.person).name))}`:''}</small></span><strong class="num ${e.kind==='in'?'pos':''}">${e.kind==='in'?'+ ':'− '}${cashR(e.amount)}</strong><em>›</em></button>`).join(''):`<div class="home-empty-row">${icon('calendar')}<span><b>Nada grande previsto.</b><small>Cadastre entradas e contas para deixar a leitura mais precisa.</small></span></div>`}</div></section><section class="future-v3-nudge"><span class="future-v3-nudge-icon">${icon(categoryIcon(smartCat))}</span><div><h3>E se ${esc(smartCat.toLowerCase())} desse uma folguinha?</h3><p>${smartSave?`Um corte de 20% no ritmo atual libera cerca de ${cashR(smartSave)} neste mês.`:'Simule um corte e veja seu plano chegar mais cedo.'}</p></div><button data-action="topic-tab" data-kind="future" data-value="tips">${icon('trend')}Testar uma economia</button></section></div>`;
    }
    if(futureTab==='tips'){
      const tipList=tips();
      return head+`<div class="future-v3-surface"><section class="future-v3-sim"><div class="future-v3-sim-head"><span>${icon('sparkle')}</span><div><h2>Pequenos cortes, sonho mais perto.</h2><p>O Juntô prioriza sugestões usando seus gastos reais — não uma lista genérica.</p></div></div>${tipList.length?`<div class="tip-list">${tipList.slice(0,6).map(t=>`<article class="tip">${t.person?avatar(t.person):`<span class="tip-icon">${icon(t.icon)}</span>`}<div><h3>${esc(t.title)}</h3><p>${t.body}</p></div><span class="tip-impact num">+${cashR(t.impact)}<small>/mês</small></span></article>`).join('')}</div>`:`<div class="empty">${icon('sparkle')}<h3>Nenhum vazamento importante agora.</h3><p>O ritmo atual está perto das metas. Continue registrando para o Juntô aprender melhor.</p></div>`}<button class="future-v3-plan-link" data-action="route" data-route="goals">${icon('heart')}Levar uma economia para o plano</button></section></div>`;
    }
    if(futureTab==='calendar')return head+`<div class="future-v3-surface">${calendarView()}</div>`;
    if(futureTab==='people'){const heads=['a','b'].map(personReading),heavy=heads.filter(h=>h.status!=='success').sort((a,b)=>(b.status==='bad')-(a.status==='bad')||b.excess-a.excess)[0];return head+`<div class="future-v3-surface"><section class="block"><div class="block-head"><h2>${heavy?`Quem precisa segurar mais agora: ${esc(first(user(heavy.id).name))}.`:'Os dois estão no ritmo da própria renda.'}</h2><p>Gasto do dia a dia comparado com quanto entra para cada um. Contas divididas contam pela parte de cada pessoa.</p></div><div class="person-grid">${personCard('a')}${personCard('b')}</div></section></div>`;}
    return head;
  }
    function incomesView(){
    const solo=isSolo(),n=new Date(),ym=dateISO().slice(0,7),expected=adjustedMonthIncome(n.getFullYear(),n.getMonth()),got=state.received.filter(r=>r.status==='received'&&r.date.slice(0,7)===ym).reduce((sum,r)=>sum+r.amount,0),pend=pendingArrivals(),next=nextArrivals(62),M=model();
    const monthFuture=next.filter(x=>x.date.slice(0,7)===ym),rest=Math.max(0,expected-got),nextOne=pend[0]||monthFuture[0]||next[0];
    const groups={};next.forEach(x=>(groups[x.date.slice(0,7)]=groups[x.date.slice(0,7)]||[]).push(x));
    const tabs=`<nav class="income-v3-tabs" aria-label="Entradas"><button class="${incomeTab==='overview'?'active':''}" data-action="topic-tab" data-kind="income" data-value="overview">Resumo</button><button class="${incomeTab==='sources'?'active':''}" data-action="topic-tab" data-kind="income" data-value="sources">Entradas</button><button class="${incomeTab==='calendar'?'active':''}" data-action="topic-tab" data-kind="income" data-value="calendar">Calendário</button><button class="${incomeTab==='base'?'active':''}" data-action="topic-tab" data-kind="income" data-value="base">Ajustes</button></nav>`;
    const head=`<div class="income-v3-head"><button class="income-v3-back" data-action="route" data-route="future">‹ <span>Futuro</span></button><span>${solo?'MEU PLANEJAMENTO':'NOSSO PLANEJAMENTO'}</span><h2>O que vai cair?</h2><p>Pra planejar antes do Pix.</p></div>${tabs}`;
    if(incomeTab==='overview'){
      return head+`<div class="income-v3-surface"><section class="income-v3-total"><div><span>PREVISTO NO MÊS</span><strong class="num">${cashR(expected)}</strong><p>${solo?'Entradas que você configurou.':'Entradas configuradas pela dupla.'}</p></div><span class="income-v3-month">${esc(monthName(n))} ${n.getFullYear()}⌄</span></section><section class="income-v3-list"><div class="home-section-title"><h2>Entradas configuradas</h2><button class="text-link" data-action="topic-tab" data-kind="income" data-value="sources">Gerenciar</button></div>${state.incomes.length?state.incomes.map(i=>{const nx=next.find(x=>x.inc.id===i.id);return `<button class="income-v3-row" data-action="income-edit" data-id="${i.id}"><span class="income-v3-icon ${i.person==='b'?'pink':''}">${icon('wallet')}</span><span><b>${esc(i.name)}</b><small>${esc(first(user(i.person).name))} · ${esc(ruleText(i))}${nx?`<br>Próximo: ${dateText(nx.date)}`:''}</small></span><strong class="num">${cashR(i.amount)}${i.rule==='weekly'?'<small>por semana</small>':''}</strong><em>›</em></button>`;}).join(''):`<div class="home-empty-row">${icon('wallet')}<span><b>Nenhuma entrada configurada.</b><small>Adicione salário, renda semanal, comissão ou outro recebimento.</small></span></div>`}<div class="income-v3-confirm">${icon('bell')}<span>${nextOne?`Próxima confirmação: ${esc(nextOne.inc.name)} · ${dateText(nextOne.date)}.`:'Você confirma quando cada valor cair.'}</span></div></section><section class="income-v3-insight">${icon('sparkle')}<div><b>${rest>0?`${cashR(rest)} ainda estão previstos para ${monthName(n)}.`:'As entradas previstas deste mês já foram confirmadas.'}</b><p>${M.coverage>=14?'A previsão já usa seu ritmo real de gastos para ajustar o que sobra.':'Continue registrando gastos: quanto mais histórico, mais precisa fica a previsão.'}</p></div></section><button class="income-v3-add" data-action="income-new">${icon('plus')}Adicionar entrada</button><button class="income-v3-link" data-action="topic-tab" data-kind="income" data-value="calendar">Ver recebimentos ›</button></div>`;
    }
    if(incomeTab==='sources'){
      return head+`<div class="income-v3-surface"><div class="income-v3-toolbar"><div><h2>Suas regras de entrada</h2><p>Edite frequência, valor e quem recebe.</p></div><button class="btn primary" data-action="income-new">${icon('plus')}Nova entrada</button></div>${state.incomes.length?state.incomes.map(i=>{const nx=next.find(x=>x.inc.id===i.id);return `<article class="list-card"><div class="category-icon">${icon(i.rule==='weekly'?'repeat':'coins')}</div><div class="list-data"><h3>${esc(i.name)} · ${esc(first(user(i.person).name))}</h3><p>${esc(ruleText(i))}${nx?` · próxima: ${dateText(nx.date)}`:''}${i.auto?' · confirma sozinho':''}</p></div><div><div class="list-amount num">${cashR(i.amount)}</div><div class="list-buttons"><button class="btn secondary" data-action="income-edit" data-id="${i.id}">Ajustar</button><button class="icon-btn" data-action="income-remove" data-id="${i.id}" aria-label="Remover ${esc(i.name)}">${icon('trash')}</button></div></div></article>`;}).join(''):`<div class="future-v3-empty">${icon('coins')}<h3>Quando o dinheiro cai?</h3><p>Cadastre uma entrada para o Juntô calcular o mês.</p><button class="btn primary" data-action="income-new">Adicionar entrada</button></div>`}</div>`;
    }
    if(incomeTab==='calendar'){
      return head+`<div class="income-v3-surface">${next.length?`<section class="income-v3-calendar"><div class="home-section-title"><h2>Próximos 60 dias</h2><span>${cashR(next.reduce((sum,x)=>sum+x.inc.amount,0))} previstos</span></div><div class="panel timeline">${Object.entries(groups).map(([k,list])=>`<div class="tl-month"><h3>${monthName(pd(k+'-01'))}<span class="num">${cashR(list.reduce((sum,x)=>sum+x.inc.amount,0))}</span></h3>${list.map(x=>`<button class="tl-row" data-action="income-edit" data-id="${x.inc.id}" aria-label="Editar entrada ${esc(x.inc.name)}"><time><b>${pd(x.date).getDate()}</b>${wdShort(x.date)}</time>${avatar(x.inc.person)}<span><strong>${esc(x.inc.name)}</strong><small>${esc(ruleText(x.inc))}</small></span><b class="num">${cashR(x.inc.amount)}</b></button>`).join('')}</div>`).join('')}</div></section>`:`<div class="future-v3-empty">${icon('calendar')}<h3>Nenhuma entrada prevista.</h3><p>Cadastre uma entrada recorrente para montar o calendário.</p></div>`}</div>`;
    }
    return head+`<div class="income-v3-surface"><section class="income-v3-adjust"><div><h2>Como a previsão aprende</h2><p>Hoje o Juntô usa ${M.coverage} dias de gastos registrados e compara isso com as entradas configuradas.</p></div><form class="panel form estimate-form" data-form="estimate">${field('estimate-amount','Estimativa de gasto do dia a dia por mês','0,00',state.settings.variableEstimate?moneyNumber(state.settings.variableEstimate):'',true)}<p class="form-note">A estimativa perde peso conforme entram gastos reais. Você pode corrigir sem apagar o histórico.</p><p class="form-error" role="alert" id="form-error"></p><button class="btn secondary" type="submit">Salvar estimativa</button></form></section></div>`;
  }
    function planOptionByKey(key){
    if(key==='cortes'){const {monthly}=cutTotals(),base=planOptions()[0].base,M=model();return {key:'cortes',name:'Cortes',pct:M.monthlyVar?monthly/M.monthlyVar:0,monthly:Math.max(5000,Math.floor((base+monthly-CUSHION)/5000)*5000),variable:M.monthlyVar,dailyLimit:(M.monthlyVar-monthly)/30.4};}
    if(key!=='metas')return planOptions().find(x=>x.key===key);
    const B=budgets(),M=model(),inc=avgIncome(),fixed=fixedMonthly(),saveVar=B.reduce((s,b)=>s+b.save,0),monthly=Math.max(0,Math.floor((inc-fixed-M.monthlyVar+saveVar-CUSHION)/5000)*5000);
    return {key:'metas',name:'Metas do Raio-X',pct:M.monthlyVar?saveVar/M.monthlyVar:0,monthly,variable:M.monthlyVar,dailyLimit:(M.monthlyVar-saveVar)/30.4};
  }
  function planModal(key){
    const o=planOptionByKey(key);if(!o)return;
    const goals=state.goals;
    openModal(`Plano ${o.name}: guardar ${brl(o.monthly)} por mês.`,`<p class="modal-sub">Cada vez que uma entrada cair, o Juntô pede pra separar a parte dela antes de qualquer gasto. O valor fica protegido no plano escolhido.</p><form class="form" data-form="plan" data-key="${key}">${field('plan-amount','Quanto por mês?','0,00',moneyNumber(o.monthly),true)}<div class="field"><label for="plan-goal">Guardar em qual plano?</label><select id="plan-goal" name="plan-goal">${goals.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}<option value="__new">Criar “Cofre da dupla”</option></select></div><label class="check"><input type="checkbox" name="plan-auto" checked><span>Piloto automático<small>Nas entradas marcadas como automáticas, o Juntô confirma e já separa a parte do plano sozinho. Nas outras, ele pergunta.</small></span></label><div class="form-note"><strong>O dia a dia passa a caber em ${brl(o.dailyLimit)} por dia.</strong>Hoje vocês gastam ${brl(o.variable/30.4)}. O Juntô mostra quanto pode gastar por dia, já descontando o que vai pro plano.</div>${formEnd('Começar a guardar primeiro')}</form>`,'plan');
  }
  function arrivalModal(incId,date){
    const inc=state.incomes.find(i=>i.id===incId);if(!inc||handled(incId,date))return;
    const share=planShare(inc,date),goals=state.goals;
    openModal(`Caiu ${inc.name.toLowerCase()} de ${first(user(inc.person).name)}?`,`<p class="modal-sub">${dateLong(date)} · previsto ${money(inc.amount)}. Confirme quanto entrou de verdade.</p><form class="form" data-form="arrival" data-id="${incId}" data-date="${date}">${field('arrival-amount','Quanto entrou?','0,00',moneyNumber(inc.amount),true)}${goals.length?`<div class="save-first"><div class="save-first-head">${icon('coins')}<div><strong>Guardar primeiro</strong><p>${state.plan?`Pelo plano ${esc(state.plan.name)}, a parte desta entrada é ${money(share)}.`:'Sugestão: 10% desta entrada, antes de qualquer gasto.'}</p></div></div><div class="field-pair">${field('arrival-save','Separar agora','0,00',moneyNumber(share),true)}<div class="field"><label for="arrival-goal">Para qual plano?</label><select id="arrival-goal" name="arrival-goal">${goals.map(g=>`<option value="${g.id}" ${g.id===state.plan?.goalId?'selected':''}>${esc(g.name)}</option>`).join('')}</select></div></div></div>`:''}${formEnd('Confirmar entrada')}<button type="button" class="btn ghost wide" data-action="income-skip" data-id="${incId}" data-date="${date}">Não entrou desta vez</button></form>`,'arrival');
  }
  function incomeModal(id){
    const inc=id?state.incomes.find(i=>i.id===id):{name:'',person:active,amount:0,rule:'business',nth:5,countSat:true,weekday:5,day:20};if(!inc)return;
    const rf=(r)=>inc.rule!==r?'hidden':'';
    openModal(id?'Ajustar entrada':'Nova entrada prevista',`<p class="modal-sub">Como esse dinheiro cai? A previsão se ajusta na hora.</p><form class="form" data-form="income" ${id?`data-id="${id}"`:''}>${field('income-name','Nome','Ex.: salário, semanal, freela',inc.name)}<div class="field-pair">${field('income-amount','Valor de cada entrada','0,00',inc.amount?moneyNumber(inc.amount):'',true)}<div class="field"><label for="income-person">De quem?</label><select id="income-person" name="income-person">${state.users.map(u=>`<option value="${u.id}" ${u.id===inc.person?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
      <div class="segmented" aria-label="Quando cai">${[['business','Dia útil'],['weekly','Toda semana'],['monthly','Dia fixo']].map(([v,l])=>`<label><input type="radio" name="income-rule" value="${v}" ${inc.rule===v?'checked':''}>${l}</label>`).join('')}</div>
      <div class="rule-field" data-rule="business" ${rf('business')}><div class="field"><label for="income-nth">Qual dia útil do mês?</label><select id="income-nth" name="income-nth">${Array.from({length:10},(_,k)=>k+1).map(k=>`<option value="${k}" ${Number(inc.nth||5)===k?'selected':''}>${k}º dia útil</option>`).join('')}</select></div><label class="check"><input type="checkbox" name="income-sat" ${inc.countSat!==false?'checked':''}><span>Sábado conta como dia útil<small>É a regra da CLT para salário. Desmarque se a empresa conta só de segunda a sexta. Domingos e feriados nacionais nunca contam.</small></span></label></div>
      <div class="rule-field" data-rule="weekly" ${rf('weekly')}><div class="field"><label for="income-weekday">Em qual dia da semana?</label><select id="income-weekday" name="income-weekday">${WEEKDAYS.map((w,k)=>`<option value="${k}" ${Number(inc.weekday)===k?'selected':''}>${w}</option>`).join('')}</select></div></div>
      <div class="rule-field" data-rule="monthly" ${rf('monthly')}><div class="field"><label for="income-day">Dia do mês</label><input id="income-day" name="income-day" type="number" min="1" max="31" inputmode="numeric" value="${inc.day||20}"></div></div>
      <label class="check"><input type="checkbox" name="income-auto" ${inc.auto?'checked':''}><span>Confirmar sozinho no dia previsto<small>Bom pra entradas certas, como um valor semanal. Com o plano no piloto automático, a parte de guardar já sai junto.</small></span></label>
      <div class="form-note" id="income-preview"></div>${formEnd(id?'Salvar entrada':'Adicionar entrada')}</form>`,'income');
    updateIncomePreview();
  }
  function readIncomeForm(form){
    const d=new FormData(form),rule=d.get('income-rule')||'business';
    return {name:String(d.get('income-name')||'').trim(),person:d.get('income-person'),amount:parseMoney(d.get('income-amount')),rule,nth:Number(d.get('income-nth'))||5,countSat:d.get('income-sat')==='on',auto:d.get('income-auto')==='on',weekday:Number(d.get('income-weekday')),day:Math.min(31,Math.max(1,Number(d.get('income-day'))||1))};
  }
  function updateIncomePreview(){
    const form=document.querySelector('[data-form="income"]'),el=$('#income-preview');if(!form||!el)return;
    const inc=readIncomeForm(form),T=new Date(),list=occurrences(inc,dateISO(T),dateISO(addDays(T,inc.rule==='weekly'?27:100))).slice(0,4);
    form.querySelectorAll('.rule-field').forEach(f=>f.hidden=f.dataset.rule!==inc.rule);
    const perMonth=Number.isFinite(inc.amount)&&inc.amount>0?occurrences(inc,dateISO(new Date(T.getFullYear(),T.getMonth()+1,1)),dateISO(new Date(T.getFullYear(),T.getMonth()+2,0))).length*inc.amount:0;
    el.innerHTML=`<strong>Próximas: ${list.map(x=>`${wdShort(x)}, ${dayMonth(x)}`).join(' · ')||'—'}</strong>${perMonth?`No mês que vem, isso soma ${money(perMonth)}.`:'Informe o valor pra ver quanto soma no mês.'}`;
  }
  // ===== Raio-X: metas por gasto, contas fixas, meses anteriores =====
  let pickedMonth=null;const openCats=new Set(),chartStore={};
  const REF={Hábitos:.01,Casa:.30,Alimentação:.15,Delivery:.04,Lanches:.02,Transporte:.10,Lazer:.07,Compras:.05,Saúde:.06,Assinaturas:.03,Outros:.03};
  const shortMoney=(c)=>{const v=Math.abs(c)/100,s=v>=1000?`R$ ${(v/1000).toFixed(v>=10000?0:1).replace('.',',')} mil`:`R$ ${Math.round(v)}`;return (c<0?'−':'')+s;};
  const cashS=(c)=>hidden?'•••':shortMoney(c);
  const daysLeftIncl=()=>{const T=new Date();return daysInMonth(T.getFullYear(),T.getMonth())-T.getDate()+1;};
  function budgets(){return cached('budgets',()=>{
    const M=model(),ym=dateISO().slice(0,7),left=daysLeftIncl(),inc=avgIncome()||1,T0=new Date(),elapsed=T0.getDate()/daysInMonth(T0.getFullYear(),T0.getMonth());
    const pctCut=state.plan?state.plan.cut??.2:((planOptions().find(o=>o.key===recommendedKey())||{pct:.2}).pct);
    const list=Object.values(M.fc).filter(x=>x.f>0||x.l30>0),W=(c)=>CUT_WEIGHT[c]??.3,C=list.reduce((s,x)=>s+x.f*W(x.c),0),total=list.reduce((s,x)=>s+x.f,0),cutAmt=Math.min(total*pctCut,C);
    const mtd={};state.transactions.forEach(t=>{if(!t.billId&&t.date.slice(0,7)===ym)mtd[t.category]=(mtd[t.category]||0)+t.amount;});
    return list.map(x=>{
      const sugg=Math.max(0,Math.round((x.f-(C?cutAmt*x.f*W(x.c)/C:0))/1000)*1000),custom=state.budgets[x.c],budget=Number.isSafeInteger(custom)?custom:sugg,spent=mtd[x.c]||0,proj=spent+x.f/30.4*(left-1);
      const pace=budget*elapsed,status=spent>budget?'over':spent>pace*1.15+1500?'tight':'ok';
      const avg3=x.hist.length?x.hist.slice(-3).reduce((a,v)=>a+v,0)/Math.min(3,x.hist.length):x.l30;
      return {...x,pace,elapsed,sugg,custom:Number.isSafeInteger(custom),budget,mtd:spent,proj,status,left,remaining:budget-spent,perDay:Math.max(0,budget-spent)/left,save:Math.max(0,x.f-budget),savePct:x.f?Math.max(0,x.f-budget)/x.f:0,ref:(REF[x.c]??.03)*inc,refPct:x.f/inc,avg3,change:avg3?x.f/avg3-1:0};
    }).sort((a,b)=>b.f-a.f);
  });}
  function fixedReading(){return cached('fixed',()=>{
    const inc=avgIncome()||1,T=new Date();
    const rows=templates().map(b=>{const hist=[],series=recurringKey(b);for(let k=6;k>=1;k--){const ym=dateISO(new Date(T.getFullYear(),T.getMonth()-k,1)).slice(0,7),t=state.transactions.find(t=>t.billId&&t.date.slice(0,7)===ym&&(t.recurringKey?String(t.recurringKey)===series:t.name.toLowerCase()===b.name.toLowerCase()));if(t)hist.push({ym,v:t.amount});}
      const n=b.name.toLowerCase(),type=/internet|celular|telefone|streaming|netflix|spotify|tv|prime|disney|max|globoplay|youtube/.test(n)?'plano':/luz|energia|água|agua|gás|gas/.test(n)?'consumo':/aluguel|condom|financiamento|presta/.test(n)?'moradia':/academia|gym|seguro|plano de saúde/.test(n)?'servico':'outro';
      const savePct={plano:.2,consumo:.1,moradia:0,servico:.15,outro:.05}[type],vals=hist.map(h=>h.v),avg=vals.length?vals.reduce((a,v)=>a+v,0)/vals.length:b.amount,prev=vals.length?vals[vals.length-1]:null,change=prev?b.amount/prev-1:0;
      const firstUp=hist.findIndex((h,i)=>i>0&&h.v>hist[i-1].v*1.03),since=firstUp>0?monthName(pd(hist[firstUp].ym+'-01')):null,sd=vals.length>1?Math.sqrt(vals.reduce((a,v)=>a+(v-avg)**2,0)/vals.length):0;
      let action;
      if(type==='plano')action=`${since?`Subiu ${pct(b.amount/hist[firstUp-1].v-1)} em ${since}: é argumento pra negociar. `:''}Ligar pedindo desconto ou trocar de plano costuma cortar 15 a 25%.`;
      else if(type==='consumo')action=`Média de ${cashR(avg)} nos últimos ${vals.length} meses, variando ${cashR(sd)}. Banho mais curto e aparelhos fora da tomada rendem uns 10%.`;
      else if(type==='moradia')action='Custo de moradia não se corta no mês. O que importa é a proporção da renda, logo abaixo.';
      else if(type==='servico')action='Plano anual ou horário alternativo costuma sair 15% mais barato.';
      else action='Vale revisar se ainda faz sentido pagar todo mês.';
      const recent=hist.length&&hist.length<4&&state.transactions[0]&&state.transactions[0].date<dateISO(new Date(T.getFullYear(),T.getMonth()-hist.length-1,1));
      return {b,hist,type,avg,change,save:b.amount*savePct,savePct,pctInc:b.amount/inc,action,recent,months:hist.length};});
    const housing=rows.filter(r=>r.type==='moradia').reduce((s,r)=>s+r.b.amount,0);
    return {rows:rows.sort((a,b)=>b.b.amount-a.b.amount),housing,housingPct:housing/inc,save:rows.reduce((s,r)=>s+r.save,0)};
  });}
  function monthLedger(){
    const H=history(),M=model(),T=new Date(),ym=dateISO(T).slice(0,7),left=daysLeftIncl()-1,out=H.filter(m=>!m.partial).map(m=>({...m,kind:'past'}));
    const cur=H.find(m=>m.partial)||{ym,date:new Date(T.getFullYear(),T.getMonth(),1),income:0,fixed:0,variable:0,saved:0,byCat:{},byPerson:{a:0,b:0}};
    const remInc=remainingMonthOcc().reduce((s,x)=>s+x.inc.amount,0),openB=state.bills.filter(b=>b.status==='open'&&b.due.slice(0,7)<=ym).reduce((s,b)=>s+b.amount,0),pv=cur.variable+M.daily*left;
    const byCatP={};Object.values(M.fc).forEach(x=>byCatP[x.c]=(cur.byCat[x.c]||0)+x.f/30.4*left);
    out.push({...cur,kind:'current',actual:{income:cur.income,fixed:cur.fixed,variable:cur.variable},income:cur.income+remInc,fixed:cur.fixed+openB,variable:pv,byCat:byCatP,result:cur.income+remInc-cur.fixed-openB-pv});
    for(let k=1;k<=2;k++){const f=new Date(T.getFullYear(),T.getMonth()+k,1),byCat={};let v=0,b2=0;Object.values(M.fc).forEach(x=>{const val=Math.max(0,x.f+x.slope*.35*k);byCat[x.c]=val;v+=val;b2+=x.band**2;});const income=monthIncome(f.getFullYear(),f.getMonth()),fixed=fixedMonthly();
      out.push({ym:dateISO(f).slice(0,7),date:f,kind:'forecast',income,fixed,variable:v,band:Math.sqrt(b2),byCat,saved:state.plan?state.plan.monthly:0,result:income-fixed-v});}
    return out;
  }
  function historyChart(L,w,sel){
    const h=w<480?230:260,pt=34,pb=38,pl=4,pr=4,n=L.length,top=Math.max(1,...L.map(m=>Math.max(m.income,m.fixed+m.variable+(m.band||0)))),max=top*1.14,slot=(w-pl-pr)/n,bw=Math.min(44,slot*.52),Y=v=>pt+(h-pt-pb)*(1-v/max),cid='h'+Math.random().toString(36).slice(2,7);
    return `<svg class="chart hist" viewBox="0 0 ${w} ${h}" role="img" aria-label="Entradas e saídas mês a mês, com previsão dos próximos dois meses"><defs><pattern id="${cid}p" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="hc-hatch-bg"/><line x1="0" y1="0" x2="0" y2="6" class="hc-hatch"/></pattern></defs>
      ${[.33,.66,1].map(f=>`<line x1="0" x2="${w}" y1="${Y(top*f).toFixed(1)}" y2="${Y(top*f).toFixed(1)}" class="hc-grid"/><text x="2" y="${(Y(top*f)-5).toFixed(1)}" class="hc-axis">${shortMoney(top*f)}</text>`).join('')}
      ${L.map((m,i)=>{const cx=pl+slot*i+slot/2,x=cx-bw/2,yF=Y(m.fixed),yV=Y(m.fixed+m.variable),fc=m.kind==='forecast',lbl=m.date.toLocaleDateString('pt-BR',{month:'short'}).replace('.','');
        return `<g class="hc-col ${m.kind} ${m.ym===sel?'sel':''}" data-action="month-pick" data-ym="${m.ym}" tabindex="0" role="button" aria-label="${monthName(m.date)}: entradas ${brl(m.income)}, saídas ${brl(m.fixed+m.variable)}"><rect x="${(pl+slot*i).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${h}" class="hc-hit"/>
          <rect x="${x.toFixed(1)}" y="${yF.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,Y(0)-yF).toFixed(1)}" rx="3" class="hc-fixed"/>
          <rect x="${x.toFixed(1)}" y="${yV.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,yF-yV-2).toFixed(1)}" rx="3" class="hc-var" ${fc?`style="fill:url(#${cid}p)"`:''}/>
          ${fc&&m.band?`<line x1="${cx}" x2="${cx}" y1="${Y(m.fixed+m.variable+m.band).toFixed(1)}" y2="${Y(Math.max(m.fixed,m.fixed+m.variable-m.band)).toFixed(1)}" class="hc-band"/>`:''}
          <line x1="${(x-6).toFixed(1)}" x2="${(x+bw+6).toFixed(1)}" y1="${Y(m.income).toFixed(1)}" y2="${Y(m.income).toFixed(1)}" class="hc-inc"/>
          <text x="${cx}" y="${(Math.min(Y(m.income),yV)-9).toFixed(1)}" text-anchor="middle" class="hc-res ${m.result<0?'neg':''}">${m.result<0?'−':'+'}${shortMoney(Math.abs(m.result)).replace('R$ ','')}</text>
          <text x="${cx}" y="${h-20}" text-anchor="middle" class="hc-tick">${lbl}</text><text x="${cx}" y="${h-6}" text-anchor="middle" class="hc-sub">${m.kind==='current'?'agora':fc?'previsão':''}</text></g>`;}).join('')}</svg>`;
  }
  function monthDetail(L,ym){
    const m=L.find(x=>x.ym===ym)||L.find(x=>x.kind==='current'),past=L.filter(x=>x.kind==='past'),avgCat=(c)=>past.length?past.reduce((s,x)=>s+(x.byCat[c]||0),0)/past.length:0;
    const cats=Object.entries(m.byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,5),kind=m.kind==='current'?'Até hoje + projeção até o fim do mês':m.kind==='forecast'?'Previsão pelo histórico e pela tendência de cada gasto':'Mês fechado';
    return `<div class="month-detail"><div class="md-head"><div><h3>${monthName(m.date)} de ${m.date.getFullYear()}</h3><p>${kind}</p></div><span class="badge ${m.result<0?'bad':'success'}">${m.result<0?'Faltou':'Sobrou'} ${cashR(Math.abs(m.result))}</span></div>
      <dl class="md-nums"><div><dt>${m.kind==='past'?'Entrou':'Entra'}</dt><dd class="num">${cashR(m.income)}</dd></div><div><dt>Contas fixas</dt><dd class="num">${cashR(m.fixed)}</dd></div><div><dt>Dia a dia</dt><dd class="num">${cashR(m.variable)}${m.band?`<small> ±${cashR(m.band)}</small>`:''}</dd></div><div><dt>Guardado</dt><dd class="num">${cashR(m.saved||0)}</dd></div></dl>
      ${cats.length?`<ul class="md-cats">${cats.map(([c,v])=>{const a=avgCat(c),d=a?v/a-1:0;return `<li><span class="md-ic">${icon(categoryIcon(c))}</span><span>${esc(c)}</span><b class="num">${cashR(v)}</b>${past.length&&m.kind!=='past'||past.length>1?`<em class="${Math.abs(d)<.06?'':d>0?'neg':'pos'}">${Math.abs(d)<.06?'na média':`${d>0?'+':'−'}${pct(Math.abs(d))} vs média`}</em>`:''}</li>`;}).join('')}</ul>`:''}</div>`;
  }
  function heatmap(){
    const H=history().filter(m=>!m.partial),B=budgets();if(H.length<2||!B.length)return '';
    return `<div class="heat-wrap"><table class="heat"><thead><tr><th scope="col">Gasto</th>${H.map(m=>`<th scope="col">${m.date.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</th>`).join('')}<th scope="col">Previsto</th><th scope="col">Tendência</th></tr></thead><tbody>${B.map(b=>{const vals=H.map(m=>m.byCat[b.c]||0),mx=Math.max(...vals,b.f,1),tr=b.avg?b.slope/b.avg:0;
      return `<tr><th scope="row">${esc(b.c)}</th>${vals.map(v=>`<td style="--a:${(v/mx).toFixed(2)}" class="${v/mx>.6?'hi':''}">${cashS(v)}</td>`).join('')}<td class="fc">${cashS(b.f)}</td><td class="tr ${Math.abs(tr)<.03?'':tr>0?'neg':'pos'}">${Math.abs(tr)<.03?'estável':`${tr>0?'+':'−'}${pct(Math.abs(tr))}/mês`}</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function miniBars(vals,fcv,budget){const w=232,h=64,mx=Math.max(...vals,fcv,budget,1),bw=w/(vals.length+1)*.6,step=w/(vals.length+1);return `<svg class="chart mini" viewBox="0 0 ${w} ${h+14}" aria-hidden="true">${vals.map((v,i)=>`<rect x="${(i*step+step*.2).toFixed(1)}" y="${(h-h*v/mx).toFixed(1)}" width="${bw.toFixed(1)}" height="${(h*v/mx).toFixed(1)}" rx="2" class="mb-past"/>`).join('')}<rect x="${(vals.length*step+step*.2).toFixed(1)}" y="${(h-h*fcv/mx).toFixed(1)}" width="${bw.toFixed(1)}" height="${(h*fcv/mx).toFixed(1)}" rx="2" class="mb-fc"/>${budget?`<line x1="0" x2="${w}" y1="${(h-h*budget/mx).toFixed(1)}" y2="${(h-h*budget/mx).toFixed(1)}" class="mb-budget"/>`:''}<text x="${w}" y="${h+12}" text-anchor="end" class="mb-lbl">previsto</text><text x="0" y="${h+12}" class="mb-lbl">${vals.length} meses</text></svg>`;}
  function catCard(b){
    const T=new Date(),from=dateISO(addDays(T,-89)),tx=state.transactions.filter(t=>!t.billId&&t.category===b.c&&t.date>=from),sum=tx.reduce((s,t)=>s+t.amount,0),age=Math.min(90,model().age),perMonth=tx.length/(Math.max(1,age)/30.4),ticket=tx.length?sum/tx.length:0;
    const names={};tx.forEach(t=>{const k=t.name.trim();names[k]=(names[k]||0)+t.amount;});const top=Object.entries(names).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const pa=tx.reduce((s,t)=>s+shareOf(t,'a'),0),pb=tx.reduce((s,t)=>s+shareOf(t,'b'),0),lead=pa>=pb?'a':'b',leadShare=pa+pb?Math.max(pa,pb)/(pa+pb):0;
    const fill=b.budget?Math.min(100,b.mtd/b.budget*100):100,paceMark=b.budget?Math.min(100,b.elapsed*100):100,label={over:'Meta estourada',tight:'Acima do ritmo',ok:'No ritmo da meta'}[b.status];
    const max=Math.max(Math.round(b.f*1.5/1000)*1000,b.budget+1000,5000);
    return `<details class="cat ${b.status}" data-cat="${esc(b.c)}" ${openCats.has(b.c)?'open':''}><summary>
      <span class="cat-ic ${categoryColor(b.c)}">${icon(categoryIcon(b.c))}</span>
      <span class="cat-main"><b>${esc(b.c)}</b><small>Previsto ${cashR(b.f)}/mês · ${pct(b.refPct)} da renda${Math.abs(b.change)>=.08?` · <span class="${b.change>0?'neg':'pos'}">${b.change>0?'+':'−'}${pct(Math.abs(b.change))} vs últimos 3 meses</span>`:''}</small></span>
      <span class="cat-right"><b class="num">${cashR(b.budget)}</b><small>meta por mês</small></span>
      <span class="cat-track" aria-hidden="true"><span class="cat-fill" style="width:${fill.toFixed(1)}%"></span><span class="cat-proj" style="left:${paceMark.toFixed(1)}%" title="Onde deveria estar hoje"></span></span>
      <span class="cat-line"><span class="badge ${b.status==='over'?'bad':b.status==='tight'?'warn':'success'}">${label}</span> ${b.remaining>=0?`Ainda cabem <b>${cashR(b.remaining)}</b> neste mês, ${cashR(b.perDay)} por dia.`:`Passou <b>${cashR(-b.remaining)}</b> da meta.`} ${b.status==='tight'?`Até hoje, o ritmo da meta era ${cashR(b.pace)}. `:''}${b.proj>b.budget*1.04?`Sem mudar nada, fecha em ${cashR(b.proj)}.`:''}</span>
      <span class="cat-save">${b.save>0?`Economia possível <b>${cashR(b.save)}/mês</b> · ${pct(b.savePct)}`:'Sem corte sugerido'}</span>
    </summary><div class="cat-body">
      <div class="cat-grid"><div class="cat-chart">${miniBars(b.hist.length?b.hist:[b.l30],b.f,b.budget)}</div>
      <dl class="cat-facts"><div><dt>Média 3 meses</dt><dd>${cashR(b.avg3)}</dd></div><div><dt>Tendência</dt><dd class="${b.slope>0?'neg':'pos'}">${Math.abs(b.slope)<500?'estável':`${b.slope>0?'+':'−'}${cashR(Math.abs(b.slope))}/mês`}</dd></div><div><dt>Frequência</dt><dd>${perMonth>=1?`${Math.round(perMonth)}x por mês`:'raro'}</dd></div><div><dt>Ticket médio</dt><dd>${cashR(ticket)}</dd></div>${isSolo()?'':`<div><dt>Quem mais gasta</dt><dd>${pa+pb?`${esc(first(user(lead).name))} · ${pct(leadShare)}`:'—'}</dd></div>`}<div><dt>Referência saudável</dt><dd class="${b.f>b.ref?'neg':''}">até ${cashR(b.ref)}</dd></div></dl></div>
      ${top.length?`<p class="cat-top">Onde mais vai: ${top.map(([n,v])=>`${esc(n)} <b>${cashR(v)}</b>`).join(' · ')} <span>(90 dias)</span></p>`:''}
      <div class="cat-goal"><label for="bud-${esc(b.c)}"><span>Meta mensal pra ${esc(b.c.toLowerCase())}</span><output class="num" id="out-${esc(b.c)}">${cashR(b.budget)}</output></label><input type="range" id="bud-${esc(b.c)}" data-budget="${esc(b.c)}" data-f="${Math.round(b.f)}" min="0" max="${max}" step="1000" value="${b.budget}"><p class="cat-goal-note" id="note-${esc(b.c)}">${b.save>0?`Guarda ${cashR(b.save)} por mês, ${cashR(b.save*12)} por ano.`:'Meta no nível do previsto: não guarda nada aqui.'}</p>${b.custom?`<button class="btn ghost" data-action="budget-reset" data-cat="${esc(b.c)}">Voltar pra sugestão do Juntô (${cashR(b.sugg)})</button>`:`<small class="muted">Sugestão do Juntô, calculada pelo histórico e pelo plano.</small>`}</div>
    </div></details>`;
  }
  function fixedCard(r){
    const b=r.b,vals=r.hist.map(h=>h.v).concat(b.amount),mx=Math.max(...vals,1);
    return `<article class="fixed-card"><span class="cat-ic ${categoryColor(b.category)}">${icon(categoryIcon(b.category))}</span><div class="fixed-main"><div class="fixed-top"><h3>${esc(b.name)}</h3><b class="num">${cashR(b.amount)}</b></div><p class="fixed-meta">${pct(r.pctInc)} da renda · ${esc(payerLabel(b.payer))} · dia ${pd(b.due).getDate()}${Math.abs(r.change)>=.03?` · <span class="${r.change>0?'neg':'pos'}">${r.change>0?'subiu':'caiu'} ${pct(Math.abs(r.change))} no último mês</span>`:''}${r.recent?` · <span class="neg">entrou há ${r.months} ${r.months===1?'mês':'meses'}: ${cashR(b.amount*12)} por ano</span>`:''}</p><p class="fixed-action">${esc(r.action)}</p></div><div class="fixed-side"><span class="spark" aria-hidden="true">${vals.map(v=>`<i style="height:${Math.max(8,v/mx*100).toFixed(0)}%"></i>`).join('')}</span><small>${r.save>0?`até <b>${cashR(r.save)}</b>/mês`:'—'}</small></div></article>`;
  }
  function analysisView(){
    const solo=isSolo(),perspective=solo?'a':analysisPerson,ym=dateISO().slice(0,7);
    const perspectiveLabel=perspective==='both'?'Nós':perspective===active?'Você':first(user(perspective).name);
    const tx=state.transactions.filter(t=>t.date.slice(0,7)===ym).map(t=>({...t,viewAmount:perspective==='both'?t.amount:shareOf(t,perspective)})).filter(t=>t.viewAmount>0);
    const total=tx.reduce((sum,t)=>sum+t.viewAmount,0),groups={};tx.forEach(t=>groups[t.category]=(groups[t.category]||0)+t.viewAmount);
    const cats=Object.entries(groups).sort((a,b)=>b[1]-a[1]),topCats=cats.slice(0,3),otherTotal=cats.slice(3).reduce((sum,x)=>sum+x[1],0);
    const colors=['#d8b15f','#efc9d5','#b9d8f1','#dfe3e8'];let cursor=0;
    const stops=topCats.map(([c,v],i)=>{const from=cursor,to=cursor+(total?v/total*100:0);cursor=to;return `${colors[i]} ${from.toFixed(2)}% ${to.toFixed(2)}%`;});
    if(otherTotal&&total){stops.push(`${colors[3]} ${cursor.toFixed(2)}% 100%`);}
    const donut=stops.length?stops.join(','):'#eef0f3 0 100%';
    const top=topCats[0],topPct=top&&total?Math.round(top[1]/total*100):0,cutSave=top?Math.max(100,Math.round(top[1]*.2/100)*100):0;
    const latest=tx.slice().sort((a,b)=>(b.createdAt||pd(b.date).getTime())-(a.createdAt||pd(a.date).getTime()))[0];
    const phrase=top?({Delivery:'O delivery tá recebendo muito carinho.',Compras:'As comprinhas estão ganhando bastante espaço.',Transporte:'O transporte tá puxando uma boa parte do mês.',Lanches:'Os lanchinhos estão aparecendo bastante.',Restaurantes:'Os dates e restaurantes estão marcando presença.',Hábitos:'Os hábitos pequenos estão pesando mais do que parecem.'}[top[0]]||`${top[0]} está puxando uma parte importante do mês.`):'Ainda estamos conhecendo seu ritmo.';
    const people=solo?`<button class="active" data-action="analysis-person" data-person="a">Você</button>`:`<button class="${perspective==='both'?'active':''}" data-action="analysis-person" data-person="both">Nós</button><button class="${perspective==='a'?'active':''}" data-action="analysis-person" data-person="a">${active==='a'?'Você':esc(first(user('a').name))}</button><button class="${perspective==='b'?'active':''}" data-action="analysis-person" data-person="b">${active==='b'?'Você':'Meu amor'}</button>`;
    const head=`<div class="analysis-v3-head"><span>${solo?'MEU RAIO-X':'NOSSO RAIO-X'}</span><h2>Pra onde foi?</h2><p>Sem julgamento. Só clareza.</p></div><nav class="analysis-v3-people" aria-label="Perspectiva">${people}</nav><nav class="analysis-v3-tabs"><button class="${analysisTab==='overview'?'active':''}" data-action="topic-tab" data-kind="analysis" data-value="overview">Visão geral</button><button class="${analysisTab==='history'?'active':''}" data-action="topic-tab" data-kind="analysis" data-value="history">Histórico</button><button class="${analysisTab==='spend'?'active':''}" data-action="topic-tab" data-kind="analysis" data-value="spend">Limites</button><button class="${analysisTab==='fixed'?'active':''}" data-action="topic-tab" data-kind="analysis" data-value="fixed">Fixas</button></nav>`;
    if(!state.transactions.length&&analysisTab==='overview')return head+`<div class="future-v3-empty">${icon('scan')}<h3>Ainda não tem gastos do dia a dia.</h3><p>Você já pode conferir contas fixas e histórico; registre gastos para liberar a leitura de categorias e hábitos.</p><button class="btn primary" data-action="expense">Registrar um gasto</button></div>`;
    if(analysisTab==='overview'){
      return head+`<div class="analysis-v3-surface"><section class="analysis-v3-card"><div class="analysis-v3-donut-wrap"><div class="analysis-v3-donut" style="background:conic-gradient(${donut})"><div><b class="num">${cashR(total)}</b><span>no mês</span></div></div><div class="analysis-v3-legend">${topCats.map(([c,v],i)=>`<div><span class="analysis-v3-dot" style="background:${colors[i]}"></span><span><b>${esc(c)}</b><small>${total?Math.round(v/total*100):0}%</small></span><strong class="num">${cashR(v)}</strong></div>`).join('')}${otherTotal?`<div><span class="analysis-v3-dot" style="background:${colors[3]}"></span><span><b>Outros</b><small>${Math.round(otherTotal/total*100)}%</small></span><strong class="num">${cashR(otherTotal)}</strong></div>`:''}</div></div><button class="analysis-v3-all" data-action="topic-tab" data-kind="analysis" data-value="history">Ver todos os gastos <span>›</span></button></section>${top?`<section class="analysis-v3-insight"><span>${icon('sparkle')}</span><div><h3>${esc(phrase)}</h3><p>${esc(perspectiveLabel)} colocou ${topPct}% dos gastos em ${esc(top[0].toLowerCase())}. Um corte de 20% libera cerca de ${cashR(cutSave)}.</p><button data-action="analysis-cut">Simular um corte ›</button></div></section>`:''}<section class="analysis-v3-latest"><div class="home-section-title"><h2>Aconteceu por aqui</h2><button class="text-link" data-action="topic-tab" data-kind="analysis" data-value="history">Ver histórico ›</button></div>${latest?`<button class="analysis-v3-latest-row" data-action="tx-detail" data-id="${latest.id}" aria-label="Ver detalhes de ${esc(latest.name)}"><span class="category-icon ${categoryColor(latest.category)}">${icon(itemOf(latest).icon)}</span><span><b>${perspective==='both'?(latest.by===active?'Você':esc(first(user(latest.by||latest.payer).name))):esc(perspectiveLabel)} · ${esc(latest.name)}</b><small>${dateText(latest.date)} · ${esc(latest.category)}</small></span><strong class="num">− ${cashR(latest.viewAmount)}</strong></button>`:`<div class="home-empty-row">${icon('wallet')}<span><b>Nenhum gasto neste mês.</b><small>O próximo lançamento aparece aqui.</small></span></div>`}</section><button class="analysis-v3-add" data-action="expense">${icon('plus')}Registrar gasto</button></div>`;
    }
    const M=model(),B=budgets(),F=fixedReading(),inc=avgIncome(),fixed=fixedMonthly(),varF=M.monthlyVar,life=fixed+varF,saveVar=B.reduce((sum,b)=>sum+b.save,0),base=inc-life,potential=Math.max(0,Math.floor((base+saveVar-CUSHION)/5000)*5000),L=monthLedger(),sel=pickedMonth&&L.find(m=>m.ym===pickedMonth)?pickedMonth:L.find(m=>m.kind==='current').ym;
    if(analysisTab==='history')return head+`<div class="analysis-v3-surface"><section class="block"><div class="block-head"><h2>Mês a mês</h2><p>Veja quando os gastos mudaram e o que mais puxou cada período.</p></div><div class="panel hist-panel"><div class="chart-wrap light">${historyChart(L,chartWidth(46),sel)}</div><div class="legend"><span class="lg fx">Contas fixas</span><span class="lg vr">Dia a dia</span><span class="lg ic">Entradas</span><span class="lg ft">Previsão</span></div>${monthDetail(L,sel)}</div></section>${heatmap()?`<section class="block"><div class="block-head"><h2>Cada gasto, mês a mês</h2><p>Quanto mais escuro, mais pesou naquele mês.</p></div>${heatmap()}</section>`:''}</div>`;
    if(analysisTab==='spend')return head+`<div class="analysis-v3-surface"><section class="block"><div class="block-head"><h2>Quanto cada gasto pode levar</h2><p>O Juntô compara meta, ritmo real e quanto ainda cabe até o fim do mês.</p></div><div class="cat-list">${B.map(catCard).join('')}</div></section></div>`;
    return head+`<div class="analysis-v3-surface"><section class="block"><div class="block-head"><h2>Contas fixas, uma por uma</h2><p>${F.housing?`Moradia leva ${pct(F.housingPct)} da renda. ${F.housingPct>.3?'Está acima da referência de 30%.':'Está dentro da referência de até 30%.'}`:'Veja o peso de cada conta e onde ainda dá pra negociar.'}</p></div><div class="fixed-list">${F.rows.map(fixedCard).join('')||`<div class="empty">${icon('wallet')}<p>Nenhuma conta fixa cadastrada.</p></div>`}</div></section></div>`;
  }
  function radar(){
    const out=[],today=dateISO(),lim=dateISO(addDays(new Date(),4)),mN=monthName(new Date());
    budgets().filter(b=>b.status!=='ok').sort((a,b)=>(b.mtd-b.pace)-(a.mtd-a.pace)).slice(0,2).forEach(b=>out.push({kind:b.status==='over'?'bad':'warn',icon:categoryIcon(b.c),title:b.status==='over'?`${b.c} já passou da meta de ${mN}.`:`${b.c} está acima do ritmo da meta.`,body:b.status==='over'?`Foram ${brl(b.mtd)} de ${brl(b.budget)}. Daqui pra frente, cada real aqui sai do que iria pro cofre.`:`Já foram ${brl(b.mtd)}; o ritmo da meta até hoje era ${brl(b.pace)}. Pra fechar em ${brl(b.budget)}: até ${brl(b.perDay)} por dia.`,route:'analysis'}));
    state.bills.filter(b=>b.status==='open'&&b.due<=lim).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,2).forEach(b=>{const short=splitShares(b.amount,b.payer).find(s=>s.amount>user(s.id).balance);out.push({kind:short?'bad':'warn',icon:'calendar',title:`${b.name} ${b.due<today?'venceu':b.due===today?'vence hoje':`vence ${wdShort(b.due)}, ${dayMonth(b.due)}`}.`,body:short?`O saldo de ${first(user(short.id).name)} não cobre os ${brl(short.amount)} da parte. Confirmem uma entrada ou mudem a divisão.`:`${brl(b.amount)}, ${payerLabel(b.payer).toLowerCase()}. O saldo cobre.`,route:'bills'});});
    (state.commitments||[]).filter(c=>c.active).forEach(c=>{const s=commitStatus(c);if(!s.ok)out.unshift({kind:'warn',icon:(recognize(c.item)||{icon:'cut'}).icon,title:`${c.person==='both'?'A dupla':first(user(c.person).name)} passou do combinado com ${c.item.toLowerCase()}.`,body:`Desde ${dayMonth(c.since)}, foram ${brl(s.spent)}${c.level==='half'?` (o combinado era até ${brl(s.target)})`:' (o combinado era cortar)'}. Mesmo assim, ${brl(s.saved)} ficaram no bolso.`,route:'future',anchor:'cortes'});});
    if(out.length<3&&!(state.commitments||[]).some(c=>c.active)){const st=itemStats(active).filter(o=>o.sug!=='keep').slice(0,2);if(st.length){const v=st.reduce((s,o)=>s+o.monthly*CUT_FACTOR[o.sug],0);out.push({kind:'info',icon:'cut',title:`Cortando ${st.map(o=>o.item.toLowerCase()).join(' e ')}, ${first(user(active).name)} guarda ${brl(v)} por mês.`,body:`Em um ano, ${brl(fvMonthly(v,12,Number(state.settings.yieldRate??10)))} com rendimento. Toque pra simular.`,route:'future',anchor:'cortes'});}}
    return out.slice(0,3);
  }
  function processAuto(){
    let n=0,saved=0;pendingArrivals(3).forEach(({inc,date})=>{if(!inc.auto||(cloudSlot&&inc.person!==cloudSlot))return;const p=state.plan,g=p&&p.auto!==false?state.goals.find(x=>x.id===p.goalId):null,share=g?planShare(inc,date):0;
      user(inc.person).balance+=inc.amount;state.received.push({id:`received:${inc.id}:${date}`,incomeId:inc.id,person:inc.person,date,amount:inc.amount,status:'received',at:Date.now(),auto:true,balanceDelta:inc.amount});n++;
      if(share>0){g.saved+=share;saved+=share;state.saves.push({id:`save:${inc.id}:${date}:${g.id}`,goalId:g.id,amount:share,date,actor:inc.person,source:'auto',incomeId:inc.id});}
      log(inc.person,`teve ${inc.name.toLowerCase()} confirmado sozinho (${money(inc.amount)})${share>0?` e o Juntô já guardou ${money(share)} em ${g.name}`:''}.`);});
    return {n,saved};
  }
  const KEYWORDS=[
    [/mercado livre|shopee|amazon|shein|aliexpress|magalu|roupa|loja|presente|t[eê]nis|sapato|perfume/,'Compras'],
    [/restaurante|almo[cç]o|jantar|rod[ií]zio|churrasc|self.?service|bistr[oô]/,'Restaurantes'],
    [/ifood|rappi|delivery|pizza|burger|hamb[uú]rguer|sushi|z[eé] delivery|marmita/,'Delivery'],
    [/mercado|atacad|assa[ií]|hortifruti|padaria|a[cç]ougue|feira|carrefour|sacol/,'Alimentação'],
    [/uber|\b99\b|gasolina|posto|combust|[oô]nibus|metr[oô]|estacion|ped[aá]gio|oficina/,'Transporte'],
    [/caf[eé]|lanche|pastel|sorvete|a[cç]a[ií]|salgado|p[aã]o de queijo|coxinha/,'Lanches'],
    [/\bbar\b|barzinho|cinema|show|happy|balada|passeio|ingresso/,'Lazer'],
    [/hotel|pousada|airbnb|passagem a[eé]rea|viagem|praia/,'Viagem'],
    [/farm[aá]cia|rem[eé]dio|m[eé]dico|consulta|exame|academia|dentista|psic/,'Saúde'],
    [/netflix|spotify|internet|celular|streaming|prime|disney|youtube|icloud|assinatura|globoplay/,'Assinaturas'],
    [/aluguel|condom[ií]nio|\bluz\b|[aá]gua|\bg[aá]s\b|energia|faxina/,'Casa'],
    [/curso|livro|faculdade|escola|apostila|material escolar/,'Educação'],
    [/pet|ra[cç][aã]o|veterin|petshop/,'Pets'],
    [/maquiagem|skincare|sal[aã]o|barbeir|manicure|sobrancelha|cosm[eé]tico/,'Beleza'],
    [/notebook|computador|mouse|teclado|monitor|iphone|smartphone|tablet|carregador|fone bluetooth/,'Tecnologia'],
    [/coworking|material de trabalho|uniforme|ferramenta de trabalho|software de trabalho|despesa profissional/,'Trabalho'],
    [/imposto|iptu|ipva|darf|detran|multa|taxa banc[aá]ria|tarifa banc[aá]ria|tributo/,'Impostos']
  ];
  function guessCategory(name){
    const n=String(name||'').trim().toLowerCase();if(n.length<3)return null;const w=n.split(/\s+/)[0],counts={};
    state.transactions.forEach(t=>{const tn=t.name.toLowerCase();if(tn===n||(w.length>3&&tn.split(/\s+/)[0]===w))counts[t.category]=(counts[t.category]||0)+(tn===n?3:1);});
    const best=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];if(best)return best[0];const k=KEYWORDS.find(([re])=>re.test(n));return k?k[1]:null;
  }
  function categoryImpact(cat,amount){
    const b=budgets().find(x=>x.c===cat),mN=monthName(new Date());if(!b)return null;const after=b.remaining-(Number.isFinite(amount)&&amount>0?amount:0);
    if(!(amount>0))return {cls:'',html:`<strong>${esc(cat)} em ${mN}: ${money(b.mtd)} de ${money(b.budget)}.</strong>Ainda cabem ${money(Math.max(0,b.remaining))}, cerca de ${money(b.perDay)} por dia.`};
    return after>=0?{cls:after<b.budget*.12?'warn':'',html:`<strong>${after<b.budget*.12?'Cabe, mas a meta fica no limite.':`Cabe na meta de ${esc(cat.toLowerCase())}.`}</strong>Depois desse, sobram ${money(after)} até o fim de ${mN}: ${money(after/b.left)} por dia.`}:{cls:'bad',html:`<strong>Passa ${money(-after)} da meta de ${esc(cat.toLowerCase())}.</strong>Já foram ${money(b.mtd)} de ${money(b.budget)} em ${mN}. Se for mesmo, vale tirar de outro gasto.`};
  }
  function updateBudgetNote(){
    const el=$('#budget-note'),form=document.querySelector('[data-form="expense"]');if(!el||!form)return;const kind=form.querySelector('input[name="expense-type"]:checked')?.value;
    if(kind!=='spent'){el.hidden=true;return;}const r=categoryImpact($('#expense-category').value,parseMoney($('#expense-amount').value||'')),tt=$('#expense-title')?.value||'',rec=tt?recognizeP(parseQuick(tt)):null,payer=$('#expense-payer')?.value,chc=rec?challengeConflict(rec.item,payer):null,cm=rec&&(state.commitments||[]).find(c=>c.active&&c.item===rec.item&&(c.person==='both'||c.person===payer||payer==='half'||payer==='prop'));
    if(!r&&!cm&&!chc){el.hidden=true;return;}el.hidden=false;el.className='form-note '+(cm||chc?'warn':r.cls);el.innerHTML=(chc?chc.html+(cm||r?'<br><br>':''):'')+(cm?`<strong>Tem um compromisso aqui.</strong>${cm.person==='both'?'A dupla':esc(first(user(cm.person).name))} combinou ${cm.level==='cut'?'cortar':'reduzir pela metade'} ${esc(cm.item.toLowerCase())} em ${dayMonth(cm.since)}. Até agora, ${money(commitStatus(cm).saved)} economizados. Registrar mesmo assim mantém a conta honesta.${r?'<br><br>':''}`:'')+(r?r.html:'');
  }
  function autoCategory(inputId,selectId,hintId){
    const sel=$('#'+selectId),hint=$('#'+hintId);if(!sel||sel.dataset.touched==='1')return;const g=guessCategory($('#'+inputId)?.value);
    if(g&&categories.includes(g)){sel.value=g;if(hint)hint.textContent='sugerida pelo Juntô';}else if(hint)hint.textContent='';
  }
  // ===== Itens: o Juntô entende o que foi comprado =====
  Object.assign(paths,{
    cigarette:'<path d="M2 14h14v4H2zM16 14h3v4h-3zM21.5 14v4M17 10.5c0-1.6 2-1.8 2-3.5S17 5 17 3.5M20.5 10.5c0-1.2 1.2-1.6 1.2-2.8"/>',
    beer:'<path d="M6 8h10v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM16 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 8a2.5 2.5 0 0 1 2-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 3 4M9.5 12v5M12.5 12v5"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01"/>',
    can:'<path d="M7.5 5h9l-1 2v12l1 2h-9l1-2V7zM9.5 3h5M10 11h4"/>',
    pizza:'<path d="M12 21 3.2 6.3a15 15 0 0 1 17.6 0zM5.4 9.6a12 12 0 0 1 13.2 0M10 12h.01M14 15h.01M12.5 10.5h.01"/>',
    burger:'<path d="M4 11h16a8 8 0 0 0-16 0zM3 14h18M4.5 17h15v1a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2zM9 7.5h.01M13 6.5h.01M15.5 8.5h.01"/>',
    bowl:'<path d="M3 11h18a9 9 0 0 1-18 0zM8 21h8M13 3l-3 8M19 4l-6 7"/>',
    cup:'<path d="M5 8h14l-2 13H7zM4 8h16M12 8V5.5c0-1.4 1-2.5 2.5-2.5"/>',
    icecream:'<path d="m8 11 4 10 4-10M7 11a5 5 0 1 1 10 0z"/>',
    pastry:'<path d="M4 15c-1-4 2-8 8-8s9 4 8 8c-1 3-4 4-8 4s-7-1-8-4zM9 8l1 10M15 8l-1 10"/>',
    candy:'<circle cx="12" cy="12" r="4"/><path d="m15 9 4-4 1 3 2 1-4 4M9 15l-4 4-1-3-2-1 4-4"/>',
    bread:'<path d="M5 10a3 3 0 0 1 0-6h14a3 3 0 0 1 0 6v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM9 13h.01M12 15h.01M15 12h.01"/>',
    apple:'<path d="M12 7.5c-2-1.5-7-1-7 5 0 4 3 8.5 5 8.5 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4.5 5-8.5 0-6-5-6.5-7-5zM12 7.5C12 5.5 13 3.5 15 3"/>',
    dish:'<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4M4 20h16"/>',
    ride:'<path d="m5 11 2-5h10l2 5M3 11h18v6h-2v2h-3v-2H8v2H5v-2H3zM7 14h.01M17 14h.01"/>',
    bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3M8 14.5h.01M16 14.5h.01M9 6.5h6"/>',
    fuel:'<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
    pill:'<path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 7l7 7"/>',
    dumbbell:'<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    ticket:'<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM15 7v10"/>',
    map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
    game:'<path d="M6 9h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5.5 1.6L15 15H9l-1.5 1.6A3 3 0 0 1 2 15v-2a4 4 0 0 1 4-4zM7 11.5v3M5.5 13h3M16 13h.01M18 11.5h.01"/>',
    play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    building:'<path d="M5 21V4h10v17M15 9h4v12M3 21h18M8 8h4M8 12h4M8 16h4"/>',
    drop:'<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/>',
    flame:'<path d="M12 21c4 0 7-3 7-7 0-5-5-7-5-11-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 8 0 4 3 7 7 7z"/>',
    shirt:'<path d="m8 3-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
    scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8.5 20 20M8.5 15.5 20 4"/>',
    paw:'<circle cx="5" cy="10" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M12 11c-3 0-6 4-6 7a2 2 0 0 0 3 1.5c1-.5 2-.5 3-.5s2 0 3 .5A2 2 0 0 0 18 18c0-3-3-7-6-7z"/>',
    book:'<path d="M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v15h-6a2 2 0 0 0-2 2 2 2 0 0 0-2-2H4zM12 5v16"/>',
    flag:'<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    reply:'<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v3"/>',
    cut:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8.5 20 20M8.5 15.5 20 4"/>'
  });
  const norm=(s)=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const cap=(s)=>{s=String(s||'').trim();return s?s[0].toUpperCase()+s.slice(1):s;};
  const ITEMS=[
    [/cigarr|\bmaco\b|tabaco|palheiro|\bvape\b|\bpod\b|narguil|isqueiro|\bfumo\b/,'Cigarro','Hábitos','cigarette'],
    [/aposta|\bbets?\b|cassino|loteria|mega.?sena|tigrinho|raspadinha|jogo do bicho/,'Apostas','Hábitos','dice'],
    [/energetico|red ?bull|\bmonster\b/,'Energético','Hábitos','can'],
    [/cerveja|latinha|\bchop+e?\b|cachaca|vodka|whisky|vinho|\bdrinks?\b|bebida/,'Bebida','Hábitos','beer'],
    [/pizza/,'Pizza','Delivery','pizza'],
    [/hamburg|burger|mc ?donald|\bbk\b|mequi/,'Hambúrguer','Delivery','burger'],
    [/sushi|japones|temaki|yakisoba/,'Comida japonesa','Delivery','bowl'],
    [/ifood|i food|rappi|delivery|ze delivery|marmita|aiqfome|99 ?food/,'Delivery','Delivery','moto'],
    [/acai/,'Açaí','Lanches','cup'],
    [/sorvete|picole|milk ?shake/,'Sorvete','Lanches','icecream'],
    [/cafe|cappuccino|expresso|starbucks/,'Café','Lanches','coffee'],
    [/pao de queijo|salgado|coxinha|pastel|lanche|esfiha|empada|sanduiche|cachorro.?quente/,'Lanche','Lanches','pastry'],
    [/refrigerante|\bcoca\b|guarana|\bsuco\b|agua de coco/,'Refrigerante','Lanches','can'],
    [/\bdoces?\b|chocolate|\bbalas?\b|bombom|brigadeiro|biscoito|salgadinho/,'Doces','Lanches','candy'],
    [/shopee|amazon|mercado livre|magalu|aliexpress|loja online|comprinha/,'Compra online','Compras','bag'],
    [/padaria|\bpao\b|\bpaes\b/,'Padaria','Alimentação','bread'],
    [/hortifruti|\bfeira\b|fruta|verdura|legume|sacolao/,'Hortifruti','Alimentação','apple'],
    [/mercado|supermercado|atacad|assai|carrefour|compras do mes|acougue/,'Mercado','Alimentação','cart'],
    [/restaurante|almoco|\bjanta\b|jantar|rodizio|churrasc|self.?service|bistro/,'Restaurante','Restaurantes','dish'],
    [/\buber\b|^99$|\b99 ?pop\b|corrida|\btaxi\b|indriver|cabify/,'Corrida de app','Transporte','ride'],
    [/passagem|onibus|\bmetro\b|\bbrt\b|bilhete unico|vale.?transporte|\btrem\b|circular/,'Passagem','Transporte','bus'],
    [/gasolina|\bposto\b|combust|etanol|alcool|diesel|abastec/,'Combustível','Transporte','fuel'],
    [/estacion|pedagio|lava.?jato|oficina|mecanic|pneu|oleo do carro|seguro do carro/,'Carro','Transporte','car'],
    [/farmacia|remedio|drogaria|vitamina|drogasil/,'Farmácia','Saúde','pill'],
    [/medic|consulta|exame|dentista|psic|terapia|hospital|clinica/,'Consulta','Saúde','pulse'],
    [/academia|\bgym\b|crossfit|suplemento|whey|creatina|smart ?fit/,'Academia','Saúde','dumbbell'],
    [/cinema|filme|ingresso|\bshow\b|teatro|festa|balada|pipoca/,'Cinema e eventos','Lazer','ticket'],
    [/\bbar\b|barzinho|happy ?hour|boteco|\bpub\b/,'Barzinho','Lazer','beer'],
    [/passeio|viagem|hotel|pousada|airbnb|\bparque\b|praia/,'Viagem','Viagem','plane'],
    [/\bjogos?\b|\bgames?\b|steam|playstation|xbox|\bpsn\b|\bskin\b/,'Games','Lazer','game'],
    [/netflix|spotify|streaming|prime video|disney|youtube|globoplay|\bhbo\b|\bmax\b|deezer/,'Streaming','Assinaturas','play'],
    [/internet|wi.?fi|fibra/,'Internet','Assinaturas','wifi'],
    [/celular|recarga|\bchip\b|telefone/,'Celular','Assinaturas','phone'],
        [/notebook|computador|mouse|teclado|monitor|iphone|smartphone|tablet|carregador|fone bluetooth/,'Tecnologia','Tecnologia','phone'],
        [/coworking|material de trabalho|uniforme|ferramenta de trabalho|software de trabalho|despesa profissional/,'Trabalho','Trabalho','scan'],
        [/imposto|iptu|ipva|darf|detran|multa|taxa bancaria|tarifa bancaria|tributo/,'Impostos e taxas','Impostos','wallet'],
        [/icloud|google one|assinatura|mensalidade/,'Assinatura','Assinaturas','repeat'],
    [/aluguel/,'Aluguel','Casa','house'],[/condominio/,'Condomínio','Casa','building'],[/\bluz\b|energia|neoenergia|\benel\b|cemig/,'Luz','Casa','bolt'],[/\bagua\b|caesb|sabesp/,'Água','Casa','drop'],[/\bgas\b|botij/,'Gás','Casa','flame'],
    [/faxina|diarista|limpeza|detergente|sabao/,'Limpeza','Casa','sparkle'],
    [/coisas de casa|utensilio|\bmove(l|is)\b|decoracao|panela/,'Coisas de casa','Casa','house'],
    [/roupa|camisa|camiseta|\bcalca\b|vestido|tenis|sapato|shein|renner|riachuelo/,'Roupa','Compras','shirt'],
    [/presente|aniversario/,'Presente','Presentes','gift'],
    [/perfume|maquiagem|cosmetic|skincare|\bcreme\b|boticario|natura/,'Beleza','Beleza','sparkle'],
    [/cabelo|salao|barbeir|\bunhas?\b|manicure|sobrancelha/,'Cabelo e beleza','Beleza','sparkle'],
    [/\bpet\b|racao|veterin|petshop/,'Pet','Pets','heart'],
    [/curso|livro|faculdade|escola|apostila|material escolar/,'Estudo','Educação','scan']
  ];
  const CAT_GROUP={Restaurantes:'Alimentação',Delivery:'Alimentação',Lanches:'Alimentação'};
  const catPath=(c)=>CAT_GROUP[c]?`${CAT_GROUP[c]} › ${c.toLowerCase()}`:c;
  const firstWord=(n)=>n.split(/\s+/).filter(x=>x&&!/^\d/.test(x))[0]||n;
  function recognize(text){
    const n=norm(text).trim();if(n.length<2)return null;const L=state.learned||{},w=firstWord(n);
    if(L[n])return {...L[n],learned:true};if(w.length>3&&L['w:'+w])return {...L['w:'+w],learned:true};
    for(const [re,item,category,ic] of ITEMS)if(re.test(n))return {item,category,icon:ic};
    const fz=fuzzyItem(n);if(fz)return fz;
    if(w.length>3){const t=state.transactions.find(t=>firstWord(norm(t.name))===w);if(t)return {item:cap(t.item||t.name),category:t.category,icon:t.icon||categoryIcon(t.category),guess:true};}
    return null;
  }
  function itemOf(t){const m=cached('itemMap',()=>new Map());if(m.has(t.id))return m.get(t.id);const r=t.item?{item:t.item,icon:t.icon||categoryIcon(t.category)}:(()=>{const x=recognizeP(parseQuick(t.name))||recognize(t.name);return x?{item:x.item,icon:x.icon}:{item:cap(t.name.split(/\s+/).slice(0,2).join(' ')),icon:categoryIcon(t.category)};})();m.set(t.id,r);return r;}
  // ---- entendimento do texto: valor, quantidade, quem pagou, quando, e o item mesmo com erro de digitação ----
  const NUMW={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,quinze:15,vinte:20,trinta:30,quarenta:40,cinquenta:50,cem:100};
  const CUR=/^(reais|real|conto|contos|pila|pilas|mango|mangos|pratas?|rs|r\$|r)$/;
  const VERBS=/^(gastei|gastamos|gasto|comprei|compramos|paguei|pagamos|pagou|registra|registrar|anota|anotar|lanca|lancar|coloca|bota)$/;
  const STOP=new Set('com de do da dos das no na nos nas em um uma o a os as pra para pro pelo pela por e foi deu hoje ontem anteontem cada total unidade unidades un eu meu minha mais ai la so tipo meio metade'.split(' '));
  const FUZZY_STOP=new Set('quanto quantos gastei gastamos gastou gasto gastos mais menos hoje ontem semana posso podemos comprar conta contas saldo sobra sobrar fecha fechar quem onde como parar cortar largar metade guardar guardo economizo economizar dinheiro reais real total valor pagar paguei comprei esse essa isso esta estou ficar todo toda dia dias meses mes'.split(' '));
  const squash=(w)=>w.replace(/(.)\1+/g,'$1');
  function dist(a,b){if(Math.abs(a.length-b.length)>2)return 9;const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];}for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}return d[a.length][b.length];}
  const VOCAB=(()=>{const v=[];ITEMS.forEach((e,idx)=>e[0].source.split('|').forEach(part=>{const w=part.replace(/\\b|\\s|\.\?|\.\*|[()^$?+]/g,'').replace(/[^a-z]/g,'');if(w.length>=4)v.push([squash(w),idx,w.length]);}));return v;})();
  function fuzzyItem(text){
    let best=null;norm(text).split(/[^a-z0-9]+/).forEach(tok=>{if(tok.length<4||FUZZY_STOP.has(tok)||/\d/.test(tok))return;const t=squash(tok);VOCAB.forEach(([w,idx])=>{if(w.length<4)return;const lim=w.length>=7?2:1;let dd=dist(t,w);if(t.length>w.length&&w.length>=5)dd=Math.min(dd,dist(t.slice(0,w.length),w));if(dd<=lim&&(!best||dd<best.d||(dd===best.d&&idx<best.idx)))best={d:dd,idx};});});
    if(!best)return null;const e=ITEMS[best.idx];return {item:e[1],category:e[2],icon:e[3],fuzzy:true};
  }
  let parsing=false;
  const MONTH_PT={janeiro:0,fevereiro:1,marco:2,abril:3,maio:4,junho:5,julho:6,agosto:7,setembro:8,outubro:9,novembro:10,dezembro:11};
  function naturalDate(raw){
    const t=norm(raw),today=new Date(),todayISO=dateISO(today);
    if(/\banteontem\b/.test(t))return {date:dateISO(addDays(today,-2)),kind:'spent'};
    if(/\bontem\b/.test(t))return {date:dateISO(addDays(today,-1)),kind:'spent'};
    if(/\bamanha\b/.test(t))return {date:dateISO(addDays(today,1)),kind:/todo mes|mensal|fix[ao]|recorrent/.test(t)?'fixed':'bill'};
    if(/\bhoje\b/.test(t)&&/vence|vencimento|pagar|boleto/.test(t))return {date:todayISO,kind:/todo mes|mensal|fix[ao]|recorrent/.test(t)?'fixed':'bill'};
    const recurring=/\b(todo mes|todo mês|mensal|mensalmente|fixa|fixo|recorrente)\b/.test(t);
    const dueHint=/\b(vence|vencimento|vencera|vencer|boleto|a pagar|vou pagar|pra pagar|para pagar)\b/.test(t);
    const spentHint=/\b(gastei|gastamos|comprei|compramos|paguei|pagamos|ja paguei|já paguei)\b/.test(t);
    let date=null;
    let m=t.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
    if(m){
      let y=m[3]?Number(m[3]):today.getFullYear();if(y<100)y+=2000;
      const d=Number(m[1]),mo=Number(m[2])-1,dt=new Date(y,mo,d);
      if(dt.getFullYear()===y&&dt.getMonth()===mo&&dt.getDate()===d){
        if(!m[3]&&(dueHint||recurring)&&dateISO(dt)<todayISO)dt.setFullYear(dt.getFullYear()+1);
        date=dateISO(dt);
      }
    }
    if(!date){
      const monthNames=Object.keys(MONTH_PT).join('|');
      m=t.match(new RegExp('\\b(?:dia\\s+)?(\\d{1,2})\\s+(?:de\\s+)?('+monthNames+')(?:\\s+(?:de\\s+)?(\\d{4}))?\\b'));
      if(m){
        let y=m[3]?Number(m[3]):today.getFullYear(),mo=MONTH_PT[m[2]],d=Number(m[1]),dt=new Date(y,mo,d);
        if(!m[3]&&(dueHint||recurring)&&dateISO(dt)<todayISO)dt.setFullYear(dt.getFullYear()+1);
        if(dt.getMonth()===mo&&dt.getDate()===d)date=dateISO(dt);
      }
    }
    if(!date){
      m=t.match(/\b(?:vence(?:\s+no)?|vencimento(?:\s+no)?|vencer(?:\s+no)?|dia)\s+(?:dia\s+)?(\d{1,2})\b/)||t.match(/\bpagar\s+(?:no\s+)?dia\s+(\d{1,2})\b/);
      if(m){
        const d=Number(m[1]);if(d>=1&&d<=31){let y=today.getFullYear(),mo=today.getMonth(),last=daysInMonth(y,mo),dt=new Date(y,mo,Math.min(d,last));if(dateISO(dt)<todayISO&&(dueHint||recurring)){mo++;dt=new Date(y,mo,Math.min(d,daysInMonth(y,mo)));}date=dateISO(dt);}
      }
    }
    return {date,kind:recurring?'fixed':dueHint?'bill':spentHint?'spent':null,recurring,dueHint};
  }
  function parseQuick(text){
    const raw=String(text||'').trim(),meta=naturalDate(raw);let toks=norm(raw).replace(/r\$\s*/g,' r$ ').replace(/(\d)(reais|real|conto|contos|pila|pilas|r\$)\b/g,'$1 $2').split(/\s+/).filter(Boolean).map(t=>NUMW[t]!=null?String(NUMW[t]):t);
    const isNum=(t)=>/^\d+(?:[.,]\d{1,2})?$/.test(t),dateNums=new Set();
    const markDateNum=(i)=>{const v=Number(toks[i]);if(isNum(toks[i]||'')&&v>=1&&v<=31)dateNums.add(i);};
    toks.forEach((tok,i)=>{
      if((tok==='dia'||tok==='vence'||tok==='vencimento'||tok==='vencer')&&isNum(toks[i+1]||''))markDateNum(i+1);
      if((tok==='vence'||tok==='vencimento'||tok==='vencer'||tok==='pagar')&&toks[i+1]==='dia'&&isNum(toks[i+2]||''))markDateNum(i+2);
    });
    const rawNumIdx=toks.map((t,i)=>isNum(t)&&!dateNums.has(i)?i:-1).filter(i=>i>=0);
    if(rawNumIdx.length>1)toks=toks.map((t,i)=>t==='99'&&!dateNums.has(i)?'noventaenove':t);
    const nums=toks.map((t,i)=>isNum(t)&&!dateNums.has(i)?i:-1).filter(i=>i>=0),used=new Set(dateNums);let amount=null,unit=null,qty=1,ambiguous=false;
    const money=nums.filter(i=>CUR.test(toks[i+1]||'')||toks[i-1]==='r$'||/[.,]\d{1,2}$/.test(toks[i]));
    const before=(i)=>toks.slice(Math.max(0,i-1),i).join(' '),after=(i)=>toks[i+1]||'';
    const perUnitAt=(i)=>/^(a|de)$/.test(before(i))||after(i)==='cada'||(CUR.test(after(i))&&toks[i+2]==='cada');
    const totalAt=(i)=>/^(por|deu|total)$/.test(before(i))||after(i)==='total'||toks.slice(i+1,i+3).join(' ')==='no total';
    const qtyCand=(mi)=>nums.find(i=>i!==mi&&i<mi&&/^\d+$/.test(toks[i])&&+toks[i]>=1&&+toks[i]<=40);
    const setPrice=(mi)=>{const v=parseMoney(toks[mi]);if(!Number.isFinite(v)||v<=0)return;used.add(mi);const qi=qtyCand(mi);if(qi!=null){qty=+toks[qi];used.add(qi);}
      if(qty>1&&perUnitAt(mi)){unit=v;amount=v*qty;}else if(qty>1&&!totalAt(mi)&&!CUR.test(after(mi))){ambiguous=true;amount=v;unit=Math.round(v/qty);}else{amount=v;unit=qty>1?Math.round(v/qty):v;}};
    if(money.length)setPrice(money[money.length-1]);
    else if(nums.length>=2)setPrice(nums[nums.length-1]);
    else if(nums.length===1){const i=nums[0],v=toks[i],next=toks[i+1];if(/^\d+$/.test(v)&&+v<=40&&next&&!STOP.has(next)&&!VERBS.test(next)&&i<toks.length-1){qty=+v;used.add(i);}else setPrice(i);}
    let payer=null;const nt=toks.join(' ');
    if(isSolo())payer='a';
    else if(/meio a meio|dividid|dividimos|rachamos|rachei|racha|metade cada|cada um metade/.test(nt))payer='half';
    else if(/proporcional|pela renda|proporcao da renda|proporção da renda/.test(nt))payer='prop';
    else if(/\b(meu amor|amor|ela|ele)\s+(pagou|paga|pagara|vai pagar)\b|\b(pagou|paga)\s+(meu amor|ela|ele)\b/.test(nt))payer=other();
    else if(/\b(eu|me|minha conta)\s+(paguei|pago|paga|vou pagar)\b|\b(paguei|pago)\s+eu\b/.test(nt))payer=active;
    else{const u=state.users.find(u=>toks.includes(norm(first(u.name))));if(u)payer=u.id;}
    const date=meta.date;
    const nameWords=new Set(['meio','dividido','dividida','dividimos','rachamos','rachei','racha','metade','pagou','paga','paguei','pagamos','vai','pagar','vence','vencer','vencimento','boleto','mensal','mensalmente','fixa','fixo','recorrente','todo','toda','mes','mês','dia','amanha','meu','minha','amor','ela','ele','proporcional','renda',...state.users.map(u=>norm(first(u.name)))]);
    const keep=toks.filter((t,i)=>!used.has(i)&&!isNum(t)&&!CUR.test(t)&&!VERBS.test(t)&&!nameWords.has(t)&&!STOP.has(t)&&!/^\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?$/.test(t)||t==='noventaenove');
    const phrase=keep.map(t=>t==='noventaenove'?'99':t).join(' ').trim(),label=phrase;
    const res={qty,unit,amount,ambiguous,payer,date,kind:meta.kind,recurring:meta.recurring,phrase,label:label||phrase,name:label||raw};
    if(ambiguous&&!parsing){parsing=true;try{const r=recognizeP(res);if(r){const hist=state.transactions.filter(t=>!t.billId&&t.item===r.item).slice(-40);if(hist.length>=3){const u=hist.reduce((s,t)=>s+t.amount/(t.qty||1),0)/hist.length;if(Math.abs(amount-u)<Math.abs(res.unit-u)){res.unit=amount;res.amount=amount*qty;}}}}finally{parsing=false;}}
    return res;
  }
  function recognizeP(p){return (p.phrase&&recognize(p.phrase))||(p.label&&recognize(p.label))||null;}
  const smartName=(title)=>{const p=parseQuick(title),r=recognizeP(p);return r?(p.qty>1?`${r.item} (${p.qty}x)`:r.item):cap(p.label||title);};
  function itemFields(title,category){const p=parseQuick(title),r=recognizeP(p);return {item:r?r.item:cap(p.label||p.name),icon:r?r.icon:categoryIcon(category),...(p.qty>1?{qty:p.qty}:{})};}
  function learnFrom(title,category,touched){const p=parseQuick(title),label=p.label||p.name,key=norm(label).trim(),r=recognizeP(p);if(!key||key.length<2)return;if(r&&(!touched||r.category===category))return;const entry={item:r?r.item:cap(label),category,icon:r?r.icon:categoryIcon(category)};state.learned=state.learned||{};state.learned[key]=entry;const w=firstWord(key);if(w.length>3)state.learned['w:'+w]=entry;}
  const READ_DEFAULT='Escreva do seu jeito: “3 reais de cigarro”, “2 cigarros a 3”, “pizza 45 meio a meio”, “uber 18,90 ontem”. O Juntô entende o item, o valor, quem pagou e quando, mesmo com erro de digitação.';
  function historyPrefill(text){
    const p=parseQuick(text),r=recognizeP(p),key=norm(p.label||p.name).trim();
    if(key.length<2)return null;
    const matches=state.transactions.filter(t=>!t.billId).filter(t=>{
      const nameKey=norm(t.name||''),itemKey=norm(t.item||itemOf(t).item||'');
      if(r&&itemKey===norm(r.item))return true;
      return nameKey===key||(firstWord(nameKey).length>3&&firstWord(nameKey)===firstWord(key));
    }).slice(-24);
    if(!matches.length)return null;
    const mode=(fn)=>{
      const counts={};
      matches.forEach(t=>{const value=fn(t);if(value)counts[value]=(counts[value]||0)+1;});
      const best=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
      return best&&best[1]>=Math.max(2,Math.ceil(matches.length*.55))?best[0]:null;
    };
    const category=mode(t=>t.category),payer=isSolo()?'a':mode(t=>t.payer);
    const amounts=matches.map(t=>t.amount).filter(Number.isSafeInteger).sort((a,b)=>a-b);
    let amount=null;
    if(amounts.length>=3){
      const med=amounts[Math.floor(amounts.length/2)],q1=amounts[Math.floor((amounts.length-1)*.25)],q3=amounts[Math.floor((amounts.length-1)*.75)];
      if(med>0&&(q3-q1)/med<=.28)amount=med;
    }
    return {category,payer,amount,count:matches.length};
  }
  function billHistoryPrefill(text){
    const p=parseQuick(text),r=recognizeP(p),key=norm(p.label||p.name).trim();if(key.length<2)return null;
    const matches=state.bills.filter(b=>{
      const nk=norm(b.name||''),ik=norm(b.item||'');
      if(r&&ik&&ik===norm(r.item))return true;
      return nk===key||(firstWord(nk).length>3&&firstWord(nk)===firstWord(key));
    }).slice(-24);
    if(!matches.length)return null;
    const mode=(fn,min=1)=>{const c={};matches.forEach(x=>{const k=fn(x);if(k!==undefined&&k!==null&&k!=='')c[k]=(c[k]||0)+1;});const best=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];return best&&best[1]>=min?best[0]:null;};
    const category=mode(b=>b.category),payer=isSolo()?'a':mode(b=>b.payer),recurring=matches.filter(b=>b.recurring).length>=Math.ceil(matches.length*.5);
    const amounts=matches.map(b=>b.amount).filter(Number.isSafeInteger).sort((a,b)=>a-b),amount=amounts.length?amounts[Math.floor(amounts.length/2)]:null;
    const days=matches.map(b=>pd(b.due).getDate()),dueDay=Number(mode(b=>String(pd(b.due).getDate())));
    let date=null;if(dueDay){const now=new Date(),today=dateISO(now),y=now.getFullYear(),m=now.getMonth(),cur=new Date(y,m,Math.min(dueDay,daysInMonth(y,m)));date=dateISO(cur);if(date<today){const nx=new Date(y,m+1,1);date=dateISO(new Date(nx.getFullYear(),nx.getMonth(),Math.min(dueDay,daysInMonth(nx.getFullYear(),nx.getMonth()))));}}
    const openMatches=matches.filter(b=>b.status==='open'&&(!p.amount||b.amount===p.amount));
    const openId=openMatches.length===1?openMatches[0].id:null;
    return {category,payer,amount,date,kind:recurring?'fixed':'bill',count:matches.length,openId};
  }
  function smartRead(prefix){
    const input=$('#'+prefix+'-title');if(!input)return;
    const p=parseQuick(input.value),r=recognizeP(p),hist=['expense','request'].includes(prefix)?historyPrefill(input.value):null,billHist=prefix==='expense'?billHistoryPrefill(input.value):null,sel=$('#'+prefix+'-category'),tile=$('#'+prefix+'-icon'),read=$('#'+prefix+'-read'),amt=$('#'+prefix+'-amount');
    const suggestedCategory=r?.category||hist?.category||billHist?.category;
    if(suggestedCategory&&sel&&sel.dataset.touched!=='1'&&categories.includes(suggestedCategory))sel.value=suggestedCategory;
    const cat=sel?.value||'Outros',ic=r?r.icon:input.value.trim()?categoryIcon(cat):'sparkle';
    if(tile){tile.innerHTML=icon(ic);tile.classList.toggle('known',!!r||!!hist);}
    if(amt&&amt.dataset.touched!=='1'){if(p.amount)amt.value=moneyNumber(p.amount);else if(hist?.amount)amt.value=moneyNumber(hist.amount);else if(billHist?.amount)amt.value=moneyNumber(billHist.amount);else if(input.value.trim())amt.value='';}
    const pay=$('#'+prefix+'-payer'),payer=p.payer||hist?.payer||billHist?.payer;
    if(pay&&payer&&pay.dataset.touched!=='1'&&[...state.users.map(u=>u.id),'half','prop'].includes(payer))pay.value=payer;
    const dt=$('#'+prefix+'-date'),smartDate=p.date||billHist?.date;if(dt&&smartDate&&dt.dataset.touched!=='1')dt.value=smartDate;
    const smartKind=p.kind||billHist?.kind;if(prefix==='expense'&&smartKind){const form=input.closest('form'),radio=form?.querySelector(`input[name="expense-type"][value="${smartKind}"]`);if(radio&&form?.dataset.typeTouched!=='1'){radio.checked=true;syncExpenseKind(smartKind);}}
    if(!read)return;if(!input.value.trim()){read.innerHTML=READ_DEFAULT;return;}
    const learnedByHistory=hist&&!p.payer&&!p.amount,learnedBill=billHist&&!p.amount&&!p.date;
    read.innerHTML=`<span class="chip strong">${icon(ic)}${esc(r?r.item:cap(p.label||p.name))}</span><span class="chip">${esc(catPath(cat))}</span>${p.qty>1&&p.unit?`<span class="chip">${p.qty} × ${money(p.unit)}</span>`:''}${payer?`<span class="chip">${esc(payerLabel(payer))}</span>`:''}${smartDate?`<span class="chip">${dateText(smartDate)}</span>`:''}${smartKind&&prefix==='expense'?`<span class="chip soft">${smartKind==='fixed'?'conta fixa':smartKind==='bill'?'a pagar':'gasto'}</span>`:''}${hist?.amount&&!p.amount?`<span class="chip soft">valor habitual ${money(hist.amount)}</span>`:billHist?.amount&&!p.amount?`<span class="chip soft">valor habitual ${money(billHist.amount)}</span>`:''}${billHist?.openId?`<span class="chip warn">já existe uma conta parecida aberta</span>`:''}${r?.fuzzy?`<span class="chip soft">entendi “${esc(p.label)}” como ${esc(r.item.toLowerCase())}</span>`:''}${r?.learned?'<span class="chip soft">aprendido com você</span>':learnedByHistory?`<span class="chip soft">preenchido pelo histórico (${hist.count}x)</span>`:learnedBill?`<span class="chip soft">aprendido com contas anteriores (${billHist.count}x)</span>`:!r?'<span class="chip soft">novo: o Juntô aprende com a categoria escolhida</span>':''}<button type="button" class="text-link" data-action="cat-change" data-prefix="${prefix}">Trocar categoria</button>`;
  }
  function smartEntry(prefix,label){return `<div class="smart-entry"><span class="item-tile" id="${prefix}-icon" aria-hidden="true">${icon('sparkle')}</span><div class="field"><label for="${prefix}-title">${label}</label><input id="${prefix}-title" name="${prefix}-title" type="text" maxlength="60" autocomplete="off" placeholder="Ex.: 2 cigarros a 3, pizza 45, uber 18" required></div></div><p class="smart-read" id="${prefix}-read" aria-live="polite">${READ_DEFAULT}</p>`;}
  function askModal(){
    openModal('Amor, posso gastar?',`<div class="ask-v3-intro"><span>${icon('chat')}</span><div><b>Uma vontade, uma conversa.</b><small>O Juntô mostra o impacto antes de mandar pro seu amor.</small></div></div><form class="form ask-v3-form" data-form="ask">${smartEntry('request','O que bateu vontade?')}<div class="field-pair">${field('request-amount','Quanto?','0,00','',true)}<div class="field cat-wrap" id="request-cat-wrap" hidden><label for="request-category">Categoria</label><select id="request-category" name="request-category">${optionCategories('Lazer')}</select></div></div><div class="field"><label for="request-payer">Quem paga?</label><select id="request-payer" name="request-payer">${optionPayers('half')}</select></div><div class="field"><label for="request-note">Conta pro seu amor <span>opcional</span></label><textarea id="request-note" name="request-note" maxlength="180" placeholder="Ex.: a gente merece um date sem lavar louça."></textarea></div><div class="form-note ask-v3-impact" id="request-impact"><strong>Depois desse gasto</strong>Hoje vocês têm ${cash(free())} livres depois das contas e dos planos.</div><div class="form-note" id="request-cat" hidden></div>${formEnd(`${icon('send')}Mandar pro meu amor`)}<button class="ask-v3-later" type="button" data-action="close">Agora não</button></form>`,'ask');
  }
  function expenseModal(presetCategory='',presetType='spent'){
    const preset=categories.includes(presetCategory)?presetCategory:'',kind=['spent','bill','fixed'].includes(presetType)?presetType:'spent',quick=quickCategorySuggestions(6);
    const title=kind==='spent'?'Registrar gasto':kind==='fixed'?'Adicionar conta fixa':'Adicionar conta';
    const note=kind==='spent'?'O valor sai do saldo agora e entra no histórico.':kind==='fixed'?'A conta entra no planejamento e pode se repetir todo mês.':'A conta entra no planejamento e só mexe no saldo quando for marcada como paga.';
    openModal(title,`<p class="modal-sub">Escreva do seu jeito. O Juntô tenta completar categoria, valor habitual, pagador e data usando seu histórico — você confirma antes de salvar.</p><form class="form" data-form="expense"><div class="segmented" aria-label="Tipo de lançamento"><label><input type="radio" name="expense-type" value="spent" ${kind==='spent'?'checked':''}>Já gastei</label><label><input type="radio" name="expense-type" value="bill" ${kind==='bill'?'checked':''}>Vou pagar</label><label><input type="radio" name="expense-type" value="fixed" ${kind==='fixed'?'checked':''}>Conta fixa</label></div>${smartEntry('expense','O que foi?')}<div class="smart-category-picks" aria-label="Categorias sugeridas">${quick.map(c=>`<button type="button" data-action="expense-category-pick" data-category="${esc(c)}">${icon(categoryIcon(c))}${esc(c)}</button>`).join('')}</div><div class="field cat-wrap" id="expense-cat-wrap" ${preset?'':'hidden'}><label for="expense-category">Categoria</label><select id="expense-category" name="expense-category">${optionCategories(preset||'Outros')}</select></div><div class="field-pair">${field('expense-amount','Valor','0,00','',true)}<div class="field"><label for="expense-payer">${isSolo()?'Conta':'Quem paga?'}</label><select name="expense-payer" id="expense-payer" data-split>${optionPayers()}</select></div></div><p class="split-preview" id="split-preview"></p><div class="field"><label for="expense-date" id="expense-date-label">${kind==='spent'?'Data do gasto':'Vencimento'}</label><input type="date" id="expense-date" name="expense-date" value="${dateISO()}" required></div><div class="form-note" id="budget-note" hidden></div><div class="form-note" id="expense-note">${note}</div>${formEnd(kind==='spent'?'Registrar gasto':kind==='fixed'?'Adicionar conta fixa':'Adicionar conta')}</form>`,'expense');
    if(preset){const sel=$('#expense-category');if(sel)sel.dataset.touched='1';}
    smartRead('expense');updateSplit();updateBudgetNote();
  }
  // ===== Contestar gastos =====
  const CONTEST_REASONS=['Não foi combinado','Valor alto demais','Não precisava','Dava pra esperar','Outro motivo'];
  const findTarget=(kind,id)=>kind==='bill'?state.bills.find(b=>b.id===id):state.transactions.find(t=>t.id===id);
  const canContest=(t)=>(t.by||t.payer)!==active;
  function contestBlock(c,kind,id){
    const open=c.status==='open';
    return `<div class="contest ${c.status}"><div class="contest-head">${icon('flag')}<span><b>${esc(first(user(c.by).name))} contestou</b> · ${esc(c.reason)}</span><span class="badge ${open?'warn':'success'}">${open?'Em aberto':'Conversado'}</span></div>${c.note?`<p class="contest-note">“${esc(c.note)}”</p>`:''}${(c.thread||[]).map(m=>`<div class="contest-msg">${avatar(m.by)}<p><b>${esc(first(user(m.by).name))}</b> ${esc(m.text)} <time>${timeText(m.at)}</time></p></div>`).join('')}${c.resolution?`<p class="contest-res">${icon('check')}Combinado: ${esc(c.resolution)}</p>`:''}${open?`<div class="contest-actions"><button class="btn secondary" data-action="contest-reply" data-kind="${kind}" data-id="${id}">${icon('reply')}Responder</button>${c.by===active?`<button class="btn ghost" data-action="contest-withdraw" data-kind="${kind}" data-id="${id}">Retirar</button>`:''}<button class="btn primary" data-action="contest-resolve" data-kind="${kind}" data-id="${id}">${icon('check')}Marcar como conversado</button></div>`:''}</div>`;
  }
  function contestModal(kind,id){
    const t=findTarget(kind,id);if(!t)return;const who=kind==='bill'?payerLabel(t.payer):payerLabel(t.by||t.payer);
    openModal('Contestar este gasto',`<p class="modal-sub"><b>${esc(t.name)}</b> · ${money(t.amount)} · ${esc(who)}. O gasto não é desfeito: a contestação fica registrada, avisa a outra pessoa e entra na leitura dos gastos.</p><form class="form" data-form="contest" data-kind="${kind}" data-id="${id}"><fieldset class="reason-pills"><legend>Por quê?</legend>${CONTEST_REASONS.map((r,i)=>`<label><input type="radio" name="contest-reason" value="${esc(r)}" ${i===0?'checked':''}>${esc(r)}</label>`).join('')}</fieldset><div class="field"><label for="contest-note">Deixe um comentário</label><textarea id="contest-note" name="contest-note" maxlength="240" required placeholder="Ex.: a gente tinha combinado segurar o delivery essa semana."></textarea></div>${formEnd(`${icon('flag')}Contestar gasto`)}</form>`,'contest');
  }
  function contestTextModal(kind,id,mode){
    const t=findTarget(kind,id);if(!t||!t.contest)return;
    openModal(mode==='resolve'?'O que ficou combinado?':'Responder à contestação',`<p class="modal-sub"><b>${esc(t.name)}</b> · ${money(t.amount)}. ${esc(first(user(t.contest.by).name))}: “${esc(t.contest.note)}”</p><form class="form" data-form="contest-${mode}" data-kind="${kind}" data-id="${id}"><div class="field"><label for="contest-text">${mode==='resolve'?'Combinado pra próxima <span>opcional</span>':'Sua resposta'}</label><textarea id="contest-text" name="contest-text" maxlength="240" ${mode==='resolve'?'':'required'} placeholder="${mode==='resolve'?'Ex.: próximo delivery passa pelo “posso gastar?”':'Ex.: foi um dia corrido, mas entendi.'}"></textarea></div>${formEnd(mode==='resolve'?`${icon('check')}Marcar como conversado`:`${icon('reply')}Enviar resposta`)}</form>`,'contest-'+mode);
  }
  function contestBanner(){const open=[...state.bills.map(b=>({o:b,kind:'bill'})),...state.transactions.map(t=>({o:t,kind:'tx'}))].filter(x=>x.o.contest&&x.o.contest.status==='open'&&x.o.contest.by!==active);if(!open.length)return '';const x=open[0];return `<div class="pending-banner contest-banner">${icon('flag')}<p><b>${esc(first(user(x.o.contest.by).name))} contestou ${esc(x.o.name)}</b> (${cash(x.o.amount)}): “${esc(x.o.contest.note.slice(0,70))}${x.o.contest.note.length>70?'…':''}”${open.length>1?` (+${open.length-1})`:''}</p><button data-action="contest-view">Ver e responder</button></div>`;}
  function billsView(){
    const solo=isSolo(),ym=dateISO().slice(0,7),allBills=state.bills.filter(b=>b.due.slice(0,7)===ym||b.status==='open'),openBills=allBills.filter(b=>b.status==='open'),nOpen=[...state.bills,...state.transactions].filter(x=>x.contest&&x.contest.status==='open').length;
    const bills=billFilter==='contested'?state.bills.filter(b=>b.contest):allBills.filter(b=>billFilter==='all'||billFilter==='fixed'&&b.recurring||billFilter==='open'&&b.status==='open'||billFilter==='paid'&&b.status==='paid');
    const txs=billFilter==='month'?state.transactions.filter(t=>t.date.slice(0,7)===ym&&!t.billId):[];
    const openTotal=openBills.reduce((sum,b)=>sum+b.amount,0),shared=openBills.filter(b=>['half','prop'].includes(b.payer));
    const parts=shared.reduce((acc,b)=>{splitShares(b.amount,b.payer).forEach(x=>acc[x.id]=(acc[x.id]||0)+x.amount);return acc;},{a:0,b:0});
    const billRow=(b)=>{const it=recognize(b.name)||{icon:categoryIcon(b.category)};const shares=splitShares(b.amount,b.payer);return `<div class="bills-v3-row-wrap"><button class="bills-v3-row ${b.contest?'has-contest':''}" data-action="bill-detail" data-id="${b.id}" aria-label="Ver detalhes de ${esc(b.name)}"><span class="bills-v3-icon ${categoryColor(b.category)}">${icon(it.icon)}</span><span class="bills-v3-copy"><b>${esc(b.name)}</b><small>${b.status==='paid'?'Paga '+dateText(b.paidAt?dateISO(new Date(b.paidAt)):b.due):b.due<dateISO()?'Venceu '+dateText(b.due):'Vence '+dateText(b.due)} · ${esc(payerLabel(b.payer))}${b.recurring?' · mensal':''}</small>${shares.length>1?`<span class="bills-v3-avatars">${shares.map(x=>avatar(x.id)).join('')}</span>`:''}</span><strong class="num">${cash(b.amount)}</strong><span class="bills-v3-chevron">${b.status==='paid'?icon('check'):'›'}</span></button>${b.contest?`<div class="bills-v3-contest-wrap">${contestBlock(b.contest,'bill',b.id)}</div>`:''}</div>`;};
    const txRow=(t)=>{const it=itemOf(t);return `<button class="bills-v3-row" data-action="tx-detail" data-id="${t.id}" aria-label="Ver detalhes de ${esc(t.name)}"><span class="bills-v3-icon ${categoryColor(t.category)}">${icon(it.icon)}</span><span class="bills-v3-copy"><b>${esc(t.name)}</b><small>${dateText(t.date)} · ${esc(t.category)} · ${esc(payerLabel(t.payer))}</small></span><strong class="num">− ${cash(t.amount)}</strong><span class="bills-v3-chevron">›</span></button>`;};
    return `<div class="bills-v3-head"><span>${solo?'MINHAS CONTAS':'NOSSAS CONTAS'}</span><h2>${solo?'Minhas contas':'Nossas contas'}</h2><p>${solo?'Tudo em dia. Cabeça em paz.':'Tudo em dia. Amor em paz.'}</p></div><div class="bills-v3-surface"><section class="bills-v3-summary"><div><span>A PAGAR ESTE MÊS</span><strong class="num">${cash(openTotal)}</strong><p>${openBills.length} ${openBills.length===1?'conta aberta':'contas abertas'}</p></div><button data-feature="bank-settings">${icon('wallet')}<span>Bancos ›</span></button><button class="bills-v3-income" data-action="route" data-route="incomes">${icon('trend')}<span>Entradas do mês</span><b>›</b></button></section><nav class="bills-v3-tabs"><button class="${billFilter==='open'?'active':''}" data-action="bill-filter" data-value="open">A pagar</button><button class="${billFilter==='paid'?'active':''}" data-action="bill-filter" data-value="paid">Pagas</button><button class="${billFilter==='all'?'active':''}" data-action="bill-filter" data-value="all">Todas</button></nav><div class="bills-v3-more"><button class="${billFilter==='fixed'?'active':''}" data-action="bill-filter" data-value="fixed">Fixas</button><button class="${billFilter==='month'?'active':''}" data-action="bill-filter" data-value="month">Gastos do mês</button><button class="${billFilter==='contested'?'active':''}" data-action="bill-filter" data-value="contested">Revisões${nOpen?` (${nOpen})`:''}</button></div><section class="bills-v3-list">${billFilter==='month'?txs.slice().reverse().map(txRow).join(''):bills.sort((a,b)=>a.due.localeCompare(b.due)).map(billRow).join('')}${billFilter!=='month'&&!bills.length?`<div class="home-empty-row">${icon(billFilter==='contested'?'flag':'wallet')}<span><b>${billFilter==='contested'?'Nenhuma revisão em aberto.':'Nada por aqui.'}</b><small>${billFilter==='open'?'As próximas contas aparecem assim que forem cadastradas.':'Troque o filtro ou adicione uma conta.'}</small></span></div>`:''}${billFilter==='month'&&!txs.length?`<div class="home-empty-row">${icon('wallet')}<span><b>Nenhum gasto neste mês.</b><small>O primeiro lançamento aparece aqui.</small></span></div>`:''}${shared.length&&!solo&&billFilter==='open'?`<div class="bills-v3-split"><span>${icon('half')}</span><div><b>Cada um com sua parte</b><small>Você ${cash(parts[active]||0)} · Meu amor ${cash(parts[other()]||0)}</small></div></div>`:''}</section><button class="bills-v3-add" data-action="${billFilter==='month'?'expense':'bill-new'}" ${billFilter==='fixed'?'data-kind="fixed"':''}>${icon('plus')}${billFilter==='month'?'Registrar gasto':billFilter==='fixed'?'Adicionar conta fixa':'Adicionar conta'}</button></div>`;
  }
    // ===== Cortar o que não precisa =====
  let cutPerson=null;const cutSel={};
  const CUT_FACTOR={keep:0,half:.5,cut:1};
  function itemStats(person){return cached('items:'+person,()=>{
    const T=new Date(),M=model(),days=Math.max(1,Math.min(90,M.age)),from=dateISO(addDays(T,-(days-1))),map={};
    state.transactions.forEach(t=>{if(t.billId||t.date<from)return;const sh=person==='both'?t.amount:shareOf(t,person);if(!sh)return;const it=itemOf(t),o=map[it.item]||(map[it.item]={key:it.item,item:it.item,icon:it.icon,category:t.category,total:0,count:0,qty:0,dates:new Set(),contests:0});o.total+=sh;o.count++;o.qty+=t.qty||1;o.dates.add(t.date);if(t.contest)o.contests++;});
    return Object.values(map).map(o=>{const w=CUT_WEIGHT[o.category]??.3,monthly=o.total*30.4/days,unit=o.total/o.qty,perDay=o.qty/days;let sug='keep',why='';
      if(o.category==='Hábitos'){sug='cut';why='Hábito que pesa todo dia no bolso. Cortado, vira dinheiro inteiro.';}
      else if(w>=.5&&monthly>=8000){sug='half';why='Pela metade, ainda dá pra aproveitar de vez em quando.';}
      if(o.contests&&w>=.3&&o.category!=='Hábitos'){sug='half';why='Já foi contestado na dupla.';}
      const pd2=o.count/days,freq=perDay>=1?`${ratioText(perDay)} ${o.qty>o.count?'unidades':'vezes'} por dia`:pd2*7>=1.5?`${Math.round(pd2*7)}x por semana`:pd2*30.4>=1?`${Math.round(pd2*30.4)}x por mês`:`${o.count}x em ${Math.max(2,Math.round(days/30.4))} meses`;
      return {...o,days,w,monthly,unit,perDay,freq,sug,why,score:monthly*w*(o.contests?1.3:1)*(o.category==='Hábitos'?1.6:1)};
    }).filter(o=>o.monthly>=1000).sort((a,b)=>b.score-a.score).map((o,i,arr)=>{if(o.sug==='half'&&!o.contests){const rank=arr.filter(x=>x.sug==='half'&&!x.contests&&x.score>o.score).length;if(rank>=3)return {...o,sug:'keep',why:''};}return o;});
  });}
  const cutKey=(o)=>cutPerson+'|'+o.key,levelOf=(o)=>cutSel[cutKey(o)]||'keep';
  const fvMonthly=(p,n,rate)=>{const r=Math.pow(1+rate/100,1/12)-1;return r?p*(Math.pow(1+r,n)-1)/r:p*n;};
  function cutTotals(){const list=itemStats(cutPerson);return {list,monthly:list.reduce((s,o)=>s+o.monthly*CUT_FACTOR[levelOf(o)],0),suggested:list.reduce((s,o)=>s+o.monthly*CUT_FACTOR[o.sug],0),chosen:list.filter(o=>levelOf(o)!=='keep')};}
  function fvChart(monthly,rate,w){const h=96,n=60,pts=[],plain=[];for(let i=0;i<=n;i++){pts.push(fvMonthly(monthly,i,rate));plain.push(monthly*i);}const mx=Math.max(pts[n],1),X=i=>4+(w-8)*i/n,Y=v=>h-6-(h-16)*v/mx,path=a=>a.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 ${w} ${h+16}" aria-hidden="true"><path d="${path(pts)} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)} Z" class="fv-area"/><path d="${path(plain)}" class="fv-plain"/><path d="${path(pts)}" class="fv-line"/>${[12,36,60].map(i=>`<line x1="${X(i)}" x2="${X(i)}" y1="${Y(0)}" y2="${Y(pts[i])}" class="fv-tick"/><text x="${X(i)}" y="${h+12}" text-anchor="${i===60?'end':'middle'}" class="fv-lbl">${i/12} ${i===12?'ano':'anos'}</text>`).join('')}</svg>`;}
  function cutResult(){
    const {monthly,suggested,chosen}=cutTotals(),rate=Number(state.settings.yieldRate??10),who=cutPerson==='both'?'A dupla':first(user(cutPerson).name),g=state.goals[0],base=state.plan?state.plan.monthly:Math.max(0,(planOptions()[0]||{base:0}).base-CUSHION);
    if(!monthly)return `<p class="cr-label">Escolha o que cortar ao lado.</p><p class="cr-big num">${cashR(0)}<small>/mês</small></p><p class="cr-hint">Seguindo só as sugestões do Juntô, ${esc(who.toLowerCase()==='a dupla'?'a dupla':who)} guardaria <b>${cashR(suggested)} por mês</b>: ${cashR(fvMonthly(suggested,12,rate))} em um ano.</p><button class="btn lime wide" data-action="cut-suggest">${icon('sparkle')}Aplicar sugestões</button>`;
    return `<p class="cr-label">${esc(who)} economiza</p><p class="cr-big num">${cashR(monthly)}<small>/mês</small></p><p class="cr-sub">Cortando ${chosen.map(o=>`${esc(o.item.toLowerCase())}${levelOf(o)==='half'?' (metade)':''}`).join(', ')}.</p>
      <div class="cr-grid"><div><span>6 meses</span><b class="num">${cashR(fvMonthly(monthly,6,rate))}</b></div><div><span>1 ano</span><b class="num">${cashR(fvMonthly(monthly,12,rate))}</b></div><div><span>5 anos</span><b class="num">${cashR(fvMonthly(monthly,60,rate))}</b></div></div>
      <div class="cr-chart">${fvChart(monthly,rate,window.innerWidth>=1500?296:Math.min(560,chartWidth(80)))}</div>
      <label class="cr-yield">Rendendo <input type="number" id="yield-rate" min="0" max="30" step="0.5" value="${rate}" inputmode="decimal"> % ao ano<span>Sem render: ${cashR(monthly*12)} em 1 ano.</span></label>
      ${g?`<p class="cr-eta">${icon(g.icon)}<span>${esc(g.name)}: ${etaText(g.target-g.saved,base)} <b>→ ${etaText(g.target-g.saved,base+monthly)}</b></span></p>`:''}
      <div class="cr-actions"><button class="btn primary" data-action="cut-commit">${icon('check')}Assumir esses cortes</button><button class="btn lime" data-action="cut-to-plan">Somar ${cashR(monthly)} ao plano</button></div>
      <p class="cr-fine">Projeção ilustrativa. O rendimento é uma estimativa que vocês ajustam; ele varia e não é garantido.</p>`;
  }
  function cutRow(o){const lv=levelOf(o),saved=o.monthly*CUT_FACTOR[lv];
    return `<div class="cut-row ${lv}"><span class="item-tile ${categoryColor(o.category)}">${icon(o.icon)}</span><div class="cut-info"><b>${esc(o.item)}</b><small>${o.freq} · ${cashR(o.unit)} cada · <strong>${cashR(o.monthly)}/mês</strong></small>${o.sug!=='keep'?`<em class="sug" title="${esc(o.why)}">${icon('sparkle')}Sugestão: ${o.sug==='cut'?'cortar':'reduzir pela metade'}</em>`:''}${o.contests?`<em class="flagged">${icon('flag')}contestado ${o.contests}x</em>`:''}</div>
      <div class="cut-seg" role="group" aria-label="${esc(o.item)}">${[['keep','Manter'],['half','−50%'],['cut','Cortar']].map(([v,l])=>`<button type="button" data-action="cut-level" data-key="${esc(o.key)}" data-level="${v}" aria-pressed="${lv===v}" class="${lv===v?'on':''}">${l}</button>`).join('')}</div>
      <span class="cut-save num">${saved?`+${cashR(saved)}`:''}</span></div>`;}
  function commitStatus(c){const start=c.since,days=Math.max(1,daysUntil(dateISO())-daysUntil(start)+1),spent=state.transactions.filter(t=>!t.billId&&t.date>=start&&itemOf(t).item===c.item).reduce((s,t)=>s+(c.person==='both'?t.amount:shareOf(t,c.person)),0),expected=c.baseline/30.4*days,target=expected*(1-CUT_FACTOR[c.level]);return {days,spent,expected,target,saved:Math.max(0,expected-spent),ok:spent<=target*1.1+500};}
  function commitmentsPanel(){const list=(state.commitments||[]).filter(c=>c.active);if(!list.length)return '';
    return `<div class="panel commit-panel"><div class="section-header"><div><h2>Compromissos de corte</h2><p class="small muted" style="margin-top:4px">O Juntô acompanha cada um e avisa no Radar quando passa do combinado.</p></div></div>${list.map(c=>{const s=commitStatus(c),it=recognize(c.item)||{icon:'cut'};return `<div class="commit-row ${s.ok?'ok':'off'}"><span class="item-tile">${icon(it.icon)}</span><div><b>${c.person==='both'?'Dupla':esc(first(user(c.person).name))} · ${esc(c.item)} · ${c.level==='cut'?'cortar':'pela metade'}</b><small>Desde ${dayMonth(c.since)}: ${cashR(s.spent)} gastos${c.level==='half'?` de ${cashR(s.target)} combinados`:''}. ${s.ok?`Já economizou <strong>${cashR(s.saved)}</strong>.`:`Passou do combinado, mas ainda economizou ${cashR(s.saved)}.`}</small></div><button class="btn ghost" data-action="commit-end" data-id="${c.id}">Encerrar</button></div>`;}).join('')}</div>`;}
  function investGuide(extra){
    const M=model(),essential=fixedMonthly()+['Alimentação','Transporte','Saúde'].reduce((s,c)=>s+(M.fc[c]?.f||0),0),target=essential*3,res=state.goals.filter(g=>g.icon==='shield').reduce((s,g)=>s+g.saved,0),per=(state.plan?state.plan.monthly:0)+extra,missing=Math.max(0,target-res),dream=state.goals.find(g=>g.icon!=='shield');
    return `<div class="panel invest"><div class="section-header"><div><h2>Onde colocar esse dinheiro</h2><p class="small muted" style="margin-top:4px">A ordem que mais protege a dupla, com os números de vocês.</p></div></div><ol class="steps">
      <li class="${missing?'now':'done'}"><b>Reserva de emergência</b><p>${missing?`Meta: 3 meses do essencial, ${cashR(target)}. Vocês têm ${cashR(res)}. ${per?`Com ${cashR(per)} por mês, fica pronta em ${etaText(missing,per)}.`:'Comecem por aqui.'}`:`Pronta: ${cashR(res)}, cobre 3 meses do essencial.`} Costuma ficar em aplicações de baixo risco com resgate no mesmo dia, como Tesouro Selic, CDB com liquidez diária de banco grande ou conta remunerada.</p></li>
      <li class="${missing?'':'now'}"><b>Sonhos com data</b><p>${dream?`${esc(dream.name)}: faltam ${cashR(Math.max(0,dream.target-dream.saved))}. `:''}Pra objetivo com prazo, vale comparar aplicações com vencimento perto da data do sonho, como CDB, LCI/LCA ou Tesouro prefixado.</p></li>
      <li><b>Longo prazo</b><p>Com a reserva pronta, o que sobrar pode trabalhar por anos. Antes de escolher, vale estudar ou conversar com um profissional certificado.</p></li></ol><p class="cr-fine">Conteúdo informativo, não é recomendação de investimento. Compare taxas, prazos e riscos antes de aplicar.</p></div>`;
  }
  function cutBlock(){
    if(!cutPerson||isSolo())cutPerson=isSolo()?'a':active;const {list}=cutTotals(),opt=list.filter(o=>o.w>=.3),ess=list.filter(o=>o.w<.3),M=model(),days=Math.max(1,Math.min(90,M.age)),who=cutPerson==='both'?'da dupla':`de ${first(user(cutPerson).name)}`;
    return `<section class="block" id="cortes"><div class="block-head with-link"><div><h2>Cortar o que não precisa</h2><p>O Juntô leu ${days} dias de gastos ${esc(who)}, item por item: quanto custa, quantas vezes e quanto pesa no mês. Escolha o que manter, reduzir ou cortar.</p></div><div class="seg-person" role="group" aria-label="De quem são os gastos">${[...state.users.map(u=>[u.id,first(u.name)]),['both','Os dois']].map(([v,l])=>`<button data-action="cut-person" data-value="${v}" aria-pressed="${cutPerson===v}" class="${cutPerson===v?'on':''}">${esc(l)}</button>`).join('')}</div></div>
      <div class="cut-layout"><div class="panel cut-list">${opt.length?opt.map(cutRow).join(''):`<p class="small muted">Sem gastos que dê pra cortar nos últimos ${days} dias.</p>`}${(()=>{const t=cutTotals();return t.monthly?`<div class="cut-sticky" aria-live="polite"><span>Economia</span><b class="num">${cashR(t.monthly)}/mês</b><span>1 ano: ${cashR(fvMonthly(t.monthly,12,Number(state.settings.yieldRate??10)))}</span><a href="#cut-result">Ver projeção</a></div>`:'';})()}${ess.length?`<details class="essentials"><summary>Essenciais (${ess.length}): mercado, transporte, saúde. O Juntô não sugere cortar, mas dá pra simular.</summary>${ess.map(cutRow).join('')}</details>`:''}</div><aside class="panel cut-result" id="cut-result">${cutResult()}</aside></div>
      ${commitmentsPanel()}${investGuide(cutTotals().monthly)}</section>`;
  }
  // ===== Pergunte ao Juntô: chat com os números da dupla =====
  Object.assign(paths,{
    send:'<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    stop:'<rect x="7" y="7" width="10" height="10" rx="2"/>'
  });
  const CHAT_KEY='junto-chat-v1';
  try{localStorage.removeItem('junto-gemini-config-v1');}catch{}
  const geminiReady=()=>Boolean(window.JuntoCloud?.getAccessToken);
  let chatLog=[],chatTurns=[],chatBusy=null,chatOpen=false,chatDeep=false;
  try{const c=JSON.parse(localStorage.getItem(CHAT_KEY));if(c&&Array.isArray(c.log)){chatLog=c.log.slice(-60);chatTurns=Array.isArray(c.turns)?c.turns.slice(-16):[];}}catch{}
  const saveChat=()=>{try{localStorage.setItem(CHAT_KEY,JSON.stringify({log:chatLog.filter(m=>!m.streaming).slice(-60),turns:chatTurns.slice(-16)}));}catch{}};
  const R=(c)=>Math.round(c)/100;
  function chatMode(){const el=$('#chat-mode');if(!el)return;el.textContent='Inteligência do Juntô · protegida no servidor';el.classList.add('gemini-on');el.classList.remove('gemini-off');}
  function fmt(text){
    const lines=esc(text).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').split('\n');let html='',list=false;
    lines.forEach(l=>{const m=l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/);if(m){if(!list){html+='<ul>';list=true;}html+=`<li>${m[1]}</li>`;}else{if(list){html+='</ul>';list=false;}if(l.trim())html+=`<p>${l}</p>`;}});
    return html+(list?'</ul>':'');
  }
  // ---- contexto enviado ao Gemini ----
  function chatContext(){
    const M=model(),o=planOptions()[0]||{},eomISO=endOfMonthISO(),pts=simulate({days:daysUntil(eomISO)}),eom=pts[pts.length-1],minP=pts.reduce((a,p)=>p.free<a.free?p:a,pts[0]),n=new Date();
    const items=(id)=>itemStats(id).slice(0,10).map(x=>({item:x.item,categoria:x.category,por_mes:R(x.monthly),frequencia:x.freq,valor_medio:R(x.unit),sugestao:{keep:'manter',half:'reduzir pela metade',cut:'cortar'}[x.sug]}));
    return {
      hoje:dateISO(),dia_da_semana:WEEKDAYS[n.getDay()],quem_esta_falando:{id:active,nome:user().name},pessoas:state.users.map(u=>({id:u.id,nome:u.name,saldo:R(u.balance)})),
      saldo_dupla:R(total()),livre_pra_curtir:R(free()),contas_a_pagar_abertas:R(billsTotal()),protegido_em_planos:R(protectedTotal()),pode_gastar_por_dia_ate_fim_do_mes:R(dailyCap()),
      mes:{renda_prevista:R(o.inc||0),contas_fixas:R(o.fixed||0),dia_a_dia_previsto:R(o.variable||0),sobra_no_ritmo_atual:R(o.base||0),ritmo_por_dia:R(M.daily),fim_do_mes_fora_dos_planos:R(eom.free),dia_mais_apertado:{data:minP.date,valor:R(minP.free)}},
      historico_mensal:monthLedger().map(m=>({mes:m.ym,tipo:m.kind==='past'?'fechado':m.kind==='current'?'atual (projetado)':'previsão',entrou:R(m.income),fixas:R(m.fixed),dia_a_dia:R(m.variable),resultado:R(m.result)})),
      entradas:{pendentes:pendingArrivals().map(p=>({data:p.date,nome:p.inc.name,pessoa:user(p.inc.person).name,valor:R(p.inc.amount)})),proximas:nextArrivals(35).slice(0,8).map(x=>({data:x.date,nome:x.inc.name,pessoa:user(x.inc.person).name,valor:R(x.inc.amount)}))},
      contas_fixas:templates().map(b=>({nome:b.name,valor:R(b.amount),dia:pd(b.due).getDate(),quem_paga:payerLabel(b.payer)})),
      contas_abertas:state.bills.filter(b=>b.status==='open').map(b=>({nome:b.name,valor:R(b.amount),vence:b.due})),
      metas_por_categoria:budgets().map(b=>({categoria:b.c,previsto_mes:R(b.f),meta:R(b.budget),gasto_no_mes:R(b.mtd),cabe_ainda:R(b.remaining),status:{ok:'no ritmo',tight:'acima do ritmo',over:'estourada'}[b.status],economia_possivel:R(b.save)})),
      leitura_individual:state.users.map(u=>u.id).map(id=>{const r=personReading(id);return {pessoa:user(id).name,renda_mes:R(r.inc),dia_a_dia_mes:R(r.v),parte_nas_fixas:R(r.fixed),sobra_individual:R(r.net),fatia_da_renda:pct(r.incShare),fatia_do_gasto:pct(r.varShare)};}),
      itens_que_mais_pesam:Object.fromEntries(state.users.map(u=>[u.name,items(u.id)])),modo:isSolo()?'individual':'dupla',
      planos:state.goals.map(g=>({nome:g.name,guardado:R(g.saved),meta:R(g.target)})),plano_de_guardar:state.plan?{nome:state.plan.name,por_mes:R(state.plan.monthly),guardado_no_mes:R(savedInMonth(dateISO().slice(0,7)))}:null,
      compromissos:(state.commitments||[]).filter(c=>c.active).map(c=>{const s=commitStatus(c);return {pessoa:c.person==='both'?'dupla':user(c.person).name,item:c.item,nivel:c.level==='cut'?'cortar':'metade',desde:c.since,economizado:R(s.saved),dentro_do_combinado:s.ok};}),
      contestacoes_abertas:[...state.bills,...state.transactions].filter(x=>x.contest&&x.contest.status==='open').map(x=>({gasto:x.name,valor:R(x.amount),por:user(x.contest.by).name,motivo:x.contest.reason,comentario:x.contest.note})),
      dicas:tips().map(t=>t.title),desafios_ativos:(state.challenges||[]).filter(c=>c.status==='active').map(c=>{const st=challengeStatus(c);return {desafio:c.title,quem:whoLabel(c.person),dia:st.elapsed,de:c.days,economizado:R(st.saved),situacao:st.phase};}),desafios_sugeridos:challengeSuggestions().slice(0,3).map(x=>({desafio:x.title,quem:whoLabel(x.person),vale:R(x.value)})),rendimento_estimado_ao_ano_pct:Number(state.settings.yieldRate??10)
    };
  }
  function instructions(){
    const me=user().name,other_=user(other()).name;
    return `Você é o Juntô, o assistente financeiro dentro do app Juntô, ${isSolo()?`usado por ${state.users[0].name} no modo individual: ainda não há outra pessoa conectada. Fale com ${me} no singular (você), nunca “vocês” ou “dupla”. Neste modo não existem pedidos entre pessoas, divisão de contas nem contestação; se ${me} perguntar sobre isso, explique que dá pra conectar o amor em Ajustes.`:`usado pelo casal ${state.users[0].name} e ${state.users[1].name}. Quem está falando agora é ${me}: "eu" é ${me}, "ela/ele" ou "meu amor" é ${other_}.`}
Como responder:
- Português do Brasil natural, como uma pessoa que conhece a rotina financeira ${isSolo()?'de quem usa o app':'do casal'}. Seja direto e humano. Não comece com “Claro”, “Com certeza”, “Entendo” ou frases de atendimento. Não use linguagem de robô.
- Entenda mensagens informais, abreviações, erros de digitação e contexto de conversa. “eu”, “meu”, “paguei”, “gastei” se referem a ${me}; “ela/ele”, “meu amor” se referem a ${other_}.
- Comece pela resposta concreta. Em geral, use 2 a 6 linhas curtas. Pode usar **negrito** e listas com "- ". Sem tabelas e sem títulos desnecessários.
- Use somente os dados abaixo e o que as ferramentas devolverem. Nunca invente valores, datas, compras ou conclusões. Quando uma conta depender de dados do app, calcule com esses dados.
- Quando ${me} disser que gastou, pagou, comprou, quer registrar/anotar/lançar algo, use propor_gasto. Se houver vários gastos na mesma frase, faça uma chamada para cada gasto. Não responda apenas explicando como registrar.
- Se valor, pessoa ou outro dado essencial estiver realmente ausente, não chute. Prepare o que for possível no cartão e peça somente o dado que falta.
- Para cortes e economia (ex.: parar de fumar, menos iFood), use simular_corte antes de responder e mostre por mês, 6 meses, 1 ano e 5 anos quando isso ajudar a decisão.
- Para assumir compromisso de corte ou definir meta, use as ferramentas propor_*: elas mostram um cartão pra ${me} confirmar. Nunca diga que registrou antes da confirmação do cartão.
- Em perguntas de “posso gastar?”, considere saldo livre, contas abertas, planos protegidos, ritmo do mês e próximas entradas. Explique o efeito real da compra, não dê uma resposta genérica.
- Se a pergunta comparar ${me} e ${other_}, use a leitura individual e os gastos reais; não julgue a pessoa, explique números e comportamento observável.
- Sobre investir: seja informativo (primeiro reserva de emergência em aplicações de baixo risco com resgate no mesmo dia; objetivos com data em aplicações com prazo parecido). Não recomende instituição específica e diga que não é recomendação de investimento quando entrar nesse tema.
- Sobre cigarro e outros hábitos: sem sermão; foque no impacto financeiro e no que a própria pessoa pediu.
- Se faltar dado que o app não tem, diga exatamente qual dado falta. Não preencha lacunas com suposição.
Dados do app agora (JSON, valores em reais):
${JSON.stringify(chatContext())}`;
  }
  // ---- ferramentas que o Gemini pode chamar ----
  const personOf=(v)=>{const s=norm(v||'');if(['a','b'].includes(s))return s;if(/amb|dupla|dois|casal|both/.test(s))return 'both';const u=state.users.find(u=>norm(u.name).split(' ')[0]===s.split(' ')[0]);return u?u.id:active;};
  function matchItems(person,cortes){const st=itemStats(person);return (Array.isArray(cortes)?cortes:[]).map(c=>{const q=norm(c?.item||''),rec=recognize(q),o=st.find(x=>norm(x.item)===q)||(rec&&st.find(x=>x.item===rec.item))||st.find(x=>norm(x.item).includes(q)||q.includes(norm(x.item)));return o?{o,level:/metade|half|reduz/.test(norm(c?.nivel||''))?'half':'cut'}:{missing:c?.item};});}
  function cutProjection(person,matches){const rate=Number(state.settings.yieldRate??10),found=matches.filter(m=>m.o),monthly=found.reduce((s,m)=>s+m.o.monthly*CUT_FACTOR[m.level],0),g=state.goals[0],base=state.plan?state.plan.monthly:0;
    return {pessoa:person==='both'?'dupla':user(person).name,itens:found.map(m=>({item:m.o.item,nivel:m.level==='cut'?'cortar':'metade',gasto_mensal_hoje:R(m.o.monthly),economia_mensal:R(m.o.monthly*CUT_FACTOR[m.level]),frequencia:m.o.freq})),nao_encontrados:matches.filter(m=>m.missing).map(m=>m.missing),economia_mensal:R(monthly),em_6_meses:R(fvMonthly(monthly,6,rate)),em_1_ano:R(fvMonthly(monthly,12,rate)),em_5_anos:R(fvMonthly(monthly,60,rate)),sem_rendimento_1_ano:R(monthly*12),rendimento_ao_ano_pct:rate,meta:g?{nome:g.name,hoje_chega_em:etaText(g.target-g.saved,base),com_o_corte_chega_em:etaText(g.target-g.saved,base+monthly)}:null};}
  function chatTools(){return [
    {name:'buscar_gastos',description:'Busca gastos do dia a dia já registrados (sem contas fixas). Filtra por texto do item (ex.: "pizza", "cigarro", "uber"), pessoa ("a", "b" ou "ambos") e período em dias (padrão 30). Retorna total, quantidade, média por mês, divisão por pessoa e os gastos mais recentes.',
      inputSchema:{type:'object',properties:{texto:{type:'string'},pessoa:{type:'string'},dias:{type:'number'}}},
      execute:(i)=>{const days=Math.min(200,Math.max(1,Number(i.dias)||30)),from=dateISO(addDays(new Date(),-(days-1))),q=norm(i.texto||''),rec=q?recognize(q):null,per=i.pessoa?personOf(i.pessoa):'both';
        const list=state.transactions.filter(t=>!t.billId&&t.date>=from&&(!q||(rec?itemOf(t).item===rec.item:norm(t.name+' '+itemOf(t).item+' '+t.category).includes(q)))&&(per==='both'||shareOf(t,per)>0));
        const sum=list.reduce((s,t)=>s+(per==='both'?t.amount:shareOf(t,per)),0);chatStatus('Lendo os gastos…');
        return {periodo_dias:days,filtro:rec?rec.item:i.texto||'tudo',total:R(sum),quantidade:list.length,media_por_mes:R(sum*30.4/days),por_pessoa:{[user('a').name]:R(list.reduce((s,t)=>s+shareOf(t,'a'),0)),[user('b').name]:R(list.reduce((s,t)=>s+shareOf(t,'b'),0))},recentes:list.slice(-12).reverse().map(t=>({data:t.date,nome:t.name,item:itemOf(t).item,valor:R(t.amount),quem:payerLabel(t.payer)}))};}},
    {name:'simular_corte',description:'Simula cortar ou reduzir pela metade itens de gasto de uma pessoa ("a", "b" ou "ambos"). Retorna economia por mês, em 6 meses, 1 ano e 5 anos (com o rendimento estimado do app) e quando a meta principal chega.',
      inputSchema:{type:'object',properties:{pessoa:{type:'string'},cortes:{type:'array',items:{type:'object',properties:{item:{type:'string'},nivel:{type:'string',enum:['cortar','metade']}},required:['item']}}},required:['cortes']},
      execute:(i)=>{chatStatus('Simulando o corte…');const p=personOf(i.pessoa);return cutProjection(p,matchItems(p,i.cortes));}},
    {name:'projetar',description:'Projeta os próximos 12 meses com um corte percentual no gasto do dia a dia (0 a 50) e/ou uma renda extra mensal em reais. Retorna sobra por mês, quanto acumula em 12 meses e a comparação com o ritmo atual.',
      inputSchema:{type:'object',properties:{corte_percentual:{type:'number'},renda_extra_mensal:{type:'number'}}},
      execute:(i)=>{chatStatus('Projetando o ano…');const cut=Math.min(.5,Math.max(0,(Number(i.corte_percentual)||0)/100)),extra=Math.max(0,Math.round((Number(i.renda_extra_mensal)||0)*100)),o=planOptions()[0],base=monthSamples(simulate({days:366})),sc=monthSamples(simulate({days:366,cut,extra}));return {sobra_mensal_no_cenario:R(o.inc+extra-o.fixed-o.variable*(1-cut)),sobra_mensal_ritmo_atual:R(o.base),acumulado_12_meses_cenario:R(sc[12].bal-sc[0].bal),acumulado_12_meses_ritmo_atual:R(base[12].bal-base[0].bal)};}},
    {name:'propor_gasto',description:'Prepara o registro de um gasto e mostra um cartão para a pessoa confirmar. Use quando ela disser que gastou ou pagou algo. "texto" é como ela escreveu (ex.: "2 cigarros a 3", "pizza 45"). pessoa: "a", "b", "meio" (meio a meio) ou "prop" (proporcional à renda). valor em reais, se não estiver no texto.',
      inputSchema:{type:'object',properties:{texto:{type:'string'},valor:{type:'number'},pessoa:{type:'string'},data:{type:'string'}},required:['texto']},
      execute:(i)=>{const c=expenseCard(String(i.texto||''),i.valor!=null?Math.round(Number(i.valor)*100):null,i.pessoa,i.data);pushCard(c);return `Cartão mostrado: ${c.data.item}, ${c.data.amount?R(c.data.amount):'valor a preencher'}, ${payerLabel(c.data.payer)}. Aguardando confirmação.`;}},
    {name:'propor_compromisso',description:'Mostra um cartão para a pessoa assumir um compromisso de corte (o app acompanha e avisa se passar do combinado). pessoa: "a", "b" ou "ambos"; cortes: itens com nivel "cortar" ou "metade".',
      inputSchema:{type:'object',properties:{pessoa:{type:'string'},cortes:{type:'array',items:{type:'object',properties:{item:{type:'string'},nivel:{type:'string',enum:['cortar','metade']}},required:['item']}}},required:['cortes']},
      execute:(i)=>{const p=personOf(i.pessoa),m=matchItems(p,i.cortes).filter(x=>x.o);if(!m.length)throw new Error('Nenhum desses itens aparece nos gastos dessa pessoa.');pushCard({type:'commit',data:{person:p,items:m.map(x=>({item:x.o.item,level:x.level,baseline:Math.round(x.o.monthly)}))}});return 'Cartão de compromisso mostrado, aguardando confirmação.';}},
    {name:'propor_meta',description:'Mostra um cartão para definir a meta mensal de uma categoria do Raio-X (ex.: Delivery, Lazer, Hábitos). valor_mensal em reais.',
      inputSchema:{type:'object',properties:{categoria:{type:'string'},valor_mensal:{type:'number'}},required:['categoria','valor_mensal']},
      execute:(i)=>{const c=categories.find(x=>norm(x)===norm(i.categoria))||(recognize(i.categoria)||{}).category;if(!c)throw new Error('Categoria não encontrada. Use uma de: '+categories.join(', '));pushCard({type:'budget',data:{category:c,amount:Math.max(0,Math.round(Number(i.valor_mensal)*100))}});return 'Cartão de meta mostrado, aguardando confirmação.';}}
  ];}
  // ---- cartões de ação ----
  function expenseCard(texto,amount,pessoa,data){const p=parseQuick(texto),rec=recognizeP(p),cat=rec?rec.category:'Outros',payer=pessoa?({meio:'half',half:'half',prop:'prop'}[norm(pessoa)]||personOf(pessoa)):p.payer||active;data=data||p.date;return {type:'expense',data:{known:!!rec,label:p.label,text:texto,name:smartName(texto),item:rec?rec.item:cap(p.label||p.name),icon:rec?rec.icon:categoryIcon(cat),category:cat,amount:amount||p.amount||null,qty:p.qty>1?p.qty:undefined,payer:payer==='both'?'half':payer,date:/^\d{4}-\d{2}-\d{2}$/.test(data||'')&&data<=dateISO()?data:dateISO()}};}
  function pushCard(c){c.id=uid();c.kind='card';c.status='pending';chatLog.push(c);renderChat();saveChat();}
  function cardHTML(c){
    const d=c.data,done=c.status!=='pending',btns=(ok)=>done?`<p class="card-done">${c.status==='done'?icon('check')+'Feito.':'Cancelado.'}</p>`:`<div class="card-actions"><button class="btn primary" data-action="chat-card-ok" data-id="${c.id}">${ok}</button><button class="btn ghost" data-action="chat-card-cancel" data-id="${c.id}">Cancelar</button></div>`;
    if(c.type==='expense'){const imp=d.amount&&!done?categoryImpact(d.category,d.amount):null;return `<div class="chat-card ${c.status}"><div class="card-top"><span class="item-tile known">${icon(d.icon)}</span><div><b>${esc(d.item)}</b><small>${esc(catPath(d.category))}${d.qty?` · ${d.qty} unidades`:''}</small></div>${done?`<strong class="num">${d.amount?money(d.amount):''}</strong>`:''}</div>${done?'':`<div class="card-fields"><label>Valor<span class="money-mini"><span>R$</span><input data-card="${c.id}" data-field="amount" inputmode="decimal" value="${d.amount?moneyNumber(d.amount):''}" placeholder="0,00"></span></label><label>Quem paga<select data-card="${c.id}" data-field="payer">${optionPayers(d.payer)}</select></label>${d.known?'':`<label class="wide">Categoria (o Juntô aprende)<select data-card="${c.id}" data-field="category">${optionCategories(d.category)}</select></label>`}</div>${imp?`<p class="card-note ${imp.cls}">${imp.html.replace(/<strong>/g,'').replace(/<\/strong>/g,' ')}</p>`:''}`}${btns('Registrar gasto')}</div>`;}
    if(c.type==='commit'){const tot=d.items.reduce((s,x)=>s+x.baseline*CUT_FACTOR[x.level],0);return `<div class="chat-card ${c.status}"><div class="card-top"><span class="item-tile known">${icon('cut')}</span><div><b>Compromisso de ${d.person==='both'?'a dupla':esc(first(user(d.person).name))}</b><small>${d.items.map(x=>`${x.level==='cut'?'cortar':'reduzir pela metade'} ${esc(x.item.toLowerCase())}`).join(', ')}</small></div><strong class="num pos">+${cashR(tot)}/mês</strong></div>${btns('Assumir compromisso')}</div>`;}
    if(c.type==='budget')return `<div class="chat-card ${c.status}"><div class="card-top"><span class="item-tile known">${icon(categoryIcon(d.category))}</span><div><b>Meta de ${esc(d.category.toLowerCase())}</b><small>por mês, no Raio-X</small></div><strong class="num">${cashR(d.amount)}</strong></div>${btns('Definir meta')}</div>`;
    return '';
  }
  function confirmCard(id){
    const c=chatLog.find(x=>x.id===id);if(!c||c.status!=='pending')return;const d=c.data;let note='';
    if(c.type==='expense'){
      if(!d.amount||d.amount<=0){toast('Falta o valor.','Preencha quanto foi antes de registrar.','info');return;}
      const ch=charge(d.amount,d.payer);if(ch.error){toast('Não deu pra registrar.',ch.error,'info');return;}
      learnFrom(d.text,d.category,!!d.catTouched);state.transactions.push({id:uid(),name:d.name,amount:d.amount,category:d.category,payer:d.payer,date:d.date,item:d.item,icon:d.icon,...(d.qty?{qty:d.qty}:{}),by:active,createdAt:Date.now(),...(ch.shares.length>1?{split:ch.shares}:{})});
      log(active,`registrou ${d.name}: ${money(d.amount)}, pela conversa com o Juntô.`);notify(other(),'Conta atualizada.',`${first(user().name)} registrou ${d.name} por ${money(d.amount)}.`);note=`registrou ${d.name} (${money(d.amount)}, ${['half','prop'].includes(d.payer)?payerLabel(d.payer).toLowerCase():'na conta de '+payerLabel(d.payer)})`;
      const cm=(state.commitments||[]).find(x=>x.active&&x.item===d.item&&(x.person==='both'||x.person===d.payer));if(cm)setTimeout(()=>addBot(`Anotado. Lembrete carinhoso: tem um compromisso de ${cm.level==='cut'?'cortar':'reduzir'} ${cm.item.toLowerCase()} desde ${dayMonth(cm.since)}. Mesmo com esse, já foram **${brl(commitStatus(cm).saved)}** economizados.`),50);
    }else if(c.type==='commit'){
      state.commitments=state.commitments||[];d.items.forEach(x=>{if(!state.commitments.some(k=>k.active&&k.person===d.person&&k.item===x.item))state.commitments.push({id:uid(),person:d.person,item:x.item,level:x.level,baseline:x.baseline,since:dateISO(),active:true});});
      log(active,`assumiu cortes pela conversa: ${d.items.map(x=>x.item.toLowerCase()).join(', ')}.`);notify(other(),'Compromisso de corte 💪',`${d.person==='both'?'A dupla':first(user(d.person).name)} vai ${d.items.map(x=>(x.level==='half'?'reduzir ':'cortar ')+x.item.toLowerCase()).join(', ')}.`);note=`assumiu o compromisso (${d.items.map(x=>x.item).join(', ')})`;
    }else if(c.type==='budget'){state.budgets[d.category]=d.amount;log(active,`definiu a meta de ${d.category.toLowerCase()} em ${money(d.amount)} por mês.`);note=`definiu a meta de ${d.category} em ${money(d.amount)}`;}
    c.status='done';chatTurns.push({role:'user',content:`[Confirmado no app: ${user().name} ${note}.]`});persist();renderChat();saveChat();toast('Feito pela conversa.',cap(note)+'.','check');
  }
  // ---- motor local: responde na hora, mesmo sem Claude ----
  function personInText(n){if(isSolo())return 'a';if(/\b(a gente|nos|nossa|nosso|dupla|casal|os dois|juntos)\b/.test(n))return 'both';const u=state.users.find(u=>new RegExp('\\b'+norm(first(u.name))+'\\b').test(n));return u?u.id:active;}
  function amountInText(q){const m=String(q).match(/(?:r\$\s*)?(\d{1,6}(?:[.,]\d{1,2})?)/i);return m?parseMoney(m[1]):NaN;}
  function itemsInText(n,person){const st=itemStats(person),hits=[];ITEMS.forEach(([re,item])=>{if(re.test(n)){const o=st.find(x=>x.item===item);if(o&&!hits.includes(o))hits.push(o);}});st.forEach(o=>{if(!hits.includes(o)&&norm(o.item).length>3&&n.includes(norm(o.item)))hits.push(o);});return hits;}
  function localAnswer(q){
    const n=norm(q).trim(),me=first(user().name),M=model(),mN=monthName(new Date()),rate=Number(state.settings.yieldRate??10),who=personInText(n),whoName=who==='both'?'a dupla':first(user(who).name);
    const reg=q.trim().match(/^(gastei|comprei|paguei|registra(?:r)?|anota(?:r)?|lan[cç]a(?:r)?)\s+(?:um[a]?\s+|com\s+|de\s+)?(.+)/i);
    if(reg){const c=expenseCard(reg[0],null,null,null),d=c.data,p=parseQuick(reg[0]);pushCard(c);const extra=[d.qty?`${d.qty} × ${money(p.unit)}`:'',d.payer!==active?payerLabel(d.payer).toLowerCase():'',d.date!==dateISO()?dateText(d.date):''].filter(Boolean).join(', '),ch=d.known?challengeConflict(d.item,d.payer):null;if(!d.known)return `Anotei **${d.name}**${d.amount?`, ${money(d.amount)}`:''}. Ainda não conheço esse gasto: escolhe a categoria no cartão e da próxima vez eu já sei.`;return (d.amount?`Entendi: **${d.item}**, ${money(d.amount)}${extra?` (${extra})`:''}. Confere e confirma:`:`Entendi: **${d.item}**${d.qty?`, ${d.qty} unidades`:''}. Só falta o valor:`)+(ch?`\nSó um aviso: isso quebra o desafio “${ch.c.title}” (dia ${ch.s.elapsed} de ${ch.c.days}).`:'');}
    if(/posso gastar|da pra gastar|cabe no mes|consigo gastar|posso comprar|da pra comprar/.test(n)){const a=amountInText(q),rec=recognize(n);if(Number.isFinite(a)&&a>0){const imp=rec?categoryImpact(rec.category,a):null,f=free();const fits=a<=f;return `${fits?`**Cabe.** Depois de ${money(a)}, sobram ${brl(f-a)} livres no mês.`:`**Passa do livre.** Faltariam ${brl(a-f)} depois das contas e dos planos.`}${imp?`\n${imp.html.replace(/<strong>(.*?)<\/strong>/,'**$1** ')}`:''}\n${isSolo()?'Se quiser, eu também comparo esse valor com suas metas e o ritmo do mês.':'Se quiser, peça pro seu amor no “Amor, posso gastar?”.'}`;}return `Hoje dá pra gastar até **${brl(dailyCap())} por dia** até o fim de ${mN} sem apertar o mês${state.plan?', já guardando o plano':''}. O ritmo atual é ${brl(M.daily)} por dia.`;}
    if(/economiz|parar de|parasse|cortar|cortasse|largar|deixar de|sem (o|a|os|as) |fumar|menos /.test(n)){let hits=itemsInText(n,who==='both'?'both':who);if(/fumar|fumo/.test(n)&&!hits.length)hits=itemStats(who).filter(o=>o.item==='Cigarro');
      if(hits.length){const lvl=/metade|reduzir|diminuir|menos /.test(n)?'half':'cut',m=hits.map(o=>({o,level:lvl})),pr=cutProjection(who,m),mo=pr.economia_mensal*100;pushCard({type:'commit',data:{person:who,items:m.map(x=>({item:x.o.item,level:x.level,baseline:Math.round(x.o.monthly)}))}});
        return `${lvl==='cut'?'Parando com':'Reduzindo pela metade'} ${hits.map(o=>o.item.toLowerCase()).join(' e ')}, ${whoName} guarda **${brl(mo)} por mês**.\n- 6 meses: ${brl(fvMonthly(mo,6,rate))}\n- 1 ano: **${brl(fvMonthly(mo,12,rate))}**\n- 5 anos: ${brl(fvMonthly(mo,60,rate))}\nConta com rendimento estimado de ${rate}% ao ano. ${pr.meta?`${pr.meta.nome}: ${pr.meta.hoje_chega_em} → **${pr.meta.com_o_corte_chega_em}**.`:''}\nQuer transformar em compromisso? O Juntô acompanha:`;}
      const s=itemStats(who).filter(o=>o.sug!=='keep').slice(0,3);if(s.length){const v=s.reduce((a,o)=>a+o.monthly*CUT_FACTOR[o.sug],0);return `Pelos gastos de ${whoName}, os cortes que mais rendem:\n${s.map(o=>`- ${o.item}: ${o.sug==='cut'?'cortar':'metade'}, +${brl(o.monthly*CUT_FACTOR[o.sug])}/mês`).join('\n')}\nJuntos: **${brl(v)} por mês**, ${brl(fvMonthly(v,12,rate))} em um ano. Diga "parar de X" pra simular um item.`;}}
    if(/quanto (eu |a gente |nos )?(gastei|gastamos|gasta|gastou|gastei)|gasto com|gastos com|quanto foi|gastando com/.test(n)){const rec=recognize(n),cat=categories.find(c=>n.includes(norm(c))),T=new Date(),ym=dateISO().slice(0,7),from=dateISO(addDays(T,-89));
      const match=t=>!t.billId&&(rec?itemOf(t).item===rec.item:cat?t.category===cat:true),sh=t=>who==='both'?t.amount:shareOf(t,who),mtd=state.transactions.filter(t=>t.date.slice(0,7)===ym&&match(t)).reduce((s,t)=>s+sh(t),0),q90=state.transactions.filter(t=>t.date>=from&&match(t)).reduce((s,t)=>s+sh(t),0),label=rec?rec.item.toLowerCase():cat?cat.toLowerCase():'o dia a dia';
      return `${cap(whoName)} gastou **${brl(mtd)}** com ${label} em ${mN} até agora.\nNos últimos 90 dias, a média é ${brl(q90/ (Math.min(90,M.age)/30.4))} por mês: ${brl(q90/(Math.min(90,M.age)/30.4)*12)} por ano.`;}
    if(/fecha|previs|sobrar|sobra|mes que vem|proximo mes|futuro|vai dar|vai faltar/.test(n)){const o=planOptions()[0],pts=simulate({days:daysUntil(endOfMonthISO())}),last=pts[pts.length-1],minP=pts.reduce((a,p)=>p.free<a.free?p:a,pts[0]),nx=nextArrivals(40)[0];
      return `No ritmo atual, sobram **${brl(o.base)} por mês**: entram ${brl(o.inc)}, as fixas levam ${brl(o.fixed)} e o dia a dia ${brl(o.variable)}.\n- Fim de ${mN}: ${brl(last.free)} na conta, fora dos planos\n- Dia mais apertado: ${dateLong(minP.date)}, com ${brl(minP.free)}${nx?`\n- Próxima entrada: ${nx.inc.name.toLowerCase()} de ${first(user(nx.inc.person).name)}, ${dayMonth(nx.date)}, ${brl(nx.inc.amount)}`:''}`;}
    if(/quem (gast|ta gastando|esta gastando|gasta|precisa)|quem e que/.test(n)){const rs=['a','b'].map(personReading);return rs.map(r=>`- **${first(user(r.id).name)}**: ${pct(r.varShare)} do gasto do dia a dia com ${pct(r.incShare)} da renda. Sobra individual: ${r.net<0?'−':''}${brl(Math.abs(r.net))}/mês.`).join('\n')+`\n${(()=>{const h=rs.filter(r=>r.status!=='success').sort((a,b)=>b.excess-a.excess)[0];return h?`Quem precisa segurar mais agora: **${first(user(h.id).name)}**.`:'Os dois estão no ritmo da própria renda.';})()}`;}
    if(/invest|reserva|aplicar|render|poupan|cdb|tesouro|onde coloco|onde guardo/.test(n)){const ess=fixedMonthly()+['Alimentação','Transporte','Saúde'].reduce((s,c)=>s+(M.fc[c]?.f||0),0),res=state.goals.filter(g=>g.icon==='shield').reduce((s,g)=>s+g.saved,0);
      return `A ordem que mais protege vocês:\n- **Reserva de emergência**: meta de ${brl(ess*3)} (3 meses do essencial). Hoje: ${brl(res)}. Costuma ficar em aplicação de baixo risco com resgate no mesmo dia, como Tesouro Selic ou CDB com liquidez diária.\n- **Sonhos com data**: aplicação com prazo parecido com a data do sonho.\n- **Longo prazo**: só depois da reserva pronta.\nÉ informativo, não é recomendação de investimento.`;}
    if(/onde|maior gasto|mais gast|pra onde|vaza|escapa|dica|economizar mais/.test(n)){const t=tips().slice(0,3);return t.length?`Onde o dinheiro mais escapa:\n${t.map(x=>`- **${x.title}** +${brl(x.impact)}/mês`).join('\n')}\nNo Raio-X tem a meta de cada gasto.`:'Ainda não tem gasto suficiente pra ler. Registrem por umas duas semanas.';}
    if(/salario|entrada|\bcai\b|receb|pagamento|semanal|comissao/.test(n)){const l=pendingArrivals().map(p=>({...p,pend:true})).concat(nextArrivals(35)).slice(0,5);return l.length?`Próximas entradas:\n${l.map(x=>`- ${x.pend?'**pendente** · ':''}${dateLong(x.date)}: ${x.inc.name.toLowerCase()} de ${first(user(x.inc.person).name)}, ${brl(x.inc.amount)}`).join('\n')}`:'Nenhuma entrada configurada. Dá pra configurar na aba Entradas.';}
    if(/\bconta|boleto|vence|vencimento|aluguel|\bluz\b|internet/.test(n)){const b=state.bills.filter(b=>b.status==='open').sort((a,b)=>a.due.localeCompare(b.due)).slice(0,5);return b.length?`Contas em aberto:\n${b.map(x=>`- ${x.name}: ${brl(x.amount)}, ${x.due<dateISO()?'**venceu**':`vence ${dayMonth(x.due)}`} · ${payerLabel(x.payer).toLowerCase()}`).join('\n')}\nTotal: **${brl(billsTotal())}**.`:'Nenhuma conta em aberto. 🙌';}
    if(/contest/.test(n)){const c=[...state.bills,...state.transactions].filter(x=>x.contest&&x.contest.status==='open');return c.length?c.map(x=>`- **${x.name}** (${brl(x.amount)}): ${first(user(x.contest.by).name)} contestou. “${x.contest.note}”`).join('\n'):'Nenhuma contestação em aberto.';}
    if(/saldo|quanto (a gente )?tem|quanto temos|livre|dinheiro na conta/.test(n))return `Saldo da dupla: **${brl(total())}**.\n${state.users.map(u=>`- ${first(u.name)}: ${brl(u.balance)}`).join('\n')}\nLivre pra curtir, depois de contas e planos: **${brl(free())}**.`;
    if(/meta|orcamento|limite/.test(n)){const rec=recognize(n),cat=categories.find(c=>n.includes(norm(c)))||rec?.category,b=cat&&budgets().find(x=>x.c===cat);if(b)return `Meta de ${b.c.toLowerCase()}: **${brl(b.budget)}/mês**. Em ${mN}: ${brl(b.mtd)} gastos, cabem ainda ${brl(Math.max(0,b.remaining))} (${brl(b.perDay)} por dia).`;const over=budgets().filter(x=>x.status!=='ok');return over.length?`Acima do ritmo da meta:\n${over.map(x=>`- ${x.c}: ${brl(x.mtd)} de ${brl(x.budget)}`).join('\n')}`:'Todas as metas no ritmo. 💚';}
    return `Posso ajudar com os números de vocês. Experimente:\n- "quanto economizo se parar de fumar?"\n- "gastei pizza 45"\n- "como fecha o mês?"\n- "quem está gastando mais?"\n- "posso gastar 80 num jantar?"`;
  }
  function geminiToolDeclarations(){return chatTools().map(t=>({name:t.name,description:t.description,parameters:t.inputSchema}));}
  function geminiHistory(){return chatTurns.slice(-14).map(t=>({role:t.role==='assistant'?'model':'user',parts:[{text:String(t.content||'')}]}));}
  async function geminiRequest(contents,{signal,tools=true,system=instructions(),maxOutputTokens}={}){
    const getAccessToken=window.JuntoCloud?.getAccessToken;
    if(typeof getAccessToken!=='function')throw Object.assign(new Error('Sua sessão ainda não está pronta.'),{code:'unauthorized'});
    const token=await getAccessToken();
    if(!token)throw Object.assign(new Error('Sua sessão expirou.'),{code:'unauthorized'});
    const body={contents,systemInstruction:{parts:[{text:system}]},generationConfig:{temperature:chatDeep?.42:.34,topP:.9,maxOutputTokens:maxOutputTokens||(chatDeep?4096:2048),thinkingConfig:{thinkingBudget:chatDeep?1024:0}}};
    if(tools)body.tools=[{functionDeclarations:geminiToolDeclarations()}];
    const base=String(window.JuntoCloudConfig?.appUrl||'').replace(/\/+$/,'');
    const url=base?base+'/api/ai':'/api/ai';
    let res;
    try{res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify(body),signal});}
    catch(e){if(e?.name==='AbortError')throw Object.assign(e,{code:'cancelled'});throw Object.assign(e,{code:'network'});}
    let data={};try{data=await res.json();}catch{}
    if(!res.ok){const msg=data?.message||data?.error?.message||`Erro ${res.status}`;let code=data?.code||'upstream_error';if(res.status===401)code='unauthorized';if(res.status===429)code='rate_limited';throw Object.assign(new Error(msg),{code,status:res.status});}
    const candidate=data?.candidates?.[0],content=candidate?.content;if(!content){const reason=candidate?.finishReason||data?.promptFeedback?.blockReason||'EMPTY';throw Object.assign(new Error(`A inteligência do Juntô não retornou conteúdo (${reason}).`),{code:'empty',finishReason:reason});}
    return {content,data};
  }
  async function geminiRunConversation(q,ctl,msg,update){
    let contents=geminiHistory();
    if(!contents.length||contents[contents.length-1]?.role!=='user'||contents[contents.length-1]?.parts?.[0]?.text!==q)contents.push({role:'user',parts:[{text:q}]});
    const tools=chatTools();
    for(let round=0;round<5;round++){
      const {content}=await geminiRequest(contents,{signal:ctl.signal,tools:true});
      const calls=(content.parts||[]).filter(p=>p.functionCall).map(p=>p.functionCall);
      const txt=(content.parts||[]).filter(p=>typeof p.text==='string').map(p=>p.text).join('').trim();
      contents.push(content);
      if(txt){msg.text=txt;update();}
      if(!calls.length)return txt||msg.text||'Li os dados, mas não consegui formar uma resposta. Tente reformular em uma frase.';
      const responses=[];
      for(const call of calls){
        const tool=tools.find(t=>t.name===call.name);
        if(!tool){responses.push({functionResponse:{name:call.name,response:{error:'Ferramenta não encontrada no app.'}}});continue;}
        let result;
        try{result=await tool.execute(call.args||{});}catch(e){result={error:e?.message||'Falha ao executar a ação no app.'};}
        responses.push({functionResponse:{name:call.name,response:typeof result==='object'&&result!==null?result:{result:String(result)}}});
      }
      contents.push({role:'user',parts:responses});
      chatStatus('Conferindo nos dados do app…');
    }
    throw Object.assign(new Error('Muitas etapas na mesma solicitação.'),{code:'too_many_tools'});
  }
  // ---- conversa ----
  function addBot(text){const m={kind:'bot',id:uid(),text};chatLog.push(m);renderChat();saveChat();return m;}
  function chatStatus(t){const el=document.querySelector('.chat-msg.streaming .chat-status');if(el)el.textContent=t;}
  function renderChat(){
    const log=$('#chat-log');if(!log)return;
    if(!chatLog.length){chatLog.push({kind:'bot',id:uid(),text:`Oi, ${first(user().name)}. ${isSolo()?'Bora cuidar do seu dinheiro sem perder a leveza?':'Bora cuidar do dinheiro sem perder o romance?'} Eu uso **os números atuais do Juntô** — saldo, gastos, contas, entradas e planos — e não completo lacunas no chute. Pode falar do seu jeito: “pizza 45”, “quanto posso gastar?” ou “e se eu cortar delivery?”.`});}
    log.innerHTML=chatLog.map(m=>m.kind==='user'?`<div class="chat-msg user"><p>${esc(m.text)}</p></div>`:m.kind==='card'?cardHTML(m):`<div class="chat-msg bot ${m.streaming?'streaming':''} ${m.error?'err':''}" id="msg-${m.id}">${m.streaming&&!m.text?`<span class="chat-status">Pensando…</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>`:fmt(m.text)}${m.streaming&&m.text?'<span class="chat-status"></span>':''}${m.retry?`<button class="text-link" data-action="chat-retry">Tentar de novo</button>`:''}</div>`).join('');
    log.scrollTop=log.scrollHeight;
    const sug=$('#chat-suggest');if(sug)sug.hidden=chatLog.filter(m=>m.kind==='user').length>1;
    const btn=$('#chat-send');if(btn){btn.innerHTML=icon(chatBusy?'stop':'send');btn.setAttribute('aria-label',chatBusy?'Parar resposta':'Enviar');if(chatBusy)btn.dataset.action='chat-stop';else delete btn.dataset.action;}
    const who=$('#chat-who');if(who)who.textContent=`Falando como ${first(user().name)}`;
  }
  async function sendChat(text){
    const q=String(text??$('#chat-input')?.value??'').trim();if(!q||chatBusy)return;const inp=$('#chat-input');if(inp){inp.value='';inp.style.height='';}
    chatLog.push({kind:'user',id:uid(),text:q});renderChat();saveChat();
    if(/^(gastei|comprei|paguei|registra|anota|lan[cç]a)\b/i.test(q)){const pp=parseQuick(q);if(pp.amount&&recognizeP(pp)){const at=chatLog.length,a=localAnswer(q);chatTurns.push({role:'user',content:q},{role:'assistant',content:a});chatLog.splice(at,0,{kind:'bot',id:uid(),text:a});renderChat();saveChat();return;}}
    chatTurns.push({role:'user',content:q});const msg={kind:'bot',id:uid(),text:'',streaming:true};chatLog.push(msg);const ctl=new AbortController();chatBusy=ctl;renderChat();chatMode();
    const update=()=>{const el=document.getElementById('msg-'+msg.id);if(el)el.innerHTML=fmt(msg.text)+'<span class="chat-status"></span>';const lg=$('#chat-log');if(lg)lg.scrollTop=lg.scrollHeight;};
    try{const answer=await geminiRunConversation(q,ctl,msg,update);msg.text=answer;chatTurns.push({role:'assistant',content:answer});}
    catch(e){const code=e?.code||'upstream_error';msg.error=true;msg.retry=true;msg.retryQ=q;
      if(code==='cancelled'){msg.text=(msg.text?msg.text+'\n':'')+'(Parei aqui.)';msg.retry=false;}
      else if(code==='unauthorized')msg.text='Sua sessão expirou. Entre novamente no Juntô para usar a inteligência.';
      else if(code==='rate_limited')msg.text='A inteligência do Juntô atingiu o limite disponível agora. Não vou inventar uma resposta; tente novamente em alguns instantes.';
      else if(code==='model')msg.text='A inteligência do Juntô está temporariamente indisponível. A configuração do servidor precisa ser revisada.';
      else if(code==='network')msg.text='Não consegui chegar ao serviço de inteligência agora. Verifique a internet e tente novamente. Nenhuma resposta genérica foi usada.';
      else if(code==='timeout')msg.text='A inteligência demorou mais do que o esperado desta vez. Não vou completar a resposta no chute; tente novamente.';
      else if(code==='not_configured')msg.text='A inteligência do Juntô está temporariamente indisponível. A configuração do servidor precisa ser revisada.';
      else msg.text=`O Gemini não conseguiu concluir esta resposta${e?.message?`: ${e.message}`:'.'} Não vou substituir por uma resposta artificial.`;
    }
    finally{msg.streaming=false;chatBusy=null;renderChat();saveChat();chatMode();}
  }
  function openChat(){chatOpen=true;const p=$('#chat-panel');if(!p)return;p.hidden=false;document.body.classList.add('chat-on');chatMode();renderChat();setTimeout(()=>$('#chat-input')?.focus(),60);}
  function closeChat(){chatOpen=false;const p=$('#chat-panel');if(p)p.hidden=true;document.body.classList.remove('chat-on');$('#chat-fab')?.focus();}
  function chatSuggestions(){
    const ym=dateISO().slice(0,7),sums={};
    state.transactions.filter(t=>!t.billId&&t.date.slice(0,7)===ym).forEach(t=>sums[t.category]=(sums[t.category]||0)+t.amount);
    const top=Object.entries(sums).sort((a,b)=>b[1]-a[1])[0]?.[0],g=state.goals[0];
    const list=[
      'Quanto posso gastar hoje?',
      state.incomes.length?'Como fecha o mês?':'O que preciso configurar pra prever o mês?',
      top?`E se eu cortar ${top.toLowerCase()}?`:'Onde o dinheiro escapa?',
      g?`Quando chego em ${g.name}?`:'Quanto consigo guardar por mês?',
      isSolo()?'Qual gasto mais pesa no meu mês?':'Quem está gastando mais?',
      'Gastei pizza 45'
    ];
    return [...new Set(list)].slice(0,6);
  }
  function chatShell(){
    const sug=chatSuggestions(),solo=isSolo();
    return `<button class="chat-fab" id="chat-fab" data-action="chat-open" aria-label="Pergunte ao Juntô">${icon('sparkle')}<span>Pergunte ao Juntô</span></button>
      <aside class="chat-panel chat-v3" id="chat-panel" hidden aria-label="Conversa com o Juntô"><header class="chat-head"><span class="chat-mark">${icon('sparkle')}</span><div><b>Pergunte ao Juntô</b><small id="chat-mode">Pode falar do seu jeito.</small></div><button class="icon-btn" data-action="chat-clear" aria-label="Começar nova conversa">${icon('refresh')}</button><button class="icon-btn" data-action="chat-close" aria-label="Fechar conversa">${icon('x')}</button></header>
      <div class="chat-context"><span>${icon(solo?'wallet':'heart')}</span><p>${solo?'Usando seu saldo, suas contas, entradas e planos.':'Usando os números reais da dupla, sem misturar quem pagou o quê.'}</p></div>
      <div class="chat-log" id="chat-log" role="log" aria-live="polite"></div>
      <div class="chat-suggest" id="chat-suggest">${sug.map(s=>`<button class="chip-btn" data-action="chat-ask" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <form class="chat-form" data-form="chat"><textarea id="chat-input" rows="1" maxlength="400" placeholder="Pergunte ou registre: pizza 45" aria-label="Mensagem para o Juntô"></textarea><button type="submit" class="chat-send" id="chat-send" aria-label="Enviar">${icon('send')}</button></form>
      <div class="chat-foot"><label class="deep"><input type="checkbox" id="chat-deep"> Pensar mais fundo</label><span id="chat-who"></span></div></aside>`;
  }
  function arrangeContextBar(){const root=$('#app-content');if(!root)return;const bar=root.querySelector(':scope > .topic-tabs, :scope > .filters.as-topics');if(bar)root.prepend(bar);}
  // ===== V10 · Desafios de economia =====
  Object.assign(paths,{
    chevL:'<path d="m15 18-6-6 6-6"/>',chevR:'<path d="m9 18 6-6-6-6"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
    flameOn:'<path d="M12 21c4 0 7-3 7-7 0-5-5-7-5-11-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 8 0 4 3 7 7 7z"/><path d="M12 18a2.5 2.5 0 0 1-2.5-2.5c0-2 2.5-3.5 2.5-5.5 1 1.5 2.5 3 2.5 5.5A2.5 2.5 0 0 1 12 18z"/>',
    calendarGrid:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 17h.01M12 17h.01"/>'
  });
  const whoLabel=(p)=>p==='both'?(isSolo()?'Você':'A dupla'):first(user(p).name);
  function challengeSuggestions(){return cached('chsug',()=>{
    const out=[],M=model(),taken=new Set((state.challenges||[]).filter(c=>c.status==='active').map(c=>c.key));
    ['a','b'].forEach(pid=>itemStats(pid).forEach(o=>{
      if(o.w<.4||o.monthly<4000)return;const perWeek=o.count/o.days*7;if(perWeek<.9)return;
      const days=perWeek>=1.5?7:14,daily=o.monthly/30.4,diff=perWeek>=5?'difícil':perWeek>=2?'médio':'fácil';
      out.push({key:`no|${pid}|${o.item}`,type:'no-item',person:pid,item:o.item,icon:o.icon,category:o.category,days,daily,value:daily*days,difficulty:diff,title:`${days} dias sem ${o.item.toLowerCase()}`,why:`${first(user(pid).name)} compra ${o.freq}. Em ${days} dias, isso costuma levar ${brl(daily*days)}.`});
    }));
    Object.values(M.fc).filter(x=>['Lazer','Delivery','Lanches','Compras'].includes(x.c)&&x.f>=20000).forEach(x=>{const base=x.f/30.4*7,cap=Math.max(1000,Math.round(base*.5/1000)*1000);out.push({key:`cap|both|${x.c}`,type:'cap',person:'both',category:x.c,icon:categoryIcon(x.c),days:7,cap,daily:x.f/30.4,value:base-cap,difficulty:'médio',title:`Semana de ${x.c.toLowerCase()} pela metade`,why:`Em 7 dias, a dupla costuma gastar ${brl(base)} com ${x.c.toLowerCase()}. O desafio é ficar em até ${brl(cap)}.`});});
    if(M.daily>0)out.push({key:'zero|both',type:'zero',person:'both',icon:'sparkle',days:7,target:2,daily:M.daily,value:M.daily*2,difficulty:'médio',title:'2 dias de gasto zero na semana',why:`Um dia comum de vocês custa ${brl(M.daily)}. Dois dias sem nenhum gasto do dia a dia (contas fixas não contam) guardam ${brl(M.daily*2)}.`});
    const score=(o)=>o.value*(o.category==='Hábitos'?3:1)*(o.type==='zero'?.55:o.type==='cap'?.8:1)*(o.person===active?1.25:1)*(o.days===14?.8:1);
    const seen=new Set();return out.filter(o=>!taken.has(o.key)).sort((a,b)=>score(b)-score(a)).filter(o=>{const k=(o.item||o.category||o.type);if(seen.has(k))return false;seen.add(k);return true;}).slice(0,6);
  });}
  function challengeStatus(c){
    const today=dateISO(),end=dateISO(addDays(pd(c.start),c.days-1)),elapsed=Math.min(c.days,Math.max(0,daysUntil(today)-daysUntil(c.start)+1)),finished=today>end;
    const inWin=(t)=>!t.billId&&t.date>=c.start&&t.date<=end,share=(t)=>c.person==='both'?t.amount:shareOf(t,c.person);
    const days=[];for(let i=0;i<c.days;i++){const iso=dateISO(addDays(pd(c.start),i));days.push({iso,future:iso>today,today:iso===today});}
    if(c.type==='no-item'){
      const slips=state.transactions.filter(t=>inWin(t)&&itemOf(t).item===c.item&&share(t)>0),slipDays=new Set(slips.map(t=>t.date)),spent=slips.reduce((s,t)=>s+share(t),0);
      days.forEach(d=>d.state=d.future?'future':slipDays.has(d.iso)?'slip':d.today?'today':'ok');
      let streak=0;for(let i=elapsed-1;i>=0;i--){if(slipDays.has(days[i].iso))break;streak++;}
      const saved=Math.max(0,c.daily*elapsed-spent),phase=finished?(slipDays.size===0?'won':saved>0?'partial':'lost'):'active';
      return {elapsed,finished,days,spent,saved,streak,slips:slipDays.size,phase,progress:elapsed/c.days};
    }
    if(c.type==='cap'){
      const tx=state.transactions.filter(t=>inWin(t)&&t.category===c.category&&share(t)>0),spent=tx.reduce((s,t)=>s+share(t),0),per=c.cap/c.days,byDay={};tx.forEach(t=>byDay[t.date]=(byDay[t.date]||0)+share(t));
      days.forEach(d=>d.state=d.future?'future':(byDay[d.iso]||0)>per*1.6?'slip':d.today?'today':'ok');
      const saved=Math.max(0,c.daily*elapsed-spent),phase=spent>c.cap?(finished?(saved>0?'partial':'lost'):'over'):finished?'won':'active';
      return {elapsed,finished,days,spent,saved,phase,progress:elapsed/c.days};
    }
    const spentDays=new Set(state.transactions.filter(t=>inWin(t)).map(t=>t.date));let zero=0;
    days.forEach(d=>{if(d.future)d.state='future';else if(spentDays.has(d.iso))d.state=d.today?'today':'spent';else if(d.today)d.state='today';else{d.state='ok';zero++;}});
    const phase=zero>=c.target?'won':finished?(zero>0?'partial':'lost'):'active';
    return {elapsed,finished,days,zero,saved:c.daily*zero,phase,progress:elapsed/c.days};
  }
  function challengeLine(c,s){
    if(s.phase==='won')return `<b>Cumprido.</b> ${cashR(s.saved)} ficaram no bolso${c.type==='zero'?` com ${s.zero} dias de gasto zero`:''}.`;
    if(s.phase==='partial')return `<b>Quase.</b> ${c.type==='no-item'?`${s.slips} ${s.slips===1?'tropeço':'tropeços'}`:c.type==='cap'?`passou ${cashR(s.spent-c.cap)} do limite`:`${s.zero} de ${c.target} dias de gasto zero`}, mas ${cashR(s.saved)} ficaram no bolso.`;
    if(s.phase==='lost')return 'Não foi dessa vez. Dá pra tentar de novo começando hoje.';
    if(s.phase==='over')return `Passou ${cashR(s.spent-c.cap)} do limite. Segurem até o fim pra fechar no melhor resultado possível.`;
    if(c.type==='no-item')return `${s.streak===1?'1 dia':`${s.streak} dias seguidos`} sem ${esc(c.item.toLowerCase())}${s.slips?` (${s.slips} ${s.slips===1?'tropeço':'tropeços'})`:''}. ${cashR(s.saved)} já ficaram no bolso.`;
    if(c.type==='cap')return `${cashR(s.spent)} de ${cashR(c.cap)} gastos. Cabem ${cashR(Math.max(0,c.cap-s.spent))} até ${dayMonth(dateISO(addDays(pd(c.start),c.days-1)))}.`;
    return `${s.zero} de ${c.target} dias de gasto zero. Hoje ${s.days.find(d=>d.today)?.state==='today'&&!state.transactions.some(t=>!t.billId&&t.date===dateISO())?'ainda está zerado':'já teve gasto'}.`;
  }
  function challengeCard(c){
    const s=challengeStatus(c),cheers=(c.cheers||[]).length,canCheer=c.person!=='both'&&c.person!==active&&s.phase==='active',done=['won','partial','lost'].includes(s.phase);
    return `<article class="ch-card phase-${s.phase}"><div class="ch-top"><span class="item-tile known">${icon(c.icon||'sparkle')}</span><div class="ch-title"><b>${esc(c.title)}</b><small>${esc(whoLabel(c.person))} · desde ${dayMonth(c.start)}${cheers?` · 💚 ${cheers} ${cheers===1?'torcida':'torcidas'}`:''}</small></div><span class="ch-ring" style="--p:${Math.round(s.progress*100)}" aria-label="Dia ${s.elapsed} de ${c.days}"><b>${s.elapsed}</b><small>/${c.days}</small></span></div>
      <div class="ch-days" aria-hidden="true">${s.days.map(d=>`<i class="d-${d.state}" title="${dayMonth(d.iso)}"></i>`).join('')}</div>
      <p class="ch-line">${challengeLine(c,s)}</p>
      <div class="ch-actions">${done&&s.saved>=100?`<button class="btn primary" data-action="ch-claim" data-id="${c.id}">${icon('coins')}Mandar ${cashR(s.saved)} pro cofre</button>`:''}${done?`<button class="btn secondary" data-action="ch-retry" data-id="${c.id}">${s.phase==='won'?'Próximo nível':'Tentar de novo'}</button><button class="btn ghost" data-action="ch-close" data-id="${c.id}">Fechar</button>`:''}${canCheer?`<button class="btn secondary" data-action="ch-cheer" data-id="${c.id}">💚 Torcer por ${esc(first(user(c.person).name))}</button>`:''}${!done?`<button class="btn ghost" data-action="ch-abandon" data-id="${c.id}">Desistir</button>`:''}</div></article>`;
  }
  function challengesView(){
    const act=(state.challenges||[]).filter(c=>c.status==='active'),sugs=challengeSuggestions(),hist=(state.challenges||[]).filter(c=>c.status==='done'||c.status==='closed'),won=hist.reduce((s,c)=>s+(c.result?.claimed||0),0);
    return `<section class="block"><div class="block-head"><h2>Desafios de economia</h2><p>Metas curtas, de 7 a 14 dias, criadas a partir do que vocês realmente gastam. O Juntô acompanha sozinho pelos gastos registrados e avisa quando um gasto quebra a sequência.</p></div>
      ${hist.length?`<div class="ch-trophy">${icon('trophy')}<div><b>${hist.filter(c=>c.result?.phase==='won').length} ${hist.filter(c=>c.result?.phase==='won').length===1?'desafio cumprido':'desafios cumpridos'}</b><small>${cashR(won)} mandados pro cofre pelos desafios</small></div></div>`:''}
      ${act.length?`<div class="ch-list">${act.map(challengeCard).join('')}</div>`:''}
      ${sugs.length?`<h3 class="ch-sub">${act.length?'Mais desafios pra vocês':'Sugeridos pelos gastos de vocês'}</h3><div class="ch-sug-grid">${sugs.map(o=>`<article class="ch-sug"><div class="ch-sug-top"><span class="item-tile ${categoryColor(o.category||'')}">${icon(o.icon)}</span><span class="badge ${o.difficulty==='difícil'?'warn':o.difficulty==='fácil'?'success':''}">${o.difficulty}</span></div><h4>${esc(o.title)}</h4><p class="ch-who">${o.person==='both'?'A dupla':`${avatar(o.person)}${esc(first(user(o.person).name))}`}</p><p class="ch-why">${esc(o.why)}</p><p class="ch-value">Vale <b class="num">${cashR(o.value)}</b></p><button class="btn ${act.length?'secondary':'primary'} wide" data-action="ch-accept" data-key="${esc(o.key)}">Topar desafio</button></article>`).join('')}</div>`:`<div class="empty">${icon('sparkle')}<h3>Ainda sem desafios pra sugerir.</h3><p>Registrem os gastos por uns dias. O Juntô sugere desafios a partir deles.</p></div>`}</section>`;
  }
  function challengeStrip(){
    const act=(state.challenges||[]).filter(c=>c.status==='active');if(!act.length)return '';
    return `<div class="ch-strip-list">${act.slice(0,2).map(c=>{const s=challengeStatus(c);return `<button class="ch-strip phase-${s.phase}" data-action="ch-open"><span class="ch-ring sm" style="--p:${Math.round(s.progress*100)}"><b>${s.elapsed}</b></span><span class="ch-strip-text"><b>${esc(c.title)}</b><small>${['won','partial'].includes(s.phase)?`Terminou: ${cashR(s.saved)} pra mandar pro cofre`:s.phase==='lost'?'Terminou. Bora de novo?':`${esc(whoLabel(c.person))} · ${cashR(s.saved)} no bolso até aqui`}</small></span>${icon('chevR')}</button>`;}).join('')}</div>`;
  }
  function challengeConflict(item,payer){
    const c=(state.challenges||[]).find(c=>c.status==='active'&&c.type==='no-item'&&c.item===item&&(c.person==='both'||c.person===payer||payer==='half'||payer==='prop'));if(!c)return null;const s=challengeStatus(c);if(s.phase!=='active')return null;
    return {c,s,html:`<strong>Isso quebra o desafio “${esc(c.title)}”.</strong>Dia ${s.elapsed} de ${c.days}, ${s.streak} ${s.streak===1?'dia':'dias'} seguidos e ${money(s.saved)} no bolso. Registrar mantém a conta honesta, mas vale respirar antes.`};
  }
  // ===== V10 · Calendário do mês =====
  let calOffset=0,calSel=null;
  const shortN=(c)=>{const v=Math.round(c/100);return v>=1000?`${(v/1000).toFixed(v>=10000?0:1).replace('.',',')}k`:String(v);};
  function calendarData(offset){
    const T=new Date(),f=new Date(T.getFullYear(),T.getMonth()+offset,1),y=f.getFullYear(),m=f.getMonth(),dim=daysInMonth(y,m),today=dateISO(),M=model(),from=dateISO(f),to=dateISO(new Date(y,m,dim)),byDay={};
    const day=(iso)=>byDay[iso]||(byDay[iso]={spent:0,tx:[],inc:0,incList:[],bill:0,billList:[]});
    state.transactions.forEach(t=>{if(t.date<from||t.date>to)return;const d=day(t.date);if(t.billId){d.bill+=t.amount;d.billList.push({name:t.name,amount:t.amount,paid:true});}else{d.spent+=t.amount;d.tx.push(t);}});
    state.received.forEach(r=>{if(r.status!=='received'||r.date<from||r.date>to)return;const inc=state.incomes.find(i=>i.id===r.incomeId),d=day(r.date);d.inc+=r.amount;d.incList.push({name:inc?inc.name:'Entrada',person:inc?.person,amount:r.amount,state:'done'});});
    if(to>=today){
      pendingArrivals().filter(p=>p.date>=from&&p.date<=to).forEach(p=>{const d=day(p.date);d.inc+=p.inc.amount;d.incList.push({name:p.inc.name,person:p.inc.person,amount:p.inc.amount,state:'pending'});});
      const start=from>today?from:dateISO(addDays(T,1));state.incomes.forEach(i=>occurrences(i,start,to).forEach(dt=>{const d=day(dt);d.inc+=i.amount;d.incList.push({name:i.name,person:i.person,amount:i.amount,state:'future'});}));
      state.bills.filter(b=>b.status==='open'&&b.due>=from&&b.due<=to).forEach(b=>{const d=day(b.due<today?today:b.due);d.bill+=b.amount;d.billList.push({name:b.name,amount:b.amount,paid:false,late:b.due<today});});
      if(offset>0)templates().forEach(b=>{const d=day(dateISO(new Date(y,m,Math.min(pd(b.due).getDate(),dim))));d.bill+=b.amount;d.billList.push({name:b.name,amount:b.amount,paid:false});});
    }
    const days=[];for(let i=1;i<=dim;i++){const dt=new Date(y,m,i),iso=dateISO(dt),d=byDay[iso]||{spent:0,tx:[],inc:0,incList:[],bill:0,billList:[]},future=iso>today;days.push({iso,i,dow:dt.getDay(),future,today:iso===today,...d,fc:future?M.daily*M.factor[dt.getDay()]:0});}
    const past=days.filter(d=>!d.future),max=Math.max(1,...days.map(d=>d.future?d.fc:d.spent)),total=past.reduce((s,d)=>s+d.spent,0),closed=past.filter(d=>!d.today),zero=closed.filter(d=>d.spent===0).length,top=past.reduce((a,d)=>d.spent>(a?a.spent:0)?d:a,null);
    const freeMap={},h=daysUntil(to);if(h>0&&h<=80)simulate({days:h}).forEach(p=>freeMap[p.date]=p.free);
    return {y,m,f,dim,days,max,total,zero,top,avg:closed.length?closed.reduce((s,d)=>s+d.spent,0)/closed.length:0,freeMap,fcRest:days.filter(d=>d.future).reduce((s,d)=>s+d.fc,0),hasPast:past.length>0,hasFuture:days.some(d=>d.future)};
  }
  function calDetail(D,iso){
    const d=D.days.find(x=>x.iso===iso)||D.days.find(x=>x.today)||D.days[D.days.length-1];if(!d)return '';
    const incs=d.incList.map(x=>`<li><span class="item-tile sm known">${icon('coins')}</span><span>${esc(x.name)}${x.person?` · ${esc(first(user(x.person).name))}`:''}<small>${x.state==='done'?'entrou':x.state==='pending'?'pendente de confirmar':'previsto'}</small></span><b class="num pos">+${cashR(x.amount)}</b></li>`).join('');
    const bills=d.billList.map(x=>`<li><span class="item-tile sm">${icon((recognize(x.name)||{icon:'wallet'}).icon)}</span><span>${esc(x.name)}<small>${x.paid?'conta paga':x.late?'venceu, ainda aberta':'conta a pagar'}</small></span><b class="num">−${cashR(x.amount)}</b></li>`).join('');
    const txs=d.tx.slice().sort((a,b)=>b.amount-a.amount).map(t=>{const it=itemOf(t);return `<li><span class="item-tile sm">${icon(it.icon)}</span><span>${esc(t.name)}<small>${esc(it.item)} · ${esc(payerLabel(t.payer))}</small></span><b class="num">−${cashR(t.amount)}</b></li>`;}).join('');
    const head=d.future?`<p class="cal-d-sum">Previsto no dia a dia: <b>${cashR(d.fc)}</b>, pelo ritmo de ${WEEKDAYS[d.dow]}s.${D.freeMap[d.iso]!=null?` Fora dos planos nesse dia: <b class="${D.freeMap[d.iso]<0?'neg':''}">${D.freeMap[d.iso]<0?'−':''}${cashR(Math.abs(D.freeMap[d.iso]))}</b>.`:''}</p>`:`<p class="cal-d-sum">${d.spent?`Gasto do dia a dia: <b>${cashR(d.spent)}</b>${D.avg?` · ${d.spent>D.avg*1.4?'acima':d.spent<D.avg*.6?'abaixo':'perto'} da média de ${cashR(D.avg)}`:''}`:d.today?'Nenhum gasto registrado hoje ainda.':'<b>Dia de gasto zero.</b> Nada do dia a dia. 💚'}</p>`;
    return `<div class="cal-detail"><h3>${cap(dateLong(d.iso))}${d.today?' · hoje':''}</h3>${head}${incs||bills||txs?`<ul class="cal-list">${incs}${bills}${txs}</ul>`:''}${!d.future&&!d.today&&d.spent===0?'':''}${d.future?'':`<button class="text-link" data-action="expense">Registrar um gasto</button>`}</div>`;
  }
  function calendarView(){
    const D=calendarData(calOffset),mName=`${monthName(D.f)} ${D.y}`,lead=D.days.findIndex(()=>true),blanks=D.days[0].dow,sel=calSel&&calSel.slice(0,7)===dateISO(D.f).slice(0,7)?calSel:(D.days.find(d=>d.today)||D.days.find(d=>!d.future&&d.spent)||D.days[0]).iso;
    const cell=(d)=>{const a=d.future?d.fc/D.max:d.spent/D.max,cls=['cal-day',d.future?'fut':'past',d.today?'today':'',d.iso===sel?'sel':'',!d.future&&!d.today&&d.spent===0?'zero':'',a>.58&&!d.future?'hi':''].filter(Boolean).join(' ');
      return `<button class="${cls}" data-action="cal-day" data-date="${d.iso}" style="--a:${Math.min(1,a).toFixed(2)}" aria-label="${esc(dateLong(d.iso))}: ${d.future?`previsto ${brl(d.fc)}`:`gasto ${brl(d.spent)}`}${d.inc?`, entrada de ${brl(d.inc)}`:''}${d.bill?`, contas de ${brl(d.bill)}`:''}" aria-pressed="${d.iso===sel}"><span class="cd-n">${d.i}</span><span class="cd-v">${d.future?(d.fc?`~${shortN(d.fc)}`:''):d.spent?shortN(d.spent):d.today?'':'0'}</span><span class="cd-m">${d.inc?'<i class="mk-in"></i>':''}${d.bill?'<i class="mk-bill"></i>':''}</span></button>`;};
    return `<section class="cal panel"><div class="cal-head"><button class="icon-btn" data-action="cal-month" data-delta="-1" aria-label="Mês anterior" ${calOffset<=-6?'disabled':''}>${icon('chevL')}</button><h2>${cap(mName)}</h2><button class="icon-btn" data-action="cal-month" data-delta="1" aria-label="Próximo mês" ${calOffset>=2?'disabled':''}>${icon('chevR')}</button></div>
      <div class="cal-stats">${D.hasPast?`<div><span>Dia a dia ${D.hasFuture?'até hoje':'no mês'}</span><b class="num">${cashR(D.total)}</b></div><div><span>Média por dia</span><b class="num">${cashR(D.avg)}</b></div><div><span>Dias de gasto zero</span><b>${D.zero}</b></div>`:''}${D.hasFuture?`<div><span>Ainda previsto</span><b class="num">${cashR(D.fcRest)}</b></div>`:''}${D.top&&D.top.spent?`<div><span>Dia mais caro</span><b>${D.top.i}/${String(D.m+1).padStart(2,'0')} · ${cashR(D.top.spent)}</b></div>`:''}</div>
      <div class="cal-grid"><span class="cal-wd">D</span><span class="cal-wd">S</span><span class="cal-wd">T</span><span class="cal-wd">Q</span><span class="cal-wd">Q</span><span class="cal-wd">S</span><span class="cal-wd">S</span>${'<span class="cal-blank"></span>'.repeat(blanks)}${D.days.map(cell).join('')}</div>
      <div class="cal-legend"><span><i class="lg-heat"></i>quanto mais escuro, mais gasto</span><span><i class="lg-fc"></i>previsto</span><span><i class="mk-in"></i>entrada</span><span><i class="mk-bill"></i>conta</span></div>
      ${calDetail(D,sel)}</section>`;
  }
  // ===== V11 · Modo individual (antes de conectar a outra pessoa) =====
  function isSolo(){return state.users.length<2;}
  const SOLO_TEXT=[
    ['Olha a nossa dupla.','Olha o seu mês.'],['No mesmo time','Modo individual'],['Saldo da dupla','Seu saldo'],['Nosso dinheiro','Meu dinheiro'],
    ['Nossas contas','Minhas contas'],['Nossos planos','Meus planos'],['Aconteceu por aqui','Meu histórico'],['Nosso espaço','Meu espaço'],
    ['A soma da dupla se ajusta junto.','O saldo total se ajusta junto.'],['Atualizar nosso saldo','Atualizar meu saldo'],['Nosso próximo sonho','Meu próximo sonho'],
    ['Vocês cuidam do resto juntos.','O Juntô te ajuda a chegar lá.'],['A dupla agradece.','Você agradece.'],['A dupla em movimento','Seu histórico'],['Plano da dupla','Meu plano'],
    ['O dinheiro continua no saldo da dupla','O dinheiro continua no seu saldo'],['O valor continua no saldo da dupla','O valor continua no seu saldo'],
    ['O primeiro passo da dupla aparece aqui.','Seu primeiro passo aparece aqui.'],['O que a gente fez acontecer.','O que você fez acontecer.'],
    ['Gastos, respostas e planos. Tudo com quem fez e quando.','Gastos, entradas e planos. Tudo registrado, com data.'],
    ['O mês pediu uma reunião da dupla.','O mês pediu atenção.'],['A dupla tá em paz.','Tudo em paz.'],['Criar “Cofre da dupla”','Criar “Meu cofre”'],['Cofre da dupla','Meu cofre'],
    ['O custo de vida da dupla é','Seu custo de vida é'],['aparece no histórico da dupla','aparece no seu histórico'],['Registrar na nossa conta','Registrar na minha conta'],
    ['A ordem que mais protege a dupla, com os números de vocês.','A ordem que mais te protege, com os seus números.'],['Conta no radar da dupla.','Conta no radar.'],
    ['Boleto pago. Dupla aliviada.','Boleto pago. Alívio.'],['Dá um nome pro nosso sonho.','Dá um nome pro seu sonho.'],['Criar nosso plano','Criar meu plano'],
    ['Guardar pro nosso plano','Guardar pro meu plano'],['Nosso cantinho','Meu cantinho'],['nosso cantinho, viagem, reserva','meu cantinho, viagem, reserva'],
    ['a gente vai fazer acontecer.','eu vou fazer acontecer.'],['Os avisos da dupla','Seus avisos'],['Ajustes da dupla','Ajustes'],['Personalizar a dupla','Ajustes'],
    ['aprendido com vocês','aprendido com você'],['lendo os números reais de vocês','lendo os seus números reais'],['Lendo os números de vocês','Lendo os seus números'],
    ['Em 7 dias, a dupla costuma gastar','Em 7 dias, você costuma gastar'],['depois do pagamento, a dupla gasta','depois do pagamento, você gasta'],
    ['sem mexer no resto da dupla','sem mexer no resto'],['Foto do casal','Sua foto'],['foto do casal','sua foto'],['Quem somos nós','Quem sou eu'],
    ['O boleto não pega a dupla de surpresa.','O boleto não te pega de surpresa.'],[' Discordou de algum? Conteste e deixe um comentário.',''],
    ['Pedidos, respostas e decisões da dupla ficam separados por contexto.','Suas decisões ficam separadas por contexto.'],
    ['Quem está gastando mais?','Onde estou gastando mais?'],['Antes de mandar, olha o impacto.','Antes de decidir, olha o impacto.'],['Depois desse pedido','Depois dessa compra'],['Vale conversar antes. O pedido passa do livre.','Melhor pensar antes. Passa do livre.'],['para cobrir esse pedido','para cobrir essa compra'],['Como vamos chamar a dupla?','Como o Juntô te chama?'],['Nome da primeira pessoa','Seu nome'],['A dupla ganhou os nomes de vocês.','Nome atualizado.'],['Gui & Bia voltaram.','Gui & Bia voltaram.'],['Finanças da dupla','Minhas finanças'],['Cabe no livre da dupla. 💚','Cabe no seu livre. 💚'],
    ['Contem quando o dinheiro de vocês cai','Conte quando o seu dinheiro cai'],['Quando o dinheiro de vocês cai?','Quando o seu dinheiro cai?'],
    ['Qual é o próximo objetivo de vocês?','Qual é o seu próximo objetivo?'],['e na estimativa de vocês','e na sua estimativa'],['O plano é de vocês.','O plano é seu.'],
    ['Assim vocês entram','Assim você entra'],['O Juntô fica de olho por vocês','O Juntô fica de olho por você'],['Pra vocês agora','Pra você agora'],
    ['Mais desafios pra vocês','Mais desafios pra você'],['Sugeridos pelos gastos de vocês','Sugeridos pelos seus gastos'],['Um dia comum de vocês custa','Um dia comum seu custa'],
    ['os números de vocês','os seus números'],['O plano de vocês','O seu plano'],['Mês passado vocês guardaram','Mês passado você guardou'],
    ['Vocês ainda não têm','Você ainda não tem'],['vocês têm','você tem'],['Vocês têm','Você tem'],['vocês gastam','você gasta'],['vocês gastaram','você gastou'],
    ['vocês guardaram','você guardou'],['vocês decidirem','você decidir'],['vocês realmente gastam','você realmente gasta'],['vocês ajustam','você ajusta'],
    ['vocês confirmarem','você confirmar'],['Vocês podem','Você pode'],['no bolso de vocês','no seu bolso'],['Vocês','Você'],['vocês','você'],
    ['Os dois estão no ritmo','Você está no ritmo'],['A dupla','Você'],['Segurem','Segure'],['Contem','Conte'],['Registrem','Registre'],['Combinem','Combine'],['Separem','Separe'],['Mexam','Mexa'],['Escolham','Escolha']
  ].sort((a,b)=>b[0].length-a[0].length);
  function soloStr(s){if(!isSolo()||!s)return s;let r=String(s);for(const [a,b] of SOLO_TEXT)if(r.includes(a))r=r.split(a).join(b);return r;}
  function soloize(root){
    if(!isSolo()||!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];let n;while((n=w.nextNode()))list.push(n);
    list.forEach(t=>{const v=soloStr(t.nodeValue);if(v!==t.nodeValue)t.nodeValue=v;});
    root.querySelectorAll?.('[placeholder],[aria-label],[title],[data-q]').forEach(el=>['placeholder','aria-label','title','data-q'].forEach(a=>{const v=el.getAttribute(a);if(v){const nv=soloStr(v);if(nv!==v)el.setAttribute(a,nv);}}));
  }
  function soloizeAll(){if(!isSolo())return;['#app-content','.sidebar','.topbar','.demo-strip','#mobile-nav','#peer-rail','.app-foot','#chat-panel'].forEach(sel=>soloize(document.querySelector(sel)));}
  // ---- exemplo individual ----
  function seedSolo(){
    const s=seed(),T=new Date(),mine=(t)=>t.payer==='a'||t.payer==='half'||t.payer==='prop'||(t.billId&&t.payer==='b');
    s.users=[{id:'a',name:'Gui',balance:0,tone:'blue'}];
    s.incomes=s.incomes.filter(i=>i.person==='a').map(i=>i.id==='inc1'?{...i,amount:360000}:i);s.received=s.received.filter(r=>s.incomes.some(i=>i.id===r.incomeId)).map(r=>r.incomeId==='inc1'?{...r,amount:360000}:r);
    s.transactions=s.transactions.filter(mine).map(t=>{const o={...t,by:'a',payer:'a'};if(t.payer==='half'||t.payer==='prop'){const a=(t.split||[]).find(x=>x.id==='a');o.amount=a?a.amount:Math.round(t.amount/2);}delete o.split;delete o.contest;if(/pessoa favorita/i.test(o.name))o.name='Café da manhã';if(/a dois/i.test(o.name))o.name='Jantar fora';return o;});
    s.bills=s.bills.map(b=>({...b,amount:b.payer==='half'||b.payer==='prop'?Math.round(b.amount/2):b.amount,payer:'a'}));
    s.goals=[{id:'goal1',name:'Viagem dos sonhos',target:400000,saved:60000,icon:'plane'},{id:'goal2',name:'Reserva de emergência',target:900000,saved:40000,icon:'shield'}];
    s.saves=s.saves.map(v=>({...v,actor:'a'}));s.requests=[];s.notifications=[];s.challenges=[];s.commitments=[];
    s.activity=[{id:'ac1',actor:'a',message:'começou no modo individual: o controle financeiro é só seu, por enquanto.',createdAt:Date.now()-7200000},{id:'ac2',actor:'a',message:'configurou as entradas: salário no 5º dia útil e um valor toda sexta.',createdAt:Date.now()-86400000*20}];
    const openBills=s.bills.filter(b=>b.status==='open').reduce((x,b)=>x+b.amount,0),prot=s.goals.reduce((x,g)=>x+g.saved,0);s.users[0].balance=openBills+prot+64300;
    return s;
  }
  // ---- conectar a outra pessoa ----
  function connectPerks(){return [['chat','“Posso gastar?” um pro outro','Pedido, resposta e o impacto no mês na hora.'],['half','Contas meio a meio','Ou proporcional à renda, cada parte sai da conta de cada um.'],['heart','Planos e desafios juntos','Metas, cofre e torcida pra quem está no desafio.'],['flag','Contestar com carinho','Discordou de um gasto? Comenta sem briga.']].map(([i,t,d])=>`<li>${icon(i)}<span><b>${t}</b><small>${d}</small></span></li>`).join('');}
  function connectCard(compact){
    const me=user('a');
    return `<section class="connect-card ${compact?'compact':''}"><div class="connect-pair"><span class="avatar large">${esc(me.name.slice(0,1).toUpperCase())}</span><span class="connect-link">${icon('link')}</span><span class="avatar ghost large">${icon('plus')}</span></div><h2>Juntô fica ainda melhor a dois.</h2><p>Por enquanto, o controle é só seu. Quando quiser, conecte seu amor: tudo o que você já registrou continua aqui.</p>${compact?'':`<ul class="connect-perks">${connectPerks()}</ul>`}<button class="btn primary wide" data-action="connect">${icon('heart')}Conectar meu amor</button></section>`;
  }
  function connectModal(){
    openModal('Juntô fica melhor a dois.',`<div class="connect-v3-hero"><div class="connect-v3-pair">${avatar('a','large')}<span>${icon('link')}</span><span class="avatar ghost large">${icon('heart')}</span></div><p>Um time pra cuidar do dinheiro e dos sonhos.</p></div><ul class="connect-v3-perks">${connectPerks()}</ul><button class="connect-v3-main" data-action="connect-setup">${icon('heart')}Conectar meu amor</button><button class="connect-v3-later" data-action="close">Agora não</button><p class="connect-v3-history">Seu histórico continua aqui.</p>`,'connect-intro');
  }
  function connectSetupModal(){
    const code='JUNTO-'+String(Math.abs([...user('a').name].reduce((h,c)=>h*31+c.charCodeAt(0),7))%9000+1000);
    openModal('Conectar meu amor',`<p class="modal-sub">Você continua com tudo o que já registrou. A partir daqui, as contas, os planos e o “posso gastar?” passam a ser da dupla.</p><form class="form" data-form="connect">${field('partner-name','Nome do seu amor','Como o Juntô vai chamar a outra pessoa')}<div class="field"><label for="partner-balance">Saldo atual da outra pessoa <span>opcional</span></label><div class="money-input"><span>R$</span><input id="partner-balance" name="partner-balance" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00"></div></div><label class="check"><input type="checkbox" name="split-fixed" checked><span>Dividir as contas da casa meio a meio<small>Aluguel, condomínio, luz, internet e assinaturas: cada um paga a metade daqui pra frente. Gastos pessoais continuam individuais.</small></span></label><div class="invite-code"><strong>${code}</strong><p>Código ilustrativo do convite. No app final, a outra pessoa entra com ele.</p></div>${formEnd(`${icon('link')}Conectar e virar dupla`)}</form>`,'connect');
  }
  // ---- "Posso gastar?" no modo individual: veredito sem pedido ----
  let canDraft=null,restoreDraft=null;
  function canSpendModal(){
    canDraft=null;
    openModal('Posso gastar?',`<p class="modal-sub">Diz o que é e quanto custa. O Juntô confere com o seu mês antes de você decidir.</p><form class="form" data-form="can-spend">${smartEntry('request','O que você quer comprar?')}<div class="field-pair">${field('request-amount','Quanto custa?','0,00','',true)}<div class="field cat-wrap" id="request-cat-wrap" hidden><label for="request-category">Categoria</label><select id="request-category" name="request-category">${optionCategories('Lazer')}</select></div></div><div class="form-note" id="request-impact"><strong>Antes de decidir, olha o impacto.</strong>Hoje você tem ${cash(free())} livres depois das contas e dos planos.</div><div class="form-note" id="request-cat" hidden></div><div id="can-verdict"></div>${formEnd(`${icon('sparkle')}Ver o veredito`)}</form>`,'ask');
  }
  function canSpendVerdict(title,amount,cat){
    const f=free(),cap=dailyCap(),left=daysLeftIncl(),capAfter=Math.max(0,cap-amount/left),b=budgets().find(x=>x.c===cat),M=model(),g=state.goals.find(x=>x.id===state.plan?.goalId)||state.goals[0],perDay=state.plan?state.plan.monthly/30.4:0;
    const level=amount>f?'no':(amount>f*.45||(b&&amount>b.remaining)||capAfter<M.daily*.5)?'tight':'ok';
    const lines=[`Depois disso, ficam <b>${cash(Math.max(0,f-amount))}</b> livres${amount>f?`. Faltariam ${cash(amount-f)}.`:'.'}`,`Seu limite por dia até o fim do mês vai de ${cashR(cap)} para <b>${cashR(capAfter)}</b>.`];
    if(b)lines.push(amount>b.remaining?`Passa ${cashR(amount-Math.max(0,b.remaining))} da meta de ${esc(cat.toLowerCase())} deste mês.`:`Cabe na meta de ${esc(cat.toLowerCase())}: sobram ${cashR(b.remaining-amount)}.`);
    if(g&&perDay>0)lines.push(`É o mesmo que ${Math.max(1,Math.round(amount/perDay))} ${Math.round(amount/perDay)===1?'dia':'dias'} do seu plano de guardar pra ${esc(g.name)}.`);
    const head={ok:['Pode, sem apertar.','O mês aguenta tranquilo.'],tight:['Cabe, mas aperta.','Dá, mas o resto do mês fica mais curto.'],no:['Melhor esperar.','Hoje isso passa do que está livre.']}[level];
    return `<div class="can-card ${level}"><div class="can-head"><span>${icon(level==='ok'?'circleCheck':level==='tight'?'info':'x')}</span><div><b>${head[0]}</b><small>${head[1]}</small></div></div><ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul><div class="can-actions"><button type="button" class="btn ${level==='no'?'secondary':'primary'}" data-action="can-buy">${icon('cart')}Comprei, registrar</button><button type="button" class="btn ${level==='no'?'primary':'secondary'}" data-action="can-wait">Vou esperar</button></div></div>`;
  }
  function render(){if(!appAccess)return;if(cloudSlot)active=cloudSlot;if(isSolo()){active='a';if(route==='requests')route='home';if(futureTab==='people')futureTab='forecast';}document.body.classList.toggle('solo',isSolo());renderNav();document.body.dataset.route=route;for(const k in chartStore)delete chartStore[k];$('#app-content').innerHTML=({home:homeView,future:futureView,analysis:analysisView,incomes:incomesView,bills:billsView,requests:requestsView,goals:goalsView,activity:activityView}[route]||homeView)();arrangeContextBar();renderPeer();if(chatOpen)renderChat();soloizeAll();}
  let modalReturnFocus=null;
  function modalHead(title){return `<div class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button class="icon-btn" data-action="close" aria-label="Fechar">${icon('x')}</button></div>`;}
  function openModal(title,body,kind=''){if(!appAccess){if(!kind.startsWith('cloud-'))return;document.querySelector('#auth-gate').innerHTML=`<div class="auth-card"><h1>${esc(title)}</h1>${body}${kind==='cloud-forgot'?'<button class="btn ghost wide" data-feature="cloud-auth-login">Voltar ao login</button>':''}</div>`;return;}const d=$('#modal');if(!d.open)modalReturnFocus=document.activeElement;d.dataset.kind=kind;d.classList.toggle('peer-modal',kind==='peer');$('#modal-content').innerHTML=modalHead(title)+body;soloize($('#modal-content'));if(!d.open)d.showModal();requestAnimationFrame(()=>d.querySelector('input:not([type="hidden"]),textarea,select,button:not([data-action="close"])')?.focus({preventScroll:true}));}
  const optionUsers=(selected=active)=>state.users.map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}</option>`).join('');
  const optionCategories=(selected='Outros')=>categories.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('');
  const field=(name,label,placeholder='',value='',moneyField=false)=>`<div class="field"><label for="${name}">${label}</label>${moneyField?'<div class="money-input"><span>R$</span>':''}<input id="${name}" name="${name}" type="text" ${moneyField?'inputmode="decimal" autocomplete="off"':'maxlength="60"'} placeholder="${esc(placeholder)}" value="${esc(value)}" required>${moneyField?'</div>':''}</div>`;
  const formEnd=(text)=>'<p class="form-error" role="alert" id="form-error"></p><button class="btn primary wide" type="submit">'+text+'</button>';
  function balanceModal(id){
    const u=user(id);
    openModal(`Quanto tu tem em conta, ${first(u.name)}?`,`<p class="modal-sub">Atualize o saldo atual. A soma da dupla se ajusta junto.</p><form class="form" data-form="balance" data-user="${id}">${field('balance-amount','Saldo atual da sua conta','0,00',moneyNumber(u.balance),true)}<div class="form-note">Informe o saldo de agora. Isso substitui o valor anterior; não conta como uma renda nova.</div>${formEnd('Atualizar nosso saldo')}</form>`,'balance');
  }
  function newGoalModal(){
    openModal('Dá um nome pro nosso sonho.',`<p class="modal-sub">Pode ser uma viagem. Pode ser paz pra dormir. O plano é de vocês.</p><form class="form" data-form="goal">${field('goal-title','Nome do plano','Ex.: nosso cantinho, viagem, reserva')}<div class="field-pair">${field('goal-target','Quanto queremos juntar?','0,00','',true)}<div class="field"><label for="goal-icon">Cara desse plano</label><select id="goal-icon" name="goal-icon"><option value="plane">Viagem</option><option value="house">Nosso cantinho</option><option value="shield">Reserva</option><option value="gift">Um sonho</option></select></div></div>${formEnd('Criar nosso plano')}</form>`,'goal');
  }
  function goalDetailModal(id){
    const g=state.goals.find(x=>x.id===id);if(!g)return;
    const p=Math.min(100,Math.round(g.saved/g.target*100)),remaining=Math.max(0,g.target-g.saved),entries=state.saves.filter(x=>x.goalId===g.id),by=entries.reduce((o,x)=>(o[x.actor]=(o[x.actor]||0)+x.amount,o),{});
    openModal(g.name,`<div class="goal-detail-v3"><div class="goal-detail-hero"><span class="goal-detail-icon">${icon(g.icon||'heart')}</span><div><span>PLANO</span><strong class="num">${cash(g.saved)}</strong><p>${p}% de ${cash(g.target)} · ${remaining?'faltam '+cash(remaining):'meta alcançada'}</p></div></div><div class="plans-v3-progress" role="progressbar" aria-label="Progresso de ${esc(g.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span style="width:${p}%"></span></div><div class="ledger-detail-grid">${ledgerMeta('Meta',cash(g.target))}${ledgerMeta('Guardado',cash(g.saved))}${ledgerMeta(isSolo()?'Contribuições':'Você',cash(isSolo()?g.saved:(by[active]||0)))}${!isSolo()?ledgerMeta('Meu amor',cash(by[other()]||0)):''}</div><div class="ledger-actions"><button class="ledger-action primary" data-action="contribute" data-id="${g.id}">${icon('plus')}<span><b>Guardar um pouquinho</b><small>Protege mais dinheiro para este plano</small></span></button><button class="ledger-action" data-action="edit-goal" data-id="${g.id}">${icon('edit')}<span><b>Editar plano</b><small>Nome, meta e ícone</small></span></button><button class="ledger-action danger" data-action="release-goal" data-id="${g.id}">${icon('trash')}<span><b>Encerrar plano</b><small>Libera ${cash(g.saved)} de volta ao saldo livre</small></span></button></div></div>`,'goal-detail');
  }
  function editGoalModal(id){
    const g=state.goals.find(x=>x.id===id);if(!g)return;
    openModal('Editar plano',`<form class="form" data-form="edit-goal" data-id="${g.id}">${field('edit-goal-title','Nome do plano','',g.name)}<div class="field-pair">${field('edit-goal-target','Meta','0,00',moneyNumber(g.target),true)}<div class="field"><label for="edit-goal-icon">Ícone</label><select id="edit-goal-icon" name="edit-goal-icon">${[['plane','Viagem'],['house','Nosso cantinho'],['shield','Reserva'],['gift','Um sonho']].map(([v,n])=>`<option value="${v}" ${g.icon===v?'selected':''}>${n}</option>`).join('')}</select></div></div><div class="form-note">O valor já guardado (${cash(g.saved)}) não é alterado ao mudar a meta.</div>${formEnd('Salvar plano')}</form>`,'goal-edit');
  }
  function contributeModal(id){
    const g=state.goals.find(g=>g.id===id);if(!g)return;
    openModal('Um pouquinho mais perto.',`<p class="modal-sub">Separar dinheiro para <b>${esc(g.name)}</b> é dizer: a gente vai fazer acontecer.</p><form class="form" data-form="contribute" data-id="${id}">${field('contribute-amount','Quanto vamos separar?','0,00','',true)}<div class="form-note"><strong>Livre agora: ${cash(free())}</strong>O valor continua no saldo da dupla, mas fica protegido para este plano. Faltam ${cash(Math.max(0,g.target-g.saved))} para a meta.</div>${formEnd('Guardar pro nosso plano')}</form>`,'contribute');
  }
  function declineModal(id,actor){
    const r=state.requests.find(r=>r.id===id);if(!r||r.status!=='pending'||r.recipient!==actor)return;
    openModal('Hoje não, amor. Mas bora conversar.',`<p class="modal-sub">${esc(first(user(r.author).name))} pediu <b>${esc(r.title)}</b> por ${cash(r.amount)}. Uma resposta com carinho vale mais.</p><form class="form" data-form="decline" data-id="${id}" data-actor="${actor}"><div class="field"><label for="decline-note">O que vamos dizer?</label><textarea name="decline-note" id="decline-note" maxlength="180" required>Vamos deixar pra depois e cuidar do nosso plano primeiro? 💚</textarea></div>${formEnd('Mandar a resposta')}</form>`,'decline');
  }
  function purchaseModal(id,actor){
    const r=state.requests.find(r=>r.id===id);if(!r||r.status!=='approved'||r.author!==actor)return;
    openModal('Comprou? Então bora registrar.',`<p class="modal-sub">${esc(r.title)} · <b>${cash(r.amount)}</b></p><form class="form" data-form="purchase" data-id="${id}" data-actor="${actor}"><div class="field"><label for="purchase-payer">Saiu da conta de quem?</label><select id="purchase-payer" name="purchase-payer" data-split data-amount="${r.amount}">${optionPayers(r.suggestedPayer||actor)}</select></div><p class="split-preview" id="split-preview"></p><div class="form-note">O valor reservado vira um gasto. Ele sai do saldo uma única vez, sem descontar de novo do livre.</div>${formEnd('Confirmar: já comprei')}</form>`,'purchase');
  }
  function payBillModal(id){
    const b=state.bills.find(b=>b.id===id);if(!b||b.status!=='open')return;
    openModal('Boleto pago. Dupla aliviada.',`<p class="modal-sub">${esc(b.name)} · <b>${cash(b.amount)}</b></p><form class="form" data-form="pay-bill" data-id="${id}"><div class="field"><label for="bill-payer">Quem pagou?</label><select id="bill-payer" name="bill-payer" data-split data-amount="${b.amount}">${optionPayers(b.payer)}</select></div><p class="split-preview" id="split-preview">${esc(splitPreview(b.amount,b.payer))}</p><div class="form-note">Meio a meio ou proporcional: cada parte sai da conta de cada um. A conta deixa de aparecer nas pendências.</div>${formEnd('Confirmar pagamento')}</form>`,'pay-bill');
  }
  function ledgerMeta(label,value){return `<div class="ledger-detail-meta"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;}
  function billDetailModal(id){
    const b=state.bills.find(x=>x.id===id);if(!b)return;const paidTx=state.transactions.find(t=>t.billId===b.id);
    const status=b.status==='paid'?'Paga':'A pagar',when=b.status==='paid'&&paidTx?`Pago em ${dateText(paidTx.date)}`:`Vence ${dateText(b.due)}`;
    const actions=[`<button class="ledger-action" data-action="edit-bill" data-id="${b.id}">${icon('edit')}<span><b>Editar</b><small>Nome, valor, categoria, data e divisão</small></span></button>`];
    if(b.status==='open')actions.push(`<button class="ledger-action primary" data-action="pay-bill" data-id="${b.id}">${icon('check')}<span><b>Marcar como paga</b><small>Registra o pagamento e atualiza o saldo</small></span></button>`);
    if(b.status==='paid')actions.push(`<button class="ledger-action" data-action="reopen-bill" data-id="${b.id}">${icon('refresh')}<span><b>Reabrir conta</b><small>Desfaz o pagamento e devolve o valor ao saldo</small></span></button>`);
    if(!isSolo()&&canContest(b))actions.push(`<button class="ledger-action" data-action="contest" data-kind="bill" data-id="${b.id}">${icon('flag')}<span><b>Contestar</b><small>Conversa sem apagar o histórico</small></span></button>`);
    actions.push(`<button class="ledger-action danger" data-action="delete-bill" data-id="${b.id}">${icon('trash')}<span><b>Excluir conta</b><small>${b.status==='paid'?'Apaga a conta e estorna o pagamento':'Remove do planejamento'}</small></span></button>`);
    openModal(b.name,`<div class="ledger-detail-v3"><div class="ledger-detail-hero"><span class="bills-v3-icon ${categoryColor(b.category)}">${icon((recognize(b.name)||{icon:categoryIcon(b.category)}).icon)}</span><div><span class="ledger-status ${b.status}">${status}</span><strong class="num">${cash(b.amount)}</strong><p>${esc(when)}</p></div></div><div class="ledger-detail-grid">${ledgerMeta('Categoria',b.category)}${ledgerMeta('Quem paga',payerLabel(b.payer))}${ledgerMeta('Tipo',b.recurring?'Conta fixa / mensal':'Conta avulsa')}${ledgerMeta('Criada como',b.item||b.name)}</div>${b.contest?contestBlock(b.contest,'bill',b.id):''}<div class="ledger-actions">${actions.join('')}</div></div>`,'ledger-detail');
  }
  function transactionDetailModal(id){
    const t=state.transactions.find(x=>x.id===id);if(!t)return;if(t.billId&&state.bills.some(b=>b.id===t.billId))return billDetailModal(t.billId);const it=itemOf(t),who=payerLabel(t.payer);
    const actions=[`<button class="ledger-action" data-action="edit-tx" data-id="${t.id}">${icon('edit')}<span><b>Editar</b><small>Corrigir nome, valor, categoria, data ou divisão</small></span></button>`];
    if(!isSolo()&&canContest(t))actions.push(`<button class="ledger-action" data-action="contest" data-kind="tx" data-id="${t.id}">${icon('flag')}<span><b>Contestar</b><small>Registra a conversa sem apagar o gasto</small></span></button>`);
    actions.push(`<button class="ledger-action danger" data-action="delete-tx" data-id="${t.id}">${icon('trash')}<span><b>Excluir gasto</b><small>${t.balanceDelta===0?'Apaga o lançamento sem alterar o saldo':'Estorna o valor para o saldo e apaga o lançamento'}</small></span></button>`);
    openModal(t.name,`<div class="ledger-detail-v3"><div class="ledger-detail-hero"><span class="bills-v3-icon ${categoryColor(t.category)}">${icon(it.icon)}</span><div><span class="ledger-status spent">Gasto</span><strong class="num">− ${cash(t.amount)}</strong><p>${dateText(t.date)}</p></div></div><div class="ledger-detail-grid">${ledgerMeta('Categoria',t.category)}${ledgerMeta('Quem pagou',who)}${ledgerMeta('Registrado por',first(user(t.by||t.payer).name))}${ledgerMeta('Item',t.item||t.name)}</div>${Array.isArray(t.split)&&t.split.length>1?`<div class="ledger-split-detail">${t.split.map(x=>`<span>${avatar(x.id)}<b>${esc(first(user(x.id).name))}</b><strong class="num">${cash(x.amount)}</strong></span>`).join('')}</div>`:''}${t.contest?contestBlock(t.contest,'tx',t.id):''}<div class="ledger-actions">${actions.join('')}</div></div>`,'ledger-detail');
  }
  function editBillModal(id){
    const b=state.bills.find(x=>x.id===id);if(!b)return;
    openModal('Editar conta',`<form class="form ledger-edit-form" data-form="edit-bill" data-id="${b.id}">${field('edit-bill-name','Nome da conta','',b.name)}<div class="field-pair">${field('edit-bill-amount','Valor','0,00',moneyNumber(b.amount),true)}<div class="field"><label for="edit-bill-category">Categoria</label><select id="edit-bill-category" name="edit-bill-category">${optionCategories(b.category)}</select></div></div><div class="field"><label for="edit-bill-payer">Quem paga?</label><select id="edit-bill-payer" name="edit-bill-payer" data-split data-amount="${b.amount}">${optionPayers(b.payer)}</select></div><p class="split-preview" id="split-preview">${esc(splitPreview(b.amount,b.payer))}</p><div class="field"><label for="edit-bill-date">Vencimento</label><input id="edit-bill-date" name="edit-bill-date" type="date" value="${b.due}" required></div><label class="check-row"><input type="checkbox" name="edit-bill-recurring" ${b.recurring?'checked':''}><span>Repetir todo mês</span></label>${b.status==='paid'?'<div class="form-note warn">Como esta conta já foi paga, alterar valor ou divisão também recalcula o saldo do pagamento registrado.</div>':''}${formEnd('Salvar alterações')}</form>`,'ledger-edit');
  }
  function editTransactionModal(id){
    const t=state.transactions.find(x=>x.id===id);if(!t)return;
    openModal('Editar gasto',`<form class="form ledger-edit-form" data-form="edit-tx" data-id="${t.id}">${field('edit-tx-name','Nome do gasto','',t.name)}<div class="field-pair">${field('edit-tx-amount','Valor','0,00',moneyNumber(t.amount),true)}<div class="field"><label for="edit-tx-category">Categoria</label><select id="edit-tx-category" name="edit-tx-category">${optionCategories(t.category)}</select></div></div><div class="field"><label for="edit-tx-payer">Quem pagou?</label><select id="edit-tx-payer" name="edit-tx-payer" data-split data-amount="${t.amount}">${optionPayers(t.payer)}</select></div><p class="split-preview" id="split-preview">${esc(splitPreview(t.amount,t.payer))}</p><div class="field"><label for="edit-tx-date">Data</label><input id="edit-tx-date" name="edit-tx-date" type="date" value="${t.date}" max="${dateISO()}" required></div><div class="form-note">Se o valor ou quem pagou mudar, o Juntô estorna o lançamento antigo e aplica o novo sem duplicar saldo.</div>${formEnd('Salvar alterações')}</form>`,'ledger-edit');
  }
  function notificationsModal(){
    const list=state.notifications.filter(n=>n.to===active);
    state.notifications.forEach(n=>{if(n.to===active)n.read=true;});persist();
    openModal(`Chegou para ${first(user().name)}`,`<p class="modal-sub">Os avisos da dupla, sem perder nenhum combinado.</p><div class="notice-list">${list.length?list.map(n=>`<div class="notice-item"><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p><time>${timeText(n.createdAt)}</time>${n.requestId?`<button class="btn secondary" style="font-size:11px;min-height:35px;margin-top:12px" data-action="notice-request" data-id="${n.requestId}">Ver combinado</button>`:''}</div>`).join(''):`<div class="empty">${icon('bell')}<p>Tudo quietinho por aqui.<br>Os próximos avisos aparecem neste espaço.</p></div>`}</div>`,'notifications');
  }
  function settingsModal(){
    const src=state.settings?.couplePhoto||'',tone=profileTone(active),z=Number(state.settings?.profileZoom||1.08),y=Math.round(state.settings?.profileY||50),nativeApp=Boolean(window.Capacitor?.isNativePlatform?.()),pwaInstalled=nativeApp||Boolean(window.JuntoPWA?.isInstalled?.()),pwaUpdate=!nativeApp&&Boolean(window.JuntoPWA?.hasUpdate?.()),aiConfigured=Boolean(window.JuntoCloudConfig?.appUrl);
    const preview=`<div class="photo-preview ${tone}" style="--profile-zoom:${z.toFixed(2)};--profile-y:${y}%">${src?`<img src="${src}" alt="Prévia da foto do casal">`:`<div class="photo-preview-empty">${esc(coupleInitials())}</div>`}</div>`;
    const geminiCard=`<div class="ai-settings-card"><div class="ai-settings-head"><div><h3>Inteligência do Juntô</h3><p>As respostas usam saldo, gastos, contas, entradas, planos e o perfil que está falando.</p></div><span class="ai-status ${aiConfigured?'on':''}">${aiConfigured?'Disponível':'Indisponível'}</span></div><p class="ai-note">${aiConfigured?'A chave e o modelo ficam protegidos no servidor; o app envia somente o contexto necessário quando você pergunta.':'O backend de inteligência ainda não está configurado nesta publicação.'}</p></div>`;
    openModal(isSolo()?'Ajustes':'Ajustes do Juntô',`${window.JuntoFeatures?.settingsHTML?.()||''}${geminiCard}<div class="photo-settings-card"><div class="photo-settings-top">${preview}<div class="photo-settings-copy"><h3>Foto do casal</h3><p>${cloudSlot?'Esta foto identifica o espaço de vocês. Cada conta permanece sempre no próprio perfil.':'Esta é a foto usada na bolinha do topo. No modo local, tocar nela alterna os perfis.'}</p><div class="photo-settings-actions"><button class="btn secondary" data-action="pick-couple-photo">${src?'Trocar foto':'Adicionar foto'}</button>${src?'<button class="btn ghost" data-action="remove-couple-photo">Remover</button>':''}</div></div></div>${src?`<div class="photo-control"><div class="photo-control-head"><b>Zoom</b><span id="photo-zoom-value">${Math.round(z*100)}%</span></div><input id="profile-zoom" type="range" min="1" max="1.8" step="0.02" value="${z}"><div class="photo-control-head" style="margin-top:14px"><b>Posição vertical</b><span id="photo-y-value">${y}%</span></div><input id="profile-y" type="range" min="0" max="100" step="1" value="${y}"><div class="photo-settings-note">A prévia continua circular para você enxergar exatamente como ficará no topo.</div></div>`:''}</div><div class="settings-row mode-row"><div><h3>Modo do app <span class="badge ${isSolo()?'':'success'}">${isSolo()?'Individual':'Dupla'}</span></h3><p>${isSolo()?'Controle só seu. Conecte seu amor quando quiser, sem perder nada.':`${esc(first(user('a').name))} & ${esc(first(user('b').name))} no mesmo espaço financeiro.`}</p></div>${isSolo()?'<button class="btn primary" data-action="connect">Conectar meu amor</button>':''}</div><div class="settings-row"><div><h3>Quem somos nós</h3><p>${isSolo()?esc(user('a').name):`${esc(user('a').name)} & ${esc(user('b').name)}`}</p></div><button class="btn secondary" data-action="rename">Editar nomes</button></div><div class="settings-row"><div><h3>Saldos atuais</h3><p>“Quanto tu tem em conta?”</p></div><button class="btn secondary" data-action="balance" data-user="${active}">Atualizar o meu</button></div><div class="settings-row"><div><h3>Avisos do Juntô</h3><p>Confirmações rápidas ao registrar, combinar e atualizar.</p></div><button class="toggle ${noticesEnabled?'on':''}" data-action="toggle-notices" role="switch" aria-checked="${noticesEnabled}" aria-label="Ativar avisos do Juntô"></button></div><div class="settings-row"><div><h3>${nativeApp?'Aplicativo Android':pwaUpdate?'Atualização disponível':'Instalar o Juntô'}</h3><p>${nativeApp?'Você está usando o APK do Juntô.':pwaUpdate?'Há uma versão nova pronta. Você escolhe quando recarregar, sem interromper um formulário em uso.':pwaInstalled?'O Juntô já está instalado neste dispositivo.':'Abra o Juntô como aplicativo, com ícone próprio e suporte offline.'}</p></div><button class="btn secondary" data-action="${pwaUpdate?'pwa-update':'pwa'}" ${pwaInstalled&&!pwaUpdate?'disabled':''}>${pwaUpdate?'Atualizar agora':pwaInstalled?'Instalado':'Instalar'}</button></div>${state.demo?'<div class="settings-row"><div><h3>Reiniciar dados de exemplo</h3><p>Voltar ao casal Gui & Bia e aos valores fictícios.</p></div><button class="btn ghost" data-action="reset-confirm">Reiniciar exemplo</button></div>':''}<div class="settings-row backup-row"><div><h3>Backup manual</h3><p>Exporte uma cópia JSON ou restaure uma cópia anterior. Antes de restaurar, o Juntô guarda o estado atual neste aparelho.</p></div><div class="settings-row-actions"><button class="btn secondary" data-action="backup-export">Exportar</button><button class="btn secondary" data-action="backup-import">Restaurar</button></div></div><button class="btn secondary wide" style="margin-top:18px" data-action="about">Sobre esta versão</button>`,'settings');
  }
  function aboutModal(){
    openModal('Juntô · dinheiro organizado de verdade.',`<p class="modal-sub">Um app financeiro para usar sozinho ou a dois, com decisões claras e números rastreáveis.</p><div class="about-list">
      <div>${icon('trend')}<div><h3>Previsão que acompanha a vida real</h3><p>Entradas recorrentes, contas, recebimentos confirmados e ritmo de gastos alimentam a projeção do mês sem contar dinheiro antes da hora.</p></div></div>
      <div>${icon('sparkle')}<div><h3>Registro inteligente</h3><p>Entende frases como “internet 100 vence dia 15” e aprende categoria, valor habitual, pagador e recorrência com o seu histórico.</p></div></div>
      <div>${icon('wallet')}<div><h3>Contas completas</h3><p>Abra detalhes, edite, pague, reabra ou exclua com estorno coerente. Contas fixas mantêm a própria série mensal.</p></div></div>
      <div>${icon('heart')}<div><h3>${isSolo()?'Solo agora, a dois quando quiser':'Dois perfis, um mesmo espaço'}</h3><p>${isSolo()?'Seu histórico continua intacto quando você conectar outra pessoa.':'Cada pessoa entra na própria conta; pedidos, respostas e registros sincronizam no espaço da dupla.'}</p></div></div>
      <div>${icon('bell')}<div><h3>Bancos no Android</h3><p>O APK reconhece notificações somente dos bancos autorizados e transforma movimentos em sugestões. Nada entra nas finanças sem confirmação.</p></div></div>
      <div>${icon('scan')}<div><h3>Raio-X e IA contextual</h3><p>O Juntô usa os dados atuais para explicar onde o dinheiro pesa, simular cortes e responder perguntas sem inventar números ausentes.</p></div></div>
      <div>${icon('shield')}<div><h3>Dados sob seu controle</h3><p>Há backup, funcionamento offline e sincronização autenticada. O Juntô organiza registros; não movimenta dinheiro e não pede senha bancária.</p></div></div>
    </div><button class="btn primary wide" data-action="close">Fechar</button>`,'about');
  }
  function onboard(step=1){
    onboardStep=step;const dots=`<div class="step-dots" aria-label="Etapa ${step} de 3">${[1,2,3].map(n=>`<span class="${n<=step?'done':''}"></span>`).join('')}</div>`;
    let body=step===0?'':dots;
    if(step===0)body+=`<p class="modal-kicker">Como você quer começar?</p><h3 class="onboard-title">Seu dinheiro,<br><span>do seu jeito.</span></h3><div class="start-choice"><button class="start-option" data-action="onboard-solo"><span>${icon('wallet')}</span><span><b>Só eu, por enquanto</b><small>Controle financeiro individual completo: previsão, Raio-X, calendário, desafios e plano de guardar. Dá pra conectar seu amor depois, sem perder nada.</small></span></button><button class="start-option" data-action="onboard-couple"><span>${icon('heart')}</span><span><b>Eu e meu amor</b><small>Contas da dupla, “posso gastar?” um pro outro, meio a meio e planos juntos.</small></span></button></div><p class="fine-print" style="margin-top:14px">Cadastro simulado. Nenhum dado é enviado.</p>`;
    if(step===1)body+=`<p class="modal-kicker">É aqui que a dupla começa</p><h3 class="onboard-title">Duas pessoas.<br><span>Um mesmo time.</span></h3><p class="modal-sub" style="margin-top:0">Primeiro, como o Juntô pode chamar vocês?</p><form class="form" data-form="onboard-names">${field('your-name','Teu nome','Como prefere ser chamado',onboardDraft.a||'')}${field('their-name','Nome da tua pessoa','O outro lado da dupla',onboardDraft.b||'')}${formEnd('Bora juntar as contas')}<p class="fine-print">Cadastro simulado. Nenhum dado é enviado.</p></form>`;
    if(step===2)body+=`<p class="modal-kicker">Sem julgamento, só planejamento</p><h3 class="onboard-title">Quanto tu tem<br><span>em conta?</span></h3><p class="modal-sub" style="margin-top:0">Saldo atual dos dois. O Juntô soma e organiza.</p><form class="form" data-form="onboard-balances">${field('your-balance',`Saldo de ${esc(onboardDraft.a)}`,'0,00',onboardDraft.balanceA==null?'':moneyNumber(onboardDraft.balanceA),true)}${field('their-balance',`Saldo de ${esc(onboardDraft.b)}`,'0,00',onboardDraft.balanceB==null?'':moneyNumber(onboardDraft.balanceB),true)}${formEnd('Agora só falta conectar')}<button type="button" class="btn ghost wide" data-action="onboard-back">Voltar</button></form>`;
    if(step===3)body+=`<p class="modal-kicker">Chamando a tua pessoa</p><h3 class="onboard-title">Orçamento bom<br><span>é orçamento junto.</span></h3><p class="modal-sub" style="margin-top:0">No app final, ${esc(onboardDraft.b)} recebe teu convite e entra na mesma dupla.</p><div class="join-pair"><span class="avatar large">${esc(onboardDraft.a.slice(0,1).toUpperCase())}</span>${icon('link')}<span class="avatar b large">${esc(onboardDraft.b.slice(0,1).toUpperCase())}</span></div><div class="invite-code"><strong>JUNTO-2048</strong><p>Código ilustrativo do convite</p></div><div class="form-note" style="margin-bottom:20px">Aqui, o aceite é simulado. Ao começar, as contas e os pedidos de exemplo serão substituídos pela tua dupla.</div><button class="btn primary wide" data-action="onboard-finish">Simular aceite e começar</button><button class="btn ghost wide" style="margin-top:10px" data-action="onboard-back">Voltar</button>`;
    openModal(step===0?'Começar no Juntô':'Criar nossa dupla',body,'onboard');
  }
  const close=()=>{const d=$('#modal');if(d.open)d.close();d.dataset.kind='';d.classList.remove('peer-modal');const target=modalReturnFocus;modalReturnFocus=null;if(target?.isConnected)requestAnimationFrame(()=>target.focus({preventScroll:true}));};
  const error=(message)=>{const e=$('#form-error');if(e)e.textContent=message;};
  function amountValue(data,name,allowZero=false){const n=parseMoney(data.get(name));if(!Number.isFinite(n)||(allowZero?n<0:n<=0)){error(`Informe um valor ${allowZero?'válido, a partir de zero':'maior que zero'}. Ex.: 148,00.`);return null;}return n;}
  function titleValue(data,name,min=2,max=60){const t=String(data.get(name)||'').trim();if(t.length<min||t.length>max){error(`Escreva um nome entre ${min} e ${max} caracteres.`);return null;}return t;}
  function approve(id,actor){
    const r=state.requests.find(q=>q.id===id);if(!r||r.status!=='pending'||r.recipient!==actor)return;
    r.status='approved';r.response='Pode, amor! Combinado 💚';r.respondedAt=Date.now();
    notify(r.author,'Pode, amor! 💚',`${first(user(actor).name)} topou ${r.title}. ${money(r.amount)} ficaram reservados.`,'approved',r.id);
    state.notifications.forEach(n=>{if(n.to===actor&&n.requestId===r.id)n.read=true;});
    log(actor,`combinou ${r.title}. Valor reservado: ${money(r.amount)}.`);persist();
    toast('Combinado fechado. 💚',`${first(user(r.author).name)} já recebeu tua resposta.`);
  }
  function incomingSync(data){
    if(!validBackup(data)||JSON.stringify(data)===JSON.stringify(state))return;
    const oldIds=new Set(state.notifications.map(n=>n.id));state=migrate(data);
    if(!hasUser(active)){active=state.users[0]?.id||'a';try{sessionStorage.setItem(PROFILE,active);}catch{}}
    render();
    const newNotice=state.notifications.find(n=>n.to===active&&!oldIds.has(n.id));if(newNotice)toast(newNotice.title,newNotice.body,'bell');
  }
  window.addEventListener('storage',(event)=>{if(event.key===KEY&&event.newValue){try{incomingSync(JSON.parse(event.newValue));}catch{}}});
  if(channel)channel.onmessage=(event)=>incomingSync(event.data);
  document.addEventListener('click',async(event)=>{
    const el=event.target.closest('[data-action]');if(!el)return;event.preventDefault();
    const action=el.dataset.action,id=el.dataset.id,actor=el.dataset.actor||active;
    if(cloudSlot&&el.dataset.actor&&actor!==cloudSlot){toast('Use seu próprio perfil.','Os combinados da outra pessoa são respondidos na conta dela.');return;}
    if(action==='close')return close();
    if(cloudSlot&&['switch','profile-photo-switch','reset-solo','reset-couple','reset-confirm','onboard'].includes(action)){toast('Seu perfil está conectado.','Use sua própria conta para registrar movimentos. Exporte um backup antes de sair.');return;}
    if(action==='route'){route=el.dataset.route;render();const anchor=el.dataset.anchor;if(anchor)setTimeout(()=>document.getElementById(anchor)?.scrollIntoView({behavior:'smooth',block:'start'}),60);else window.scrollTo({top:0,behavior:'smooth'});return;}
    if(action==='topic-tab'){const kind=el.dataset.kind,v=el.dataset.value;if(kind==='analysis')analysisTab=v;if(kind==='future')futureTab=v;if(kind==='income')incomeTab=v;if(kind==='plan')planTab=v;render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(action==='analysis-person'){analysisPerson=el.dataset.person||'both';analysisTab='overview';render();return;}
    if(action==='analysis-cut'){futureTab='tips';route='future';render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(action==='switch'){active=el.dataset.user;try{sessionStorage.setItem(PROFILE,active);}catch{}render();return;}
    if(action==='profile-photo-switch'){active=other(active);try{sessionStorage.setItem(PROFILE,active);}catch{}render();return;}
    if(action==='pick-couple-photo'){document.getElementById('couple-photo-input')?.click();return;}
    if(action==='remove-couple-photo'){state.settings.couplePhoto='';state.settings.profileZoom=1.08;state.settings.profileY=50;persist();if($('#modal').open&&$('#modal').dataset.kind==='settings')settingsModal();toast('Foto removida.','','info');return;}
    if(action==='backup-export'){window.JuntoApp?.exportBackup?.();return;}
    if(action==='backup-import'){restoreDraft=null;document.getElementById('backup-import-input')?.click();return;}
    if(action==='hide'){hidden=!hidden;render();return;}
    if(action==='ask')return isSolo()?canSpendModal():askModal();
    if(action==='expense')return expenseModal('', 'spent');
    if(action==='bill-new')return expenseModal('',el.dataset.kind==='fixed'?'fixed':'bill');
    if(action==='quick-expense')return expenseModal(el.dataset.category||'','spent');
    if(action==='expense-category-pick'){const sel=$('#expense-category');if(!sel)return;sel.value=el.dataset.category||'Outros';sel.dataset.touched='1';const wrap=$('#expense-cat-wrap');if(wrap)wrap.hidden=false;smartRead('expense');updateBudgetNote();return;}
    if(action==='balance')return balanceModal(el.dataset.user||active);
    if(action==='new-goal')return newGoalModal();
    if(action==='goal-detail')return goalDetailModal(id);
    if(action==='edit-goal')return editGoalModal(id);
    if(action==='contribute')return contributeModal(id);
    if(action==='bill-filter'){billFilter=el.dataset.value;render();return;}
    if(action==='request-filter'){requestFilter=el.dataset.value;render();return;}
    if(action==='approve')return approve(id,actor);
    if(action==='decline')return declineModal(id,actor);
    if(action==='purchase')return purchaseModal(id,actor);
    if(action==='bill-detail')return billDetailModal(id);
    if(action==='tx-detail')return transactionDetailModal(id);
    if(action==='edit-bill')return editBillModal(id);
    if(action==='edit-tx')return editTransactionModal(id);
    if(action==='pay-bill')return payBillModal(id);
    if(action==='delete-tx'){const t=state.transactions.find(x=>x.id===id);if(!t)return;const neutral=t.balanceDelta===0;return openModal('Excluir este gasto?',`<p class="modal-sub"><b>${esc(t.name)}</b> · ${cash(t.amount)}. ${neutral?'Esse movimento foi importado sem ajuste de saldo, então excluir não vai mexer no saldo.':'O valor volta para o saldo de quem pagou.'} O lançamento sai do histórico.</p><form class="form" data-form="delete-tx" data-id="${id}">${formEnd(neutral?'Excluir lançamento':'Excluir e estornar')}</form>`,'remove');}
    if(action==='delete-bill'){const b=state.bills.find(x=>x.id===id);if(!b)return;return openModal('Excluir esta conta?',`<p class="modal-sub"><b>${esc(b.name)}</b> · ${cash(b.amount)}.${b.status==='paid'?' O pagamento será estornado de acordo com o ajuste de saldo usado no registro.':' Ela será removida do planejamento.'}${b.recurring?' Como é uma conta fixa, a repetição dos próximos meses também será encerrada.':''}</p><form class="form" data-form="delete-bill" data-id="${id}">${formEnd(b.recurring?'Excluir e parar repetição':'Excluir conta')}</form>`,'remove');}
    if(action==='reopen-bill'){const b=state.bills.find(x=>x.id===id);if(!b||b.status!=='paid')return;return openModal('Reabrir esta conta?',`<p class="modal-sub">O pagamento de <b>${esc(b.name)}</b> será desfeito, o valor voltará ao saldo e a conta aparecerá novamente em “A pagar”.</p><form class="form" data-form="reopen-bill" data-id="${id}">${formEnd('Reabrir conta')}</form>`,'remove');}
    if(action==='notifications')return notificationsModal();
    if(action==='settings')return settingsModal();
    if(action==='about')return aboutModal();
    if(action==='peer'){if(cloudSlot)return openModal('Juntô sincronizado',`<div class="peer-live-card">${avatar(other(),'large')}<div><h3>${esc(first(user(other()).name))} responde na própria conta</h3><p>Os pedidos, respostas e compras sincronizam entre os dois perfis. Você não responde no lugar da outra pessoa.</p></div></div>`,'peer-info');openModal(`Celular de ${first(user(other()).name)}`,peerHTML()+'<p class="peer-caption">Responda como a outra pessoa.<br>As duas telas são simuladas neste navegador.</p>','peer');return;}
    if(action==='onboard'){onboardDraft={};onboard(0);return;}
    if(action==='onboard-back')return onboard(Math.max(1,onboardStep-1));
    if(action==='onboard-finish'){
      if(!onboardDraft.a||!onboardDraft.b||onboardDraft.balanceA==null||onboardDraft.balanceB==null)return;
      state=seed();state.users=[{id:'a',name:onboardDraft.a,balance:onboardDraft.balanceA,tone:'blue'},{id:'b',name:onboardDraft.b,balance:onboardDraft.balanceB,tone:'pink'}];
      state.bills=[];state.goals=[];state.transactions=[];state.requests=[];state.activity=[];state.notifications=[];state.incomes=[];state.received=[];state.saves=[];state.plan=null;state.settings={variableEstimate:0,yieldRate:10,couplePhoto:'',profileZoom:1.08,profileY:50};state.demo=false;active='a';route='home';
      try{sessionStorage.setItem(PROFILE,active);}catch{}log(active,'criou a dupla. Primeiro passo: feito!');notify('b','Agora somos uma dupla. 💚',`${first(user('a').name)} conectou vocês nesta demonstração.`);close();persist();toast('Pronto. Essa dupla é de vocês.','Próximo passo: contar quando o dinheiro entra. É daí que sai a previsão.');route='incomes';render();return;
    }
    if(action==='rename')return openModal('Como vamos chamar a dupla?',`<form class="form" data-form="rename">${field('name-a','Nome da primeira pessoa','',user('a').name)}${isSolo()?'':field('name-b','Nome da segunda pessoa','',user('b').name)}${formEnd('Salvar nomes')}</form>`,'rename');
    if(action==='cancel-request'){
      const r=state.requests.find(r=>r.id===id);if(!r||r.author!==actor||!['pending','approved'].includes(r.status))return;
      openModal('Deixa essa vontade pra depois?',`<p class="modal-sub">O pedido <b>${esc(r.title)}</b> será cancelado.${r.status==='approved'?' O dinheiro reservado volta ao livre.':''}</p><form class="form" data-form="cancel-request" data-id="${id}" data-actor="${actor}">${formEnd('Sim, cancelar o pedido')}</form>`,'cancel');return;
    }
    if(action==='remove-bill'){
      const b=state.bills.find(b=>b.id===id);if(!b||b.status!=='open')return;
      return openModal('Essa conta não entra mais?',`<p class="modal-sub">Remover <b>${esc(b.name)}</b> libera ${cash(b.amount)} do planejamento. Isso não registra um pagamento.</p><form class="form" data-form="remove-bill" data-id="${id}">${formEnd('Remover esta conta')}</form>`,'remove');
    }
    if(action==='release-goal'){
      const g=state.goals.find(g=>g.id===id);if(!g)return;
      return openModal('Mudar de plano também é planejar.',`<p class="modal-sub">Encerrar <b>${esc(g.name)}</b> devolve ${cash(g.saved)} ao saldo livre. O dinheiro continua na conta.</p><form class="form" data-form="release-goal" data-id="${id}">${formEnd('Encerrar plano e liberar saldo')}</form>`,'release');
    }
    if(action==='notice-request'){close();route='requests';requestFilter='all';render();setTimeout(()=>document.getElementById('request-'+id)?.scrollIntoView({behavior:'smooth',block:'center'}),50);return;}
    if(action==='toggle-notices'){noticesEnabled=!noticesEnabled;try{localStorage.setItem('junto-notices-v1',noticesEnabled?'on':'off');}catch{}settingsModal();toast(noticesEnabled?'Avisos ligados.':'Avisos silenciosos.',noticesEnabled?'As confirmações rápidas voltam a aparecer.':'Seus registros continuam funcionando normalmente.','bell');return;}
    if(action==='test-push'){
      notify(other(),'Olha a dupla por aqui. 💚',`${first(user().name)} está testando como um aviso aparece no teu celular.`);persist();close();
      if(window.innerWidth<=1060)openModal(`Celular de ${first(user(other()).name)}`,peerHTML()+'<p class="peer-caption">Prévia visual do aviso.<br>Notificações reais com o app fechado vêm na próxima etapa.</p>','peer');
      else toast('Prévia enviada para o outro celular.','Web push real será ativado na versão conectada.','bell');return;
    }
    if(action==='pwa'){
      if(window.Capacitor?.isNativePlatform?.())return toast('Juntô já instalado.','Você está usando o aplicativo Android.','phone');
      const result=await window.JuntoPWA?.install?.();
      if(result?.installed||result?.outcome==='accepted'){settingsModal();toast('Juntô instalado.','Agora ele pode abrir direto pela tela inicial.','circleCheck');return;}
      const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),text=ios?'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.':'Se o navegador não mostrar o botão de instalação, abra o menu do navegador e escolha “Instalar app” ou “Adicionar à tela inicial”.';
      return openModal('Instalar o Juntô',`<p class="modal-sub">${text}</p><div class="form-note">Depois de instalado, o Juntô continua funcionando com a mesma conta e mantém recursos offline.</div><button class="btn primary wide" data-action="close">Entendi</button>`,'pwa');
    }
    if(action==='pwa-update'){if(window.JuntoPWA?.applyUpdate?.()){toast('Atualizando Juntô…','A nova versão vai abrir em instantes.','refresh');return;}return toast('Nenhuma atualização pendente.','','info');}
    if(action==='income-new')return incomeModal();
    if(action==='income-edit')return incomeModal(id);
    if(action==='income-arrived')return arrivalModal(id,el.dataset.date);
    if(action==='income-skip'){const inc=state.incomes.find(i=>i.id===id);if(!inc||handled(id,el.dataset.date))return;state.received.push({id:uid(),incomeId:id,date:el.dataset.date,amount:0,status:'skipped',at:Date.now()});log(active,`marcou que ${inc.name.toLowerCase()} de ${first(user(inc.person).name)} não entrou em ${dayMonth(el.dataset.date)}.`);close();persist();toast('Anotado. A previsão foi ajustada.','Essa entrada saiu da conta do mês.','info');return;}
    if(action==='income-remove'){const inc=state.incomes.find(i=>i.id===id);if(!inc)return;return openModal('Tirar essa entrada da previsão?',`<p class="modal-sub"><b>${esc(inc.name)}</b> de ${esc(first(user(inc.person).name))} deixa de entrar na previsão. O que já entrou continua no saldo.</p><form class="form" data-form="remove-income" data-id="${id}">${formEnd('Remover entrada')}</form>`,'remove');}
    if(action==='plan-pick')return planModal(el.dataset.key);
    if(action==='connect')return connectModal();
    if(action==='connect-setup'){if(window.JuntoCloud){close();window.JuntoCloud.open();return;}return connectSetupModal();}
    if(action==='can-spend')return canSpendModal();
    if(action==='can-buy'){if(!canDraft)return;const {title,amount,cat,touched}=canDraft;learnFrom(title,cat,touched);const ch=charge(amount,'a');if(ch.error){toast('Não deu pra registrar.',ch.error,'info');return;}const itf=itemFields(title,cat),nm=smartName(title);state.transactions.push({id:uid(),name:nm,amount,category:cat,payer:'a',date:dateISO(),...itf,by:'a',createdAt:Date.now()});log('a',`comprou ${nm} (${money(amount)}) depois de conferir no “Posso gastar?”.`);canDraft=null;close();persist();toast('Registrado.',`${nm} · ${money(amount)}`,'circleCheck');return;}
    if(action==='can-wait'){const t=canDraft;canDraft=null;close();if(t){log('a',`decidiu esperar: ${smartName(t.title)} (${money(t.amount)}).`);persist();}toast('Boa escolha.','Dinheiro que fica é dinheiro que guarda.','sparkle');return;}
    if(action==='onboard-solo')return openModal('Começar no modo individual',`<p class="modal-kicker">Só você, por enquanto</p><h3 class="onboard-title">Primeiro passo:<br><span>o seu número.</span></h3><form class="form" data-form="onboard-solo">${field('solo-name','Seu nome','Como prefere ser chamado')}${field('solo-balance','Quanto você tem em conta hoje?','0,00','',true)}${formEnd('Começar meu controle')}<button type="button" class="btn ghost wide" style="margin-top:10px" data-action="onboard">Voltar</button></form>`,'onboard');
    if(action==='onboard-couple'){onboard(1);return;}
    if(action==='reset-solo'||action==='reset-couple'){state=migrate(action==='reset-solo'?seedSolo():seed());active='a';route='home';billFilter='all';requestFilter='all';hidden=false;cutPerson=null;try{sessionStorage.setItem(PROFILE,'a');}catch{}close();persist();toast(action==='reset-solo'?'Exemplo individual carregado.':'Gui & Bia voltaram.','Tudo pronto pra testar.');return;}
    if(action==='ch-open'){route='goals';planTab='challenges';render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(action==='ch-accept'){const o=challengeSuggestions().find(x=>x.key===el.dataset.key);if(!o)return;state.challenges=state.challenges||[];const c={id:uid(),key:o.key,type:o.type,person:o.person,item:o.item,category:o.category,icon:o.icon,days:o.days,daily:Math.round(o.daily),cap:o.cap,target:o.target,title:o.title,start:dateISO(),status:'active',createdAt:Date.now(),cheers:[]};state.challenges.push(c);log(active,`topou o desafio “${c.title}”${c.person!=='both'&&c.person!==active?` para ${first(user(c.person).name)}`:''}.`);notify(other(),'Desafio aceito 💪',`${first(user().name)} topou “${c.title}”. Vale ${money(Math.round(o.value))}. Bora torcer?`);const y=window.scrollY;persist();window.scrollTo(0,y);toast('Desafio aceito.','O Juntô acompanha pelos gastos registrados, dia a dia.','flameOn');return;}
    if(action==='ch-cheer'){const c=(state.challenges||[]).find(x=>x.id===id);if(!c)return;c.cheers=c.cheers||[];c.cheers.push({by:active,at:Date.now()});notify(c.person==='both'?other():c.person,'Tem torcida pra você 💚',`${first(user().name)} está torcendo no desafio “${c.title}”.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast('Torcida enviada 💚','');return;}
    if(action==='ch-claim'){const c=(state.challenges||[]).find(x=>x.id===id);if(!c)return;const st=challengeStatus(c);let amount=Math.round(st.saved/100)*100;if(amount>free())amount=Math.max(0,Math.floor(free()/100)*100);let g=state.goals.find(x=>x.id===state.plan?.goalId)||state.goals[0];if(!g){g={id:uid(),name:isSolo()?'Meu cofre':'Cofre da dupla',target:Math.max(amount*10,100000),saved:0,icon:'shield'};state.goals.push(g);}if(amount>0){g.saved+=amount;state.saves.push({id:uid(),goalId:g.id,amount,date:dateISO(),actor:active,source:'challenge'});}c.status='done';c.result={phase:st.phase,saved:Math.round(st.saved),claimed:amount};log(active,`fechou o desafio “${c.title}” e mandou ${money(amount)} pra ${g.name}.`);notify(other(),'Desafio concluído 🏆',`“${c.title}”: ${money(amount)} foram pra ${g.name}.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast(amount?'Direto pro cofre. 🏆':'Desafio fechado.',amount?`${money(amount)} protegidos em ${g.name}.`:'O livre do mês não cobria o valor agora.','trophy');return;}
    if(action==='ch-retry'){const c=(state.challenges||[]).find(x=>x.id===id);if(!c)return;const st=challengeStatus(c);c.status='closed';c.result={phase:st.phase,saved:Math.round(st.saved),claimed:0};const up=st.phase==='won'&&c.type==='no-item'&&c.days<21?c.days+7:c.days;const n={...c,id:uid(),days:up,title:c.type==='no-item'?`${up} dias sem ${c.item.toLowerCase()}`:c.title,start:dateISO(),status:'active',createdAt:Date.now(),cheers:[],result:undefined};state.challenges.push(n);log(active,`começou “${n.title}”.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast(up>c.days?'Próximo nível.':'Começando de novo.',n.title,'flameOn');return;}
    if(action==='ch-close'||action==='ch-abandon'){const c=(state.challenges||[]).find(x=>x.id===id);if(!c)return;const st=challengeStatus(c);c.status='closed';c.result={phase:action==='ch-abandon'?'abandoned':st.phase,saved:Math.round(st.saved),claimed:0};if(action==='ch-abandon')log(active,`desistiu do desafio “${c.title}”.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast(action==='ch-abandon'?'Desafio encerrado.':'Desafio fechado.',action==='ch-abandon'?'Quando quiserem, tem outro esperando.':'','info');return;}
    if(action==='cal-month'){calOffset=Math.max(-6,Math.min(2,calOffset+Number(el.dataset.delta||0)));calSel=null;const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='cal-day'){calSel=el.dataset.date;const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='chat-open')return openChat();
    if(action==='chat-close')return closeChat();
    if(action==='chat-clear'){chatBusy?.abort();chatLog=[];chatTurns=[];saveChat();renderChat();$('#chat-input')?.focus();return;}
    if(action==='chat-ask')return sendChat(el.dataset.q);
    if(action==='chat-stop'){chatBusy?.abort();return;}
    if(action==='chat-retry'){const m=[...chatLog].reverse().find(x=>x.retry);if(!m)return;chatLog=chatLog.filter(x=>x!==m);const ui=chatLog.map(x=>x.kind).lastIndexOf('user');if(ui>-1)chatLog.splice(ui,1);if(chatTurns.length&&chatTurns[chatTurns.length-1].role==='user')chatTurns.pop();return sendChat(m.retryQ);}
    if(action==='chat-card-ok')return confirmCard(id);
    if(action==='chat-card-cancel'){const c=chatLog.find(x=>x.id===id);if(c&&c.status==='pending'){c.status='cancelled';chatTurns.push({role:'user',content:'[Cancelei a ação sugerida.]'});renderChat();saveChat();}return;}
    if(action==='cat-change'){const w=$('#'+el.dataset.prefix+'-cat-wrap');if(w){w.hidden=!w.hidden;if(!w.hidden)w.querySelector('select')?.focus();}return;}
    if(action==='contest')return contestModal(el.dataset.kind,id);
    if(action==='contest-reply')return contestTextModal(el.dataset.kind,id,'reply');
    if(action==='contest-resolve')return contestTextModal(el.dataset.kind,id,'resolve');
    if(action==='contest-withdraw'){const t=findTarget(el.dataset.kind,id);if(!t||!t.contest||t.contest.by!==active)return;delete t.contest;log(active,`retirou a contestação de ${t.name}.`);persist();toast('Contestação retirada.','O gasto continua registrado.','info');return;}
    if(action==='contest-view'){route='bills';billFilter='contested';render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(action==='cut-person'){cutPerson=el.dataset.value;const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='cut-level'){const k=cutPerson+'|'+el.dataset.key;if(el.dataset.level==='keep')delete cutSel[k];else cutSel[k]=el.dataset.level;const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='cut-suggest'){cutPerson=cutPerson||active;itemStats(cutPerson).forEach(o=>{const k=cutPerson+'|'+o.key;if(o.sug==='keep')delete cutSel[k];else cutSel[k]=o.sug;});const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='cut-commit'){const {chosen}=cutTotals();if(!chosen.length)return;state.commitments=state.commitments||[];let n=0;chosen.forEach(o=>{if(state.commitments.some(c=>c.active&&c.person===cutPerson&&c.item===o.item))return;state.commitments.push({id:uid(),person:cutPerson,item:o.item,level:levelOf(o),baseline:Math.round(o.monthly),since:dateISO(),active:true});n++;});const who=cutPerson==='both'?'A dupla':first(user(cutPerson).name);log(active,`assumiu cortes: ${chosen.map(o=>o.item.toLowerCase()+(levelOf(o)==='half'?' pela metade':'')).join(', ')}.`);notify(other(),'Compromisso de corte 💪',`${who} vai ${chosen.map(o=>(levelOf(o)==='half'?'reduzir ':'cortar ')+o.item.toLowerCase()).join(', ')}.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast(n?'Compromisso assumido.':'Esses cortes já estavam valendo.','O Juntô acompanha e avisa no Radar se passar do combinado.','cut');return;}
    if(action==='cut-to-plan'){const {monthly}=cutTotals();if(!monthly)return;if(state.plan){const add=Math.round(monthly/1000)*1000;state.plan.monthly+=add;log(active,`somou ${money(add)} dos cortes ao plano de guardar.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast('Plano maior.',`Agora são ${money(state.plan.monthly)} por mês.`,'coins');return;}return planModal('cortes');}
    if(action==='commit-end'){const c=(state.commitments||[]).find(c=>c.id===id);if(!c)return;c.active=false;const st=commitStatus(c);log(active,`encerrou o compromisso com ${c.item.toLowerCase()}: ${money(st.saved)} economizados.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast('Compromisso encerrado.',`${money(st.saved)} ficaram no bolso enquanto durou.`,'check');return;}
    if(action==='plan-from-budgets')return planModal('metas');
    if(action==='plan-auto'){if(!state.plan)return;state.plan.auto=state.plan.auto===false;log(active,`${state.plan.auto?'ligou':'desligou'} o piloto automático do plano.`);persist();toast(state.plan.auto?'Piloto automático ligado.':'Piloto automático desligado.',state.plan.auto?'Entradas automáticas já caem guardando a parte do plano.':'O Juntô pergunta antes de guardar.','coins');return;}
    if(action==='month-pick'){pickedMonth=el.dataset.ym;const y=window.scrollY;render();window.scrollTo(0,y);return;}
    if(action==='budget-reset'){const c=el.dataset.cat;delete state.budgets[c];openCats.add(c);log(active,`voltou a meta de ${c.toLowerCase()} pra sugestão do Juntô.`);const y=window.scrollY;persist();window.scrollTo(0,y);return;}
    if(action==='plan-change'){planPicker=!planPicker;render();setTimeout(()=>document.getElementById('plano')?.scrollIntoView({behavior:'smooth',block:'start'}),40);return;}
    if(action==='plan-off'){if(!state.plan)return;const n=state.plan.name;state.plan=null;planPicker=false;log(active,`pausou o plano ${n} de guardar primeiro.`);persist();toast('Plano pausado.','O que já foi guardado continua protegido.','info');return;}
    if(action==='reset-confirm')return openModal('Recomeçar a demonstração',`<p class="modal-sub">Escolha qual exemplo carregar. Os dados atuais desta demonstração serão substituídos.</p><div class="start-choice"><button class="start-option" data-action="reset-solo"><span>${icon('wallet')}</span><span><b>Exemplo individual</b><small>Gui sozinho, antes de conectar alguém: seis meses de gastos, salário e um valor semanal.</small></span></button><button class="start-option" data-action="reset-couple"><span>${icon('heart')}</span><span><b>Exemplo em dupla</b><small>Gui & Bia com contas divididas, pedidos e contestação.</small></span></button></div>`,'reset');
  });
  function updateRequestCat(){const el=$('#request-cat');if(!el)return;const r=categoryImpact($('#request-category').value,parseMoney($('#request-amount').value||''));if(!r){el.hidden=true;return;}el.hidden=false;el.className='form-note '+r.cls;el.innerHTML=r.html;}
  function updateImpact(){
    const el=$('#request-impact');if(!el)return;const amount=parseMoney($('#request-amount').value);
    if(!Number.isFinite(amount)||amount<=0){el.className='form-note';el.innerHTML=`<strong>Antes de mandar, olha o impacto.</strong>Hoje vocês têm ${cash(free())} livres.`;soloize(el);return;}
    const after=free()-amount;el.className='form-note '+(after<0?'bad':after<20000?'warn':'');
    el.innerHTML=after<0?`<strong>Vale conversar antes. O pedido passa do livre.</strong>Faltariam ${cash(-after)} para cobrir esse pedido sem mexer em contas e planos.`:`<strong>${after<20000?'Cabe, mas o mês fica apertadinho.':'Cabe no livre da dupla. 💚'}</strong>Depois desse pedido, ficam ${cash(after)} livres. Contas e planos continuam separados.`;soloize(el);
  }
  function updateSplit(){const el=$('#split-preview'),sel=document.querySelector('select[data-split]');if(!el||!sel)return;const form=sel.closest('form'),moneyInput=form?.querySelector('.money-input input');let amt=moneyInput?parseMoney(moneyInput.value||''):NaN;if(!Number.isFinite(amt)&&sel.dataset.amount)amt=Number(sel.dataset.amount);el.textContent=['half','prop'].includes(sel.value)||Number.isFinite(amt)&&amt>0?splitPreview(amt,sel.value):'';}
  function syncExpenseKind(type){const label=$('#expense-date-label'),note=$('#expense-note'),submit=document.querySelector('[data-form="expense"] button[type="submit"]');if(label)label.textContent=type==='spent'?'Data do gasto':'Vencimento';if(note)note.textContent=type==='spent'?'O valor sai do saldo agora e entra no histórico.':type==='fixed'?'A conta entra no planejamento e se repete todo mês. O saldo só muda quando o pagamento for confirmado.':'A conta entra no planejamento. O saldo só muda quando o pagamento for confirmado.';if(submit)submit.lastChild.textContent=type==='spent'?'Registrar gasto':type==='fixed'?'Adicionar conta fixa':'Adicionar conta';}
  document.addEventListener('input',(event)=>{if(event.target.id==='profile-zoom'||event.target.id==='profile-y'){const z=Number($('#profile-zoom')?.value||state.settings.profileZoom||1.08),y=Number($('#profile-y')?.value||state.settings.profileY||50);const p=document.querySelector('.photo-preview');if(p){p.style.setProperty('--profile-zoom',z);p.style.setProperty('--profile-y',y+'%');}if($('#photo-zoom-value'))$('#photo-zoom-value').textContent=Math.round(z*100)+'%';if($('#photo-y-value'))$('#photo-y-value').textContent=Math.round(y)+'%';return;}if(event.target.id==='chat-input'){const t=event.target;t.style.height='auto';t.style.height=Math.min(130,t.scrollHeight)+'px';return;}
    if(event.target.dataset?.card){const c=chatLog.find(x=>x.id===event.target.dataset.card);if(c&&event.target.dataset.field==='amount'){const v=parseMoney(event.target.value);c.data.amount=Number.isFinite(v)&&v>0?v:null;}return;}if(event.target.id==='request-amount')updateImpact();if(event.target.id==='expense-amount'){event.target.dataset.touched=event.target.value?'1':'';updateSplit();updateBudgetNote();}if(event.target.id==='expense-title'){smartRead('expense');updateSplit();updateBudgetNote();}if(event.target.id==='request-title'){smartRead('request');updateImpact();updateRequestCat();}if(event.target.id==='request-amount'){event.target.dataset.touched=event.target.value?'1':'';updateRequestCat();}if(event.target.id==='edit-tx-amount'||event.target.id==='edit-bill-amount')updateSplit();
    if(event.target.dataset?.budget){const c=event.target.dataset.budget,v=Number(event.target.value),f=Number(event.target.dataset.f),o=document.getElementById('out-'+c),n=document.getElementById('note-'+c);if(o)o.textContent=brl(v);if(n){const s=Math.max(0,f-v);n.textContent=s>0?`Guarda ${brl(s)} por mês (${pct(s/f)}), ${brl(s*12)} por ano.`:v>f?`Meta acima do previsto: folga de ${brl(v-f)} por mês.`:'Meta no nível do previsto: não guarda nada aqui.';}return;}if(event.target.closest?.('[data-form="income"]'))updateIncomePreview();
    if(event.target.id==='sim-cut'||event.target.id==='sim-extra'){simCut=Number($('#sim-cut').value);simExtra=Number($('#sim-extra').value);$('#sim-cut-out').textContent=simCut+'%';$('#sim-extra-out').textContent=brl(simExtra*100);$('#sim-out').innerHTML=simOut();return;}if($('#form-error'))$('#form-error').textContent='';});
  document.addEventListener('change',async(event)=>{
    if(event.target.id==='couple-photo-input'){const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){toast('A foto é muito pesada.','Escolha uma imagem de até 5 MB.','info');event.target.value='';return;}const reader=new FileReader();reader.onload=async()=>{state.settings.couplePhoto=await compressProfilePhoto(String(reader.result||''));state.settings.profileZoom=1.08;state.settings.profileY=50;persist();if($('#modal').open&&$('#modal').dataset.kind==='settings')settingsModal();event.target.value='';};reader.readAsDataURL(file);return;}
    if(event.target.id==='backup-import-input'){
      const file=event.target.files?.[0];event.target.value='';if(!file)return;
      if(file.size>10*1024*1024){toast('Backup grande demais.','Escolha um arquivo JSON de até 10 MB.','info');return;}
      try{
        const raw=await file.text(),parsed=JSON.parse(raw);
        if(!validBackup(parsed))throw new Error('O arquivo não tem uma estrutura válida do Juntô.');
        const next=migrate(structuredClone(parsed)),currentIds=state.users.map(u=>u.id).sort().join(','),nextIds=next.users.map(u=>u.id).sort().join(',');
        if(cloudSlot&&currentIds!==nextIds)throw new Error('Em um espaço sincronizado, o backup precisa ter os mesmos perfis da dupla.');
        if(cloudSlot&&next.demo)throw new Error('Dados de demonstração não podem substituir um espaço sincronizado.');
        restoreDraft=next;
        openModal('Restaurar este backup?',`<p class="modal-sub">Esta cópia tem <b>${next.transactions.length}</b> gastos, <b>${next.bills.length}</b> contas, <b>${next.goals.length}</b> planos e ${next.users.length===1?'modo individual':'modo a dois'}.</p><div class="form-note warn"><strong>Antes de substituir os dados, o estado atual será guardado neste aparelho.</strong>${cloudSlot?' Como este espaço está sincronizado, a restauração será enviada para a nuvem depois da confirmação.':''}</div><form class="form" data-form="restore-backup">${formEnd('Restaurar backup')}</form><button type="button" class="btn ghost wide" data-action="close">Cancelar</button>`,'restore-backup');
      }catch(e){restoreDraft=null;toast('Não foi possível restaurar.',e.message||'Confira se este é um backup válido do Juntô.','info');}
      return;
    }
    if(event.target.id==='profile-zoom'||event.target.id==='profile-y'){state.settings.profileZoom=Number($('#profile-zoom')?.value||1.08);state.settings.profileY=Number($('#profile-y')?.value||50);persist();if($('#modal').open&&$('#modal').dataset.kind==='settings')settingsModal();return;}
    if(event.target.id==='chat-deep'){chatDeep=event.target.checked;return;}
    if(event.target.dataset?.card){const c=chatLog.find(x=>x.id===event.target.dataset.card);if(c&&event.target.dataset.field==='payer')c.data.payer=event.target.value;if(c&&event.target.dataset.field==='category'){c.data.category=event.target.value;c.data.catTouched=true;if(!c.data.known)c.data.icon=categoryIcon(c.data.category);}renderChat();saveChat();return;}
    if(event.target.matches?.('select[data-split]')){event.target.dataset.touched='1';updateSplit();updateBudgetNote();}
    if(event.target.id==='expense-date')event.target.dataset.touched='1';
    if(event.target.id==='yield-rate'){state.settings.yieldRate=Math.min(30,Math.max(0,Number(String(event.target.value).replace(',','.'))||0));const y=window.scrollY;persist();window.scrollTo(0,y);return;}
    if(event.target.id==='expense-category'||event.target.id==='request-category'){event.target.dataset.touched='1';const h=$('#'+(event.target.id==='expense-category'?'expense-cat-hint':'request-cat-hint'));if(h)h.textContent='';smartRead(event.target.id==='expense-category'?'expense':'request');updateBudgetNote();updateRequestCat();}
    if(event.target.name==='expense-type'){const form=event.target.closest('form');if(form)form.dataset.typeTouched='1';syncExpenseKind(event.target.value);setTimeout(updateBudgetNote,0);}
    if(event.target.dataset?.budget){const c=event.target.dataset.budget,v=Number(event.target.value);state.budgets[c]=v;openCats.add(c);log(active,`definiu a meta de ${c.toLowerCase()} em ${money(v)} por mês.`);const y=window.scrollY;persist();window.scrollTo(0,y);toast('Meta salva.',`${c}: ${money(v)} por mês. Previsão e plano recalculados.`,'scan');return;}if(event.target.closest?.('[data-form="income"]'))updateIncomePreview();

  });
  document.addEventListener('toggle',(event)=>{const d=event.target;if(d.matches?.('details.cat')){if(d.open)openCats.add(d.dataset.cat);else openCats.delete(d.dataset.cat);}},true);
  function refreshScheduledState(){
    if(!window.JuntoApp?.hasAccess?.())return;
    const recurringChanged=rollRecurring(),auto=processAuto();
    if(recurringChanged||auto.n)persist();
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshScheduledState();});
  window.addEventListener('focus',refreshScheduledState);
  function chartTip(event){
    const r=event.target.closest?.('rect.hit');document.querySelectorAll('.ch-tip:not([hidden])').forEach(t=>{if(!r||t.id!==r.dataset.chart+'t'){t.hidden=true;document.getElementById(t.id.slice(0,-1)+'g')?.setAttribute('visibility','hidden');}});
    if(!r)return;const id=r.dataset.chart,p=chartStore[id]?.[r.dataset.i];if(!p)return;const tip=document.getElementById(id+'t'),g=document.getElementById(id+'g'),svg=r.ownerSVGElement;if(!tip||!svg)return;
    const x=Number(r.getAttribute('x'))+Number(r.getAttribute('width'))/2;g?.setAttribute('x1',x);g?.setAttribute('x2',x);g?.setAttribute('visibility','visible');
    tip.innerHTML=`<b>${esc(dateLong(p.date))}</b><span>Fora dos planos: ${cashR(p.free)}</span>${p.inc?`<span class="in">+ ${cashR(p.inc)} de entrada</span>`:''}${p.bill?`<span class="out">− ${cashR(p.bill)} em contas</span>`:''}${p.save>=100?`<span class="sv">${cashR(p.save)} vão pro cofre</span>`:''}`;tip.hidden=false;
    const sr=svg.getBoundingClientRect(),wr=tip.parentElement.getBoundingClientRect(),left=sr.left-wr.left+x*sr.width/svg.viewBox.baseVal.width,half=tip.offsetWidth/2;tip.style.left=Math.max(half,Math.min(wr.width-half,left))+'px';
  }
  document.addEventListener('pointermove',chartTip);document.addEventListener('pointerdown',chartTip);
  document.addEventListener('keydown',(event)=>{if(event.target.id==='chat-input'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();sendChat();return;}if(event.key==='Escape'&&chatOpen&&!$('#modal').open){closeChat();return;}if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('[role=button][data-action]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  document.addEventListener('submit',(event)=>{
    const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();error('');
    const d=new FormData(form),type=form.dataset.form,id=form.dataset.id,actor=form.dataset.actor||active;
    if(type==='chat'){sendChat();return;}
    if(type==='ask'){
      const title=titleValue(d,'request-title'),amount=amountValue(d,'request-amount');if(title==null||amount==null)return;
      learnFrom(title,d.get('request-category'),$('#request-category')?.dataset.touched==='1');const r={id:uid(),title:smartName(title),amount,category:d.get('request-category'),...itemFields(title,d.get('request-category')),note:String(d.get('request-note')||'').trim(),suggestedPayer:['a','b','half','prop'].includes(d.get('request-payer'))?d.get('request-payer'):'half',author:active,recipient:other(),status:'pending',createdAt:Date.now()};state.requests.push(r);
      notify(r.recipient,'Amor, posso gastar?',`${first(user().name)} quer combinar ${title} por ${money(amount)}.`,'request',r.id);log(active,`pediu um combinado: ${title} por ${money(amount)}.`);close();route='requests';requestFilter='all';persist();toast('Pedido entregue. Agora é com teu amor.',`Responda no celular de ${first(user(other()).name)} ou troque de perfil.`,'chat');return;
    }
    if(type==='expense'){
      const title=titleValue(d,'expense-title'),amount=amountValue(d,'expense-amount'),payer=isSolo()?'a':d.get('expense-payer'),kind=d.get('expense-type'),date=d.get('expense-date'),category=d.get('expense-category');
      if(title==null||amount==null)return;learnFrom(title,category,$('#expense-category')?.dataset.touched==='1');const itf=itemFields(title,category),nm=smartName(title);if(!['a','b','half','prop'].includes(payer)||!/^\d{4}-\d{2}-\d{2}$/.test(date)){error('Confira quem paga e a data do lançamento.');return;}
      const now=Date.now();
      if(kind==='spent'){
        const duplicate=state.transactions.find(t=>!t.billId&&now-(t.createdAt||0)<90000&&t.amount===amount&&t.date===date&&t.payer===payer&&norm(t.name)===norm(nm));
        if(duplicate){error('Esse gasto parece já ter sido registrado agora. Abra o lançamento existente para editar, em vez de duplicar.');return;}
        const c=charge(amount,payer);if(c.error){error(c.error);return;}
        state.transactions.push({id:uid(),name:nm,amount,category,payer,date,...itf,by:active,createdAt:now,...(c.shares.length>1?{split:c.shares}:{})});log(active,`registrou ${nm}: ${money(amount)}, ${c.shares.length>1?payerLabel(payer).toLowerCase():'na conta de '+first(user(payer).name)}.`);
      }else{
        const duplicate=state.bills.find(b=>b.status==='open'&&b.amount===amount&&b.due===date&&b.payer===payer&&norm(b.name)===norm(nm));
        if(duplicate){error('Essa conta parece já ter sido adicionada agora. Abra a existente para editar, em vez de duplicar.');return;}
        const billId=uid();state.bills.push({id:billId,name:nm,amount,category,payer,due:date,item:itf.item,icon:itf.icon,recurring:kind==='fixed',...(kind==='fixed'?{recurringKey:billId}:{}),status:'open',createdAt:now});log(active,`adicionou ${kind==='fixed'?'uma conta fixa':'uma conta a pagar'}: ${title}.`);
      }
      notify(other(),'Conta atualizada.',`${first(user().name)} registrou ${title} por ${money(amount)}.`);close();route='bills';billFilter=kind==='spent'?'month':kind==='fixed'?'fixed':'open';persist();toast(kind==='spent'?'Gasto anotado. Sem mistério.':'Conta no radar.',`${title} · ${money(amount)}`);return;
    }
    if(type==='edit-tx'){
      const t=state.transactions.find(x=>x.id===id);if(!t)return;const name=titleValue(d,'edit-tx-name',1,60),amount=amountValue(d,'edit-tx-amount'),category=d.get('edit-tx-category'),payer=d.get('edit-tx-payer'),date=d.get('edit-tx-date');
      if(name==null||amount==null||!categories.includes(category)||!['a','b','half','prop'].includes(payer)||!/^\d{4}-\d{2}-\d{2}$/.test(date)){error('Confira os dados do gasto.');return;}
      const moved=reallocateTransaction(t,amount,payer);if(moved.error){error(moved.error);return;}const itf=itemFields(name,category);
      Object.assign(t,{name:smartName(name),amount,category,payer,date,...itf,split:moved.shares.length>1?moved.shares:undefined});if(moved.shares.length<2)delete t.split;if(Number.isSafeInteger(t.balanceDelta))t.balanceDelta=t.balanceDelta===0?0:-amount;learnFrom(name,category,true);
      log(active,`editou o gasto ${t.name}: ${money(amount)}.`);close();persist();toast('Gasto atualizado.',`${t.name} · ${money(amount)}`);return;
    }
    if(type==='edit-bill'){
      const b=state.bills.find(x=>x.id===id);if(!b)return;const name=titleValue(d,'edit-bill-name',1,60),amount=amountValue(d,'edit-bill-amount'),category=d.get('edit-bill-category'),payer=d.get('edit-bill-payer'),due=d.get('edit-bill-date'),recurring=d.get('edit-bill-recurring')==='on';
      if(name==null||amount==null||!categories.includes(category)||!['a','b','half','prop'].includes(payer)||!/^\d{4}-\d{2}-\d{2}$/.test(due)){error('Confira os dados da conta.');return;}
      const paidTx=state.transactions.find(t=>t.billId===b.id);let shares=null;if(b.status==='paid'&&paidTx){const moved=reallocateTransaction(paidTx,amount,payer);if(moved.error){error(moved.error);return;}shares=moved.shares;}
      const wasRecurring=Boolean(b.recurring),series=wasRecurring?recurringKey(b):null,itf=itemFields(name,category),newName=smartName(name);
      if(wasRecurring&&!recurring)state.bills.forEach(x=>{if(x.recurring&&recurringKey(x)===series)x.recurring=false;});
      Object.assign(b,{name:newName,amount,category,payer,due,recurring,item:itf.item,icon:itf.icon});if(recurring&&!b.recurringKey)b.recurringKey=b.id;
      if(paidTx){Object.assign(paidTx,{name:newName,amount,category,payer,item:itf.item,icon:itf.icon,...(b.recurringKey?{recurringKey:b.recurringKey}:{}),split:shares&&shares.length>1?shares:undefined});if(!shares||shares.length<2)delete paidTx.split;if(Number.isSafeInteger(paidTx.balanceDelta))paidTx.balanceDelta=paidTx.balanceDelta===0?0:-amount;}
      learnFrom(name,category,true);log(active,`editou a conta ${b.name}: ${money(amount)}.`);close();persist();toast('Conta atualizada.',`${b.name} · ${money(amount)}`);return;
    }
    if(type==='delete-tx'){
      const t=state.transactions.find(x=>x.id===id);if(!t)return;refundTransaction(t);
      if(t.requestId){const r=state.requests.find(x=>x.id===t.requestId);if(r&&r.status==='purchased'){r.status='approved';delete r.payer;delete r.purchasedAt;}}
      if(t.billId){const b=state.bills.find(x=>x.id===t.billId);if(b){b.status='open';delete b.paidAt;}}
      state.transactions=state.transactions.filter(x=>x.id!==id);const neutral=t.balanceDelta===0;log(active,neutral?`excluiu o gasto ${t.name}, sem alterar o saldo.`:`excluiu o gasto ${t.name} e estornou ${money(t.amount)}.`);close();persist();toast('Gasto excluído.',neutral?'O saldo permaneceu igual.':'O valor voltou para o saldo.');return;
    }
    if(type==='reopen-bill'){
      const b=state.bills.find(x=>x.id===id);if(!b||b.status!=='paid')return;const t=state.transactions.find(x=>x.billId===b.id);if(t){refundTransaction(t);state.transactions=state.transactions.filter(x=>x.id!==t.id);}b.status='open';delete b.paidAt;log(active,`reabriu a conta ${b.name}.`);close();billFilter='open';persist();toast('Conta reaberta.','O pagamento foi estornado e a conta voltou para “A pagar”.');return;
    }
    if(type==='delete-bill'){
      const b=state.bills.find(x=>x.id===id);if(!b)return;const related=state.transactions.filter(x=>x.billId===b.id),wasRecurring=Boolean(b.recurring),key=recurringKey(b);
      related.forEach(refundTransaction);state.transactions=state.transactions.filter(x=>x.billId!==b.id);
      if(wasRecurring)state.bills.forEach(x=>{if(x.recurring&&recurringKey(x)===key)x.recurring=false;});
      state.bills=state.bills.filter(x=>x.id!==b.id);log(active,`excluiu a conta ${b.name}${related.length?' e estornou o pagamento':''}${wasRecurring?'; repetição encerrada':''}.`);close();persist();toast('Conta excluída.',wasRecurring?'A repetição também foi encerrada.':related.length?'O pagamento também foi estornado.':'Ela saiu do planejamento.');return;
    }
    if(type==='balance'){
      const amount=amountValue(d,'balance-amount',true),who=form.dataset.user;if(amount==null||!hasUser(who))return;
      user(who).balance=amount;log(who,`atualizou o saldo atual para ${money(amount)}.`);notify(other(who),'O saldo da dupla mudou.',`${first(user(who).name)} atualizou o saldo atual.`);close();persist();toast('Saldo atualizado.','O livre do mês também foi recalculado.');return;
    }
    if(type==='edit-goal'){
      const g=state.goals.find(x=>x.id===id),name=titleValue(d,'edit-goal-title',2,60),target=amountValue(d,'edit-goal-target'),iconName=String(d.get('edit-goal-icon')||'shield'),allowed=new Set(['plane','house','shield','gift']);
      if(!g||name==null||target==null)return;
      g.name=name;g.target=target;g.icon=allowed.has(iconName)?iconName:'shield';
      log(active,`editou o plano ${name}: meta de ${money(target)}.`);close();persist();toast('Plano atualizado.',`${name} · meta de ${money(target)}.`,'heart');return;
    }
    if(type==='contribute'){
      const amount=amountValue(d,'contribute-amount'),g=state.goals.find(g=>g.id===id);if(amount==null||!g)return;
      if(amount>free()){error(`Vocês têm ${money(Math.max(0,free()))} livres. Escolha um valor que preserve as contas e os outros planos.`);return;}
      g.saved+=amount;state.saves.push({id:uid(),goalId:g.id,amount,date:dateISO(),actor:active,source:'manual'});log(active,`separou ${money(amount)} para ${g.name}.`);notify(other(),'Nosso sonho andou mais um pouco. 💚',`${first(user().name)} separou ${money(amount)} para ${g.name}.`);close();persist();toast('O sonho tá mais perto.',`${money(amount)} protegidos para ${g.name}.`);return;
    }
    if(type==='decline'){
      const r=state.requests.find(r=>r.id===id),note=String(d.get('decline-note')||'').trim();if(!r||r.status!=='pending'||r.recipient!==actor)return;
      if(!note){error('Manda uma resposta com carinho.');return;}r.status='declined';r.response=note;r.respondedAt=Date.now();
      state.notifications.forEach(n=>{if(n.to===actor&&n.requestId===id)n.read=true;});notify(r.author,'Hoje não, amor. 💚',`${first(user(actor).name)} respondeu ao pedido ${r.title}: ${note}`,'declined',id);log(actor,`deixou ${r.title} para depois, com uma resposta.`);close();persist();toast('Resposta entregue com carinho.','O pedido não descontou dinheiro.','chat');return;
    }
    if(type==='purchase'){
      const r=state.requests.find(r=>r.id===id),payer=d.get('purchase-payer');if(!r||r.status!=='approved'||r.author!==actor||!['a','b','half','prop'].includes(payer))return;
      const c=charge(r.amount,payer);if(c.error){error(c.error);return;}
      r.status='purchased';r.payer=payer;r.purchasedAt=Date.now();state.transactions.push({id:uid(),requestId:r.id,name:r.title,item:r.item,icon:r.icon,by:actor,amount:r.amount,category:r.category,payer,date:dateISO(),createdAt:Date.now(),...(c.shares.length>1?{split:c.shares}:{})});log(actor,`comprou ${r.title} por ${money(r.amount)}. Combinado cumprido.`);notify(r.recipient,'Combinado virou compra.',`${first(user(actor).name)} registrou ${r.title}. O saldo foi atualizado.`,'purchased',id);close();persist();toast('Comprou e registrou. Tudo certo.','O valor saiu da conta uma única vez.');return;
    }
    if(type==='pay-bill'){
      const b=state.bills.find(b=>b.id===id),payer=d.get('bill-payer');if(!b||b.status!=='open'||!['a','b','half','prop'].includes(payer))return;
      const c=charge(b.amount,payer);if(c.error){error(c.error);return;}
      b.status='paid';b.paidAt=Date.now();b.payer=payer;state.transactions.push({id:uid(),billId:b.id,...(b.recurringKey?{recurringKey:b.recurringKey}:{}),name:b.name,by:active,amount:b.amount,category:b.category,payer,date:dateISO(),createdAt:Date.now(),...(c.shares.length>1?{split:c.shares}:{})});log(active,c.shares.length>1?`confirmou ${b.name} pago ${payerLabel(payer).toLowerCase()}: ${c.shares.map(x=>first(user(x.id).name)+' '+money(x.amount)).join(', ')}.`:`confirmou ${b.name} pago por ${first(user(payer).name)}: ${money(b.amount)}.`);notify(other(),'Um boleto a menos. 🙌',`${first(user().name)} marcou ${b.name} como pago.`);close();billFilter='paid';persist();toast('Conta paga. Respira.','O pagamento ficou em “Pagas” e o saldo foi atualizado.');return;
    }
    if(type==='cancel-request'){
      const r=state.requests.find(r=>r.id===id);if(!r||r.author!==actor||!['pending','approved'].includes(r.status))return;r.status='cancelled';log(actor,`cancelou o pedido ${r.title}.`);notify(r.recipient,'Planos mudam. Tudo bem.',`${first(user(actor).name)} cancelou o pedido ${r.title}.`,'cancelled',id);close();persist();toast('Pedido cancelado.','Se havia dinheiro reservado, ele voltou ao livre.');return;
    }
    if(type==='remove-bill'){
      const b=state.bills.find(b=>b.id===id);if(!b||b.status!=='open')return;state.bills=state.bills.filter(q=>q.id!==id);log(active,`removeu ${b.name} das contas a pagar.`);close();persist();toast('Conta retirada do planejamento.');return;
    }
    if(type==='release-goal'){
      const g=state.goals.find(g=>g.id===id);if(!g)return;const paused=state.plan?.goalId===g.id;if(paused)state.plan=null;state.goals=state.goals.filter(q=>q.id!==id);log(active,`encerrou o plano ${g.name} e liberou ${money(g.saved)}${paused?'; piloto automático pausado':''}.`);notify(other(),'A dupla mudou de plano.',`${first(user().name)} encerrou ${g.name}. O dinheiro separado voltou ao livre.`);close();persist();toast('Plano encerrado. Dinheiro liberado.',paused?'O piloto automático também foi pausado para não guardar em um plano inexistente.':'','heart');return;
    }
    if(type==='rename'){
      const a=titleValue(d,'name-a',1,24),b=isSolo()?'':titleValue(d,'name-b',1,24);if(a==null||b==null)return;state.users[0].name=a;if(!isSolo())state.users[1].name=b;close();persist();toast('A dupla ganhou os nomes de vocês.');return;
    }
    if(type==='onboard-names'){
      const a=titleValue(d,'your-name',1,24),b=titleValue(d,'their-name',1,24);if(a==null||b==null)return;onboardDraft.a=a;onboardDraft.b=b;onboard(2);return;
    }
    if(type==='onboard-balances'){
      const a=amountValue(d,'your-balance',true),b=amountValue(d,'their-balance',true);if(a==null||b==null)return;onboardDraft.balanceA=a;onboardDraft.balanceB=b;onboard(3);return;
    }
    if(type==='contest'){const t=findTarget(form.dataset.kind,id);if(!t)return;const note=String(d.get('contest-note')||'').trim();if(note.length<3){error('Escreva um comentário curto explicando.');return;}t.contest={id:uid(),by:active,reason:String(d.get('contest-reason')||'Outro motivo'),note,status:'open',at:Date.now(),thread:[]};log(active,`contestou ${t.name} (${money(t.amount)}): ${note}`);notify(other(),'Gasto contestado',`${first(user().name)} contestou ${t.name} (${money(t.amount)}): ${note}`);close();route='bills';billFilter='contested';persist();toast('Contestação registrada.',`${first(user(other()).name)} já recebeu o aviso e pode responder.`,'flag');return;}
    if(type==='contest-reply'){const t=findTarget(form.dataset.kind,id);if(!t||!t.contest)return;const text=String(d.get('contest-text')||'').trim();if(text.length<2){error('Escreva a resposta.');return;}t.contest.thread=t.contest.thread||[];t.contest.thread.push({by:active,text,at:Date.now()});log(active,`respondeu à contestação de ${t.name}.`);notify(other(),'Resposta sobre o gasto',`${first(user().name)} sobre ${t.name}: ${text}`);close();persist();toast('Resposta enviada.','','reply');return;}
    if(type==='contest-resolve'){const t=findTarget(form.dataset.kind,id);if(!t||!t.contest)return;const text=String(d.get('contest-text')||'').trim();t.contest.status='resolved';t.contest.resolvedBy=active;t.contest.resolvedAt=Date.now();if(text)t.contest.resolution=text;log(active,`marcou a contestação de ${t.name} como conversada${text?`: ${text}`:''}.`);notify(other(),'Contestação conversada 💚',`${first(user().name)} marcou ${t.name} como conversado${text?`. Combinado: ${text}`:''}.`);close();persist();toast('Conversado e registrado.','O combinado fica no histórico do gasto.','check');return;}
    if(type==='connect'){const name=titleValue(d,'partner-name',1,24);if(name==null)return;const raw=String(d.get('partner-balance')||'').trim();let bal=0;if(raw){bal=parseMoney(raw);if(!Number.isFinite(bal)||bal<0){error('Confira o saldo. Ex.: 1.250,00');return;}}
      state.users.push({id:'b',name,balance:bal,tone:'pink'});const ym=dateISO().slice(0,7);if(d.get('split-fixed')==='on')state.bills.forEach(b=>{if(b.recurring&&['Casa','Assinaturas'].includes(b.category)&&(b.status==='open'||b.due.slice(0,7)>=ym))b.payer='half';});
      log('a',`conectou ${name}. Agora é dupla! 💚`);notify('b','Bem-vindo(a) à dupla 💚',`${first(user('a').name)} te conectou no Juntô. Tudo o que já estava registrado continua aqui.`);close();route='home';persist();toast('Agora vocês são dupla. 💚',`Próximo passo: configurar quando o dinheiro de ${first(name)} entra, em Entradas.`,'heart');return;}
    if(type==='can-spend'){const title=titleValue(d,'request-title',2,60),amount=amountValue(d,'request-amount');if(title==null||amount==null)return;const cat=d.get('request-category')||'Outros';canDraft={title,amount,cat,touched:$('#request-category')?.dataset.touched==='1'};const box=$('#can-verdict');box.innerHTML=canSpendVerdict(title,amount,cat);soloize(box);box.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
    if(type==='onboard-solo'){const name=titleValue(d,'solo-name',1,24),bal=amountValue(d,'solo-balance',true);if(name==null||bal==null)return;state=migrate(seedSolo());state.users=[{id:'a',name,balance:bal,tone:'blue'}];state.bills=[];state.goals=[];state.transactions=[];state.requests=[];state.activity=[];state.notifications=[];state.incomes=[];state.received=[];state.saves=[];state.plan=null;state.challenges=[];state.commitments=[];state.budgets={};state.learned={};state.settings={variableEstimate:0,yieldRate:10,couplePhoto:'',profileZoom:1.08,profileY:50};state.demo=false;active='a';cutPerson=null;try{sessionStorage.setItem(PROFILE,'a');}catch{}log('a','começou no modo individual. Primeiro passo: feito!');close();route='incomes';persist();toast('Pronto. Seu controle começa agora.','Próximo passo: contar quando o seu dinheiro entra. É daí que sai a previsão.');return;}
    if(type==='plan'){
      const o=planOptionByKey(form.dataset.key),monthly=amountValue(d,'plan-amount');if(!o||monthly==null)return;let goalId=d.get('plan-goal');
      if(goalId==='__new'||!state.goals.find(g=>g.id===goalId)){const g={id:uid(),name:isSolo()?'Meu cofre':'Cofre da dupla',target:Math.max(monthly*12,100000),saved:0,icon:'shield'};state.goals.push(g);goalId=g.id;}
      state.plan={key:o.key,name:o.name,monthly,goalId,cut:o.pct,auto:d.get('plan-auto')==='on',startedAt:Date.now()};planPicker=false;log(active,`ativou o plano ${o.name}: guardar ${money(monthly)} por mês, primeiro.`);notify(other(),'Agora a gente guarda primeiro. 💚',`${first(user().name)} ativou o plano ${o.name}: ${money(monthly)} por mês, separados no dia em que o dinheiro cai.`);close();route='goals';planTab='plan';persist();window.scrollTo({top:0,behavior:'smooth'});toast('Plano ativo. Dinheiro entrou, parte sai pro cofre.',`${money(monthly)} por mês.`,'coins');return;
    }
    if(type==='goal'){
      const name=titleValue(d,'goal-title',2,60),target=amountValue(d,'goal-target');if(name==null||target==null)return;
      const requestedIcon=String(d.get('goal-icon')||'shield'),allowedIcons=new Set(['plane','house','shield','gift']),goalIcon=allowedIcons.has(requestedIcon)?requestedIcon:'shield';
      const goal={id:uid(),name,target,saved:0,icon:goalIcon};state.goals.push(goal);
      log(active,`criou o objetivo “${name}” com meta de ${money(target)}.`);
      notify(other(),'Novo objetivo no Juntô 💚',`${first(user().name)} criou “${name}”, com meta de ${money(target)}.`);
      close();route='goals';planTab='goals';persist();window.scrollTo({top:0,behavior:'smooth'});toast('Objetivo criado.',`${name} · meta de ${money(target)}.`,'heart');return;
    }
    if(type==='arrival'){
      const inc=state.incomes.find(i=>i.id===id),date=form.dataset.date;if(!inc||handled(id,date))return;const amount=amountValue(d,'arrival-amount');if(amount==null)return;
      let save=0,g=null;if(d.has('arrival-save')){save=amountValue(d,'arrival-save',true);if(save==null)return;if(save>amount){error('Não dá pra guardar mais do que entrou.');return;}g=state.goals.find(x=>x.id===d.get('arrival-goal'));if(save&&!g){error('Escolha um plano pra guardar.');return;}}
      user(inc.person).balance+=amount;state.received.push({id:uid(),incomeId:id,person:inc.person,date,amount,status:'received',at:Date.now(),balanceDelta:amount});
      if(save){g.saved+=save;state.saves.push({id:uid(),goalId:g.id,amount:save,date:dateISO(),actor:inc.person,source:'income'});}
      log(inc.person,`recebeu ${inc.name.toLowerCase()} (${money(amount)})${save?` e guardou ${money(save)} primeiro, em ${g.name}`:''}.`);notify(other(inc.person),save?'Entrou e já foi guardado. 💚':'Dinheiro na conta.',`${first(user(inc.person).name)} confirmou ${inc.name.toLowerCase()}: ${money(amount)}${save?`. ${money(save)} foram direto pra ${g.name}`:''}.`);close();persist();toast(save?'Entrou e já guardou primeiro.':'Entrada confirmada.',save?`${money(save)} protegidos em ${g.name}. O resto é pra viver.`:`${money(amount)} somados ao saldo de ${first(user(inc.person).name)}.`,'coins');return;
    }
    if(type==='income'){
      const v=readIncomeForm(form);if(v.name.length<2||v.name.length>40){error('Dê um nome com 2 a 40 caracteres.');return;}if(!Number.isFinite(v.amount)||v.amount<=0){error('Informe um valor maior que zero. Ex.: 3.200,00.');return;}if(!hasUser(v.person)){error('Escolha de quem é a entrada.');return;}
      const data={name:v.name,person:v.person,amount:v.amount,rule:v.rule,nth:v.nth,countSat:v.countSat,weekday:v.weekday,day:v.day,auto:v.auto};
      if(id){const inc=state.incomes.find(i=>i.id===id);if(!inc)return;Object.assign(inc,data);log(active,`ajustou a entrada ${v.name}: ${ruleText(inc).toLowerCase()}.`);}
      else{const inc={id:uid(),...data,since:dateISO()};state.incomes.push(inc);log(active,`configurou ${v.name.toLowerCase()} de ${first(user(v.person).name)}: ${ruleText(inc).toLowerCase()}.`);}
      close();route='incomes';persist();toast(id?'Entrada ajustada.':'Entrada na previsão.','O futuro do mês já foi recalculado.','trend');return;
    }
    if(type==='remove-income'){const inc=state.incomes.find(i=>i.id===id);if(!inc)return;state.incomes=state.incomes.filter(i=>i.id!==id);log(active,`tirou ${inc.name.toLowerCase()} da previsão.`);close();persist();toast('Entrada removida da previsão.');return;}
    if(type==='estimate'){const v=amountValue(d,'estimate-amount',true);if(v==null)return;state.settings.variableEstimate=v;persist();toast('Estimativa salva.',v?'Ela pesa menos conforme os gastos reais entram.':'A previsão usa só os gastos registrados.','trend');return;}
    if(type==='restore-backup'){
      if(!restoreDraft||!validBackup(restoreDraft)){error('O backup não está mais disponível. Selecione o arquivo novamente.');return;}
      try{localStorage.setItem('junto-before-restore-v1',JSON.stringify(state));}catch{error('Não foi possível criar a cópia de segurança antes da restauração. Exporte o estado atual e tente novamente.');return;}
      state=migrate(structuredClone(restoreDraft));restoreDraft=null;
      active=cloudSlot&&hasUser(cloudSlot)?cloudSlot:(hasUser(active)?active:state.users[0]?.id||'a');
      route='home';billFilter='all';requestFilter='all';analysisTab='overview';futureTab='forecast';incomeTab='overview';planTab='goals';
      try{sessionStorage.setItem(PROFILE,active);}catch{}
      close();persist();toast('Backup restaurado.','Os dados foram validados e o estado anterior ficou guardado neste aparelho.','check');return;
    }
    if(type==='reset'){state=seed();active='a';route='home';billFilter='all';requestFilter='all';hidden=false;try{sessionStorage.setItem(PROFILE,active);}catch{}close();persist();toast('Gui & Bia voltaram.','Tudo pronto para testar de novo.');return;}
  });
  $('#modal').addEventListener('click',(event)=>{if(event.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  document.querySelectorAll('[data-brand]').forEach(el=>el.innerHTML=brand());
  /* JUNTO_APP_API */
  document.body.insertAdjacentHTML('beforeend',chatShell());
  let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(['home','future'].includes(route)&&!$('#modal').open)render();},180);});
  render();
})();
