import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
      
      months.push({
        month: format(date, 'MMM yyyy'),
        income: getTotalByType('income', start, end),
        expenses: getTotalByType('expense', start, end)
      });
    }
    return months;
  }, [getTotalByType]);

  return (
    <div className="space-y-6 p-2 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="btn-primary px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Total Income</h3>
          <p className="text-lg md:text-3xl font-bold text-success-600">${periodData.income.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Total Expenses</h3>
          <p className="text-lg md:text-3xl font-bold text-danger-600">${periodData.expenses.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow md:col-span-1 col-span-2">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Net Balance</h3>
          <p className={`text-lg md:text-3xl font-bold ${periodData.income - periodData.expenses >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            ${(periodData.income - periodData.expenses).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-4">Income vs Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={200} className="md:!h-[300px]">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} className="md:text-sm" />
              <YAxis tick={{ fontSize: 10 }} className="md:text-sm" />
              <Tooltip />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-4">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={200} className="md:!h-[300px]">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                className="md:!outerRadius-[80px]"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow col-span-1 lg:col-span-2">
        <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-4">6-Month Trend</h3>
        <div className="h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="md:text-sm" />
              <YAxis tick={{ fontSize: 10 }} className="md:text-sm" />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow">
        <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-4">Top Spending Categories</h3>
        <div className="space-y-2 md:space-y-3">
          {expensesByCategory.slice(0, 5).map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded mr-2 md:mr-3"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                ${category.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};









