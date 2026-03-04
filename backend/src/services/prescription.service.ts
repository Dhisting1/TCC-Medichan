import { ethers } from "ethers";
import { contract } from "../config/blockchain";

export async function registerPrescription(
  prescriptionId: string,
  content: string,
) {
  const id = ethers.keccak256(ethers.toUtf8Bytes(prescriptionId));

  const hash = ethers.keccak256(ethers.toUtf8Bytes(content));

  const tx = await contract.registerPrescription(id, hash);

  await tx.wait();

  return {
    transaction: tx.hash,
    prescriptionId: id,
  };
}
