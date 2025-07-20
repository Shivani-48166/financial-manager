import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../services/database';
import type { Transaction } from '../types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = DatabaseService.getInstance();

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
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.addTransaction(newTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, [db]);

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

      await db.updateTransaction(updatedTransaction);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, [db, transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await db.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, [db]);

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