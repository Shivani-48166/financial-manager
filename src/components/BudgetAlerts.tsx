import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Settings } from 'lucide-react';
import { BudgetAlert } from '../types';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/formatCurrency';

export const BudgetAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    overspendingAlerts: true,
    budgetWarnings: true,
    billReminders: true,
    dailySummary: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const { budgets } = useBudgets();
  const { transactions } = useTransactions();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const sendNotification = (title: string, body: string, type: 'warning' | 'error' | 'info' = 'info') => {
    console.log('sendNotification called:', { title, body, type, notificationsEnabled });
    console.log('Notification permission:', Notification.permission);
    
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      alert('This browser does not support notifications');
      return;
    }

    if (!notificationsEnabled) {
      console.log('Notifications not enabled, requesting permission...');
      Notification.requestPermission().then(permission => {
        console.log('Permission result:', permission);
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          sendNotification(title, body, type);
        } else {
          alert('Please enable notifications to use this feature');
        }
      });
      return;
    }

    const icon = type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    try {
      const notification = new Notification(title, {
        body,
        icon: `/Nudgify_logo.jpg`,
        badge: `/Nudgify_logo.jpg`,
        tag: `budget-alert-${Date.now()}`,
      });
      console.log('Notification created successfully:', notification);
      
      notification.onclick = () => {
        console.log('Notification clicked');
        window.focus();
      };
      
    } catch (error) {
      console.error('Error sending notification:', error);
      alert(`Notification error: ${error.message}`);
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overspending':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'approaching_limit':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'bill_reminder':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'overspending':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'approaching_limit':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'bill_reminder':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Check for budget violations and generate alerts
  useEffect(() => {
    const checkBudgetAlerts = () => {
      const newAlerts: BudgetAlert[] = [];
      
      budgets.forEach(budget => {
        const percentage = (budget.spent / budget.amount) * 100;
        
        if (percentage >= 100 && alertSettings.overspendingAlerts) {
          newAlerts.push({
            id: `overspend-${budget.id}`,
            budgetId: budget.id,
            type: 'overspending',
            message: `You've exceeded your ${budget.categoryId} budget by ${formatCurrency(budget.spent - budget.amount)}`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          
          sendNotification(
            'Budget Exceeded!',
            `You've overspent on ${budget.categoryId}`,
            'error'
          );
        } else if (percentage >= budget.alertThreshold && alertSettings.budgetWarnings) {
          newAlerts.push({
            id: `warning-${budget.id}`,
            budgetId: budget.id,
            type: 'approaching_limit',
            message: `You're at ${percentage.toFixed(0)}% of your ${budget.categoryId} budget`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          
          sendNotification(
            'Budget Warning',
            `You're approaching your ${budget.categoryId} limit`,
            'warning'
          );
        }
      });
      
      setAlerts(prev => [...newAlerts, ...prev.filter(alert => 
        !newAlerts.some(newAlert => newAlert.budgetId === alert.budgetId)
      )]);
    };

    checkBudgetAlerts();
  }, [budgets, transactions, alertSettings]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Alerts
          </h2>
        </div>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Notification Status */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Browser Notifications
            </span>
          </div>
          <span className={`text-sm ${notificationsEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {!notificationsEnabled && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enable notifications to receive real-time budget alerts
          </p>
        )}
      </div>

      {/* Alert Settings */}
      {showSettings && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Alert Preferences
          </h3>
          <div className="space-y-3">
            {Object.entries(alertSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Alerts
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're staying within your budget limits. Great job!
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} ${
                !alert.isRead ? 'ring-2 ring-primary-500 ring-opacity-20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Notification Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            sendNotification(
              'Budget Alert Test',
              'This is a test notification to verify alerts are working.',
              'info'
            );
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Test Notification
        </button>
      </div>
    </div>
  );
};








