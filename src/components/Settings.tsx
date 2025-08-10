import React, { useState } from 'react';
import { Download, Upload, Shield, Moon, Sun, Smartphone, LogOut, Palette, Trash2 } from 'lucide-react';
import { DeleteUserAccountModal } from './DeleteUserAccountModal';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/database';
import { EncryptionService } from '../services/encryption';
import { useColorScheme } from '../contexts/ColorSchemeContext';

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('fm_theme') || 'system');
  const { colorScheme, setColorScheme } = useColorScheme();
  const [autoLock, setAutoLock] = useState(localStorage.getItem('fm_auto_lock') || '15');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const { biometricEnabled, enableBiometric, logout } = useAuth();
  const db = DatabaseService.getInstance();

  const colorSchemes = [
    { id: 'blue', name: 'Teal & Mint', primary: 'bg-teal-500', secondary: 'bg-emerald-200' },
    { id: 'green', name: 'Zinc', primary: 'bg-zinc-500', secondary: 'bg-zinc-100' },
    { id: 'purple', name: 'Neutral', primary: 'bg-neutral-500', secondary: 'bg-neutral-100' },
    { id: 'slate', name: 'Stone', primary: 'bg-stone-500', secondary: 'bg-stone-100' },
    { id: 'teal', name: 'Cool', primary: 'bg-blue-gray-500', secondary: 'bg-blue-gray-100' },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('fm_theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleColorSchemeChange = (newColorScheme: string) => {
    setColorScheme(newColorScheme as any);
    setMessage({ type: 'success', text: 'Color scheme updated!' });
  };

  const handleAutoLockChange = (minutes: string) => {
    setAutoLock(minutes);
    localStorage.setItem('fm_auto_lock', minutes);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleAccountDeleted = () => {
    // Reload the page to reset the app state
    window.location.reload();
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const pin = prompt('Enter your PIN to export data:');
      if (!pin) return;

      const data = await db.exportAllData();
      const encryptedBackup = await EncryptionService.createEncryptedBackup(data, pin);
      
      const blob = new Blob([encryptedBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-backup-${new Date().toISOString().split('T')[0]}.pfencrypt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please check your PIN.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage(null);

      const pin = prompt('Enter your PIN to import data:');
      if (!pin) return;

      const fileContent = await file.text();
      const data = await EncryptionService.restoreFromEncryptedBackup(fileContent, pin);
      await db.importAllData(data);

      setMessage({ type: 'success', text: 'Data imported successfully! Please refresh the page.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import data. Please check your file and PIN.' });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleEnableBiometric = async () => {
    try {
      setLoading(true);
      const success = await enableBiometric();
      if (success) {
        setMessage({ type: 'success', text: 'Biometric authentication enabled!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to enable biometric authentication.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Biometric authentication not supported on this device.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-2 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Sun className="h-5 w-5 mr-2" />
          Appearance
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Palette className="h-4 w-4 inline mr-1" />
              Color Scheme
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => handleColorSchemeChange(scheme.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    colorScheme === scheme.id
                      ? 'border-gray-400 dark:border-gray-500'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${scheme.primary} mb-2`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{scheme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-lock after (minutes)
            </label>
            <select
              value={autoLock}
              onChange={(e) => handleAutoLockChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          {!biometricEnabled && (
            <div>
              <button
                onClick={handleEnableBiometric}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Enable Biometric Login
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Use fingerprint or face recognition to unlock the app
              </p>
            </div>
          )}

          {biometricEnabled && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <Smartphone className="h-4 w-4 mr-2" />
              Biometric authentication is enabled
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
            
            <label className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
              <input
                type="file"
                accept=".pfencrypt"
                onChange={handleImportData}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>• Export creates an encrypted backup file (.pfencrypt)</p>
            <p>• Import requires the same PIN used during export</p>
            <p>• All data is encrypted and stored locally on your device</p>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account
        </h2>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          You will need to enter your PIN again to access the app
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
        <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          About Financial Manager
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>Version 1.0.0</p>
          <p>Privacy-focused offline-first personal finance manager</p>
          <p>All data is encrypted and stored locally on your device</p>
          <p>No data is sent to external servers</p>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <DeleteUserAccountModal
          onClose={() => setShowDeleteAccountModal(false)}
          onAccountDeleted={handleAccountDeleted}
        />
      )}
    </div>
  );
};




