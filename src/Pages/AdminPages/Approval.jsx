import React, { useState, useEffect } from "react";
import {
  Filter,
  FileText,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyRequests = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState(null); // New: location filter
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(null);
  const navigate = useNavigate();

  const [actionMenuId, setActionMenuId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // New state for locations
  const [locations, setLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  // Determine if current user is Super User
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }
  const isSuperUser = user?.RoleName === "superuser" ;

  // Load default location from localStorage
 useEffect(() => {
  const storedLocation = localStorage.getItem("locationId");

  // Only set if there's actually a value
  if (storedLocation && storedLocation.trim() !== "") {
    setLocationFilter(storedLocation);
  }
  // Do NOTHING if no stored location — keep default "" (which means "All")
}, []);
// Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationLoading(true);
        setLocationError("");

        const response = await fetch("https://hindterminal56.onrender.com/api/location-master", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setLocations(result.data); // [{ LocationName: "Palwal" }, ...]
        } else {
          throw new Error("Invalid location data");
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocationError("Failed to load locations");
        setLocations([]); // fallback
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch data from API whenever page, pageSize, or locationFilter changes
  useEffect(() => {
    if (locationFilter) {
      const fetchRequests = async () => {
      try {
        setLoading(true);
        const payload = {
          page,
          pageSize,
          locationId: locationFilter,
        };
        console.log("Fetching requests with payload:", payload);
        const response = await fetch("https://hindterminal56.onrender.com/api/permit-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const items = Array.isArray(data) ? data : data.data || [];
        if (data && typeof data.total !== "undefined") setTotal(data.total);
        if (data && typeof data.page !== "undefined") setPage(data.page);
        if (data && typeof data.pageSize !== "undefined") setPageSize(data.pageSize);

        const transformedData = items.map((permit) => ({
          id: permit.PermitId,
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
          status: permit.CurrentPermitStatus,
          reachedTo: permit.permitReachTo,
          createdOn: permit.CreatedOn,
          updatedOn: permit.UpdatedOn,
          files: permit.Files || [],
          permitType: permit.PermitType,
          isReopened: permit.IsReopened === true,
        }));

        setRequests(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    }

  }, [page, pageSize, locationFilter]); // Re-fetch when location changes

  // Close action menu on outside click
  useEffect(() => {
    const handleClick = () => setActionMenuId(null);
    if (actionMenuId !== null) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [actionMenuId]);

  // Filter requests by status (client-side)
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Requests</h1>
              <p className="text-gray-600">
                Manage and review height work permit requests ({requests.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Requests
            </h2>

            <div className="flex flex-wrap gap-6 items-end">
              {/* Location Filter - Only for Super Users */}
              {isSuperUser && (
                <div className="min-w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => {
                      setLocationFilter(e.target.value);
                      setPage(1);
                    }}
                    disabled={locationLoading}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      locationLoading ? "opacity-70 cursor-not-allowed" : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {locationLoading
                        ? "Loading locations..."
                        : locationError
                        ? "Error loading"
                        : "-- All Locations --"}
                    </option>
                    {locations.map((loc) => (
                      <option key={loc.LocationName} value={loc.LocationName}>
                        {loc.LocationName}
                      </option>
                    ))}
                  </select>
                  {locationError && !locationLoading && (
                    <p className="mt-1 text-xs text-red-600">{locationError}</p>
                  )}
                </div>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Approved">Approved</option>
                  <option value="Hold">Hold</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your table, pagination, file preview remains unchanged */}
        {/* ... (keep everything below exactly as it was) */}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Permit Requests ({total ?? filteredRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Permit Number
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Permit Type
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
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Submitted By
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
                      className="border border-gray-300 px-4 py-8 text-center text-gray-600"
                    >
                      {locationFilter
                        ? "No requests found for the selected location and status."
                        : "Please select a location to view requests."}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (request.files && request.files.length > 0) {
                          setSelectedFiles(
                            request.files.map((file) => ({
                              ...file,
                              url:
                                file.FileID && !isNaN(file.FileID)
                                  ? `https://hindterminal56.onrender.com/api/permits/file/${file.FileID}`
                                  : undefined,
                            }))
                          );
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    >
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                            {request.permitNumber}
                          </span>
                          {request.isReopened && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium w-fit">
                              ↺ Reopened
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-800">
                        {request.permitType}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          {request.location}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{request.organization}</td>
                      <td className="border border-gray-300 px-4 py-3">{request.permitDate}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          {new Date(request.validUpto).toLocaleString()}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : request.status === "Expired"
                              ? "bg-red-100 text-red-700"
                              : request.status === "Active"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="max-w-xs truncate" title={request.reachedTo}>
                          {request.reachedTo}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/approval/${request.id}`);
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

export default MyRequests;