import { useState, useEffect } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";

const TEAL = "#0B3530";
const LIME = "#CBE54E";

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 14px 20px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  background: ${p =>
    p.status === "ACTIVE"  ? "#dcfce7" :
    p.status === "USED"    ? "#dbeafe" : "#fee2e2"};
  color: ${p =>
    p.status === "ACTIVE"  ? "#15803d" :
    p.status === "USED"    ? "#1d4ed8" : "#dc2626"};
`;

const RevokeBtn = styled.button`
  padding: 5px 12px;
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #fee2e2; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 48px;
  color: #9ca3af;
  font-size: 14px;
`;

const SuccessMsg = styled.p`
  font-size: 13px;
  color: #15803d;
  padding: 12px 20px;
  background: #f0fdf4;
  border-bottom: 1px solid #bbf7d0;
`;

interface Prescription {
  id: string;
  patient: string;
  medication: string;
  dosage: string;
  status: string;
  createdAt: string;
}

export default function DoctorHistory() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [msg,      setMsg]      = useState("");

  async function load() {
    try {
      const res = await api.get("/prescriptions/history/doctor");
      setPrescriptions(res.data.prescriptions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRevoke(id: string) {
    setRevoking(id);
    setMsg("");
    try {
      await api.post(`/prescriptions/revoke/${id}`);
      setMsg("Receita revogada com sucesso.");
      load();
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Erro ao revogar.");
    } finally {
      setRevoking(null);
    }
  }

  const statusLabel: Record<string, string> = {
    ACTIVE: "Ativa",
    USED:   "Dispensada",
    REVOKED:"Revogada",
  };

  return (
    <Layout>
      <Card>
        <CardHeader>
          <HeaderIcon>📋</HeaderIcon>
          <HeaderTitle>Minhas Prescrições</HeaderTitle>
        </CardHeader>

        {msg && <SuccessMsg>{msg}</SuccessMsg>}

        {loading && <EmptyMsg>Carregando...</EmptyMsg>}
        {!loading && prescriptions.length === 0 && (
          <EmptyMsg>Nenhuma prescrição emitida ainda.</EmptyMsg>
        )}

        {!loading && prescriptions.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Paciente</Th>
                <Th>Medicamento</Th>
                <Th>Dosagem</Th>
                <Th>Status</Th>
                <Th>Data</Th>
                <Th>Ação</Th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id}>
                  <Td style={{ fontWeight: 600, color: TEAL }}>{p.patient}</Td>
                  <Td>{p.medication}</Td>
                  <Td>{p.dosage}</Td>
                  <Td>
                    <StatusBadge status={p.status}>
                      {statusLabel[p.status] || p.status}
                    </StatusBadge>
                  </Td>
                  <Td>{new Date(p.createdAt).toLocaleDateString("pt-BR")}</Td>
                  <Td>
                    {p.status === "ACTIVE" ? (
                      <RevokeBtn
                        disabled={revoking === p.id}
                        onClick={() => handleRevoke(p.id)}
                      >
                        {revoking === p.id ? "..." : "Revogar"}
                      </RevokeBtn>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Layout>
  );
}
