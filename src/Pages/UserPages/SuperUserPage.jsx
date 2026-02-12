
import React from 'react';
import { UserPlus, FileSearch, Database, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperUserPage = () => {
  const navigate = useNavigate();

  // Get current user from localStorage (if needed for future routes)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }
  const userId = user?.UserId;

//   const handleRegisterNewUser = () => {
//     navigate('/super/register-new-user'); // Adjust route as needed
//   };

  const handleCheckPermitStatus = () => {
    navigate('/login/requestuser'); // Adjust route as needed
  };

  const handleSeeMasterData = () => {
    navigate('/super/usermaster'); // Adjust route as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Super User Dashboard</h1>
          <p className="text-gray-600">Manage users, permits, and system data</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Register New User
          <button
            onClick={handleRegisterNewUser}
            className="w-full p-6 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                  <UserPlus className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-800">Register New User</h3>
                  <p className="text-sm text-gray-600">Create a new user account in the system</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </button> */}

          {/* Check Permit Status */}
          <button
            onClick={handleCheckPermitStatus}
            className="w-full p-6 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <FileSearch className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-800">Check Permit Status</h3>
                  <p className="text-sm text-gray-600">View and manage all permit applications and statuses</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          {/* Manage Master Data */}
          <button
            onClick={handleSeeMasterData}
            className="w-full p-6 bg-white border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-lg mr-4 group-hover:bg-teal-200 transition-colors">
                  <Database className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-800">Manage Master Data</h3>
                  <p className="text-sm text-gray-600">View and edit reference data, roles, departments, etc.</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500">
            Super User Access • Use responsibly
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperUserPage;