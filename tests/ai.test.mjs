import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/ai.js';

const keys=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','GEMINI_API_KEY','GEMINI_MODEL'];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]])),originalFetch=globalThis.fetch;
test.beforeEach(()=>{
  process.env.SUPABASE_URL='https://test.supabase.co';process.env.SUPABASE_PUBLISHABLE_KEY='sb_publishable_test';
  process.env.GEMINI_API_KEY='test-only-server-key';process.env.GEMINI_MODEL='gemini-2.5-flash';
});
test.afterEach(()=>{globalThis.fetch=originalFetch;for(const k of keys){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];}});
const request=body=>({method:'POST',headers:{origin:'https://localhost',authorization:'Bearer test-user-token'},body});
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body?JSON.parse(body):null;}});
const payload=()=>({contents:[{role:'user',parts:[{text:'Quanto sobra no mês?'}]}],systemInstruction:{parts:[{text:'Use somente estes dados reais do app: {"saldo":1234.56,"contas":234.56}'}]},generationConfig:{maxOutputTokens:999999,temperature:4}});

test('AI verifies the session and forwards the supplied financial context unchanged',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{
    calls.push({url,options});return calls.length===1?Response.json({id:'user'}):Response.json({candidates:[{content:{role:'model',parts:[{text:'Sobram R$ 1.000.'}]}}]});
  };
  const body=payload(),res=response();await handler(request(body),res);
  assert.equal(res.statusCode,200);assert.equal(calls.length,2);
  assert.ok(calls[0].url.endsWith('/auth/v1/user'));assert.equal(calls[0].options.headers.Authorization,'Bearer test-user-token');
  const sent=JSON.parse(calls[1].options.body);assert.deepEqual(sent.contents,body.contents);assert.deepEqual(sent.systemInstruction,body.systemInstruction);
  assert.equal(sent.generationConfig.maxOutputTokens,4096);assert.equal(sent.generationConfig.temperature,1);
  assert.ok(!res.body.candidates[0].content.parts[0].text.includes(process.env.GEMINI_API_KEY));
});

test('an invalid session cannot reach Gemini',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({message:'Expired'},{status:401});};
  const res=response();await handler(request(payload()),res);assert.equal(res.statusCode,401);assert.equal(calls,1);assert.equal(res.body.code,'unauthorized');
});

for(const [status,code] of [[429,'rate_limited'],[404,'model'],[503,'upstream_error']])test(`Gemini ${status} remains an explicit error without a financial answer`,async()=>{
  let calls=0;globalThis.fetch=async()=>++calls===1?Response.json({id:'user'}):Response.json({error:{message:'Private upstream details'}},{status});
  const res=response();await handler(request(payload()),res);assert.equal(res.statusCode,status);assert.equal(res.body.code,code);
  assert.equal(res.body.candidates,undefined);assert.ok(!JSON.stringify(res.body).includes('Private upstream details'));
});

for(const abort of [false,true])test(`network ${abort?'timeout':'failure'} is explicit and retryable`,async()=>{
  globalThis.fetch=async()=>{throw abort?new DOMException('Timed out','AbortError'):new Error('Network unavailable');};
  const res=response();await handler(request(payload()),res);assert.equal(res.statusCode,abort?504:500);assert.equal(res.body.code,abort?'timeout':'server_error');assert.equal(res.body.candidates,undefined);
});

test('missing credentials, forbidden origin and excessive payload do not call upstream',async()=>{
  globalThis.fetch=async()=>{assert.fail('Upstream must not be called');};
  const origin=response();await handler({...request(payload()),headers:{origin:'https://example.invalid',authorization:'Bearer token'}},origin);assert.equal(origin.statusCode,403);
  const large=response(),body=payload();body.contents[0].parts[0].text='x'.repeat(180001);await handler(request(body),large);assert.equal(large.statusCode,413);
  delete process.env.GEMINI_API_KEY;const missing=response();await handler(request(payload()),missing);assert.equal(missing.statusCode,503);assert.equal(missing.body.code,'not_configured');
});
