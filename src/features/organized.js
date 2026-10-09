// ===== V12 · Juntô organizado =====
// Inserido por scripts/build.mjs dentro do fechamento de app.js (marcador JUNTO_ORGANIZED).
// Navegação em quatro áreas (Início, Extrato, Análise, Metas) + chat no centro da barra,
// e um motor de leitura que usa a renda e o padrão de gasto de quem está usando.
// Nenhuma regra financeira nova: tudo é calculado com o modelo que já existe no app.
Object.assign(paths, {
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M14.5 2.6A9 9 0 0 1 21.4 9.5H14.5z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 4v2"/>',
});
let ledgerTab = "history",
  ledgerFilter = "all",
  ledgerMonth = 0,
  ledgerMine = true,
  goalScope = "mine",
  homeEveryone = false,
  homeScopePerson = null,
  ledgerPerson = null,
  ledgerLastRoute = null,
  coupleTab = "requests";
const ESSENTIAL_LIMIT = 0.15;
const isEssentialCat = (c) => (CUT_WEIGHT[c] ?? 0.3) <= ESSENTIAL_LIMIT;
const clamp01 = (x) => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
const signed = (c, fn = cashR) => `${c < 0 ? "− " : ""}${fn(Math.abs(c))}`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------- Navegação ----------
const NAV = [
  ["home", "home", "Início"],
  ["ledger", "receipt", "Extrato"],
  ["analysis", "pie", "Análise"],
  ["goals", "target", "Metas"],
];
const ROUTE_TITLE = { home: "Início", ledger: "Extrato", analysis: "Análise", goals: "Metas", couple: "Dupla", incomes: "Renda" };
const ROUTE_PARENT = { incomes: "analysis", couple: "home" };
function navCount(r) {
  if (r === "home" && !isSolo()) return incoming().length;
  if (r === "ledger") return [...state.bills, ...state.transactions].filter((x) => x.contest && x.contest.status === "open").length;
  return 0;
}
function navItem(r, ic, label, cls) {
  const on = route === r || ROUTE_PARENT[route] === r,
    n = navCount(r);
  return `<button class="${cls} ${on ? "active" : ""}" data-action="route" data-route="${r}" ${on ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span>${n ? `<span class="count">${n}</span>` : ""}</button>`;
}
function desktopNavHTML() {
  const items = isSolo() ? NAV : [...NAV, ["couple", "heart", "Dupla"]];
  return (
    items.map(([r, i, l]) => navItem(r, i, l, "nav-item")).join("") +
    `<button class="nav-item nav-chat" data-action="chat-open">${icon("sparkle")}<span>Conversar com o Juntô</span></button>`
  );
}
function mobileNavHTML() {
  const [a, b, c, d] = NAV.map(([r, i, l]) => navItem(r, i, l, ""));
  return `${a}${b}<button type="button" class="nav-ai" data-action="chat-open" aria-expanded="false" aria-controls="chat-panel" aria-label="Conversar com o Juntô"><span class="nav-ai-orb">${icon("sparkle")}</span><span>Juntô</span></button>${c}${d}`;
}
// Rotas antigas continuam funcionando como atalhos para o novo lugar de cada coisa.
function normalizeRoute() {
  if (route === "bills") {
    route = "ledger";
    if (billFilter === "month") {
      ledgerTab = "history";
      ledgerFilter = "spent";
    } else {
      ledgerTab = "bills";
      if (!["open", "paid", "fixed", "contested"].includes(billFilter)) billFilter = "open";
    }
  }
  if (route === "future") {
    route = "analysis";
    analysisTab = futureTab === "tips" ? "cuts" : "forecast";
  }
  if (route === "requests") {
    route = isSolo() ? "home" : "couple";
    coupleTab = "requests";
  }
  if (route === "activity") {
    if (isSolo()) {
      route = "ledger";
      ledgerTab = "history";
    } else {
      route = "couple";
      coupleTab = "activity";
    }
  }
  if (route === "couple" && isSolo()) route = "home";
  const legacyAnalysis = { overview: "summary", history: "summary", spend: "categories", fixed: "categories" };
  if (legacyAnalysis[analysisTab]) analysisTab = legacyAnalysis[analysisTab];
  if (!["summary", "categories", "forecast", "cuts"].includes(analysisTab)) analysisTab = "summary";
  if (planTab === "cuts") {
    route = "analysis";
    analysisTab = "cuts";
    planTab = "goals";
  }
  if (planTab === "sim") {
    route = "analysis";
    analysisTab = "forecast";
    planTab = "goals";
  }
  if (!["goals", "plan", "challenges"].includes(planTab)) planTab = "goals";
  if (!["home", "ledger", "analysis", "goals", "couple", "incomes"].includes(route)) route = "home";
  if (homeScopePerson !== active) { homeEveryone = false; goalScope = "mine"; homeScopePerson = active; }
  if (ledgerPerson !== active || (route === "ledger" && ledgerLastRoute !== "ledger")) {
    ledgerMine = true;
    ledgerFilter = "all";
    ledgerPerson = active;
  }
  ledgerLastRoute = route;
}
function viewFor() {
  return { home: homeV4, ledger: ledgerView, analysis: analysisV4, goals: personalGoalsView, couple: coupleView, incomes: () => `<div class="j-page">${incomesView()}</div>` }[route] || homeV4;
}
function viewMode() {
  return route === "home" ? (homeEveryone ? "shared" : "personal") : route === "analysis" || route === "incomes" || route === "goals" ? "personal" : "shared";
}

// ---------- Peças de interface ----------
function pageHead(eyebrow, title, sub = "", side = "") {
  return `<header class="j-head"><div><span class="j-eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${side}</header>`;
}
function segTabs(kind, current, items, label = "Seções") {
  return `<nav class="j-seg" aria-label="${esc(label)}" style="--n:${items.length}">${items
    .map(
      ([v, l]) =>
        `<button type="button" data-action="topic-tab" data-kind="${kind}" data-value="${v}" aria-pressed="${current === v}" class="${current === v ? "active" : ""}">${esc(l)}</button>`,
    )
    .join("")}</nav>`;
}
function chips(action, current, items) {
  return `<div class="j-chips" role="group">${items
    .map(
      ([v, l, n]) =>
        `<button type="button" data-action="${action}" data-value="${v}" aria-pressed="${current === v}" class="${current === v ? "active" : ""}">${esc(l)}${n ? `<b>${n}</b>` : ""}</button>`,
    )
    .join("")}</div>`;
}
function sectionTitle(title, link = "") {
  return `<div class="j-section-title"><h3>${esc(title)}</h3>${link}</div>`;
}
const goLink = (label, r, kind, value) =>
  `<button class="j-link" data-action="go" data-route="${r}"${kind ? ` data-kind="${kind}" data-value="${value}"` : ""}>${esc(label)} <span aria-hidden="true">›</span></button>`;
function row({ icon: ic, tone = "", title, sub = "", amount = "", amountClass = "", action = "", id = "", extra = "", q = "", chevron = true }) {
  const tag = action ? "button" : "div";
  return `<${tag} class="j-row" ${action ? `data-action="${action}"` : ""} ${id ? `data-id="${esc(id)}"` : ""} ${extra} ${q ? `data-q="${esc(q)}"` : ""}><span class="j-ic ${tone}">${icon(ic)}</span><span class="j-row-copy"><b>${esc(title)}</b>${sub ? `<small>${sub}</small>` : ""}</span>${amount ? `<strong class="num ${amountClass}">${amount}</strong>` : "<span></span>"}${action && chevron ? '<span class="j-chev" aria-hidden="true">›</span>' : "<span></span>"}</${tag}>`;
}
function ring(value, size = "") {
  const v = Math.round(value);
  return `<span class="j-ring ${size} ${v >= 75 ? "good" : v >= 50 ? "ok" : v >= 35 ? "warn" : "bad"}" style="--p:${v}"><b>${v}</b></span>`;
}
function emptyBox(ic, title, body, cta = "") {
  return `<div class="j-empty">${icon(ic)}<h3>${esc(title)}</h3><p>${body}</p>${cta}</div>`;
}

