import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export async function publishApk({metadata,apk,request,log=console.log}){
  const m=metadata,tag='latest';
  if(m.channel!=='main'||!m.testBuild||m.signing!=='debug'||!/^Junto-[A-Za-z0-9.-]+-teste\.apk$/.test(m.assetName))throw new Error('Metadados inválidos.');
  if(createHash('sha256').update(apk).digest('hex')!==m.sha256||apk.length!==m.apkSize)throw new Error('APK não corresponde aos metadados.');
  const head=await request('/git/ref/heads/main');
  if(head.object.sha!==m.commitSha){
    const comparison=await request('/compare/'+m.commitSha+'...main');
    if(!['ahead','identical'].includes(comparison.status)){log('Commit fora do histórico atual da main; entrega preservada.');return;}
  }
  let release=await request('/releases/tags/'+tag,{allow404:true});
  if(release?.immutable)throw new Error('A release rolling precisa permitir atualização.');
  const previous=release?.body?.match(/<!-- junto-apk\n([\s\S]*?)\n-->/)?.[1];
  if(previous){const p=JSON.parse(previous);if(p.runNumber>m.runNumber||(p.runNumber===m.runNumber&&p.runAttempt>m.runAttempt)){log('Execução mais recente já publicada.');return;}}
  const ref=await request('/git/ref/tags/'+tag,{allow404:true});
  if(!ref)await request('/git/refs',{method:'POST',json:{ref:'refs/tags/'+tag,sha:m.commitSha}});
  if(!release)release=await request('/releases',{method:'POST',json:{tag_name:tag,target_commitish:m.commitSha,name:'Juntô — APK automático de teste',body:'Primeiro APK em preparação.',prerelease:true,make_latest:'false'}});
  const assets=await request('/releases/'+release.id+'/assets?per_page=100');
  const existing=assets.find(a=>a.name===m.assetName&&a.state==='uploaded');
  if(existing){
    if(!previous||JSON.parse(previous).sha256!==m.sha256){
      await request('/releases/assets/'+existing.id,{method:'DELETE'});
      await request(release.upload_url.split('{')[0]+'?name='+encodeURIComponent(m.assetName),{method:'POST',binary:apk});
    }
  }else await request(release.upload_url.split('{')[0]+'?name='+encodeURIComponent(m.assetName),{method:'POST',binary:apk});
  // Upload termina antes da troca dos metadados; o APK anterior segue disponível.
  const latestHead=await request('/git/ref/heads/main');
  if(latestHead.object.sha!==m.commitSha){
    const comparison=await request('/compare/'+m.commitSha+'...main');
    if(!['ahead','identical'].includes(comparison.status)){log('Histórico da main mudou durante o upload; entrega preservada.');return;}
  }
  if(ref)await request('/git/refs/tags/'+tag,{method:'PATCH',json:{sha:m.commitSha,force:true}});
  const body='Build de teste, assinado com a chave debug cacheada. Não é uma versão de produção.\n\n'+
    'Versão: '+m.version+'\nCommit: '+m.commitSha+'\nSHA-256: '+m.sha256+'\n\n<!-- junto-apk\n'+JSON.stringify(m)+'\n-->';
  await request('/releases/'+release.id,{method:'PATCH',json:{name:'Juntô '+m.version+' — teste',body,prerelease:true,make_latest:'false'}});
  const updated=await request('/releases/'+release.id+'/assets?per_page=100');
  for(const asset of updated)if(asset.name!==m.assetName)await request('/releases/assets/'+asset.id,{method:'DELETE'});
  log('APK automático publicado: '+m.version);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const repo=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN;
  if(!repo||!token)throw new Error('Autenticação do workflow ausente.');
  const request=async(path,{method='GET',json,binary,allow404=false}={})=>{
    const url=path.startsWith('https:')?path:'https://api.github.com/repos/'+repo+path;
    if(!['api.github.com','uploads.github.com'].includes(new URL(url).hostname))throw new Error('Host não permitido.');
    const response=await fetch(url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',
      ...(binary?{'Content-Type':'application/vnd.android.package-archive'}:json?{'Content-Type':'application/json'}:{})},body:binary|| (json?JSON.stringify(json):undefined)});
    if(allow404&&response.status===404)return null;
    if(!response.ok)throw new Error('GitHub '+method+' '+new URL(url).pathname+': HTTP '+response.status);
    return response.status===204?null:response.json();
  };
  const metadata=JSON.parse(await readFile('out/apk-metadata.json','utf8'));
  await publishApk({metadata,apk:await readFile('out/'+metadata.assetName),request});
}
