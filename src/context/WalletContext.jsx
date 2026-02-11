import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    try {
      console.log('Connect wallet clicked');
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        const errorMsg = 'MetaMask is not installed. Please install it to connect.';
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log('MetaMask detected, requesting accounts...');
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Accounts received:', accounts);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');
        console.log('Wallet connected:', accounts[0]);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('You rejected the wallet connection request.');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsConnected(false);
          localStorage.removeItem('walletConnected');
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const value = {
    account,
    isConnected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
