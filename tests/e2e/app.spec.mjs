import {test,expect} from '@playwright/test';
import {mockCloud,testConfig} from './auth-fixture.mjs';
test.beforeEach(async({page},testInfo)=>{if(!testInfo.title.startsWith('two independent accounts'))await mockCloud(page,{authenticated:true});});
import {execFileSync} from 'node:child_process';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
const event=(id='1',method='pix',direction='expense')=>({id:id.repeat(64),amount:2500,method,direction,timestamp:Date.now(),bank:'Banco de teste',packageName:'com.nu.production',preview:'Pix enviado de R$ 25,00. Aviso privado do banco.'});
async function fakeNative(page,inbox){await page.addInitScript(inbox=>{
  window.__nativeEvents={};window.__bankInbox=inbox;window.__bankAck=[];window.__bankSettings=[];window.androidBridge={};
  const banks=[
    {name:'Nubank',packageName:'com.nu.production',installed:true},
    {name:'Itaú',packageName:'com.itau',installed:true},
    {name:'PicPay',packageName:'com.picpay',installed:true},
    {name:'InfinitePay',packageName:'io.cloudwalk.infinitepaydash',installed:true},
    {name:'Wise',packageName:'com.transferwise.android',installed:false},
    {name:'BTG Pactual',packageName:'com.btg.pactual.digital.mobile',installed:false},
    {name:'Google Wallet',packageName:'com.google.android.apps.walletnfcrel',installed:true}
  ];
  const bank={getStatus:async()=>({enabled:true,accessGranted:true,promptsGranted:true,packages:['com.nu.production']}),getPending:async()=>({events:window.__bankInbox}),getLaunchEvent:async()=>({id:null}),listBanks:async()=>({banks}),addListener:async(name,callback)=>{window.__nativeEvents[name]=callback;return{remove(){}};},acknowledge:async({id})=>{window.__bankAck.push(id);window.__bankInbox=window.__bankInbox.filter(x=>x.id!==id);},exportFile:async fields=>{window.__exportedBackup=fields;return{saved:true};},requestPrompts:async()=>({}),openNotificationSettings:async()=>({}),setEnabled:async fields=>{window.__bankSettings.push(fields);return{};}};
  const app={addListener:async(name,callback)=>{window.__nativeEvents[name]=callback;return{remove(){}};},getLaunchUrl:async()=>({}),exitApp:async()=>{window.__exited=true;}};
  const plugins={BankNotifications:bank,App:app,SystemBars:{setStyle:async()=>({})},SplashScreen:{hide:async()=>({})}};
  const capacitor={};Object.defineProperty(capacitor,'registerPlugin',{get:()=>name=>plugins[name],set:()=>{}});window.Capacitor=capacitor;
},inbox);}
async function personal(page,balance=10000){await expect(page.locator('#authenticated-app')).toBeVisible();await page.evaluate(balance=>{const s=window.JuntoApp.freshState('Guilherme');s.users[0].balance=balance;window.JuntoApp.applyState(s);},balance);}

test('individual tips protect the bus and basic food while the shared history remains contestable',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState(),date=new Date().toISOString().slice(0,10);s.users.push({id:'b',name:'Bia',balance:80000,tone:'pink'});s.settings.personalBudget={a:{fare:550,trips:2}};s.incomes=[{id:'vt',name:'Vale transporte',person:'a',purpose:'transport',benefitDaily:1860,amount:9300,rule:'weekly',weekday:2,since:date}];s.transactions=[
  {id:'uber-a',name:'Uber',item:'Corrida de app',amount:4000,payer:'a',by:'a',category:'Outros',expenseContext:'work',date},
  {id:'food-a',name:'Almoço',amount:2500,payer:'a',by:'a',category:'Alimentação',date},
  {id:'cig-a',name:'2 cigarros',item:'Cigarro',amount:600,payer:'a',by:'a',category:'Hábitos',date},
  {id:'lanche-a',name:'Lanche da tarde',item:'Lanche',amount:1200,payer:'a',by:'a',category:'Alimentação',date},
  {id:'choc-b',name:'Chocolate da Bia',amount:10000,payer:'b',by:'b',category:'Lanches',date},
  {id:'uber-b',name:'Uber trabalho Bia',amount:5000,payer:'b',by:'b',category:'Transporte',date}
 ];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="cuts"]').click();
 const tips=page.locator('.tip-list');await expect(tips).toContainText('R$ 11,00');await expect(tips).toContainText('R$ 18,60');await expect(tips.locator('.tip').filter({hasText:'Seu Uber'})).toContainText('R$ 29,00');await expect(tips).toContainText('Cigarro');await expect(tips).toContainText('lanchinhos');await expect(tips).not.toContainText('Bia');await expect(tips).not.toContainText('Chocolate');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/individual-tips.png'});
 await page.locator('#mobile-nav [data-route="ledger"]').click();await expect(page.locator('#ledger-days')).toContainText('Chocolate da Bia');await expect(page.locator('#ledger-days')).toContainText('Uber');
 await page.locator('#ledger-days [data-id="choc-b"]').click();await expect(page.locator('#modal [data-action="edit-tx"]')).toHaveCount(0);await page.locator('#modal [data-action="contest"]').click();await page.locator('#contest-note').fill('Vamos reduzir os lanches?');await page.locator('[data-form="contest"] [type="submit"]').click();
 expect(await page.evaluate(()=>window.JuntoApp.getState().transactions.find(t=>t.id==='choc-b').contest.by)).toBe('a');expect(await page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([100000,80000]);
 await page.locator('.j-seg [data-value="history"]').click();await page.locator('[data-action="tx-detail"][data-id="uber-a"]').click();await page.locator('#modal [data-action="edit-tx"]').click();await page.locator('#edit-tx-context').selectOption('necessary');await page.locator('[data-form="edit-tx"] [type="submit"]').click();
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="cuts"]').click();await expect(page.locator('.tip-list')).not.toContainText('Seu Uber');expect(await page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([100000,80000]);
});

test('a debt paid during onboarding does not repeat every day in the month forecast',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState(),today=new Date(),iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,yesterday=new Date(today);yesterday.setDate(today.getDate()-1);
 s.incomes=[{id:'salary',name:'Salário',person:'a',amount:244100,rule:'business',nth:5,countSat:true,since:iso(today),variable:true}];
 s.transactions=[{id:'debt-payment',name:'Pagamento de dívida',amount:80000,payer:'a',category:'Outros',date:iso(yesterday)},{id:'bus',name:'Ônibus',amount:1200,payer:'a',category:'Transporte',date:iso(today)}];window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="forecast"]').click();await expect(page.locator('.future-v3-card')).toContainText('Pagamentos avulsos não se repetem');
 await expect(page.locator('.future-v3-card .j-big')).not.toHaveClass(/neg/);await expect(page.locator('[data-action="personal-budget"]')).toBeVisible();
});

test('raio-x inicial abre na primeira vez, monta entradas, contas e metas e não duplica ao refazer',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('junto-test-setup-keep','1'));
 await page.goto('/');await personal(page,150000);
 await page.evaluate(()=>{localStorage.removeItem('junto-setup-offered-a');});await page.reload();await expect(page.locator('#authenticated-app')).toBeVisible();
 await expect(page.locator('.j-setup')).toBeVisible();
 const next=()=>page.locator('.j-setup [data-action="setup-next"]:not([data-skip])').click();
 await next();
 for(const k of ['salary','daily','vt'])await page.locator(`.j-setup-card:has(input[value="${k}"])`).click();
 await next();
 await next();await expect(page.locator('#form-error')).toContainText('salário');
 await page.locator('[name="amount"]').fill('3.000,00');await next();
 await page.locator('[name="amount"]').fill('100');await next();
 await page.locator('[name="amount"]').fill('200');await page.locator('[name="fare"]').fill('6,00');await next();
 await page.locator('.j-setup-row[data-key="rent"] .j-setup-toggle').click();await page.locator('[name="amount-rent"]').fill('1.000');await next();
 await page.locator('[name="ess-food"]').fill('500');await next();
 await page.locator('.j-setup-row[data-key="delivery"] .j-setup-toggle').click();await page.locator('[name="impamount-delivery"]').fill('300');await next();
 await next();
 await page.locator('[name="name"]').fill('Viagem');await page.locator('[name="target"]').fill('2.400');await next();
 await expect(page.locator('.j-setup-sum')).toContainText('Sobra no mês');
 await next();await expect(page.locator('#modal')).not.toBeVisible();
 let s=await page.evaluate(()=>window.JuntoApp.getState());
 expect(s.incomes.map(i=>i.name).sort()).toEqual(['Ganhos da semana','Salário','Vale transporte']);
 expect(s.incomes.find(i=>i.name==='Ganhos da semana').amount).toBe(50000);
 expect(s.bills.filter(b=>b.name==='Aluguel'&&b.recurring)).toHaveLength(1);
 expect(s.users[0].balance).toBe(150000);
 const caps=s.settings.personalBudgets?.a||s.budgets;expect(caps.Alimentação).toBe(50000);expect(caps.Delivery).toBe(15000);
 expect(s.settings.personalBudget.a.fare).toBe(600);expect(s.goals.map(g=>g.name)).toContain('Viagem');
 await expect(page.locator('.j-setup-cta')).toHaveCount(0);
 // Refazer: muda o salário, não duplica nada.
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-setup-redo').click();
 await next();await next();await page.locator('[name="amount"]').fill('3.500,00');
 for(let i=0;i<12&&await page.locator('.j-setup-sum').count()===0;i++)await next();
 await next();await expect(page.locator('#modal')).not.toBeVisible();
 s=await page.evaluate(()=>window.JuntoApp.getState());
 expect(s.incomes.filter(i=>i.name==='Salário')).toHaveLength(1);expect(s.incomes.find(i=>i.name==='Salário').amount).toBe(350000);
 expect(s.bills.filter(b=>b.name==='Aluguel')).toHaveLength(1);expect(s.goals.filter(g=>g.name==='Viagem')).toHaveLength(1);
});

