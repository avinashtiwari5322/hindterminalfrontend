import React, { useState, useEffect } from 'react';
import { User, Lock, AlertTriangle, Shield, FileText, CheckCircle, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import hindLogo from '../Assets/hindimg.png';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    locationId: ''
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For password change success

  // New state for locations
  const [locations, setLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePassData, setChangePassData] = useState({
    userId: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePassErrors, setChangePassErrors] = useState({});
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMessage, setChangePassMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationLoading(true);
        setLocationError('');
        
        const response = await fetch("https://hindterminal56.onrender.com/api/location-master", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setLocations(result.data); // [{ LocationName: "Palwal" }, ...]
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocationError('Failed to load locations');
        // Optional: fallback to empty list or hardcoded ones
        setLocations([]);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocations();
  }, []);

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
    if (!formData.locationId) {
      newErrors.locationId = 'Please select a location';
    }
    return newErrors;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("https://hindterminal56.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserName: formData.userId,
          Password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("isAuthenticated", "true");
      if (formData.locationId) {
        localStorage.setItem("locationId", formData.locationId);
      }

      switch (data.data.RoleName.toLowerCase()) {
        case "user":
        case "reviewer":
        case "approver":
        case "isolation":
          navigate("/login/requestuser");
          break;
        case "superuser":
          navigate("/login/superuser");
          break;
        case "issuer":
          navigate("/login/option");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong. Please try again.");
    }
  };

  // === Change Password Functions ===

  const openChangePassword = () => {
    setIsChangePasswordOpen(true);
    setChangePassData({ userId: '', oldPassword: '', newPassword: '', confirmPassword: '' });
    setChangePassErrors({});
    setChangePassMessage('');
  };

  const validateChangePassword = () => {
    const errs = {};
    if (!changePassData.userId.trim()) errs.userId = 'User ID is required';
    if (!changePassData.oldPassword) errs.oldPassword = 'Old password is required';
    if (!changePassData.newPassword) errs.newPassword = 'New password is required';
    else if (changePassData.newPassword.length < 6) errs.newPassword = 'New password must be at least 6 characters';
    if (changePassData.newPassword !== changePassData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChangePassword = async () => {
    const validationErrors = validateChangePassword();
    if (Object.keys(validationErrors).length > 0) {
      setChangePassErrors(validationErrors);
      return;
    }

    setChangePassLoading(true);
    setChangePassMessage('');

    try {
      // First, get CompanyId from a login or user lookup if needed.
      // Assuming you have a way to get CompanyId. Here we hardcode or fetch.
      // For demo, assuming CompanyId is 1 as in your example.

      const response = await fetch("https://hindterminal56.onrender.com/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CompanyId: 1, // You may need to dynamically fetch this
          UserName: changePassData.userId,
          OldPassword: changePassData.oldPassword,
          NewPassword: changePassData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setChangePassMessage(result.message || "Failed to change password");
      } else {
        setChangePassMessage('Password changed successfully! Please login again.');
        setSuccessMessage('Password changed successfully! Redirecting to login...');

        // Close modal after short delay and redirect
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          // Clear login form
          setFormData({ userId: '', password: '', locationId: '' });
          // Optionally scroll to top
          window.scrollTo(0, 0);
        }, 2000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      setChangePassMessage("Something went wrong. Please try again.");
    } finally {
      setChangePassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 lg:p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-6xl flex my-auto" style={{ maxHeight: '95vh' }}>
        {/* Left Side - Image/Branding Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
          {/* ... (unchanged branding section) ... */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-300 opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 opacity-5 rotate-45 transform -translate-y-1/2"></div>
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 gap-3 h-full">
                {[...Array(120)].map((_, i) => (
                  <div key={i} className="border border-white"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-3xl xl:text-4xl font-bold text-white mb-3 leading-tight">
                Hind Terminals
              </h2>
              <p className="text-blue-100 text-base font-light">
                Streamlined Work Permit Management System
              </p>
            </div>

            <div className="space-y-3 mt-8">
              <div className="flex items-start gap-3 bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl hover:bg-opacity-15 transition-all">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-9 h-9 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 text-base">Secure Access Control</h3>
                  <p className="text-blue-100 text-xs">Role-based authentication for enhanced security</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl hover:bg-opacity-15 transition-all">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-9 h-9 bg-indigo-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 text-base">Digital Work Permits</h3>
                  <p className="text-blue-100 text-xs">Manage and track all permits digitally</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl hover:bg-opacity-15 transition-all">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-9 h-9 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 text-base">Compliance Made Easy</h3>
                  <p className="text-blue-100 text-xs">Stay compliant with automated workflows</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-blue-100 text-xs">Support</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-blue-100 text-xs">Secure</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">Fast</div>
                <div className="text-blue-100 text-xs">Processing</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <div className="flex items-center gap-3 text-blue-100 text-xs bg-white bg-opacity-10 backdrop-blur-sm p-2.5 rounded-lg">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="font-medium">Trusted by organizations across India</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 xl:p-10 flex flex-col justify-center overflow-y-auto" style={{ maxHeight: '95vh' }}>
          <div className="mb-6 flex justify-center">
            <img 
              src={hindLogo} 
              alt="Hind Logo" 
              className="w-full h-auto max-w-xs object-contain"
              style={{ maxHeight: '80px' }}
            />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Success message after password change */}
          {successMessage && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {/* Login Error */}
          {loginError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2.5 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* User ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1" />
                User ID
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className={`w-full px-3 py-2.5 border ${
                  errors.userId ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`}
                placeholder="Enter your user ID"
              />
              {errors.userId && (
                <p className="mt-1 text-xs text-red-600">{errors.userId}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2.5 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Location Dropdown */}
            {/* Dynamic Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => handleInputChange('locationId', e.target.value)}
              disabled={locationLoading}
              className={`w-full px-3 py-2.5 border ${
                errors.locationId ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm ${
                locationLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <option value="">
                {locationLoading 
                  ? 'Loading locations...' 
                  : locationError 
                    ? 'Error loading locations' 
                    : '-- Select Location --'
                }
              </option>

              {locations.map((loc, index) => (
                <option key={index} value={loc.LocationName}>
                  {loc.LocationName}
                </option>
              ))}
            </select>

            {errors.locationId && (
              <p className="mt-1 text-xs text-red-600">{errors.locationId}</p>
            )}

            {locationError && !locationLoading && (
              <p className="mt-1 text-xs text-red-600">{locationError}</p>
            )}
          </div>

            <button
              onClick={handleSubmit}
              className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"
            >
              Sign In
            </button>

            {/* Change Password Link */}
            <div className="text-center mt-6">
              <button
                onClick={openChangePassword}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>

            <div className="text-center text-xs text-gray-500 mt-3">
              Need help? Contact your system administrator
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Change Password
            </h2>

            {changePassMessage && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                changePassMessage.includes('successfully')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {changePassMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={changePassData.userId}
                  onChange={(e) => setChangePassData(prev => ({ ...prev, userId: e.target.value }))}
                  className={`w-full px-3 py-2 border ${
                    changePassErrors.userId ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your User ID"
                />
                {changePassErrors.userId && <p className="mt-1 text-xs text-red-600">{changePassErrors.userId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <input
                  type="password"
                  value={changePassData.oldPassword}
                  onChange={(e) => setChangePassData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className={`w-full px-3 py-2 border ${
                    changePassErrors.oldPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {changePassErrors.oldPassword && <p className="mt-1 text-xs text-red-600">{changePassErrors.oldPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={changePassData.newPassword}
                  onChange={(e) => setChangePassData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full px-3 py-2 border ${
                    changePassErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {changePassErrors.newPassword && <p className="mt-1 text-xs text-red-600">{changePassErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={changePassData.confirmPassword}
                  onChange={(e) => setChangePassData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2 border ${
                    changePassErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {changePassErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{changePassErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={changePassLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
              >
                {changePassLoading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;