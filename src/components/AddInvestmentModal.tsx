import React, { useState } from 'react';
import { X, TrendingUp, PieChart, Building, Coins, Home, BarChart3 } from 'lucide-react';
import { Account } from '../types';
import { useInvestments } from '../hooks/useInvestments';

interface AddInvestmentModalProps {
  onClose: () => void;
  investmentAccounts: Account[];
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({
  onClose,
  investmentAccounts
}) => {
  const { addInvestment } = useInvestments();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'stock' as 'stock' | 'mutual_fund' | 'bond' | 'etf' | 'crypto' | 'real_estate' | 'commodity',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    accountId: investmentAccounts[0]?.id || '',
    currency: 'INR',
    fees: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.symbol || !formData.quantity || !formData.purchasePrice || !formData.accountId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const investmentData = {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        accountId: formData.accountId,
        currency: formData.currency
      };

      const fees = parseFloat(formData.fees) || 0;

      await addInvestment(investmentData, formData.accountId, fees);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  const investmentTypes = [
    { value: 'stock', label: 'Stock', icon: TrendingUp, description: 'Individual company shares' },
    { value: 'mutual_fund', label: 'Mutual Fund', icon: PieChart, description: 'Diversified fund portfolio' },
    { value: 'etf', label: 'ETF', icon: BarChart3, description: 'Exchange-traded fund' },
    { value: 'bond', label: 'Bond', icon: Building, description: 'Government or corporate bonds' },
    { value: 'crypto', label: 'Cryptocurrency', icon: Coins, description: 'Digital currencies' },
    { value: 'real_estate', label: 'Real Estate', icon: Home, description: 'Property investments' },
    { value: 'commodity', label: 'Commodity', icon: BarChart3, description: 'Gold, silver, oil, etc.' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Investment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Investment Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Investment Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {investmentTypes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: value as any })}
                  className={`flex items-start p-3 rounded-lg border transition-colors text-left ${
                    formData.type === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 mt-0.5 ${
                    formData.type === value
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      formData.type === value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Apple Inc."
                required
              />
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symbol/Code *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="e.g., AAPL"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-field"
                placeholder="0"
                required
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                className="input-field"
                placeholder="Same as purchase price"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to use purchase price
              </p>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Date *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brokerage Fees
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional transaction fees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investment Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Account *
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="input-field"
                required
              >
                {investmentAccounts.length === 0 ? (
                  <option value="">No investment accounts available</option>
                ) : (
                  investmentAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))
                )}
              </select>
              {investmentAccounts.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Create an investment account first in the Accounts section
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          {formData.quantity && formData.purchasePrice && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Investment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Investment Cost:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₹{(parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Fees:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₹{(parseFloat(formData.fees) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Cost:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₹{((parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)) + (parseFloat(formData.fees) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Current Value:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ₹{(parseFloat(formData.quantity) * parseFloat(formData.currentPrice || formData.purchasePrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || investmentAccounts.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
