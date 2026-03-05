import { Router } from "express";
import { create } from "../controllers/prescription.controller";

const router = Router();

router.post("/", create);

export default router;