test('meu orçamento aceita vírgula e %, explica data antiga e mostra o que ficou salvo',async({page})=>{
 await page.goto('/');await personal(page,200000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'sal',name:'Salário',person:'a',amount:300000,rule:'business',nth:5,countSat:true,since:'2026-01-01'}];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="forecast"]').click();
 await page.locator('[data-action="personal-budget"]').first().click();
 await page.locator('#budget-fare').fill('6');await page.locator('#budget-principal').fill('1.500,00');await page.locator('#budget-rate').fill('2,5%');await page.locator('#budget-minimum').fill('');
 await page.locator('#budget-since').fill('2024-05-10');await page.locator('[data-form="personal-budget"] [type="submit"]').click();
 await expect(page.locator('#form-error')).toContainText('passa de 1 ano');
 const today=await page.evaluate(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
 await page.locator('#budget-since').fill(today);await page.locator('[data-form="personal-budget"] [type="submit"]').click();
 await expect(page.locator('#modal')).not.toBeVisible();
 expect(await page.evaluate(()=>window.JuntoApp.getState().settings.personalBudget.a)).toMatchObject({fare:600,trips:2,debtPrincipal:150000,debtRate:2.5,debtMinimum:0,debtSince:today});
 await expect(page.locator('.personal-budget-saved')).toContainText('2 × R$ 6,00');await expect(page.locator('.personal-budget-saved')).toContainText('2,5% ao mês');
});

