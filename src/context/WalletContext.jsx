import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const wasConnected = localStorage.getItem('walletConnected');
      
      if (typeof window !== 'undefined' && window.ethereum && wasConnected === 'true') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.warn(err.message || 'Failed to check wallet connection');
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window === 'undefined' || !window.ethereum) {
        const errorMsg = 'MetaMask is not installed. Please install it to connect.';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('You rejected the wallet connection request.');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (revokeError) {
          // Method not supported, continue with app state cleanup
        }
      }
      
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('walletConnected');
    } catch (err) {
      console.warn(err.message || 'Failed to disconnect wallet');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        const wasConnected = localStorage.getItem('walletConnected') === 'true';
        
        if (accounts.length === 0) {
          setAccount(null);
          setIsConnected(false);
          localStorage.removeItem('walletConnected');
        } else if (wasConnected) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
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
