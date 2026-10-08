/* Aplica a preferência antes da primeira pintura, evitando o flash de tema claro. */
(()=>{
  let theme='light';
  try{if(localStorage.getItem('junto-theme-v1')==='dark')theme='dark';}catch{}
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0f1725':'#f7f8fb');
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content',theme);
})();