test('personal budget import preserves cash and receipts, applies weekly benefits and is idempotent',async({page})=>{
 await page.goto('/');await personal(page,300000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'existing',name:'Salário',person:'a',amount:150000,rule:'business',nth:5,countSat:true,since:'2026-01-01'}];window.JuntoApp.applyState(s);});
 const date=await page.evaluate(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
 const profile={type:'junto-budget-profile',schemaVersion:1,sources:[{name:'Salário',amount:244100,rule:'business',nth:5,purpose:'general',variable:true},{name:'Vale alimentação',amount:17440,rule:'weekly',weekday:2,purpose:'food',variable:true,benefitDaily:3488},{name:'Vale transporte',amount:11160,rule:'weekly',weekday:2,purpose:'transport',variable:true,benefitDaily:1860,benefitSaturday:true}],preferences:{fare:550,trips:2,debtPrincipal:97800,debtMinimum:30000,debtRate:7,debtSince:date},goal:{name:'Arrumar meu carro',target:1000000}};
 for(let i=0;i<2;i++){
  await page.locator('#budget-profile-input').setInputFiles({name:'budget.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(profile))});await expect(page.locator('#modal')).toContainText('sem criar recebimentos');await page.getByRole('button',{name:'Aplicar ao meu perfil'}).click();await expect(page.locator('#modal')).not.toBeVisible();
 }
 const result=await page.evaluate(()=>{const s=window.JuntoApp.getState();return {balance:s.users[0].balance,received:s.received.length,sources:s.incomes,goals:s.goals};});
 expect(result.balance).toBe(300000);expect(result.received).toBe(0);expect(result.sources).toHaveLength(3);expect(result.sources.find(x=>x.name==='Salário').id).toBe('existing');expect(result.sources.every(x=>x.auto===false)).toBe(true);expect(result.goals).toHaveLength(1);expect(result.goals[0].saved).toBe(0);expect(result.goals[0].target).toBe(1000000);
});

test('income form keeps variable amounts pending and exposes benefit workday rules',async({page})=>{
 await page.goto('/');await personal(page,100000);await page.evaluate(()=>window.JuntoApp.openModal('Configurar','<button data-action="income-new">Nova entrada</button>'));await page.getByRole('button',{name:'Nova entrada',exact:true}).click();
 await page.locator('#income-name').fill('Vale transporte');await page.locator('#income-amount').fill('111,60');await page.locator('[name="income-rule"][value="weekly"]').check();await page.locator('#income-weekday').selectOption('2');await page.locator('#income-purpose').selectOption('transport');await page.locator('#income-benefit-daily').fill('18,60');await page.locator('[name="income-benefit-saturday"]').check();await page.locator('[name="income-auto"]').check();await page.getByRole('button',{name:'Adicionar entrada',exact:true}).click();
 const inc=await page.evaluate(()=>window.JuntoApp.getState().incomes[0]);expect(inc.auto).toBe(false);expect(inc.variable).toBe(true);expect(inc.benefitDaily).toBe(1860);expect(inc.benefitSaturday).toBe(true);
});
test('mobile app renders, navigates and preserves the fixed bottom bar',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#app-content')).not.toBeEmpty();
 if(process.env.JUNTO_CHROME){try{execFileSync('node_modules/.bin/agent-browser',['--executable-path',process.env.JUNTO_CHROME,'--session','junto-smoke','open','http://127.0.0.1:5173'],{stdio:'pipe',timeout:20000});execFileSync('node_modules/.bin/agent-browser',['--session','junto-smoke','snapshot','-i'],{stdio:'pipe',timeout:10000});execFileSync('node_modules/.bin/agent-browser',['--session','junto-smoke','close'],{stdio:'pipe',timeout:10000});}catch{console.log('agent-browser unavailable; browser verification continues with Playwright.');}}
 const nav=page.locator('#mobile-nav');expect((await nav.boundingBox()).y+(await nav.boundingBox()).height).toBeLessThanOrEqual(845);
 await expect(page.locator('#mobile-nav [data-action="chat-open"]')).toBeVisible();
 for(const route of ['ledger','analysis','goals','home']){
  await page.locator(`#mobile-nav [data-route="${route}"]`).click();
  await expect(page.locator('body')).toHaveAttribute('data-route',route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow horizontal em ${route}`).toBe(true);
  const unlabeled=await page.locator('button:visible').evaluateAll(nodes=>nodes.filter(el=>!(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent?.trim())).map(el=>el.outerHTML.slice(0,180)));
  expect(unlabeled,`botões sem nome acessível em ${route}`).toEqual([]);
 }
 expect(await page.evaluate(()=>[...document.styleSheets].some(x=>x.href?.endsWith('/css/refine.css')))).toBe(true);
 expect(await page.locator('.mobile-nav').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');
 expect(errors).toEqual([]);await page.screenshot({path:'test-results/mobile.png'});
});
test('new Home stays functional in solo and couple modes',async({page})=>{
 await page.goto('/');await personal(page,250000);
 await expect(page.locator('.j-home')).toBeVisible();
 await expect(page.locator('.j-hero')).toContainText('Livre pra curtir');
 await expect(page.locator('.j-home .j-eyebrow').first()).toContainText('Modo individual');
 await expect(page.locator('#couple-cta .couple-top-cta')).toBeVisible();
 await expect(page.locator('.j-home .connect-card')).toHaveCount(0);
 await expect(page.locator('#peer-rail')).toBeHidden();
 const categories=await page.evaluate(()=>window.JuntoApp.getCategories());
 for(const category of ['Educação','Pets','Beleza','Viagem','Presentes','Restaurantes','Tecnologia','Trabalho','Impostos'])expect(categories).toContain(category);
 await expect(page.locator('.j-actions [data-action="can-spend"]')).toContainText('Posso gastar?');
 await page.evaluate(()=>{const s=window.JuntoApp.freshState('Guilherme');s.users[0].balance=250000;s.transactions=[
  {id:'u1',name:'Uber',item:'Corrida de app',icon:'ride',amount:1800,category:'Transporte',payer:'a',by:'a',date:'2026-10-01'},
  {id:'u2',name:'Uber',item:'Corrida de app',icon:'ride',amount:1900,category:'Transporte',payer:'a',by:'a',date:'2026-10-02'},
  {id:'u3',name:'Uber',item:'Corrida de app',icon:'ride',amount:1800,category:'Transporte',payer:'a',by:'a',date:'2026-10-03'}
 ];window.JuntoApp.applyState(s);});
 await page.locator('.j-actions [data-action="expense"]').click();
 await page.locator('#expense-title').fill('uber');
 await expect(page.locator('#expense-category')).toHaveValue('Transporte');
 await expect(page.locator('#expense-amount')).toHaveValue('18,00');
 await expect(page.locator('#expense-read')).toContainText('valor habitual');
 await page.locator('#modal [data-action="close"]').click();
 await page.evaluate(()=>{const s=window.JuntoApp.freshState('Guilherme');s.users[0].balance=250000;s.users.push({id:'b',name:'Bia',balance:150000,tone:'pink'});window.JuntoApp.applyState(s);});
 await expect(page.locator('.j-home .j-eyebrow').first()).toContainText('Juntô a dois');
 await expect(page.locator('.j-actions [data-action="ask"]')).toContainText('Amor, posso gastar?');
 await expect(page.locator('#couple-cta .couple-top-cta')).toHaveCount(0);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.notifications=[{id:'home-notice',to:'a',title:'Combinado aprovado',body:'Seu amor respondeu ao pedido.',kind:'info',read:false,createdAt:Date.now()}];window.JuntoApp.applyState(s);});
 await page.locator('.profile-photo-button:visible').click();
 await expect(page.locator('#modal')).toContainText('1 aviso novo para você.');
 await page.locator('#modal [data-action="notifications"]').click();
 await expect(page.locator('#modal')).toContainText('Combinado aprovado');
 expect(await page.evaluate(()=>window.JuntoApp.getState().notifications[0].read)).toBe(true);
});


test('smart entry understands natural due dates, recurring bills and who paid',async({page})=>{
 await page.goto('/');await personal(page,300000);
 await page.locator('.j-actions [data-action="expense"]').click();

 // "vence dia 15" não pode confundir o dia com o valor.
 await page.locator('#expense-title').fill('internet 100 vence dia 15');
 await expect(page.locator('#expense-amount')).toHaveValue('100,00');
 await expect(page.locator('#expense-category')).toHaveValue('Assinaturas');
 await expect(page.locator('input[name="expense-type"][value="bill"]')).toBeChecked();
 await expect(page.locator('#expense-date')).toHaveValue(/-15$/);
 await page.locator('#modal [data-action="close"]').click();

 // Recorrência escrita do jeito do usuário muda o fluxo para conta fixa.
 await page.locator('.j-actions [data-action="expense"]').click();
 await page.locator('#expense-title').fill('aluguel 900 todo mes dia 10');
 await expect(page.locator('#expense-amount')).toHaveValue('900,00');
 await expect(page.locator('#expense-category')).toHaveValue('Casa');
 await expect(page.locator('input[name="expense-type"][value="fixed"]')).toBeChecked();
 await expect(page.locator('#expense-date')).toHaveValue(/-10$/);
 await page.locator('#modal [data-action="close"]').click();

 // Em dupla, "meu amor pagou" escolhe a outra pessoa sem mexer no nome do item.
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.users.push({id:'b',name:'Bia',balance:200000,tone:'pink'});window.JuntoApp.applyState(s);});
 await page.locator('.j-actions [data-action="expense"]').click();
 await page.locator('#expense-title').fill('pizza 45 meu amor pagou');
 await expect(page.locator('#expense-amount')).toHaveValue('45,00');
 await expect(page.locator('#expense-category')).toHaveValue('Delivery');
 await expect(page.locator('#expense-payer')).toHaveValue('b');
 await expect(page.locator('#expense-read')).toContainText('Pizza');
});

test('critical money flow stays coherent: spend, edit, delete, bill, pay and reopen',async({page})=>{
 await page.goto('/');await personal(page,10000);
 await page.locator('#mobile-nav [data-route="ledger"]').click();

 // Extrato: CTA deve registrar gasto e nunca oferecer divisão inválida no modo solo.
 const register=page.locator('.j-page [data-action="expense"]').first();
 await expect(register).toContainText('Registrar gasto');
 await register.click();
 await expect(page.locator('input[name="expense-type"][value="spent"]')).toBeChecked();
 await expect(page.locator('#expense-payer option')).toHaveCount(1);
 await page.locator('#expense-title').fill('pizza');
 await page.locator('#expense-amount').fill('10,00');
 await expect(page.locator('#expense-category')).toHaveValue('Delivery');
 await page.locator('[data-form="expense"] [type="submit"]').click();
 await expect(page.locator('[data-action="tx-detail"]')).toHaveCount(1);
 let state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(9000);expect(state.transactions).toHaveLength(1);

 // Editar recalcula saldo sem duplicar o lançamento.
 await page.locator('[data-action="tx-detail"]').click();
 await expect(page.locator('[data-action="edit-tx"]')).toBeVisible();
 await page.locator('[data-action="edit-tx"]').click();
 await page.locator('#edit-tx-amount').fill('12,00');
 await page.locator('[data-form="edit-tx"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(8800);expect(state.transactions[0].amount).toBe(1200);

 // Excluir estorna exatamente o que foi lançado.
 await page.locator('[data-action="tx-detail"]').click();
 await page.locator('[data-action="delete-tx"]').click();
 await page.locator('[data-form="delete-tx"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(10000);expect(state.transactions).toHaveLength(0);

 // A CTA principal de Contas deve abrir uma conta a pagar, não um gasto já realizado.
 await page.locator('.j-seg [data-value="bills"]').click();
 await page.locator('[data-action="bill-filter"][data-value="open"]').click();
 await expect(page.locator('[data-action="bill-new"]')).toContainText('Adicionar conta');
 await page.locator('[data-action="bill-new"]').click();
 await expect(page.locator('input[name="expense-type"][value="bill"]')).toBeChecked();
 await page.locator('#expense-title').fill('internet');
 await page.locator('#expense-amount').fill('20,00');
 await page.locator('[data-form="expense"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(10000);expect(state.bills).toHaveLength(1);expect(state.bills[0].status).toBe('open');

 // Pagar reduz o saldo; reabrir estorna e devolve ao fluxo A pagar.
 await page.locator('[data-action="bill-detail"]').click();
 await page.locator('[data-action="pay-bill"]').click();
 await page.locator('[data-form="pay-bill"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(8000);expect(state.bills[0].status).toBe('paid');expect(state.transactions).toHaveLength(1);
 await expect(page.locator('[data-action="bill-filter"][data-value="paid"]')).toHaveClass(/active/);
 await page.locator('[data-action="bill-detail"]').click();
 await page.locator('[data-action="reopen-bill"]').click();
 await page.locator('[data-form="reopen-bill"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(10000);expect(state.bills[0].status).toBe('open');expect(state.transactions).toHaveLength(0);
});

test('income goal and solo spending flows stay connected',async({page})=>{
 await page.goto('/');await personal(page,500000);
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await page.locator('[data-action="income-new"]').first().click();
 await page.locator('#income-name').fill('Salário');
 await page.locator('#income-amount').fill('5600');
 await page.locator('[data-form="income"] [type="submit"]').click();
 let state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.incomes).toHaveLength(1);expect(state.incomes[0].amount).toBe(560000);
 await page.locator('#mobile-nav [data-route="goals"]').click();
 await page.locator('[data-action="new-goal"]').first().click();
 await page.locator('#goal-title').fill('Viagem');
 await page.locator('#goal-target').fill('1000');
 await page.locator('[data-form="goal"] [type="submit"]').click();
 await page.locator('[data-action="contribute"]').first().click();
 await page.locator('#contribute-amount').fill('100');
 await page.locator('[data-form="contribute"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.goals[0].saved).toBe(10000);expect(state.users[0].balance).toBe(500000);
 await page.locator('#mobile-nav [data-route="home"]').click();
 await page.locator('.j-actions [data-action="can-spend"]').click();
 await page.locator('#request-title').fill('pizza 45');
 await expect(page.locator('#request-amount')).toHaveValue('45,00');
 await page.locator('[data-form="can-spend"] [type="submit"]').click();
 await page.locator('[data-action="can-buy"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.transactions).toHaveLength(1);expect(state.users[0].balance).toBe(495500);
});

test('couple request flow reserves then charges only when purchase is confirmed',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.users.push({id:'b',name:'Bia',balance:100000,tone:'pink'});window.JuntoApp.applyState(s);window.JuntoApp.setSlot(null);});
 await page.locator('#mobile-nav [data-route="home"]').click();
 await page.locator('.j-actions [data-action="ask"]').click();
 await page.locator('#request-title').fill('pizza 40 meio a meio');
 await expect(page.locator('#request-amount')).toHaveValue('40,00');
 await expect(page.locator('#request-payer')).toHaveValue('half');
 await page.locator('[data-form="ask"] [type="submit"]').click();
 let state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.requests).toHaveLength(1);expect(state.requests[0].status).toBe('pending');
 expect(state.users[0].balance).toBe(100000);expect(state.users[1].balance).toBe(100000);

 await page.locator('#mobile-user-switch .profile-photo-button').click();
 await page.locator('#modal [data-action="profile-photo-switch"]').click();
 await page.locator('#mobile-nav [data-route="home"]').click();await page.locator('.j-couple-link').click();
 await page.locator('[data-action="approve"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.requests[0].status).toBe('approved');
 expect(state.users[0].balance).toBe(100000);expect(state.users[1].balance).toBe(100000);

 await page.locator('#mobile-user-switch .profile-photo-button').click();
 await page.locator('#modal [data-action="profile-photo-switch"]').click();
 await page.locator('#mobile-nav [data-route="home"]').click();await page.locator('.j-couple-link').click();
 await page.locator('[data-action="purchase"]').click();
 await expect(page.locator('#purchase-payer')).toHaveValue('half');
 await page.locator('[data-form="purchase"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.requests[0].status).toBe('purchased');
 expect(state.transactions).toHaveLength(1);
 expect(state.users[0].balance).toBe(98000);expect(state.users[1].balance).toBe(98000);
});


test('income automation persists and income forecast respects start date',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await page.locator('[data-action="income-new"]').first().click();
 await page.locator('#income-name').fill('Semanal');
 await page.locator('#income-amount').fill('250');
 await page.locator('input[name="income-rule"][value="weekly"]').check();
 await page.locator('input[name="income-auto"]').check();
 await page.locator('[data-form="income"] [type="submit"]').click();
 let state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.incomes[0].auto).toBe(true);

 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),d=new Date(),future=new Date(d.getFullYear(),d.getMonth()+1,15);
   const iso=x=>String(x.getFullYear())+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
   s.incomes=[{id:'future-source',name:'Renda futura',person:'a',amount:90000,rule:'monthly',day:1,since:iso(future),auto:false}];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await expect(page.locator('.income-v3-total strong')).toContainText('R$ 0');
});

test('same-name recurring bills stay separate and stopping one series does not stop the other',async({page})=>{
 await page.goto('/');await personal(page,500000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),today=new Date(),iso=x=>String(x.getFullYear())+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
   const prev=new Date(today.getFullYear(),today.getMonth()-1,10),cur=new Date(today.getFullYear(),today.getMonth(),10);
   s.bills=[
     {id:'a-prev',recurringKey:'series-a',name:'Internet',amount:10000,category:'Assinaturas',payer:'a',due:iso(prev),recurring:true,status:'paid'},
     {id:'a-cur',recurringKey:'series-a',name:'Internet',amount:10000,category:'Assinaturas',payer:'a',due:iso(cur),recurring:true,status:'open'},
     {id:'b-cur',recurringKey:'series-b',name:'Internet',amount:20000,category:'Assinaturas',payer:'a',due:iso(cur),recurring:true,status:'open'}
   ];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="analysis"]').click();
 await page.locator('[data-action="topic-tab"][data-kind="analysis"][data-value="categories"]').click();
 await expect(page.locator('.fixed-card')).toHaveCount(2);

 await page.locator('#mobile-nav [data-route="ledger"]').click();await page.locator('.j-seg [data-value="bills"]').click();
 await page.locator('[data-action="bill-filter"][data-value="fixed"]').click();
 await page.locator('[data-action="bill-detail"][data-id="a-cur"]').click();
 await page.locator('[data-action="edit-bill"]').click();
 await page.locator('input[name="edit-bill-recurring"]').uncheck();
 await page.locator('[data-form="edit-bill"] [type="submit"]').click();
 const state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.bills.filter(b=>b.recurringKey==='series-a').every(b=>b.recurring===false)).toBe(true);
 expect(state.bills.find(b=>b.id==='b-cur').recurring).toBe(true);
});

test('month forecast excludes income before its start and already confirmed schedule periods',async({page})=>{
 await page.clock.install({time:new Date('2026-10-07T12:00:00')});
 await page.goto('/');await personal(page,250000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'future',name:'Renda futura',person:'a',amount:500000,rule:'monthly',day:15,since:'2026-11-01',auto:false}];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="forecast"]').click();
 await expect(page.locator('.future-v3-card .j-big')).toContainText('R$ 2.500');
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes[0].since='2026-09-01';s.received=[{id:'receipt',incomeId:'future',person:'a',date:'2026-10-05',amount:500000,status:'received',balanceDelta:500000}];window.JuntoApp.applyState(s);});
 await expect(page.locator('.future-v3-card .j-big')).toContainText('R$ 2.500');
 await page.locator('[data-action="cal-day"][data-date="2026-10-15"]').click();
 await expect(page.locator('.cal-detail')).not.toContainText('Renda futura');
});

test('future calendar counts a materialized recurring bill once',async({page})=>{
 await page.clock.install({time:new Date('2026-10-07T12:00:00')});
 await page.goto('/');await personal(page,250000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'future',name:'Renda futura',person:'a',amount:100000,rule:'monthly',day:1,since:'2027-01-01',auto:false}];s.bills=[{id:'oct',recurringKey:'internet',name:'Internet',amount:10000,payer:'a',category:'Assinaturas',due:'2026-10-10',recurring:true,status:'open'},{id:'nov',recurringKey:'internet',name:'Internet',amount:10000,payer:'a',category:'Assinaturas',due:'2026-11-10',recurring:true,status:'open'}];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-seg [data-value="forecast"]').click();
 await page.locator('[data-action="cal-month"][data-delta="1"]').click();
 const day=page.locator('[data-action="cal-day"][data-date="2026-11-10"]');
 await expect(day).toHaveAttribute('aria-label',/contas de R\$\s?100/);await day.click();
 await expect(page.locator('.cal-detail .cal-list li')).toHaveCount(1);
 await page.locator('.cal-detail [data-action="bill-detail"][data-id="nov"]').click();
 await expect(page.locator('#modal')).toHaveAttribute('data-kind','ledger-detail');
 await expect(page.locator('#modal')).toContainText('Internet');
});

test('saving when confirming income carries its occurrence for offline reconciliation',async({page})=>{
 await page.clock.install({time:new Date('2026-10-07T12:00:00')});
 await page.goto('/');await personal(page,100000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'salary',name:'Salário',person:'a',amount:50000,rule:'monthly',day:5,since:'2026-10-01',auto:false}];s.goals=[{id:'reserve',name:'Reserva',target:100000,saved:0,icon:'shield'}];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await page.locator('.j-page [data-action="income-arrived"]').first().click();
 await page.locator('#arrival-save').fill('100');await page.locator('[data-form="arrival"] [type="submit"]').click();
 const s=await page.evaluate(()=>window.JuntoApp.getState());
 expect(s.received).toHaveLength(1);expect(s.saves).toHaveLength(1);
 expect(s.saves[0]).toMatchObject({incomeId:'salary',incomeDate:'2026-10-05',date:'2026-10-07',amount:10000,source:'income'});
 expect(s.users[0].balance).toBe(150000);expect(s.goals[0].saved).toBe(10000);
});

test('recurrence keeps the requested day through February and later months',async({page})=>{
 await page.clock.install({time:new Date('2026-01-15T12:00:00')});
 await page.goto('/');await personal(page,250000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.bills=[{id:'rent',recurringKey:'rent-series',name:'Aluguel',amount:10000,payer:'a',category:'Casa',due:'2026-01-31',recurring:true,status:'open'}];window.JuntoApp.applyState(s);});
 for(const [now,due] of [['2026-02-15T12:00:00','2026-02-28'],['2026-03-15T12:00:00','2026-03-31']]){
   await page.clock.setSystemTime(new Date(now));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
   const s=await page.evaluate(()=>window.JuntoApp.getState());expect(s.bills.at(-1).due).toBe(due);
 }
});

test('approved screens remain usable at mobile, tablet and desktop widths in both modes',async({page})=>{
 test.setTimeout(90000);await page.goto('/');await personal(page,250000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [360,390,430,768,1280])for(const couple of [false,true]){
   await page.setViewportSize({width,height:844});
   await page.evaluate(couple=>{const s=window.JuntoApp.freshState('Guilherme');s.users[0].balance=250000;if(couple)s.users.push({id:'b',name:'Bia',balance:150000,tone:'pink'});s.incomes=[{id:'salary',name:'Salário',person:'a',amount:100000,rule:'monthly',day:15,since:'2027-01-01',auto:false}];s.goals=[{id:'reserve',name:'Nossa reserva',target:100000,saved:10000,icon:'shield'}];window.JuntoApp.applyState(s);window.JuntoApp.setSlot(null);},couple);
   for(const route of ['home','ledger','analysis','goals']){
     await page.locator(`button[data-route="${route}"]:visible`).first().click();await expect(page.locator('body')).toHaveAttribute('data-route',route);
     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${couple?'dupla':'solo'} ${route}`).toBe(true);
     if(width<760&&route==='home'){
       const brand=await page.locator('.topbar .mobile-brand').boundingBox(),profile=await page.locator('#mobile-user-switch .profile-photo-button').boundingBox();
       expect(Math.abs(brand.y-profile.y)).toBeLessThanOrEqual(1);
       expect(await page.locator('.topbar').evaluate(el=>el.getBoundingClientRect().height)).toBeLessThanOrEqual(45);
       if(!couple){const invite=await page.locator('#couple-cta').boundingBox();expect(invite.x+invite.width).toBeLessThanOrEqual(profile.x-4);await expect(page.locator('.couple-top-cta span')).toBeVisible();}
       await page.screenshot({path:`test-results/header-${width}-${couple?'couple':'solo'}.png`});
     }
     if(width===768){const area=await page.locator('#app-content').boundingBox(),columns=await page.locator('.columns').boundingBox();expect(area.width,`tablet ${route}: a coluna oculta não deve estreitar o conteúdo`).toBeGreaterThanOrEqual(columns.width-1);}
     const duplicates=await page.locator('[id]').evaluateAll(nodes=>{const ids=nodes.map(n=>n.id);return [...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];});expect(duplicates).toEqual([]);
     if(width<760)expect(await page.locator('#mobile-nav').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');
   }
   await page.locator('.profile-photo-button:visible').click();await expect(page.locator('#modal')).toBeVisible();
   const box=await page.locator('#modal').boundingBox();expect(box.x).toBeGreaterThanOrEqual(-1);expect(box.x+box.width).toBeLessThanOrEqual(width+1);expect(box.y).toBeGreaterThanOrEqual(-1);expect(box.y+box.height).toBeLessThanOrEqual(845);
   await page.screenshot({path:`test-results/layout-${width}-${couple?'couple':'solo'}.png`});await page.locator('#modal [data-action="close"]').first().click();
 }
});

