import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {watch} from 'node:fs';
import {join,extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildWeb} from './build.mjs';
const project=fileURLToPath(new URL('..',import.meta.url)),root=join(project,'dist'),port=Number(process.env.PORT||5173);
await buildWeb();
let pending=null,building=false,again=false;
async function rebuild(){if(building){again=true;return;}building=true;try{await buildWeb();}catch(e){console.error(e.message);}finally{building=false;if(again){again=false;rebuild();}}}
watch(join(project,'src'),{recursive:true},()=>{clearTimeout(pending);pending=setTimeout(rebuild,150);});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff','.woff2':'font/woff2','.ico':'image/x-icon'};
createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),filePath=resolve(root,'.'+path);if(filePath!==root&&!filePath.startsWith(root+sep)){res.writeHead(403);res.end();return;}let file=filePath;if((await stat(file).catch(()=>null))?.isDirectory())file=join(file,'index.html');const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Não encontrado');}}).listen(port,()=>console.log(`Juntô em http://localhost:${port}`));