// ---------- Motor de leitura personalizada ----------
// Calculado no perfil de quem está usando (renda, contas e gastos dessa pessoa).
function brain() {
  return withFinanceView("personal", () =>
    cached("brain", () => {
      const M = model(),
        inc = avgIncome(),
        fixed = fixedMonthly(),
        B = budgets(),
        fc = Object.values(M.fc),
        today = dateISO(),
        fs = financeState();
      const essF = fc.filter((x) => isEssentialCat(x.c)).reduce((s, x) => s + x.f, 0),
        flexF = fc.filter((x) => !isEssentialCat(x.c)).reduce((s, x) => s + x.f, 0),
        variable = M.monthlyVar,
        essential = essF + flexF ? (variable * essF) / (essF + flexF) : variable,
        choices = Math.max(0, variable - essential),
        left = inc - fixed - variable;
      const opts = inc ? planOptions() : [],
        reco = opts.find((o) => o.key === recommendedKey()) || opts[0] || null,
        plan = fs.plan,
        saveTarget = plan?.monthly || reco?.monthly || 0,
        choicesTarget = Math.max(0, choices - (reco?.cutAmt || 0));
      const days = daysUntil(endOfMonthISO()),
        pts = inc ? simulate({ days }) : [],
        eom = pts.length ? pts[pts.length - 1].free : null,
        cap = inc ? dailyCap() : 0;
      const reserveNeed = (fixed + essential) * 3,
        reserveHave = fs.goals.filter((g) => g.icon === "shield").reduce((s, g) => s + g.saved, 0),
        reserveMonths = fixed + essential ? reserveHave / (fixed + essential) : 0;
      const savedNow = savedInMonth(today.slice(0, 7)),
        savedPrev = savedInMonth(prevYM());
      // Nota de 0 a 100, explicada parte por parte para não virar caixa-preta.
      let score = null,
        parts = [];
      if (inc > 0) {
        const sobraPct = left / inc,
          fixedPct = fixed / inc,
          okCats = B.length ? B.filter((b) => b.status === "ok").length / B.length : 1;
        parts = [
          {
            label: "Sobra do mês",
            pts: clamp01(sobraPct / 0.15) * 25,
            max: 25,
            note: left >= 0 ? `${pct(Math.max(0, sobraPct))} da renda sobra no ritmo atual (bom: 15%+)` : `Faltam ${cashR(-left)} por mês no ritmo atual`,
          },
          {
            label: "Peso das contas fixas",
            pts: clamp01((0.75 - fixedPct) / 0.25) * 20,
            max: 20,
            note: `${pct(fixedPct)} da renda (confortável: até 50%)`,
          },
          {
            label: "Reserva de emergência",
            pts: clamp01(reserveNeed ? reserveHave / reserveNeed : 0) * 20,
            max: 20,
            note: `${ratioText(reserveMonths)} de 3 meses do seu custo essencial`,
          },
          {
            label: "Metas por categoria",
            pts: okCats * 15,
            max: 15,
            note: B.length ? `${B.filter((b) => b.status === "ok").length} de ${B.length} categorias no ritmo` : "Sem metas ainda",
          },
          {
            label: "Fim do mês e constância",
            pts: (eom != null && eom >= 0 ? 10 : 0) + (savedNow > 0 || savedPrev > 0 ? 10 : 0),
            max: 20,
            note: `${eom != null && eom >= 0 ? "Mês fecha no azul" : "Mês fecha no vermelho"} · ${savedNow || savedPrev ? "guardou no último mês" : "nada guardado no último mês"}`,
          },
        ];
        score = Math.round(parts.reduce((s, p) => s + p.pts, 0));
      }
      const scoreLabel = score == null ? "" : score >= 80 ? "Ótima" : score >= 60 ? "Boa" : score >= 40 ? "Pede atenção" : "Apertada";
      return {
        M,
        inc,
        fixed,
        essential,
        choices,
        variable,
        left,
        saveTarget,
        choicesTarget,
        reco,
        eom,
        cap,
        reserveNeed,
        reserveHave,
        reserveMonths,
        score,
        scoreLabel,
        parts,
        insights: insightList({ M, inc, fixed, essential, choices, left, B, eom, cap, reserveMonths, reco }),
      };
    }),
  );
}
function insightList(x) {
  const out = [],
    add = (o) => out.push({ tone: "info", impact: 0, ...o }),
    { M, inc, fixed, left, B, eom, cap } = x;
  if (!inc) {
    add({
      tone: "warn",
      icon: "coins",
      title: "O Juntô ainda não sabe quanto você ganha.",
      body: "Cadastre salário, renda semanal ou comissão. Sem isso, toda análise vira chute — e chute não paga boleto.",
      act: ["Cadastrar renda", "income-new"],
    });
    return out;
  }
  const mN = monthName(new Date());
  if (eom != null && eom < 0)
    add({
      tone: "bad",
      icon: "trend",
      title: `${isSolo() ? "No ritmo atual" : "Na sua parte"}, ${mN} fecha em ${signed(eom)}.`,
      body: `Hoje o mês aguenta até ${cashR(cap)} por dia; seu ritmo é ${cashR(M.daily)}. Segurando a diferença, ele volta pro azul.`,
      impact: -eom,
      act: ["Ver previsão", "go", "analysis", "forecast"],
    });
  else if (M.daily > cap * 1.12 && cap > 0)
    add({
      tone: "warn",
      icon: "trend",
      title: `${isSolo() ? "Seu ritmo" : "Seu ritmo pessoal"} é ${cashR(M.daily)}/dia; ${isSolo() ? "o mês" : "sua parte"} aguenta ${cashR(cap)}.`,
      body: "Ainda fecha no azul, mas sem folga pra imprevisto. Vale tirar o pé em algum gasto flexível nos próximos dias.",
      impact: (M.daily - cap) * daysUntil(endOfMonthISO()),
      act: ["Ver previsão", "go", "analysis", "forecast"],
    });
  B.filter((b) => b.status !== "ok")
    .sort((a, b) => b.mtd - b.pace - (a.mtd - a.pace))
    .slice(0, 2)
    .forEach((b) =>
      add({
        tone: b.status === "over" ? "bad" : "warn",
        icon: categoryIcon(b.c),
        title: b.status === "over" ? `${b.c} já estourou a meta de ${mN}.` : `${b.c} está acima do ritmo da meta.`,
        body:
          b.status === "over"
            ? `Foram ${cashR(b.mtd)} de ${cashR(b.budget)}. Daqui pra frente, cada real aqui sai do que iria pro seu plano.`
            : `Já foram ${cashR(b.mtd)}; até hoje o ritmo era ${cashR(b.pace)}. Pra fechar em ${cashR(b.budget)}: até ${cashR(b.perDay)} por dia.`,
        impact: Math.max(0, b.proj - b.budget),
        act: ["Ver categoria", "go", "analysis", "categories"],
      }),
    );
  // Peso de cada gasto flexível em relação à renda DESTA pessoa.
  B.filter((b) => !isEssentialCat(b.c) && b.f > b.ref * 1.3 && b.f - b.ref > 3000)
    .sort((a, b) => b.f - b.ref - (a.f - a.ref))
    .slice(0, 2)
    .forEach((b) =>
      add({
        tone: "warn",
        icon: categoryIcon(b.c),
        title: `${b.c} leva ${pct(b.refPct)} da sua renda.`,
        body: `Pra quem ganha ${cashR(inc)} por mês, uma faixa confortável é até ${cashR(b.ref)}. Você está em ${cashR(b.f)} — dá pra soltar ${cashR(b.f - b.ref)} por mês sem mexer no essencial.`,
        impact: b.f - b.ref,
        act: ["Ajustar meta", "go", "analysis", "categories"],
      }),
    );
  const growing = B.filter((b) => b.change > 0.2 && b.f > 5000 && b.avg3 > 0).sort((a, b) => b.f - b.avg3 - (a.f - a.avg3))[0];
  if (growing)
    add({
      tone: "warn",
      icon: "trend",
      title: `${growing.c} cresceu ${pct(growing.change)} contra sua média.`,
      body: `A média dos últimos meses era ${cashR(growing.avg3)}; a previsão agora é ${cashR(growing.f)} por mês. Esse tipo de subida costuma passar despercebida.`,
      impact: growing.f - growing.avg3,
      act: ["Ver histórico", "go", "analysis", "summary"],
    });
  if (M.age >= 21 && M.weekAvg > 0 && M.weekendAvg > M.weekAvg * 1.5) {
    const extra = (M.weekendAvg - M.weekAvg) * 8.7;
    add({
      icon: "calendar",
      title: `Seu fim de semana custa ${ratioText(M.weekendAvg / M.weekAvg)}x um dia útil.`,
      body: `Em média ${cashR(M.weekendAvg)} por dia de sábado e domingo contra ${cashR(M.weekAvg)} nos outros dias. Segurar um terço dessa diferença libera ${cashR(extra / 3)} por mês.`,
      impact: extra / 3,
      act: ["Ver calendário", "go", "analysis", "forecast"],
    });
  }
  const payday = paydayPattern();
  if (payday)
    add({
      icon: "coins",
      title: `Depois que o salário cai, você gasta ${ratioText(payday.ratio)}x o normal.`,
      body: `Nos 3 dias seguintes ao pagamento, a média vai pra ${cashR(payday.after)} por dia (normal: ${cashR(payday.base)}). Separar o plano no mesmo dia em que o dinheiro entra protege o resto do mês.`,
      impact: payday.extra,
      act: ["Guardar primeiro", "go", "goals", "plan"],
    });
  if (M.small.n >= 12) {
    const monthly = M.small.sum * M.scale;
    add({
      icon: "coffee",
      title: `${M.small.n} compras pequenas somaram ${cashR(M.small.sum)}.`,
      body: `Gastos de até R$ 40 nos últimos ${M.coverage} dias — o clássico “é só um cafezinho”. No mês, isso dá ${cashR(monthly)}. Cortar um terço vira ${cashR(monthly / 3)} guardados.`,
      impact: monthly / 3,
      act: ["Ver cortes", "go", "analysis", "cuts"],
    });
  }
  const F = fixedReading();
  F.rows
    .filter((r) => r.change > 0.05 && r.b.amount * r.change >= 500)
    .slice(0, 1)
    .forEach((r) =>
      add({
        tone: "warn",
        icon: "repeat",
        title: `${r.b.name} subiu ${pct(r.change)} no último mês.`,
        body: `${r.action}`,
        impact: r.save,
        act: ["Ver contas fixas", "go", "analysis", "categories"],
      }),
    );
  const subs = templates()
    .filter((b) => b.category === "Assinaturas")
    .reduce((s, b) => s + b.amount, 0);
  if (subs && subs / inc >= 0.03)
    add({
      icon: "wifi",
      title: `Assinaturas somam ${cashR(subs)} por mês.`,
      body: `São ${cashR(subs * 12)} por ano (${pct(subs / inc)} da renda). Vale conferir o que ainda é usado — e pedir desconto no resto.`,
      impact: subs * 0.2,
      act: ["Ver contas fixas", "go", "analysis", "categories"],
    });
  if (fixed / inc > 0.6)
    add({
      tone: "warn",
      icon: "house",
      title: `Contas fixas levam ${pct(fixed / inc)} da sua renda.`,
      body: "Acima de 60%, qualquer imprevisto aperta. Moradia e planos de celular/internet costumam ser os primeiros a renegociar.",
      act: ["Ver contas fixas", "go", "analysis", "categories"],
    });
  tips()
    .filter((t) => t.impact > 0)
    .slice(0, 2)
    .forEach((t) =>
      add({ icon: t.icon, title: t.title, body: String(t.body).replace(/<[^>]+>/g, ""), impact: t.impact, act: ["Ver cortes", "go", "analysis", "cuts"] }),
    );
  incomeInsights()
    .slice(0, 1)
    .forEach((t) => add({ icon: t.icon, title: t.title, body: String(t.body).replace(/<[^>]+>/g, ""), act: ["Ver renda", "route", "incomes"] }));
  if (left >= inc * 0.15)
    add({
      tone: "good",
      icon: "circleCheck",
      title: `Você fecha o mês com folga de ${cashR(left)}.`,
      body: `${pct(left / inc)} da renda sobra no ritmo atual. ${financeState().plan ? "O plano já está separando uma parte." : "Que tal mandar uma parte pro cofre no dia em que o dinheiro cair?"}`,
      act: financeState().plan ? ["Ver plano", "go", "goals", "plan"] : ["Montar plano", "go", "goals", "plan"],
    });
  const g = financeState().goals.find((g) => g.icon !== "shield" && g.saved < g.target);
  if (g) {
    const pace = financeState().plan?.monthly || goalPace(g),
      boost = out.filter((o) => o.tone !== "good").reduce((s, o) => s + Math.max(0, o.impact || 0), 0) * 0.5;
    if (pace > 0 || boost > 0)
      add({
        tone: "good",
        icon: g.icon || "heart",
        title: `${g.name}: ${pace > 0 ? `chega em ${etaText(g.target - g.saved, pace)} no ritmo atual` : "ainda sem ritmo de guardar"}.`,
        body:
          boost > 0
            ? `Aplicando metade dos ajustes acima (${cashR(boost)}/mês), chega em ${etaText(g.target - g.saved, pace + boost)}.`
            : "Cada depósito no cofre adianta a data. Até o pouquinho conta.",
        act: ["Ver meta", "go", "goals", "goals"],
      });
  }
  const rank = { bad: 0, warn: 1, info: 2, good: 3 };
  const seen = new Set();
  return out
    .filter((o) => (seen.has(o.title) ? false : seen.add(o.title)))
    .sort((a, b) => rank[a.tone] - rank[b.tone] || (b.impact || 0) - (a.impact || 0));
}
function paydayPattern() {
  const fs = financeState(),
    main = fs.incomes.filter((i) => i.rule === "business" || i.rule === "monthly").sort((a, b) => b.amount - a.amount)[0];
  if (!main) return null;
  const from = dateISO(addDays(new Date(), -120)),
    dates = fs.received.filter((r) => r.incomeId === main.id && r.status === "received" && r.date >= from).map((r) => r.date);
  if (dates.length < 2) return null;
  const vars = fs.transactions.filter((t) => isVariable(t) && t.date >= from),
    total = vars.reduce((s, t) => s + t.amount, 0),
    span = Math.max(30, daysUntil(dateISO()) - daysUntil(from));
  const win = new Set(dates.flatMap((d) => [0, 1, 2].map((k) => dateISO(addDays(pd(d), k))))),
    after = vars.filter((t) => win.has(t.date)).reduce((s, t) => s + t.amount, 0),
    winDays = win.size || 1,
    base = (total - after) / Math.max(1, span - winDays),
    perDay = after / winDays;
  if (!base || perDay < base * 1.6) return null;
  return { ratio: perDay / base, after: perDay, base, extra: (perDay - base) * 3 * 0.5 };
}
// Ações dos cartões de leitura.
function insightAction(a) {
  if (!a) return "";
  const [label, act, r, v] = a;
  if (act === "go")
    return `<button class="j-link" data-action="go" data-route="${r}" data-kind="${r === "goals" ? "plan" : r}" data-value="${v}">${esc(label)} ›</button>`;
  if (act === "route") return `<button class="j-link" data-action="route" data-route="${r}">${esc(label)} ›</button>`;
  return `<button class="j-link" data-action="${act}">${esc(label)} ›</button>`;
}
function insightCard(o) {
  return `<article class="j-insight ${o.tone}"><span class="j-ic">${icon(o.icon || "sparkle")}</span><div><h4>${esc(o.title)}</h4><p>${esc(o.body)}</p><div class="j-insight-foot">${o.impact > 0 && o.tone !== "good" ? `<span class="j-impact num">até ${cashR(o.impact)}/mês</span>` : ""}${insightAction(o.act)}</div></div></article>`;
}

