import { ethers } from "ethers";
import { MEDICHAIN_ABI } from "./abi";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  MEDICHAIN_ABI,
  wallet,
);
