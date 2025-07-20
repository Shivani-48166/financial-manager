import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import { Transaction, Account } from '../types';

interface FakeVaultModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onFakeDataUpdate: (data: { accounts: Account[], transactions: Transaction[] }) => void;
}

export const FakeVaultMode: React.FC<FakeVaultModeProps> = ({ isActive, onToggle, onFakeDataUpdate }) => {
  const [fakePin, setFakePin] = useState('');
  const [showFakePin, setShowFakePin] = useState(false);
  const [fakeData, setFakeData] = useState({
    accounts: [] as Account[],
    transactions: [] as Transaction[],
    totalBalance: 0
  });

  useEffect(() => {
    generateFakeData();
  }, []);

  useEffect(() => {
    if (isActive) {
      onFakeDataUpdate(fakeData);
    }
  }, [isActive, fakeData, onFakeDataUpdate]);

  const generateFakeData = () => {
    const fakeAccounts: Account[] = [
      {
        id: 'fake-1',
        name: 'Checking Account',
        type: 'checking',
        balance: 2450.75,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fake-2',
        name: 'Savings Account',
        type: 'savings',
        balance: 8920.30,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const fakeTransactions: Transaction[] = [
      {
        id: 'fake-t1',
        amount: 45.67,
        type: 'expense',
        category: 'Food',
        description: 'Grocery shopping',
        accountId: 'fake-1',
        date: new Date().toISOString(),
        tags: ['groceries'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fake-t2',
        amount: 3200.00,
        type: 'income',
        category: 'Salary',
        description: 'Monthly salary',
        accountId: 'fake-1',
        date: new Date().toISOString(),
        tags: ['salary'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setFakeData({
      accounts: fakeAccounts,
      transactions: fakeTransactions,
      totalBalance: fakeAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    });
  };

  const handleToggleFakeMode = () => {
    if (!isActive && !fakePin) {
      alert('Please set a fake PIN first');
      return;
    }
    onToggle(!isActive);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fake Vault Mode
          </h2>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Security Feature
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This feature creates a decoy financial profile to protect your real data in case of coercion.
                When fake vault mode is active, entering the fake PIN will show dummy financial data instead of your real information.
              </p>
            </div>
          </div>
        </div>

        {/* Fake Vault Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Fake Vault Status
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fake PIN
              </label>
              <div className="relative">
                <input
                  type={showFakePin ? 'text' : 'password'}
                  value={fakePin}
                  onChange={(e) => setFakePin(e.target.value)}
                  placeholder="Enter fake PIN (different from real PIN)"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowFakePin(!showFakePin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showFakePin ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                This PIN should be different from your real PIN and easy to remember under pressure
              </p>
            </div>

            <button
              onClick={handleToggleFakeMode}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isActive ? 'Disable Fake Vault Mode' : 'Enable Fake Vault Mode'}
            </button>
          </div>
        </div>

        {/* Fake Data Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Fake Data Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is what someone would see if they entered the fake PIN:
          </p>

          <div className="space-y-4">
            {/* Fake Balance */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Balance
              </h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${fakeData.totalBalance.toLocaleString()}
              </p>
            </div>

            {/* Fake Accounts */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accounts ({fakeData.accounts.length})
              </h4>
              <div className="space-y-2">
                {fakeData.accounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {account.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${account.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake Transactions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Transactions ({fakeData.transactions.length})
              </h4>
              <div className="space-y-2">
                {fakeData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {transaction.category}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateFakeData}
            className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Generate New Fake Data
          </button>
        </div>
      </div>
    </div>
  );
};



