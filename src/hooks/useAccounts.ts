import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../services/database';
import type { Account } from '../types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = DatabaseService.getInstance();

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAccount: Account = {
        ...account,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.addAccount(newAccount);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
      throw err;
    }
  }, [db]);

  const getTotalBalance = useCallback(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);

  const getAccountById = useCallback((id: string) => {
    return accounts.find(account => account.id === id);
  }, [accounts]);

  return {
    accounts,
    loading,
    error,
    addAccount,
    getTotalBalance,
    getAccountById,
    refresh: loadAccounts,
  };
};