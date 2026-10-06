// This source is inserted inside app.js's existing closure by scripts/integrate.mjs.
// Keep all financial mutations in the existing model rather than a second ledger.
  let cloudSlot = null;
  try{const slot=localStorage.getItem("junto-cloud-slot");if(["a","b"].includes(slot))cloudSlot=slot;}catch{}
  const copyState = () => structuredClone(state);
  const publishChange = () => window.dispatchEvent(new CustomEvent('junto:state-changed', {detail: copyState()}));
  function freshPersonalState(name = 'Você') {
    return migrate({schema:1, updatedAt:Date.now(), users:[{id:'a',name:String(name).slice(0,24),balance:0,tone:'blue'}],
      bills:[],goals:[],transactions:[],incomes:[],received:[],saves:[],requests:[],activity:[],notifications:[],
      bankImports:[],budgets:{},learned:{},commitments:[],challenges:[],plan:null,settings:{variableEstimate:0,yieldRate:10},demo:false});
  }
  function confirmBankMovement(event, fields) {
    if (!event || !/^[a-f0-9]{64}$/.test(event.id) || !Number.isSafeInteger(fields.amount) || fields.amount <= 0 || fields.amount > 99999999999) throw new Error('Confira o valor do movimento.');
    if (state.demo) throw new Error('Crie seu controle pessoal antes de importar movimentos reais.');
    if ((state.bankImports||[]).some(item=>item.id===event.id)) return {duplicate:true};
    const name = String(fields.name||'').trim(), date = String(fields.date||'');
    if (name.length < 2 || name.length > 60 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > dateISO()) throw new Error('Confira a descrição e a data.');
    const before = copyState(), amount = fields.amount, id = `bank:${event.id}`, who = active;
    const source = {fingerprint:event.id,bank:String(event.bank||'Banco').slice(0,40),method:event.method};
    let kind;
    try {
      if (event.direction === 'income') {
        const inc = fields.incomeId ? state.incomes.find(i=>i.id===fields.incomeId&&i.person===who) : null;
        if (fields.incomeId && !inc) throw new Error('A entrada selecionada não pertence ao seu perfil.');
        const expectedDate = fields.expectedDate || date;
        if (inc && handled(inc.id,expectedDate)) throw new Error('Essa entrada já foi confirmada. Use “Já registrei” para evitar duplicação.');
        if (fields.subtractBalance !== false) user(who).balance += amount;
        state.received.push({id,incomeId:inc?.id||null,person:who,name,date:inc?expectedDate:date,actualDate:date,
          amount,status:'received',at:Date.now(),bankSource:source,balanceDelta:fields.subtractBalance===false?0:amount});
        log(who,`confirmou ${name}: entrada de ${money(amount)} pelo ${source.bank}.`);
        kind = 'income';
      } else if (event.direction === 'expense') {
        const category = categories.includes(fields.category) ? fields.category : 'Outros';
        if (fields.payment === 'credit') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.due||'') || fields.due < date) throw new Error('Informe o vencimento dessa compra no crédito.');
          state.bills.push({id,name,amount,category,payer:who,due:fields.due,recurring:false,status:'open',bankSource:source});
          log(who,`colocou ${name} no planejamento do cartão: ${money(amount)}.`); kind = 'bill';
        } else {
          const bill = fields.billId ? state.bills.find(b=>b.id===fields.billId&&b.status==='open') : null;
          if (fields.billId && (!bill||bill.amount!==amount)) throw new Error('A conta vinculada precisa estar aberta e ter o mesmo valor.');
          if (fields.subtractBalance !== false) user(who).balance -= amount;
          state.transactions.push({id,name,amount,category,payer:who,by:who,date,createdAt:Date.now(),
            bankSource:source,balanceDelta:fields.subtractBalance===false?0:-amount,...(bill?{billId:bill.id}:{})});
          if (bill) { bill.status='paid'; bill.paidAt=Date.now(); bill.bankSource=source; }
          log(who,`confirmou ${name}: ${money(amount)} pelo ${source.bank}.`); kind = 'expense';
        }
      } else throw new Error('Tipo de movimento desconhecido.');
      state.bankImports = state.bankImports || [];
      state.bankImports.push({id:event.id,recordId:id,kind,at:Date.now()});
      state.updatedAt=Date.now();
      localStorage.setItem(KEY,JSON.stringify(state)); // Acknowledge native inbox only after this succeeds.
      persist();
      return {duplicate:false,kind,id};
    } catch (e) { state=before;render();throw e; }
  }
  window.JuntoApp = Object.freeze({
    getState:copyState, getActive:()=>active, getCategories:()=>[...categories],
    freshState:freshPersonalState,
    applyState(data) {
      if (!valid(data)) throw new Error('O arquivo de finanças é inválido.');
      const next=migrate(structuredClone(data)); localStorage.setItem(KEY,JSON.stringify(next));
      incomingSync(next); render();
    },
    setSlot(slot) { cloudSlot=['a','b'].includes(slot)?slot:null;if(cloudSlot){active=cloudSlot;localStorage.setItem('junto-cloud-slot',cloudSlot);}else localStorage.removeItem('junto-cloud-slot');render(); },
    getSlot:()=>cloudSlot,
    confirmBankMovement,
    openModal:(title,body,kind)=>openModal(title,body,kind), closeModal:()=>close(),
    toast:(title,body)=>toast(title,body),
    startPersonal:()=>{document.querySelector('[data-action="onboard"]')?.click();},
    exportBackup() {
      if(window.JuntoDownload)return window.JuntoDownload(copyState(),`Junto-backup-${dateISO()}.json`);
      const blob=new Blob([JSON.stringify(copyState(),null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Junto-backup-${dateISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
  });

  async function compressProfilePhoto(source) {
    try{const image=new Image();image.src=source;await image.decode();const ratio=Math.min(1,512/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);const context=canvas.getContext('2d');context.fillStyle='#F5F5F7';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.85);}catch{return source;}
  }
