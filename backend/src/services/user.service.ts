import { prisma } from "../config/database";

export async function createUser(data: any) {
  return await prisma.user.create({
    data,
  });
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function updateRole(userId: string, role: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
