import { prisma } from "../config/database";
import { registerDoctor, registerPharmacy } from "../services/blockchain.service";
import { Request, Response } from "express";

/*
Lista todos os usuários — somente ADMIN
*/
export async function listUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, cpf: true, crm: true, cnpj: true, createdAt: true },
    });
    return res.json({ users });
  } catch {
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
}

/*
Exclui um usuário — somente ADMIN
Não permite excluir o próprio admin
*/
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  const adminId = (req as any).user?.id;

  if (id === adminId) {
    return res.status(400).json({ error: "Você não pode excluir sua própria conta." });
  }

  try {
    // remove prescrições vinculadas ao médico antes de excluir
    await prisma.prescription.deleteMany({ where: { doctorId: id } });
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Usuário excluído com sucesso." });
  } catch {
    return res.status(500).json({ error: "Erro ao excluir usuário." });
  }
}

/*
Busca paciente por email ou CPF — DOCTOR e PHARMACY
*/
export async function searchPatient(req: Request, res: Response) {
  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim() === "") {
    return res.status(400).json({ error: "Informe email ou CPF para busca." });
  }

  const term = q.trim();

  try {
    const patient = await prisma.user.findFirst({
      where: {
        role: "PATIENT",
        OR: [
          { email: { equals: term, mode: "insensitive" } },
          { cpf:   { equals: term } },
        ],
      },
      select: { id: true, email: true, cpf: true },
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    return res.json({ patient });
  } catch {
    return res.status(500).json({ error: "Erro na busca." });
  }
}

/*
Aprova médico — somente ADMIN
*/
export async function verifyDoctor(req: Request, res: Response) {
  const { crm, userId } = req.body;
  const targetId = userId || (req as any).user?.id;

  if (!targetId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  try {
    if (user.wallet) await registerDoctor(user.wallet);
    await prisma.user.update({ where: { id: targetId }, data: { role: "DOCTOR", crm } });
    return res.json({ message: "Médico aprovado." });
  } catch {
    return res.status(500).json({ error: "Erro ao aprovar médico." });
  }
}

/*
Aprova farmácia — somente ADMIN
*/
export async function verifyPharmacy(req: Request, res: Response) {
  const { cnpj, userId } = req.body;
  const targetId = userId || (req as any).user?.id;

  if (!targetId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

  try {
    if (user.wallet) await registerPharmacy(user.wallet);
    await prisma.user.update({ where: { id: targetId }, data: { role: "PHARMACY", cnpj } });
    return res.json({ message: "Farmácia aprovada." });
  } catch {
    return res.status(500).json({ error: "Erro ao aprovar farmácia." });
  }
}
