import { useState } from "react";
import styled from "styled-components";
import { api } from "../services/api";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: none;
`;

const Button = styled.button`
  padding: 12px;
  background: #22c55e;
  border: none;
  color: white;
  cursor: pointer;
`;

export default function CreatePrescription() {
  const [patient, setPatient] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [qr, setQr] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    const response = await api.post("/prescriptions", {
      patient,
      medication,
      dosage,
    });

    setQr(response.data.qr);
  }

  return (
    <div>
      <h2>Criar Receita</h2>

      <Form onSubmit={handleSubmit}>
        <Input
          placeholder="Paciente"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
        />

        <Input
          placeholder="Medicamento"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
        />

        <Input
          placeholder="Dosagem"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />

        <Button type="submit">Criar Receita</Button>
      </Form>

      {qr && (
        <div style={{ marginTop: 20 }}>
          <img src={qr} />
        </div>
      )}
    </div>
  );
}
