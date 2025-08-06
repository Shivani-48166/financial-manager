import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { DatabaseService } from '../services/database';

interface DeleteUserAccountModalProps {
  onClose: () => void;
  onAccountDeleted: () => void;
}

export const DeleteUserAccountModal: React.FC<DeleteUserAccountModalProps> = ({ 
  onClose, 
  onAccountDeleted 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const db = DatabaseService.getInstance();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await db.deleteUserAccount();
      onAccountDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Delete Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {step === 'warning' ? (
            <>
              <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                    Permanent Account Deletion
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This action cannot be undone and will permanently delete your account.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  The following data will be permanently deleted:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    All financial accounts and balances
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    All transaction history
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    All budgets and financial goals
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Your PIN and security settings
                  </li>
                  <li className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    All app preferences and settings
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> Make sure to export your data if you want to keep a backup before proceeding.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continue to Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Final Confirmation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This will permanently delete your account and all associated data.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="DELETE MY ACCOUNT"
                  autoComplete="off"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('warning')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  disabled={loading || confirmText !== 'DELETE MY ACCOUNT'}
                >
                  {loading ? 'Deleting Account...' : 'Delete My Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
