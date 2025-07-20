import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const SecureDataWipe: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  const handleDataWipe = async () => {
    if (confirmText !== 'DELETE ALL DATA') return;
    
    setIsWiping(true);
    
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Clear all sessionStorage data
      sessionStorage.clear();
      
      // Clear IndexedDB if used
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve(undefined);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          })
        );
      }
      
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error('Error wiping data:', error);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Data Wipe
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This will permanently delete all your financial data, settings, and preferences.
            This action cannot be undone.
          </p>
        </div>

        {!showConfirmation ? (
          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-5 w-5" />
            <span>Wipe All Data</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm mb-3">
                To confirm data wipe, type: <strong>DELETE ALL DATA</strong>
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Type confirmation text"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                disabled={isWiping}
              >
                Cancel
              </button>
              <button
                onClick={handleDataWipe}
                disabled={confirmText !== 'DELETE ALL DATA' || isWiping}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWiping ? 'Wiping...' : 'Confirm Wipe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};