import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { FilePlus, ClipboardList } from "lucide-react";

const TEAL = "#0B3530";
const LIME = "#CBE54E";

const DarkPanel = styled.div`
  background: ${TEAL};
  border-radius: 16px;
  padding: 40px;
  display: flex;
  gap: 24px;
  justify-content: center;
`;

const FeatureCard = styled.button`
  background: white;
  border: none;
  border-radius: 12px;
  padding: 32px 24px;
  width: 200px;
  cursor: pointer;
  text-align: center;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }
`;

const IconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${LIME};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${TEAL};
`;

const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${TEAL};
  margin-bottom: 6px;
`;

const CardSub = styled.p`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <DarkPanel>
        <FeatureCard onClick={() => navigate("/doctor/new")}>
          <IconCircle>
            <FilePlus size={26} strokeWidth={2} />
          </IconCircle>
          <CardTitle>Gerar nova prescrição</CardTitle>
          <CardSub>Criar novo receituário</CardSub>
        </FeatureCard>

        <FeatureCard onClick={() => navigate("/doctor/history")}>
          <IconCircle>
            <ClipboardList size={26} strokeWidth={2} />
          </IconCircle>
          <CardTitle>Histórico</CardTitle>
          <CardSub>Conferir prescrições anteriores autenticadas e enviadas</CardSub>
        </FeatureCard>
      </DarkPanel>
    </Layout>
  );
}
