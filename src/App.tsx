import React, { useState, useEffect } from "react";
import { UserRole, Aluno, Turma, Instrutor, Presenca, HistoricoGraduacao, Pagamento, GlobalConfigs, Exame, Produto, Venda, Familia, AlunoModalidade, GraduacoesConfig } from "./types";
import {
  INITIAL_ALUNOS,
  INITIAL_TURMAS,
  INITIAL_PRESENCAS,
  INITIAL_GRADUACOES,
  INITIAL_PAGAMENTOS,
  INITIAL_CONFIG
} from "./data/mockData";
import AdminPanel from "./components/AdminPanel";
import FichaAlunoModal from "./components/FichaAlunoModal";
import InstructorPanel from "./components/InstructorPanel";
import StudentPanel from "./components/StudentPanel";
import DocumentationView from "./components/DocumentationView";
import { Dashboard } from "./components/Dashboard";
import { Alunos } from "./components/Alunos";
import { Presencas } from "./components/Presencas";
import { Relatorios } from "./components/Relatorios";
import { Configuracoes } from "./components/Configuracoes";
import { Perfil } from "./components/Perfil";
import { BrasaoOficial, EagleClawLogo } from "./components/BrasaoOficial";
import { Shield, GraduationCap, User, BookOpen, Sparkles, RefreshCw, LogIn, Lock, Users, Info, Menu as MenuIcon, Bell, Smartphone, Plus, Search, ChevronRight, CreditCard, Award, FileText, CheckCircle2, Trash2, Calendar, ClipboardList, HelpCircle, XCircle, LogOut, ArrowRight, Eye, EyeOff, Activity, Settings, UserPlus, Flame, MapPin, Share2, Clock } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDoc,
  getDocs
} from "firebase/firestore";

const KUNG_FU_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Branca Ponta Amarela" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Branca Ponta Verde" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Verde" },
  { ordem: 5, graduacao: "4ª Fase", faixa: "Verde Ponta Marrom" },
  { ordem: 6, graduacao: "5ª Fase", faixa: "Marrom" },
  { ordem: 7, graduacao: "6ª Fase", faixa: "Marrom Ponta Preta" },
  { ordem: 8, graduacao: "7ª Fase", faixa: "Preta" },
  { ordem: 9, graduacao: "1º Dhuen", faixa: "Preta" },
  { ordem: 10, graduacao: "2º Dhuen", faixa: "Preta" }
];

const TAI_CHI_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Branca Ponta Amarela" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Branca Ponta Verde" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Verde" }
];

const BOXE_CHINES_GRADUATIONS = [
  { ordem: 1, graduacao: "Preparatória", faixa: "Branca" },
  { ordem: 2, graduacao: "1ª Fase", faixa: "Laranja" },
  { ordem: 3, graduacao: "2ª Fase", faixa: "Vermelha" },
  { ordem: 4, graduacao: "3ª Fase", faixa: "Azul" },
  { ordem: 5, graduacao: "4ª Fase", faixa: "Marrom" },
  { ordem: 6, graduacao: "5ª Fase", faixa: "Preta" }
];

