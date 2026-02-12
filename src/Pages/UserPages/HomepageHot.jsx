import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertCircle,
  Upload,
  XCircle,
  X,
  Printer,
} from "lucide-react";
import { toast } from 'react-toastify';
import hindLogo from "../../Assets/hindimg.png";
import Modal from "react-modal";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';


const HotWorkPermit4 = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const roleId = user.roleId || user.RoleId;
  const navigate = useNavigate();
  const { id } = useParams();
  const isAdminView = !!id;

  const [formData, setFormData] = useState({
    PermitTypeId: 3,
    permitDate: "",
    permitNumber: "",
    location: "",
    validUpto: "",
    fireAlarmPoint: "",
    totalWorkers: "",
    workDescription: "",
    department: "",
    contractorOrg: "",
    supervisorName: "",
    contactNumber: "",
    receiverChecks: {},
    residualHazards: {},
    ppe: {},
    files: [],
    issuer: { name: "", designation: "", dateTime: "", updatedBy: "" },
    receiver: { name: "", designation: "", dateTime: "", updatedBy: "" },
    energyIsolate: { name: "", designation: "", dateTime: "", updatedBy: "" },
    reviewer: { name: "", designation: "", dateTime: "", updatedBy: "" },
    approver: { name: "", designation: "", dateTime: "", updatedBy: "" },
    additionalPpe: "",
    otherHazards: "",
    machineId: "",
    lockTagNo: "",
    reason: "",
    status: "Active",
    isolationRequired: false,
    WorkLocationId: null,
    AlarmPointId: null,
    DepartmentId: null,
  });

  // Close Permit States
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [uploadChoice, setUploadChoice] = useState("no");
  const [selectedCloseFiles, setSelectedCloseFiles] = useState([]);
  const [closingPermit, setClosingPermit] = useState(false);
  const [closeDocuments, setCloseDocuments] = useState([]);
  const closeFileInputRef = useRef(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [adminUploadLoading, setAdminUploadLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const convertUTCToIST = (utcDateTime) => {
    if (!utcDateTime) return "";
    const istTimeZone = 'Asia/Kolkata';
    const zonedTime = toZonedTime(utcDateTime, istTimeZone);
    return format(zonedTime, 'yyyy-MM-dd HH:mm:ss');
  };

  useEffect(() => {
    if (isAdminView && id) {
      fetch(`http://localhost:4000/api/permits/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.AdminDocuments && Array.isArray(data.AdminDocuments) && data.AdminDocuments.length > 0) {
            const flatDocs = Array.isArray(data.AdminDocuments[0]) ? data.AdminDocuments.flat() : data.AdminDocuments;
            setAdminDocuments(flatDocs);
          } else {
            setAdminDocuments([]);
          }
          const currentStatus = data.CurrentPermitStatus?.toLowerCase();
          const closed = ["close", "closed", "closer pending"].includes(currentStatus);
          setIsClosed(!closed);
          setFormData((prev) => ({
            ...prev,
            PermitTypeId: data.PermitTypeId || 3,
            permitDate: data.PermitDate ? data.PermitDate.split("T")[0] : "",
            permitNumber: data.PermitNumber || "",
            location: data.WorkLocation || "",
            validUpto: data.PermitValidUpTo ? data.PermitValidUpTo.slice(0, 16) : "",
            fireAlarmPoint: data.NearestFireAlarmPoint || "",
            totalWorkers: data.TotalEngagedWorkers || "",
            workDescription: data.WorkDescription || "",
            departmentName: data.DepartmentName || "",
            contractorOrg: data.Organization || "",
            supervisorName: data.SupervisorName || "",
            contactNumber: data.ContactNumber || "",
            additionalPpe: data.AdditionalPpe || "",
            otherHazards: data.OtherHazards || "",
            machineId: data.MachineId || "",
            lockTagNo: data.LockTagNo || "",
            reason: data.Reason || "",
            status: data.CurrentPermitStatus || "Active",
            referencePermitId: data.ReferencePermitId || data.ReferencePermitID || data.ReferencePermit || null,
            referencePermitNumber: data.ReferencePermitNumber || data.ReferencePermitNo || null,
            isolationRequired: data.IsolationRequired,
            workLocationId: data.WorkLocationId || null,
            alarmPointId: data.AlarmPointId || null,
            departmentId: data.DepartmentId || null,
            receiverChecks: {
              workAreaInspected: data.WorkAreaInspected ? "Required" : "not-required",
              surroundingAreaChecked: data.SurroundingAreaChecked ? "Required" : "not-required",
              sewersCovered: data.SewersCovered ? "Required" : "not-required",
              warningSigns: data.WarningSigns ? "Required" : "not-required",
              fireEquipmentAccess: data.FireEquipmentAccess ? "Required" : "not-required",
              ventilationLighting: data.VentilationLighting ? "Required" : "not-required",
              oilGasTrapped: data.OilGasTrapped ? "Required" : "not-required",
              weldingEquipment: data.WeldingEquipment ? "Required" : "not-required",
              earthingElcb: data.EarthingElcb ? "Required" : "not-required",
              heightPermit: data.HeightPermit ? "Required" : "not-required",
              equipmentDrained: data.EquipmentDrained ? "Required" : "not-required",
              lockoutTagout: data.LockoutTagout ? "Required" : "not-required",
            },
            residualHazards: {
              noiseDust: data.NoiseDust || false,
              slipTripFall: data.SlipTripFall || false,
              vehicleHazards: data.VehicleHazards || false,
              fallingObjects: data.FallingObjects || false,
              manualHandling: data.ManualHandling || false,
              lackOfOxygen: data.LackOfOxygen || false,
              biologicalHazards: data.BiologicalHazards || false,
              electricalHazards: data.ElectricalHazards || false,
              combustibleGases: data.CombustibleGases || false,
            },
            ppe: {
              safetyHelmet: data.SafetyHelmet || false,
              safetyJacket: data.SafetyJacket || false,
              safetyShoes: data.SafetyShoes || false,
              weldingGloves: data.WeldingGloves || false,
              weldingGlasses: data.WeldingGlasses || false,
              faceShield: data.FaceShield || false,
              weldingApron: data.WeldingApron || false,
              dustMask: data.DustMask || false,
              earPlugEarmuff: data.EarPlugEarmuff || false,
            },
            issuer: {
              name: data?.IssuerUser?.Name || "",
              designation: data.IssuerUser?.Designation || "",
              dateTime: data?.Issuer_DateTime ? convertUTCToIST(data.Issuer_DateTime) : "",
              updatedBy: data?.Issuer_UpdatedBy || ""
            },
            receiver: {
              name: data.ReceiverUser?.Name || "",
              designation: data.ReceiverUser?.Designation || "",
              dateTime: data.Receiver_DateTime ? convertUTCToIST(data.Receiver_DateTime) : "",
              updatedBy: data.ReceiverUser?.UpdatedBy || ""
            },
            energyIsolate: {
              name: data?.EnergyIsolateUser?.Name || "",
              designation: data?.EnergyIsolateUser?.Designation || "",
              dateTime: data?.EnergyIsolate_DateTime ? convertUTCToIST(data.EnergyIsolate_DateTime) : "",
              updatedBy: data?.EnergyIsolateUser?.UpdatedBy || ""
            },
            reviewer: {
              name: data?.ReviewerUser?.Name || "",
              designation: data?.ReviewerUser?.Designation || "",
              dateTime: data?.Reviewer_DateTime ? convertUTCToIST(data.Reviewer_DateTime) : "",
              updatedBy: data?.ReviewerUser?.UpdatedBy || ""
            },
            approver: {
              name: data?.ApproverUser?.Name || "",
              designation: data?.ApproverUser?.Designation || "",
              dateTime: data?.Approver_DateTime ? convertUTCToIST(data.Approver_DateTime) : "",
              updatedBy: data?.ApproverUser?.UpdatedBy || ""
            },
            files: (data.Files || []).map((file) => ({
              id: file.FileID || file.id || file.filename,
              name: file.FileName || file.originalName,
              size: file.FileSize || file.size,
              type: file.FileType || file.mimetype,
              url: file.FilePath ? `http://localhost:4000/api/permits/file/${file.FileID}` : undefined,
              preview: file.FileType && file.FileType.startsWith("image/") ? `http://localhost:4000/api/permits/file/${file.FileID}` : null,
            })),
          }));
           // Fetch close documents if status is closed or closer pending
          if (["closed", "closer pending"].includes(data.CurrentPermitStatus?.toLowerCase())) {
            fetchCloseDocuments();
          }
        })
        .catch((error) => {
          toast.error("Error fetching permit data: " + error.message);
        });
    }
  }, [isAdminView, id]);

  // Fetch Close Documents
  const fetchCloseDocuments = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/permits/${id}/close-document`);
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

  // Handle Close Permit
  const handleClosePermit = async () => {
    if (closingPermit) return;
    setClosingPermit(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const form = new FormData();
      form.append("PermitId", id);
      form.append("PermitTypeId", formData.PermitTypeId);
      form.append("UserId", user?.UserId || user?.id);

      selectedCloseFiles.forEach(file => {
        form.append("files", file);
      });

      const response = await fetch("http://localhost:4000/api/permits/close", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to close permit");
      }

      toast.success("Permit closed successfully!");
      setIsCloseModalOpen(false);
      navigate("/login/requestuser");
    } catch (err) {
      toast.error(err.message || "Failed to close permit");
    } finally {
      setClosingPermit(false);
    }
  };

  const handleCloseFileChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    setSelectedCloseFiles(prev => [...prev, ...files]);
  };

  const removeCloseFile = (index) => {
    setSelectedCloseFiles(prev => prev.filter((_, i) => i !== index));
  };



  // Close Modal Handlers
  const openCloseModal = () => setIsCloseModalOpen(true);
  const closeCloseModal = () => {
    setIsCloseModalOpen(false);
    setUploadChoice("no");
    setSelectedCloseFiles([]);
  };

  // Show Close Button only if status is "closer pending"
  const showCloseButton = formData.status?.toLowerCase() === "closer pending";

  const API_FIELD_MAPPING = {
    PermitTypeId: 'PermitTypeId',
    permitDate: 'PermitDate',
    permitNumber: 'PermitNumber',
    location: 'WorkLocation',
    validUpto: 'PermitValidUpTo',
    fireAlarmPoint: 'NearestFireAlarmPoint',
    totalWorkers: 'TotalEngagedWorkers',
    workDescription: 'WorkDescription',
    contractorOrg: 'Organization',
    supervisorName: 'SupervisorName',
    contactNumber: 'ContactNumber',
    additionalPpe: 'AdditionalPpe',
    otherHazards: 'OtherHazards',
    machineId: 'MachineId',
    lockTagNo: 'LockTagNo',
    reason: 'Reason',
    status: 'status',
    isolationRequired: 'IsolationRequired',
    workAreaInspected: 'WorkAreaInspected',
    surroundingAreaChecked: 'SurroundingAreaChecked',
    sewersCovered: 'SewersCovered',
    warningSigns: 'WarningSigns',
    fireEquipmentAccess: 'FireEquipmentAccess',
    ventilationLighting: 'VentilationLighting',
    oilGasTrapped: 'OilGasTrapped',
    weldingEquipment: 'WeldingEquipment',
    earthingElcb: 'EarthingElcb',
    heightPermit: 'HeightPermit',
    equipmentDrained: 'EquipmentDrained',
    lockoutTagout: 'LockoutTagout',
    noiseDust: 'NoiseDust',
    slipTripFall: 'SlipTripFall',
    vehicleHazards: 'VehicleHazards',
    fallingObjects: 'FallingObjects',
    manualHandling: 'ManualHandling',
    lackOfOxygen: 'LackOfOxygen',
    biologicalHazards: 'BiologicalHazards',
    electricalHazards: 'ElectricalHazards',
    combustibleGases: 'CombustibleGases',
    safetyHelmet: 'SafetyHelmet',
    safetyJacket: 'SafetyJacket',
    safetyShoes: 'SafetyShoes',
    weldingGloves: 'WeldingGloves',
    weldingGlasses: 'WeldingGlasses',
    faceShield: 'FaceShield',
    weldingApron: 'WeldingApron',
    dustMask: 'DustMask',
    earPlugEarmuff: 'EarPlugEarmuff',
    issuerName: 'Issuer_Name',
    issuerDesignation: 'Issuer_Designation',
    issuerDateTime: 'Issuer_DateTime',
    issuerUpdatedBy: 'Issuer_UpdatedBy',
    receiverName: 'Receiver_Name',
    receiverDesignation: 'Receiver_Designation',
    receiverDateTime: 'Receiver_DateTime',
    receiverUpdatedBy: 'Receiver_UpdatedBy',
    energyIsolateName: 'EnergyIsolate_Name',
    energyIsolateDesignation: 'EnergyIsolate_Designation',
    energyIsolateDateTime: 'EnergyIsolate_DateTime',
    energyIsolateUpdatedBy: 'EnergyIsolate_UpdatedBy',
    reviewerName: 'Reviewer_Name',
    reviewerDesignation: 'Reviewer_Designation',
    reviewerDateTime: 'Reviewer_DateTime',
    reviewerUpdatedBy: 'Reviewer_UpdatedBy',
    approverName: 'Approver_Name',
    approverDesignation: 'Approver_Designation',
    approverDateTime: 'Approver_DateTime',
    approverUpdatedBy: 'Approver_UpdatedBy',
    alarmPointId: 'AlarmPointId',
    workLocationId: 'WorkLocationId',
    departmentId: 'DepartmentId',

  };

  const convertToApiFormat = (formData) => {
    const apiData = {
      UserId: user?.UserId || user?.id,
      PermitTypeId: formData.PermitTypeId,
    };

    const basicFields = [
      'permitDate', 'permitNumber', 'location', 'validUpto',
      'fireAlarmPoint', 'totalWorkers', 'workDescription',
      'contractorOrg', 'supervisorName', 'contactNumber',
      'otherHazards', 'additionalPpe', 'machineId', 'lockTagNo',
      'status', 'isolationRequired'
    ];
    if (roleId === 3) {
      basicFields.push('reason');
    }

    basicFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== null && API_FIELD_MAPPING[field]) {
        if (field.includes('Date') || field === 'validUpto') {
          apiData[API_FIELD_MAPPING[field]] = new Date(formData[field]).toISOString();
        } else if (field === 'isolationRequired') {
          apiData[API_FIELD_MAPPING[field]] = formData[field] === true;
        } else {
          apiData[API_FIELD_MAPPING[field]] = formData[field];
        }
      }
    });

    Object.entries(formData.receiverChecks || {}).forEach(([key, value]) => {
      const apiKey = API_FIELD_MAPPING[key];
      if (apiKey) {
        apiData[apiKey] = value === "Required";
      }
    });

    Object.entries(formData.residualHazards || {}).forEach(([key, value]) => {
      const apiKey = API_FIELD_MAPPING[key];
      if (apiKey) {
        apiData[apiKey] = value === true;
      }
    });

    Object.entries(formData.ppe || {}).forEach(([key, value]) => {
      const apiKey = API_FIELD_MAPPING[key];
      if (apiKey) {
        apiData[apiKey] = value === true;
      }
    });

    const workflowSections = ['issuer', 'receiver', 'energyIsolate', 'reviewer', 'approver'];
    workflowSections.forEach(section => {
      const sectionData = formData[section] || {};
      Object.entries(sectionData).forEach(([key, value]) => {
        const fieldKey = `${section}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const apiKey = API_FIELD_MAPPING[fieldKey];
        if (apiKey) {
          if (key.includes('dateTime') && value) {
            apiData[apiKey] = new Date(value).toISOString();
          } else {
            apiData[apiKey] = value || null;
          }
        }
      });
    });
    apiData.departmentId = formData.DepartmentId || null;
    apiData.workLocationId = formData.WorkLocationId || null;
    apiData.alarmPointId = formData.AlarmPointId || null;
    apiData.Updated_by = formData.updatedBy || 'System';

    Object.keys(apiData).forEach(key => {
      if (apiData[key] === null || apiData[key] === undefined || apiData[key] === '') {
        delete apiData[key];
      }
    });

    return apiData;
  };

  const approval = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/permits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PermitId: Number(id), PermitTypeId: formData.PermitTypeId, UserId: user?.UserId })
      });
      if (!response.ok) throw new Error('Failed to approve permit');
      toast.success('Permit approved');
      navigate("/login/requestuser");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const closePermit = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/permits/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PermitId: Number(id), PermitTypeId: formData.PermitTypeId })
      });
      if (!response.ok) throw new Error('Failed to reject permit');
      toast.success('Permit rejected');
      navigate("/login/requestuser");
    } catch (err) {
      toast.error(err.message);
    }
  };

    const handleRejectClick = async () => {
    if (!formData.reason) {
      toast.error("Please provide a reason for rejecting the permit");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/permits/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: formData.reason, PermitTypeId: formData.PermitTypeId })
      });

      if (response.ok) {
        toast.success("Permit has been rejected.");
        navigate("/login/requestuser");
      } else {
        const errorText = await response.text();
        toast.error("Failed to put permit on hold: " + errorText);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleHoldClick = async () => {
    if (!formData.reason) {
      toast.error("Please provide a reason for putting the permit on hold");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/permits/${id}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: formData.reason, PermitTypeId: formData.PermitTypeId })
      });

      if (response.ok) {
        toast.success("Permit has been put on hold and notifications have been sent");
        navigate("/login/requestuser");
      } else {
        const errorText = await response.text();
        toast.error("Failed to put permit on hold: " + errorText);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleAdminFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setUploadErrors([`File "${file.name}" exceeds 4MB limit`]);
      return;
    }
    setUploadErrors([]);
    setAdminUploadLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const form = new FormData();
      form.append('PermitId', id);
      form.append('UserId', user?.UserId || user?.id || '');
      form.append('file', file);
      const response = await fetch('http://localhost:4000/api/permits/admin-document', {
        method: 'POST',
        body: form,
      });
      if (!response.ok) {
        throw new Error('Failed to upload admin document');
      }
      const data = await response.json();
      setAdminDocuments((prev) => [...prev, data]);
      toast.success('Admin document uploaded successfully');
    } catch (err) {
      setUploadErrors([err.message]);
    } finally {
      setAdminUploadLoading(false);
      e.target.value = "";
    }
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
        [field]: value,
      },
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

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      const apiData = convertToApiFormat(formData);

      Object.entries(apiData).forEach(([key, value]) => {
        form.append(key, value);
      });

      formData.files.forEach((file, index) => {
        if (file.file) {
          form.append('files', file.file);
        }
      });

      const response = await fetch(`http://localhost:4000/api/permits/${id}`, {
        method: "PUT",
        body: form,
      });

      if (response.ok) {
        toast.success("Permit updated successfully!");
        navigate("/login/requestuser");
      } else {
        const errorText = await response.text();
        toast.error("Failed to update: " + errorText);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const receiverCheckItems = [
    {
      id: "workAreaInspected",
      text: "Work area/Equipment inspected (Check for any additional required activities such as material shifting, equipment/area cleaning, ensuring the equipment is safe for use, or any other necessary assistance related to that area/equipment)",
    },
    {
      id: "surroundingAreaChecked",
      text: "Surrounding area checked, to ensure no additional hazards are present",
    },
    {
      id: "sewersCovered",
      text: "Sewers, manholes, etc and hot surface nearby covered",
    },
    {
      id: "warningSigns",
      text: "Warning sign and barriers required",
    },
    {
      id: "fireEquipmentAccess",
      text: "Free Access for approach of fire equipment’s have been maintained",
    },
    {
      id: "ventilationLighting",
      text: "Proper ventilation, lighting and exit/escape available",
    },
    {
      id: "oilGasTrapped",
      text: "Checked for oil and gas trapped behind the lining in equipment",
    },
    {
      id: "weldingEquipment",
      text: "Welding equipment is in good working condition (No wire damage, open wire)",
    },
    {
      id: "earthingElcb",
      text: "Check for earthing/ELCB of any temporary electrical connections being used for welding",
    },
    {
      id: "heightPermit",
      text: "Permit taken for work at height",
    },
    {
      id: "equipmentDrained",
      text: "Equipment properly drained, depressurized, and de-energized",
    },
    {
      id: "lockoutTagout",
      text: "Lock out/tag out is required to isolate the equipment",
    },
  ];

  const residualHazardItems = [
    { id: "noiseDust", text: "Noise or Dust Exposure" },
    { id: "slipTripFall", text: "Slip/Trip/Fall" },
    { id: "vehicleHazards", text: "Vehicle Hazards" },
    { id: "fallingObjects", text: "Falling Objects" },
    { id: "manualHandling", text: "Manual Handling Objects" },
    { id: "lackOfOxygen", text: "Lack of Oxygen" },
    { id: "biologicalHazards", text: "Biological Hazards" },
    { id: "electricalHazards", text: "General Electrical Hazards" },
    { id: "combustibleGases", text: "Combustible Gases" },
  ];

  const ppeItems = [
    { id: "safetyHelmet", text: "Safety Helmet" },
    { id: "safetyJacket", text: "Safety Jacket" },
    { id: "safetyShoes", text: "Safety Shoes" },
    { id: "weldingGloves", text: "Welding Gloves" },
    { id: "weldingGlasses", text: "Welding Glasses" },
    { id: "faceShield", text: "Face Shield" },
    { id: "weldingApron", text: "Welding Apron" },
    { id: "dustMask", text: "Dust Mask" },
    { id: "earPlugEarmuff", text: "Ear Plug/Earmuff" },
  ];

  const dosAndDonts = [
    {
      do: "Ensure the availability of valid work permit before start of work.",
      dont: "Never stand or work under suspended loads.",
    },
    {
      do: "Ensure that work permit conditions are fully complied at site.",
      dont: "Never enter work area without PPE’s.",
    },
    {
      do: "Area shall be free from all flammables, combustibles and drains etc.",
      dont: "Do not use short cuts on work.",
    },
    {
      do: "In case of gas welding/cutting, cylinders should be kept in upright position, and these should be easily identifiable by its colour.",
      dont: "Do not wear loose/synthetic clothes while on work.",
    },
    {
      do: "Hose connections of gas cylinders should be checked before starting of hot job. It must be free from all cuts and kinks and distinct in colour.",
      dont: "Do not use lamp of more than 24 V while working in confined space.",
    },
    {
      do: "Receiver must ensure use of proper PPEs during hot work.",
      dont: "Do not use electrode holders as cable connectors for extension of welding cable.",
    },
    {
      do: "In case of welding/cutting, etc it should be ensured that spark is arrested at site only, especially while carrying out hot work at height.",
      dont: "",
    },
    {
      do: "Receiver shall ensure use of flash back arrestor in gas cylinders, use welding lighters only to light the welding torch.",
      dont: "Never keep acetylene cylinders in horizontal condition, even if they are empty.",
    },
    {
      do: "While carrying out hot work inside confined space, proper ventilation and illumination should be ensured before start of job.",
      dont: "Never use grinder without wheel guard on abrasive wheels.",
    },
    {
      do: "Electric cable shall be free from joints. Portable electrical equipment should have no loose connections and connect with ELCB.",
      dont: "",
    },
    {
      do: "Receiver shall ensure that the lifting machines tools & tackles are properly tested and SWL and date of testing is displayed on equip.",
      dont: "",
    },
    {
      do: "Barricading of the area below lifting machine (crane) should be ensured before carrying out the job.",
      dont: "",
    },
    {
      do: "Receiver/worker should know the nearest fire alarm point, fire order, emergency contact no., escape route and location assembly points.",
      dont: "",
    },
    {
      do: "Executor shall ensure the quality of hand tools and their health.",
      dont: "",
    },
    {
      do: "Ensure valve cap on cylinders during storage and transportation, if shrouds are not provided.",
      dont: "",
    },
    {
      do: "After the completion of the job, copies of work permit should be returned to the ISSUER.",
      dont: "",
    },
  ];

  // Define editable sections based on roleId
  const canEditSpecOfWork = roleId === 1 && isClosed;
  const canEditReceiverChecks = roleId === 2 && isClosed;
  const canEditIsolationRequired = roleId === 5 && isClosed;
  const canEditResidualHazards = roleId === 3 && isClosed;
  const canEditPPE = roleId === 3 && isClosed;
  const canEditWorkAuthorized = false; // All roles can edit
  const canEditDosAndDonts = true; // All roles can edit (assuming this section is informational)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-2">
              <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">HOT WORK PERMIT</h1>
            <p className="text-gray-600">As per IS 17893:2023</p>
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
                  placeholder="HTPL/HTWP/"
                  value={formData.permitNumber}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("permitNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Permit to Work
                </label>
                <input
                  type="date"
                  value={formData.permitDate}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("permitDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>
                            {formData.referencePermitNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Permit</label>
                  <input
                    type="text"
                    value={formData.referencePermitNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location of Work
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
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
                  onChange={(e) => canEditSpecOfWork && handleInputChange("validUpto", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
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
                  onChange={(e) => canEditSpecOfWork && handleInputChange("fireAlarmPoint", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
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
                  onChange={(e) => canEditSpecOfWork && handleInputChange("totalWorkers", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Work
                </label>
                <textarea
                  rows={4}
                  value={formData.workDescription}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("workDescription", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
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
                  onChange={(e) => canEditSpecOfWork && handleInputChange("contractorOrg", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("supervisorName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Department *
  </label>

  <input
    type="text"
    value={formData.departmentName || ''}
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
    readOnly
  />
</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => canEditSpecOfWork && handleInputChange("contactNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={!canEditSpecOfWork}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              Uploaded Files
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
                        {canEditSpecOfWork && (
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">2. Compliance Check</h2>
          <p className="text-gray-600 mb-6">Check the following items before issuing the permit</p>
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
                      value="Required"
                      checked={formData.receiverChecks[item.id] === "Required"}
                      onChange={(e) => canEditReceiverChecks && handleCheckboxChange("receiverChecks", item.id, e.target.value)}
                      className="mr-2 text-green-600"
                      disabled={!canEditReceiverChecks}
                    />
                    <span className="text-green-600 font-medium">Required</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="not-required"
                      checked={formData.receiverChecks[item.id] === "not-required"}
                      onChange={(e) => canEditReceiverChecks && handleCheckboxChange("receiverChecks", item.id, e.target.value)}
                      className="mr-2 text-gray-600"
                      disabled={!canEditReceiverChecks}
                    />
                    <span className="text-gray-600 font-medium">Not Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          {formData.isolationRequired && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 text-xl md:text-2xl mb-3">Isolation Required</h3>
              <p className="text-gray-600 mb-4">
                Machine/equipment ID has been isolated from all sources of stored energy by switching off the MCB, placing the lever down, closing the valve etc.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine/Equipment ID</label>
                  <input
                    type="text"
                    value={formData.machineId}
                    onChange={(e) => canEditIsolationRequired && handleInputChange("machineId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly={!canEditIsolationRequired}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lock & Tag No.</label>
                  <input
                    type="text"
                    value={formData.lockTagNo}
                    onChange={(e) => canEditIsolationRequired && handleInputChange("lockTagNo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly={!canEditIsolationRequired}
                  />
                </div>
              </div>
              <p className="text-gray-600 mt-4">
                Isolation details have been recorded in the logbook. One of the LOTO Key should be available with work executer.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">3. Expected Residual Hazards</h2>
          <p className="text-gray-600 mb-6">The activity has the following expected residual hazards</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {residualHazardItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.residualHazards[item.id] || false}
                  onChange={(e) => canEditResidualHazards && handleCheckboxChange("residualHazards", item.id, e.target.checked)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                  disabled={!canEditResidualHazards}
                />
                <span className="text-gray-800">{item.text}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Hazards (If any)</label>
            <textarea
              rows={3}
              value={formData.otherHazards}
              onChange={(e) => canEditResidualHazards && handleInputChange("otherHazards", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specify any additional hazards..."
              readOnly={!canEditResidualHazards}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Required PPE to be Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ppeItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.ppe[item.id] || false}
                  onChange={(e) => canEditPPE && handleCheckboxChange("ppe", item.id, e.target.checked)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                  disabled={!canEditPPE}
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
              onChange={(e) => canEditPPE && handleInputChange("additionalPpe", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specify any additional PPE requirements..."
              readOnly={!canEditPPE}
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
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Signature</th>
                </tr>
              </thead>
              <tbody>
                {['issuer', 'receiver', 'energyIsolate', 'reviewer', 'approver'].map((section) => (
                  <tr key={section} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                      {section === 'energyIsolate' ? (
                        <>
                          Energy Isolate By:<br />
                          <span className="text-sm text-gray-500">(Isolation required)</span>
                        </>
                      ) : section === 'reviewer' ? 'Reviewer (QHSE)' : section.charAt(0).toUpperCase() + section.slice(1)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={formData[section].name}
                        onChange={(e) => canEditWorkAuthorized && handleWorkflowChange(section, "name", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name"
                        readOnly={!canEditWorkAuthorized}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={formData[section].designation}
                        onChange={(e) => canEditWorkAuthorized && handleWorkflowChange(section, "designation", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter designation"
                        readOnly={!canEditWorkAuthorized}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="datetime-local"
                        value={formData[section].dateTime}
                        onChange={(e) => canEditWorkAuthorized && handleWorkflowChange(section, "dateTime", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!canEditWorkAuthorized}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value=""
                        onChange={(e) => canEditWorkAuthorized && handleWorkflowChange(section, "updatedBy", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                        readOnly={!canEditWorkAuthorized}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">6. Do's & Don'ts</h2>
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
                {dosAndDonts.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-green-800">{item.do}</td>
                    <td className="border border-gray-300 px-4 py-3 text-red-800">{item.dont || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Close Permit Document Section */}
        {(formData.status?.toLowerCase() === "closed" || formData.status?.toLowerCase() === "closer pending") && closeDocuments.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-8 mb-12 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-red-600" />
                      Close Permit Documents ({closeDocuments.length})
                    </h3>
        
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {closeDocuments.map((doc) => (
                        <div
                          key={doc.attachmentId}
                          className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                        >
                          {/* Image Preview */}
                          <div className="aspect-video bg-gray-200 relative overflow-hidden">
                            <img
                              src={doc.fileUrl}
                              alt={`Closed work by ${doc.uploadedBy}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
        
                          {/* Details */}
                          <div className="p-4 space-y-3">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {doc.fileName}
                            </p>
        
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Uploaded by:</span>
                                <span className="font-semibold text-blue-700">{typeof doc.uploadedBy === 'object' ? (doc.uploadedBy.userName || doc.uploadedBy.userId || '') : doc.uploadedBy}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{doc.createdOn}</span>
                              </div>
                            </div>
        
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
                      ))}
                    </div>
                  </div>
                )}
        {(roleId === 2 || roleId === 5) && (
          <>
            <button
              onClick={() => window.print()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
            <div className="flex justify-center space-x-4 mt-4">
              {isClosed && (
                <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit for Approval
              </button>
              )}
              
              {showCloseButton && (
                <button
                  onClick={openCloseModal}
                  disabled={closingPermit}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {closingPermit ? "Closing..." : "Close Permit"}
                </button>
              )}
            </div>
          </>
        )}

        {roleId === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Admin Documents
            </h4>
            <div className="space-y-4">
              {isClosed && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload files or drag and drop</p>
                <p className="text-sm text-gray-500 mb-4">Maximum file size: 4MB per file • Supported formats: Images, PDF, DOC, DOCX, TXT</p>
                <input
                  type="file"
                  name="admin-doc"
                  id="admin-file-upload"
                  onChange={handleAdminFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  disabled={adminUploadLoading}
                />
                <label
                  htmlFor="admin-file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
                {adminUploadLoading && <div className="text-blue-600 text-xs mt-2">Uploading...</div>}
              </div>
              )}
              {adminDocuments.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({adminDocuments.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminDocuments.map((doc, idx) => {
                      const fileName = doc.FileName || doc.originalName || 'File';
                      const fileUrl = `http://localhost:4000/api/permits/${id}/admin-document`;
                      return (
                        <div key={fileName + idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                            <a
                              href={fileUrl}
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
                <div className="text-gray-500 text-xs mt-2">No admin documents uploaded yet.</div>
              )}
              <div className="mt-6">
                <label className="block text-md font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isClosed ? "Enter reason for hold/reject" : "No reason provided"}
                  readOnly={!isClosed}
                />
              </div>
              <div style={{ display: "flex" }}>
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print
                </button>
     
                  <button
                  onClick={handleHoldClick}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                  style={{ marginLeft: "10px" }}
                >
                  Hold
                </button>
           
                
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                {isClosed && (
                  <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Submit for Approval
                </button>
                )}
                
                {/* Close Permit Button - Only for "closer pending" */}
                {showCloseButton && (
                  <button
                    onClick={openCloseModal}
                    disabled={closingPermit}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {closingPermit ? "Closing..." : "Close Permit"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {roleId === 4 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Admin Documents
            </h4>
            <div className="space-y-4">
              {adminDocuments.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({adminDocuments.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminDocuments.map((doc, idx) => {
                      const fileName = doc.FileName || doc.originalName || 'File';
                      const fileUrl = `http://localhost:4000/api/permits/${id}/admin-document`;
                      return (
                        <div key={fileName + idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                            <a
                              href={fileUrl}
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
                <div className="text-gray-500 text-xs mt-2">No admin documents uploaded yet.</div>
              )}
              <div className="mt-6">
                <label className="block text-md font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isClosed ? "Enter reason for hold/reject" : "No reason provided"}
                  readOnly={!isClosed}
                />
              </div>
            </div>
     
              <button
              onClick={handleHoldClick}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Hold
            </button>
            
            {isClosed && (
              <button
              onClick={approval}
              className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            )}
           
              <button
              onClick={handleRejectClick}
              className="mt-4 ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
            
            <div className="flex justify-center space-x-4 mt-4">
            {/* Close Permit Button - Only for "closer pending" */}
            {showCloseButton && (
              <button
                onClick={openCloseModal}
                disabled={closingPermit}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium"
              >
                <XCircle className="w-5 h-5 mr-2" />
                {closingPermit ? "Closing..." : "Close Permit"}
              </button>
            )}
          </div>
          </div>
        )}
        {/* Close Permit Modal */}
        <Modal
          isOpen={isCloseModalOpen}
          onRequestClose={closeCloseModal}
          className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl p-6 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Close Permit #{formData.permitNumber}</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to close this permit? This action cannot be undone.</p>

          <div className="mb-6">
            <p className="font-medium text-gray-700 mb-3">Do you want to upload image(s) of completed work?</p>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="upload" value="yes" checked={uploadChoice === "yes"} onChange={() => setUploadChoice("yes")} className="mr-2" />
                <span>Yes</span>
              </label>
                           <label className="flex items-center cursor-pointer">
                <input type="radio" name="upload" value="no" checked={uploadChoice === "no"} onChange={() => setUploadChoice("no")} className="mr-2" />
                <span>No</span>
              </label>
            </div>
          </div>

          {uploadChoice === "yes" && (
            <div className="mb-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
                onClick={() => closeFileInputRef.current?.click()}
              >
                <input
                  ref={closeFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCloseFileChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF supported</p>
              </div>

              {selectedCloseFiles.length > 0 && (
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                  {selectedCloseFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeCloseFile(i)} className="text-red-600 hover:text-red-800">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={closeCloseModal} className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
            <button
              onClick={handleClosePermit}
              disabled={closingPermit}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
            >
              {closingPermit ? "Closing..." : "Confirm Close"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default HotWorkPermit4;