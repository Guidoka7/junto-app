import {test,expect} from '@playwright/test';
import {mockCloud} from './auth-fixture.mjs';

// Smoke-test both visual modes on the six product areas using a realistic couple
// and generate auditable screenshots for UI review, not pixel-perfect golden files.
for(const theme of ['light','dark']){
  test(`acabamento iOS ${theme}: glow, legibilidade, navegação e seis telas`,async({page})=>{
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
    const color=theme==='dark'?'rgb(240, 244, 252)':'rgb(27, 43, 70)';
    for(const route of ['home','future','analysis','bills','requests','goals']){
      await page.locator(`#mobile-nav [data-route="${route}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      const appearance=await page.evaluate(()=>{
        const body=getComputedStyle(document.body);
        const heading=getComputedStyle(document.querySelector('#main-title'));
        const nav=getComputedStyle(document.querySelector('.mobile-nav'));
        const actions=document.querySelector('#header-actions');
        const visualCard=document.querySelector('.home-money-card-v3,.future-v3-card,.analysis-v3-card,.bills-v3-summary,.request-card,.plans-v3-dream');
        return {
          glow:body.backgroundImage.includes('radial-gradient'),
          titleColor:heading.color,
          navBlur:nav.backdropFilter||nav.webkitBackdropFilter,
          cardGradient:visualCard?getComputedStyle(visualCard).backgroundImage.includes('linear-gradient'):true,
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          quickButtons:actions?.querySelectorAll('button').length||0
        };
      });
      expect(appearance.glow,`${theme}/${route}: missing ambient top gradient`).toBe(true);
      expect(appearance.titleColor,`${theme}/${route}: unreadable heading`).toBe(color);
      expect(appearance.navBlur,`${theme}/${route}: missing floating nav material`).toContain('blur');
      expect(appearance.cardGradient,`${theme}/${route}: flat opaque cards`).toBe(true);
      expect(appearance.overflow,`${theme}/${route}: horizontal overflow`).toBe(false);
      expect(appearance.quickButtons).toBe(2);
      await page.screenshot({path:`test-results/premium-${theme}-${route}.png`});
    }
    await page.locator('#header-actions [data-action="toggle-theme"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme==='dark'?'light':'dark');
  });
}
