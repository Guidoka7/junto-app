import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333';
const blank=name=>({schema:1,users:[{id:'a',name,balance:0}],transactions:[],bills:[],goals:[],incomes:[],received:[],saves:[],requests:[],notifications:[],activity:[],commitments:[],challenges:[],bankImports:[],settings:{},budgets:{},learned:{},plan:null});
async function database(t){
 const db=new PGlite();t.after(()=>db.close());await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;");
 for(const id of[A,B,C])await db.query('insert into auth.users values($1)',[id]);await db.exec(await readFile('supabase/setup.sql','utf8'));
 async function rpc(uid,name,args=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);await db.exec('set role '+(uid?'authenticated':'anon'));try{return(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args)).rows[0].result;}finally{await db.exec('reset role');}}
 const created=await rpc(A,'junto_create_space',['Gui',blank('Gui')]);await rpc(B,'junto_create_space',['Bia',blank('Bia')]);const joined=await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[created.space_id])).code,'Bia']);
 return{db,rpc,joined};
}
test('disconnect preserves both cash balances, apportions shared ledgers and revokes cross-account access',async t=>{
 const{db,rpc,joined}=await database(t),p=joined.payload;p.users[0].balance=90000;p.users[1].balance=45000;
 p.transactions=[{id:'gui',name:'Gui',amount:400,payer:'a',by:'a',date:'2026-10-07'},{id:'bia',name:'Bia',amount:600,payer:'b',by:'b',date:'2026-10-07',balanceDelta:0},
 {id:'split',name:'Dividido',amount:1001,payer:'half',split:[{id:'a',amount:501},{id:'b',amount:500}],balanceDelta:-1001,date:'2026-10-07'}];
 p.bills=[{id:'shared-bill',name:'Internet',amount:3001,payer:'half',due:'2026-10-10',status:'open',recurring:true}];
 p.incomes=[{id:'income-a',name:'Salário Gui',person:'a',amount:100000,rule:'monthly',day:10},{id:'income-b',name:'Salário Bia',person:'b',amount:200000,rule:'monthly',day:10}];
 p.received=[{id:'paid-a',incomeId:'income-a',person:'a',date:'2026-10-01',amount:100000,status:'received'},{id:'skipped-b',incomeId:'income-b',person:'b',date:'2026-10-01',amount:0,status:'skipped'}];
 p.goals=[{id:'goal',name:'Carro',target:500000,saved:5001},{id:'old-goal',name:'Reserva',target:100000,saved:2001}];
 p.saves=[{id:'save-a',goalId:'goal',actor:'a',amount:3001,date:'2026-10-01'},{id:'save-b',goalId:'goal',actor:'b',amount:2000,date:'2026-10-01'}];
 p.plan={goalId:'goal',name:'Guardar',monthly:6001,auto:true};p.requests=[{id:'request',author:'a',recipient:'b',amount:1000,status:'approved'}];
 p.settings={personalEstimates:{a:9000,b:10000},personalBudgets:{a:{Delivery:6000},b:{Delivery:7000}},personalBudget:{a:{fare:550,trips:2},b:{fare:600,trips:1}}};
 p.activity=[{id:'log-a',actor:'a',message:'Meu registro'},{id:'log-b',actor:'b',message:'Registro Bia'}];
 p.bankImports=[{id:'a'.repeat(64),recordId:'gui'},{id:'b'.repeat(64),recordId:'bia'}];
 const synced=await rpc(A,'junto_sync_space',[joined.space_id,joined.revision,p]);
 await assert.rejects(()=>rpc(C,'junto_disconnect_space',[joined.space_id,synced.revision]),/ACCESS_DENIED/);
 await assert.rejects(()=>rpc(null,'junto_disconnect_space',[joined.space_id,synced.revision]),/permission denied/);
 await assert.rejects(()=>rpc(B,'junto_disconnect_space',[joined.space_id,synced.revision-1]),/DISCONNECT_CHANGED/);
 assert.equal((await rpc(A,'junto_read_space')).members,2);
 const b=await rpc(B,'junto_disconnect_space',[joined.space_id,synced.revision]),a=await rpc(A,'junto_read_space');
 assert.equal(a.members,1);assert.equal(b.members,1);assert.equal(a.slot,'a');assert.equal(b.slot,'a');assert.notEqual(a.space_id,b.space_id);
 assert.deepEqual(a.payload.users.map(u=>u.balance),[90000]);assert.deepEqual(b.payload.users.map(u=>u.balance),[45000]);
 assert.deepEqual(a.payload.transactions.map(x=>[x.id,x.amount]),[['gui',400],['split',501]]);assert.deepEqual(b.payload.transactions.map(x=>[x.id,x.amount]),[['bia',600],['split',500]]);
 assert.equal(b.payload.transactions[0].balanceDelta,0);assert.equal(b.payload.transactions[1].balanceDelta,-500);assert.equal(b.payload.transactions[1].payer,'a');
 assert.equal(a.payload.bills[0].amount+b.payload.bills[0].amount,3001);assert.equal(b.payload.incomes[0].person,'a');assert.equal(b.payload.received[0].status,'skipped');
 assert.deepEqual(a.payload.goals.map(g=>g.saved),[3001,1001]);assert.deepEqual(b.payload.goals.map(g=>g.saved),[2000,1000]);assert.equal(a.payload.plan.monthly+b.payload.plan.monthly,6001);
 assert.equal(b.payload.saves[0].actor,'a');assert.equal(b.payload.requests[0].status,'cancelled');assert.deepEqual(b.payload.budgets,{Delivery:7000});assert.equal(b.payload.settings.variableEstimate,10000);assert.equal(b.payload.settings.personalBudget.a.fare,600);
 assert.deepEqual(b.payload.bankImports.map(x=>x.recordId),['bia']);assert.deepEqual(b.payload.activity.map(x=>x.id),['log-b']);
 assert.deepEqual(await rpc(B,'junto_read_personal_archive'),b.payload);assert.deepEqual((await rpc(B,'junto_disconnect_space',[joined.space_id,synced.revision])).payload,b.payload);
 await assert.rejects(()=>rpc(A,'junto_sync_space',[joined.space_id,synced.revision,p]),/ACCESS_DENIED/);await assert.rejects(()=>rpc(B,'junto_sync_space',[a.space_id,a.revision,a.payload]),/ACCESS_DENIED/);
 assert.deepEqual((await db.query('select payload from public.junto_snapshots where space_id=$1',[joined.space_id])).rows[0].payload,p);
 // A reconnection carries each individual history once, with no old recovery prompt.
 const paired=await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[a.space_id])).code,'Bia']);assert.equal(paired.personal_archive_pending,false);
 assert.equal(paired.payload.transactions.reduce((sum,r)=>sum+r.amount,0),2001);assert.deepEqual(paired.payload.users.map(u=>u.balance),[90000,45000]);
});