test('editing and reopening a bank-linked paid bill restores the exact balance',async({page})=>{
 await fakeNative(page,[event('9','pix')]);await page.goto('/');await personal(page,10000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),date=new Date().toISOString().slice(0,10);
   s.bills=[{id:'bill-1',recurringKey:'net-series',name:'Internet',amount:2500,category:'Assinaturas',payer:'a',due:date,recurring:true,status:'open'}];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#bank-inbox-button').click();
 await page.locator('[data-feature="bank-review"]').click();
 await expect(page.locator('#bank-bill')).toHaveValue('bill-1');
 await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();
 let state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(7500);
 expect(state.transactions[0].recurringKey).toBe('net-series');

 await page.locator('#modal [data-action="close"]').click().catch(()=>{});
 await page.locator('#mobile-nav [data-route="ledger"]').click();await page.locator('.j-seg [data-value="bills"]').click();
 await page.locator('[data-action="bill-filter"][data-value="paid"]').click();
 await page.locator('[data-action="bill-detail"][data-id="bill-1"]').click();
 await page.locator('[data-action="edit-bill"]').click();
 await page.locator('#edit-bill-amount').fill('30,00');
 await page.locator('[data-form="edit-bill"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(7000);
 expect(state.transactions[0].balanceDelta).toBe(-3000);

 await page.locator('[data-action="bill-detail"][data-id="bill-1"]').click();
 await page.locator('[data-action="reopen-bill"]').click();
 await page.locator('[data-form="reopen-bill"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(10000);
 expect(state.transactions).toHaveLength(0);
 expect(state.bills[0].status).toBe('open');
});

test('contextual transaction rows open details without losing the current flow',async({page})=>{
 await page.goto('/');await personal(page,50000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),date=new Date().toISOString().slice(0,10);
   s.transactions=[{id:'tx-context',name:'Mercado',item:'Mercado',icon:'cart',amount:3200,category:'Alimentação',payer:'a',by:'a',date,createdAt:Date.now()}];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="home"]').click();
 await page.locator('.j-home [data-action="tx-detail"][data-id="tx-context"]').click();
 await expect(page.locator('dialog[data-kind="ledger-detail"]')).toBeVisible();
 await expect(page.locator('.ledger-detail-hero')).toContainText('R$ 32');
});


test('manual backup restore validates, confirms and preserves a pre-restore copy',async({page})=>{
 await page.goto('/');await personal(page,10000);
 const backup=await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),date=new Date().toISOString().slice(0,10);
   s.users[0].balance=123400;
   s.transactions=[{id:'restored-tx',name:'Mercado',item:'Mercado',icon:'cart',amount:2300,category:'Alimentação',payer:'a',by:'a',date,createdAt:Date.now()}];
   return JSON.stringify(s);
 });
 await page.locator('.profile-photo-button:visible').click();
 await page.locator('[data-action="backup-import"]').click();
 await page.locator('#backup-import-input').setInputFiles({name:'Junto-backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect(page.locator('dialog[data-kind="restore-backup"]')).toBeVisible();
 await expect(page.locator('#modal')).toContainText('1 gastos');
 await page.locator('[data-form="restore-backup"] [type="submit"]').click();
 const state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(123400);
 expect(state.transactions[0].id).toBe('restored-tx');
 expect(await page.evaluate(()=>Boolean(localStorage.getItem('junto-before-restore-v1')))).toBe(true);
});


