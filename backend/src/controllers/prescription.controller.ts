import { uploadToIPFS } from "../services/ipfs.service";
import { createPrescription } from "../services/blockchain.service";
import { generateHash } from "../utils/hash";
import { generateQR } from "../utils/qrcode";
import { Request, Response } from "express";
import crypto from "crypto";

export async function create(req: Request, res: Response) {
  const prescription = req.body;

  const ipfsHash = await uploadToIPFS(prescription);

  const id = crypto.randomUUID();

  const hash = generateHash(ipfsHash);

  await createPrescription(id, hash);

  const qr = await generateQR(id);

  res.json({
    prescriptionId: id,
    ipfsHash,
    qr,
  });
}
