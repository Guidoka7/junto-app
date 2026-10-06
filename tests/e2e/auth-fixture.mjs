const uid='33333333-3333-4333-8333-333333333333';
export const testConfig={url:'https://junto-test.supabase.co',publishableKey:'sb_publishable_test_only_public_configuration'};
export function sessionResponse(expiresIn=3600){
 const user={id:uid,email:'teste@junto.example',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Teste'},app_metadata:{provider:'email'},created_at:new Date().toISOString()};
 const expires_at=Math.floor(Date.now()/1000)+expiresIn;
 const token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',exp:expires_at})).toString('base64url'),'test'].join('.');
 return {access_token:token,refresh_token:'test-refresh',expires_in:expiresIn,expires_at,token_type:'bearer',user};
}
export async function mockCloud(page,{authenticated=false,space=true,signupSession=true,missingConfig=false,expiresIn=3600,denyRefresh=false}={}){
 const session=sessionResponse(expiresIn);let remote=null;
 await page.route('**/js/config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.JuntoCloudConfig=${JSON.stringify(missingConfig?{}:testConfig)};`}));
 if(authenticated)await page.addInitScript(session=>localStorage.setItem('sb-junto-test-auth-token',JSON.stringify(session)),session);
 await page.routeWebSocket('**/realtime/v1/websocket**',socket=>socket.onMessage(text=>{const m=JSON.parse(text);socket.send(JSON.stringify(Array.isArray(m)?[m[0],m[1],m[2],'phx_reply',{status:'ok',response:{}}]:{...m,event:'phx_reply',payload:{status:'ok',response:{}}}));}));
 await page.route(testConfig.url+'/**',async route=>{
  const req=route.request(),url=new URL(req.url()),data=req.postDataJSON()||{};
  if(url.pathname.endsWith('/token')){if(denyRefresh&&url.searchParams.get('grant_type')==='refresh_token')return route.fulfill({status:400,json:{code:'refresh_token_not_found',message:'Invalid Refresh Token'}});return route.fulfill({json:session});}
  if(url.pathname.endsWith('/signup'))return route.fulfill({json:signupSession?session:session.user});
  if(url.pathname.endsWith('/user'))return route.fulfill({json:session.user});
  if(url.pathname.endsWith('/logout'))return route.fulfill({json:{}});
  if(url.pathname.endsWith('/junto_read_space')){
   if(space&&!remote)remote={space_id:'44444444-4444-4444-8444-444444444444',slot:'a',revision:1,members:1,payload:await page.evaluate(()=>window.JuntoApp.freshState('Teste'))};
   return route.fulfill({json:remote});
  }
  if(url.pathname.endsWith('/junto_create_space')||url.pathname.endsWith('/junto_join_space')){remote={space_id:'44444444-4444-4444-8444-444444444444',slot:'a',revision:1,members:1,payload:data.p_payload||await page.evaluate(()=>window.JuntoApp.freshState('Teste'))};return route.fulfill({json:remote});}
  if(url.pathname.endsWith('/junto_sync_space')){remote.payload=data.p_payload;remote.revision++;return route.fulfill({json:{revision:remote.revision}});}
  return route.fulfill({json:{}});
 });
}
