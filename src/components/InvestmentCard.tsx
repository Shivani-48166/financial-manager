import React from 'react';
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import { Investment } from '../types';
import { formatCurrency } from '../utils/currency';

interface InvestmentCardProps {
  investment: Investment;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment }) => {
  const currentValue = investment.quantity * investment.currentPrice;
  const totalCost = investment.quantity * investment.purchasePrice;
  const gainLoss = currentValue - totalCost;
  const gainLossPercentage = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;

  const getInvestmentTypeLabel = (type: string) => {
    const labels = {
      stock: 'Stock',
      mutual_fund: 'Mutual Fund',
      bond: 'Bond',
      etf: 'ETF',
      crypto: 'Cryptocurrency',
      real_estate: 'Real Estate',
      commodity: 'Commodity'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getInvestmentTypeColor = (type: string) => {
    const colors = {
      stock: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      mutual_fund: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      bond: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      etf: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      real_estate: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      commodity: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[type as keyof typeof colors] || colors.stock;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {investment.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInvestmentTypeColor(investment.type)}`}>
              {getInvestmentTypeLabel(investment.type)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {investment.symbol} • {investment.quantity} {investment.type === 'mutual_fund' ? 'units' : 'shares'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Purchased on {new Date(investment.purchaseDate).toLocaleDateString()}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Purchase Price
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(investment.purchasePrice)} / {investment.type === 'mutual_fund' ? 'unit' : 'share'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Current Price
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(investment.currentPrice)} / {investment.type === 'mutual_fund' ? 'unit' : 'share'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Total Cost
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Current Value
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(currentValue)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {gainLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
          )}
          <div>
            <p className={`text-sm font-semibold ${
              gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
            </p>
            <p className={`text-xs ${
              gainLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
            Buy More
          </button>
          <button className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};
