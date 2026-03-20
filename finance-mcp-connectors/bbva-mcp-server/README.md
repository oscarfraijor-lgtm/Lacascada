# BBVA MCP Server

Servidor MCP (Model Context Protocol) para integración con BBVA Open Banking API - México.

## Características

- ✅ Obtener saldos de cuentas en tiempo real
- ✅ Consultar transacciones por rango de fechas
- ✅ Listar todas las cuentas disponibles
- ✅ Obtener saldos de fin de día
- ✅ Autenticación OAuth2 automática
- ✅ Soporte para sandbox y producción

## Requisitos Previos

1. Node.js 18+ instalado
2. Cuenta en BBVA API Market
3. Credenciales API de BBVA

## Instalación

### Paso 1: Instalar dependencias

```bash
cd /Users/apkuzz/CascadeProjects/finance-mcp-connectors/bbva-mcp-server
npm install
```

### Paso 2: Obtener Credenciales de BBVA

1. Ve a https://www.bbvaapimarket.com/
2. Crea una cuenta o inicia sesión
3. Ve a "My Apps" → "Create New App"
4. Selecciona las APIs que necesitas:
   - **Business Accounts** (Cuentas empresariales)
   - **Intraday Balances and Transactions** (Saldos y transacciones intraday)
   - **End-of-Day Balances and Transactions** (Saldos y transacciones fin de día)
5. Copia tus credenciales:
   - API Key
   - Client ID
   - Client Secret

### Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales:

```env
BBVA_API_KEY=tu_api_key_aqui
BBVA_CLIENT_ID=tu_client_id_aqui
BBVA_CLIENT_SECRET=tu_client_secret_aqui
BBVA_ENVIRONMENT=sandbox
```

**Importante:** Empieza con `sandbox` para pruebas. Cambia a `production` cuando estés listo.

### Paso 4: Compilar el Proyecto

```bash
npm run build
```

### Paso 5: Probar el Servidor

```bash
npm start
```

Si ves "BBVA MCP Server iniciado correctamente", ¡funciona! 🎉

## Integración con Windsurf

### Actualizar .mcp.json

Edita `/Users/apkuzz/Desktop/Windsurf/knowledge-work-plugins/finance/.mcp.json`:

```json
{
  "mcpServers": {
    "bbva": {
      "command": "node",
      "args": [
        "/Users/apkuzz/CascadeProjects/finance-mcp-connectors/bbva-mcp-server/dist/index.js"
      ],
      "env": {
        "BBVA_API_KEY": "${BBVA_API_KEY}",
        "BBVA_CLIENT_ID": "${BBVA_CLIENT_ID}",
        "BBVA_CLIENT_SECRET": "${BBVA_CLIENT_SECRET}",
        "BBVA_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

### Agregar Variables al .env de Windsurf

Crea o edita `/Users/apkuzz/Desktop/Windsurf/.env`:

```env
BBVA_API_KEY=tu_api_key_aqui
BBVA_CLIENT_ID=tu_client_id_aqui
BBVA_CLIENT_SECRET=tu_client_secret_aqui
```

## Uso con Claude/Cascade

Una vez configurado, puedes usar estos comandos:

### Obtener Saldo de Cuenta

```
/reconciliation cash 2025-03
```

Yo automáticamente llamaré a `get_account_balance` para obtener el saldo de BBVA.

### Generar Estado de Resultados

```
/income-statement monthly 2025-03
```

Yo jalaré los datos de transacciones de BBVA automáticamente.

### Conciliación Bancaria

```
Dame la conciliación bancaria de marzo 2025
```

Yo compararé los saldos de QuickBooks vs BBVA automáticamente.

## Herramientas Disponibles

### 1. `get_account_balance`
Obtiene el saldo actual de una cuenta.

**Parámetros:**
- `accountId` (string): ID de la cuenta

**Ejemplo de respuesta:**
```json
{
  "accountId": "123456789",
  "balance": 150000.50,
  "currency": "MXN",
  "availableBalance": 145000.50,
  "timestamp": "2025-03-19T16:30:00Z"
}
```

### 2. `get_account_transactions`
Obtiene transacciones en un rango de fechas.

**Parámetros:**
- `accountId` (string): ID de la cuenta
- `startDate` (string): Fecha inicio (YYYY-MM-DD)
- `endDate` (string): Fecha fin (YYYY-MM-DD)

**Ejemplo de respuesta:**
```json
[
  {
    "id": "tx_001",
    "date": "2025-03-15",
    "description": "Pago cliente ABC",
    "amount": 25000.00,
    "currency": "MXN",
    "type": "credit",
    "balance": 150000.50
  }
]
```

### 3. `list_accounts`
Lista todas las cuentas disponibles.

**Ejemplo de respuesta:**
```json
[
  {
    "id": "123456789",
    "name": "Cuenta Empresarial Principal",
    "type": "checking",
    "currency": "MXN",
    "status": "active"
  }
]
```

### 4. `get_end_of_day_balance`
Obtiene el saldo de fin de día.

**Parámetros:**
- `accountId` (string): ID de la cuenta
- `date` (string): Fecha (YYYY-MM-DD)

## Troubleshooting

### Error: "BBVA_API_KEY no está configurada"
- Verifica que `.env` existe y tiene las credenciales correctas
- Asegúrate de que no hay espacios extra en las variables

### Error de autenticación
- Verifica que tus credenciales son correctas en BBVA API Market
- Confirma que estás usando el environment correcto (sandbox vs production)
- Revisa que tu app en BBVA API Market tiene las APIs necesarias habilitadas

### No se encuentran cuentas
- En sandbox, BBVA proporciona cuentas de prueba
- Consulta la documentación de BBVA para obtener IDs de cuentas de prueba
- En production, necesitas vincular tus cuentas reales

## Próximos Pasos

1. ✅ BBVA conectado
2. ⏳ Conectar Savio (Cuentas por Cobrar)
3. ⏳ Conectar QuickBooks (Contabilidad General)
4. ⏳ Crear dashboards financieros automáticos

## Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica la documentación de BBVA: https://www.bbvaapimarket.com/en/api-developers/
3. Pregúntame directamente en el chat

## Licencia

MIT
