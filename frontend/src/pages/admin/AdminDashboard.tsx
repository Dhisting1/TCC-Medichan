import { useState, useEffect } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE } from "../../styles/tokens";

// ── estilos ────────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${WHITE}; border-radius: 12px;
  border: 1px solid ${BORDER}; overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 24px; background: ${SUBTLE}; border-bottom: 1px solid ${BORDER};
`;

const HeaderLeft = styled.div`display: flex; align-items: center; gap: 12px;`;

const HeaderIcon = styled.div`
  width: 36px; height: 36px; border-radius: 50%; background: ${LIME};
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;

const HeaderTitle = styled.span`font-size: 15px; font-weight: 600; color: ${TEAL};`;

const CountTag = styled.span`
  font-size: 12px; padding: 3px 10px; border-radius: 99px;
  background: ${TEAL}; color: ${LIME}; font-weight: 700;
`;

const MsgBox = styled.div<{ ok?: boolean }>`
  padding: 12px 24px; font-size: 13px;
  background: ${(p: any) => p.ok ? "#f0fdf4" : "#fee2e2"};
  border-bottom: 1px solid ${(p: any) => p.ok ? "#bbf7d0" : "#fca5a5"};
  color: ${(p: any) => p.ok ? "#15803d" : "#dc2626"};
`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;

const Th = styled.th`
  padding: 12px 20px; text-align: left; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #9ca3af; background: ${SUBTLE}; border-bottom: 1px solid ${BORDER};
`;

const Td = styled.td`
  padding: 13px 20px; font-size: 13px; color: #374151;
  border-bottom: 1px solid #f3f4f6; vertical-align: middle;
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

const DocTag = styled.span`
  font-size: 12px; color: #6b7280; font-style: italic;
