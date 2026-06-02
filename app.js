import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAGU9FTOelHYghBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d",
  measurementId: "G-FK9V2VBDG2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const scheduleOptions = [
  "Segunda - 15:00 às 16:00",
  "Segunda - 16:30 às 17:30",
  "Segunda - 18:00 às 19:00",
  "Terça - 10:00 às 11:00",
  "Terça - 20:30 às 21:30",
  "Quarta - 15:00 às 16:00",
  "Quarta - 16:30 às 17:30",
  "Quarta - Tai Chi 18:00 às 19:00",
  "Quarta - 19:30 às 20:30",
  "Quarta - Boxe Chinês 21:00 às 22:00",
  "Quinta - 10:00 às 11:00",
  "Quinta - 20:30 às 21:30",
  "Sexta - 15:00 às 16:00",
  "Sexta - 16:30 às 17:30",
  "Sexta - Tai Chi 18:00 às 19:00",
  "Sexta - 19:30 às 20:30",
  "Sexta - Boxe Chinês 21:00 às 22:00",
  "Sábado - 11:15 às 12:15"
];

const FINANCE_PLANS = [
  { key: "plan-1", label: "1 aula por semana", base: 60, category: "mensalidade" },
  { key: "plan-2", label: "2 aulas por semana", base: 96, category: "mensalidade" },
  { key: "plan-3", label: "3 aulas por semana", base: 115, category: "mensalidade" },
  { key: "plan-4", label: "4 aulas por semana", base: 135, category: "mensalidade" },
  { key: "aula-avulsa", label: "Aula avulsa", base: 15, category: "avulsa" },
  { key: "totalpass", label: "TotalPass", base: 0, category: "totalpass" }
];

const PRESENCE_TYPES = ["Treino normal", "Aula avulsa", "TotalPass"];

const state = {
  currentUser: null,
  profile: null,
  role: "guest",
  approved: [],
  pending: [],
  presences: [],
  mensalidades: [],
  avisos: [],
  cardUid: null,
  qrScanner: null,
  qrStarted: false
};

function canAccessApp() {
  return !!state.currentUser;
}

function canAccessAdmin() {
  return !!state.currentUser && state.profile?.role === "admin";
}

let overviewChartInstance = null;
let financeChartInstance = null;

const el = {
  home: document.getElementById("homeSection"),
  login: document.getElementById("loginSection"),
  create: document.getElementById("createSection"),
  schedule: document.getElementById("scheduleSection"),
  aluno: document.getElementById("alunoSection"),
  card: document.getElementById("cardSection"),
  admin: document.getElementById("adminSection"),
  authStatus: document.getElementById("authStatus"),
  adminGreetingName: document.getElementById("adminGreetingName"),
  statAlunos: document.getElementById("statAlunos"),
  statPendentes: document.getElementById("statPendentes"),
  statPresencas: document.getElementById("statPresencas"),
  statBanco: document.getElementById("statBanco"),
  profilePreview: document.getElementById("profilePreview"),
  scheduleList: document.getElementById("scheduleList"),
  studentProfile: document.getElementById("studentProfile"),
  studentStatus: document.getElementById("studentStatus"),
  studentFaixa: document.getElementById("studentFaixa"),
  studentPresencas: document.getElementById("studentPresencas"),
  studentPresenceBig: document.getElementById("studentPresenceBig"),
  pendingList: document.getElementById("pendingList"),
  approvedList: document.getElementById("approvedList"),
  presenceAluno: document.getElementById("presenceAluno"),
  presenceAula: document.getElementById("presenceAula"),
  presenceTipo: document.getElementById("presenceTipo"),
  presenceData: document.getElementById("presenceData"),
  presenceList: document.getElementById("presenceList"),
  financeAluno: document.getElementById("financeAluno"),
  financePlano: document.getElementById("financePlano"),
  financeValor: document.getElementById("financeValor"),
  financeGrupoFamilia: document.getElementById("financeGrupoFamilia"),
  financeDescontoPct: document.getElementById("financeDescontoPct"),
  financeVencimento: document.getElementById("financeVencimento"),
  financeStatus: document.getElementById("financeStatus"),
  financeList: document.getElementById("financeList"),
  finPrevisto: document.getElementById("finPrevisto"),
  finPago: document.getElementById("finPago"),
  finAberto: document.getElementById("finAberto"),
  cardSelect: document.getElementById("cardSelect"),
  cardDetails: document.getElementById("cardDetails"),
  appSplash: document.getElementById("appSplash"),
  cardName: document.getElementById("cardName"),
  cardFaixa: document.getElementById("cardFaixa"),
  cardStatus: document.getElementById("cardStatus"),
  cardPresencas: document.getElementById("cardPresencas"),
  cardPhoto: document.getElementById("cardPhoto"),
  cardPhotoFallback: document.getElementById("cardPhotoFallback"),
  cardPhotoThumb: document.getElementById("cardPhotoThumb"),
  cardInitial: document.getElementById("cardInitial"),
  qrcode: document.getElementById("qrcode"),
  qrReader: document.getElementById("qr-reader"),
  qrStatus: document.getElementById("qrStatus"),
  overviewChart: document.getElementById("overviewChart"),
  financeChart: document.getElementById("financeChart"),
  dashAlunos: document.getElementById("dashAlunos"),
  dashPendentes: document.getElementById("dashPendentes"),
  dashPresencas: document.getElementById("dashPresencas"),
  dashArrecadacao: document.getElementById("dashArrecadacao"),
  btnInstall: document.getElementById("btnInstall"),
  homeGreeting: document.getElementById("homeGreeting"),
  homeSubtext: document.getElementById("homeSubtext"),
  homeNextClass: document.getElementById("homeNextClass"),
  homeProfileStatus: document.getElementById("homeProfileStatus"),
  homeMonthlyStatus: document.getElementById("homeMonthlyStatus"),
  homePresenceCount: document.getElementById("homePresenceCount"),
  homeAvisosList: document.getElementById("homeAvisosList"),
  homeAvisosCount: document.getElementById("homeAvisosCount"),
  studentPresenceHistory: document.getElementById("studentPresenceHistory"),
  studentPresenceCount: document.getElementById("studentPresenceCount"),
  cardNextClass: document.getElementById("cardNextClass"),
  cardValidity: document.getElementById("cardValidity"),
  cardValidityText: document.getElementById("cardValidityText"),
  avisoTitulo: document.getElementById("avisoTitulo"),
  avisoMensagem: document.getElementById("avisoMensagem"),
  avisoPrioridade: document.getElementById("avisoPrioridade"),
  saveAvisoBtn: document.getElementById("saveAvisoBtn"),
  avisosList: document.getElementById("avisosList"),
  avisosStatus: document.getElementById("avisosStatus")
};

function createSafeNode() {
  return {
    textContent: "",
    innerHTML: "",
    value: "",
    src: "",
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild() { return null; },
    addEventListener() {},
    querySelector() { return null; },
    getContext() { return null; }
  };
}

for (const key of Object.keys(el)) {
  if (!el[key]) el[key] = createSafeNode();
}

function setText(node, value) {
  if (node) node.textContent = value;
}

function money(value) {
  const n = Number(String(value ?? "0").replace(/[^\d,.-]/g, "").replace(",", "."));
  if (Number.isNaN(n)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


function normalizeStatus(value) {
  const status = String(value ?? "").trim().toLowerCase();
  if (!status) return "pendente";
  if (["aprovado", "aprovada", "ativo", "ativa"].includes(status)) return "aprovado";
  if (["pendente", "aguardando", "em analise", "em análise", "analise", "análise"].includes(status)) return "pendente";
  if (["inativo", "inativa", "bloqueado", "bloqueada", "cancelado", "cancelada"].includes(status)) return "inativo";
  return "pendente";
}

function statusLabel(value) {
  const status = normalizeStatus(value);
  if (status === "aprovado") return "Aprovado";
  if (status === "inativo") return "Inativo";
  return "Pendente";
}

function financeStatusLabel(value) {
  const status = String(value ?? "pendente").trim().toLowerCase();
  if (status === "pago") return "Pago";
  if (status === "atrasado") return "Atrasado";
  return "Pendente";
}

function roundMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function parseMoneyInput(value) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyInputValue(value) {
  return roundMoney(value).toFixed(2).replace('.', ',');
}

function financePlanByKey(key) {
  return FINANCE_PLANS.find((plan) => plan.key === String(key || "").trim()) || null;
}

function financeRecordAmount(record) {
  const raw = record?.valorFinal ?? record?.valor ?? record?.valorBase ?? 0;
  return roundMoney(parseMoneyInput(raw));
}

function financePlanLabel(key) {
  const plan = financePlanByKey(key);
  return plan ? plan.label : "Mensalidade";
}

function financePlanCategory(key) {
  const plan = financePlanByKey(key);
  return plan ? plan.category : "mensalidade";
}

function financePlanBase(key) {
  const plan = financePlanByKey(key);
  return plan ? plan.base : 0;
}

function normalizeAvisoPriority(priority) {
  const value = String(priority || "normal").trim().toLowerCase();
  if (value === "urgente") return "Urgente";
  if (value === "importante") return "Importante";
  return "Normal";
}

function avisoBadgeClass(priority) {
  const value = String(priority || "normal").trim().toLowerCase();
  if (value === "urgente") return "text-red-300 border-red-500/30 bg-red-500/10";
  if (value === "importante") return "text-yellow-300 border-yellow-500/30 bg-yellow-500/10";
  return "text-emerald-300 border-emerald-500/25 bg-emerald-500/10";
}

function toMillisSafe(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") {
    try { return value.toMillis(); } catch (_) { return 0; }
  }
  if (typeof value.seconds === "number") {
    return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
  }
  const date = new Date(value);
  const ms = date.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function formatDateTime(value) {
  const ms = toMillisSafe(value);
  if (!ms) return "Agora";
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}



function updateNativeTabs(section){
  const tabs = {
    home: document.getElementById("mobileHomeBtn"),
    aluno: document.getElementById("mobileAlunoBtn"),
    card: document.getElementById("mobileCardBtn"),
    admin: document.getElementById("mobileAdminBtn"),
  };

  Object.entries(tabs).forEach(([key, btn]) => {
    if(!btn) return;
    btn.classList.toggle("active", key === section);
  });
}

function setActiveNav(section) {
  const map = [
    ["mobileHomeBtn", "home"],
    ["mobileAlunoBtn", "aluno"],
    ["mobileCardBtn", "card"],
    ["mobileAdminBtn", "admin"],
  ];
  map.forEach(([id, key]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const active = key === section || (section === "admin" && key === "admin");
    btn.classList.toggle("bg-red-700", active && key === "home");
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("bg-zinc-900", !active);
    btn.classList.toggle("text-zinc-100", !active);
  });
}

function syncAdminControlsVisibility() {
  const showAdmin = canAccessAdmin();
  const ids = ["mobileAdminBtn", "homeAdminQuick"];
  ids.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle("hidden", !showAdmin);
  });
}

const WEEK_ORDER = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

function normalizeDayLabel(raw) {
  const day = String(raw || "").trim();
  return WEEK_ORDER.find(d => day.toLowerCase().startsWith(d.toLowerCase().slice(0, 3))) || day || "Dia";
}

function getTodayLabel() {
  return WEEK_ORDER[new Date().getDay()];
}

function parseScheduleItem(item) {
  const [dayPart, ...rest] = String(item || "").split(" - ");
  return {
    day: normalizeDayLabel(dayPart),
    time: rest.join(" - ").trim()
  };
}

function findTodayScheduleItems() {
  const today = getTodayLabel();
  return scheduleOptions
    .map(parseScheduleItem)
    .filter(s => s.day === today);
}

function parseScheduleStartMinutes(timeText) {
  const match = String(timeText || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function getNextScheduleItem() {
  const today = getTodayLabel();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const items = scheduleOptions
    .map(parseScheduleItem)
    .filter(s => s.day === today)
    .sort((a, b) => (parseScheduleStartMinutes(a.time) ?? 9999) - (parseScheduleStartMinutes(b.time) ?? 9999));

  return items.find((item) => {
    const start = parseScheduleStartMinutes(item.time);
    return start !== null && start >= currentMinutes;
  }) || items[0] || null;
}

function getProfileMissingFields(profile) {
  const missing = [];
  if (!profile?.nome) missing.push("Nome");
  if (!profile?.telefone) missing.push("Telefone");
  if (!profile?.faixa) missing.push("Faixa");
  if (!profile?.foto) missing.push("Foto");
  return missing;
}

function show(section) {
  if (section === "admin" && !canAccessAdmin()) {
    alert("Área restrita ao administrador. Faça login com a conta autorizada.");
    section = state.currentUser ? "aluno" : "login";
  }
  el.home.classList.toggle("hidden", section !== "home");
  el.login.classList.toggle("hidden", section !== "login");
  el.create.classList.toggle("hidden", section !== "create");
  el.aluno.classList.toggle("hidden", section !== "aluno");
  el.card.classList.toggle("hidden", section !== "card");
  el.admin.classList.toggle("hidden", section !== "admin");
  el.schedule.classList.toggle("hidden", section !== "schedule");
  if (section === "home") renderHomeSummary();
  if (section !== "admin") {
    stopQrScanner();
  }
  setActiveNav(section);
  updateNativeTabs(section === "schedule" ? "aluno" : section);
  window.scrollTo({ top: 0, behavior: "smooth" });
}


function showSplash() {
  if (!el.appSplash) return;
  el.appSplash.classList.remove("hiddenSplash");
}

function hideSplash() {
  if (!el.appSplash) return;
  el.appSplash.classList.add("hiddenSplash");
  setTimeout(() => {
    el.appSplash.style.display = "none";
  }, 500);
}

function setBankStatus(text) {
  if (el.statBanco) el.statBanco.textContent = text;
}

function renderHomeSummary() {
  const name = (state.profile?.nome || "").trim().split(/\s+/)[0] || "Bem-vindo";
  if (el.homeGreeting) {
    el.homeGreeting.textContent = state.profile ? `Olá, ${name}` : "Bem-vindo";
  }
  if (el.homeSubtext) {
    el.homeSubtext.textContent = state.profile
      ? "Seu painel está pronto para presenças, carteirinha, horários, financeiro e avisos."
      : "Entre para ver seu painel personalizado.";
  }
  if (el.homeNextClass) el.homeNextClass.textContent = getNextClassLabel();
  if (el.homeProfileStatus) el.homeProfileStatus.textContent = state.profile ? statusLabel(state.profile.status) : "Faça login";
  if (el.homeMonthlyStatus) el.homeMonthlyStatus.textContent = state.profile ? getStudentMonthlyStatus(state.profile) : "Sem cadastro";
  if (el.homePresenceCount) el.homePresenceCount.textContent = String(state.profile?.presencas || 0);
}

function updateStats() {
  const totalAlunos = state.approved.length + state.pending.length;
  const pendentes = state.pending.length;
  const presencas = state.presences.length;
  const arrecadacao = state.mensalidades.reduce((sum, f) => sum + financeRecordAmount(f), 0);
  const pago = state.mensalidades.reduce((sum, f) => sum + (String(f.status || "pendente").trim().toLowerCase() === "pago" ? financeRecordAmount(f) : 0), 0);

  setText(el.statAlunos, String(totalAlunos));
  setText(el.statPendentes, String(pendentes));
  setText(el.statPresencas, String(presencas));
  setText(el.dashAlunos, String(totalAlunos));
  setText(el.dashPendentes, String(pendentes));
  setText(el.dashPresencas, String(presencas));
  setText(el.dashArrecadacao, money(arrecadacao));

  setText(el.finPrevisto, state.mensalidades.length ? money(arrecadacao) : "Sem lançamentos");
  setText(el.finPago, money(pago));
  setText(el.finAberto, money(Math.max(arrecadacao - pago, 0)));

  renderCharts();
  renderHomeSummary();
}

function renderCharts() {
  if (!window.Chart) return;

  const overviewCanvas = el.overviewChart;
  if (overviewCanvas) {
    const ctx = overviewCanvas.getContext("2d");
    if (ctx) {
      const labels = ["Aprovados", "Pendentes", "Presenças"];
      const values = [state.approved.length, state.pending.length, state.presences.length];
      if (overviewChartInstance) overviewChartInstance.destroy();
      overviewChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Resumo",
            data: values,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    }
  }

  const financeCanvas = el.financeChart;
  if (financeCanvas) {
    const ctx = financeCanvas.getContext("2d");
    if (ctx) {
      const totalPrevisto = state.mensalidades.reduce((sum, f) => {
        const valor = Number(String(f.valor || "0").replace(/[^\d,.-]/g, "").replace(",", "."));
        return sum + (Number.isNaN(valor) ? 0 : valor);
      }, 0);
      const totalPago = state.mensalidades.reduce((sum, f) => {
        const valor = Number(String(f.valor || "0").replace(/[^\d,.-]/g, "").replace(",", "."));
        return sum + (((f.status || "pendente") === "pago" && !Number.isNaN(valor)) ? valor : 0);
      }, 0);
      const totalAberto = Math.max(totalPrevisto - totalPago, 0);

      if (financeChartInstance) financeChartInstance.destroy();
      financeChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Pago", "Em aberto"],
          datasets: [{
            data: [totalPago, totalAberto],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }
  }
}

function renderScheduleOptions() {
  if (el.presenceAula) el.presenceAula.innerHTML = "";
  scheduleOptions.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    if (el.presenceAula) el.presenceAula.appendChild(opt);
  });
}

function renderPresenceTypeOptions() {
  if (!el.presenceTipo) return;
  const current = el.presenceTipo.value;
  el.presenceTipo.innerHTML = "";
  PRESENCE_TYPES.forEach((type) => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    el.presenceTipo.appendChild(opt);
  });
  if (PRESENCE_TYPES.includes(current)) el.presenceTipo.value = current;
}

function renderFinancePlanOptions() {
  if (!el.financePlano) return;
  const current = el.financePlano.value;
  el.financePlano.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecione o plano";
  el.financePlano.appendChild(placeholder);
  FINANCE_PLANS.forEach((plan) => {
    const opt = document.createElement("option");
    opt.value = plan.key;
    opt.textContent = plan.label;
    el.financePlano.appendChild(opt);
  });
  if (current && FINANCE_PLANS.some((plan) => plan.key === current)) el.financePlano.value = current;
}

function syncFinancePlanFields() {
  const plan = financePlanByKey(el.financePlano?.value);
  if (!plan) return;
  if (el.financeValor) el.financeValor.value = formatMoneyInputValue(plan.base);
  if (el.financeStatus) el.financeStatus.value = plan.key === "totalpass" ? "pago" : "pendente";
  if (el.financeDescontoPct && plan.key === "totalpass") el.financeDescontoPct.value = "0";
}

function renderScheduleList() {
  if (!el.scheduleList) return;
  const today = getTodayLabel();
  const todayItems = findTodayScheduleItems();
  const nextItem = getNextScheduleItem();
  const grouped = WEEK_ORDER.map(day => ({
    day,
    items: scheduleOptions.map(parseScheduleItem).filter(s => s.day === day)
  })).filter(group => group.items.length);

  if (el.scheduleTodayTitle) el.scheduleTodayTitle.textContent = todayItems.length ? `Aulas de ${today}` : "Sem aula hoje";
  if (el.scheduleTodayTime) el.scheduleTodayTime.textContent = todayItems.length
    ? todayItems.map(s => s.time).filter(Boolean).join(" • ")
    : "Nenhuma aula cadastrada para hoje.";
  if (el.scheduleTodayNote) el.scheduleTodayNote.textContent = nextItem
    ? `Próxima aula: ${nextItem.time || "-"}`
    : "Confira os dias com aulas na lista abaixo.";

  el.scheduleList.innerHTML = "";
  const order = [today, ...WEEK_ORDER.filter(d => d !== today)];

  order.forEach((day) => {
    const group = grouped.find(g => g.day === day);
    if (!group) return;

    const isToday = day === today;
    const block = document.createElement("div");
    block.className = isToday
      ? "schedule-pill rounded-[2rem] p-4 border border-red-500/30 bg-red-500/5"
      : "schedule-pill rounded-[2rem] p-4";
    block.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="font-black text-white text-lg">${escapeHtml(day)}</div>
        ${isToday ? '<span class="px-3 py-1 rounded-full text-xs text-red-300 bg-red-500/10 border border-red-500/20">Hoje</span>' : ''}
      </div>
      <div class="space-y-2"></div>
    `;

    const list = block.querySelector(".space-y-2");
    group.items.forEach((s) => {
      const isNext = nextItem && nextItem.day === s.day && nextItem.time === s.time;
      const row = document.createElement("div");
      row.className = isNext
        ? "schedule-row week-chip rounded-2xl p-4 flex items-center justify-between gap-3 border border-emerald-500/30 bg-emerald-500/5"
        : "schedule-row week-chip rounded-2xl p-4 flex items-center justify-between gap-3";
      row.innerHTML = `
        <div>
          <div class="font-semibold text-white">${escapeHtml(day)}</div>
          <div class="text-zinc-400 text-sm">${escapeHtml(s.time || "-")}</div>
        </div>
        <div class="text-red-400 text-2xl">${isNext ? "★" : "›"}</div>
      `;
      list.appendChild(row);
    });

    el.scheduleList.appendChild(block);
  });
}

function fillProfileForm(profile) {
  if (!profile) return;
  const setVal = (id, value) => {
    const elInput = document.getElementById(id);
    if (elInput) elInput.value = value ?? "";
  };
  setVal("nomeAluno", profile.nome || "");
  setVal("telefoneAluno", profile.telefone || "");
  setVal("faixaAluno", profile.faixa || "");
  setVal("fotoAluno", profile.foto || "");
  setVal("observacaoAluno", profile.observacao || "");
}

function renderProfilePreview(profile) {
  if (!profile) {
    el.profilePreview.textContent = "Ainda não salvo.";
    return;
  }
  el.profilePreview.innerHTML = `
    <div class="space-y-2">
      <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
      <div><b>E-mail:</b> ${escapeHtml(profile.email || "-")}</div>
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(statusLabel(profile.status))}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>`;
}



function getStudentMonthlyStatus(profile) {
  if (!profile) return "-";
  const fee = [...state.mensalidades]
    .filter((f) => f.alunoId === profile.uid)
    .sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt))[0];
  if (!fee) return "Sem lançamento";
  const planLabel = financePlanLabel(fee.planoKey || fee.plano);
  if ((fee.tipoCobranca || "").toLowerCase() === "totalpass" || /totalpass/i.test(planLabel)) {
    return `TotalPass • ${fee.status === "pago" ? "Ativo" : "Pendente"}`;
  }
  return `${fee.status === "pago" ? "Em dia" : "Pendente"} • ${money(financeRecordAmount(fee))}`;
}

function getNextClassLabel() {
  const nextItem = getNextScheduleItem();
  if (!nextItem) return "Sem aula agendada";
  return `${nextItem.day} • ${nextItem.time || "-"}`;
}

function renderStudentArea(profile) {
  const missing = getProfileMissingFields(profile);
  if (!profile) {
    el.studentProfile.innerHTML = "Faça login e complete o cadastro.";
    el.studentStatus.textContent = "Pendente";
    el.studentFaixa.textContent = "-";
    el.studentPresencas.textContent = "0";
    if (el.studentNextClass) el.studentNextClass.textContent = "-";
    if (el.studentMonthlyStatus) el.studentMonthlyStatus.textContent = "-";
    if (el.studentCompletionBadge) {
      el.studentCompletionBadge.textContent = "Cadastre-se";
      el.studentCompletionBadge.className = "text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300";
    }
    if (el.studentCompletionState) {
      el.studentCompletionState.textContent = "Pendente";
      el.studentCompletionState.className = "font-semibold text-yellow-300 mt-1";
    }
    if (el.studentMissingList) {
      el.studentMissingList.innerHTML = '<span class="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300">Nome</span><span class="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300">Telefone</span><span class="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300">Faixa</span><span class="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300">Foto</span>';
    }
    if (el.studentPresenceCount) el.studentPresenceCount.textContent = "0 registros";
    if (el.studentPresenceHistory) {
      el.studentPresenceHistory.innerHTML = '<div class="text-zinc-500 text-sm">Sem presença registrada ainda.</div>';
    }
    return;
  }

  el.studentProfile.innerHTML = `
    <div class="space-y-2">
      <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
      <div><b>E-mail:</b> ${escapeHtml(profile.email || "-")}</div>
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(statusLabel(profile.status))}</div>
      <div><b>Presenças:</b> ${Number(profile.presencas || 0)}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>`;
  el.studentStatus.textContent = statusLabel(profile.status);
  el.studentFaixa.textContent = profile.faixa || "-";
  el.studentPresencas.textContent = String(profile.presencas || 0);
  if (el.studentNextClass) el.studentNextClass.textContent = getNextClassLabel();
  if (el.studentMonthlyStatus) el.studentMonthlyStatus.textContent = getStudentMonthlyStatus(profile);

  if (el.studentCompletionBadge) {
    const complete = missing.length === 0;
    el.studentCompletionBadge.textContent = complete ? "Cadastro completo" : `Faltam ${missing.length}`;
    el.studentCompletionBadge.className = complete
      ? "text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
      : "text-xs px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300";
  }
  if (el.studentCompletionState) {
    const complete = missing.length === 0;
    el.studentCompletionState.textContent = complete ? "Completo" : `Faltam ${missing.length}`;
    el.studentCompletionState.className = complete ? "font-semibold text-emerald-300 mt-1" : "font-semibold text-yellow-300 mt-1";
  }

  if (el.studentMissingList) {
    if (!missing.length) {
      el.studentMissingList.innerHTML = '<span class="px-3 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Tudo preenchido</span>';
    } else {
      el.studentMissingList.innerHTML = missing.map(m => `<span class="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-300">${escapeHtml(m)}</span>`).join("");
    }
  }

  if (el.studentPresenceHistory) {
    const history = state.presences.filter(p => p.alunoId === profile.uid).slice(0, 5);
    if (el.studentPresenceCount) {
      el.studentPresenceCount.textContent = history.length ? `${history.length} registros recentes` : "Sem registros ainda";
    }
    if (!history.length) {
      el.studentPresenceHistory.innerHTML = '<div class="text-zinc-500 text-sm">Sem presença registrada ainda.</div>';
    } else {
      el.studentPresenceHistory.innerHTML = history.map((p) => `
        <div class="panel-soft rounded-2xl p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="font-semibold text-white">${escapeHtml(p.aula || "-")}</div>
            <div class="text-red-400 text-xs">✔</div>
          </div>
          <div class="text-zinc-400 text-xs mt-1">${escapeHtml(p.data || "-")} • ${escapeHtml(p.hora || "-")}</div>
        </div>
      `).join("");
    }
  }
}


function cardQrText(profile) {
  return profile ? `${profile.uid}|${profile.nome || ""}|${profile.faixa || ""}|${normalizeStatus(profile.status)}` : "sem-dados";
}


function updateCard(profile) {
  if (!profile) {
    el.cardName.textContent = "-";
    el.cardFaixa.textContent = "-";
    el.cardStatus.textContent = "-";
    el.cardPresencas.textContent = "0";
    if (el.cardNextClass) el.cardNextClass.textContent = "-";
    if (el.cardValidity) el.cardValidity.textContent = "-";
    if (el.cardValidityText) el.cardValidityText.textContent = "Carteirinha digital";
    el.cardPhoto.src = "";
    el.cardPhoto.classList.add("hidden");
    el.cardPhotoFallback.classList.remove("hidden");
    el.cardPhotoThumb.src = "";
    el.cardPhotoThumb.classList.add("hidden");
    el.cardInitial.classList.remove("hidden");
    el.cardInitial.textContent = "G";
    el.qrcode.innerHTML = "";
    el.cardDetails.innerHTML = '<div class="text-zinc-400">Selecione um aluno para ver a carteirinha.</div>';
    return;
  }

  const presencas = Number(profile.presencas || 0);
  el.cardName.textContent = profile.nome || "-";
  el.cardFaixa.textContent = profile.faixa || "-";
  el.cardStatus.textContent = statusLabel(profile.status);
  el.cardPresencas.textContent = String(presencas);
  if (el.cardNextClass) el.cardNextClass.textContent = getNextClassLabel();
  if (el.cardValidity) el.cardValidity.textContent = normalizeStatus(profile.status) === "aprovado" ? "Ativa" : "Pendente";
  if (el.cardValidityText) el.cardValidityText.textContent = normalizeStatus(profile.status) === "aprovado" ? "Carteirinha ativa" : "Carteirinha pendente";

  const photo = profile.foto || "";
  if (photo) {
    el.cardPhoto.src = photo;
    el.cardPhoto.classList.remove("hidden");
    el.cardPhotoFallback.classList.add("hidden");
    el.cardPhotoThumb.src = photo;
    el.cardPhotoThumb.classList.remove("hidden");
    el.cardInitial.classList.add("hidden");
  } else {
    el.cardPhoto.src = "";
    el.cardPhoto.classList.add("hidden");
    el.cardPhotoFallback.classList.remove("hidden");
    el.cardPhotoThumb.src = "";
    el.cardPhotoThumb.classList.add("hidden");
    el.cardInitial.classList.remove("hidden");
    el.cardInitial.textContent = (profile.nome || "G").trim().charAt(0).toUpperCase();
  }

  if (window.QRCode && el.qrcode) {
    el.qrcode.innerHTML = "";
    new QRCode(el.qrcode, {
      text: cardQrText(profile),
      width: 160,
      height: 160,
      colorDark: "#111111",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  el.cardDetails.innerHTML = `
    <div class="space-y-3">
      <div class="panel-soft rounded-2xl p-4 text-center">
        <div class="text-zinc-400 text-sm">Quantidade de presenças</div>
        <div class="text-4xl font-black text-red-400 mt-1">${presencas}</div>
      </div>
      <div class="text-zinc-300">
        <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
        <div><b>Status:</b> ${escapeHtml(statusLabel(profile.status))}</div>
        <div><b>Próxima aula:</b> ${escapeHtml(getNextClassLabel())}</div>
      </div>
    </div>`;
}

function renderPresences() {
  el.presenceList.innerHTML = state.presences.length
    ? ""
    : '<div class="panel-soft rounded-2xl p-4 text-zinc-300">Nenhuma presença registrada ainda. Use o leitor QR ou marque manualmente para começar.</div>';

  state.presences.slice(0, 10).forEach((p) => {
    const aluno = state.approved.find(a => a.uid === p.alunoId) || state.pending.find(a => a.uid === p.alunoId);
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-3 border border-zinc-700 text-sm shadow-sm";
    card.innerHTML = `
      <div class="font-semibold text-emerald-400">${escapeHtml(aluno?.nome || "Aluno removido")}</div>
      <div class="text-zinc-300">Aula: ${escapeHtml(p.aula || "-")}</div>
      <div class="text-zinc-300">Tipo: ${escapeHtml(p.tipo || p.tipoAula || "Treino normal")}</div>
      <div class="text-zinc-300">Data: ${escapeHtml(p.data || "-")}</div>
      <div class="text-zinc-300">Horário: ${escapeHtml(p.hora || "-")}</div>
    `;
    el.presenceList.appendChild(card);
  });
  updateStats();
}

function renderFinance() {
  let totalPrevisto = 0;
  let totalPago = 0;

  el.financeList.innerHTML = state.mensalidades.length
    ? ""
    : '<div class="panel-soft rounded-2xl p-4 text-zinc-300">Nenhuma mensalidade lançada ainda. Use o formulário abaixo para cadastrar uma cobrança.</div>';

  state.mensalidades.forEach((f) => {
    const aluno = state.approved.find(a => a.uid === f.alunoId) || state.pending.find(a => a.uid === f.alunoId);
    const valorBase = financeRecordAmount({ valor: f.valorBase ?? f.valor });
    const valorFinal = financeRecordAmount(f);
    totalPrevisto += valorFinal;
    if (String(f.status || "pendente").trim().toLowerCase() === "pago") totalPago += valorFinal;

    const planLabel = financePlanLabel(f.planoKey || f.plano);
    const paymentKind = (f.tipoCobranca || financePlanCategory(f.planoKey || f.plano)).toLowerCase();
    const discountPct = Number(f.descontoPct || 0);
    const group = String(f.grupoFamilia || "").trim();

    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-3 border border-zinc-700 text-sm shadow-sm";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-semibold text-yellow-400">${escapeHtml(aluno?.nome || "Aluno removido")}</div>
          <div class="text-zinc-300">Plano: ${escapeHtml(planLabel)}</div>
          ${group ? `<div class="text-zinc-300">Grupo familiar: ${escapeHtml(group)}</div>` : ''}
          ${discountPct ? `<div class="text-zinc-300">Desconto familiar: ${escapeHtml(String(discountPct))}%</div>` : ''}
          <div class="text-zinc-300">Valor base: ${money(valorBase)}</div>
          <div class="text-zinc-300">Valor final: ${money(valorFinal)}</div>
          <div class="text-zinc-300">Tipo: ${escapeHtml(paymentKind === "totalpass" ? "TotalPass" : paymentKind === "avulsa" ? "Aula avulsa" : "Mensalidade")}</div>
          <div class="text-zinc-300">Vencimento: ${escapeHtml(f.vencimento || "-")}</div>
          <div class="text-zinc-300">Status: <span class="${String(f.status || "pendente").trim().toLowerCase() === "pago" ? "text-emerald-400" : String(f.status || "pendente").trim().toLowerCase() === "atrasado" ? "text-red-400" : "text-yellow-400"}">${escapeHtml(financeStatusLabel(f.status))}</span></div>
        </div>
        <button data-pay="${f.id}" class="bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded-xl font-semibold text-sm whitespace-nowrap">Marcar pago</button>
      </div>
    `;
    el.financeList.appendChild(card);
  });

  const previstaTexto = state.mensalidades.length ? money(totalPrevisto) : "Sem lançamentos";
  const pagoTexto = state.mensalidades.length ? money(totalPago) : "Sem lançamentos";
  const abertoTexto = state.mensalidades.length ? money(Math.max(totalPrevisto - totalPago, 0)) : "Sem lançamentos";
  setText(el.finPrevisto, previstaTexto);
  setText(el.finPago, pagoTexto);
  setText(el.finAberto, abertoTexto);
  setText(el.dashArrecadacao, state.mensalidades.length ? money(totalPrevisto) : "Sem lançamentos");
  renderCharts();
  renderHomeSummary();
}


