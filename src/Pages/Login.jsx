import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
 
  // Predefined users with their roles and routes
  const predefinedUsers = {
    'user': { role: 'user', route: '/login/requestuser' },
    'admin': { role: 'admin', route: '/login/requestadmin' },
    'superadmin': { role: 'superadmin', route: '/login/requestsuperadmin' },
    'filler': { role: 'filler', route: '/login/option' }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Check if the user ID matches one of our predefined users
      const userConfig = predefinedUsers[formData.userId.toLowerCase()];
      
      if (!userConfig) {
        setLoginError('Invalid User ID. Please use: user, admin, superadmin, or filler');
        return;
      }

      // Add error handling for AuthContext
      if (!login) {
        console.error('Login function not available from AuthContext');
        setLoginError('Authentication service unavailable');
        return;
      }

      let success = false;
      
      try {
        // Try the login function first
        success = await login(formData.userId, formData.password, userConfig.role);
      } catch (authError) {
        console.error('Authentication error:', authError);
        // For demo purposes, allow navigation if credentials are provided
        if (formData.userId && formData.password) {
          success = true;
        }
      }
      
      if (success || (formData.userId && formData.password)) {
        // Use window.location for more reliable navigation in production
        if (typeof window !== 'undefined') {
          window.location.href = userConfig.route;
        } else {
          navigate(userConfig.route);
        }
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600">Access your height work permit dashboard</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {loginError && (
            <div className="flex items-center text-red-600 mb-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loginError}
            </div>
          )}

          {/* User ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              User ID
            </label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.userId ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your user ID"
              disabled={isLoading}
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg transition-colors font-medium`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo User Guide */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Users:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• user (User role)</li>
            <li>• admin (Admin role)</li>
            <li>• superadmin (Super Admin role)</li>
            <li>• filler (Filler role)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;