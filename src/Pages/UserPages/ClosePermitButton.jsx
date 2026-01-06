// src/components/permit/ClosePermitButton.jsx
import React, { useState, useRef } from "react";
import Modal from "react-modal";
import { Upload, X, XCircle } from "lucide-react";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const ClosePermitButton = ({ permitId, permitNumber, permitTypeId, currentStatus, onPermitClosed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadChoice, setUploadChoice] = useState("no");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [closingPermit, setClosingPermit] = useState(false);
  const fileInputRef = useRef(null);

  const handleClosePermit = async () => {
    try {
      setClosingPermit(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.UserId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("PermitTypeId", permitTypeId);
      formData.append("PermitId", permitId);
      formData.append("UserId", user.UserId);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("https://hindterminal56.onrender.com/api/permits/close", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to close permit");
      }

      toast.success("Permit closed successfully!");
      setIsModalOpen(false);
      onPermitClosed?.(); // Trigger parent refresh
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

  // Only show button if status is "approved"
  if (currentStatus?.toLowerCase() !== "approved") return null;

  return (
    <>
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Close Permit"
        className="max-w-lg mx-auto bg-white rounded-xl shadow-xl p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Close Permit</h2>
        <p className="text-gray-600 mb-5">
          Do you really want to close Permit #{permitNumber || permitId}? This action cannot be undone.
        </p>

        <div className="mb-5">
          <p className="font-medium text-gray-700 mb-3">Upload image(s) of completed work?</p>
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
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition"
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
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF supported</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(index)} className="text-red-600 hover:text-red-800">
                      <X className="w-5 h-5" />
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
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleClosePermit}
            disabled={closingPermit}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition flex items-center gap-2"
          >
            {closingPermit && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Confirm Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ClosePermitButton;