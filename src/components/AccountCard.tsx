import React, { FC, useState } from 'react';
import { CreditCard, Wallet, Building, PiggyBank, MoreVertical } from 'lucide-react';
import { Account } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { AccountOptionsMenu } from './AccountOptionsMenu';
import { EditAccountModal } from './EditAccountModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { ViewTransactionsModal } from './ViewTransactionsModal';

interface AccountCardProps {
  account: Account;
}

export const AccountCard: FC<AccountCardProps> = ({ account }) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewTransactionsModal, setShowViewTransactionsModal] = useState(false);
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'investment':
        return <Building className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-500';
      case 'savings':
        return 'bg-green-500';
      case 'credit':
        return 'bg-red-500';
      case 'investment':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleViewTransactions = () => {
    setShowViewTransactionsModal(true);
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${getAccountColor(account.type)} p-2 rounded-lg text-white`}>
              {getAccountIcon(account.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{account.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.type}</p>
            </div>
          </div>
          <div className="text-right relative">
            <p className={`font-semibold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(account.balance)}
            </p>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AccountOptionsMenu
              account={account}
              isOpen={showOptionsMenu}
              onClose={() => setShowOptionsMenu(false)}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteModal(true)}
              onViewTransactions={handleViewTransactions}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showViewTransactionsModal && (
        <ViewTransactionsModal
          account={account}
          onClose={() => setShowViewTransactionsModal(false)}
        />
      )}

      {showEditModal && (
        <EditAccountModal
          account={account}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          account={account}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};