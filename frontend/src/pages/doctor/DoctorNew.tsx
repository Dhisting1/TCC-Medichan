import { useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE } from "../../styles/tokens";

// ── layout ────────────────────────────────────────────────────────────────────
const PageGrid = styled.div`
  display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${WHITE}; border-radius: 12px; border: 1px solid ${BORDER}; overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 16px 24px;
  background: ${SUBTLE}; border-bottom: 1px solid ${BORDER};
`;

const HeaderIcon = styled.div`
  width: 36px; height: 36px; border-radius: 50%; background: ${LIME};
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
`;

const HeaderTitle = styled.span`font-size: 15px; font-weight: 600; color: ${TEAL};`;

const CardBody = styled.div`padding: 24px;`;

const Label = styled.label`
  display: block; font-size: 12px; font-weight: 600; color: #374151;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%; padding: 11px 14px;
  border: 1.5px solid ${BORDER}; border-radius: 8px; font-size: 14px; color: #111827;
  background: ${WHITE}; margin-bottom: 18px; transition: border-color 0.15s;
  &:focus { outline: none; border-color: ${TEAL}; }
  &::placeholder { color: #9ca3af; }
`;

const Textarea = styled.textarea`
  width: 100%; padding: 11px 14px;
  border: 1.5px solid ${BORDER}; border-radius: 8px; font-size: 14px; color: #111827;
  background: ${WHITE}; margin-bottom: 18px; resize: vertical; min-height: 90px;
  &:focus { outline: none; border-color: ${TEAL}; }
  &::placeholder { color: #9ca3af; }
`;

const BtnRow = styled.div`display: flex; gap: 12px; margin-top: 4px;`;

