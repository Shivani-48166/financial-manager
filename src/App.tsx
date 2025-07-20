import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ColorSchemeProvider } from './contexts/ColorSchemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { PinSetup } from './components/PinSetup';
import { PinLogin } from './components/PinLogin';
import { DatabaseService } from './services/database';
import { useAccounts } from './hooks/useAccounts';
import { Accounts } from './components/Accounts';
import { BudgetPlanning } from './components/BudgetPlanning';
import { SavingsGoals } from './components/SavingsGoals';
import { CalendarView } from './components/CalendarView';
import { CurrencyManager } from './components/CurrencyManager';
import { BudgetAlerts } from './components/BudgetAlerts';
import { FakeVaultMode } from './components/FakeVaultMode';
import { Account, Transaction } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [fakeVaultActive, setFakeVaultActive] = useState(false);
  const [fakeData, setFakeData] = useState<{ accounts: Account[], transactions: Transaction[] }>({ accounts: [], transactions: [] });
  const { isAuthenticated, isLoading, hasPin } = useAuth();
  const { accounts, addAccount } = useAccounts();

  function handleFakeDataUpdate(data: { accounts: Account[]; transactions: Transaction[]; }) {
    setFakeData(data);
  }

  // Initialize default account if none exists
  useEffect(() => {
    if (isAuthenticated && accounts.length === 0) {
      addAccount({
        name: 'Main Account',
        type: 'checking',
        balance: 0,
        currency: 'USD'
      }).catch(console.error);
    }
  }, [isAuthenticated, accounts.length, addAccount]);

  // Apply theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('fm_theme') || 'system';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <img src="/rsz_nudgify_logo.png" alt="Financial Manager" className="h-56 w-56 mb-4" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hasPin) {
    return <PinSetup />;
  }

  if (!isAuthenticated) {
    return <PinLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'reports':
        return <Reports />;
      case 'budget':
        return <BudgetPlanning />;
      case 'goals':
        return <SavingsGoals />;
      case 'calendar':
        return <CalendarView />;
      case 'currency':
        return <CurrencyManager />;
      case 'alerts':
        return <BudgetAlerts />;
      case 'vault':
        return (
          <FakeVaultMode 
            isActive={fakeVaultActive} 
            onToggle={setFakeVaultActive}
            onFakeDataUpdate={handleFakeDataUpdate}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <AppContent />
      </ColorSchemeProvider>
    </AuthProvider>
  );
};

export default App;

















