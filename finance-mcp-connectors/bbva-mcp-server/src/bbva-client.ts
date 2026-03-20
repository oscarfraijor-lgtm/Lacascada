import axios, { AxiosInstance } from 'axios';

interface BBVAConfig {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

interface AccountBalance {
  accountId: string;
  balance: number;
  currency: string;
  availableBalance?: number;
  timestamp: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  balance?: number;
}

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  status: string;
}

export class BBVAClient {
  private client: AxiosInstance;
  private config: BBVAConfig;
  private accessToken: string | null = null;

  constructor(config: BBVAConfig) {
    this.config = config;
    
    const baseURL = config.environment === 'sandbox' 
      ? 'https://apis.bbva.com/sandbox'
      : 'https://apis.bbva.com';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use(async (config) => {
      if (!this.accessToken) {
        await this.authenticate();
      }
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });
  }

  /**
   * Autenticación OAuth2
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post(
        `${this.client.defaults.baseURL}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
    } catch (error) {
      throw new Error(`Error de autenticación BBVA: ${error}`);
    }
  }

  /**
   * Obtiene el saldo actual de una cuenta
   */
  async getAccountBalance(accountId: string): Promise<AccountBalance> {
    try {
      const response = await this.client.get(`/accounts/${accountId}/balance`);
      
      return {
        accountId,
        balance: response.data.balance || 0,
        currency: response.data.currency || 'MXN',
        availableBalance: response.data.availableBalance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Cuenta ${accountId} no encontrada`);
      }
      throw new Error(`Error al obtener saldo: ${error}`);
    }
  }

  /**
   * Obtiene transacciones de una cuenta en un rango de fechas
   */
  async getAccountTransactions(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    try {
      const response = await this.client.get(`/accounts/${accountId}/transactions`, {
        params: {
          startDate,
          endDate,
        },
      });

      const transactions = response.data.transactions || [];
      
      return transactions.map((tx: any) => ({
        id: tx.id || tx.transactionId,
        date: tx.date || tx.valueDate,
        description: tx.description || tx.concept,
        amount: Math.abs(tx.amount),
        currency: tx.currency || 'MXN',
        type: tx.amount < 0 ? 'debit' : 'credit',
        balance: tx.balance,
      }));
    } catch (error) {
      throw new Error(`Error al obtener transacciones: ${error}`);
    }
  }

  /**
   * Lista todas las cuentas disponibles
   */
  async listAccounts(): Promise<Account[]> {
    try {
      const response = await this.client.get('/accounts');
      
      const accounts = response.data.accounts || [];
      
      return accounts.map((acc: any) => ({
        id: acc.id || acc.accountId,
        name: acc.name || acc.alias || `Cuenta ${acc.id}`,
        type: acc.type || acc.accountType || 'checking',
        currency: acc.currency || 'MXN',
        status: acc.status || 'active',
      }));
    } catch (error) {
      throw new Error(`Error al listar cuentas: ${error}`);
    }
  }

  /**
   * Obtiene el saldo de fin de día
   */
  async getEndOfDayBalance(accountId: string, date: string): Promise<AccountBalance> {
    try {
      const response = await this.client.get(`/accounts/${accountId}/end-of-day-balance`, {
        params: { date },
      });

      return {
        accountId,
        balance: response.data.balance || 0,
        currency: response.data.currency || 'MXN',
        timestamp: `${date}T23:59:59Z`,
      };
    } catch (error) {
      throw new Error(`Error al obtener saldo de fin de día: ${error}`);
    }
  }
}
