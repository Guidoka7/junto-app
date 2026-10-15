import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, createRepository } from '../supabase/functions/junto-push/handler.js';
import { createFcmClient, parseServiceAccount } from '../supabase/functions/junto-push/fcm.js';
import { createPushDispatcher } from '../src/features/push-dispatch.js';

const A='11111111-1111-4111-8111-111111111111', S='22222222-2222-4222-8222-222222222222';
const D='33333333-3333-4333-8333-333333333333', C='44444444-4444-4444-8444-444444444444', E='55555555-5555-4555-8555-555555555555';
const jwt='header.'+Buffer.from(JSON.stringify({sub:A,role:'authenticated',session_id:C,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.verified-by-auth-mock';
// Ephemeral test key only; never an actual Firebase credential.
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const pem='-----BEGIN PRIVATE KEY-----\n'+Buffer.from(await crypto.subtle.exportKey('pkcs8',keys.privateKey)).toString('base64')+'\n-----END PRIVATE KEY-----\n';
const raw={type:'service_account',project_id:'junto-apk',client_email:'test@junto-apk.iam.gserviceaccount.com',private_key:pem,token_uri:'https://oauth2.googleapis.com/token'};
const account=()=>parseServiceAccount(JSON.stringify(raw),'junto-apk');
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const delivery={delivery_id:D,claim_id:C,event_id:E,notification_id:'notice-1',kind:'request',token:'synthetic-device-token'};
function fixture(options={}) {
  const calls={claimed:0,sent:0,finished:[]};
  const vars={JUNTO_FCM_ENABLED:'true',FIREBASE_PROJECT_ID:'junto-apk',FIREBASE_SERVICE_ACCOUNT_JSON:JSON.stringify(raw),...options.vars};
  const repo={
    authenticate:async()=>options.user===undefined?{id:A,is_anonymous:false}:options.user,
    membership:async()=>options.member===undefined?{space_id:S,slot:'a'}:options.member,
    claim:async(space,actor,session)=>{assert.equal(space,S);assert.equal(actor,A);assert.equal(session,C);calls.claimed++;return options.deliveries||[delivery];},
    active:async()=>options.active!==false,
    finish:async(d,r)=>{calls.finished.push({...r});if(options.finishThrows)throw new Error('PRIVATE_DATABASE_DETAIL');return true;},
    ...options.repo
  };
  const fcm={accessToken:async()=>{if(options.authThrows)throw new Error('PRIVATE_KEY_DETAIL');return 'synthetic-access-token';},send:async(d,token)=>{assert.equal(token,'synthetic-access-token');calls.sent++;return options.result||{outcome:'accepted',code:null};}};
  const handler=createHandler({env:key=>vars[key],repository:repo,fcmFactory:()=>fcm});
  const req=(body={spaceId:S},extra={})=>new Request('https://functions.example/junto-push',{method:'POST',headers:{Authorization:'Bearer '+jwt,'Content-Type':'application/json',...extra.headers},body:JSON.stringify(body),...extra});
  return {calls,handler,req};
}
for(const [name,extra] of [
  ['missing bearer',{headers:{'Content-Type':'application/json'}}],
  ['API key is not user authentication',{headers:{Authorization:'Bearer sb_publishable_invalid','Content-Type':'application/json'}}]
]) test('handler rejects '+name,async()=>{
  const f=fixture({user:null}),r=await f.handler(f.req({spaceId:S},extra));assert.equal(r.status,401);assert.equal(f.calls.claimed,0);
});
test('anonymous Auth users cannot invoke the sender',async()=>{
  const f=fixture({user:{id:A,is_anonymous:true}});assert.equal((await f.handler(f.req())).status,403);assert.equal(f.calls.sent,0);
});
test('validated bearer must identify an authenticated, unexpired server session',async()=>{
  for(const claims of [{sub:A,role:'authenticated'}, {sub:A,role:'anon',session_id:C,exp:Date.now()/1000+3600}, {sub:A,role:'authenticated',session_id:C,exp:1}, {sub:E,role:'authenticated',session_id:C,exp:Date.now()/1000+3600}]){
    const f=fixture(),token='header.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.auth-mock';
    const r=await f.handler(f.req({spaceId:S},{headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}}));assert.equal(r.status,401);assert.equal(f.calls.claimed,0);
  }
});
test('a user from another couple cannot claim deliveries',async()=>{
  const f=fixture({member:{space_id:E,slot:'a'}});assert.equal((await f.handler(f.req())).status,403);assert.equal(f.calls.claimed,0);
});
for(const body of [{spaceId:S,token:'forged'},{spaceId:S,recipientId:A},{spaceId:S,title:'forged'},null,[],{spaceId:'invalid'}]) {
  test('caller cannot supply recipients, tokens or message content: '+JSON.stringify(body),async()=>{
    const f=fixture();assert.equal((await f.handler(f.req(body))).status,400);assert.equal(f.calls.sent,0);
  });
}
test('request size cap applies without trusting Content-Length',async()=>{
  const f=fixture();assert.equal((await f.handler(f.req({spaceId:S,garbage:'x'.repeat(2000)}))).status,413);assert.equal(f.calls.claimed,0);
});
test('disallowed CORS origin cannot invoke the sender',async()=>{
  const f=fixture();const r=await f.handler(f.req({spaceId:S},{headers:{Authorization:'Bearer synthetic.jwt','Content-Type':'application/json',Origin:'https://evil.example'}}));assert.equal(r.status,403);assert.equal(f.calls.sent,0);
});
test('preflight and method handling are explicit',async()=>{
  const f=fixture();const r=await f.handler(new Request('https://example/junto-push',{method:'OPTIONS',headers:{Origin:'https://localhost'}}));assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://localhost');assert.equal((await f.handler(new Request('https://example/junto-push'))).status,405);
});
test('feature flag and invalid credentials leave the queue untouched',async()=>{
  for(const vars of [{JUNTO_FCM_ENABLED:'false'},{FIREBASE_SERVICE_ACCOUNT_JSON:'bad-secret-json'},{FIREBASE_PROJECT_ID:'other-project'}]){
    const f=fixture({vars});const r=await f.handler(f.req());assert.equal(r.status,503);assert.equal(f.calls.claimed,0);assert.doesNotMatch(await r.text(),/PRIVATE KEY|bad-secret-json/);
  }
});
test('OAuth failure does not consume an event',async()=>{
  const f=fixture({authThrows:true});const r=await f.handler(f.req());assert.equal(r.status,503);assert.equal(f.calls.claimed,0);assert.equal(await r.text(),' {"error":"FCM_AUTH_UNAVAILABLE"}'.trim());
});
test('recipient is revalidated immediately before sending; disabled device is skipped',async()=>{
  const f=fixture({active:false});assert.equal((await f.handler(f.req())).status,200);assert.equal(f.calls.sent,0);assert.equal(f.calls.finished[0].outcome,'skipped');
});
test('successful endpoint only returns counts, never device tokens or credentials',async()=>{
  const f=fixture(),r=await f.handler(f.req());assert.equal(r.status,200);assert.deepEqual(await r.json(),{accepted:1,failed:0,unknown:0,skipped:0});assert.equal(f.calls.sent,1);assert.equal(f.calls.finished[0].outcome,'accepted');
});
test('ambiguous database result never causes another FCM attempt',async()=>{
  const f=fixture({finishThrows:true}),r=await f.handler(f.req());assert.deepEqual(await r.json(),{accepted:0,failed:0,unknown:1,skipped:0});assert.equal(f.calls.sent,1);
});
test('concurrent endpoint calls cannot reuse an atomically claimed delivery',async()=>{
  let claimed=false;const f=fixture({repo:{claim:async()=>{if(claimed)return[];claimed=true;return[delivery];}}});
  const responses=await Promise.all(Array.from({length:12},()=>f.handler(f.req())));assert.ok(responses.every(r=>r.status===200));assert.equal(f.calls.sent,1);
});
test('FCM sender signs real RS256 JWT, scopes it, caches OAuth and omits financial content',async()=>{
  let oauth=0,sends=0;const now=()=>1700000000000;
  const fcm=createFcmClient(account(),{now,fetchImpl:async(url,opts)=>{
    if(url==='https://oauth2.googleapis.com/token'){
      oauth++;const params=new URLSearchParams(opts.body),jwt=params.get('assertion'),parts=jwt.split('.');
      assert.equal(params.get('grant_type'),'urn:ietf:params:oauth:grant-type:jwt-bearer');
      assert.deepEqual(JSON.parse(Buffer.from(parts[1],'base64url').toString()),{iss:raw.client_email,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:url,iat:1700000000,exp:1700003600});
      assert.equal(await crypto.subtle.verify('RSASSA-PKCS1-v1_5',keys.publicKey,Buffer.from(parts[2],'base64url'),new TextEncoder().encode(parts[0]+'.'+parts[1])),true);
      return json({access_token:'oauth-test-value',expires_in:3600,token_type:'Bearer'});
    }
    sends++;assert.equal(url,'https://fcm.googleapis.com/v1/projects/junto-apk/messages:send');assert.equal(opts.headers.Authorization,'Bearer oauth-test-value');
    const body=JSON.parse(opts.body);assert.equal(body.message.android.notification.channel_id,'junto_avisos');assert.equal(body.message.android.notification.tag,E);assert.equal(body.message.android.notification.visibility,'PRIVATE');
    assert.deepEqual(Object.keys(body.message.data).sort(),['event_id','notification_id','screen']);assert.doesNotMatch(JSON.stringify(body),/R\$|Salário|PRIVATE KEY/);
    return json({name:'projects/junto-apk/messages/synthetic-message'});
  }});
  const tokens=await Promise.all([fcm.accessToken(),fcm.accessToken(),fcm.accessToken()]);assert.equal(oauth,1);
  assert.equal((await fcm.send(delivery,tokens[0])).outcome,'accepted');await fcm.accessToken();assert.equal(oauth,1);assert.equal(sends,1);
});
test('OAuth token renews before expiry',async()=>{
  let time=0,mints=0;const fcm=createFcmClient(account(),{now:()=>time,fetchImpl:async()=>{mints++;return json({access_token:'token-'+mints,expires_in:120,token_type:'Bearer'});}});
  await fcm.accessToken();time=59000;await fcm.accessToken();assert.equal(mints,1);time=61000;await fcm.accessToken();assert.equal(mints,2);
});
for(const [name,status,body,outcome,revoke] of [
  ['UNREGISTERED',404,{error:{details:[{'@type':'type.googleapis.com/google.firebase.fcm.v1.FcmError',errorCode:'UNREGISTERED'}]}},'failed',true],
  ['INVALID_ARGUMENT',400,{error:{details:[{'@type':'type.googleapis.com/google.firebase.fcm.v1.FcmError',errorCode:'INVALID_ARGUMENT'}]}},'failed',false],
  ['503 uncertain',503,{},'unknown',false],['429 rejected',429,{},'failed',false],['200 malformed',200,{},'unknown',false]
])test('FCM handles '+name+' without unsafe device deletion or retry',async()=>{
  let sends=0;const fcm=createFcmClient(account(),{fetchImpl:async()=>{sends++;return json(body,status);}}),r=await fcm.send(delivery,'test');assert.equal(r.outcome,outcome);assert.equal(r.revoke===true,revoke);assert.equal(sends,1);
});
test('FCM network timeout is an uncertain delivery, never an automatic retry',async()=>{
  let calls=0;const fcm=createFcmClient(account(),{fetchImpl:async()=>{calls++;throw new Error('PRIVATE_TOKEN_IN_NETWORK_ERROR');}});const r=await fcm.send(delivery,'test');assert.equal(r.outcome,'unknown');assert.equal(calls,1);assert.doesNotMatch(JSON.stringify(r),/PRIVATE_TOKEN/);
});
test('service account rejects wrong project and attacker-controlled token endpoint',()=>{
  for(const change of [{project_id:'another-project'},{token_uri:'https://evil.example/token'},{type:'authorized_user'},{private_key:'invalid'}])assert.throws(()=>parseServiceAccount(JSON.stringify({...raw,...change}),'junto-apk'),/FCM_CONFIGURATION_INVALID/);
});
test('REST auth and service-only RPCs use separate credentials and verified scope',async()=>{
  const seen=[],vars={SUPABASE_URL:'https://sbquedasoydfsvbarvos.supabase.co',SUPABASE_ANON_KEY:'synthetic-public',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service'};
  const repo=createRepository(k=>vars[k],async(url,opts)=>{seen.push({url,opts});return json(url.endsWith('/user')?{id:A}:[]);});
  await repo.authenticate('user-session');await repo.membership(A,'user-session');await repo.claim(S,A,C);
  assert.equal(seen[0].opts.headers.Authorization,'Bearer user-session');assert.equal(seen[1].opts.headers.apikey,'synthetic-public');assert.equal(seen[2].opts.headers.Authorization,'Bearer synthetic-service');assert.deepEqual(JSON.parse(seen[2].opts.body),{p_space_id:S,p_actor_id:A,p_session_id:C});
});
test('modern Supabase secret keys go only in apikey, never in Authorization',async()=>{
  const seen=[],vars={SUPABASE_URL:'https://sbquedasoydfsvbarvos.supabase.co',SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'sb_publishable_synthetic'}),SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_synthetic'})};
  const repo=createRepository(k=>vars[k],async(url,opts)=>{seen.push({url,opts});return json(url.endsWith('/user')?{id:A}:[]);});
  await repo.authenticate('user-jwt');await repo.claim(S,A,C);assert.equal(seen[0].opts.headers.Authorization,'Bearer user-jwt');assert.equal(seen[0].opts.headers.apikey,'sb_publishable_synthetic');assert.equal(seen[1].opts.headers.apikey,'sb_secret_synthetic');assert.equal(seen[1].opts.headers.Authorization,undefined);
});
test('dispatch flag, inflight dedupe, throttle and errors preserve financial sync',async()=>{
  let calls=0,time=0,enabled=false,release;const scheduled=[];const dispatcher=createPushDispatcher({enabled:()=>enabled,now:()=>time,setTimer:fn=>{scheduled.push(fn);return scheduled.length;},clearTimer:()=>{},invoke:async(name,args)=>{calls++;assert.equal(name,'junto-push');assert.deepEqual(args,{body:{spaceId:S}});await new Promise(r=>release=r);throw new Error('offline');}});
  await dispatcher.dispatch(S,A);assert.equal(calls,0);enabled=true;
  const pending=dispatcher.dispatch(S,A);await dispatcher.dispatch(S,A);assert.equal(calls,1);release();await pending;
  await dispatcher.dispatch(S,A);assert.equal(calls,1);time=5000;const next=dispatcher.dispatch(S,A);assert.equal(calls,2);release();await next;
  dispatcher.reset();
});
test('dispatch schedules a trailing wake so a second event during throttling is not stranded',async()=>{
  let time=0,calls=0;const scheduled=[];const dispatcher=createPushDispatcher({enabled:()=>true,now:()=>time,setTimer:(fn,ms)=>{scheduled.push({fn,ms});return scheduled.length;},clearTimer:()=>{},invoke:async()=>{calls++;return{data:{accepted:1,failed:0,unknown:0,skipped:0}};}});
  await dispatcher.dispatch(S,A);time=1000;await dispatcher.dispatch(S,A);assert.equal(calls,1);assert.equal(scheduled[0].ms,4000);time=5000;scheduled[0].fn();await new Promise(r=>setImmediate(r));assert.equal(calls,2);dispatcher.reset();
});