// ---------- Início ----------
function upcomingEvents(days = 7) {
  const lim = dateISO(addDays(new Date(), days)),
    today = dateISO();
  const ins = [
    ...pendingArrivals(20, cloudSlot || undefined).map((x) => ({ ...x, pending: true })),
    ...nextArrivals(days, cloudSlot || undefined),
  ].map((x) => ({
    date: x.date < today ? today : x.date,
    kind: "in",
    pending: !!x.pending,
    title: x.inc.name,
    who: x.inc.person,
    amount: x.inc.amount,
    id: x.inc.id,
    orig: x.date,
  }));
  const outs = state.bills
    .filter((b) => b.status === "open" && b.due <= lim)
    .map((b) => ({ date: b.due < today ? today : b.due, late: b.due < today, kind: "out", title: b.name, amount: b.amount, id: b.id, payer: b.payer, cat: b.category }));
  return [...ins, ...outs].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === "in" ? -1 : 1));
}
function eventRow(e) {
  const when = e.date === dateISO() ? (e.late ? "Venceu" : e.pending ? "Era pra ter caído" : "Hoje") : `${wdShort(e.date)}, ${dayMonth(e.date)}`;
  if (e.kind === "in")
    return row({
      icon: "coins",
      tone: "green",
      title: e.title,
      sub: `${when}${isSolo() ? "" : ` · ${esc(first(user(e.who).name))}`}${e.pending ? " · toque pra confirmar" : ""}`,
      amount: `+ ${cashR(e.amount)}`,
      amountClass: "pos",
      action: e.pending ? "income-arrived" : "income-detail",
      id: e.id,
      extra: e.pending ? `data-date="${e.orig}"` : "",
    });
  return row({
    icon: categoryIcon(e.cat),
    tone: e.late ? "red" : categoryColor(e.cat),
    title: e.title,
    sub: `${when} · ${esc(payerLabel(e.payer))}`,
    amount: `− ${cashR(e.amount)}`,
    action: "bill-detail",
    id: e.id,
  });
}
// Saldo na conta: o meu e o da dupla somados (no modo solo, só o meu).
function heroBalances() {
  const mine = user(active).balance;
  if (isSolo() || !homeEveryone)
    return `<div class="j-hero-bal one"><button data-action="balance" data-user="${active}" aria-label="Ajustar meu saldo"><small>${isSolo() ? "Saldo na conta" : "Meu saldo · " + esc(first(user().name))}</small><b class="num ${mine < 0 ? "neg" : ""}">${cash(mine)}</b></button></div>`;
  const o = other(), theirs = user(o).balance, both = mine + theirs;
  return `<div class="j-hero-bal"><button data-action="balance" data-user="${active}" aria-label="Ajustar meu saldo"><small>Meu saldo</small><b class="num ${mine < 0 ? "neg" : ""}">${cash(mine)}</b></button><i aria-hidden="true"></i><div><small>Juntos <em>${esc(first(user(o).name))}: ${cash(theirs)}</em></small><b class="num ${both < 0 ? "neg" : ""}">${cash(both)}</b></div></div>`;
}
function homeV4() {
  const solo = isSolo(),
    available = homeEveryone ? free() : personalFree(),
    me = first(user().name),
    Bn = brain(),
    cap = state.incomes.some(i => homeEveryone || i.person === active) ? dailyCap() : null,
    eomPts = state.incomes.some(i => homeEveryone || i.person === active) ? simulate({ days: daysUntil(endOfMonthISO()) }) : [],
    eom = eomPts.length ? eomPts[eomPts.length - 1].free : null,
    toPay = state.bills.filter((b) => b.status === "open" && b.due.slice(0, 7) <= dateISO().slice(0, 7)).reduce((s, b) => s + (homeEveryone ? b.amount : shareOf(b,active)), 0);
  const hour = new Date().getHours(),
    hello = hour < 5 ? "Boa madrugada" : hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const visibleGoals = state.goals.filter(g => homeEveryone || goalOwner(g) === active);
  const g = visibleGoals.find((x) => x.saved < x.target) || visibleGoals[0],
    gp = g ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0,
    gPace = g ? state.plan?.monthly || goalPace(g) : 0;
  const events = upcomingEvents(7).filter(e => homeEveryone || (e.kind === "in" ? e.who === active : shareOf({amount:e.amount,payer:e.payer},active)>0)).map(e => homeEveryone || e.kind === "in" ? e : {...e,amount:shareOf({amount:e.amount,payer:e.payer},active),payer:active}).slice(0, 4),
    latest = ledgerEntries(dateISO().slice(0, 7), { all: true, everyone: homeEveryone }).slice(0, 4),
    insights = Bn.insights.slice(0, 3);
  const arrivals = pendingArrivals(45, cloudSlot || undefined).filter(x => homeEveryone || x.inc.person === active);
  const banners = [
    incoming().length
      ? `<button class="j-banner" data-action="go" data-route="couple" data-kind="couple" data-value="requests">${icon("chat")}<span><b>${esc(first(user(other()).name))} quer combinar ${incoming().length === 1 ? "um gasto" : `${incoming().length} gastos`}.</b><small>Responde rapidinho, o valor só sai se vocês combinarem.</small></span><em>Ver</em></button>`
      : "",
    arrivals.length
      ? `<button class="j-banner green" data-action="income-arrived" data-id="${arrivals[0].inc.id}" data-date="${arrivals[0].date}">${icon("coins")}<span><b>${esc(arrivals[0].inc.name)}${solo ? "" : ` de ${esc(first(user(arrivals[0].inc.person).name))}`} ${arrivals[0].date === dateISO() ? "cai hoje" : `era pra ter caído ${dayMonth(arrivals[0].date)}`}.</b><small>Confirma e a previsão se ajusta${arrivals.length > 1 ? ` (+${arrivals.length - 1})` : ""}.</small></span><em>Confirmar</em></button>`
      : "",
    contestBanner(),
  ]
    .filter(Boolean)
    .join("");
  setupAutoOffer();
  return `<div class="j-page j-home">
    <header class="j-hello"><div><span class="j-eyebrow">${solo ? "Modo individual" : homeEveryone ? "Juntô a dois · visão combinada" : "Meu espaço pessoal"}</span><h2>${hello}, ${esc(me)}.</h2></div></header>
    ${banners ? `<div class="j-banners">${banners}</div>` : ""}
    <section class="j-hero" aria-label="Resumo financeiro">
      <div class="j-hero-top"><span>${homeEveryone ? "Livre da dupla" : "Meu dinheiro livre"}</span><div class="j-scope-actions">${solo ? "" : `<button type="button" class="j-toggle" data-action="home-scope" aria-pressed="${homeEveryone}">${homeEveryone ? "Só meus dados" : "Ver todos"}</button>`}<button class="icon-btn" data-action="hide" aria-label="${hidden ? "Mostrar" : "Ocultar"} valores">${icon(hidden ? "eyeOff" : "eye")}</button></div></div>
      <strong class="j-hero-value num ${available < 0 ? "neg" : ""}" id="free-amount">${signed(available, cash)}</strong>
      <p>${available < 0 ? "O mês passou do livre. Vale revisar antes do próximo gasto." : homeEveryone ? "Contas, planos e combinados da dupla." : "Seus gastos, entradas e metas — sem misturar os valores da outra pessoa."}</p>
      ${heroBalances()}
      <div class="j-hero-stats">
        <button data-action="go" data-route="analysis" data-kind="analysis" data-value="forecast"><small>Por dia, hoje</small><b class="num">${cap == null ? "—" : cashR(cap)}</b></button>
        <button data-action="go" data-route="analysis" data-kind="analysis" data-value="forecast"><small>Fim do mês</small><b class="num ${eom != null && eom < 0 ? "neg" : ""}">${eom == null ? "—" : signed(eom)}</b></button>
        <button data-action="go" data-route="ledger" data-kind="ledger" data-value="bills"><small>A pagar</small><b class="num">${cashR(toPay)}</b></button>
      </div>
    </section>
    <div class="j-actions">
      <button class="j-cta primary" data-action="expense">${icon("plus")}<span>Registrar gasto</span></button>
      <button class="j-cta" data-action="${solo ? "can-spend" : "ask"}">${icon(solo ? "sparkle" : "chat")}<span>${solo ? "Posso gastar?" : "Amor, posso gastar?"}</span></button>
    </div>
    ${setupCard("home")}
    ${
      !setupDone()
        ? ""
        : Bn.score != null
        ? `<button class="j-card j-score" data-action="go" data-route="analysis" data-kind="analysis" data-value="summary">${ring(Bn.score)}<span><small>Saúde financeira${solo ? "" : " · sua"}</small><b>${Bn.scoreLabel}</b><em>${esc(Bn.parts.slice().sort((a, b) => a.pts / a.max - b.pts / b.max)[0].note)}</em></span><span class="j-chev" aria-hidden="true">›</span></button>`
        : `<button class="j-card j-score" data-action="income-new">${icon("coins")}<span><small>Pra análise ficar sob medida</small><b>Conta quanto você ganha</b><em>Salário, semanal ou comissão — o Juntô monta tudo a partir disso.</em></span><span class="j-chev" aria-hidden="true">›</span></button>`
    }
    ${
      insights.length && setupDone()
        ? `<section class="j-block">${sectionTitle("O Juntô notou", goLink("Ver análise", "analysis", "analysis", "summary"))}<div class="j-insights">${insights.map(insightCard).join("")}</div></section>`
        : ""
    }
    <section class="j-card">${sectionTitle("Próximos 7 dias", goLink("Ver previsão", "analysis", "analysis", "forecast"))}${
      events.length
        ? `<div class="j-list">${events.map(eventRow).join("")}</div>`
        : `<p class="j-muted">Nada entra nem vence nos próximos dias. Semana tranquila. 😌</p>`
    }</section>
    ${
      g
        ? `<section class="j-card j-dream">${sectionTitle(homeEveryone ? "Próximo sonho da dupla" : "Meu próximo sonho", goLink("Metas", "goals", "plan", "goals"))}<div class="j-dream-main"><span class="j-ic gold">${icon(g.icon || "heart")}</span><div><b>${esc(g.name)}</b><small>${cash(g.saved)} de ${cash(g.target)}${gPace > 0 && gp < 100 ? ` · chega em ${etaText(g.target - g.saved, gPace)}` : ""}</small></div><strong>${gp}%</strong></div><div class="j-progress"><span style="width:${gp}%"></span></div><button class="j-cta small" data-action="contribute" data-id="${g.id}">${icon("plus")}<span>Guardar um pouquinho</span></button></section>`
        : `<button class="j-card j-dream-empty" data-action="new-goal">${icon("heart")}<span><b>Tem um sonho aí?</b><small>Dá um nome pra ele e o Juntô calcula quando chega.</small></span><em>Criar</em></button>`
    }
    ${challengeStrip()}
    ${!solo && !homeEveryone ? `<button class="j-card j-couple-link" data-action="home-scope"><span class="j-avs">${avatar("a")}${avatar("b")}</span><span><b>Nosso espaço a dois</b><small>Ver planejamento combinado e totais da dupla</small></span><span class="j-chev" aria-hidden="true">›</span></button>` : ""}
    ${
      !solo
        ? `<button class="j-card j-couple-link" data-action="route" data-route="couple"><span class="j-avs">${avatar("a")}${avatar("b")}</span><span><b>A dupla</b><small>${pending().length ? `${plural(pending().length, "pedido em conversa", "pedidos em conversa")}` : "Nenhum pedido em aberto"} · ${cashR(approvedTotal())} combinados</small></span><span class="j-chev" aria-hidden="true">›</span></button>`
        : ""
    }
    <section class="j-card">${sectionTitle("Últimos movimentos", goLink("Ver extrato", "ledger", "ledger", "history"))}${
      latest.length ? `<div class="j-list">${latest.map(ledgerRow).join("")}</div>` : `<p class="j-muted">O primeiro registro aparece aqui.</p>`
    }</section>
  </div>`;
}

