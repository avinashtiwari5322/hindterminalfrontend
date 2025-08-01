import React, { useState, useEffect } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Add debug info
  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`DEBUG: ${message}`);
  };

  useEffect(() => {
    addDebugInfo(`Component mounted - Environment: ${process.env.NODE_ENV || 'development'}`);
    addDebugInfo(`Auth available: ${!!login}`);
    addDebugInfo(`Current URL: ${window.location.href}`);
    addDebugInfo(`Base URL: ${window.location.origin}`);
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

  // Method 1: React Router Navigate
  const handleNavigateMethod = async (userConfig) => {
    try {
      addDebugInfo(`Method 1: Using navigate() to ${userConfig.route}`);
      navigate(userConfig.route, { replace: true });
      
      // Check if navigation actually happened after a delay
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          addDebugInfo('Navigation FAILED - still on login page');
        } else {
          addDebugInfo(`Navigation SUCCESS - now on ${window.location.pathname}`);
        }
      }, 1000);
    } catch (error) {
      addDebugInfo(`Navigate method failed: ${error.message}`);
    }
  };

  // Method 2: Window Location
  const handleWindowLocationMethod = (userConfig) => {
    try {
      addDebugInfo(`Method 2: Using window.location.href to ${userConfig.route}`);
      window.location.href = userConfig.route;
    } catch (error) {
      addDebugInfo(`Window location method failed: ${error.message}`);
    }
  };

  // Method 3: Window Location with full URL
  const handleFullUrlMethod = (userConfig) => {
    try {
      const fullUrl = `${window.location.origin}${userConfig.route}`;
      addDebugInfo(`Method 3: Using full URL: ${fullUrl}`);
      window.location.href = fullUrl;
    } catch (error) {
      addDebugInfo(`Full URL method failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addDebugInfo('Login attempt started');
    setIsLoading(true);
    setLoginError('');
    
    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        addDebugInfo('Validation failed');
        setErrors(validationErrors);
        return;
      }

      const userConfig = predefinedUsers[formData.userId.toLowerCase()];
      
      if (!userConfig) {
        const errorMsg = 'Invalid User ID. Please use: user, admin, superadmin, or filler';
        addDebugInfo('Invalid user config');
        setLoginError(errorMsg);
        return;
      }

      addDebugInfo(`User config found: ${JSON.stringify(userConfig)}`);

      // Try Method 1 first
      await handleNavigateMethod(userConfig);
      
    } catch (error) {
      addDebugInfo(`Login error: ${error.message}`);
      setLoginError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
              <p className="text-gray-600">Access your height work permit dashboard</p>
            </div>

            <div className="space-y-6">
              {loginError && (
                <div className="flex items-center text-red-600 mb-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {loginError}
                </div>
              )}

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
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full px-6 py-3 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-lg transition-colors font-medium`}
              >
                {isLoading ? 'Signing In...' : 'Sign In (Method 1: Navigate)'}
              </button>

              {/* Alternative Methods */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const userConfig = predefinedUsers[formData.userId?.toLowerCase()];
                    if (userConfig) handleWindowLocationMethod(userConfig);
                  }}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Method 2: Window Location
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const userConfig = predefinedUsers[formData.userId?.toLowerCase()];
                    if (userConfig) handleFullUrlMethod(userConfig);
                  }}
                  className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Method 3: Full URL
                </button>
              </div>

              {/* Demo Users */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Users:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => setFormData({userId: 'filler', password: '123456'})}
                    className="p-2 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    filler / 123456
                  </button>
                  <button 
                    onClick={() => setFormData({userId: 'admin', password: '123456'})}
                    className="p-2 bg-green-100 rounded hover:bg-green-200"
                  >
                    admin / 123456
                  </button>
                  <button 
                    onClick={() => setFormData({userId: 'user', password: '123456'})}
                    className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                  >
                    user / 123456
                  </button>
                  <button 
                    onClick={() => setFormData({userId: 'superadmin', password: '123456'})}
                    className="p-2 bg-red-100 rounded hover:bg-red-200"
                  >
                    superadmin / 123456
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
            <h3 className="text-white mb-4 text-sm font-bold">Debug Console</h3>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="break-all">{info}</div>
              ))}
            </div>
            <button 
              onClick={() => setDebugInfo([])}
              className="mt-4 px-3 py-1 bg-red-600 text-white rounded text-xs"
            >
              Clear Debug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;