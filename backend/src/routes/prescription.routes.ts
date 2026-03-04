import { Router } from "express";
import { registerPrescription } from "../services/prescription.service";

const router = Router();

router.post("/", async (req, res) => {
  const { prescriptionId, content } = req.body;

  const result = await registerPrescription(prescriptionId, content);

  res.json(result);
});

export default router;
