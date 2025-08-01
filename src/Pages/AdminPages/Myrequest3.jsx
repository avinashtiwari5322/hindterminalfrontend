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
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyRequests3 = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Add state for action menu
  const [actionMenuId, setActionMenuId] = useState(null);
  // Add state to track selected request's files
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://hindterminalfrontend.vercel.app/api/permits');
        
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
          updatedOn: permit.Updated_on,
          files: permit.Files || [] // Files array from the API
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

  // Add click outside handler to close menu
  useEffect(() => {
    const handleClick = () => setActionMenuId(null);
    if (actionMenuId !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [actionMenuId]);

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
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="border border-gray-300 px-4 py-3 text-center text-gray-600"
                    >
                      No requests found for the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        navigate(`/approval3/${request.id}`);
                        if (request.files && request.files.length > 0) {
                          console.log('Request files:', request.files); // Debug log
                          setSelectedFiles(request.files.map(file => {
                            console.log('Processing file:', file); // Debug log
                            return {
                              ...file,
                              // Use the FileID to create the correct URL for database-stored files
                              url: file.FileID && !isNaN(file.FileID) ? `https://hindterminalfrontend.vercel.app/api/permits/file/${file.FileID}` : undefined
                            };
                          }));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    >
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
                        {request.status === "Active" || request.status === "Expired" ? (
                          <div className="relative">
                            <button
                              className={`px-2 py-1 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                request.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                              onClick={e => {
                                e.stopPropagation();
                                setActionMenuId(request.id);
                              }}
                            >
                              {request.status}
                            </button>
                            {actionMenuId === request.id && (
                              <div className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded shadow-lg w-32">
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                               
                                >Approve</button>
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-700"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleStatusChange(request.id, "Rejected");
                                    setActionMenuId(null);
                                  }}
                                >Reject</button>
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-yellow-50 text-yellow-700"
                                  onClick={e => {
                                    e.stopPropagation();
                                    // Optionally, navigate to edit page
                                    navigate(`/approval2/${request.id}/edit`);
                                    setActionMenuId(null);
                                  }}
                                >Edit</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {request.status}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/approval2/${request.id}`);
                          }}
                        >
                          View
                        </button>
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

          {/* File Preview Section */}
          {selectedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Permit Files Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFiles.map(file => {
                  console.log('Rendering file:', file); // Debug log
                  return (
                    <div key={file.FileID || file.id || file.FileName} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      {file.FileType && file.FileType.startsWith('image/') && file.url ? (
                        <img 
                          src={file.url} 
                          alt={file.FileName} 
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            console.error('Failed to load image:', file.url);
                            // If image fails to load, show file icon instead
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', file.url);
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center"
                        style={{ display: (file.FileType && file.FileType.startsWith('image/') && file.url) ? 'none' : 'flex' }}
                      >
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.FileName}>
                          {file.FileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.FileSize ? (file.FileSize / 1024).toFixed(1) + ' KB' : ''}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {file.FileType ? file.FileType.split('/')[1] : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {file.FileID || 'No ID'}
                        </p>
                        {file.url ? (
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Opening file URL:', file.url);
                            }}
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-red-500 text-xs mt-1 inline-block">No URL available</span>
                        )}
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRequests3;