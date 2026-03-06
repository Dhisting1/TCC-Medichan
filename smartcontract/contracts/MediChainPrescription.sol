pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract MediChainPrescription is AccessControl {

    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");

    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    enum Status {
        NONE,
        ACTIVE,
        USED,
        REVOKED
    }

    struct Prescription {

        bytes32 ipfsHash;

        address doctor;

        uint256 createdAt;

        Status status;
    }

    mapping(bytes32 => Prescription) private prescriptions;

    event PrescriptionCreated(bytes32 indexed id, address indexed doctor);

    event PrescriptionUsed(bytes32 indexed id, address indexed pharmacy);

    event PrescriptionRevoked(bytes32 indexed id);

    constructor(address backendWallet) {

        _grantRole(DEFAULT_ADMIN_ROLE, backendWallet);

    }

    function registerDoctor(address doctor)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(DOCTOR_ROLE, doctor);
    }

    function registerPharmacy(address pharmacy)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(PHARMACY_ROLE, pharmacy);
    }

    function createPrescription(
        bytes32 id,
        bytes32 ipfsHash
    )
        public
        onlyRole(DOCTOR_ROLE)
    {

        require(
            prescriptions[id].createdAt == 0,
            "Prescription already exists"
        );

        prescriptions[id] = Prescription({

            ipfsHash: ipfsHash,
            doctor: msg.sender,
            createdAt: block.timestamp,
            status: Status.ACTIVE

        });

        emit PrescriptionCreated(id, msg.sender);
    }

    function markAsUsed(bytes32 id)
        public
        onlyRole(PHARMACY_ROLE)
    {

        require(
            prescriptions[id].status == Status.ACTIVE,
            "Invalid status"
        );

        prescriptions[id].status = Status.USED;

        emit PrescriptionUsed(id, msg.sender);
    }

    function revokePrescription(bytes32 id)
        public
        onlyRole(DOCTOR_ROLE)
    {

        require(
            prescriptions[id].doctor == msg.sender,
            "Not prescription owner"
        );

        prescriptions[id].status = Status.REVOKED;

        emit PrescriptionRevoked(id);
    }

    function getPrescription(bytes32 id)
        public
        view
        returns (
            bytes32 ipfsHash,
            address doctor,
            uint256 createdAt,
            Status status
        )
    {
        Prescription memory p = prescriptions[id];

        return (
            p.ipfsHash,
            p.doctor,
            p.createdAt,
            p.status
        );
    }
}