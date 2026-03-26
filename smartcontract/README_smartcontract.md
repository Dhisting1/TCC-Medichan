# Medi-Chain — Smart Contract

Contrato inteligente do sistema Medi-Chain, desenvolvido em Solidity com o framework Hardhat.

---

## Informações do deploy

- **Rede:** Ethereum Sepolia Testnet
- **Endereço:** `Seu endereço wallet`
- **Carteira do backend:** `Sua key wallet`

---

## Stack

- **Linguagem:** Solidity ^0.8.24
- **Framework:** Hardhat
- **Biblioteca:** OpenZeppelin Contracts (AccessControl)
- **Rede de testes:** Ethereum Sepolia
- **RPC:** Infura

---

## Estrutura

```
smartcontract/
├── contracts/
│   └── MediChainPrescription.sol   # Contrato principal
├── scripts/
│   └── deploy.ts                   # Script de deploy
├── test/
│   └── MediChainPrescription.ts    # Testes unitários
├── hardhat.config.ts
└── .env
```

---

## Contrato MediChainPrescription

### Roles

| Role | Quem tem | O que pode fazer |
|------|----------|-----------------|
| `DEFAULT_ADMIN_ROLE` | Backend wallet | Conceder roles a médicos e farmácias |
| `DOCTOR_ROLE` | Backend wallet + médicos aprovados | Criar e revogar prescrições |
| `PHARMACY_ROLE` | Backend wallet + farmácias aprovadas | Marcar prescrições como utilizadas |

### Funções

```solidity
// Registra nova prescrição como ACTIVE
createPrescription(bytes32 id, bytes32 ipfsHash)
  onlyRole(DOCTOR_ROLE)

// Marca prescrição como USED após dispensação
markAsUsed(bytes32 id)
  onlyRole(PHARMACY_ROLE)

// Revoga prescrição ACTIVE (apenas o médico que criou)
revokePrescription(bytes32 id)
  onlyRole(DOCTOR_ROLE)

// Consulta dados de uma prescrição (público, sem gas)
getPrescription(bytes32 id) view returns (
  bytes32 ipfsHash,
  address doctor,
  uint256 createdAt,
  Status status
)

// Registra um médico na blockchain
registerDoctor(address doctor)
  onlyRole(DEFAULT_ADMIN_ROLE)

// Registra uma farmácia na blockchain
registerPharmacy(address pharmacy)
  onlyRole(DEFAULT_ADMIN_ROLE)
```

### Eventos

```solidity
event PrescriptionCreated(bytes32 indexed id, address indexed doctor);
event PrescriptionUsed(bytes32 indexed id, address indexed pharmacy);
event PrescriptionRevoked(bytes32 indexed id);
```

### Status possíveis

```solidity
enum Status { NONE, ACTIVE, USED, REVOKED }
```

---

## Instalação e execução

```bash
npm install
```

### Compilar

```bash
npx hardhat compile
```

### Rodar testes

```bash
npx hardhat test
# Com relatório de gas:
REPORT_GAS=true npx hardhat test
```

### Deploy na Sepolia

Configure o `.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_ID
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
ETHERSCAN_API_KEY=SUA_CHAVE_ETHERSCAN
```

Execute o deploy:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Após o deploy, copie o endereço do contrato para o `.env` do backend (`CONTRACT_ADDRESS`).

---

## Importante — chave privada

A `PRIVATE_KEY` usada no deploy **deve ser a mesma** configurada no backend. O construtor do contrato concede todos os roles iniciais à carteira do deployer. Se as chaves forem diferentes, o backend não terá permissão para registrar prescrições.

```
deploy.ts usa     PRIVATE_KEY → carteira X recebe DOCTOR_ROLE + PHARMACY_ROLE
backend usa       PRIVATE_KEY → carteira X chama createPrescription()

Se forem chaves diferentes → carteira Y tenta criar prescrição → AccessControlUnauthorizedAccount
```
