import React, { useState, useEffect } from 'react';
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
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
 
  // Debug info on component mount
  useEffect(() => {
    setDebugInfo(`Environment: ${process.env.NODE_ENV || 'development'}, Auth available: ${!!login}`);
  }, [login]);

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
    // CRITICAL: Prevent form submission and page reload
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Login attempt started');
    setIsLoading(true);
    setLoginError('');
    
    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        console.log('Validation errors:', validationErrors);
        setErrors(validationErrors);
        return;
      }

      // Check if the user ID matches one of our predefined users
      const userConfig = predefinedUsers[formData.userId.toLowerCase()];
      
      if (!userConfig) {
        const errorMsg = 'Invalid User ID. Please use: user, admin, superadmin, or filler';
        console.log('Invalid user config:', formData.userId);
        setLoginError(errorMsg);
        return;
      }

      console.log('User config found:', userConfig);

      // Add delay to see what's happening
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Skip AuthContext for now and just navigate
      console.log('Attempting navigation to:', userConfig.route);
      
      // Use navigate with replace to avoid back button issues
      navigate(userConfig.route, { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative button click handler (bypass form submission)
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Button clicked - bypassing form');
    handleSubmit(e);
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

        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            Debug: {debugInfo}
          </div>
        )}

        {/* Login Form - NO form tag to prevent submission */}
        <div className="space-y-6">
          {loginError && (
            <div className="flex items-center text-red-600 mb-2 p-2 bg-red-50 rounded">
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleButtonClick(e);
                }
              }}
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleButtonClick(e);
                }
              }}
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

          {/* Button with explicit click handler */}
          <button
            type="button"
            onClick={handleButtonClick}
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

        {/* Demo User Guide */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Users:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>user</strong> (any password 6+ chars)</li>
            <li>• <strong>admin</strong> (any password 6+ chars)</li>
            <li>• <strong>superadmin</strong> (any password 6+ chars)</li>
            <li>• <strong>filler</strong> (any password 6+ chars)</li>
          </ul>
        </div>

        {/* Test Navigation Buttons */}
        <div className="mt-4 p-2 bg-yellow-50 rounded">
          <p className="text-xs text-yellow-800 mb-2">Quick Test (if above fails):</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => navigate('/login/requestuser')}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
            >
              Test User Route
            </button>
            <button 
              onClick={() => navigate('/login/requestadmin')}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded"
            >
              Test Admin Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;