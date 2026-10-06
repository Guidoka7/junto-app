const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));};

function allowOrigin(origin){
  if(!origin)return null;
  try{
    const url=new URL(origin);
    const host=url.hostname.toLowerCase();
    if(origin==='capacitor://localhost'||origin==='https://localhost'||origin==='http://localhost')return origin;
    if(url.protocol==='https:'&&(host==='junto-app-juntoapp.vercel.app'||host==='junto-app-tan.vercel.app'||host.endsWith('-juntoapp.vercel.app')))return origin;
  }catch{}
  return null;
}
function cors(req,res){
  const origin=String(req.headers.origin||'');
  const allowed=allowOrigin(origin);
  if(allowed){res.setHeader('Access-Control-Allow-Origin',allowed);res.setHeader('Vary','Origin');}
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age','86400');
  return !origin||Boolean(allowed);
}

async function verifyUser(token){
  const url=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
  const key=String(process.env.SUPABASE_PUBLISHABLE_KEY||'');
  if(!url||!key)throw Object.assign(new Error('Configuração de autenticação ausente no servidor.'),{status:503,code:'server_config'});
  const response=await fetch(url+'/auth/v1/user',{headers:{Authorization:'Bearer '+token,apikey:key}});
  if(!response.ok)throw Object.assign(new Error('Sessão inválida ou expirada.'),{status:401,code:'unauthorized'});
  return response.json();
}

export default async function handler(req,res){
  if(!cors(req,res))return json(res,403,{code:'origin_not_allowed',message:'Origem não autorizada.'});
  if(req.method==='OPTIONS'){res.statusCode=204;return res.end();}
  if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return json(res,405,{code:'method_not_allowed',message:'Método não permitido.'});}

  const auth=String(req.headers.authorization||'');
  if(!auth.startsWith('Bearer '))return json(res,401,{code:'unauthorized',message:'Entre novamente no Juntô.'});
  const token=auth.slice(7).trim();
  if(!token)return json(res,401,{code:'unauthorized',message:'Entre novamente no Juntô.'});

  const apiKey=String(process.env.GEMINI_API_KEY||'').trim();
  const requestedModel=String(process.env.GEMINI_MODEL||'').trim().toLowerCase();
  const allowedModels=new Set(['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-3-flash-preview','gemini-3.1-flash-lite','gemini-3.5-flash','gemini-3.5-flash-lite','gemini-3.6-flash','gemini-3.7-flash']);
  const model=allowedModels.has(requestedModel)?requestedModel:'gemini-2.5-flash';
  if(!apiKey)return json(res,503,{code:'not_configured',message:'A inteligência do Juntô está temporariamente indisponível.'});

  let body=req.body;
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return json(res,400,{code:'bad_request',message:'Solicitação inválida.'});}}
  if(!body||typeof body!=='object'||!Array.isArray(body.contents))return json(res,400,{code:'bad_request',message:'Solicitação inválida.'});

  const generationConfig={...(body.generationConfig||{})};
  if(model.startsWith('gemini-3')){
    delete generationConfig.temperature;
    delete generationConfig.topP;
    delete generationConfig.topK;
    delete generationConfig.candidateCount;
    const deep=Number(generationConfig?.thinkingConfig?.thinkingBudget||0)>0;
    generationConfig.thinkingConfig={thinkingLevel:deep?'medium':'minimal'};
  }else if(model.startsWith('gemini-2.5')){
    const deep=Number(generationConfig?.thinkingConfig?.thinkingBudget||0)>0;
    generationConfig.thinkingConfig={thinkingBudget:deep?1024:0};
  }
  const allowed={
    contents:body.contents,
    systemInstruction:body.systemInstruction,
    generationConfig,
    ...(Array.isArray(body.tools)?{tools:body.tools}:{})
  };
  const encoded=JSON.stringify(allowed);
  if(encoded.length>180000)return json(res,413,{code:'payload_too_large',message:'A conversa ficou grande demais. Comece uma nova conversa.'});

  try{
    await verifyUser(token);
    const upstream=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
      body:encoded
    });
    let data={};try{data=await upstream.json();}catch{}
    if(!upstream.ok){
      let code='upstream_error';
      if(upstream.status===400)code='bad_request';
      else if(upstream.status===401||upstream.status===403)code='auth';
      else if(upstream.status===404)code='model';
      else if(upstream.status===429)code='rate_limited';
      const message=upstream.status===429?'A inteligência do Juntô atingiu o limite disponível agora.':
        upstream.status===404?'O modelo configurado no servidor não está disponível.':
        upstream.status===401||upstream.status===403?'A configuração de inteligência do servidor foi recusada.':
        'A inteligência do Juntô não conseguiu responder agora.';
      return json(res,upstream.status,{code,message});
    }
    return json(res,200,data);
  }catch(error){
    const status=Number(error?.status)||500,code=error?.code||'server_error';
    return json(res,status,{code,message:status===401?'Sua sessão expirou. Entre novamente no Juntô.':'Não foi possível concluir a solicitação agora.'});
  }
}