`;

const ApproveCell = styled.div`
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`;

const SmallInput = styled.input`
  padding: 7px 10px; border: 1.5px solid ${BORDER}; border-radius: 6px;
  font-size: 12px; color: #111827; width: 120px; background: ${WHITE};
  &:focus { outline: none; border-color: ${TEAL}; }
  &::placeholder { color: #9ca3af; }
`;

const ApproveBtn = styled.button<{ variant?: string }>`
  padding: 7px 14px; border-radius: 6px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  background: ${(p: any) => p.variant === "purple" ? "#7c3aed" : TEAL};
  color: ${WHITE};
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const DeleteBtn = styled.button`
  padding: 6px 12px; border-radius: 6px;
  border: 1px solid #fca5a5; background: transparent;
  color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: #fee2e2; border-color: #dc2626; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ConfirmOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 999;
`;

const ConfirmBox = styled.div`
  background: ${WHITE}; border-radius: 14px; padding: 28px 32px;
  max-width: 380px; width: 90%; box-shadow: 0 16px 48px rgba(0,0,0,0.18);
`;

const ConfirmTitle = styled.h3`font-size: 17px; font-weight: 700; color: ${TEAL}; margin-bottom: 10px;`;
const ConfirmText  = styled.p`font-size: 14px; color: ${MUTED}; margin-bottom: 24px; line-height: 1.6;`;
const ConfirmRow   = styled.div`display: flex; gap: 10px; justify-content: flex-end;`;

const CancelBtn = styled.button`
  padding: 10px 20px; border-radius: 8px; border: 1.5px solid ${BORDER};
  background: ${WHITE}; color: ${TEAL}; font-size: 14px; font-weight: 600; cursor: pointer;
  &:hover { background: ${SUBTLE}; }
`;

const ConfirmDeleteBtn = styled.button`
  padding: 10px 20px; border-radius: 8px; border: none;
  background: #dc2626; color: ${WHITE}; font-size: 14px; font-weight: 700; cursor: pointer;
  &:hover { opacity: 0.85; }
`;

const EmptyMsg = styled.div`text-align: center; padding: 48px; color: #9ca3af; font-size: 14px;`;

// ── interfaces ─────────────────────────────────────────────────────────────────
interface User {
  id: string; email: string; role: string;
  cpf?: string; crm?: string; cnpj?: string;
  createdAt: string;
}

// ── componente ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [users,     setUsers]     = useState<User[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState("");
  const [msgOk,     setMsgOk]     = useState(false);
  const [crmMap,    setCrmMap]    = useState<Record<string, string>>({});
  const [cnpjMap,   setCnpjMap]   = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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

  async function handleDelete(userId: string) {
    setDeleting(userId);
    setConfirmId(null);
    try {
      await api.delete(`/users/${userId}`);
      setMsg("✅ Usuário excluído com sucesso."); setMsgOk(true);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setMsg(err.response?.data?.error || "Erro ao excluir."); setMsgOk(false);
    } finally { setDeleting(null); }
  }

  // identifica campo identificador por role
  function getIdDoc(u: User) {
    if (u.role === "DOCTOR"   && u.crm)  return `CRM: ${u.crm}`;
    if (u.role === "PHARMACY" && u.cnpj) return `CNPJ: ${u.cnpj}`;
    if (u.cpf)                           return `CPF: ${u.cpf}`;
    return null;
  }

  const confirmUser = users.find(u => u.id === confirmId);

  return (
    <Layout>
      {/* modal de confirmação */}
      {confirmId && confirmUser && (
        <ConfirmOverlay onClick={() => setConfirmId(null)}>
          <ConfirmBox onClick={e => e.stopPropagation()}>
            <ConfirmTitle>Excluir usuário?</ConfirmTitle>
            <ConfirmText>
              Tem certeza que deseja excluir <strong>{confirmUser.email}</strong>?<br />
              Esta ação não pode ser desfeita. As prescrições vinculadas a este usuário também serão removidas.
            </ConfirmText>
            <ConfirmRow>
              <CancelBtn onClick={() => setConfirmId(null)}>Cancelar</CancelBtn>
              <ConfirmDeleteBtn onClick={() => handleDelete(confirmId)}>
                Sim, excluir
              </ConfirmDeleteBtn>
            </ConfirmRow>
          </ConfirmBox>
        </ConfirmOverlay>
      )}

      <Card>
        <CardHeader>
          <HeaderLeft>
            <HeaderIcon>👥</HeaderIcon>
            <HeaderTitle>Gerenciar Usuários</HeaderTitle>
          </HeaderLeft>
          {!loading && <CountTag>{users.length} usuários</CountTag>}
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
                <Th>Identificação</Th>
                <Th>Cadastro</Th>
                <Th>Aprovação</Th>
                <Th>Excluir</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const idDoc = getIdDoc(u);
                return (
                  <tr key={u.id}>
                    <Td style={{ fontWeight: 500, color: TEAL }}>{u.email}</Td>
                    <Td><RoleBadge role={u.role}>{u.role}</RoleBadge></Td>
                    <Td>{idDoc ? <DocTag>{idDoc}</DocTag> : <span style={{ color: "#d1d5db" }}>—</span>}</Td>
                    <Td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</Td>

                    {/* aprovação */}
                    <Td>
                      {u.role === "PATIENT" && !u.crm && !u.cnpj ? (
                        <ApproveCell>
                          <SmallInput
                            placeholder="CRM (aprovar médico)"
                            value={crmMap[u.id] || ""}
                            onChange={e => setCrmMap(p => ({ ...p, [u.id]: e.target.value }))}
                          />
                          <ApproveBtn disabled={approving === u.id} onClick={() => approveDoctor(u.id)}>
                            Médico
                          </ApproveBtn>
                          <SmallInput
                            placeholder="CNPJ (aprovar farm.)"
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

                    {/* excluir */}
                    <Td>
                      {u.role !== "ADMIN" ? (
                        <DeleteBtn
                          disabled={deleting === u.id}
                          onClick={() => setConfirmId(u.id)}
                        >
                          {deleting === u.id ? "..." : "🗑 Excluir"}
                        </DeleteBtn>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </Layout>
  );
}