test('goals open details, can be edited and safely stop an attached saving plan',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.locator('#mobile-nav [data-route="goals"]').click();
 await page.locator('[data-action="new-goal"]').first().click();
 await page.locator('#goal-title').fill('Viagem');
 await page.locator('#goal-target').fill('1000');
 await page.locator('[data-form="goal"] [type="submit"]').click();

 let state=await page.evaluate(()=>window.JuntoApp.getState());
 const goalId=state.goals[0].id;
 await page.evaluate(id=>{const s=window.JuntoApp.getState();s.plan={key:'leve',name:'Leve',monthly:10000,goalId:id,cut:.1,auto:true,startedAt:Date.now()};window.JuntoApp.applyState(s);},goalId);

 await page.locator('[data-action="goal-detail"]').first().click();
 await expect(page.locator('dialog[data-kind="goal-detail"]')).toBeVisible();
 await page.locator('[data-action="edit-goal"]').click();
 await page.locator('#edit-goal-title').fill('Viagem 2027');
 await page.locator('#edit-goal-target').fill('1500');
 await page.locator('[data-form="edit-goal"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.goals[0].name).toBe('Viagem 2027');
 expect(state.goals[0].target).toBe(150000);

 await page.locator('[data-action="goal-detail"]').first().click();
 await page.locator('[data-action="release-goal"]').click();
 await page.locator('[data-form="release-goal"] [type="submit"]').click();
 state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.goals).toHaveLength(0);
 expect(state.plan).toBeNull();
});


test('opening a modal cannot steal focus after the user selects another field',async({page})=>{
 await page.goto('/');await personal(page,100000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.goals=[{id:'trip',name:'Viagem',target:100000,saved:0,icon:'plane'}];window.JuntoApp.applyState(s);});
 await page.locator('#mobile-nav [data-route="goals"]').click();await page.locator('[data-action="goal-detail"]').first().click();
 // Hold a visual frame while the user moves to another field. Its callback
 // must never redirect subsequent keyboard input into the goal's name.
 await page.evaluate(()=>{
   const raf=window.requestAnimationFrame;window.__heldFrames=[];
   window.requestAnimationFrame=callback=>{window.__heldFrames.push(callback);return 1;};
   try{document.querySelector('#modal [data-action="edit-goal"]').click();}finally{window.requestAnimationFrame=raf;}
 });
 await page.locator('#edit-goal-title').fill('Viagem 2027');await page.locator('#edit-goal-target').fill('');
 await page.evaluate(()=>window.__heldFrames.forEach(callback=>callback(performance.now())));
 await expect(page.locator('#edit-goal-target')).toBeFocused();await page.keyboard.insertText('1500');
 await page.locator('[data-form="edit-goal"] [type="submit"]').click();
 const s=await page.evaluate(()=>window.JuntoApp.getState());expect(s.goals[0].name).toBe('Viagem 2027');expect(s.goals[0].target).toBe(150000);
});

test('automatic income and recurring maintenance run again when the app resumes',async({page})=>{
 await page.goto('/');await personal(page,10000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),d=new Date(),iso=x=>String(x.getFullYear())+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
   s.incomes=[{id:'auto-today',name:'Semanal',person:'a',amount:2500,rule:'monthly',day:d.getDate(),since:iso(d),auto:true}];
   s.received=[];
   window.JuntoApp.applyState(s);
 });
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect.poll(()=>page.evaluate(()=>window.JuntoApp.getState().received.length)).toBe(1);
 const state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.users[0].balance).toBe(12500);
 expect(state.received[0].auto).toBe(true);
});


test('editing a recurring income schedule does not create a duplicate confirmation in the same period',async({page})=>{
 await page.goto('/');await personal(page,10000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),d=new Date(),ym=String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0');
   const oldDay=Math.max(1,d.getDate()-2),newDay=Math.max(1,d.getDate()-1);
   s.incomes=[{id:'salary-edit',name:'Salário',person:'a',amount:50000,rule:'monthly',day:oldDay,since:ym+'-01',auto:false}];
   s.received=[{id:'salary-received',incomeId:'salary-edit',person:'a',date:ym+'-'+String(oldDay).padStart(2,'0'),amount:50000,status:'received',at:Date.now(),balanceDelta:50000}];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await page.locator('[data-action="income-edit"]').first().click();
 const today=await page.evaluate(()=>new Date().getDate());
 await page.locator('input[name="income-rule"][value="monthly"]').check();
 await page.locator('#income-day').fill(String(Math.max(1,today-1)));
 await page.locator('[data-form="income"] [type="submit"]').click();
 await page.locator('#mobile-nav [data-route="home"]').click();
 await expect(page.locator('.j-home .j-banner[data-action="income-arrived"]')).toHaveCount(0);
});