// ---------- Sonhos e investimentos com titularidade explícita ----------
function personalGoalsView() {
  const solo=isSolo(), mine=state.goals.filter(g=>goalOwner(g)===active),
    shared=state.goals.filter(g=>goalOwner(g)==='both'),
    partner=state.goals.filter(g=>!['both',active].includes(goalOwner(g))),
    tabs=segTabs('plan',planTab,[['goals','Sonhos'],['plan','Guardar'],['challenges','Desafios']]),
    head=pageHead('Meu planejamento','Metas','Sonhos e investimentos de cada pessoa, com espaço para os planos a dois.')+tabs;
  const goalRow=g=>{
    const p=g.target>0?Math.min(100,Math.round(g.saved/g.target*100)):0, owner=goalOwner(g),
      title=owner==='both'?'A dois':owner===active?'Só meu':first(user(owner).name),
      type=g.kind==='investment'?'Investimento':'Sonho / reserva';
    return `<button class="j-goal-card" type="button" data-action="goal-detail" data-id="${esc(g.id)}"><span class="j-ic gold">${icon(g.icon||'shield')}</span><span class="j-goal-copy"><b>${esc(g.name)}</b><small>${esc(type)} · ${esc(title)}</small><span class="j-progress"><span style="width:${p}%"></span></span><small>${cash(g.saved)} de ${cash(g.target)}</small></span><strong class="num">${p}%</strong></button>`;
  };
  const group=(label,items)=>items.length?`<section class="j-goal-group"><h3>${esc(label)}</h3><div class="j-list">${items.map(goalRow).join('')}</div></section>`:'';
  if(planTab==='challenges')return `<div class="j-page j-goals-personal">${head}${challengesView()}</div>`;
  if(planTab==='plan'){
    const myPlan=state.plan&&state.goals.some(g=>g.id===state.plan.goalId&&goalOwner(g)===active)?state.plan:null,
      mySaved=state.saves.filter(x=>x.actor===active&&x.date.slice(0,7)===dateISO().slice(0,7)).reduce((n,x)=>n+x.amount,0);
    return `<div class="j-page j-goals-personal">${head}<section class="j-card"><span class="j-eyebrow">Guardado por ${esc(first(user().name))} neste mês</span><strong class="j-big num">${cash(mySaved)}</strong><p class="j-muted">Seus aportes individuais e sua participação nos objetivos a dois são contabilizados separadamente.</p>${myPlan?`<p class="j-muted">Plano automático individual: ${cash(myPlan.monthly)} por mês.</p>`:'<p class="j-muted">Crie um objetivo pessoal ou um investimento para começar a acompanhar seus aportes.</p>'}<div class="j-goal-actions"><button class="j-cta primary" data-action="new-goal">${icon('plus')} Criar sonho</button><button class="j-cta" data-action="new-investment">${icon('shield')} Investimento</button></div></section>${group('Meus objetivos',mine)}${group('Metas a dois',shared)}</div>`;
  }
  const options=solo?[['mine','Meus objetivos']]:[['mine','Só meus'],['couple','A dois'],['all','Ver todos']];
  const scope=chips('goal-scope',goalScope,options);
  const shown=goalScope==='all'
    ?group('Meus sonhos e investimentos',mine)+group('Sonhos da dupla',shared)+group(`De ${first(user(other()).name)}`,partner)
    :goalScope==='couple'?group('Sonhos da dupla',shared):group('Meus sonhos e investimentos',mine);
  const empty=emptyBox('target',goalScope==='couple'?'Ainda não há uma meta a dois.':'Nenhum objetivo neste espaço.','Registre um sonho, uma reserva ou um investimento, sem misturar os valores da dupla.');
  const actions=`<div class="j-goal-actions"><button class="j-cta primary" data-action="new-goal">${icon('plus')}<span>Criar sonho</span></button><button class="j-cta" data-action="new-investment">${icon('shield')}<span>Registrar investimento</span></button></div>`;
  return `<div class="j-page j-goals-personal">${head}${scope}${actions}${shown||empty}${!solo&&goalScope==='mine'&&shared.length?`<button class="j-card j-couple-link" data-action="goal-scope" data-value="couple"><span class="j-ic gold">${icon('heart')}</span><span><b>Temos ${shared.length} ${shared.length===1?'meta compartilhada':'metas compartilhadas'}</b><small>Ver nossos sonhos a dois, separados dos seus</small></span><span class="j-chev">›</span></button>`:''}</div>`;
}
// ---------- Extrato ----------
function ledgerYM(offset = ledgerMonth) {
  const T = new Date();
  return dateISO(new Date(T.getFullYear(), T.getMonth() + offset, 1)).slice(0, 7);
}
function ledgerEntries(ym, { all = false, everyone = false } = {}) {
  const mine = ledgerMine && !isSolo() && !everyone,
    out = [];
  state.transactions.forEach((t) => {
    if (!all && t.date.slice(0, 7) !== ym) return;
    if (mine && shareOf(t, active) <= 0) return;
    const it = itemOf(t);
    out.push({
      kind: t.billId ? "bill" : "spent",
      date: t.date,
      at: t.createdAt || pd(t.date).getTime(),
      title: t.name,
      sub: `${t.billId ? "Conta paga" : esc(t.category)}${isSolo() ? "" : ` · ${esc(payerLabel(t.payer))}`}${t.contest?.status === "open" ? " · em revisão" : ""}`,
      amount: -(mine ? shareOf(t, active) : t.amount),
      icon: t.billId ? (recognize(t.name) || { icon: categoryIcon(t.category) }).icon : it.icon,
      tone: t.contest?.status === "open" ? "red" : categoryColor(t.category),
      action: "tx-detail",
      id: t.id,
      q: `${t.name} ${it.item} ${t.category}`,
    });
  });
  state.received.forEach((r) => {
    const date = r.actualDate || r.date;
    if (r.status !== "received" || (!all && date.slice(0, 7) !== ym)) return;
    const inc = state.incomes.find((i) => i.id === r.incomeId),
      person = r.person || inc?.person;
    if (mine && person !== active) return;
    out.push({
      kind: "income",
      date,
      at: r.at || pd(date).getTime(),
      title: r.name || inc?.name || "Entrada",
      sub: `Recebido${isSolo() || !person ? "" : ` · ${esc(first(user(person).name))}`}${r.bankSource ? ` · ${esc(r.bankSource.bank)}` : ""}`,
      amount: r.amount,
      icon: "coins",
      tone: "green",
      action: inc ? "income-detail" : "",
      id: inc?.id || "",
      q: `${inc?.name || r.name || "entrada"} recebido salario`,
    });
  });
  state.saves.forEach((s) => {
    if (!all && s.date.slice(0, 7) !== ym) return;
    if (mine && s.actor !== active) return;
    const goal = state.goals.find((g) => g.id === s.goalId);
    out.push({
      kind: "save",
      date: s.date,
      at: pd(s.date).getTime(),
      title: `Guardado · ${goal?.name || "cofre"}`,
      sub: `${s.source === "plan" ? "Plano de guardar" : "Depósito no cofre"}${isSolo() || !s.actor ? "" : ` · ${esc(first(user(s.actor).name))}`}`,
      amount: s.amount,
      save: true,
      icon: goal?.icon || "shield",
      tone: "gold",
      action: goal ? "goal-detail" : "",
      id: goal?.id || "",
      q: `guardado cofre ${goal?.name || ""}`,
    });
  });
  return out.sort((a, b) => b.date.localeCompare(a.date) || b.at - a.at);
}
function ledgerRow(e) {
  return row({
    icon: e.icon,
    tone: e.tone,
    title: e.title,
    sub: e.date === dateISO() ? `Hoje · ${e.sub}` : `${dateText(e.date)} · ${e.sub}`,
    amount: e.save ? `→ ${cash(e.amount)}` : `${e.amount < 0 ? "−" : "+"} ${cash(Math.abs(e.amount))}`,
    amountClass: e.save ? "gold" : e.amount > 0 ? "pos" : "",
    action: e.action,
    id: e.id,
    q: e.q,
  });
}
function dayLabel(iso) {
  const t = dateISO(),
    y = dateISO(addDays(new Date(), -1));
  return iso === t ? "Hoje" : iso === y ? "Ontem" : cap(dateLong(iso));
}
function ledgerView() {
  const solo = isSolo(),
    nOpen = [...state.bills, ...state.transactions].filter((x) => x.contest && x.contest.status === "open").length;
  const head = pageHead(
    solo || (ledgerTab === "history" && ledgerMine) ? "Meu dinheiro" : "Nosso dinheiro",
    "Extrato",
    ledgerTab === "history" ? "Entradas e gastos, organizados por dia." : "Acompanhe o que falta pagar.",
    `<button class="j-icon-btn" data-feature="bank-settings" aria-label="Movimentos do banco">${icon("wallet")}</button>`,
  );
  const tabs = segTabs("ledger", ledgerTab, [
    ["history", "Histórico"],
    ["bills", nOpen ? `Contas · ${nOpen}` : "Contas"],
  ]);
  return `<div class="j-page j-ledger">${head}${tabs}${ledgerTab === "bills" ? billsPanel() : historyPanel()}</div>`;
}
function historyPanel() {
  const solo = isSolo(),
    ym = ledgerYM(),
    all = ledgerEntries(ym),
    // No mês corrente, compara com o mesmo pedaço do mês anterior (até o mesmo dia).
    cutDay = ledgerMonth === 0 ? new Date().getDate() : 31,
    prev = ledgerEntries(ledgerYM(ledgerMonth - 1)).filter((e) => Number(e.date.slice(8, 10)) <= cutDay);
  const sum = (list, k) => list.filter((e) => (k === "out" ? e.amount < 0 : k === "save" ? e.save : !e.save && e.amount > 0)).reduce((s, e) => s + Math.abs(e.amount), 0);
  const inT = sum(all, "in"),
    outT = sum(all, "out"),
    saveT = sum(all, "save"),
    prevOut = sum(prev, "out");
  const list = all.filter((e) => ledgerFilter === "all" || e.kind === ledgerFilter || (ledgerFilter === "out" && e.amount < 0 && !e.save));
  const d = pd(ym + "-01"),
    current = ledgerMonth === 0,
    diff = prevOut ? outT / prevOut - 1 : 0;
  const days = {};
  list.forEach((e) => (days[e.date] = days[e.date] || []).push(e));
  const groups = Object.entries(days)
    .map(([iso, rows]) => {
      const net = rows.filter((e) => !e.save).reduce((s, e) => s + e.amount, 0);
      return `<section class="j-day" data-day><header><span>${esc(dayLabel(iso))}</span><b class="num ${net > 0 ? "pos" : ""}">${net ? signed(net, cash) : ""}</b></header><div class="j-list">${rows.map(ledgerRow).join("")}</div></section>`;
    })
    .join("");
  const counts = { out: all.filter((e) => e.amount < 0 && !e.save).length, income: all.filter((e) => e.kind === "income").length, save: all.filter((e) => e.kind === "save").length };
  const mine = solo || ledgerMine;
  return `<div class="j-ledger-scope"><div><b>${mine ? "Meu histórico" : "Histórico dos dois"}</b><small>${mine ? esc(first(user().name)) + " · suas entradas e gastos" : esc(state.users.map((u) => first(u.name)).join(" + "))}</small></div>${solo ? "" : `<button type="button" class="j-toggle" data-action="ledger-mine" aria-pressed="${!ledgerMine}" aria-controls="ledger-days">${icon(ledgerMine ? "users" : "user")}${ledgerMine ? "Ver tudo" : "Só meu histórico"}</button>`}</div>
    <div class="j-ledger-actions" role="group" aria-label="Registrar movimento"><button type="button" class="j-cta primary" data-action="ledger-income">${icon("plus")}<span>Registrar entrada</span></button><button type="button" class="j-cta" data-action="expense">${icon("arrowUp")}<span>Registrar gasto</span></button></div>
    <section class="j-card j-month">
      <div class="j-month-nav"><button class="icon-btn" data-action="ledger-month" data-delta="-1" aria-label="Mês anterior" ${ledgerMonth <= -12 ? "disabled" : ""}>${icon("chevL")}</button><h3>${cap(monthName(d))} ${d.getFullYear()}</h3><button class="icon-btn" data-action="ledger-month" data-delta="1" aria-label="Próximo mês" ${current ? "disabled" : ""}>${icon("chevR")}</button></div>
      <div class="j-month-stats"><div><small>Entrou</small><b class="num pos">${cash(inT)}</b></div><div><small>Saiu</small><b class="num">${cash(outT)}</b></div></div>
      <div class="j-ledger-result"><span>Resultado do mês</span><b class="num ${inT - outT < 0 ? "neg" : "pos"}">${signed(inT - outT, cash)}</b></div>
      <div class="j-ledger-saved"><span>Guardado em metas</span><b class="num gold">${cash(saveT)}</b></div>
      ${prevOut && Math.abs(diff) >= 0.05 ? `<p class="j-month-note">${mine ? "Você gastou" : "Vocês gastaram"} ${pct(Math.abs(diff))} ${diff > 0 ? "a mais" : "a menos"} que em ${monthName(pd(ledgerYM(ledgerMonth - 1) + "-01"))}${current ? " no mesmo período" : ""}.</p>` : ""}
    </section>
    <div class="j-tools"><label class="j-search">${icon("search")}<input id="ledger-search" type="search" placeholder="Buscar no histórico" aria-label="Buscar no extrato" autocomplete="off"></label></div>
    <div class="j-history-filters">${chips("ledger-filter", ledgerFilter, [
      ["all", "Tudo"],
      ["out", "Gastos", counts.out],
      ["income", "Entradas", counts.income],
      ["save", "Guardado", counts.save],
    ])}</div>
    <div class="j-days" id="ledger-days">${groups || emptyBox("receipt", "Nada por aqui.", ledgerFilter === "all" ? "Nenhum movimento neste mês ainda." : "Nenhum movimento desse tipo neste mês.")}</div>
    <p class="j-muted j-search-empty" id="ledger-search-empty" hidden>Nada encontrado com essa busca neste mês.</p>`;
}
function ledgerIncomeModal() {
  const sources = state.incomes.filter((i) => i.person === active), date = dateISO();
  openModal("Registrar entrada", `<p class="modal-sub">Dinheiro recebido por ${esc(first(user().name))}.</p><form class="form" data-form="ledger-income" data-id="${uid()}" data-actor="${active}">
    ${sources.length ? `<div class="field"><label for="receipt-income">De onde veio?</label><select id="receipt-income" name="receipt-income"><option value="">Entrada avulsa</option>${sources.map((i) => `<option value="${esc(i.id)}">${esc(i.name)}</option>`).join("")}</select></div>` : ""}
    ${field("receipt-name", "Descrição", "Ex.: salário, Pix recebido, freela")}
    ${field("receipt-amount", "Quanto entrou?", "0,00", "", true)}
    <div class="field"><label for="receipt-date">Quando recebeu?</label><input id="receipt-date" name="receipt-date" type="date" value="${date}" max="${date}" required></div>
    <div class="field" id="receipt-expected-field" hidden><label for="receipt-expected-date">Qual recebimento previsto está confirmando?</label><input id="receipt-expected-date" name="receipt-expected-date" type="date" value="${date}"></div>
    <label class="check-row"><input type="checkbox" name="receipt-adjust-balance" checked><span>Somar ao meu saldo<small>Desmarque se esse dinheiro já está no saldo informado.</small></span></label>
    ${formEnd("Confirmar entrada")}</form>`, "ledger-income");
}
function billsPanel() {
  const solo = isSolo(),
    ym = dateISO().slice(0, 7),
    open = state.bills.filter((b) => b.status === "open").sort((a, b) => a.due.localeCompare(b.due)),
    openMonth = open.filter((b) => b.due.slice(0, 7) <= ym),
    nOpen = [...state.bills, ...state.transactions].filter((x) => x.contest && x.contest.status === "open").length;
  const f = ["open", "paid", "fixed", "contested"].includes(billFilter) ? billFilter : "open";
  const list =
    f === "open"
      ? open
      : f === "paid"
        ? state.bills.filter((b) => b.status === "paid").sort((a, b) => b.due.localeCompare(a.due))
        : f === "fixed"
          ? templates().sort((a, b) => recurringDay(a) - recurringDay(b))
          : state.bills.filter((b) => b.contest);
  const txs = f === "contested" ? state.transactions.filter((t) => t.contest && !t.billId) : [];
  const shared = openMonth.filter((b) => ["half", "prop"].includes(b.payer)),
    parts = shared.reduce((acc, b) => (splitShares(b.amount, b.payer).forEach((x) => (acc[x.id] = (acc[x.id] || 0) + x.amount)), acc), { a: 0, b: 0 });
  const billRow = (b) => {
    const late = b.status === "open" && b.due < dateISO(),
      when =
        f === "fixed"
          ? `Todo dia ${recurringDay(b)}`
          : b.status === "paid"
            ? `Paga ${dateText(b.paidAt ? dateISO(new Date(b.paidAt)) : b.due)}`
            : late
              ? `Venceu ${dateText(b.due)}`
              : `Vence ${dateText(b.due)}`;
    return `<div class="j-row-wrap">${row({
      icon: (recognize(b.name) || { icon: categoryIcon(b.category) }).icon,
      tone: late ? "red" : categoryColor(b.category),
      title: b.name,
      sub: `${when} · ${esc(payerLabel(b.payer))}${b.recurring && f !== "fixed" ? " · mensal" : ""}`,
      amount: cash(b.amount),
      action: "bill-detail",
      id: b.id,
    })}${b.contest ? `<div class="j-contest">${contestBlock(b.contest, "bill", b.id)}</div>` : ""}</div>`;
  };
  const txRow = (t) =>
    `<div class="j-row-wrap">${row({ icon: itemOf(t).icon, tone: categoryColor(t.category), title: t.name, sub: `${dateText(t.date)} · ${esc(payerLabel(t.payer))}`, amount: `− ${cash(t.amount)}`, action: "tx-detail", id: t.id })}<div class="j-contest">${contestBlock(t.contest, "tx", t.id)}</div></div>`;
  const next = openMonth[0];
  return `<section class="j-card j-bills-sum"><div><small>A pagar este mês</small><strong class="num">${cash(openMonth.reduce((s, b) => s + b.amount, 0))}</strong><p>${openMonth.length ? `${plural(openMonth.length, "conta aberta", "contas abertas")}${next ? ` · próxima: ${esc(next.name)}, ${next.due < dateISO() ? "vencida" : dateText(next.due)}` : ""}` : "Tudo pago. Cabeça em paz. ✨"}</p></div>${shared.length && !solo ? `<div class="j-split">${icon("half")}<span><small>Sua parte</small><b class="num">${cash(parts[active] || 0)}</b></span><span><small>Parte de ${esc(first(user(other()).name))}</small><b class="num">${cash(parts[other()] || 0)}</b></span></div>` : ""}</section>
    ${chips("bill-filter", f, [
      ["open", "A pagar", open.length],
      ["paid", "Pagas"],
      ["fixed", "Fixas", templates().length],
      ...(solo ? [] : [["contested", "Revisões", nOpen]]),
    ])}
    <section class="j-card j-list">${list.map(billRow).join("") + txs.map(txRow).join("") || `<p class="j-muted">${f === "contested" ? "Nenhuma revisão em aberto. Paz na dupla. 💚" : f === "open" ? "Nenhuma conta a pagar." : "Nada por aqui."}</p>`}</section>
    <button class="j-cta primary wide" data-action="bill-new" ${f === "fixed" ? 'data-kind="fixed"' : ""}>${icon("plus")}<span>${f === "fixed" ? "Adicionar conta fixa" : "Adicionar conta"}</span></button>`;
}

