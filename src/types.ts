/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  INSTRUTOR = "INSTRUTOR",
  ALUNO = "ALUNO"
}

export enum GraduacaoSash {
  BRANCA = "Branca (Iniciante)",
  AMARELA = "Amarela",
  LARANJA = "Laranja",
  VERDE = "Verde",
  AZUL = "Azul",
  VERMELHA = "Vermelha",
  ROXA = "Roxa",
  MARROM = "Marrom",
  PRETA_1_DUAN = "Preta - 1º Duan (Instrutor)",
  PRETA_2_DUAN = "Preta - 2º Duan",
  PRETA_3_DUAN = "Preta - 3º Duan (Professor)"
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  celular: string;
  cpf: string;
  dataNascimento: string;
  graduacao: GraduacaoSash;
  dataUltimaGraduacao: string;
  status: "Ativo" | "Inativo";
  turmaId: string;
  planoTipo: "1x_semana" | "2x_semana" | "3x_semana" | "4x_semana" | "outro";
  mensalidade: number; // Valor bruto do plano
  descontoFamiliaTipo: "percentual" | "fixo" | "nenhum";
  descontoFamiliaValor: number; // Valor ou % de desconto configurado
  statusFinanceiro: "Em Dia" | "Atrasado" | "Pendente";
  observacoes?: string;
}

export interface Turma {
  id: string;
  nomeEstilo: string; // Ex: Louva-a-Deus, Wing Chun, Tai Chi Chuan, Sanshou (Sanda)
  instrutorId: string;
  instrutorNome: string;
  diasSemana: string[]; // Ex: ["Segunda", "Quarta", "Sexta"]
  horario: string; // Ex: "19:00 - 20:30"
  categoria: "Iniciante" | "Intermediário" | "Avançado" | "Misto";
  capacidade: number;
}

export interface Presenca {
  id: string;
  turmaId: string;
  alunoId: string;
  alunoNome: string;
  data: string; // YYYY-MM-DD
  status: "PENDING" | "APPROVED" | "REJECTED" | "Presente" | "Faltou" | "Justificado";
  observacao?: string;
  solicitadoPorAluno?: boolean; // True se foi enviado pelo app do celular do aluno
}

export interface GlobalConfigs {
  id: string;
  descontoFamiliarPercentualPadrao: number;
  descontoFamiliarFixoPadrao: number;
  avisoMural: string;
  contatoSuporte: string;
  enderecoAcademia: string;
}

export interface HistoricoGraduacao {
  id: string;
  alunoId: string;
  alunoNome: string;
  sashAnterior: GraduacaoSash;
  sashNovo: GraduacaoSash;
  dataExame: string;
  avaliador: string;
  notaTecnica: number;
  notaFilosofica: number;
  status: "Acesso Permitido" | "Aprovado" | "Pendente";
}

export interface Pagamento {
  id: string;
  alunoId: string;
  alunoNome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: "Pago" | "Pendente" | "Atrasado";
  metodo?: "PIX" | "Cartão" | "Dinheiro" | "Boleto";
}

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  role: UserRole;
  alunoId?: string; // se for Aluno, linka com o Aluno.id
}