const BtnPrimary = styled.button`
  flex: 1; padding: 12px 20px; background: ${LIME}; color: ${TEAL};
  border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BtnSecondary = styled.button`
  padding: 12px 20px; background: transparent; color: ${TEAL};
  border: 1.5px solid ${TEAL}; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  &:hover { background: #f0fdf4; }
`;

// ── painel lateral ────────────────────────────────────────────────────────────
const SideCard = styled.div`
  background: ${WHITE}; border-radius: 12px;
  border: 1px solid ${BORDER}; overflow: hidden; margin-bottom: 16px;
`;

const SideHeader = styled.div`
  padding: 12px 16px; background: ${TEAL}; color: ${WHITE}; font-size: 13px; font-weight: 600;
`;

const SideBody = styled.div`padding: 16px;`;

const SearchRow = styled.div`
  display: flex; border: 1.5px solid ${BORDER}; border-radius: 8px;
  overflow: hidden; margin-bottom: 12px;
  &:focus-within { border-color: ${TEAL}; }
`;

const SearchInput = styled.input`
  flex: 1; padding: 9px 12px; border: none; outline: none;
  font-size: 13px; color: #111827;
  &::placeholder { color: #9ca3af; }
`;

const SearchBtn = styled.button`
  padding: 9px 14px; background: ${TEAL}; color: ${WHITE};
  border: none; font-size: 13px; cursor: pointer;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; }
`;

const PatientCard = styled.div`
  border: 1.5px solid ${LIME}; border-radius: 8px; padding: 12px; background: #f0fdf4;
`;

const PField = styled.div`margin-bottom: 8px; &:last-child { margin-bottom: 0; }`;
const PLbl   = styled.p`font-size: 11px; color: #9ca3af; margin-bottom: 1px;`;
const PVal   = styled.p`font-size: 13px; color: #111827; font-weight: 500;`;

const NotFound = styled.p`font-size: 13px; color: #dc2626; margin-top: 4px;`;

const SideField = styled.div`margin-bottom: 10px; &:last-child { margin-bottom: 0; }`;
const SideLbl   = styled.p`font-size: 11px; color: #9ca3af; margin-bottom: 2px;`;
const SideVal   = styled.p`font-size: 13px; color: #374151; font-weight: 500;`;

// ── QR Box ────────────────────────────────────────────────────────────────────
const QrBox = styled.div`
  margin-top: 16px; text-align: center;
  p { font-size: 13px; color: #15803d; margin-bottom: 8px; font-weight: 500; }
  img { border-radius: 8px; border: 2px solid #86efac; }
  small { display: block; margin-top: 6px; font-size: 11px; color: #6b7280; font-family: monospace; }
`;

const EmailNotice = styled.div`
  margin-top: 12px; padding: 10px 12px; border-radius: 8px;
  background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 12px; color: #15803d;
`;

const Msg = styled.p<{ ok?: boolean }>`
  font-size: 13px; margin-top: 10px;
  color: ${(p: any) => p.ok ? "#15803d" : "#dc2626"};
`;

// ── interfaces ─────────────────────────────────────────────────────────────────
interface PatientResult { id: string; email: string; cpf?: string; }

export default function DoctorNew() {
  // form
  const [medication, setMedication] = useState("");
  const [dosage,     setDosage]     = useState("");
  const [creating,   setCreating]   = useState(false);
  const [error,      setError]      = useState("");
  const [qr,         setQr]         = useState("");
  const [prescId,    setPrescId]    = useState("");
  const [emailSent,  setEmailSent]  = useState(false);

  // busca de paciente
  const [searchQ,    setSearchQ]    = useState("");
  const [searching,  setSearching]  = useState(false);
  const [patient,    setPatient]    = useState<PatientResult | null>(null);
  const [searchErr,  setSearchErr]  = useState("");

  async function handleSearch() {
    if (!searchQ.trim()) return;
    setSearching(true); setPatient(null); setSearchErr("");
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchQ.trim())}`);
      setPatient(res.data.patient);
    } catch {
      setSearchErr("Paciente não encontrado.");
    } finally { setSearching(false); }
  }

  async function handleCreate(e: any) {
    e.preventDefault();
    setError(""); setQr(""); setEmailSent(false);
    if (!patient) { setError("Busque e selecione um paciente primeiro."); return; }
    if (!medication.trim()) { setError("Informe o medicamento."); return; }
    if (!dosage.trim())     { setError("Informe a dosagem."); return; }
    setCreating(true);
    try {
      const res = await api.post("/prescriptions", {
        patient:      patient.email,   // identifica o paciente pelo email
        patientEmail: patient.email,   // RF06: envia email com PDF
        medication:   medication.trim(),
        dosage:       dosage.trim(),
      });
      setQr(res.data.qr);
      setPrescId(res.data.id);
      setEmailSent(!!patient.email);
      setMedication(""); setDosage("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar receita.");
    } finally { setCreating(false); }
  }

  function handleReset() {
    setQr(""); setPrescId(""); setEmailSent(false);
    setPatient(null); setSearchQ(""); setSearchErr("");
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
              <Label>Medicamento / Descrição da receita</Label>
              <Textarea
                placeholder="Descreva o medicamento e informações da receita..."
                value={medication}
                onChange={e => setMedication(e.target.value)}
              />

              <Label>Dosagem e instruções</Label>
              <Input
                placeholder="Ex: 1 comprimido a cada 8h por 5 dias"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
              />

              {error && <Msg>{error}</Msg>}

              {qr ? (
                <>
                  <QrBox>
                    <p>✅ Receita registrada na blockchain!</p>
                    <img src={qr} alt="QR Code" width={160} />
                    <small>{prescId.slice(0, 32)}...</small>
                  </QrBox>
                  {emailSent && (
                    <EmailNotice>
                      📧 PDF e QR Code enviados para <strong>{patient?.email}</strong>
                    </EmailNotice>
                  )}
                  <BtnRow style={{ marginTop: 16 }}>
                    <BtnSecondary type="button" onClick={handleReset}>
                      Nova receita
                    </BtnSecondary>
                  </BtnRow>
                </>
              ) : (
                <BtnRow>
                  <BtnPrimary type="submit" disabled={creating || !patient}>
                    {creating ? "Registrando na blockchain..." : "Assinar e enviar prescrição"}
                  </BtnPrimary>
                </BtnRow>
              )}
            </form>
          </CardBody>
        </Card>

        {/* ── painel lateral ── */}
        <div>
          {/* busca de paciente */}
          <SideCard>
            <SideHeader>🔍 Buscar paciente</SideHeader>
            <SideBody>
              <SearchRow>
                <SearchInput
                  placeholder="Email ou CPF do paciente"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
                <SearchBtn onClick={handleSearch} disabled={searching}>
                  {searching ? "..." : "🔍"}
                </SearchBtn>
              </SearchRow>
              {searchErr && <NotFound>{searchErr}</NotFound>}
              {patient && (
                <PatientCard>
                  <PField><PLbl>Email:</PLbl><PVal>{patient.email}</PVal></PField>
                  {patient.cpf && <PField><PLbl>CPF:</PLbl><PVal>{patient.cpf}</PVal></PField>}
                  <PField>
                    <PLbl>Status:</PLbl>
                    <PVal style={{ color: "#15803d", fontWeight: 600 }}>✅ Selecionado</PVal>
                  </PField>
                </PatientCard>
              )}
            </SideBody>
          </SideCard>

          {/* dados do paciente */}
          <SideCard>
            <SideHeader>Dados do paciente</SideHeader>
            <SideBody>
              {[
                ["Email",   patient?.email],
                ["CPF",     patient?.cpf],
              ].map(([f, v]) => (
                <SideField key={String(f)}>
                  <SideLbl>{f}:</SideLbl>
                  <SideVal>{v || "—"}</SideVal>
                </SideField>
              ))}
              <SideField>
                <SideLbl>Notificação:</SideLbl>
                <SideVal style={{ color: patient ? "#15803d" : "#9ca3af" }}>
                  {patient ? "✉ PDF por email" : "—"}
                </SideVal>
              </SideField>
            </SideBody>
          </SideCard>
        </div>
      </PageGrid>
    </Layout>
  );
}
