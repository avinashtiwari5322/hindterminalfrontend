import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,

  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom"; // Import useNavigate

import hindLogo from "../../Assets/hindimg.png";
import { Printer } from "lucide-react";

const Home2 = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  
  // Function to generate auto permit number
  // const generatePermitNumber = () => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, '0');
  //   const day = String(today.getDate()).padStart(2, '0');
  //   const time = String(today.getHours()).padStart(2, '0') + String(today.getMinutes()).padStart(2, '0');
  //   return `HTPL/${year}${month}${day}${time}`;
  // };
  useEffect(() => {
  const fetchPermitNumber = async () => {
    const permitNum = await generatePermitNumber();
    setFormData((prev) => ({
      ...prev,
      permitNumber: permitNum,
    }));
  };

  fetchPermitNumber();
}, []);

  const generatePermitNumber = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/last-permit-number");
    const data = await response.json();

    // Get current financial year format e.g. "2025-26"
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = (currentYear + 1).toString().slice(-2);
    const financialYear = `${currentYear}-${nextYear}`;

    const prefix = `HTPL/${financialYear}/`;

    let lastPermit = data?.permitNumber;

    if (lastPermit && lastPermit.startsWith(`HTPL/${financialYear}/`)) {
      const lastNumberStr = lastPermit.split("/")[2]; // Get "NN"
      const lastNumber = parseInt(lastNumberStr, 10);

      if (!isNaN(lastNumber)) {
        const nextNumber = String(lastNumber + 1).padStart(2, '0');
        return `${prefix}${nextNumber}`;
      }
    }

    // If no permit or new financial year
    return `${prefix}01`;
  } catch (error) {
    console.error("Error generating permit number:", error);

    // Default fallback
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = (currentYear + 1).toString().slice(-2);
    const financialYear = `${currentYear}-${nextYear}`;

    return `HTPL/${financialYear}/01`;
  }
};



  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Function to get date 3 days from today in YYYY-MM-DDTHH:MM format
  const getValidUptoDate = () => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    // Format to YYYY-MM-DDTHH:MM (datetime-local format)
    const year = threeDaysLater.getFullYear();
    const month = String(threeDaysLater.getMonth() + 1).padStart(2, '0');
    const day = String(threeDaysLater.getDate()).padStart(2, '0');
    const hours = String(threeDaysLater.getHours()).padStart(2, '0');
    const minutes = String(threeDaysLater.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const today = new Date().toISOString().split("T")[0];

   const [formData, setFormData] = useState({
    permitDate: getTodayDate(),
    permitNumber:  "",
    location: "",
    validUpto: getValidUptoDate(),
    fireAlarmPoint: "",
    totalWorkers: "",
    workDescription: "",
    contractorOrg: "",
    supervisorName: "",
    contactNumber: "",
    receiverChecks: {},
    issuerChecks: {},
    ppe: {},
    files: [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const errors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`File "${file.name}" exceeds 4MB limit`);
      } else if (!allowedTypes.includes(file.type)) {
        errors.push(`File "${file.name}" is not a supported file type`);
      } else {
        validFiles.push({
          id: Date.now() + index,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          url: null,
        });
      }
    });

    setUploadErrors(errors);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    // Clear the input value to allow re-selecting the same file
    e.target.value = "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (fileId) => {
    setFormData((prev) => {
      const updatedFiles = prev.files.filter((f) => f.id !== fileId);
      // Clean up blob URLs to prevent memory leaks
      const fileToRemove = prev.files.find((f) => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return {
        ...prev,
        files: updatedFiles,
      };
    });
  };

  // Validation function
  const validateForm = () => {
    const errors = [];

    if (!formData.permitDate) errors.push("Permit Date is required");
    if (!formData.permitNumber) errors.push("Permit Number is required");
    if (!formData.location) errors.push("Work Location is required");
    if (!formData.validUpto) errors.push("Valid Up To date is required");
    if (!formData.totalWorkers) errors.push("Total Workers is required");
    if (!formData.workDescription) errors.push("Work Description is required");
    if (!formData.contractorOrg) errors.push("Organization is required");
    if (!formData.supervisorName) errors.push("Supervisor Name is required");
    if (!formData.contactNumber) errors.push("Contact Number is required");

    return errors;
  };

  // Function to prepare FormData for API call (including files)
  const prepareFormData = () => {
    const apiFormData = new FormData();
    
    // Add text fields
    apiFormData.append('PermitDate', formData.permitDate);
    apiFormData.append('NearestFireAlarmPoint', formData.fireAlarmPoint || '');
    apiFormData.append('PermitNumber', formData.permitNumber);
    apiFormData.append('TotalEngagedWorkers', parseInt(formData.totalWorkers) || 0);
    apiFormData.append('WorkLocation', formData.location);
    apiFormData.append('WorkDescription', formData.workDescription);
    apiFormData.append('PermitValidUpTo', formData.validUpto);
    apiFormData.append('Organization', formData.contractorOrg);
    apiFormData.append('SupervisorName', formData.supervisorName);
    apiFormData.append('ContactNumber', formData.contactNumber);
    
    // Add audit fields
    apiFormData.append('Created_by', 'User'); // You can get this from auth context
    apiFormData.append('Updated_by', 'User');
    
    // Add checkbox values (scaffold safety checklist)
    Object.entries(formData.receiverChecks).forEach(([key, value]) => {
      apiFormData.append(key, value);
    });
    
    // Add checkbox values (issuer checks)
    Object.entries(formData.issuerChecks).forEach(([key, value]) => {
      apiFormData.append(key, value);
    });
    
    // Add PPE checkbox values
    Object.entries(formData.ppe).forEach(([key, value]) => {
      apiFormData.append(key, value);
    });
    
    // Add files
    formData.files.forEach((fileObj) => {
      apiFormData.append('files', fileObj.file);
    });
    
    return apiFormData;
  };

  // Function to post permit data to API with files
  const postPermitData = async () => {
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(
        "Please fill in all required fields: " + validationErrors.join(", ")
      );
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = prepareFormData();

      const response = await axios.post(
        "http://localhost:4000/api/permits",
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            
            // Optionally, show a toast for progress
          },
        }
      );

      console.log("Response:", response.data);
      toast.success(`${response.data.message} (${response.data.uploadedFiles} files uploaded)`);

      // Navigate to success page or dashboard after successful submission
      // You can customize the route and pass data if needed
      navigate('/login', { 
        state: { 
          permitNumber: formData.permitNumber,
          message: response.data.message 
        } 
      });

      // Alternative navigation options:
      // navigate('/dashboard'); // Simple navigation
      // navigate('/permits'); // Go to permits list
      // navigate(-1); // Go back to previous page
      // navigate('/permits/view/' + response.data.permitId); // Go to view permit page

    } catch (error) {
      console.error("Error posting permit data:", error);
      toast.error(
        error.response?.data?.error ||
        "Failed to submit permit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


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
            <div className="text-right text-sm text-gray-600">
              <div>Doc. No.: HTPL/OHS/23</div>
              <div>Eff. Date: 02.01.24</div>
              <div>Rev. No. & Date 00</div>
            </div>
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
                  Permit Number *
                </label>
                <input
                  type="text"
                  value={formData.permitNumber}
                  onChange={(e) =>
                    handleInputChange("permitNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated permit number</p>
              </div>

              <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nearest Fire Alarm Point *
    </label>
    <select
      value={formData.fireAlarmPoint}
      onChange={(e) => handleInputChange("fireAlarmPoint", e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    >
      <option value="">-- Select Fire Alarm Point --</option>
      <option value="Main Gate">Main Gate</option>
      <option value="Dockyard Office">Dockyard Office</option>
      <option value="Warehouse A">Warehouse A</option>
      <option value="Warehouse B">Warehouse B</option>
      <option value="Container Yard">Container Yard</option>
      <option value="Fuel Station">Fuel Station</option>
      <option value="Maintenance Shed">Maintenance Shed</option>
      <option value="Cranes Zone">Cranes Zone</option>
    </select>
  </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <MapPin className="w-4 h-4 inline mr-1" />
    Location of Work *
  </label>
  <select
    value={formData.location}
    onChange={(e) => handleInputChange("location", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value="">-- Select Location --</option>
    <option value="Main Dock">Main Dock</option>
    <option value="Dry Dock">Dry Dock</option>
    <option value="Cargo Handling Area">Cargo Handling Area</option>
    <option value="Maintenance Bay">Maintenance Bay</option>
    <option value="Electrical Room">Electrical Room</option>
    <option value="Crane Operating Zone">Crane Operating Zone</option>
    <option value="Fuel Storage Area">Fuel Storage Area</option>
    <option value="Workshop 1">Workshop 1</option>
    <option value="Workshop 2">Workshop 2</option>
    <option value="Security Post">Security Post</option>
  </select>
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Permit Valid Up to *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUpto}
                  onChange={(e) =>
                    handleInputChange("validUpto", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Set to 3 days from today</p>
              </div>
            </div>

            <div className="space-y-4">
             <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <Calendar className="w-4 h-4 inline mr-1" />
    Date of Permit to Work *
  </label>
  <input
    type="date"
    value={formData.permitDate || today}
    onChange={(e) =>
      handleInputChange("permitDate", e.target.value)
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    required
  />
  <p className="text-xs text-gray-500 mt-1">Default set to today, editable</p>
</div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <Users className="w-4 h-4 inline mr-1" />
    Total Number of Engaged Workers *
  </label>
  <input
    type="number"
    min="1"
    max="999"
    value={formData.totalWorkers}
    onChange={(e) => {
      const value = parseInt(e.target.value, 10);
      if (value >= 1 && value <= 999) {
        handleInputChange("totalWorkers", value);
      } else if (e.target.value === "") {
        handleInputChange("totalWorkers", "");
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  />
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Work *
                </label>
                <textarea
                  rows={4}
                  value={formData.workDescription}
                  onChange={(e) =>
                    handleInputChange("workDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the work to be performed..."
                  required
                />
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
                  Organization *
                </label>
                <input
                  type="text"
                  value={formData.contractorOrg}
                  onChange={(e) =>
                    handleInputChange("contractorOrg", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor Name *
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) =>
                    handleInputChange("supervisorName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
             <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      // Only allow numeric values
                      const numericValue = e.target.value.replace(/\D/g, "");
                      if (numericValue.length <= 10) {
                        handleInputChange("contactNumber", numericValue);
                      }
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10); // Force only digits and max 10 length
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="\d{10}"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    minLength="10"
                    required
                  />
                </div>

            </div>
          </div>

          

          {/* File Upload Section */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              Supporting Documents & Images
            </h3>

            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload files or drag and drop
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum file size: 4MB per file • Maximum 10 files • Supported formats: Images (JPEG, PNG, GIF, WebP), PDF, DOC, DOCX, TXT
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>

              {/* Upload Errors */}
              {uploadErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h4 className="text-sm font-medium text-red-800">
                      Upload Errors
                    </h4>
                  </div>
                  <ul className="mt-2 text-sm text-red-700">
                    {uploadErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Uploaded Files ({formData.files.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.files.map((fileObj) => (
                      <div
                        key={fileObj.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                      >
                        {fileObj.preview && fileObj.type && fileObj.type.startsWith("image/") ? (
                          <img
                            src={fileObj.preview}
                            alt={fileObj.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : fileObj.url && fileObj.type && fileObj.type.startsWith("image/") ? (
                          <img
                            src={fileObj.url}
                            alt={fileObj.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileObj.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileObj.size)}
                          </p>
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
                        <button
                          type="button"
                          onClick={() => removeFile(fileObj.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
   

        </div>

        

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pb-8">
          <button
            onClick={postPermitData}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              "Submit for Approval"
            )}
          </button>         <button
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

export default Home2;