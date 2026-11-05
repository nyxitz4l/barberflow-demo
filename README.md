# ✂️ BarberFlow

### Sistema de Gestão e Agendamento para Barbearias

O **BarberFlow** é uma aplicação web demonstrativa desenvolvida para apresentar uma solução digital de gerenciamento de barbearias, reunindo agendamentos, clientes, profissionais, serviços e indicadores financeiros em uma única plataforma.

O projeto foi desenvolvido com foco em experiência do usuário, organização de código, responsividade e simulação de funcionalidades comuns em sistemas SaaS.

> **⚠️ PROJETO DEMONSTRATIVO**
>
> O BarberFlow é um projeto de portfólio. Todos os dados apresentados são fictícios e as operações são simuladas localmente no navegador. Não existe conexão com banco de dados, processamento de pagamentos ou realização de agendamentos reais.

---

## 🖥️ Visão geral

O sistema possui duas interfaces principais:

- **Painel administrativo:** gerenciamento e visualização das operações da barbearia.
- **Agendamento público:** experiência simulada para seleção de serviços, profissionais, datas e horários.

---

## ✨ Funcionalidades

### Dashboard
- Indicadores de desempenho.
- Resumo de agendamentos.
- Faturamento demonstrativo.
- Gráficos de desempenho.
- Visão geral das atividades.

### Agendamentos
- Criação e edição de agendamentos.
- Visualização de horários.
- Controle de status.
- Filtros e pesquisa.
- Simulação de disponibilidade dos profissionais.

### Clientes
- Cadastro e gerenciamento.
- Histórico de atendimentos.
- Informações de contato fictícias.
- Pesquisa de clientes.

### Profissionais
- Cadastro de profissionais.
- Especialidades.
- Gerenciamento de disponibilidade.
- Visualização de agendas.

### Serviços
- Cadastro e edição de serviços.
- Definição de preços demonstrativos.
- Duração estimada.
- Controle de disponibilidade.

### Financeiro
- Indicadores financeiros simulados.
- Faturamento demonstrativo.
- Ticket médio.
- Gráficos e relatórios.

### Agendamento público
- Seleção de serviços.
- Escolha de profissionais.
- Calendário interativo.
- Seleção de horários.
- Formulário de cliente.
- Confirmação demonstrativa.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| React | Construção da interface |
| TypeScript | Tipagem e segurança do código |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS | Estilização |
| Lucide React | Ícones |
| Recharts | Visualização de dados |
| localStorage | Persistência local dos dados demonstrativos |

**Arquitetura:** aplicação frontend com serviços simulados e armazenamento local, preparada para uma futura integração com backend.

---

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js instalado.
- npm instalado.
- Git instalado (opcional).

### 1. Clone o repositório

```bash
git clone https://github.com/nyxitz4l/barberflow-demo.git
```

### 2. Acesse a pasta

```bash
cd barberflow-demo
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

### 5. Acesse no navegador

```text
http://localhost:5173
```

---

## 📁 Organização do projeto

```text
src/
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── appointments/
│   ├── customers/
│   ├── professionals/
│   ├── services/
│   ├── finance/
│   ├── booking/
│   └── ui/
│
├── pages/
│   ├── Dashboard/
│   ├── Appointments/
│   ├── Customers/
│   ├── Professionals/
│   ├── Services/
│   ├── Finance/
│   ├── Settings/
│   └── PublicBooking/
│
├── services/
│   ├── mock/
│   └── storage/
│
├── hooks/
├── types/
├── utils/
├── assets/
│
├── App.tsx
└── main.tsx
```

*Estrutura ilustrativa. A organização efetiva pode variar conforme a implementação.*

---

## 💾 Dados e armazenamento

O BarberFlow utiliza dados fictícios para simular o funcionamento de uma plataforma de gestão.

O armazenamento local permite preservar alterações durante a utilização da demonstração.

Características:
- Dados iniciais simulados.
- Persistência por meio de `localStorage`.
- Operações locais de cadastro, edição e exclusão.
- Possibilidade de restaurar os dados originais da demonstração.

Não são utilizados dados pessoais reais.

---

## 🔮 Possíveis evoluções

O projeto possui espaço para futuras melhorias, incluindo:

- Integração com Supabase.
- Autenticação e autorização de usuários.
- Banco de dados PostgreSQL.
- Agendamentos em tempo real.
- Notificações via WhatsApp.
- Integração com plataformas de pagamento.
- Gestão de múltiplas unidades.
- Arquitetura multi-tenant.

Essas funcionalidades representam possibilidades futuras e não fazem parte da demonstração atual.

---

## 🎯 Objetivo do projeto

O BarberFlow foi desenvolvido como projeto de portfólio para explorar e demonstrar conhecimentos em:

- Desenvolvimento de interfaces web.
- React e TypeScript.
- Componentização.
- Organização de aplicações frontend.
- Gerenciamento de estado.
- Persistência local.
- Regras de negócio.
- Design responsivo.
- Experiência do usuário.

---

## 👨‍💻 Desenvolvedor

**Kayky Santinelli**

Desenvolvimento de software | Full Stack | Automação | Cibersegurança

- GitHub: [@nyxitz4l](https://github.com/nyxitz4l)
- Portfólio: Em desenvolvimento

---

## 📄 Licença

Este projeto está disponível para fins demonstrativos e de portfólio.

A licença de uso e distribuição deverá ser definida no repositório.

---

<p align="center">
  Desenvolvido por <strong>Kayky Santinelli</strong>
  <br>
  <sub>BarberFlow • Interactive SaaS Demo</sub>
</p>
