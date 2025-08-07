import { Transaction, Investment, InvestmentTransaction } from '../types';

/**
 * Service for managing investment-related transactions
 * Handles the integration between investment records and transaction records
 */
export class InvestmentTransactionService {
  
  /**
   * Creates a transaction record when buying an investment
   */
  static createBuyTransaction(
    investment: Investment,
    quantity: number,
    price: number,
    fees: number = 0,
    fromAccountId: string
  ): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    const totalAmount = (quantity * price) + fees;
    
    return {
      amount: totalAmount,
      type: 'investment_buy',
      category: 'Investment',
      subcategory: this.getInvestmentSubcategory(investment.type),
      description: `Bought ${quantity} ${investment.type === 'mutual_fund' ? 'units' : 'shares'} of ${investment.name} (${investment.symbol}) at ₹${price}${fees > 0 ? ` + ₹${fees} fees` : ''}`,
      date: new Date().toISOString().split('T')[0],
      tags: ['investment', investment.type, investment.symbol],
      accountId: fromAccountId,
      investmentId: investment.id
    };
  }

  /**
   * Creates a transaction record when selling an investment
   */
  static createSellTransaction(
    investment: Investment,
    quantity: number,
    price: number,
    fees: number = 0,
    toAccountId: string
  ): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    const totalAmount = (quantity * price) - fees;
    
    return {
      amount: totalAmount,
      type: 'investment_sell',
      category: 'Investment Income',
      subcategory: 'Capital Gains',
      description: `Sold ${quantity} ${investment.type === 'mutual_fund' ? 'units' : 'shares'} of ${investment.name} (${investment.symbol}) at ₹${price}${fees > 0 ? ` - ₹${fees} fees` : ''}`,
      date: new Date().toISOString().split('T')[0],
      tags: ['investment', investment.type, investment.symbol, 'sale'],
      accountId: toAccountId,
      investmentId: investment.id
    };
  }

  /**
   * Creates a transaction record for dividend income
   */
  static createDividendTransaction(
    investment: Investment,
    amount: number,
    toAccountId: string,
    date?: string
  ): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      amount: amount,
      type: 'dividend',
      category: 'Investment Income',
      subcategory: 'Dividends',
      description: `Dividend from ${investment.name} (${investment.symbol})`,
      date: date || new Date().toISOString().split('T')[0],
      tags: ['investment', 'dividend', investment.symbol],
      accountId: toAccountId,
      investmentId: investment.id
    };
  }

  /**
   * Creates a transaction record for interest income
   */
  static createInterestTransaction(
    investment: Investment,
    amount: number,
    toAccountId: string,
    date?: string
  ): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      amount: amount,
      type: 'interest',
      category: 'Investment Income',
      subcategory: 'Interest',
      description: `Interest from ${investment.name} (${investment.symbol})`,
      date: date || new Date().toISOString().split('T')[0],
      tags: ['investment', 'interest', investment.symbol],
      accountId: toAccountId,
      investmentId: investment.id
    };
  }

  /**
   * Gets the appropriate subcategory for an investment type
   */
  private static getInvestmentSubcategory(type: string): string {
    const subcategories = {
      stock: 'Stock Purchase',
      mutual_fund: 'Mutual Fund Purchase',
      bond: 'Bond Purchase',
      etf: 'ETF Purchase',
      crypto: 'Cryptocurrency Purchase',
      real_estate: 'Real Estate Purchase',
      commodity: 'Commodity Purchase'
    };
    return subcategories[type as keyof typeof subcategories] || 'Investment Purchase';
  }

  /**
   * Calculates the total cost basis for an investment including fees
   */
  static calculateTotalCost(quantity: number, price: number, fees: number = 0): number {
    return (quantity * price) + fees;
  }

  /**
   * Calculates the net proceeds from selling an investment after fees
   */
  static calculateNetProceeds(quantity: number, price: number, fees: number = 0): number {
    return (quantity * price) - fees;
  }

  /**
   * Gets investment categories for transaction forms
   */
  static getInvestmentCategories() {
    return {
      income: [
        {
          category: 'Investment Income',
          subcategories: ['Dividends', 'Interest', 'Capital Gains', 'Rental Income']
        }
      ],
      expense: [
        {
          category: 'Investment',
          subcategories: [
            'Stock Purchase',
            'Mutual Fund Purchase',
            'Bond Purchase',
            'ETF Purchase',
            'Cryptocurrency Purchase',
            'Real Estate Purchase',
            'Commodity Purchase',
            'Brokerage Fees',
            'Management Fees'
          ]
        }
      ]
    };
  }

  /**
   * Determines if a transaction is investment-related
   */
  static isInvestmentTransaction(transaction: Transaction): boolean {
    return ['investment_buy', 'investment_sell', 'dividend', 'interest'].includes(transaction.type) ||
           transaction.category === 'Investment' ||
           transaction.category === 'Investment Income' ||
           !!transaction.investmentId;
  }

  /**
   * Gets all transactions related to a specific investment
   */
  static getInvestmentTransactions(investmentId: string, transactions: Transaction[]): Transaction[] {
    return transactions.filter(t => t.investmentId === investmentId);
  }

  /**
   * Calculates total dividends received for an investment
   */
  static calculateTotalDividends(investmentId: string, transactions: Transaction[]): number {
    return transactions
      .filter(t => t.investmentId === investmentId && t.type === 'dividend')
      .reduce((total, t) => total + t.amount, 0);
  }

  /**
   * Calculates total interest received for an investment
   */
  static calculateTotalInterest(investmentId: string, transactions: Transaction[]): number {
    return transactions
      .filter(t => t.investmentId === investmentId && t.type === 'interest')
      .reduce((total, t) => total + t.amount, 0);
  }

  /**
   * Calculates total fees paid for an investment
   */
  static calculateTotalFees(investmentId: string, transactions: Transaction[]): number {
    return transactions
      .filter(t => 
        t.investmentId === investmentId && 
        (t.subcategory === 'Brokerage Fees' || t.subcategory === 'Management Fees')
      )
      .reduce((total, t) => total + t.amount, 0);
  }

  /**
   * Gets the effective return including dividends and interest
   */
  static calculateTotalReturn(
    investment: Investment,
    transactions: Transaction[]
  ): {
    capitalGain: number;
    dividends: number;
    interest: number;
    totalReturn: number;
    totalReturnPercentage: number;
  } {
    const currentValue = investment.quantity * investment.currentPrice;
    const totalCost = investment.quantity * investment.purchasePrice;
    const capitalGain = currentValue - totalCost;
    
    const dividends = this.calculateTotalDividends(investment.id, transactions);
    const interest = this.calculateTotalInterest(investment.id, transactions);
    
    const totalReturn = capitalGain + dividends + interest;
    const totalReturnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      capitalGain,
      dividends,
      interest,
      totalReturn,
      totalReturnPercentage
    };
  }
}
