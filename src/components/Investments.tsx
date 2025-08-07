import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useInvestments } from '../hooks/useInvestments';
import { formatCurrency } from '../utils/currency';
import { AddInvestmentModal } from './AddInvestmentModal';
import { InvestmentCard } from './InvestmentCard';
import { Investment, InvestmentTransaction } from '../types';

export const Investments: React.FC = () => {
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'holdings' | 'transactions'>('overview');
  const { accounts } = useAccounts();
  const {
    investments,
    loading,
    error,
    addInvestment,
    getPortfolioStats,
    getInvestmentsByType
  } = useInvestments();

  const investmentAccounts = accounts.filter(account => account.type === 'investment');
  const portfolioStats = getPortfolioStats();
  const investmentsByType = getInvestmentsByType();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track and manage your investment portfolio
          </p>
        </div>
        <button
          onClick={() => setShowAddInvestment(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Value
            </h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Cost
            </h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalCost)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Gain/Loss
            </h3>
            <div className={`p-2 rounded-full ${
              portfolioStats.totalGainLoss >= 0
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {portfolioStats.totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${
            portfolioStats.totalGainLoss >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioStats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalGainLoss)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Capital Gain %
            </h3>
            <div className={`p-2 rounded-full ${
              portfolioStats.totalGainLossPercentage >= 0
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <BarChart3 className={`h-4 w-4 ${
                portfolioStats.totalGainLossPercentage >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${
            portfolioStats.totalGainLossPercentage >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioStats.totalGainLossPercentage >= 0 ? '+' : ''}{portfolioStats.totalGainLossPercentage.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Return
            </h3>
            <div className={`p-2 rounded-full ${
              portfolioStats.totalReturn >= 0
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <Target className={`h-4 w-4 ${
                portfolioStats.totalReturn >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${
            portfolioStats.totalReturn >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolioStats.totalReturn >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalReturn)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Incl. dividends & interest
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: PieChart },
            { id: 'holdings', name: 'Holdings', icon: BarChart3 },
            { id: 'transactions', name: 'Transactions', icon: DollarSign }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Allocation</h3>
            <div className="space-y-3">
              {investmentsByType.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Performers</h3>
            <div className="space-y-3">
              {investments
                .map(inv => ({
                  ...inv,
                  gainLoss: (inv.currentPrice - inv.purchasePrice) * inv.quantity,
                  gainLossPercentage: ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100
                }))
                .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
                .slice(0, 5)
                .map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{inv.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        inv.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss)}
                      </p>
                      <p className={`text-xs ${
                        inv.gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inv.gainLossPercentage >= 0 ? '+' : ''}{inv.gainLossPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'holdings' && (
        <div className="grid gap-4">
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No investments yet</p>
              <button
                onClick={() => setShowAddInvestment(true)}
                className="mt-4 btn-primary"
              >
                Add Your First Investment
              </button>
            </div>
          ) : (
            investments.map(investment => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))
          )}
        </div>
      )}

      {selectedView === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No investment transactions yet</p>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddInvestment && (
        <AddInvestmentModal
          onClose={() => setShowAddInvestment(false)}
          investmentAccounts={investmentAccounts}
        />
      )}
    </div>
  );
};
