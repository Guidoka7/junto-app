import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test.beforeEach(async({page})=>{await mockCloud(page,{authenticated:true});});

test('modo escuro alterna ao lado do sino, salva preferência e restaura no Android/PWA',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>window.JuntoApp.applyState(window.JuntoApp.freshState('Guilherme')));
  const toggle=page.locator('#header-actions [data-action="toggle-theme"]');
  const bell=page.locator('#header-actions [data-action="notifications"]');
  await expect(toggle).toBeVisible();
  await expect(bell).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await expect(toggle).toHaveAttribute('aria-label','Ativar modo escuro');
  const original=await page.evaluate(()=>JSON.stringify(window.JuntoApp.getState()));
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await expect(toggle).toHaveAttribute('aria-label','Ativar modo claro');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.body).backgroundImage.includes('radial-gradient'))).toBe(true);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#0f1725');
  expect(await page.evaluate(()=>localStorage.getItem('junto-theme-v1'))).toBe('dark');
  expect(await page.evaluate(()=>JSON.stringify(window.JuntoApp.getState()))).toBe(original);
  await bell.click();
  await expect(page.locator('#modal')).toHaveAttribute('open','');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.querySelector('#modal')).backgroundColor)).toBe('rgb(27, 41, 60)');
  await page.reload();
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('#header-actions [data-action="toggle-theme"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#header-actions [data-action="toggle-theme"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#f7f8fb');
  expect(await page.evaluate(()=>localStorage.getItem('junto-theme-v1'))).toBe('light');
});

test('tema escuro também atende a dupla e outras rotas',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('junto-theme-v1','dark'));
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users.push({id:'b',name:'Amanda',balance:20000,tone:'pink'});
    window.JuntoApp.applyState(s);
  });
  for(const route of ['future','analysis','bills','goals','requests']){
    await page.locator('#mobile-nav [data-route="'+route+'"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