async function saveFinance() {
  const alunoId = el.financeAluno.value;
  const plan = financePlanByKey(el.financePlano?.value);
  const vencimento = el.financeVencimento.value;
  let valorBase = parseMoneyInput(el.financeValor.value);
  if ((!valorBase || Number.isNaN(valorBase)) && plan) valorBase = plan.base;

  const descontoPct = Math.max(0, Math.min(100, Number(el.financeDescontoPct?.value || 0) || 0));
  const grupoFamilia = String(el.financeGrupoFamilia?.value || "").trim();
  const tipoCobranca = plan ? plan.category : "mensalidade";
  const isTotalPass = plan?.key === "totalpass";
  if (isTotalPass) valorBase = 0;
  const valorDesconto = roundMoney(valorBase * (descontoPct / 100));
  const valorFinal = roundMoney(Math.max(valorBase - valorDesconto, 0));
  const status = isTotalPass ? "pago" : el.financeStatus.value;

  if (!alunoId || (!plan && !valorBase && valorBase !== 0)) return alert("Selecione o aluno e informe o valor.");

  await addDoc(collection(db, "mensalidades"), {
    alunoId,
    plano: plan?.label || "Mensalidade",
    planoKey: plan?.key || "",
    tipoCobranca,
    grupoFamilia,
    descontoPct,
    valorBase,
    valorDesconto,
    valorFinal,
    valor: valorFinal,
    vencimento,
    status,
    createdAt: serverTimestamp()
  });

  if (el.financeValor) el.financeValor.value = "";
  if (el.financeGrupoFamilia) el.financeGrupoFamilia.value = "";
  if (el.financeDescontoPct) el.financeDescontoPct.value = "0";
  if (el.financeVencimento) el.financeVencimento.value = "";
  if (el.financeStatus) el.financeStatus.value = isTotalPass ? "pago" : "pendente";
  if (el.financePlano) el.financePlano.value = "";
  alert("Mensalidade salva.");
}

