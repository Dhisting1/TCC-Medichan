import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const contractAddress = "0x5b8B38E5F57a88FfaF01fcc6A83c26f34621F4c1";

const abi = [
  "function registerPrescription(bytes32 id, bytes32 contentHash)",
  "function getPrescription(bytes32 id) view returns (bytes32,address,uint256,uint8)",
  "function markAsUsed(bytes32 id)",
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

export { contract };
