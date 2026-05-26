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
  profile: null,
  approved: [],
  pending: [],
  role: "guest"
};

const el = {
  home: document.getElementById("homeSection"),
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
  el.create.classList.toggle("hidden", section !== "create");
  el.aluno.classList.toggle("hidden", section !== "aluno");
  el.admin.classList.toggle("hidden", section !== "admin");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(v) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function renderProfilePreview(profile) {
  if (!profile) { el.profilePreview.textContent = "Ainda não salvo."; return; }
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
      <div><b>Observação:</b> ${escapeHtml(profile.observacao || "-")}</div>
    </div>`;
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
      <div class="text-zinc-300 text-sm">E-mail: ${escapeHtml(p.email || "-")}</div>
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
      <div class="text-zinc-300 text-sm">E-mail: ${escapeHtml(a.email || "-")}</div>
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
    state.role = state.profile.role || "aluno";
  } else {
    state.profile = null;
    state.role = "aluno";
  }
  if (localStorage.getItem("adminUnlocked") === "1") state.role = "admin";
  renderProfilePreview(state.profile);
  renderStudentArea(state.profile);
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

async function savePublicProfile() {
  if (!state.currentUser) return alert("Faça login primeiro.");
  const nome = document.getElementById("nomeAluno").value.trim();
  const telefone = document.getElementById("telefoneAluno").value.trim();
  const faixa = document.getElementById("faixaAluno").value.trim();
  const foto = document.getElementById("fotoAluno").value.trim();
  const observacao = document.getElementById("observacaoAluno").value.trim();
  if (!nome) return alert("Digite seu nome.");

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
  alert("Cadastro salvo. Aguarde aprovação do admin.");
  show("aluno");
}

async function approveUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "aprovado", role: "aluno" });
}

async function revokeUser(uid) {
  await updateDoc(doc(db, "users", uid), { status: "pendente", role: "aluno" });
}

function bindButtons() {
  document.getElementById("btnHome").addEventListener("click", () => show("home"));
  document.getElementById("btnAluno").addEventListener("click", () => {
    if (!state.currentUser) return alert("Faça login primeiro.");
    show("aluno");
  });
  document.getElementById("btnAdmin").addEventListener("click", () => {
    if (!state.currentUser) return show("home");
    show("home");
    document.getElementById("adminPass").focus();
  });
  document.getElementById("btnCreateAccount").addEventListener("click", createAccount);
  document.getElementById("btnLoginEmail").addEventListener("click", loginEmail);
  document.getElementById("btnLogout").addEventListener("click", async () => {
    localStorage.removeItem("adminUnlocked");
    await signOut(auth);
    state.role = "guest";
  });
  document.getElementById("unlockAdminBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPass").value.trim();
    if (pass !== ADMIN_PASSWORD) return alert("Senha do admin incorreta.");
    localStorage.setItem("adminUnlocked", "1");
    state.role = "admin";
    alert("Admin liberado.");
    show("admin");
  });
  document.getElementById("backFromCreate").addEventListener("click", () => show("home"));
  document.getElementById("backFromAluno").addEventListener("click", () => show("home"));
  document.getElementById("backFromAdmin").addEventListener("click", () => show("home"));
  document.getElementById("savePublicProfileBtn").addEventListener("click", savePublicProfile);

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

function watchUsers() {
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
    el.statBanco.textContent = "Conectado";
  });
}

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user || null;
  el.authStatus.textContent = user ? `Logado: ${user.email}` : "Desconectado";

  if (!user) {
    state.profile = null;
    renderProfilePreview(null);
    renderStudentArea(null);
    show("home");
    return;
  }

  await loadProfile(user);
  if (localStorage.getItem("adminUnlocked") === "1") {
    state.role = "admin";
    show("admin");
  } else {
    show("aluno");
  }
});

(function init() {
  bindButtons();
  watchUsers();
  getDocs(collection(db, "users")).then((snap) => {
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.approved = all.filter(u => u.status === "aprovado");
    state.pending = all.filter(u => u.status !== "aprovado");
    updateStats();
    renderAdminLists();
    el.statBanco.textContent = "Conectado";
  }).catch(() => {
    el.statBanco.textContent = "Erro";
  });
})();