async function markPresence() {
  const alunoId = el.presenceAluno.value;
  const aula = el.presenceAula.value;
  const tipo = el.presenceTipo?.value || "Treino normal";
  const data = el.presenceData.value || new Date().toISOString().slice(0, 10);
  if (!alunoId) return alert("Selecione um aluno.");
  const now = new Date();
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  await addDoc(collection(db, "presencas"), { alunoId, aula, tipo, data, hora, createdAt: serverTimestamp() });
  const aluno = state.approved.find(a => a.uid === alunoId);
  if (aluno) await updateDoc(doc(db, "users", alunoId), { presencas: Number(aluno.presencas || 0) + 1 });
  if (el.presenceData) el.presenceData.value = "";
}

function findProfileByUid(uid) {
  return state.approved.find(u => u.uid === uid) || state.pending.find(u => u.uid === uid) || state.profile || null;
}

function updateCardFromSelect() {
  state.cardUid = el.cardSelect.value;
  updateCard(findProfileByUid(state.cardUid));
}

function renderCardSelect() {
  el.cardSelect.innerHTML = "";
  const all = [...state.approved, ...state.pending];
  if (!all.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum aluno cadastrado";
    el.cardSelect.appendChild(opt);
    updateCard(null);
    return;
  }
  all.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.uid;
    opt.textContent = `${u.nome || "Sem nome"} (${statusLabel(u.status)})`;
    el.cardSelect.appendChild(opt);
  });
  if (!state.cardUid || !all.some(u => u.uid === state.cardUid)) state.cardUid = all[0].uid;
  el.cardSelect.value = state.cardUid;
  updateCard(findProfileByUid(state.cardUid));
}

