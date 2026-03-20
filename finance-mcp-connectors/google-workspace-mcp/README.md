# Google Workspace MCP Server

Servidor MCP que conecta Cascade con Google Calendar, Sheets y Drive.

## Herramientas Disponibles

### Calendar
- **get_today_events** — Eventos de hoy
- **get_upcoming_events** — Próximos eventos
- **get_events_in_range** — Eventos en rango de fechas
- **create_calendar_event** — Crear evento nuevo

### Sheets
- **read_spreadsheet** — Leer datos de una hoja
- **write_spreadsheet** — Escribir datos en celdas
- **append_spreadsheet** — Agregar filas al final
- **list_sheet_tabs** — Listar hojas/tabs

### Drive
- **search_drive** — Buscar archivos por nombre
- **list_recent_files** — Archivos recientes
- **read_google_doc** — Leer contenido de un Google Doc

## Setup

### 1. Google Cloud Console
1. Ir a console.cloud.google.com
2. Crear proyecto "windsurf-mcp"
3. Habilitar APIs: Calendar, Sheets, Drive
4. Crear credenciales OAuth2 (Desktop app)
5. Descargar JSON de credenciales

### 2. Configurar
    cp .env.example .env
    # Copiar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET del JSON descargado

### 3. Instalar dependencias
    npm install

### 4. Autenticarse
    npm run auth
    # Se abre navegador para autorizar con tu cuenta de Google

### 5. Compilar y probar
    npm run build

## Uso en Windsurf

Agregar a la configuración MCP de Windsurf:

    "google-workspace": {
      "command": "node",
      "args": ["/ruta/completa/dist/index.js"],
      "cwd": "/ruta/completa/google-workspace-mcp"
    }
