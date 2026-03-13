import { useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";

const TEAL = "#0B3530";
const LIME = "#CBE54E";

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${LIME};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const HeaderTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${TEAL};
`;

const CardBody = styled.div`
  padding: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #f9fafb;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    border-color: ${TEAL};
    background: white;
  }
  &::placeholder { color: #9ca3af; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #f9fafb;
  margin-bottom: 16px;
  resize: vertical;
  min-height: 100px;
  &:focus {
    outline: none;
    border-color: ${TEAL};
    background: white;
  }
  &::placeholder { color: #9ca3af; }
`;

const InfoBox = styled.div`
  background: #f0fdf4;
  border: 1px dashed #86efac;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const BtnPrimary = styled.button`
  flex: 1;
  padding: 11px 20px;
  background: ${LIME};
  color: ${TEAL};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

const BtnSecondary = styled.button`
  flex: 1;
  padding: 11px 20px;
  background: transparent;
  color: ${TEAL};
  border: 1.5px solid ${TEAL};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f0fdf4; }
`;

const SideCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 16px;
`;

const SideHeader = styled.div`
  padding: 12px 16px;
  background: ${TEAL};
  color: white;
  font-size: 13px;
  font-weight: 600;
`;

const SideBody = styled.div`
  padding: 16px;
`;

const SideField = styled.div`
  margin-bottom: 12px;
`;

const SideLabel = styled.p`
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 2px;
`;

const SideValue = styled.p`
  font-size: 13px;
  color: #374151;
  font-weight: 500;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  input {
    border: none;
    background: none;
    outline: none;
    font-size: 13px;
    flex: 1;
    color: #374151;
    &::placeholder { color: #9ca3af; }
  }
`;

const Msg = styled.p<{ ok?: boolean }>`
  font-size: 13px;
  margin-top: 12px;
  color: ${p => p.ok ? "#15803d" : "#dc2626"};
  font-weight: 500;
`;

const QrBox = styled.div`
  margin-top: 16px;
  text-align: center;
  p { font-size: 13px; color: #15803d; margin-bottom: 8px; font-weight: 500; }
  img { border-radius: 8px; border: 2px solid #86efac; }
`;

export default function DoctorNew() {
  const [patient,    setPatient]    = useState("");
  const [medication, setMedication] = useState("");
  const [dosage,     setDosage]     = useState("");
  const [creating,   setCreating]   = useState(false);
  const [error,      setError]      = useState("");
  const [qr,         setQr]         = useState("");
  const [prescId,    setPrescId]    = useState("");

  async function handleCreate(e: any) {
    e.preventDefault();
    setError(""); setQr("");
    setCreating(true);
    try {
      const res = await api.post("/prescriptions", { patient, medication, dosage });
      setQr(res.data.qr);
      setPrescId(res.data.id);
      setPatient(""); setMedication(""); setDosage("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar receita.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Layout>
      <PageGrid>
        {/* ── formulário principal ── */}
        <Card>
          <CardHeader>
            <HeaderIcon>✎</HeaderIcon>
            <HeaderTitle>Nova prescrição</HeaderTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate}>
              <Label>Descrição da receita</Label>
              <Textarea
                placeholder="Descreva as informações contidas na receita..."
                value={medication}
                onChange={e => setMedication(e.target.value)}
              />

              <Label>Nome do paciente</Label>
              <Input
                placeholder="Nome completo do paciente"
                value={patient}
                onChange={e => setPatient(e.target.value)}
              />

              <Label>Dosagem e instruções</Label>
              <Input
                placeholder="Ex: 1 comprimido a cada 8h por 5 dias"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
              />

              {!qr && (
                <InfoBox>
                  INFORMAÇÕES CONTIDAS NA RECEITA<br />
                  <small>Preencha os campos acima para registrar na blockchain</small>
                </InfoBox>
              )}

              {qr && (
                <QrBox>
                  <p>✅ Receita registrada na blockchain!</p>
                  <img src={qr} alt="QR Code" width={160} />
                  <p style={{ marginTop: 8, fontSize: 11, color: "#6b7280" }}>
                    ID: {prescId.slice(0, 24)}...
                  </p>
                </QrBox>
              )}

              {error && <Msg>{error}</Msg>}

              <BtnRow>
                <BtnPrimary type="submit" disabled={creating}>
                  {creating ? "Registrando na blockchain..." : "Assinar prescrição"}
                </BtnPrimary>
                {qr && (
                  <BtnSecondary type="button" onClick={() => { setQr(""); setPrescId(""); }}>
                    Nova receita
                  </BtnSecondary>
                )}
              </BtnRow>
            </form>
          </CardBody>
        </Card>

        {/* ── painel lateral ── */}
        <div>
          <SideCard>
            <SideHeader>Informe os dados do paciente</SideHeader>
            <SideBody>
              <SearchInput>
                <input placeholder="Aponte o CPF" />
                <span style={{ color: "#9ca3af" }}>🔍</span>
              </SearchInput>
            </SideBody>
          </SideCard>

          <SideCard>
            <SideHeader>Dados do paciente</SideHeader>
            <SideBody>
              <SideField>
                <SideLabel>Nome:</SideLabel>
                <SideValue>{patient || "—"}</SideValue>
              </SideField>
              <SideField>
                <SideLabel>CPF:</SideLabel>
                <SideValue>—</SideValue>
              </SideField>
              <SideField>
                <SideLabel>Idade:</SideLabel>
                <SideValue>—</SideValue>
              </SideField>
              <SideField>
                <SideLabel>Sexo:</SideLabel>
                <SideValue>—</SideValue>
              </SideField>
            </SideBody>
          </SideCard>
        </div>
      </PageGrid>
    </Layout>
  );
}
