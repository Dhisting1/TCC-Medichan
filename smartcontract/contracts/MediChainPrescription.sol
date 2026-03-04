// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MediChainPrescription
 * @dev Contrato inteligente para gerenciar prescrições médicas de forma segura e descentralizada.
 * Utiliza blockchain para garantir a integridade, rastreabilidade e imutabilidade das prescrições.
 */
contract MediChainPrescription is AccessControl {

    // Define um papel (role) constante para identificar farmácias autorizadas a usar prescrições
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    // Define os possíveis estados de uma prescrição durante seu ciclo de vida
    enum Status {
        NONE,       // Prescrição não foi registrada
        ACTIVE,     // Prescrição foi emitida e está disponível para uso
        USED,       // Prescrição foi utilizada por uma farmácia
        REVOKED     // Prescrição foi revogada pelo médico e não pode mais ser usada
    }

    // Estrutura que armazena todas as informações de uma prescrição
    struct Prescription {
        bytes32 contentHash;    // Hash criptográfico do conteúdo da prescrição (para verificar integridade)
        address doctor;         // Endereço Ethereum do médico que emitiu a prescrição
        uint256 issuedAt;       // Timestamp (data/hora) em que a prescrição foi emitida
        Status status;          // Estado atual da prescrição (ACTIVE, USED, REVOKED, etc.)
        address usedBy;         // Endereço da farmácia que usou a prescrição (null se não foi usada)
        uint256 usedAt;         // Timestamp (data/hora) em que a prescrição foi usada (0 se não foi usada)
    }

    // Mapa que armazena todas as prescrições, indexadas por seu ID (bytes32)
    // Permite buscar rapidamente uma prescrição pelo seu identificador único
    mapping(bytes32 => Prescription) private prescriptions;

    // Evento emitido quando uma nova prescrição é registrada no contrato
    // Permite que aplicações externas monitorem e confirmem o registro de prescrições
    event PrescriptionRegistered(
        bytes32 indexed id,         // ID único da prescrição registrada
        address indexed doctor,     // Endereço do médico que emitiu
        bytes32 contentHash         // Hash do conteúdo da prescrição
    );

    // Evento emitido quando uma prescrição é marcada como usada por uma farmácia
    // Permite rastreamento completo quando a prescrição foi realmente utilizada
    event PrescriptionUsed(
        bytes32 indexed id,         // ID da prescrição que foi usada
        address indexed pharmacy    // Endereço da farmácia que utilizou a prescrição
    );

    // Evento emitido quando uma prescrição é revogada por um médico
    // Permite notificar o sistema que a prescrição não pode mais ser usada
    event PrescriptionRevoked(
        bytes32 indexed id,         // ID da prescrição revogada
        address indexed doctor      // Endereço do médico que revogou
    );

    /**
     * @dev Inicializa o contrato e concede o papel de administrador ao endereço fornecido.
     * O administrador é responsável por gerenciar as permissões de farmácias.
     * @param admin Endereço que receberá o papel de administrador
     */
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /**
     * @dev Registra uma nova prescrição no contrato.
     * Apenas o médico pode chamar esta função para emitir uma prescrição.
     * A prescrição é armazenada com status ACTIVE e pode ser usada por farmácias posteriores.
     * @param id Identificador único da prescrição
     * @param contentHash Hash do conteúdo da prescrição para verificar integridade
     */
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

    /**
     * @dev Recupera os dados de uma prescrição existente.
     * Esta é uma função pública que qualquer pessoa pode consultarfor verificar informações da prescrição.
     * @param id Identificador da prescrição a ser consultada
     * @return contentHash Hash do conteúdo da prescrição
     * @return doctor Endereço do médico que emitiu a prescrição
     * @return issuedAt Timestamp do momento em que a prescrição foi emitida
     * @return status Status atual da prescrição (ACTIVE, USED, REVOKED)
     * @return usedBy Endereço da farmácia que usou a prescrição (se aplicável)
     * @return usedAt Timestamp do momento em que a prescrição foi usada (se aplicável)
     */
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

    /**
     * @dev Marca uma prescrição como usada pela farmácia.
     * Apenas endereços com permissão de farmácia (PHARMACY_ROLE) podem executar esta função.
     * A prescrição deve estar em status ACTIVE para ser marcada como usada.
     * @param id Identificador da prescrição a ser marcada como usada
     */
    function markAsUsed(bytes32 id) external onlyRole(PHARMACY_ROLE) {

        Prescription storage p = prescriptions[id];

        require(p.status == Status.ACTIVE, "Prescription not active");

        p.status = Status.USED;
        p.usedBy = msg.sender;
        p.usedAt = block.timestamp;

        emit PrescriptionUsed(id, msg.sender);
    }

    /**
     * @dev Revoga uma prescrição emitida.
     * Apenas o médico que emitiu a prescrição original pode revogá-la.
     * A prescrição deve estar em status ACTIVE para ser revogada.
     * Uma prescrição revogada não pode mais ser usada pelas farmácias.
     * @param id Identificador da prescrição a ser revogada
     */
    function revokePrescription(bytes32 id) external {

        Prescription storage p = prescriptions[id];

        require(p.status == Status.ACTIVE, "Prescription not active");
        require(p.doctor == msg.sender, "Only doctor can revoke");

        p.status = Status.REVOKED;

        emit PrescriptionRevoked(id, msg.sender);
    }

    /**
     * @dev Concede permissão de farmácia a um endereço.
     * Apenas o administrador pode executar esta função.
     * Após concedida, a farmácia poderá usar as prescrições (chamando markAsUsed).
     * @param pharmacy Endereço da farmácia que receberá as permissões
     */
    function grantPharmacy(address pharmacy)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(PHARMACY_ROLE, pharmacy);
    }

    /**
     * @dev Remove permissão de farmácia de um endereço.
     * Apenas o administrador pode executar esta função.
     * Após revogada, a farmácia não poderá mais usar prescrições.
     * Prescrições já usadas pela farmácia não são afetadas.
     * @param pharmacy Endereço da farmácia que terá suas permissões removidas
     */
    function revokePharmacy(address pharmacy)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(PHARMACY_ROLE, pharmacy);
    }
}