import { uploadToIPFS } from "../services/ipfs.service";
import { createPrescription } from "../services/blockchain.service";
import { generateQR } from "../utils/qrcode";
import { ethers } from "ethers";
import crypto from "crypto";
import { Request, Response } from "express";

export async function create(req: Request, res: Response) {
  const prescription = req.body;

  // envia receita para IPFS
  const ipfsHash = await uploadToIPFS(prescription);

  // gera id da receita
  const rawId = crypto.randomUUID();

  // converte para bytes32
  const id = ethers.keccak256(ethers.toUtf8Bytes(rawId));

  // converte hash IPFS para bytes32
  const hash = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));

  // registra na blockchain
  await createPrescription(id, hash);

  const qr = await generateQR(rawId);

  res.json({
    prescriptionId: rawId,
    ipfsHash,
    qr,
  });
}
