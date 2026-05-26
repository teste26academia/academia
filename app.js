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
  alunos: [],
  financeiro: [],
  confirmationResult: null,
  selectedId: null,
  loggedIn: false,
  adminUnlocked: false,
  role: "guest",
  recaptchaVerifier: null
};

const el = {
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

function show(section) {
  el.home.classList.toggle("hidden", section !== "home");
  el.login.classList.toggle("hidden", section !== "login");
  el.admin.classList.toggle("hidden", section !== "admin");
  el.aluno.classList.toggle("hidden", section !== "aluno");
  el.financeiro.classList.toggle("hidden", section !== "financeiro");
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

function money(v) {
  const n = Number(String(v || "").replace(/[^\d,.-]/g, "").replace(",", "."));
  if (Number.isNaN(n)) return v || "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function debug(message, tone = "info") {
  const p = document.getElementById("debugAuthText");
  if (p) {
    p.textContent = message;
    p.className = "text-zinc-300";
    if (tone === "success") p.className = "text-emerald-400";
    if (tone === "warn") p.className = "text-yellow-400";
    if (tone === "error") p.className = "text-red-400";
  }
  console.log("[DEBUG]", message);
}

function ensureDebugBox() {
  const loginSection = document.getElementById("loginSection");
  if (!loginSection || document.getElementById("debugAuthBox")) return;
  const box = document.createElement("div");
  box.id = "debugAuthBox";
  box.className = "mt-4 rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-sm text-zinc-200";
  box.innerHTML = `
    <div class="font-bold text-red-400 mb-1">Diagnóstico do login</div>
    <div id="debugAuthText" class="text-zinc-300">Abra o login e teste novamente.</div>
  `;
  loginSection.appendChild(box);
}

function reportFirebaseError(context, error) {
  const code = error?.code || "unknown";
  const message = error?.message || String(error);
  const extra = error?.customData ? ` | ${JSON.stringify(error.customData)}` : "";
  const full = `${context}: ${code} — ${message}${extra}`;
  debug(full, "error");
  alert(full);
}

async function ensureRecaptcha() {
  if (state.recaptchaVerifier) return state.recaptchaVerifier;
  state.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal",
    callback: () => debug("reCAPTCHA validado.", "success"),
    "expired-callback": () => debug("reCAPTCHA expirou. Recarregue a página.", "warn")
  });
  await state.recaptchaVerifier.render();
  debug("reCAPTCHA pronto.", "success");
  return state.recaptchaVerifier;
}

async function sendCode() {
  try {
    const phone = document.getElementById("phone").value.trim();
    if (!phone) return alert("Digite o telefone com DDI. Ex.: +5513974060686");
    await ensureRecaptcha();
    debug(`Enviando SMS para ${phone}...`, "warn");
    state.confirmationResult = await signInWithPhoneNumber(auth, phone, state.recaptchaVerifier);
    debug("Código enviado por SMS.", "success");
    alert("Código enviado.");
  } catch (error) {
    reportFirebaseError("Erro ao enviar o código", error);
  }
}

async function verifyCode() {
  try {
    const code = document.getElementById("smsCode").value.trim();
    if (!state.confirmationResult) return alert("Envie o código primeiro.");
    if (!code) return alert("Digite o código SMS.");
    debug("Validando código...", "warn");
    await state.confirmationResult.confirm(code);
    debug("Login realizado com sucesso.", "success");
    alert("Login realizado.");
  } catch (error) {
    reportFirebaseError("Erro ao confirmar o código", error);
  }
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

function renderStudent() {
  const aluno = state.alunos.find(a => a.id === state.selectedId) || state.alunos[0];
  if (!aluno) {
    el.selectedStudentCard.innerHTML = '<div class="text-zinc-400">Nenhum aluno cadastrado.</div>';
    el.alunoPresenca.textContent = "0 aulas este mês";
    el.alunoMensalidade.textContent = "-";
    el.alunoFaixa.textContent = "-";
    return;
  }
  el.selectedStudentCard.innerHTML = `
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
  el.alunoPresenca.textContent = `${Number(aluno.presencas || 0)} aulas este mês`;
  el.alunoMensalidade.textContent = aluno.mensalidade ? `Status: ${aluno.mensalidade}` : "-";
  el.alunoFaixa.textContent = aluno.faixa || "-";
}

function renderFinance() {
  const previsto = state.financeiro.reduce((a, l) => a + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  const pago = state.financeiro.filter(l => (l.status || "pendente") === "pago")
    .reduce((a, l) => a + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  const aberto = previsto - pago;

  el.finPrevisto.textContent = money(previsto);
  el.finPago.textContent = money(pago);
  el.finAberto.textContent = money(aberto);

  el.finAluno.innerHTML = "";
  state.alunos.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.nome || "Sem nome";
    el.finAluno.appendChild(opt);
  });

  el.listaFinanceiro.innerHTML = state.financeiro.length ? "" : '<div class="text-zinc-400">Nenhum lançamento.</div>';
  state.financeiro.forEach(l => {
    const aluno = state.alunos.find(a => a.id === l.alunoId);
    const row = document.createElement("div");
    row.className = "bg-zinc-800 rounded-2xl p-4 border border-zinc-700";
    row.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <h4 class="font-bold text-purple-300">${escapeHtml(aluno?.nome || "Aluno removido")}</h4>
          <p class="text-zinc-300 text-sm">Valor: ${money(l.valor)}</p>
          <p class="text-zinc-400 text-sm">Vencimento: ${escapeHtml(l.vencimento || "-")}</p>
          <p class="text-zinc-400 text-sm">Status: <span class="${(l.status || "pendente") === "pago" ? "text-emerald-400" : "text-yellow-400"}">${escapeHtml(l.status || "pendente")}</span></p>
        </div>
        <button data-fin-delete="${l.id}" class="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-xl text-sm">Excluir</button>
      </div>
    `;
    el.listaFinanceiro.appendChild(row);
  });
}

