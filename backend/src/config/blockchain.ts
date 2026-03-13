import { ethers } from "ethers";
import artifact from "../../../smartcontract/artifacts/contracts/MediChainPrescription.sol/MediChainPrescription.json";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  artifact.abi,
  wallet,
);
