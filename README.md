# Associação Garra de Águia Praia Grande - Portal de Gestão Marcial

Este é o portal completo de gestão e administração da **Associação Garra de Águia Praia Grande**, desenvolvido com **React (TypeScript)**, **Vite**, **Tailwind CSS** e **Firebase (Authentication & Cloud Firestore)**.

---

## 🎯 Escopo e Proposta Técnica

O portal organiza de forma harmônica a vida operacional e acadêmica de nossa associação sob os princípios de integridade, respeito e ética (**Wu De**). Ele segmenta acessos com base em funções organizacionais rigorosas:

1. **Painel de Alunos (Área do Discente)**:
   - Visualização de calendário pessoal e horários das turmas contratadas.
   - Solicitação eletrônica de marcação de presença e verificação imediata de diário.
   - Histórico marcial com registro de exames anteriores, avaliadores, notas técnicas/filosóficas e sashes (graduações) alcançadas.
   - Visualização de faturas marciais de mensalidade (Plano de Treino) com status e valores detalhados conforme descontos familiares aplicados.
   - Dados para suporte com a direção e mural oficial de avisos.

2. **Painel de Instrutores (Área Técnica)**:
   - Visualização e controle de frequência das turmas designadas a cada instrutor (Kung Fu, Tai Chi Chuan, Boxe Chinês / Sanda).
   - Aprovação de diários de presenças enviados pelos alunos em formato real-time.
   - Consulta detalhada aos dados de contato dos alunos cadastrados em sua carteira de treinamento.

3. **Painel do Administrador (Direção / Sifu)**:
   - Gestão global de matrículas e readequação de dados de alunos.
   - Parametrização e customização financeira, incluindo configurações de desconto familiar (%) ou desconto fixo (R$).
   - mural de avisos institucionais e canais oficiais de contato.
   - **Mapeamento de Diagnóstico Técnico e Auditoria (Fase 3)**: Relatório de integridade em tempo real abrangendo conexões, verificação de logo institucional oficial, monitoramento de regras de segurança no Firestore e auditoria de coleções operacionais.

---

## 🏛️ Estrutura e Arquitetura do Projeto

O código foi arquitetado com base no padrão modular e componentes desacoplados para facilidade de manuseio e importação direta.

```bash
├── assets/                  # Configurações do ambiente de simulação do editor
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx       # Componentes de controle e gestão financeira da direção
│   │   ├── InstructorPanel.tsx  # Métodos de controle de chamada técnica e frequência de turmas
│   │   ├── StudentPanel.tsx     # Diário de presença, faturamento e histórico do discente
│   │   ├── DiagnosticPanel.tsx  # Tela de Auditoria e Integridade geral (Fase 3 operacional)
│   │   └── DocumentationView.tsx# Glossário marcial e regras de transição de faixas/sashes
│   ├── context/
│   │   └── AuthContext.tsx      # Provider unificado de autenticação e recuperação de PII
│   ├── data/
│   │   └── mockData.ts          # Arquivos de estrutura para provisionamento inicial
│   ├── firebase.ts          # Gatilhos do SDK do Firebase e logs estruturados de erros (Zero-Trust)
│   ├── types.ts             # Declarações e validações do TypeScript (Interfaces de Domínio)
│   ├── main.tsx             # Arquivo de inicialização do React 19
│   ├── App.tsx              # Roteamento seguro de gateways de login e inicialização da aplicação
│   └── index.css            # Folha de estilos tailwindcss
├── .env.example             # Variáveis de ambiente padrão
├── firebase-blueprint.json  # Blueprint e modelo do banco de dados Cloud Firestore
├── firebase-applet-config.json # Credenciais de comunicação de rede do Firebase
├── firestore.rules          # Regras restritivas de acesso granular (Security Rules)
├── metadata.json            # Metadados e permissões da aplicação
├── tsconfig.json            # Configurações do processamento do TypeScript
└── package.json             # Controle de bibliotecas instaladas e scripts do projeto
```

---

## 🛠️ Dependências Principais Declaradas

O projeto utiliza bibliotecas altamente eficientes e modernas para desenvolvimento Web SPA:
- **React (v19)** & **Vite (v6)**: Velocidade superior de transição e performance excepcional de renderização.
- **Firebase Web SDK (v12)**: Persistência distribuída em tempo real para controle operacional da associação.
- **Tailwind CSS (v4)**: Desenho fluído, paleta de cores elegantes fundamentada no preto e cobre dourado (Slate & Amber) com alto contraste.
- **Lucide-React & Motion**: Micro-animações e símbolos vetoriais limpos e legíveis.

---

## 🔒 Regras de Segurança e Conformidade (firestore.rules)

Todas as comunicações com o Cloud Firestore utilizam regras do tipo **Zero-Trust** e não-vazamento de dados privados (PII):
- **Coleção `users`**: Leitura pública permitida para usuários devidamente identificados por token. Escrita permitida apenas ao dono do respectivo perfil (`request.auth.uid == userId`).
- **Coleção `alunos`**: Restrito a contas autenticadas. Apenas administradores e instrutores credenciados podem alterar cadastros. Alunos apenas acessam se o ID for vinculado ao seu perfil verificado.
- **Coleção `mensalidades`, `exames`, `presencas`**: Mapeamento granular e seguro de gravação apenas por administradores ou donos dos cadastros.

---

## 🚀 Guia Prático para Instalação Local e Execução

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- **Node.js (versão 18 ou superior)**
- **NPM ou Yarn**

### Instruções Passo a Passo

1. **Clonar ou baixar o repositório**:
   ```bash
   git clone <url-do-repositorio-github>
   cd <nome-do-repositorio>
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Configuração de Variáveis (Opcional)**:
   Copie as variáveis do arquivo de modelo para o seu ambiente local:
   ```bash
   cp .env.example .env
   ```

4. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

5. **Instanciação de Produção (Build do Vite)**:
   ```bash
   npm run build
   ```
   Os arquivos compilados de alta performance e estáticos serão adicionados de forma estruturada no diretório `/dist` pronto para deploy sob CDN.

---

## 🥋 Princípios do Wu De Aplicados ao Desenvolvimento

- **Humildade (Qian Xu)**: Interface simples, sem excesso de logs, priorizando a usabilidade do aluno e do diretor.
- **Respeito (Zun Jing)**: Segurança de dados de e-mail e CPF blindados contra vazamentos.
- **Justiça (Yi)**: Transparência nos fluxos financeiros integrando descontos e abonos estritos.
