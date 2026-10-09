import {test, expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

async function openHistory(page, person = 'b') {
  await mockCloud(page, {authenticated: true});
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(person => {
    const date = new Date().toLocaleDateString('sv-SE');
    const s = window.JuntoApp.freshState('Guilherme');
    s.users[0].balance = 100000;
    s.users.push({id: 'b', name: 'Amanda', balance: 50000, tone: 'pink'});
    s.incomes = [{id: 'salary-b', name: 'Salário Amanda', person: 'b', amount: 200000, rule: 'monthly', day: 1, since: date.slice(0, 7) + '-01'}];
    s.transactions = [
      {id: 'expense-a', name: 'Uber Guilherme', amount: 5000, payer: 'a', by: 'a', category: 'Transporte', date},
      {id: 'expense-b', name: 'Creche filho', amount: 20000, payer: 'b', by: 'b', category: 'Outros', date},
      {id: 'expense-split', name: 'Mercado dividido', amount: 10000, payer: 'half', by: 'a', split: [{id: 'a', amount: 5000}, {id: 'b', amount: 5000}], category: 'Alimentação', date},
      {id: 'paid-b', name: 'Van Emanuel', amount: 25000, payer: 'b', by: 'b', category: 'Transporte', billId: 'bill-b', date}
    ];
    s.received = [
      {id: 'received-a', name: 'Freela Guilherme', person: 'a', amount: 40000, date, status: 'received'},
      {id: 'received-b', name: 'Pix Amanda', person: 'b', amount: 80000, date, status: 'received'},
      {id: 'unknown', name: 'Entrada sem responsável', amount: 1000, date, status: 'received'}
    ];
    s.goals = [{id: 'goal', name: 'Reserva', target: 100000, saved: 15000, icon: 'shield'}];
    s.saves = [{id: 'save-a', goalId: 'goal', actor: 'a', amount: 10000, date}, {id: 'save-b', goalId: 'goal', actor: 'b', amount: 5000, date}];
    window.JuntoApp.applyState(s);
    window.JuntoApp.setSlot(person);
  }, person);
  await page.locator('#mobile-nav [data-route="ledger"]').click();
}

test('history opens for Amanda, includes her share of bills, and shows both people in the same tab', async ({page}) => {
  await openHistory(page);
  const days = page.locator('#ledger-days');
  await expect(page.locator('.j-ledger-scope')).toContainText('Amanda');
  await expect(days).toContainText('Creche filho');
  await expect(days).toContainText('Van Emanuel');
  await expect(days.locator('[data-id="expense-split"]')).toContainText('50,00');
  await expect(days).toContainText('Pix Amanda');
  await expect(days).not.toContainText('Guilherme');
  await expect(days).not.toContainText('Entrada sem responsável');
  await expect(page.locator('.j-month-stats')).toContainText('800,00');
  await expect(page.locator('.j-month-stats')).toContainText('500,00');
  await expect(page.locator('.j-ledger-result')).toContainText('300,00');
  await expect(page.locator('.j-ledger-saved')).toContainText('50,00');
  await page.getByRole('button', {name: 'Ver tudo', exact: true}).click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'ledger');
  await expect(page.locator('.j-seg [data-value="history"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(days).toContainText('Guilherme');
  await expect(days).toContainText('Pix Amanda');
  await expect(page.locator('.j-month-stats')).toContainText('1.210,00');
  await expect(page.locator('.j-month-stats')).toContainText('600,00');
  await page.locator('[data-action="ledger-filter"][data-value="income"]').click();
  await expect(days).not.toContainText('Creche');
  await page.getByRole('button', {name: 'Só meu histórico', exact: true}).click();
  await expect(days).toContainText('Pix Amanda');
  await expect(days).not.toContainText('Guilherme');
  await page.evaluate(() => window.JuntoApp.setSlot('a'));
  await expect(page.locator('.j-ledger-scope')).toContainText('Guilherme');
  await expect(days).toContainText('Uber Guilherme');
  await expect(days).not.toContainText('Pix Amanda');
  await page.getByRole('button', {name: 'Ver tudo', exact: true}).click();
  await page.locator('#mobile-nav [data-route="home"]').click();
  await page.locator('#mobile-nav [data-route="ledger"]').click();
  await expect(page.getByRole('button', {name: 'Ver tudo', exact: true})).toBeVisible();
  await expect(days).not.toContainText('Pix Amanda');
});

test('registering a receipt from history adds it once to Amanda without creating recurring income', async ({page}) => {
  await openHistory(page);
  await page.getByRole('button', {name: 'Registrar entrada', exact: true}).click();
  await page.locator('#receipt-name').fill('Freela Amanda');
  await page.locator('#receipt-amount').fill('125,50');
  const date = await page.locator('#receipt-date').inputValue();
  await page.locator('[data-form="ledger-income"] [type="submit"]').click();
  await expect(page.locator('#modal')).not.toBeVisible();
  const state = await page.evaluate(() => window.JuntoApp.getState());
  expect(state.users.map(u => u.balance)).toEqual([100000, 62550]);
  expect(state.incomes).toHaveLength(1);
  expect(state.received.filter(r => r.name === 'Freela Amanda')).toHaveLength(1);
  expect(state.received.at(-1)).toMatchObject({person: 'b', incomeId: null, amount: 12550, balanceDelta: 12550, date, actualDate: date});
  await expect(page.locator('#ledger-days')).toContainText('Freela Amanda');
  await expect(page.locator('.j-month-stats')).toContainText('925,50');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('junto-prototype-v2')).received.at(-1).name)).toBe('Freela Amanda');
});

