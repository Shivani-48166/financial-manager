export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'investment_buy' | 'investment_sell' | 'dividend' | 'interest';
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  tags: string[];
  accountId: string;
  investmentId?: string; // Link to investment record
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit' | 'investment';
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

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: 'stock' | 'mutual_fund' | 'bond' | 'etf' | 'crypto' | 'real_estate' | 'commodity';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  accountId: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'bonus';
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  investments: Investment[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  createdAt: string;
  updatedAt: string;
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