function bindButtons() {
  document.getElementById("btnHome")?.addEventListener("click", () => show("home"));

  document.getElementById("mobileHomeBtn")?.addEventListener("click", () => show("home"));
  document.getElementById("mobileAlunoBtn")?.addEventListener("click", () => { if (!canAccessApp()) return alert("Faça login primeiro."); show("aluno"); });
  document.getElementById("mobileCardBtn")?.addEventListener("click", () => { if (!canAccessApp()) return alert("Faça login primeiro."); show("card"); });
  document.getElementById("mobileAdminBtn")?.addEventListener("click", () => {
    if (!canAccessAdmin()) return alert("Área restrita ao administrador.");
    show("admin");
  });
  document.getElementById("mobileInstallBtn")?.addEventListener("click", () => document.getElementById("btnInstall")?.click());

  document.getElementById("btnAluno").addEventListener("click", () => { if (!canAccessApp()) return alert("Faça login primeiro."); show("aluno"); });
  document.getElementById("btnCard")?.addEventListener("click", () => { if (!canAccessApp()) return alert("Faça login primeiro."); show("card"); });
  document.getElementById("btnAdmin")?.addEventListener("click", () => {
    if (!canAccessAdmin()) return alert("Área restrita ao administrador.");
    show("admin");
  });
  document.getElementById("btnCreateAccount")?.addEventListener("click", createAccount);
  document.getElementById("btnSchedule")?.addEventListener("click", () => show("schedule"));
  document.getElementById("btnLoginEmail")?.addEventListener("click", loginEmail);
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    await signOut(auth);
    state.role = "guest";
  });
  document.getElementById("unlockAdminBtn")?.addEventListener("click", () => {
    alert("O acesso de administrador agora depende da conta autorizada no Firebase.");
  });
  document.getElementById("backFromCreate")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromAluno")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromAdmin")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromCard")?.addEventListener("click", () => show("home"));
  document.getElementById("goCompleteProfileBtn")?.addEventListener("click", () => { fillProfileForm(state.profile || {}); show("create"); });
  document.getElementById("editProfileBtn")?.addEventListener("click", () => { fillProfileForm(state.profile || {}); show("create"); });

  document.getElementById("openScheduleBtn")?.addEventListener("click", () => show("schedule"));
  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    fillProfileForm(state.profile || {});
    show("create");
  });
  document.getElementById("goCompleteProfileBtn")?.addEventListener("click", () => {
    fillProfileForm(state.profile || {});
    show("create");
  });
  document.getElementById("backFromSchedule")?.addEventListener("click", () => show("aluno"));

  document.getElementById("savePublicProfileBtn")?.addEventListener("click", async () => { try { await savePublicProfile(); } catch (error) { alert("Erro ao salvar cadastro: " + (error?.message || error)); } });
  document.getElementById("markPresenceBtn")?.addEventListener("click", async () => { try { await markPresence(); alert("Presença marcada."); } catch (error) { alert("Erro ao marcar presença: " + (error?.message || error)); } });
  document.getElementById("saveAvisoBtn")?.addEventListener("click", async () => { try { await saveAviso(); } catch (error) { alert("Erro ao publicar aviso: " + (error?.message || error)); } });
  document.getElementById("saveFinanceBtn")?.addEventListener("click", async () => { try { await saveFinance(); } catch (error) { alert("Erro ao salvar mensalidade: " + (error?.message || error)); } });
  document.getElementById("deleteAllStudentsBtn")?.addEventListener("click", async () => { try { await deleteAllStudents(); } catch (error) { alert("Erro ao excluir alunos: " + (error?.message || error)); } });
  document.getElementById("cardSelect")?.addEventListener("change", updateCardFromSelect);
  el.financePlano?.addEventListener("change", syncFinancePlanFields);
  el.financePlano?.addEventListener("input", syncFinancePlanFields);
  el.pendingList?.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-approve]");
    if (!btn) return;
    try { await approveUser(btn.dataset.approve); } catch (error) { alert("Erro ao aprovar: " + (error?.message || error)); }
  });
  el.approvedList?.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-revoke]");
    if (!btn) return;
    try { await revokeUser(btn.dataset.revoke); } catch (error) { alert("Erro ao voltar para pendente: " + (error?.message || error)); }
  });
  el.financeList?.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-pay]");
    if (!btn) return;
    try { await updateDoc(doc(db, "mensalidades", btn.dataset.pay), { status: "pago" }); } catch (error) { alert("Erro ao marcar pago: " + (error?.message || error)); }
  });
}

  document.getElementById("startQrBtn")?.addEventListener("click", () => {
    startQrScanner();
  });
  document.getElementById("stopQrBtn")?.addEventListener("click", () => {
    stopQrScanner();
  });

