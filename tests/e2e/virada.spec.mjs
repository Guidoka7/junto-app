import {test,expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {mockCloud} from './auth-fixture.mjs';

const allow={privateAccounts:[createHash('sha256').update('teste@junto.example').digest('hex')]};
async function seed(page){
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users.push({id:'b',name:'Parceira',balance:0,tone:'pink'});
    const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;};
    s.transactions=[
      {id:'c1',name:'Cigarro',item:'Cigarro',amount:1200,payer:'a',by:'a',category:'Hábitos',date:d(1)},
      {id:'c2',name:'Maço',amount:1200,payer:'a',by:'a',category:'Hábitos',date:d(9)},
      {id:'b1',name:'Latão Heineken',amount:900,payer:'a',by:'a',category:'Lanches',date:d(3)},
      {id:'i1',name:'iFood',amount:4500,payer:'a',by:'a',category:'Delivery',date:d(5)},
      {id:'m1',name:'Mercado',amount:25000,payer:'a',by:'a',category:'Alimentação',date:d(20)},
      {id:'p1',name:'Cigarro dela',item:'Cigarro',amount:1500,payer:'b',by:'b',category:'Hábitos',date:d(2)},
    ];
    window.JuntoApp.applyState(s);
  });
}

test('a Virada não aparece para outras contas',async({page})=>{
  await mockCloud(page,{authenticated:true});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>window.JuntoPrivate.ready());
  await expect(page.locator('.vr-home')).toHaveCount(0);
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('junto-virada')).length)).toBe(0);
});

test('conta autorizada: ponto de partida, abertura, leitura privada e story',async({page})=>{
  await mockCloud(page,{authenticated:true,config:allow});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await seed(page);
  const card=page.locator('.vr-home');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Só você vê');
  await page.screenshot({path:'test-results/virada-home-new.png'});
  await card.click();
  await expect(page.locator('#virada')).toBeVisible();
  await expect(page.locator('.vr-wh')).toContainText('O que você quer cortar');
  await page.screenshot({path:'test-results/virada-wizard-1.png'});
  await page.locator('[data-vr="wz-next"]').click();
  await expect(page.locator('#vr-packs')).toHaveText('1');
  await page.locator('[data-vr="wz-packs"][data-value="0.25"]').click();
  await expect(page.locator('#vr-packs')).toHaveText('1,3');
  await page.locator('input[name="beerWeekly"]').fill('60,00');
  await page.screenshot({path:'test-results/virada-wizard-2.png'});
  await page.locator('[data-vr="wz-next"]').click();
  await page.locator('[data-vr="wz-mode"][data-id="bebida"][data-value="reduzir"]').click();
  await page.screenshot({path:'test-results/virada-wizard-3.png'});
  await page.locator('[data-vr="wz-next"]').click();
  await expect(page.locator('.vr-intro')).toBeVisible();
  await page.waitForTimeout(2900);
  await page.screenshot({path:'test-results/virada-intro.png'});
  await page.locator('[data-vr="intro-skip"]').click();
  await expect(page.locator('.vr-intro')).toHaveCount(0);
  await expect(page.locator('.vr-big')).toContainText('R$');
  await page.screenshot({path:'test-results/virada-hero.png'});

  // Leitura: só a parte dele, sem o cigarro da parceira.
  const rows=page.locator('.vr-rows li');
  await expect(rows.filter({hasText:'Cigarro dela'})).toHaveCount(0);
  await expect(rows.filter({hasText:'Latão Heineken'})).toContainText('Bebida');
  await expect(rows.filter({hasText:'iFood'})).toContainText('Delivery');
  await rows.filter({hasText:'iFood'}).locator('button').click();
  await page.locator('[data-vr="reclass-set"][data-value="need"]').click();
  await expect(rows.filter({hasText:'iFood'})).toHaveCount(0);

  // Leitura diária: base pelos dias antes da virada e o dia de hoje.
  await expect(page.locator('#vr-daily-title')).toContainText('Hoje');
  await expect(page.locator('.vr-chart .vr-day')).toHaveCount(30);
  await expect(page.locator('.vr-lede').filter({hasText:'Sua base é'})).toContainText('dias antes da virada');
  for(const [sel,name] of [['#vr-daily-title','daily'],['#vr-cost-title','cost'],['#vr-pays-title','pays'],['#vr-time-title','time'],['#vr-read-title','read'],['#vr-health-title','health'],['#vr-story-title','story']]){
    await page.locator(sel).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({path:`test-results/virada-${name}.png`});
  }
  await page.locator('[data-vr-range="years"]').fill('10');
  await expect(page.locator('#vr-years-out')).toHaveText('10 anos');

  // Fissura e cofre ficam no perfil privado.
  await page.locator('#vr-hero-title').scrollIntoViewIfNeeded();
  await page.locator('[data-vr="sos"]').click();
  await expect(page.locator('.vr-breath')).toBeVisible();
  await page.screenshot({path:'test-results/virada-sos.png'});
  await page.locator('[data-vr="sos-win"]').click();
  await expect(page.locator('.vr-stats')).toContainText('fissura vencida');
  // Venceu a fissura → converte o maço em guardado.
  await expect(page.locator('#vr-sheet-title')).toHaveText('Venceu a fissura');
  await expect(page.locator('[data-vr-form="desist"] input[name="amount"]')).toHaveValue('12,00');
  await page.locator('[data-vr-form="desist"] input[value="bebida"]').check({force:true});
  await expect(page.locator('[data-vr-form="desist"] input[name="amount"]')).toHaveValue('9,00');
  await page.screenshot({path:'test-results/virada-desist.png'});
  await page.locator('[data-vr-form="desist"] button[type="submit"]').click();
  await expect(page.locator('.vr-vault-head')).toContainText('R$ 9,00');
  await expect(page.locator('.vr-vault')).toContainText('1 desistência convertida');
  await page.screenshot({path:'test-results/virada-hero-after.png'});

  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('junto-virada-v1:33333333-3333-4333-8333-333333333333')));
  expect(stored.setup).toBe(true);
  expect(stored.habits.cigarro.packsPerDay).toBe(1.25);
  expect(stored.habits.bebida.weekly).toBe(6000);
  expect(stored.habits.bebida.mode).toBe('reduzir');
  expect(stored.overrides.i1).toBe('need');
  expect(stored.cravings).toBe(1);
  expect(stored.vault).toEqual([expect.objectContaining({kind:'desistencia',habit:'bebida',amount:900})]);
  const shared=await page.evaluate(()=>JSON.stringify(window.JuntoApp.getState()));
  expect(shared).not.toContain('virada');
  expect(shared).not.toContain('cravings');

  await page.keyboard.press('Escape');
  await expect(page.locator('#virada')).toHaveCount(0);
  await expect(page.locator('.vr-home [data-vr-live], .vr-home .vr-home-value')).toContainText('R$');
  await page.screenshot({path:'test-results/virada-home.png'});
});
