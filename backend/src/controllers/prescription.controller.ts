import { Request, Response } from "express";
import crypto from "crypto";
import QRCode from "qrcode";

import { uploadToIPFS } from "../services/ipfs.service";
import {
  createPrescription,
  getPrescriptionStatus,
  markPrescriptionUsed,
} from "../services/blockchain.service";

import { keccak256, toUtf8Bytes } from "ethers";

/*
Cria receita
*/
export async function create(req: Request, res: Response) {
  const { patient, medication, dosage } = req.body;

  const data = {
    patient,
    medication,
    dosage,
  };

  // salva receita no IPFS
  const ipfsHash = await uploadToIPFS(data);

  // gera id da receita
  const id = "0x" + crypto.randomBytes(32).toString("hex");

  // converte ipfsHash em bytes32
  const hash = keccak256(toUtf8Bytes(ipfsHash));

  // registra na blockchain
  await createPrescription(id, hash);

  // gera QR code
  const qr = await QRCode.toDataURL(
    `${process.env.BASE_URL}/prescriptions/validate/${id}`,
  );

  return res.json({
    id,
    ipfsHash,
    qr,
  });
}

export async function validate(req: Request, res: Response) {
  const id = req.params.id as string;

  const prescription = await getPrescriptionStatus(id);

  if (!prescription.exists) {
    return res.json({
      status: "NOT_FOUND",
    });
  }

  if (prescription.revoked) {
    return res.json({
      status: "REVOKED",
    });
  }

  if (prescription.used) {
    return res.json({
      status: "USED",
    });
  }

  return res.json({
    status: "VALID",
  });
}

export async function usePrescription(req: Request, res: Response) {
  const id = req.params.id as string;

  await markPrescriptionUsed(id);

  return res.json({
    message: "Prescription marked as used",
  });
}
