import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const PinSetup: React.FC = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setupPin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be between 4 and 6 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setupPin(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-6">
            <img src="/rsz_nudgify_logo.png" alt="Financial Manager" className="h-32 w-32" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nudgify</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Nudge your finances to fly secure</p>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Setup Your PIN
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a secure PIN to protect your financial data
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                PIN (4-6 digits)
              </label>
              <div className="mt-1 relative">
                <input
                  id="pin"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your PIN"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm PIN
              </label>
              <div className="mt-1">
                <input
                  id="confirmPin"
                  name="confirmPin"
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your PIN"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup PIN'}
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>Your PIN is used to encrypt all your financial data locally.</p>
            <p>Make sure to remember it - it cannot be recovered if lost.</p>
          </div>
        </form>
      </div>
    </div>
  );
};












