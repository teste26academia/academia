import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAGU9FTOeLYhgBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.showPanel = function(panel) {
  document.getElementById('adminPanel').classList.toggle('hidden', panel !== 'admin');
  document.getElementById('alunoPanel').classList.toggle('hidden', panel !== 'aluno');
}

const lista = document.getElementById('listaAlunos');

document.getElementById('salvarAluno').addEventListener('click', async () => {
  const nome = document.getElementById('nome').value;
  const faixa = document.getElementById('faixa').value;
  const telefone = document.getElementById('telefone').value;
  const mensalidade = document.getElementById('mensalidade').value;

  if (!nome) {
    alert('Digite o nome');
    return;
  }

  await addDoc(collection(db, 'alunos'), {
    nome,
    faixa,
    telefone,
    mensalidade,
    presencas: 0,
    criadoEm: new Date()
  });

  document.getElementById('nome').value = '';
  document.getElementById('faixa').value = '';
  document.getElementById('telefone').value = '';
  document.getElementById('mensalidade').value = '';

  alert('Aluno salvo online!');
});

onSnapshot(collection(db, 'alunos'), (snapshot) => {
  lista.innerHTML = '';
  let totalPresencas = 0;

  document.getElementById('totalAlunos').innerText = snapshot.size;

  snapshot.forEach((docSnap) => {
    const aluno = docSnap.data();
    totalPresencas += aluno.presencas || 0;

    lista.innerHTML += `
      <div class="bg-zinc-800 rounded-2xl p-4">
        <h3 class="font-bold text-red-400 text-xl">${aluno.nome}</h3>
        <p>Faixa: ${aluno.faixa || '-'}</p>
        <p>Telefone: ${aluno.telefone || '-'}</p>
        <p>Mensalidade: ${aluno.mensalidade || '-'}</p>
        <p>Presenças: ${aluno.presencas || 0}</p>

        <div class="flex gap-2 mt-4">
          <button onclick="addPresence('${docSnap.id}', ${aluno.presencas || 0})"
          class="bg-green-700 px-4 py-2 rounded-xl">
          + Presença
          </button>

          <button onclick="deleteAluno('${docSnap.id}')"
          class="bg-zinc-700 px-4 py-2 rounded-xl">
          Excluir
          </button>
        </div>
      </div>
    `;
  });

  document.getElementById('totalPresencas').innerText = totalPresencas;
});

window.addPresence = async function(id, presencas) {
  await updateDoc(doc(db, 'alunos', id), {
    presencas: presencas + 1
  });
}

window.deleteAluno = async function(id) {
  if (!confirm('Excluir aluno?')) return;
  await deleteDoc(doc(db, 'alunos', id));
}
