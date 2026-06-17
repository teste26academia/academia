/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Aluno, Turma, Presenca, HistoricoGraduacao, Pagamento, UserProfile, GlobalConfigs } from "../types";

export const INITIAL_CONFIG: GlobalConfigs = {
  id: "global_config",
  descontoFamiliarPercentualPadrao: 10,
  descontoFamiliarFixoPadrao: 20,
  avisoMural: "Bem-vindos à Academia Liga Garra de Águia Praia Grande. Acompanhe seu progresso tradicional e histórico de treino real no portal do aluno.",
  contatoSuporte: "(13) 99123-4567",
  enderecoAcademia: "Rua Guimarães Rosa 1191 - Praia Grande, SP"
};

// Official schedules requested by the user:
export const INITIAL_TURMAS: Turma[] = [
  {
    id: "turma_1",
    nomeEstilo: "Kung Fu (15:00 às 16:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda", "Quarta", "Sexta"],
    horario: "15:00 - 16:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_2",
    nomeEstilo: "Kung Fu (16:30 às 17:30)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda", "Quarta", "Sexta"],
    horario: "16:30 - 17:30",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_3",
    nomeEstilo: "Kung Fu (18:00 às 19:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Segunda"],
    horario: "18:00 - 19:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_4",
    nomeEstilo: "Kung Fu (10:00 às 11:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Terça", "Quinta"],
    horario: "10:00 - 11:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_5",
    nomeEstilo: "Kung Fu (20:30 às 21:30)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Terça", "Quinta"],
    horario: "20:30 - 21:30",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_6",
    nomeEstilo: "Tai Chi Chuan (18:00 às 19:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Quarta", "Sexta"],
    horario: "18:00 - 19:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_7",
    nomeEstilo: "Kung Fu (19:30 às 20:30)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Quarta", "Sexta"],
    horario: "19:30 - 20:30",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_8",
    nomeEstilo: "Boxe Chinês / Sanda (21:00 às 22:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Quarta", "Sexta"],
    horario: "21:00 - 22:00",
    categoria: "Misto",
    capacidade: 20
  },
  {
    id: "turma_9",
    nomeEstilo: "Kung Fu (11:15 às 12:00)",
    instrutorId: "ins_1",
    instrutorNome: "Professor Décio Padovani",
    diasSemana: ["Sábado"],
    horario: "11:15 - 12:00",
    categoria: "Misto",
    capacidade: 20
  }
];

// No simulation: entirely empty fallback arrays to enforce 100% real Firestore data usage
export const INITIAL_ALUNOS: Aluno[] = [];
export const INITIAL_PRESENCAS: Presenca[] = [];
export const INITIAL_GRADUACOES: HistoricoGraduacao[] = [];
export const INITIAL_PAGAMENTOS: Pagamento[] = [];
export const MOCK_USERS: UserProfile[] = [];
