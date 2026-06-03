<div align="center">

# 🏥 Medi-Chain

### Sistema de E-Prescription com Blockchain Ethereum

Prescrições médicas digitais autenticadas, rastreáveis e imutáveis na blockchain.

[![License](https://img.shields.io/badge/license-Academic-blue.svg)]()
[![Status](https://img.shields.io/badge/status-Em%20produção-success.svg)]()
[![Blockchain](https://img.shields.io/badge/blockchain-Ethereum%20Sepolia-purple.svg)]()
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue.svg)]()

**Trabalho de Conclusão de Curso — Instituto Federal de Brasília (IFB)**  
Curso Superior de Tecnologia em Sistemas para Internet · 2025

</div>

---

## 📋 Sobre o projeto

O **Medi-Chain** é um sistema de prescrição médica eletrônica (e-prescription) que utiliza a tecnologia blockchain para garantir a autenticidade, rastreabilidade e imutabilidade das receitas médicas. Cada prescrição é registrada na rede Ethereum Sepolia, armazenada no IPFS e enviada automaticamente ao paciente por e-mail em formato PDF com QR Code.

### 🎯 O problema que resolve

Cerca de **30% dos atestados médicos** emitidos no Brasil são falsificados (Fecomércio, 2020). Receitas escritas à mão apresentam média de **3,3 erros por documento** (Johnson & Johnson Medtech, 2021). O Medi-Chain combate essas vulnerabilidades com um registro imutável e auditável na blockchain, impossível de falsificar.

---

## 🚀 Acesso em produção

O sistema está em produção e pode ser acessado:

| Serviço | URL |
|---------|-----|
| 🌐 **Frontend** | [medichaintcc.netlify.app](https://medichaintcc.netlify.app/login) |
| 🔌 **Backend (API)** | https://tcc-medichan-production.up.railway.app |
| ⛓ **Smart Contract** | [`0xe905e4e6...0Fa16`](https://sepolia.etherscan.io/address/0xe905e4e639AfFf9D9e30738c2a1F872D4cb0Fa16) |
| ❤️ **Health Check** | [/health](https://tcc-medichan-production.up.railway.app/health) |

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    🌐 Nginx                          │
│          /api/* → backend   /  → frontend            │
└──────────────────┬──────────────────┬───────────────┘
                   │                  │
          ┌────────▼───────┐  ┌───────▼────────┐
          │    Backend     │  │    Frontend     │
          │ Node.js+Express│  │  React+Vite+TS  │
          └────────┬───────┘  └────────────────┘
                   │
       ┌───────────┼────────────────┐
       │           │                │
┌──────▼──────┐ ┌──▼──┐  ┌─────────▼──────────┐
│ PostgreSQL  │ │Redis│  │  Ethereum Sepolia  │
│ (histórico) │ │cache│  │   Smart Contract   │
└─────────────┘ └─────┘  └─────────────────────┘
                                    │
                             ┌──────▼──────┐
                             │    IPFS     │
                             │  (Pinata)   │
                             └─────────────┘
```

### Três camadas de armazenamento

| Camada | O que armazena | Por quê |
|--------|----------------|---------|
| 🗄 **PostgreSQL** | Usuários, resumo das receitas, histórico | Consultas rápidas sem chamar a blockchain |
| 📦 **IPFS** | Dados completos da prescrição (JSON) | Armazenamento descentralizado e imutável |
| ⛓ **Blockchain** | Hash do IPFS + status da receita | Fonte da verdade — não pode ser alterada |

---

## ✅ Funcionalidades

| # | Requisito | Status |
|---|-----------|--------|
| **RF01** | Médico registra prescrição digital | ✅ |
| **RF02** | Autenticação com roles (PATIENT, DOCTOR, PHARMACY, ADMIN) | ✅ |
| **RF03** | Compartilhamento via QR Code | ✅ |
| **RF04** | Histórico de prescrições para médico e farmácia | ✅ |
| **RF05** | Farmácia valida autenticidade na blockchain | ✅ |
| **RF06** | Notificação ao paciente com PDF por e-mail | ✅ |
| **RF07** | Status rastreável: ACTIVE → USED / REVOKED | ✅ |

---

## 🛠 Stack tecnológica

| Camada | Tecnologias |
|---|---|
| **Frontend** | React.js · Vite · TypeScript · Styled-components · React Router · Axios |
| **Backend** | Node.js · Express.js · TypeScript · Prisma ORM |
| **Banco** | PostgreSQL · Redis (cache) |
| **Blockchain** | Ethereum Sepolia · Solidity ^0.8.24 · Hardhat · OpenZeppelin AccessControl · ethers.js |
| **Armazenamento** | IPFS via Pinata |
| **Auth & Segurança** | JWT · bcrypt |
| **PDF & Email** | PDFKit · QR Code · Resend API |
| **Infraestrutura** | Docker · Docker Compose · Nginx · Railway · Netlify |

---

## 📁 Estrutura do repositório

```
TCC-Medichan/
├── backend/              # API RESTful (Node.js + Express)
│   ├── src/
│   │   ├── config/       # Blockchain, database, redis
│   │   ├── controllers/  # Auth, prescription, user
│   │   ├── middleware/   # Auth + roles
│   │   ├── routes/       # Express routes
│   │   ├── services/     # IPFS, blockchain, PDF, email
│   │   └── server.ts
│   ├── prisma/           # Schema + migrations
│   └── Dockerfile
├── frontend/             # SPA (React + Vite)
│   ├── src/
│   │   ├── components/   # Layout, ProtectedRoute, etc.
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Login, Register, Dashboards
│   │   ├── services/     # API client (Axios)
│   │   └── styles/       # Design tokens
│   └── Dockerfile
├── smartcontract/        # Contrato Solidity + Hardhat
│   ├── contracts/        # MediChainPrescription.sol
│   ├── scripts/          # Deploy scripts
│   └── test/             # Testes unitários
├── nginx/                # Reverse proxy config
├── docker-compose.yml    # Desenvolvimento local
└── docker-compose.prod.yml  # Produção
```

---

## 💻 Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) >= 20
- [Docker](https://docker.com) + Docker Compose
- Conta no [Pinata](https://pinata.cloud) (IPFS)
- Conta no [Infura](https://infura.io) (RPC Sepolia)
- Conta no [Resend](https://resend.com) (e-mails)

### 1. Clone o repositório

```bash
git clone https://github.com/Dhisting1/TCC-Medichan.git
cd TCC-Medichan
```

### 2. Suba o banco e o Redis

```bash
docker compose up -d postgres redis
```

### 3. Configure o backend

```bash
cd backend
cp .env.example .env  # edite com suas credenciais
npm install
npx prisma migrate dev
npm run dev
```

### 4. Configure o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` 🚀

---

## 🔐 Variáveis de ambiente — backend

```env
# Servidor
PORT=3000
DATABASE_URL=postgresql://medichain:medichain@localhost:5432/medichain
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua_chave_secreta_forte

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_INFURA_ID
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
CONTRACT_ADDRESS=0xe905e4e639AfFf9D9e30738c2a1F872D4cb0Fa16

# IPFS
PINATA_JWT=SEU_JWT_PINATA

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=re_sua_chave_resend
RESEND_FROM="Medi-Chain <onboarding@resend.dev>"
```

---

## 🌍 Deploy em produção

O projeto está deployado em **Railway** (backend + Postgres + Redis) e **Netlify** (frontend).

<details>
<summary><b>📦 Backend no Railway</b></summary>

1. Crie um projeto novo conectando o GitHub
2. Defina o Root Directory como `backend`
3. Adicione **+ New** → PostgreSQL e Redis
4. Configure as variáveis de ambiente (acima)
5. Pre-deploy command: `npx prisma migrate deploy`
6. Deploy automático a cada push

</details>

<details>
<summary><b>🎨 Frontend no Netlify</b></summary>

1. Conecte o repositório
2. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Adicione `VITE_API_URL` apontando para o backend Railway
4. Crie `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

</details>

---

## 🛣 Rotas da API

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| POST | `/auth/register` | Pública | Cadastro (PATIENT/DOCTOR/PHARMACY) |
| POST | `/auth/login` | Pública | Login — retorna JWT |
| GET | `/users` | ADMIN | Lista todos os usuários |
| DELETE | `/users/:id` | ADMIN | Exclui usuário |
| GET | `/users/search?q=` | DOCTOR/PHARMACY | Busca paciente por e-mail ou CPF |
| POST | `/users/verify-doctor` | ADMIN | Aprova médico |
| POST | `/users/verify-pharmacy` | ADMIN | Aprova farmácia |
| POST | `/prescriptions` | DOCTOR | Cria prescrição completa |
| GET | `/prescriptions/validate/:id` | Pública | Valida na blockchain |
| POST | `/prescriptions/use/:id` | PHARMACY | Dispensa receita |
| POST | `/prescriptions/revoke/:id` | DOCTOR | Revoga receita |
| GET | `/prescriptions/history/doctor` | DOCTOR | Histórico do médico |
| GET | `/prescriptions/history/pharmacy` | PHARMACY | Receitas ativas |
| GET | `/prescriptions/history/pharmacy/dispensed` | PHARMACY | Histórico de dispensações |
| GET | `/health` | Pública | Health check |

---

## 👥 Perfis de acesso

| Perfil | Como criar | O que pode fazer |
|--------|-----------|-----------------|
| 🧑 **PATIENT** | Cadastro direto + CPF | Consultar status de receitas |
| 👨‍⚕ **DOCTOR** | Cadastro + CRM → aprovação ADMIN | Criar, visualizar e revogar receitas |
| 🏥 **PHARMACY** | Cadastro + CNPJ → aprovação ADMIN | Validar e dispensar receitas |
| ⚙ **ADMIN** | Manual via banco | Gerenciar usuários e aprovações |

---

## ⛓ Smart Contract

**Rede:** Ethereum Sepolia Testnet  
**Endereço:** [`0xe905e4e639AfFf9D9e30738c2a1F872D4cb0Fa16`](https://sepolia.etherscan.io/address/0xe905e4e639AfFf9D9e30738c2a1F872D4cb0Fa16)  
**Linguagem:** Solidity ^0.8.24  
**Padrão:** OpenZeppelin AccessControl

### Funções principais

```solidity
createPrescription(bytes32 id, bytes32 ipfsHash)   // DOCTOR_ROLE
markAsUsed(bytes32 id)                              // PHARMACY_ROLE
revokePrescription(bytes32 id)                      // DOCTOR_ROLE
getPrescription(bytes32 id) view returns (...)      // público
```

### Eventos

```solidity
event PrescriptionCreated(bytes32 indexed id, address indexed doctor);
event PrescriptionUsed(bytes32 indexed id, address indexed pharmacy);
event PrescriptionRevoked(bytes32 indexed id);
```

---

## 🔍 Como verificar a autenticidade

Toda transação fica registrada de forma pública e imutável na blockchain. Para auditar:

1. Acesse o [contrato no Sepolia Etherscan](https://sepolia.etherscan.io/address/0xe905e4e639AfFf9D9e30738c2a1F872D4cb0Fa16)
2. Vá na aba **Transactions**
3. Cada receita criada aparece como uma transação `createPrescription`
4. Cada dispensação como `markAsUsed`
5. Cada revogação como `revokePrescription`

---

## 👨‍💻 Autores

**Lucas Fernando Gonçalves Lima**
**Pablo Miranda Rocha Costa**

**Orientador:** Me. Claudio Ulisse  
**Instituição:** Instituto Federal de Brasília — Campus Brasília  
**Curso:** Tecnologia em Sistemas para Internet  
**Ano:** 2025

---

## 📄 Licença

Projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso. Uso educacional permitido com atribuição aos autores.

---

<div align="center">

**🏥 Medi-Chain** — Receitas médicas seguras na blockchain

Feito com 💚 em Brasília

</div>