// ---------- Análise ----------
function analysisV4() {
  const solo = isSolo();
  const head = pageHead("Minha análise", "Análise", "Feita com a sua renda e o seu jeito de gastar — nada de regra genérica.");
  const tabs = segTabs("analysis", analysisTab, [
    ["summary", "Resumo"],
    ["categories", "Categorias"],
    ["forecast", "Previsão"],
    ["cuts", "Cortes"],
  ]);
  const body =
    analysisTab === "categories" ? categoriesPanel() : analysisTab === "forecast" ? forecastPanel() : analysisTab === "cuts" ? cutsPanel() : summaryPanel();
  return `<div class="j-page">${head}${tabs}${body}</div>`;
}
function summaryPanel() {
  const Bn = brain(),
    solo = isSolo(),
    me = first(user().name);
  if (!Bn.inc)
    return `${setupCard("analysis")}${emptyBox("coins", "Primeiro, a sua renda.", "A análise do Juntô parte de quanto você ganha e quando o dinheiro cai. Cadastre salário, renda semanal ou comissão — dá pra ajustar depois.", `<button class="btn primary" data-action="income-new">Cadastrar renda</button><button class="btn ghost" data-action="route" data-route="incomes">Ver entradas</button>`)}${donutCard()}`;
  const segs = [
    ["Contas fixas", Bn.fixed, "fixed", "Aluguel, contas e assinaturas."],
    ["Essenciais", Bn.essential, "ess", "Mercado, transporte e saúde."],
    ["Escolhas", Bn.choices, "flex", `Delivery, lazer, compras e hábitos. Meta sugerida: ${cashR(Bn.choicesTarget)}.`],
    [Bn.left >= 0 ? "Sobra" : "Falta", Math.abs(Bn.left), Bn.left >= 0 ? "left" : "miss", Bn.saveTarget ? `Dá pra guardar ${cashR(Bn.saveTarget)} por mês.` : "Ainda não sobra pra guardar."],
  ];
  const base = Math.max(Bn.inc, Bn.fixed + Bn.essential + Bn.choices);
  const score = `<section class="j-card j-score-full"><div class="j-score-top">${ring(Bn.score, "lg")}<div><small>Saúde financeira${solo ? "" : ` de ${esc(me)}`}</small><h3>${Bn.scoreLabel}</h3><p>Calculada com a sua renda, suas contas, sua reserva e seu ritmo.</p></div></div><details class="j-more"><summary>Como chegamos nessa nota</summary><ul class="j-score-parts">${Bn.parts
    .map((p) => `<li><span><b>${esc(p.label)}</b><small>${esc(p.note)}</small></span><span class="j-meter"><i style="width:${Math.round((p.pts / p.max) * 100)}%"></i></span><em class="num">${Math.round(p.pts)}/${p.max}</em></li>`)
    .join("")}</ul></details></section>`;
  const split = `<section class="j-card">${sectionTitle("Seu mês, em quatro partes")}<p class="j-muted">Renda média de <b>${cashR(Bn.inc)}</b> por mês${solo ? "" : ` (só a sua)`}. Proporções do seu ritmo real:</p><div class="j-stack" role="img" aria-label="Divisão da renda">${segs
    .map(([, v, k]) => `<i class="${k}" style="flex:${Math.max(0.0001, v / base)}"></i>`)
    .join("")}</div><ul class="j-legend">${segs
    .map(([l, v, k, n]) => `<li><span class="j-dot ${k}"></span><span><b>${esc(l)}</b><small>${esc(n)}</small></span><strong class="num">${cashR(v)}<small>${pct(v / Bn.inc)}</small></strong></li>`)
    .join("")}</ul>${
    Bn.reco && Bn.reco.monthly
      ? `<div class="j-note">${icon("sparkle")}<p>Pra sua renda, o plano <b>${esc(Bn.reco.name)}</b> encaixa: guardar <b>${cashR(Bn.reco.monthly)}/mês</b> (${pct(Bn.reco.monthly / Bn.inc)}) segurando as escolhas em ${cashR(Bn.choicesTarget)}. O essencial não é tocado.</p></div>`
      : ""
  }</section>`;
  const top = Bn.insights.slice(0, 4),
    more = Bn.insights.slice(4);
  const notes = `<section class="j-block">${sectionTitle("O Juntô notou")}<div class="j-insights">${top.map(insightCard).join("")}</div>${more.length ? `<details class="j-more j-more-list"><summary>Ver mais ${plural(more.length, "leitura", "leituras")}</summary><div class="j-insights">${more.map(insightCard).join("")}</div></details>` : ""}</section>`;
  return `${setupCard("analysis")}${score}${notes}${split}${incomeCard()}${donutCard()}${monthByMonth()}${
    solo || analysisPerson !== "both" ? "" : `<section class="j-block">${sectionTitle("Cada um")}<div class="person-grid">${personCard("a")}${personCard("b")}</div></section>`
  }${setupDone() ? `<button class="j-card j-setup-redo" data-action="setup-open"><span>✦</span><span><b>Refazer meu raio-x</b><small>Mudou salário, conta ou rotina? Atualiza em 2 minutos.</small></span><span class="j-chev" aria-hidden="true">›</span></button>` : ""}`;
}
function incomeCard() {
  const fs = withFinanceView("personal", () => financeState()),
    mine = state.incomes.filter((i) => isSolo() || i.person === active),
    inc = withFinanceView("personal", avgIncome),
    variable = mine.filter((i) => i.variable).length,
    weekly = mine.filter((i) => i.rule === "weekly").length,
    pend = pendingArrivals(45, cloudSlot || undefined).filter((x) => isSolo() || x.inc.person === active);
  const kind = !mine.length ? "" : variable ? "Renda variável — o Juntô usa uma faixa conservadora." : weekly ? "Renda com parte semanal — o mês muda conforme o número de semanas." : "Renda fixa — previsão mais firme.";
  return `<section class="j-card">${sectionTitle("Sua renda", `<button class="j-link" data-action="route" data-route="incomes">Gerenciar ›</button>`)}<div class="j-income-top"><strong class="num">${cashR(inc)}</strong><small>por mês, em média${fs.incomes.length ? "" : ""}</small></div>${kind ? `<p class="j-muted">${kind}</p>` : ""}<div class="j-list">${mine
    .map((i) => row({ icon: i.rule === "weekly" ? "repeat" : "coins", tone: "green", title: i.name, sub: esc(ruleText(i)), amount: cashR(i.amount), action: !cloudSlot || i.person === active ? "income-edit" : "income-detail", id: i.id }))
    .join("")}</div>${pend.length ? `<button class="j-banner green" data-action="income-arrived" data-id="${pend[0].inc.id}" data-date="${pend[0].date}">${icon("bell")}<span><b>Confirmar ${esc(pend[0].inc.name)}</b><small>Previsto ${dateText(pend[0].date)}</small></span><em>Confirmar</em></button>` : ""}<button class="j-cta small" data-action="income-new">${icon("plus")}<span>Adicionar entrada</span></button></section>`;
}
function donutCard() {
  const solo = isSolo(),
    perspective = solo ? "a" : (analysisPerson || active),
    ym = dateISO().slice(0, 7);
  const tx = state.transactions
    .filter((t) => t.date.slice(0, 7) === ym && !t.billId)
    .map((t) => ({ ...t, v: perspective === "both" ? t.amount : shareOf(t, perspective) }))
    .filter((t) => t.v > 0);
  if (!tx.length) return "";
  const total = tx.reduce((s, t) => s + t.v, 0),
    groups = {};
  tx.forEach((t) => (groups[t.category] = (groups[t.category] || 0) + t.v));
  const cats = Object.entries(groups).sort((a, b) => b[1] - a[1]),
    top = cats.slice(0, 4),
    rest = cats.slice(4).reduce((s, x) => s + x[1], 0),
    colors = ["#d8b15f", "#e9a9bc", "#8fbde4", "#9ccfb6", "#c9ced6"],
    rows = rest ? [...top, ["Outras", rest]] : top;
  let cur = 0;
  const stops = rows.map(([, v], i) => {
    const a = cur;
    cur += (v / total) * 100;
    return `${colors[i]} ${a.toFixed(2)}% ${cur.toFixed(2)}%`;
  });
  const people = solo
    ? ""
    : `<div class="j-mini-seg">${[[active, "Meu"], ["both", "Ver todos"]]
        .map(([v, l]) => `<button data-action="analysis-person" data-person="${v}" class="${perspective === v ? "active" : ""}" aria-pressed="${perspective === v}">${esc(l)}</button>`)
        .join("")}</div>`;
  return `<section class="j-card">${sectionTitle(`Pra onde foi em ${monthName(new Date())}`)}${people}<div class="j-donut-wrap"><div class="j-donut" style="background:conic-gradient(${stops.join(",")})"><div><b class="num">${cashR(total)}</b><small>dia a dia</small></div></div><ul class="j-legend compact">${rows
    .map(([c, v], i) => `<li><span class="j-dot" style="background:${colors[i]}"></span><span><b>${esc(c)}</b></span><strong class="num">${cashR(v)}<small>${pct(v / total)}</small></strong></li>`)
    .join("")}</ul></div></section>`;
}
function monthByMonth() {
  const L = monthLedger();
  if (L.length < 2) return "";
  const sel = pickedMonth && L.find((m) => m.ym === pickedMonth) ? pickedMonth : L.find((m) => m.kind === "current").ym;
  return `<section class="j-card hist-panel">${sectionTitle("Mês a mês")}<p class="j-muted">Toque num mês pra ver o que mais pesou.</p><div class="chart-wrap light">${historyChart(L, chartWidth(56), sel)}</div><div class="legend"><span class="lg fx">Contas fixas</span><span class="lg vr">Dia a dia</span><span class="lg ic">Entradas</span><span class="lg ft">Previsão</span></div>${monthDetail(L, sel, false)}</section>`;
}
function categoriesPanel() {
  const B = budgets(),
    F = fixedReading();
  return `<section class="j-block">${sectionTitle("Limite de cada gasto")}<p class="j-muted">Metas sugeridas pelo seu histórico e pelo plano. Arraste pra ajustar — vale só pro seu perfil.</p>${B.length ? `<div class="cat-list">${B.map(catCard).join("")}</div>` : emptyBox("pie", "Sem gastos suficientes ainda.", "Registre alguns dias de gastos e as metas aparecem aqui.")}</section>
  <section class="j-block">${sectionTitle("Contas fixas, uma por uma")}<p class="j-muted">${F.housing ? `Moradia leva ${pct(F.housingPct)} da sua renda. ${F.housingPct > 0.3 ? "Está acima da referência de 30%." : "Dentro da referência de até 30%."}` : "Peso de cada conta e onde ainda dá pra negociar."}</p><div class="fixed-list">${F.rows.map(fixedCard).join("") || emptyBox("wallet", "Nenhuma conta fixa.", "Cadastre aluguel, luz, internet…")}</div></section>`;
}
function forecastPanel() {
  if (!financeState().incomes.length) return emptyBox("trend", "Sem renda, sem previsão.", "Conta pro Juntô quando o dinheiro cai e a previsão do mês nasce daí.", `<button class="btn primary" data-action="income-new">Cadastrar renda</button>`);
  const M = model(),
    dE = daysUntil(endOfMonthISO()),
    pts = simulate({ days: Math.max(45, dE + 10) }),
    eomV = pts[dE] ? pts[dE].free : free(),
    capV = dailyCap(),
    events = upcomingEvents(21).slice(0, 6),
    p = state.settings.personalBudget?.[active] || {},
    showBudget = p.fare > 0 || p.debtPrincipal > 0 || state.incomes.some((i) => i.person === active && ["food", "transport"].includes(i.purpose));
  return `<section class="j-card future-v3-card"><span class="j-eyebrow">No fim de ${monthName(new Date())}</span><strong class="j-big num ${eomV < 0 ? "neg" : ""}">${signed(eomV)}</strong><p class="j-muted">Estimativa fora dos planos. Confiança ${M.confidence} · ${M.coverage} dias de histórico. Pagamentos avulsos não se repetem; renda variável é estimada.</p><div class="future-v3-chart">${monthChart(pts, chartWidth(56), dE)}</div><div class="j-note">${icon("sparkle")}<p>Ritmo seguro hoje: <b>${cashR(capV)}/dia</b>. Seu ritmo atual: ${cashR(M.daily)}/dia.</p></div></section>
  <section class="j-card">${sectionTitle("Próximas 3 semanas")}${events.length ? `<div class="j-list">${events.map(eventRow).join("")}</div>` : `<p class="j-muted">Nada previsto.</p>`}</section>
  <section class="j-block">${sectionTitle("Calendário do mês")}${calendarView()}</section>
  <section class="j-block">${sectionTitle("E se…?")}<p class="j-muted">Teste um corte no dia a dia ou uma renda extra. Nada muda de verdade até você decidir.</p><div class="panel sim"><div class="sim-controls"><label class="range"><span>Cortar do gasto do dia a dia <b id="sim-cut-out">${simCut}%</b></span><input type="range" id="sim-cut" min="0" max="40" step="5" value="${simCut}"></label><label class="range"><span>Renda extra por mês <b id="sim-extra-out">${brl(simExtra * 100)}</b></span><input type="range" id="sim-extra" min="0" max="2000" step="50" value="${simExtra}"></label></div><div id="sim-out">${simOut()}</div></div></section>
  ${showBudget ? personalBudgetPanel() : `<button class="j-card j-couple-link" data-action="personal-budget">${icon("bus")}<span><b>Vale, passagem ou dívida?</b><small>Configure e a previsão passa a considerar sua rotina.</small></span><span class="j-chev" aria-hidden="true">›</span></button>`}`;
}
function cutsPanel() {
  const list = tips();
  return `<section class="j-block">${sectionTitle("Dicas só pra você")}<p class="j-muted">Calculadas com os seus gastos e a sua rotina. Alimentação básica, ônibus e saúde ficam protegidos.</p>${
    list.length
      ? `<div class="tip-list">${list
          .map(
            (t) =>
              `<article class="tip"><span class="tip-icon">${icon(t.icon)}</span><div><h3>${esc(t.title)}</h3><p>${t.body}</p></div>${t.impact > 0 ? `<span class="tip-impact num">+${cash(t.impact)}<small>${esc(t.periodLabel || "/mês")}</small></span>` : `<button class="btn secondary" data-action="${t.action}" data-id="${esc(t.id)}">${t.action === "personal-budget" ? "Configurar" : "Revisar gasto"}</button>`}</article>`,
          )
          .join("")}</div>`
      : emptyBox("sparkle", "Nenhuma oportunidade confirmada ainda.", "Continue registrando e marcando o contexto dos gastos. O Juntô não chama gasto necessário de desperdício.")
  }</section>${cutBlock()}`;
}

