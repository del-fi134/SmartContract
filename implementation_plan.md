# Descripción del Objetivo
Completar la Prueba de Concepto (PoC) de Herencia Digital Segura implementando completamente la integración entre el frontend de Next.js y el Smart Contract. El código actual tiene implementaciones parciales (por ejemplo, [WalletContext](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/WalletContext.tsx#19-32) existe pero usa datos simulados y no maneja aprobaciones de USDC o eventos). Completaremos las Fases 1 a 4 como se describe en el plan proporcionado en Gemini.

## Requiere Revisión del Usuario
> [!IMPORTANT]
> El ABI de tu contrato compilado (de Remix o Hardhat) es obligatorio. Necesitaré que me proporciones el JSON del ABI o el archivo [.json](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/package.json) compilado de tu entorno de desarrollo.
> También necesitamos determinar si estamos desplegando una versión simulada de un ERC20 para USDC o usando una dirección específica en la red de pruebas (testnet) para USDC.

## Cambios Propuestos

---

### Fase 1: El "Puente" Técnico (ABI y Tipos)
Necesitamos actualizar los componentes principales de conexión para eliminar los datos simulados y conectarse adecuadamente al contrato real.

#### [NUEVO] `abi.json`
Crear un nuevo archivo en `frontend/src/constants/abi.json` y pegar el ABI del contrato desplegado.

#### [MODIFICAR] [frontend/src/lib/contract.ts](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/lib/contract.ts)
- Actualizar `CONTRACT_ADDRESS` a la dirección desplegada.
- Importar el ABI desde el nuevo archivo JSON en lugar del array estático.
- Actualizar los tipos para usar `BigInt` correctamente y reflejar los retornos reales del contrato.

#### [MODIFICAR] [frontend/src/components/WalletContext.tsx](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/WalletContext.tsx)
- Refinar la instanciación de `new Contract()` para usar el ABI preciso.
- Forzar la verificación de la red (asegurar que es Avalanche Fuji Testnet).

---

### Fase 2: Estados Dinámicos de la UI y Aprobaciones
Actualizar los botones y la interfaz para reflejar correctamente los estados de la blockchain en lugar de depender puramente de la lógica de temporizadores (setInterval) del frontend.

#### [MODIFICAR] [frontend/src/components/ProofOfLifeCard.tsx](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/ProofOfLifeCard.tsx)
- Asegurar que el botón "Sigo Vivo" esté deshabilitado si la billetera conectada **no** es la del propietario (owner).
- Manejar adecuadamente las actualizaciones de estado.

#### [MODIFICAR] [frontend/src/components/InheritanceCard.tsx](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/InheritanceCard.tsx)
- Asegurar que el botón "Ejecutar Herencia" esté deshabilitado si:
  - El contador es > 0.
  - La billetera conectada **no** es la del beneficiario (heir).
- **Flujo de USDC**: Integrar un flujo de Aprobación (`Approve`). El contrato necesita permiso para mover el token ERC20 (USDC) del saldo del propietario, o validar el saldo disponible.

#### [MODIFICAR] [frontend/src/components/StatusHeader.tsx](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/StatusHeader.tsx) (o equivalente)
- Implementar indicadores de estado de carga (skeletons/spinners) mientras se obtienen datos del RPC o se envían transacciones.

---

### Fases 3 y 4: Transacciones, Feedback y Casos de Borde
Mejorar la robustez y la respuesta al usuario durante las interacciones con la blockchain.

#### [MODIFICAR] [frontend/src/components/WalletContext.tsx](file:///home/mnavarro/Documents/workspace/www/web3/herenciaDigitalSegura/SmartContract/frontend/src/components/WalletContext.tsx)
- Escuchar eventos del smart contract (por ejemplo, `Pinged()`, `InheritanceExecuted()`) para actualizar automáticamente la interfaz sin necesidad de recargar la página.
- Verificar el saldo de USDC antes de permitir la ejecución para manejar el escenario de "Saldo insuficiente" con elegancia.

## Plan de Verificación
### Verificación Manual y Automatizada
1. Abrir la aplicación y conectar MetaMask.
2. Comprobar que la app solicita cambiar a la red Avalanche Fuji Testnet.
3. Iniciar sesión como propietario y verificar que el botón "Sigo Vivo" funciona y actualiza el temporizador instantáneamente vía la escucha de eventos.
4. Iniciar sesión como alguien ajeno al contrato y verificar que el botón "Sigo Vivo" esté deshabilitado.
5. Avanzar el tiempo (en el contrato si es posible mediante pruebas, o esperar) y comprobar que el beneficiario puede ejecutar la herencia.
6. Intentar ejecutar la herencia de forma prematura como beneficiario y confirmar que la UI lo previene.
