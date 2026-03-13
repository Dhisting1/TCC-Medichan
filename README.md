# Medi-Chain — Sistema de E-Prescription

Sistema de prescrição eletrônica baseado em blockchain, desenvolvido como TCC do curso de Tecnologia em Sistemas para Internet do IFB.

## Visão Geral

O Medi-Chain integra e-prescription com a blockchain Ethereum para garantir segurança, rastreabilidade e autenticidade das receitas médicas.

## Tecnologias

- **Frontend:** React + Vite + TypeScript + Styled Components
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Banco de Dados:** PostgreSQL
- **Blockchain:** Ethereum (Sepolia Testnet) + Solidity + Hardhat
- **Armazenamento:** IPFS via Pinata
- **Cache:** Redis

## Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose
- Conta na [Pinata](https://pinata.cloud) para armazenamento IPFS
- Carteira Ethereum com saldo na Sepolia Testnet

## Instalação e Execução

### 1. Infraestrutura (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 2. Smart Contract

```bash
cd smartcontract
npm install

# Compilar o contrato
npx hardhat compile

# Rodar os testes
npx hardhat test

# Deploy na Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

Anote o endereço do contrato exibido no terminal e coloque no `.env` do backend.

### 3. Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar as migrations do banco
npx prisma migrate deploy

# Iniciar o servidor
npm run dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Variáveis de Ambiente (Backend)

Crie um arquivo `.env` na pasta `backend/` com:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/medichain"
JWT_SECRET=seu_segredo_aqui
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/sua_chave
PRIVATE_KEY=sua_chave_privada_ethereum
CONTRACT_ADDRESS=endereco_do_contrato_deployado
PINATA_JWT=seu_jwt_pinata
BASE_URL=http://localhost:3000
```

> ⚠️ **Nunca commite o arquivo `.env` no repositório.**

## Fluxo de Uso

1. Médico se cadastra e tem o CRM verificado pelo administrador
2. Médico emite uma receita → dados salvos no IPFS → hash registrado na blockchain
3. Paciente recebe QR code com o ID da receita
4. Farmácia escaneia o QR, valida a receita na blockchain e faz a dispensação

