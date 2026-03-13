import { useState, useEffect } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE } from "../../styles/tokens";

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
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;

const HeaderTitle = styled.span`font-size: 15px; font-weight: 600; color: ${TEAL};`;

const MsgBox = styled.div<{ ok?: boolean }>`
  padding: 12px 24px;
  font-size: 13px;
  background: ${(p: any) => p.ok ? "#f0fdf4" : "#fee2e2"};
  border-bottom: 1px solid ${(p: any) => p.ok ? "#bbf7d0" : "#fca5a5"};
  color: ${(p: any) => p.ok ? "#15803d" : "#dc2626"};
`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;

const Th = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  background: ${SUBTLE};
  border-bottom: 1px solid ${BORDER};
`;

const Td = styled.td`
  padding: 14px 20px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600;
  background: ${(p: any) =>
    p.role === "DOCTOR"   ? "#dbeafe" :
    p.role === "PHARMACY" ? "#ede9fe" :
    p.role === "ADMIN"    ? "#fee2e2" : "#f3f4f6"};
  color: ${(p: any) =>
    p.role === "DOCTOR"   ? "#1d4ed8" :
    p.role === "PHARMACY" ? "#7c3aed" :
    p.role === "ADMIN"    ? "#dc2626" : "#6b7280"};
`;

const ApproveCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SmallInput = styled.input`
  padding: 7px 10px;
  border: 1.5px solid ${BORDER};
  border-radius: 6px;
  font-size: 12px;
  color: #111827;
  width: 110px;
  background: ${WHITE};
  &:focus { outline: none; border-color: ${TEAL}; }
  &::placeholder { color: #9ca3af; }
`;

const ApproveBtn = styled.button<{ variant?: string }>`
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p: any) => p.variant === "purple" ? "#7c3aed" : TEAL};
  color: ${WHITE};
  transition: opacity 0.15s;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const EmptyMsg = styled.div`
  text-align: center; padding: 48px;
  color: #9ca3af; font-size: 14px;
`;

interface User { id: string; email: string; role: string; createdAt: string; }

export default function AdminDashboard() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [msgOk,    setMsgOk]    = useState(false);
  const [crmMap,   setCrmMap]   = useState<Record<string, string>>({});
  const [cnpjMap,  setCnpjMap]  = useState<Record<string, string>>({});
  const [approving,setApproving]= useState<string | null>(null);

  async function loadUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(); }, []);

  async function approveDoctor(userId: string) {
    const crm = crmMap[userId]?.trim();
    if (!crm) { setMsg("Informe o CRM."); setMsgOk(false); return; }
    setApproving(userId);
    try {
      await api.post("/users/verify-doctor", { userId, crm });
      setMsg("✅ Médico aprovado com sucesso."); setMsgOk(true); loadUsers();
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Erro ao aprovar."); setMsgOk(false);
    } finally { setApproving(null); }
  }

  async function approvePharmacy(userId: string) {
    const cnpj = cnpjMap[userId]?.trim();
    if (!cnpj) { setMsg("Informe o CNPJ."); setMsgOk(false); return; }
    setApproving(userId);
    try {
      await api.post("/users/verify-pharmacy", { userId, cnpj });
      setMsg("✅ Farmácia aprovada com sucesso."); setMsgOk(true); loadUsers();
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Erro ao aprovar."); setMsgOk(false);
    } finally { setApproving(null); }
  }

  return (
    <Layout>
      <Card>
        <CardHeader>
          <HeaderIcon>👥</HeaderIcon>
          <HeaderTitle>Gerenciar Usuários</HeaderTitle>
        </CardHeader>

        {msg && <MsgBox ok={msgOk}>{msg}</MsgBox>}

        {loading && <EmptyMsg>Carregando...</EmptyMsg>}
        {!loading && users.length === 0 && <EmptyMsg>Nenhum usuário cadastrado.</EmptyMsg>}

        {!loading && users.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Email</Th>
                <Th>Função</Th>
                <Th>Cadastro</Th>
                <Th>Ações de Aprovação</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <Td style={{ fontWeight: 500, color: TEAL }}>{u.email}</Td>
                  <Td><RoleBadge role={u.role}>{u.role}</RoleBadge></Td>
                  <Td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</Td>
                  <Td>
                    {u.role === "PATIENT" ? (
                      <ApproveCell>
                        <SmallInput
                          placeholder="CRM"
                          value={crmMap[u.id] || ""}
                          onChange={e => setCrmMap(p => ({ ...p, [u.id]: e.target.value }))}
                        />
                        <ApproveBtn disabled={approving === u.id} onClick={() => approveDoctor(u.id)}>
                          Médico
                        </ApproveBtn>
                        <SmallInput
                          placeholder="CNPJ"
                          value={cnpjMap[u.id] || ""}
                          onChange={e => setCnpjMap(p => ({ ...p, [u.id]: e.target.value }))}
                        />
                        <ApproveBtn variant="purple" disabled={approving === u.id} onClick={() => approvePharmacy(u.id)}>
                          Farmácia
                        </ApproveBtn>
                      </ApproveCell>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
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
