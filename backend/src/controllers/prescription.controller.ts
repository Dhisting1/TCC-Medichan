import { Request, Response } from "express";
import crypto from "crypto";
import QRCode from "qrcode";

import { prisma } from "../config/database";
import { uploadToIPFS } from "../services/ipfs.service";
import {
  createPrescription,
  getPrescriptionStatus,
  markPrescriptionUsed,
  revokePrescription,
} from "../services/blockchain.service";

import { keccak256, toUtf8Bytes } from "ethers";
import { notifyPatient } from "../services/email.service";
import { generatePrescriptionPdf } from "../services/pdf.service";

/*
Cria receita — somente DOCTOR
Salva no IPFS, registra na blockchain e persiste no banco
*/
export async function create(req: Request, res: Response) {
  const { patient, patientEmail, medication, dosage } = req.body;

  // 5. validação de entrada
  if (!patient || typeof patient !== "string" || patient.trim() === "") {
    return res.status(400).json({ error: "Campo 'patient' é obrigatório." });
  }
  if (!medication || typeof medication !== "string" || medication.trim() === "") {
    return res.status(400).json({ error: "Campo 'medication' é obrigatório." });
  }
  if (!dosage || typeof dosage !== "string" || dosage.trim() === "") {
    return res.status(400).json({ error: "Campo 'dosage' é obrigatório." });
  }

  const doctorId = (req as any).user?.id;

  try {
    const data = { patient: patient.trim(), medication: medication.trim(), dosage: dosage.trim() };

    // salva receita no IPFS
    const ipfsHash = await uploadToIPFS(data);

    // gera id da receita
    const id = "0x" + crypto.randomBytes(32).toString("hex");

    // converte ipfsHash em bytes32
    const hash = keccak256(toUtf8Bytes(ipfsHash));

    // registra na blockchain
    await createPrescription(id, hash);

    // 6. BASE_URL com fallback seguro
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    // gera QR code
    const qr = await QRCode.toDataURL(`${baseUrl}/prescriptions/validate/${id}`);

    // persiste no banco para histórico (RF04)
    await prisma.prescription.create({
      data: {
        id,
        ipfsHash,
        patient: data.patient,
        medication: data.medication,
        dosage: data.dosage,
        qr,
        patientEmail: patientEmail?.trim() || null,
        status: "ACTIVE",
        doctorId,
      },
    });

    // RF06 — gera PDF e notifica paciente por email
    if (patientEmail?.trim()) {
      const doctorEmail = (req as any).user?.email || "medico@medichain.com";
      const doctorCrm   = (req as any).user?.crm   || undefined;
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

      // gera PDF da prescrição
      const pdfBuffer = await generatePrescriptionPdf({
        prescriptionId: id,
        patient:        data.patient,
        patientEmail:   patientEmail.trim(),
        medication:     data.medication,
        dosage:         data.dosage,
        doctorEmail,
        doctorCrm,
        createdAt:      new Date(),
        qrDataUrl:      qr,
      });

      await notifyPatient({
        patientName:    data.patient,
        patientEmail:   patientEmail.trim(),
        prescriptionId: id,
        medication:     data.medication,
        dosage:         data.dosage,
        doctorEmail,
        qrDataUrl:      qr,
        baseUrl,
        pdfBuffer,
      });
    }

    return res.status(201).json({ id, ipfsHash, qr });
  } catch (error: any) {
    console.error("Erro ao criar receita:", error);
    return res.status(500).json({ error: "Erro ao criar receita" });
  }
}

/*
Valida receita — pública
*/
export async function validate(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const dbRecord = await prisma.prescription.findUnique({
      where: { id },
      select: { patient: true, medication: true, dosage: true, createdAt: true },
    });

    const prescription = await getPrescriptionStatus(id);

    if (!prescription.exists) {
      return res.json({ status: "NOT_FOUND" });
    }

    let status = "VALID";
    if (prescription.revoked) status = "REVOKED";
    else if (prescription.used) status = "USED";

    return res.json({
      status,
      patient:    dbRecord?.patient    ?? null,
      medication: dbRecord?.medication ?? null,
      dosage:     dbRecord?.dosage     ?? null,
      createdAt:  dbRecord?.createdAt  ?? null,
    });
  } catch (error: any) {
    console.error("Erro ao validar receita:", error);
    return res.status(500).json({ error: "Erro ao validar receita" });
  }
}

/*
Farmácia dispensa receita — somente PHARMACY
Atualiza status na blockchain e no banco
*/
export async function usePrescription(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // verifica se existe no banco antes de chamar a blockchain
    const prescription = await prisma.prescription.findUnique({ where: { id } });

    if (!prescription) {
      return res.status(404).json({ error: "Receita não encontrada" });
    }
    if (prescription.status !== "ACTIVE") {
      return res.status(400).json({ error: `Receita não pode ser dispensada. Status atual: ${prescription.status}` });
    }

    await markPrescriptionUsed(id);

    await prisma.prescription.update({
      where: { id },
      data: { status: "USED" },
    });

    return res.json({ message: "Receita dispensada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao dispensar receita:", error);
    return res.status(500).json({ error: "Erro ao dispensar receita" });
  }
}

/*
Médico revoga receita — somente DOCTOR dono da receita
*/
export async function revoke(req: Request, res: Response) {
  const { id } = req.params;
  const doctorId = (req as any).user?.id;

  try {
    const prescription = await prisma.prescription.findUnique({ where: { id } });

    if (!prescription) {
      return res.status(404).json({ error: "Receita não encontrada" });
    }
    if (prescription.doctorId !== doctorId) {
      return res.status(403).json({ error: "Você não é o autor desta receita" });
    }
    if (prescription.status !== "ACTIVE") {
      return res.status(400).json({ error: `Receita não pode ser revogada. Status atual: ${prescription.status}` });
    }

    await revokePrescription(id);

    await prisma.prescription.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    return res.json({ message: "Receita revogada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao revogar receita:", error);
    return res.status(500).json({ error: "Erro ao revogar receita" });
  }
}

/*
Histórico do médico — somente DOCTOR (RF04)
*/
export async function doctorHistory(req: Request, res: Response) {
  const doctorId = (req as any).user?.id;

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        patient: true,
        medication: true,
        dosage: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({ prescriptions });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return res.status(500).json({ error: "Erro ao buscar histórico" });
  }
}

/*
Histórico do farmacêutico — receitas ACTIVE disponíveis para dispensar (RF04)
*/
export async function pharmacyHistory(req: Request, res: Response) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        patient: true,
        medication: true,
        dosage: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({ prescriptions });
  } catch (error: any) {
    console.error("Erro ao buscar receitas:", error);
    return res.status(500).json({ error: "Erro ao buscar receitas" });
  }
}



export async function pharmacyDispensed(req: Request, res: Response) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: "USED" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        patient: true,
        medication: true,
        dosage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ prescriptions });
  } catch (error: any) {
    console.error("Erro ao buscar dispensações:", error);
    return res.status(500).json({ error: "Erro ao buscar dispensações" });
  }
}
