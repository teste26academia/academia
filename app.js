
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
RecaptchaVerifier,
signInWithPhoneNumber,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
collection,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyAGU9FTOelHYghBd2KhTIQGYBpuacYBJgk",
authDomain: "garra-de-aguia-pg.firebaseapp.com",
projectId: "garra-de-aguia-pg",
storageBucket: "garra-de-aguia-pg.firebasestorage.app",
messagingSenderId: "204499771784",
appId: "1:204499771784:web:b0f672c7898ddd2050da3d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const home = document.getElementById("home");
const adminPanel = document.getElementById("adminPanel");
const alunoPanel = document.getElementById("alunoPanel");

function showHome(){
home.classList.remove("hidden");
adminPanel.classList.add("hidden");
alunoPanel.classList.add("hidden");
}

function showAdmin(){
home.classList.add("hidden");
adminPanel.classList.remove("hidden");
alunoPanel.classList.add("hidden");
}

function showAluno(){
home.classList.add("hidden");
adminPanel.classList.add("hidden");
alunoPanel.classList.remove("hidden");
}

document.getElementById("openAdmin").onclick = showAdmin;
document.getElementById("openAluno").onclick = showAluno;
document.getElementById("homeBtn").onclick = showHome;
document.getElementById("backAdmin").onclick = showHome;
document.getElementById("backAluno").onclick = showHome;

document.getElementById("loginAdmin").onclick = () => {
const senha = document.getElementById("adminPassword").value;

if(senha === "2468"){
showAdmin();
alert("Admin liberado.");
}else{
alert("Senha incorreta.");
}
};

let confirmationResult = null;

window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
size: "normal"
});

document.getElementById("sendCode").onclick = async () => {
try{
const phone = document.getElementById("phone").value;
confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
alert("Código enviado.");
}catch(e){
alert(e.message);
}
};

document.getElementById("confirmCode").onclick = async () => {
try{
const code = document.getElementById("smsCode").value;
await confirmationResult.confirm(code);
alert("Login realizado.");
showAluno();
}catch(e){
alert(e.message);
}
};

onAuthStateChanged(auth, (user)=>{
document.getElementById("status").innerText =
user ? "Logado: " + user.phoneNumber : "Desconectado";
});

document.getElementById("saveAluno").onclick = async () => {
const user = auth.currentUser;

if(!user){
alert("Faça login primeiro.");
return;
}

const nome = document.getElementById("nomeAluno").value;
const faixa = document.getElementById("faixaAluno").value;

await setDoc(doc(db, "alunos", user.uid), {
nome,
faixa,
telefone: user.phoneNumber
});

document.getElementById("perfil").innerHTML =
"<b>Nome:</b> " + nome + "<br><b>Faixa:</b> " + faixa;

alert("Cadastro salvo.");
};

onSnapshot(collection(db, "alunos"), (snapshot)=>{
const lista = document.getElementById("adminList");

lista.innerHTML = "";

snapshot.forEach((docItem)=>{
const data = docItem.data();

lista.innerHTML += `
<div class='bg-zinc-800 p-4 rounded-xl mb-3'>
<b>${data.nome || "Sem nome"}</b><br>
Telefone: ${data.telefone || "-"}<br>
Faixa: ${data.faixa || "-"}
</div>
`;
});
});
