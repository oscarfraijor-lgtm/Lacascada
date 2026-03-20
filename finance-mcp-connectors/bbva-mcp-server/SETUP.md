# Guía de Instalación BBVA MCP Server

## 📋 Paso a Paso

### 1️⃣ Obtener Credenciales de BBVA API Market

#### A. Crear Cuenta en BBVA API Market

1. Ve a: https://www.bbvaapimarket.com/
2. Haz clic en "Sign Up" (Registrarse)
3. Completa el formulario de registro
4. Verifica tu email

#### B. Crear una Aplicación

1. Inicia sesión en BBVA API Market
2. Ve a **"My Apps"** en el menú superior
3. Haz clic en **"Create New App"**
4. Llena el formulario:
   - **App Name:** "Finance MCP Connector" (o el nombre que prefieras)
   - **Description:** "Integración MCP para datos financieros"
   - **Environment:** Selecciona **"Sandbox"** para empezar

#### C. Suscribirse a las APIs Necesarias

Después de crear tu app, suscríbete a estas APIs:

**Para México:**
1. **Business Accounts** (Cuentas empresariales)
   - Permite consultar saldos de cuentas
   
2. **Intraday Balances and Transactions** (Saldos y transacciones en tiempo real)
   - Permite consultar movimientos del día
   
3. **End-of-Day Balances and Transactions** (Saldos y transacciones fin de día)
   - Permite consultar saldos históricos

**Cómo suscribirse:**
- En tu app, ve a la pestaña "APIs"
- Busca cada API en el catálogo
- Haz clic en "Subscribe" para cada una
- Acepta los términos y condiciones

#### D. Obtener tus Credenciales

1. Ve a **"My Apps"** → Selecciona tu app
2. Ve a la pestaña **"Credentials"** o **"Keys"**
3. Copia y guarda:
   - **API Key** (también llamado "Consumer Key")
   - **Client ID** (puede ser el mismo que API Key)
   - **Client Secret** (también llamado "Consumer Secret")

**⚠️ IMPORTANTE:** Guarda estas credenciales en un lugar seguro. No las compartas.

---

### 2️⃣ Instalar Node.js (si no lo tienes)

Verifica si tienes Node.js instalado:

```bash
node --version
```

Si no está instalado o la versión es menor a 18:

**macOS (con Homebrew):**
```bash
brew install node
```

**O descarga desde:** https://nodejs.org/

---

### 3️⃣ Instalar Dependencias del Servidor MCP

```bash
cd /Users/apkuzz/CascadeProjects/finance-mcp-connectors/bbva-mcp-server
npm install
```

Esto instalará:
- `@modelcontextprotocol/sdk` - SDK de MCP
- `axios` - Cliente HTTP para llamadas API
- `dotenv` - Manejo de variables de entorno
- `typescript` - Compilador TypeScript

---

### 4️⃣ Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```bash
nano .env
```

O ábrelo con tu editor favorito y pega tus credenciales:

```env
BBVA_API_KEY=tu_api_key_de_bbva_aqui
BBVA_CLIENT_ID=tu_client_id_de_bbva_aqui
BBVA_CLIENT_SECRET=tu_client_secret_de_bbva_aqui
BBVA_ENVIRONMENT=sandbox
BBVA_BASE_URL=https://apis.bbva.com/sandbox
MCP_SERVER_PORT=3003
```

**Guarda el archivo** (Ctrl+O, Enter, Ctrl+X en nano)

---

### 5️⃣ Compilar el Proyecto

```bash
npm run build
```

Deberías ver:
```
✓ Compiled successfully
```

---

### 6️⃣ Probar el Servidor (Opcional pero Recomendado)

```bash
npm start
```

Si ves:
```
BBVA MCP Server iniciado correctamente
```

¡Perfecto! Presiona `Ctrl+C` para detenerlo.

---

### 7️⃣ Integrar con Windsurf

#### A. Actualizar .mcp.json del Plugin Finance

Edita: `/Users/apkuzz/Desktop/Windsurf/knowledge-work-plugins/finance/.mcp.json`

Agrega la configuración de BBVA:

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

#### B. Crear .env en Windsurf

Crea o edita: `/Users/apkuzz/Desktop/Windsurf/.env`

```env
BBVA_API_KEY=tu_api_key_de_bbva_aqui
BBVA_CLIENT_ID=tu_client_id_de_bbva_aqui
BBVA_CLIENT_SECRET=tu_client_secret_de_bbva_aqui
```

---

### 8️⃣ Reiniciar Windsurf

Para que Windsurf cargue la nueva configuración MCP:

1. Cierra Windsurf completamente
2. Vuelve a abrirlo
3. Abre el proyecto `/Users/apkuzz/Desktop/Windsurf`

---

### 9️⃣ Probar la Integración

En el chat de Windsurf, prueba:

```
Lista mis cuentas BBVA
```

O:

```
Dame el saldo de mi cuenta BBVA
```

Yo automáticamente usaré el servidor MCP de BBVA para obtener los datos.

---

## 🔍 Verificación de Instalación

### Checklist:

- [ ] Cuenta creada en BBVA API Market
- [ ] App creada y APIs suscritas
- [ ] Credenciales copiadas (API Key, Client ID, Client Secret)
- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado con credenciales
- [ ] Proyecto compilado (`npm run build`)
- [ ] Servidor probado (`npm start`)
- [ ] `.mcp.json` actualizado en Windsurf
- [ ] `.env` creado en Windsurf
- [ ] Windsurf reiniciado

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@modelcontextprotocol/sdk'"

**Solución:**
```bash
cd /Users/apkuzz/CascadeProjects/finance-mcp-connectors/bbva-mcp-server
rm -rf node_modules package-lock.json
npm install
```

### Error: "BBVA_API_KEY no está configurada"

**Solución:**
- Verifica que el archivo `.env` existe
- Verifica que no hay espacios extra en las variables
- Asegúrate de que el archivo se llama exactamente `.env` (no `.env.txt`)

### Error de autenticación 401

**Solución:**
- Verifica que tus credenciales son correctas
- Confirma que tu app en BBVA API Market está activa
- Verifica que estás usando `sandbox` en el `.env`
- Revisa que las APIs están suscritas en tu app

### No se encuentran cuentas en sandbox

**Solución:**
En sandbox, BBVA proporciona cuentas de prueba. Consulta la documentación de BBVA para obtener:
- IDs de cuentas de prueba
- Datos de ejemplo para testing

---

## 📚 Recursos

- **BBVA API Market:** https://www.bbvaapimarket.com/
- **Documentación APIs México:** https://www.bbvaapimarket.com/en/api-developers/quickstart/
- **Soporte BBVA:** https://www.bbvaapimarket.com/en/contact/

---

## ✅ Siguiente Paso

Una vez que BBVA esté funcionando, podemos conectar:

1. **Savio** (Cuentas por Cobrar)
2. **QuickBooks** (Contabilidad General)

¡Y tendrás un sistema financiero completamente integrado! 🎉
