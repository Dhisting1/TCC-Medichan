import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const users: any[] = [];

export async function register(req: Request, res: Response) {
  const { email, password, wallet } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    email,
    password: hash,
    wallet,
    role: "PATIENT",
  };

  users.push(user);

  res.json(user);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
  );

  res.json({ token });
}
