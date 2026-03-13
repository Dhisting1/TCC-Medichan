import { prisma } from "../config/database";
import {
  registerDoctor,
  registerPharmacy,
} from "../services/blockchain.service";
import { Request, Response } from "express";

/*
Lista todos os usuários — somente ADMIN
*/
export async function listUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        crm: true,
        cnpj: true,
        createdAt: true,
      },
    });
    return res.json({ users });
  } catch {
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
}

export async function verifyDoctor(req: Request, res: Response) {
  const { crm, userId } = req.body;

  // admin pode passar userId no body para aprovar outro usuário
  const targetId = userId || (req as any).user?.id;

  if (!targetId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    if (user.wallet) {
      await registerDoctor(user.wallet);
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { role: "DOCTOR", crm },
    });

    return res.json({ message: "Doctor verified" });
  } catch {
    return res.status(500).json({ error: "Erro ao verificar médico" });
  }
}

export async function verifyPharmacy(req: Request, res: Response) {
  const { cnpj, userId } = req.body;

  const targetId = userId || (req as any).user?.id;

  if (!targetId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    if (user.wallet) {
      await registerPharmacy(user.wallet);
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { role: "PHARMACY", cnpj },
    });

    return res.json({ message: "Pharmacy verified" });
  } catch {
    return res.status(500).json({ error: "Erro ao verificar farmácia" });
  }
}

