import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    console.log(response.data);

    const user = response.data.user || response.data;

    login(user);

    const role = user.role;

    if (role === "ADMIN") navigate("/admin");
    if (role === "DOCTOR") navigate("/doctor");
    if (role === "PHARMACY") navigate("/pharmacy");
    if (role === "PATIENT") navigate("/patient");
  }
  return (
    <div>
      <h2>Login MediChain</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
