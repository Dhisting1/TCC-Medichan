import { Router } from "express";

import {
  create,
  validate,
  usePrescription,
  revoke,
  doctorHistory,
  pharmacyHistory,
  pharmacyDispensed,
} from "../controllers/prescription.controller";

import { auth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// criar receita — somente DOCTOR
router.post("/", auth, requireRole("DOCTOR"), create);

// validar receita — pública (farmácia escaneia QR sem login)
router.get("/validate/:id", validate);

// farmácia dispensa receita — somente PHARMACY
router.post("/use/:id", auth, requireRole("PHARMACY"), usePrescription);

// médico revoga receita — somente DOCTOR
router.post("/revoke/:id", auth, requireRole("DOCTOR"), revoke);

// histórico do médico — somente DOCTOR (RF04)
router.get("/history/doctor", auth, requireRole("DOCTOR"), doctorHistory);

// receitas disponíveis para farmácia — somente PHARMACY (RF04)
router.get("/history/pharmacy", auth, requireRole("PHARMACY"), pharmacyHistory);

// histórico de dispensações da farmácia — somente PHARMACY
router.get("/history/pharmacy/dispensed", auth, requireRole("PHARMACY"), pharmacyDispensed);

export default router;
