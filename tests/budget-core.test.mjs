import test from 'node:test';
import assert from 'node:assert/strict';
import {isEverydayExpense,spendingBaseline,incomeEstimate,benefitEnvelope,debtSuggestion,weeklyBenefitEstimate,validateBudgetProfile} from '../src/features/budget-core.js';
test('two days of spending and a debt payment do not become a daily debt until month end',()=>{
  const tx=[{name:'Agiota',amount:80000,date:'2026-10-06'},{name:'Ônibus',amount:1100,date:'2026-10-06'},{name:'Almoço',amount:3500,date:'2026-10-07'}];
  const model=spendingBaseline(tx,'2026-10-07');assert.equal(model.daily,4600/14);assert.equal(model.confidence,'baixa');assert.equal(model.sampleSize,2);
  assert.equal(isEverydayExpense({name:'Empréstimo',amount:80000}),false);
});
test('manual classification overrides a name hint but bills never repeat as everyday spending',()=>{
  assert.equal(isEverydayExpense({name:'Pagamento',forecastKind:'once'}),false);
  assert.equal(isEverydayExpense({name:'Dívida',forecastKind:'daily'}),true);
  assert.equal(isEverydayExpense({billId:'b',forecastKind:'daily'}),false);
});
test('a full window includes zero spending days and does not cap actual overspending at income',()=>{
  const rows=[{name:'Mercado',date:'2026-09-01',amount:5000},{name:'Delivery',date:'2026-10-07',amount:90000}];
  assert.equal(spendingBaseline(rows,'2026-10-07').daily,3000);
  assert.equal(spendingBaseline([...rows,{name:'futuro',date:'2026-10-08',amount:1000000}],'2026-10-07').daily,3000);
});
test('variable salary uses confirmed receipts rather than promising a high commission',()=>{
  const inc={id:'salary',amount:244100,variable:true};
  const rows=[{incomeId:'salary',status:'received',date:'2026-09-05',amount:244100},{incomeId:'salary',status:'received',date:'2026-08-05',amount:400000},{incomeId:'salary',status:'received',date:'2026-07-05',amount:200000}];
  assert.equal(incomeEstimate(inc,rows,'2026-10-07'),200000);
  assert.equal(incomeEstimate(inc,rows.slice(0,1),'2026-10-07'),244100);
  assert.equal(incomeEstimate({...inc,variable:false},rows,'2026-10-07'),244100);
});
test('food and transport envelopes use confirmed receipts and the payer actual share without changing cash',()=>{
  const state={incomes:[{id:'vt',person:'a',purpose:'transport'},{id:'va',person:'a',purpose:'food'}],received:[{incomeId:'vt',status:'received',date:'2026-10-06',amount:11160},{incomeId:'va',status:'received',date:'2026-10-06',amount:17440}],transactions:[{category:'Transporte',payer:'a',date:'2026-10-07',amount:1200},{category:'Lanches',payer:'a',date:'2026-10-07',amount:3500},{category:'Transporte',payer:'b',date:'2026-10-07',amount:5000}]};
  const before=structuredClone(state),share=(t,id)=>t.payer===id?t.amount:0;
  assert.equal(benefitEnvelope(state,'a','transport','2026-10-07',share).remaining,9960);
  assert.equal(benefitEnvelope(state,'a','food','2026-10-07',share).remaining,13940);
  assert.deepEqual(state,before);
});
test('flexible debt never proposes more than available cash and distinguishes interest from principal',()=>{
  const d=debtSuggestion({principal:97800,monthlyRate:7,days:1,minimum:30000,available:40000});
  assert.equal(d.interest,228);assert.equal(d.payment,40000);assert.equal(d.amortization,39772);assert.equal(d.remaining,58028);
  const tight=debtSuggestion({principal:97800,monthlyRate:7,days:30,minimum:30000,available:3000});
  assert.equal(tight.payment,3000);assert.equal(tight.amortization,0);assert.equal(tight.interestCovered,false);assert.equal(tight.minimumCovered,false);
});
test('Tuesday benefits respect five food days, six transport days and national holidays',()=>{
  const food={rule:'weekly',benefitDaily:3488,benefitSaturday:false},transport={rule:'weekly',benefitDaily:1860,benefitSaturday:true};
  assert.equal(weeklyBenefitEstimate(food,'2026-10-06'),17440);assert.equal(weeklyBenefitEstimate(transport,'2026-10-06'),11160);
  assert.equal(weeklyBenefitEstimate(food,'2026-10-13',['2026-10-12']),13952);assert.equal(weeklyBenefitEstimate(transport,'2026-10-13',['2026-10-12']),9300);
});
test('profile import rejects malformed income and strips cash ledgers and arbitrary settings',()=>{
  const data={type:'junto-budget-profile',schemaVersion:1,sources:[{name:'Salário',amount:200000,rule:'business',nth:5,purpose:'general',variable:true}],preferences:{fare:550,trips:2,debtPrincipal:90000,debtMinimum:30000,debtRate:7,debtSince:'2026-10-06',balance:999999},goal:{name:'Carro',target:1000000},users:[{balance:999999}]};
  const parsed=validateBudgetProfile(data);assert.equal(parsed.preferences.balance,undefined);assert.equal(parsed.users,undefined);assert.equal(parsed.sources[0].auto,false);
  assert.throws(()=>validateBudgetProfile({...data,sources:[{...data.sources[0],amount:-1}]}));
});
