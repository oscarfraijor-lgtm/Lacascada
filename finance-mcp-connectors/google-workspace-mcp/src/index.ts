#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleWorkspaceClient } from './google-client.js';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} no está configurada en .env`);
    console.error('Ejecuta "npm run auth" primero para autenticarte.');
    process.exit(1);
  }
}

// Inicializar cliente
const client = new GoogleWorkspaceClient();

// ─── Definir herramientas ───

const tools: Tool[] = [
  // Calendar
  {
    name: 'get_today_events',
    description: 'Obtiene todos los eventos de hoy del calendario de Google',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_upcoming_events',
    description: 'Obtiene los próximos eventos del calendario',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Número máximo de eventos a retornar (default: 10)',
        },
      },
    },
  },
  {
    name: 'get_events_in_range',
    description: 'Obtiene eventos en un rango de fechas específico',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Fecha de inicio (formato: YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          description: 'Fecha de fin (formato: YYYY-MM-DD)',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Crea un nuevo evento en el calendario de Google',
    inputSchema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Título del evento',
        },
        description: {
          type: 'string',
          description: 'Descripción del evento (opcional)',
        },
        startDateTime: {
          type: 'string',
          description: 'Fecha/hora de inicio (formato ISO: 2024-01-15T10:00:00)',
        },
        endDateTime: {
          type: 'string',
          description: 'Fecha/hora de fin (formato ISO: 2024-01-15T11:00:00)',
        },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de emails de asistentes (opcional)',
        },
      },
      required: ['summary', 'startDateTime', 'endDateTime'],
    },
  },
  // Sheets
  {
    name: 'read_spreadsheet',
    description: 'Lee datos de una hoja de Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheetId: {
          type: 'string',
          description: 'ID del spreadsheet (de la URL)',
        },
        range: {
          type: 'string',
          description: 'Rango a leer (ej: "Sheet1!A1:D10" o "A:F")',
        },
      },
      required: ['spreadsheetId', 'range'],
    },
  },
  {
    name: 'write_spreadsheet',
    description: 'Escribe datos en una hoja de Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheetId: {
          type: 'string',
          description: 'ID del spreadsheet',
        },
        range: {
          type: 'string',
          description: 'Rango donde escribir (ej: "Sheet1!A1:D5")',
        },
        values: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' },
          },
          description: 'Datos a escribir como array 2D',
        },
      },
      required: ['spreadsheetId', 'range', 'values'],
    },
  },
  {
    name: 'append_spreadsheet',
    description: 'Agrega filas al final de una hoja de Google Sheets',
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheetId: {
          type: 'string',
          description: 'ID del spreadsheet',
        },
        range: {
          type: 'string',
          description: 'Hoja donde agregar (ej: "Sheet1")',
        },
        values: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' },
          },
          description: 'Filas a agregar como array 2D',
        },
      },
      required: ['spreadsheetId', 'range', 'values'],
    },
  },
  {
    name: 'list_sheet_tabs',
    description: 'Lista las hojas/tabs de un spreadsheet',
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheetId: {
          type: 'string',
          description: 'ID del spreadsheet',
        },
      },
      required: ['spreadsheetId'],
    },
  },
  // Drive
  {
    name: 'search_drive',
    description: 'Busca archivos en Google Drive por nombre',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda',
        },
        maxResults: {
          type: 'number',
          description: 'Número máximo de resultados (default: 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_recent_files',
    description: 'Lista los archivos más recientes en Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Número máximo de archivos (default: 10)',
        },
      },
    },
  },
  {
    name: 'read_google_doc',
    description: 'Lee el contenido de un Google Doc como texto plano',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'ID del archivo (de la URL del doc)',
        },
      },
      required: ['fileId'],
    },
  },
];

// ─── Crear servidor MCP ───

const server = new Server(
  {
    name: 'google-workspace-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Calendar
      case 'get_today_events': {
        const events = await client.getTodayEvents();
        result = events.map(e => ({
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          attendees: e.attendees?.map(a => a.email),
          link: e.htmlLink,
        }));
        break;
      }

      case 'get_upcoming_events': {
        const { maxResults = 10 } = args as { maxResults?: number };
        const events = await client.getUpcomingEvents(maxResults);
        result = events.map(e => ({
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          attendees: e.attendees?.map(a => a.email),
          link: e.htmlLink,
        }));
        break;
      }

      case 'get_events_in_range': {
        const { startDate, endDate } = args as { startDate: string; endDate: string };
        const events = await client.getEventsInRange(startDate, endDate);
        result = events.map(e => ({
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          link: e.htmlLink,
        }));
        break;
      }

      case 'create_calendar_event': {
        const eventArgs = args as {
          summary: string;
          description?: string;
          startDateTime: string;
          endDateTime: string;
          attendees?: string[];
        };
        const event = await client.createEvent(eventArgs);
        result = {
          id: event.id,
          title: event.summary,
          link: event.htmlLink,
          start: event.start?.dateTime,
          end: event.end?.dateTime,
        };
        break;
      }

      // Sheets
      case 'read_spreadsheet': {
        const { spreadsheetId, range } = args as { spreadsheetId: string; range: string };
        result = await client.readSheet(spreadsheetId, range);
        break;
      }

      case 'write_spreadsheet': {
        const { spreadsheetId, range, values } = args as {
          spreadsheetId: string;
          range: string;
          values: string[][];
        };
        const updatedCells = await client.writeSheet(spreadsheetId, range, values);
        result = { updatedCells, message: `Se actualizaron ${updatedCells} celdas` };
        break;
      }

      case 'append_spreadsheet': {
        const { spreadsheetId, range, values } = args as {
          spreadsheetId: string;
          range: string;
          values: string[][];
        };
        const appended = await client.appendSheet(spreadsheetId, range, values);
        result = { appendedCells: appended, message: `Se agregaron ${appended} celdas` };
        break;
      }

      case 'list_sheet_tabs': {
        const { spreadsheetId } = args as { spreadsheetId: string };
        result = await client.listSheets(spreadsheetId);
        break;
      }

      // Drive
      case 'search_drive': {
        const { query, maxResults = 10 } = args as { query: string; maxResults?: number };
        const files = await client.searchFiles(query, maxResults);
        result = files.map(f => ({
          id: f.id,
          name: f.name,
          type: f.mimeType,
          modified: f.modifiedTime,
          link: f.webViewLink,
        }));
        break;
      }

      case 'list_recent_files': {
        const { maxResults = 10 } = args as { maxResults?: number };
        const files = await client.listRecentFiles(maxResults);
        result = files.map(f => ({
          id: f.id,
          name: f.name,
          type: f.mimeType,
          modified: f.modifiedTime,
          link: f.webViewLink,
        }));
        break;
      }

      case 'read_google_doc': {
        const { fileId } = args as { fileId: string };
        result = await client.getFileContent(fileId);
        break;
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Workspace MCP Server iniciado correctamente');
}

main().catch((error) => {
  console.error('Error al iniciar servidor:', error);
  process.exit(1);
});