function getSubModalityGradeAndFaixa(modName: string, gradName: string) {
  let list = KUNG_FU_GRADUATIONS;
  if (modName === "Tai Chi Chuan") list = TAI_CHI_GRADUATIONS;
  if (modName === "Boxe Chinês") list = BOXE_CHINES_GRADUATIONS;

  const target = (gradName || "").toLowerCase().trim();

  // Try to find an exact match or substring match or if target contains graduacao or faixa
  const matched = list.find(g => {
    const fullGradAndFaixa = `${g.graduacao} - ${g.faixa}`.toLowerCase();
    return fullGradAndFaixa === target ||
           fullGradAndFaixa.includes(target) || 
           target.includes(g.graduacao.toLowerCase()) ||
           (g.faixa !== "Branca" && target.includes(g.faixa.toLowerCase()));
  });

  if (matched) {
    return {
      graduacao: matched.graduacao,
      faixa: matched.faixa,
      ordem: matched.ordem
    };
  }

  // Fallbacks: if "amarela/laranja/vermelha/verde/azul/marrom/preta"
  if (target.includes("amarela")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("amarela") || g.graduacao.toLowerCase().includes("1ª"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("laranja")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("laranja"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("vermelha")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("vermelha"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("verde")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("verde") || g.graduacao.toLowerCase().includes("3ª"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("azul")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("azul"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("marrom")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("marrom"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }
  if (target.includes("preta")) {
    const item = list.find(g => g.faixa.toLowerCase().includes("preta") || g.graduacao.toLowerCase().includes("preta"));
    if (item) return { graduacao: item.graduacao, faixa: item.faixa, ordem: item.ordem };
  }

  // Default fallback
  return {
    graduacao: list[0].graduacao,
    faixa: list[0].faixa,
    ordem: list[0].ordem
  };
}

export default function App() {
  const { 
    user, 
    userProfile, 
    loading: authLoading, 
    error: authError, 
    sendPasswordReset, 
    signInWithEmail, 
    signUpWithEmail, 
    logout, 
    retryAuth,
    setError: setAuthError
  } = useAuth();

  const isAdmin = userProfile?.role?.toLowerCase() === "admin" || user?.email === "deciopadovanijr@gmail.com";
  const isAluno = userProfile?.role?.toLowerCase() === "aluno";
  const isInstructor = userProfile?.role?.toLowerCase() === "instrutor";

  // Current active viewport role (can be navigated dynamically)
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ADMIN);
  const [showDocs, setShowDocs] = useState<boolean>(false); // set default doc view to false for high-fidelity clean app screen!
  const [activeBottomTab, setActiveBottomTab] = useState<"inicio" | "alunos" | "presencas" | "relatorios" | "menu">("inicio");
  const [sideDrawerOpen, setSideDrawerOpen] = useState<boolean>(false);
  const [pwaModalOpen, setPwaModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [presenceFilter, setPresenceFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // Aluno-specific state
  const [filterStatus, setFilterStatus] = useState<"ATIVOS" | "INATIVOS" | "PENDENTES" | "TODOS">("ATIVOS");
  const [selectedCheckinDate, setSelectedCheckinDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [studentStatusMsg, setStudentStatusMsg] = useState<string>("");
  const [selectedFichaAluno, setSelectedFichaAluno] = useState<Aluno | null>(null);
  const [editingAlunoForForm, setEditingAlunoForForm] = useState<Aluno | null>(null);

  // Exames manual registry states
  const [alunoSelecionadoExame, setAlunoSelecionadoExame] = useState<Aluno | null>(null);
  const [exameModalidade, setExameModalidade] = useState<string>("Kung Fu");
  const [exameGradPretendida, setExameGradPretendida] = useState<string>("Preparatória");
  const [exameData, setExameData] = useState<string>(new Date().toISOString().split("T")[0]);
  const [exameNotaTec, setExameNotaTec] = useState<number>(8);
  const [exameNotaTeor, setExameNotaTeor] = useState<number>(8);
  const [exameAvaliador, setExameAvaliador] = useState<string>("Professor Décio");
  const [exameStatus, setExameStatus] = useState<"Aprovado" | "Reprovado" | "Pendente">("Aprovado");
  const [exameObs, setExameObs] = useState<string>("");

  // Logo asset load tracking states (Permanent Brand Protection Rule)
  const [headerLogoError, setHeaderLogoError] = useState<boolean>(false);
  const [footerLogoError, setFooterLogoError] = useState<boolean>(false);

  // Core synchronized Firestore list states
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [graduacoes, setGraduacoes] = useState<HistoricoGraduacao[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [config, setConfig] = useState<GlobalConfigs>(INITIAL_CONFIG);
  const [exames, setExames] = useState<Exame[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [alunoModalidades, setAlunoModalidades] = useState<AlunoModalidade[]>([]);
  const [graduacoesConfig, setGraduacoesConfig] = useState<GraduacoesConfig[]>([]);
  const [isSyncingUsers, setIsSyncingUsers] = useState<boolean>(false);

  // DB Sync Status States
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [firestoreSyncError, setFirestoreSyncError] = useState<string | null>(null);
  const [retryDbCount, setRetryDbCount] = useState<number>(0);

  // Email and Password Login/Register States
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authNome, setAuthNome] = useState<string>("");
  const [submittingAuth, setSubmittingAuth] = useState<boolean>(false);

  // Authentication Submission Handler using Firebase Authentication and Firestore User Profiles
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthError(null);
    try {
      if (authMode === "login") {
        await signInWithEmail(authEmail, authPassword);
      } else if (authMode === "register") {
        // Default register role is ALUNO
        await signUpWithEmail(authEmail, authPassword, authNome, "ALUNO");
        alert("Sua conta foi criada com sucesso! A administração da academia avaliará seus dados e liberará seu acesso remoto.");
      } else if (authMode === "forgot") {
        await sendPasswordReset(authEmail);
        alert("Seu link de alteração de senha foi disparado por e-mail com sucesso!");
        setAuthMode("login");
      }
    } catch (err: any) {
      console.error("Auth submit failed:", err);
      setAuthError(err.message || "Ocorreu um erro no portal de autenticação.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Set default active view role based on loaded authenticated profile
  useEffect(() => {
    if (userProfile) {
      setActiveRole(userProfile.role as UserRole);
    }
  }, [userProfile]);

  // Establish live onSnapshot subscriptions conforming to standard Security Query Enforcers
  useEffect(() => {
    if (!user || !userProfile) return;

    setDbLoading(true);
    setDbError(null);
    setFirestoreSyncError(null);

    const unsubscribes: (() => void)[] = [];
    const isPowerUser = isAdmin || userProfile.role === "INSTRUTOR";

    // 1. Configs live subscription
    try {
      const configRef = doc(db, "configuracoes", "global_config");
      const unsubConfig = onSnapshot(configRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GlobalConfigs;
          if (data.enderecoAcademia === "Av. Presidente Kennedy, 1234 - Praia Grande, SP") {
            data.enderecoAcademia = "Rua Guimarães Rosa 1191 - Praia Grande, SP";
            updateDoc(configRef, { enderecoAcademia: "Rua Guimarães Rosa 1191 - Praia Grande, SP" }).catch(e => {
              console.warn("Falha ao atualizar o endereço antigo da academia no Firestore:", e);
            });
          }
          setConfig(data);
        } else {
          // Fallback local robusto sem gravação automática não autorizada nas regras de segurança
          setConfig(INITIAL_CONFIG);
        }
      }, (err) => {
        console.warn("Sincronização de configurações ativa localmente (modo offline/fallback).");
        setConfig(INITIAL_CONFIG);
      });
      unsubscribes.push(unsubConfig);
    } catch (e) {
      console.error("Falha ao configurar sincronização de configurações:", e);
    }

    // 2. Turmas live subscription
    try {
      const turmasRef = collection(db, "turmas");
      const unsubTurmas = onSnapshot(turmasRef, async (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("Banco de dados do Firestore limpo para turmas.");
          setTurmas([]);
        } else {
          const list: Turma[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Turma);
          });
          setTurmas(list);
        }
      }, (err) => {
        console.warn("Utilizando cronograma de turmas lido localmente ou vazio.");
        setTurmas([]);
      });
      unsubscribes.push(unsubTurmas);
    } catch (e) {
      console.error("Falha ao configurar sincronização de turmas:", e);
    }

    // 3. Alunos live subscription (using Query Enforcer filters for students to match Firestore Security rules)
    try {
      const alunosRef = collection(db, "alunos");
      const emailVariations = [
        userProfile.email,
        userProfile.email.toLowerCase(),
        userProfile.email.toUpperCase()
      ].filter((v, i, self) => v && self.indexOf(v) === i);

      const q = isPowerUser 
        ? alunosRef 
        : query(alunosRef, where("email", "in", emailVariations));

      const unsubAlunos = onSnapshot( q, async (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("Lista de alunos do Firestore retornou vazia, usando dados em memória.");
          setAlunos(isPowerUser ? INITIAL_ALUNOS : []);
        } else {
          const list: Aluno[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Aluno);
          });
          setAlunos(list);
        }
      }, (err) => {
        console.warn("Utilizando lista de alunos local.");
        setAlunos(isPowerUser ? INITIAL_ALUNOS : []);
      });
      unsubscribes.push(unsubAlunos);
    } catch (e) {
      console.error("Falha ao configurar sincronização de alunos:", e);
    }

    // 4. Mensalidades live subscription
    try {
      const payRef = collection(db, "mensalidades");
      const q = isPowerUser 
        ? payRef 
        : (userProfile.alunoId 
            ? query(payRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubPay = onSnapshot(q, async (querySnapshot) => {
          if (querySnapshot.empty) {
            console.log("Lista de mensalidades do Firestore retornou vazia, usando dados locais.");
            setPagamentos(isPowerUser ? INITIAL_PAGAMENTOS : []);
          } else {
            const list: Pagamento[] = [];
            querySnapshot.forEach((doc) => {
              list.push(doc.data() as Pagamento);
            });
            setPagamentos(list);
          }
        }, (err) => {
          console.warn("Utilizando dados financeiros locais.");
          setPagamentos(isPowerUser ? INITIAL_PAGAMENTOS : []);
        });
        unsubscribes.push(unsubPay);
      } else {
        setPagamentos([]);
      }
    } catch (e) {
      console.error("Falha ao configurar sincronização de mensalidades:", e);
    }

    // 5. Presenças live subscription
    try {
      const presRef = collection(db, "presencas");
      const q = isPowerUser 
        ? presRef 
        : (userProfile.alunoId 
            ? query(presRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubPres = onSnapshot(q, async (querySnapshot) => {
          if (querySnapshot.empty) {
            console.log("Lista de presenças do Firestore retornou vazia, usando histórico padrão.");
            setPresencas(isPowerUser ? INITIAL_PRESENCAS : []);
          } else {
            const list: Presenca[] = [];
            querySnapshot.forEach((doc) => {
              list.push(doc.data() as Presenca);
            });
            setPresencas(list);
          }
        }, (err) => {
          console.warn("Utilizando histórico de presenças local.");
          setPresencas(isPowerUser ? INITIAL_PRESENCAS : []);
        });
        unsubscribes.push(unsubPres);
      } else {
        setPresencas([]);
      }
    } catch (e) {
      console.error("Falha ao configurar sincronização de presenças:", e);
    }

    // 6. Exames live subscription
    try {
      const exRef = collection(db, "graduacoes");
      const q = isPowerUser 
        ? exRef 
        : (userProfile.alunoId 
            ? query(exRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubEx = onSnapshot(q, async (querySnapshot) => {
          if (querySnapshot.empty) {
            console.log("Histórico de graduação do Firestore retornou vazio, usando dados locais.");
            setGraduacoes(isPowerUser ? INITIAL_GRADUACOES : []);
          } else {
            const list: HistoricoGraduacao[] = [];
            querySnapshot.forEach((doc) => {
              list.push(doc.data() as HistoricoGraduacao);
            });
            setGraduacoes(list);
          }
        }, (err) => {
          console.warn("Utilizando histórico de exames/graduações local.");
          setGraduacoes(isPowerUser ? INITIAL_GRADUACOES : []);
        });
        unsubscribes.push(unsubEx);
      } else {
        setGraduacoes([]);
      }
    } catch (e) {
      console.error("Falha ao configurar sincronização de exames/graduações:", e);
    }

    // 6.2. exames live subscription
    try {
      const examesRef = collection(db, "exames");
      const q = isPowerUser 
        ? examesRef 
        : (userProfile.alunoId 
            ? query(examesRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubExames = onSnapshot(q, (querySnapshot) => {
          const list: Exame[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Exame);
          });
          setExames(list);
        });
        unsubscribes.push(unsubExames);
      } else {
        setExames([]);
      }
    } catch (e) {
      console.error("Falha ao sincronizar exames:", e);
    }

    // 6.3. produtos live subscription
    try {
      const produtosRef = collection(db, "produtos");
      const unsubProdutos = onSnapshot(produtosRef, (querySnapshot) => {
        const list: Produto[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Produto);
        });
        setProdutos(list);
      });
      unsubscribes.push(unsubProdutos);
    } catch (e) {
      console.error("Falha ao sincronizar produtos:", e);
    }

    // 6.4. vendas live subscription
    try {
      const vendasRef = collection(db, "vendas");
      const q = isPowerUser 
        ? vendasRef 
        : (userProfile.alunoId 
            ? query(vendasRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubVendas = onSnapshot(q, (querySnapshot) => {
          const list: Venda[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Venda);
          });
          setVendas(list);
        });
        unsubscribes.push(unsubVendas);
      } else {
        setVendas([]);
      }
    } catch (e) {
      console.error("Falha ao sincronizar vendas:", e);
    }

    // 6.5. familias live subscription
    try {
      const familiasRef = collection(db, "familias");
      const unsubFamilias = onSnapshot(familiasRef, (querySnapshot) => {
        const list: Familia[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Familia);
        });
        setFamilias(list);
      });
      unsubscribes.push(unsubFamilias);
    } catch (e) {
      console.error("Falha ao sincronizar familias:", e);
    }

    // 6.6. instrutores live subscription
    try {
      const instRef = collection(db, "instrutores");
      const unsubInst = onSnapshot(instRef, (querySnapshot) => {
        const list: Instrutor[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Instrutor);
        });
        setInstrutores(list);
      }, (err) => {
        console.warn("Utilizando lista de instrutores vazia localmente:", err);
        setInstrutores([]);
      });
      unsubscribes.push(unsubInst);
    } catch (e) {
      console.error("Falha ao sincronizar instrutores:", e);
    }

    // 6.7. aluno_modalidades live subscription
    try {
      const amRef = collection(db, "aluno_modalidades");
      const q = isPowerUser 
        ? amRef 
        : (userProfile.alunoId 
            ? query(amRef, where("alunoId", "==", userProfile.alunoId)) 
            : null);

      if (q) {
        const unsubAm = onSnapshot(q, (querySnapshot) => {
          const list: AlunoModalidade[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as AlunoModalidade);
          });
          setAlunoModalidades(list);
        }, (err) => {
          console.warn("Utilizando lista de aluno_modalidades vazia localmente:", err);
        });
        unsubscribes.push(unsubAm);
      } else {
        setAlunoModalidades([]);
      }
    } catch (e) {
      console.error("Falha ao sincronizar aluno_modalidades:", e);
    }

    // 6.8. graduacoes_config live subscription
    try {
      const gcRef = collection(db, "graduacoes_config");
      const unsubGc = onSnapshot(gcRef, (querySnapshot) => {
        const list: GraduacoesConfig[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as GraduacoesConfig);
        });
        setGraduacoesConfig(list);
      }, (err) => {
        console.warn("Utilizando lista de graduacoes_config vazia localmente:", err);
      });
      unsubscribes.push(unsubGc);
    } catch (e) {
      console.error("Falha ao sincronizar graduacoes_config:", e);
    }

    // Finish loader
    const timer = setTimeout(() => {
      setDbLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [user, userProfile, retryDbCount]);

  // Rule 2 check: Email deciopadovanijr@gmail.com or profile role is auto-recognized as Master Admin
  const isCurrentlyAdminByEmail = userProfile?.role === "ADMIN" || user?.email === "deciopadovanijr@gmail.com";

  // Helper to align a student's enrolled modalities with matching entries in "aluno_modalidades"
  const syncStudentModalitiesRecords = async (studentId: string, newAlunoData: any) => {
    if (!studentId || studentId === "undefined") {
      console.warn("syncStudentModalitiesRecords abortado: ID do aluno está indefinido.");
      return;
    }
    if (!newAlunoData) {
      console.warn("syncStudentModalitiesRecords abortado: dados do aluno estão vazios.");
      return;
    }
    try {
      const officialMods = ["Kung Fu", "Tai Chi Chuan", "Boxe Chinês"];
      let activeModsInput: string[] = [];
      if (newAlunoData.modalidades && newAlunoData.modalidades.length > 0) {
        activeModsInput = newAlunoData.modalidades;
      } else if (newAlunoData.modalidade) {
        activeModsInput = String(newAlunoData.modalidade).split(",").map((x: string) => x.trim()).filter(Boolean);
      } else {
        activeModsInput = ["Kung Fu"];
      }

      const normalizedActiveMods = activeModsInput.map((m: string) => {
        const lowerM = (m || "").toLowerCase();
        if (lowerM.includes("tai chi") || lowerM.includes("taichi")) return "Tai Chi Chuan";
        if (lowerM.includes("boxe") || lowerM.includes("sanda")) return "Boxe Chinês";
        return "Kung Fu";
      });

      for (const modName of officialMods) {
        const isEnrolled = (normalizedActiveMods as string[]).includes(modName);
        const alModId = `am_${studentId}_${modName.replace(/\s+/g, "")}`;
        const existingRecord = alunoModalidades.find(am => am && am.alunoId === studentId && am.modalidade === modName);

        if (isEnrolled) {
          if (existingRecord) {
            await setDoc(doc(db, "aluno_modalidades", alModId), {
              ...existingRecord,
              ativo: true
            }, { merge: true });
          } else {
            const legacyRank = newAlunoData.graduacao || newAlunoData.graduacaoAtual || "Preparatória - Branca";
            const gradeDetails = getSubModalityGradeAndFaixa(modName, legacyRank);
            await setDoc(doc(db, "aluno_modalidades", alModId), {
              id: alModId,
              alunoId: studentId,
              modalidade: modName,
              graduacaoAtual: gradeDetails.graduacao || "Preparatória",
              faixaAtual: gradeDetails.faixa || "Branca",
              ordemGraduacao: gradeDetails.ordem || 1,
              dataUltimaGraduacao: newAlunoData.dataUltimaGraduacao || new Date().toISOString().split("T")[0],
              ativo: true
            });
          }
        } else {
          if (existingRecord) {
            await setDoc(doc(db, "aluno_modalidades", alModId), {
              ...existingRecord,
              ativo: false
            }, { merge: true });
          }
        }
      }
    } catch (err) {
      console.error("Erro ao sincronizar modalidades do aluno no Firestore:", err);
    }
  };

  // Automatic background migration logic for legacy students
  useEffect(() => {
    if (!isAdmin && userProfile?.role !== "INSTRUTOR") return;
    if (alunos.length === 0) return;

    const migrateLegacyStudentsAndExams = async () => {
      for (const student of alunos) {
        if (!student || !student.id || student.id === "undefined") {
          continue;
        }

        let studentMods: string[] = [];
        if (student.modalidades && student.modalidades.length > 0) {
          studentMods = student.modalidades;
        } else if (student.modalidade) {
          studentMods = String(student.modalidade).split(",").map(x => x.trim()).filter(Boolean);
        } else {
          studentMods = ["Kung Fu"];
        }

        const normalizedMods = studentMods.map(m => {
          const lowerM = (m || "").toLowerCase();
          if (lowerM.includes("tai chi") || lowerM.includes("taichi")) return "Tai Chi Chuan";
          if (lowerM.includes("boxe") || lowerM.includes("sanda")) return "Boxe Chinês";
          return "Kung Fu";
        });

        for (const modName of normalizedMods) {
          const alModId = `am_${student.id}_${modName.replace(/\s+/g, "")}`;
          const existing = alunoModalidades.find(am => am && am.alunoId === student.id && am.modalidade === modName);
          
          if (!existing) {
            console.log(`Migrando estrutura do aluno legado ${student.nome || "Sem Nome"} para a modalidade ${modName}`);
            const legacyRank = student.graduacao || student.graduacaoAtual || "Preparatória - Branca";
            const gradeDetails = getSubModalityGradeAndFaixa(modName, legacyRank);
            
            await setDoc(doc(db, "aluno_modalidades", alModId), {
              id: alModId,
              alunoId: student.id,
              modalidade: modName,
              graduacaoAtual: gradeDetails.graduacao || "Preparatória",
              faixaAtual: gradeDetails.faixa || "Branca",
              ordemGraduacao: gradeDetails.ordem || 1,
              dataUltimaGraduacao: student.dataUltimaGraduacao || new Date().toISOString().split("T")[0],
              ativo: true
            });
          }
        }
      }
    };

    const timer = setTimeout(() => {
      migrateLegacyStudentsAndExams().catch(err => {
        console.error("Falha ao migrar estrutura de modalidades dos alunos:", err);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [alunos, alunoModalidades, isAdmin, userProfile]);

  // 1. ADD Student (Admin Form mapped to Firestore)
  const handleAddAluno = async (newAlunoData: any) => {
    try {
      const formEmail = newAlunoData.email ? newAlunoData.email.trim().toLowerCase() : "";
      if (newAlunoData.id) {
        // Modo de edição
        const existingId = newAlunoData.id;
        const studentRef = doc(db, "alunos", existingId);

        await updateDoc(studentRef, {
          nome: newAlunoData.nome,
          email: formEmail,
          celular: newAlunoData.celular || "",
          cpf: newAlunoData.cpf,
          rg: newAlunoData.rg || "",
          dataNascimento: newAlunoData.dataNascimento || "",
          graduacao: newAlunoData.graduacao || "Preparatória - Branca",
          graduacaoAtual: newAlunoData.graduacaoAtual || newAlunoData.graduacao || "Preparatória - Branca",
          turmaId: newAlunoData.turmaId,
          planoTipo: newAlunoData.planoTipo || "2x_semana",
          mensalidade: newAlunoData.mensalidade || 160,
          descontoFamiliaTipo: newAlunoData.descontoFamiliaTipo || "nenhum",
          descontoFamiliaValor: newAlunoData.descontoFamiliaValor || 0,
          observacoes: newAlunoData.observacoes || "",
          endereco: newAlunoData.endereco || "",
          telefone: newAlunoData.telefone || newAlunoData.celular || "",
          whatsapp: newAlunoData.whatsapp || newAlunoData.celular || "",
          responsavel: newAlunoData.responsavel || "",
          foto: newAlunoData.foto || "",
          dataMatricula: newAlunoData.dataMatricula || new Date().toISOString().split("T")[0],
          modalidade: newAlunoData.modalidade || "Kung Fu",
          statusFinanceiro: newAlunoData.statusFinanceiro || "EM DIA",
          status: newAlunoData.status || "Ativo"
        });

        await syncStudentModalitiesRecords(existingId, newAlunoData);
        alert("Dados do aluno atualizados com sucesso!");
        return;
      }

      const newId = `stu_${Date.now()}`;
      const newAluno: Aluno = {
        ...newAlunoData,
        email: formEmail,
        id: newId,
        userId: newAlunoData.userId || "",
        statusFinanceiro: newAlunoData.statusFinanceiro || "EM DIA",
        graduacaoAtual: newAlunoData.graduacaoAtual || newAlunoData.graduacao || "Preparatória - Branca",
        graduacao: newAlunoData.graduacao || "Preparatória - Branca",
        telefone: newAlunoData.telefone || newAlunoData.celular || "",
        whatsapp: newAlunoData.whatsapp || newAlunoData.celular || "",
        status: newAlunoData.status || "Ativo",
        modalidade: newAlunoData.modalidade || "Kung Fu",
        foto: newAlunoData.foto || "",
        responsavel: newAlunoData.responsavel || "",
        rg: newAlunoData.rg || "",
        dataMatricula: newAlunoData.dataMatricula || new Date().toISOString().split("T")[0],
        dataUltimaGraduacao: newAlunoData.dataUltimaGraduacao || new Date().toISOString().split("T")[0]
      };

      await setDoc(doc(db, "alunos", newId), newAluno);
      await syncStudentModalitiesRecords(newId, newAlunoData);

      // Automatically generate first invoice honoring net family discount calculation!
      const discountVal = newAluno.descontoFamiliaTipo === "percentual"
        ? (newAluno.mensalidade || 160) - ((newAluno.mensalidade || 160) * ((newAluno.descontoFamiliaValor || 0) / 100))
        : newAluno.descontoFamiliaTipo === "fixo"
          ? Math.max(0, (newAluno.mensalidade || 160) - (newAluno.descontoFamiliaValor || 0))
          : (newAluno.mensalidade || 160);

      const newPayment: Pagamento = {
        id: `pay_${Date.now()}`,
        alunoId: newId,
        alunoNome: newAluno.nome,
        valor: discountVal,
        desconto: (newAluno.mensalidade || 160) - discountVal,
        valorFinal: discountVal,
        referencia: new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }),
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: newAluno.statusFinanceiro === "EM DIA" ? "Pago" : "Pendente"
      };
      
      await setDoc(doc(db, "mensalidades", newPayment.id), newPayment);
      alert("Aluno cadastrado com sucesso!");
    } catch (err) {
      console.error("handleAddAluno failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "alunos");
      } catch (e: any) {
        alert("Erro ao salvar aluno no Firestore: " + e.message);
      }
    }
  };

  // 1.5. UPDATE Student Profile (Self profile update for regular students)
  const handleUpdateCadastroProfile = async (dados: { 
    nome: string; 
    celular: string; 
    endereco: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    foto?: string;
    responsavel?: string;
  }) => {
    if (!user || !userProfile) return;
    try {
      // 1. Opcionalmente atualiza também na coleção de usuários do Auth (users)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        nome: dados.nome,
        celular: dados.celular || "",
        endereco: dados.endereco || "",
        ...(dados.cpf ? { cpf: dados.cpf } : {}),
        ...(dados.rg ? { rg: dados.rg } : {}),
        ...(dados.dataNascimento ? { dataNascimento: dados.dataNascimento } : {}),
        ...(dados.foto ? { foto: dados.foto } : {}),
        ...(dados.responsavel ? { responsavel: dados.responsavel } : {})
      });

      // 2. Se o usuário atual possui alunoId, atualiza também a ficha do aluno (alunos)
      const targetAlunoId = userProfile.alunoId || `stu_${user.uid}`;
      const studentRef = doc(db, "alunos", targetAlunoId);

      // Calcular a completude com os novos dados
      const currentData = alunos.find(a => a.id === targetAlunoId);
      
      const updatedData = {
        ...currentData,
        nome: dados.nome,
        celular: dados.celular || "",
        telefone: dados.celular || "",
        endereco: dados.endereco || "",
        cpf: dados.cpf || currentData?.cpf || "",
        rg: dados.rg || currentData?.rg || "",
        dataNascimento: dados.dataNascimento || currentData?.dataNascimento || "2000-01-01",
        foto: dados.foto || currentData?.foto || "",
        responsavel: dados.responsavel || currentData?.responsavel || ""
      };

      const isMenor = (() => {
        if (!updatedData.dataNascimento || updatedData.dataNascimento === "2000-01-01") return false;
        try {
          const nasc = new Date(updatedData.dataNascimento);
          const idadeDifMs = Date.now() - nasc.getTime();
          const idadeDate = new Date(idadeDifMs);
          const idade = Math.abs(idadeDate.getUTCFullYear() - 1970);
          return idade < 18;
        } catch {
          return false;
        }
      })();

      let completude = 0;
      if (updatedData.cpf && updatedData.cpf.trim() !== "" && updatedData.cpf !== "(Não cadastrado)") completude += 15;
      if (updatedData.rg && updatedData.rg.trim() !== "") completude += 15;
      if (updatedData.dataNascimento && updatedData.dataNascimento.trim() !== "" && updatedData.dataNascimento !== "2000-01-01") completude += 15;
      const phone = updatedData.celular || updatedData.telefone;
      if (phone && phone.trim() !== "" && phone !== "(Não cadastrado)") completude += 15;
      if (updatedData.endereco && updatedData.endereco.trim() !== "") completude += 15;
      if (updatedData.foto && updatedData.foto.trim() !== "") completude += 10;
      
      if (isMenor) {
        if (updatedData.responsavel && updatedData.responsavel.trim() !== "") completude += 15;
      } else {
        completude += 15;
      }

      let novoStatus = currentData?.status || "PENDENTE";
      if ((novoStatus === "PENDENTE" || novoStatus === "Inativo") && completude >= 100) {
        novoStatus = "ATIVO";
        alert("Parabéns! Ficha cadastral COMPLETADA com sucesso. Seu status foi promovido para ATIVO!");
      }

      // Procurar se documento existe antes de atualizar
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const isUserAdminOrInstructor = userProfile?.role === "ADMIN" || userProfile?.role === "INSTRUTOR" || user?.email === "deciopadovanijr@gmail.com";
        if (isUserAdminOrInstructor) {
          await updateDoc(studentRef, {
            nome: dados.nome,
            celular: dados.celular || "",
            telefone: dados.celular || "",
            endereco: dados.endereco || "",
            cpf: dados.cpf || "",
            rg: dados.rg || "",
            dataNascimento: dados.dataNascimento || "2000-01-01",
            foto: dados.foto || "",
            responsavel: dados.responsavel || "",
            status: novoStatus
          });
        } else {
          // ALUNO: Só pode atualizar os campos cadastrais permitidos para evitar violação de regras e por segurança
          await updateDoc(studentRef, {
            celular: dados.celular || "",
            telefone: dados.celular || "",
            endereco: dados.endereco || "",
            cpf: dados.cpf || "",
            rg: dados.rg || "",
            foto: dados.foto || "",
            responsavel: dados.responsavel || ""
          });
        }
      } else {
        // Se o documento na coleção 'alunos' não existia, criamos agora de forma consistente
        const todayString = new Date().toISOString().split("T")[0];
        const newAluno: Aluno = {
          id: targetAlunoId,
          userId: user.uid,
          nome: dados.nome,
          email: user.email || "",
          cpf: dados.cpf || "",
          rg: dados.rg || "",
          dataNascimento: dados.dataNascimento || "2000-01-01",
          telefone: dados.celular || "",
          whatsapp: dados.celular || "",
          endereco: dados.endereco || "",
          responsavel: dados.responsavel || "",
          foto: dados.foto || "",
          dataMatricula: todayString,
          graduacaoAtual: "Preparatória - Branca",
          dataUltimaGraduacao: todayString,
          status: novoStatus,
          turmaId: "turma_1",
          modalidade: "Não definida",
          observacoes: "Ficha criada via preenchimento de perfil.",
          statusFinanceiro: "PENDENTE",
          
          graduacao: "Preparatória - Branca",
          celular: dados.celular || "",
          planoTipo: "2x_semana",
          mensalidade: 160,
          descontoFamiliaTipo: "nenhum",
          descontoFamiliaValor: 0
        };
        await setDoc(studentRef, newAluno);
        
        // Linkar na conta de users também
        await updateDoc(userRef, { alunoId: targetAlunoId });
      }

      alert("Cadastro atualizado com sucesso no Firestore!");
    } catch (e: any) {
      console.error("Erro ao atualizar cadastro:", e);
      alert("Falha ao atualizar dados de cadastro: " + e.message);
    }
  };

  // 2. DELETE Student (Admin action mapped to logical INATIVO status in Firestore)
  const handleDeleteAluno = async (id: string) => {
    try {
      // Alterar status para INATIVO no documento do aluno no Firestore
      await updateDoc(doc(db, "alunos", id), {
        status: "INATIVO"
      });

      alert("Ficha do aluno inativada com sucesso! Todo o histórico de cobranças, presenças, exames e graduações foi preservado intacto.");
    } catch (err: any) {
      console.error("handleDeleteAluno (inativação lógica) failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `alunos/${id}`);
      } catch (e: any) {
        alert("Erro ao inativar aluno do Firestore: " + e.message);
      }
    }
  };

  const handleExcluirAluno = handleDeleteAluno;

  // 2.7. CRUD INTEGRADO PARA INSTRUTORES REAIS (FASE 4 - PARTE 1)
  const handleSaveInstrutor = async (instData: Omit<Instrutor, "id"> & { id?: string }) => {
    try {
      const id = instData.id || `inst_${Date.now()}`;
      const finalInst: Instrutor = {
        ...instData,
        id,
        ativo: instData.ativo !== undefined ? instData.ativo : true
      };
      await setDoc(doc(db, "instrutores", id), finalInst);
    } catch (err: any) {
      console.error("handleSaveInstrutor failed:", err);
      alert("Erro ao gravar instrutor: " + err.message);
    }
  };

  const handleDeleteInstrutor = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este instrutor?")) return;
    try {
      // Desvincular de turmas ativas primeiro
      const classesToUpdate = turmas.filter(t => t.instrutorId === id);
      for (const t of classesToUpdate) {
        await updateDoc(doc(db, "turmas", t.id), {
          instrutorId: "",
          instrutorNome: ""
        });
      }
      await deleteDoc(doc(db, "instrutores", id));
      alert("Instrutor e seus vínculos em turmas foram removidos com sucesso!");
    } catch (err: any) {
      console.error("handleDeleteInstrutor failed:", err);
      alert("Erro ao remover instrutor: " + err.message);
    }
  };

  const handleUpdateTurmaInstrutor = async (turmaId: string, instrutorId: string, instrutorNome: string) => {
    try {
      await updateDoc(doc(db, "turmas", turmaId), {
        instrutorId,
        instrutorNome
      });
      alert("Vínculo de instrutor da turma atualizado com sucesso!");
    } catch (err: any) {
      console.error("handleUpdateTurmaInstrutor failed:", err);
      alert("Erro ao vincular instrutor à turma: " + err.message);
    }
  };

  // 2.5. SYNCHRONIZE Users as Alunos (Promoting all authenticated student logins to academic roster)
  const handleSyncUsersAsAlunosDirect = async () => {
    setIsSyncingUsers(true);
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const allUsers: any[] = [];
      querySnapshot.forEach((docSnap) => {
        allUsers.push({ id: docSnap.id, ...docSnap.data() });
      });

      // CARREGAR ALUNOS DO FIRESTORE EM TEMPO REAL PARA PROTEÇÃO EXTRA CONTRA DUPLICADOS E INATIVADOS
      const dbAlunosSnap = await getDocs(collection(db, "alunos"));
      const dbAlunosList = dbAlunosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Aluno));

      let addedCount = 0;
      const todayString = new Date().toISOString().split("T")[0];
      const nextMonthString = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const currentRef = new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

      for (const u of allUsers) {
        // Exclude admin role or principal administrator Decio
        const isAdmin = u.role === "ADMIN" || u.email?.toLowerCase() === "deciopadovanijr@gmail.com";
        if (isAdmin) continue;

        // Check if user is already an Aluno (even if logical/inactivated, checking real DB list)
        const isAlreadyAluno = dbAlunosList.some(
          (a) => a.userId === u.id || (a.email && a.email.toLowerCase() === u.email?.toLowerCase()) || a.id === `stu_${u.id}`
        ) || !!u.alunoId;

        if (!isAlreadyAluno) {
          const studentId = `stu_${u.id}`;
          const defaultTurmaId = turmas.length > 0 ? turmas[0].id : "turma_1";

          const newAluno: Aluno = {
            id: studentId,
            userId: u.id,
            nome: u.nome || u.email?.split("@")[0] || "Aluno Sincronizado",
            email: u.email || "",
            cpf: u.cpf || "",
            rg: u.rg || "",
            dataNascimento: u.dataNascimento || "2000-01-01",
            telefone: u.telefone || u.celular || "",
            whatsapp: u.whatsapp || u.celular || "",
            endereco: u.endereco || "",
            responsavel: u.responsavel || "",
            foto: u.foto || "",
            dataMatricula: todayString,
            graduacaoAtual: "Preparatória - Branca",
            dataUltimaGraduacao: todayString,
            status: "PENDENTE", // Sincronizados iniciam como PENDENTE para auditoria operacional
            turmaId: u.turmaId || defaultTurmaId,
            modalidade: "Não definida", // Inicialmente não definida
            observacoes: "Usuário sincronizado do sistema de autenticação como PENDENTE.",
            statusFinanceiro: "PENDENTE",
            
            // Compatibility fields
            graduacao: "Preparatória - Branca",
            celular: u.telefone || u.celular || "",
            planoTipo: "2x_semana",
            mensalidade: 160,
            descontoFamiliaTipo: "nenhum",
            descontoFamiliaValor: 0
          };

          // 1. Create Aluno record
          await setDoc(doc(db, "alunos", studentId), newAluno);

          // 2. Link userId to student (Update user document)
          await updateDoc(doc(db, "users", u.id), {
            alunoId: studentId
          });

          // 3. Create initial payment record (First monthly fee)
          const paymentId = `pay_${Date.now()}_${u.id.substring(0, 4)}`;
          const newPayment: Pagamento = {
            id: paymentId,
            alunoId: studentId,
            alunoNome: newAluno.nome,
            valor: 160,
            desconto: 0,
            valorFinal: 160,
            referencia: currentRef,
            dataVencimento: nextMonthString,
            vencimento: nextMonthString,
            status: "Pendente"
          };

          await setDoc(doc(db, "mensalidades", paymentId), newPayment);

          addedCount++;
        }
      }

      alert(`Sincronização blindada concluída! ${addedCount} novos usuários foram matriculados como alunos pendentes.`);
    } catch (err: any) {
      console.error("Sincronização de usuários falhou:", err);
      alert("Erro ao sincronizar usuários: " + err.message);
    } finally {
      setIsSyncingUsers(false);
    }
  };

  // 2.7. Registrar / Editar Exame de Faixa (Persistência real na coleção exames do Firestore)
  const handleSaveExame = async (exameDataObj: Omit<Exame, "id" | "alunoId" | "alunoNome"> & { modalidade?: string }, aluno: Aluno) => {
    try {
      const newExId = "ex_" + Date.now();
      const chosenMod = exameDataObj.modalidade || exameModalidade || "Kung Fu";
      const novoExame: Exame & { modalidade?: string } = {
        id: newExId,
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        modalidade: chosenMod,
        ...exameDataObj
      };
      
      // Persiste na coleção "exames"
      await setDoc(doc(db, "exames", newExId), novoExame);
      
      // Se aprovado, atualiza também a faixa graduação atual do aluno na coleção "alunos" E "aluno_modalidades"
      if (exameDataObj.resultado === "Aprovado" || exameDataObj.resultado === "APROVADO") {
        // Encontra os detalhes oficiais da graduação promovida
        const gradeDetails = getSubModalityGradeAndFaixa(chosenMod, exameDataObj.graduacaoPretendida);

        // Atualiza a coleção aluno_modalidades
        const alModId = `am_${aluno.id}_${chosenMod.replace(/\s+/g, "")}`;
        await setDoc(doc(db, "aluno_modalidades", alModId), {
          id: alModId,
          alunoId: aluno.id,
          modalidade: chosenMod,
          graduacaoAtual: gradeDetails.graduacao,
          faixaAtual: gradeDetails.faixa,
          ordemGraduacao: gradeDetails.ordem,
          dataUltimaGraduacao: exameDataObj.dataExame,
          ativo: true
        });

        // Também atualiza o documento do aluno principal (para compatibilidade retrô sem quebrar telas existentes)
        await updateDoc(doc(db, "alunos", aluno.id), {
          graduacao: `${gradeDetails.graduacao} - ${gradeDetails.faixa}`,
          graduacaoAtual: `${gradeDetails.graduacao} - ${gradeDetails.faixa}`,
          dataUltimaGraduacao: exameDataObj.dataExame
        });

        // E cria registro em graduacoes para compor histórico reativo de sashes
        const newGradId = "grad_" + Date.now();
        await setDoc(doc(db, "graduacoes", newGradId), {
          id: newGradId,
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          modalidade: chosenMod,
          graduacaoAnterior: aluno.graduacao || "Preparatória - Branca",
          graduacaoNova: `${gradeDetails.graduacao} - ${gradeDetails.faixa}`,
          dataGraduacao: exameDataObj.dataExame,
          avaliador: exameDataObj.avaliador,
          resultado: "Aprovado"
        });
      }
      
      alert(`Exame de faixa gravado com sucesso no Firestore para ${aluno.nome}!`);
    } catch (e: any) {
      console.error("Falha ao registrar exame de faixa no Firestore:", e);
      alert("Erro ao registrar exame: " + e.message);
    }
  };

  // 3. UPDATE Financial Status (Admin selector mapped to Firestore)
  const handleUpdateStatusFinanceiro = async (id: string, novoStatus: "Em Dia" | "Atrasado" | "Pendente") => {
    try {
      await updateDoc(doc(db, "alunos", id), { statusFinanceiro: novoStatus });

      // Match the invoice status
      const studentInvoice = pagamentos.find(p => p.alunoId === id && p.status !== "Pago");
      if (studentInvoice) {
        await updateDoc(doc(db, "mensalidades", studentInvoice.id), {
          status: novoStatus === "Em Dia" ? "Pago" : novoStatus
        });
      }
    } catch (err) {
      console.error("handleUpdateStatusFinanceiro failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `alunos/${id}`);
      } catch (e: any) {
        alert("Erro ao atualizar financeiro no Firestore: " + e.message);
      }
    }
  };

  // 4. RECORD attendance rolls (Instructor sheet mapped to Firestore)
  const handleAddPresenca = async (record: Presenca) => {
    try {
      const targetId = record.id && !record.id.startsWith("temp") ? record.id : `pres_${Date.now()}`;
      const newRecord = { ...record, id: targetId };
      await setDoc(doc(db, "presencas", targetId), newRecord);
    } catch (err) {
      console.error("handleAddPresenca failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "presencas");
      } catch (e: any) {
        alert("Erro ao registrar presença no Firestore: " + e.message);
      }
    }
  };

  // 5. EVALUATE belt promotion (Instructor scoring board mapped to Firestore)
  const handleUpdateGraduacao = async (
    gradId: string,
    notaTec: number,
    notaPhil: number,
    status: "A provado" | "Aprovado" | "Pendente"
  ) => {
    try {
      const targetGrad = graduacoes.find(g => g.id === gradId);
      if (!targetGrad) return;

      const normalizedStatus = status === "A provado" ? "Aprovado" : status;

      await updateDoc(doc(db, "graduacoes", gradId), {
        notaTecnica: notaTec,
        notaFilosofica: notaPhil,
        status: normalizedStatus
      });

      if (normalizedStatus === "Aprovado") {
        await updateDoc(doc(db, "alunos", targetGrad.alunoId), {
          graduacao: targetGrad.sashNovo,
          graduacaoAtual: targetGrad.sashNovo,
          dataUltimaGraduacao: new Date().toISOString().split("T")[0]
        });
      }
    } catch (err) {
      console.error("handleUpdateGraduacao failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `graduacoes/${gradId}`);
      } catch (e: any) {
        alert("Erro ao atualizar graduação no Firestore: " + e.message);
      }
    }
  };

  // 6. UPDATE GLOBAL CONFIGURATIONS (Requirement 7 mapped to Firestore)
  const handleUpdateConfig = async (newCfg: GlobalConfigs) => {
    try {
      await setDoc(doc(db, "configuracoes", "global_config"), newCfg);
    } catch (err) {
      console.error("handleUpdateConfig failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "configuracoes/global_config");
      } catch (e: any) {
        alert("Erro ao salvar configurações no Firestore: " + e.message);
      }
    }
  };

  // --- MÓDULOS OPERACIONAIS (FASE 4) COMPLETOS ---
  const handleSaveMensalidade = async (m: Pagamento) => {
    try {
      const id = m.id || `mensalidade_${Date.now()}`;
      const finalM = { 
        ...m, 
        id,
        referencia: m.competencia || m.referencia || "01/2026"
      };
      await setDoc(doc(db, "mensalidades", id), finalM);
    } catch (err: any) {
      console.error("handleSaveMensalidade failed:", err);
      alert("Erro ao salvar mensalidade: " + err.message);
    }
  };

  const handleDeleteMensalidade = async (id: string) => {
    try {
      await deleteDoc(doc(db, "mensalidades", id));
    } catch (err: any) {
      console.error("handleDeleteMensalidade failed:", err);
      alert("Erro ao excluir mensalidade: " + err.message);
    }
  };

  const handleGenerateMensalidadesLote = async (competencia: string, vencimento: string, valorPadrao: number) => {
    try {
      const alunosAtivos = alunos.filter(a => {
        const s = (a.status || "").toUpperCase().trim();
        return s === "ATIVO" || s === "" || a.status === "Ativo";
      });

      if (alunosAtivos.length === 0) {
        alert("Nenhum aluno ativo encontrado para gerar mensalidades.");
        return;
      }

      let count = 0;
      for (const al of alunosAtivos) {
        const exists = pagamentos.some(p => p.alunoId === al.id && (p.competencia === competencia || p.referencia === competencia));
        if (exists) continue;

        const id = `mensalidade_bulk_${al.id}_${Date.now()}_${count}`;
        const val = al.mensalidade !== undefined ? al.mensalidade : valorPadrao;
        const newM: Pagamento = {
          id,
          alunoId: al.id,
          alunoNome: al.nome,
          referencia: competencia,
          competencia: competencia,
          vencimento: vencimento,
          valor: val,
          valorFinal: val,
          status: "PENDENTE",
          observacoes: "Gerada em lote."
        };
        await setDoc(doc(db, "mensalidades", id), newM);
        count++;
      }
      alert(`${count} mensalidades foram geradas com sucesso para a competência ${competencia}!`);
    } catch (err: any) {
      console.error("handleGenerateMensalidadesLote failed:", err);
      alert("Erro ao gerar mensalidades em lote: " + err.message);
    }
  };

  const handleSaveProduto = async (p: Produto) => {
    try {
      const id = p.id || `produto_${Date.now()}`;
      const finalP = { ...p, id, valor: p.valorVenda };
      await setDoc(doc(db, "produtos", id), finalP);
    } catch (err: any) {
      console.error("handleSaveProduto failed:", err);
      alert("Erro ao salvar produto: " + err.message);
    }
  };

  const handleDeleteProduto = async (id: string) => {
    try {
      await deleteDoc(doc(db, "produtos", id));
    } catch (err: any) {
      console.error("handleDeleteProduto failed:", err);
      alert("Erro ao excluir produto: " + err.message);
    }
  };

  const handleSaveVenda = async (v: Venda) => {
    try {
      const id = v.id || `venda_${Date.now()}`;
      await setDoc(doc(db, "vendas", id), v);

      const pr = produtos.find(p => p.id === v.produtoId);
      if (pr) {
        const newEstoque = Math.max(0, pr.estoque - v.quantidade);
        await updateDoc(doc(db, "produtos", v.produtoId), { estoque: newEstoque });
      }
    } catch (err: any) {
      console.error("handleSaveVenda failed:", err);
      alert("Erro ao registrar venda: " + err.message);
    }
  };

  const handleSaveFamilia = async (f: Familia) => {
    try {
      const id = f.id || `familia_${Date.now()}`;
      await setDoc(doc(db, "familias", id), { ...f, id });
    } catch (err: any) {
      console.error("handleSaveFamilia failed:", err);
      alert("Erro ao salvar família: " + err.message);
    }
  };

  const handleDeleteFamilia = async (id: string) => {
    try {
      await deleteDoc(doc(db, "familias", id));
    } catch (err: any) {
      console.error("handleDeleteFamilia failed:", err);
      alert("Erro ao remover família: " + err.message);
    }
  };

  // 7. STUDENT PRESENCE REQUEST VIA APP (Requirement 3 mapped to Firestore)
  const handleSolicitarPresenca = async (turmaId: string, data: string) => {
    try {
      const activeStudent = userProfile?.alunoId 
        ? alunos.find(a => a.id === userProfile.alunoId) 
        : (alunos.find(a => a.id === "stu_1") || alunos[0]);

      if (!activeStudent) {
        alert("Matrícula de aluno não encontrada no sistema de registro.");
        return;
      }

      const isInactive = (activeStudent.status || "").toUpperCase().trim() === "INATIVO";
      if (isInactive) {
        alert("Acesso suspenso: Alunos inativos não podem solicitar presença ou realizar novos check-ins.");
        return;
      }

      const targetTurma = turmas.find(t => t.id === turmaId);
      const newPresenca: Presenca = {
        id: `pres_req_${Date.now()}`,
        turmaId,
        alunoId: activeStudent.id,
        alunoNome: activeStudent.nome,
        data,
        status: "PENDING",
        solicitadoPorAluno: true,
        modalidade: targetTurma?.nomeEstilo || "Kung Fu",
        horario: targetTurma?.horario || "15:00 - 16:00",
        confirmadoPor: ""
      };

      await setDoc(doc(db, "presencas", newPresenca.id), newPresenca);
    } catch (err) {
      console.error("handleSolicitarPresenca failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "presencas");
      } catch (e: any) {
        alert("Erro ao solicitar presença no Firestore: " + e.message);
      }
    }
  };

  // 8. APPROVE OR REJECT CHECKINS (Requirement 3 mapped to Firestore)
  const handleDecideCheckin = async (presId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateDoc(doc(db, "presencas", presId), { status });
    } catch (err) {
      console.error("handleDecideCheckin failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `presencas/${presId}`);
      } catch (e: any) {
        alert("Erro ao processar presença no Firestore: " + e.message);
      }
    }
  };

  // Reload standard original values to clean/re-seed Firestore collections
  const handleResetSimulator = async () => {
    if (confirm("Deseja redefinir as coleções do Firestore para os dados originais da Garra de Águia PG? (Isso irá re-cadastrar todos as informações padrão)")) {
      setDbLoading(true);
      try {
        await setDoc(doc(db, "configuracoes", "global_config"), INITIAL_CONFIG);
        for (const item of INITIAL_TURMAS) {
          await setDoc(doc(db, "turmas", item.id), item);
        }
        for (const item of INITIAL_ALUNOS) {
          await setDoc(doc(db, "alunos", item.id), item);
        }
        for (const item of INITIAL_PRESENCAS) {
          await setDoc(doc(db, "presencas", item.id), item);
        }
        for (const item of INITIAL_GRADUACOES) {
          await setDoc(doc(db, "graduacoes", item.id), item);
        }
        for (const item of INITIAL_PAGAMENTOS) {
          await setDoc(doc(db, "mensalidades", item.id), item);
        }
        alert("Firestore redefinido e sincronizado com os dados originais com sucesso!");
      } catch (err: any) {
        console.error("Redefinition failed:", err);
        alert("Erro ao redefinir Firestore: " + err.message);
      } finally {
        setDbLoading(false);
      }
    }
  };

  // Standard loading screens with premium traditional design
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans">
        <div className="space-y-6 text-center animate-pulse">
          <EagleClawLogo className="h-28 w-28 mx-auto object-contain" />
          <div className="space-y-2">
            <h2 className="text-amber-400 font-sans text-sm font-black tracking-widest uppercase">Garra de Águia PG</h2>
            <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest font-bold">Iniciando Sintonização com a Academia...</p>
          </div>
          {/* Circular spinner */}
          <div className="mx-auto h-5 w-5 border-2 border-red-700 border-t-amber-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Standard error boundary dashboard
  if (authError || dbError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full border border-red-950 bg-red-950/10 p-6 rounded-2xl space-y-4">
          <EagleClawLogo className="h-16 w-16 mx-auto object-contain opacity-75" />
          <p className="text-red-500 font-extrabold uppercase tracking-wider text-xs">Erro de Sincronização Marcial</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {authError || dbError || "Verifique sua conexão ou credenciais de acesso."}
          </p>
          <button
            onClick={authError ? retryAuth : () => setRetryDbCount(c => c + 1)}
            className="flex items-center gap-2 mx-auto bg-red-800 hover:bg-red-750 text-white text-[10px] px-4 py-2.5 rounded-xl font-black uppercase tracking-wider transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recarregar Conexão
          </button>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-black font-sans text-neutral-150 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
        {/* Golden top aesthetic accent bar */}
        <div className="h-1 bg-gradient-to-r from-red-900 via-amber-500 to-red-900 shadow-[0_2px_10px_rgba(245,158,11,0.2)]"></div>
        
        <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
          {/* Smoke/glow background elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-950/20 rounded-full filter blur-[100px] pointer-events-none"></div>
          
          <div className="w-full max-w-[370px] border border-zinc-900 bg-zinc-950/80 backdrop-blur-md rounded-3xl p-6.5 space-y-6 relative z-10 shadow-3xl">
            
            {/* Logo, Slogan and Welcome */}
            <div className="text-center space-y-3">
              <EagleClawLogo className="h-28 w-28 mx-auto object-contain" />
              
              <div className="space-y-1.5">
                <h1 className="text-xl font-black tracking-[0.18em] text-amber-500 font-sans leading-none">
                  GARRA DE ÁGUIA
                </h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-[0.25em] font-black uppercase leading-tight">
                  PRAIA GRANDE
                </p>
                <div className="flex justify-center gap-1 text-[8px] text-red-500 font-black tracking-widest uppercase mt-1">
                  <span>DISCIPLINA</span>
                  <span>•</span>
                  <span>RESPEITO</span>
                  <span>•</span>
                  <span>FOCO</span>
                  <span>•</span>
                  <span>SUPERAÇÃO</span>
                </div>
              </div>
            </div>

            {/* Auth selector pills */}
            <div className="grid grid-cols-2 p-1 bg-neutral-900/80 border border-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`py-2 text-[10px] uppercase tracking-wider font-mono font-black rounded-lg transition-all ${
                  authMode === "login" 
                    ? "bg-red-700 text-white shadow-lg" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`py-2 text-[10px] uppercase tracking-wider font-mono font-black rounded-lg transition-all ${
                  authMode === "register" 
                    ? "bg-red-700 text-white shadow-lg" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                CADASTRO
              </button>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="bg-red-950/30 border border-red-900/60 p-3 rounded-xl text-[10px] text-red-400 font-mono leading-normal flex gap-2 items-start">
                <span className="text-red-500 font-black">⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Entry Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-red-500" /> NOME COMPLETO
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome oficial de aluno/instrutor"
                    value={authNome}
                    onChange={(e) => setAuthNome(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 text-xs rounded-xl focus:outline-none transition-all text-white placeholder-zinc-600 font-sans"
                  />
                </div>
              )}

              {authMode !== "forgot" ? (
                <>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-1">
                      <span>✉</span> ENDEREÇO DE E-MAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e-mail de cadastro"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 text-xs rounded-xl focus:outline-none transition-all text-white placeholder-zinc-600 font-sans"
                    />
                  </div>

                  <div className="space-y-1 text-left relative">
                    <label className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-red-500" /> SENHA MARCIAL
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="mínimo 6 caracteres"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 pr-10 text-xs rounded-xl focus:outline-none transition-all text-white placeholder-zinc-600 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-left animate-fadeIn">
                  <h3 className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">REDEFINIR SENHA MARCIAL</h3>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">Identifique o seu e-mail de acesso para enviarmos as instruções de redefinição.</p>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-400">DIGITE O SEU E-MAIL:</label>
                    <input
                      type="email"
                      required
                      placeholder="Escreva o e-mail aqui"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 text-xs rounded-xl focus:outline-none transition-all text-white placeholder-zinc-600 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full bg-red-700 hover:bg-red-650 disabled:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submittingAuth ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    Buscando Registro...
                  </>
                ) : authMode === "login" ? (
                  <>
                    ENTRAR <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  </>
                ) : authMode === "register" ? (
                  <>
                    SOLICITAR ACESSO 🥋
                  </>
                ) : (
                  <>
                    ENVIAR REAJUSTE ✉
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-col gap-2 pt-2 text-center text-[10px] font-mono">
              {authMode !== "forgot" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setAuthError(null);
                  }}
                  className="text-amber-500/80 hover:text-amber-400 font-bold uppercase transition-colors"
                >
                  Esqueci Minha Senha
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className="text-zinc-400 hover:text-white font-bold uppercase transition-colors"
                >
                  Voltar para o Login
                </button>
              )}
            </div>

            <div className="text-[8px] text-zinc-650 font-mono text-center leading-normal">
              Problemas de acesso? Entre em contato com a administração da academia.
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-zinc-950 bg-zinc-950 py-3 text-center text-[9px] text-zinc-600 font-mono">
          <p>© 2026 Academia Garra de Águia Praia Grande</p>
        </footer>
      </div>
    );
  }

  // Active student calculation based on authenticated account linkage and lists
  let defaultStudent: Aluno | undefined = undefined;
  if (userProfile && userProfile.role === "ALUNO") {
    // 1. Tentar encontrar pelo alunoId vinculado no perfil
    if (userProfile.alunoId) {
      defaultStudent = alunos.find(a => a.id === userProfile.alunoId);
    }
    // 2. Se não encontrou, tentar encontrar pelo email (case-insensitive) do usuário logado
    if (!defaultStudent && userProfile.email) {
      const emailLower = userProfile.email.trim().toLowerCase();
      defaultStudent = alunos.find(a => a.email && a.email.trim().toLowerCase() === emailLower);
    }
    // 3. Se ainda não encontrou mas temos algum aluno na lista restrita dele do onSnapshot (que já aplica o filtro)
    if (!defaultStudent && alunos.length > 0) {
      defaultStudent = alunos[0];
    }
    // 4. Fallback final: Objeto mockado do aluno
    if (!defaultStudent) {
      defaultStudent = {
        id: userProfile.alunoId || `stu_${userProfile.uid}`,
        nome: userProfile.nome || "Membro",
        email: userProfile.email || "",
        celular: "(Não cadastrado)",
        cpf: "(Não cadastrado)",
        dataNascimento: "",
        graduacao: "Preparatória - Branca",
        dataUltimaGraduacao: "",
        status: "Ativo" as const,
        turmaId: "turma_1",
        planoTipo: "2x_semana" as const,
        mensalidade: 160,
        descontoFamiliaTipo: "nenhum" as const,
        descontoFamiliaValor: 0,
        statusFinanceiro: "Em Dia" as const,
        observacoes: "Aluno sincronizado."
      } as Aluno;
    }
  } else {
    // Se for Admin/Instrutor, mostramos um aluno de mockup para visualizações se existirem alunos
    defaultStudent = alunos.find(a => a.id === "stu_1") || alunos[0];
  }

  const defaultStudentTurma = defaultStudent ? turmas.find(t => t.id === defaultStudent.turmaId) : undefined;

  // Counts for filters
  const pendingCheckinsCount = presencas.filter(p => p.status === "PENDING" || p.status === "PENDING").length;
  const approvedCheckinsCount = presencas.filter(p => p.status === "APPROVED" || p.status === "Presente").length;
  const rejectedCheckinsCount = presencas.filter(p => p.status === "REJECTED" || p.status === "Faltou").length;

  const handleCopyPixKey = () => {
    const mockPixKey = "00020126580014br.gov.pix0136e4f3de52-8c11-4775-8025-a7b21fe88fcf5204000053039865406180.005802BR5925GestaoKungFuAcademy";
    navigator.clipboard.writeText(mockPixKey);
    alert("Código PIX Copia e Cola copiado com sucesso!");
  };

  const handleStudentCheckin = () => {
    if (!defaultStudent) {
      setStudentStatusMsg("Você precisa ter uma matrícula de aluno ativa!");
      return;
    }
    const isInactive = (defaultStudent.status || "").toUpperCase().trim() === "INATIVO";
    if (isInactive) {
      setStudentStatusMsg("❌ Acesso suspenso: Alunos inativos não podem solicitar presença ou realizar novos check-ins.");
      return;
    }
    const exists = presencas.some(p => p.alunoId === defaultStudent.id && p.data === selectedCheckinDate);
    if (exists) {
      setStudentStatusMsg("Você já possui check-in solicitado ou registrado para este dia.");
      return;
    }
    const defaultTId = defaultStudent.turmaId || "turma_1";
    handleSolicitarPresenca(defaultTId, selectedCheckinDate);
    setStudentStatusMsg("✓ Check-in enviado como PENDENTE. O Professor ou Instrutor homologará em breve.");
    setTimeout(() => setStudentStatusMsg(""), 6000);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Golden top aesthetic accent bar */}
      <div className="h-1 bg-gradient-to-r from-red-900 via-amber-500 to-red-900 shadow-[0_2px_10px_rgba(245,158,11,0.2)] relative z-20"></div>

      {/* Slide Drawer Side Menu Backdrop */}
      {sideDrawerOpen && (
        <div 
          onClick={() => setSideDrawerOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        />
      )}

      {/* Slide Drawer Left Menu */}
      <div className={`fixed top-0 left-0 h-full w-[260px] bg-neutral-950 border-r border-zinc-900 z-50 transform transition-transform duration-300 ease-out flex flex-col justify-between ${
        sideDrawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2">
              <EagleClawLogo className="h-11 w-11 object-contain" />
              <div className="leading-tight">
                <span className="text-xs font-black text-amber-500 tracking-wider">GARRA DE ÁGUIA</span>
                <p className="text-[8px] text-zinc-500 tracking-widest font-black uppercase">PRAIA GRANDE</p>
              </div>
            </div>
            <button 
              onClick={() => setSideDrawerOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg border border-zinc-900 bg-neutral-900"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Profile snippet inside menu */}
          <div className="bg-neutral-900/60 border border-zinc-900 p-3 rounded-2xl flex items-center gap-2.5">
            <div className="p-2 bg-red-950/50 rounded-xl border border-red-800">
              <User className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs font-black text-white truncate max-w-[150px]">{userProfile?.nome || "Membro"}</p>
              <p className="text-[9px] font-mono text-zinc-500 truncate max-w-[155px]">{user.email}</p>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE ({activeRole})
              </span>
            </div>
          </div>

          {/* Menu elements directories */}
          <div className="space-y-1.5 text-left text-xs font-semibold">
            <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-black pl-1.5 mb-1.5">PRINCIPAL</p>
            <button
              onClick={() => { setActiveBottomTab("inicio"); setSideDrawerOpen(false); }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${activeBottomTab === "inicio" ? "bg-red-950/40 border border-red-900/60 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">🏠 Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>

            <button
              onClick={() => { setActiveBottomTab("alunos"); setSideDrawerOpen(false); }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${activeBottomTab === "alunos" ? "bg-red-950/40 border border-red-900/60 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">🥋 Alunos</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>

            <button
              onClick={() => { setActiveBottomTab("presencas"); setSideDrawerOpen(false); }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${activeBottomTab === "presencas" ? "bg-red-950/40 border border-red-900/60 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <span className="flex items-center gap-2 flex-grow justify-between">
                <span>📝 Presenças</span>
                {pendingCheckinsCount > 0 && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black font-mono leading-none animate-pulse">{pendingCheckinsCount}</span>}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>

            <button
              onClick={() => { setActiveBottomTab("relatorios"); setSideDrawerOpen(false); }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${activeBottomTab === "relatorios" ? "bg-red-950/40 border border-red-900/60 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">📊 Relatórios</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>

            <button
              onClick={() => { setActiveBottomTab("menu"); setSideDrawerOpen(false); }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${activeBottomTab === "menu" ? "bg-red-950/40 border border-red-900/60 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">⚙️ Menu & Perfil</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900">
          <button
            onClick={() => { logout(); setSideDrawerOpen(false); }}
            className="w-full p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            SAIR DO APP
          </button>
        </div>
      </div>

      {/* Global PWA Install step modal (Screenshot 3 style) */}
      {pwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPwaModalOpen(false)}></div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-[360px] p-6 text-left relative z-10 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <EagleClawLogo className="w-12 h-12" />
                <div className="leading-tight">
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-wide">Instalar App</h4>
                  <p className="text-[10px] text-zinc-400">Garra de Águia PG em tela cheia</p>
                </div>
              </div>
              <button 
                onClick={() => setPwaModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-350 leading-relaxed font-sans">
              Acesse rapidamente os diários de presenças, exames e dados financeiros sem abrir o navegador. Siga as orientações:
            </p>

            {/* steps container */}
            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-800 text-white flex-shrink-0 text-[10px] font-black rounded-full flex items-center justify-center">1</div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-white">Toque em Compartilhar</p>
                  <p className="text-[10px] text-zinc-400">Clique na setinha de compartilhamento (<Share2 className="w-3.5 h-3.5 inline text-amber-500" />) na barra do seu celular.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-800 text-white flex-shrink-0 text-[10px] font-black rounded-full flex items-center justify-center">2</div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-white">Adicione à Tela de Início</p>
                  <p className="text-[10px] text-zinc-400">Selecione <strong className="text-amber-500">Adicionar à Tela de Início</strong> (ou sinal de <Plus className="w-3.5 h-3.5 inline text-amber-500" />) na lista de opções.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-800 text-white flex-shrink-0 text-[10px] font-black rounded-full flex items-center justify-center">3</div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-white">Confirme e Acesse!</p>
                  <p className="text-[10px] text-zinc-400">Digite o nome e adicione. O brasão oficial da academia estará na sua gaveta de aplicativos nativos!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPwaModalOpen(false)}
              className="w-full bg-red-700 hover:bg-red-650 text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition-colors shadow-lg active:scale-98"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}

      {/* Header element conforming to screenshot style */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setSideDrawerOpen(true)}
            className="text-zinc-300 hover:text-white p-1 rounded-lg border border-zinc-900 bg-zinc-900"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black tracking-widest text-amber-500 uppercase">
              {activeBottomTab === "inicio" ? "Painel Principal" : 
               activeBottomTab === "alunos" ? "Quadro de Linha" : 
               activeBottomTab === "presencas" ? "Frequências" : 
               activeBottomTab === "relatorios" ? "Relatórios Marcial" : "Central Ajustes"}
            </span>
          </div>
        </div>

        {/* Active viewport selectors for Admin Switcher */}
        {userProfile.role === "ADMIN" && (
          <div className="hidden sm:flex bg-black p-0.5 rounded-lg border border-zinc-900 text-[9px] font-black">
            <button
              onClick={() => setActiveRole(UserRole.ADMIN)}
              className={`p-1 px-2.5 rounded transition-all uppercase ${activeRole === UserRole.ADMIN ? "bg-red-850 text-white font-bold" : "text-zinc-500"}`}
            >
              ADMIN
            </button>
            <button
              onClick={() => setActiveRole(UserRole.INSTRUTOR)}
              className={`p-1 px-2.5 rounded transition-all uppercase ${activeRole === UserRole.INSTRUTOR ? "bg-red-850 text-white font-bold" : "text-zinc-500"}`}
            >
              Instrutor
            </button>
            <button
              onClick={() => setActiveRole(UserRole.ALUNO)}
              className={`p-1 px-2.5 rounded transition-all uppercase ${activeRole === UserRole.ALUNO ? "bg-red-850 text-white font-bold" : "text-zinc-500"}`}
            >
              Aluno
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Notification counter bell */}
          <div className="relative">
            <Bell className="w-4 h-4 text-zinc-400 cursor-pointer" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-650 text-white font-black font-mono text-[7px] w-3 h-3 rounded-full flex items-center justify-center animate-pulse">2</span>
          </div>

          <div className="h-4 w-px bg-zinc-800"></div>

          {/* Quick viewport change for debug mapping */}
          <button
            onClick={() => setShowDocs(!showDocs)}
            className={`p-1 px-2 rounded font-mono text-[8px] uppercase tracking-wider font-extrabold transition-all ${
              showDocs ? "bg-amber-500 text-black" : "border border-zinc-900 text-zinc-500"
            }`}
          >
            DOCUMENTOS {showDocs ? "On" : "Off"}
          </button>
          
          <button
            onClick={handleResetSimulator}
            title="Redefinir Dados originais"
            className="p-1 rounded bg-neutral-900 border border-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Admin general recognized email banner */}
      {isAdmin && activeBottomTab === "inicio" && (
        <div className="bg-red-950/25 border-b border-red-900/40 py-2 px-4 text-left text-[10px] font-mono text-amber-500 leading-tight">
          ⭐ Professor Administrador (<strong className="text-white">deciopadovanijr@gmail.com</strong>) com acesso administrativo total às coleções.
        </div>
      )}

      {firestoreSyncError && (
        <div className="bg-[#1c0f12] border-b border-rose-950 py-2 px-4 text-left text-[10px] font-mono text-rose-400 flex items-center justify-between">
          <span>⚠️ {firestoreSyncError} Exibindo dados locais seguros para preservação da experiência.</span>
          <button onClick={() => setFirestoreSyncError(null)} className="text-rose-400 font-black hover:text-rose-200 uppercase text-[9px] tracking-widest px-2 py-0.5 rounded border border-rose-950/50 bg-[#120a0b]">Fechar</button>
        </div>
      )}

      {/* Main active frame area */}
      <main className="flex-grow max-w-sm sm:max-w-md md:max-w-xl lg:max-w-4xl xl:max-w-6xl w-full mx-auto px-4 py-4 space-y-4">
        
        {showDocs && (
          <div className="animate-fadeIn">
            <DocumentationView />
          </div>
        )}

        <div className="space-y-4">
          
          {/* TAB 1: INÍCIO */}
          {activeBottomTab === "inicio" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Greetings */}
              <div className="flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-sans font-bold text-zinc-400">Resumo rápido</h3>
                  <h2 className="text-lg font-black font-sans text-white">
                    Olá, <span className="text-red-500 uppercase">{userProfile?.nome || "Administrador"}</span>!
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/20 border border-emerald-900/40 text-[9px] text-emerald-400 font-extrabold font-mono uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ONLINE
                </span>
              </div>

              {/* Install PWA Prompt Banner */}
              <div className="bg-gradient-to-r from-red-950/20 to-neutral-950 border border-zinc-900 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Instalar Aplicativo</h4>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      Instale o app da Garra de Águia PG e tenha acesso instantâneo na tela inicial.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPwaModalOpen(true)}
                  className="bg-red-800 hover:bg-red-750 text-white font-black text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-all self-stretch md:self-auto text-center"
                >
                  CONFIGURAR
                </button>
              </div>

              <Dashboard
                activeRole={activeRole}
                presencas={presencas}
                alunos={alunos}
                pagamentos={pagamentos}
                config={config}
                defaultStudent={defaultStudent}
                defaultStudentTurma={defaultStudentTurma}
                setActiveBottomTab={setActiveBottomTab}
                handleStudentCheckin={handleStudentCheckin}
                studentStatusMsg={studentStatusMsg}
                graduacoes={graduacoes}
                exames={exames}
                produtos={produtos}
                vendas={vendas}
                familias={familias}
              />
            </div>
          )}

          {/* TAB 2: ALUNOS (Matrículas / Quadro de Linha) */}
          {activeBottomTab === "alunos" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header and Add button if Admin */}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-base font-black font-sans text-white uppercase tracking-wider">Quadro de Alunos</h2>
                  <p className="text-[10px] text-zinc-400">Total de {alunos.length} fichas cadastradas na academia</p>
                </div>
                {activeRole === "ADMIN" && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSyncUsersAsAlunosDirect}
                      disabled={isSyncingUsers}
                      className="p-2 py-1.5 bg-amber-500 hover:bg-amber-450 disabled:opacity-50 text-zinc-950 font-black rounded-xl flex items-center gap-1.5 text-[11px] transition-colors uppercase cursor-pointer"
                      id="btn-sync-users-as-alunos"
                      title="Sincronizar usuários da autenticação que não possuem ficha acadêmica"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-zinc-950 ${isSyncingUsers ? "animate-spin" : ""}`} />
                      {isSyncingUsers ? "Sincronizando..." : "Sincronizar Usuários"}
                    </button>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="p-2 py-1.5 bg-red-700 hover:bg-red-650 text-white rounded-xl flex items-center gap-1.5 text-[11px] font-bold transition-colors uppercase cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      Novo Aluno
                    </button>
                  </div>
                )}
              </div>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar por nome de aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-700 p-3 pr-10 text-xs rounded-xl focus:outline-none text-zinc-200 placeholder-zinc-650"
                />
                <Search className="w-4 h-4 text-zinc-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Filtros de Aluno por Status operacional */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {(["ATIVOS", "INATIVOS", "PENDENTES", "TODOS"] as const).map((fs) => {
                  const isSel = filterStatus === fs;
                  // Contagem inteligente correspondente
                  const count = alunos.filter((a) => {
                    const norm = (a.status || "").toUpperCase().trim();
                    if (fs === "ATIVOS") return norm === "ATIVO" || norm === "" || !a.status;
                    if (fs === "INATIVOS") return norm === "INATIVO";
                    if (fs === "PENDENTES") return norm === "PENDENTE";
                    return true;
                  }).filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())).length;

                  return (
                    <button
                      key={fs}
                      onClick={() => setFilterStatus(fs)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                        isSel
                          ? "bg-red-950/40 text-red-500 border-red-900 shadow-sm animate-fadeIn"
                          : "bg-zinc-950 text-zinc-500 border-zinc-900/60 hover:text-zinc-400"
                      }`}
                    >
                      <span>{fs}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[8.5px] font-sans ${
                        isSel ? "bg-red-900/60 text-red-300" : "bg-zinc-900 text-zinc-650"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add Aluno inline modal form */}
              {showAddForm && activeRole === "ADMIN" && (
                <div className="bg-[#141414] border border-zinc-900 p-4.5 rounded-2xl text-left space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Formulário de Matrícula Regular</h4>
                  
                  {/* We are reusing the existing inputs nested inside AdminPanel structure or standard rendering to keep Admin functional. Let's make it very easy to load the add form under native appearance directly and trigger onAddAluno! */}
                  <AdminPanel
                    alunos={alunos}
                    turmas={turmas}
                    instrutores={instrutores}
                    pagamentos={pagamentos}
                    config={config}
                    produtos={produtos}
                    vendas={vendas}
                    familias={familias}
                    presencas={presencas}
                    onSaveProduto={handleSaveProduto}
                    onDeleteProduto={handleDeleteProduto}
                    onSaveVenda={handleSaveVenda}
                    onSaveFamilia={handleSaveFamilia}
                    onDeleteFamilia={handleDeleteFamilia}
                    onSaveMensalidade={handleSaveMensalidade}
                    onDeleteMensalidade={handleDeleteMensalidade}
                    onGenerateMensalidadesLote={handleGenerateMensalidadesLote}
                    activeRole={activeRole}
                    initialEditAluno={editingAlunoForForm || undefined}
                    onCancelEdit={() => {
                      setEditingAlunoForForm(null);
                      setShowAddForm(false);
                    }}
                    onAddAluno={(newStu) => {
                      handleAddAluno(newStu);
                      setEditingAlunoForForm(null);
                      setShowAddForm(false);
                    }}
                    onDeleteAluno={handleDeleteAluno}
                    onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
                    onUpdateConfig={handleUpdateConfig}
                  />
                </div>
              )}

              {/* Student list elements em Grade Bento Premium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="students-bento-grid">
                {alunos
                  .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .filter(a => {
                    const norm = (a.status || "").toUpperCase().trim();
                    if (filterStatus === "ATIVOS") return norm === "ATIVO" || norm === "" || !a.status;
                    if (filterStatus === "INATIVOS") return norm === "INATIVO";
                    if (filterStatus === "PENDENTES") return norm === "PENDENTE";
                    return true;
                  }).length === 0 ? (
                  <p className="col-span-full text-center text-xs text-zinc-550 py-8 font-mono">Nenhum aluno encontrado com esses filtros.</p>
                ) : (
                  alunos
                    .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                    .filter(a => {
                      const norm = (a.status || "").toUpperCase().trim();
                      if (filterStatus === "ATIVOS") return norm === "ATIVO" || norm === "" || !a.status;
                      if (filterStatus === "INATIVOS") return norm === "INATIVO";
                      if (filterStatus === "PENDENTES") return norm === "PENDENTE";
                      return true;
                    })
                    .map(a => (
                      <div 
                        key={a.id}
                        className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 text-left flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all shadow-md group relative overflow-hidden"
                      >
                        {/* Indicador visual de faixa na rebarba lateral esquerda do cartão para luxo extra! */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          (a.graduacao || "").toLowerCase().includes("preta") ? "bg-black" :
                          (a.graduacao || "").toLowerCase().includes("vermelha") ? "bg-red-600" :
                          (a.graduacao || "").toLowerCase().includes("amarela") ? "bg-yellow-500" :
                          (a.graduacao || "").toLowerCase().includes("azul") ? "bg-blue-600" :
                          (a.graduacao || "").toLowerCase().includes("verde") ? "bg-emerald-600" :
                          (a.graduacao || "").toLowerCase().includes("marrom") ? "bg-amber-800" : "bg-zinc-400"
                        }`} />

                        <div className="flex items-start gap-3.5">
                          {/* Avatar inteligente com cores baseadas na faixa */}
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-white shadow-inner bg-gradient-to-br from-zinc-900 to-black border-2 shrink-0 ${
                            (a.graduacao || "").toLowerCase().includes("preta") ? "border-red-650 text-amber-500" :
                            (a.graduacao || "").toLowerCase().includes("vermelha") ? "border-red-650 text-red-500" :
                            (a.graduacao || "").toLowerCase().includes("amarela") ? "border-yellow-500 text-yellow-400" :
                            (a.graduacao || "").toLowerCase().includes("azul") ? "border-blue-500 text-blue-400" :
                            (a.graduacao || "").toLowerCase().includes("verde") ? "border-emerald-500 text-emerald-400" :
                            (a.graduacao || "").toLowerCase().includes("marrom") ? "border-amber-750 text-amber-600" : "border-zinc-700 text-zinc-300"
                          }`}>
                            {a.nome?.substring(0, 2)}
                          </div>

                          <div className="leading-tight text-left space-y-1.5 flex-1 min-w-0">
                            <h4 className="text-[12.5px] font-extrabold text-white uppercase tracking-wide group-hover:text-amber-500 transition-colors leading-snug truncate">{a.nome}</h4>
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex py-0.5 px-2 rounded-md bg-zinc-900 text-[8.5px] font-bold text-amber-400 border border-zinc-800 font-mono">
                                🥋 {a.graduacao ? a.graduacao : "BRANCA"}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[8.5px] uppercase font-bold leading-none border font-mono ${
                                a.statusFinanceiro === "Em Dia" ? "bg-emerald-[#1c2e22]/50 text-emerald-400 border-emerald-900/40" :
                                a.statusFinanceiro === "Atrasado" ? "bg-red-[#331818]/50 text-red-500 border-red-900/40" : "bg-zinc-900 text-zinc-400 border-zinc-805"
                              }`}>
                                {a.statusFinanceiro}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dados adicionais com rótulo minimalista */}
                        <div className="space-y-1 text-[11px] font-sans text-zinc-400 border-t border-zinc-900/60 pt-3">
                          <div className="font-mono text-zinc-550 text-[10px] flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span>CPF: <strong className="text-zinc-400">{a.cpf || "-"}</strong></span>
                            <span>Celular: <strong className="text-zinc-400">{a.celular || "-"}</strong></span>
                          </div>
                          {a.endereco && (
                            <p className="text-zinc-400 flex items-center gap-1.5 leading-snug mt-1 text-[10px]">
                              <span className="text-zinc-555 shrink-0">📍</span>
                              <span className="truncate">{a.endereco}</span>
                            </p>
                          )}
                        </div>

                        {/* Ações do Dashboard com total responsividade */}
                        {activeRole !== "ALUNO" && (
                          <div className="flex flex-wrap gap-1 mt-1 border-t border-zinc-900/60 pt-3">
                            <button
                              onClick={() => setSelectedFichaAluno(a)}
                              className="flex-1 min-w-[55px] text-zinc-350 hover:text-white hover:bg-zinc-900 duration-150 p-2 text-[10px] font-black uppercase bg-zinc-900 rounded-xl border border-zinc-850 cursor-pointer text-center"
                            >
                              Ficha
                            </button>
                            <button
                              onClick={() => {
                                setAlunoSelecionadoExame(a);
                                setExameGradPretendida(a.graduacao || "Preparatória - Branca");
                                setExameData(new Date().toISOString().split("T")[0]);
                                setExameNotaTec(8);
                                setExameNotaTeor(8);
                                setExameAvaliador("Professor Décio");
                                setExameStatus("Aprovado");
                                setExameObs("");
                              }}
                              className="flex-1 min-w-[55px] text-amber-500 hover:text-amber-400 hover:bg-amber-950/40 duration-150 p-2 text-[10px] font-black uppercase bg-amber-950/20 rounded-xl border border-amber-900/30 cursor-pointer text-center"
                            >
                              Exame
                            </button>
                            {activeRole === "ADMIN" && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingAlunoForForm(a);
                                    setShowAddForm(true);
                                    // Rolar suavemente até o formulário
                                    setTimeout(() => {
                                      const formElement = document.getElementById("btn-sync-users-as-alunos") || document.getElementById("form-add-aluno");
                                      if (formElement) {
                                        formElement.scrollIntoView({ behavior: "smooth" });
                                      }
                                    }, 100);
                                  }}
                                  className="flex-1 min-w-[55px] text-blue-500 hover:text-blue-400 hover:bg-blue-955/40 duration-150 p-2 text-[10px] font-black uppercase bg-blue-900 rounded-xl border border-blue-900/30 cursor-pointer text-center"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Tem certeza de que deseja INATIVAR o aluno ${a.nome}? O acesso será suspenso, mas seu histórico completo (mensalidades, presenças, exames e graduações) permanecerá preservado.`)) {
                                      handleDeleteAluno(a.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-400 hover:bg-red-955/40 duration-150 p-2 text-[10px] font-black uppercase bg-red-900 rounded-xl border border-red-900/30 cursor-pointer text-center"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>

              {/* Modal de Dossiê e Ficha Histórica do Aluno */}
              {selectedFichaAluno && (
                <FichaAlunoModal
                  aluno={selectedFichaAluno}
                  presencas={presencas}
                  pagamentos={pagamentos}
                  graduacoes={graduacoes}
                  exames={exames}
                  alunoModalidades={alunoModalidades}
                  onClose={() => setSelectedFichaAluno(null)}
                />
              )}

              {/* Modal de Lançamento de Exame de Faixa Real no Firestore */}
              {alunoSelecionadoExame && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 max-w-sm w-full space-y-4 text-left animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Lançar Exame de Faixa</h4>
                        <p className="text-[10px] text-zinc-400 font-mono">Aluno: {alunoSelecionadoExame.nome}</p>
                      </div>
                      <button
                        onClick={() => setAlunoSelecionadoExame(null)}
                        className="text-zinc-500 hover:text-white font-extrabold text-[10px] uppercase font-mono"
                      >
                        [Fechar]
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Nova Faixa Pretendida</label>
                        <select
                          value={exameGradPretendida}
                          onChange={(e) => setExameGradPretendida(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                        >
                          {(() => {
                            const studentMods: string[] = [];
                            const rawModStr = alunoSelecionadoExame.modalidade || "";
                            const rawModsArr = alunoSelecionadoExame.modalidades || [];
                            
                            // Parse modalities
                            const list = rawModsArr.length > 0 
                              ? rawModsArr 
                              : rawModStr.split(",").map((x: string) => x.trim()).filter(Boolean);
                              
                            const normalized = list.map((m: string) => {
                              if (m.toLowerCase().includes("tai chi") || m.toLowerCase().includes("taichi")) return "Tai Chi Chuan";
                              if (m.toLowerCase().includes("boxe") || m.toLowerCase().includes("sanda")) return "Boxe Chinês";
                              return "Kung Fu";
                            });

                            const uniqueMods = Array.from(new Set(normalized.length > 0 ? normalized : ["Kung Fu"]));

                            const gradsByMod = (m: string) => {
                              if (m === "Kung Fu") {
                                return [
                                  "Preparatória - Branca",
                                  "1ª Fase - Branca Ponta Amarela",
                                  "2ª Fase - Branca Ponta Verde",
                                  "3ª Fase - Verde",
                                  "4ª Fase - Verde Ponta Marrom",
                                  "5ª Fase - Marrom",
                                  "6ª Fase - Marrom Ponta Preta",
                                  "7ª Fase - Preta",
                                  "1º Dhuen - Preta",
                                  "2º Dhuen - Preta",
                                  "3º Dhuen - Preta",
                                  "4º Dhuen - Preta",
                                  "5º Dhuen - Preta",
                                  "6º Dhuen - Preta",
                                  "7º Dhuen - Preta",
                                  "8º Dhuen - Preta",
                                  "9º Dhuen - Preta"
                                ];
                              }
                              if (m === "Tai Chi Chuan") {
                                return [
                                  "Preparatória - Branca",
                                  "1ª Fase - Branca Ponta Amarela",
                                  "2ª Fase - Branca Ponta Verde",
                                  "3ª Fase - Verde"
                                ];
                              }
                              if (m === "Boxe Chinês") {
                                return [
                                  "Preparatória - Branca",
                                  "1ª Fase - Laranja",
                                  "2ª Fase - Vermelha",
                                  "3ª Fase - Azul",
                                  "4ª Fase - Marrom",
                                  "5ª Fase - Preta"
                                ];
                              }
                              return ["Preparatória - Branca"];
                            };

                            const allOptions = Array.from(new Set(
                              (uniqueMods as string[]).flatMap((m: string) => gradsByMod(m))
                            ));

                            return allOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ));
                          })()}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Nota Téc. (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={exameNotaTec}
                            onChange={(e) => setExameNotaTec(parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Nota Teor. (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={exameNotaTeor}
                            onChange={(e) => setExameNotaTeor(parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Data Exame</label>
                          <input
                            type="date"
                            value={exameData}
                            onChange={(e) => setExameData(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Resultado</label>
                          <select
                            value={exameStatus}
                            onChange={(e) => setExameStatus(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                          >
                            <option value="Aprovado">Aprovado (Promover)</option>
                            <option value="Reprovado">Reprovado</option>
                            <option value="Pendente">Pendente / Agendado</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Avaliador</label>
                        <input
                          type="text"
                          value={exameAvaliador}
                          onChange={(e) => setExameAvaliador(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-mono font-bold text-zinc-500 mb-1">Observações Gerais</label>
                        <textarea
                          rows={1.5}
                          value={exameObs}
                          onChange={(e) => setExameObs(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-lg focus:border-red-700 outline-none text-white font-mono text-[11px] resize-none"
                          placeholder="Manejo das posturas..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => setAlunoSelecionadoExame(null)}
                        className="flex-1 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-405 rounded-xl font-bold uppercase transition-colors text-[10px] text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          const dataObj = {
                            graduacaoPretendida: exameGradPretendida,
                            dataExame: exameData,
                            notaTecnica: exameNotaTec,
                            notaTeorica: exameNotaTeor,
                            avaliador: exameAvaliador,
                            resultado: exameStatus,
                            observacoes: exameObs
                          };
                          await handleSaveExame(dataObj, alunoSelecionadoExame);
                          setAlunoSelecionadoExame(null);
                        }}
                        className="flex-1 p-2 bg-red-700 hover:bg-red-650 text-white rounded-xl font-black uppercase transition-colors text-[10px] text-center"
                      >
                        Gravar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESENÇAS */}
          {activeBottomTab === "presencas" && (
            <Presencas
              activeRole={activeRole}
              presenceFilter={presenceFilter}
              setPresenceFilter={setPresenceFilter}
              presencas={presencas}
              alunos={alunos}
              turmas={turmas}
              graduacoes={graduacoes}
              selectedCheckinDate={selectedCheckinDate}
              setSelectedCheckinDate={setSelectedCheckinDate}
              studentStatusMsg={studentStatusMsg}
              handleStudentCheckin={handleStudentCheckin}
              handleDecideCheckin={handleDecideCheckin}
              handleAddPresenca={handleAddPresenca}
              handleUpdateGraduacao={handleUpdateGraduacao}
              defaultStudent={defaultStudent}
              defaultStudentTurma={defaultStudentTurma}
              pagamentos={pagamentos}
              handleSolicitarPresenca={handleSolicitarPresenca}
            />
          )}

          {/* TAB 4: RELATÓRIOS */}
          {activeBottomTab === "relatorios" && (
            <Relatorios
              pagamentos={pagamentos}
              handleCopyPixKey={handleCopyPixKey}
              alunos={alunos}
              turmas={turmas}
              presencas={presencas}
              produtos={produtos}
              vendas={vendas}
              familias={familias}
              activeRole={activeRole}
              alunoModalidades={alunoModalidades}
              exames={exames}
            />
          )}

          {/* TAB 5: MENU (Meu Perfil, Settings, System Audit) */}
          {activeBottomTab === "menu" && (
            <div className="space-y-4 animate-fadeIn">
              <Perfil
                user={user}
                userProfile={userProfile}
                activeRole={activeRole}
                sendPasswordReset={sendPasswordReset}
                logout={logout}
                onUpdateCadastro={handleUpdateCadastroProfile}
                alunoFicha={defaultStudent}
              />

              {/* Global Config Settings Form ONLY if ADMIN */}
              {activeRole === "ADMIN" && (
                <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-4 rounded-3xl text-left">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Settings className="w-4.5 h-4.5 text-red-550" />
                    <span className="text-xs font-black uppercase tracking-wider">Configurações do Sistema</span>
                  </div>
                  <AdminPanel
                    alunos={alunos}
                    turmas={turmas}
                    instrutores={instrutores}
                    pagamentos={pagamentos}
                    config={config}
                    produtos={produtos}
                    vendas={vendas}
                    familias={familias}
                    presencas={presencas}
                    onSaveProduto={handleSaveProduto}
                    onDeleteProduto={handleDeleteProduto}
                    onSaveVenda={handleSaveVenda}
                    onSaveFamilia={handleSaveFamilia}
                    onDeleteFamilia={handleDeleteFamilia}
                    onSaveMensalidade={handleSaveMensalidade}
                    onDeleteMensalidade={handleDeleteMensalidade}
                    onGenerateMensalidadesLote={handleGenerateMensalidadesLote}
                    activeRole={activeRole}
                    onAddAluno={handleAddAluno}
                    onDeleteAluno={handleDeleteAluno}
                    onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
                    onSaveInstrutor={handleSaveInstrutor}
                    onDeleteInstrutor={handleDeleteInstrutor}
                    onUpdateTurma={handleUpdateTurmaInstrutor}
                    onUpdateConfig={(newCfg) => {
                      handleUpdateConfig(newCfg);
                      alert("Configurações atualizadas!");
                    }}
                  />
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* Persistent Bottom Fixed Navigation Bar conforming to Screenshots */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur-md border-t border-zinc-900 safe-bottom">
        <div className={`max-w-md mx-auto grid ${isAluno ? "grid-cols-4" : "grid-cols-5"} py-2 text-[8.5px] font-black uppercase font-mono tracking-wider text-center`}>
          
          <button
            onClick={() => setActiveBottomTab("inicio")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === "inicio" ? "text-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-base leading-none">🏠</span>
            <span>Início</span>
          </button>

          {!isAluno && (
            <button
              onClick={() => setActiveBottomTab("alunos")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeBottomTab === "alunos" ? "text-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="text-base leading-none">🥋</span>
              <span>Alunos</span>
            </button>
          )}

          <button
            onClick={() => setActiveBottomTab("presencas")}
            className={`flex flex-col items-center gap-1 transition-all relative ${
              activeBottomTab === "presencas" ? "text-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-base leading-none">📝</span>
            <span className="truncate max-w-[80px]">{isAluno ? "Treinos/Turmas" : "Presenças"}</span>
            {!isAluno && pendingCheckinsCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-650 text-white font-black font-mono text-[7px] w-3 h-3 rounded-full flex items-center justify-center animate-pulse">
                {pendingCheckinsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveBottomTab("relatorios")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === "relatorios" ? "text-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-base leading-none">💳</span>
            <span>{isAluno ? "Financeiro" : "Relatórios"}</span>
          </button>

          <button
            onClick={() => setActiveBottomTab("menu")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeBottomTab === "menu" ? "text-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-base leading-none">⚙️</span>
            <span>{isAluno ? "Perfil" : "Menu"}</span>
          </button>

        </div>
      </footer>

      {/* Desktop/Mobile extra spacing spacer to clear bottom bar */}
      <div className="h-16"></div>

    </div>
  );
}
