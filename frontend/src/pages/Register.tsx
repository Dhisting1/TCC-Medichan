import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../services/api";
import { TEAL, LIME, WHITE, MUTED, BORDER } from "../styles/tokens";

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

const BrandText = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: ${WHITE};
  letter-spacing: -1px;
`;

const BrandPlus = styled.span`
  font-size: 36px;
  font-weight: 900;
  color: ${LIME};
`;

const Tagline = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${WHITE};
  text-align: center;
  line-height: 1.6;
  margin-bottom: 16px;
  margin-top: 40px;
`;

const TaglineSub = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  text-align: center;
  line-height: 1.7;
  max-width: 300px;
`;

const InfoCard = styled.div`
  margin-top: 40px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(203,229,78,0.2);
  border-radius: 12px;
  padding: 20px 24px;
  max-width: 300px;
  p {
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
  }
  strong { color: ${LIME}; }
`;

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
  &:focus { outline: none; border-color: ${TEAL}; }
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
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
`;

const NoticeBanner = styled.div`
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 14px;
  color: #92400e;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 24px;
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

export default function Register() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha todos os campos."); return; }
    if (password.length < 6)  { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, role: "PATIENT" });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

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
            Novos usuários são cadastrados como <strong>Paciente</strong>.<br /><br />
            Para se tornar <strong>Médico</strong> ou <strong>Farmácia</strong>, entre em
            contato com o administrador do sistema.
          </p>
        </InfoCard>
      </LeftPanel>

      <RightPanel>
        <FormBox>
          <FormTitle>Criar conta</FormTitle>
          <FormSub>Preencha os dados abaixo para se cadastrar</FormSub>

          <NoticeBanner>
            ℹ️ Contas novas entram como <strong>Paciente</strong>. Médicos e Farmácias são aprovados pelo administrador.
          </NoticeBanner>

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