function render() {
  el.statAlunos.textContent = state.alunos.length;
  el.statPresencas.textContent = state.alunos.reduce((a, s) => a + Number(s.presencas || 0), 0);
  const aberto = state.financeiro.filter(l => (l.status || "pendente") !== "pago")
    .reduce((a, l) => a + ((parseFloat(String(l.valor || "0").replace(",", ".")) || 0)), 0);
  el.statAberto.textContent = money(aberto);

  el.listaAlunos.innerHTML = state.alunos.length ? "" : '<div class="text-zinc-400">Nenhum aluno cadastrado ainda.</div>';
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
    el.listaAlunos.appendChild(card);
  });

  el.studentSelect.innerHTML = state.alunos.length ? "" : '<option value="">Nenhum aluno cadastrado</option>';
  state.alunos.forEach(aluno => {
    const opt = document.createElement("option");
    opt.value = aluno.id;
    opt.textContent = aluno.nome || "Sem nome";
    el.studentSelect.appendChild(opt);
  });

  if (!state.selectedId && state.alunos.length) state.selectedId = state.alunos[0].id;
  if (state.selectedId && !state.alunos.some(a => a.id === state.selectedId)) state.selectedId = state.alunos[0]?.id || null;
  if (state.selectedId) el.studentSelect.value = state.selectedId;

  renderStudent();
  renderFinance();
}

async function loadData() {
  try {
    el.statBanco.textContent = "Conectado";

    const alunosSnap = await getDocs(collection(db, "alunos"));
    state.alunos = alunosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const finSnap = await getDocs(query(collection(db, "financeiro"), orderBy("createdAt", "desc")));
    state.financeiro = finSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    render();

    onSnapshot(collection(db, "alunos"), snap => {
      state.alunos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      render();
    }, err => {
      console.error(err);
      el.statBanco.textContent = "Offline";
      debug(`Alunos: ${err.code || "erro"} | ${err.message || err}`, "error");
    });

    onSnapshot(query(collection(db, "financeiro"), orderBy("createdAt", "desc")), snap => {
      state.financeiro = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    }, err => {
      console.error(err);
      debug(`Financeiro: ${err.code || "erro"} | ${err.message || err}`, "error");
    });
  } catch (error) {
    console.error(error);
    el.statBanco.textContent = "Erro";
    reportFirebaseError("Erro ao carregar banco", error);
  }
}

async function saveAluno() {
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
  } catch (error) {
    reportFirebaseError("Erro ao salvar aluno", error);
  }
}

async function addPresence(id) {
  const aluno = state.alunos.find(a => a.id === id);
  if (!aluno) return;
  try {
    await updateDoc(doc(db, "alunos", id), { presencas: Number(aluno.presencas || 0) + 1 });
  } catch (error) {
    reportFirebaseError("Erro ao marcar presença", error);
  }
}

async function deleteAluno(id) {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode excluir.");
  if (!confirm("Excluir esse aluno?")) return;
  try {
    await deleteDoc(doc(db, "alunos", id));
  } catch (error) {
    reportFirebaseError("Erro ao excluir aluno", error);
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
  } catch (error) {
    reportFirebaseError("Erro ao marcar presença geral", error);
  }
}

async function saveFinance() {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode lançar mensalidades.");
  const alunoId = el.finAluno.value;
  const valor = el.finValor.value.trim();
  const vencimento = el.finVencimento.value;
  const status = el.finStatus.value;
  if (!alunoId || !valor) return alert("Selecione o aluno e informe o valor.");

  try {
    await addDoc(collection(db, "financeiro"), {
      alunoId,
      valor,
      vencimento,
      status,
      createdAt: serverTimestamp()
    });
    el.finValor.value = "";
    el.finVencimento.value = "";
    el.finStatus.value = "pendente";
    alert("Mensalidade salva no Firebase!");
  } catch (error) {
    reportFirebaseError("Erro ao salvar financeiro", error);
  }
}

