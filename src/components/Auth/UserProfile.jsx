import React, { useState } from 'react';

const UserProfile = ({ user, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(user.preferences || {});

  const handleSavePreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preferences })
      });

      if (response.ok) {
        onUpdateProfile({ ...user, preferences });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {user.name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {user.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              {user.isGoogleLinked && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Google Linked
                </span>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Preferences
            </h4>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Dark Mode
                </span>
                <input
                  type="checkbox"
                  checked={preferences.theme === 'dark'}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    theme: e.target.checked ? 'dark' : 'light'
                  })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Notifications
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>

            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-300"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-all duration-300"
              >
                Edit Preferences
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onLogout}
              className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;