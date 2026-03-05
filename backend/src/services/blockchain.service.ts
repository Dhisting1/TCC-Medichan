import { contract } from "../config/blockchain";

export async function registerDoctor(wallet: string) {
  const tx = await contract.registerDoctor(wallet);

  await tx.wait();
}

export async function registerPharmacy(wallet: string) {
  const tx = await contract.registerPharmacy(wallet);

  await tx.wait();
}

export async function createPrescription(id: string, hash: string) {
  const tx = await contract.createPrescription(id, hash);

  await tx.wait();
}

export async function markPrescriptionUsed(id: string) {
  const tx = await contract.markAsUsed(id);

  await tx.wait();
}
