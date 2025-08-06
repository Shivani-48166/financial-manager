import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { transactions, getTotalByType } = useTransactions();

  const periodData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      income: getTotalByType('income', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
      expenses: getTotalByType('expense', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
    };
  }, [selectedPeriod, getTotalByType]);

  const categoryData = useMemo(() => {
    const filtered = transactions.filter(t => 
      t.date >= periodData.startDate && t.date <= periodData.endDate
    );

    const categoryTotals = filtered.reduce((acc, transaction) => {
      const key = transaction.category;
      if (!acc[key]) {
        acc[key] = { name: key, income: 0, expense: 0 };
      }
      acc[key][transaction.type] += transaction.amount;
      return acc;
    }, {} as Record<string, { name: string; income: number; expense: number }>);

    return Object.values(categoryTotals);
  }, [transactions, periodData]);

  const expensesByCategory = useMemo(() => {
    const filtered = transactions.filter(t => 
      t.type === 'expense' && 
      t.date >= periodData.startDate && 
      t.date <= periodData.endDate
    );

    const categoryTotals = filtered.reduce((acc, transaction) => {
      const key = transaction.category;
      acc[key] = (acc[key] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, periodData]);

  const monthlyTrend = useMemo(() => {
    const months: { month: string; income: number; expenses: number }[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');

      const income = getTotalByType('income', start, end);
      const expenses = getTotalByType('expense', start, end);

      months.push({
        month: format(date, 'MMM yyyy'),
        income: income,
        expenses: expenses
      });
    }

    // Debug: Log the monthly trend data
    console.log('Monthly Trend Data:', months);

    return months;
  }, [getTotalByType]);

  return (
    <div className="space-y-4 md:space-y-6 p-3 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Analyze your spending patterns and financial trends
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900 font-medium"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Income</h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ₹{periodData.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Expenses</h3>
              <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                ₹{periodData.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Net Balance</h3>
              <p className={`text-2xl md:text-3xl font-bold mt-2 ${
                periodData.income - periodData.expenses >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {periodData.income - periodData.expenses >= 0 ? '+' : ''}₹{Math.abs(periodData.income - periodData.expenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              periodData.income - periodData.expenses >= 0
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <svg className={`w-6 h-6 ${
                periodData.income - periodData.expenses >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">Income vs Expenses by Category</h3>
          <div className="h-[280px] md:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  className="md:text-sm"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  label={{ value: 'Categories', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle' } }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="md:text-sm"
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="rect"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  name="Income"
                  radius={[2, 2, 0, 0]}
                  label={{ position: 'top', fontSize: 10 }}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Expenses"
                  radius={[2, 2, 0, 0]}
                  label={{ position: 'top', fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">Expense Distribution</h3>
          <div className="h-[280px] md:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    percent > 5 ? `${name}\n${(percent * 100).toFixed(0)}%\n₹${value.toFixed(0)}` : ''
                  }
                  outerRadius="70%"
                  innerRadius="30%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  fontSize={10}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  formatter={(value, entry) => `${value} (₹${entry.payload.value.toFixed(0)})`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow xl:col-span-2">
        <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">6-Month Trend</h3>
        {monthlyTrend.every(month => month.income === 0 && month.expenses === 0) ? (
          <div className="h-[300px] md:h-[350px] lg:h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No transaction data available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add some transactions to see your 6-month trend</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] md:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  className="md:text-sm"
                  label={{ value: 'Month', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="md:text-sm"
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  domain={[0, 'dataMax']}
                  allowDataOverflow={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="line"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={4}
                  strokeDasharray="0"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6, stroke: '#ffffff' }}
                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#10b981' }}
                  name="Income"
                  connectNulls={false}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={4}
                  strokeDasharray="0"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 6, stroke: '#ffffff' }}
                  activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 3, fill: '#ef4444' }}
                  name="Expenses"
                  connectNulls={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {expensesByCategory.slice(0, 5).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {category.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-2">
                  ₹{category.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Daily Spending</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ₹{(periodData.expenses / 30).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {periodData.income > 0 ? (((periodData.income - periodData.expenses) / periodData.income) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {transactions.filter(t => t.date >= periodData.startDate && t.date <= periodData.endDate).length}
              </span>
            </div>
          </div>
        </div>

        {/* Budget vs Actual (placeholder for future feature) */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow md:col-span-2 xl:col-span-1">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-3 md:mb-4">Financial Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Income vs Expenses</span>
              <span className={`text-sm font-semibold ${periodData.income >= periodData.expenses ? 'text-green-600' : 'text-red-600'}`}>
                {periodData.income >= periodData.expenses ? 'Positive' : 'Negative'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Largest Expense</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {expensesByCategory.length > 0 ? expensesByCategory[0].name : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Period</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {selectedPeriod}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};









