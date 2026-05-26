import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGU9FTOeLYhgBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  size: 'normal'
});

document.getElementById('sendCode').addEventListener('click', async () => {
  try {
    const phoneNumber = document.getElementById('phone').value;
    const appVerifier = window.recaptchaVerifier;

    window.confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

    alert('Código enviado!');
  } catch (error) {
    console.error(error);
    alert('Erro ao enviar código.');
  }
});

document.getElementById('verifyCode').addEventListener('click', async () => {
  try {
    const code = document.getElementById('code').value;

    await window.confirmationResult.confirm(code);

    alert('Login realizado!');
  } catch (error) {
    console.error(error);
    alert('Erro no login.');
  }
});

document.getElementById('salvarAluno').addEventListener('click', async () => {
  try {
    const nome = document.getElementById('nome').value;
    const faixa = document.getElementById('faixa').value;

    await addDoc(collection(db, 'alunos'), {
      nome,
      faixa,
      criadoEm: new Date()
    });

    alert('Aluno salvo!');
  } catch (error) {
    console.error(error);
    alert('Erro ao salvar aluno.');
  }
});

const lista = document.getElementById('listaAlunos');

onSnapshot(collection(db, 'alunos'), (snapshot) => {
  lista.innerHTML = '';

  snapshot.forEach((doc) => {
    const aluno = doc.data();

    lista.innerHTML += `
      <div class="bg-zinc-800 rounded-xl p-4">
        <strong>${aluno.nome}</strong>
        <div>${aluno.faixa}</div>
      </div>
    `;
  });
});
