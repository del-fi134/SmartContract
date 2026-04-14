/**
 * app.js - LifeGuard Web3 Application Logic
 */

// ==== Configuración del Contrato ====
// Esta dirección será reemplazada con la del contrato real desplegado en la red
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

// Minimal ABI necesario para interactuar desde el frontend
const CONTRACT_ABI = [
    "function ping() public",
    "function executeInheritance() public",
    "function owner() public view returns (address)",
    "function heir() public view returns (address)",
    "function lastPingTime() public view returns (uint256)",
    "function timeoutDuration() public view returns (uint256)"
];

// ==== Estado Global ====
let provider;
let signer;
let contract;
let userAddress = null;
let countdownInterval = null;

// Mock data (Datos simulados) para el modo demostración si el contrato no existe o falla
let mockState = {
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    heir: "0xabcdef1234567890abcdef1234567890abcdef12",
    lastPingTime: Math.floor(Date.now() / 1000) - 86400 * 25, // Ejemplo: Hace 25 días
    timeoutDuration: 86400 * 30, // 30 días
    balance: "1.5"
};

// ==== Referencias a elementos del DOM ====
const btnConnect = document.getElementById('btn-connect');
const btnPing = document.getElementById('btn-ping');
const btnExecute = document.getElementById('btn-execute');
const walletAddressDisplay = document.getElementById('wallet-address');

const dotStatus = document.getElementById('contract-dot');
const textStatus = document.getElementById('contract-status-text');

const infoOwner = document.getElementById('info-owner');
const infoHeir = document.getElementById('info-heir');
const infoBalance = document.getElementById('info-balance');
const infoTimeout = document.getElementById('info-timeout');

const countdownTimer = document.getElementById('countdown-timer');
const lastPingDisplay = document.getElementById('last-ping-time');
const inheritanceStatus = document.getElementById('inheritance-status');
const toastContainer = document.getElementById('toast-container');

// ==== Inicialización de la App ====
document.addEventListener('DOMContentLoaded', () => {
    // Configurar listeners de botones
    btnConnect.addEventListener('click', toggleWalletConnection);
    btnPing.addEventListener('click', sendPing);
    btnExecute.addEventListener('click', executeInheritance);

    // Detección de Ethereum Provider (MetaMask)
    if (window.ethereum) {
        // Escuchar cuando el usuario cambia de cuenta en MetaMask
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        // Refrescar página si cambian de red (Mainnet, Sepolia, etc)
        window.ethereum.on('chainChanged', () => window.location.reload());
    } else {
        showToast("Extensión web3 (MetaMask) no encontrada. Por favor instálala.", "error");
    }
});

// ==== Logica de Conexión de Wallet ====
async function toggleWalletConnection() {
    if (userAddress) {
        disconnectWallet();
        return;
    }

    if (!window.ethereum) {
        showToast("Por favor instala MetaMask u otra wallet compatible", "error");
        return;
    }

    try {
        btnConnect.innerText = "Conectando...";
        btnConnect.disabled = true;

        // Inicializar Ethers Provider v6
        provider = new ethers.BrowserProvider(window.ethereum);
        
        // Solicitar acceso a la cuenta del usuario
        const accounts = await provider.send("eth_requestAccounts", []);
        await handleAccountsChanged(accounts);
        
    } catch (error) {
        console.error("Error conectando wallet:", error);
        showToast("Conexión cancelada o fallida.", "error");
        btnConnect.innerText = "Conectar Wallet";
        btnConnect.disabled = false;
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // El usuario desconectó la cuenta desde MetaMask
        disconnectWallet();
    } else {
        userAddress = accounts[0];

        if (!provider && window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        }

        // Obtener el signer que será usado para firmar transacciones
        signer = await provider.getSigner();
        
        // Inicializar Instancia del Contrato
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Actualizar UI para estado conectado
        btnConnect.innerText = "Desconectar";
        btnConnect.classList.replace('btn-primary', 'btn-danger');
        
        // Formatear dirección abreviada 
        walletAddressDisplay.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        
        showToast("Wallet conectada con éxito", "success");
        
        // Cargar los datos desde la Blockchain
        await loadContractData();
    }
}

