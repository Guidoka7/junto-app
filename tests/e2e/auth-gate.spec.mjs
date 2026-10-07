import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';
async function locked(page){
 await expect(page.locator('#authenticated-app')).toBeHidden();
 await expect(page.locator('#app-content')).toBeEmpty();
 await expect(page.locator('#mobile-nav')).toBeEmpty();
 await expect(page.locator('#auth-gate')).toBeVisible();
 await expect(page.locator('.demo-strip')).toHaveCount(0);
 await expect(page.locator('#auth-gate')).not.toContainText(/R\$|Prévia interativa|Sobre esta demonstração|Criar nossa dupla/);
}
test('no session: only authentication, including refresh and legacy local config',async({page})=>{
 await mockCloud(page);await page.addInitScript(()=>localStorage.setItem('junto-cloud-config-v1',JSON.stringify({url:'https://untrusted.example',publishableKey:'sb_publishable_legacy_should_be_ignored'})));
 await page.goto('/');await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);
 await page.keyboard.press('Escape');await locked(page);await page.reload();await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);
});
test('missing build configuration: administrator error with no configuration fields',async({page})=>{
 await mockCloud(page,{missingConfig:true});await page.goto('/');await locked(page);
 await expect(page.locator('#auth-gate')).toContainText('Implantação incompleta');await expect(page.locator('#auth-gate input')).toHaveCount(0);
});
test('signup enters directly, real space onboarding gates finances, logout blocks again',async({page})=>{
 await mockCloud(page,{space:false});await page.goto('/');await page.locator('[data-feature="cloud-auth-toggle"]').click();await page.locator('#cloud-name').fill('Teste');await page.locator('#cloud-email').fill('teste@junto.example');await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();
 await expect(page.locator('[data-feature-form="cloud-create"]')).toBeVisible();await locked(page);await expect(page.locator('#auth-gate')).not.toContainText('Confirme seu e-mail');
 await page.locator('[data-feature-form="cloud-create"] [type="submit"]').click();await expect(page.locator('#authenticated-app')).toBeVisible();await expect(page.locator('#app-content')).not.toBeEmpty();expect(await page.evaluate(()=>window.JuntoApp.getState().demo)).toBe(false);
 await page.reload();await expect(page.locator('#authenticated-app')).toBeVisible();await page.evaluate(()=>window.JuntoCloud.open());await page.locator('[data-feature="cloud-signout"]').click();await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);await page.reload();await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);
});
test('invite onboarding unlocks only after joining',async({page})=>{
 await mockCloud(page,{authenticated:true,space:false});await page.goto('/');await locked(page);await page.locator('#cloud-invite').fill('abcd-1234-efab-5678');await page.locator('[data-feature-form="cloud-join"] [type="submit"]').click();await expect(page.locator('#authenticated-app')).toBeVisible();
});
test('email confirmation signup returns to login and enters after confirmation',async({page})=>{
 await mockCloud(page,{space:false,signupSession:false});await page.goto('/');await page.locator('[data-feature="cloud-auth-toggle"]').click();await page.locator('#cloud-name').fill('Teste');await page.locator('#cloud-email').fill('teste@junto.example');await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();await expect(page.locator('[data-feature-form="cloud-auth"]')).toHaveAttribute('data-mode','login');await expect(page.locator('.auth-notice')).toContainText('Conta criada');await expect(page.locator('#cloud-email')).toHaveValue('teste@junto.example');await expect(page.locator('#cloud-password')).toHaveValue('');await locked(page);await page.locator('[data-feature="cloud-confirmed"]').click();await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();await expect(page.locator('[data-feature-form="cloud-create"]')).toBeVisible();await locked(page);
});
test('expired session with failed refresh never displays financial content',async({page})=>{
 await mockCloud(page,{authenticated:true,expiresIn:-10,denyRefresh:true});await page.goto('/');await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);
});
test('session expiration clears a previously rendered dashboard',async({page})=>{
 await page.clock.install();await mockCloud(page,{authenticated:true,expiresIn:120,denyRefresh:true});await page.goto('/');await expect(page.locator('#authenticated-app')).toBeVisible();await page.clock.fastForward(125000);await expect(page.locator('#cloud-email')).toBeVisible();await locked(page);
});
test('email confirmation callback signs in automatically and opens onboarding',async({page})=>{
 await mockCloud(page,{space:false,signupSession:false});await page.goto('/');await page.locator('[data-feature="cloud-auth-toggle"]').click();await page.locator('#cloud-name').fill('Teste');await page.locator('#cloud-email').fill('teste@junto.example');await page.locator('#cloud-password').fill('TestPassword123');await page.locator('[data-feature-form="cloud-auth"] [type="submit"]').click();await expect(page.locator('[data-feature-form="cloud-auth"]')).toHaveAttribute('data-mode','login');await page.goto('/?code=confirmed-email-code');await expect(page.locator('[data-feature-form="cloud-create"]')).toBeVisible();await locked(page);
});
