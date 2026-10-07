import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeStates,equal,validateState} from '../src/features/sync-core.js';
export const base=()=>({schema:1,updatedAt:1,users:[{id:'a',name:'Gui',balance:10000},{id:'b',name:'Bia',balance:10000}],transactions:[],bills:[],goals:[],requests:[],notifications:[],activity:[],incomes:[],received:[],saves:[],bankImports:[],settings:{},demo:false});
test('JSONB object key order does not create a dirty snapshot',()=>assert.ok(equal({a:1,b:{c:2}},{b:{c:2},a:1})));
for(const sameAmount of [false,true])test(`parallel expenses preserve both records and balances (same amount: ${sameAmount})`,()=>{const b=base(),l=structuredClone(b),r=structuredClone(b);l.transactions.push({id:'x',name:'Almoço',amount:1000,payer:'a',date:'2026-10-06'});r.transactions.push({id:'y',name:'Mercado',amount:sameAmount?1000:2000,payer:'a',date:'2026-10-06'});l.users[0].balance-=1000;r.users[0].balance-=sameAmount?1000:2000;const result=mergeStates(b,l,r);assert.equal(result.conflicts.length,0);assert.equal(result.state.transactions.length,2);assert.equal(result.state.users[0].balance,sameAmount?8000:7000);});
test('two people can register expenses independently',()=>{const b=base(),l=structuredClone(b),r=structuredClone(b);l.transactions.push({id:'x',amount:300,payer:'a'});l.users[0].balance-=300;r.transactions.push({id:'y',amount:400,payer:'b'});r.users[1].balance-=400;const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,0);assert.deepEqual(m.state.users.map(u=>u.balance),[9700,9600]);});
test('a manually set balance is a reviewable conflict',()=>{const b=base(),l=structuredClone(b),r=structuredClone(b);l.users[0].balance=12345;r.users[0].balance=67890;const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,1);const resolved=mergeStates(b,l,r,{[m.conflicts[0].key]:'remote'});assert.equal(resolved.conflicts.length,0);assert.equal(resolved.state.users[0].balance,67890);});
test('delete versus edit never silently drops a transaction',()=>{const b=base();b.transactions=[{id:'x',amount:1000,payer:'a',name:'Almoço'}];const l=structuredClone(b),r=structuredClone(b);l.transactions=[];r.transactions[0].name='Almoço de trabalho';const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,1);});
test('one scheduled receipt acknowledged twice increases the balance once',()=>{const b=base();b.incomes=[{id:'salary',person:'a'}];const l=structuredClone(b),r=structuredClone(b);l.received=[{id:'one',incomeId:'salary',date:'2026-10-06',amount:5000,status:'received'}];r.received=[{...l.received[0],id:'two'}];l.users[0].balance+=5000;r.users[0].balance+=5000;const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,0);assert.equal(m.state.received.length,1);assert.equal(m.state.users[0].balance,15000);});

test('same monthly income confirmed on two edited schedule dates merges once',()=>{
  const b=base();b.incomes=[{id:'salary',person:'a',rule:'monthly',day:5}];
  const l=structuredClone(b),r=structuredClone(b);
  l.received=[{id:'left-receipt',incomeId:'salary',person:'a',date:'2026-10-05',amount:5000,status:'received',balanceDelta:5000}];
  r.received=[{id:'right-receipt',incomeId:'salary',person:'a',date:'2026-10-06',amount:5000,status:'received',balanceDelta:5000}];
  l.users[0].balance+=5000;r.users[0].balance+=5000;
  const m=mergeStates(b,l,r);
  assert.equal(m.conflicts.length,0);
  assert.equal(m.state.received.length,1);
  assert.equal(m.state.users[0].balance,15000);
});

test('automatic saving from the same income period merges once after a schedule edit',()=>{
  const b=base();b.incomes=[{id:'salary',person:'a',rule:'monthly',day:5}];b.goals=[{id:'reserve',saved:0,target:100000}];
  const l=structuredClone(b),r=structuredClone(b);
  l.saves=[{id:'left-save',goalId:'reserve',incomeId:'salary',amount:3000,date:'2026-10-05',actor:'a',source:'auto'}];
  r.saves=[{id:'right-save',goalId:'reserve',incomeId:'salary',amount:3000,date:'2026-10-06',actor:'a',source:'auto'}];
  l.goals[0].saved=3000;r.goals[0].saved=3000;
  const m=mergeStates(b,l,r);
  assert.equal(m.conflicts.length,0);
  assert.equal(m.state.saves.length,1);
  assert.equal(m.state.goals[0].saved,3000);
});

