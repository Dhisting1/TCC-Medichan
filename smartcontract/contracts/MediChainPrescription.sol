// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Importa biblioteca da OpenZeppelin para controle de permissões (roles)
import "@openzeppelin/contracts/access/AccessControl.sol";

/*
    MediChainPrescription

    Este contrato é responsável por registrar e validar prescrições médicas
    utilizando blockchain. As receitas são armazenadas fora da blockchain
    (IPFS) e apenas o hash do documento é registrado no contrato.

    Roles do sistema:

    DEFAULT_ADMIN_ROLE -> Backend do sistema
    DOCTOR_ROLE        -> Médicos autorizados
    PHARMACY_ROLE      -> Farmácias autorizadas
*/

contract MediChainPrescription is AccessControl {

    // Role que identifica médicos
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");

    // Role que identifica farmácias
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    /*
        Enum que define o estado da prescrição
    */
    enum Status {
        NONE,      // prescrição inexistente
        ACTIVE,    // prescrição válida
        USED,      // prescrição já utilizada
        REVOKED    // prescrição revogada pelo médico
    }

    /*
        Estrutura que representa uma prescrição
    */
    struct Prescription {

        // Hash do arquivo armazenado no IPFS
        bytes32 ipfsHash;

        // endereço da carteira do médico que criou a receita
        address doctor;

        // timestamp da criação da prescrição
        uint256 createdAt;

        // estado atual da prescrição
        Status status;
    }

    /*
        Mapeamento que relaciona um ID da prescrição
        com os dados da prescrição armazenada
    */
    mapping(bytes32 => Prescription) private prescriptions;

    /*
        Eventos emitidos para auditoria e rastreamento
    */

    // emitido quando uma nova prescrição é criada
    event PrescriptionCreated(bytes32 indexed id, address indexed doctor);

    // emitido quando uma prescrição é utilizada na farmácia
    event PrescriptionUsed(bytes32 indexed id, address indexed pharmacy);

    // emitido quando uma prescrição é revogada pelo médico
    event PrescriptionRevoked(bytes32 indexed id);

    /*
        Construtor do contrato

        Recebe o endereço da carteira do backend do sistema.
        O backend será o administrador responsável por registrar
        médicos e farmácias no contrato.
    */
    constructor(address backendWallet) {

        // define o backend como administrador do contrato
        _grantRole(DEFAULT_ADMIN_ROLE, backendWallet);

    }

    // ----------------------------------------------------
    // Funções de gerenciamento de roles
    // ----------------------------------------------------

    /*
        registerDoctor

        Registra um médico no sistema atribuindo a role DOCTOR_ROLE
        ao endereço da carteira do médico.

        Apenas o backend (admin) pode executar esta função.
    */
    function registerDoctor(address doctor)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(DOCTOR_ROLE, doctor);
    }

    /*
        registerPharmacy

        Registra uma farmácia no sistema atribuindo
        a role PHARMACY_ROLE ao endereço informado.

        Apenas o backend pode executar.
    */
    function registerPharmacy(address pharmacy)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(PHARMACY_ROLE, pharmacy);
    }

    // ----------------------------------------------------
    // Funções principais do sistema
    // ----------------------------------------------------

    /*
        createPrescription

        Permite que um médico registre uma nova prescrição
        na blockchain.

        Parâmetros:
        id        -> identificador único da prescrição
        ipfsHash  -> hash do arquivo da receita armazenado no IPFS
    */
    function createPrescription(
        bytes32 id,
        bytes32 ipfsHash
    )
        public
        onlyRole(DOCTOR_ROLE)
    {

        // impede duplicação de prescrição
        require(
            prescriptions[id].createdAt == 0,
            "Prescription already exists"
        );

        // registra a prescrição
        prescriptions[id] = Prescription({

            ipfsHash: ipfsHash,
            doctor: msg.sender,
            createdAt: block.timestamp,
            status: Status.ACTIVE

        });

        // emite evento
        emit PrescriptionCreated(id, msg.sender);
    }

    /*
        markAsUsed

        Permite que uma farmácia marque a prescrição
        como utilizada após dispensar o medicamento.

        Apenas farmácias autorizadas podem executar.
    */
    function markAsUsed(bytes32 id)
        public
        onlyRole(PHARMACY_ROLE)
    {

        // garante que a prescrição ainda está ativa
        require(
            prescriptions[id].status == Status.ACTIVE,
            "Invalid status"
        );

        // altera o estado da prescrição
        prescriptions[id].status = Status.USED;

        // registra evento
        emit PrescriptionUsed(id, msg.sender);
    }

    /*
        revokePrescription

        Permite que o médico que criou a prescrição
        possa revogá-la.

        Isso pode ocorrer em casos de erro ou cancelamento.
    */
    function revokePrescription(bytes32 id)
        public
        onlyRole(DOCTOR_ROLE)
    {

        // garante que somente o médico criador pode revogar
        require(
            prescriptions[id].doctor == msg.sender,
            "Not prescription owner"
        );

        prescriptions[id].status = Status.REVOKED;

        emit PrescriptionRevoked(id);
    }

    // ----------------------------------------------------
    // Função de consulta
    // ----------------------------------------------------

    /*
        getPrescription

        Permite consultar os dados de uma prescrição
        registrada no contrato.

        Retorna:

        ipfsHash  -> hash do documento no IPFS
        doctor    -> endereço do médico
        createdAt -> timestamp de criação
        status    -> estado da prescrição
    */
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