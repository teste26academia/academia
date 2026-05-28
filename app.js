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
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGU9FTOelHYghBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d",
  measurementId: "G-FK9V2VBDG2"
};

const ADMIN_PASSWORD = "2468";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

const state = {
  currentUser: null,
  profile: null,
  role: "guest",
  approved: [],
  pending: [],
  presences: [],
  mensalidades: [],
  cardUid: null,
  qrScanner: null,
  qrStarted: false
};

let overviewChartInstance = null;
let financeChartInstance = null;

const el = {
  home: document.getElementById("homeSection"),
  create: document.getElementById("createSection"),
  aluno: document.getElementById("alunoSection"),
  card: document.getElementById("cardSection"),
  admin: document.getElementById("adminSection"),
  authStatus: document.getElementById("authStatus"),
  statAlunos: document.getElementById("statAlunos"),
  statPendentes: document.getElementById("statPendentes"),
  statPresencas: document.getElementById("statPresencas"),
  statBanco: document.getElementById("statBanco"),
  profilePreview: document.getElementById("profilePreview"),
  studentProfile: document.getElementById("studentProfile"),
  studentStatus: document.getElementById("studentStatus"),
  studentFaixa: document.getElementById("studentFaixa"),
  studentPresencas: document.getElementById("studentPresencas"),
  pendingList: document.getElementById("pendingList"),
  approvedList: document.getElementById("approvedList"),
  presenceAluno: document.getElementById("presenceAluno"),
  presenceAula: document.getElementById("presenceAula"),
  presenceData: document.getElementById("presenceData"),
  presenceList: document.getElementById("presenceList"),
  financeAluno: document.getElementById("financeAluno"),
  financeValor: document.getElementById("financeValor"),
  financeVencimento: document.getElementById("financeVencimento"),
  financeStatus: document.getElementById("financeStatus"),
  financeList: document.getElementById("financeList"),
  finPrevisto: document.getElementById("finPrevisto"),
  finPago: document.getElementById("finPago"),
  finAberto: document.getElementById("finAberto"),
  cardSelect: document.getElementById("cardSelect"),
  cardDetails: document.getElementById("cardDetails"),
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
  searchAluno: document.getElementById("searchAluno"),
  filterStatus: document.getElementById("filterStatus"),
  filterRole: document.getElementById("filterRole"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  backupStatus: document.getElementById("backupStatus"),
  permissionUser: document.getElementById("permissionUser"),
  permissionRole: document.getElementById("permissionRole"),
  savePermissionBtn: document.getElementById("savePermissionBtn"),
  permissionStatus: document.getElementById("permissionStatus"),
  btnInstall: document.getElementById("btnInstall")
};

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

function show(section) {
  el.home.classList.toggle("hidden", section !== "home");
  el.create.classList.toggle("hidden", section !== "create");
  el.aluno.classList.toggle("hidden", section !== "aluno");
  el.card.classList.toggle("hidden", section !== "card");
  el.admin.classList.toggle("hidden", section !== "admin");
  if (section === "admin") {
    setTimeout(startQrScanner, 300);
  } else {
    stopQrScanner();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setBankStatus(text) {
  if (el.statBanco) el.statBanco.textContent = text;
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
      <div><b>Status:</b> ${escapeHtml(profile.status || "-")}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>`;
}

function renderStudentArea(profile) {
  if (!profile) {
    el.studentProfile.innerHTML = "Faça login e complete o cadastro.";
    el.studentStatus.textContent = "Pendente";
    el.studentFaixa.textContent = "-";
    el.studentPresencas.textContent = "0";
    return;
  }
  el.studentProfile.innerHTML = `
    <div class="space-y-2">
      <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
      <div><b>E-mail:</b> ${escapeHtml(profile.email || "-")}</div>
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(profile.status || "pendente")}</div>
      <div><b>Presenças:</b> ${Number(profile.presencas || 0)}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>`;
  el.studentStatus.textContent = profile.status || "pendente";
  el.studentFaixa.textContent = profile.faixa || "-";
  el.studentPresencas.textContent = String(profile.presencas || 0);
}

function cardQrText(profile) {
  return profile ? `${profile.uid}|${profile.nome || ""}|${profile.faixa || ""}|${profile.status || ""}` : "sem-dados";
}

function updateCard(profile) {
  if (!profile) {
    el.cardName.textContent = "-";
    el.cardFaixa.textContent = "-";
    el.cardStatus.textContent = "-";
    el.cardPresencas.textContent = "0";
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

  el.cardName.textContent = profile.nome || "-";
  el.cardFaixa.textContent = profile.faixa || "-";
  el.cardStatus.textContent = profile.status || "pendente";
  el.cardPresencas.textContent = String(profile.presencas || 0);

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
    <div class="space-y-2">
      <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
      <div><b>E-mail:</b> ${escapeHtml(profile.email || "-")}</div>
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(profile.status || "pendente")}</div>
      <div><b>Presenças:</b> ${Number(profile.presencas || 0)}</div>
    </div>
  `;
}

function updateStats() {
  const arrecadacao = state.mensalidades
    .filter(m => String(m.status || "pendente") === "pago")
    .reduce((acc, m) => acc + Number(String(m.valor || "0").replace(",", ".")), 0);

  el.statAlunos.textContent = state.approved.length;
  el.statPendentes.textContent = state.pending.length;
  el.statPresencas.textContent = state.approved.reduce((acc, aluno) => acc + Number(aluno.presencas || 0), 0);
  el.dashAlunos.textContent = state.approved.length;
  el.dashPendentes.textContent = state.pending.length;
  el.dashPresencas.textContent = state.approved.reduce((acc, aluno) => acc + Number(aluno.presencas || 0), 0);
  el.dashArrecadacao.textContent = money(arrecadacao);
  renderCharts();
}

function renderCharts() {
  if (!window.Chart || !el.overviewChart || !el.financeChart) return;

  const approved = state.approved.length;
  const pending = state.pending.length;
  const presences = state.approved.reduce((acc, aluno) => acc + Number(aluno.presencas || 0), 0);
  const paid = state.mensalidades
    .filter(m => String(m.status || "pendente") === "pago")
    .reduce((acc, m) => acc + Number(String(m.valor || "0").replace(",", ".")), 0);
  const open = state.mensalidades
    .filter(m => String(m.status || "pendente") !== "pago")
    .reduce((acc, m) => acc + Number(String(m.valor || "0").replace(",", ".")), 0);

  const rootStyle = getComputedStyle(document.documentElement);
  const red = rootStyle.getPropertyValue("--tw-color-red-500") || "#ef4444";
  const green = "#10b981";
  const yellow = "#eab308";
  const purple = "#8b5cf6";
  const gray = "#6b7280";

  if (overviewChartInstance) overviewChartInstance.destroy();
  if (financeChartInstance) financeChartInstance.destroy();

  overviewChartInstance = new Chart(el.overviewChart, {
    type: "doughnut",
    data: {
      labels: ["Aprovados", "Pendentes", "Presenças"],
      datasets: [{
        data: [approved, pending, presences],
        backgroundColor: [red, yellow, green],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e5e7eb" } }
      },
      cutout: "66%"
    }
  });

  financeChartInstance = new Chart(el.financeChart, {
    type: "bar",
    data: {
      labels: ["Pago", "Em aberto"],
      datasets: [{
        label: "Mensalidades",
        data: [paid, open],
        backgroundColor: [green, purple],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,.06)" } },
        y: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,.06)" } }
      },
      plugins: {
        legend: { labels: { color: "#e5e7eb" } }
      }
    }
  });
}

function renderUsersLists() {
  const pendingFiltered = getFilteredPending();
  const approvedFiltered = getFilteredApproved();

  el.pendingList.innerHTML = pendingFiltered.length ? "" : '<div class="text-zinc-400">Nenhum cadastro pendente.</div>';
  el.approvedList.innerHTML = approvedFiltered.length ? "" : '<div class="text-zinc-400">Nenhum aluno aprovado.</div>';

  pendingFiltered.forEach((u) => {
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    card.innerHTML = `
      <div class="font-bold text-yellow-400">${escapeHtml(u.nome || "Sem nome")}</div>
      <div class="text-xs text-zinc-400 uppercase tracking-[0.2em] mt-1">${escapeHtml(u.role || "aluno")}</div>
      <div class="text-zinc-300 text-sm">E-mail: ${escapeHtml(u.email || "-")}</div>
      <div class="text-zinc-300 text-sm">Telefone: ${escapeHtml(u.telefone || "-")}</div>
      <div class="text-zinc-300 text-sm">Faixa: ${escapeHtml(u.faixa || "-")}</div>
      <button data-approve="${u.uid}" class="mt-3 w-full bg-emerald-700 hover:bg-emerald-600 px-4 py-3 rounded-xl font-semibold">Aprovar aluno</button>
    `;
    el.pendingList.appendChild(card);
  });

  approvedFiltered.forEach((u) => {
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    card.innerHTML = `
      <div class="font-bold text-emerald-400">${escapeHtml(u.nome || "Sem nome")}</div>
      <div class="text-xs text-zinc-400 uppercase tracking-[0.2em] mt-1">${escapeHtml(u.role || "aluno")}</div>
      <div class="text-zinc-300 text-sm">E-mail: ${escapeHtml(u.email || "-")}</div>
      <div class="text-zinc-300 text-sm">Telefone: ${escapeHtml(u.telefone || "-")}</div>
      <div class="text-zinc-300 text-sm">Faixa: ${escapeHtml(u.faixa || "-")}</div>
      <div class="text-zinc-300 text-sm">Presenças: ${Number(u.presencas || 0)}</div>
      <button data-revoke="${u.uid}" class="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 px-4 py-3 rounded-xl font-semibold">Voltar para pendente</button>
    `;
    el.approvedList.appendChild(card);
  });

  if (el.presenceAluno) el.presenceAluno.innerHTML = "";
  if (el.financeAluno) el.financeAluno.innerHTML = "";
  approvedFiltered.forEach((u) => {
    const o1 = document.createElement("option");
    o1.value = u.uid;
    o1.textContent = u.nome || "Sem nome";
    el.presenceAluno.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = u.uid;
    o2.textContent = u.nome || "Sem nome";
    el.financeAluno.appendChild(o2);
  });

  renderPresences();
  renderFinance();
  renderFiltersAndPermissions();
}

function renderPresences() {
  el.presenceList.innerHTML = state.presences.length ? "" : '<div class="text-zinc-400">Nenhuma presença registrada.</div>';

  state.presences.slice(0, 10).forEach((p) => {
    const aluno = state.approved.find(a => a.uid === p.alunoId) || state.pending.find(a => a.uid === p.alunoId);
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-3 border border-zinc-700 text-sm";
    card.innerHTML = `
      <div class="font-semibold text-emerald-400">${escapeHtml(aluno?.nome || "Aluno removido")}</div>
      <div class="text-zinc-300">Aula: ${escapeHtml(p.aula || "-")}</div>
      <div class="text-zinc-300">Data: ${escapeHtml(p.data || "-")}</div>
      <div class="text-zinc-300">Horário: ${escapeHtml(p.hora || "-")}</div>
    `;
    el.presenceList.appendChild(card);
  });
}

function renderFinance() {
  let totalPrevisto = 0;
  let totalPago = 0;

  el.financeList.innerHTML = state.mensalidades.length ? "" : '<div class="text-zinc-400">Nenhuma mensalidade lançada.</div>';

  state.mensalidades.forEach((f) => {
    const aluno = state.approved.find(a => a.uid === f.alunoId) || state.pending.find(a => a.uid === f.alunoId);
    const valor = Number(String(f.valor || "0").replace(",", "."));
    totalPrevisto += valor;
    if ((f.status || "pendente") === "pago") totalPago += valor;

    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-3 border border-zinc-700 text-sm";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-semibold text-purple-400">${escapeHtml(aluno?.nome || "Aluno removido")}</div>
          <div class="text-zinc-300">Valor: ${money(f.valor)}</div>
          <div class="text-zinc-300">Vencimento: ${escapeHtml(f.vencimento || "-")}</div>
          <div class="text-zinc-300">Status: <span class="${(f.status || "pendente") === "pago" ? "text-emerald-400" : "text-yellow-400"}">${escapeHtml(f.status || "pendente")}</span></div>
        </div>
        <button data-pay="${f.id}" class="bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-xl font-semibold text-sm">Marcar pago</button>
      </div>
    `;
    el.financeList.appendChild(card);
  });

  el.finPrevisto.textContent = money(totalPrevisto);
  el.finPago.textContent = money(totalPago);
  el.finAberto.textContent = money(totalPrevisto - totalPago);
  renderCharts();
}



async function savePermission() {
  const uid = el.permissionUser?.value;
  const role = el.permissionRole?.value || "aluno";
  if (!uid) {
    alert("Selecione um usuário.");
    return;
  }
  await updateDoc(doc(db, "users", uid), { role });
  if (el.permissionStatus) el.permissionStatus.textContent = "Permissão salva com sucesso.";
}

async function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    users: state.approved.concat(state.pending),
    presences: state.presences,
    mensalidades: state.mensalidades
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-garra-aguia-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  if (el.backupStatus) el.backupStatus.textContent = "Backup exportado com sucesso.";
}

async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data || !Array.isArray(data.users)) {
    throw new Error("Arquivo inválido.");
  }

  // Replace collections locally by writing docs again.
  // Note: this restore rewrites user docs by UID and imports presences/mensalidades as new docs.
  for (const u of data.users) {
    if (!u.uid) continue;
    await setDoc(doc(db, "users", u.uid), u, { merge: true });
  }
  for (const p of (data.presences || [])) {
    await addDoc(collection(db, "presencas"), { ...p, restoredAt: serverTimestamp() });
  }
  for (const m of (data.mensalidades || [])) {
    await addDoc(collection(db, "mensalidades"), { ...m, restoredAt: serverTimestamp() });
  }

  if (el.backupStatus) el.backupStatus.textContent = "Backup restaurado com sucesso.";
}

function applyFilters(list) {
  const q = (el.searchAluno?.value || "").trim().toLowerCase();
  const status = el.filterStatus?.value || "todos";
  const role = el.filterRole?.value || "todos";

  return list.filter((u) => {
    const matchesQ = !q || [u.nome, u.email, u.telefone, u.faixa].some(v => String(v || "").toLowerCase().includes(q));
    const matchesStatus = status === "todos" || String(u.status || "pendente") === status;
    const matchesRole = role === "todos" || String(u.role || "aluno") === role;
    return matchesQ && matchesStatus && matchesRole;
  });
}

function renderPermissionOptions() {
  if (!el.permissionUser) return;
  const all = [...state.approved, ...state.pending];
  el.permissionUser.innerHTML = "";
  if (!all.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum aluno";
    el.permissionUser.appendChild(opt);
    return;
  }
  all.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.uid;
    opt.textContent = `${u.nome || "Sem nome"} (${u.role || "aluno"})`;
    el.permissionUser.appendChild(opt);
  });
}

function renderFiltersAndPermissions() {
  renderPermissionOptions();
}

function getFilteredApproved() {
  return applyFilters(state.approved);
}
function getFilteredPending() {
  return applyFilters(state.pending);
}

async function loadUserProfile(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    state.profile = { uid: user.uid, ...snap.data() };
    state.role = state.profile.role || "aluno";
  } else {
    state.profile = null;
    state.role = "aluno";
  }
  if (localStorage.getItem("adminUnlocked") === "1") state.role = "admin";
  renderProfilePreview(state.profile);
  renderStudentArea(state.profile);
  updateCard(state.profile);
  renderFiltersAndPermissions();
}

async function createAccount() {
  const email = document.getElementById("emailCreate").value.trim();
  const password = document.getElementById("passCreate").value.trim();
  if (!email || !password) return alert("Preencha e-mail e senha.");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      nome: "",
      telefone: "",
      faixa: "",
      foto: "",
      observacao: "",
      status: "pendente",
      role: "aluno",
      presencas: 0,
      createdAt: serverTimestamp()
    }, { merge: true });
    alert("Conta criada. Agora complete o cadastro.");
    show("create");
  } catch (error) {
    alert("Erro ao criar conta: " + (error?.message || error));
  }
}

async function loginEmail() {
  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passLogin").value.trim();
  if (!email || !password) return alert("Preencha e-mail e senha.");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login realizado.");
  } catch (error) {
    alert("Erro ao entrar: " + (error?.message || error));
  }
}

async function uploadPhotoIfAny(uid) {
  const file = document.getElementById("fotoFile").files?.[0];
  if (!file) return document.getElementById("fotoAluno").value.trim();
  const fileRef = ref(storage, `users/${uid}/profile-${Date.now()}.jpg`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  document.getElementById("fotoAluno").value = url;
  return url;
}

async function savePublicProfile() {
  if (!state.currentUser) return alert("Faça login primeiro.");
  const nome = document.getElementById("nomeAluno").value.trim();
  const telefone = document.getElementById("telefoneAluno").value.trim();
  const faixa = document.getElementById("faixaAluno").value.trim();
  const observacao = document.getElementById("observacaoAluno").value.trim();
  if (!nome) return alert("Digite seu nome.");

  let foto = document.getElementById("fotoAluno").value.trim();
  try {
    foto = await uploadPhotoIfAny(state.currentUser.uid);
  } catch (error) {
    alert("Falha ao enviar foto: " + (error?.message || error));
    return;
  }

  const profile = {
    uid: state.currentUser.uid,
    email: state.currentUser.email || "",
    nome,
    telefone,
    faixa,
    foto,
    observacao,
    status: "pendente",
    role: "aluno",
    presencas: state.profile?.presencas || 0,
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", state.currentUser.uid), profile, { merge: true });
  state.profile = { ...state.profile, ...profile };
  renderProfilePreview(state.profile);
  renderStudentArea(state.profile);
  updateCard(state.profile);
  renderFiltersAndPermissions();
  alert("Cadastro salvo. Aguarde aprovação do admin.");
  show("aluno");
}

async function approveUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "aprovado", role: "aluno" });
}

async function revokeUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "pendente", role: "aluno" });
}

async function markPresence() {
  const alunoId = el.presenceAluno.value;
  const aula = el.presenceAula.value;
  const data = el.presenceData.value || new Date().toISOString().slice(0, 10);
  if (!alunoId) return alert("Selecione um aluno.");
  const now = new Date();
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  await addDoc(collection(db, "presencas"), { alunoId, aula, data, hora, createdAt: serverTimestamp() });
  const aluno = state.approved.find(a => a.uid === alunoId);
  if (aluno) await updateDoc(doc(db, "users", alunoId), { presencas: Number(aluno.presencas || 0) + 1 });
  el.presenceData.value = "";
}

async function saveFinance() {
  const alunoId = el.financeAluno.value;
  const valor = el.financeValor.value.trim();
  const vencimento = el.financeVencimento.value;
  const status = el.financeStatus.value;
  if (!alunoId || !valor) return alert("Selecione o aluno e informe o valor.");
  await addDoc(collection(db, "mensalidades"), { alunoId, valor, vencimento, status, createdAt: serverTimestamp() });
  el.financeValor.value = "";
  el.financeVencimento.value = "";
  el.financeStatus.value = "pendente";
  alert("Mensalidade salva.");
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
    opt.textContent = `${u.nome || "Sem nome"} (${u.status || "pendente"})`;
    el.cardSelect.appendChild(opt);
  });
  if (!state.cardUid || !all.some(u => u.uid === state.cardUid)) state.cardUid = all[0].uid;
  el.cardSelect.value = state.cardUid;
  updateCard(findProfileByUid(state.cardUid));
}

function bindButtons() {
  document.getElementById("btnHome")?.addEventListener("click", () => show("home"));
  document.getElementById("btnAluno").addEventListener("click", () => { if (!state.currentUser) return alert("Faça login primeiro."); show("aluno"); });
  document.getElementById("btnCard")?.addEventListener("click", () => { if (!state.currentUser) return alert("Faça login primeiro."); show("card"); });
  document.getElementById("btnAdmin")?.addEventListener("click", () => { show("home"); document.getElementById("adminPass")?.focus(); });
  document.getElementById("btnCreateAccount")?.addEventListener("click", createAccount);
  document.getElementById("btnLoginEmail")?.addEventListener("click", loginEmail);
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    localStorage.removeItem("adminUnlocked");
    await signOut(auth);
    state.role = "guest";
  });
  document.getElementById("unlockAdminBtn")?.addEventListener("click", () => {
    const pass = document.getElementById("adminPass").value.trim();
    if (pass !== ADMIN_PASSWORD) return alert("Senha do admin incorreta.");
    localStorage.setItem("adminUnlocked", "1");
    state.role = "admin";
    alert("Admin liberado.");
    show("admin");
  });
  document.getElementById("backFromCreate")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromAluno")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromAdmin")?.addEventListener("click", () => show("home"));
  document.getElementById("backFromCard")?.addEventListener("click", () => show("home"));
  document.getElementById("savePublicProfileBtn")?.addEventListener("click", async () => { try { await savePublicProfile(); } catch (error) { alert("Erro ao salvar cadastro: " + (error?.message || error)); } });
  document.getElementById("markPresenceBtn")?.addEventListener("click", async () => { try { await markPresence(); alert("Presença marcada."); } catch (error) { alert("Erro ao marcar presença: " + (error?.message || error)); } });
  document.getElementById("saveFinanceBtn")?.addEventListener("click", async () => { try { await saveFinance(); } catch (error) { alert("Erro ao salvar mensalidade: " + (error?.message || error)); } });
  document.getElementById("cardSelect")?.addEventListener("change", updateCardFromSelect);

  el.searchAluno?.addEventListener("input", () => renderUsersLists());
  el.filterStatus?.addEventListener("change", () => renderUsersLists());
  el.filterRole?.addEventListener("change", () => renderUsersLists());
  el.exportBackupBtn?.addEventListener("click", async () => {
    try { await exportBackup(); } catch (e) { alert("Erro ao exportar backup."); console.error(e); }
  });
  el.importBackupInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      alert("Backup restaurado.");
    } catch (e) {
      alert("Erro ao restaurar backup.");
      console.error(e);
    } finally {
      event.target.value = "";
    }
  });
  el.savePermissionBtn?.addEventListener("click", async () => {
    try { await savePermission(); renderUsersLists(); renderFiltersAndPermissions(); } catch (e) { alert("Erro ao salvar permissão."); console.error(e); }
  });

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

function watchCollections() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderUsersLists();
    renderFiltersAndPermissions();
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
  }, () => {});

  onSnapshot(query(collection(db, "mensalidades"), orderBy("createdAt", "desc")), (snapshot) => {
    state.mensalidades = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFinance();
  }, () => {});
}

function startQrScanner() {
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
          await addDoc(collection(db, "presencas"), { alunoId: uid, aula, data: today, hora, createdAt: serverTimestamp(), origem: "qr" });
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

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user || null;
  el.authStatus.textContent = user ? `Logado: ${user.email}` : "Desconectado";

  if (!user) {
    state.profile = null;
    state.role = "guest";
    renderProfilePreview(null);
    renderStudentArea(null);
    updateCard(null);
    show("home");
    return;
  }

  await loadUserProfile(user);

  if (localStorage.getItem("adminUnlocked") === "1") {
    state.role = "admin";
    show("admin");
  } else {
    show("aluno");
  }
});

(function init() {
  bindButtons();
  renderScheduleOptions();
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
    renderFiltersAndPermissions();
    renderCardSelect();
    setBankStatus("Conectado");
  }).catch(() => setBankStatus("Erro"));

  setBankStatus("Conectando...");
})();
