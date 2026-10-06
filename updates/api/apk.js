const {getCurrent}=require('../lib/current-apk.js');
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('CDN-Cache-Control','no-store');
  try{
    const {asset}=await getCurrent();
    res.statusCode=302;res.setHeader('Location',asset.browser_download_url);res.end();
  }catch{res.status(503).send('O APK automático ainda não está disponível. Tente novamente em instantes.');}
};
