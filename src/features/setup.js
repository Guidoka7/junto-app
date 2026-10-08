// ===== Raio-X inicial: um passo a passo que alimenta o Juntô =====
// Inserido no fechamento do app.js (marcador JUNTO_SETUP). Cada pessoa responde
// sobre o próprio dinheiro; ao salvar, as respostas viram entradas, contas fixas,
// metas por categoria, estimativa do dia a dia, dívida e sonho — sem mexer no saldo.
const SETUP_VERSION = 1;
const SETUP_INCOMES = [
  ["salary", "💼", "Salário todo mês", "CLT, pró-labore, aposentadoria"],
  ["weekly", "📅", "Pagamento semanal", "Cai no mesmo dia toda semana"],
  ["daily", "☀️", "Ganho por dia", "Uber, diárias, bicos, vendas"],
  ["variable", "📈", "Comissão ou renda variável", "Muda de um mês pro outro"],
  ["va", "🍽️", "VA ou VR", "Vale alimentação / refeição"],
  ["vt", "🚌", "VT", "Vale transporte"],
];
const SETUP_FIXED = [
  ["rent", "🏠", "Aluguel", "Casa"],
  ["condo", "🏢", "Condomínio", "Casa"],
  ["power", "💡", "Luz", "Casa"],
  ["water", "🚿", "Água", "Casa"],
  ["internet", "📶", "Internet", "Assinaturas"],
  ["phone", "📱", "Celular", "Assinaturas"],
  ["loan", "🚗", "Financiamento ou parcela", "Outros"],
  ["health", "🩺", "Plano de saúde", "Saúde"],
  ["gym", "🏋️", "Academia", "Saúde"],
  ["school", "🎓", "Escola ou faculdade", "Educação"],
  ["stream", "🎬", "Streaming e apps", "Assinaturas"],
  ["insurance", "🛡️", "Seguro", "Outros"],
];
const SETUP_ESSENTIAL = [
  ["food", "🛒", "Mercado", "Alimentação", 0.15],
  ["transport", "🚍", "Transporte do dia a dia", "Transporte", 0.08],
  ["health", "💊", "Farmácia e saúde", "Saúde", 0.03],
  ["home", "🧽", "Casa (gás, limpeza)", "Casa", 0.03],
  ["pets", "🐶", "Pets", "Pets", 0],
  ["work", "🧰", "Trabalho e estudo", "Educação", 0],
];
const SETUP_IMPROVE = [
  ["delivery", "🛵", "Delivery", "Delivery"],
  ["snacks", "🥐", "Lanches e cafés", "Lanches"],
  ["bars", "🍻", "Bares e restaurantes", "Restaurantes"],
  ["habits", "🚬", "Cigarro e hábitos", "Hábitos"],
  ["shopping", "🛍️", "Compras e roupas", "Compras"],
  ["fun", "🎉", "Rolês e lazer", "Lazer"],
  ["beauty", "💅", "Beleza", "Beleza"],
  ["games", "🎮", "Jogos e apps", "Tecnologia"],
];
const SETUP_GOALS = [
  ["keep", "Manter", 1],
  ["less", "−25%", 0.75],
  ["half", "Metade", 0.5],
  ["cut", "Cortar", 0],
];
const WEEK_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEKS_PER_MONTH = 52 / 12;
let setupDraft = null,
  setupStep = 0,
  setupAutoChecked = false;

