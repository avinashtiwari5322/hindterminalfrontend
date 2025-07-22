import React, { useState } from "react";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";

import hindLogo from "../../Assets/hindimg.png";

const Home2 = () => {
  const [formData, setFormData] = useState({
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
    receiverChecks: {},
    issuerChecks: {},
    ppe: {},
    files: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
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
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
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

  const handleCheckboxChange = (section, item, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: value,
      },
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
      apiFormData.append('documents', fileObj.file);
    });
    
    return apiFormData;
  };

  // Function to post permit data to API with files
  const postPermitData = async () => {
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({
        type: "error",
        message:
          "Please fill in all required fields: " + validationErrors.join(", "),
      });
      return;
    }

    setLoading(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const formDataToSend = prepareFormData();

      const response = await axios.post(
        "https://hinbackend.onrender.com/api/permits",
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Response:", response.data);
      setSubmitStatus({
        type: "success",
        message: `${response.data.message} (${response.data.uploadedFiles} files uploaded)`,
      });

      // Optional: Reset form after successful submission
      // resetForm();
    } catch (error) {
      console.error("Error posting permit data:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.error ||
          "Failed to submit permit. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to save draft (simplified version without files for now)
  const saveDraft = async () => {
    setLoading(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const data = {
        PermitDate: formData.permitDate,
        NearestFireAlarmPoint: formData.fireAlarmPoint || null,
        PermitNumber: formData.permitNumber,
        TotalEngagedWorkers: parseInt(formData.totalWorkers) || 0,
        WorkLocation: formData.location,
        WorkDescription: formData.workDescription,
        PermitValidUpTo: formData.validUpto,
        Organization: formData.contractorOrg,
        SupervisorName: formData.supervisorName,
        ContactNumber: formData.contactNumber,
        isDraft: true, // Flag to indicate this is a draft
      };

      const response = await axios.post(
        "https://hinbackend.onrender.com/api/permits/draft",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Draft saved:", response.data);
      setSubmitStatus({
        type: "success",
        message: "Draft saved successfully!",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to save draft. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to reset form
  const resetForm = () => {
    // Clean up blob URLs to prevent memory leaks
    formData.files.forEach(fileObj => {
      if (fileObj.preview) {
        URL.revokeObjectURL(fileObj.preview);
      }
    });
    
    setFormData({
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
      receiverChecks: {},
      issuerChecks: {},
      ppe: {},
      files: [],
    });
    setSubmitStatus({ type: "", message: "" });
    setUploadErrors([]);
  };

  const receiverCheckItems = [
    {
      id: "ScaffoldChecked",
      text: "Have scaffolds been checked and certified in prescribed form by scaffold supervisor?",
    },
    {
      id: "ScaffoldTagged",
      text: "Have scaffolds been tagged with green card duly filled and signed by scaffold supervisor?",
    },
    {
      id: "ScaffoldRechecked",
      text: "Is scaffold rechecked and re-certified weekly?",
    },
    {
      id: "ScaffoldErected",
      text: "Is scaffold erected on firm ground and sole plate and base plate have been used?",
    },
    {
      id: "HangingBaskets",
      text: "Are the hanging baskets used of proper construction, tested and certified for the purpose?",
    },
    {
      id: "PlatformSafe",
      text: "Is the work platform made free of hazards of all traps/trips/slips and fall?",
    },
    {
      id: "CatLadders",
      text: "Have cat ladders, crawling boards etc been used for safe working at sloping roof?",
    },
    {
      id: "EdgeProtection",
      text: "Has edge protection provided against fall from roof/elevated space?",
    },
  ];

  const issuerCheckItems = [
    {
      id: "Platforms",
      text: "Are the platforms been provided with Toe board, guardrail and area below is barricaded?",
    },
    {
      id: "SafetyHarness",
      text: "Checked whether safety harness and necessary arrangement for tying the lifeline, fall arresters etc provided to the worker for working at height?",
    },
    {
      id: "EnergyPrecautions",
      text: "Have precautions been listed below for safe working at height for source of energy Such as electricity?",
    },
    {
      id: "Illumination",
      text: "Is the raised work surface properly illuminated?",
    },
    {
      id: "UnguardedAreas",
      text: "Are the workers working near unguarded shafts, excavations or hot line?",
    },
    {
      id: "FallProtection",
      text: "Checked for provision of collective fall protection such as safety net?",
    },
    {
      id: "AccessMeans",
      text: "Are proper means of access to the scaffold including use of standard aluminium ladder provided?",
    },
  ];

  const ppeItems = [
    { id: "SafetyHelmet", text: "Safety Helmet" },
    { id: "SafetyJacket", text: "Safety Jacket" },
    { id: "SafetyShoes", text: "Safety Shoes" },
    { id: "Gloves", text: "Gloves" },
    { id: "SafetyGoggles", text: "Safety Goggles" },
    { id: "FaceShield", text: "Face Shield" },
    { id: "DustMask", text: "Dust Mask" },
    { id: "EarPlugEarmuff", text: "Ear plug/Earmuff" },
    { id: "AntiSlipFootwear", text: "Anti Slip footwear" },
    { id: "SafetyNet", text: "Safety Net" },
    { id: "AnchorPointLifelines", text: "Anchor Point/Lifelines" },
    { id: "SelfRetractingLifeline", text: "Self retracting Lifeline (SRL)" },
    { id: "FullBodyHarness", text: "Full body harness with lanyard or shock absorbers" },
  ];

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
              HEIGHT WORK PERMIT
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

        {/* Submit Status Message */}
        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {submitStatus.type === "success" ? (
                <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              )}
              {submitStatus.message}
            </div>
          </div>
        )}

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
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Permit to Work *
                </label>
                <input
                  type="date"
                  value={formData.permitDate}
                  onChange={(e) =>
                    handleInputChange("permitDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Number *
                </label>
                <input
                  type="text"
                  placeholder="HTPL/HWP/"
                  value={formData.permitNumber}
                  onChange={(e) =>
                    handleInputChange("permitNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location of Work *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearest Fire Alarm Point
                </label>
                <input
                  type="text"
                  value={formData.fireAlarmPoint}
                  onChange={(e) =>
                    handleInputChange("fireAlarmPoint", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Total Number of Engaged Workers *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalWorkers}
                  onChange={(e) =>
                    handleInputChange("totalWorkers", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
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
                        {fileObj.preview ? (
                          <img
                            src={fileObj.preview}
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
            onClick={saveDraft}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              "Save Draft"
            )}
          </button>
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
          </button>
          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home2;