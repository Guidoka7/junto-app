import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {VERSION_NAME,PACKAGE_VERSION,GITHUB_SHA,GITHUB_RUN_NUMBER,GITHUB_RUN_ATTEMPT,GITHUB_RUN_ID,VERSION_CODE}=process.env;
if(!VERSION_NAME||!PACKAGE_VERSION||!GITHUB_SHA)throw new Error('Identidade do build ausente.');
const assetName=`Junto-${VERSION_NAME}-teste.apk`;
const apk=await readFile(`out/${assetName}`);
const metadata={schemaVersion:1,app:'Juntô',platform:'android',channel:process.env.GITHUB_REF==='refs/heads/main'?'main':'versioned',testBuild:true,signing:'debug',
version:VERSION_NAME,packageVersion:PACKAGE_VERSION,versionCode:Number(VERSION_CODE),commitSha:GITHUB_SHA,
shortSha:GITHUB_SHA.slice(0,7),runNumber:Number(GITHUB_RUN_NUMBER),runAttempt:Number(GITHUB_RUN_ATTEMPT),
runId:GITHUB_RUN_ID,builtAt:new Date().toISOString(),assetName,apkSize:(await stat(`out/${assetName}`)).size,
sha256:createHash('sha256').update(apk).digest('hex'),apkUrl:'https://junto-updates.vercel.app/apk'};
await writeFile('out/apk-metadata.json',JSON.stringify(metadata,null,2)+'\n');
