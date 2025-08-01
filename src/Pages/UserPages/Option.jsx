import React from 'react';
import { FileText, Plus, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
const PermitOptions = () => {
    const navigate = useNavigate();
  const handleCheckStatus = () => {
    // You can navigate to check status page here
    console.log('Navigate to check permit status');
  };

  const handleApplyNew = () => {
    // Navigate to /about page
    window.location.href = '/about';
  };

  const handlechangeapproval = () => {
    console.log('Navigate to approval page');
    navigate('/login/requestsuperadmin');

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Height Work Permit</h1>
          <p className="text-gray-600">Choose an option to continue</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Check Permit Status Button */}
          <button
            onClick={handleCheckStatus}
            className="w-full p-6 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <button onClick={handlechangeapproval} className="text-lg font-semibold text-gray-800">Check Your Permit Status</button>
                  <p className="text-sm text-gray-600">View existing permit details and status</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          {/* Apply New Permit Button */}
          <button
            onClick={handleApplyNew}
            className="w-full p-6 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Apply New Permit</h3>
                  <p className="text-sm text-gray-600">Submit a new height work permit application</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact your safety administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermitOptions;