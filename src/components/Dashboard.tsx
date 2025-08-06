import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { AccountCard } from './AccountCard';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AddAccountModal } from './AddAccountModal';
import { TransactionList } from './TransactionList';
import { formatCurrency } from '../utils/currency';

export const Dashboard: React.FC = () => {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const recentTransactions = transactions.slice(0, 5);
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 p-2 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
          <button
            onClick={() => setShowAddAccount(true)}
            className="btn-primary justify-center text-sm py-2 px-3 sm:px-4 whitespace-nowrap"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Add Account</span>
            <span className="xs:hidden">Account</span>
          </button>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="btn-primary justify-center text-sm py-2 px-3 sm:px-4 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Add Transaction</span>
            <span className="xs:hidden">Transaction</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-3 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs lg:text-sm font-medium opacity-90">Total Balance</p>
              <p className="text-sm lg:text-3xl font-bold mt-1 lg:mt-2">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-lg lg:rounded-xl">
              <DollarSign className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl p-3 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs lg:text-sm font-medium opacity-90">Monthly Income</p>
              <p className="text-sm lg:text-3xl font-bold mt-1 lg:mt-2">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-lg lg:rounded-xl">
              <TrendingUp className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl lg:rounded-2xl p-3 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs lg:text-sm font-medium opacity-90">Monthly Expenses</p>
              <p className="text-sm lg:text-3xl font-bold mt-1 lg:mt-2">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-lg lg:rounded-xl">
              <TrendingDown className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl p-3 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs lg:text-sm font-medium opacity-90">Net Income</p>
              <p className="text-sm lg:text-3xl font-bold mt-1 lg:mt-2">{formatCurrency(monthlyIncome - monthlyExpenses)}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-lg lg:rounded-xl">
              <PiggyBank className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-w-0">
        {/* Accounts Section */}
        <div className="lg:col-span-2 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Accounts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your financial accounts
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {accounts.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">No accounts yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-sm mx-auto text-sm sm:text-base">
                    Connect your bank accounts or add manual accounts to start tracking your finances
                  </p>
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Add Your First Account
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your latest transactions
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <TransactionList transactions={recentTransactions} showAccount />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddTransaction && (
        <AddTransactionModal onClose={() => setShowAddTransaction(false)} />
      )}
      {showAddAccount && (
        <AddAccountModal onClose={() => setShowAddAccount(false)} />
      )}
    </div>
  );
};
































