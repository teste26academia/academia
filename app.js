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
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  orderBy
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
  financeiro: [],
  confirmationResult: null,
  selectedId: null,
  loggedIn: false,
  adminUnlocked: false,
  me: null,
  role: "guest"
};

const els = {
  home: document.getElementById("homeSection"),
  login: document.getElementById("loginSection"),
  admin: document.getElementById("adminSection"),
  aluno: document.getElementById("alunoSection"),
  financeiro: document.getElementById("financeiroSection"),
  statAlunos: document.getElementById("statAlunos"),
  statAberto: document.getElementById("statAberto"),
  statPresencas: document.getElementById("statPresencas"),
  statBanco: document.getElementById("statBanco"),
  authStatus: document.getElementById("authStatus"),
  listaAlunos: document.getElementById("listaAlunos"),
  studentSelect: document.getElementById("studentSelect"),
  selectedStudentCard: document.getElementById("selectedStudentCard"),
  alunoPresenca: document.getElementById("alunoPresenca"),
  alunoMensalidade: document.getElementById("alunoMensalidade"),
  alunoFaixa: document.getElementById("alunoFaixa"),
  finPrevisto: document.getElementById("finPrevisto"),
  finPago: document.getElementById("finPago"),
  finAberto: document.getElementById("finAberto"),
  finAluno: document.getElementById("finAluno"),
  finValor: document.getElementById("finValor"),
  finVencimento: document.getElementById("finVencimento"),
  finStatus: document.getElementById("finStatus"),
  listaFinanceiro: document.getElementById("listaFinanceiro")
};

function showPanel(panel) {
  els.home.classList.toggle("hidden", panel !== "home");
  els.login.classList.toggle("hidden", panel !== "login");
  els.admin.classList.toggle("hidden", panel !== "admin");
  els.aluno.classList.toggle("hidden", panel !== "aluno");
  els.financeiro.classList.toggle("hidden", panel !== "financeiro");
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
  if (input !== ADMIN_PASSWORD) return alert("Senha do admin incorreta.");
  state.adminUnlocked = true;
  localStorage.setItem("adminUnlocked", "1");
  alert("Admin liberado nesta sessão.");
  if (state.loggedIn) showPanel("admin");
}

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      phoneNumber: user.phoneNumber || "",
      role: "aluno",
      createdAt: serverTimestamp()
    });
    return { role: "aluno" };
  }
  return snap.data();
}

