import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333';
const fingerprint='f'.repeat(64);
function finances(name,balance){return{schema:1,users:[{id:'a',name,balance,tone:'blue'}],
 transactions:[{id:'paid',name:'Internet '+name,payer:'a',by:'a',billId:'bill',recurringKey:'series',amount:2500,balanceDelta:-2500,date:'2026-10-01'},
  {id:'bank:'+fingerprint,name:'Café '+name,payer:'a',by:'a',amount:500,balanceDelta:0,date:'2026-10-01',bankSource:{fingerprint}}],
 bills:[{id:'bill',name:'Internet '+name,payer:'a',amount:2500,due:'2026-10-01',status:'paid',recurring:true,recurringKey:'series'}],
 goals:[{id:'goal',name:'Reserva '+name,saved:3000,target:100000}],
 incomes:[{id:'salary',name:'Salário '+name,person:'a',amount:50000,rule:'monthly',day:5,auto:false,since:'2026-09-01'}],
 received:[{id:'receipt',incomeId:'salary',person:'a',amount:50000,status:'received',date:'2026-10-05',balanceDelta:50000}],
 saves:[{id:'saving',incomeId:'salary',goalId:'goal',actor:'a',amount:3000,source:'income',incomeDate:'2026-10-05',date:'2026-10-05'}],
 requests:[{id:'request',author:'a',recipient:'b',title:'Pedido '+name,amount:1200,status:'cancelled'}],
 notifications:[{id:'note',to:'a',requestId:'request',text:'Aviso '+name}],activity:[{id:'log',actor:'a',text:'Registro '+name}],
 challenges:[{id:'challenge',person:'a',cheers:['b'],status:'active'}],commitments:[{id:'cut',person:'a',item:'Café',active:true}],
 bankImports:[{id:fingerprint,recordId:'bank:'+fingerprint,kind:'expense'}],budgets:{Alimentação:10000},learned:{[name]:{category:'Outros'}},
 plan:{goalId:'goal',monthly:3000,auto:false},settings:{personalBudget:{a:{fare:525,trips:2,debtPrincipal:30000}},couplePhoto:'',yieldRate:10},demo:false};}
