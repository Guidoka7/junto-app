import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectVice,classifyRow,readSpending,declaredMonthly,habitProgress,overview,futureValue,monthsToReach,timeline,emptyProfile,sanitizeProfile,catalogWithPrices,healthProgress,PRIVATE_ACCOUNTS} from '../src/features/virada-core.js';
import {personalFinance} from '../src/features/personal-core.js';
import {createHash} from 'node:crypto';

const today='2026-10-10';
const tx=(id,name,amount,date=today,category='Outros',extra={})=>({id,name,amount,payer:'a',by:'a',date,category,...extra});
function couple(){return {users:[{id:'a',name:'Guilherme',balance:0},{id:'b',name:'Parceira',balance:0}],settings:{},incomes:[],transactions:[],received:[],saves:[],goals:[],bills:[],requests:[],activity:[],notifications:[],commitments:[],budgets:{}};}

test('detecta cigarro, bebida e apostas pelo item do app ou pelo nome, sem confundir álcool de posto, gás ou shampoo',()=>{
  assert.equal(detectVice({name:'2 cigarros',item:'Cigarro'}),'cigarro');
  assert.equal(detectVice({name:'Maço Marlboro'}),'cigarro');
  assert.equal(detectVice({name:'Pod de menta'}),'cigarro');
  assert.equal(detectVice({name:'Latão Heineken'}),'bebida');
  assert.equal(detectVice({name:'Zé Delivery sexta'}),'bebida');
  assert.equal(detectVice({name:'Bar do Zé'}),'bebida');
  assert.equal(detectVice({name:'Betano'}),'apostas');
  assert.equal(detectVice({name:'Álcool no posto'}),null);
  assert.equal(detectVice({name:'Distribuidora de gás'}),null);
  assert.equal(detectVice({name:'Shampoo Seda'}),null);
  assert.equal(detectVice({name:'Barbearia'}),null);
  assert.equal(detectVice({name:'AirPods'}),null);
});

test('a escolha manual prevalece e o necessário marcado no app nunca vira desperdício',()=>{
  assert.equal(classifyRow(tx('a','Cerveja',800),'need').kind,'essencial');
  assert.equal(classifyRow(tx('a','Mercado',30000,today,'Alimentação'),'bebida').group,'bebida');
  assert.equal(classifyRow(tx('a','Cerveja',800,today,'Hábitos',{expenseContext:'necessary'})).kind,'essencial');
  assert.equal(classifyRow(tx('a','iFood',4500,today,'Delivery')).group,'impulso');
  assert.equal(classifyRow(tx('a','Passagem',550,today,'Transporte')).kind,'essencial');
});

test('lê só a parte dele nos gastos da dupla e projeta a média por mês pela cobertura real',()=>{
  const s=couple();
  s.transactions=[
    tx('c1','Cigarro',1200,'2026-09-11','Hábitos',{item:'Cigarro'}),
    tx('c2','Cigarro',1200,'2026-10-10','Hábitos',{item:'Cigarro'}),
    tx('b1','Cerveja no bar',3000,'2026-10-05','Lazer',{payer:'half'}),
    tx('p1','Cigarro dela',1500,'2026-10-06','Hábitos',{payer:'b',by:'b',item:'Cigarro'}),
    tx('f1','Cigarro futuro',1500,'2026-10-11','Hábitos',{item:'Cigarro'}),
  ];
  const before=structuredClone(s);
  const r=readSpending(personalFinance(s,'a'),{today});
  assert.equal(r.coverage,30);
  assert.equal(r.groups.cigarro.total,2400);
  assert.equal(r.groups.bebida.total,1500);
  assert.equal(r.groups.cigarro.monthly,Math.round(2400/30*30.44));
  assert.ok(r.rows.every(row=>!['p1','f1'].includes(row.id)));
  assert.equal(r.reliable,true);
  assert.deepEqual(s,before);
});

