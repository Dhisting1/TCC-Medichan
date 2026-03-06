import { Router } from "express";
import { verifyDoctor, verifyPharmacy } from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.post("/verify-doctor", auth, verifyDoctor);
router.post("/verify-pharmacy", auth, verifyPharmacy);

export default router;
