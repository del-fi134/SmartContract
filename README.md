# 🛡️ Herencia Digital Segura

Bienvenido al repositorio de **Herencia Digital Segura**, una dApp (Aplicación Descentralizada) diseñada para fungir como un testamento digital automatizado en la blockchain, permitiendo que un beneficiario reclame activos si el propietario original deja de dar señales de vida.

---

## 🏗️ Arquitectura del Proyecto

El proyecto es un monorepo que contiene tanto el Frontend (Next.js) como el entorno de los Contratos Inteligentes (futuro Hardhat). 

*   `frontend/`: Contiene la aplicación web construida con **Next.js**, **React**, y **TailwindCSS**.
*   `SmartContract/` (futuro `contracts/`): Contendrá los contratos inteligentes programados en **Solidity** y scripts de despliegue.
*   **Web3:** Usamos `ethers v6` para la conexión de la UI con la Blockchain (Avalanche Fuji Testnet).

---

## 💻 Guía de Inicio Rápido (Setup Local)

Esta guía te ayudará a clonar y levantar el proyecto en tu máquina local para comenzar a desarrollar (Dev B / Dev C).

### 1. Clonar el repositorio y cambiar a la rama de desarrollo
```bash
git clone <URL_DEL_REPOSITORIO>
cd SmartContract

# Cambia a la rama en la que están trabajando
git fetch origin
git checkout feature/nextjs-migration
```

### 2. Instalar Dependencias del Frontend
Todo el entorno de desarrollo actual (tanto interfaz como lógica web) vive dentro de la carpeta `frontend`.
```bash
cd frontend
npm install
```

### 3. Variables de Entorno (`.env.local`)
Crea un archivo `.env.local` dentro de la carpeta `frontend/`. 
Comunícate con el Web3 Lead del equipo para que te pase los valores exactos, pero la estructura base suele ser:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0xTuDireccionDelContrato..."
NEXT_PUBLIC_NETWORK_ID="43113"
```
*(Nota: Nunca comitees el archivo `.env.local` al repositorio).*

### 4. Lanzar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🦊 Pruebas Locales con MetaMask
Para que la aplicación funcione en tu local, necesitarás:
1. Instalar la extensión de **MetaMask** en tu navegador.
2. Añadir la red de pruebas **Avalanche Fuji Testnet** a tu MetaMask.
3. Pedir algunos AVAX falsos en cualquier *faucet* de Avalanche Fuji para pagar comisiones (Gas).
4. El Web3 Lead te indicará qué dirección actuar como "Owner" y cuál como "Beneficiario" para probar los bloqueos y funcionalidades de la interfaz.

---

## 📝 Reglas Básicas del Equipo
*   **Commits descriptivos:** Usa prefijos como `feat:`, `fix:`, `style:`.
*   **Ramas (Branches):** Trabaja siempre en tu rama antes de hacer merge a `main`.
*   **Dudas Web3:** Si algún comportamiento del Smart Contract parece no funcionar, consulta los logs de `[DEBUG]` en la consola del navegador y levántalo con el Web3 Lead.