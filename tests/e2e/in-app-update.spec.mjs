import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test('modal Android baixa APK dentro do app, exibe progresso e continua no instalador sem navegador',async({page})=>{
  const meta={channel:'main',platform:'android',testBuild:true,signing:'debug',
    version:'1.1.1-aabbccd.9000.1',packageVersion:'1.1.1',commitSha:'a'.repeat(40),
    sha256:'b'.repeat(64),certificateSha256:'c'.repeat(64),runNumber:9000,runAttempt:1,
    apkSize:5000000,assetName:'Junto-1.1.1-aabbccd.9000.1-teste.apk'};
  const url='https://github.com/Guidoka7/junto-app/releases/download/latest/'+meta.assetName;
  const release={tag_name:'latest',draft:false,
    body:'<!-- junto-apk\n'+JSON.stringify(meta)+'\n-->',
    assets:[{name:meta.assetName,size:meta.apkSize,state:'uploaded',browser_download_url:url}]};
  await mockCloud(page,{authenticated:true});
  await page.route('**/version.json',route=>route.fulfill({json:{version:'1.1.1-old.3.1',packageVersion:'1.1.1',runNumber:3,commitSha:'d'.repeat(40)}}));
  await page.route('https://api.github.com/repos/Guidoka7/junto-app/releases/tags/latest',route=>route.fulfill({json:release}));
  await page.addInitScript(()=>{
    window.__nativeUpdate={progress:null,downloads:[],installs:[],canceled:0};
    const updater={
      addListener:async(name,callback)=>{if(name==='downloadProgress')window.__nativeUpdate.progress=callback;return{remove(){}};},
      downloadAndInstall:async options=>{
        window.__nativeUpdate.downloads.push(options);
        window.__nativeUpdate.progress?.({bytes:2000000,total:options.apkSize,percent:40});
        await new Promise(resolve=>setTimeout(resolve,250));
        window.__nativeUpdate.progress?.({bytes:options.apkSize,total:options.apkSize,percent:100});
        return {status:'permissionRequired'};
      },
      installDownloaded:async options=>{window.__nativeUpdate.installs.push(options);return{status:'installerOpened'};},
      cancelDownload:async()=>{window.__nativeUpdate.canceled++;return{canceled:true};}
    };
    const plugins={
      JuntoUpdater:updater,
      SystemBars:{setStyle:async()=>{}},
      SplashScreen:{hide:async()=>{}},
      App:{addListener:async()=>({remove(){}}),getLaunchUrl:async()=>({}),exitApp:async()=>{}},
      BankNotifications:{addListener:async()=>({remove(){}}),getPending:async()=>({events:[]})}
    };
    window.Capacitor={
      isNativePlatform:()=>true,getPlatform:()=> 'android',
      registerPlugin:name=>plugins[name]||{addListener:async()=>({remove(){}})}
    };
  });
  let browserOpened=0;
  page.on('popup',()=>browserOpened++);
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.waitForFunction(()=>window.JuntoUpdates?.getStatus()?.latest?.runNumber===9000);
  await page.evaluate(()=>window.JuntoUpdates.open());
  await expect(page.locator('#modal [data-action="update-download"]')).toBeVisible();
  await page.locator('#modal [data-action="update-download"]').click();
  await expect(page.locator('#junto-update-progress-track, .junto-update-progress-track')).toHaveCount(1);
  await expect(page.locator('#modal [data-action="update-install"]')).toBeVisible();
  await page.locator('#modal [data-action="update-install"]').click();
  await expect(page.locator('#modal [data-action="update-install"]')).toContainText('Reabrir');
  const nativeCalls=await page.evaluate(()=>window.__nativeUpdate);
  expect(nativeCalls.downloads).toEqual([{url,sha256:meta.sha256,apkSize:meta.apkSize}]);
  expect(nativeCalls.installs).toEqual([{sha256:meta.sha256,apkSize:meta.apkSize}]);
  expect(browserOpened).toBe(0);
});
