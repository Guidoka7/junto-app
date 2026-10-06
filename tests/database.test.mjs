import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333',D='44444444-4444-4444-8444-444444444444';
const state=()=>({schema:1,users:[{id:'a',name:'Gui',balance:10000}],bills:[],goals:[],transactions:[],requests:[],activity:[],notifications:[],incomes:[],received:[],saves:[],bankImports:[],demo:false});
test('database: membership isolation, one-use invites, CAS and malformed payloads',async()=>{
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const id of[A,B,C,D])await db.query('insert into auth.users(id) values($1)',[id]);
 const sql=await readFile(new URL('../supabase/setup.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql); // repeatable setup
 async function as(uid,query,args=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);await db.exec(`set role ${uid?'authenticated':'anon'}`);try{return(await db.query(query,args)).rows;}finally{await db.exec('reset role');}}
 const rpc=async(uid,name,args=[])=>{const placeholders=args.map((_,i)=>`$${i+1}`).join(',');const rows=await as(uid,`select public.${name}(${placeholders}) as result`,args);return rows[0].result;};
 await assert.rejects(()=>rpc(null,'junto_read_space'),/permission denied/);
 const space=await rpc(A,'junto_create_space',['Gui',state()]);assert.equal(space.slot,'a');assert.equal(space.members,1);
 assert.deepEqual(await as(C,'select * from public.junto_snapshots'),[]);
 await assert.rejects(()=>as(C,'update public.junto_snapshots set revision=999'),/permission denied/);
 await assert.rejects(()=>rpc(C,'junto_sync_space',[space.space_id,1,state()]),/ACCESS_DENIED/);
 await assert.rejects(()=>rpc(C,'junto_make_invite',[space.space_id]),/NOT_OWNER/);
 const invite=await rpc(A,'junto_make_invite',[space.space_id]);assert.match(invite.code,/^[A-F0-9]{16}$/);
 const joined=await rpc(B,'junto_join_space',[invite.code,'Bia']);assert.equal(joined.members,2);assert.equal(joined.slot,'b');assert.equal(joined.payload.users[1].name,'Bia');
 const reused=await rpc(C,'junto_join_space',[invite.code,'Terceiro']);assert.equal(reused.error,'INVITE_INVALID');
 await assert.rejects(()=>rpc(A,'junto_make_invite',[space.space_id]),/COUPLE_FULL/);
 const newState=structuredClone(joined.payload);newState.transactions=[{id:'expense1',name:'Mercado',payer:'a',amount:1000,date:'2026-10-06'}];newState.users[0].balance-=1000;
 const synced=await rpc(A,'junto_sync_space',[space.space_id,joined.revision,newState]);assert.equal(synced.conflict,false);assert.equal(synced.revision,joined.revision+1);
 const stale=await rpc(B,'junto_sync_space',[space.space_id,joined.revision,joined.payload]);assert.equal(stale.conflict,true);assert.equal(stale.payload.transactions.length,1);
 const seen=await rpc(B,'junto_read_space');assert.equal(seen.payload.users[0].balance,9000);
 const bad=structuredClone(newState);delete bad.users;await assert.rejects(()=>rpc(A,'junto_sync_space',[space.space_id,synced.revision,bad]),/INVALID_USERS/);
 await assert.rejects(()=>as(B,'select * from junto_private.invites'),/permission denied/);
 for(let i=0;i<10;i++)await rpc(D,'junto_join_space',['0000000000000000','D']);const limited=await rpc(D,'junto_join_space',['0000000000000000','D']);assert.equal(limited.error,'TOO_MANY_ATTEMPTS');
 await db.close();
});
