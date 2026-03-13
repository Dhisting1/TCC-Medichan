import { Router } from "express";
import { listUsers, verifyDoctor, verifyPharmacy } from "../controllers/user.controller";
import { auth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// listar todos os usuários — somente ADMIN
router.get("/", auth, requireRole("ADMIN"), listUsers);

router.post("/verify-doctor", auth, requireRole("ADMIN"), verifyDoctor);
router.post("/verify-pharmacy", auth, requireRole("ADMIN"), verifyPharmacy);

export default router;
