import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,rm,mkdtemp,mkdir,cp,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
// No Firebase or Supabase credential here. These fixtures are synthetic and temporary.
test('Firebase build gates reject Admin JSON and wrong projects, and never bundle a server secret',async t=>{
  const root=await mkdtemp(join(tmpdir(),'junto-firebase-build-'));t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(join(root,'android/app'),{recursive:true});await mkdir(join(root,'scripts'));
  await cp('src',join(root,'src'),{recursive:true});await cp('scripts/build.mjs',join(root,'scripts/build.mjs'));await cp('package.json',join(root,'package.json'));await symlink(resolve('node_modules'),join(root,'node_modules'),'junction');
  const path=join(root,'android/app/google-services.json');
  const build=extra=>spawnSync(process.execPath,[join(root,'scripts/build.mjs')],{cwd:root,encoding:'utf8',env:{...process.env,SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:'',JUNTO_PUSH_ENABLED:'true',...extra}});
  await rm(path,{force:true});let result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/JUNTO_PUSH_ENABLED exige/);
  await writeFile(path,JSON.stringify({type:'service_account',private_key:'SYNTHETIC_SERVER_SECRET_CANARY'}));result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/Firebase Admin não pode entrar no APK/);assert.doesNotMatch(result.stderr,/SYNTHETIC_SERVER_SECRET_CANARY/);
  const valid={project_info:{project_id:'junto-apk'},client:[{client_info:{android_client_info:{package_name:'br.com.junto.app'}}}]};
  await writeFile(path,JSON.stringify({...valid,project_info:{project_id:'wrong-project'}}));result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/projeto precisa ser junto-apk/);
  await writeFile(path,JSON.stringify(valid));result=build({FIREBASE_SERVICE_ACCOUNT_JSON:'SYNTHETIC_SERVER_SECRET_CANARY',JUNTO_PUSH_DISPATCH_ENABLED:'true'});assert.equal(result.status,0,result.stderr);
  const config=await readFile(join(root,'dist/js/config.js'),'utf8');assert.match(config,/"pushEnabled":true/);assert.match(config,/"pushDispatchEnabled":true/);assert.doesNotMatch(config,/SYNTHETIC_SERVER_SECRET_CANARY/);
  const bundle=await readFile(join(root,'dist/js/cloud.js'),'utf8');assert.doesNotMatch(bundle,/SYNTHETIC_SERVER_SECRET_CANARY|FIREBASE_SERVICE_ACCOUNT_JSON|SUPABASE_SERVICE_ROLE_KEY/);
  result=build({JUNTO_PUSH_ENABLED:'false',JUNTO_PUSH_DISPATCH_ENABLED:'false'});assert.equal(result.status,0,result.stderr);assert.match(await readFile(join(root,'dist/js/config.js'),'utf8'),/"pushDispatchEnabled":false/);
});
