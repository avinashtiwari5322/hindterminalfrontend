import React, { useState, useEffect } from "react";
import {
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MyRequests = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/permits');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match component structure
        const transformedData = data.map(permit => ({
          id: permit.PermitID,
          permitNumber: permit.PermitNumber,
          location: permit.WorkLocation,
          permitDate: new Date(permit.PermitDate).toLocaleDateString(),
          validUpto: permit.PermitValidUpTo,
          totalWorkers: permit.TotalEngagedWorkers,
          workDescription: permit.WorkDescription,
          organization: permit.Organization,
          supervisorName: permit.SupervisorName,
          contactNumber: permit.ContactNumber,
          nearestFireAlarmPoint: permit.NearestFireAlarmPoint,
          // Since the API doesn't have status field, we'll determine it based on dates
          status: determineStatus(permit.PermitValidUpTo),
          createdOn: permit.Created_on,
          updatedOn: permit.Updated_on
        }));
        
        setRequests(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Determine status based on validity
  const determineStatus = (validUpTo) => {
    const now = new Date();
    const expiryDate = new Date(validUpTo);
    
    if (expiryDate < now) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  // Filter requests based on status
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  // Handle status change (for demo purposes - you'd need an API endpoint for this)
  const handleStatusChange = async (id, newStatus) => {
    // This would typically make an API call to update the status
    // For now, just updating locally
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xl text-gray-700">Loading requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                My Requests
              </h1>
              <p className="text-gray-600">
                Manage and review height work permit requests ({requests.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Requests
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Permit Requests ({filteredRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Permit Number
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Location
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Organization
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Permit Date
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Valid Up To
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Workers
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="border border-gray-300 px-4 py-3 text-center text-gray-600"
                    >
                      No requests found for the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          {request.permitNumber}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          {request.location}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {request.organization}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {request.permitDate}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          {new Date(request.validUpto).toLocaleString()}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          {request.totalWorkers}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="max-w-xs truncate" title={request.workDescription}>
                          {request.workDescription}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            request.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Additional Info Section */}
          {filteredRequests.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Total Requests:</span>
                  <span className="ml-2 text-gray-800">{requests.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Active:</span>
                  <span className="ml-2 text-green-600">
                    {requests.filter(r => r.status === "Active").length}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Expired:</span>
                  <span className="ml-2 text-red-600">
                    {requests.filter(r => r.status === "Expired").length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;