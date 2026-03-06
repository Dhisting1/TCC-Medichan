import { prisma } from "../config/database";
import {
  registerDoctor,
  registerPharmacy,
} from "../services/blockchain.service";
import { Response } from "express";

export async function verifyDoctor(req: Request, res: Response) {
  const { crm } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // registra médico na blockchain
  await registerDoctor(user.wallet);

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "DOCTOR",
      crm,
    },
  });

  res.json({
    message: "Doctor verified",
  });
}
export async function verifyPharmacy(req: Request, res: Response) {
  const { cnpj } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // registra farmácia na blockchain
  await registerPharmacy(user.wallet);

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "PHARMACY",
      cnpj,
    },
  });

  res.json({
    message: "Pharmacy verified",
  });
}
