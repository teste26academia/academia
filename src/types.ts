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
  BRANCA = "Faixa Branca",
  AMARELA = "Faixa Amarela",
  LARANJA = "Faixa Laranja",
  VERDE = "Faixa Verde",
  AZUL = "Faixa Azul",
  ROXA = "Faixa Roxa",
  MARROM = "Faixa Marrom",
  PRETA = "Faixa Preta"
}

export interface Aluno {
  id: string;
  userId: string; // ID link from users collection
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  responsavel: string;
  foto: string;
  dataMatricula: string;
  graduacaoAtual: string; // "Faixa Branca", "Faixa Amarela", etc.
  dataUltimaGraduacao: string;
  status: "Ativo" | "Inativo" | "Pendente" | "ATIVO" | "INATIVO" | "PENDENTE";
  turmaId: string;
  modalidade: string;
  modalidades?: string[];
  observacoes: string;
  statusFinanceiro: "EM DIA" | "PENDENTE" | "ATRASADO" | "ISENTO" | "Em Dia" | "Atrasado" | "Pendente" | "Isento";

  // Compatibility flags for legacy code
  graduacao?: string;
  celular?: string;
  planoTipo?: "1x_semana" | "2x_semana" | "3x_semana" | "4x_semana" | "outro";
  mensalidade?: number;
  descontoFamiliaTipo?: "percentual" | "fixo" | "nenhum";
  descontoFamiliaValor?: number;
}

export interface Turma {
  id: string;
  nomeEstilo: string; // Ex: Louva-a-Deus, Wing Chun, Tai Chi Chuan, Sanshou (Sanda)
  instrutorId: string; // ID from instrutores collection
  instrutorNome: string; // Name from instrutores collection
  diasSemana: string[]; // Ex: ["Segunda", "Quarta", "Sexta"]
  horario: string; // Ex: "19:00 - 20:30"
  categoria: "Iniciante" | "Intermediário" | "Avançado" | "Misto";
  capacidade: number;
}

export interface Instrutor {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  ativo: boolean;
  observacoes: string;
}

export interface Presenca {
  id: string;
  alunoId: string;
  modalidade?: string;
  data: string; // YYYY-MM-DD
  horario?: string; // Ex: "15:00 às 16:00"
  status: "PENDING" | "APPROVED" | "REJECTED" | "Presente" | "Faltou" | "Justificado";
  confirmadoPor?: string;

  // Compatibility fields for legacy views
  turmaId?: string;
  alunoNome?: string;
  observacao?: string;
  solicitadoPorAluno?: boolean;
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
  graduacaoAnterior: string; // "Faixa Branca", etc.
  graduacaoNova: string; // "Faixa Amarela", etc.
  dataGraduacao: string; // YYYY-MM-DD
  avaliador: string;
  observacoes: string;
  resultado: string; // "Aprovado", "Reprovado", etc.

  // Compatibility fields for old pages
  alunoNome?: string;
  sashAnterior?: string;
  sashNovo?: string;
  dataExame?: string;
  status?: string;
  notaTecnica?: number;
  notaFilosofica?: number;
}

// Keep Pagamento alias/interface mapped directly to Mensalidade structure
export interface Pagamento {
  id: string;
  alunoId: string;
  referencia: string; // "06/2026"
  vencimento: string; // YYYY-MM-DD
  valor: number;
  desconto?: number;
  valorFinal: number;
  status: "EM DIA" | "PENDENTE" | "ATRASADO" | "ISENTO" | "Pago" | "Pendente" | "Atrasado";
  dataPagamento?: string;

  // Compatibility fields
  alunoNome?: string;
  dataVencimento?: string;
  metodo?: string;
}

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  role: UserRole;
  createdAt?: string;
  ativo?: boolean;
  alunoId?: string; // se for Aluno, linka com o Aluno.id
  celular?: string;
  endereco?: string;
}

export interface Exame {
  id: string;
  alunoId: string;
  graduacaoPretendida: string;
  avaliador: string;
  dataExame: string;
  notaTecnica: number;
  notaTeorica: number;
  observacoes: string;
  resultado: "APROVADO" | "REPROVADO" | "PENDENTE" | string;
  alunoNome?: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
  estoque: number;
}

export interface Venda {
  id: string;
  alunoId: string;
  produtoId: string;
  quantidade: number;
  valor: number;
  dataVenda: string;
  alunoNome?: string;
  produtoNome?: string;
}

export interface Familia {
  id: string;
  nome: string;
  alunosIds: string[]; // IDs dos alunos que pertencem a esta família
  descontoTipo?: "percentual" | "fixo" | "nenhum";
  descontoValor?: number;
}
