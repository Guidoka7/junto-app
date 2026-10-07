const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cents=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const day=iso=>Date.parse(`${iso}T12:00:00Z`);
export function isEverydayExpense(tx){
  if(tx.billId||tx.forecastKind==='once')return false;
  if(tx.forecastKind==='daily')return true;
  return !/\b(agiota|emprestimo|financiamento|divida|parcela|aluguel|iptu|ipva)\b/.test(normalized(tx.name));
}
export function spendingBaseline(transactions,today,estimate=0){
  const rows=transactions.filter(t=>isEverydayExpense(t)&&t.date<=today&&cents(t.amount)>0);
  const first=rows.reduce((m,t)=>t.date<m?t.date:m,today);
  const age=Math.max(1,Math.round((day(today)-day(first))/86400000)+1);
  // Sparse onboarding data is evidence of spending, not a daily commitment.
  // Count calendar days (including days with no spend), with a two-week floor.
  const coverage=Math.min(30,age),denominator=Math.max(14,coverage);
  const recent=rows.filter(t=>day(today)-day(t.date)<30*86400000);
  const observed=recent.reduce((n,t)=>n+t.amount,0)/denominator;
  const trust=Math.min(1,coverage/30);
  const daily=estimate>0?observed*trust+estimate/30.4*(1-trust):observed;
  return {daily,coverage,denominator,age,confidence:coverage>=30?'alta':coverage>=14?'média':'baixa',sampleSize:recent.length};
}
export function incomeEstimate(income,received,today){
  if(!income.variable)return cents(income.amount);
  const samples=received.filter(r=>r.incomeId===income.id&&r.status==='received'&&r.date<=today&&cents(r.amount)>0).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  if(!samples.length)return cents(income.amount);
  if(samples.length<3)return samples[0].amount;
  // A conservative observed quartile avoids treating a good commission as guaranteed.
  const values=samples.map(r=>r.amount).sort((a,b)=>a-b);
  return values[Math.floor((values.length-1)*.25)];
}
export function weeklyBenefitEstimate(income,date,holidayDates=[]){
  if(income.rule!=='weekly'||!cents(income.benefitDaily))return null;
  const d=new Date(`${date}T12:00:00Z`),monday=new Date(d);monday.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
  let days=0;for(let i=0;i<(income.benefitSaturday?6:5);i++){const work=new Date(monday);work.setUTCDate(monday.getUTCDate()+i);if(!holidayDates.includes(work.toISOString().slice(0,10)))days++;}
  return income.benefitDaily*days;
}
export function benefitEnvelope(state,person,purpose,today,share){
  const sources=state.incomes.filter(i=>i.person===person&&i.purpose===purpose);
  const receipts=state.received.filter(r=>r.status==='received'&&r.date<=today&&sources.some(i=>i.id===r.incomeId));
  const month=today.slice(0,7),received=receipts.filter(r=>r.date.slice(0,7)===month).reduce((n,r)=>n+r.amount,0);
  const categories=purpose==='transport'?['Transporte']:['Alimentação','Lanches','Restaurantes','Delivery'];
  const spent=state.transactions.filter(t=>t.date.slice(0,7)===month&&t.date<=today&&categories.includes(t.category)).reduce((n,t)=>n+share(t,person),0);
  return {purpose,received,spent,remaining:Math.max(0,received-spent),over:Math.max(0,spent-received),configured:sources.length>0};
}
export function debtSuggestion({principal,monthlyRate,days,minimum,available}){
  principal=cents(principal);minimum=cents(minimum);available=cents(available);
  const rate=Number(monthlyRate),period=Number(days);
  if(!Number.isFinite(rate)||rate<0||rate>100||!Number.isFinite(period)||period<0||period>366)return null;
  const interest=Math.round(principal*rate/100*period/30);
  const payment=Math.min(available,principal+interest),amortization=Math.max(0,payment-interest);
  return {interest,payment,amortization,remaining:principal-amortization,minimum,minimumCovered:payment>=minimum,interestCovered:payment>=interest};
}
export function validateBudgetProfile(data){
  if(data?.type!=='junto-budget-profile'||data.schemaVersion!==1||!Array.isArray(data.sources)||data.sources.length<1||data.sources.length>8)throw Error('Perfil de orçamento inválido.');
  const p=data.preferences;
  if(!p||!cents(p.fare)||!Number.isInteger(p.trips)||p.trips<1||p.trips>10||!Number.isSafeInteger(p.debtPrincipal)||p.debtPrincipal<0||!Number.isSafeInteger(p.debtMinimum)||p.debtMinimum<0||!Number.isFinite(p.debtRate)||p.debtRate<0||p.debtRate>100||!/^\d{4}-\d{2}-\d{2}$/.test(p.debtSince||''))throw Error('Preferências inválidas.');
  const sources=data.sources.map(i=>{
    if(typeof i.name!=='string'||i.name.trim().length<2||i.name.length>40||!cents(i.amount)||i.amount>1e10||!['business','weekly','monthly'].includes(i.rule)||!['general','food','transport'].includes(i.purpose))throw Error('Entrada inválida.');
    if(i.rule==='weekly'&&(!Number.isInteger(i.weekday)||i.weekday<0||i.weekday>6)||i.rule==='business'&&(!Number.isInteger(i.nth)||i.nth<1||i.nth>10)||i.rule==='monthly'&&(!Number.isInteger(i.day)||i.day<1||i.day>31))throw Error('Frequência inválida.');
    if(i.benefitDaily!==undefined&&(!Number.isSafeInteger(i.benefitDaily)||i.benefitDaily<0||i.benefitDaily>1e8))throw Error('Valor diário inválido.');
    return {name:i.name.trim(),amount:i.amount,rule:i.rule,purpose:i.purpose,nth:i.nth||5,weekday:i.weekday??2,day:i.day||1,countSat:i.countSat!==false,variable:i.variable===true,benefitDaily:i.benefitDaily||0,benefitSaturday:i.benefitSaturday===true,auto:false};
  });
  const goal=data.goal;if(!goal||typeof goal.name!=='string'||goal.name.trim().length<2||goal.name.length>60||!cents(goal.target)||goal.target>1e10)throw Error('Meta inválida.');
  return {sources,preferences:{fare:p.fare,trips:p.trips,debtPrincipal:p.debtPrincipal,debtMinimum:p.debtMinimum,debtRate:p.debtRate,debtSince:p.debtSince},goal:{name:goal.name.trim(),target:goal.target}};
}
