/* iOS interaction layer — purely presentational; no app business logic changed. */
(() => {
  const content = document.getElementById('app-content');
  if (content) {
    let timer;
    new MutationObserver(() => {
      clearTimeout(timer);
      content.classList.remove('ios-screen-in');
      void content.offsetWidth;
      content.classList.add('ios-screen-in');
      timer=setTimeout(()=>content.classList.remove('ios-screen-in'),420);
    }).observe(content,{childList:true,subtree:false});
  }

  // Adds an iOS-like pressed state to dynamically-rendered actionable controls.
  const pressable='button,.btn,.nav-item,.filter,.chip-btn,.icon-btn,.text-link,[role="button"]';
  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest?.(pressable); if(!el) return;
    el.classList.add('ios-pressed');
  },{passive:true});
  const release=e=>{document.querySelectorAll('.ios-pressed').forEach(el=>el.classList.remove('ios-pressed'));};
  document.addEventListener('pointerup',release,{passive:true});
  document.addEventListener('pointercancel',release,{passive:true});

  // Scroll active tab into view if future versions add more tabs.
  document.addEventListener('click',e=>{
    const nav=e.target.closest?.('.mobile-nav button');
    if(nav) requestAnimationFrame(()=>nav.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
  });
})();
