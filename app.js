import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
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

let confirmationResult = null;

window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "normal",
  callback: () => {
    console.log("reCAPTCHA OK");
  }
});

window.sendCode = async function () {

  const phoneNumber = document.getElementById("phone").value;

  try {

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    alert("Código enviado com sucesso!");

  } catch (error) {

    console.error(error);
    alert("Erro Firebase: " + error.message);

  }

};

window.confirmCode = async function () {

  const code = document.getElementById("smsCode").value;

  try {

    await confirmationResult.confirm(code);

    alert("Login realizado com sucesso!");

    document.getElementById("statusLogin").innerText = "LOGADO";

  } catch (error) {

    console.error(error);
    alert("Código inválido");

  }

};

window.salvarAluno = async function () {

  const nome = document.getElementById("nomeAluno").value;
  const faixa = document.getElementById("faixaAluno").value;

  if (!nome) {
    alert("Digite o nome");
    return;
  }

  try {

    await addDoc(collection(db, "alunos"), {
      nome,
      faixa,
      createdAt: serverTimestamp()
    });

    alert("Aluno salvo!");

    carregarAlunos();

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

};

async function carregarAlunos() {

  const lista = document.getElementById("listaAlunos");

  if (!lista) return;

  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "alunos"));

  querySnapshot.forEach((doc) => {

    const aluno = doc.data();

    lista.innerHTML += `
      <div style="
        background:#18181b;
        padding:15px;
        border-radius:12px;
        margin-top:10px;
        color:white;
      ">
        <b>${aluno.nome}</b><br>
        Faixa: ${aluno.faixa || "-"}
      </div>
    `;

  });

}

onAuthStateChanged(auth, (user) => {

  if (user) {

    document.getElementById("statusLogin").innerText =
      "Logado: " + user.phoneNumber;

  } else {

    document.getElementById("statusLogin").innerText =
      "Desconectado";

  }

});

window.logoutSistema = async function () {

  await signOut(auth);

  alert("Logout realizado");

};

carregarAlunos();
