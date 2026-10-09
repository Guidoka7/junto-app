// Read-only financial perspective. The shared ledger stays intact.
export function personalFinance(state,person,ratio=.5){
  const own=row=>row.person===person||row.actor===person||(!row.person&&state.incomes.some(i=>i.id===row.incomeId&&i.person===person));
  const share=row=>{
    if(Array.isArray(row.split))return row.split.find(x=>x.id===person)?.amount||0;
    if(row.payer===person)return row.amount;
    if(['half','prop'].includes(row.payer)){const a=Math.round(row.amount*(row.payer==='prop'?ratio:.5));return person==='a'?a:row.amount-a;}
    return 0;
  };
  const expenses=rows=>rows.flatMap(row=>{const amount=share(row);return amount>0?[{...row,amount,payer:person,split:[{id:person,amount}],sharedAmount:row.amount}]:[];});
  const savings=state.saves.filter(own);
  // A carteira individual inclui seus próprios objetivos e sua parcela dos objetivos a dois.
  // Metas particulares da outra pessoa nunca entram nas projeções individuais.
  const goals=state.goals.filter(g=>!g.owner||g.owner==='both'||g.owner===person).map(g=>{
    const contributions=state.saves.filter(s=>s.goalId===g.id),all=contributions.reduce((sum,s)=>sum+s.amount,0);
    const a=all>0?Math.round(g.saved*contributions.filter(s=>s.actor==='a'||(!s.actor&&state.incomes.some(i=>i.id===s.incomeId&&i.person==='a'))).reduce((sum,s)=>sum+s.amount,0)/all):Math.round(g.saved/2);
    return{...g,saved:g.owner===person||state.users.length===1?g.saved:person==='a'?a:g.saved-a};
  });
  const settings={...state.settings,variableEstimate:state.settings.personalEstimates?.[person]??state.settings.variableEstimate??0,personalBudget:{[person]:state.settings.personalBudget?.[person]||{}}};
  return{...state,users:state.users.map(u=>u.id===person?u:{...u,balance:0}),transactions:expenses(state.transactions),bills:expenses(state.bills),
    incomes:state.incomes.filter(i=>i.person===person),received:state.received.filter(own),saves:savings,goals,
    plan:state.plan&&goals.some(g=>g.id===state.plan.goalId)?{...state.plan,monthly:Math.round(state.plan.monthly*(state.users.length===1||state.goals.find(g=>g.id===state.plan.goalId)?.owner===person?1:person==='a'?ratio:1-ratio))}:null,
    budgets:state.settings.personalBudgets?.[person]||state.budgets,settings,
    requests:state.requests.filter(r=>r.author===person),activity:state.activity.filter(r=>r.actor===person||r.scope==='shared'),
    notifications:state.notifications.filter(r=>r.to===person),commitments:state.commitments.filter(r=>r.person===person||r.person==='both'),
    challenges:(state.challenges||[]).filter(r=>r.person===person||r.person==='both')};
}