function setupDone(id = active) {
  return Boolean(state.settings?.setup?.[id]?.at);
}
function setupOfferedKey() {
  return `junto-setup-offered-${active}`;
}
function setupFreshDraft() {
  const prev = state.settings?.setup?.[active]?.answers;
  if (typeof prev === "string") {
    try {
      const draft = { ...setupBlankDraft(), ...JSON.parse(prev) },
        have = new Set(setupExistingBills().map((b) => norm(b.name)));
      draft.extraFixed = (draft.extraFixed || []).filter((f) => !have.has(norm(f.name)));
      return draft;
    } catch {}
  }
  return setupBlankDraft();
}
function setupBlankDraft() {
  const pb = state.settings?.personalBudget?.[active] || {};
  return {
    incomes: [],
    salary: { amount: "", mode: "business", nth: 5, day: 5, split: false, advance: "", advanceDay: 20 },
    weekly: { amount: "", weekday: 5 },
    daily: { amount: "", days: [1, 2, 3, 4, 5] },
    variable: { amount: "", day: 10 },
    va: { amount: "", mode: "monthly", day: 5, weekday: 1, perDay: "" },
    vt: { amount: "", mode: "monthly", day: 5, weekday: 1, perDay: "", fare: pb.fare ? moneyNumber(pb.fare) : "", trips: pb.trips || 2 },
    fixed: {},
    extraFixed: [],
    essential: {},
    improve: {},
    debt: { has: pb.debtPrincipal > 0, amount: pb.debtPrincipal ? moneyNumber(pb.debtPrincipal) : "", rate: pb.debtRate != null ? String(pb.debtRate).replace(".", ",") : "", minimum: pb.debtMinimum ? moneyNumber(pb.debtMinimum) : "" },
    dream: { name: "", target: "", months: 12 },
  };
}
function setupSteps() {
  const d = setupDraft;
  return ["intro", "incomes", ...SETUP_INCOMES.map(([k]) => k).filter((k) => d.incomes.includes(k)), "fixed", "essential", "improve", "debt", "dream", "summary"];
}
const setupMoney = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const n = parseMoney(s);
  return Number.isFinite(n) ? n : NaN;
};
const setupInt = (v, min, max, fallback) => {
  const n = Math.round(Number(String(v ?? "").replace(",", ".")));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

// ---------- Números do resumo ----------
function setupMonthly(d = setupDraft) {
  const m = (v) => Math.max(0, setupMoney(v) || 0);
  let income = 0;
  if (d.incomes.includes("salary")) income += m(d.salary.amount) + (d.salary.split ? m(d.salary.advance) : 0);
  if (d.incomes.includes("weekly")) income += m(d.weekly.amount) * WEEKS_PER_MONTH;
  if (d.incomes.includes("daily")) income += m(d.daily.amount) * d.daily.days.length * WEEKS_PER_MONTH;
  if (d.incomes.includes("variable")) income += m(d.variable.amount);
  // Entradas que já existem e não serão recriadas por este raio-x (evita contar duas vezes ao refazer).
  const willCreate = new Set([d.incomes.includes("salary") && "salário", d.incomes.includes("salary") && d.salary.split && "adiantamento", d.incomes.includes("weekly") && "semanal", d.incomes.includes("daily") && "ganhos da semana", d.incomes.includes("variable") && "comissão"].filter(Boolean).map(norm));
  const existing = state.incomes.filter((i) => i.person === active && !["food", "transport"].includes(i.purpose) && !willCreate.has(norm(i.name)));
  const existingMonthly = existing.reduce((s, i) => s + (i.rule === "weekly" ? i.amount * WEEKS_PER_MONTH : i.amount), 0);
  const benefit = (b) => (b.mode === "daily" ? m(b.perDay) * 22 : b.mode === "weekly" ? m(b.amount) * WEEKS_PER_MONTH : m(b.amount));
  const benefits = (d.incomes.includes("va") ? benefit(d.va) : 0) + (d.incomes.includes("vt") ? benefit(d.vt) : 0);
  const myShare = (payer, amount) => (payer === "half" ? amount / 2 : payer === active || !payer ? amount : 0);
  const haveBills = new Set(setupExistingBills().map((b) => norm(b.name)));
  const fixedNew = SETUP_FIXED.filter(([k, , t]) => d.fixed[k]?.on && !haveBills.has(norm(t))).reduce((s, [k]) => s + myShare(d.fixed[k].payer, m(d.fixed[k].amount)), 0) + d.extraFixed.reduce((s, f) => s + myShare(f.payer, m(f.amount)), 0);
  const fixedOld = setupExistingBills().reduce((s, b) => s + myShare(b.payer, b.amount), 0);
  const essential = Object.values(d.essential).reduce((s, v) => s + m(v), 0);
  const improveNow = Object.values(d.improve).filter((x) => x.on).reduce((s, x) => s + m(x.amount), 0);
  const improveGoal = Object.entries(d.improve)
    .filter(([, x]) => x.on)
    .reduce((s, [, x]) => s + m(x.amount) * (SETUP_GOALS.find((g) => g[0] === x.goal)?.[2] ?? 1), 0);
  const debtMin = d.debt.has ? m(d.debt.minimum) : 0;
  const totalIncome = Math.round(income + existingMonthly);
  const fixed = Math.round(fixedNew + fixedOld);
  return {
    income: totalIncome,
    benefits: Math.round(benefits),
    fixed,
    essential: Math.round(essential),
    improveNow: Math.round(improveNow),
    improveGoal: Math.round(improveGoal),
    debtMin: Math.round(debtMin),
    leftNow: Math.round(totalIncome + benefits - fixed - essential - improveNow - debtMin),
    leftGoal: Math.round(totalIncome + benefits - fixed - essential - improveGoal - debtMin),
  };
}
function setupExistingBills() {
  const seen = new Set();
  return state.bills
    .filter((b) => b.recurring)
    .sort((a, b) => b.due.localeCompare(a.due))
    .filter((b) => {
      const k = String(b.recurringKey || b.id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

// ---------- Telas ----------
function setupDots() {
  const steps = setupSteps(),
    n = steps.length - 1;
  return `<div class="j-setup-progress" aria-label="Etapa ${setupStep} de ${n}"><i style="width:${Math.round((setupStep / n) * 100)}%"></i></div>`;
}
function setupMoneyInput(name, label, value, placeholder = "0,00", hint = "") {
  return `<label class="field j-setup-field"><span>${label}</span><div class="money-input"><span>R$</span><input name="${name}" type="text" inputmode="decimal" autocomplete="off" placeholder="${esc(placeholder)}" value="${esc(value || "")}"></div>${hint ? `<small>${hint}</small>` : ""}</label>`;
}
function setupSelect(name, label, options, value) {
  return `<label class="field j-setup-field"><span>${label}</span><select name="${name}">${options.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
}
function setupPayer(name, value) {
  if (isSolo()) return "";
  return setupSelect(name, "Quem paga", [[active, "Eu"], ["half", "Meio a meio"], [other(), first(user(other()).name)]], value || active);
}
const setupDayOptions = () => Array.from({ length: 31 }, (_, i) => [i + 1, `Dia ${i + 1}`]);
const setupWeekOptions = () => WEEKDAYS.map((w, i) => [i, w[0].toUpperCase() + w.slice(1)]);
function setupNav(nextLabel = "Continuar", skip = "") {
  return `<p class="form-error" role="alert" id="form-error"></p><div class="j-setup-nav">${setupStep > 0 ? `<button type="button" class="btn ghost" data-action="setup-back">Voltar</button>` : ""}<button type="button" class="btn primary" data-action="setup-next">${nextLabel}</button></div>${skip ? `<button type="button" class="j-setup-skip" data-action="setup-next" data-skip="1">${skip}</button>` : ""}`;
}
function setupHead(kicker, title, sub = "") {
  return `${setupDots()}<p class="modal-kicker">${kicker}</p><h3 class="onboard-title">${title}</h3>${sub ? `<p class="modal-sub" style="margin-top:0">${sub}</p>` : ""}`;
}

function setupBody() {
  const d = setupDraft,
    step = setupSteps()[setupStep],
    me = first(user().name),
    m = setupMonthly();
  if (step === "intro")
    return `<div class="j-setup-hero"><span>✦</span></div><p class="modal-kicker">Raio-X do seu dinheiro</p><h3 class="onboard-title">E aí, ${esc(me)}!<br><span>Vamos montar teu mês?</span></h3><p class="modal-sub">São umas perguntas rápidas — leva uns 2 minutos. Com elas o Juntô entende <b>como o dinheiro entra</b>, <b>pra onde ele vai</b> e <b>onde dá pra melhorar</b>, e monta a organização sob medida pra você.</p><ul class="j-setup-list"><li>💰 Como você recebe</li><li>🧾 Suas contas fixas</li><li>🛒 O essencial do dia a dia</li><li>✂️ O que dá pra melhorar</li><li>🎯 Seu sonho</li></ul><p class="j-setup-note">Nada aqui mexe no seu saldo. Dá pra mudar tudo depois.</p>${setupNav("Bora começar", "Agora não")}`;

  if (step === "incomes") {
    const have = state.incomes.filter((i) => i.person === active);
    return `${setupHead("Passo 1 · Entradas", "Como o dinheiro<br><span>entra pra você?</span>", "Marque tudo que vale pra você. Cada escolha abre uma tela só pra ela.")}${
      have.length ? `<div class="j-setup-have"><b>Já no Juntô</b>${have.map((i) => `<span>${esc(i.name)} · ${cash(i.amount)}</span>`).join("")}<small>Se marcar algo que já existe, o Juntô atualiza em vez de duplicar.</small></div>` : ""
    }<div class="j-setup-cards">${SETUP_INCOMES.map(([k, e, t, s]) => `<label class="j-setup-card ${d.incomes.includes(k) ? "on" : ""}"><input type="checkbox" name="incomes" value="${k}" ${d.incomes.includes(k) ? "checked" : ""}><span class="e">${e}</span><span><b>${t}</b><small>${s}</small></span></label>`).join("")}</div>${setupNav()}`;
  }
  if (step === "salary") {
    const x = d.salary;
    return `${setupHead("Salário", "Seu salário<br><span>todo mês</span>", "O valor que cai na conta, já com descontos.")}${setupMoneyInput("amount", x.split ? "Valor do pagamento principal" : "Quanto cai", x.amount, "3.200,00")}<div class="j-setup-seg" role="radiogroup">${[["business", "Dia útil"], ["fixed", "Dia fixo"]].map(([v, l]) => `<label class="${x.mode === v ? "on" : ""}"><input type="radio" name="mode" value="${v}" ${x.mode === v ? "checked" : ""}>${l}</label>`).join("")}</div><div data-show="business" ${x.mode === "business" ? "" : "hidden"}>${setupSelect("nth", "Qual dia útil?", Array.from({ length: 10 }, (_, i) => [i + 1, `${i + 1}º dia útil`]), x.nth)}</div><div data-show="fixed" ${x.mode === "fixed" ? "" : "hidden"}>${setupSelect("day", "Que dia?", setupDayOptions(), x.day)}</div><label class="j-setup-check"><input type="checkbox" name="split" ${x.split ? "checked" : ""}><span><b>Recebo em duas partes</b><small>Adiantamento (vale) no meio do mês + o resto no pagamento.</small></span></label><div data-show="split" ${x.split ? "" : "hidden"}>${setupMoneyInput("advance", "Valor do adiantamento", x.advance, "1.200,00")}${setupSelect("advanceDay", "Dia do adiantamento", setupDayOptions(), x.advanceDay)}</div>${setupNav()}`;
  }
  if (step === "weekly") {
    const x = d.weekly;
    return `${setupHead("Semanal", "Pagamento<br><span>toda semana</span>")}${setupMoneyInput("amount", "Quanto cai por semana", x.amount, "450,00")}${setupSelect("weekday", "Em que dia?", setupWeekOptions(), x.weekday)}${setupNav()}`;
  }
  if (step === "daily") {
    const x = d.daily,
      perWeek = (setupMoney(x.amount) || 0) * x.days.length;
    return `${setupHead("Ganho por dia", "Quanto você faz<br><span>num dia normal?</span>", "Usa a média de um dia comum — nem o melhor, nem o pior.")}${setupMoneyInput("amount", "Média por dia", x.amount, "180,00")}<div class="field j-setup-field"><span>Quais dias você trabalha?</span><div class="j-setup-days">${WEEK_SHORT.map((w, i) => `<label class="${x.days.includes(i) ? "on" : ""}"><input type="checkbox" name="days" value="${i}" ${x.days.includes(i) ? "checked" : ""}>${w}</label>`).join("")}</div></div>${perWeek ? `<p class="j-setup-note">≈ <b>${cash(perWeek)}</b> por semana, <b>${cash(Math.round(perWeek * WEEKS_PER_MONTH))}</b> por mês.</p>` : ""}<p class="j-setup-note">O Juntô junta a semana num valor só e, no último dia trabalhado, você confirma quanto realmente entrou.</p>${setupNav()}`;
  }
  if (step === "variable") {
    const x = d.variable;
    return `${setupHead("Renda variável", "Comissão ou renda<br><span>que muda</span>", "Coloca uma média conservadora dos últimos meses.")}${setupMoneyInput("amount", "Média por mês", x.amount, "800,00")}${setupSelect("day", "Costuma cair por volta do dia", setupDayOptions(), x.day)}${setupNav()}`;
  }
  if (step === "va" || step === "vt") {
    const x = d[step],
      va = step === "va";
    return `${setupHead(va ? "Vale alimentação" : "Vale transporte", va ? "Seu VA / VR<br><span>como cai?</span>" : "Seu VT<br><span>como cai?</span>", va ? "O Juntô separa esse valor pra mercado e refeições — sem somar duas vezes no saldo." : "O Juntô separa esse valor pro transporte e compara com o que você gasta.")}<div class="j-setup-seg three" role="radiogroup">${[["monthly", "Por mês"], ["weekly", "Por semana"], ["daily", "Por dia trabalhado"]].map(([v, l]) => `<label class="${x.mode === v ? "on" : ""}"><input type="radio" name="mode" value="${v}" ${x.mode === v ? "checked" : ""}>${l}</label>`).join("")}</div><div data-show="monthly" ${x.mode === "monthly" ? "" : "hidden"}>${setupMoneyInput("amount", "Valor por mês", x.amount, va ? "600,00" : "220,00")}${setupSelect("day", "Que dia cai?", setupDayOptions(), x.day)}</div><div data-show="weekly" ${x.mode === "weekly" ? "" : "hidden"}>${setupMoneyInput("amountW", "Valor por semana", x.amount, va ? "150,00" : "55,00")}${setupSelect("weekday", "Em que dia?", setupWeekOptions(), x.weekday)}</div><div data-show="daily" ${x.mode === "daily" ? "" : "hidden"}>${setupMoneyInput("perDay", "Valor por dia trabalhado", x.perDay, va ? "34,88" : "12,00")}${setupSelect("weekdayD", "Cai toda semana em", setupWeekOptions(), x.weekday)}</div>${
      va ? "" : `<div class="j-setup-split"><b>Seu ônibus do dia a dia</b>${setupMoneyInput("fare", "Valor da passagem", x.fare, "6,00")}${setupSelect("trips", "Passagens por dia", Array.from({ length: 6 }, (_, i) => [i + 1, `${i + 1}`]), x.trips)}</div>`
    }${setupNav()}`;
  }
  if (step === "fixed") {
    const have = setupExistingBills();
    return `${setupHead("Passo 2 · Contas fixas", "Contas que chegam<br><span>todo mês</span>", "Marque as suas e coloque o valor e o dia que vence.")}${
      have.length ? `<div class="j-setup-have"><b>Já no Juntô</b>${have.map((b) => `<span>${esc(b.name)} · ${cash(b.amount)} · dia ${new Date(b.due + "T12:00").getDate()}</span>`).join("")}</div>` : ""
    }<div class="j-setup-rows">${SETUP_FIXED.filter(([k, , t]) => !have.some((b) => norm(b.name) === norm(t)))
      .map(([k, e, t]) => {
        const f = d.fixed[k] || {};
        return `<div class="j-setup-row ${f.on ? "on" : ""}" data-key="${k}"><label class="j-setup-toggle"><input type="checkbox" name="on-${k}" ${f.on ? "checked" : ""}><span class="e">${e}</span><b>${t}</b></label><div class="j-setup-row-fields">${setupMoneyInput(`amount-${k}`, "Valor", f.amount)}${setupSelect(`day-${k}`, "Vence", setupDayOptions(), f.day || 10)}${setupPayer(`payer-${k}`, f.payer)}</div></div>`;
      })
      .join("")}${d.extraFixed
      .map((f, i) => `<div class="j-setup-row on extra" data-extra="${i}"><label class="field j-setup-field"><span>Nome da conta</span><input name="xname-${i}" type="text" maxlength="40" value="${esc(f.name)}" placeholder="Ex.: Mensalidade do curso"></label><div class="j-setup-row-fields">${setupMoneyInput(`xamount-${i}`, "Valor", f.amount)}${setupSelect(`xday-${i}`, "Vence", setupDayOptions(), f.day || 10)}${setupPayer(`xpayer-${i}`, f.payer)}</div><button type="button" class="j-setup-remove" data-action="setup-extra-remove" data-i="${i}" aria-label="Remover conta">✕</button></div>`)
      .join("")}</div><button type="button" class="btn ghost wide" data-action="setup-extra-add">+ Outra conta fixa</button>${setupNav("Continuar", "Não tenho contas fixas")}`;
  }
  if (step === "essential") {
    const inc = m.income + m.benefits;
    return `${setupHead("Passo 3 · Essenciais", "O essencial<br><span>do dia a dia</span>", "Quanto vai, mais ou menos, por mês? Pode chutar — o Juntô ajusta com os gastos reais.")}<div class="j-setup-rows">${SETUP_ESSENTIAL.map(([k, e, t, , ref]) => `<div class="j-setup-line"><span class="e">${e}</span>${setupMoneyInput(`ess-${k}`, t, d.essential[k], inc && ref ? moneyNumber(Math.round((inc * ref) / 1000) * 1000) : "0,00", inc && ref ? `Pra sua renda, algo perto de ${cashR(Math.round((inc * ref) / 1000) * 1000)}` : "")}</div>`).join("")}</div>${setupNav()}`;
  }
  if (step === "improve") {
    return `${setupHead("Passo 4 · Dá pra melhorar", "Onde o dinheiro<br><span>escapa?</span>", "Sem julgamento. Marque o que pesa e diga o que quer fazer com cada um.")}<div class="j-setup-rows">${SETUP_IMPROVE.map(([k, e, t]) => {
      const x = d.improve[k] || {};
      return `<div class="j-setup-row ${x.on ? "on" : ""}" data-key="${k}"><label class="j-setup-toggle"><input type="checkbox" name="imp-${k}" ${x.on ? "checked" : ""}><span class="e">${e}</span><b>${t}</b></label><div class="j-setup-row-fields one">${setupMoneyInput(`impamount-${k}`, "Quanto vai por mês", x.amount, "200,00")}<div class="j-setup-seg four" role="radiogroup">${SETUP_GOALS.map(([g, l]) => `<label class="${(x.goal || "half") === g ? "on" : ""}"><input type="radio" name="impgoal-${k}" value="${g}" ${(x.goal || "half") === g ? "checked" : ""}>${l}</label>`).join("")}</div></div></div>`;
    }).join("")}</div>${setupNav("Continuar", "Nada disso pesa pra mim")}`;
  }
  if (step === "debt") {
    const x = d.debt;
    return `${setupHead("Passo 5 · Dívidas", "Tem alguma dívida<br><span>pra organizar?</span>", "Cartão atrasado, empréstimo, acordo… Parcelas fixas já entraram nas contas fixas.")}<div class="j-setup-seg" role="radiogroup">${[["no", "Não tenho"], ["yes", "Tenho sim"]].map(([v, l]) => `<label class="${(x.has ? "yes" : "no") === v ? "on" : ""}"><input type="radio" name="has" value="${v}" ${(x.has ? "yes" : "no") === v ? "checked" : ""}>${l}</label>`).join("")}</div><div data-show="yes" ${x.has ? "" : "hidden"}>${setupMoneyInput("amount", "Quanto você deve hoje", x.amount, "2.000,00")}<label class="field j-setup-field"><span>Juros por mês (%) — se souber</span><input name="rate" type="text" inputmode="decimal" placeholder="Ex.: 2,5" value="${esc(x.rate)}"></label>${setupMoneyInput("minimum", "Quanto consegue pagar por mês", x.minimum, "300,00")}</div>${setupNav()}`;
  }
  if (step === "dream") {
    const x = d.dream,
      t = setupMoney(x.target) || 0,
      per = t && x.months ? Math.ceil(t / x.months / 100) * 100 : 0;
    return `${setupHead("Passo 6 · Sonho", "Pra que você<br><span>quer juntar?</span>", "Viagem, reserva, carro, casa… Um objetivo deixa o plano mais fácil de seguir.")}<label class="field j-setup-field"><span>Nome do sonho</span><input name="name" type="text" maxlength="40" placeholder="Ex.: Reserva de emergência" value="${esc(x.name)}"></label>${setupMoneyInput("target", "Quanto precisa", x.target, "5.000,00")}${setupSelect("months", "Em quanto tempo?", [3, 6, 9, 12, 18, 24, 36].map((n) => [n, `${n} meses`]), x.months)}${per ? `<p class="j-setup-note">Isso dá <b>${cash(per)}</b> por mês. ${m.leftGoal > 0 ? (per <= m.leftGoal ? "Cabe no que deve sobrar. 💚" : `Hoje deve sobrar ${cash(Math.max(0, m.leftGoal))} — dá pra esticar o prazo.`) : ""}</p>` : ""}${setupNav("Ver meu mês", "Pular por agora")}`;
  }
  // Resumo
  const base = Math.max(1, m.income + m.benefits),
    seg = (v, c) => (v > 0 ? `<i class="${c}" style="flex:${v / base}"></i>` : "");
  const save = Math.max(0, m.leftGoal),
    dreamT = setupMoney(d.dream.target) || 0;
  return `${setupHead("Seu mês, montado", "Pronto, " + esc(me) + "!<br><span>Olha teu mês:</span>")}<div class="j-setup-sum">
    <div class="j-stack">${seg(m.fixed, "fixed")}${seg(m.essential, "ess")}${seg(m.improveGoal, "flex")}${seg(m.debtMin, "miss")}${seg(save, "left")}</div>
    <ul>
      <li><span>💰 Entra por mês</span><b>${cash(m.income)}</b></li>
      ${m.benefits ? `<li><span>🍽️ Vales (VA/VT)</span><b>${cash(m.benefits)}</b></li>` : ""}
      <li><span><i class="j-dot fixed"></i>Contas fixas${isSolo() ? "" : " (sua parte)"}</span><b>− ${cash(m.fixed)}</b></li>
      <li><span><i class="j-dot ess"></i>Essenciais</span><b>− ${cash(m.essential)}</b></li>
      <li><span><i class="j-dot flex"></i>Escolhas ${m.improveNow !== m.improveGoal ? `<small>${cash(m.improveNow)} → meta</small>` : ""}</span><b>− ${cash(m.improveGoal)}</b></li>
      ${m.debtMin ? `<li><span><i class="j-dot miss"></i>Dívida</span><b>− ${cash(m.debtMin)}</b></li>` : ""}
      <li class="total"><span>Sobra no mês</span><b class="${m.leftGoal < 0 ? "neg" : "pos"}">${m.leftGoal < 0 ? "− " : ""}${cash(Math.abs(m.leftGoal))}</b></li>
    </ul>
    ${
      m.leftGoal < 0
        ? `<p class="j-setup-note bad">As contas passam da renda em ${cash(-m.leftGoal)}. O Juntô vai priorizar o essencial e mostrar onde cortar primeiro.</p>`
        : m.improveNow > m.improveGoal
          ? `<p class="j-setup-note good">Com as metas que você escolheu, sobram <b>${cash(m.improveNow - m.improveGoal)} a mais</b> por mês — ${cash((m.improveNow - m.improveGoal) * 12)} num ano. 🎉</p>`
          : `<p class="j-setup-note">Mês no azul. Bora fazer essa sobra trabalhar pra você.</p>`
    }
    ${dreamT && save ? `<p class="j-setup-note">🎯 Guardando ${cash(save)} por mês, <b>${esc(d.dream.name || "seu sonho")}</b> chega em ~${Math.max(1, Math.ceil(dreamT / save))} ${Math.ceil(dreamT / save) === 1 ? "mês" : "meses"}.</p>` : ""}
  </div><p class="j-setup-note">Ao salvar, o Juntô cria suas entradas e contas fixas, define metas por categoria e passa a usar isso nas previsões, no Início e no chat.</p>${setupNav("Salvar e montar meu Juntô")}`;
}

function openSetup(fromStart = true) {
  if (!appAccess || state.demo) return;
  if (fromStart || !setupDraft) {
    setupDraft = setupFreshDraft();
    setupStep = 0;
  }
  try {
    localStorage.setItem(setupOfferedKey(), "1");
  } catch {}
  renderSetup();
}
function renderSetup() {
  openModal("Raio-X do seu mês", `<div class="j-setup" data-step="${setupSteps()[setupStep]}">${setupBody()}</div>`, "setup");
  const box = document.querySelector("#modal-content");
  if (box) box.scrollTop = 0;
  document.querySelector("#modal")?.scrollTo?.(0, 0);
}

// Lê a tela atual para o rascunho; devolve uma mensagem de erro ou "".
function setupRead(skip) {
  const d = setupDraft,
    step = setupSteps()[setupStep],
    root = document.querySelector(".j-setup");
  if (!root) return "";
  const val = (n) => root.querySelector(`[name="${n}"]`)?.value ?? "";
  const checked = (n) => Boolean(root.querySelector(`[name="${n}"]`)?.checked);
  const radio = (n) => root.querySelector(`[name="${n}"]:checked`)?.value;
  const bad = (v) => Number.isNaN(setupMoney(v));
  if (step === "incomes") d.incomes = [...root.querySelectorAll('[name="incomes"]:checked')].map((x) => x.value);
  if (step === "salary") {
    Object.assign(d.salary, { amount: val("amount"), mode: radio("mode") || "business", nth: setupInt(val("nth"), 1, 10, 5), day: setupInt(val("day"), 1, 31, 5), split: checked("split"), advance: val("advance"), advanceDay: setupInt(val("advanceDay"), 1, 31, 20) });
    if (!(setupMoney(d.salary.amount) > 0)) return "Coloca quanto cai no salário. Ex.: 3.200,00.";
    if (d.salary.split && !(setupMoney(d.salary.advance) > 0)) return "Coloca o valor do adiantamento — ou desmarque “duas partes”.";
  }
  if (step === "weekly") {
    Object.assign(d.weekly, { amount: val("amount"), weekday: setupInt(val("weekday"), 0, 6, 5) });
    if (!(setupMoney(d.weekly.amount) > 0)) return "Coloca quanto cai por semana.";
  }
  if (step === "daily") {
    Object.assign(d.daily, { amount: val("amount"), days: [...root.querySelectorAll('[name="days"]:checked')].map((x) => Number(x.value)) });
    if (!(setupMoney(d.daily.amount) > 0)) return "Coloca a média de um dia normal.";
    if (!d.daily.days.length) return "Marca pelo menos um dia da semana.";
  }
  if (step === "variable") {
    Object.assign(d.variable, { amount: val("amount"), day: setupInt(val("day"), 1, 31, 10) });
    if (!(setupMoney(d.variable.amount) > 0)) return "Coloca uma média por mês.";
  }
  if (step === "va" || step === "vt") {
    const x = d[step],
      mode = radio("mode") || "monthly";
    Object.assign(x, { mode, day: setupInt(val("day"), 1, 31, 5), weekday: setupInt(mode === "daily" ? val("weekdayD") : val("weekday"), 0, 6, 1), perDay: val("perDay"), amount: mode === "weekly" ? val("amountW") : val("amount") });
    if (step === "vt") Object.assign(x, { fare: val("fare"), trips: setupInt(val("trips"), 1, 6, 2) });
    if (mode === "daily" ? !(setupMoney(x.perDay) > 0) : !(setupMoney(x.amount) > 0)) return "Coloca o valor do vale.";
    if (step === "vt" && bad(x.fare)) return "Confira o valor da passagem. Ex.: 6,00.";
  }
  if (step === "fixed") {
    if (skip) {
      d.fixed = {};
      d.extraFixed = [];
      return "";
    }
    root.querySelectorAll(".j-setup-row[data-key]").forEach((row) => {
      const k = row.dataset.key;
      d.fixed[k] = { on: checked(`on-${k}`), amount: val(`amount-${k}`), day: setupInt(val(`day-${k}`), 1, 31, 10), payer: val(`payer-${k}`) || active };
    });
    d.extraFixed = d.extraFixed.map((f, i) => ({ name: val(`xname-${i}`).trim(), amount: val(`xamount-${i}`), day: setupInt(val(`xday-${i}`), 1, 31, 10), payer: val(`xpayer-${i}`) || active }));
    const missing = SETUP_FIXED.find(([k]) => d.fixed[k]?.on && !(setupMoney(d.fixed[k].amount) > 0));
    if (missing) return `Coloca o valor de ${missing[2].toLowerCase()} — ou desmarque.`;
    const ex = d.extraFixed.find((f) => f.name.length < 2 || !(setupMoney(f.amount) > 0));
    if (ex) return "Na conta extra, coloca nome e valor — ou remova.";
  }
  if (step === "essential") {
    SETUP_ESSENTIAL.forEach(([k]) => (d.essential[k] = val(`ess-${k}`)));
    if (Object.values(d.essential).some(bad)) return "Confira os valores. Ex.: 450,00.";
  }
  if (step === "improve") {
    if (skip) {
      d.improve = {};
      return "";
    }
    SETUP_IMPROVE.forEach(([k]) => (d.improve[k] = { on: checked(`imp-${k}`), amount: val(`impamount-${k}`), goal: radio(`impgoal-${k}`) || "half" }));
    const miss = SETUP_IMPROVE.find(([k]) => d.improve[k].on && !(setupMoney(d.improve[k].amount) > 0));
    if (miss) return `Quanto vai em ${miss[2].toLowerCase()} por mês? Pode ser uma média.`;
  }
  if (step === "debt") {
    Object.assign(d.debt, { has: radio("has") === "yes", amount: val("amount"), rate: val("rate"), minimum: val("minimum") });
    if (d.debt.has) {
      if (!(setupMoney(d.debt.amount) > 0)) return "Coloca quanto você deve hoje — ou marque “Não tenho”.";
      const r = Number(String(d.debt.rate || "0").replace("%", "").replace(",", "."));
      if (!Number.isFinite(r) || r < 0 || r > 100) return "Juros por mês: só o número, ex.: 2,5.";
      if (bad(d.debt.minimum)) return "Confira quanto consegue pagar por mês.";
    }
  }
  if (step === "dream") {
    if (skip) {
      d.dream = { name: "", target: "", months: 12 };
      return "";
    }
    Object.assign(d.dream, { name: val("name").trim(), target: val("target"), months: setupInt(val("months"), 1, 120, 12) });
    if (d.dream.name && !(setupMoney(d.dream.target) > 0)) return "Coloca quanto precisa pro sonho — ou pule.";
    if (!d.dream.name && setupMoney(d.dream.target) > 0) return "Dá um nome pro sonho.";
  }
  return "";
}

// ---------- Salvar: respostas viram dados do Juntô ----------
function setupSave() {
  const d = setupDraft,
    summary = setupMonthly(d),
    next = structuredClone(state),
    me = active,
    today = dateISO(),
    now = new Date(),
    M = (v) => Math.max(0, setupMoney(v) || 0);
  const addIncome = (inc) => {
    const same = next.incomes.find((i) => i.person === me && norm(i.name) === norm(inc.name));
    if (same) return void Object.assign(same, inc);
    next.incomes.push({ id: uid(), person: me, since: today, auto: false, variable: false, purpose: "general", countSat: true, nth: 5, weekday: 5, day: 5, ...inc });
  };
  if (d.incomes.includes("salary")) {
    const s = d.salary,
      main = { amount: M(s.amount), rule: s.mode === "business" ? "business" : "monthly", nth: s.nth, day: s.day, countSat: true };
    addIncome({ name: "Salário", ...main });
    if (s.split) addIncome({ name: "Adiantamento", amount: M(s.advance), rule: "monthly", day: s.advanceDay });
  }
  if (d.incomes.includes("weekly")) addIncome({ name: "Semanal", amount: M(d.weekly.amount), rule: "weekly", weekday: d.weekly.weekday });
  // Ganho por dia vira um valor semanal (confirmado no último dia trabalhado), sem um aviso por dia.
  if (d.incomes.includes("daily") && d.daily.days.length) addIncome({ name: "Ganhos da semana", amount: M(d.daily.amount) * d.daily.days.length, rule: "weekly", weekday: Math.max(...d.daily.days), variable: true });
  if (d.incomes.includes("variable")) addIncome({ name: "Comissão", amount: M(d.variable.amount), rule: "monthly", day: d.variable.day, variable: true });
  for (const k of ["va", "vt"]) {
    if (!d.incomes.includes(k)) continue;
    const x = d[k],
      purpose = k === "va" ? "food" : "transport",
      name = k === "va" ? "Vale alimentação" : "Vale transporte";
    if (x.mode === "monthly") addIncome({ name, amount: M(x.amount), rule: "monthly", day: x.day, purpose });
    else if (x.mode === "weekly") addIncome({ name, amount: M(x.amount), rule: "weekly", weekday: x.weekday, purpose });
    else addIncome({ name, amount: M(x.perDay) * 5, rule: "weekly", weekday: x.weekday, purpose, benefitDaily: M(x.perDay), variable: true });
  }
  // Contas fixas: próxima ocorrência (se o dia já passou neste mês, começa no próximo).
  const dueFor = (day) => {
    const y = now.getFullYear(),
      mo = now.getMonth() + (day < now.getDate() ? 1 : 0),
      last = new Date(y, mo + 1, 0).getDate();
    return dateISO(new Date(y, mo, Math.min(day, last)));
  };
  const addBill = (name, amount, category, day, payer) => {
    if (!(amount > 0)) return;
    const who = ["half", ...next.users.map((u) => u.id)].includes(payer) ? payer : me,
      series = next.bills.filter((b) => b.recurring && norm(b.name) === norm(name));
    if (series.length) {
      series.filter((b) => b.status === "open").forEach((b) => Object.assign(b, { amount, payer: who, recurringDay: day }));
      return;
    }
    const id = uid();
    next.bills.push({ id, name, amount, category, payer: who, due: dueFor(day), recurring: true, recurringKey: id, recurringDay: day, status: "open", createdAt: Date.now() });
  };
  const haveBills = new Set(setupExistingBills().map((b) => norm(b.name)));
  SETUP_FIXED.forEach(([k, , t, cat]) => {
    const f = d.fixed[k];
    if (f?.on && !haveBills.has(norm(t))) addBill(t, M(f.amount), cat, f.day, f.payer);
  });
  d.extraFixed.forEach((f) => addBill(f.name, M(f.amount), "Outros", f.day, f.payer));
  // Metas por categoria e estimativa do dia a dia.
  next.settings = next.settings || {};
  const caps = cloudSlot ? ((next.settings.personalBudgets = next.settings.personalBudgets || {}), (next.settings.personalBudgets[me] = next.settings.personalBudgets[me] || { ...next.budgets })) : (next.budgets = next.budgets || {});
  const capSum = {};
  SETUP_ESSENTIAL.forEach(([k, , , cat]) => {
    const v = M(d.essential[k]);
    if (v) capSum[cat] = (capSum[cat] || 0) + v;
  });
  let variableNow = Object.values(capSum).reduce((s, v) => s + v, 0);
  SETUP_IMPROVE.forEach(([k, , , cat]) => {
    const x = d.improve[k];
    if (!x?.on) return;
    const v = M(x.amount),
      f = SETUP_GOALS.find((g) => g[0] === x.goal)?.[2] ?? 1;
    variableNow += v;
    capSum[cat] = (capSum[cat] || 0) + Math.round((v * f) / 1000) * 1000;
  });
  Object.entries(capSum).forEach(([cat, v]) => (caps[cat] = v));
  if (variableNow > 0) {
    if (cloudSlot) {
      next.settings.personalEstimates = next.settings.personalEstimates || {};
      next.settings.personalEstimates[me] = variableNow;
    } else next.settings.variableEstimate = variableNow;
  }
  // Ônibus e dívida no orçamento pessoal.
  const pb = { ...(next.settings.personalBudget?.[me] || {}) };
  if (d.incomes.includes("vt") && M(d.vt.fare)) Object.assign(pb, { fare: M(d.vt.fare), trips: d.vt.trips });
  if (d.debt.has) Object.assign(pb, { debtPrincipal: M(d.debt.amount), debtRate: Number(String(d.debt.rate || "0").replace("%", "").replace(",", ".")) || 0, debtMinimum: M(d.debt.minimum), debtSince: today });
  else if (pb.debtPrincipal) pb.debtPrincipal = 0;
  if (Object.keys(pb).length) {
    pb.fare = pb.fare || 0;
    pb.trips = pb.trips || 2;
    pb.debtPrincipal = pb.debtPrincipal || 0;
    pb.debtRate = pb.debtRate ?? 0;
    pb.debtMinimum = pb.debtMinimum || 0;
    pb.debtSince = pb.debtSince || today;
    next.settings.personalBudget = next.settings.personalBudget || {};
    next.settings.personalBudget[me] = pb;
  }
  // Sonho.
  const target = M(d.dream.target);
  if (d.dream.name && target && !next.goals.some((g) => norm(g.name) === norm(d.dream.name))) next.goals.push({ id: uid(), name: d.dream.name.slice(0, 40), target, saved: 0, icon: /reserva|emerg/i.test(d.dream.name) ? "shield" : /viag/i.test(d.dream.name) ? "plane" : "heart" });
  next.settings.setup = next.settings.setup || {};
  // Respostas guardadas como texto: o validador trata qualquer chave "amount" como centavos.
  next.settings.setup[me] = { v: SETUP_VERSION, at: Date.now(), answers: JSON.stringify(d) };
  if (!validBackup(next)) return error("Não consegui validar as respostas. Confere os valores e tenta de novo.");
  state = migrate(next);
  log(me, "montou o raio-x do mês no Juntô.");
  setupDraft = null;
  close();
  route = "home";
  persist();
  window.scrollTo(0, 0);
  const m = summary;
  toast("Teu Juntô tá montado! 🎉", m.leftGoal >= 0 ? `Sobra prevista: ${money(m.leftGoal)} por mês. Bora fazer render.` : "O Juntô vai te mostrar por onde começar a ajustar.", "sparkle");
}

// Primeira vez: oferece o raio-x uma vez por aparelho, sem atrapalhar quem já fez.
function setupAutoOffer() {
  if (setupAutoChecked || !appAccess || state.demo || setupDone() || route !== "home") return;
  setupAutoChecked = true;
  let offered = false;
  try {
    offered = localStorage.getItem(setupOfferedKey()) === "1";
  } catch {}
  if (offered) return;
  setTimeout(() => {
    if (!appAccess || setupDone() || document.querySelector("#modal")?.open || document.body.classList.contains("chat-on")) return;
    openSetup(true);
  }, 700);
}
function setupCard(place = "home") {
  if (setupDone()) return "";
  return `<button class="j-card j-setup-cta" data-action="setup-open"><span class="j-setup-cta-ic">✦</span><span><small>${place === "home" ? "Primeiro passo" : "Pra análise ficar sob medida"}</small><b>Monte o raio-x do seu mês</b><em>2 minutos: como você recebe, contas fixas, essenciais e o que dá pra melhorar. Aí o Juntô organiza tudo pra você.</em></span><span class="j-chev" aria-hidden="true">›</span></button>`;
}

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || !appAccess) return;
  const action = el.dataset.action;
  if (action==='setup-open') {
    openSetup(!setupDraft);
    return;
  }
  if (!document.querySelector(".j-setup")) return;
  if (action==='setup-next') {
    const skip = el.dataset.skip === "1";
    if (setupSteps()[setupStep] === "intro" && skip) {
      setupDraft = null;
      close();
      return;
    }
    const msg = setupRead(skip);
    if (msg) return error(msg);
    if (setupStep >= setupSteps().length - 1) return setupSave();
    setupStep++;
    renderSetup();
    return;
  }
  if (action==='setup-back') {
    setupRead(false);
    setupStep = Math.max(0, setupStep - 1);
    renderSetup();
    return;
  }
  if (action==='setup-extra-add') {
    setupRead(false);
    setupDraft.extraFixed.push({ name: "", amount: "", day: 10, payer: active });
    renderSetup();
    setTimeout(() => document.querySelector(`[name="xname-${setupDraft.extraFixed.length - 1}"]`)?.focus(), 50);
    return;
  }
  if (action==='setup-extra-remove') {
    setupRead(false);
    setupDraft.extraFixed.splice(Number(el.dataset.i), 1);
    renderSetup();
  }
});
// Interações locais (sem re-render): mostrar campos conforme a escolha.
document.addEventListener("change", (event) => {
  const root = event.target.closest(".j-setup");
  if (!root) return;
  const t = event.target;
  if (t.type === "radio") {
    t.closest("[role=radiogroup]")?.querySelectorAll("label").forEach((l) => l.classList.toggle("on", l.contains(t)));
    const options = [...root.querySelectorAll(`[name="${t.name}"]`)].map((r) => r.value);
    root.querySelectorAll("[data-show]").forEach((b) => {
      if (options.includes(b.dataset.show)) b.hidden = b.dataset.show !== t.value;
    });
  }
  if (t.type === "checkbox") {
    t.closest(".j-setup-card, .j-setup-days label")?.classList.toggle("on", t.checked);
    const row = t.closest(".j-setup-row");
    if (row && t.closest(".j-setup-toggle")) {
      row.classList.toggle("on", t.checked);
      if (t.checked) setTimeout(() => { const a = document.activeElement; if (a === t || a === document.body || a?.closest?.(".j-setup-toggle")) row.querySelector(".j-setup-row-fields input")?.focus(); }, 30);
    }
    if (t.name === "split") root.querySelector('[data-show="split"]').hidden = !t.checked;
  }
});
