# Medi-Chain — Sistema de E-Prescription com Blockchain

> Trabalho de Conclusão de Curso — Instituto Federal de Brasília (IFB)  
> Curso Superior de Tecnologia em Sistemas para Internet  
> Autores: Lucas Fernando Gonçalves Lima · Pablo Miranda Rocha Costa  
> Orientador: Me. Claudio Ulisse · 2025

---

## Sobre o projeto

O **Medi-Chain** é um sistema de prescrição médica eletrônica (e-prescription) que utiliza a tecnologia blockchain para garantir a autenticidade, rastreabilidade e imutabilidade das receitas médicas. Cada prescrição é registrada na rede Ethereum, armazenada no IPFS e enviada automaticamente ao paciente por e-mail em formato PDF com QR Code.

### O problema que resolve

Cerca de 30% dos atestados médicos emitidos no Brasil são falsificados (Fecomércio, 2020). Receitas escritas à mão apresentam média de 3,3 erros por documento. O Medi-Chain combate isso com um registro imutável e auditável na blockchain, impossível de falsificar.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (porta 80)                  │
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
│ PostgreSQL  │ │Redis│  │   Ethereum Sepolia   │
│  (histórico)│ │cache│  │  Smart Contract      │
└─────────────┘ └─────┘  └────────────────────-┘
                                    │
                             ┌──────▼──────┐
                             │    IPFS     │
                             │  (Pinata)   │
                             └─────────────┘
```

### Três camadas de armazenamento

| Camada | O que armazena | Por quê |
|--------|----------------|---------|
| **PostgreSQL** | Usuários, resumo das receitas, histórico | Consultas rápidas sem chamar a blockchain |
| **IPFS** | Dados completos da prescrição (JSON) | Armazenamento descentralizado e imutável fora da chain |
| **Blockchain** | Hash do IPFS + status da receita | Fonte da verdade — não pode ser alterada ou deletada |

---

## Funcionalidades

| # | Requisito | Status |
|---|-----------|--------|
| RF01 | Médico registra prescrição digital | ✅ |
| RF02 | Autenticação com roles (PATIENT, DOCTOR, PHARMACY, ADMIN) | ✅ |
| RF03 | Compartilhamento via QR Code | ✅ |
| RF04 | Histórico de prescrições para médico e farmácia | ✅ |
| RF05 | Farmácia valida autenticidade na blockchain | ✅ |
| RF06 | Notificação ao paciente com PDF por e-mail | ✅ |
| RF07 | Status rastreável: ACTIVE → USED / REVOKED | ✅ |

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React.js + Vite + TypeScript + Styled-components |
| Backend | Node.js + Express.js + TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Cache | Redis |
| Blockchain | Ethereum Sepolia + Solidity + Hardhat |
| Controle de acesso | OpenZeppelin AccessControl |
| Armazenamento | IPFS via Pinata |
| Autenticação | JWT + bcrypt |
| PDF | PDFKit |
| E-mail | Nodemailer |
| Infraestrutura | Docker + Docker Compose + Nginx |

---

## Estrutura do repositório

```
TCC/
├── backend/          # API RESTful (Node.js + Express)
├── frontend/         # SPA (React + Vite)
├── smartcontract/    # Contrato inteligente (Solidity + Hardhat)
├── nginx/            # Configuração do proxy reverso
├── docker-compose.yml          # Desenvolvimento local
├── docker-compose.prod.yml     # Produção
├── deploy.sh                   # Script de deploy automatizado
└── .env.prod                   # Template de variáveis de produção
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org) >= 20
- [Docker](https://docker.com) + Docker Compose
- Conta no [Pinata](https://pinata.cloud) (IPFS)
- Conta no [Infura](https://infura.io) (RPC Sepolia)
- Conta no [Gmail](https://gmail.com) com senha de app (e-mail)

---

## Rodando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/medi-chain.git
cd medi-chain
```

### 2. Suba o banco e o Redis com Docker

```bash
docker compose up -d postgres redis
```

### 3. Configure o backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais
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

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

---

## Variáveis de ambiente — backend

```env
PORT=3000
DATABASE_URL=postgresql://medichain:medichain@localhost:5432/medichain
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua_chave_secreta

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_ID
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
CONTRACT_ADDRESS= Seu contract address

# IPFS
PINATA_JWT=SEU_JWT_PINATA

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# E-mail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu@gmail.com
EMAIL_PASS=sua_senha_de_app
```

---


## Rotas da API

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| POST | `/auth/register` | Pública | Cadastro (PATIENT/DOCTOR/PHARMACY) |
| POST | `/auth/login` | Pública | Login — retorna JWT |
| GET | `/users` | ADMIN | Lista todos os usuários |
| DELETE | `/users/:id` | ADMIN | Exclui usuário |
| GET | `/users/search?q=` | DOCTOR/PHARMACY | Busca paciente por e-mail ou CPF |
| POST | `/users/verify-doctor` | ADMIN | Aprova médico |
| POST | `/users/verify-pharmacy` | ADMIN | Aprova farmácia |
| POST | `/prescriptions` | DOCTOR | Cria prescrição (IPFS + blockchain + PDF + e-mail) |
| GET | `/prescriptions/validate/:id` | Pública | Valida na blockchain |
| POST | `/prescriptions/use/:id` | PHARMACY | Dispensa receita |
| POST | `/prescriptions/revoke/:id` | DOCTOR | Revoga receita |
| GET | `/prescriptions/history/doctor` | DOCTOR | Histórico do médico |
| GET | `/prescriptions/history/pharmacy` | PHARMACY | Receitas ativas |
| GET | `/prescriptions/history/pharmacy/dispensed` | PHARMACY | Histórico de dispensações |
| GET | `/health` | Pública | Health check |

---

## Perfis de acesso

| Perfil | Como criar | O que pode fazer |
|--------|-----------|-----------------|
| **PATIENT** | Cadastro direto no sistema + CPF | Consultar status de receitas |
| **DOCTOR** | Cadastro + CRM → aprovação pelo ADMIN | Criar, visualizar e revogar receitas |
| **PHARMACY** | Cadastro + CNPJ → aprovação pelo ADMIN | Validar e dispensar receitas |
| **ADMIN** | Criado via Prisma Studio | Gerenciar e excluir usuários, aprovar médicos e farmácias |

Para criar o primeiro ADMIN:
```bash
cd backend
npx prisma studio
# Acesse a tabela User → edite o campo role para "ADMIN"
```

---

## Smart Contract

- **Rede:** Ethereum Sepolia Testnet
- **Endereço:** `Seu endereço wallet`
- **Linguagem:** Solidity ^0.8.24
- **Padrão:** OpenZeppelin AccessControl

Funções principais:

```solidity
createPrescription(bytes32 id, bytes32 ipfsHash)  // DOCTOR_ROLE
markAsUsed(bytes32 id)                             // PHARMACY_ROLE
revokePrescription(bytes32 id)                     // DOCTOR_ROLE
getPrescription(bytes32 id) view returns (...)     // público
```

---

## Licença

Projeto acadêmico desenvolvido para o TCC do curso de Tecnologia em Sistemas para Internet do IFB — Campus Brasília, 2025.
