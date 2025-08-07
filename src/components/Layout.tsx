import React, { useState } from 'react';
import { Menu, X, Home, CreditCard, TrendingUp, Settings, PieChart, Target, Calendar, DollarSign, Bell, Shield, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Accounts', id: 'accounts', icon: CreditCard },
    { name: 'Investments', id: 'investments', icon: BarChart3 },
    { name: 'Reports', id: 'reports', icon: TrendingUp },
    { name: 'Budget Planning', id: 'budget', icon: PieChart },
    { name: 'Savings Goals', id: 'goals', icon: Target },
    { name: 'Calendar', id: 'calendar', icon: Calendar },
    { name: 'Currency Manager', id: 'currency', icon: DollarSign },
    { name: 'Budget Alerts', id: 'alerts', icon: Bell },
    { name: 'Fake Vault', id: 'vault', icon: Shield },
    { name: 'Settings', id: 'settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col`}>
        <div className="flex flex-col items-center justify-center h-32 lg:h-64 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <img src="/rsz_nudgify_logo.png" alt="Financial Manager" className="h-16 w-16 lg:h-44 lg:w-44 mb-2" />
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary-dynamic dark:text-primary-300 mb-1">Nudgify</h1>
          <p className="text-sm lg:text-base text-text-primary-light-dynamic dark:text-primary-400 text-center">Nudge your finances to fly secure</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-8">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-primary-100 text-text-primary-dark dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg text-gray-400 hover:text-gray-500"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Page content starts from the very top */}
        <main className="p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
};
































