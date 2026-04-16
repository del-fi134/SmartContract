# 🛡️ Herencia Digital Segura

Bienvenido al repositorio de **Herencia Digital Segura**, una dApp (Aplicación Descentralizada) diseñada para fungir como un testamento digital automatizado en la blockchain, permitiendo que un beneficiario reclame activos si el propietario original deja de dar señales de vida.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está compuesto por dos pilares principales:

*   **Smart Contract (Remix IDE):** Toda la lógica de la blockchain fue programada, compilada y desplegada directamente desde [Remix](https://remix.ethereum.org). El puente que une nuestro frontend con la blockchain es el archivo `abi.json`, el cual se extrajo directamente de Remix.
*   **Frontend (Next.js):** Todo el código bajo la carpeta `frontend/`. Esta aplicación web fue construida con **Next.js**, **React**, **TailwindCSS** y usa **ethers v6** para enviar las peticiones al contrato desplegado.

---

## 💻 Guía de Inicio Rápido (Setup Local)

Sigue estos pasos para clonar y levantar el proyecto en tu máquina local.

### 1. Requisitos Previos: Core Wallet
A diferencia de otros proyectos, aquí **utilizamos Core Wallet** (la wallet oficial de Avalanche) en lugar de MetaMask para nuestras pruebas.
1. Instala la extensión **Core Wallet** en tu navegador.
2. Ve a los ajustes de Core Wallet y activa la **Red de Pruebas (Testnet Mode)**. Esto te permitirá conectarte a **Avalanche Fuji Testnet**.
3. Consigue fondos de prueba (AVAX) en el [faucet oficial de Avalanche](https://core.app/tools/testnet-faucet/?subnet=c&token=c) para poder pagar el Gas de las transacciones.

### 2. Clonar y Preparar el Frontend
Abre tu terminal, clona el repositorio y ubícate en la rama de trabajo. Todo el código de la web vive en la carpeta `frontend/`:

```bash
# Cambia a la rama de desarrollo
git fetch origin
git checkout feature/nextjs-migration

# Entra a la carpeta de la app web
cd frontend

# Instala todas las dependencias
npm install
```

### 3. Variables de Entorno (`.env.local`)
Crea un archivo llamado `.env.local` dentro de la carpeta `frontend/`. 
Comunícate directamente con el Web3 Lead del equipo para que te pase las direcciones correctas que debes colocar ahí. La estructura base es:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0xAquiVaLaDireccionDelContrato..."
NEXT_PUBLIC_NETWORK_ID="43113"
```
*(Nota: Nunca comitees el archivo `.env.local` al repositorio por seguridad).*

### 4. Lanzar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`. 
Conecta tu Core Wallet y recuerda tener a mano la cuenta del "Propietario" y la cuenta del "Beneficiario" para probar cómo reacciona y se bloquea la interfaz de usuario.