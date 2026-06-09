import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { TEAL, LIME, WHITE, MUTED, BORDER } from "../styles/tokens";
import {
  Plus,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ── layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const LeftPanel = styled.div`
  background: ${TEAL};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  @media (max-width: 768px) { display: none; }
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
`;

const BrandText = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: ${WHITE};
  letter-spacing: -1px;
`;

const BrandPlusWrap = styled.span`
  display: inline-flex;
  color: ${LIME};
  align-items: center;
`;

const Tagline = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${WHITE};
  text-align: center;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const TaglineSub = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  text-align: center;
  line-height: 1.7;
  max-width: 320px;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 40px;
  justify-content: center;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  border: 1px solid rgba(203,229,78,0.4);
  color: ${LIME};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
`;

// ── formulário ────────────────────────────────────────────────────────────────
const RightPanel = styled.div`
  background: #f8faf8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
`;

const FormBox = styled.div`
  width: 100%;
  max-width: 380px;
`;

const MobileLogo = styled.div`
  display: none;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  @media (max-width: 768px) { display: flex; }
`;

const FormTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: ${TEAL};
  margin-bottom: 6px;
`;

const FormSub = styled.p`
  font-size: 14px;
  color: ${MUTED};
  margin-bottom: 32px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: ${WHITE};
  margin-bottom: 20px;
  transition: border-color 0.15s;
  &:focus {
    outline: none;
    border-color: ${TEAL};
  }
  &::placeholder { color: #9ca3af; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: ${LIME};
  color: ${TEAL};
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
`;

const FooterLink = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${MUTED};
  margin-top: 24px;
  a {
    color: ${TEAL};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

// ── componente ────────────────────────────────────────────────────────────────
export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha todos os campos."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user, data.token);
      if      (data.user.role === "ADMIN")    navigate("/admin");
      else if (data.user.role === "DOCTOR")   navigate("/doctor");
      else if (data.user.role === "PHARMACY") navigate("/pharmacy");
      else navigate("/patient");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      {/* painel esquerdo — identidade visual */}
      <LeftPanel>
        <BrandLogo>
          <BrandText>Medichain</BrandText>
          <BrandPlusWrap>
            <Plus size={32} strokeWidth={3} />
          </BrandPlusWrap>
        </BrandLogo>
        <Tagline>Prescrições médicas seguras<br />na blockchain</Tagline>
        <TaglineSub>
          Autentique, compartilhe e valide receitas digitais com rastreabilidade
          total e proteção contra falsificações.
        </TaglineSub>
        <Pills>
          <Pill><ShieldCheck size={14} strokeWidth={2.2} /> Blockchain Ethereum</Pill>
          <Pill><FileText    size={14} strokeWidth={2.2} /> IPFS</Pill>
          <Pill><Search      size={14} strokeWidth={2.2} /> Rastreável</Pill>
          <Pill><CheckCircle2 size={14} strokeWidth={2.2} /> Imutável</Pill>
        </Pills>
      </LeftPanel>

      {/* painel direito — formulário */}
      <RightPanel>
        <FormBox>
          <MobileLogo>
            <BrandText style={{ fontSize: 24 }}>Medichain</BrandText>
            <BrandPlusWrap><Plus size={24} strokeWidth={3} /></BrandPlusWrap>
          </MobileLogo>

          <FormTitle>Bem-vindo de volta</FormTitle>
          <FormSub>Entre com sua conta para acessar o sistema</FormSub>

          {error && (
            <ErrorBox>
              <AlertTriangle size={16} strokeWidth={2} />
              {error}
            </ErrorBox>
          )}

          <form onSubmit={handleLogin}>
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </SubmitBtn>
          </form>

          <FooterLink>
            Não tem conta? <Link to="/register">Criar conta</Link>
          </FooterLink>
        </FormBox>
      </RightPanel>
    </Page>
  );
}