test('monthly income summary uses actual receipts and removes skipped occurrences',async({page})=>{
 await page.goto('/');await personal(page,10000);
 await page.evaluate(()=>{
   const s=window.JuntoApp.getState(),d=new Date(),iso=x=>String(x.getFullYear())+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'),ym=iso(d).slice(0,7);
   s.incomes=[
     {id:'actual-inc',name:'Salário',person:'a',amount:50000,rule:'monthly',day:Math.max(1,d.getDate()-2),since:ym+'-01',auto:false},
     {id:'skip-inc',name:'Extra',person:'a',amount:30000,rule:'monthly',day:Math.max(1,d.getDate()-1),since:ym+'-01',auto:false}
   ];
   s.received=[
     {id:'actual-receipt',incomeId:'actual-inc',person:'a',date:ym+'-'+String(Math.max(1,d.getDate()-2)).padStart(2,'0'),amount:60000,status:'received',at:Date.now(),balanceDelta:60000},
     {id:'skip-receipt',incomeId:'skip-inc',person:'a',date:ym+'-'+String(Math.max(1,d.getDate()-1)).padStart(2,'0'),amount:0,status:'skipped',at:Date.now()}
   ];
   window.JuntoApp.applyState(s);
 });
 await page.locator('#mobile-nav [data-route="analysis"]').click();await page.locator('.j-page [data-route="incomes"]').first().click();
 await expect(page.locator('.income-v3-total strong')).toContainText('R$ 600');
 await expect(page.locator('.income-v3-insight')).toContainText('já foram confirmadas');
});

test.describe('offline PWA',()=>{
 test.use({serviceWorkers:'allow'});
 test('PWA reloads offline with its bundled fonts and scripts',async({page,context})=>{
 await page.goto('/');
 await page.evaluate(async()=>{
   await navigator.serviceWorker.ready;
   if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
 });
 await page.waitForLoadState('domcontentloaded');
 await context.setOffline(true);
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#app-content')).not.toBeEmpty();
 await expect(page.locator('#mobile-nav')).toBeVisible();
 });
});
test('Android back closes a dialog, chat, navigation, then exits',async({page})=>{
 await fakeNative(page,[]);await page.goto('/');await page.locator('.profile-photo-button:visible').click();await expect(page.locator('#modal')).toBeVisible();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('#modal')).not.toBeVisible();
 await page.evaluate(()=>document.querySelector('[data-action="chat-open"]').click());await expect(page.locator('#chat-panel')).toBeVisible();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('#chat-panel')).not.toBeVisible();
 await page.locator('#mobile-nav [data-route="ledger"]').click();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('body')).toHaveAttribute('data-route','home');await page.evaluate(()=>window.__nativeEvents.backButton());expect(await page.evaluate(()=>window.__exited)).toBe(true);
});

