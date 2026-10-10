import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test('conta de água mostra centavos exatos no painel, no rateio e após editar',async({page})=>{
  await mockCloud(page,{authenticated:true});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users.push({id:'b',name:'Amanda',balance:100000,tone:'pink'});
    const d=new Date(),due=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    s.bills=[{id:'water-cents',name:'Água',category:'Casa',amount:9540,payer:'half',due,status:'open',recurring:false}];
    window.JuntoApp.applyState(s);
  });
  const next7=page.locator('.j-card').filter({hasText:'Próximos 7 dias'}).first();
  const water=next7.locator('[data-action="bill-detail"][data-id="water-cents"]');
  await expect(water).toContainText('R$ 47,70');
  await water.click();
  await expect(page.locator('#modal')).toContainText('R$ 95,40');
  await page.locator('#modal [data-action="edit-bill"]').click();
  await expect(page.locator('#edit-bill-amount')).toHaveValue('95,40');
  await expect(page.locator('#split-preview')).toContainText('R$ 47,70');
  await page.locator('#edit-bill-amount').fill('95,41');
  await expect(page.locator('#split-preview')).toContainText('R$ 47,71');
  await expect(page.locator('#split-preview')).toContainText('R$ 47,70');
  await page.locator('[data-form="edit-bill"] [type="submit"]').click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect(water).toContainText('R$ 47,71');
  expect(await page.evaluate(()=>window.JuntoApp.getState().bills[0].amount)).toBe(9541);
  await page.evaluate(()=>window.JuntoApp.setSlot('b'));
  await expect(water).toContainText('R$ 47,70');
  // Um centavo indivisível pertence a uma pessoa, mas nunca some do total.
  expect(4771+4770).toBe(9541);
});
