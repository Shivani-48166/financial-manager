import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../services/database';
import { eventService, EVENTS } from '../services/events';
import type { Transaction, Account } from '../types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = DatabaseService.getInstance();

  // Helper function to update account balance
  const updateAccountBalance = useCallback(async (accountId: string, amount: number, isIncome: boolean) => {
    try {
      const account = await db.getAccount(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const balanceChange = isIncome ? amount : -amount;
      const newBalance = account.balance + balanceChange;

      const updatedAccount: Account = {
        ...account,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      };

      await db.updateAccount(updatedAccount);

      // Emit event to refresh accounts in other components
      eventService.emit(EVENTS.TRANSACTIONS_UPDATED);
    } catch (error) {
      console.error('Failed to update account balance:', error);
      throw error;
    }
  }, [db]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getAllTransactions();
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadTransactions();

    // Listen for account deletion events to refresh transactions
    const handleAccountDeleted = () => {
      loadTransactions();
    };

    eventService.on(EVENTS.ACCOUNT_DELETED, handleAccountDeleted);

    return () => {
      eventService.off(EVENTS.ACCOUNT_DELETED, handleAccountDeleted);
    };
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add transaction to database
      await db.addTransaction(newTransaction);

      // Update account balance
      await updateAccountBalance(
        newTransaction.accountId,
        newTransaction.amount,
        newTransaction.type === 'income'
      );

      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, [db, updateAccountBalance]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const existingTransaction = transactions.find(t => t.id === id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Revert the old transaction's effect on account balance
      await updateAccountBalance(
        existingTransaction.accountId,
        existingTransaction.amount,
        existingTransaction.type === 'expense' // Reverse the original effect
      );

      // Apply the new transaction's effect on account balance
      await updateAccountBalance(
        updatedTransaction.accountId,
        updatedTransaction.amount,
        updatedTransaction.type === 'income'
      );

      await db.updateTransaction(updatedTransaction);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, [db, transactions, updateAccountBalance]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const existingTransaction = transactions.find(t => t.id === id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Revert the transaction's effect on account balance
      await updateAccountBalance(
        existingTransaction.accountId,
        existingTransaction.amount,
        existingTransaction.type === 'expense' // Reverse the original effect
      );

      await db.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, [db, transactions, updateAccountBalance]);

  const getTransactionsByDateRange = useCallback((startDate: string, endDate: string) => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions]);

  const getTransactionsByCategory = useCallback((category: string) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);

  const getTotalByType = useCallback((type: 'income' | 'expense', startDate?: string, endDate?: string) => {
    let filtered = transactions.filter(t => t.type === type);
    
    if (startDate && endDate) {
      filtered = filtered.filter(t => t.date >= startDate && t.date <= endDate);
    }
    
    return filtered.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback((startDate?: string, endDate?: string) => {
    const income = getTotalByType('income', startDate, endDate);
    const expenses = getTotalByType('expense', startDate, endDate);
    return income - expenses;
  }, [getTotalByType]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    getTotalByType,
    getBalance,
    refresh: loadTransactions,
  };
};