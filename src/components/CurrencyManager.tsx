import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { Currency } from '../types';

export const CurrencyManager: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }, // 4 hours ago
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }, // 6 hours ago
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.12, lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }, // 8 hours ago
  ]);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    rate: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [converterAmount, setConverterAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  useEffect(() => {
    if (converterAmount && !isNaN(parseFloat(converterAmount))) {
      const amount = parseFloat(converterAmount);
      const result = convertAmount(amount, fromCurrency, toCurrency);
      setConvertedAmount(result);
    } else {
      setConvertedAmount(null);
    }
  }, [converterAmount, fromCurrency, toCurrency, currencies]);

  const updateExchangeRates = async () => {
    setIsUpdating(true);
    try {
      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update currencies with real exchange rates
      const updatedCurrencies = currencies.map(currency => {
        if (currency.code === baseCurrency) {
          return { ...currency, rate: 1.0, lastUpdated: new Date().toISOString() };
        }
        
        const newRate = data.rates[currency.code];
        if (newRate) {
          return {
            ...currency,
            rate: newRate,
            lastUpdated: new Date().toISOString()
          };
        }
        
        // Keep existing rate if not found in API response
        return currency;
      });
      
      setCurrencies(updatedCurrencies);
      
      // Show success message (optional)
      console.log('Exchange rates updated successfully');
      
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      
      // Fallback to simulated updates if API fails
      const updatedCurrencies = currencies.map(currency => ({
        ...currency,
        rate: currency.code === baseCurrency ? 1.0 : currency.rate * (0.98 + Math.random() * 0.04),
        lastUpdated: new Date().toISOString()
      }));
      setCurrencies(updatedCurrencies);
      
      // You could show a toast notification here
      alert('Failed to fetch live rates. Using simulated data.');
    } finally {
      setIsUpdating(false);
    }
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    return (amount / fromRate) * toRate;
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const addCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol || !newCurrency.rate) {
      return;
    }

    const currency: Currency = {
      code: newCurrency.code.toUpperCase(),
      name: newCurrency.name,
      symbol: newCurrency.symbol,
      rate: parseFloat(newCurrency.rate),
      lastUpdated: new Date().toISOString()
    };

    setCurrencies(prev => [...prev, currency]);
    setNewCurrency({ code: '', name: '', symbol: '', rate: '' });
    setShowAddCurrency(false);
  };

  const editCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setNewCurrency({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rate: currency.rate.toString()
    });
  };

  const updateCurrency = () => {
    if (!editingCurrency || !newCurrency.code || !newCurrency.name || !newCurrency.symbol || !newCurrency.rate) {
      return;
    }

    setCurrencies(prev => prev.map(c => 
      c.code === editingCurrency.code 
        ? {
            ...c,
            name: newCurrency.name,
            symbol: newCurrency.symbol,
            rate: parseFloat(newCurrency.rate),
            lastUpdated: new Date().toISOString()
          }
        : c
    ));
    
    setEditingCurrency(null);
    setNewCurrency({ code: '', name: '', symbol: '', rate: '' });
  };

  const deleteCurrency = (code: string) => {
    if (code === baseCurrency) return;
    setCurrencies(prev => prev.filter(c => c.code !== code));
  };

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center space-x-4">
          <Globe className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Currency Manager
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={updateExchangeRates}
            disabled={isUpdating}
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>Update Rates</span>
          </button>
          <button
            onClick={() => setShowAddCurrency(true)}
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Currency</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Base Currency
        </label>
        <select
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {currencies.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {currencies.map((currency) => (
          <div key={currency.code} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl text-gray-900 dark:text-white">{currency.symbol}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {currency.code}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currency.name}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Exchange Rate:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      1 {baseCurrency} = {currency.rate.toFixed(4)} {currency.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formatLastUpdated(currency.lastUpdated)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => editCurrency(currency)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {currency.code !== baseCurrency && (
                  <button 
                    onClick={() => deleteCurrency(currency.code)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currency Converter */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Currency Converter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={converterAmount}
              onChange={(e) => setConverterAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        {convertedAmount !== null && (
          <div className="mt-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Converted Amount
            </h4>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {convertedAmount.toFixed(2)} {toCurrency}
            </p>
          </div>
        )}
      </div>

      {/* Add Currency Modal */}
      {(showAddCurrency || editingCurrency) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency Code</label>
                <input
                  type="text"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, code: e.target.value }))}
                  disabled={!!editingCurrency}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    editingCurrency ? 'bg-gray-100' : ''
                  }`}
                  placeholder="USD"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Currency Name</label>
                <input
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="US Dollar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="$"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Exchange Rate (to {baseCurrency})</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newCurrency.rate}
                  onChange={(e) => setNewCurrency(prev => ({ ...prev, rate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="1.0000"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingCurrency ? updateCurrency : addCurrency}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingCurrency ? 'Update' : 'Add'} Currency
              </button>
              <button
                onClick={() => {
                  setShowAddCurrency(false);
                  setEditingCurrency(null);
                  setNewCurrency({ code: '', name: '', symbol: '', rate: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};















