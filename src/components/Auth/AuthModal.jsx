import React, { useState } from 'react';
import GoogleLogin from './GoogleLogin';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState('google'); // 'google', 'login', 'register'
  const [error, setError] = useState('');

  const handleSuccess = (user) => {
    setError('');
    onSuccess(user);
    onClose();
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          >
            <span className="text-gray-600 dark:text-gray-300">×</span>
          </button>

          {/* Auth Mode Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setAuthMode('google')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                authMode === 'google'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                authMode === 'register'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Auth Content */}
          {authMode === 'google' && (
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
          )}
          {authMode === 'login' && (
            <Login onSuccess={handleSuccess} onError={handleError} />
          )}
          {authMode === 'register' && (
            <Register onSuccess={handleSuccess} onError={handleError} />
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
