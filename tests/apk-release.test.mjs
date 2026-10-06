import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {publishApk} from '../scripts/publish-apk.mjs';
const require=createRequire(import.meta.url),{getCurrent}=require('../updates/lib/current-apk.js');
const apk=Buffer.from('fixture apk');
const m={channel:'main',testBuild:true,signing:'debug',assetName:'Junto-1.1.1-abcdef0.3.1-teste.apk',apkSize:apk.length,
sha256:createHash('sha256').update(apk).digest('hex'),commitSha:'abcdef0123',version:'1.1.1-abcdef0.3.1',runNumber:3,runAttempt:1};
const body=x=>'<!-- junto-apk\n'+JSON.stringify(x)+'\n-->';
function fixture({head=m.commitSha,comparison='diverged',failUpload=false,previous={...m,runNumber:2}}={}){
 const calls=[],assets=[{id:1,name:'old.apk',state:'uploaded'}];
 const request=async(path,options={})=>{
  calls.push({path,...options});
  if(path==='/git/ref/heads/main')return {object:{sha:head}};
  if(path.startsWith('/compare/'))return {status:comparison};
  if(path==='/git/ref/tags/latest')return {object:{sha:'old'}};
  if(path==='/releases/tags/latest')return {id:9,body:body(previous),upload_url:'https://uploads.github.com/repos/Guidoka7/junto-app/releases/9/assets{?name,label}'};
  if(path.includes('/assets?per_page='))return [...assets];
  if(path.startsWith('https://uploads.')){if(failUpload)throw new Error('upload failed');assets.push({id:2,name:m.assetName,state:'uploaded'});return {};}
  return {};
 };
 return {calls,request};
}
test('publicação troca metadados somente após upload e remove APK antigo depois',async()=>{
 const f=fixture();await publishApk({metadata:m,apk,request:f.request,log:()=>{}});
 const upload=f.calls.findIndex(c=>c.path.startsWith('https://uploads.'));
 const switchIndex=f.calls.findIndex(c=>c.path==='/releases/9'&&c.method==='PATCH');
 const cleanup=f.calls.findIndex(c=>c.method==='DELETE');
 assert.ok(upload<switchIndex&&switchIndex<cleanup);assert.equal(f.calls[cleanup].path,'/releases/assets/1');
 assert.equal(f.calls[switchIndex].json.prerelease,true);assert.equal(f.calls[switchIndex].json.make_latest,'false');
});
test('upload falha preservando a entrega anterior',async()=>{
 const f=fixture({failUpload:true});await assert.rejects(publishApk({metadata:m,apk,request:f.request}),/upload failed/);
 assert.ok(!f.calls.some(c=>c.method==='DELETE'||c.method==='PATCH'));
});
test('commit fora da main e execução antiga não publicam',async()=>{
 for(const f of [fixture({head:'newer'}),fixture({previous:{...m,runNumber:4}})]){
  await publishApk({metadata:m,apk,request:f.request,log:()=>{}});
  assert.ok(!f.calls.some(c=>c.method));
 }
});
test('checksum inconsistente impede publicação',async()=>{
 const f=fixture();await assert.rejects(publishApk({metadata:m,apk:Buffer.from('wrong'),request:f.request}),/metadados/);
 assert.equal(f.calls.length,0);
});
test('central resolve somente o asset correspondente aos metadados',async()=>{
 const release={body:body(m),assets:[{name:'old.apk',size:4,state:'uploaded'},{name:m.assetName,size:m.apkSize,state:'uploaded',
 browser_download_url:'https://github.com/Guidoka7/junto-app/releases/download/latest/'+m.assetName}]};
 const current=await getCurrent(async()=>({ok:true,json:async()=>release}));
 assert.equal(current.asset.name,m.assetName);assert.equal(current.metadata.commitSha,m.commitSha);
 release.assets[1].size++;await assert.rejects(getCurrent(async()=>({ok:true,json:async()=>release})),/indisponível/);
});
test('central rejeita ausência de release e URL de página ou outro host',async()=>{
 await assert.rejects(getCurrent(async()=>({ok:false})),/indisponível/);
 for(const url of ['https://github.com/Guidoka7/junto-app/releases/tag/latest','https://example.com/test.apk']){
  await assert.rejects(getCurrent(async()=>({ok:true,json:async()=>({body:body(m),assets:[{name:m.assetName,size:m.apkSize,state:'uploaded',browser_download_url:url}]})})),/inválida/);
 }
});

test('APK validado publica enquanto um commit descendente ainda compila',async()=>{
 const f=fixture({head:'newer',comparison:'ahead'});await publishApk({metadata:m,apk,request:f.request,log:()=>{}});
 assert.ok(f.calls.some(c=>c.path==='/releases/9'&&c.method==='PATCH'));
});
