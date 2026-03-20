import axios, { AxiosInstance } from 'axios';

interface SavioConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  balance: number;
  currency: string;
}

interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue';
  currency: string;
}

interface Payment {
  id: string;
  customerId: string;
  invoiceId?: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
}

interface ARAgingBucket {
  range: string;
  amount: number;
  invoiceCount: number;
}

interface ARAgingReport {
  asOfDate: string;
  totalBalance: number;
  currency: string;
  buckets: {
    current: ARAgingBucket;
    days1to30: ARAgingBucket;
    days31to60: ARAgingBucket;
    days61to90: ARAgingBucket;
    over90: ARAgingBucket;
  };
  customers: Array<{
    customerId: string;
    customerName: string;
    totalBalance: number;
    aging: {
      current: number;
      days1to30: number;
      days31to60: number;
      days61to90: number;
      over90: number;
    };
  }>;
}

export class SavioClient {
  private client: AxiosInstance;
  private config: SavioConfig;

  constructor(config: SavioConfig) {
    this.config = config;

    const baseURL =
      config.environment === 'sandbox'
        ? 'https://api-sandbox.savio.mx/api/v1'
        : 'https://api-savio.mx/api/v1';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.apiKey,
      },
    });
  }

  async getCustomers(limit: number = 100, offset: number = 0): Promise<Customer[]> {
    try {
      const response = await this.client.get('/customer', {
        params: { limit, offset },
      });

      return response.data.customers || response.data || [];
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error}`);
    }
  }

  async getCustomerBalance(customerId: string): Promise<{ customerId: string; balance: number; currency: string }> {
    try {
      const response = await this.client.get(`/customer/${customerId}`);
      const customer = response.data;

      return {
        customerId,
        balance: customer.balance || 0,
        currency: customer.currency || 'MXN',
      };
    } catch (error) {
      throw new Error(`Error al obtener saldo del cliente: ${error}`);
    }
  }

  async getInvoices(filters: {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    try {
      const response = await this.client.get('/invoice', {
        params: {
          customer_id: filters.customerId,
          status: filters.status,
          start_date: filters.startDate,
          end_date: filters.endDate,
        },
      });

      return response.data.invoices || response.data || [];
    } catch (error) {
      throw new Error(`Error al obtener facturas: ${error}`);
    }
  }

  async getPayments(filters: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> {
    try {
      const response = await this.client.get('/payment', {
        params: {
          customer_id: filters.customerId,
          start_date: filters.startDate,
          end_date: filters.endDate,
        },
      });

      return response.data.payments || response.data || [];
    } catch (error) {
      throw new Error(`Error al obtener pagos: ${error}`);
    }
  }

  async getARAgingReport(asOfDate?: string): Promise<ARAgingReport> {
    try {
      const date = asOfDate || new Date().toISOString().split('T')[0];
      
      const invoices = await this.getInvoices({
        status: 'pending',
      });

      const customers = await this.getCustomers();

      const aging: ARAgingReport = {
        asOfDate: date,
        totalBalance: 0,
        currency: 'MXN',
        buckets: {
          current: { range: '0 días', amount: 0, invoiceCount: 0 },
          days1to30: { range: '1-30 días', amount: 0, invoiceCount: 0 },
          days31to60: { range: '31-60 días', amount: 0, invoiceCount: 0 },
          days61to90: { range: '61-90 días', amount: 0, invoiceCount: 0 },
          over90: { range: '90+ días', amount: 0, invoiceCount: 0 },
        },
        customers: [],
      };

      const asOfDateObj = new Date(date);

      for (const invoice of invoices) {
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor(
          (asOfDateObj.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        aging.totalBalance += invoice.balance;

        if (daysOverdue <= 0) {
          aging.buckets.current.amount += invoice.balance;
          aging.buckets.current.invoiceCount++;
        } else if (daysOverdue <= 30) {
          aging.buckets.days1to30.amount += invoice.balance;
          aging.buckets.days1to30.invoiceCount++;
        } else if (daysOverdue <= 60) {
          aging.buckets.days31to60.amount += invoice.balance;
          aging.buckets.days31to60.invoiceCount++;
        } else if (daysOverdue <= 90) {
          aging.buckets.days61to90.amount += invoice.balance;
          aging.buckets.days61to90.invoiceCount++;
        } else {
          aging.buckets.over90.amount += invoice.balance;
          aging.buckets.over90.invoiceCount++;
        }
      }

      return aging;
    } catch (error) {
      throw new Error(`Error al generar reporte de antigüedad: ${error}`);
    }
  }

  async getFinancialAccountBalance(accountId: string): Promise<{ accountId: string; balance: number; currency: string }> {
    try {
      const response = await this.client.get(`/financial-account/${accountId}`);
      const account = response.data;

      return {
        accountId,
        balance: account.balance || 0,
        currency: account.currency || 'MXN',
      };
    } catch (error) {
      throw new Error(`Error al obtener saldo de cuenta financiera: ${error}`);
    }
  }
}
