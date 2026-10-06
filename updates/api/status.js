const {getCurrent}=require('../lib/current-apk.js');
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('CDN-Cache-Control','no-store');
  try{
    const {metadata:m,asset,release}=await getCurrent();
    res.status(200).json({...m,deployedVersion:m.version,deployedAt:m.builtAt,commitDate:m.builtAt,
      commitMessage:'APK automático de teste · execução '+m.runNumber,
      release:{tag:'latest',name:release.name,publishedAt:m.builtAt,apkUrl:'/apk',apkSize:asset.size,assetName:asset.name},
      apkUrl:'/apk',available:true});
  }catch{
    res.status(503).json({app:'Juntô',platform:'android',channel:'main',testBuild:true,available:false,
      error:'O APK automático ainda não está disponível. Tente novamente em instantes.'});
  }
};
