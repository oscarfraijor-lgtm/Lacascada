#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SavioClient } from './savio-client.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SAVIO_API_KEY) {
  console.error('Error: SAVIO_API_KEY no está configurada en .env');
  process.exit(1);
}

const savioClient = new SavioClient({
  apiKey: process.env.SAVIO_API_KEY!,
  environment: (process.env.SAVIO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

const tools: Tool[] = [
  {
    name: 'get_customers',
    description: 'Obtiene la lista de clientes (cuentas por cobrar)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Número máximo de resultados (default: 100)',
        },
        offset: {
          type: 'number',
          description: 'Offset para paginación (default: 0)',
        },
      },
    },
  },
  {
    name: 'get_customer_balance',
    description: 'Obtiene el saldo de cuentas por cobrar de un cliente específico',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'ID del cliente',
        },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'get_invoices',
    description: 'Obtiene facturas (invoices) con filtros opcionales',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'Filtrar por ID de cliente (opcional)',
        },
        status: {
          type: 'string',
          description: 'Filtrar por estado: paid, pending, overdue (opcional)',
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
    },
  },
  {
    name: 'get_payments',
    description: 'Obtiene pagos recibidos con filtros opcionales',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'Filtrar por ID de cliente (opcional)',
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
    },
  },
  {
    name: 'get_ar_aging',
    description: 'Obtiene el reporte de antigüedad de saldos (AR Aging Report)',
    inputSchema: {
      type: 'object',
      properties: {
        asOfDate: {
          type: 'string',
          description: 'Fecha de corte (formato: YYYY-MM-DD). Default: hoy',
        },
      },
    },
  },
  {
    name: 'get_financial_account_balance',
    description: 'Obtiene el saldo de una cuenta financiera',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'ID de la cuenta financiera',
        },
      },
      required: ['accountId'],
    },
  },
];

const server = new Server(
  {
    name: 'savio-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_customers': {
        const { limit, offset } = args as { limit?: number; offset?: number };
        const customers = await savioClient.getCustomers(limit, offset);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      }

      case 'get_customer_balance': {
        const { customerId } = args as { customerId: string };
        const balance = await savioClient.getCustomerBalance(customerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(balance, null, 2),
            },
          ],
        };
      }

      case 'get_invoices': {
        const { customerId, status, startDate, endDate } = args as {
          customerId?: string;
          status?: string;
          startDate?: string;
          endDate?: string;
        };
        const invoices = await savioClient.getInvoices({
          customerId,
          status,
          startDate,
          endDate,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoices, null, 2),
            },
          ],
        };
      }

      case 'get_payments': {
        const { customerId, startDate, endDate } = args as {
          customerId?: string;
          startDate?: string;
          endDate?: string;
        };
        const payments = await savioClient.getPayments({
          customerId,
          startDate,
          endDate,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payments, null, 2),
            },
          ],
        };
      }

      case 'get_ar_aging': {
        const { asOfDate } = args as { asOfDate?: string };
        const aging = await savioClient.getARAgingReport(asOfDate);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(aging, null, 2),
            },
          ],
        };
      }

      case 'get_financial_account_balance': {
        const { accountId } = args as { accountId: string };
        const balance = await savioClient.getFinancialAccountBalance(accountId);
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Savio MCP Server iniciado correctamente');
}

main().catch((error) => {
  console.error('Error al iniciar servidor:', error);
  process.exit(1);
});
