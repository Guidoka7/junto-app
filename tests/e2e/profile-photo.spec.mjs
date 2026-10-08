import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test.beforeEach(async({page})=>{await mockCloud(page,{authenticated:true});});

test('foto do perfil ajusta zoom e posição sem desmontar os controles',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.settings.couplePhoto='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    window.JuntoApp.applyState(s);
    document.querySelector('.profile-photo-button').click();
  });
  await expect(page.locator('#profile-zoom')).toBeVisible();
  await expect(page.locator('#profile-y')).toBeVisible();
  await page.locator('#profile-y').evaluate(input=>{
    input.dataset.kept='yes';
    input.value='0';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#photo-y-value')).toHaveText('0%');
  await page.locator('#profile-y').evaluate(input=>{
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await expect(page.locator('#profile-y')).toHaveAttribute('data-kept','yes');
  await expect.poll(()=>page.evaluate(()=>window.JuntoApp.getState().settings.profileY)).toBe(0);
  await page.locator('#profile-zoom').evaluate(input=>{
    input.value='1.8';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await expect(page.locator('#photo-zoom-value')).toHaveText('180%');
  await expect(page.locator('.photo-preview')).toHaveAttribute('style',/--profile-pan-y:40.00%/);
  await expect.poll(()=>page.evaluate(()=>window.JuntoApp.getState().settings.profileZoom)).toBe(1.8);
  await expect(page.locator('.profile-photo-button').first()).toHaveAttribute('style',/--profile-pan-y:40.00%/);
  await page.locator('[data-action="reset-couple-photo-frame"]').click();
  await expect(page.locator('#profile-zoom')).toHaveValue('1.08');
  await expect(page.locator('#profile-y')).toHaveValue('50');
  await expect.poll(()=>page.evaluate(()=>window.JuntoApp.getState().settings.profileY)).toBe(50);
});
