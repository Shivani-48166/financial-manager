import { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

interface AddTransactionModalProps {
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                transactionType === 'expense'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                transactionType === 'income'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Income
            </button>
          </div>
          
          <TransactionForm
            type={transactionType}
            onClose={onClose}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
};







