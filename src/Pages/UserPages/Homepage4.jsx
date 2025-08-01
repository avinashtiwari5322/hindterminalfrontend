import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

import hindLogo from "../../Assets/hindimg.png";
import { toast } from 'react-toastify';

const HeightWorkPermit3 = (props) => {
  const { id } = useParams();
  const isAdminView = !!id;

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
    issuer: {
      name: "",
      designation: "",
      dateTime: "",
      updatedBy: ""
    },
    receiver: {
      name: "",
      designation: "",
      dateTime: "",
      updatedBy: ""
    },
    energyIsolate: {
      name: "",
      designation: "",
      dateTime: "",
      updatedBy: ""
    },
    reviewer: {
      name: "",
      designation: "",
      dateTime: "",
      updatedBy: ""
    },
    approver: {
      name: "",
      designation: "",
      dateTime: "",
      updatedBy: ""
    },
    additionalPpe: "",
    REASON: ""
  });
  const [uploadErrors, setUploadErrors] = useState([]);
  

  const navigate = useNavigate()

  const approval = ()=>{
    toast.success('approved')
    navigate('/login')
  }
  useEffect(() => {
    if (isAdminView && id) {
      fetch(`http://localhost:4000/api/permits/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
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
            REASON: data.REASON || "",
            additionalPpe: data.ADDITIONAL_PPE || "",
            receiverChecks: {
              scaffoldChecked: data.ScaffoldChecked ? "done" : "not-required",
              scaffoldTagged: data.ScaffoldTagged ? "done" : "not-required",
              scaffoldRechecked: data.ScaffoldRechecked ? "done" : "not-required",
              scaffoldErected: data.ScaffoldErected ? "done" : "not-required",
              hangingBaskets: data.HangingBaskets ? "done" : "not-required",
              platformSafe: data.PlatformSafe ? "done" : "not-required",
              catLadders: data.CatLadders ? "done" : "not-required",
              edgeProtection: data.EdgeProtection ? "done" : "not-required",
            },
            issuerChecks: {
              platforms: data.Platforms ? "done" : "not-required",
              safetyHarness: data.SafetyHarness ? "done" : "not-required",
              energyPrecautions: data.EnergyPrecautions ? "done" : "not-required",
              illumination: data.Illumination ? "done" : "not-required",
              unguardedAreas: data.UnguardedAreas ? "done" : "not-required",
              fallProtection: data.FallProtection ? "done" : "not-required",
              accessMeans: data.AccessMeans ? "done" : "not-required",
            },
            ppe: {
              "safetyHelmet": data.SafetyHelmet || false,
              "safetyJacket": data.SafetyJacket || false,
              "safetyShoes": data.SafetyShoes || false,
              "gloves": data.Gloves || false,
              "safetyGoggles": data.SafetyGoggles || false,
              "faceShield": data.FaceShield || false,
              "dustMask": data.DustMask || false,
              "earPlugOrEarmuff": data.EarPlugEarmuff || false,
              "antiSlipFootwear": data.AntiSlipFootwear || false,
              "Safety Net": data.SafetyNet || false,
  
              "selfRetractingLifeline": data.SelfRetractingLifeline || false,
              "fullBodyHarness": data.FullBodyHarness || false,
            },
            issuer: {
              name: data.Issuer_Name || "",
              designation: data.Issuer_Designation || "",
              dateTime: data.Issuer_DateTime ? data.Issuer_DateTime.slice(0, 16) : "",
              updatedBy: data.Issuer_UpdatedBy || ""
            },
            receiver: {
              name: data.Receiver_Name || "",
              designation: data.Receiver_Designation || "",
              dateTime: data.Receiver_DateTime ? data.Receiver_DateTime.slice(0, 16) : "",
              updatedBy: data.Receiver_UpdatedBy || ""
            },
            energyIsolate: {
              name: data.EnergyIsolate_Name || "",
              designation: data.EnergyIsolate_Designation || "",
              dateTime: data.EnergyIsolate_DateTime ? data.EnergyIsolate_DateTime.slice(0, 16) : "",
              updatedBy: data.EnergyIsolate_UpdatedBy || ""
            },
            reviewer: {
              name: data.Reviewer_Name || "",
              designation: data.Reviewer_Designation || "",
              dateTime: data.Reviewer_DateTime ? data.Reviewer_DateTime.slice(0, 16) : "",
              updatedBy: data.Reviewer_UpdatedBy || ""
            },
            approver: {
              name: data.Approver_Name || "",
              designation: data.Approver_Designation || "",
              dateTime: data.Approver_DateTime ? data.Approver_DateTime.slice(0, 16) : "",
              updatedBy: data.Approver_UpdatedBy || ""
            },
            files: (data.files || []).map((file) => ({
              id: file.FileID || file.id || file.filename,
              name: file.FileName || file.originalName,
              size: file.FileSize || file.size,
              type: file.FileType || file.mimetype,
              url: file.FilePath ? `http://localhost:4000/api/permits/file/${file.FileID}` : undefined,
              preview: file.FileType && file.FileType.startsWith("image/") ? `http://localhost:4000/api/permits/file/${file.FileID}` : null,
            })),
          }));
        })
        .catch((error) => {
          toast.error("Error fetching permit data: " + error.message);
        });
    }
  }, [isAdminView, id]);

  

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 4 * 1024 * 1024;
    const errors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`File "${file.name}" exceeds 4MB limit`);
      } else {
        validFiles.push({
          id: Date.now() + index,
          file,
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

    e.target.value = "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkflowChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
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
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };


  const receiverCheckItems = [
    {
      id: "scaffoldChecked",
      text: "Have scaffolds been checked and certified in prescribed form by scaffold supervisor?",
    },
    {
      id: "scaffoldTagged",
      text: "Have scaffolds been tagged with green card duly filled and signed by scaffold supervisor?",
    },
    {
      id: "scaffoldRechecked",
      text: "Is scaffold rechecked and re-certified weekly?",
    },
    {
      id: "scaffoldErected",
      text: "Is scaffold erected on firm ground and sole plate and base plate have been used?",
    },
    {
      id: "hangingBaskets",
      text: "Are the hanging baskets used of proper construction, tested and certified for the purpose?",
    },
    {
      id: "platformSafe",
      text: "Is the work platform made free of hazards of all traps/trips/slips and fall?",
    },
    {
      id: "catLadders",
      text: "Have cat ladders, crawling boards etc been used for safe working at sloping roof?",
    },
    {
      id: "edgeProtection",
      text: "Has edge protection provided against fall from roof/elevated space?",
    },
  ];

  const issuerCheckItems = [
    {
      id: "platforms",
      text: "Are the platforms been provided with Toe board, guardrail and area below is barricaded?",
    },
    {
      id: "safetyHarness",
      text: "Checked whether safety harness and necessary arrangement for tying the lifeline, fall arresters etc provided to the worker for working at height?",
    },
    {
      id: "energyPrecautions",
      text: "Have precautions been listed below for safe working at height for source of energy Such as electricity?",
    },
    {
      id: "illumination",
      text: "Is the raised work surface properly illuminated?",
    },
    {
      id: "unguardedAreas",
      text: "Are the workers working near unguarded shafts, excavations or hot line?",
    },
    {
      id: "fallProtection",
      text: "Checked for provision of collective fall protection such as safety net?",
    },
    {
      id: "accessMeans",
      text: "Are proper means of access to the scaffold including use of standard aluminium ladder provided?",
    },
  ];

  const ppeItems = [
    { id: "safetyHelmet", text: "Safety Helmet" },
    { id: "safetyJacket", text: "Safety Jacket" },
    { id: "safetyShoes", text: "Safety Shoes" },
    { id: "gloves", text: "Gloves" },
    { id: "safetyGoggles", text: "Safety Goggles" },
    { id: "faceShield", text: "Face Shield" },
    { id: "dustMask", text: "Dust Mask" },
    { id: "earPlugEarmuff", text: "Ear plug/Earmuff" },
    { id: "antiSlipFootwear", text: "Anti Slip footwear" },
    { id: "safetyNet", text: "Safety Net" },
    { id: "anchorPointLifelines", text: "Anchor Point/Lifelines" },
    { id: "selfRetractingLifeline", text: "Self retracting Lifeline (SRL)" },
    { id: "fullBodyHarness", text: "Full body harness with lanyard or shock absorbers" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-2">
              <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Doc. No.: HTPL/OHS/23</div>
              <div>Eff. Date: 02.01.24</div>
              <div>Rev. No. & Date 00</div>
            </div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4"> WORK PERMIT</h1>
          </div>
          <div className="text-center text-gray-700 leading-relaxed">
            <p>This permit authorizes the provision of safe Access, Platforms, or Working arrangement at heights of 1.8 meters and above for the execution of the job)</p>
          </div>
        </div>

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
                <input
                  type="text"
                  placeholder="HTPL/HWP/"
                  value={formData.permitNumber}
                  onChange={(e) => handleInputChange("permitNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearest Fire Alarm Point
                </label>
                <input
                  type="text"
                  value={formData.fireAlarmPoint}
                  onChange={(e) => handleInputChange("fireAlarmPoint", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location of Work
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Permit Valid Up to
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUpto}
                  onChange={(e) => handleInputChange("validUpto", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Permit to Work
                </label>
                <input
                  type="date"
                  value={formData.permitDate}
                  onChange={(e) => handleInputChange("permitDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Total Number of Engaged Workers
                </label>
                <input
                  type="number"
                  value={formData.totalWorkers}
                  onChange={(e) => handleInputChange("totalWorkers", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Work
                </label>
                <textarea
                  rows={4}
                  value={formData.workDescription}
                  onChange={(e) => handleInputChange("workDescription", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Contractor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <input
                  type="text"
                  value={formData.contractorOrg}
                  onChange={(e) => handleInputChange("contractorOrg", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => handleInputChange("supervisorName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              Uploaded Images
            </h3>
            <div className="space-y-4">
              
              {uploadErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                  </div>
                  <ul className="mt-2 text-sm text-red-700">
                    {uploadErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({formData.files.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.files.map((fileObj) => (
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

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">2. RECEIVER Compliance Check</h2>
          <p className="text-gray-600 mb-6">Check the following items for compliance before requiring the permission</p>
          <div className="space-y-4">
            {receiverCheckItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-blue-600 mt-1">{index + 1}.</span>
                <p className="flex-1 text-gray-800">{item.text}</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="done"
                      checked={formData.receiverChecks[item.id] === "done"}
                      onChange={(e) => handleCheckboxChange("receiverChecks", item.id, e.target.value)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-600 font-medium">Done</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="not-required"
                      checked={formData.receiverChecks[item.id] === "not-required"}
                      onChange={(e) => handleCheckboxChange("receiverChecks", item.id, e.target.value)}
                      className="mr-2 text-gray-600"
                    />
                    <span className="text-gray-600 font-medium">Not Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">3. ISSUER Risk Assessment</h2>
          <p className="text-gray-600 mb-6">The following items shall be checked for Risk Assessment by ISSUER and complied by the RECEIVER</p>
          <div className="space-y-4">
            {issuerCheckItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-blue-600 mt-1">{index + 1}.</span>
                <p className="flex-1 text-gray-800">{item.text}</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="done"
                      checked={formData.issuerChecks[item.id] === "done"}
                      onChange={(e) => handleCheckboxChange("issuerChecks", item.id, e.target.value)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-600 font-medium">Done</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="not-required"
                      checked={formData.issuerChecks[item.id] === "not-required"}
                      onChange={(e) => handleCheckboxChange("issuerChecks", item.id, e.target.value)}
                      className="mr-2 text-gray-600"
                    />
                    <span className="text-gray-600 font-medium">Not Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Required PPE to be Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ppeItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.ppe[item.id] || false}
                onChange={(e) =>
                  handleCheckboxChange("ppe", item.id, e.target.checked)
                }
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-800">{item.text}</span>
            </label>
          ))}
        </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional PPE (If any)</label>
            <textarea
              rows={3}
              value={formData.additionalPpe}
              onChange={(e) => handleInputChange("additionalPpe", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specify any additional PPE requirements..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">5. Work Authorised by</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Authority</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Designation</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Date & Time</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Updated By</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Issuer</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.issuer.name}
                      onChange={(e) => handleWorkflowChange("issuer", "name", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.issuer.designation}
                      onChange={(e) => handleWorkflowChange("issuer", "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      value={formData.issuer.dateTime}
                      onChange={(e) => handleWorkflowChange("issuer", "dateTime", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.issuer.updatedBy}
                      onChange={(e) => handleWorkflowChange("issuer", "updatedBy", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Updated By"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Receiver</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.receiver.name}
                      onChange={(e) => handleWorkflowChange("receiver", "name", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.receiver.designation}
                      onChange={(e) => handleWorkflowChange("receiver", "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      value={formData.receiver.dateTime}
                      onChange={(e) => handleWorkflowChange("receiver", "dateTime", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.receiver.updatedBy}
                      onChange={(e) => handleWorkflowChange("receiver", "updatedBy", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Updated By"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Energy Isolate By:<br />
                    <span className="text-sm text-gray-500">(if isolation required)</span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.energyIsolate.name}
                      onChange={(e) => handleWorkflowChange("energyIsolate", "name", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.energyIsolate.designation}
                      onChange={(e) => handleWorkflowChange("energyIsolate", "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      value={formData.energyIsolate.dateTime}
                      onChange={(e) => handleWorkflowChange("energyIsolate", "dateTime", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.energyIsolate.updatedBy}
                      onChange={(e) => handleWorkflowChange("energyIsolate", "updatedBy", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Updated By"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Reviewer (QHSE)</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.reviewer.name}
                      onChange={(e) => handleWorkflowChange("reviewer", "name", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.reviewer.designation}
                      onChange={(e) => handleWorkflowChange("reviewer", "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      value={formData.reviewer.dateTime}
                      onChange={(e) => handleWorkflowChange("reviewer", "dateTime", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.reviewer.updatedBy}
                      onChange={(e) => handleWorkflowChange("reviewer", "updatedBy", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Updated By"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">Approver</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.approver.name}
                      onChange={(e) => handleWorkflowChange("approver", "name", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.approver.designation}
                      onChange={(e) => handleWorkflowChange("approver", "designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      value={formData.approver.dateTime}
                      onChange={(e) => handleWorkflowChange("approver", "dateTime", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      value={formData.approver.updatedBy}
                      onChange={(e) => handleWorkflowChange("approver", "updatedBy", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Updated By"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">6. Do's & Don't</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 w-16">S.N.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-green-700 w-1/2">Do's</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-700 w-1/2">Don't</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">1</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Ensure the availability of valid work permit before start of work.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Never stand or work under suspended loads.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">2</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Ensure that work permit conditions are fully complied at site.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Do not use short cuts on work.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">3</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Equipment should be properly isolated from all sources of energy before start of work.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Do not wear loose/ synthetic clothes while at work.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">4</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Ensure that walkways and passages are free from all slip/trip and fall hazard.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Never perform general work without a safety jacket or safety shoes.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">5</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">All draining of oil should be in closed system as the draining of oil on floor will make the work area and area around the work unsafe.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Do not run a machine without putting back the guard on its exposed moving part.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">6</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Ensure proper illumination of workplace while working in dark.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">All works at height shall be discontinued during rain/high wind/floods.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">7</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Use of approved type full body safety harness along with lifeline is must for working at height of 2.0 m and above, Use of safety helmet and shoe is mandatory for all work sites.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">Do not continue the job in case scaffold is sagging unduly, report to ISSUER or RECEIVER.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">8</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Receiver should ensure that the lifting machine (crane), tools and tackles are properly tested and SWL and date of testing is displayed on equipment.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">9</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Barricading of the area below lifting machine (crane), chain pulley blocks etc, should be ensured before starting the job.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">10</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Remove all scraps, unused material from site on completion of work.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">11</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">Receiver/worker should know the nearest fire alarm point, fire order, emergency contact no., escape route and location assembly points.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">12</td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">After the completion of the job, copies of work permit should be returned to the ISSUER.</td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>

              </tbody>
              
            </table>

            
                            <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Click to upload files or drag and drop</p>
                            <p className="text-sm text-gray-500 mb-4">Maximum file size: 4MB per file • Supported formats: Images, PDF, DOC, DOCX, TXT</p>
                            <input
                              type="file"
                              name="files"
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
                          {uploadErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                              </div>
                              <ul className="mt-2 text-sm text-red-700">
                                {uploadErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {formData.files.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({formData.files.length})</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.files.map((fileObj) => (
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

            
            
                                     <div className="mt-6">
            <label className="block text-md font-medium text-gray-700 mb-2">Reason</label>
            <input
              type="text"
              value={formData.REASON}
              onChange={(e) => handleInputChange("REASON", e.target.value)}
              className="w-full px-3 py-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for work"
            />
          </div>
          </div>
                <button 
              onClick={approval}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
            Approve
            </button>      <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reject
            </button>
        </div>

        



        
      </div>
    </div>
  );
};

export default HeightWorkPermit3;