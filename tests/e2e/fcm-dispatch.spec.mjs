import {test,expect} from '@playwright/test';
import {mockCloud,testConfig} from './auth-fixture.mjs';

test('FCM wakes only after persistence and remote failure preserves the original couple notice',async({page})=>{
  await mockCloud(page,{authenticated:true,members:2});
  await page.route('**/js/config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.JuntoCloudConfig=${JSON.stringify({...testConfig,pushDispatchEnabled:true})};`}));
  const requests=[];await page.route(testConfig.url+'/functions/v1/junto-push',async route=>{
    requests.push(route.request().postDataJSON());return route.fulfill({status:503,json:{error:'PUSH_NOT_ENABLED'}});
  });
  await page.goto('/');await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.getState();s.users[0].balance=50000;s.notifications=[{id:'original-notice',from:'b',to:'a',title:'Um aviso original',body:'Conteúdo que continua no aplicativo.',kind:'info',read:false,createdAt:Date.now()}];
    window.JuntoApp.applyState(s);window.dispatchEvent(new CustomEvent('junto:state-changed',{detail:s}));
  });
  await page.evaluate(()=>window.JuntoCloud.synchronize());
  await expect.poll(()=>requests.length).toBe(1);expect(requests[0]).toEqual({spaceId:'44444444-4444-4444-8444-444444444444'});
  expect(await page.evaluate(()=>window.JuntoApp.getState().users[0].balance)).toBe(50000);
  await expect(page.locator('#cloud-account-button')).toContainText('Sincronizado');
  await page.locator('#header-actions [data-action="notifications"]').click();
  await expect(page.locator('dialog[data-kind="notifications"]')).toContainText('Um aviso original');
  await expect(page.locator('dialog[data-kind="notifications"]')).toContainText('Conteúdo que continua no aplicativo.');
});
test('default build does not activate the backend sender',async({page})=>{
  await mockCloud(page,{authenticated:true,members:2});let calls=0;
  await page.route(testConfig.url+'/functions/v1/junto-push',route=>{calls++;return route.fulfill({json:{accepted:1}});});
  await page.goto('/');await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{const s=window.JuntoApp.getState();s.users[0].balance=30000;window.JuntoApp.applyState(s);window.dispatchEvent(new CustomEvent('junto:state-changed',{detail:s}));});
  await page.evaluate(()=>window.JuntoCloud.synchronize());expect(calls).toBe(0);expect(await page.evaluate(()=>window.JuntoApp.getState().users[0].balance)).toBe(30000);
});
