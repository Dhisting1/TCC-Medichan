import { ethers } from "hardhat";

async function main() {
  // recupera as contas disponíveis no Hardhat
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  // mostra o saldo da conta que fará o deploy
  const balance = await deployer.provider.getBalance(deployer.address);

  console.log("Account balance:", ethers.formatEther(balance));

  /*
    cria a factory do contrato
    a factory é usada para implantar novas instâncias do contrato
  */
  const Contract = await ethers.getContractFactory("MediChainPrescription");

  /*
    faz o deploy do contrato

    o endereço passado no construtor será o
    DEFAULT_ADMIN_ROLE do contrato

    no nosso caso esse endereço será o backend
  */
  const contract = await Contract.deploy(deployer.address);

  // aguarda a confirmação da implantação
  await contract.waitForDeployment();

  // obtém o endereço final do contrato
  const address = await contract.getAddress();

  console.log("MediChainPrescription deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
