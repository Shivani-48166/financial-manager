export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  tags: string[];
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  nextDate: string;
  accountId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // exchange rate to base currency
  lastUpdated: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'overspending' | 'approaching_limit' | 'bill_reminder';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppSettings {
  currency: string;
  baseCurrency: string;
  theme: 'light' | 'dark' | 'system';
  pinLength: 4 | 5 | 6;
  autoLockMinutes: number;
  biometricEnabled: boolean;
  budgetAlerts: boolean;
  fakeVaultMode: boolean;
  fakeVaultPin: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedBackup {
  version: string;
  timestamp: string;
  data: string; // Encrypted JSON
  checksum: string;
}

