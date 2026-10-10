import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

const fixture=async page=>{
  await mockCloud(page,{authenticated:true});
  await page.addInitScript(()=>localStorage.setItem('junto-theme-v1','dark'));
  await page.goto('/');
  await expect(page.locator('#authenticated-app')).toBeVisible();
  await page.evaluate(()=>{
    const s=window.JuntoApp.freshState('Guilherme');
    s.users.push({id:'b',name:'Amanda',balance:50000,tone:'pink'});
    s.notifications=[
      {id:'notice-one',to:'a',title:'O saldo da dupla mudou.',
       body:'Amanda atualizou o saldo atual.',read:false,createdAt:Date.now()-3600000},
      {id:'notice-two',to:'a',title:'Conta atualizada.',
       body:'Amanda registrou Água por R$ 95,40.',read:false,createdAt:Date.now()-3600000},
      {id:'notice-three',to:'a',title:'Novo combinado',
       body:'Amanda pediu para conferir a próxima despesa.',requestId:'req-notice',read:false,createdAt:Date.now()-7200000}
    ];
    window.JuntoApp.applyState(s);
  });
  await page.locator('#header-actions [data-action="notifications"]').click();
  await expect(page.locator('dialog[data-kind="notifications"]')).toBeVisible();
  await expect(page.locator('dialog[data-kind="notifications"] .notice-item')).toHaveCount(3);
};

test('notificações do casal têm fundo escuro, texto legível e versão de card responsiva',async({page})=>{
  await fixture(page);
  for(const width of [320,390,430]){
    await page.setViewportSize({width,height:844});
    const styles=await page.evaluate(()=>{
      const dialog=document.querySelector('dialog[data-kind="notifications"]');
      const card=dialog.querySelector('.notice-item');
      const second=dialog.querySelectorAll('.notice-item')[1];
      const contrast=(foreground,background)=>{
        const channels=value=>value.match(/[0-9.]+/g).slice(0,3).map(v=>Number(v)/255)
          .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
        const l=value=>{const a=channels(value);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
        const a=l(foreground),b=l(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      };
      const surface=getComputedStyle(card);
      const heading=getComputedStyle(card.querySelector('strong'));
      const body=getComputedStyle(second.querySelector('p'));
      const time=getComputedStyle(card.querySelector('time'));
      const modalText=getComputedStyle(dialog.querySelector('.modal-sub'));
      const request=getComputedStyle(dialog.querySelector('[data-action="notice-request"]'));
      return {
        background:surface.backgroundImage,
        cardText:surface.color,
        title:heading.color,
        body:body.color,
        time:time.color,
        modalText:modalText.color,
        request:request.color,
        titleContrast:contrast(heading.color,'rgb(37, 46, 61)'),
        bodyContrast:contrast(body.color,'rgb(37, 46, 61)'),
        timeContrast:contrast(time.color,'rgb(37, 46, 61)'),
        cardWidth:card.getBoundingClientRect().width,
        listWidth:dialog.querySelector('.notice-list').getBoundingClientRect().width,
        dialogWidth:dialog.getBoundingClientRect().width,
        horizontalOverflow:dialog.scrollWidth>dialog.clientWidth
      };
    });
    expect(styles.background).toContain('rgb(37, 46, 61)');
    expect(styles.background).not.toContain('rgb(238, 240, 246)');
    expect(styles.cardText).toBe('rgb(244, 246, 251)');
    expect(styles.titleContrast).toBeGreaterThan(7);
    expect(styles.bodyContrast).toBeGreaterThan(5);
    expect(styles.timeContrast).toBeGreaterThan(4.5);
    expect(styles.modalText).toBe('rgb(179, 190, 205)');
    expect(styles.request).toBe('rgb(242, 205, 144)');
    expect(styles.cardWidth).toBeLessThanOrEqual(styles.listWidth+1);
    expect(styles.listWidth).toBeLessThanOrEqual(styles.dialogWidth+1);
    expect(styles.horizontalOverflow).toBe(false);
  }
});

test('modo claro conserva cartões claros sem mudar as notificações',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>document.documentElement.dataset.theme='light');
  const item=page.locator('dialog[data-kind="notifications"] .notice-item').first();
  await expect(item).toContainText('O saldo da dupla mudou.');
  await expect(item).toContainText('Amanda atualizou o saldo atual.');
  const styles=await item.evaluate(el=>({background:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color}));
  expect(styles.background).toBe('rgb(238, 240, 246)');
  expect(styles.color).not.toBe('rgb(244, 246, 251)');
});
