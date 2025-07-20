import React, { useState } from 'react';
import { Plus, CreditCard, Wallet, Building, PiggyBank, MoreVertical } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from './AccountCard';
import { AddAccountModal } from './AddAccountModal';
import { formatCurrency } from '../utils/currency';

export const Accounts: React.FC = () => {
  const { accounts, getTotalBalance } = useAccounts();
  const [showAddAccount, setShowAddAccount] = useState(false);

  const totalBalance = getTotalBalance();
  const accountsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  return (
    <div className="space-y-6 p-2 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all your financial accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="mt-4 sm:mt-0 btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-medium mb-2">Total Balance</h2>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-primary-100 mt-1">{accounts.length} accounts</p>
      </div>

      {/* Accounts by Type */}
      {Object.entries(accountsByType).map(([type, typeAccounts]) => (
        <div key={type} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
              {type} Accounts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {typeAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {accounts.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No accounts yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Add your first account to start tracking your finances
          </p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Account
          </button>
        </div>
      )}

      {/* Modal */}
      {showAddAccount && (
        <AddAccountModal onClose={() => setShowAddAccount(false)} />
      )}
    </div>
  );
};

