/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Aluno, Turma, Presenca, HistoricoGraduacao, Pagamento, GraduacaoSash, UserProfile, UserRole, GlobalConfigs } from "../types";

export const INITIAL_CONFIG: GlobalConfigs = {
  id: "global_config",
  descontoFamiliarPercentualPadrao: 10, // 10%
  descontoFamiliarFixoPadrao: 20, // R$ 20.00
  avisoMural: "Bem-vindos à Academia Garra de Águia Praia Grande. Consulte os horários de treino e acompanhe os avisos da administração.",
  contatoSuporte: "(13) 99123-4567",
  enderecoAcademia: "Rua Guimarães Rosa 1191 - Praia Grande, SP"
};

export const INITIAL_TURMAS: Turma[] = [
  {
    id: "turma_1",
    nomeEstilo: "Kung Fu - Tarde (15:00 - 16:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda", "Quarta", "Sexta"],
    horario: "15:00 - 16:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_2",
    nomeEstilo: "Kung Fu - Tarde (16:30 - 17:30)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda", "Quarta", "Sexta"],
    horario: "16:30 - 17:30",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_3",
    nomeEstilo: "Kung Fu - Noite (18:00 - 19:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda"],
    horario: "18:00 - 19:00",
    categoria: "Misto",
    capacidade: 15
  },
  {
    id: "turma_4",
    nomeEstilo: "Kung Fu - Manhã (10:00 - 11:00)",
    instrutorId: "ins_2",
    instrutorNome: "Instrutor Marcos Silva",
    diasSemana: ["Terça", "Quinta"],
    horario: "10:00 - 11:00",
    categoria: "Misto",
    capacidade: 15
  },
  {
    id: "turma_5",
    nomeEstilo: "Kung Fu - Noite (20:30 - 21:30)",
    instrutorId: "ins_2",
    instrutorNome: "Instrutor Marcos Silva",
    diasSemana: ["Terça", "Quinta"],
    horario: "20:30 - 21:30",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_6",
    nomeEstilo: "Tai Chi Chuan (18:00 - 19:00)",
    instrutorId: "ins_3",
    instrutorNome: "Laoshi Silvana Reis",
    diasSemana: ["Quarta", "Sexta"],
    horario: "18:00 - 19:00",
    categoria: "Iniciante",
    capacidade: 18
  },
  {
    id: "turma_7",
    nomeEstilo: "Kung Fu - Noite (19:30 - 20:30)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Quarta", "Sexta"],
    horario: "19:30 - 20:30",
    categoria: "Avançado",
    capacidade: 20
  },
  {
    id: "turma_8",
    nomeEstilo: "Boxe Chinês / Sanda (21:00 - 22:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Quarta", "Sexta"],
    horario: "21:00 - 22:00",
    categoria: "Misto",
    capacidade: 25
  },
  {
    id: "turma_9",
    nomeEstilo: "Kung Fu - Sábado (11:15 - 12:15)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Sábado"],
    horario: "11:15 - 12:15",
    categoria: "Misto",
    capacidade: 30
  }
];

export const INITIAL_ALUNOS: Aluno[] = [
  {
    id: "stu_1",
    nome: "Carlos Augusto Silva",
    email: "carlos.augusto@email.com",
    celular: "(13) 98765-4321",
    cpf: "123.456.789-00",
    dataNascimento: "1994-05-12",
    graduacao: GraduacaoSash.VERDE,
    dataUltimaGraduacao: "2025-11-10",
    status: "Ativo",
    turmaId: "turma_1",
    planoTipo: "3x_semana",
    mensalidade: 180,
    descontoFamiliaTipo: "percentual",
    descontoFamiliaValor: 10, // possui 10% de desconto familiar
    statusFinanceiro: "Em Dia",
    observacoes: "Excelente em técnicas de perna. Foco no Tao Lu do Garra de Águia complementar."
  },
  {
    id: "stu_2",
    nome: "Beatriz Oliveira Santos",
    email: "beatriz.oliveira@email.com",
    celular: "(13) 97654-3210",
    cpf: "234.567.890-11",
    dataNascimento: "1998-09-22",
    graduacao: GraduacaoSash.LARANJA,
    dataUltimaGraduacao: "2025-12-15",
    status: "Ativo",
    turmaId: "turma_5",
    planoTipo: "2x_semana",
    mensalidade: 160,
    descontoFamiliaTipo: "nenhum",
    descontoFamiliaValor: 0,
    statusFinanceiro: "Em Dia",
    observacoes: "Muito dedicada aos treinos. Demonstra grande flexibilidade."
  },
  {
    id: "stu_3",
    nome: "Diego Souza Lima",
    email: "diego.souza@email.com",
    celular: "(13) 96543-2109",
    cpf: "345.678.901-22",
    dataNascimento: "1992-02-14",
    graduacao: GraduacaoSash.BRANCA,
    dataUltimaGraduacao: "2026-02-01",
    status: "Ativo",
    turmaId: "turma_8",
    planoTipo: "2x_semana",
    mensalidade: 160,
    descontoFamiliaTipo: "fixo",
    descontoFamiliaValor: 20, // desconto familiar fixo de 20 reais
    statusFinanceiro: "Atrasado",
    observacoes: "Aluno de Sanda com boa resistência cardiovascular. Precisa melhorar guarda."
  },
  {
    id: "stu_4",
    nome: "Eliane Costa Mendes",
    email: "eliane.mendes@email.com",
    celular: "(13) 95432-1098",
    cpf: "456.789.012-33",
    dataNascimento: "1965-07-30",
    graduacao: GraduacaoSash.AMARELA,
    dataUltimaGraduacao: "2025-08-20",
    status: "Ativo",
    turmaId: "turma_6",
    planoTipo: "2x_semana",
    mensalidade: 150,
    descontoFamiliaTipo: "nenhum",
    descontoFamiliaValor: 0,
    statusFinanceiro: "Em Dia",
    observacoes: "Foco total na saúde e meditação ativa com Tai Chi Chuan."
  }
];

