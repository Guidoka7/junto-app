import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectVice,classifyRow,readSpending,declaredMonthly,dailyBook,typicalPurchase,overview,futureValue,monthsToReach,timeline,emptyProfile,sanitizeProfile,catalogWithPrices,healthProgress,PRIVATE_ACCOUNTS} from '../src/features/virada-core.js';
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

const H=(id)=>({cigarro:{on:true,packsPerDay:1,packPrice:1200,mode:'parar',reducePct:.5},bebida:{on:true,weekly:7000,mode:'reduzir',reducePct:.5},apostas:{on:true,weekly:0,mode:'parar',reducePct:.5}})[id];
const endOf=d=>new Date(`${d}T12:00:00`).getTime()+12*3600000;

test('a base diária vem dos 60 dias antes da virada; o declarado só vale quando é maior que o extrato',()=>{
  const p=emptyProfile(today);p.countImpulse=false;
  p.habits.cigarro={...p.habits.cigarro,...H('cigarro'),start:'2026-10-01',packsPerDay:0.5};
  // 20 dias antes da virada com R$ 15 de cigarro por dia (mais que meio maço declarado)
  const tx=[];for(let i=1;i<=20;i++){const d=new Date('2026-10-01T12:00:00');d.setDate(d.getDate()-i);tx.push({id:'c'+i,name:'Cigarro',item:'Cigarro',amount:1500,payer:'a',date:d.toISOString().slice(0,10),category:'Hábitos'});}
  const book=dailyBook({transactions:tx},p,{today,now:endOf(today)});
  assert.equal(book.preDays,20);
  assert.equal(Math.round(book.groups.cigarro.baseDaily),1500);
  assert.equal(book.groups.cigarro.source,'extrato');
  assert.equal(book.days.length,10);
  assert.equal(book.groups.cigarro.saved,15000);
  // sem histórico, vale o declarado
  const empty=dailyBook({transactions:[]},p,{today,now:endOf(today)});
  assert.equal(Math.round(empty.groups.cigarro.baseDaily),600);assert.equal(empty.groups.cigarro.source,'declarado');
});

test('leitura diária: cada dia compara a base com o gasto real e a projeção usa o ritmo desde a virada',()=>{
  const p=emptyProfile(today);p.countImpulse=true;
  p.habits.cigarro={...p.habits.cigarro,...H('cigarro'),start:'2026-10-01'};
  const tx=[{id:'i0',name:'iFood',amount:3044,payer:'a',date:'2026-09-20',category:'Delivery'},{id:'i1',name:'iFood',amount:4000,payer:'a',date:'2026-10-09',category:'Delivery'},{id:'c1',name:'Cigarro',item:'Cigarro',amount:1200,payer:'a',date:'2026-10-09',category:'Hábitos'}];
  const book=dailyBook({transactions:tx},p,{today,now:endOf(today)});
  assert.equal(book.yesterday.total,5200);
  assert.equal(book.today.total,0);
  assert.equal(book.series.length,30);
  assert.ok(book.series.find(d=>d.date==='2026-09-20').after===false);
  const day9=book.days.find(d=>d.date==='2026-10-09');
  assert.equal(day9.actual,5200);
  assert.ok(day9.saved<0,'dia com recaída fica negativo na leitura');
  assert.ok(book.paceDaily>0&&book.paceDaily<book.baseDaily);
  const o=overview(p,{transactions:tx},{today,now:endOf(today)});
  assert.equal(o.groups.map(g=>g.id).join(),'cigarro,impulso');
  assert.ok(o.paceSaving>0);
  assert.equal(o.freed,Math.round((book.groups.cigarro.baseDaily+book.groups.impulso.baseDaily*.5)*30.44));
});

test('reduzir credita só a redução combinada no período, mesmo com compra concentrada num dia',()=>{
  const p=emptyProfile(today);p.countImpulse=false;
  p.habits.bebida={...p.habits.bebida,...H('bebida'),start:'2026-10-04'};
  const base=7000*52/12/30.44;
  const tx=[{id:'b',name:'Cerveja',amount:Math.round(base*7/2),payer:'a',date:'2026-10-06',category:'Lazer'}];
  const o=overview(p,{transactions:tx},{today,now:endOf(today)});
  const beb=o.habits.find(h=>h.id==='bebida');
  assert.ok(Math.abs(beb.saved-Math.round(base*7/2))<=2,'gastou metade em 7 dias: economiza metade');
  assert.equal(beb.last,'2026-10-06');
});

test('recaída registrada zera a sequência e desconta da economia',()=>{
  const p=emptyProfile(today);p.countImpulse=false;
  p.habits.cigarro={...p.habits.cigarro,...H('cigarro'),start:'2026-10-01'};
  p.logs=[{habit:'cigarro',date:'2026-10-08',amount:1200}];
  const now=new Date('2026-10-10T20:00:00').getTime();
  const h=overview(p,{transactions:[]},{today,now}).habits[0];
  assert.equal(h.spent,1200);assert.equal(h.cleanDays,1);assert.equal(h.last,'2026-10-08');
  assert.ok(h.unitsAvoided>150&&h.unitsAvoided<200);
});

test('desistências entram no cofre e o valor típico vem da mediana do extrato',()=>{
  const p=sanitizeProfile({v:1,vault:[{date:today,amount:1200,kind:'desistencia',habit:'cigarro'},{date:today,amount:5000},{date:today,amount:900,kind:'desistencia',habit:'xx'}]},today);
  assert.deepEqual(p.vault.map(v=>v.kind),['desistencia','deposito','deposito']);
  const o=overview(p,{transactions:[]},{today,now:endOf(today)});
  assert.equal(o.vault,7100);assert.equal(o.desists,1);assert.equal(o.desisted,1200);
  assert.equal(typicalPurchase('bebida',p,[{group:'bebida',amount:900},{group:'bebida',amount:1500},{group:'bebida',amount:3000}]),1500);
  assert.equal(typicalPurchase('cigarro',p,[]),1200);
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
  const p=emptyProfile(today),decided=new Date('2026-10-10T21:00:00').getTime();p.countImpulse=false;
  p.habits.cigarro={...p.habits.cigarro,...H('cigarro'),start:today,startAt:decided};
  assert.equal(overview(p,{transactions:[]},{today,now:decided}).saved,0);
  const hour=overview(p,{transactions:[]},{today,now:decided+3600000}).saved;
  assert.ok(hour>40&&hour<60);
  p.habits.cigarro.startAt=new Date('2026-10-09T21:00:00').getTime();
  assert.ok(overview(p,{transactions:[]},{today,now:decided}).saved>1000,'startAt de outro dia é ignorado e conta desde o início do dia escolhido');
});
