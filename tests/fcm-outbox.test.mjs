import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111', B='22222222-2222-4222-8222-222222222222', C='33333333-3333-4333-8333-333333333333';
const DA='44444444-4444-4444-8444-444444444444', DB='55555555-5555-4555-8555-555555555555';
const SA='66666666-6666-4666-8666-666666666666', SB='77777777-7777-4777-8777-777777777777';
const blank=name=>({schema:1,users:[{id:'a',name,balance:10000}],transactions:[],bills:[],goals:[],incomes:[],received:[],saves:[],requests:[],notifications:[],activity:[],commitments:[],challenges:[],bankImports:[],settings:{},budgets:{},learned:{},plan:null});
const notice=(id='notice-1',extra={})=>({id,from:'a',to:'b',kind:'info',read:false,createdAt:Date.now(),title:'Original notice',body:'Original financial detail',...extra});
const migration='supabase/migrations/'+(await readdir('supabase/migrations')).find(f=>f.endsWith('_junto_fcm_outbox.sql'));
async function database(t) {
  const db=new PGlite();t.after(()=>db.close());
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create table auth.users(id uuid primary key);create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)$$;
    grant usage on schema auth to authenticated,anon,service_role;grant execute on function auth.uid(),auth.jwt() to authenticated,anon,service_role;`);
  for(const id of[A,B,C])await db.query('insert into auth.users values($1)',[id]);
  await db.query('insert into auth.sessions(id,user_id) values($1,$2),($3,$4)',[SA,A,SB,B]);
  await db.exec(await readFile('supabase/setup.sql','utf8'));await db.exec(await readFile('supabase/push-devices.sql','utf8'));
  const sql=await readFile(migration,'utf8');await db.exec(sql);await db.exec(sql);
  async function as(uid,query,args=[]) {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[uid||'',JSON.stringify({sub:uid,role:uid?'authenticated':'anon',session_id:uid===A?SA:uid===B?SB:null})]);
    await db.exec('set role '+(uid?'authenticated':'anon'));
    try{return(await db.query(query,args)).rows;}finally{await db.exec('reset role');}
  }
  const rpc=async(uid,name,args=[])=> (await as(uid,`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args))[0].result;
  async function service(name,args=[]) {
    if(name==='junto_push_claim'&&args.length===2)args=[...args,args[1]===B?SB:SA];
    await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claims','{\"role\":\"service_role\"}',false)");await db.exec('set role service_role');
    try{return(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args)).rows[0].result;}finally{await db.exec('reset role');}
  }
  const created=await rpc(A,'junto_create_space',['Gui',blank('Gui')]);await rpc(B,'junto_create_space',['Bia',blank('Bia')]);
  const paired=await rpc(B,'junto_join_space',[(await rpc(A,'junto_make_invite',[created.space_id])).code,'Bia']);
  await as(A,'insert into public.junto_push_devices(user_id,device_id,token) values($1,$2,$3)',[A,DA,'synthetic-A-token-'.repeat(3)]);
  await as(B,'insert into public.junto_push_devices(user_id,device_id,token,session_id) values($1,$2,$3,$4)',[B,DB,'synthetic-B-token-'.repeat(3),SA]);
  const sync=async(uid,notices,requests=[])=>{
    const current=await rpc(uid,'junto_read_space');current.payload.notifications=notices;current.payload.requests=requests;
    return rpc(uid,'junto_sync_space',[current.space_id,current.revision,current.payload]);
  };
  return{db,as,rpc,service,paired,sync};
}

