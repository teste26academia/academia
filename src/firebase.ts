import { initializeApp } from "firebase/app";
import { getAuth, User as FirebaseUser } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot
} from "firebase/firestore";
// Firebase Oficial da Academia: Associação Garra de Águia Praia Grande
const productionFirebaseConfig = {
  apiKey: "AIzaSyAGU9FTOelHYghBd2KhTIQGYBpuacYBJgk",
  authDomain: "garra-de-aguia-pg.firebaseapp.com",
  projectId: "garra-de-aguia-pg",
  storageBucket: "garra-de-aguia-pg.firebasestorage.app",
  messagingSenderId: "204499771784",
  appId: "1:204499771784:web:b0f672c7898ddd2050da3d",
  firestoreDatabaseId: "" // Banco de dados padrão (default)
};

// Função auxiliar de higienização de string para remover aspas incorporadas e espaços em branco extras
function cleanConfigValue(val: any): string {
  if (!val) return "";
  let s = String(val).trim();
  // Remove aspas duplas no início/fim caso persistam no container/processo do Vite
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  // Remove aspas simples no início/fim caso existam
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

// Leitura explícita usando caminhos sintáticos estáticos obrigatórios para o compilador do Vite
const env = (import.meta as any).env || {};
const rawApiKey = env.VITE_FIREBASE_API_KEY;
const rawAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
const rawProjectId = env.VITE_FIREBASE_PROJECT_ID;
const rawStorageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
const rawMessagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const rawAppId = env.VITE_FIREBASE_APP_ID;

const cleanApiKey = cleanConfigValue(rawApiKey);
const cleanAuthDomain = cleanConfigValue(rawAuthDomain);
const cleanProjectId = cleanConfigValue(rawProjectId);
const cleanStorageBucket = cleanConfigValue(rawStorageBucket);
const cleanMessagingSenderId = cleanConfigValue(rawMessagingSenderId);
const cleanAppId = cleanConfigValue(rawAppId);

// Validação se a apiKey customizada é real para o Firebase (inicia com AIzaSy)
const finalApiKey = (cleanApiKey.startsWith("AIzaSy") ? cleanApiKey : "") || productionFirebaseConfig.apiKey;

const firebaseConfig = {
  apiKey: finalApiKey,
  authDomain: cleanAuthDomain || productionFirebaseConfig.authDomain,
  projectId: cleanProjectId || productionFirebaseConfig.projectId,
  storageBucket: cleanStorageBucket || productionFirebaseConfig.storageBucket,
  messagingSenderId: cleanMessagingSenderId || productionFirebaseConfig.messagingSenderId,
  appId: cleanAppId || productionFirebaseConfig.appId,
};

// Initialize Firebase App
console.log("Firebase Project:", firebaseConfig.projectId);
console.log("Firestore Database:", "(default)");
console.log("Firebase Config Efetiva:", firebaseConfig);
console.log("Import Meta Env:", (import.meta as any).env);

const app = initializeApp(firebaseConfig);

// Initialize Services (usa a base de dados padrão sem parâmetros adicionais incorretos)
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test Firestore Connection on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Informação de conexão: O cliente do Firebase reportou que está offline ou com credenciais pendentes.");
    } else {
      console.log("Firestore connection test performed.");
    }
  }
}
testConnection();

// Error Handling Schema conform to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Raised: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
