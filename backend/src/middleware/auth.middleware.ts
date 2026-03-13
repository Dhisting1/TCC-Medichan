import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET!,
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/*
Verifica se o usuário autenticado tem o role exigido pela rota.
Uso: router.post("/", auth, requireRole("DOCTOR"), controller)
*/
export function requireRole(...roles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        error: `Acesso negado. Requerido: ${roles.join(" ou ")}`,
      });
    }

    next();
  };
}
