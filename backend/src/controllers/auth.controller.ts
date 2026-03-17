import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/database";

/*
Cadastro de usuário
- PATIENT:  email + password + cpf
- DOCTOR:   email + password + crm  → entra como PATIENT até admin aprovar
- PHARMACY: email + password + cnpj → entra como PATIENT até admin aprovar
*/
export async function register(req: Request, res: Response) {
  const { email, password, role, cpf, crm, cnpj } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  // valida campos obrigatórios por role
  const requestedRole = role || "PATIENT";
  if (requestedRole === "PATIENT"  && !cpf)  return res.status(400).json({ error: "CPF é obrigatório para pacientes." });
  if (requestedRole === "DOCTOR"   && !crm)  return res.status(400).json({ error: "CRM é obrigatório para médicos." });
  if (requestedRole === "PHARMACY" && !cnpj) return res.status(400).json({ error: "CNPJ é obrigatório para farmácias." });

  // médico e farmácia entram como PATIENT até aprovação do admin
  const actualRole = requestedRole === "PATIENT" ? "PATIENT" : "PATIENT";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: actualRole,
        cpf:  requestedRole === "PATIENT"  ? cpf?.trim()  : null,
        crm:  requestedRole === "DOCTOR"   ? crm?.trim()  : null,
        cnpj: requestedRole === "PHARMACY" ? cnpj?.trim() : null,
      },
    });

    return res.json({
      message: "Usuário criado com sucesso",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Email ou CPF já cadastrado." });
    }
    return res.status(400).json({ error: "Erro ao criar usuário." });
  }
}

/*
Login
*/
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch {
    return res.status(500).json({ error: "Erro no login." });
  }
}
