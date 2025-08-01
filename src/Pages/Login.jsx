import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // Check if the user ID matches one of our predefined users
    const userConfig = predefinedUsers[formData.userId.toLowerCase()];
    
    if (!userConfig) {
      setLoginError('Invalid User ID. Please use: user, admin, superadmin, or filler');
      setIsLoading(false);
      return;
    }

    try {
      // For demo purposes, accept any password for predefined users
      // In production, you'd validate against a real backend
      if (formData.password.length >= 6) {
        // Call the login function from context
        if (login) {
          await login(formData.userId, formData.password, userConfig.role);
        }
        
        // Navigate based on the user's predefined route
        console.log('Navigating to:', userConfig.route); // Debug log
        navigate(userConfig.route, { replace: true });
      } else {
        setLoginError('Password must be at least 6 characters');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
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
        <div className="space-y-6">
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
              placeholder="Enter user ID (user, admin, superadmin, filler)"
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
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full px-6 py-3 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg transition-colors font-medium`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default Login;