import { useState } from "react";
import { api } from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");

  async function register() {
    await api.post("/auth/register", {
      email,
      password,
      role,
    });

    alert("Usuário criado");
  }

  return (
    <div>
      <h2>Cadastrar</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setPassword(e.target.value)}
      />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="PATIENT">Paciente</option>
        <option value="DOCTOR">Médico</option>
        <option value="PHARMACY">Farmácia</option>
      </select>

      <button onClick={register}>Criar Conta</button>
    </div>
  );
}
