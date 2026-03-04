import { expect } from "chai";
import { ethers } from "hardhat";

describe("MediChainPrescription", function () {
  it("should register a prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2026-0001"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("conteudo da receita"));

    await contract.connect(doctor).registerPrescription(id, hash);

    const result = await contract.getPrescription(id);

    expect(result[0]).to.equal(hash);
    expect(result[1]).to.equal(doctor.address);
  });

  it("should not allow duplicate prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2026-0002"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("conteudo"));

    await contract.connect(doctor).registerPrescription(id, hash);

    await expect(contract.connect(doctor).registerPrescription(id, hash)).to.be
      .reverted;
  });

  it("should allow pharmacy to mark prescription as used", async function () {
    const [admin, doctor, pharmacy] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2026-0003"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("conteudo"));

    await contract.connect(doctor).registerPrescription(id, hash);

    await contract.connect(admin).grantPharmacy(pharmacy.address);

    await contract.connect(pharmacy).markAsUsed(id);

    const result = await contract.getPrescription(id);

    expect(result[3]).to.equal(2); // USED
  });

  it("should not allow non pharmacy to mark as used", async function () {
    const [admin, doctor, attacker] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2026-0004"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("conteudo"));

    await contract.connect(doctor).registerPrescription(id, hash);

    await expect(contract.connect(attacker).markAsUsed(id)).to.be.reverted;
  });

  it("should allow doctor to revoke prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2026-0005"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("conteudo"));

    await contract.connect(doctor).registerPrescription(id, hash);

    await contract.connect(doctor).revokePrescription(id);

    const result = await contract.getPrescription(id);

    expect(result[3]).to.equal(3); // REVOKED
  });
});
