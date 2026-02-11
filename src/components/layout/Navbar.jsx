import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import { useDarkMode } from '../../context/DarkModeContext';
import { useWallet } from '../../context/WalletContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { account, isConnected, loading, error, connectWallet, disconnectWallet, formatAddress } = useWallet();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="bg-white shadow-sm dark:bg-secondary-800">
      <div className="container">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-2 mb-2 rounded text-red-700 dark:text-red-200 text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg width="30" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="20" r="10" stroke="#0682ff"/>
                  <circle cx="15" cy="20" r="6" stroke="#0682ff" strokeWidth="3"/>
              </svg>  
              <span className="text-2xl font-bold text-primary-600 mt-1.5">GoldenCity</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium dark:text-secondary-300 dark:hover:text-primary-400"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 rounded-lg text-sm font-medium">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Disconnect wallet"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Connect'}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={toggleDarkMode}
              className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              type="button"
              className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden dark:bg-secondary-700">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50 dark:text-secondary-300 dark:hover:text-primary-400 dark:hover:bg-secondary-600"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isConnected && (
                <button
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
                  onClick={() => {
                    connectWallet();
                    setIsOpen(false);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Connect Wallet'}
                </button>
              )}
              {isConnected && (
                <>
                  <div className="px-3 py-2 text-base font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-700 rounded">
                    {formatAddress(account)}
                  </div>
                  <button
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-secondary-700 flex items-center"
                    onClick={() => {
                      disconnectWallet();
                      setIsOpen(false);
                    }}
                  >
                    <FiLogOut className="mr-2" />
                    Disconnect Wallet
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;