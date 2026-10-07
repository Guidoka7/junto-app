// Three-way snapshot merge. Disjoint records combine; conflicting edits stay
// reviewable. Money combines only when the ledger proves both balance deltas.
export const clone=value=>value===undefined?undefined:structuredClone(value);
export function equal(a,b){if(a===b)return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;if(Array.isArray(a)!==Array.isArray(b))return false;const x=Object.keys(a),y=Object.keys(b);return x.length===y.length&&x.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));}
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const keyed=list=>Array.isArray(list)&&list.every(v=>object(v)&&typeof v.id==='string');
const banned=new Set(['__proto__','constructor','prototype']);
export function validateState(state){
  if(!object(state)||state.schema!==1||!Array.isArray(state.users)||state.users.length<1||state.users.length>2)throw new Error('Formato de finanças inválido.');
  const walk=value=>{if(value&&typeof value==='object'){for(const k of Object.keys(value)){if(banned.has(k))throw new Error('O arquivo tem um campo inválido.');walk(value[k]);}}};walk(state);
  if(new Set(state.users.map(u=>u.id)).size!==state.users.length||state.users.some(u=>!['a','b'].includes(u.id)||typeof u.name!=='string'||u.name.length<1||u.name.length>24||!Number.isSafeInteger(u.balance)))throw new Error('Perfis inválidos.');
  for(const key of ['transactions','bills','goals','requests','notifications','activity','incomes','received','saves','challenges','commitments','bankImports']){
    const rows=state[key]||[];if(!Array.isArray(rows)||rows.length>50000||rows.some(r=>!object(r)||typeof r.id!=='string'||r.id.length<1||r.id.length>250)||new Set(rows.map(r=>r.id)).size!==rows.length)throw new Error(`Lista ${key} inválida.`);
    if(rows.some(r=>r.amount!==undefined&&(!Number.isSafeInteger(r.amount)||r.amount<0)))throw new Error('Há um valor inválido.');
  }
  if(JSON.stringify(state).length>8*1024*1024)throw new Error('O arquivo é grande demais. Reduza a foto da dupla.');
  return state;
}
function weekKey(iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return String(iso||'');
  const d=new Date(iso+'T12:00:00Z'),offset=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10);
}
function incomePeriod(state,row){
  const inc=(state?.incomes||[]).find(i=>i.id===row.incomeId);
  if(!inc||!row.date)return row.date||'';
  return inc.rule==='weekly'?weekKey(row.date):String(row.date).slice(0,7);
}
const rowKey=(row,collection,state)=>collection==='received'&&row.incomeId?`income:${row.incomeId}:${incomePeriod(state,row)}`:collection==='saves'&&row.source==='auto'&&row.incomeId?`save:${row.goalId}:${row.incomeId}:${incomePeriod(state,row)}`:row.id;
function monetaryEffect(state,person){
  let sum=0;for(const t of state.transactions||[]){if(t.payer===person)sum+=Number.isSafeInteger(t.balanceDelta)?t.balanceDelta:-t.amount;else if(['half','prop'].includes(t.payer)){const part=t.split?.find(s=>s.id===person);if(part)sum-=part.amount;}}
  const seen=new Set();for(const r of state.received||[]){if(r.status!=='received')continue;const k=rowKey(r,'received',state);if(seen.has(k))continue;seen.add(k);const owner=r.person||(state.incomes||[]).find(i=>i.id===r.incomeId)?.person;if(owner===person)sum+=Number.isSafeInteger(r.balanceDelta)?r.balanceDelta:r.amount;}
  return sum;
}
function savedEffect(state,id){return(state.saves||[]).filter(s=>s.goalId===id).reduce((n,s)=>n+s.amount,0);}
export function mergeStates(base,local,remote,choices={}){
  validateState(base);validateState(local);validateState(remote);
  let conflicts=[];
  const conflict=(path,b,l,r)=>{const key=JSON.stringify(path),choice=choices[key];if(choice==='remote')return clone(r);if(choice==='local')return clone(l);conflicts.push({key,path,base:clone(b),local:clone(l),remote:clone(r)});return clone(l);};
  function merge(b,l,r,path=[]){
    if(equal(l,r))return clone(l);if(equal(b,l))return clone(r);if(equal(b,r))return clone(l);
    if(path.length===1&&path[0]==='updatedAt')return Math.max(l||0,r||0);
    if(l===undefined||r===undefined)return conflict(path,b,l,r);
    if(object(l)&&object(r)&&(object(b)||b===undefined)){
      const out={};for(const k of new Set([...Object.keys(b||{}),...Object.keys(l),...Object.keys(r)])){
        if(banned.has(k))throw new Error('Campo inválido.');const value=merge(b?.[k],l[k],r[k],[...path,k]);if(value!==undefined)out[k]=value;
      }return out;
    }
    if(keyed(l)&&keyed(r)&&(keyed(b)||b===undefined)){
      const collection=path[0],states=[base,local,remote],maps=[b||[],l,r].map((rows,i)=>new Map(rows.map(row=>[rowKey(row,collection,states[i]),row])));
      const out=[];for(const id of new Set([...maps[0].keys(),...maps[1].keys(),...maps[2].keys()])){
        const [old,left,right]=maps.map(m=>m.get(id));
        // The same scheduled income acknowledged on two devices is one receipt.
        if(!old&&left&&right&&collection==='received'&&left.incomeId&&left.amount===right.amount&&left.status===right.status&&left.person===right.person){out.push(clone(left.bankSource?left:right));continue;}
        const value=merge(old,left,right,[...path,id]);if(value!==undefined)out.push(value);
      }return out;
    }
    return conflict(path,b,l,r);
  }
  const merged=merge(base,local,remote);
  const proven=new Set();
  for(const collection of ['users','goals'])for(const before of base[collection]||[]){
    const id=before.id,field=collection==='users'?'balance':'saved',key=JSON.stringify([collection,id,field]);
    const left=local[collection]?.find(x=>x.id===id),right=remote[collection]?.find(x=>x.id===id),target=merged[collection]?.find(x=>x.id===id);
    if(!left||!right||!target||Object.hasOwn(choices,key))continue;
    const effect=collection==='users'?monetaryEffect:savedEffect;
    if(left[field]-before[field]===effect(local,id)-effect(base,id)&&right[field]-before[field]===effect(remote,id)-effect(base,id)){
      target[field]=before[field]+effect(merged,id)-effect(base,id);proven.add(key);
    }
  }
  conflicts=conflicts.filter(c=>!proven.has(c.key));
  validateState(merged);return{state:merged,conflicts};
}
export const conflictLabel=path=>{const fields={users:'Perfis',balance:'Saldo',goals:'Planos',saved:'Valor guardado',name:'Nome',amount:'Valor',settings:'Ajustes',transactions:'Gastos',bills:'Contas',requests:'Combinados',notifications:'Avisos',plan:'Plano de economia',budgets:'Metas',due:'Vencimento',category:'Categoria'};return path.map(p=>fields[p]||p).join(' › ');};
