import React, { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '../types';
import { useTransactions } from '../hooks/useTransactions';
import { AddTransactionModal } from './AddTransactionModal';
import { formatCurrency } from '../utils/currency';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const { transactions } = useTransactions();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return transactions.filter(t => t.date.startsWith(dateStr));
  };

  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    return dayTransactions.reduce((total, t) => {
      return total + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetails(true);
  };

  const handleAddTransaction = () => {
    setShowAddTransaction(false);
    setShowDayDetails(false);
    setSelectedDate(null);
  };

  const handleCloseDetails = () => {
    setShowDayDetails(false);
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: JSX.Element[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-24 border border-gray-200 dark:border-gray-700" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTransactions = getTransactionsForDate(date);
      const dayTotal = getDayTotal(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-16 sm:h-24 border border-gray-200 dark:border-gray-700 p-1 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
          } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
          }`}>
            {day}
          </div>
          
          {dayTransactions.length > 0 ? (
            <div className="space-y-1">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {dayTransactions.length} transaction{dayTransactions.length !== 1 ? 's' : ''}
              </div>
              <div className={`text-xs font-medium ${
                dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(dayTotal))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Calendar View
          </h2>
        </div>
        
        <div className="flex items-center justify-center sm:justify-end space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white min-w-[150px] sm:min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Day Details Modal */}
      {showDayDetails && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {(() => {
                const dayTransactions = getTransactionsForDate(selectedDate);
                const dayTotal = getDayTotal(selectedDate);
                
                return (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Transactions ({dayTransactions.length})
                        </h3>
                        <div className={`text-lg font-semibold ${
                          dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {dayTotal >= 0 ? '+' : ''}{formatCurrency(dayTotal)}
                        </div>
                      </div>
                      
                      {dayTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Calendar className="h-12 w-12 mx-auto" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            No transactions on this day
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${
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
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {transaction.category}
                                  </p>
                                </div>
                              </div>
                              <div className={`font-semibold ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Transaction for This Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <AddTransactionModal
          onClose={handleAddTransaction}
        />
      )}
    </div>
  );
};




















