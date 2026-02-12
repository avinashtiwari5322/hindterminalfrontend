// UserMaster.jsx
import React, { useState, useEffect } from "react";
import { Users, Edit, Trash2, Plus, X, CheckCircle, XCircle, Loader2, AlertCircle, AlertTriangle } from "lucide-react";

const BASE_URL = "http://localhost:4000/api";

const Toast = ({ type, message, onClose }) => {
  const icons = { success: <CheckCircle className="w-5 h-5 text-green-600" />, error: <XCircle className="w-5 h-5 text-red-600" /> };
  const bgColors = { success: "bg-green-50 border-green-200", error: "bg-red-50 border-red-200" };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
    </div>
  );
};

const UserMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [toast, setToast] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch (e) {}
  const userId = user?.UserId || 101;
  const companyId = user?.CompanyId || 1;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const payload = { CompanyId: companyId, UserId: userId, Page: page, PageSize: pageSize };
      const response = await fetch(`${BASE_URL}/user-master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
        setTotal(result.totalRecords || 0);
      } else {
        showToast("error", result.message || "Failed to load data");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/role-master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CompanyId: companyId, UserId: userId }),
      });
      const result = await response.json();
      if (result.success) setRoles(result.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/designation/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CompanyId: companyId, UserId: userId, Page: 1, PageSize: 1000 }),
      });
      const result = await response.json();
      if (result.success) setDesignations(result.data || []);
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/location-master`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.success) setLocations(result.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    setCurrentItem(item);
    setFormData(item ? { ...item, DesignationId: item.DesignationId || "", LocationId: item.LocationId || "" } : {});
    fetchRoles();
    fetchDesignations();
    fetchLocations();
    setShowFormModal(true);
  };

  const closeModals = () => {
    setShowFormModal(false);
    setShowConfirmModal(false);
    setCurrentItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const endpoint = modalMode === "create" ? `${BASE_URL}/user/add` : `${BASE_URL}/user/update`;
      const payload = { CompanyId: companyId, UserId: userId, ...formData };
      if (modalMode === "edit") payload.TargetUserId = currentItem?.UserId;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast("success", result.message || "Saved successfully!");
        closeModals();
        setPage(1);
        fetchData();
      } else {
        showToast("error", result.message || "Operation failed");
      }
    } catch (err) {
      showToast("error", "Network error.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CompanyId: companyId, UserId: userId, TargetUserId: currentItem.UserId }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast("success", "Deleted successfully!");
        closeModals();
        setPage(1);
        fetchData();
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Users ({total})</h2>
              <button onClick={() => openFormModal("create")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" /> Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Username</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Email</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Role</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Designation</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Location</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Company</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Created On</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan="9" className="border border-gray-300 px-4 py-12 text-center text-gray-500">No users found.</td></tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.UserId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{item.Name}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.UserName}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.MailId}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{item.RoleName}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{item.DesignationName || "-"}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">{item.LocationName || "N/A"}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.CompanyName}</td>
                        <td className="border border-gray-300 px-4 py-3">{formatDate(item.CreatedOn)}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button onClick={() => openFormModal("edit", item)} className="text-blue-600 hover:text-blue-800 mr-4">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setCurrentItem(item); setShowConfirmModal(true); }} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{modalMode === "create" ? "Add New User" : "Edit User"}</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
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
                      {roles.map((role) => (<option key={role.RoleId} value={role.RoleId}>{role.RoleName}</option>))}
                    </select>
                  ) : (
                    <input type="text" value={currentItem?.RoleName || "N/A"} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600" disabled />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <select name="DesignationId" value={formData.DesignationId || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">-- Select Designation --</option>
                    {designations.map((des) => (<option key={des.DesignationId} value={des.DesignationId}>{des.DesignationName}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select name="LocationId" value={formData.LocationId || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">-- Select Location --</option>
                    {locations.map((loc) => (<option key={loc.LocationId} value={loc.LocationId}>{loc.LocationName}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModals} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{modalMode === "create" ? "Create" : "Update"}</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center mb-4 text-yellow-600">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this user?</p>
              {currentItem && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-4"><strong>{currentItem.Name}</strong></p>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={closeModals} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={() => { handleDelete(); setShowConfirmModal(false); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
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

export default UserMaster;