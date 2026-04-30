// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @dev Interfaz para interactuar con tokens ERC20 (como USDC, USDT o WAVAX).
 * Permite que este contrato consulte saldos y mueva fondos autorizados.
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract HerenciaDigitalSegura {
    // --- Variables de Estado ---
    address public owner;              // El dueño de los fondos (tú)
    address public beneficiario;       // La billetera que recibirá la herencia
    address public tokenContract;      // El contrato del token que se va a heredar (ej. USDC)
    
    uint256 public ultimaSenalDeVida;  // Timestamp de la última vez que el dueño hizo "clic"
    uint256 public constant PLAZO_DEMO = 5 minutes; // Tiempo de espera para el PoC
    
    bool private locked;               // Flag para prevenir ataques de reentrada (Reentrancy Guard)

    // --- Eventos (Para que el Frontend sepa qué pasó) ---
    event SenalRecibida(uint256 fecha);
    event HerenciaEjecutada(uint256 monto);

    // --- Modificadores (Seguridad) ---
    
    // Solo permite que el dueño ejecute la función
    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado: No eres el dueno");
        _;
    }

    // Bloquea el contrato mientras se ejecuta una transferencia para evitar hackeos
    modifier noReentrant() {
        require(!locked, "Reentrancy detectada: Intento de hackeo bloqueado");
        locked = true;
        _;
        locked = false;
    }

    /**
     * @dev Constructor: Se ejecuta una sola vez al desplegar el contrato.
     * @param _tokenContract Dirección del token a heredar.
     * @param _beneficiario Dirección de quien recibirá los fondos.
     */
    constructor(address _tokenContract, address _beneficiario) {
        // Validación: Evita que se quemen fondos enviándolos a la dirección 0x0
        require(_tokenContract != address(0) && _beneficiario != address(0), "Direccion cero no permitida");
        
        owner = msg.sender;             // Quien despliega el contrato es el dueño
        beneficiario = _beneficiario;
        tokenContract = _tokenContract;
        ultimaSenalDeVida = block.timestamp; // Inicializa el reloj
    }

    /**
     * @dev El "Botón de Vida". El dueño debe llamarlo periódicamente.
     * Reinicia el conteo de los 5 minutos.
     */
    function estoyVivo() external onlyOwner {
        ultimaSenalDeVida = block.timestamp;
        emit SenalRecibida(block.timestamp);
    }

    /**
     * @dev Función principal. La llama el BENEFICIARIO tras el tiempo de espera.
     * @param monto Cantidad de tokens a transferir.
     */
    function ejecutarHerencia(uint256 monto) external noReentrant {
        // --- 1. Verificaciones (Checks) ---
        require(msg.sender == beneficiario, "Solo el beneficiario puede reclamar");
        require(block.timestamp >= ultimaSenalDeVida + PLAZO_DEMO, "El dueno sigue activo: Plazo no vencido");
        require(monto > 0, "El monto debe ser mayor a cero");

        IERC20 token = IERC20(tokenContract);
        
        // Verificamos si el dueño tiene los fondos y si nos dio permiso (Allowance)
        // Esto evita fallos inesperados y ahorra gas al beneficiario
        uint256 saldoDisponible = token.balanceOf(owner);
        uint256 permisoOtorgado = token.allowance(owner, address(this));
        
        require(saldoDisponible >= monto, "El dueno ya no tiene suficientes fondos en su wallet");
        require(permisoOtorgado >= monto, "El contrato no tiene permiso para mover esa cantidad");

        // --- 2. Efectos Internos (Effects) ---
        // Actualizamos el estado ANTES de mover el dinero para evitar ataques
        ultimaSenalDeVida = block.timestamp; 

        // --- 3. Interacciones Externas (Interactions) ---
        // Intentamos mover los tokens de la wallet del dueño a la del beneficiario
        bool exito = token.transferFrom(owner, beneficiario, monto);
        require(exito, "La transferencia de tokens fallo en la red");
        
        emit HerenciaEjecutada(monto);
    }

    /**
     * @dev Función de utilidad para que el Frontend muestre un contador.
     */
    function tiempoRestante() public view returns (uint256) {
        uint256 tiempoExpiracion = ultimaSenalDeVida + PLAZO_DEMO;
        if (block.timestamp >= tiempoExpiracion) return 0;
        return tiempoExpiracion - block.timestamp;
    }
}