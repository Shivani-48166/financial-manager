import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Tag } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';
import { useAccounts } from '../hooks/useAccounts';

interface TransactionListProps {
  transactions: Transaction[];
  showAccount?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  showAccount = false 
}) => {
  const { accounts } = useAccounts();

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          {/* Transaction Icon */}
          <div className={`flex-shrink-0 p-2 rounded-full ${
            transaction.type === 'income'
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
          }`}>
            {transaction.type === 'income' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {transaction.description}
                </p>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {transaction.category}
                  </span>

                  {showAccount && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {getAccountName(transaction.accountId)}
                    </span>
                  )}

                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(transaction.date), 'MMM dd')}
                  </div>
                </div>

                {/* Tags */}
                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="flex items-center mt-2">
                    <Tag className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs text-gray-500 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {transaction.tags.length > 2 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{transaction.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};