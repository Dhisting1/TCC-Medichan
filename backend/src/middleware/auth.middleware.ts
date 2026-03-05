import jwt from "jsonwebtoken";

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
