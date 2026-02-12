// CompanyMaster.jsx
import React, { useState, useEffect } from "react";
import { Building2, Edit, X, CheckCircle, XCircle, Loader2 } from "lucide-react";

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

const CompanyMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
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
      const response = await fetch(`${BASE_URL}/company-master`, {
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

  useEffect(() => {
    fetchData();
  }, [page]);

  const openFormModal = (item) => {
    setCurrentItem(item);
    setFormData({ ...item });
    setShowFormModal(true);
  };

  const closeModals = () => {
    setShowFormModal(false);
    setCurrentItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const payload = {
        CompanyId: companyId,
        UserId: userId,
        TargetCompanyId: currentItem?.CompanyId,
        ...formData,
      };

      const response = await fetch(`${BASE_URL}/company/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast("success", result.message || "Updated successfully!");
        closeModals();
        fetchData();
      } else {
        showToast("error", result.message || "Operation failed");
      }
    } catch (err) {
      showToast("error", "Network error.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Company Management</h1>
                <p className="text-gray-600">Manage company information and settings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Companies ({total})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Company Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Address</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Contact No</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr><td colSpan="5" className="border border-gray-300 px-4 py-12 text-center text-gray-500">No companies found.</td></tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.CompanyId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{item.CompanyName}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.Address || "-"}</td>
                        <td className="border border-gray-300 px-4 py-3">{item.ContactNo || "-"}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.IsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {item.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button onClick={() => openFormModal(item)} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
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
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Company</h3>
                <button onClick={closeModals} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
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
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModals} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
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

export default CompanyMaster;