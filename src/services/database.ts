import { EncryptionService } from './encryption';
import type { Transaction, Account, Budget, Goal, RecurringTransaction, AppSettings } from '../types';

/**
 * IndexedDB service with encryption for all sensitive financial data
 * Implements offline-first architecture with data versioning
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;
  private readonly DB_NAME = 'FinancialManagerDB';
  private readonly DB_VERSION = 1;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database with PIN-derived encryption key
   */
  async initialize(pin: string): Promise<void> {
    const { key } = await EncryptionService.deriveKeyFromPin(pin);
    this.encryptionKey = key;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create IndexedDB object stores with proper indexes
   */
  private createObjectStores(db: IDBDatabase): void {
    // Transactions store
    if (!db.objectStoreNames.contains('transactions')) {
      const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
      transactionStore.createIndex('date', 'date');
      transactionStore.createIndex('category', 'category');
      transactionStore.createIndex('accountId', 'accountId');
      transactionStore.createIndex('type', 'type');
    }

    // Accounts store
    if (!db.objectStoreNames.contains('accounts')) {
      db.createObjectStore('accounts', { keyPath: 'id' });
    }

    // Budgets store
    if (!db.objectStoreNames.contains('budgets')) {
      const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
      budgetStore.createIndex('category', 'category');
      budgetStore.createIndex('period', 'period');
    }

    // Goals store
    if (!db.objectStoreNames.contains('goals')) {
      db.createObjectStore('goals', { keyPath: 'id' });
    }

    // Recurring transactions store
    if (!db.objectStoreNames.contains('recurringTransactions')) {
      const recurringStore = db.createObjectStore('recurringTransactions', { keyPath: 'id' });
      recurringStore.createIndex('nextDate', 'nextDate');
      recurringStore.createIndex('isActive', 'isActive');
    }

    // Settings store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'id' });
    }
  }

  /**
   * Encrypt and store data
   */
  private async encryptAndStore(storeName: string, data: any): Promise<void> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database not initialized');
    }

    const jsonData = JSON.stringify(data);
    const { encrypted, iv } = await EncryptionService.encrypt(jsonData, this.encryptionKey);

    const encryptedRecord = {
      id: data.id,
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(encryptedRecord);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Retrieve and decrypt data
   */
  private async retrieveAndDecrypt(storeName: string, id: string): Promise<any | null> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        if (!request.result) {
          resolve(null);
          return;
        }

        try {
          const encryptedRecord = request.result;
          const encryptedData = new Uint8Array(encryptedRecord.data).buffer;
          const iv = new Uint8Array(encryptedRecord.iv);
          
          const decryptedJson = await EncryptionService.decrypt(encryptedData, this.encryptionKey!, iv);
          resolve(JSON.parse(decryptedJson));
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  // Transaction operations
  async addTransaction(transaction: Transaction): Promise<void> {
    return this.encryptAndStore('transactions', transaction);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.retrieveAndDecrypt('transactions', id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        try {
          const encryptedRecords = request.result;
          const decryptedTransactions = await Promise.all(
            encryptedRecords.map(async (record) => {
              const encryptedData = new Uint8Array(record.data).buffer;
              const iv = new Uint8Array(record.iv);
              const decryptedJson = await EncryptionService.decrypt(encryptedData, this.encryptionKey!, iv);
              return JSON.parse(decryptedJson);
            })
          );
          resolve(decryptedTransactions);
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    return this.encryptAndStore('transactions', transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Account operations
  async addAccount(account: Account): Promise<void> {
    return this.encryptAndStore('accounts', account);
  }

  async getAllAccounts(): Promise<Account[]> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['accounts'], 'readonly');
      const store = transaction.objectStore('accounts');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        try {
          const encryptedRecords = request.result;
          const decryptedAccounts = await Promise.all(
            encryptedRecords.map(async (record) => {
              const encryptedData = new Uint8Array(record.data).buffer;
              const iv = new Uint8Array(record.iv);
              const decryptedJson = await EncryptionService.decrypt(encryptedData, this.encryptionKey!, iv);
              return JSON.parse(decryptedJson);
            })
          );
          resolve(decryptedAccounts);
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  // Budget operations
  async addBudget(budget: Budget): Promise<void> {
    return this.encryptAndStore('budgets', budget);
  }

  async getAllBudgets(): Promise<Budget[]> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['budgets'], 'readonly');
      const store = transaction.objectStore('budgets');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        try {
          const encryptedRecords = request.result;
          const decryptedBudgets = await Promise.all(
            encryptedRecords.map(async (record) => {
              const encryptedData = new Uint8Array(record.data).buffer;
              const iv = new Uint8Array(record.iv);
              const decryptedJson = await EncryptionService.decrypt(encryptedData, this.encryptionKey!, iv);
              return JSON.parse(decryptedJson);
            })
          );
          resolve(decryptedBudgets);
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<any> {
    const [transactions, accounts, budgets, goals, recurringTransactions] = await Promise.all([
      this.getAllTransactions(),
      this.getAllAccounts(),
      this.getAllBudgets(),
      // Add other data retrieval methods as needed
    ]);

    return {
      transactions,
      accounts,
      budgets,
      goals: goals || [],
      recurringTransactions: recurringTransactions || [],
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Import data from backup
   */
  async importAllData(data: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(['transactions', 'accounts', 'budgets', 'goals', 'recurringTransactions'], 'readwrite');

    // Clear existing data
    await Promise.all([
      this.clearStore(transaction, 'transactions'),
      this.clearStore(transaction, 'accounts'),
      this.clearStore(transaction, 'budgets'),
      this.clearStore(transaction, 'goals'),
      this.clearStore(transaction, 'recurringTransactions')
    ]);

    // Import new data
    if (data.transactions) {
      for (const item of data.transactions) {
        await this.addTransaction(item);
      }
    }
    if (data.accounts) {
      for (const item of data.accounts) {
        await this.addAccount(item);
      }
    }
    if (data.budgets) {
      for (const item of data.budgets) {
        await this.addBudget(item);
      }
    }
  }

  private clearStore(transaction: IDBTransaction, storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}