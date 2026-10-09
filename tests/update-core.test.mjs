import test from 'node:test';
import assert from 'node:assert/strict';
import {parseApkRelease,isNewerApk} from '../src/features/update-core.js';

const make=()=>({
  tag_name:'latest',draft:false,body:'APK validado\n<!-- junto-apk\n'+JSON.stringify({
    channel:'main',platform:'android',testBuild:true,signing:'debug',version:'1.1.1-abcdef0.39.1',
    packageVersion:'1.1.1',commitSha:'a'.repeat(40),runNumber:39,runAttempt:1,apkSize:5500000,
    assetName:'Junto-1.1.1-abcdef0.39.1-teste.apk',builtAt:'2026-10-09T12:00:00Z'
  })+'\n-->',
  assets:[{name:'Junto-1.1.1-abcdef0.39.1-teste.apk',size:5500000,state:'uploaded',
  browser_download_url:'https://github.com/Guidoka7/junto-app/releases/download/latest/Junto-1.1.1-abcdef0.39.1-teste.apk'}]
});
test('valida APK rolling sem aceitar URL externa ou dados incompletos',()=>{
  const release=make(),parsed=parseApkRelease(release);
  assert.equal(parsed.version,'1.1.1-abcdef0.39.1');
  assert.equal(parsed.downloadUrl,'https://junto-updates.vercel.app/apk');
  assert.equal(parseApkRelease({...release,tag_name:'v1.1.1'}),null);
  assert.equal(parseApkRelease({...release,body:release.body.replace('"debug"','"release"')}),null);
  assert.equal(parseApkRelease({...release,assets:[{...release.assets[0],browser_download_url:'https://evil.example/test.apk'}]}),null);
  assert.equal(parseApkRelease({...release,assets:[{...release.assets[0],size:2}]}),null);
  assert.equal(parseApkRelease({...release,body:'broken'}),null);
});
test('compara execução, tentativa, versão de pacote e SHA antes de oferecer atualização',()=>{
  const latest=parseApkRelease(make());
  assert.equal(isNewerApk({version:'1.1.1-old.38.1',runNumber:38,commitSha:'b'.repeat(40)},latest),true);
  assert.equal(isNewerApk({version:latest.version,runNumber:39,commitSha:latest.commitSha},latest),false);
  assert.equal(isNewerApk({version:'1.1.1-next.40.1',runNumber:40,commitSha:'b'.repeat(40)},latest),false);
  assert.equal(isNewerApk({version:'1.1.1-old.39.1',runNumber:39},latest),false);
  assert.equal(isNewerApk({version:'1.0.9',packageVersion:'1.0.9'},latest),true);
  assert.equal(isNewerApk({version:'1.1.1',packageVersion:'1.1.1'},latest),false);
  assert.equal(isNewerApk(null,latest),false);
});
