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
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGU9FTOeLYhgBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d"
};

const ADMIN_PASSWORD = "2468";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  alunos: [],
  confirmationResult: null,
  selectedId: null,
  loggedIn: false,
  adminUnlocked: false
};

const els = {
  home: document.getElementById("homeSection"),
  login: document.getElementById("loginSection"),
  admin: document.getElementById("adminSection"),
  aluno: document.getElementById("alunoSection"),
  statAlunos: document.getElementById("statAlunos"),
  statMensalidades: document.getElementById("statMensalidades"),
  statPresencas: document.getElementById("statPresencas"),
  statBanco: document.getElementById("statBanco"),
  authStatus: document.getElementById("authStatus"),
  listaAlunos: document.getElementById("listaAlunos"),
  studentSelect: document.getElementById("studentSelect"),
  selectedStudentCard: document.getElementById("selectedStudentCard"),
  alunoPresenca: document.getElementById("alunoPresenca"),
  alunoMensalidade: document.getElementById("alunoMensalidade"),
  alunoFaixa: document.getElementById("alunoFaixa")
};

function showPanel(panel) {
  els.home.classList.toggle("hidden", panel !== "home");
  els.login.classList.toggle("hidden", panel !== "login");
  els.admin.classList.toggle("hidden", panel !== "admin");
  els.aluno.classList.toggle("hidden", panel !== "aluno");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthStatus(text) {
  els.authStatus.textContent = text;
}

function formatCurrency(value) {
  const num = Number(String(value || "").replace(/[^\d,.-]/g, "").replace(",", "."));
  if (Number.isNaN(num)) return value || "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function setupRecaptcha() {
  if (window.recaptchaVerifier) return;
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal"
  });
  await window.recaptchaVerifier.render();
}

async function sendCode() {
  try {
    const phone = document.getElementById("phone").value.trim();
    if (!phone) return alert("Digite o telefone.");

    await setupRecaptcha();
    state.confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    alert("Código enviado por SMS.");
  } catch (e) {
    console.error(e);
    alert("Erro ao enviar o código. Verifique o domínio autorizado no Firebase Authentication.");
  }
}

async function verifyCode() {
  try {
    const code = document.getElementById("smsCode").value.trim();
    if (!state.confirmationResult) return alert("Envie o código primeiro.");
    await state.confirmationResult.confirm(code);
    alert("Login realizado.");
  } catch (e) {
    console.error(e);
    alert("Código inválido ou expirado.");
  }
}

function unlockAdmin() {
  const input = document.getElementById("adminPass").value.trim();
  if (input !== ADMIN_PASSWORD) {
    alert("Senha do admin incorreta.");
    return;
  }
  state.adminUnlocked = true;
  localStorage.setItem("adminUnlocked", "1");
  alert("Painel administrativo desbloqueado.");
  showPanel("admin");
}

function renderStudentArea() {
  const aluno = state.alunos.find(a => a.id === state.selectedId) || state.alunos[0];
  if (!aluno) {
    els.selectedStudentCard.innerHTML = '<div class="text-zinc-400">Nenhum aluno cadastrado.</div>';
    els.alunoPresenca.textContent = "0 aulas este mês";
    els.alunoMensalidade.textContent = "-";
    els.alunoFaixa.textContent = "-";
    return;
  }

  els.selectedStudentCard.innerHTML = `
    <div class="flex items-start gap-4">
      ${aluno.foto ? `<img src="${aluno.foto}" class="w-20 h-20 rounded-2xl object-cover border border-zinc-700" alt="Foto">` : `<div class="w-20 h-20 rounded-2xl bg-zinc-700"></div>`}
      <div class="min-w-0">
        <h3 class="text-xl font-bold text-red-400">${escapeHtml(aluno.nome || "-")}</h3>
        <p class="text-zinc-300 text-sm">Faixa: ${escapeHtml(aluno.faixa || "-")}</p>
        <p class="text-zinc-400 text-sm">Telefone: ${escapeHtml(aluno.telefone || "-")}</p>
        <p class="text-zinc-400 text-sm">Mensalidade: ${escapeHtml(aluno.mensalidade || "-")}</p>
        <p class="text-zinc-400 text-sm">Presenças: ${Number(aluno.presencas || 0)}</p>
      </div>
    </div>
  `;

  els.alunoPresenca.textContent = `${Number(aluno.presencas || 0)} aulas este mês`;
  els.alunoMensalidade.textContent = aluno.mensalidade ? `Status: ${aluno.mensalidade}` : "-";
  els.alunoFaixa.textContent = aluno.faixa || "-";
}