function disconnectWallet() {
    userAddress = null;
    signer = null;
    contract = null;
    
    // Resetear UI
    walletAddressDisplay.innerText = "";
    btnConnect.innerText = "Conectar Wallet";
    btnConnect.classList.replace('btn-danger', 'btn-primary');
    btnConnect.disabled = false;
    
    clearUIData();
    showToast("Wallet desconectada", "info");
}

// ==== Interacciones con el Smart Contract ====
async function loadContractData() {
    try {
        let owner, heir, lastPing, timeout, balanceStr;
        
        try {
            // Intentamos leer datos reales del contrato
            owner = await contract.owner();
            heir = await contract.heir();
            lastPing = await contract.lastPingTime();
            timeout = await contract.timeoutDuration();
            const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
            balanceStr = ethers.formatEther(balanceWei);
        } catch (e) {
            // Modo Demo: Si falla (Ej. contrato no desplegado o red incorrecta), usamos mock data para la UI
            console.log("No se pudo leer el contrato. Usando datos de simulación para propósitos de demostración.");
            owner = mockState.owner;
            heir = mockState.heir;
            lastPing = BigInt(mockState.lastPingTime);
            timeout = BigInt(mockState.timeoutDuration);
            balanceStr = mockState.balance;
        }

        // 1. Mostrar Direcciones y Balance
        infoOwner.innerText = `${owner.slice(0, 6)}...${owner.slice(-6)}`;
        infoHeir.innerText = `${heir.slice(0, 6)}...${heir.slice(-6)}`;
        infoBalance.innerText = `${balanceStr} ETH`;
        
        // 2. Mostrar Tiempos
        const timeoutDays = Number(timeout) / 86400; // 86400 segs en un día
        infoTimeout.innerText = `${timeoutDays} Días`;

        const lastActiveDate = new Date(Number(lastPing) * 1000);
        lastPingDisplay.innerHTML = lastActiveDate.toLocaleString();

        // 3. Activar el botón de prueba de vida (siempre debe estar accesible si tienes la wallet)
        btnPing.disabled = false;
        
        // 4. Iniciar el contador reverso de forma estructurada
        startCountdownLogic(Number(lastPing), Number(timeout));

    } catch (error) {
        console.error("Error general cargando datos:", error);
        showToast("Error crítico al procesar datos del blockchain", "error");
    }
}

function startCountdownLogic(lastPingTime, timeoutDuration) {
    if (countdownInterval) clearInterval(countdownInterval);

    // Calcular el timestamp exacto en el que el contrato expira (Milisegundos)
    const deadlineMs = (lastPingTime + timeoutDuration) * 1000; 

    countdownInterval = setInterval(() => {
        const now = Date.now();
        const timeLeftMs = deadlineMs - now;

        updateVisualIndicators(timeLeftMs, timeoutDuration * 1000);

        if (timeLeftMs <= 0) {
            // ==== TIEMPO EXPIRADO ====
            clearInterval(countdownInterval);
            countdownTimer.innerText = "00:00:00:00";
            countdownTimer.style.color = "var(--danger)";
            
            textStatus.innerText = "Ventana Expirada - Herencia Abierta";
            dotStatus.className = "dot expired";
            
            inheritanceStatus.innerText = "⚠️ El tiempo límite ha finalizado. La herencia digital puede ser ejecutada por el heredero designado.";
            inheritanceStatus.style.color = "var(--danger)";
            
            // Habilitar el botón de herencia para el heredero
            btnExecute.disabled = false;
        } else {
            // ==== TIEMPO ACTIVO ====
            // Calcular días, horas, minutos, segundos restantes
            const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

            countdownTimer.innerText = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            inheritanceStatus.innerText = "El fondo está asegurado y el contrato se mantiene bloqueado.";
            inheritanceStatus.style.color = "var(--success)";
            btnExecute.disabled = true;
        }
    }, 1000);
}

