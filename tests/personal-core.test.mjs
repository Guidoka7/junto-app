import test from 'node:test';
import assert from 'node:assert/strict';
import {personalFinance} from '../src/features/personal-core.js';
test('individual readings use own income, actual expense shares and independent settings without changing the joint ledger',()=>{
 const s={users:[{id:'a',balance:90000},{id:'b',balance:45000}],transactions:[{id:'a',amount:600,payer:'a'},{id:'b',amount:200,payer:'b'},{id:'shared',amount:101,payer:'half'}],bills:[{id:'bill',amount:1000,payer:'prop'}],
 incomes:[{id:'salary-a',person:'a',amount:100000},{id:'salary-b',person:'b',amount:200000}],received:[{id:'receipt-a',person:'a',amount:100000},{id:'receipt-b',person:'b',amount:200000}],saves:[{id:'s1',actor:'a',goalId:'goal',amount:300},{id:'s2',actor:'b',goalId:'goal',amount:200}],goals:[{id:'goal',saved:500}],plan:{monthly:6000},
 settings:{variableEstimate:1000,personalEstimates:{a:5000,b:7000},personalBudgets:{a:{Delivery:3000},b:{Delivery:8000}},personalBudget:{a:{fare:550},b:{fare:600}}},budgets:{},requests:[],activity:[],notifications:[],commitments:[],challenges:[]};
 const before=structuredClone(s),a=personalFinance(s,'a',1/3),b=personalFinance(s,'b',1/3);
 assert.deepEqual(b.incomes.map(i=>i.id),['salary-b']);assert.deepEqual(b.transactions.map(t=>[t.id,t.amount]),[['b',200],['shared',50]]);assert.equal(a.bills[0].amount+b.bills[0].amount,1000);
 assert.equal(b.users.reduce((sum,u)=>sum+u.balance,0),45000);assert.equal(b.settings.variableEstimate,7000);assert.deepEqual(b.settings.personalBudget,{b:{fare:600}});assert.deepEqual(b.budgets,{Delivery:8000});
 assert.equal(a.goals[0].saved+b.goals[0].saved,500);assert.equal(b.goals[0].saved,200);assert.equal(b.plan.monthly,4000);assert.deepEqual(s,before);
});

test('objetivos pessoais, investimentos e metas compartilhadas ficam separados por pessoa',()=>{
 const state={
  users:[{id:'a',balance:100000},{id:'b',balance:80000}],
  transactions:[],bills:[],incomes:[{id:'ia',person:'a'},{id:'ib',person:'b'}],received:[],
  saves:[{id:'p',actor:'a',goalId:'personal',amount:2500},{id:'c',actor:'a',goalId:'couple',amount:3000},{id:'cb',actor:'b',goalId:'couple',amount:1000}],
  goals:[
   {id:'personal',owner:'a',kind:'investment',name:'Meu CDB',saved:2500,target:10000},
   {id:'partner',owner:'b',kind:'dream',name:'Viagem dela',saved:9000,target:20000},
   {id:'couple',owner:'both',kind:'dream',name:'Nossa casa',saved:4000,target:30000},
  ],
  plan:null,settings:{personalBudgets:{}},budgets:{},requests:[],activity:[],notifications:[],commitments:[],challenges:[]
 };
 const a=personalFinance(state,'a'),b=personalFinance(state,'b');
 assert.deepEqual(a.goals.map(g=>g.id),['personal','couple']);
 assert.deepEqual(b.goals.map(g=>g.id),['partner','couple']);
 assert.equal(a.goals[0].saved,2500);
 assert.equal(b.goals[0].saved,9000);
 assert.equal(a.goals[1].saved,3000);
 assert.equal(b.goals[1].saved,1000);
 assert.equal(a.goals.reduce((t,g)=>t+g.saved,0),5500);
 assert.equal(b.goals.reduce((t,g)=>t+g.saved,0),10000);
 assert.equal(state.goals[2].saved,4000);
});