test('hábito declarado vale mais que o extrato e a redução só credita a parte combinada',()=>{
  const p=emptyProfile(today);
  p.habits.cigarro={...p.habits.cigarro,on:true,packsPerDay:1,packPrice:1200,mode:'parar',start:'2026-10-01'};
  p.habits.bebida={...p.habits.bebida,on:true,weekly:7000,mode:'reduzir',reducePct:.5,start:'2026-10-01'};
  assert.equal(declaredMonthly('cigarro',p.habits.cigarro),Math.round(1200*30.44));
  assert.equal(declaredMonthly('bebida',p.habits.bebida),Math.round(7000*52/12));
  const reading=readSpending({transactions:[tx('b','Cerveja',2000,'2026-10-04','Lazer')]},{today});
  const now=new Date('2026-10-10T12:00:00').getTime()+12*3600000;
  const cig=habitProgress('cigarro',p,reading,{today,now});
  assert.equal(cig.cleanDays,10);
  assert.equal(cig.spent,0);
  assert.ok(Math.abs(cig.saved-cig.daily*10)<2);
  assert.equal(cig.unitsAvoided,200);
  const beb=habitProgress('bebida',p,reading,{today,now});
  assert.equal(beb.spent,2000);
  assert.ok(beb.saved>0&&beb.saved<=beb.would/2+1);
  const o=overview(p,reading,{today,now});
  assert.equal(o.habits.length,2);
  assert.equal(o.freed,Math.round(cig.monthly+beb.monthly*.5));
});

test('recaída registrada zera a sequência e desconta da economia',()=>{
  const p=emptyProfile(today);
  p.habits.cigarro={...p.habits.cigarro,on:true,packsPerDay:1,packPrice:1200,start:'2026-10-01'};
  p.logs=[{habit:'cigarro',date:'2026-10-08',amount:1200}];
  const now=new Date('2026-10-10T20:00:00').getTime();
  const h=habitProgress('cigarro',p,readSpending({transactions:[]},{today}),{today,now});
  assert.equal(h.spent,1200);assert.equal(h.cleanDays,1);assert.equal(h.last,'2026-10-08');
});

test('juros compostos mensais pelo CDI e prazo para cada sonho',()=>{
  assert.equal(futureValue(10000,1),10000);
  assert.ok(futureValue(10000,12)>120000&&futureValue(10000,12)<128000);
  assert.equal(futureValue(0,12),0);
  assert.equal(monthsToReach(30000,10000),3);
  assert.equal(monthsToReach(0,10000),null);
  const t=timeline(36500,1,{dreams:[{id:'r',name:'Reserva',target:400000}]});
  assert.equal(t.months,12);assert.ok(t.invested>t.plain);assert.equal(t.goals[0].reached,true);
});

test('perfil privado inválido volta ao padrão e preços personalizados substituem a referência',()=>{
  assert.equal(sanitizeProfile(null,today).setup,false);
  const p=sanitizeProfile({v:1,logs:[{habit:'x',date:'2026-10-01',amount:1},{habit:'cigarro',date:'2026-10-01',amount:1200}],vault:'x',prices:{'smartfit-fit':9990}},today);
  assert.equal(p.logs.length,1);assert.deepEqual(p.vault,[]);
  assert.equal(catalogWithPrices(p).find(c=>c.id==='smartfit-fit').price,9990);
});

test('linha da saúde marca as etapas já vencidas',()=>{
  const h=healthProgress(13*3600000);
  assert.equal(h[0].done,true);assert.equal(h[1].done,true);assert.equal(h[2].done,false);
});

test('a lista de contas privadas guarda só o hash do e-mail',()=>{
  assert.ok(PRIVATE_ACCOUNTS.every(h=>/^[a-f0-9]{64}$/.test(h)));
  assert.ok(!PRIVATE_ACCOUNTS.includes(createHash('sha256').update('teste@junto.example').digest('hex')));
});

test('começando hoje, a economia parte do momento da decisão e não da meia-noite',()=>{
  const p=emptyProfile(today),decided=new Date('2026-10-10T21:00:00').getTime();
  p.habits.cigarro={...p.habits.cigarro,on:true,packsPerDay:1,packPrice:1200,start:today,startAt:decided};
  const r=readSpending({transactions:[]},{today});
  assert.equal(habitProgress('cigarro',p,r,{today,now:decided}).saved,0);
  const hour=habitProgress('cigarro',p,r,{today,now:decided+3600000});
  assert.ok(hour.saved>40&&hour.saved<60);
  p.habits.cigarro.startAt=new Date('2026-10-09T21:00:00').getTime();
  assert.ok(habitProgress('cigarro',p,r,{today,now:decided}).saved>1000,'startAt de outro dia é ignorado e conta desde o início do dia escolhido');
});
