import { Router } from "express";
import { verifyDoctor, verifyPharmacy } from "../controllers/user.controller";

const router = Router();

router.post("/verify-doctor", verifyDoctor);
router.post("/verify-pharmacy", verifyPharmacy);

export default router;