test('concurrent saving contributions combine without changing cash balances',()=>{const b=base();b.goals=[{id:'reserve',saved:0,target:100000}];const l=structuredClone(b),r=structuredClone(b);l.saves=[{id:'s1',goalId:'reserve',amount:3000}];r.saves=[{id:'s2',goalId:'reserve',amount:3000}];l.goals[0].saved=3000;r.goals[0].saved=3000;const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,0);assert.equal(m.state.goals[0].saved,6000);assert.equal(m.state.users[0].balance,10000);});
test('a recorded expense whose balance was already updated is not subtracted twice',()=>{const b=base(),l=structuredClone(b),r=structuredClone(b);l.transactions=[{id:'bank1',amount:1000,payer:'a',balanceDelta:0}];r.transactions=[{id:'bank2',amount:2000,payer:'a'}];r.users[0].balance-=2000;const m=mergeStates(b,l,r);assert.equal(m.state.users[0].balance,8000);});
test('malicious object keys and duplicate records are rejected',()=>{const b=base();b.transactions=[{id:'x',amount:1},{id:'x',amount:1}];assert.throws(()=>validateState(b));const malicious=base();malicious.settings=JSON.parse('{"__proto__":{"polluted":true}}');assert.throws(()=>validateState(malicious));assert.equal({}.polluted,undefined);});

for(const link of ['billId','requestId'])test(`the same ${link} paid offline on two devices charges once`,()=>{
  const b=base(),l=structuredClone(b),r=structuredClone(b);
  for(const [s,id] of [[l,'left'],[r,'right']]){
    s.transactions=[{id,[link]:'one-payment',amount:1001,payer:'half',split:[{id:'a',amount:501},{id:'b',amount:500}],date:'2026-10-07',createdAt:id==='left'?1:2}];
    s.users[0].balance-=501;s.users[1].balance-=500;
  }
  const m=mergeStates(b,l,r);
  assert.equal(m.conflicts.length,0);assert.equal(m.state.transactions.length,1);
  assert.deepEqual(m.state.users.map(u=>u.balance),[9499,9500]);
  const again=mergeStates(r,m.state,r);
  assert.equal(again.conflicts.length,0);assert.deepEqual(again.state.users,m.state.users);
});

test('two different payers for the same bill require one reviewable payment choice',()=>{
  const b=base(),l=structuredClone(b),r=structuredClone(b);
  l.transactions=[{id:'left',billId:'bill',amount:1000,payer:'a'}];l.users[0].balance-=1000;
  r.transactions=[{id:'right',billId:'bill',amount:1000,payer:'b'}];r.users[1].balance-=1000;
  const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,1);
  const resolved=mergeStates(b,l,r,{[m.conflicts[0].key]:'remote'});
  assert.equal(resolved.conflicts.length,0);assert.equal(resolved.state.transactions.length,1);
  assert.equal(resolved.state.transactions[0].payer,'b');assert.deepEqual(resolved.state.users.map(u=>u.balance),[10000,9000]);
});

test('manual saving from the same scheduled receipt merges once',()=>{
  const b=base();b.incomes=[{id:'salary',rule:'monthly',person:'a'}];b.goals=[{id:'reserve',saved:0,target:100000}];
  const l=structuredClone(b),r=structuredClone(b);
  for(const [s,id] of [[l,'left'],[r,'right']]){
    s.received=[{id,incomeId:'salary',person:'a',date:'2026-10-05',amount:5000,status:'received'}];s.users[0].balance+=5000;
    s.saves=[{id,goalId:'reserve',incomeId:'salary',incomeDate:'2026-10-05',amount:3000,date:id==='left'?'2026-10-07':'2026-10-08',actor:'a',source:'income'}];s.goals[0].saved=3000;
  }
  const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,0);assert.equal(m.state.received.length,1);
  assert.equal(m.state.saves.length,1);assert.equal(m.state.goals[0].saved,3000);assert.equal(m.state.users[0].balance,15000);
});

test('different cash effects for the same receipt are not silently selected',()=>{
  const b=base();b.incomes=[{id:'salary',rule:'monthly',person:'a'}];const l=structuredClone(b),r=structuredClone(b);
  l.received=[{id:'manual',incomeId:'salary',person:'a',date:'2026-10-05',amount:5000,status:'received',balanceDelta:5000}];l.users[0].balance+=5000;
  r.received=[{id:'bank',incomeId:'salary',person:'a',date:'2026-10-05',amount:5000,status:'received',balanceDelta:0,bankSource:{fingerprint:'bank'}}];
  const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,1);
  const resolved=mergeStates(b,l,r,{[m.conflicts[0].key]:'remote'});
  assert.equal(resolved.conflicts.length,0);assert.equal(resolved.state.received.length,1);assert.equal(resolved.state.users[0].balance,10000);
});

test('removing an income source does not change the identity of existing receipts',()=>{
  const b=base();b.incomes=[{id:'salary',rule:'monthly',person:'a'}];b.received=[{id:'receipt',incomeId:'salary',person:'a',date:'2026-10-05',amount:5000,status:'received'}];
  const l=structuredClone(b),r=structuredClone(b);l.incomes=[];r.received[0].name='Confirmed salary';
  const m=mergeStates(b,l,r);assert.equal(m.conflicts.length,0);assert.equal(m.state.received.length,1);assert.equal(m.state.received[0].name,'Confirmed salary');
});
