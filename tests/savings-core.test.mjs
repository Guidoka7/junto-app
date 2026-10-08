import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyExpense,inferExpenseContext,savingsReport} from '../src/features/savings-core.js';
import {personalFinance} from '../src/features/personal-core.js';
const today='2026-10-07';
function base(){return {users:[{id:'a',balance:50000},{id:'b',balance:80000}],settings:{personalBudget:{a:{fare:550,trips:2},b:{fare:600,trips:2}}},incomes:[{id:'va',person:'a',purpose:'transport',benefitDaily:1860},{id:'vb',person:'b',purpose:'transport',benefitDaily:2000}],transactions:[],received:[],saves:[],goals:[],bills:[],requests:[],activity:[],notifications:[],commitments:[],budgets:{}};}
const tx=(id,name,amount,payer='a',date=today,category='Transporte',extra={})=>({id,name,amount,payer,date,category,...extra});
test('basic food, bus, lotação and necessary exceptions are protected; snacks and tobacco can be reduced',()=>{
 for(const row of [tx('a','Ônibus',1100),tx('b','Lotação',1600),tx('c','Almoço no trabalho',3000,'a',today,'Restaurantes'),tx('d','Uber hospital',5000),tx('e','Uber',5000,'a',today,'Transporte',{expenseContext:'necessary'})])assert.equal(classifyExpense(row).kind,'essential');
 for(const row of [tx('a','Lanche',1600,'a',today,'Lanches'),tx('b','2 cigarros',600,'a',today,'Hábitos')])assert.equal(classifyExpense(row).kind,'optional');
 assert.equal(classifyExpense(tx('a','Uber',4000)).kind,'review');assert.equal(classifyExpense(tx('a','Uber serviço',4000)).kind,'transport-extra');assert.equal(inferExpenseContext('Uber para o trabalho de madrugada'),'necessary');
});
test('work Uber compares daily spending with the configured 11 reais routine, not the allowance or full ride cost',()=>{
 const s=base();s.transactions=[tx('a','Uber trabalho',4000)];const r=savingsReport(personalFinance(s,'a'),'a',today);assert.equal(r.opportunities[0].saving,2900);assert.equal(r.opportunities[0].routine,1100);assert.equal(r.opportunities[0].allowance,1860);assert.equal(s.users[0].balance,50000);
});
test('two rides on one day deduct the bus routine once; multiple days each retain their necessary routine',()=>{
 const s=base();s.transactions=[tx('a','Uber trabalho',3000),tx('b','Uber trabalho',5000),tx('c','Uber trabalho',3000,'a','2026-10-06')];const r=savingsReport(personalFinance(s,'a'),'a',today);assert.equal(r.opportunities[0].saving,8800);assert.equal(r.opportunities[0].count,3);assert.equal(r.opportunities[0].days,2);assert.equal(Object.values(r.avoidable).reduce((a,b)=>a+b,0),8800);assert.ok(Object.entries(r.avoidable).every(([id,value])=>value<=s.transactions.find(t=>t.id===id).amount));
});
test('a partner expense, earlier month, future record and emergency never inflate individual savings',()=>{
 const s=base();s.transactions=[tx('a','Uber trabalho',4000),tx('b','Uber trabalho',9000,'b'),tx('c','Cigarro',9000,'a','2026-09-30','Hábitos'),tx('d','Uber trabalho',8000,'a','2026-10-08'),tx('e','Uber emergência',7000)];const before=structuredClone(s);const r=savingsReport(personalFinance(s,'a'),'a',today);assert.equal(r.opportunities.length,1);assert.equal(r.opportunities[0].saving,2900);assert.deepEqual(s,before);
});
test('shared expenses count only the recorded personal share and preserve odd cents',()=>{
 const s=base();s.transactions=[tx('a','Cigarro',1001,'half',today,'Hábitos',{split:[{id:'a',amount:501},{id:'b',amount:500}]})];const a=savingsReport(personalFinance(s,'a'),'a',today),b=savingsReport(personalFinance(s,'b'),'b',today);assert.equal(a.opportunities[0].saving,501);assert.equal(b.opportunities[0].saving,500);
});
test('unknown trip or missing routine asks for context without inventing an avoidable amount',()=>{
 const s=base();s.transactions=[tx('a','Uber',4000)];let r=savingsReport(personalFinance(s,'a'),'a',today);assert.equal(r.opportunities.length,0);assert.equal(r.unknownRide.id,'a');delete s.settings.personalBudget.a;s.transactions[0].expenseContext='work';r=savingsReport(personalFinance(s,'a'),'a',today);assert.equal(r.opportunities.length,0);assert.equal(r.routine,0);assert.equal(r.unknownRide.id,'a');
});
test('routine transport cheaper than the bus reference creates no cut; snacks suggest half of the recorded cost',()=>{
 const s=base();s.transactions=[tx('a','Uber trabalho',900),tx('b','Lanche',2001,'a',today,'Lanches')];const r=savingsReport(personalFinance(s,'a'),'a',today);assert.deepEqual(r.opportunities.map(o=>[o.key,o.saving]),[['snacks',1001]]);
});

test('lanche registrado como Alimentação continua opcional sem penalizar refeições essenciais',()=>{
 const s=base();s.transactions=[
  tx('lanche','Lanche da tarde',1500,'a',today,'Alimentação'),
  tx('marmita','Marmita do almoço',2800,'a',today,'Alimentação'),
  tx('delivery','Delivery refrigerante',2100,'a',today,'Alimentação'),
  tx('almoco','Almoço no trabalho',3000,'a',today,'Restaurantes'),
  tx('partner','Chocolate da outra pessoa',4000,'b',today,'Alimentação')
 ];
 assert.equal(classifyExpense(s.transactions[0]).kind,'optional');
 assert.equal(classifyExpense(s.transactions[1]).kind,'essential');
 assert.equal(classifyExpense(s.transactions[2]).kind,'optional');
 assert.equal(classifyExpense(s.transactions[3]).kind,'essential');
 const a=savingsReport(personalFinance(s,'a'),'a',today),b=savingsReport(personalFinance(s,'b'),'b',today);
 assert.equal(a.opportunities.find(o=>o.key==='snacks').total,3600);
 assert.equal(a.opportunities.find(o=>o.key==='snacks').saving,1800);
 assert.equal(b.opportunities.find(o=>o.key==='snacks').total,4000);
 assert.ok(!a.avoidable.partner);
 assert.ok(!a.avoidable.marmita);
 assert.ok(!a.avoidable.almoco);
});

test('corrida para o trabalho é reconhecida em Outros, sem chamar corridas sem contexto de supérfluas',()=>{
 const s=base();s.transactions=[
  tx('work','Uber trabalho',4000,'a',today,'Outros'),
  tx('unknown','99 Pop',4200,'a',today,'Outros'),
  tx('necessary','Táxi hospital',5000,'a',today,'Outros'),
  tx('bus','Passagem ônibus',1100,'a',today,'Outros')
 ];
 const r=savingsReport(personalFinance(s,'a'),'a',today);
 assert.equal(classifyExpense(s.transactions[0]).kind,'transport-extra');
 assert.equal(classifyExpense(s.transactions[1]).kind,'review');
 assert.equal(classifyExpense(s.transactions[2]).kind,'essential');
 assert.equal(classifyExpense(s.transactions[3]).kind,'essential');
 assert.equal(r.opportunities.find(o=>o.key==='commute').saving,2900);
 assert.equal(r.unknownRide.id,'unknown');
 assert.ok(!r.avoidable.unknown);
 assert.ok(!r.avoidable.necessary);
});
