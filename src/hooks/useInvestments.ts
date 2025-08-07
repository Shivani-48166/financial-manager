import { useState, useEffect, useCallback } from 'react';
import { Investment, InvestmentTransaction } from '../types';
import { useTransactions } from './useTransactions';
import { useAccounts } from './useAccounts';
import { InvestmentTransactionService } from '../services/investmentTransactions';

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addTransaction, transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Load investments from storage - starts empty for new users
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        setLoading(true);
        // In a real app, this would load from database
        // For now, start with empty portfolio
        const storedInvestments = localStorage.getItem('fm_investments');
        if (storedInvestments) {
          setInvestments(JSON.parse(storedInvestments));
        } else {
          setInvestments([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load investments');
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  const addInvestment = useCallback(async (
    investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>,
    fromAccountId: string,
    fees: number = 0
  ) => {
    try {
      const newInvestment: Investment = {
        ...investmentData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the investment purchase transaction
      const purchaseTransaction = InvestmentTransactionService.createBuyTransaction(
        newInvestment,
        investmentData.quantity,
        investmentData.purchasePrice,
        fees,
        fromAccountId
      );

      // Add the transaction (this will update account balance)
      await addTransaction(purchaseTransaction);

      // Add the investment to the list
      const updatedInvestments = [...investments, newInvestment];
      setInvestments(updatedInvestments);

      // Save to localStorage
      localStorage.setItem('fm_investments', JSON.stringify(updatedInvestments));

      return newInvestment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investment');
      throw err;
    }
  }, [addTransaction]);

  const sellInvestment = useCallback(async (
    investmentId: string,
    quantity: number,
    sellPrice: number,
    toAccountId: string,
    fees: number = 0
  ) => {
    try {
      const investment = investments.find(inv => inv.id === investmentId);
      if (!investment) {
        throw new Error('Investment not found');
      }

      if (quantity > investment.quantity) {
        throw new Error('Cannot sell more than owned quantity');
      }

      // Create the investment sale transaction
      const saleTransaction = InvestmentTransactionService.createSellTransaction(
        investment,
        quantity,
        sellPrice,
        fees,
        toAccountId
      );

      // Add the transaction (this will update account balance)
      await addTransaction(saleTransaction);

      // Update the investment quantity
      const updatedInvestments = investments.map(inv =>
        inv.id === investmentId
          ? { ...inv, quantity: inv.quantity - quantity, updatedAt: new Date().toISOString() }
          : inv
      ).filter(inv => inv.quantity > 0); // Remove if quantity becomes 0

      setInvestments(updatedInvestments);

      // Save to localStorage
      localStorage.setItem('fm_investments', JSON.stringify(updatedInvestments));

      return saleTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sell investment');
      throw err;
    }
  }, [investments, addTransaction]);

  const addDividend = useCallback(async (
    investmentId: string,
    amount: number,
    toAccountId: string,
    date?: string
  ) => {
    try {
      const investment = investments.find(inv => inv.id === investmentId);
      if (!investment) {
        throw new Error('Investment not found');
      }

      // Create the dividend transaction
      const dividendTransaction = InvestmentTransactionService.createDividendTransaction(
        investment,
        amount,
        toAccountId,
        date
      );

      // Add the transaction (this will update account balance)
      await addTransaction(dividendTransaction);

      return dividendTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dividend');
      throw err;
    }
  }, [investments, addTransaction]);

  const addInterest = useCallback(async (
    investmentId: string,
    amount: number,
    toAccountId: string,
    date?: string
  ) => {
    try {
      const investment = investments.find(inv => inv.id === investmentId);
      if (!investment) {
        throw new Error('Investment not found');
      }

      // Create the interest transaction
      const interestTransaction = InvestmentTransactionService.createInterestTransaction(
        investment,
        amount,
        toAccountId,
        date
      );

      // Add the transaction (this will update account balance)
      await addTransaction(interestTransaction);

      return interestTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add interest');
      throw err;
    }
  }, [investments, addTransaction]);

  const updateInvestmentPrice = useCallback(async (
    investmentId: string,
    newPrice: number
  ) => {
    try {
      const updatedInvestments = investments.map(inv =>
        inv.id === investmentId
          ? { ...inv, currentPrice: newPrice, updatedAt: new Date().toISOString() }
          : inv
      );

      setInvestments(updatedInvestments);

      // Save to localStorage
      localStorage.setItem('fm_investments', JSON.stringify(updatedInvestments));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update investment price');
      throw err;
    }
  }, [investments]);

  const getInvestmentWithReturns = useCallback((investmentId: string) => {
    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment) return null;

    return {
      ...investment,
      ...InvestmentTransactionService.calculateTotalReturn(investment, transactions)
    };
  }, [investments, transactions]);

  const getPortfolioStats = useCallback(() => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Calculate total dividends and interest across all investments
    const totalDividends = investments.reduce((sum, inv) => 
      sum + InvestmentTransactionService.calculateTotalDividends(inv.id, transactions), 0
    );
    const totalInterest = investments.reduce((sum, inv) => 
      sum + InvestmentTransactionService.calculateTotalInterest(inv.id, transactions), 0
    );

    const totalReturn = totalGainLoss + totalDividends + totalInterest;
    const totalReturnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercentage,
      totalDividends,
      totalInterest,
      totalReturn,
      totalReturnPercentage,
      investmentCount: investments.length
    };
  }, [investments, transactions]);

  const getInvestmentsByType = useCallback(() => {
    const typeMap = investments.reduce((acc, inv) => {
      const value = inv.quantity * inv.currentPrice;
      acc[inv.type] = (acc[inv.type] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const totalValue = Object.values(typeMap).reduce((sum, value) => sum + value, 0);

    return Object.entries(typeMap).map(([type, value]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  }, [investments]);

  return {
    investments,
    loading,
    error,
    addInvestment,
    sellInvestment,
    addDividend,
    addInterest,
    updateInvestmentPrice,
    getInvestmentWithReturns,
    getPortfolioStats,
    getInvestmentsByType,
    refresh: () => {
      // In real app, this would reload from database
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  };
};
