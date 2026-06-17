import React, { useState, useEffect } from "react";
import { UserRole, Aluno, Turma, Presenca, HistoricoGraduacao, Pagamento, GraduacaoSash, GlobalConfigs } from "./types";
import {
  INITIAL_ALUNOS,
  INITIAL_TURMAS,
  INITIAL_PRESENCAS,
  INITIAL_GRADUACOES,
  INITIAL_PAGAMENTOS,
  INITIAL_CONFIG
} from "./data/mockData";
import AdminPanel from "./components/AdminPanel";
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
  const [selectedCheckinDate, setSelectedCheckinDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [studentStatusMsg, setStudentStatusMsg] = useState<string>("");

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
          console.log("Banco de dados do Firestore limpo para turmas, utilizando cronograma local.");
          setTurmas(INITIAL_TURMAS);
        } else {
          const list: Turma[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Turma);
          });
          setTurmas(list);
        }
      }, (err) => {
        console.warn("Utilizando cronograma de turmas padrão local.");
        setTurmas(INITIAL_TURMAS);
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
          graduacao: newAlunoData.graduacao || "Faixa Branca",
          graduacaoAtual: newAlunoData.graduacaoAtual || newAlunoData.graduacao || "Faixa Branca",
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
        graduacaoAtual: newAlunoData.graduacaoAtual || newAlunoData.graduacao || "Faixa Branca",
        graduacao: newAlunoData.graduacao || "Faixa Branca",
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
  const handleUpdateCadastroProfile = async (dados: { nome: string; celular: string; endereco: string }) => {
    if (!user || !userProfile) return;
    try {
      // 1. Atualiza na coleção de usuários do Auth (users)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        nome: dados.nome,
        celular: dados.celular || "",
        endereco: dados.endereco || ""
      });

      // 2. Se o usuário atual possui alunoId, atualiza também a ficha do aluno (alunos)
      if (userProfile.alunoId) {
        const studentRef = doc(db, "alunos", userProfile.alunoId);
        await updateDoc(studentRef, {
          nome: dados.nome,
          celular: dados.celular || "",
          endereco: dados.endereco || ""
        });
      } else {
        // Se não possui alunoId mas existe aluno com o mesmo email cadastrado pelo admin
        const alunosRef = collection(db, "alunos");
        const qStr = user.email ? user.email.trim().toLowerCase() : "";
        const q = query(alunosRef, where("email", "==", qStr));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const studentDocId = qSnap.docs[0].id;
          await updateDoc(doc(db, "alunos", studentDocId), {
            nome: dados.nome,
            celular: dados.celular || "",
            endereco: dados.endereco || ""
          });
        }
      }
      alert("Cadastro atualizado com sucesso no Firestore!");
    } catch (e: any) {
      console.error("Erro ao atualizar cadastro:", e);
      alert("Falha ao atualizar dados de cadastro: " + e.message);
    }
  };

  // 2. DELETE Student (Admin action mapped to Firestore)
  const handleDeleteAluno = async (id: string) => {
    try {
      // 1. Deletar todas as mensalidades associadas para manter a integridade
      const studentMensalidades = pagamentos.filter((p) => p.alunoId === id);
      for (const inv of studentMensalidades) {
        await deleteDoc(doc(db, "mensalidades", inv.id));
      }

      // 2. Deletar todos os registros de presença deste aluno
      const studentPresencas = presencas.filter((p) => p.alunoId === id);
      for (const pres of studentPresencas) {
        await deleteDoc(doc(db, "presencas", pres.id));
      }

      // 3. Desvincular o campo alunoId dos documentos correspondentes na coleção "users"
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        for (const docSnap of querySnapshot.docs) {
          const userData = docSnap.data();
          if (userData.alunoId === id) {
            await updateDoc(doc(db, "users", docSnap.id), {
              alunoId: null
            });
          }
        }
      } catch (errUser) {
        console.warn("Aviso: Falha ao desvincular o aluno de /users:", errUser);
      }

      // 4. Deletar o documento do aluno no Firestore
      await deleteDoc(doc(db, "alunos", id));

      alert("Aluno, cobranças (mensalidades) e registros de presença associados foram excluídos com sucesso!");
    } catch (err) {
      console.error("handleDeleteAluno failed:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `alunos/${id}`);
      } catch (e: any) {
        alert("Erro ao excluir aluno do Firestore: " + e.message);
      }
    }
  };

  const handleExcluirAluno = handleDeleteAluno;

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

      let addedCount = 0;
      const todayString = new Date().toISOString().split("T")[0];
      const nextMonthString = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const currentRef = new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

      for (const u of allUsers) {
        // Exclude admin role or principal administrator Decio
        const isAdmin = u.role === "ADMIN" || u.email?.toLowerCase() === "deciopadovanijr@gmail.com";
        if (isAdmin) continue;

        // Check if user is already an Aluno (by matching ID, email, or userId)
        const isAlreadyAluno = alunos.some(
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
            graduacaoAtual: "Faixa Branca",
            dataUltimaGraduacao: todayString,
            status: "Ativo",
            turmaId: u.turmaId || defaultTurmaId,
            modalidade: "Kung Fu",
            observacoes: "Usuário sincronizado do sistema de autenticação.",
            statusFinanceiro: "PENDENTE",
            
            // Compatibility fields
            graduacao: "Faixa Branca",
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

      alert(`Sincronização concluída! ${addedCount} novos usuários sem ficha foram cadastrados como alunos com graduação inicial Faixa Branca.`);
    } catch (err: any) {
      console.error("Sincronização de usuários falhou:", err);
      alert("Erro ao sincronizar usuários: " + err.message);
    } finally {
      setIsSyncingUsers(false);
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
        graduacao: GraduacaoSash.BRANCA,
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

              {/* Add Aluno inline modal form */}
              {showAddForm && activeRole === "ADMIN" && (
                <div className="bg-[#141414] border border-zinc-900 p-4.5 rounded-2xl text-left space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Formulário de Matrícula Regular</h4>
                  
                  {/* We are reusing the existing inputs nested inside AdminPanel structure or standard rendering to keep Admin functional. Let's make it very easy to load the add form under native appearance directly and trigger onAddAluno! */}
                  <AdminPanel
                    alunos={alunos}
                    turmas={turmas}
                    pagamentos={pagamentos}
                    config={config}
                    onAddAluno={(newStu) => {
                      handleAddAluno(newStu);
                      setShowAddForm(false);
                    }}
                    onDeleteAluno={handleDeleteAluno}
                    onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
                    onUpdateConfig={handleUpdateConfig}
                  />
                </div>
              )}

              {/* Student list elements */}
              <div className="space-y-2.5">
                {alunos.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <p className="text-center text-xs text-zinc-550 py-8">Nenhum aluno encontrado na lista da academia.</p>
                ) : (
                  alunos
                    .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(a => (
                      <div 
                        key={a.id}
                        className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-left flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-amber-500 uppercase">
                            {a.nome?.substring(0, 2)}
                          </div>
                          <div className="leading-tight text-left space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase">{a.nome}</h4>
                            <p className="text-[10px] font-mono text-zinc-500">
                              CPF: {a.cpf || "não registrado"} • Cel: {a.celular || "não registrado"}
                            </p>
                            {a.endereco && (
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-sans">
                                📍 {a.endereco}
                              </p>
                            )}
                            <div className="pt-0.5">
                              <span className="inline-flex py-0.5 px-2 rounded-full bg-neutral-900 text-[8px] font-bold text-amber-400">
                                {a.graduacao ? a.graduacao : "Branca"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status indicators */}
                        <div className="text-right space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black font-mono leading-none ${
                            a.statusFinanceiro === "Em Dia" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-950/60" :
                            a.statusFinanceiro === "Atrasado" ? "bg-red-950/40 text-red-500 border border-red-950/60" : "bg-zinc-900 text-zinc-400 border border-zinc-855"
                          }`}>
                            {a.statusFinanceiro}
                          </span>
                          {activeRole === "ADMIN" && (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => {
                                  if (confirm(`Tem certeza de que deseja EXCLUIR permanentemente o aluno ${a.nome} e todo o seu histórico financeiro do sistema?`)) {
                                    handleDeleteAluno(a.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-400 text-[10px] font-mono uppercase bg-red-950/20 p-1.5 rounded-lg border border-red-950"
                              >
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
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
                    pagamentos={pagamentos}
                    config={config}
                    onAddAluno={handleAddAluno}
                    onDeleteAluno={handleDeleteAluno}
                    onUpdateStatusFinanceiro={handleUpdateStatusFinanceiro}
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
