import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {mockCloud} from './auth-fixture.mjs';

test('solo account keeps connection actions clear and backups available on narrow phones',async({page},testInfo)=>{
 await mockCloud(page,{authenticated:true});await page.goto('/');
 await expect(page.locator('#authenticated-app')).toBeVisible();
 await expect(page.locator('#cloud-account-button')).toHaveText('Conta conectada');
 await page.locator('#cloud-account-button').click();
 const dialog=page.locator('#modal');
 await expect(dialog.locator('#modal-title')).toHaveText('Minha conta');
 await expect(dialog.locator('.cloud-membership')).toHaveText('Modo solo');
 await expect(dialog).not.toContainText('Dupla conectada');
 await expect(dialog.locator('.cloud-connect-actions button')).toHaveCount(2);
 await expect(dialog.locator('.cloud-backups')).not.toHaveAttribute('open');
 await expect(dialog.locator('[data-feature="cloud-export"]')).toBeHidden();
 for(const width of[320,360,390,430]){
  await page.setViewportSize({width,height:844});
  const boxes=await dialog.locator('.cloud-connect-actions button').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return{x:r.x,width:r.width,y:r.y,bottom:r.bottom};}));
  expect(boxes[0].x).toBe(boxes[1].x);expect(boxes[0].width).toBe(boxes[1].width);expect(boxes[0].bottom).toBeLessThan(boxes[1].y);
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await expect(dialog.locator('[data-feature="cloud-signout"]')).toBeInViewport();
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:testInfo.outputPath('conta-solo.png'),animations:'disabled'});
 await dialog.locator('[data-feature="cloud-join-open"]').click();
 await expect(page.locator('#cloud-invite')).toBeVisible();
 await page.locator('#modal [data-feature="cloud-open"]').click();
 await dialog.locator('[data-feature="cloud-sync"]').click();
 await expect(dialog.locator('#cloud-live-status')).toContainText('Sincronizado');
 await dialog.locator('.cloud-backups summary').click();
 await expect(dialog.locator('[data-feature="cloud-export"]')).toBeVisible();
 const saved=page.waitForEvent('download');await dialog.locator('[data-feature="cloud-export"]').click();
 const backup=JSON.parse(await readFile(await(await saved).path(),'utf8'));expect(backup.users[0].name).toBe('Teste');
 await dialog.locator('[data-feature="cloud-signout"]').click();
 await expect(page.locator('[data-feature-form="cloud-auth"]')).toBeVisible();
});

test('paired account shows both names and hides invitation choices',async({page},testInfo)=>{
 await mockCloud(page,{authenticated:true,members:2});await page.goto('/');
 await expect(page.locator('#cloud-account-button')).toHaveText('Dupla conectada');
 await page.locator('#cloud-account-button').click();
 const dialog=page.locator('#modal');
 await expect(dialog.locator('.cloud-membership')).toHaveText('Conectados');
 await expect(dialog.locator('.cloud-connected')).toContainText('Teste & Bia');
 await expect(dialog.locator('[data-feature="cloud-invite"],[data-feature="cloud-join-open"]')).toHaveCount(0);
 await expect(dialog.locator('.cloud-backups')).not.toHaveAttribute('open');
 await expect(dialog.locator('[data-feature="cloud-signout"]')).toBeInViewport();
 await page.screenshot({path:testInfo.outputPath('conta-dupla.png'),animations:'disabled'});
});
