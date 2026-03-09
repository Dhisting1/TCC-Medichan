import { useState } from "react";
import styled from "styled-components";
import { api } from "../services/api";

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: none;
`;

const Button = styled.button`
  padding: 12px;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
`;

export default function ValidatePrescription() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");

  async function validate() {
    const response = await api.get(`/prescriptions/validate/${id}`);

    setStatus(response.data.status);
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Validar Receita</h2>

      <Input
        placeholder="ID da receita"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <Button onClick={validate}>Validar</Button>

      {status && <p>Status: {status}</p>}
    </div>
  );
}
