import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

// Smoke-test both visual modes on the five product areas using a realistic couple
// and generate auditable screenshots for UI review, not pixel-perfect golden files.
for(const theme of ['light','dark']){
  test(`acabamento iOS ${theme}: glow, legibilidade, navegação e cinco telas`,async({page})=>{
    await mockCloud(page,{authenticated:true});
    await page.addInitScript(theme=>localStorage.setItem('junto-theme-v1',theme),theme);
    await page.goto('/');
    await expect(page.locator('#authenticated-app')).toBeVisible();
    await page.evaluate(()=>{
      const s=window.JuntoApp.freshState('Pessoa A');
      s.users[0].balance=76533;
      s.users.push({id:'b',name:'Pessoa B',balance:42000,tone:'pink'});
      const date=new Date().toISOString().slice(0,10);
      s.transactions=[
        {id:'cafe',name:'Lanche',item:'Lanche',amount:1200,payer:'a',by:'a',category:'Lanches',date},
        {id:'uber',name:'Uber trabalho',item:'Uber',amount:3500,payer:'b',by:'b',category:'Transporte',date}
      ];
      window.JuntoApp.applyState(s);
    });
    const color=theme==='dark'?'rgb(245, 245, 247)':'rgb(17, 18, 22)';
    const glows=new Set();
    for(const route of ['home','ledger','analysis','goals','couple']){
      if(route==='couple'){await page.locator('#mobile-nav [data-route="home"]').click();await page.locator('.j-couple-link').click();}
      else await page.locator(`#mobile-nav [data-route="${route}"]`).click();
      await expect(page.locator('body')).toHaveAttribute('data-route',route);
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      const appearance=await page.evaluate(()=>{
        const body=getComputedStyle(document.body);
        const heading=getComputedStyle(document.querySelector('.j-head h2,.j-hello h2'));
        const nav=getComputedStyle(document.querySelector('.mobile-nav'));
        const actions=document.querySelector('#header-actions');
        const hero=document.querySelector('.j-hero');
        return {
          glow:body.backgroundImage.includes('radial-gradient'),
          glowColor:body.backgroundImage.match(/rgba?\([^)]+\)/)?.[0],
          titleColor:heading.color,
          navBlur:nav.backdropFilter||nav.webkitBackdropFilter,
          heroGradient:hero?getComputedStyle(hero).backgroundImage.includes('linear-gradient'):true,
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          quickButtons:actions?.querySelectorAll('button').length||0
        };
      });
      glows.add(appearance.glowColor);
      expect(appearance.glow,`${theme}/${route}: missing ambient top gradient`).toBe(true);
      expect(appearance.titleColor,`${theme}/${route}: unreadable heading`).toBe(color);
      expect(appearance.navBlur,`${theme}/${route}: missing floating nav material`).toContain('blur');
      expect(appearance.heroGradient,`${theme}/${route}: flat hero card`).toBe(true);
      expect(appearance.overflow,`${theme}/${route}: horizontal overflow`).toBe(false);
      expect(appearance.quickButtons).toBe(2);
      await page.waitForTimeout(420); // aguardar transição de opacidade da rota antes da captura
      await page.screenshot({path:`test-results/premium-${theme}-${route}.png`});
    }
    expect(glows.size,`${theme}: cada área deve ter o próprio brilho no topo`).toBe(5);
    await page.locator('#header-actions [data-action="toggle-theme"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme==='dark'?'light':'dark');
  });
}
