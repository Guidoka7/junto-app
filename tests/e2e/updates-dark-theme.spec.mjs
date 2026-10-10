import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test('Atualizações em dark usa card e versões escuros legíveis sem afetar o modo claro',async({page})=>{
  await mockCloud(page,{authenticated:true});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  const theme=async value=>{
    await page.evaluate(value=>document.documentElement.dataset.theme=value,value);
    await page.evaluate(()=>window.JuntoUpdates.open());
    await expect(page.locator('dialog[data-kind="updates"]')).toBeVisible();
    await expect(page.locator('.junto-update-card h3')).toContainText('Tudo em dia');
  };
  await theme('dark');
  for (const width of [320,390,430]){
    await page.setViewportSize({width,height:844});
    const styles=await page.evaluate(()=>{
      const dialog=document.querySelector('dialog[data-kind="updates"]');
      const card=dialog.querySelector('.junto-update-card');
      const version=dialog.querySelector('.junto-update-versions span');
      const label=dialog.querySelector('.junto-update-versions strong');
      const check=dialog.querySelector('[data-action="update-check"]');
      return {
        card:getComputedStyle(card).backgroundImage,
        versions:getComputedStyle(version).backgroundImage,
        ink:getComputedStyle(label).color,
        check:getComputedStyle(check).backgroundImage,
        checkInk:getComputedStyle(check).color,
        cardWidth:card.getBoundingClientRect().width,
        dialogWidth:dialog.getBoundingClientRect().width,
        overflow:dialog.scrollWidth>dialog.clientWidth
      };
    });
    expect(styles.card).toContain('rgb(35, 40, 50)');
    expect(styles.versions).toContain('rgb(44, 52, 66)');
    expect(styles.card).not.toContain('rgb(255, 255, 255)');
    expect(styles.versions).not.toContain('rgb(255, 255, 255)');
    expect(styles.ink).toBe('rgb(245, 247, 252)');
    expect(styles.check).toContain('rgb(232, 199, 141)');
    expect(styles.checkInk).toBe('rgb(24, 29, 39)');
    expect(styles.cardWidth).toBeLessThanOrEqual(styles.dialogWidth);
    expect(styles.overflow).toBe(false);
  }
  await theme('light');
  const light=await page.locator('.junto-update-card').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(light).toContain('rgb(255, 255, 255)');
});

test('painel escuro de download mantém botão de instalação e barra visíveis',async({page})=>{
  await mockCloud(page,{authenticated:true});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    document.documentElement.dataset.theme='dark';
    window.JuntoApp.openModal('Atualizações',`
      <div class="junto-update-card is-new">
        <div class="junto-update-icon">↻</div><span class="junto-update-kicker">BAIXANDO NO JUNTÔ</span>
        <h3>Preparando sua atualização</h3><p>Baixando com segurança.</p>
        <div class="junto-update-versions"><span><small>INSTALADA</small><strong>1.1.1-76d011a.47.1</strong></span><span><small>DISPONÍVEL</small><strong>1.1.1-novo.48.1</strong></span></div>
        <div class="junto-update-progress"><div class="junto-update-progress-track"><div id="junto-update-progress-bar" style="width:40%"></div></div><small id="junto-update-progress-text">40%</small></div>
      </div><div class="junto-update-actions has-update">
        <button class="btn primary wide" data-action="update-download">Baixar atualização</button>
        <button class="btn secondary wide" data-action="update-cancel">Cancelar download</button>
      </div>`, 'updates');
  });
  await expect(page.locator('#junto-update-progress-bar')).toBeVisible();
  await expect(page.locator('[data-action="update-download"]')).toBeVisible();
  await expect(page.locator('[data-action="update-cancel"]')).toBeVisible();
  const bg=await page.locator('.junto-update-card').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(bg).toContain('rgb(35, 40, 50)');
});
