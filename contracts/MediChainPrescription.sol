// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract MediChainPrescription is AccessControl {

    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    enum Status {
        NONE,
        ACTIVE,
        USED,
        REVOKED
    }

    struct Prescription {
        bytes32 contentHash;
        address doctor;
        uint256 issuedAt;
        Status status;
        address usedBy;
        uint256 usedAt;
    }

    mapping(bytes32 => Prescription) private prescriptions;

    event PrescriptionRegistered(
        bytes32 indexed id,
        address indexed doctor,
        bytes32 contentHash
    );

    event PrescriptionUsed(
        bytes32 indexed id,
        address indexed pharmacy
    );

    event PrescriptionRevoked(
        bytes32 indexed id,
        address indexed doctor
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function registerPrescription(bytes32 id, bytes32 contentHash) external {

        require(id != bytes32(0), "Invalid id");
        require(contentHash != bytes32(0), "Invalid hash");

        Prescription storage p = prescriptions[id];

        require(p.status == Status.NONE, "Already registered");

        prescriptions[id] = Prescription({
            contentHash: contentHash,
            doctor: msg.sender,
            issuedAt: block.timestamp,
            status: Status.ACTIVE,
            usedBy: address(0),
            usedAt: 0
        });

        emit PrescriptionRegistered(id, msg.sender, contentHash);
    }

    function getPrescription(bytes32 id)
        external
        view
        returns (
            bytes32,
            address,
            uint256,
            Status,
            address,
            uint256
        )
    {
        Prescription storage p = prescriptions[id];

        require(p.status != Status.NONE, "Prescription not found");

        return (
            p.contentHash,
            p.doctor,
            p.issuedAt,
            p.status,
            p.usedBy,
            p.usedAt
        );
    }

    function markAsUsed(bytes32 id) external onlyRole(PHARMACY_ROLE) {

        Prescription storage p = prescriptions[id];

        require(p.status == Status.ACTIVE, "Prescription not active");

        p.status = Status.USED;
        p.usedBy = msg.sender;
        p.usedAt = block.timestamp;

        emit PrescriptionUsed(id, msg.sender);
    }

    function revokePrescription(bytes32 id) external {

        Prescription storage p = prescriptions[id];

        require(p.status == Status.ACTIVE, "Prescription not active");
        require(p.doctor == msg.sender, "Only doctor can revoke");

        p.status = Status.REVOKED;

        emit PrescriptionRevoked(id, msg.sender);
    }

    function grantPharmacy(address pharmacy)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(PHARMACY_ROLE, pharmacy);
    }

    function revokePharmacy(address pharmacy)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(PHARMACY_ROLE, pharmacy);
    }
}