test('planned receipts use the actual receipt date, prevent duplication, and can preserve an existing balance', async ({page}) => {
  await openHistory(page);
  await page.getByRole('button', {name: 'Registrar entrada', exact: true}).click();
  await page.locator('#receipt-income').selectOption('salary-b');
  await expect(page.locator('#receipt-name')).toHaveValue('Salário Amanda');
  await expect(page.locator('#receipt-amount')).toHaveValue('2.000,00');
  const dates = await page.evaluate(() => {
    const now = new Date();
    return {actual: now.toLocaleDateString('sv-SE'), expected: new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('sv-SE')};
  });
  await page.locator('#receipt-expected-date').fill(dates.expected);
  await page.locator('[name="receipt-adjust-balance"]').uncheck();
  await page.locator('[data-form="ledger-income"] [type="submit"]').click();
  await expect(page.locator('.j-month-stats')).toContainText('2.800,00');
  const state = await page.evaluate(() => window.JuntoApp.getState());
  expect(state.users.map(u => u.balance)).toEqual([100000, 50000]);
  expect(state.received.at(-1)).toMatchObject({person: 'b', incomeId: 'salary-b', date: dates.expected, actualDate: dates.actual, balanceDelta: 0});
  await page.getByRole('button', {name: 'Registrar entrada', exact: true}).click();
  await page.locator('#receipt-income').selectOption('salary-b');
  await page.locator('#receipt-expected-date').fill(dates.expected);
  await page.locator('[data-form="ledger-income"] [type="submit"]').click();
  await expect(page.locator('#form-error')).toContainText('já foi registrado');
  expect(await page.evaluate(() => window.JuntoApp.getState().received.length)).toBe(state.received.length);
});

test('history controls fit on small phones in both themes', async ({page}) => {
  await openHistory(page);
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390]) {
      await page.setViewportSize({width, height: 844});
      await expect(page.getByRole('button', {name: 'Registrar entrada', exact: true})).toBeInViewport();
      await expect(page.getByRole('button', {name: 'Ver tudo', exact: true})).toBeInViewport();
      await expect(page.locator('[data-action="ledger-filter"][data-value="income"]')).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.j-history-filters .j-chips').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await page.screenshot({path: `test-results/history-${theme}-${width}.png`, fullPage: true});
    }
  }
});