async function deleteFinance(id) {
  if (!state.loggedIn || state.role !== "admin") return alert("Somente administrador pode excluir lançamentos.");
  if (!confirm("Excluir lançamento?")) return;
  try {
    await deleteDoc(doc(db, "financeiro", id));
  } catch (error) {
    reportFirebaseError("Erro ao excluir lançamento", error);
  }
}

async function importBackup(event) {
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
  } catch (error) {
    reportFirebaseError("Erro ao importar backup", error);
  }
  event.target.value = "";
}

document.getElementById("btnHome").addEventListener("click", () => show("home"));
document.getElementById("btnLogin").addEventListener("click", async () => {
  show("login");
  ensureDebugBox();
  try { await ensureRecaptcha(); } catch {}
});
document.getElementById("btnAdmin").addEventListener("click", () => {
  if (!state.loggedIn) return show("login");
  if (state.role !== "admin") return alert("Este login não tem permissão de administrador.");
  show("admin");
});
document.getElementById("btnAluno").addEventListener("click", () => {
  if (!state.loggedIn) return show("login");
  show("aluno");
});
document.getElementById("btnFinanceiro").addEventListener("click", () => {
  if (!state.loggedIn) return show("login");
  if (state.role !== "admin") return alert("Somente administrador pode acessar o financeiro.");
  show("financeiro");
});
document.getElementById("quickLogin").addEventListener("click", () => show("login"));
document.getElementById("quickRefresh").addEventListener("click", loadData);
document.getElementById("quickExport").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ alunos: state.alunos, financeiro: state.financeiro }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ligagarra-pg-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("sendCodeBtn").addEventListener("click", sendCode);
document.getElementById("verifyCodeBtn").addEventListener("click", verifyCode);
document.getElementById("unlockAdminBtn").addEventListener("click", () => {
  const pass = document.getElementById("adminPass").value.trim();
  if (pass !== ADMIN_PASSWORD) return alert("Senha do admin incorreta.");
  state.adminUnlocked = true;
  localStorage.setItem("adminUnlocked", "1");
  if (state.loggedIn) state.role = "admin";
  alert("Admin liberado.");
  show("admin");
});
document.getElementById("saveStudentBtn").addEventListener("click", saveAluno);
document.getElementById("markAllPresenceBtn").addEventListener("click", markAllPresence);
document.getElementById("saveFinanceBtn").addEventListener("click", saveFinance);
document.getElementById("logoutBtn").addEventListener("click", async () => {
  state.adminUnlocked = false;
  localStorage.removeItem("adminUnlocked");
  await signOut(auth);
  show("home");
});
document.getElementById("importFile").addEventListener("change", importBackup);
document.getElementById("backFromAluno").addEventListener("click", () => show("home"));
document.getElementById("backFinanceiro").addEventListener("click", () => show("admin"));
document.getElementById("studentSelect").addEventListener("change", e => {
  state.selectedId = e.target.value;
  renderStudent();
});
el.listaAlunos.addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "presence") addPresence(btn.dataset.id);
  if (btn.dataset.action === "delete") deleteAluno(btn.dataset.id);
});
el.listaFinanceiro.addEventListener("click", e => {
  const btn = e.target.closest("button[data-fin-delete]");
  if (!btn) return;
  deleteFinance(btn.dataset.finDelete);
});

window.addEventListener("error", ev => debug(`Erro global: ${ev.error?.message || ev.message}`, "error"));
window.addEventListener("unhandledrejection", ev => debug(`Promise rejeitada: ${ev.reason?.message || ev.reason}`, "error"));

onAuthStateChanged(auth, async user => {
  state.loggedIn = !!user;
  el.authStatus.textContent = user ? `Logado: ${user.phoneNumber || user.uid}` : "Desconectado";

  if (!user) {
    state.role = "guest";
    show("home");
    return;
  }

  try {
    const profile = await ensureUserDoc(user);
    state.role = profile.role || "aluno";
    if (state.adminUnlocked) state.role = "admin";
    debug(`Login OK. Perfil: ${state.role}`, "success");
    if (state.role === "admin") show("admin");
    else show("aluno");
  } catch (error) {
    reportFirebaseError("Erro ao carregar perfil", error);
    state.role = "aluno";
    show("aluno");
  }
});

try {
  state.adminUnlocked = localStorage.getItem("adminUnlocked") === "1";
} catch {}

ensureDebugBox();
debug("Sistema carregando...", "warn");
loadData();


let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installBtn) installBtn.classList.remove("hidden");
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add("hidden");
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Falha ao registrar service worker", error);
    });
  });
}
