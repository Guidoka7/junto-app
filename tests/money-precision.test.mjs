import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/js/app.js',import.meta.url),'utf8');
// Executa os próprios helpers usados pelo app; não reproduz uma segunda versão da regra.
function declaration(re,name){
  const match=source.match(re);
  assert.ok(match,`Helper financeiro ${name} não encontrado`);
  return match[0];
}
const money=declaration(/^\s*const money = .*;$/m,'money');
const parseMoney=declaration(/^\s*const parseMoney = \(value\) => \{[\s\S]*?^\s*\};/m,'parseMoney');
const brl=declaration(/^\s*const brl=\(c\)=>.*;$/m,'brl');
const finance=new Function(`${money}\n${parseMoney}\n${brl}\nreturn {brl,parseMoney};`)();
const normalized=x=>x.replace(/\s+/g,' ');

test('valores do Juntô mantêm exatamente dois decimais, inclusive centavos pequenos',()=>{
 for(const [cents,expected] of [
   [0,'R$ 0,00'],[1,'R$ 0,01'],[3,'R$ 0,03'],[4770,'R$ 47,70'],
   [9540,'R$ 95,40'],[9541,'R$ 95,41'],[123456,'R$ 1.234,56']
 ]){
   assert.equal(normalized(finance.brl(cents)),expected);
 }
});

test('parsing do formulário mantém centavos intactos e não aceita mais de duas casas',()=>{
 for(const [input,expected] of [
   ['0,01',1],['47,70',4770],['95,40',9540],['95,41',9541],
   ['1.234,56',123456],['1.234',123400]
 ])assert.equal(finance.parseMoney(input),expected);
 assert.ok(Number.isNaN(finance.parseMoney('47,705')));
 assert.equal(finance.parseMoney('95,41')+finance.parseMoney('0,01'),9542);
});
