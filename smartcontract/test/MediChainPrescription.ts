import { expect } from "chai";
import { ethers } from "hardhat";

describe("MediChainPrescription", function () {
  it("should register a prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    // registra médico
    await contract.registerDoctor(doctor.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-1"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("ipfsHash"));

    await contract.connect(doctor).createPrescription(id, hash);

    const result = await contract.getPrescription(id);

    expect(result.doctor).to.equal(doctor.address);
  });

  it("should not allow duplicate prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    await contract.registerDoctor(doctor.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-2"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("ipfsHash"));

    await contract.connect(doctor).createPrescription(id, hash);

    await expect(contract.connect(doctor).createPrescription(id, hash)).to.be
      .reverted;
  });

  it("should allow pharmacy to mark prescription as used", async function () {
    const [admin, doctor, pharmacy] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    await contract.registerDoctor(doctor.address);
    await contract.registerPharmacy(pharmacy.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-3"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("ipfsHash"));

    await contract.connect(doctor).createPrescription(id, hash);

    await contract.connect(pharmacy).markAsUsed(id);

    const result = await contract.getPrescription(id);

    expect(result.status).to.equal(2); // USED
  });

  it("should not allow non pharmacy to mark as used", async function () {
    const [admin, doctor, attacker] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    await contract.registerDoctor(doctor.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-4"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("ipfsHash"));

    await contract.connect(doctor).createPrescription(id, hash);

    await expect(contract.connect(attacker).markAsUsed(id)).to.be.reverted;
  });

  it("should allow doctor to revoke prescription", async function () {
    const [admin, doctor] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MediChainPrescription");
    const contract = await Contract.deploy(admin.address);

    await contract.registerDoctor(doctor.address);

    const id = ethers.keccak256(ethers.toUtf8Bytes("RX-5"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("ipfsHash"));

    await contract.connect(doctor).createPrescription(id, hash);

    await contract.connect(doctor).revokePrescription(id);

    const result = await contract.getPrescription(id);

    expect(result.status).to.equal(3); // REVOKED
  });
});
