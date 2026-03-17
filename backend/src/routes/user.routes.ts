import { Router } from "express";
import { listUsers, deleteUser, searchPatient, verifyDoctor, verifyPharmacy } from "../controllers/user.controller";
import { auth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// listar usuários — ADMIN
router.get("/", auth, requireRole("ADMIN"), listUsers);

// excluir usuário — ADMIN
router.delete("/:id", auth, requireRole("ADMIN"), deleteUser);

// buscar paciente por email ou CPF — DOCTOR e PHARMACY
router.get("/search", auth, requireRole("DOCTOR", "PHARMACY"), searchPatient);

// aprovar médico/farmácia — ADMIN
router.post("/verify-doctor",   auth, requireRole("ADMIN"), verifyDoctor);
router.post("/verify-pharmacy", auth, requireRole("ADMIN"), verifyPharmacy);

export default router;