// ---------- Dupla ----------
function coupleView() {
  const tabs = segTabs("couple", coupleTab, [
    ["requests", pending().length ? `Combinados · ${pending().length}` : "Combinados"],
    ["activity", "Atividade"],
  ]);
  const head = pageHead("Nossa dupla", "Dupla", "Pedidos, respostas e quem fez o quê.", `<button class="j-icon-btn" data-action="ask" aria-label="Novo pedido">${icon("plus")}</button>`);
  if (coupleTab === "activity")
    return `<div class="j-page">${head}${tabs}<section class="j-card activity-v3">${state.activity.length ? activityRows(state.activity) : emptyBox("activity", "Nada ainda.", "O primeiro passo da dupla aparece aqui.")}</section></div>`;
  const list = state.requests.filter(
    (r) =>
      requestFilter === "all" ||
      (requestFilter === "pending" && r.status === "pending") ||
      (requestFilter === "mine" && r.author === active) ||
      (requestFilter === "received" && r.recipient === active),
  );
  return `<div class="j-page">${head}${tabs}<section class="j-card j-month-stats three"><div><small>Em conversa</small><b>${pending().length}</b></div><div><small>Reservado</small><b class="num">${cashR(approvedTotal())}</b></div><div><small>Livre agora</small><b class="num">${cashR(free())}</b></div></section>${chips("request-filter", requestFilter, [
    ["all", "Todos"],
    ["pending", "Pendentes", pending().length],
    ["received", "Pra mim", incoming().length],
    ["mine", "Eu pedi"],
  ])}${list.length ? list.slice().reverse().map(requestCard).join("") : emptyBox("chat", "Nenhum pedido por aqui.", "Do cafezinho ao sonho grande: bora conversar?", `<button class="btn primary" data-action="ask">Amor, posso gastar?</button>`)}<p class="j-muted">Ao combinar, o valor fica reservado. Ao marcar “já comprei”, ele sai do saldo e entra nos gastos.</p></div>`;
}