function watchCollections() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderUsersLists();
    renderCardSelect();
    if (state.currentUser) {
      const mine = all.find(u => u.uid === state.currentUser.uid);
      state.profile = mine || state.profile;
      renderProfilePreview(state.profile);
      renderStudentArea(state.profile);
      updateCard(findProfileByUid(state.cardUid || state.currentUser.uid));
    }
    setBankStatus("Conectado");
  }, () => setBankStatus("Offline"));

  onSnapshot(query(collection(db, "presencas"), orderBy("createdAt", "desc")), (snapshot) => {
    state.presences = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderPresences();
    updateStats();
  }, () => {});

  onSnapshot(query(collection(db, "mensalidades"), orderBy("createdAt", "desc")), (snapshot) => {
    state.mensalidades = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFinance();
    updateStats();
  }, () => {});

  onSnapshot(collection(db, "avisos"), (snapshot) => {
    state.avisos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    state.avisos.sort((a, b) => toMillisSafe(b.createdAt) - toMillisSafe(a.createdAt));
    renderAvisos();
    renderHomeSummary();
  }, () => {});
}

function startQrScanner() {
  if (!canAccessAdmin()) return;
  if (state.qrStarted) return;
  if (!window.Html5Qrcode) {
    el.qrStatus.textContent = "Leitor QR não carregou.";
    return;
  }
  state.qrStarted = true;
  el.qrStatus.textContent = "Iniciando câmera...";
  state.qrScanner = new Html5Qrcode("qr-reader");

  Html5Qrcode.getCameras().then((cameras) => {
    if (!cameras || !cameras.length) {
      el.qrStatus.textContent = "Nenhuma câmera encontrada.";
      state.qrStarted = false;
      return;
    }

    const cameraId = cameras[cameras.length - 1].id;
    state.qrScanner.start(
      cameraId,
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        try {
          const uid = String(decodedText).split("|")[0];
          const profile = findProfileByUid(uid);
          if (!profile) {
            el.qrStatus.textContent = "QR não reconhecido.";
            return;
          }
          const today = new Date().toISOString().slice(0, 10);
          const now = new Date();
          const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const aula = el.presenceAula.value || scheduleOptions[0];
          const tipo = el.presenceTipo?.value || "Treino normal";
          await addDoc(collection(db, "presencas"), { alunoId: uid, aula, tipo, data: today, hora, createdAt: serverTimestamp(), origem: "qr" });
          const snap = await getDoc(doc(db, "users", uid));
          const current = snap.exists() ? snap.data() : {};
          await updateDoc(doc(db, "users", uid), { presencas: Number(current.presencas || 0) + 1 });
          el.qrStatus.textContent = `Presença marcada para ${profile.nome || "Aluno"}.`;
        } catch (error) {
          el.qrStatus.textContent = "Falha ao marcar presença.";
          console.error(error);
        }
      }
    ).catch((err) => {
      el.qrStatus.textContent = "Erro ao iniciar câmera.";
      console.error(err);
      state.qrStarted = false;
    });
  }).catch((err) => {
    el.qrStatus.textContent = "Falha ao acessar câmera.";
    console.error(err);
    state.qrStarted = false;
  });
}

