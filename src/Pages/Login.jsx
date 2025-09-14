import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    locationId: ''
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
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
      // Call your backend login API
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

      // ✅ Store user details in localStorage for future use
      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("isAuthenticated", "true");
      console.log(data.data);
      // Decide route based on RoleName
      switch (data.data.RoleName.toLowerCase()) {
        case "user":
          navigate("/login/requestuser");
          break;
        case "admin":
          navigate("/login/requestadmin");
          break;
        case "superadmin":
          navigate("/login/requestsuperadmin");
          break;
        case "filler":
          navigate("/login/option");
          break;
        default:
          navigate("/dashboard"); // fallback if role is unknown
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong. Please try again.");
    }
  };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   const validationErrors = validateForm();
//   if (Object.keys(validationErrors).length > 0) {
//     setErrors(validationErrors);
//     return;
//   }

//   try {
//     // Call your backend login API
//     const response = await fetch("https://hindterminal56.onrender.com/api/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         UserName: formData.userId,
//         Password: formData.password,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       setLoginError(data.message || "Invalid credentials");
//       return;
//     }

//     // ✅ Store user details in localStorage for future use
//     localStorage.setItem("user", JSON.stringify(data.data));

//     // Decide route based on RoleName
//     switch (data.data.RoleName.toLowerCase()) {
//       case "user":
//         navigate("/login/requestuser");
//         break;
//       case "admin":
//         navigate("/login/requestadmin");
//         break;
//       case "superadmin":
//         navigate("/login/requestsuperadmin");
//         break;
//       case "filler":
//         navigate("/login/option");
//         break;
//       default:
//         navigate("/dashboard"); // fallback if role is unknown
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     setLoginError("Something went wrong. Please try again.");
//   }
// };

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
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

           {/* Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => handleInputChange('locationId', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.locationId ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">-- Select Location --</option>
              <option value="palwal">Palwal</option>
              <option value="delhi">Delhi</option>
              <option value="faridabad">Faridabad</option>
              <option value="gurugram">Gurugram</option>
              <option value="noida">Noida</option>
            </select>
            {errors.locationId && (
              <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
