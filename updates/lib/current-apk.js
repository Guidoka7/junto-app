const REPO='https://api.github.com/repos/Guidoka7/junto-app';
async function getCurrent(fetcher=fetch){
  const r=await fetcher(REPO+'/releases/tags/latest',{headers:{'user-agent':'Junto-Updates/2.0',accept:'application/vnd.github+json'},cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('Release indisponível');
  const release=await r.json();
  const match=release.body?.match(/<!-- junto-apk\n([\s\S]*?)\n-->/);
  if(!match||release.draft)throw new Error('Entrega em preparação');
  const metadata=JSON.parse(match[1]);
  const asset=release.assets?.find(a=>a.name===metadata.assetName&&a.state==='uploaded');
  if(!asset||metadata.channel!=='main'||!metadata.testBuild||metadata.signing!=='debug'||asset.size!==metadata.apkSize)throw new Error('APK indisponível');
  const url=new URL(asset.browser_download_url);
  if(url.origin!=='https://github.com'||!url.pathname.startsWith('/Guidoka7/junto-app/releases/download/latest/')||!url.pathname.endsWith('.apk'))throw new Error('URL inválida');
  return {metadata,asset,release};
}
module.exports={getCurrent};