test('chat uses current money, retries real failures and can stop a request',async({page})=>{
 const sent=[];let pending=null;
 await page.route('**/api/ai',async route=>{
   sent.push(route.request().postDataJSON());
   if(sent.length===1)return route.fulfill({status:429,json:{code:'rate_limited',message:'Limite atingido'}});
   if(sent.length===2)return route.fulfill({json:{candidates:[{content:{role:'model',parts:[{text:'Seu saldo é R$ 1.234,56.'}]}}]}});
   pending=route;await new Promise(resolve=>{pending.release=resolve;});await route.abort().catch(()=>{});
 });
 await page.goto('/');await personal(page,123456);
 await page.locator('[data-action="chat-open"]:visible').first().click();await page.locator('#chat-input').fill('quanto posso gastar hoje?');await page.locator('#chat-send').click();
 await expect(page.locator('#chat-log .chat-msg.err')).toContainText('limite disponível');
 await page.locator('[data-action="chat-retry"]').click();
 await expect(page.locator('#chat-log')).toContainText('Seu saldo é R$ 1.234,56.');
 expect(sent).toHaveLength(2);
 const context=JSON.parse(sent[1].systemInstruction.parts[0].text.split('Dados do app agora (JSON, valores em reais):\n')[1]);
 expect(context.saldo_dupla).toBe(1234.56);expect(context.pessoas[0].saldo).toBe(1234.56);expect(context.modo).toBe('individual');
 await page.locator('#chat-input').fill('quanto sobra no mês?');await page.locator('#chat-send').click();
 await expect(page.locator('#chat-send')).toHaveAttribute('aria-label','Parar resposta');
 await page.locator('#chat-send').click();await expect(page.locator('#chat-log')).toContainText('Parei aqui');
 pending?.release();await expect(page.locator('#chat-send')).toHaveAttribute('aria-label','Enviar');
});
test('bank picker is compact, searchable and keeps branded choices',async({page})=>{
 await fakeNative(page,[]);await page.goto('/');await personal(page);await page.locator('.profile-photo-button:visible').click();await page.locator('[data-feature="bank-settings"]').click();
 await expect(page.locator('.bank-settings-screen')).toBeVisible();await expect(page.locator('.bank-search input')).toHaveAttribute('placeholder','Buscar banco ou carteira...');
 await expect(page.locator('[data-bank-card] .bank-brand-icon')).toHaveCount(7);
 await page.locator('[data-bank-search]').fill('PicPay');await expect(page.locator('[data-bank-card][data-search*="picpay"]')).toBeVisible();await expect(page.locator('[data-bank-card][data-search*="nubank"]')).toBeHidden();
 await page.locator('[data-bank-search]').fill('');await page.locator('[data-bank-select="digital"]').click();
 await expect(page.locator('input[name="packages"][value="com.picpay"]')).toBeChecked();await expect(page.locator('input[name="packages"][value="com.transferwise.android"]')).toBeChecked();
 await page.locator('[data-feature-form="bank-settings"] [type="submit"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__bankSettings.length)).toBe(1);
 const selected=await page.evaluate(()=>window.__bankSettings[0].packages);expect(selected).toContain('com.nu.production');expect(selected).toContain('com.picpay');expect(selected).toContain('com.transferwise.android');
});
test('bank confirmation is persistent, idempotent and excludes raw text',async({page})=>{
 await fakeNative(page,[event()]);await page.goto('/');await personal(page);await page.locator('#bank-inbox-button').click();await page.locator('[data-feature="bank-review"]').click();await page.locator('#bank-name').fill('Almoço');await expect(page.locator('#bank-category')).toHaveValue('Restaurantes');await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();
 const state=await page.evaluate(()=>window.JuntoApp.getState());expect(state.transactions.length).toBe(1);expect(state.users[0].balance).toBe(7500);expect(JSON.stringify(state)).not.toContain('Aviso privado');expect(await page.evaluate(()=>window.__bankAck.length)).toBe(1);
 const result=await page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Almoço',date:new Date().toISOString().slice(0,10),amount:2500,category:'Alimentação'}),event());expect(result.duplicate).toBe(true);expect(await page.evaluate(()=>window.JuntoApp.getState().transactions.length)).toBe(1);await page.reload();expect(await page.evaluate(()=>window.JuntoApp.getState().users[0].balance)).toBe(7500);
 await page.locator('.profile-photo-button:visible').click();await page.locator('#modal [data-feature="cloud-export"]').click();await expect.poll(()=>page.evaluate(()=>window.__exportedBackup?.name)).toMatch(/^Junto-backup-.*\.json$/);const backup=JSON.parse(await page.evaluate(()=>window.__exportedBackup.contents));expect(backup.transactions).toEqual(state.transactions);expect(backup.users[0].balance).toBe(7500);
});

test('bank review links an exact open bill automatically',async({page})=>{
 await fakeNative(page,[event('7','pix')]);await page.goto('/');await personal(page,10000);
 await page.evaluate(()=>{const s=window.JuntoApp.getState();s.bills=[{id:'bill-internet',name:'Internet',item:'Internet',icon:'wifi',amount:2500,category:'Assinaturas',payer:'a',due:new Date().toISOString().slice(0,10),recurring:true,status:'open'}];window.JuntoApp.applyState(s);});
 await page.locator('#bank-inbox-button').click();
 await page.locator('[data-feature="bank-review"]').click();
 await expect(page.locator('#bank-name')).toHaveValue('Internet');
 await expect(page.locator('#bank-category')).toHaveValue('Assinaturas');
 await expect(page.locator('#bank-bill')).toHaveValue('bill-internet');
 await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();
 const state=await page.evaluate(()=>window.JuntoApp.getState());
 expect(state.bills[0].status).toBe('paid');expect(state.transactions[0].billId).toBe('bill-internet');expect(state.users[0].balance).toBe(7500);
});

test('card purchases become payable bills without reducing cash',async({page})=>{
 await fakeNative(page,[event('2','card')]);await page.goto('/');await personal(page);await page.locator('#bank-inbox-button').click();await page.locator('[data-feature="bank-review"]').click();await page.locator('#bank-name').fill('Compra no mercado');const due=new Date();due.setDate(due.getDate()+10);await page.locator('#bank-due').fill(due.toISOString().slice(0,10));await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();const s=await page.evaluate(()=>window.JuntoApp.getState());expect(s.users[0].balance).toBe(10000);expect(s.transactions.length).toBe(0);expect(s.bills.length).toBe(1);expect(s.bills[0].status).toBe('open');
});
test('bank income records a receipt without creating an expense',async({page})=>{
 await fakeNative(page,[event('3','pix','income')]);await page.goto('/');await personal(page);await page.locator('#bank-inbox-button').click();await page.locator('[data-feature="bank-review"]').click();await page.locator('#bank-name').fill('Freela');await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();const s=await page.evaluate(()=>window.JuntoApp.getState());expect(s.users[0].balance).toBe(12500);expect(s.received.length).toBe(1);expect(s.transactions.length).toBe(0);
});
test('two independent accounts invite, sync offline edits and keep their own profile',async({browser})=>{
 const db=new PGlite();const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'];
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;");for(const id of ids)await db.query('insert into auth.users values($1)',[id]);await db.exec(await readFile('supabase/setup.sql','utf8'));
 let chain=Promise.resolve(),holdRead=null,releaseRead,readStarted,readFinished;const contexts=[];
 const token=uid=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
 async function device(index){const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});contexts.push(context);await context.addInitScript(()=>{localStorage.setItem('junto-setup-offered-a','1');localStorage.setItem('junto-setup-offered-b','1');});const page=await context.newPage();await page.route('**/js/config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.JuntoCloudConfig=${JSON.stringify(testConfig)};`}));
  await page.routeWebSocket('**/realtime/v1/websocket**',socket=>socket.onMessage(text=>{const m=JSON.parse(text);socket.send(JSON.stringify(Array.isArray(m)?[m[0],m[1],m[2],'phx_reply',{status:'ok',response:{}}]:{...m,event:'phx_reply',payload:{status:'ok',response:{}}}));}));
  await page.route('https://junto-test.supabase.co/**',async route=>{const request=route.request(),url=new URL(request.url()),payload=request.postDataJSON()||{};if(url.pathname.includes('/auth/v1/token')){const uid=ids[index],u={id:uid,email:index?'bia@junto.example':'gui@junto.example',aud:'authenticated',role:'authenticated',user_metadata:{display_name:index?'Bia':'Gui'},app_metadata:{provider:'email'},created_at:new Date().toISOString()};await route.fulfill({json:{access_token:token(uid),refresh_token:'refresh-'+index,expires_in:3600,token_type:'bearer',user:u}});return;}
    if(url.pathname.includes('/rest/v1/rpc/')){const delayed=index===0&&holdRead!==null;if(delayed){const wait=holdRead;holdRead=null;readStarted();await wait;}const task=async()=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[index]]);await db.exec('set role authenticated');try{const name=url.pathname.split('/').at(-1);const args=Object.values(payload);const rows=await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args);await route.fulfill({json:rows.rows[0].result});}catch(e){await route.fulfill({status:400,json:{message:e.message,code:'P0001'}});}finally{await db.exec('reset role');}};chain=chain.then(task,task);await chain;if(delayed)readFinished();return;}
    await route.fulfill({json:{}});
  });await page.goto('/');await page.locator('#cloud-email').fill(index?'bia@junto.example':'gui@junto.example');await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();await expect(page.locator('[data-feature-form="cloud-create"]')).toBeVisible();return{context,page};}
 try{const a=await device(0);await a.page.locator('[data-feature-form="cloud-create"] [type="submit"]').click();await expect(a.page.locator('[data-feature="cloud-invite"]')).toBeVisible();
  await a.page.evaluate(e=>{const s=window.JuntoApp.getState();s.users[0].balance=85000;s.incomes=[{id:'salary-gui',name:'Salário só do Gui',person:'a',amount:100000,rule:'monthly',day:30,since:new Date().toISOString().slice(0,10),auto:false}];s.settings.variableEstimate=5000;window.JuntoApp.applyState(s);window.JuntoApp.confirmBankMovement(e,{name:'Conta individual Gui',amount:5000,date:new Date().toISOString().slice(0,10),category:'Outros'});},event('d'));
  const ownerState=await a.page.evaluate(()=>window.JuntoApp.getState());await a.page.locator('[data-feature="cloud-invite"]').click();const invite=await a.page.locator('#real-invite-code').innerText();
  await expect(a.page.locator('#modal')).toContainText('Já tenho um código');expect(await a.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const b=await device(1);await b.page.locator('[data-feature-form="cloud-create"] [type="submit"]').click();await expect(b.page.locator('#authenticated-app')).toBeVisible();
  await b.page.evaluate(()=>window.JuntoApp.closeModal());await b.page.locator('.profile-photo-button:visible').click();await b.page.locator('#modal [data-action="balance"]').click();await b.page.locator('#balance-amount').fill('400,00');await b.page.locator('[data-form="balance"] [type="submit"]').click();
  await b.page.evaluate(()=>{const s=window.JuntoApp.getState();s.incomes=[{id:'salary-bia',name:'Salário só da Bia',person:'a',amount:60000,rule:'monthly',day:30,since:new Date().toISOString().slice(0,10),auto:false}];s.settings.variableEstimate=7000;window.JuntoApp.applyState(s);});
  await b.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Café solo',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('c'));
  const previous=await b.page.evaluate(()=>window.JuntoApp.getState());
  await b.page.locator('.couple-top-cta').click();await b.page.locator('[data-action="connect-setup"]').click();await b.page.locator('[data-feature="cloud-join-open"]').click();
  await b.page.locator('#cloud-invite').fill('0000-0000-0000-0000');await b.page.locator('[name="confirm-space"]').check();await b.page.locator('[data-feature-form="cloud-join"] [type="submit"]').click();
  await expect(b.page.locator('[data-feature-form="cloud-join"] .feature-error')).toContainText('incorreto, expirou ou já foi usado');expect(await b.page.evaluate(()=>window.JuntoApp.getSlot())).toBe('a');expect(await b.page.evaluate(()=>window.JuntoApp.getState())).toEqual(previous);
  await b.page.locator('#cloud-invite').fill(invite.toLowerCase());await b.page.locator('[name="confirm-space"]').check();await b.page.locator('[data-feature-form="cloud-join"] [type="submit"]').click();await expect(b.page.locator('#cloud-live-status')).toBeVisible();
  await expect(b.page.locator('[data-feature="cloud-join-open"]')).toHaveCount(0);expect(await b.page.evaluate(()=>window.JuntoApp.getSlot())).toBe('b');
  const combined=await b.page.evaluate(()=>window.JuntoApp.getState());expect(combined.users.map(u=>u.balance)).toEqual([ownerState.users[0].balance,previous.users[0].balance]);expect(combined.transactions.map(t=>t.name)).toEqual(['Conta individual Gui','Café solo']);expect(combined.transactions[1].payer).toBe('b');
  const duplicate=await b.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Café solo',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('c'));expect(duplicate.duplicate).toBe(true);
  const archiveKey=`junto-cloud-personal-archive:${testConfig.url}:${ids[1]}`;expect(await b.page.evaluate(key=>JSON.parse(localStorage.getItem(key)),archiveKey)).toEqual(previous);
  await b.page.evaluate(key=>localStorage.removeItem(key),archiveKey);await b.page.locator('.cloud-backups summary').click();const saved=b.page.waitForEvent('download');await b.page.locator('[data-feature="cloud-export-personal"]').click();const archived=JSON.parse(await readFile(await (await saved).path(),'utf8'));expect(archived).toEqual(previous);
  // Reproduce an already-connected account from the old version, then recover
  // through the actual UI against the same database functions as production.
  await chain;const legacy=structuredClone(ownerState);legacy.users.push({id:'b',name:'Bia',balance:0,tone:'pink'});
  await db.exec('delete from junto_private.solo_transfers');await db.query('update public.junto_snapshots set payload=$1,revision=revision+1 where space_id=(select space_id from public.junto_members where user_id=$2)',[legacy,ids[1]]);
  await b.page.reload();await expect(b.page.locator('#authenticated-app')).toBeVisible();await b.page.locator('#cloud-account-button').click();await b.page.locator('[data-feature="cloud-restore-open"]').click();await expect(b.page.locator('[name="restore-balance"][value="solo"]')).toBeChecked();await b.page.locator('[data-feature-form="cloud-restore"] [type="submit"]').click();await expect(b.page.locator('#cloud-live-status')).toBeVisible();await expect(b.page.locator('[data-feature="cloud-restore-open"]')).toHaveCount(0);
  const recovered=await b.page.evaluate(()=>window.JuntoApp.getState());expect(recovered.users.map(u=>u.balance)).toEqual(combined.users.map(u=>u.balance));expect(recovered.transactions).toEqual(combined.transactions);await b.page.evaluate(()=>window.JuntoApp.closeModal());await b.page.locator('#mobile-nav [data-route="ledger"]').click();await expect(b.page.locator('#app-content')).toContainText('Café solo');
  await a.page.evaluate(()=>window.JuntoCloud.synchronize());
  for(const [device,own,other] of[[a,'Salário só do Gui','Salário só da Bia'],[b,'Salário só da Bia','Salário só do Gui']]){
    await device.page.evaluate(()=>window.JuntoApp.closeModal());await device.page.locator('#mobile-nav [data-route="analysis"]').click();await device.page.locator('#app-content [data-route="incomes"]').first().click();
    await expect(device.page.locator('#app-content')).toContainText(own);await expect(device.page.locator('#app-content')).toContainText(other);
    await device.page.locator('.j-seg [data-value="sources"]').click();await device.page.locator('#app-content [data-action="income-edit"]').click();await expect(device.page.locator('#income-person option')).toHaveCount(1);await device.page.evaluate(()=>window.JuntoApp.closeModal());
    await device.page.locator('#app-content [data-kind="income"][data-value="base"]').click();await expect(device.page.locator('#estimate-amount')).toHaveValue(device===a?'50,00':'70,00');
    if(device===b){await device.page.locator('#estimate-amount').fill('80,00');await device.page.locator('[data-form="estimate"] [type="submit"]').click();await device.page.evaluate(()=>window.JuntoCloud.synchronize());}
    await device.page.locator('#mobile-nav [data-route="analysis"]').click();await expect(device.page.locator('[data-action="analysis-person"]')).toHaveCount(3);
    await device.page.locator('#mobile-nav [data-route="ledger"]').click();await expect(device.page.locator('#ledger-days')).toContainText('Café solo');await expect(device.page.locator('#ledger-days')).toContainText('Conta individual Gui');
  }
  await a.page.evaluate(()=>window.JuntoCloud.synchronize());expect(await a.page.evaluate(()=>window.JuntoApp.getState().settings.personalEstimates)).toEqual({a:5000,b:8000});
  for(const device of[a,b]){await device.page.evaluate(()=>window.JuntoApp.closeModal());await device.page.evaluate(()=>document.querySelector('[data-action="settings"]').click());await device.page.locator('#modal [data-action="balance"]').click();await device.page.locator('#balance-amount').fill('1.000,00');await device.page.locator('[data-form="balance"] [type="submit"]').click();await device.page.evaluate(()=>window.JuntoCloud.synchronize());}
  await a.page.evaluate(()=>window.JuntoCloud.synchronize());await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(()=>a.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([100000,100000]);
  await expect.poll(()=>b.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([100000,100000]);
  expect((await db.query('select payload from public.junto_snapshots where jsonb_array_length(payload->\'users\')=2')).rows[0].payload.users.map(u=>u.balance)).toEqual([100000,100000]);

  await a.context.setOffline(true);await a.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Mercado',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('a'));
  await b.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Almoço',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('b'));await b.page.evaluate(()=>window.JuntoCloud.synchronize());await a.context.setOffline(false);await a.page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(async()=>{await a.page.evaluate(()=>window.JuntoCloud.synchronize());return a.page.evaluate(()=>window.JuntoApp.getState().transactions.length);}).toBe(4);await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(()=>b.page.evaluate(()=>window.JuntoApp.getState().transactions.length)).toBe(4);expect(await b.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([97500,97500]);await expect(b.page.locator('[data-action="profile-photo-switch"]')).toHaveCount(0);expect(await b.page.evaluate(()=>window.JuntoApp.getActive())).toBe('b');
  // Shared history and the conversation cross accounts without changing cash.
  await a.page.locator('#mobile-nav [data-route="ledger"]').click();await a.page.locator('.j-seg [data-value="history"]').click();
  await a.page.locator('#ledger-days .j-row').filter({hasText:'Café solo'}).click();await expect(a.page.locator('#modal [data-action="edit-tx"]')).toHaveCount(0);await a.page.locator('#modal [data-action="contest"]').click();
  await a.page.locator('#contest-note').fill('Vamos combinar este gasto?');await a.page.locator('[data-form="contest"] [type="submit"]').click();await a.page.evaluate(()=>window.JuntoCloud.synchronize());await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await b.page.locator('#mobile-nav [data-route="ledger"]').click();await b.page.locator('.j-seg [data-value="bills"]').click();await b.page.locator('[data-action="bill-filter"][data-value="contested"]').click();await expect(b.page.locator('.contest-note')).toContainText('Vamos combinar este gasto?');
  await b.page.locator('[data-action="contest-reply"]').click();await b.page.locator('#contest-text').fill('Combinado, vou planejar melhor.');await b.page.locator('[data-form="contest-reply"] [type="submit"]').click();await b.page.evaluate(()=>window.JuntoCloud.synchronize());await a.page.evaluate(()=>window.JuntoCloud.synchronize());
  await a.page.locator('.j-seg [data-value="bills"]').click();await a.page.locator('[data-action="bill-filter"][data-value="contested"]').click();await expect(a.page.locator('.contest-msg')).toContainText('vou planejar melhor');await a.page.locator('[data-action="contest-resolve"]').click();await a.page.locator('#contest-text').fill('Vamos seguir esse combinado.');await a.page.locator('[data-form="contest-resolve"] [type="submit"]').click();await a.page.evaluate(()=>window.JuntoCloud.synchronize());await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  expect(await b.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([97500,97500]);expect(await b.page.evaluate(()=>window.JuntoApp.getState().transactions.find(t=>t.name==='Café solo').contest.status)).toBe('resolved');
  // Disconnect while the partner has an offline expense: each solo ledger
  // keeps its own history, and the queued bank movement still reaches the server.
  await b.context.setOffline(true);await b.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Despesa offline Bia',amount:1250,date:new Date().toISOString().slice(0,10),category:'Outros'}),event('f'));
  await a.page.locator('#cloud-account-button').click();await a.page.locator('[data-feature="cloud-disconnect-open"]').click();await expect(a.page.locator('[data-feature-form="cloud-disconnect"]')).toBeVisible();
  await a.page.locator('[name="confirm-disconnect"]').check();await a.page.locator('[data-feature-form="cloud-disconnect"] [type="submit"]').click();await expect(a.page.locator('.cloud-membership')).toHaveText('Modo solo');
  expect(await a.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([97500]);
  await b.context.setOffline(false);await b.page.reload();await expect(b.page.locator('#authenticated-app')).toBeVisible();await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(()=>b.page.evaluate(()=>window.JuntoApp.getSlot())).toBe('a');await expect.poll(()=>b.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([96250]);
  await b.page.evaluate(()=>window.JuntoCloud.synchronize());const ownB=await b.page.evaluate(()=>window.JuntoApp.getState());expect(ownB.transactions.map(t=>t.name)).toEqual(['Café solo','Almoço','Despesa offline Bia']);expect(ownB.incomes.map(i=>i.name)).toEqual(['Salário só da Bia']);
  expect((await db.query('select payload from public.junto_snapshots where space_id=(select space_id from public.junto_members where user_id=$1)',[ids[1]])).rows[0].payload.users[0].balance).toBe(96250);
  expect(await a.page.evaluate(()=>window.JuntoApp.getState().transactions.map(t=>t.name))).toEqual(['Conta individual Gui','Mercado']);
  await b.page.locator('#cloud-account-button').click();await expect(b.page.locator('.cloud-membership')).toHaveText('Modo solo');await expect(b.page.locator('[data-feature="cloud-disconnect-open"]')).toHaveCount(0);await b.page.evaluate(()=>window.JuntoApp.closeModal());
  // A response that arrives after logout must not resurrect the old account.
  await a.page.evaluate(()=>window.JuntoCloud.synchronize());
  const personalBackup=await a.page.evaluate(()=>JSON.parse(localStorage.getItem('junto-personal-backup-v1')));
  const started=new Promise(resolve=>readStarted=resolve),finished=new Promise(resolve=>readFinished=resolve);
  holdRead=new Promise(resolve=>releaseRead=resolve);await a.page.reload();await started;
  await a.page.evaluate(()=>window.JuntoCloud.open());await a.page.locator('[data-feature="cloud-signout"]').click();
  const confirm=a.page.locator('[data-feature="cloud-signout-confirm"]');if(await confirm.isVisible())await confirm.click();
  await expect.poll(()=>a.page.evaluate(()=>window.JuntoApp.getSlot())).toBeNull();releaseRead();await finished;
  await a.page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  expect(await a.page.evaluate(()=>window.JuntoApp.getSlot())).toBeNull();
  expect(await a.page.evaluate(()=>window.JuntoApp.getState())).toEqual(personalBackup);
  await expect(a.page.locator('#cloud-email')).toBeVisible();await expect(a.page.locator('#app-content')).toBeEmpty();
 }finally{releaseRead?.();for(const c of contexts)await c.close();await chain;await db.close();}
});
