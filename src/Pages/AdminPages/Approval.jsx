import React, { useState, useEffect } from "react";
import {
  Filter,
  FileText,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const MyRequests = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState(null); // New: location filter
  const [fromDate, setFromDate] = useState(""); // New: from date
  const [toDate, setToDate] = useState(""); // New: to date
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(null);
  const [exporting, setExporting] = useState(false);
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
    const storedLocation = Number(localStorage.getItem("locationId"));

    // Only set if there's actually a value
    if (storedLocation ) {
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

          const response = await fetch("http://localhost:4000/api/location-master", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch locations");
          }

          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            setLocations(result.data.map(loc => ({
              id: loc.LocationId,
              name: loc.LocationName
            })));
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

  // Ensure locationId is valid before setting it
  useEffect(() => {
    const storedLocation = localStorage.getItem("locationId");
    const parsedLocation = storedLocation ? Number(storedLocation) : null;

    if (!isNaN(parsedLocation) && parsedLocation !== null) {
      setLocationFilter(parsedLocation); // Set only if valid
    }
  }, []);

  // Fetch data from API whenever page, pageSize, or locationFilter changes
  useEffect(() => {
    if (locationFilter !== null) {
      console.log("Location filter changed, fetching requests for location:", locationFilter);
      const fetchRequests = async () => {
      try {
        setLoading(true);
        const payload = {
          page,
          pageSize,
          locationId: locationFilter, // Ensure locationId is valid
        };
        if (statusFilter !== "All") payload.status = statusFilter;
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
        console.log("Fetching requests with payload:", payload);

        const response = await fetch("http://localhost:4000/api/permit-list", {
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
          location: getLocationValue(permit.WorkLocation),
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

  }, [page, pageSize, locationFilter, statusFilter, fromDate, toDate]); // Re-fetch when filters change

  // Close action menu on outside click
  useEffect(() => {
    const handleClick = () => setActionMenuId(null);
    if (actionMenuId !== null) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [actionMenuId]);

  // Helper function to extract location from array
  const getLocationValue = (location) => {
    if (Array.isArray(location)) {
      return location.find(loc => loc !== null && loc !== undefined) || "";
    }
    return location || "";
  };

  // Filter requests by status (client-side)
  const filteredRequests = requests;

  // Export to Excel function
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      
      // Prepare payload for export API
      const payload = {
        locationId: locationFilter,
        export: true,
      };
      if (statusFilter !== "All") payload.status = statusFilter;
      if (fromDate) payload.fromDate = fromDate;
      if (toDate) payload.toDate = toDate;

      const response = await fetch("http://localhost:4000/api/permit-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];

      // Transform data for Excel
      const excelData = items.map((permit) => ({
        "Permit Number": permit.PermitNumber,
        "Permit Type": permit.PermitType,
        "Location": getLocationValue(permit.WorkLocation),
        "Organization": permit.Organization,
        "Permit Date": new Date(permit.PermitDate).toLocaleDateString(),
        "Valid Up To": new Date(permit.PermitValidUpTo).toLocaleDateString(),
        "Status": permit.CurrentPermitStatus,
        "Submitted By": permit.permitReachTo,
        "Reopened": permit.IsReopened ? "Yes" : "No",
      }));
      

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Permits");

      // Set column widths
      const colWidths = [
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
      ];
      worksheet["!cols"] = colWidths;

      // Generate file name
      const fileName = `permits_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
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
      <div className="max-w-8xl mx-auto">
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
          <div className="flex items-center justify-between flex-wrap gap-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Requests
            </h2>
            {isSuperUser && (
              <button
                onClick={handleExportToExcel}
                disabled={exporting || requests.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export to Excel"}
              </button>
            )}
          </div>

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
                    setLocationFilter(Number(e.target.value)); // Ensure LocationId is passed as a number
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
                    <option key={loc.id} value={loc.id}> {/* Use LocationId as value */}
                      {loc.name}
                    </option>
                  ))}
                </select>
                {locationError && !locationLoading && (
                  <p className="mt-1 text-xs text-red-600">{locationError}</p>
                )}
              </div>
            )}

            {/* Date Range Filters - Only for Super Users */}
            {isSuperUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
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
                                  ? `http://localhost:4000/api/permits/file/${file.FileID}`
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

          {/* Pagination Section */}
          {total && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} results
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({
                    length: Math.ceil(total / pageSize),
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    // Show current page and a few around it
                    if (
                      pageNum === 1 ||
                      pageNum === Math.ceil(total / pageSize) ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-md transition-colors ${
                            pageNum === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === 2 && page > 3) ||
                      (pageNum === Math.ceil(total / pageSize) - 1 &&
                        page < Math.ceil(total / pageSize) - 2)
                    ) {
                      return (
                        <span key={pageNum} className="px-2 py-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() =>
                    setPage(Math.min(Math.ceil(total / pageSize), page + 1))
                  }
                  disabled={page === Math.ceil(total / pageSize)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <div className="ml-4">
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    Items per page:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info Section */}
          {filteredRequests.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Total Requests:</span>
                  <span className="ml-2 text-gray-800">{total ?? requests.length}</span>
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