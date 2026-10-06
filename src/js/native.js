import {Capacitor,SystemBars,SystemBarsStyle} from '@capacitor/core';
import {App} from '@capacitor/app';
import {SplashScreen} from '@capacitor/splash-screen';
import {saveDownload} from '../features/download.js';
window.JuntoDownload=saveDownload;
if(Capacitor.isNativePlatform()){
  document.documentElement.classList.add('native-app');
  SystemBars.setStyle({style:SystemBarsStyle.Light}).catch(()=>{});
  window.addEventListener('load',()=>SplashScreen.hide().catch(()=>{}));
  App.addListener('backButton',()=>{
    const modal=document.getElementById('modal');if(modal?.open){window.JuntoApp.closeModal();return;}
    const chat=document.getElementById('chat-panel');if(chat&&!chat.hidden){document.querySelector('[data-action="chat-close"]')?.click();return;}
    if(document.body.dataset.route!=='home'){document.querySelector('#mobile-nav [data-route="home"]')?.click();return;}
    App.exitApp();
  });
  const passURL=url=>{if(!url?.startsWith('junto://auth-callback'))return;window.JuntoAuthURL=url;window.dispatchEvent(new CustomEvent('junto:auth-url',{detail:url}));};
  App.addListener('appUrlOpen',event=>passURL(event.url));App.getLaunchUrl().then(event=>passURL(event?.url));
  App.addListener('appStateChange',event=>{if(event.isActive){window.JuntoBank?.refresh();window.JuntoCloud?.synchronize();}});
}
