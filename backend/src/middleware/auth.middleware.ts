import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Função middleware para autenticação. Verifica se o token JWT é válido e decodifica as informações do usuário.
// Retorna 401 se não tem token
export function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(
      //Validador de assinatura
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET!,
    );

    req.user = decoded; //Anexa o usuário criptografado a requisição

    next(); //Chamada do next() passa a requisição pra frente.
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
    const userRole = req.user?.role; // Acessa o role do usuário autenticado

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        // Acesso negado se o usuário não tiver o role exigido
        error: `Acesso negado. Requerido: ${roles.join(" ou ")}`,
      });
    }

    next();
  };
}
