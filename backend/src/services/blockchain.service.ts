import { contract } from "../config/blockchain";
import { redis } from "../config/redis";

/*
Registra um médico na blockchain
Somente ADMIN pode executar
*/
export async function registerDoctor(wallet: string) {
  const tx = await contract.registerDoctor(wallet);

  await tx.wait();
}

/*
Registra uma farmácia na blockchain
Somente ADMIN pode executar
*/
export async function registerPharmacy(wallet: string) {
  const tx = await contract.registerPharmacy(wallet);

  await tx.wait();
}

/*
Cria uma receita médica na blockchain
Somente médicos podem executar
*/
export async function createPrescription(id: string, ipfsHash: string) {
  const tx = await contract.createPrescription(id, ipfsHash);

  await tx.wait();

  return tx.hash;
}

/*
Farmácia marca receita como usada
*/
export async function markPrescriptionUsed(id: string) {
  const tx = await contract.markAsUsed(id);

  await tx.wait();
}

/*
Busca receita na blockchain com cache Redis
*/
export async function getPrescription(id: string) {
  const cached = await redis.get(id);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await contract.getPrescription(id);

  await redis.set(id, JSON.stringify(data), {
    EX: 60,
  });

  return data;
}

/*
Consulta status da receita
*/
export async function getPrescriptionStatus(id: string) {
  try {
    const prescription = await contract.getPrescription(id);

    const status = Number(prescription.status);

    return {
      exists: status !== 0,
      used: status === 2,
      revoked: status === 3,
    };
  } catch {
    return {
      exists: false,
    };
  }
}
