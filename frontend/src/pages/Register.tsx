import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../services/api";
import { TEAL, LIME, WHITE, MUTED, BORDER } from "../styles/tokens";

// ── layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const LeftPanel = styled.div`
  background: ${TEAL};
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 48px;
  @media (max-width: 768px) { display: none; }
`;

const BrandText = styled.span`font-size: 32px; font-weight: 800; color: ${WHITE}; letter-spacing: -1px;`;
const BrandPlus = styled.span`font-size: 36px; font-weight: 900; color: ${LIME};`;

const Tagline = styled.p`
  font-size: 18px; font-weight: 600; color: ${WHITE};
  text-align: center; line-height: 1.6; margin-bottom: 16px; margin-top: 40px;
`;
const TaglineSub = styled.p`
  font-size: 14px; color: rgba(255,255,255,0.55);
  text-align: center; line-height: 1.7; max-width: 300px;
`;

const InfoCard = styled.div`
  margin-top: 40px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(203,229,78,0.2);
  border-radius: 12px; padding: 20px 24px; max-width: 300px;
  p { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }
  strong { color: ${LIME}; }
`;

const RightPanel = styled.div`
  background: #f8faf8;
  display: flex; align-items: center; justify-content: center; padding: 48px 32px;
`;

const FormBox = styled.div`width: 100%; max-width: 400px;`;

const FormTitle = styled.h1`font-size: 26px; font-weight: 800; color: ${TEAL}; margin-bottom: 6px;`;
const FormSub   = styled.p`font-size: 14px; color: ${MUTED}; margin-bottom: 28px;`;

// ── seletor de tipo de conta ──────────────────────────────────────────────────
const RoleGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 24px;
`;

const RoleCard = styled.button<{ active?: boolean }>`
  padding: 14px 8px;
  border: 2px solid ${p => p.active ? TEAL : BORDER};
  border-radius: 10px;
  background: ${p => p.active ? `${TEAL}0f` : WHITE};
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  &:hover { border-color: ${TEAL}; }
`;

const RoleEmoji = styled.div`font-size: 24px; margin-bottom: 6px;`;
const RoleLabel = styled.div<{ active?: boolean }>`
  font-size: 12px; font-weight: ${p => p.active ? "700" : "500"};
  color: ${p => p.active ? TEAL : MUTED};
`;

// ── campos ────────────────────────────────────────────────────────────────────
const Label = styled.label`
  display: block; font-size: 12px; font-weight: 600; color: #374151;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%; padding: 12px 14px;
  border: 1.5px solid ${BORDER}; border-radius: 8px;
  font-size: 14px; color: #111827; background: ${WHITE};
  margin-bottom: 18px; transition: border-color 0.15s;
  &:focus { outline: none; border-color: ${TEAL}; }
  &::placeholder { color: #9ca3af; }
`;

const SubmitBtn = styled.button`
  width: 100%; padding: 13px; background: ${LIME}; color: ${TEAL};
  border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px;
  padding: 10px 14px; color: #dc2626; font-size: 13px; margin-bottom: 16px;
`;

const NoticeBanner = styled.div`
  background: #fefce8; border: 1px solid #fde68a; border-radius: 8px;
  padding: 12px 14px; color: #92400e; font-size: 12px; line-height: 1.5; margin-bottom: 20px;
`;

const FooterLink = styled.p`
  text-align: center; font-size: 13px; color: ${MUTED}; margin-top: 20px;
  a { color: ${TEAL}; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
`;

// ── tipos de conta ────────────────────────────────────────────────────────────
const ROLES = [
  { value: "PATIENT",  label: "Paciente",  emoji: "🧑‍⚕️", extra: { field: "cpf",  label: "CPF",  placeholder: "000.000.000-00" } },
  { value: "DOCTOR",   label: "Médico",    emoji: "👨‍⚕️", extra: { field: "crm",  label: "CRM",  placeholder: "CRM-UF 000000"   } },
  { value: "PHARMACY", label: "Farmácia",  emoji: "🏥", extra: { field: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00" } },
];

export default function Register() {
  const [role,     setRole]     = useState("PATIENT");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [extra,    setExtra]    = useState("");   // cpf / crm / cnpj
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const selected = ROLES.find(r => r.value === role)!;

  async function handleRegister(e: any) {
    e.preventDefault();
    setError("");
    if (!email || !password)   { setError("Preencha todos os campos."); return; }
    if (password.length < 6)   { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (!extra.trim())         { setError(`${selected.extra.label} é obrigatório.`); return; }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        email,
        password,
        role,
        [selected.extra.field]: extra.trim(),
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  const needsApproval = role !== "PATIENT";

  return (
    <Page>
      <LeftPanel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <BrandText>Medichain</BrandText>
          <BrandPlus>✛</BrandPlus>
        </div>
        <Tagline>Sistema de E-Prescription<br />com Blockchain</Tagline>
        <TaglineSub>
          Segurança, rastreabilidade e autenticidade para prescrições médicas digitais.
        </TaglineSub>
        <InfoCard>
          <p>
            <strong>Pacientes</strong> têm acesso imediato após o cadastro.<br /><br />
            <strong>Médicos</strong> e <strong>Farmácias</strong> precisam de
            aprovação do administrador antes de operar no sistema.
          </p>
        </InfoCard>
      </LeftPanel>

      <RightPanel>
        <FormBox>
          <FormTitle>Criar conta</FormTitle>
          <FormSub>Selecione seu tipo de conta e preencha os dados</FormSub>

          {/* seletor de role */}
          <RoleGrid>
            {ROLES.map(r => (
              <RoleCard
                key={r.value}
                type="button"
                active={role === r.value}
                onClick={() => { setRole(r.value); setExtra(""); setError(""); }}
              >
                <RoleEmoji>{r.emoji}</RoleEmoji>
                <RoleLabel active={role === r.value}>{r.label}</RoleLabel>
              </RoleCard>
            ))}
          </RoleGrid>

          {needsApproval && (
            <NoticeBanner>
              ℹ️ Contas de <strong>{selected.label}</strong> ficam pendentes até aprovação
              do administrador.
            </NoticeBanner>
          )}

          {error && <ErrorBox>⚠️ {error}</ErrorBox>}

          <form onSubmit={handleRegister}>
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Label>{selected.extra.label}</Label>
            <Input
              placeholder={selected.extra.placeholder}
              value={extra}
              onChange={e => setExtra(e.target.value)}
            />

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </SubmitBtn>
          </form>

          <FooterLink>
            Já tem conta? <Link to="/login">Fazer login</Link>
          </FooterLink>
        </FormBox>
      </RightPanel>
    </Page>
  );
}
