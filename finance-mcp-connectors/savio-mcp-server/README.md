# Savio MCP Server

Servidor MCP (Model Context Protocol) para integración con Savio API - Administración de Cuentas por Cobrar México.

## Características

- ✅ Obtener lista de clientes y sus saldos
- ✅ Consultar facturas (invoices) con filtros
- ✅ Consultar pagos recibidos
- ✅ Generar reporte de antigüedad de saldos (AR Aging)
- ✅ Consultar saldos de cuentas financieras
- ✅ Soporte para sandbox y producción

## Requisitos Previos

1. Node.js 18+ instalado
2. Cuenta activa en Savio.mx
3. API Key de Savio

## Instalación

### Paso 1: Instalar dependencias

```bash
cd /Users/apkuzz/CascadeProjects/finance-mcp-connectors/savio-mcp-server
npm install
```

### Paso 2: Obtener API Key de Savio

Contacta a **nacho@savio.mx** para solicitar tu API Key.

En el email incluye:
- Nombre de tu empresa
- Propósito de uso (integración MCP para análisis financiero)
- Ambiente que necesitas (sandbox para pruebas, production para datos reales)

### Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tu API Key:

```env
SAVIO_API_KEY=tu_api_key_de_savio_aqui
SAVIO_ENVIRONMENT=sandbox
```

### Paso 4: Compilar el Proyecto

```bash
npm run build
```

### Paso 5: Probar el Servidor

```bash
npm start
```

Si ves "Savio MCP Server iniciado correctamente", ¡funciona! 🎉

## Integración con Windsurf

### Actualizar .mcp.json

Edita `/Users/apkuzz/Desktop/Windsurf/knowledge-work-plugins/finance/.mcp.json` y agrega:

```json
{
  "mcpServers": {
    "savio": {
      "command": "node",
      "args": [
        "/Users/apkuzz/CascadeProjects/finance-mcp-connectors/savio-mcp-server/dist/index.js"
      ],
      "env": {
        "SAVIO_API_KEY": "${SAVIO_API_KEY}",
        "SAVIO_ENVIRONMENT": "sandbox"
      }
    },
    "bbva": {
      ...
    }
  }
}
```

### Agregar Variables al .env de Windsurf

Edita `/Users/apkuzz/Desktop/Windsurf/.env`:

```env
SAVIO_API_KEY=tu_api_key_de_savio_aqui
```

## Uso con Claude/Cascade

Una vez configurado:

### Consultar Clientes

```
Muéstrame mis clientes con saldo pendiente
```

### Generar Reporte de Antigüedad

```
Dame el reporte de antigüedad de saldos
```

o

```
/reconciliation ar 2025-03
```

### Consultar Facturas Vencidas

```
Muéstrame las facturas vencidas de marzo
```

## Herramientas Disponibles

### 1. `get_customers`
Obtiene la lista de clientes.

**Parámetros:**
- `limit` (number, opcional): Máximo de resultados (default: 100)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Ejemplo de respuesta:**
```json
[
  {
    "id": "cust_123",
    "name": "Cliente ABC S.A.",
    "email": "contacto@clienteabc.com",
    "balance": 50000.00,
    "currency": "MXN"
  }
]
```

### 2. `get_customer_balance`
Obtiene el saldo de un cliente específico.

**Parámetros:**
- `customerId` (string): ID del cliente

**Ejemplo de respuesta:**
```json
{
  "customerId": "cust_123",
  "balance": 50000.00,
  "currency": "MXN"
}
```

### 3. `get_invoices`
Obtiene facturas con filtros opcionales.

**Parámetros:**
- `customerId` (string, opcional): Filtrar por cliente
- `status` (string, opcional): paid, pending, overdue
- `startDate` (string, opcional): YYYY-MM-DD
- `endDate` (string, opcional): YYYY-MM-DD

**Ejemplo de respuesta:**
```json
[
  {
    "id": "inv_456",
    "customerId": "cust_123",
    "invoiceNumber": "F-001",
    "date": "2025-03-01",
    "dueDate": "2025-03-31",
    "amount": 25000.00,
    "amountPaid": 0.00,
    "balance": 25000.00,
    "status": "pending",
    "currency": "MXN"
  }
]
```

### 4. `get_payments`
Obtiene pagos recibidos.

**Parámetros:**
- `customerId` (string, opcional): Filtrar por cliente
- `startDate` (string, opcional): YYYY-MM-DD
- `endDate` (string, opcional): YYYY-MM-DD

**Ejemplo de respuesta:**
```json
[
  {
    "id": "pay_789",
    "customerId": "cust_123",
    "invoiceId": "inv_456",
    "date": "2025-03-15",
    "amount": 10000.00,
    "currency": "MXN",
    "paymentMethod": "transfer"
  }
]
```

### 5. `get_ar_aging`
Genera reporte de antigüedad de saldos.

**Parámetros:**
- `asOfDate` (string, opcional): Fecha de corte YYYY-MM-DD (default: hoy)

**Ejemplo de respuesta:**
```json
{
  "asOfDate": "2025-03-19",
  "totalBalance": 150000.00,
  "currency": "MXN",
  "buckets": {
    "current": { "range": "0 días", "amount": 50000.00, "invoiceCount": 5 },
    "days1to30": { "range": "1-30 días", "amount": 40000.00, "invoiceCount": 3 },
    "days31to60": { "range": "31-60 días", "amount": 30000.00, "invoiceCount": 2 },
    "days61to90": { "range": "61-90 días", "amount": 20000.00, "invoiceCount": 1 },
    "over90": { "range": "90+ días", "amount": 10000.00, "invoiceCount": 1 }
  }
}
```

### 6. `get_financial_account_balance`
Obtiene saldo de cuenta financiera.

**Parámetros:**
- `accountId` (string): ID de la cuenta

## Casos de Uso

### Conciliación de Cuentas por Cobrar

Yo puedo comparar automáticamente:
- Saldo de CxC en Savio vs QuickBooks
- Identificar diferencias
- Generar ajustes necesarios

### Análisis de Cobranza

```
Muéstrame los clientes con facturas vencidas más de 60 días
```

Yo analizo el AR Aging y te doy:
- Lista de clientes prioritarios
- Monto total en riesgo
- Recomendaciones de cobranza

### Flujo de Efectivo Proyectado

```
Proyecta el flujo de efectivo para los próximos 30 días
```

Combino:
- Facturas por vencer (Savio)
- Saldo bancario actual (BBVA)
- Pagos programados

## Troubleshooting

### Error: "SAVIO_API_KEY no está configurada"
- Verifica que `.env` existe y tiene la API Key
- Asegúrate de que no hay espacios extra

### Error 401: Unauthorized
- Verifica que tu API Key es correcta
- Confirma que estás usando el environment correcto (sandbox vs production)
- Contacta a nacho@savio.mx si el problema persiste

### No se encuentran datos
- En sandbox, puede que no haya datos de prueba
- Pregunta a Savio si necesitas datos de ejemplo para testing
- En production, verifica que tu cuenta tiene datos

## Próximos Pasos

1. ✅ Savio conectado
2. ⏳ BBVA (en espera de aprobación)
3. ⏳ QuickBooks (opcional)

## Soporte

- **API de Savio:** Contacta a nacho@savio.mx
- **Documentación:** https://app.savio.mx/docs
- **Ayuda con MCP:** Pregúntame directamente en el chat

## Licencia

MIT
