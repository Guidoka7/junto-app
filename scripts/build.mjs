import {cp,rm,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,relative,sep,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=fileURLToPath(new URL('..',import.meta.url)),src=join(root,'src'),dist=join(root,'dist');
if(await stat(join(root,'.env')).catch(()=>null))process.loadEnvFile(join(root,'.env'));
async function walk(dir){const out=[];for(const name of await readdir(dir)){const full=join(dir,name);if((await stat(full)).isDirectory())out.push(...await walk(full));else out.push(full);}return out;}
export async function buildWeb(){
  const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  await rm(dist,{recursive:true,force:true});await cp(src,dist,{recursive:true});
  const appPath=join(dist,'js/app.js'),app=await readFile(appPath,'utf8');
  if(!app.includes('/* JUNTO_APP_API */'))throw new Error('Marcador da integração ausente.');
  if(!app.includes('/* JUNTO_ORGANIZED */'))throw new Error('Marcador das telas organizadas ausente.');
  if(!app.includes('/* JUNTO_SETUP */'))throw new Error('Marcador do raio-x inicial ausente.');
  const organized=await readFile(join(src,'features/organized.js'),'utf8'),setup=await readFile(join(src,'features/setup.js'),'utf8'),api=await readFile(join(src,'features/app-api.js'),'utf8');
  await writeFile(appPath,app.replace('/* JUNTO_ORGANIZED */',()=>organized).replace('/* JUNTO_SETUP */',()=>setup).replace('/* JUNTO_APP_API */',()=>api));
  await rm(join(dist,'features'),{recursive:true,force:true});
  await build({absWorkingDir:root,entryPoints:['src/js/native.js','src/js/banking.js','src/js/cloud.js','src/js/push.js','src/js/virada.js','src/js/budget.js','src/js/updates.js'],outdir:join(dist,'js'),bundle:true,format:'iife',platform:'browser',target:['chrome109','safari16'],legalComments:'eof'});
  const config={url:process.env.SUPABASE_URL||'',publishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||'',appUrl:String(process.env.JUNTO_APP_URL||'').replace(/\/+$/,''),pushEnabled:process.env.JUNTO_PUSH_ENABLED==='true'};
  if(Boolean(config.url)!==Boolean(config.publishableKey))throw new Error('Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY juntas.');
  if(config.publishableKey&&config.publishableKey.startsWith('eyJ')){let role;try{role=JSON.parse(Buffer.from(config.publishableKey.split('.')[1],'base64url').toString()).role;}catch{}if(role!=='anon')throw new Error('Use apenas chave publishable ou anon.');}
  if(config.publishableKey&&!config.publishableKey.startsWith('eyJ')&&!config.publishableKey.startsWith('sb_publishable_'))throw new Error('Nunca use uma chave secreta no app.');
  if(config.appUrl&&!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(config.appUrl))throw new Error('JUNTO_APP_URL precisa ser uma URL HTTPS pública.');

  if(config.pushEnabled){
    const services=await stat(join(root,'android/app/google-services.json')).catch(()=>null);
    if(!services?.isFile())throw new Error('JUNTO_PUSH_ENABLED exige android/app/google-services.json.');
    const firebase=JSON.parse(await readFile(join(root,'android/app/google-services.json'),'utf8'));
    if(!firebase.client?.some(c=>c.client_info?.android_client_info?.package_name==='br.com.junto.app'))throw new Error('Firebase Android: package_name precisa ser br.com.junto.app.');
  }
  await writeFile(join(dist,'js/config.js'),`window.JuntoCloudConfig=${JSON.stringify(config)};\n`);
  const files=(await walk(dist)).filter(f=>!f.endsWith(`${sep}sw.js`)).sort(),hash=createHash('sha256');
  for(const f of files){hash.update(relative(dist,f));hash.update(await readFile(f));}
  const version=process.env.VERSION_NAME||`${pkg.version}-${hash.digest('hex').slice(0,8)}`,precache=['./',...files.map(f=>'./'+relative(dist,f).split(sep).join('/'))];
  const swPath=join(dist,'sw.js'),sw=(await readFile(swPath,'utf8')).replace('__VERSION__',version).replace('__PRECACHE__',JSON.stringify(precache));
  await writeFile(swPath,sw);await writeFile(join(dist,'version.json'),JSON.stringify({version,packageVersion:pkg.version,commitSha:process.env.GITHUB_SHA||process.env.VERCEL_GIT_COMMIT_SHA||null,runNumber:process.env.GITHUB_RUN_NUMBER?Number(process.env.GITHUB_RUN_NUMBER):null,builtAt:new Date().toISOString()},null,2));await writeFile(join(dist,'.nojekyll'),'');
  console.log(`✓ dist/ pronto · versão ${version} · ${precache.length} arquivos offline`);return version;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))await buildWeb();
