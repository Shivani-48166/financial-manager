import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseService } from '../services/database';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  setupPin: (pin: string) => Promise<void>;
  hasPin: boolean;
  biometricEnabled: boolean;
  enableBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState<number | null>(null);

  const db = DatabaseService.getInstance();

  useEffect(() => {
    checkExistingPin();
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      resetAutoLockTimer();
      
      // Add activity listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const resetTimer = () => resetAutoLockTimer();
      
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
        if (autoLockTimer) {
          clearTimeout(autoLockTimer);
        }
      };
    }
  }, [isAuthenticated]);

  const checkExistingPin = async () => {
    try {
      const storedPin = localStorage.getItem('fm_pin_hash');
      setHasPin(!!storedPin);
    } catch (error) {
      console.error('Error checking existing PIN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricEnabled(available && localStorage.getItem('fm_biometric_enabled') === 'true');
    }
  };

  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const setupPin = async (pin: string): Promise<void> => {
    try {
      const hashedPin = await hashPin(pin);
      localStorage.setItem('fm_pin_hash', hashedPin);
      setHasPin(true);
    } catch (error) {
      console.error('Error setting up PIN:', error);
      throw new Error('Failed to setup PIN');
    }
  };

  const login = async (pin: string): Promise<boolean> => {
    try {
      const hashedPin = await hashPin(pin);
      const storedHash = localStorage.getItem('fm_pin_hash');
      
      if (hashedPin === storedHash) {
        await db.initialize(pin);
        setIsAuthenticated(true);
        resetAutoLockTimer();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
      setAutoLockTimer(null);
    }
  };

  const resetAutoLockTimer = () => {
    if (autoLockTimer) {
      clearTimeout(autoLockTimer);
    }
    
    const autoLockMinutes = parseInt(localStorage.getItem('fm_auto_lock') || '15');
    
    // Temporary: disable auto-lock for debugging
    if (autoLockMinutes <= 0) return;
    
    const timer = setTimeout(() => {
      logout();
    }, autoLockMinutes * 60 * 1000);
    
    setAutoLockTimer(timer);
  };

  const enableBiometric = async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported');
      }

      // Store the PIN for biometric login
      const storedPin = localStorage.getItem('fm_pin_hash');
      if (!storedPin) {
        throw new Error('No PIN found');
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'Financial Manager',
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: 'user@financialmanager.app',
            displayName: 'Financial Manager User',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
          attestation: 'none',
        },
      });

      if (credential) {
        localStorage.setItem('fm_biometric_enabled', 'true');
        localStorage.setItem('fm_biometric_id', btoa(String.fromCharCode(...new Uint8Array((credential as PublicKeyCredential).rawId))));
        setBiometricEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric setup error:', error);
      return false;
    }
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    try {
      const credentialId = localStorage.getItem('fm_biometric_id');
      if (!credentialId) {
        throw new Error('No biometric credential found');
      }

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        // Get the stored encrypted PIN for biometric login
        const storedPin = localStorage.getItem('fm_biometric_pin');
        if (storedPin) {
          // Decode the stored PIN and use it to login
          const pin = atob(storedPin);
          await db.initialize(pin);
          setIsAuthenticated(true);
          resetAutoLockTimer();
          return true;
        } else {
          // First time setup - ask for PIN once and store it
          const pin = prompt('Enter your PIN to complete biometric setup:');
          if (!pin) return false;
          
          const success = await login(pin);
          if (success) {
            localStorage.setItem('fm_biometric_pin', btoa(pin));
          }
          return success;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    setupPin,
    hasPin,
    biometricEnabled,
    enableBiometric,
    loginWithBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
  
  throw new Error('useAuth must be used within an AuthProvider');
  
}
  
return context;
};












