import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";
import PatientSearch, { PatientData } from "../../components/PatientSearch";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE, STATUS_COLORS, STATUS_LABELS } from "../../styles/tokens";

// ── abas ─────────────────────────────────────────────────────────────────────
const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid ${BORDER};
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid ${p => p.active ? TEAL : "transparent"};
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: ${p => p.active ? "700" : "500"};
  color: ${p => p.active ? TEAL : MUTED};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { color: ${TEAL}; }
`;

// ── cards ─────────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${WHITE};
  border-radius: 12px;
  border: 1px solid ${BORDER};
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: ${SUBTLE};
  border-bottom: 1px solid ${BORDER};
`;

const HeaderIcon = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${LIME};
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
`;

const HeaderTitle = styled.span`font-size: 15px; font-weight: 600; color: ${TEAL};`;
const HeaderSub   = styled.span`font-size: 13px; color: ${MUTED};`;

// ── layout de 2 colunas ───────────────────────────────────────────────────────
const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

// ── busca ────────────────────────────────────────────────────────────────────
const SearchRow = styled.div`
  display: flex;
  margin: 20px 24px;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  overflow: hidden;
  &:focus-within { border-color: ${TEAL}; }
`;

const SearchInput = styled.input`
  flex: 1; padding: 11px 14px; border: none; outline: none;
  font-size: 14px; color: #111827;
  &::placeholder { color: #9ca3af; }
`;

const SearchBtn = styled.button`
  padding: 11px 18px; background: ${TEAL}; color: ${WHITE};
  border: none; font-size: 14px; font-weight: 600; cursor: pointer;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ── área de info da receita ───────────────────────────────────────────────────
const DescLabel = styled.p`
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: ${MUTED}; margin: 0 24px 8px;
`;

const InfoArea = styled.div`
  margin: 0 24px 20px;
  min-height: 130px;
  border: 1px solid ${BORDER}; border-radius: 8px; background: ${SUBTLE};
  display: flex; align-items: center; justify-content: center;
`;

const InfoAreaFilled = styled.div`
  margin: 0 24px 20px;
  border: 1px solid ${BORDER}; border-radius: 8px;
  background: ${SUBTLE}; padding: 16px;
`;

const InfoRow = styled.div`
  display: flex; gap: 8px; align-items: baseline; margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
`;

const InfoKey = styled.span`font-size: 12px; color: ${MUTED}; min-width: 100px;`;
const InfoVal = styled.span`font-size: 13px; color: #111827; font-weight: 500;`;

const PlaceholderText = styled.p`font-size: 13px; color: #9ca3af; text-align: center;`;

const ActionRow = styled.div`padding: 0 24px 24px;`;

const DispenseBtn = styled.button`
  padding: 11px 28px; background: ${LIME}; color: ${TEAL};
  border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── status badge ──────────────────────────────────────────────────────────────
const StatusBadge = styled.span<{ status: string }>`
  display: inline-block; padding: 3px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 600;
  background: ${(p: any) => STATUS_COLORS[p.status]?.bg || "#f3f4f6"};
  color: ${(p: any) => STATUS_COLORS[p.status]?.text || "#6b7280"};
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

const SideField = styled.div`margin-bottom: 10px; &:last-child { margin-bottom: 0; }`;
const SideLbl   = styled.p`font-size: 11px; color: #9ca3af; margin-bottom: 2px;`;
const SideVal   = styled.p`font-size: 13px; color: #374151; font-weight: 500;`;

// ── mensagens ─────────────────────────────────────────────────────────────────
const MsgBox = styled.div<{ ok?: boolean }>`
  margin: 0 24px 16px; padding: 10px 14px; border-radius: 8px; font-size: 13px;
  background: ${(p: any) => p.ok ? "#f0fdf4" : "#fee2e2"};
  border: 1px solid ${(p: any) => p.ok ? "#bbf7d0" : "#fca5a5"};
  color: ${(p: any) => p.ok ? "#15803d" : "#dc2626"};
`;

// ── lista de receitas ativas ──────────────────────────────────────────────────
const PrescList = styled.div`padding: 16px 24px; display: flex; flex-direction: column; gap: 12px;`;

const PrescCard = styled.div<{ selected?: boolean }>`
  border: 1.5px solid ${p => p.selected ? TEAL : BORDER};
  border-radius: 10px; padding: 14px 16px; background: ${WHITE};
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: ${TEAL}; box-shadow: 0 2px 8px rgba(11,53,48,0.08); }
`;

const PrescCardRow = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;`;
const PrescPatient = styled.span`font-size: 14px; font-weight: 600; color: ${TEAL};`;
const PrescMed     = styled.span`font-size: 13px; color: #374151;`;
const PrescDate    = styled.span`font-size: 11px; color: ${MUTED};`;
const PrescId      = styled.span`font-size: 11px; color: #9ca3af; font-family: monospace;`;

const EmptyMsg = styled.div`
  text-align: center; padding: 48px; color: #9ca3af; font-size: 14px;
`;

const CountBadge = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; border-radius: 99px;
  background: ${TEAL}; color: ${WHITE}; font-size: 11px; font-weight: 700;
  margin-left: 8px;
`;

// ── tabela de histórico ───────────────────────────────────────────────────────
const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  padding: 12px 20px; text-align: left; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #9ca3af; background: ${SUBTLE}; border-bottom: 1px solid ${BORDER};
`;
const Td = styled.td`
  padding: 14px 20px; font-size: 13px; color: #374151;
  border-bottom: 1px solid #f3f4f6;
`;

// ── interfaces ────────────────────────────────────────────────────────────────
interface Presc {
  id: string;
  patient: string;
  medication: string;
  dosage: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// ── componente ────────────────────────────────────────────────────────────────
export default function PharmacyDashboard() {
  const [tab, setTab] = useState<"validate" | "active" | "history">("validate");

  // aba validar
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [searchId,   setSearchId]   = useState("");
  const [found,      setFound]      = useState<Presc | null>(null);
  const [searching,  setSearching]  = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [msg,        setMsg]        = useState("");

  // busca de paciente (aba validar)
  const [patientQ,   setPatientQ]   = useState("");
  const [searchingP, setSearchingP] = useState(false);
  const [foundPatient, setFoundPatient] = useState<{id:string;email:string;cpf?:string}|null>(null);
  const [patientErr, setPatientErr] = useState("");
  const [msgOk,      setMsgOk]      = useState(false);

  // aba receitas ativas
  const [active,     setActive]     = useState<Presc[]>([]);
  const [selected,   setSelected]   = useState<Presc | null>(null);
  const [loadingA,   setLoadingA]   = useState(false);
  const [dispActMsg, setDispActMsg] = useState("");
  const [dispActOk,  setDispActOk]  = useState(false);
  const [dispActing, setDispActing] = useState(false);

  // aba histórico
  const [dispensed,  setDispensed]  = useState<Presc[]>([]);
  const [loadingH,   setLoadingH]   = useState(false);

  const loadActive = useCallback(async () => {
    setLoadingA(true);
    try {
      const res = await api.get("/prescriptions/history/pharmacy");
      setActive(res.data.prescriptions);
    } finally { setLoadingA(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingH(true);
    try {
      const res = await api.get("/prescriptions/history/pharmacy/dispensed");
      setDispensed(res.data.prescriptions);
    } finally { setLoadingH(false); }
  }, []);

  useEffect(() => {
    if (tab === "active")  loadActive();
    if (tab === "history") loadHistory();
  }, [tab]);

  // ── busca por ID ──────────────────────────────────────────────────────────
  async function handlePatientSearch() {
    if (!patientQ.trim()) return;
    setSearchingP(true); setFoundPatient(null); setPatientErr("");
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(patientQ.trim())}`);
      setFoundPatient(res.data.patient);
    } catch {
      setPatientErr("Paciente não encontrado.");
    } finally { setSearchingP(false); }
  }

  async function handleSearch() {
    if (!searchId.trim()) return;
    setSearching(true); setFound(null); setMsg("");
    try {
      const res = await api.get(`/prescriptions/validate/${searchId.trim()}`);
      setFound({ id: searchId.trim(), ...res.data, status: res.data.status === "VALID" ? "ACTIVE" : res.data.status });
    } catch {
      setMsg("Receita não encontrada ou inválida."); setMsgOk(false);
    } finally { setSearching(false); }
  }

  async function handleDispense() {
    if (!found) return;
    setDispensing(true); setMsg("");
    try {
      await api.post(`/prescriptions/use/${found.id}`);
      setMsg("✅ Receita dispensada com sucesso!"); setMsgOk(true);
      setFound(prev => prev ? { ...prev, status: "USED" } : null);
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Erro ao dispensar."); setMsgOk(false);
    } finally { setDispensing(false); }
  }

  // ── dispensa da lista ─────────────────────────────────────────────────────
  async function handleDispenseSelected() {
    if (!selected) return;
    setDispActing(true); setDispActMsg("");
    try {
      await api.post(`/prescriptions/use/${selected.id}`);
      setDispActMsg("✅ Receita dispensada com sucesso!");
      setDispActOk(true);
      setSelected(null);
      loadActive();
    } catch (err: any) {
      setDispActMsg(err.response?.data?.error || "Erro ao dispensar.");
      setDispActOk(false);
    } finally { setDispActing(false); }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const shortId = (id: string) => id.length > 16 ? id.slice(0, 16) + "..." : id;

  return (
    <Layout>
      <TabBar>
        <Tab active={tab === "validate"} onClick={() => setTab("validate")}>
          🔍 Validar Receita
        </Tab>
        <Tab active={tab === "active"} onClick={() => setTab("active")}>
          💊 Receitas Ativas
          {active.length > 0 && <CountBadge>{active.length}</CountBadge>}
        </Tab>
        <Tab active={tab === "history"} onClick={() => setTab("history")}>
          📋 Histórico
        </Tab>
      </TabBar>

      {/* ═══════════════════════ ABA: VALIDAR ═══════════════════════════════ */}
      {tab === "validate" && (
        <PageGrid>
          <Card>
            <CardHeader>
              <HeaderIcon>🔍</HeaderIcon>
              <div>
                <HeaderTitle>Validar nova receita</HeaderTitle><br />
                <HeaderSub>Informe a chave da receita prescrita:</HeaderSub>
              </div>
            </CardHeader>

            <SearchRow>
              <SearchInput
                placeholder="Código da receita"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <SearchBtn onClick={handleSearch} disabled={searching}>
                {searching ? "..." : "🔍"}
              </SearchBtn>
            </SearchRow>

            {msg && <MsgBox ok={msgOk}>{msg}</MsgBox>}

            <DescLabel>Descrição da receita</DescLabel>

            {found ? (
              <InfoAreaFilled>
                <InfoRow><InfoKey>Paciente:</InfoKey>    <InfoVal>{found.patient    || "—"}</InfoVal></InfoRow>
                <InfoRow><InfoKey>Medicamento:</InfoKey> <InfoVal>{found.medication || "—"}</InfoVal></InfoRow>
                <InfoRow><InfoKey>Dosagem:</InfoKey>     <InfoVal>{found.dosage     || "—"}</InfoVal></InfoRow>
                <InfoRow><InfoKey>Data:</InfoKey>        <InfoVal>{found.createdAt ? fmtDate(found.createdAt) : "—"}</InfoVal></InfoRow>
                <InfoRow>
                  <InfoKey>Status:</InfoKey>
                  <StatusBadge status={found.status}>{STATUS_LABELS[found.status] || found.status}</StatusBadge>
                </InfoRow>
              </InfoAreaFilled>
            ) : (
              <InfoArea><PlaceholderText>INFORMAÇÕES CONTIDAS NA RECEITA</PlaceholderText></InfoArea>
            )}

            <ActionRow>
              <DispenseBtn
                disabled={!found || found.status !== "ACTIVE" || dispensing}
                onClick={handleDispense}
              >
                {dispensing ? "Dispensando..." : "Fazer dispensação"}
              </DispenseBtn>
            </ActionRow>
          </Card>

          <PatientSearch onSelect={setSelectedPatient} selected={selectedPatient} />
        </PageGrid>
      )}

      {/* ═══════════════════════ ABA: RECEITAS ATIVAS ════════════════════════ */}
      {tab === "active" && (
        <PageGrid>
          <Card>
            <CardHeader>
              <HeaderIcon>💊</HeaderIcon>
              <HeaderTitle>Receitas disponíveis para dispensação</HeaderTitle>
            </CardHeader>

            {loadingA && <EmptyMsg>Carregando...</EmptyMsg>}
            {!loadingA && active.length === 0 && (
              <EmptyMsg>Nenhuma receita ativa no momento.</EmptyMsg>
            )}

            {!loadingA && active.length > 0 && (
              <PrescList>
                {active.map(p => (
                  <PrescCard
                    key={p.id}
                    selected={selected?.id === p.id}
                    onClick={() => { setSelected(p); setDispActMsg(""); }}
                  >
                    <PrescCardRow>
                      <PrescPatient>{p.patient}</PrescPatient>
                      <StatusBadge status={p.status}>{STATUS_LABELS[p.status] || p.status}</StatusBadge>
                    </PrescCardRow>
                    <PrescCardRow>
                      <PrescMed>{p.medication} — {p.dosage}</PrescMed>
                      <PrescDate>{fmtDate(p.createdAt)}</PrescDate>
                    </PrescCardRow>
                    <PrescId>{shortId(p.id)}</PrescId>
                  </PrescCard>
                ))}
              </PrescList>
            )}
          </Card>

          {/* painel de ação */}
          <div>
            <SideCard>
              <SideHeader>Receita selecionada</SideHeader>
              <SideBody>
                {selected ? (
                  <>
                    <SideField><SideLbl>Paciente:</SideLbl>    <SideVal>{selected.patient}</SideVal></SideField>
                    <SideField><SideLbl>Medicamento:</SideLbl> <SideVal>{selected.medication}</SideVal></SideField>
                    <SideField><SideLbl>Dosagem:</SideLbl>     <SideVal>{selected.dosage}</SideVal></SideField>
                    <SideField><SideLbl>Data:</SideLbl>        <SideVal>{fmtDate(selected.createdAt)}</SideVal></SideField>

                    {dispActMsg && (
                      <div style={{
                        marginTop: 12, padding: "10px 12px", borderRadius: 8, fontSize: 13,
                        background: dispActOk ? "#f0fdf4" : "#fee2e2",
                        color: dispActOk ? "#15803d" : "#dc2626",
                        border: `1px solid ${dispActOk ? "#bbf7d0" : "#fca5a5"}`,
                      }}>
                        {dispActMsg}
                      </div>
                    )}

                    <DispenseBtn
                      style={{ width: "100%", marginTop: 14 }}
                      disabled={dispActing}
                      onClick={handleDispenseSelected}
                    >
                      {dispActing ? "Dispensando..." : "Dispensar esta receita"}
                    </DispenseBtn>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>
                    Clique em uma receita da lista para dispensar
                  </p>
                )}
              </SideBody>
            </SideCard>
          </div>
        </PageGrid>
      )}

      {/* ═══════════════════════ ABA: HISTÓRICO ═════════════════════════════ */}
      {tab === "history" && (
        <Card>
          <CardHeader>
            <HeaderIcon>📋</HeaderIcon>
            <HeaderTitle>Histórico de Dispensações</HeaderTitle>
          </CardHeader>

          {loadingH && <EmptyMsg>Carregando...</EmptyMsg>}
          {!loadingH && dispensed.length === 0 && (
            <EmptyMsg>Nenhuma dispensação registrada ainda.</EmptyMsg>
          )}

          {!loadingH && dispensed.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <Th>Paciente</Th>
                  <Th>Medicamento</Th>
                  <Th>Dosagem</Th>
                  <Th>Status</Th>
                  <Th>Dispensado em</Th>
                </tr>
              </thead>
              <tbody>
                {dispensed.map(p => (
                  <tr key={p.id}>
                    <Td style={{ fontWeight: 600, color: TEAL }}>{p.patient}</Td>
                    <Td>{p.medication}</Td>
                    <Td>{p.dosage}</Td>
                    <Td><StatusBadge status={p.status}>{STATUS_LABELS[p.status] || p.status}</StatusBadge></Td>
                    <Td>{p.updatedAt ? fmtDate(p.updatedAt) : fmtDate(p.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </Layout>
  );
}
