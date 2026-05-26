import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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
  updateDoc
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

const ADMIN_PASSWORD = "2468";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  currentUser: null,
  confirmationResult: null,
  recaptchaVerifier: null,
  profile: null,
  alunos: [],
  pending: [],
  approved: [],
  role: "guest"
};

const el = {
  home: document.getElementById("homeSection"),
  login: document.getElementById("loginSection"),
  create: document.getElementById("createSection"),
  aluno: document.getElementById("alunoSection"),
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
  approvedList: document.getElementById("approvedList")
};

function show(section) {
  el.home.classList.toggle("hidden", section !== "home");
  el.login.classList.toggle("hidden", section !== "login");
  el.create.classList.toggle("hidden", section !== "create");
  el.aluno.classList.toggle("hidden", section !== "aluno");
  el.admin.classList.toggle("hidden", section !== "admin");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function ensureRecaptcha() {
  if (state.recaptchaVerifier) return;
  state.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal"
  });
  await state.recaptchaVerifier.render();
}

function renderProfilePreview(profile) {
  if (!profile) {
    el.profilePreview.textContent = "Ainda não salvo.";
    return;
  }
  el.profilePreview.innerHTML = `
    <div class="space-y-2">
      <div><b>Nome:</b> ${escapeHtml(profile.nome || "-")}</div>
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(profile.status || "-")}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>
  `;
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
      <div><b>Telefone:</b> ${escapeHtml(profile.telefone || "-")}</div>
      <div><b>Faixa:</b> ${escapeHtml(profile.faixa || "-")}</div>
      <div><b>Status:</b> ${escapeHtml(profile.status || "pendente")}</div>
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>
  `;
  el.studentStatus.textContent = profile.status || "pendente";
  el.studentFaixa.textContent = profile.faixa || "-";
  el.studentPresencas.textContent = String(profile.presencas || 0);
}

function renderAdminLists() {
  el.pendingList.innerHTML = state.pending.length ? "" : '<div class="text-zinc-400">Nenhum cadastro pendente.</div>';
  el.approvedList.innerHTML = state.approved.length ? "" : '<div class="text-zinc-400">Nenhum aluno aprovado.</div>';

  state.pending.forEach((p) => {
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    card.innerHTML = `
      <div class="font-bold text-yellow-400">${escapeHtml(p.nome || "Sem nome")}</div>
      <div class="text-zinc-300 text-sm">Telefone: ${escapeHtml(p.telefone || "-")}</div>
      <div class="text-zinc-300 text-sm">Faixa: ${escapeHtml(p.faixa || "-")}</div>
      <div class="text-zinc-300 text-sm">Estado: ${escapeHtml(p.status || "pendente")}</div>
      <button data-approve="${p.uid}" class="mt-3 w-full bg-emerald-700 hover:bg-emerald-600 px-4 py-3 rounded-xl font-semibold">Aprovar aluno</button>
    `;
    el.pendingList.appendChild(card);
  });

  state.approved.forEach((a) => {
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    card.innerHTML = `
      <div class="font-bold text-emerald-400">${escapeHtml(a.nome || "Sem nome")}</div>
      <div class="text-zinc-300 text-sm">Telefone: ${escapeHtml(a.telefone || "-")}</div>
      <div class="text-zinc-300 text-sm">Faixa: ${escapeHtml(a.faixa || "-")}</div>
      <div class="text-zinc-300 text-sm">Presenças: ${Number(a.presencas || 0)}</div>
      <button data-revoke="${a.uid}" class="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 px-4 py-3 rounded-xl font-semibold">Voltar para pendente</button>
    `;
    el.approvedList.appendChild(card);
  });
}

function updateStats() {
  el.statAlunos.textContent = state.approved.length;
  el.statPendentes.textContent = state.pending.length;
  el.statPresencas.textContent = state.approved.reduce((acc, a) => acc + Number(a.presencas || 0), 0);
}

async function loadProfile(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    state.profile = { uid: user.uid, ...snap.data() };
  } else {
    state.profile = null;
  }
  renderProfilePreview(state.profile);
  renderStudentArea(state.profile);
}

async function signInPhone() {
  const phone = document.getElementById("phone").value.trim();
  if (!phone) return alert("Digite o telefone com DDI. Ex.: +5513999999999");
  await ensureRecaptcha();
  state.confirmationResult = await signInWithPhoneNumber(auth, phone, state.recaptchaVerifier);
  alert("Código enviado.");
}

async function confirmPhone() {
  const code = document.getElementById("smsCode").value.trim();
  if (!state.confirmationResult) return alert("Envie o código primeiro.");
  await state.confirmationResult.confirm(code);
  alert("Login realizado.");
}

async function savePublicProfile() {
  if (!state.currentUser) return alert("Faça login primeiro.");
  const profile = {
    uid: state.currentUser.uid,
    nome: document.getElementById("nomeAluno").value.trim(),
    telefone: document.getElementById("telefoneAluno").value.trim(),
    faixa: document.getElementById("faixaAluno").value.trim(),
    foto: document.getElementById("fotoAluno").value.trim(),
    observacao: document.getElementById("observacaoAluno").value.trim(),
    status: "pendente",
    role: "aluno",
    presencas: 0,
    updatedAt: serverTimestamp()
  };

  if (!profile.nome) return alert("Digite seu nome.");

  await setDoc(doc(db, "users", state.currentUser.uid), profile, { merge: true });
  state.profile = { ...state.profile, ...profile };
  renderProfilePreview(state.profile);
  renderStudentArea(state.profile);
  alert("Cadastro salvo. Agora aguarde a aprovação do admin.");
  show("aluno");
}

async function approveUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "aprovado", role: "aluno" });
}

async function revokeUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "pendente", role: "aluno" });
}

function bindButtons() {
  document.getElementById("sendCodeBtn").addEventListener("click", async () => {
    try { await signInPhone(); } catch (error) { alert("Erro ao enviar código: " + (error?.message || error)); }
  });

  document.getElementById("verifyCodeBtn").addEventListener("click", async () => {
    try { await confirmPhone(); } catch (error) { alert("Erro ao confirmar código: " + (error?.message || error)); }
  });

  document.getElementById("savePublicProfileBtn").addEventListener("click", async () => {
    try { await savePublicProfile(); } catch (error) { alert("Erro ao salvar cadastro: " + (error?.message || error)); }
  });

  document.getElementById("goCadastroAfterLogin").addEventListener("click", () => show("create"));

  document.getElementById("btnHome").addEventListener("click", () => show("home"));
  document.getElementById("btnLogin").addEventListener("click", () => show("login"));
  document.getElementById("btnCriarConta").addEventListener("click", () => show("create"));
  document.getElementById("btnAluno").addEventListener("click", () => {
    if (!state.currentUser) return alert("Faça login primeiro.");
    show("aluno");
  });
  document.getElementById("btnAdmin").addEventListener("click", () => {
    if (!state.currentUser) return alert("Faça login primeiro.");
    if (state.role !== "admin") return alert("Digite a senha do admin na tela de login para liberar.");
    show("admin");
  });

  document.getElementById("quickLogin").addEventListener("click", () => show("login"));
  document.getElementById("quickCriar").addEventListener("click", () => show("create"));
  document.getElementById("quickAluno").addEventListener("click", () => show("aluno"));
  document.getElementById("quickAdmin").addEventListener("click", () => show("admin"));

  document.getElementById("backFromCreate").addEventListener("click", () => show("home"));
  document.getElementById("backFromAluno").addEventListener("click", () => show("home"));
  document.getElementById("backFromAdmin").addEventListener("click", () => show("home"));

  document.getElementById("unlockAdminBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPass").value.trim();
    if (pass !== ADMIN_PASSWORD) return alert("Senha do admin incorreta.");
    state.role = "admin";
    alert("Admin liberado.");
    show("admin");
  });

  el.pendingList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-approve]");
    if (!btn) return;
    try { await approveUser(btn.dataset.approve); } catch (error) { alert("Erro ao aprovar: " + (error?.message || error)); }
  });

  el.approvedList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-revoke]");
    if (!btn) return;
    try { await revokeUser(btn.dataset.revoke); } catch (error) { alert("Erro ao voltar para pendente: " + (error?.message || error)); }
  });
}

async function watchUsers() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderAdminLists();

    if (state.currentUser) {
      const mine = all.find(u => u.uid === state.currentUser.uid);
      state.profile = mine || state.profile;
      renderProfilePreview(state.profile);
      renderStudentArea(state.profile);
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user || null;
  el.authStatus.textContent = user ? `Logado: ${user.phoneNumber || user.uid}` : "Desconectado";
  if (user) {
    await loadProfile(user);
    show("aluno");
  } else {
    state.profile = null;
    renderProfilePreview(null);
    renderStudentArea(null);
    show("home");
  }
});

(async function init() {
  try {
    state.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal"
    });
    await state.recaptchaVerifier.render();
  } catch {}
  bindButtons();
  watchUsers();
  try {
    const snap = await getDocs(collection(db, "users"));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderAdminLists();
  } catch {
    el.statBanco.textContent = "Erro";
  }
  el.statBanco.textContent = "Conectado";
})();
