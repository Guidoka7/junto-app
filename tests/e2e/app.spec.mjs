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
test('mobile app renders, navigates and preserves the fixed bottom bar',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#app-content')).not.toBeEmpty();
 if(process.env.JUNTO_CHROME){try{execFileSync('node_modules/.bin/agent-browser',['--executable-path',process.env.JUNTO_CHROME,'--session','junto-smoke','open','http://127.0.0.1:5173'],{stdio:'pipe',timeout:20000});execFileSync('node_modules/.bin/agent-browser',['--session','junto-smoke','snapshot','-i'],{stdio:'pipe',timeout:10000});execFileSync('node_modules/.bin/agent-browser',['--session','junto-smoke','close'],{stdio:'pipe',timeout:10000});}catch{console.log('agent-browser unavailable; browser verification continues with Playwright.');}}
 const nav=page.locator('#mobile-nav');expect((await nav.boundingBox()).y+(await nav.boundingBox()).height).toBeLessThanOrEqual(845);
 for(const route of ['future','analysis','bills','goals','home']){await page.locator(`#mobile-nav [data-route="${route}"]`).click();await expect(page.locator('body')).toHaveAttribute('data-route',route);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);await page.screenshot({path:'test-results/mobile.png'});
});
test.describe('offline PWA',()=>{
 test.use({serviceWorkers:'allow'});
 test('PWA reloads offline with its bundled fonts and scripts',async({page,context})=>{
 await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();await expect(page.locator('#app-content')).not.toBeEmpty();await expect(page.locator('#mobile-nav')).toBeVisible();
 });
});
test('Android back closes a dialog, chat, navigation, then exits',async({page})=>{
 await fakeNative(page,[]);await page.goto('/');await page.locator('#settings-button').click();await expect(page.locator('#modal')).toBeVisible();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('#modal')).not.toBeVisible();
 await page.evaluate(()=>document.querySelector('[data-action="chat-open"]').click());await expect(page.locator('#chat-panel')).toBeVisible();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('#chat-panel')).not.toBeVisible();
 await page.locator('#mobile-nav [data-route="bills"]').click();await page.evaluate(()=>window.__nativeEvents.backButton());await expect(page.locator('body')).toHaveAttribute('data-route','home');await page.evaluate(()=>window.__nativeEvents.backButton());expect(await page.evaluate(()=>window.__exited)).toBe(true);
});
test('bank picker is compact, searchable and keeps branded choices',async({page})=>{
 await fakeNative(page,[]);await page.goto('/');await personal(page);await page.locator('#settings-button').click();await page.locator('[data-feature="bank-settings"]').click();
 await expect(page.locator('.bank-settings-screen')).toBeVisible();await expect(page.locator('.bank-search input')).toHaveAttribute('placeholder','Buscar banco ou carteira...');
 await expect(page.locator('[data-bank-card] .bank-brand-icon')).toHaveCount(6);
 await page.locator('[data-bank-search]').fill('PicPay');await expect(page.locator('[data-bank-card][data-search*="picpay"]')).toBeVisible();await expect(page.locator('[data-bank-card][data-search*="nubank"]')).toBeHidden();
 await page.locator('[data-bank-search]').fill('');await page.locator('[data-bank-select="digital"]').click();
 await expect(page.locator('input[name="packages"][value="com.picpay"]')).toBeChecked();await expect(page.locator('input[name="packages"][value="com.transferwise.android"]')).toBeChecked();
 await page.locator('[data-feature-form="bank-settings"] [type="submit"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__bankSettings.length)).toBe(1);
 const selected=await page.evaluate(()=>window.__bankSettings[0].packages);expect(selected).toContain('com.nu.production');expect(selected).toContain('com.picpay');expect(selected).toContain('com.transferwise.android');
});
test('bank confirmation is persistent, idempotent and excludes raw text',async({page})=>{
 await fakeNative(page,[event()]);await page.goto('/');await personal(page);await page.locator('#bank-inbox-button').click();await page.locator('[data-feature="bank-review"]').click();await page.locator('#bank-name').fill('Almoço');await page.locator('#bank-category').selectOption('Alimentação');await page.locator('[data-feature-form="bank-confirm"] [type="submit"]').click();
 const state=await page.evaluate(()=>window.JuntoApp.getState());expect(state.transactions.length).toBe(1);expect(state.users[0].balance).toBe(7500);expect(JSON.stringify(state)).not.toContain('Aviso privado');expect(await page.evaluate(()=>window.__bankAck.length)).toBe(1);
 const result=await page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Almoço',date:new Date().toISOString().slice(0,10),amount:2500,category:'Alimentação'}),event());expect(result.duplicate).toBe(true);expect(await page.evaluate(()=>window.JuntoApp.getState().transactions.length)).toBe(1);await page.reload();expect(await page.evaluate(()=>window.JuntoApp.getState().users[0].balance)).toBe(7500);
 await page.locator('#settings-button').click();await page.locator('#modal [data-feature="cloud-export"]').click();await expect.poll(()=>page.evaluate(()=>window.__exportedBackup?.name)).toMatch(/^Junto-backup-.*\.json$/);const backup=JSON.parse(await page.evaluate(()=>window.__exportedBackup.contents));expect(backup.transactions).toEqual(state.transactions);expect(backup.users[0].balance).toBe(7500);
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
 async function device(index){const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});contexts.push(context);const page=await context.newPage();await page.route('**/js/config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.JuntoCloudConfig=${JSON.stringify(testConfig)};`}));
  await page.routeWebSocket('**/realtime/v1/websocket**',socket=>socket.onMessage(text=>{const m=JSON.parse(text);socket.send(JSON.stringify(Array.isArray(m)?[m[0],m[1],m[2],'phx_reply',{status:'ok',response:{}}]:{...m,event:'phx_reply',payload:{status:'ok',response:{}}}));}));
  await page.route('https://junto-test.supabase.co/**',async route=>{const request=route.request(),url=new URL(request.url()),payload=request.postDataJSON()||{};if(url.pathname.includes('/auth/v1/token')){const uid=ids[index],u={id:uid,email:index?'bia@junto.example':'gui@junto.example',aud:'authenticated',role:'authenticated',user_metadata:{display_name:index?'Bia':'Gui'},app_metadata:{provider:'email'},created_at:new Date().toISOString()};await route.fulfill({json:{access_token:token(uid),refresh_token:'refresh-'+index,expires_in:3600,token_type:'bearer',user:u}});return;}
    if(url.pathname.includes('/rest/v1/rpc/')){const delayed=index===0&&holdRead!==null;if(delayed){const wait=holdRead;holdRead=null;readStarted();await wait;}const task=async()=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[index]]);await db.exec('set role authenticated');try{const name=url.pathname.split('/').at(-1);const args=Object.values(payload);const rows=await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args);await route.fulfill({json:rows.rows[0].result});}catch(e){await route.fulfill({status:400,json:{message:e.message,code:'P0001'}});}finally{await db.exec('reset role');}};chain=chain.then(task,task);await chain;if(delayed)readFinished();return;}
    await route.fulfill({json:{}});
  });await page.goto('/');await page.locator('#cloud-email').fill(index?'bia@junto.example':'gui@junto.example');await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();await expect(page.locator('[data-feature-form="cloud-create"]')).toBeVisible();return{context,page};}
 try{const a=await device(0);await a.page.locator('[data-feature-form="cloud-create"] [type="submit"]').click();await expect(a.page.locator('[data-feature="cloud-invite"]')).toBeVisible();await a.page.locator('[data-feature="cloud-invite"]').click();const invite=await a.page.locator('#real-invite-code').innerText();const b=await device(1);await b.page.locator('#cloud-invite').fill(invite);await b.page.locator('[data-feature-form="cloud-join"] [type="submit"]').click();await expect(b.page.locator('#cloud-live-status')).toBeVisible();await a.page.evaluate(()=>window.JuntoCloud.synchronize());
  for(const device of[a,b]){await device.page.evaluate(()=>window.JuntoApp.closeModal());await device.page.evaluate(()=>document.querySelector('[data-action="settings"]').click());await device.page.locator('#modal [data-action="balance"]').click();await device.page.locator('#balance-amount').fill('1.000,00');await device.page.locator('[data-form="balance"] [type="submit"]').click();await device.page.evaluate(()=>window.JuntoCloud.synchronize());}
  await a.page.evaluate(()=>window.JuntoCloud.synchronize());await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await a.context.setOffline(true);await a.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Mercado',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('a'));
  await b.page.evaluate(e=>window.JuntoApp.confirmBankMovement(e,{name:'Almoço',amount:2500,date:new Date().toISOString().slice(0,10),category:'Alimentação'}),event('b'));await b.page.evaluate(()=>window.JuntoCloud.synchronize());await a.context.setOffline(false);await a.page.evaluate(()=>window.JuntoCloud.synchronize());await expect.poll(async()=>{await a.page.evaluate(()=>window.JuntoCloud.synchronize());return a.page.evaluate(()=>window.JuntoApp.getState().transactions.length);}).toBe(2);await b.page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(()=>b.page.evaluate(()=>window.JuntoApp.getState().transactions.length)).toBe(2);expect(await b.page.evaluate(()=>window.JuntoApp.getState().users.map(u=>u.balance))).toEqual([-2500,-2500]);await b.page.evaluate(()=>document.querySelector('[data-action="profile-photo-switch"]').click());expect(await b.page.evaluate(()=>window.JuntoApp.getActive())).toBe('b');
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
