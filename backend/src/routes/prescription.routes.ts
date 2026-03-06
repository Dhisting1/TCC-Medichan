import { Router } from "express";

import {
  create,
  validate,
  usePrescription,
} from "../controllers/prescription.controller";

const router = Router();

// criar receita
router.post("/", create);

// validar receita
router.get("/validate/:id", validate);

// farmácia usa receita
router.post("/use/:id", usePrescription);

export default router;
