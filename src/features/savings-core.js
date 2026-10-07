const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cents=value=>Number.isSafeInteger(value)&&value>0?value:0;
export const expenseContexts=['auto','work','necessary','optional'];
export function inferExpenseContext(text){
  const n=normalize(text);
  if(/\b(emergencia|urgencia|hospital|consulta|seguranca)\b|sem (onibus|transporte)|de madrugada/.test(n))return 'necessary';
  if(/\b(trabalho|servico|firma|escritorio|plantao)\b/.test(n))return 'work';
  return 'auto';
}
export function classifyExpense(row){
  const n=normalize([row.name,row.item,row.note].join(' ')),inferred=inferExpenseContext(n),context=row.expenseContext&&row.expenseContext!=='auto'?row.expenseContext:inferred;
  const result=(kind,group,label,reason,extra={})=>({kind,group,label,reason,...extra});
  if(context==='necessary'||inferred==='necessary')return result('essential','essential','Necessário / exceção','Você marcou como necessário, ou o registro indica uma necessidade.');
  if(context==='optional')return result('optional','choices','Pode reduzir','Você marcou este gasto como uma escolha que pode reduzir.');
  if(/\b(cigarr[oa]s?|tabaco|vape|pod|fumo)\b/.test(n))return result('optional','tobacco','Pode reduzir','Compras de cigarro e tabaco podem ser reduzidas para guardar mais.');
  if(row.category==='Transporte'){
    const ride=/\b(uber|99|taxi|corrida de app|indrive)\b/.test(n),work=context==='work';
    if(ride&&work)return result('transport-extra','commute','Compare com seu ônibus','Trajeto para o trabalho: compare o custo do dia com seu transporte habitual.',{work:true,ride:true});
    if(ride)return result('review','ride','Entender o trajeto','Uma corrida pode ser necessária. Marque se foi para o trabalho ou uma exceção.',{ride:true});
    return result('essential','transport','Transporte necessário','Passagem e lotação fazem parte do deslocamento; a dica preserva esse custo.',{work:work||/\b(onibus|passagem|lotacao)\b/.test(n)});
  }
  if(/\b(almoco|jantar|marmita|arroz|feijao|mercado)\b/.test(n)||['Alimentação','Saúde','Casa','Trabalho','Educação','Impostos'].includes(row.category)||row.billId)return result('essential','essential','Necessário','Alimentação básica, saúde e compromissos não entram como desperdício.');
  if(row.category==='Lanches'||/\b(lanche|lanchinho|coxinha|salgado|pastel|chocolate|sorvete|refrigerante|energetico)\b/.test(n))return result('optional','snacks','Pode reduzir','Lanches e extras podem dar lugar a uma opção planejada ou preparada em casa.');
  if(['Hábitos','Delivery','Restaurantes','Lazer','Compras','Beleza'].includes(row.category))return result('optional',row.category==='Hábitos'?'habits':'choices','Pode reduzir','É uma escolha flexível: reduza a frequência sem cortar o essencial.');
  return result('review','unknown','Precisa de contexto','O nome e a categoria ainda não bastam para dizer se este gasto pode ser reduzido.');
}
// Receives an individual's read-only projection, never changes the shared ledger.
export function savingsReport(data,person,today,{from=today.slice(0,7)+'-01'}={}){
  const p=data.settings.personalBudget?.[person]||{},routine=cents(p.fare)*(Number.isInteger(p.trips)&&p.trips>0?p.trips:0);
  const allowance=data.incomes.filter(i=>i.person===person&&i.purpose==='transport').reduce((sum,i)=>sum+cents(i.benefitDaily),0);
  const rows=data.transactions.filter(t=>!t.billId&&t.date>=from&&t.date<=today&&cents(t.amount)>0).map(t=>({row:t,reading:classifyExpense(t)}));
  const groups=new Map(),workDays=new Map(),avoidable=Object.create(null);
  for(const entry of rows){
    const {row,reading}=entry;
    if(reading.work){const day=workDays.get(row.date)||{spent:0,rides:0,count:0,rows:[]};day.spent+=row.amount;if(reading.ride){day.rides+=row.amount;day.count++;day.rows.push(row);}workDays.set(row.date,day);}
    if(reading.kind==='optional'){avoidable[row.id]=row.amount;const g=groups.get(reading.group)||{key:reading.group,total:0,count:0};g.total+=row.amount;g.count++;groups.set(reading.group,g);}
  }
  const opportunities=[...groups.values()].map(g=>({...g,saving:Math.round(g.total*(g.key==='tobacco'?1:.5))}));
  const rides=[...workDays.values()].filter(d=>d.rides>0),rideTotal=rides.reduce((s,d)=>s+d.spent,0),extra=routine?rides.reduce((s,d)=>s+Math.min(d.rides,Math.max(0,d.spent-routine)),0):0;
  if(routine)for(const day of rides){const saving=Math.min(day.rides,Math.max(0,day.spent-routine));let remainder=saving;day.rows.forEach((row,i)=>{const amount=i===day.rows.length-1?remainder:Math.min(remainder,Math.round(saving*row.amount/day.rides));avoidable[row.id]=amount;remainder-=amount;});}
  if(extra>0)opportunities.push({key:'commute',total:rideTotal,count:rides.reduce((s,d)=>s+d.count,0),days:rides.length,saving:extra,routine,allowance});
  const unknown=rows.filter(x=>(x.reading.kind==='review'&&x.reading.ride)||(x.reading.kind==='transport-extra'&&!routine));
  return {opportunities:opportunities.sort((a,b)=>b.saving-a.saving),routine,allowance,unknownRide:unknown.length?unknown[unknown.length-1].row:null,optionalTotal:[...groups.values()].reduce((s,g)=>s+g.total,0),avoidable};
}