// ---------- Chat: o parça das finanças ----------
const pick = (list) => list[Math.floor(Math.random() * list.length)];
function chatWelcome() {
  const me = first(user().name), h = new Date().getHours(), f = free(), cap = dailyCap();
  const hi = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  if (!avgIncome())
    return `${hi}, ${me}! 👋 Sou o Juntô, seu parça das finanças.\nAinda não sei quanto entra por mês, então minhas contas ficam pela metade. Cadastra sua renda em **Análise › Renda** e eu passo a falar com os seus números de verdade.\nEnquanto isso, manda um “gastei pizza 45” que eu anoto.`;
  const mood = f < 0
    ? `O mês tá apertado: faltam **${cash(-f)}** depois das contas e dos planos. Bora achar de onde tirar? 💪`
    : `Hoje você tem **${cash(f)} livres** e dá pra gastar **${cashR(cap)} por dia** sem apertar o mês.`;
  const joke = pick([
    "Prometo não julgar o terceiro delivery da semana. 😅",
    "Pode perguntar à vontade, eu não cobro consulta.",
    "Calculadora na mão e zero sermão.",
    "Fala comigo do seu jeito, sem formulário.",
  ]);
  return `${hi}, ${me}! 👋 ${mood}\n${f < 0 ? "" : joke + "\n"}Manda um gasto (“pizza 45”), pergunta se cabe (“posso gastar 80?”) ou pede uma ideia de corte.`;
}
function chatThinking() {
  return pick(["Fazendo as contas…", "Conferindo os boletos…", "Abrindo a planilha mental…", "Consultando o cofrinho…", "Olhando seu extrato…"]);
}
function chatChips() {
  const asked = new Set(chatLog.filter((m) => m.kind === "user").map((m) => norm(m.text)));
  const ym = dateISO().slice(0, 7), sums = {};
  state.transactions.filter((t) => !t.billId && t.date.slice(0, 7) === ym && !isEssentialCat(t.category)).forEach((t) => (sums[t.category] = (sums[t.category] || 0) + shareOf(t, active)));
  const top = Object.entries(sums).sort((a, b) => b[1] - a[1])[0]?.[0], g = state.goals.find((x) => goalOwner(x) === active && x.saved < x.target);
  const list = [
    ["💸", "Quanto posso gastar hoje?"],
    ["📅", state.incomes.length ? "Como fecha o mês?" : "O que preciso configurar pra prever o mês?"],
    ["✂️", top ? `E se eu cortar ${top.toLowerCase()}?` : "Onde o dinheiro escapa?"],
    ["🎯", g ? `Quando chego em ${g.name}?` : "Quanto consigo guardar por mês?"],
    ["🧾", "Quais contas estão em aberto?"],
    ...(isSolo() ? [] : [["👀", "Quem está gastando mais?"]]),
  ].filter(([, q]) => !asked.has(norm(q))).slice(0, 4);
  return `<button class="chip-btn" data-action="chat-fill" data-q="gastei ">📝 Registrar gasto</button>` +
    list.map(([e, q]) => `<button class="chip-btn" data-action="chat-ask" data-q="${esc(q)}">${e} ${esc(q)}</button>`).join("");
}
// Quando a nuvem falha, responde com a conta local (números reais do aparelho) — nunca inventa.
function localFallback(q) {
  let a = "";
  try { a = localAnswer(q); } catch { return; }
  if (!a || /^Não peguei essa/.test(a) || /^Posso ajudar com os números/.test(a)) return;
  const m = addBot(`Enquanto isso, fiz a conta aqui no aparelho mesmo:\n${a}`);
  m.fallback = true;
  saveChat();
}