test('outbox: authenticated author, exact partner, private queue, service-only RPC and original finance',async t=>{
  const {db,as,service,paired,sync}=await database(t);
  const n=notice();await sync(A,[n]);
  const events=(await db.query('select * from junto_private.push_events')).rows;assert.equal(events.length,1);assert.equal(events[0].actor_id,A);assert.equal(events[0].recipient_id,B);
  const saved=(await db.query('select payload from public.junto_snapshots where space_id=$1',[paired.space_id])).rows[0].payload;
  assert.deepEqual(saved.notifications,[n]);assert.deepEqual(saved.users.map(u=>u.balance),[10000,10000]);
  assert.deepEqual((await as(A,'select user_id from public.junto_push_devices')).map(r=>r.user_id),[A]);
  assert.deepEqual((await as(B,'select session_id from public.junto_push_devices')).map(r=>r.session_id),[SB]); // client spoof ignored
  await assert.rejects(()=>as(null,'select * from public.junto_push_devices'),/permission denied/);
  for(const uid of[A,C,null]){
    await assert.rejects(()=>as(uid,'select * from junto_private.push_events'),/permission denied/);
    await assert.rejects(()=>as(uid,'select public.junto_push_claim($1,$2,$3)',[paired.space_id,A,SA]),/permission denied/);
    await assert.rejects(()=>as(uid,'select junto_private.push_claim($1,$2,$3)',[paired.space_id,A,SA]),/permission denied/);
  }
  const deliveries=await service('junto_push_claim',[paired.space_id,A]);assert.equal(deliveries.length,1);assert.equal(deliveries[0].token,'synthetic-B-token-'.repeat(3));
  assert.equal(await service('junto_push_active',[deliveries[0].delivery_id,deliveries[0].claim_id]),true);
  await assert.rejects(()=>service('junto_push_claim',[paired.space_id,C]),/SESSION_REQUIRED/);
});
test('outbox: forged actor, outsider, self, old history, future date and missing author cannot enqueue',async t=>{
  const {db,sync}=await database(t);
  const invalid=[notice('forged',{from:'b'}),notice('outsider',{to:'c'}),notice('self',{to:'a'}),notice('legacy',{from:undefined}),notice('old',{createdAt:Date.now()-25*3600000}),notice('future',{createdAt:Date.now()+600000}),notice('read',{read:true}),notice('bad-kind',{kind:'system'}),notice('missing-request',{kind:'request',requestId:'absent'})];
  await sync(A,invalid);assert.equal((await db.query('select count(*)::int as n from junto_private.push_events')).rows[0].n,0);
});
test('outbox: requests and answers must match persisted author, recipient and status',async t=>{
  const {db,sync}=await database(t);
  const request={id:'request-1',author:'a',recipient:'b',status:'pending',amount:1000};
  await sync(A,[notice('request',{kind:'request',requestId:request.id})],[request]);
  request.status='approved';await sync(B,[notice('approved',{from:'b',to:'a',kind:'approved',requestId:request.id})],[request]);
  await sync(A,[notice('forged-answer',{kind:'approved',requestId:request.id})],[request]);
  assert.deepEqual((await db.query('select kind from junto_private.push_events order by created_at')).rows.map(r=>r.kind),['request','approved']);
});
test('outbox: read changes, deletions and reinserted IDs never replay accepted deliveries',async t=>{
  const {db,service,paired,sync}=await database(t);const n=notice();await sync(A,[n]);
  const [d]=await service('junto_push_claim',[paired.space_id,A]);assert.equal(await service('junto_push_finish',[d.delivery_id,d.claim_id,'accepted',null,false]),true);
  await sync(B,[{...n,read:true}]);await sync(A,[]);await sync(A,[n]);
  assert.equal((await db.query('select count(*)::int as n from junto_private.push_events')).rows[0].n,1);assert.deepEqual(await service('junto_push_claim',[paired.space_id,A]),[]);
  assert.equal(await service('junto_push_finish',[d.delivery_id,d.claim_id,'unknown','FCM_DELIVERY_UNCERTAIN',false]),false);
  assert.equal((await db.query('select state from junto_private.push_deliveries')).rows[0].state,'accepted');
});
test('outbox: claims are exclusive and interrupted workers are never retried',async t=>{
  const {db,service,paired,sync}=await database(t);await sync(A,[notice()]);
  const [first]=await service('junto_push_claim',[paired.space_id,A]);assert.ok(first);
  assert.deepEqual(await service('junto_push_claim',[paired.space_id,A]),[]);
  await db.exec("update junto_private.push_deliveries set claimed_at=now()-interval '6 minutes'");
  assert.deepEqual(await service('junto_push_claim',[paired.space_id,A]),[]);assert.equal((await db.query('select state from junto_private.push_deliveries')).rows[0].state,'unknown');
});
test('outbox: disabling or replacing a token invalidates an in-flight claim',async t=>{
  const {as,service,paired,sync}=await database(t);await sync(A,[notice()]);const [d]=await service('junto_push_claim',[paired.space_id,A]);
  await as(B,'update public.junto_push_devices set token=$1 where user_id=$2',['synthetic-replacement-'.repeat(3),B]);assert.equal(await service('junto_push_active',[d.delivery_id,d.claim_id]),false);
  await as(B,'update public.junto_push_devices set enabled=false where user_id=$1',[B]);assert.equal(await service('junto_push_active',[d.delivery_id,d.claim_id]),false);
});
test('outbox: logout removes the device through its server-bound session',async t=>{
  const {db,service,paired,sync}=await database(t);await sync(A,[notice()]);const [d]=await service('junto_push_claim',[paired.space_id,A]);
  await db.query('delete from auth.sessions where id=$1',[SB]);assert.equal((await db.query('select count(*)::int as n from public.junto_push_devices where user_id=$1',[B])).rows[0].n,0);
  assert.equal(await service('junto_push_active',[d.delivery_id,d.claim_id]),false);
});
test('outbox: expired recipient session prevents new deliveries',async t=>{
  const {db,service,paired,sync}=await database(t);await sync(A,[notice()]);await db.query("update auth.sessions set not_after=now()-interval '1 minute' where id=$1",[SB]);
  assert.deepEqual(await service('junto_push_claim',[paired.space_id,A]),[]);
});
test('outbox: disconnect blocks delivery to the former partner',async t=>{
  const {rpc,service,paired,sync}=await database(t);const saved=await sync(A,[notice()]);const [d]=await service('junto_push_claim',[paired.space_id,A]);
  await rpc(B,'junto_disconnect_space',[paired.space_id,saved.revision]);assert.equal(await service('junto_push_active',[d.delivery_id,d.claim_id]),false);assert.deepEqual(await service('junto_push_claim',[paired.space_id,A]),[]);
});
test('outbox: only proven UNREGISTERED can disable the exact claimed token',async t=>{
  const {db,service,paired,sync}=await database(t);await sync(A,[notice('one'),notice('two')]);const [one,two]=await service('junto_push_claim',[paired.space_id,A]);
  assert.equal(await service('junto_push_finish',[one.delivery_id,one.claim_id,'failed','FCM_REJECTED',true]),true);
  assert.equal((await db.query('select enabled from public.junto_push_devices where user_id=$1',[B])).rows[0].enabled,true);
  assert.equal(await service('junto_push_finish',[two.delivery_id,two.claim_id,'failed','UNREGISTERED',true]),true);
  assert.equal((await db.query('select enabled from public.junto_push_devices where user_id=$1',[B])).rows[0].enabled,false);
});
test('outbox: fan-out cap preserves all existing notifications and balances',async t=>{
  const {db,paired,sync}=await database(t),notifications=Array.from({length:25},(_,i)=>notice('notice-'+i));await sync(A,notifications);
  assert.equal((await db.query('select count(*)::int as n from junto_private.push_events')).rows[0].n,20);
  const s=(await db.query('select payload from public.junto_snapshots where space_id=$1',[paired.space_id])).rows[0].payload;assert.deepEqual(s.notifications,notifications);assert.deepEqual(s.users.map(u=>u.balance),[10000,10000]);
});
test('outbox: live sessions cannot be spoofed and another account cannot register devices',async t=>{
  const {db,as}=await database(t);
  await assert.rejects(()=>as(A,'insert into public.junto_push_devices(user_id,device_id,token) values($1,$2,$3)',[B,'88888888-8888-4888-8888-888888888888','synthetic-attack-token-'.repeat(3)]),/LOGIN_REQUIRED|row-level security/);
  await db.query('delete from auth.sessions where id=$1',[SA]);
  await assert.rejects(()=>as(A,'insert into public.junto_push_devices(user_id,device_id,token) values($1,$2,$3)',[A,DA,'synthetic-old-session-'.repeat(3)]),/SESSION_REQUIRED/);
});