function render() {
  els.statAlunos.textContent = state.alunos.length;
  els.statPresencas.textContent = state.alunos.reduce((acc, a) => acc + Number(a.presencas || 0), 0);
  const mensalidades = state.alunos.reduce((acc, a) => acc + (parseFloat(String(a.mensalidade || "0").replace(",", ".")) || 0), 0);
  els.statMensalidades.textContent = formatCurrency(mensalidades);

  els.listaAlunos.innerHTML = state.alunos.length ? "" : '<div class="text-zinc-400">Nenhum aluno cadastrado ainda.</div>';
  state.alunos.forEach(aluno => {
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700 space-y-3";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="font-bold text-red-400 text-lg truncate">${escapeHtml(aluno.nome || "-")}</h3>
          <p class="text-zinc-300 text-sm">Faixa: ${escapeHtml(aluno.faixa || "-")}</p>
          <p class="text-zinc-400 text-sm">Mensalidade: ${escapeHtml(aluno.mensalidade || "-")}</p>
          <p class="text-zinc-400 text-sm">Telefone: ${escapeHtml(aluno.telefone || "-")}</p>
          <p class="text-zinc-400 text-sm">Presenças: ${Number(aluno.presencas || 0)}</p>
        </div>
        ${aluno.foto ? `<img src="${aluno.foto}" alt="Foto" class="w-16 h-16 rounded-xl object-cover border border-zinc-600">` : ""}
      </div>
      <div class="flex gap-2 flex-wrap">
        <button data-action="presence" data-id="${aluno.id}" class="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-xl">+ Presença</button>
        <button data-action="delete" data-id="${aluno.id}" class="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl">Excluir</button>
      </div>
    `;
    els.listaAlunos.appendChild(card);
  });

  els.studentSelect.innerHTML = state.alunos.length ? "" : '<option value="">Nenhum aluno cadastrado</option>';
  state.alunos.forEach(aluno => {
    const opt = document.createElement("option");
    opt.value = aluno.id;
    opt.textContent = aluno.nome || "Sem nome";
    els.studentSelect.appendChild(opt);
  });

  if (!state.selectedId && state.alunos.length) {
    state.selectedId = state.alunos[0].id;
  }
  if (state.selectedId && !state.alunos.some(a => a.id === state.selectedId)) {
    state.selectedId = state.alunos[0]?.id || null;
  }
  if (state.selectedId) els.studentSelect.value = state.selectedId;

  renderStudentArea();
}

async function loadStudents() {
  try {
    els.statBanco.textContent = "Conectado";
    const snap = await getDocs(collection(db, "alunos"));
    state.alunos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.alunos.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    render();

    onSnapshot(collection(db, "alunos"), snap2 => {
      state.alunos = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
      state.alunos.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      render();
    }, err => {
      console.error(err);
      els.statBanco.textContent = "Offline";
    });
  } catch (e) {
    console.error(e);
    els.statBanco.textContent = "Erro";
  }
}

async function saveStudent() {
  const nome = document.getElementById("nome").value.trim();
  const faixa = document.getElementById("faixa").value.trim();
  const mensalidade = document.getElementById("mensalidade").value.trim();
  const telefoneAluno = document.getElementById("telefoneAluno").value.trim();
  const foto = document.getElementById("foto").value.trim();

  if (!nome) return alert("Digite o nome do aluno.");

  try {
    await addDoc(collection(db, "alunos"), {
      nome,
      faixa,
      mensalidade,
      telefone: telefoneAluno,
      foto,
      presencas: 0,
      createdAt: serverTimestamp()
    });
    ["nome", "faixa", "mensalidade", "telefoneAluno", "foto"].forEach(id => document.getElementById(id).value = "");
    alert("Aluno salvo no Firebase!");
  } catch (e) {
    console.error(e);
    alert("Erro ao salvar aluno no Firebase.");
  }
}

async function markPresence(id) {
  const aluno = state.alunos.find(a => a.id === id);
  if (!aluno) return;
  try {
    await updateDoc(doc(db, "alunos", id), { presencas: Number(aluno.presencas || 0) + 1 });
  } catch (e) {
    console.error(e);
    alert("Erro ao marcar presença.");
  }
}

async function deleteStudent(id) {
  if (!confirm("Excluir esse aluno?")) return;
  try {
    await deleteDoc(doc(db, "alunos", id));
    if (state.selectedId === id) state.selectedId = null;
  } catch (e) {
    console.error(e);
    alert("Erro ao excluir aluno.");
  }
}

async function markAllPresence() {
  if (!state.alunos.length) return alert("Nenhum aluno cadastrado.");
  try {
    for (const aluno of state.alunos) {
      await updateDoc(doc(db, "alunos", aluno.id), { presencas: Number(aluno.presencas || 0) + 1 });
    }
    alert("Presença marcada para todos.");
  } catch (e) {
    console.error(e);
    alert("Erro ao marcar presença geral.");
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state.alunos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "alunos-liga-garra-aguia-pg.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Arquivo inválido");
    for (const aluno of data) {
      await addDoc(collection(db, "alunos"), {
        nome: aluno.nome || "",
        faixa: aluno.faixa || "",
        mensalidade: aluno.mensalidade || "",
        telefone: aluno.telefone || "",
        foto: aluno.foto || "",
        presencas: Number(aluno.presencas || 0),
        createdAt: serverTimestamp()
      });
    }
    alert("Dados importados para o Firebase!");
  } catch (e) {
    console.error(e);
    alert("Não foi possível importar o arquivo.");
  }
  event.target.value = "";
}

document.getElementById("btnHome").addEventListener("click", () => showPanel("home"));
document.getElementById("btnLogin").addEventListener("click", () => showPanel("login"));
document.getElementById("btnAdmin").addEventListener("click", () => showPanel("admin"));
document.getElementById("btnAluno").addEventListener("click", () => showPanel("aluno"));
document.getElementById("quickLogin").addEventListener("click", () => showPanel("login"));
document.getElementById("quickRefresh").addEventListener("click", loadStudents);
document.getElementById("quickExport").addEventListener("click", exportJSON);
document.getElementById("btnAdmin").addEventListener("click", () => showPanel(state.loggedIn && state.adminUnlocked ? "admin" : "login"));
document.getElementById("btnAluno").addEventListener("click", () => showPanel(state.loggedIn ? "aluno" : "login"));
document.getElementById("sendCodeBtn").addEventListener("click", sendCode);
document.getElementById("verifyCodeBtn").addEventListener("click", verifyCode);
document.getElementById("unlockAdminBtn").addEventListener("click", unlockAdmin);
document.getElementById("saveStudentBtn").addEventListener("click", saveStudent);
document.getElementById("markAllPresenceBtn").addEventListener("click", markAllPresence);
document.getElementById("logoutBtn").addEventListener("click", async () => {
  state.adminUnlocked = false;
  localStorage.removeItem("adminUnlocked");
  await signOut(auth);
  showPanel("home");
});
document.getElementById("importFile").addEventListener("change", importJSON);
document.getElementById("backFromAluno").addEventListener("click", () => showPanel("home"));
document.getElementById("studentSelect").addEventListener("change", e => {
  state.selectedId = e.target.value;
  renderStudentArea();
});

els.listaAlunos.addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "presence") markPresence(id);
  if (btn.dataset.action === "delete") deleteStudent(id);
});

onAuthStateChanged(auth, user => {
  state.loggedIn = !!user;
  setAuthStatus(user ? `Logado: ${user.phoneNumber || user.uid}` : "Desconectado");

  if (user) {
    if (state.adminUnlocked) showPanel("admin");
    else showPanel("aluno");
  } else {
    showPanel("home");
  }
});

try {
  state.adminUnlocked = localStorage.getItem("adminUnlocked") === "1";
} catch {}

(async function init() {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
    await window.recaptchaVerifier.render();
  } catch (e) {
    console.warn("reCAPTCHA será criado ao abrir o login.", e);
  }
  await loadStudents();
})();
