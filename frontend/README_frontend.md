# Medi-Chain — Frontend

Interface web do sistema Medi-Chain, desenvolvida com React.js + Vite + TypeScript.

---

## Stack

- **Framework:** React.js 18
- **Build tool:** Vite
- **Linguagem:** TypeScript
- **Estilização:** Styled-components
- **Roteamento:** React Router DOM
- **HTTP:** Axios
- **Fontes:** Inter (Google Fonts)

---

## Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Sidebar + topbar (design do TCC)
│   │   ├── PatientSearch.tsx   # Busca de paciente por e-mail/CPF
│   │   └── ProtectedRoute.tsx  # Guard de rota por role
│   ├── context/
│   │   └── AuthContext.tsx     # Estado global de autenticação
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx        # Seletor de role + campo dinâmico
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx
│   │   ├── doctor/
│   │   │   ├── DoctorDashboard.tsx  # Home com cards de ação
│   │   │   ├── DoctorNew.tsx        # Nova prescrição + busca de paciente
│   │   │   └── DoctorHistory.tsx    # Histórico em tabela
│   │   ├── pharmacy/
│   │   │   └── PharmacyDashboard.tsx  # 3 abas: Validar / Ativas / Histórico
│   │   └── patient/
│   │       └── PatientDashboard.tsx
│   ├── services/
│   │   └── api.ts              # Axios com interceptor JWT
│   ├── styles/
│   │   └── tokens.ts           # Design system (cores, status, labels)
│   └── App.tsx                 # Rotas da aplicação
├── Dockerfile
├── nginx.spa.conf              # Config Nginx para SPA
└── index.html
```

---

## Instalação e execução

```bash
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## Variável de ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
# URL do backend (deixe vazio para usar localhost:3000 em desenvolvimento)
VITE_API_URL=http://localhost:3000
```

Em produção, o `VITE_API_URL` é passado como argumento no build do Docker:

```bash
docker build --build-arg VITE_API_URL=http://SEU_IP/api -t medichain-frontend .
```

---

## Design system

O visual foi desenvolvido seguindo fielmente os protótipos do TCC (Figuras 4.3 a 4.7). Os tokens de design estão centralizados em `src/styles/tokens.ts`:

```ts
export const TEAL = "#0B3530";   // sidebar, cabeçalhos
export const LIME = "#CBE54E";   // botão primário, ícones
export const BG   = "#F0F2F0";   // fundo da página
```

---

## Perfis e rotas

| Perfil | Rota | Telas disponíveis |
|--------|------|-------------------|
| PATIENT | `/patient` | Consultar receita por ID |
| DOCTOR | `/doctor` | Home com cards de ação |
| DOCTOR | `/doctor/new` | Nova prescrição com busca de paciente |
| DOCTOR | `/doctor/history` | Histórico de receitas emitidas |
| PHARMACY | `/pharmacy` | Validar, Receitas ativas, Histórico |
| ADMIN | `/admin` | Gerenciar usuários |

---

## Autenticação

O token JWT é armazenado no `localStorage` com a chave `medichain_token`. O interceptor do Axios injeta automaticamente o header `Authorization: Bearer {token}` em todas as requisições.

---

## Scripts disponíveis

```bash
npm run dev           # Inicia em modo desenvolvimento
npm run build         # Build de produção (gera dist/)
npm run preview       # Visualiza o build de produção
npm test              # Roda os testes com Vitest
npm run test:coverage # Cobertura de testes
```

---

## Docker

```bash
# Build da imagem (passar a URL do backend como argumento)
docker build --build-arg VITE_API_URL=http://SEU_IP/api -t medichain-frontend .
```

O Dockerfile usa build em dois estágios: Node.js para compilar e Nginx para servir os arquivos estáticos. O `nginx.spa.conf` redireciona todas as rotas para `index.html`, necessário para o React Router funcionar corretamente.