function stopQrScanner() {
  if (state.qrScanner && state.qrStarted) {
    state.qrScanner.stop().catch(() => {});
    state.qrStarted = false;
  }
}



// HOTFIX v2.5.1
async function loadUserProfile(user){
  try{
    state.user=user||null;
    renderHomeSummary?.();
    syncAdminControlsVisibility?.();
    return true;
  }catch(e){console.error(e);}
}
async function createAccount(){
  try{
    alert('Cadastro temporariamente em manutenção. Use o formulário de cadastro do aluno.');
  }catch(e){console.error(e);}
}

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user || null;
  el.authStatus.textContent = user ? `Logado: ${user.email}` : "Desconectado";

  syncAdminControlsVisibility();

  if (!user) {
    state.profile = null;
    state.role = "guest";
    renderProfilePreview(null);
    renderStudentArea(null);
    updateCard(null);
    renderHomeSummary();
    show("login");
    hideSplash();
    return;
  }

  await loadUserProfile(user);

  if (canAccessAdmin()) {
    state.role = "admin";
    show("admin");
  } else {
    show("aluno");
  }
  hideSplash();
  syncAdminControlsVisibility();
});

(function init() {
  setActiveNav("home");
  syncAdminControlsVisibility();
  showSplash();
  setTimeout(() => { if (!state.currentUser) show("login"); hideSplash(); }, 2400);
  bindButtons();
  renderScheduleOptions();
  renderPresenceTypeOptions();
  renderFinancePlanOptions();
  renderScheduleList();
  renderHomeSummary();
  watchCollections();

  if (el.btnInstall && "beforeinstallprompt" in window) {
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      el.btnInstall.classList.remove("hidden");
    });
    el.btnInstall.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      el.btnInstall.classList.add("hidden");
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }

  getDocs(collection(db, "users")).then((snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderUsersLists();
    renderCardSelect();
    setBankStatus("Conectado");
  }).catch(() => setBankStatus("Erro"));

  setBankStatus("Conectando...");
})();