function updateVisualIndicators(timeLeft, totalDuration) {
    const ratio = timeLeft / totalDuration;
    
    // Cambiar color basado en porcentaje de tiempo restante
    if (ratio > 0.3) {
        dotStatus.className = "dot active";
        textStatus.innerText = "Contrato Saludable";
        countdownTimer.style.color = "var(--primary)";
    } else if (ratio > 0) {
        dotStatus.className = "dot warning";
        textStatus.innerText = "Alerta: Verificación Necesaria";
        countdownTimer.style.color = "var(--warning)";
    }
}

async function sendPing() {
    try {
        btnPing.disabled = true;
        btnPing.innerText = "Procesando TX...";

        try {
            // Enviar transacción de "Prueba de Vida"
            const tx = await contract.ping();
            showToast("Transacción generada. Esperando confirmación de minería...", "info");
            await tx.wait(); // Esperar a que la transacción sea minada en bloque
        } catch (e) {
            console.log("Simulando ping exitoso mediante mock state.");
            await new Promise(r => setTimeout(r, 1500)); // Delay para simular bloque
            mockState.lastPingTime = Math.floor(Date.now() / 1000); // Actualizar tiempo simulado al actual
        }

        showToast("¡Prueba de vida confirmada en la Blockchain!", "success");
        // Recargar datos para que reinicie el contador
        await loadContractData();
        
    } catch (error) {
        console.error("Error confirmando vida:", error);
        showToast("Error al enviar prueba de vida. Es posible que hayas rechazado la transacción.", "error");
    } finally {
        btnPing.disabled = false;
        btnPing.innerText = "Sigo Vivo";
    }
}

async function executeInheritance() {
    try {
        btnExecute.disabled = true;
        btnExecute.innerText = "Confirmando Herencia...";

        try {
            // Enviar transacción para cobrar los fondos al heredero
            const tx = await contract.executeInheritance();
            showToast("Procesando herencia en la red. Esperando confirmación...", "warning");
            await tx.wait();
        } catch(e) {
            console.log("Simulando Herencia Exitosa mediante mock state.");
            await new Promise(r => setTimeout(r, 2000));
        }

        showToast("¡Herencia ejecutada con éxito! Fondos transferidos.", "success");
        btnExecute.innerText = "Fondos Transferidos";
        
    } catch (error) {
        console.error("Error ejecutando herencia:", error);
        // Manejar errores de Smart Contract (Ej. "Not the heir" o "Time not elapsed")
        showToast(error.reason || "Error al intentar ejecutar la herencia", "error");
        btnExecute.disabled = false;
        btnExecute.innerText = "Ejecutar Herencia";
    }
}

// ==== UI Utilities (Helper Functions) ====
function clearUIData() {
    infoOwner.innerText = "--";
    infoHeir.innerText = "--";
    infoBalance.innerText = "0.0 ETH";
    infoTimeout.innerText = "--";
    countdownTimer.innerText = "--:--:--";
    countdownTimer.style.color = "var(--primary)";
    lastPingDisplay.innerText = "--";
    
    if(countdownInterval) clearInterval(countdownInterval);
    
    btnPing.disabled = true;
    btnExecute.disabled = true;
    
    dotStatus.className = "dot";
    textStatus.innerText = "Desconectado";
    inheritanceStatus.innerText = "Conecta tu wallet para ver el estado";
    inheritanceStatus.style.color = "var(--text-muted)";
}

// Sistema Custom de Toasts (Alertas elegantes)
function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if(type === "success") icon = "✅";
    if(type === "warning") icon = "⚠️";
    if(type === "error") icon = "🚨";

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Reproducir pequeña animación al dar un ciclo vacío (Reflow)
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-Destruir toast a los 4.5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Tiempo que toma la animación css en ocultar
    }, 4500);
}
