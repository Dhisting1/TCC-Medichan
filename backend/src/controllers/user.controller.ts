import {
  registerDoctor,
  registerPharmacy,
} from "../services/blockchain.service";
import { Request, Response } from "express";

export async function verifyDoctor(req: Request, res: Response) {
  const { wallet, crm } = req.body;

  await registerDoctor(wallet);

  res.json({
    message: "Doctor verified",
    crm,
  });
}

export async function verifyPharmacy(req: Request, res: Response) {
  const { wallet, cnpj } = req.body;

  await registerPharmacy(wallet);

  res.json({
    message: "Pharmacy verified",
    cnpj,
  });
}
