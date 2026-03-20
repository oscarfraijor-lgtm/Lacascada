#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { BBVAClient } from './bbva-client.js';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno
const requiredEnvVars = ['BBVA_API_KEY', 'BBVA_CLIENT_ID', 'BBVA_CLIENT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} no está configurada en .env`);
    process.exit(1);
  }
}

// Inicializar cliente BBVA
const bbvaClient = new BBVAClient({
  apiKey: process.env.BBVA_API_KEY!,
  clientId: process.env.BBVA_CLIENT_ID!,
  clientSecret: process.env.BBVA_CLIENT_SECRET!,
  environment: (process.env.BBVA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

// Definir herramientas disponibles
const tools: Tool[] = [
  {
    name: 'get_account_balance',
    description: 'Obtiene el saldo actual de una cuenta bancaria BBVA',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'ID de la cuenta bancaria',
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'get_account_transactions',
    description: 'Obtiene las transacciones de una cuenta bancaria BBVA en un rango de fechas',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'ID de la cuenta bancaria',
        },
        startDate: {
          type: 'string',
          description: 'Fecha de inicio (formato: YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          description: 'Fecha de fin (formato: YYYY-MM-DD)',
        },
      },
      required: ['accountId', 'startDate', 'endDate'],
    },
  },
  {
    name: 'list_accounts',
    description: 'Lista todas las cuentas bancarias BBVA disponibles',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_end_of_day_balance',
    description: 'Obtiene el saldo de fin de día de una cuenta',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'ID de la cuenta bancaria',
        },
        date: {
          type: 'string',
          description: 'Fecha (formato: YYYY-MM-DD)',
        },
      },
      required: ['accountId', 'date'],
    },
  },
];

// Crear servidor MCP
const server = new Server(
  {
    name: 'bbva-mcp-server',
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
    switch (name) {
      case 'get_account_balance': {
        const { accountId } = args as { accountId: string };
        const balance = await bbvaClient.getAccountBalance(accountId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(balance, null, 2),
            },
          ],
        };
      }

      case 'get_account_transactions': {
        const { accountId, startDate, endDate } = args as {
          accountId: string;
          startDate: string;
          endDate: string;
        };
        const transactions = await bbvaClient.getAccountTransactions(
          accountId,
          startDate,
          endDate
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(transactions, null, 2),
            },
          ],
        };
      }

      case 'list_accounts': {
        const accounts = await bbvaClient.listAccounts();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(accounts, null, 2),
            },
          ],
        };
      }

      case 'get_end_of_day_balance': {
        const { accountId, date } = args as { accountId: string; date: string };
        const balance = await bbvaClient.getEndOfDayBalance(accountId, date);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(balance, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
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
  console.error('BBVA MCP Server iniciado correctamente');
}

main().catch((error) => {
  console.error('Error al iniciar servidor:', error);
  process.exit(1);
});
