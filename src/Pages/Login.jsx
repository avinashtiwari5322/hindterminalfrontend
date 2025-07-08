import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for the field when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Simulate login action (replace with actual API call in production)
    console.log('Login attempt:', {
      userId: formData.userId,
      password: formData.password,
    });
    // Reset form after submission
    setFormData({ userId: '', password: '' });
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
              placeholder="Enter your User ID"
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
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;