// ---------- Interações próprias da nova navegação ----------
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || !appAccess) return;
  const action = el.dataset.action;
  if (action==='chat-fill') {
    const inp = document.getElementById("chat-input");
    if (inp) { inp.value = el.dataset.q || ""; inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    return;
  }
  if (action==='go') {
    route = el.dataset.route;
    const kind = el.dataset.kind,
      v = el.dataset.value;
    if (kind === "analysis") analysisTab = v;
    if (kind === "ledger") ledgerTab = v;
    if (kind === "plan") planTab = v;
    if (kind === "couple") coupleTab = v;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (action==='ledger-month') {
    ledgerMonth = Math.min(0, Math.max(-12, ledgerMonth + Number(el.dataset.delta || 0)));
    render();
    return;
  }
  if (action==='ledger-filter') {
    ledgerFilter = el.dataset.value;
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    return;
  }
  if (action==='ledger-mine') {
    ledgerMine = !ledgerMine;
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    return;
  }
  if (action==='home-scope') { homeEveryone = !homeEveryone; render(); return; }
  if (action==='goal-scope') { goalScope = el.dataset.value; render(); return; }
  if (action==='ledger-income') ledgerIncomeModal();
});
document.addEventListener("change", (event) => {
  if (event.target.id !== "receipt-income") return;
  const inc = state.incomes.find((i) => i.id === event.target.value && i.person === active);
  const expected = document.getElementById("receipt-expected-field");
  if (expected) expected.hidden = !inc;
  if (!inc) return;
  document.getElementById("receipt-name").value = inc.name;
  document.getElementById("receipt-amount").value = moneyNumber(inc.amount);
  const date = dateISO();
  document.getElementById("receipt-expected-date").value = occurrences(inc, date.slice(0, 7) + "-01", date).filter((d) => !handled(inc.id, d)).at(-1) || date;
});
// Busca do extrato filtra na tela, sem perder o foco do campo.
document.addEventListener("input", (event) => {
  if (event.target.id !== "ledger-search") return;
  const q = norm(event.target.value || "").trim();
  let any = false;
  document.querySelectorAll("#ledger-days [data-day]").forEach((day) => {
    let shown = 0;
    day.querySelectorAll(".j-row").forEach((r) => {
      const ok = !q || norm(r.dataset.q || r.textContent).includes(q) || norm(r.textContent).includes(q);
      r.hidden = !ok;
      if (ok) shown++;
    });
    day.hidden = !shown;
    if (shown) any = true;
  });
  const empty = document.getElementById("ledger-search-empty");
  if (empty) empty.hidden = any || !q;
});
