import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { UserRole, UserProfile } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, nome: string, role?: UserRole) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  retryAuth: () => void;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const retryAuth = () => {
    setError(null);
    setLoading(true);
    setRetryTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Standard Local Persistence setup to handle iframe sandboxing limits gracefully
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Auth persistence warning:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            // Attempt to link current user to an existing Aluno record by email automatically
            let linkedAlunoId: string | undefined = undefined;
            try {
              const studentsRef = collection(db, "alunos");
              const q = query(studentsRef, where("email", "==", firebaseUser.email));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                linkedAlunoId = querySnapshot.docs[0].id;
              }
            } catch (studentErr) {
              console.warn("Failed to lookup existing Aluno during signup initialization:", studentErr);
            }

            // Standard core role calculation
            const role = firebaseUser.email === "deciopadovanijr@gmail.com" 
              ? UserRole.ADMIN 
              : UserRole.ALUNO;

            // PRIMEIRO ACESSO AUTOMÁTICO: Se for Aluno e não achou cadastro pelo email, criar ficha provisória PENDENTE
            if (role === UserRole.ALUNO && !linkedAlunoId) {
              try {
                const studentId = `stu_${firebaseUser.uid}`;
                const newAlunoRecord = {
                  id: studentId,
                  userId: firebaseUser.uid,
                  nome: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Novo Aluno",
                  email: firebaseUser.email || "",
                  cpf: "",
                  rg: "",
                  dataNascimento: "2000-01-01",
                  telefone: "",
                  whatsapp: "",
                  endereco: "",
                  responsavel: "",
                  foto: firebaseUser.photoURL || "",
                  dataMatricula: new Date().toISOString().split("T")[0],
                  graduacaoAtual: "Preparatória - Branca",
                  dataUltimaGraduacao: new Date().toISOString().split("T")[0],
                  status: "PENDENTE", // Status inicial PENDENTE
                  turmaId: "turma_1",
                  modalidade: "Não definida", // Inicialmente não definida
                  observacoes: "Ficha acadêmica inicial gerada automaticamente no primeiro acesso.",
                  statusFinanceiro: "PENDENTE",
                  
                  // Compatibilidade
                  graduacao: "Preparatória - Branca",
                  celular: "",
                  planoTipo: "2x_semana",
                  relativeUrl: "",
                  mensalidade: 160,
                  descontoFamiliaTipo: "nenhum",
                  descontoFamiliaValor: 0
                };
                await setDoc(doc(db, "alunos", studentId), newAlunoRecord);
                linkedAlunoId = studentId;
                console.log("Ficha provisória de aluno criada automaticamente para primeiro acesso.");
              } catch (createErr) {
                console.error("Falha ao criar ficha acadêmica inicial para novo aluno:", createErr);
              }
            }

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              nome: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
              email: firebaseUser.email || "",
              role: role,
              alunoId: linkedAlunoId
            };

            // Save the profile directly to Firestore
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } else {
            const loadedProfile = userDocSnap.data() as UserProfile;
            
            // If the user is deciopadovanijr@gmail.com, force ADMIN role
            if (firebaseUser.email === "deciopadovanijr@gmail.com") {
              loadedProfile.role = UserRole.ADMIN;
            } else if (loadedProfile.role && loadedProfile.role.toLowerCase() === "admin") {
              loadedProfile.role = UserRole.ADMIN;
            } else if (loadedProfile.role && loadedProfile.role.toLowerCase() === "instrutor") {
              loadedProfile.role = UserRole.INSTRUTOR;
            } else if (loadedProfile.role && loadedProfile.role.toLowerCase() === "aluno") {
              loadedProfile.role = UserRole.ALUNO;
            }
            
            // If the user profile exists but doesn't have an alunoId linked yet, double check if there's an Aluno record now
            if (!loadedProfile.alunoId && loadedProfile.role === UserRole.ALUNO) {
              try {
                const studentsRef = collection(db, "alunos");
                const q = query(studentsRef, where("email", "==", firebaseUser.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  loadedProfile.alunoId = querySnapshot.docs[0].id;
                  await setDoc(userDocRef, loadedProfile, { merge: true });
                } else {
                  // Primeiro acesso automático para perfil existente sem alunoId linkado
                  const studentId = `stu_${firebaseUser.uid}`;
                  const newAlunoRecord = {
                    id: studentId,
                    userId: firebaseUser.uid,
                    nome: firebaseUser.displayName || loadedProfile.nome || "Novo Aluno",
                    email: firebaseUser.email || "",
                    cpf: "",
                    rg: "",
                    dataNascimento: "2000-01-01",
                    telefone: "",
                    whatsapp: "",
                    endereco: "",
                    responsavel: "",
                    foto: firebaseUser.photoURL || "",
                    dataMatricula: new Date().toISOString().split("T")[0],
                    graduacaoAtual: "Preparatória - Branca",
                    dataUltimaGraduacao: new Date().toISOString().split("T")[0],
                    status: "PENDENTE", // Status inicial PENDENTE
                    turmaId: "turma_1",
                    modalidade: "Não definida", // Inicialmente não definida
                    observacoes: "Ficha acadêmica inicial gerada automaticamente no primeiro acesso para perfil sem associação.",
                    statusFinanceiro: "PENDENTE",
                    
                    // Compatibilidade
                    graduacao: "Preparatória - Branca",
                    celular: "",
                    planoTipo: "2x_semana",
                    mensalidade: 160,
                    descontoFamiliaTipo: "nenhum",
                    descontoFamiliaValor: 0
                  };
                  await setDoc(doc(db, "alunos", studentId), newAlunoRecord);
                  loadedProfile.alunoId = studentId;
                  await setDoc(userDocRef, loadedProfile, { merge: true });
                  console.log("Ficha provisória de aluno criada automaticamente para perfil existente sem alunoId.");
                }
              } catch (studentErr) {
                console.warn("Failed to double check existing Aluno link:", studentErr);
              }
            }

            setUserProfile(loadedProfile);
          }
        } catch (err: any) {
          console.error("Error loading user profile from Firestore:", err);
          setError("Falha ao recuperar perfil de acesso do banco de dados.");
          try {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {}
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    }, (authErr) => {
      console.error("Auth listener connection failed:", authErr);
      setError("Erro de rede com os serviços de autenticação.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [retryTrigger]);

  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Envio de redefinição de senha falhou:", err);
      if (err.code === "auth/user-not-found") {
        setError("Não encontramos nenhuma conta cadastrada com este e-mail.");
      } else if (err.code === "auth/invalid-email") {
        setError("O formato do e-mail informado é inválido.");
      } else {
        setError("Falha ao enviar e-mail de redefinição de senha. Verifique a grafia.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login por e-mail e senha falhou:", err);
      const errCode = err.code || "";
      const errMsg = err.message || "";
      const isApiKeyError = errCode.includes("api-key-not-valid") || errMsg.includes("api-key-not-valid") || errMsg.includes("API key");
      
      if (isApiKeyError) {
        setError("Erro de configuração no Firebase (API Key inválida). Verifique se você preencheu a chave 'VITE_FIREBASE_API_KEY' com o valor real das Configurações do seu Projeto no Console do Firebase (garra-de-aguia-pg). Chaves reais do Firebase normalmente começam com 'AIzaSy'.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("O método de login por 'E-mail e Senha' está desativado no seu console do Firebase! Acesse o Console Firebase > Authentication > guia 'Sign-in method' e ative 'E-mail/senha' para liberar o acesso.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" || err.code === "auth/user-disabled") {
        setError("E-mail ou senha inválidos.");
      } else if (err.code === "auth/invalid-email") {
        setError("O formato do e-mail informado é inválido.");
      } else {
        setError("Falha ao realizar login. Tente novamente.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, nome: string, chosenRole?: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const credInfo = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credInfo.user;
      
      // Buscar se existe aluno com este e-mail
      let linkedAlunoId: string | undefined = undefined;
      try {
        const studentsRef = collection(db, "alunos");
        const q = query(studentsRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          linkedAlunoId = querySnapshot.docs[0].id;
        }
      } catch (studentErr) {
        console.warn("Failed to lookup existing Aluno during email signup:", studentErr);
      }

      const role = chosenRole || (email === "deciopadovanijr@gmail.com" ? UserRole.ADMIN : UserRole.ALUNO);
      
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        nome: nome || email.split("@")[0],
        email: email,
        role: role,
        alunoId: linkedAlunoId
      };

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      console.error("Cadastro por e-mail e senha falhou:", err);
      const errCode = err.code || "";
      const errMsg = err.message || "";
      const isApiKeyError = errCode.includes("api-key-not-valid") || errMsg.includes("api-key-not-valid") || errMsg.includes("API key");
      
      if (isApiKeyError) {
        setError("Erro de configuração no Firebase (API Key inválida). Verifique se você preencheu a chave 'VITE_FIREBASE_API_KEY' com o valor real das Configurações do seu Projeto no Console do Firebase (garra-de-aguia-pg). Chaves reais do Firebase normalmente começam com 'AIzaSy'.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("O método de cadastro por 'E-mail e Senha' está desativado no seu console do Firebase! Acesse o Console Firebase > Authentication > guia 'Sign-in method' e ative 'E-mail/senha' para liberar novos cadastros.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está sendo utilizado por outra conta.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha é muito fraca. Escolha uma senha com no mínimo 6 caracteres.");
      } else if (err.code === "auth/invalid-email") {
        setError("O formato do e-mail informado é inválido.");
      } else {
        setError("Falha ao registrar conta no portal. Tente novamente.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out process failed:", err);
      setError("Falha ao encerrar a sessão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      error, 
      signInWithEmail, 
      signUpWithEmail, 
      sendPasswordReset,
      logout, 
      retryAuth,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed strictly inside an AuthProvider scope.");
  }
  return context;
}
