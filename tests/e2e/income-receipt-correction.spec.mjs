import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

test.beforeEach(async({page})=>{await mockCloud(page,{authenticated:true});});

test('a corrected weekly receipt shows the real amount and adjusts cash only once',async({page})=>{
  await page.clock.install({time:new Date('2026-10-13T12:00:00')});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users[0].balance=128600;
    s.incomes=[{id:'weekly-benefit',name:'VA E VT',person:'a',amount:23252,rule:'weekly',weekday:2,since:'2026-09-01',auto:false}];
    s.received=[
      {id:'old-week',incomeId:'weekly-benefit',person:'a',date:'2026-10-06',amount:20000,balanceDelta:20000,status:'received'},
      {id:'current-week',incomeId:'weekly-benefit',person:'a',date:'2026-10-13',amount:28600,balanceDelta:28600,status:'received',auto:true}
    ];
    window.JuntoApp.applyState(s);
  });
  await page.evaluate(()=>{
    const button=document.createElement('button');
    button.dataset.action='income-detail';button.dataset.id='weekly-benefit';
    document.body.append(button);button.click();button.remove();
  });
  await expect(page.locator('#modal')).toContainText('R$ 232,52');
  await expect(page.locator('#modal')).toContainText('13 de out · Recebido: R$ 286,00');
  await page.locator('#modal [data-action="income-receipt-correct"][data-id="current-week"]').click();
  await page.locator('#income-received-correct').fill('232,52');
  await page.locator('[data-form="income-receipt-correct"] [type="submit"]').click();

  await expect(page.locator('#modal')).toContainText('13 de out · Recebido: R$ 232,52');
  const first=await page.evaluate(()=>{
    const s=window.JuntoApp.getState();
    return {incomes:s.incomes,received:s.received,balances:s.users.map(u=>u.balance)};
  });
  expect(first.incomes[0].amount).toBe(23252);
  expect(first.received).toHaveLength(2);
  expect(first.received.find(r=>r.id==='old-week').amount).toBe(20000);
  expect(first.received.find(r=>r.id==='current-week')).toMatchObject({amount:23252,balanceDelta:23252,date:'2026-10-13',auto:true});
  expect(first.balances[0]).toBe(123252);

  await page.locator('#modal [data-action="income-receipt-correct"][data-id="current-week"]').click();
  await page.locator('[data-form="income-receipt-correct"] [type="submit"]').click();
  expect(await page.evaluate(()=>window.JuntoApp.getState().users[0].balance)).toBe(123252);
  expect(await page.evaluate(()=>window.JuntoApp.getState().received.length)).toBe(2);
});

test('correcting a manually logged receipt without cash impact keeps the balance untouched',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users[0].balance=50000;
    s.incomes=[{id:'bonus',name:'Bônus',person:'a',amount:30000,rule:'monthly',day:13,since:'2026-01-01'}];
    s.received=[{id:'manual',incomeId:'bonus',person:'a',date:'2026-10-13',amount:30000,balanceDelta:0,status:'received'}];
    window.JuntoApp.applyState(s);
  });
  await page.evaluate(()=>{
    const button=document.createElement('button');
    button.dataset.action='income-detail';button.dataset.id='bonus';
    document.body.append(button);button.click();button.remove();
  });
  await page.locator('#modal [data-action="income-receipt-correct"][data-id="manual"]').click();
  await page.locator('#income-received-correct').fill('232,52');
  await page.locator('[data-form="income-receipt-correct"] [type="submit"]').click();
  const result=await page.evaluate(()=>{
    const s=window.JuntoApp.getState();
    return {balance:s.users[0].balance,received:s.received[0]};
  });
  expect(result.balance).toBe(50000);
  expect(result.received).toMatchObject({amount:23252,balanceDelta:0});
});