async function database(t){
 const db=new PGlite();t.after(()=>db.close());
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;");
 for(const id of[A,B,C])await db.query('insert into auth.users values($1)',[id]);
 await db.exec(await readFile(new URL('../supabase/setup.sql',import.meta.url),'utf8'));
 async function rpc(uid,name,args=[]){
  await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);await db.exec(`set role ${uid?'authenticated':'anon'}`);
  try{return(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args)).rows[0].result;}finally{await db.exec('reset role');}
 }
 return{db,rpc};
}
test('solo join combines both ledgers, preserves balances and rewrites every financial relationship',async t=>{
 const{db,rpc}=await database(t),left=finances('Gui',90000),right=finances('Bia',27500);
 left.transactions[1].id='bank:'+'e'.repeat(64);left.transactions[1].bankSource.fingerprint='e'.repeat(64);left.bankImports[0]={id:'e'.repeat(64),recordId:left.transactions[1].id,kind:'expense'};
 const target=await rpc(A,'junto_create_space',['Gui',left]),source=await rpc(B,'junto_create_space',['Bia',right]);
 const joined=await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[target.space_id])).code,'Bia']),p=joined.payload;
 assert.deepEqual(p.users.map(u=>u.balance),[90000,27500]);assert.equal(joined.personal_archive_pending,false);
 for(const key of['transactions','bills','goals','incomes','received','saves','requests','notifications','activity','challenges','commitments']){
  assert.equal(p[key].length,left[key].length+right[key].length);assert.equal(new Set(p[key].map(r=>r.id)).size,p[key].length);
  for(const row of left[key])assert.deepEqual(p[key].find(r=>r.id===row.id),row);
 }
 const bill=p.bills.find(r=>r.payer==='b'),income=p.incomes.find(r=>r.person==='b'),goal=p.goals.find(r=>r.id!=='goal'),paid=p.transactions.find(r=>r.payer==='b'&&r.billId);
 assert.equal(paid.billId,bill.id);assert.equal(paid.recurringKey,bill.recurringKey);assert.equal(paid.by,'b');
 const receipt=p.received.find(r=>r.person==='b'),saving=p.saves.find(r=>r.actor==='b');
 assert.equal(receipt.incomeId,income.id);assert.equal(saving.incomeId,income.id);assert.equal(saving.goalId,goal.id);assert.equal(goal.saved,3000);
 const req=p.requests.find(r=>r.author==='b'),note=p.notifications.find(r=>r.to==='b');assert.equal(req.recipient,'a');assert.equal(note.requestId,req.id);
 assert.deepEqual(p.challenges.find(r=>r.person==='b').cheers,['a']);
 assert.equal(p.bankImports.find(r=>r.id===fingerprint).recordId,p.transactions.find(r=>r.payer==='b'&&r.bankSource).id);
 assert.deepEqual(p.settings.personalBudget,{a:left.settings.personalBudget.a,b:right.settings.personalBudget.a});
 assert.equal(p.settings.personalPlans.b.goalId,goal.id);assert.deepEqual(p.plan,left.plan);assert.equal(p.budgets.Alimentação,20000);
 assert.deepEqual(await rpc(B,'junto_read_personal_archive'),source.payload);
 assert.equal((await rpc(B,'junto_restore_personal_archive',[joined.revision,true])).revision,joined.revision);
 assert.equal((await db.query('select count(*)::int as n from junto_private.solo_transfers')).rows[0].n,1);
 await assert.rejects(()=>rpc(A,'junto_restore_personal_archive',[joined.revision,true]),/ACCESS_DENIED/);
 await assert.rejects(()=>rpc(C,'junto_restore_personal_archive',[joined.revision,true]),/ACCESS_DENIED/);
 await assert.rejects(()=>rpc(null,'junto_restore_personal_archive',[joined.revision,true]),/permission denied/);
});
test('legacy recovery preserves new shared records and is idempotent even after imported rows are deleted',async t=>{
 const{db,rpc}=await database(t),left=finances('Gui',90000),right=finances('Bia',27500);
 const target=await rpc(A,'junto_create_space',['Gui',left]),source=await rpc(B,'junto_create_space',['Bia',right]);
 await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[target.space_id])).code,'Bia']);
 const legacy=structuredClone(left);legacy.users.push({id:'b',name:'Bia',balance:12345,tone:'pink'});
 legacy.transactions.push({id:'after-join',name:'Novo gasto',payer:'b',by:'b',amount:500,date:'2026-10-07'});
 await db.query('delete from junto_private.solo_transfers where source_space_id=$1',[source.space_id]);
 await db.query('update public.junto_snapshots set payload=$2,revision=revision+1 where space_id=$1',[target.space_id,legacy]);
 const pending=await rpc(B,'junto_read_space');assert.equal(pending.personal_archive_pending,true);assert.equal((await rpc(A,'junto_read_space')).personal_archive_pending,false);
 await assert.rejects(()=>rpc(B,'junto_restore_personal_archive',[pending.revision-1,true]),/RESTORE_CHANGED/);
 assert.deepEqual((await rpc(B,'junto_read_space')).payload,legacy);
 const recovered=await rpc(B,'junto_restore_personal_archive',[pending.revision,false]);
 assert.deepEqual(recovered.payload.users.map(u=>u.balance),[90000,12345]);assert.equal(recovered.payload.transactions.length,5);
 assert.deepEqual(recovered.payload.transactions.find(r=>r.id==='after-join'),legacy.transactions.at(-1));assert.deepEqual(recovered.payload.users[0],legacy.users[0]);assert.equal(recovered.personal_archive_pending,false);
 assert.deepEqual(await rpc(B,'junto_restore_personal_archive',[pending.revision,true]),recovered);
 const edited=structuredClone(recovered.payload);edited.transactions=edited.transactions.filter(r=>r.id==='after-join'||r.payer==='a');
 const synced=await rpc(B,'junto_sync_space',[target.space_id,recovered.revision,edited]);
 assert.deepEqual((await rpc(B,'junto_restore_personal_archive',[synced.revision,true])).payload,edited);
 assert.deepEqual(await rpc(B,'junto_read_personal_archive'),source.payload);
});
test('legacy recovery restores a zeroed profile without recharging old expenses or losing the other account',async t=>{
 const{db,rpc}=await database(t),left=finances('Gui',90000),right=finances('Bia',27500);
 const target=await rpc(A,'junto_create_space',['Gui',left]),source=await rpc(B,'junto_create_space',['Bia',right]);
 await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[target.space_id])).code,'Bia']);
 const legacy=structuredClone(left);legacy.users.push({id:'b',name:'Bia',balance:0,tone:'pink'});
 await db.query('delete from junto_private.solo_transfers where source_space_id=$1',[source.space_id]);await db.query('update public.junto_snapshots set payload=$2 where space_id=$1',[target.space_id,legacy]);
 const pending=await rpc(B,'junto_read_space'),recovered=await rpc(B,'junto_restore_personal_archive',[pending.revision,true]);
 assert.deepEqual(recovered.payload.users.map(u=>u.balance),[90000,27500]);assert.equal(recovered.payload.transactions.length,4);assert.equal(recovered.payload.bankImports.length,1);assert.equal(recovered.personal_archive_pending,false);
});
test('legacy recovery adds the solo balance while retaining expenses made after joining',async t=>{
 const{db,rpc}=await database(t),left=finances('Gui',90000),right=finances('Bia',27500);
 const target=await rpc(A,'junto_create_space',['Gui',left]),source=await rpc(B,'junto_create_space',['Bia',right]);
 await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[target.space_id])).code,'Bia']);
 const legacy=structuredClone(left);legacy.users.push({id:'b',name:'Bia',balance:-2300,tone:'pink'});
 const recent={id:'after-join',name:'Novo gasto',payer:'b',by:'b',amount:2300,balanceDelta:-2300,date:'2026-10-07'};legacy.transactions.push(recent);
 await db.query('delete from junto_private.solo_transfers where source_space_id=$1',[source.space_id]);await db.query('update public.junto_snapshots set payload=$2 where space_id=$1',[target.space_id,legacy]);
 const pending=await rpc(B,'junto_read_space'),recovered=await rpc(B,'junto_restore_personal_archive',[pending.revision,true]);
 assert.deepEqual(recovered.payload.users.map(u=>u.balance),[90000,25200]);assert.deepEqual(recovered.payload.transactions.find(r=>r.id==='after-join'),recent);
 assert.equal(recovered.payload.transactions.length,5);assert.deepEqual(await rpc(B,'junto_restore_personal_archive',[pending.revision,true]),recovered);
 assert.deepEqual(await rpc(B,'junto_read_personal_archive'),source.payload);
});