export const INITIAL_PRESENCAS: Presenca[] = [
  { id: "p1", turmaId: "turma_1", alunoId: "stu_1", alunoNome: "Carlos Augusto Silva", data: "2026-06-12", status: "APPROVED", solicitadoPorAluno: true },
  { id: "p2", turmaId: "turma_1", alunoId: "stu_1", alunoNome: "Carlos Augusto Silva", data: "2026-06-15", status: "PENDING", solicitadoPorAluno: true },
  { id: "p3", turmaId: "turma_5", alunoId: "stu_2", alunoNome: "Beatriz Oliveira Santos", data: "2026-06-11", status: "APPROVED", solicitadoPorAluno: false },
  { id: "p4", turmaId: "turma_6", alunoId: "stu_4", alunoNome: "Eliane Costa Mendes", data: "2026-06-11", status: "APPROVED", solicitadoPorAluno: false }
];

export const INITIAL_GRADUACOES: HistoricoGraduacao[] = [
  {
    id: "grad_1",
    alunoId: "stu_1",
    alunoNome: "Carlos Augusto Silva",
    sashAnterior: GraduacaoSash.LARANJA,
    sashNovo: GraduacaoSash.VERDE,
    dataExame: "2025-11-10",
    avaliador: "Professor Décio Padovani",
    notaTecnica: 8.8,
    notaFilosofica: 9.0,
    status: "Aprovado"
  }
];

export const INITIAL_PAGAMENTOS: Pagamento[] = [
  { id: "pay_1", alunoId: "stu_1", alunoNome: "Carlos Augusto Silva", valor: 162, dataVencimento: "2026-06-10", dataPagamento: "2026-06-08", status: "Pago", metodo: "PIX" }, // 180 - 10%
  { id: "pay_2", alunoId: "stu_2", alunoNome: "Beatriz Oliveira Santos", valor: 160, dataVencimento: "2026-06-10", dataPagamento: "2026-06-10", status: "Pago", metodo: "PIX" },
  { id: "pay_3", alunoId: "stu_3", alunoNome: "Diego Souza Lima", valor: 140, dataVencimento: "2026-06-10", status: "Atrasado" } // 160 - 20 fixo
];

export const MOCK_USERS: UserProfile[] = [
  { uid: "user_admin", nome: "Professor Décio Padovani (Diretor/Admin)", email: "deciopadovanijr@gmail.com", role: UserRole.ADMIN },
  { uid: "user_instructor", nome: "Instrutor Marcos Silva", email: "ricardo@kungfu.com", role: UserRole.INSTRUTOR },
  { uid: "user_student_1", nome: "Carlos Augusto Silva", email: "student@kungfu.com", role: UserRole.ALUNO, alunoId: "stu_1" },
  { uid: "user_student_k", nome: "Professor Décio (Aluno Preview)", email: "deciopadovanijr@gmail.com", role: UserRole.ALUNO, alunoId: "stu_1" },
  { uid: "user_student_3", nome: "Diego Souza Lima", email: "diego.souza@email.com", role: UserRole.ALUNO, alunoId: "stu_3" }
];
