import { useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import Layout from "../../components/Layout";
import { TEAL, LIME, WHITE, BORDER, MUTED, SUBTLE, STATUS_COLORS, STATUS_LABELS } from "../../styles/tokens";

const Wrapper = styled.div`
  max-width: 560px;
`;

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

const Description = styled.p`
  font-size: 14px;
  color: ${MUTED};
  margin-bottom: 20px;
  line-height: 1.6;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 0;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  overflow: hidden;
  background: ${WHITE};
  margin-bottom: 20px;
  &:focus-within { border-color: ${TEAL}; }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 14px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111827;
  &::placeholder { color: #9ca3af; }
`;

const SearchBtn = styled.button`
  padding: 12px 20px;
  background: ${TEAL};
  color: ${WHITE};
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ResultBox = styled.div<{ status: string }>`
  border-radius: 10px;
  padding: 20px;
  background: ${(p: any) => STATUS_COLORS[p.status]?.bg || "#f3f4f6"};
  border: 1.5px solid ${(p: any) => STATUS_COLORS[p.status]?.text || "#d1d5db"}22;
`;

const ResultStatus = styled.p<{ status: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${(p: any) => STATUS_COLORS[p.status]?.text || "#6b7280"};
  margin-bottom: 6px;
`;

const ResultSub = styled.p`
  font-size: 13px;
  color: ${MUTED};
`;

const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const InfoKey = styled.span`font-size: 12px; color: ${MUTED}; min-width: 80px;`;
const InfoVal = styled.span`font-size: 13px; color: #111827; font-weight: 500;`;

const statusEmoji: Record<string, string> = {
  VALID:     "✅",
  ACTIVE:    "✅",
  USED:      "⚠️",
  REVOKED:   "❌",
  NOT_FOUND: "🔍",
};

interface PrescResult {
  status: string;
  patient?: string;
  medication?: string;
  dosage?: string;
  createdAt?: string;
}

export default function PatientDashboard() {
  const [id,      setId]      = useState("");
  const [result,  setResult]  = useState<PrescResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConsult() {
    if (!id.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/prescriptions/validate/${id.trim()}`);
      setResult(res.data);
    } catch {
      setResult({ status: "NOT_FOUND" });
    } finally {
      setLoading(false);
    }
  }

  const normalizedStatus = result?.status === "ACTIVE" ? "VALID" : result?.status || "";

  return (
    <Layout>
      <Wrapper>
        <Card>
          <CardHeader>
            <HeaderIcon>🔍</HeaderIcon>
            <HeaderTitle>Consultar Receita</HeaderTitle>
          </CardHeader>
          <CardBody>
            <Description>
              Digite o ID da receita que você recebeu do seu médico para verificar
              o status na blockchain.
            </Description>

            <SearchRow>
              <SearchInput
                placeholder="ID da receita (ex: abc123...)"
                value={id}
                onChange={e => setId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConsult()}
              />
              <SearchBtn onClick={handleConsult} disabled={loading}>
                {loading ? "..." : "Verificar"}
              </SearchBtn>
            </SearchRow>

            {result && (
              <ResultBox status={normalizedStatus}>
                <ResultStatus status={normalizedStatus}>
                  {statusEmoji[normalizedStatus]} {STATUS_LABELS[normalizedStatus] || result.status}
                </ResultStatus>
                <ResultSub>
                  {normalizedStatus === "VALID"     && "Esta receita está ativa e pode ser dispensada na farmácia."}
                  {normalizedStatus === "USED"      && "Esta receita já foi dispensada e não pode ser usada novamente."}
                  {normalizedStatus === "REVOKED"   && "Esta receita foi revogada pelo médico."}
                  {normalizedStatus === "NOT_FOUND" && "Nenhuma receita foi encontrada com este ID."}
                </ResultSub>
                {result.medication && (
                  <>
                    <InfoRow><InfoKey>Medicamento:</InfoKey><InfoVal>{result.medication}</InfoVal></InfoRow>
                    <InfoRow><InfoKey>Dosagem:</InfoKey><InfoVal>{result.dosage}</InfoVal></InfoRow>
                    {result.createdAt && (
                      <InfoRow>
                        <InfoKey>Data:</InfoKey>
                        <InfoVal>{new Date(result.createdAt).toLocaleDateString("pt-BR")}</InfoVal>
                      </InfoRow>
                    )}
                  </>
                )}
              </ResultBox>
            )}
          </CardBody>
        </Card>
      </Wrapper>
    </Layout>
  );
}
