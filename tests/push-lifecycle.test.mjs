import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile('src/js/push.js','utf8')).replace(/^import .*;\n/gm,'');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));};
function fixture({configured=true,accessToken,fetchImpl}={}){
  const storage=new Map(),listeners=new Map(),events=new Map(),dom=new Map(),calls={registered:0,unregistered:0,fetch:[]};let uid=null;
  const window={JuntoCloudConfig:{pushEnabled:configured,url:'https://junto-test.supabase.co',publishableKey:'synthetic-public'},JuntoCloud:{getUserId:()=>uid,getAccessToken:async()=>accessToken?await accessToken(): 'synthetic-user-session'},JuntoApp:{hasAccess:()=>true},addEventListener:(name,fn)=>events.set(name,fn)};
  const PushNotifications={addListener:async(name,fn)=>listeners.set(name,fn),checkPermissions:async()=>({receive:'granted'}),requestPermissions:async()=>({receive:'granted'}),createChannel:async()=>{},register:async()=>{calls.registered++;listeners.get('registration')?.({value:'synthetic-device-token-'.repeat(3)});},unregister:async()=>{calls.unregistered++;}};
  const context={window,document:{getElementById:()=>null,querySelector:()=>null,addEventListener:(name,fn)=>dom.set(name,fn)},Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'android'},PushNotifications,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},crypto,Date,AbortSignal,fetch:async(url,options)=>{calls.fetch.push({url,...options,body:options.body?JSON.parse(options.body):null});return fetchImpl?fetchImpl(url,options):{ok:true,status:204};}};
  vm.runInNewContext(source,context);
  const auth=async id=>{uid=id;events.get('junto:auth-changed')({detail:{userId:id}});await flush();};
  const activate=async()=>{const button={disabled:false,dataset:{feature:'push-activate'}};await dom.get('click')({target:{closest:()=>button},preventDefault:()=>{}});await flush();};
  const disable=async()=>{const button={disabled:false,dataset:{feature:'push-disable'}};await dom.get('click')({target:{closest:()=>button},preventDefault:()=>{}});await flush();};
  return{window,storage,calls,auth,activate,disable,listeners,events};
}
test('native push requires opt-in per account; old device-wide opt-in never authorizes another account',async()=>{
  const f=fixture();f.storage.set('junto-push-opt-in-v1','yes');await f.auth(A);assert.equal(f.calls.registered,0);
  await f.activate();assert.equal(f.storage.get('junto-push-opt-in-v1:'+A),'yes');assert.equal(f.calls.fetch.filter(r=>r.method==='POST').length,1);
  assert.equal(f.calls.fetch.find(r=>r.method==='POST').body.user_id,A);
  await f.window.JuntoPush.unlink();await f.auth(null);await f.auth(B);assert.equal(f.calls.registered,1);
  assert.match(f.window.JuntoPush.settingsHTML(),/Ativar notificações/);assert.equal(f.storage.has('junto-push-opt-in-v1:'+B),false);
});
test('native disable revokes the device and ignores late registration callbacks',async()=>{
  const f=fixture();await f.auth(A);await f.activate();await f.disable();const posts=f.calls.fetch.filter(r=>r.method==='POST').length;
  f.listeners.get('registration')({value:'synthetic-late-device-token'});await flush();assert.equal(f.calls.fetch.filter(r=>r.method==='POST').length,posts);
  assert.ok(f.calls.fetch.some(r=>r.method==='DELETE'));assert.ok(f.calls.unregistered>0);assert.equal(f.storage.has('junto-push-opt-in-v1:'+A),false);
});
test('native expired auth unregisters and prevents registration callbacks from saving another token',async()=>{
  const f=fixture();await f.auth(A);await f.activate();await f.auth(null);const posts=f.calls.fetch.filter(r=>r.method==='POST').length;
  f.listeners.get('registration')({value:'synthetic-token-after-logout'});await flush();assert.equal(f.calls.fetch.filter(r=>r.method==='POST').length,posts);assert.ok(f.calls.unregistered>0);
});
test('native async token retrieval cannot save a device after auth changes',async()=>{
  let release;const f=fixture({accessToken:()=>new Promise(r=>release=r)});await f.auth(A);await f.activate();await f.auth(null);release('synthetic-old-session');await flush();assert.equal(f.calls.fetch.filter(r=>r.method==='POST').length,0);
});
test('APK without Firebase never attempts native registration or token writes',async()=>{
  const f=fixture({configured:false});await f.auth(A);await f.activate();assert.equal(f.calls.registered,0);assert.equal(f.calls.fetch.length,0);assert.equal(f.window.JuntoPush.isConfigured(),false);
});
test('native disable waits for an in-flight token write before deleting the device',async()=>{
  let release,enabled=false;const order=[];
  const f=fixture({fetchImpl:async(_url,options)=>{
    if(options.method==='POST'){await new Promise(r=>release=r);enabled=true;order.push('write');}
    if(options.method==='DELETE'){enabled=false;order.push('delete');}
    return{ok:true,status:204};
  }});
  await f.auth(A);await f.activate();assert.equal(f.calls.fetch.filter(r=>r.method==='POST').length,1);
  const disabled=f.disable();await flush();
  try{assert.equal(f.calls.fetch.filter(r=>r.method==='DELETE').length,0,'revocation must be the last confirmed write');}
  finally{release();await disabled;}
  assert.deepEqual(order,['write','delete']);assert.equal(enabled,false);assert.ok(f.calls.unregistered>0);
});
