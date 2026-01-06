import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertCircle,
  Printer,
  XCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import hindLogo from "../../Assets/hindimg.png";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ViewPermit = () => {
  const [permitData, setPermitData] = useState({
    permitDate: "",
    PermitTypeId: null,
    permitNumber: "",
    location: "",
    validUpto: "",
    fireAlarmPoint: "",
    totalWorkers: "",
    workDescription: "",
    contractorOrg: "",
    supervisorName: "",
    contactNumber: "",
    CurrentPermitStatus: "",
    departmentName: "",
    files: [], // Original supporting files
  });

  // Dedicated state for close permit documents
  const [closeDocuments, setCloseDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closingPermit, setClosingPermit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadChoice, setUploadChoice] = useState("no");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenDate, setReopenDate] = useState(''); // YYYY-MM-DD
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentId, setCurrentId] = useState(id);

  // Load permit details for a given permit id
  const loadPermit = async (permitId) => {
    if (!permitId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://hindterminal56.onrender.com/api/permits/${permitId}`);
      if (!response.ok) throw new Error("Failed to fetch permit data");
      const data = await response.json();

      setPermitData({
        permitDate: data.PermitDate ? data.PermitDate.split("T")[0] : "",
        PermitTypeId: data.PermitTypeId,
        permitNumber: data.PermitNumber || "",
        location: data.WorkLocation || "",
        validUpto: data.PermitValidUpTo ? data.PermitValidUpTo.slice(0, 16) : "",
        fireAlarmPoint: data.NearestFireAlarmPoint || "",
        totalWorkers: data.TotalEngagedWorkers || "",
        workDescription: data.WorkDescription || "",
        contractorOrg: data.Organization || "",
        supervisorName: data.SupervisorName || "",
        contactNumber: data.ContactNumber || "",
        CurrentPermitStatus: data.CurrentPermitStatus || "",
        departmentName: data.DepartmentName || "",
        // populate requester id if backend provides it
        requestedById: data.UserId || data.UserID || data.CreatedBy || data.RequestedBy || (data.User && (data.User.UserId || data.User.id)) || null,
        // capture reference permit info if API provides it
        referencePermitId: data.ReferencePermitId || data.ReferencePermitID || data.ReferencePermit || null,
        referencePermitNumber: data.ReferencePermitNumber || data.ReferencePermitNo || null,
        CanReopen: data?.CanReopen,
        files: (data.Files || []).map((file) => ({
          id: file.FileID || file.id || file.filename,
          name: file.FileName || file.originalName,
          size: file.FileSize || file.size,
          type: file.FileType || file.mimetype,
          url: file.FilePath ? `https://hindterminal56.onrender.com/api/permits/file/${file.FileID}` : undefined,
          preview: file.FileType?.startsWith("image/") ? `https://hindterminal56.onrender.com/api/permits/file/${file.FileID}` : null,
        })),
      });
    } catch (err) {
      console.error("Error fetching permit data:", err);
      setError("Failed to load permit data. Please try again.");
      toast.error("Failed to load permit data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when currentId changes
  useEffect(() => {
    if (currentId) loadPermit(currentId);
  }, [currentId]);

  // Fetch close documents when permit is closed
  const fetchCloseDocuments = async () => {
        try {
          const response = await fetch(`https://hindterminal56.onrender.com/api/permits/${currentId}/close-document`);
          if (!response.ok) throw new Error("Failed to fetch close documents");
    
          const result = await response.json();
    
          // API might return the array directly or an object with a `documents` property
          const rawDocs = Array.isArray(result) ? result : (result.documents || []);
    
          // Clean up any previous URLs
          closeDocuments.forEach(doc => doc.fileUrl && URL.revokeObjectURL(doc.fileUrl));
    
          const processedDocs = rawDocs.map(doc => {
            // Try to find file data in a few common shapes
            const maybeFileData = doc.FileData || doc.fileData || doc.documents?.[0]?.FileData || null;
            const maybeFileType = doc.documents?.[0]?.mimetype || doc.mimetype || 'application/octet-stream';
            const maybeFileName = doc.documents?.[0]?.originalName || doc.originalName || `Closed_Work_${doc.attachmentId}`;
    
            let blob = null;
    
            try {
              if (!maybeFileData) {
                // no inline data — try to use a file path/url if available
                if (doc.documents?.[0]?.FilePath) {
                  return {
                    attachmentId: doc.attachmentId,
                    fileUrl: doc.documents[0].FilePath,
                    fileName: maybeFileName,
                    uploadedBy: doc.uploadedBy?.userName || doc.uploadedBy || '',
                    uploadedById: doc.uploadedBy?.userId || doc.uploadedBy || '',
                    createdOn: doc.createdOn ? new Date(doc.createdOn).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '',
                  };
                }
              } else if (typeof maybeFileData === 'string') {
                // assume base64 (possibly data URI)
                const base64 = maybeFileData.startsWith('data:') ? maybeFileData.split(',')[1] : maybeFileData;
                const binaryString = atob(base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                blob = new Blob([bytes], { type: maybeFileType });
              } else if (maybeFileData && maybeFileData.type === 'Buffer' && Array.isArray(maybeFileData.data)) {
                const bytes = new Uint8Array(maybeFileData.data);
                blob = new Blob([bytes], { type: maybeFileType });
              } else if (Array.isArray(maybeFileData)) {
                const bytes = new Uint8Array(maybeFileData);
                blob = new Blob([bytes], { type: maybeFileType });
              } else if (maybeFileData instanceof ArrayBuffer) {
                blob = new Blob([maybeFileData], { type: maybeFileType });
              } else if (maybeFileData && maybeFileData.data && Array.isArray(maybeFileData.data)) {
                // sometimes the Buffer is wrapped differently
                const bytes = new Uint8Array(maybeFileData.data);
                blob = new Blob([bytes], { type: maybeFileType });
              }
            } catch (e) {
              console.warn('Could not convert file data for attachment', doc.attachmentId, e);
              blob = null;
            }
    
            const url = blob ? URL.createObjectURL(blob) : (doc.documents?.[0]?.FilePath || null);
    
            return {
              attachmentId: doc.attachmentId,
              fileUrl: url,
              fileName: maybeFileName,
              uploadedBy: doc.uploadedBy?.userName || doc.uploadedBy || '',
              uploadedById: doc.uploadedBy?.userId || doc.uploadedBy || '',
              createdOn: doc.createdOn ? new Date(doc.createdOn).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '',
            };
          });
    
          setCloseDocuments(processedDocs.filter(d => d.fileUrl));
        } catch (err) {
          console.error("Error fetching close documents:", err);
          toast.error("Failed to load close documents");
          setCloseDocuments([]);
        }
      };

  // Load close documents when status becomes "close"
  useEffect(() => {
    if (permitData.CurrentPermitStatus?.toLowerCase() === "close" || permitData.CurrentPermitStatus?.toLowerCase() === "closer pending") {
      fetchCloseDocuments();
    } else {
      setCloseDocuments([]);
    }
  }, [permitData.CurrentPermitStatus, currentId]);

  const handleClosePermit = async () => {
    try {
      setClosingPermit(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("PermitTypeId", permitData.PermitTypeId);
      formData.append("PermitId", currentId);
      formData.append("UserId", user?.UserId);

      selectedFiles.forEach((file) => {
        formData.append("files", file); // Support multiple files
      });

      const response = await fetch("https://hindterminal56.onrender.com/api/permits/close", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to close permit");
      }

      toast.success("Permit closed successfully");
      setIsModalOpen(false);
      navigate("/login/requestuser");
    } catch (err) {
      console.error("Error closing permit:", err);
      toast.error(err.message || "Failed to close permit");
    } finally {
      setClosingPermit(false);
    }
  };

 

  const closeModal = () => {
    setIsModalOpen(false);
    setUploadChoice("no");
    setSelectedFiles([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
            <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">WORK PERMIT</h1>
          </div>
          <div className="text-center text-gray-700 leading-relaxed">
            <p>
              This permit authorizes the provision of safe Access, Platforms, or Working arrangement at heights of 1.8 meters and above for the execution of the job
            </p>
          </div>
        </div>

        {/* Work Specification */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            1. Specification of Work
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permit Number</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.permitNumber || "N/A"}
                </div>
              </div>
              {permitData.referencePermitNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Permit</label>
                  <input
                    type="text"
                    value={permitData.referencePermitNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nearest Fire Alarm Point</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description of Work</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 min-h-[100px]">
                  {permitData.workDescription || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.departmentName || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Contractor Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Contractor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.contractorOrg || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.supervisorName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {permitData.contactNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Original Supporting Files */}
          {permitData.files.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Supporting Documents & Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permitData.files.map((fileObj) => (
                  <div key={fileObj.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    {fileObj.preview ? (
                      <img src={fileObj.preview} alt={fileObj.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{fileObj.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                      {fileObj.preview && (
                        <a href={fileObj.preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(permitData.CurrentPermitStatus?.toLowerCase() === "close" || permitData.CurrentPermitStatus?.toLowerCase() === "closer pending") && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-red-600" />
              Close Permit Document
            </h3>

            {closeDocuments.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Image ({closeDocuments.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {closeDocuments.map((doc) => {
                    const fileName = doc.fileName || doc.FileName || "Closed Work Image";
                    const fileUrl = doc.fileUrl || doc.directUrl || doc.FilePath || null;

                    return (
                      <div key={doc.attachmentId || fileName} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <img
                          src={fileUrl}
                          alt={fileName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                          <a
                      href={doc.fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                    >
                      View
                    </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">No close document available.</div>
            )}
          </div>
        )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pb-8 space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>

          {permitData.CurrentPermitStatus?.toLowerCase() === "approved" && (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={closingPermit}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium"
            >
              {closingPermit ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Closing...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  Close Permit
                </>
              )}
            </button>
          )}

          {(permitData.CurrentPermitStatus?.toLowerCase() === "expired" && permitData.CanReopen === true) && (
            <>
              <button
                onClick={() => {
                  // open modal and default date to 3 days from today or existing validUpto
                  const defaultDate = permitData.validUpto ? (permitData.validUpto.slice(0,10)) : (() => { const d = new Date(); d.setDate(d.getDate()+3); return d.toISOString().split('T')[0]; })();
                  setReopenDate(defaultDate);
                  setReopenError('');
                  setIsReopenModalOpen(true);
                }}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <Printer className="w-5 h-5 mr-2" />
                Reopen
              </button>

              <Modal
                isOpen={isReopenModalOpen}
                onRequestClose={() => { if (!reopening) setIsReopenModalOpen(false); }}
                contentLabel="Reopen Permit"
                className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-6 outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <h2 className="text-lg font-semibold mb-3">Reopen Permit</h2>
                <p className="text-sm text-gray-600 mb-3">Enter new Permit Valid Up To date for reopened permit.</p>

                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Up To</label>
                <input
                  type="date"
                  value={reopenDate}
                  onChange={(e) => setReopenDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                />
                {reopenError && <div className="text-sm text-red-600 mb-2">{reopenError}</div>}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => { if (!reopening) setIsReopenModalOpen(false); }}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    disabled={reopening}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // validate
                      if (!reopenDate || !/^\d{4}-\d{2}-\d{2}$/.test(reopenDate)) {
                        setReopenError('Please enter a valid date (YYYY-MM-DD)');
                        return;
                      }
                      setReopening(true);
                      setReopenError('');
                      try {
                        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
                        const userIdPayload = currentUser?.UserId || currentUser?.id || null;
                        const payload = {
                          ExpiredPermitId: Number(currentId),
                          UserId: userIdPayload,
                          PermitValidUpTo: reopenDate,
                        };

                        const res = await fetch('https://hindterminal56.onrender.com/api/permits/reopen', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });

                        if (!res.ok) {
                          const errBody = await res.json().catch(() => ({}));
                          throw new Error(errBody.message || 'Failed to reopen permit');
                        }

                        const data = await res.json().catch(() => ({}));
                        // success - do not navigate; load the newly created permit data on this page
                        setIsReopenModalOpen(false);
                        toast.success(data.message || 'Permit reopened successfully');
                        if (data.newPermitId) {
                          // switch currentId to new permit and reload
                          setCurrentId(String(data.newPermitId));
                          // loadPermit will run via effect, but call it directly to ensure immediate update
                          try {
                            await loadPermit(data.newPermitId);
                          } catch (e) {
                            console.warn('Failed to load newly reopened permit immediately:', e);
                          }
                        }
                      } catch (err) {
                        console.error('Reopen error:', err);
                        setReopenError(err.message || 'Failed to reopen permit');
                      } finally {
                        setReopening(false);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                    disabled={reopening}
                  >
                    {reopening ? 'Reopening...' : 'Confirm'}
                  </button>
                </div>
              </Modal>
            </>
          )}
        </div>

        {/* Close Documents Section - Clean & Beautiful */}
        

        {/* Confirm Close Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Confirm Close Permit"
          className="max-w-lg mx-auto bg-white rounded-xl shadow-xl p-6 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Close Permit</h2>
          <p className="text-gray-600 mb-5">
            Do you really want to close Permit #{permitData.permitNumber}? This action cannot be undone.
          </p>

          <div className="mb-5">
            <p className="font-medium text-gray-700 mb-3">Do you want to upload image(s) of the completed work?</p>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="upload"
                  value="yes"
                  checked={uploadChoice === "yes"}
                  onChange={() => setUploadChoice("yes")}
                  className="mr-2"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="upload"
                  value="no"
                  checked={uploadChoice === "no"}
                  onChange={() => setUploadChoice("no")}
                  className="mr-2"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {uploadChoice === "yes" && (
            <div className="mb-5">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, GIF</p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-red-600 hover:text-red-800">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleClosePermit}
              disabled={closingPermit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition flex items-center"
            >
              {closingPermit ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Closing...
                </>
              ) : (
                "Confirm Close"
              )}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ViewPermit;