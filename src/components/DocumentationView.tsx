/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Clipboard, Layers, Database, ShieldAlert, CheckCircle, Smartphone, HelpCircle } from "lucide-react";

export default function DocumentationView() {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-6 shadow-2xl focus-mode-container" id="doc-container">
      <div className="flex items-center gap-3 border-b border-red-900 pb-4 mb-6">
        <BookOpen className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-white">Análise de Sistemas e Planejamento Arquitetural</h2>
          <p className="text-sm text-slate-400">Memorial Descritivo e Projeto Técnico Extensivo — Gestão Kung Fu Academy</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-6">
        Este documento apresenta o mapeamento completo e o plano de engenharia de software para uma plataforma de gerenciamento de academias tradicionais de artes marciais. Projetado especificamente sob padrões de arquitetura corporativa e de interface refinada (Inter + JetBrains Mono), com base em regras de negócio de evolução de graduandos tradicionais (Sash/Faixas).
      </p>

      {/* Grid of Sections */}
      <div className="space-y-12">
        
        {/* Section 1 & 2 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">1 e 2. Mapeamento das Telas e Fluxo de Navegação</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-sm space-y-3">
            <p className="font-semibold text-red-400">1. ÁREA ADMINISTRATIVA (Admin):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Dashboard Consolidado:</strong> Atividade de faturamento, novos matriculados, curva de retenção, alarmes de inadimplência e alertas de turmas superlotadas.</li>
              <li><strong>Gestão Escopo Aluno [CRUD]:</strong> Cadastro, suspensão, histórico de lesões, dados clínicos, termos de responsabilidade civil e histórico esportivo.</li>
              <li><strong>Módulo de Cobrança:</strong> Linha do tempo de conciliação financeira, envios de boletos/PIX por e-mail/WhatsApp, emissão rápida de recibos.</li>
              <li><strong>Painel de Exame de Graus (Sashes):</strong> Edição das ementas de testes práticos, notas de examinadores convidados e status de aprovação.</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">2. PAINEL DO INSTRUTOR / PROFESSOR:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Chamada Dinâmica:</strong> Lista ativa do dia filtrada por horário das aulas. Frequência expressa (Presente, Faltou, Justificado) integrada em grade ideal para dispositivos móveis ou tablet na borda do tatame.</li>
              <li><strong>Gabarito Prático:</strong> Registro de aptidão técnica por aluno (força, flexibilidade, memória de formas - Tao Lu).</li>
            </ul>

            <p className="font-semibold text-red-400 mt-4">3. PORTAL DO ALUNO (Toi-Dai / Todai):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Grade de Graduação Iterativa:</strong> Representação de sashes com os pré-requisitos técnicos estruturados do sistema tradicional.</li>
              <li><strong>Calendário Semanal:</strong> Quadro dinâmico de horários de treinos com reserva de vagas para turmas com capacidade reduzida.</li>
              <li><strong>Área de Pagamentos:</strong> Visualização de pendências com link de cópia rápida do código PIX Copia-e-Cola.</li>
            </ul>

            <div className="mt-4 p-3 bg-red-950/30 rounded border border-red-900/50 text-xs text-red-300">
              <strong>Fluxo de Navegação Principal:</strong> A autenticação inicial no Firebase Auth direciona ao Role Guard do sistema. Se o perfil contiver a flag <code>role == 'ADMIN'</code>, encaminha para o Dashboard Gerencial. Usuários <code>role == 'INSTRUTOR'</code> são encaminhados diretamente para a Grade de Frequência do dia para diminuir atrito tático de gestão. O usuário <code>role == 'ALUNO'</code> abre diretamente no acompanhamento de sua carteirinha e trilha de evolução de sashes.
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">3. Campos de Formulário Identificados</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-sm space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-red-400">A. Cadastro de Aluno Novo:</p>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                  <li><strong>Nome Completo:</strong> Input text [obrigatório]</li>
                  <li><strong>E-mail de Contato:</strong> Input email [validação automática]</li>
                  <li><strong>Telefone/Celular:</strong> Masked Input (##) #####-####</li>
                  <li><strong>CPF / Documento:</strong> Masked Input ###.###.###-##</li>
                  <li><strong>Data de Nascimento:</strong> Date picker [determina categoria infantil/adulto]</li>
                  <li><strong>Turma Associada:</strong> Select dropdown dinâmico tirado das turmas do banco</li>
                  <li><strong>Graduação Inicial:</strong> Select com Sashes do Kung Fu tradicional</li>
                  <li><strong>Preço Mensalidade:</strong> Numeric currency input</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-400">B. Lançamento de Presença / Chamada:</p>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                  <li><strong>Turma ID:</strong> Hidden / Atribuído por Sessão</li>
                  <li><strong>Data do Treino:</strong> Date picker (padrão dia corrente)</li>
                  <li><strong>Grade de Alunos:</strong> Toggle / Radio Button list (Presente | Falta | Justificada)</li>
                  <li><strong>Nota do Instrutor:</strong> Text area de observações individuais de dedicação</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-2 border-t border-slate-800 pt-3">
              <div>
                <p className="font-semibold text-red-400">C. Agendamento/Lançamento de Exame de Graus:</p>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                  <li><strong>Aluno ID:</strong> Seleção via busca rápida com preenchimento preditivo</li>
                  <li><strong>Sash Proposto:</strong> Select (restringido pelo sash atual + 1 nível)</li>
                  <li><strong>Ficha de Notas:</strong> Inputs numéricos flutuantes para Nota Técnica (0-10) e Nota Filosófica (0-10)</li>
            <p className="font-semibold text-red-400 mt-4">2. PAINEL DO INSTRUTOR (Laoshi / Professor):</p>
                  <li><strong>Status de Aprovação:</strong> Select (Pendente, Aprovado, Reprovado)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-400">D. Gestão de Turmas / Estilos:</p>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                  <li><strong>Nome do Estilo:</strong> Input text (ex: Choy Lay Fut, Shaolin do Norte)</li>
                  <li><strong>Instrutor Responsável:</strong> Select dinâmico de usuários do tipo INSTRUTOR</li>
                  <li><strong>Dias da Semana:</strong> Checkbox list múltiplos d-a-d (Seg. a Sáb.)</li>
                  <li><strong>Horários:</strong> Input de início e fim</li>
                  <li><strong>Capacidade de Alunos:</strong> Input de inteiros</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4">
          <div className="flex items-center gap-2">
            < smartphone className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">4. Componentes Reutilizáveis UI (React + Tailwind)</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-sm space-y-2">
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong><code>TraditionalSashBadge</code>:</strong> Emblema estilizado que injeta o estilo CSS com cores tradicionais (amarelo, verde, preto) baseadas nas hierarquias de sashes do Kung Fu.</li>
              <li><strong><code>MetricCard</code>:</strong> Cartão modularizado contendo título, valor, indicador de comparação percentual positiva/negativa com ícone dinâmico do Lucide-react.</li>
              <li><strong><code>DialogFormContainer</code>:</strong> Modal reestruturado contendo micro-animações do Framer Motion para inserções rápidas de dados sem perca de contexto do tatame.</li>
              <li><strong><code>TraditionalTimeline</code>:</strong> Componente visual linear para rastrear o crescimento do aluno ao longo de suas graduações.</li>
            </ul>
          </div>
        </section>

        {/* Section 5, 6, 7 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">5, 6 e 7. Modelo NoSQL Firestore, Perfis e Regras</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-sm space-y-4">
            <div>
              <p className="font-semibold text-red-400">🔥 Coleções NoSQL Schema (Firestore):</p>
              <pre className="text-xs bg-slate-900 p-3 rounded text-amber-500 font-mono mt-1 overflow-x-auto">
{`// 1. /users/{userId}
{
  uid: "string",
  nome: "string",
  email: "string",
  role: "ADMIN" | "INSTRUTOR" | "ALUNO",
  alunoId?: "string" // Caso role === 'ALUNO'
}

// 2. /alunos/{alunoId}
{
  nome: "string",
  email: "string",
  celular: "string",
  cpf: "string",
  dataNascimento: "string (YYYY-MM-DD)",
  graduacao: "string (enum Sashes)",
  dataUltimaGraduacao: "timestamp",
  status: "Ativo" | "Inativo",
  turmaId: "string (ref: /turmas)",
  mensalidade: "number",
  statusFinanceiro: "Em Dia" | "Atrasado" | "Pendente",
  observacoes: "string"
}

// 3. /turmas/{turmaId}
{
  nomeEstilo: "string", // ex: Wing Chun
  instrutorId: "string",
  instrutorNome: "string",
  diasSemana: ["string"],
  horario: "string",
  categoria: "string",
  capacidade: "number"
}

// 4. /presencas/{presencaId}
{
  turmaId: "string",
  alunoId: "string",
  alunoNome: "string",
  data: "string (YYYY-MM-DD)",
  status: "Presente" | "Faltou" | "Justificado",
  observacao?: "string"
}`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-red-400">🛡️ Perfis de Acesso de Usuários (RBAC):</p>
              <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                <li><strong>ADMIN:</strong> Poder absoluto de leitura e escrita em qualquer nó geográfico do banco. Controla mensalidades, cadastra e demite instrutores, emite ordens de pagamento.</li>
                <li><strong>INSTRUTOR:</strong> Escrita restrita ao ecossistema de chamadas e observações de progresso do aluno. Não pode ver dados de faturamento financeiro amplo do sistema nem alterar o valor de planos dos alunos.</li>
                <li><strong>ALUNO:</strong> Leitura restrita exclusivamente aos seus próprios registros pessoais, grade de treinos semanal e pendências PIX de sua própria matrícula.</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-red-400">📋 Regras de Negócio e Práticas:</p>
              <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                <li><strong>Interstício de Amadurecimento:</strong> Um aluno só pode solicitar exame para a próxima faixa se tiver completado um tempo mínimo (ex: faixa branca para amarela = 3 meses; faixas avançadas = 12 meses+) e mantiver frequência regular acima de 75%.</li>
                <li><strong>Suspensão por Inadimplência:</strong> Caso a cobrança exceda 15 dias de atraso, o status financeiro altera para "Atrasado". Um alerta visual se acende nos painéis gerenciais e o aluno recebe avisos automáticos de regularização.</li>
                <li><strong>Capacidade Limite de Turma:</strong> Matrículas ou remanejamentos em turmas que já excedessem a lotação de segurança do tatame são barrados ou necessitam de liberação expressa do administrador.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8 & 9 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">8 e 9. Casos de Uso e Arquitetura do Repositório</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-sm space-y-3 text-slate-300">
            <p className="font-semibold text-red-400">Casos de Uso Principais (Use Cases):</p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li><strong>UC-001 [Matrimônio de Turma]:</strong> Matrícula de novo entusiasta, triando data de nascimento para inserção na turma de metodologia adequada e atribuição de mensalidade base.</li>
              <li><strong>UC-002 [Chamada no Celular]:</strong> Instrutor acessa no tatame o app no celular, escolhe a aula do horário de 19:00 e conclui em 20 segundos o registro de presenças.</li>
              <li><strong>UC-003 [Exame de Graduação]:</strong> No dia do exame, o avaliador insere as notas estruturadas por técnicas de ataque, defesa, chutes, formas de armas e filosofia. O sistema calcula a nota média automática e aprova o aluno atualizando seu sash de forma automática no perfil.</li>
            </ul>

            <p className="font-semibold text-red-400 mt-2">Estrutura Ideal do Repositório (SPA + Firebase):</p>
            <pre className="text-xs bg-slate-900 p-2.5 rounded font-mono text-cyan-400 overflow-x-auto">
{`/src
  /assets           # Logotipos tradicionais, tambores e emblemas Shaolin
  /components       # Componentes reusáveis (Sidebar, Modal, Buttons)
    - Sidebar.tsx
    - MetricCard.tsx
    - SashBadge.tsx
  /data             # Arquivos de mocking, tabelas estáticas de requisitos de faixas
  /hooks            # Hooks customizados para gerenciar o estado e persistência local
  /services         # Conexão com Firebase, Firestore, Auth e Cloud Storage
    - firebase.ts
    - db.ts
  /styles           # Estilos e Tailwind Core configs
  /types            # Arquivo typescript centralizado de tipos e interfaces
  - App.tsx         # Layout centralizador e chaveador de perfis de testes
  - index.css       # Core do Tailwind
  - main.tsx        # Renderização do React no nível do DOM`}
            </pre>
          </div>
        </section>

        {/* Section 10 & 11 */}
        <section className="border-l-2 border-red-600 pl-4 space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">10 e 11. Auditoria de UX/UI e Funcionalidades Esportivas</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
            <div>
              <p className="font-semibold text-red-400">💡 Otimizações Refinadas de UX/UI:</p>
              <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                <li><strong>Contraste Altamente Assertivo:</strong> Uso consistente de fundo antracite (Slate-950 / Carbono) com tipografia Inter limpa para clareza extrema quando visualizado em tablets sobre o tatame onde a iluminação pode flutuar.</li>
                <li><strong>Cores Associadas de Sash Integradas:</strong> O badge ou campo do perfil do aluno reflete visualmente a cor exata de sua faixa física (por exemplo, borda amarela, fundo preto sólido se for faixa preta).</li>
                <li><strong>Teclado Customizado na Presença:</strong> Botões de clique rápido (em vez de caixas de seleção minúsculas) para facilidade de marcação com as mãos suadas ou de luvas durante o treino.</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-red-400">🥋 Funcionalidades Críticas de Artes Marciais (Faltantes no Mercado):</p>
              <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                <li><strong>Genealogia SHAOLIN / Linhagem (Lineage Tree):</strong> Visualizador dinâmico de árvore genealógica que conecta o estudante à raiz de seu estilo. Mantém as tradições de respeito e ética.</li>
                <li><strong>Controle de Equipamentos (Equipment Tracking):</strong> Gestão de estoque e empréstimo de armas de treino (Bastão, Espada, Sabão, Lança) que pertencem à academia.</li>
                <li><strong>Glossário de Termos em Mandarim / Pinyin:</strong> Biblioteca interativa interna com pronúncia fonética e caracteres chineses para facilitar o estudo de exames na academia.</li>
                <li><strong>Regulamento de Conduta Ética:</strong> Termos declarados visíveis de disciplina, filosofia e respeito aos pares, essenciais dentro das escolas de artes marciais.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 12 - Regras Permanentes de Marca */}
        <section className="border-l-2 border-amber-500 pl-4 space-y-4 text-sm" id="protected-brand-rules">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-550" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">12. Diretrizes de Marca e Proteção do Brasão (Requisito Permanente)</h3>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-lg border border-amber-950/40 space-y-3">
            <p className="font-mono text-xs text-amber-500 uppercase font-black">🛡️ Ativo Institucional Protegido</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              O brasão oficial da <strong>Garra de Águia Praia Grande</strong> é um ativo institucional estritamente protegido. 
              As seguintes regras são requisitos técnicos de engenharia permanentes para evolução futura do software em conformidade regulamentar:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2">
              <li><strong>Proibição de Substituição:</strong> Nenhuma futura atualização poderá sob qualquer circunstância substituir o arquivo estático original <code>logo.png</code>.</li>
              <li><strong>Preservação das Dimensões:</strong> É estritamente proibido alterar as dimensões originais ou proporções de aspecto do brasão para evitar distorções de forma.</li>
              <li><strong>Preservação Cromática:</strong> É proibido alterar as cores originais do brasão ou aplicar qualquer alteração de saturação/tonalidade na imagem oficial.</li>
              <li><strong>Proibição de Filtros e Efeitos:</strong> Não é permitida a aplicação de filtros visuais, animações dinâmicas (como rotações, oscilações ou pulsações), efeitos em 3D ou renderizações tridimensionais artificiais.</li>
              <li><strong>Proibição de Estilização Secundária:</strong> É permanentemente vedada qualquer tentativa de estilização por Inteligência Artificial ou criação de versões alternativas (como interpretações vetorizadas casuais ou o antigo repositório <code>EagleLogo</code>).</li>
              <li><strong>Tratamento Rigoroso de Erros de Carregamento:</strong> Caso o arquivo <code>logo.png</code> não seja localizado ou falhe no carregamento, o sistema DEVE disparar um erro de mídia explícito na tela <code>[Erro de carregamento do brasão oficial]</code>. É expressamente proibido gerar ou recuperar qualquer brasão substituto automático (vetores, ícones ou mockups provisórios).</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
