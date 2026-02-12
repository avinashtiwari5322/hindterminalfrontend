// MasterData.jsx - Fully Updated with Designation and Location Selection for Users (Create & Edit)

import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Building,
  MapPin,
  AlertTriangle,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

const BASE_URL = "http://localhost:4000/api";

// Toast Component
const Toast = ({ type, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const MasterData = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]); // For user designation dropdown
  const [locations, setLocations] = useState([]); // For location master data
  const [refreshKey, setRefreshKey] = useState(0);

  const [toast, setToast] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Current user from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {}
  const userId = user?.UserId || 101;
  const companyId = user?.CompanyId || 1;

  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "departments", label: "Departments", icon: Building },
    { id: "work-locations", label: "Work Locations", icon: MapPin },
    { id: "alarm-points", label: "Alarm Points", icon: AlertTriangle },
    { id: "designations", label: "Designations", icon: Briefcase },
    { id: "locations", label: "Locations", icon: MapPin },
  ];

  const endpoints = {
    users: { list: `${BASE_URL}/user-master`, add: `${BASE_URL}/user/add`, update: `${BASE_URL}/user/update`, delete: `${BASE_URL}/user/delete` },
    companies: { list: `${BASE_URL}/company-master`, update: `${BASE_URL}/company/update` },
    departments: { list: `${BASE_URL}/department/list`, add: `${BASE_URL}/department/add`, update: `${BASE_URL}/department/update`, delete: `${BASE_URL}/department/delete` },
    "work-locations": { list: `${BASE_URL}/work-location/list`, add: `${BASE_URL}/work-location/add`, update: `${BASE_URL}/work-location/update`, delete: `${BASE_URL}/work-location/delete` },
    "alarm-points": { list: `${BASE_URL}/alarm-point/list`, add: `${BASE_URL}/alarm-point/add`, update: `${BASE_URL}/alarm-point/update`, delete: `${BASE_URL}/alarm-point/delete` },
    designations: { list: `${BASE_URL}/designation/list`, add: `${BASE_URL}/designation/add`, update: `${BASE_URL}/designation/update`, delete: `${BASE_URL}/designation/delete` },
    locations: { list: `${BASE_URL}/location-master`, add: `${BASE_URL}/location/add`, update: `${BASE_URL}/location/update`, delete: `${BASE_URL}/location/delete` },
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch main tab data
  useEffect(() => {
    const fetchData = async () => {
      const endpoint = endpoints[activeTab]?.list;
      if (!endpoint) return;

      try {
        setLoading(true);
        setError(null);

        let response;
        if (activeTab === "locations") {
          // Use GET for locations
          response = await fetch(endpoint, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        } else {
          // Use POST for other tabs
          const payload = { CompanyId: companyId, UserId: userId, Page: page, PageSize: pageSize };
          response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        if (result.success) {
          setData(result.data || []);
          setTotal(result.totalRecords || result.data?.length || 0);
        } else {
          throw new Error(result.message || "Failed to load data");
        }
      } catch (err) {
        setError(err.message);
        showToast("error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, page, companyId, userId, refreshKey]);

  // Fetch roles for user form
  const fetchRoles = async () => {
    try {
      const payload = { CompanyId: companyId, UserId: userId };
      const response = await fetch(`${BASE_URL}/role-master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) setRoles(result.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Fetch designations for user form
  const fetchDesignations = async () => {
    try {
      const payload = { CompanyId: companyId, UserId: userId, Page: 1, PageSize: 1000 };
      const response = await fetch(endpoints.designations.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setDesignations(result.data || []);
      } else {
        showToast("error", "Failed to load designations");
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
      showToast("error", "Failed to load designations");
    }
  };

  // Fetch locations for location master
  const fetchLocations = async () => {
    try {
      
      const response = await fetch(endpoints.locations.list, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.success) {
        setLocations(result.data || []);
      } else {
        showToast("error", "Failed to load locations");
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      showToast("error", "Failed to load locations");
    }
  };

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    setCurrentItem(item);

    // Pre-fill form data
    if (item) {
      setFormData({
        ...item,
        // Ensure DesignationId and LocationId are set for edit mode
        DesignationId: item.DesignationId || "",
        LocationId: item.LocationId || "",
      });
    } else {
      setFormData({});
    }

    if (activeTab === "users") {
      fetchRoles();
      fetchDesignations();
      fetchLocations(); // Fetch locations for the dropdown
    } else if (activeTab === "locations") {
      fetchLocations();
    }
    setShowFormModal(true);
  };

  const closeModals = () => {
    setShowFormModal(false);
    setShowConfirmModal(false);
    setCurrentItem(null);
    setFormData({});
  };

  const refetchData = () => {
    setPage(1);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      let endpoint = "";
      let payload = { CompanyId: companyId, UserId: userId };

      if (activeTab === "users") {
        endpoint = modalMode === "create" ? endpoints.users.add : endpoints.users.update;
        payload = {
          ...payload,
          ...formData,
          LocationId: formData.LocationId, // Pass LocationId when saving user
        };
        if (modalMode === "edit") payload.TargetUserId = currentItem?.UserId;
      } else if (activeTab === "companies") {
        endpoint = endpoints.companies.update;
        payload = { ...payload, ...formData, TargetCompanyId: currentItem?.CompanyId };
      } else if (activeTab === "departments") {
        endpoint = modalMode === "create" ? endpoints.departments.add : endpoints.departments.update;
        payload.DepartmentName = formData.DepartmentName || "";
        if (modalMode === "edit") payload.DepartmentId = currentItem?.DepartmentId;
      } else if (activeTab === "work-locations") {
        endpoint = modalMode === "create" ? endpoints["work-locations"].add : endpoints["work-locations"].update;
        payload.WorkLocationName = formData.WorkLocationName || "";
        if (modalMode === "edit") payload.WorkLocationId = currentItem?.WorkLocationId;
      } else if (activeTab === "alarm-points") {
        endpoint = modalMode === "create" ? endpoints["alarm-points"].add : endpoints["alarm-points"].update;
        payload.AlarmPointName = formData.AlarmPointName || "";
        if (modalMode === "edit") payload.AlarmPointId = currentItem?.AlarmPointId;
      } else if (activeTab === "designations") {
        endpoint = modalMode === "create" ? endpoints.designations.add : endpoints.designations.update;
        payload.DesignationName = formData.DesignationName || "";
        if (modalMode === "edit") payload.DesignationId = currentItem?.DesignationId;
      } else if (activeTab === "locations") {
        endpoint = modalMode === "create" ? endpoints.locations.add : endpoints.locations.update;
        payload.LocationName = formData.LocationName || "";
        if (modalMode === "edit") payload.LocationId = currentItem?.LocationId;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("success", result.message || "Saved successfully!");
        closeModals();
        refetchData();
      } else {
        showToast("error", result.message || "Operation failed");
      }
    } catch (err) {
      showToast("error", "Network error.");
    }
  };

  const handleDelete = async (item) => {
    try {
      let payload = { CompanyId: companyId, UserId: userId };
      let endpoint = "";

      if (activeTab === "users") { endpoint = endpoints.users.delete; payload.TargetUserId = item.UserId; }
      else if (activeTab === "departments") { endpoint = endpoints.departments.delete; payload.DepartmentId = item.DepartmentId; }
      else if (activeTab === "work-locations") { endpoint = endpoints["work-locations"].delete; payload.WorkLocationId = item.WorkLocationId; }
      else if (activeTab === "alarm-points") { endpoint = endpoints["alarm-points"].delete; payload.AlarmPointId = item.AlarmPointId; }
      else if (activeTab === "designations") { endpoint = endpoints.designations.delete; payload.DesignationId = item.DesignationId; }
      else if (activeTab === "locations") { endpoint = endpoints.locations.delete; payload.LocationId = item.LocationId; }
      else return;

      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast("success", "Deleted successfully!");
        closeModals();
        refetchData();
      } else {
        showToast("error", result.message || "Delete failed");
      }
    } catch (err) {
      showToast("error", "Network error during delete.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getTabLabel = () => tabs.find(t => t.id === activeTab)?.label || "";

  const canAdd = activeTab !== "companies";
  const canDelete = ["users", "departments", "work-locations", "alarm-points", "designations", "locations"].includes(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-xl text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Master Data Management</h1>
            <p className="text-gray-600">Manage users, companies, departments, work locations, alarm points, designations, and locations</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); }}
                  className={`flex items-center px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{getTabLabel()} ({total})</h2>
                {canAdd && (
                  <button onClick={() => openFormModal("create")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> Add New
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTab === "users" && (
                        <>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Name</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Username</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Email</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Role</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Designation</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Location</th> {/* Add Location column */}
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Company</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Created On</th> {/* Add Created On column */}
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                        </>
                      )}
                      {activeTab === "companies" && (
                        <>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Company Name</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Address</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Contact No</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Status</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                        </>
                      )}
                      {(activeTab === "departments" || activeTab === "work-locations" || activeTab === "alarm-points" || activeTab === "designations" || activeTab === "locations") && (
                        <>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                            {activeTab === "departments" ? "Department Name" :
                             activeTab === "work-locations" ? "Work Location Name" :
                             activeTab === "alarm-points" ? "Alarm Point Name" :
                             activeTab === "designations" ? "Designation Name" :
                             "Location Name"}
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Created On</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Status</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr><td colSpan="8" className="border border-gray-300 px-4 py-12 text-center text-gray-500">No records found.</td></tr>
                    ) : (
                      data.map((item) => (
                        <tr key={item.UserId || item.CompanyId || item.DepartmentId || item.WorkLocationId || item.AlarmPointId || item.DesignationId || item.LocationId} className="hover:bg-gray-50">
                          {activeTab === "users" && (
                            <>
                              <td className="border border-gray-300 px-4 py-3">{item.Name}</td>
                              <td className="border border-gray-300 px-4 py-3">{item.UserName}</td>
                              <td className="border border-gray-300 px-4 py-3">{item.MailId}</td>
                              <td className="border border-gray-300 px-4 py-3">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{item.RoleName}</span>
                              </td>
                              <td className="border border-gray-300 px-4 py-3">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {item.DesignationName || "-"}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-4 py-3">{item.LocationName || "N/A"}</td> {/* Display LocationName */}
                              <td className="border border-gray-300 px-4 py-3">{item.CompanyName}</td>
                              <td className="border border-gray-300 px-4 py-3">{formatDate(item.CreatedOn)}</td>
                            </>
                          )}
                          {activeTab === "companies" && (
                            <>
                              <td className="border border-gray-300 px-4 py-3">{item.CompanyName}</td>
                              <td className="border border-gray-300 px-4 py-3">{item.Address || "-"}</td>
                              <td className="border border-gray-300 px-4 py-3">{item.ContactNo || "-"}</td>
                              <td className="border border-gray-300 px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.IsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {item.IsActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </>
                          )}
                          {(activeTab === "departments" || activeTab === "work-locations" || activeTab === "alarm-points" || activeTab === "designations" || activeTab === "locations") && (
                            <>
                              <td className="border border-gray-300 px-4 py-3">
                                {item.DepartmentName || item.WorkLocationName || item.AlarmPointName || item.DesignationName || item.LocationName}
                              </td>
                              <td className="border border-gray-300 px-4 py-3">{formatDate(item.CreatedOn)}</td>
                              <td className="border border-gray-300 px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.IsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {item.IsActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="border border-gray-300 px-4 py-3">
                            <button onClick={() => openFormModal("edit", item)} className="text-blue-600 hover:text-blue-800 mr-4">
                              <Edit className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button onClick={() => { setCurrentItem(item); setShowConfirmModal(true); }} className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {total > pageSize && (
                <div className="mt-8 flex justify-center gap-4">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                  <span className="px-4 py-2 text-gray-700">Page {page} of {Math.ceil(total / pageSize)}</span>
                  <button onClick={() => setPage(page + 1)} disabled={page * pageSize >= total} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "create" ? "Add New" : "Edit"} {getTabLabel().slice(0, -1)}
                </h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === "companies" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input type="text" name="CompanyName" value={formData.CompanyName || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input type="text" name="Address" value={formData.Address || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                      <input type="tel" name="ContactNo" value={formData.ContactNo || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}

                {(activeTab === "departments" || activeTab === "work-locations" || activeTab === "alarm-points" || activeTab === "designations" || activeTab === "locations") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {activeTab === "departments" ? "Department Name" :
                       activeTab === "work-locations" ? "Work Location Name" :
                       activeTab === "alarm-points" ? "Alarm Point Name" :
                       activeTab === "designations" ? "Designation Name" :
                       "Location Name"}
                    </label>
                    <input
                      type="text"
                      name={activeTab === "departments" ? "DepartmentName" : activeTab === "work-locations" ? "WorkLocationName" : activeTab === "alarm-points" ? "AlarmPointName" : activeTab === "designations" ? "DesignationName" : "LocationName"}
                      value={formData[activeTab === "departments" ? "DepartmentName" : activeTab === "work-locations" ? "WorkLocationName" : activeTab === "alarm-points" ? "AlarmPointName" : activeTab === "designations" ? "DesignationName" : "LocationName"] || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                {activeTab === "users" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input type="text" name="UserName" value={formData.UserName || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" name="Name" value={formData.Name || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" name="MailId" value={formData.MailId || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      {modalMode === "create" ? (
                        <select name="RoleId" value={formData.RoleId || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                          <option value="">-- Select Role --</option>
                          {roles.map((role) => (
                            <option key={role.RoleId} value={role.RoleId}>{role.RoleName}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value={currentItem?.RoleName || "N/A"} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600" disabled />
                      )}
                    </div>

                    {/* Designation Dropdown - Available in both Create and Edit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <select
                        name="DesignationId"
                        value={formData.DesignationId || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Select Designation --</option>
                        {designations.map((des) => (
                          <option key={des.DesignationId} value={des.DesignationId}>
                            {des.DesignationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location Dropdown - Available in both Create and Edit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select
                        name="LocationId"
                        value={formData.LocationId || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Select Location --</option>
                        {locations.map((loc) => (
                          <option key={loc.LocationId} value={loc.LocationId}>
                            {loc.LocationName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModals} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {modalMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center mb-4 text-yellow-600">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to <strong>delete</strong> this {getTabLabel().slice(0, -1)}?
              </p>
              {currentItem && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-4">
                  <strong>
                    {currentItem.Name || currentItem.CompanyName || currentItem.DepartmentName || currentItem.WorkLocationName || currentItem.AlarmPointName || currentItem.DesignationName || currentItem.LocationName || "item"}
                  </strong>
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={closeModals} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={() => { handleDelete(currentItem); setShowConfirmModal(false); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
      `}</style>
    </>
  );
};

export default MasterData;