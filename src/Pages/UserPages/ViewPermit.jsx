import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from 'react-toastify';
import hindLogo from "../../Assets/hindimg.png";
import { Printer } from "lucide-react";

const ViewPermit = () => {
  const [permitData, setPermitData] = useState({
    permitDate: "",
    permitNumber: "",
    location: "",
    validUpto: "",
    fireAlarmPoint: "",
    totalWorkers: "",
    workDescription: "",
    contractorOrg: "",
    supervisorName: "",
    contactNumber: "",
    files: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

 useEffect(() => {
  if (id) { // Assuming you want to check for id, similar to the second example
    const fetchPermitData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://hindterminal56.onrender.com/api/permits/${id}`);
        if (!response.ok) throw new Error("Failed to fetch permit data");
        const data = await response.json();

        setPermitData((prev) => ({
          ...prev,
          permitDate: data.PermitDate ? data.PermitDate.split("T")[0] : "",
          permitNumber: data.PermitNumber || "",
          location: data.WorkLocation || "",
          validUpto: data.PermitValidUpTo ? data.PermitValidUpTo.slice(0, 16) : "",
          fireAlarmPoint: data.NearestFireAlarmPoint || "",
          totalWorkers: data.TotalEngagedWorkers || "",
          workDescription: data.WorkDescription || "",
          contractorOrg: data.Organization || "",
          supervisorName: data.SupervisorName || "",
          contactNumber: data.ContactNumber || "",
          files: (data.files || []).map((file) => ({
            id: file.FileID || file.id || file.filename,
            name: file.FileName || file.originalName,
            size: file.FileSize || file.size,
            type: file.FileType || file.mimetype,
            url: file.FilePath ? `https://hindterminal56.onrender.com/api/permits/file/${file.FileID}` : undefined,
            preview: file.FileType && file.FileType.startsWith("image/") ? `https://hindterminal56.onrender.com/api/permits/file/${file.FileID}` : null,
          })),
        }));
      } catch (err) {
        console.error("Error fetching permit data:", err);
        setError("Failed to load permit data. Please try again.");
        toast.error("Failed to load permit data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPermitData();
  }
}, [id]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h4 className="text-lg font-medium text-red-800">{error}</h4>
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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-2">
              <img
                src={hindLogo}
                alt="Hind Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            {/* <div className="text-right text-sm text-gray-600">
              <div>Doc. No.: HTPL/OHS/23</div>
              <div>Eff. Date: 02.01.24</div>
              <div>Rev. No. & Date 00</div>
            </div> */}
          </div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              WORK PERMIT
            </h1>
          </div>
          <div className="text-center text-gray-700 leading-relaxed">
            <p>
              This permit authorizes the provision of safe Access, Platforms, or
              Working arrangement at heights of 1.8 meters and above for the
              execution of the job
            </p>
          </div>
        </div>

        {/* Section 1: Work Specification */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            1. Specification of Work
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Number
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.permitNumber || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearest Fire Alarm Point
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.fireAlarmPoint || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location of Work
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.location || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Permit Valid Up to
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.validUpto || "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Permit to Work
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.permitDate || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Total Number of Engaged Workers
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.totalWorkers || "N/A"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Work
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 min-h-[100px]">
                  {permitData.workDescription || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              Contractor Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.contractorOrg || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor Name
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.supervisorName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.contactNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* File Display Section */}
          {permitData.files.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Supporting Documents & Images
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permitData.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({permitData.files.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permitData.files.map((fileObj) => (
                      <div key={fileObj.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        {fileObj.preview && fileObj.type && fileObj.type.startsWith("image/") ? (
                          <img src={fileObj.preview} alt={fileObj.name} className="w-12 h-12 object-cover rounded" />
                        ) : fileObj.url && fileObj.type && fileObj.type.startsWith("image/") ? (
                          <img src={fileObj.url} alt={fileObj.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{fileObj.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                          {(fileObj.preview || fileObj.url) && (
                            <a
                              href={fileObj.preview || fileObj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPermit;