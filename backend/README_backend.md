# Medi-Chain — Backend

API RESTful do sistema Medi-Chain, desenvolvida com Node.js + Express.js + TypeScript.

---

## Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL
- **Cache:** Redis
- **Blockchain:** ethers.js (Ethereum Sepolia)
- **Armazenamento:** IPFS via Pinata
- **Autenticação:** JWT + bcrypt
- **PDF:** PDFKit
- **E-mail:** Nodemailer

---

## Estrutura

```
backend/
├── src/
│   ├── config/
│   │   ├── blockchain.ts     # Conexão com Ethereum (ethers.js)
│   │   ├── database.ts       # Instância do Prisma Client
│   │   └── redis.ts          # Conexão com Redis
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── prescription.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts  # JWT + requireRole()
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── prescription.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── blockchain.service.ts  # Chamadas ao smart contract
│   │   ├── email.service.ts       # Nodemailer
│   │   ├── ipfs.service.ts        # Upload para Pinata
│   │   ├── pdf.service.ts         # Geração do PDF com QR Code
│   │   └── user.service.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── Dockerfile
```

---

## Instalação e execução

```bash
npm install
npx prisma migrate dev
npm run dev
```

O servidor sobe na porta `3000` por padrão.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend:

```env
PORT=3000
DATABASE_URL=postgresql://medichain:medichain@localhost:5432/medichain
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua_chave_secreta_forte

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_ID
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
CONTRACT_ADDRESS= 0xSEU_CONTRACT_ADDRESS

PINATA_JWT=SEU_JWT_PINATA

BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu@gmail.com
EMAIL_PASS=sua_senha_de_app
```

---

## Banco de dados

### Modelo User

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único |
| email | String (unique) | E-mail de acesso |
| password | String | Hash bcrypt da senha |
| role | String | PATIENT / DOCTOR / PHARMACY / ADMIN |
| cpf | String? (unique) | CPF do paciente |
| crm | String? | CRM do médico |
| cnpj | String? | CNPJ da farmácia |
| wallet | String? | Endereço Ethereum |
| createdAt | DateTime | Data de cadastro |

### Modelo Prescription

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (PK) | ID bytes32 da prescrição |
| ipfsHash | String | Hash do arquivo no IPFS |
| patient | String | Nome/e-mail do paciente |
| patientEmail | String? | E-mail para notificação |
| medication | String | Medicamento prescrito |
| dosage | String | Dosagem e instruções |
| qr | String | QR Code em base64 (data URL) |
| status | String | ACTIVE / USED / REVOKED |
| doctorId | String (FK) | Referência ao User médico |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data da última atualização |

---

## Fluxo de criação de prescrição

```
POST /prescriptions
        │
        ▼
  Valida campos
        │
        ▼
  Upload para IPFS (Pinata)
        │
        ▼
  Registra na blockchain (Sepolia)
        │
        ▼
  Salva no PostgreSQL
        │
        ▼
  Gera QR Code
        │
        ▼
  Gera PDF (PDFKit)
        │
        ▼
  Envia e-mail com PDF (Nodemailer)
        │
        ▼
  Retorna { id, ipfsHash, qr }
```

---

## Scripts disponíveis

```bash
npm run dev           # Inicia em modo desenvolvimento (ts-node-dev)
npm run build         # Compila TypeScript para dist/
npm start             # Inicia a versão compilada
npm test              # Roda os testes com Jest
npm run test:coverage # Cobertura de testes
```

---

## Docker

```bash
# Build da imagem
docker build -t medichain-backend .

# Rodar com variáveis de ambiente
docker run --env-file .env -p 3000:3000 medichain-backend
```

O Dockerfile usa build em dois estágios e roda as migrations do Prisma automaticamente na inicialização.