async function refreshRole(user) {
  if (!user) {
    state.role = "guest";
    return;
  }
  const userData = await ensureUserDoc(user);
  state.me = userData;
  state.role = userData.role || "aluno";

  // Se a senha admin foi destravada, permite painel admin nesta sessão
  if (state.adminUnlocked) state.role = "admin";
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

function renderFinanceiro() {
  const pagamentoPorAluno = new Map();
  for (const lanc of state.financeiro) {
    const prev = pagamentoPorAluno.get(lanc.alunoId) || { previsto: 0, pago: 0, aberto: 0 };
    const valor = parseFloat(String(lanc.valor || "0").replace(",", ".")) || 0;
    prev.previsto += valor;
    if ((lanc.status || "pendente") === "pago") prev.pago += valor;
    else prev.aberto += valor;
    pagamentoPorAluno.set(lanc.alunoId, prev);
  }

  const totalPrevisto = state.financeiro.reduce((acc, l) => acc + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  const totalPago = state.financeiro.filter(l => (l.status || "pendente") === "pago").reduce((acc, l) => acc + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  const totalAberto = totalPrevisto - totalPago;

  els.finPrevisto.textContent = formatCurrency(totalPrevisto);
  els.finPago.textContent = formatCurrency(totalPago);
  els.finAberto.textContent = formatCurrency(totalAberto);

  els.finAluno.innerHTML = "";
  state.alunos.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.nome || "Sem nome";
    els.finAluno.appendChild(opt);
  });

  els.listaFinanceiro.innerHTML = state.financeiro.length ? "" : '<div class="text-zinc-400">Nenhum lançamento.</div>';
  state.financeiro.forEach(lanc => {
    const aluno = state.alunos.find(a => a.id === lanc.alunoId);
    const card = document.createElement("div");
    card.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <h4 class="font-bold text-purple-300">${escapeHtml(aluno?.nome || "Aluno removido")}</h4>
          <p class="text-zinc-300 text-sm">Valor: ${formatCurrency(lanc.valor)}</p>
          <p class="text-zinc-400 text-sm">Vencimento: ${lanc.vencimento || "-"}</p>
          <p class="text-zinc-400 text-sm">Status: <span class="${(lanc.status||'pendente') === 'pago' ? 'text-emerald-400' : 'text-yellow-400'}">${lanc.status || "pendente"}</span></p>
        </div>
        <button data-fin-delete="${lanc.id}" class="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-xl text-sm">Excluir</button>
      </div>
    `;
    els.listaFinanceiro.appendChild(card);
  });
}

function render() {
  els.statAlunos.textContent = state.alunos.length;
  els.statPresencas.textContent = state.alunos.reduce((acc, a) => acc + Number(a.presencas || 0), 0);

  const aberto = state.financeiro.filter(l => (l.status || "pendente") !== "pago")
    .reduce((acc, l) => acc + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  els.statAberto.textContent = formatCurrency(aberto);

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

  if (!state.selectedId && state.alunos.length) state.selectedId = state.alunos[0].id;
  if (state.selectedId && !state.alunos.some(a => a.id === state.selectedId)) state.selectedId = state.alunos[0]?.id || null;
  if (state.selectedId) els.studentSelect.value = state.selectedId;

  renderStudentArea();
  renderFinanceiro();
}

async function loadData() {
  try {
    els.statBanco.textContent = "Conectado";

    const alunosSnap = await getDocs(collection(db, "alunos"));
    state.alunos = alunosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.alunos.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const finSnap = await getDocs(query(collection(db, "financeiro"), orderBy("createdAt", "desc")));
    state.financeiro = finSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    render();

    onSnapshot(collection(db, "alunos"), snap => {
      state.alunos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      state.alunos.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      render();
    }, err => {
      console.error(err);
      els.statBanco.textContent = "Offline";
    });

    onSnapshot(query(collection(db, "financeiro"), orderBy("createdAt", "desc")), snap => {
      state.financeiro = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    }, err => {
      console.error(err);
    });
  } catch (e) {
    console.error(e);
    els.statBanco.textContent = "Erro";
  }
}

async function saveStudent() {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode salvar alunos.");
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

async function addPresence(id) {
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
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode excluir.");
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
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode marcar presença geral.");
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

async function saveFinance() {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode lançar mensalidades.");
  const alunoId = els.finAluno.value;
  const valor = els.finValor.value.trim();
  const vencimento = els.finVencimento.value;
  const status = els.finStatus.value;
  if (!alunoId || !valor) return alert("Selecione o aluno e informe o valor.");

  try {
    await addDoc(collection(db, "financeiro"), {
      alunoId,
      valor,
      vencimento,
      status,
      createdAt: serverTimestamp()
    });
    els.finValor.value = "";
    els.finVencimento.value = "";
    els.finStatus.value = "pendente";
    alert("Mensalidade salva no Firebase!");
  } catch (e) {
    console.error(e);
    alert("Erro ao salvar financeiro.");
  }
}

async function deleteFinance(id) {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode excluir lançamentos.");
  if (!confirm("Excluir lançamento?")) return;
  try {
    await deleteDoc(doc(db, "financeiro", id));
  } catch (e) {
    console.error(e);
    alert("Erro ao excluir lançamento.");
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify({ alunos: state.alunos, financeiro: state.financeiro }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ligagarra-pg-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || (!Array.isArray(data.alunos) && !Array.isArray(data.financeiro))) throw new Error("Arquivo inválido");

    if (Array.isArray(data.alunos)) {
      for (const aluno of data.alunos) {
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
    }

    if (Array.isArray(data.financeiro)) {
      for (const lanc of data.financeiro) {
        await addDoc(collection(db, "financeiro"), {
          alunoId: lanc.alunoId || "",
          valor: lanc.valor || "0",
          vencimento: lanc.vencimento || "",
          status: lanc.status || "pendente",
          createdAt: serverTimestamp()
        });
      }
    }

    alert("Backup importado para o Firebase!");
  } catch (e) {
    console.error(e);
    alert("Não foi possível importar o backup.");
  }
  event.target.value = "";
}

document.getElementById("btnHome").addEventListener("click", () => showPanel("home"));
document.getElementById("btnLogin").addEventListener("click", () => showPanel("login"));
document.getElementById("btnAdmin").addEventListener("click", () => {
  if (!state.loggedIn) return showPanel("login");
  if (state.role !== "admin") return alert("Este login não tem permissão de administrador.");
  showPanel("admin");
});
document.getElementById("btnAluno").addEventListener("click", () => {
  if (!state.loggedIn) return showPanel("login");
  showPanel("aluno");
});
document.getElementById("btnFinanceiro").addEventListener("click", () => {
  if (!state.loggedIn) return showPanel("login");
  if (state.role !== "admin") return alert("Somente administrador pode acessar o financeiro.");
  showPanel("financeiro");
});
document.getElementById("quickLogin").addEventListener("click", () => showPanel("login"));
document.getElementById("quickRefresh").addEventListener("click", loadData);
document.getElementById("quickExport").addEventListener("click", exportJSON);
document.getElementById("sendCodeBtn").addEventListener("click", sendCode);
document.getElementById("verifyCodeBtn").addEventListener("click", verifyCode);
document.getElementById("unlockAdminBtn").addEventListener("click", unlockAdmin);
document.getElementById("saveStudentBtn").addEventListener("click", saveStudent);
document.getElementById("markAllPresenceBtn").addEventListener("click", markAllPresence);
document.getElementById("saveFinanceBtn").addEventListener("click", saveFinance);
document.getElementById("logoutBtn").addEventListener("click", async () => {
  state.adminUnlocked = false;
  localStorage.removeItem("adminUnlocked");
  await signOut(auth);
  showPanel("home");
});
document.getElementById("importFile").addEventListener("change", importJSON);
document.getElementById("backFromAluno").addEventListener("click", () => showPanel("home"));
document.getElementById("backFinanceiro").addEventListener("click", () => showPanel("admin"));
document.getElementById("studentSelect").addEventListener("change", e => {
  state.selectedId = e.target.value;
  renderStudentArea();
});
els.listaAlunos.addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "presence") addPresence(id);
  if (btn.dataset.action === "delete") deleteStudent(id);
});
els.listaFinanceiro.addEventListener("click", e => {
  const btn = e.target.closest("button[data-fin-delete]");
  if (!btn) return;
  deleteFinance(btn.dataset.finDelete);
});

onAuthStateChanged(auth, async user => {
  state.loggedIn = !!user;
  setAuthStatus(user ? `Logado: ${user.phoneNumber || user.uid}` : "Desconectado");

  if (user) {
    try {
      const profile = await ensureUserDoc(user);
      state.me = profile;
      state.role = profile.role || "aluno";
      if (state.adminUnlocked) state.role = "admin";
      if (state.role === "admin") showPanel("admin");
      else showPanel("aluno");
    } catch (e) {
      console.error(e);
      state.role = "aluno";
      showPanel("aluno");
    }
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
  await loadData();
})();
