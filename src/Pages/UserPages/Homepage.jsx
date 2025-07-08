import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

const HeightWorkPermit = () => {
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
  });

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
    "Safety Helmet",
    "Safety Jacket",
    "Safety Shoes",
    "Gloves",
    "Safety Goggles",
    "Face Shield",
    "Dust Mask",
    "Ear plug/Earmuff",
    "Anti Slip footwear",
    "Safety Net",
    "Anchor Point/Lifelines",
    "Self retracting Lifeline (SRL)",
    "Full body harness with lanyard or shock absorbers",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Height Work Permit
              </h1>
              <p className="text-gray-600">
                Authorization for safe access, platforms, or working arrangement
                at heights of 1.8 meters and above
              </p>
            </div>
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
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Permit to Work
                </label>
                <input
                  type="date"
                  value={formData.permitDate}
                  onChange={(e) =>
                    handleInputChange("permitDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Number
                </label>
                <input
                  type="text"
                  placeholder="HTPL/HWP/"
                  value={formData.permitNumber}
                  onChange={(e) =>
                    handleInputChange("permitNumber", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("validUpto", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Total Number of Engaged Workers
                </label>
                <input
                  type="number"
                  value={formData.totalWorkers}
                  onChange={(e) =>
                    handleInputChange("totalWorkers", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("workDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Organization
                </label>
                <input
                  type="text"
                  value={formData.contractorOrg}
                  onChange={(e) =>
                    handleInputChange("contractorOrg", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) =>
                    handleInputChange("supervisorName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Receiver Compliance Check */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            2. RECEIVER Compliance Check
          </h2>
          <p className="text-gray-600 mb-6">
            Check the following items for compliance before requiring the
            permission
          </p>

          <div className="space-y-4">
            {receiverCheckItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-blue-600 mt-1">
                  {index + 1}.
                </span>
                <p className="flex-1 text-gray-800">{item.text}</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="done"
                      checked={formData.receiverChecks[item.id] === "done"}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "receiverChecks",
                          item.id,
                          e.target.value
                        )
                      }
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-600 font-medium">Done</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="not-required"
                      checked={
                        formData.receiverChecks[item.id] === "not-required"
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "receiverChecks",
                          item.id,
                          e.target.value
                        )
                      }
                      className="mr-2 text-gray-600"
                    />
                    <span className="text-gray-600 font-medium">
                      Not Required
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Issuer Risk Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            3. ISSUER Risk Assessment
          </h2>
          <p className="text-gray-600 mb-6">
            The following items shall be checked for Risk Assessment by ISSUER
            and complied by the RECEIVER
          </p>

          <div className="space-y-4">
            {issuerCheckItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-blue-600 mt-1">
                  {index + 1}.
                </span>
                <p className="flex-1 text-gray-800">{item.text}</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="done"
                      checked={formData.issuerChecks[item.id] === "done"}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "issuerChecks",
                          item.id,
                          e.target.value
                        )
                      }
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-600 font-medium">Done</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={item.id}
                      value="not-required"
                      checked={
                        formData.issuerChecks[item.id] === "not-required"
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "issuerChecks",
                          item.id,
                          e.target.value
                        )
                      }
                      className="mr-2 text-gray-600"
                    />
                    <span className="text-gray-600 font-medium">
                      Not Required
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: PPE Requirements */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            4. Required PPE to be Used
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ppeItems.map((item) => (
              <label
                key={item}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.ppe[item] || false}
                  onChange={(e) =>
                    handleCheckboxChange("ppe", item, e.target.checked)
                  }
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800">{item}</span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional PPE (If any)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specify any additional PPE requirements..."
            />
          </div>
        </div>

        {/* Section 5: Work Authorised by */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            5. Work Authorised by
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Authority
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Designation
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Date & Time
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Issuer
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="w-full h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                      Digital Signature
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Receiver
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="w-full h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                      Digital Signature
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Energy Isolate By:
                    <br />
                    <span className="text-sm text-gray-500">
                      (if isolation required)
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="w-full h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                      Digital Signature
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Reviewer (QHSE)
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="w-full h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                      Digital Signature
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                    Approver
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter designation"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="w-full h-12 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                      Digital Signature
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Do's & Don't */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            6. Do's & Don't
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 w-16">
                    S.N.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-green-700 w-1/2">
                    Do's
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-700 w-1/2">
                    Don't
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    1
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Ensure the availability of valid work permit before start of
                    work.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Never stand or work under suspended loads.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    2
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Ensure that work permit conditions are fully complied at
                    site.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Do not use short cuts on work.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    3
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Equipment should be properly isolated from all sources of
                    energy before start of work.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Do not wear loose/ synthetic clothes while at work.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    4
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Ensure that walkways and passages are free from all
                    slip/trip and fall hazard.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Never perform general work without a safety jacket or safety
                    shoes.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    5
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    All draining of oil should be in closed system as the
                    draining of oil on floor will make the work area and area
                    around the work unsafe.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Do not run a machine without putting back the guard on its
                    exposed moving part.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    6
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Ensure proper illumination of workplace while working in
                    dark.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    All works at height shall be discontinued during rain/high
                    wind/floods.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    7
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Use of approved type full body safety harness along with
                    lifeline is must for working at height of 2.0 m and above,
                    Use of safety helmet and shoe is mandatory for all work
                    sites.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800">
                    Do not continue the job in case scaffold is sagging unduly,
                    report to ISSUER or RECEIVER.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    8
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Receiver should ensure that the lifting machine (crane),
                    tools and tackles are properly tested and SWL and date of
                    testing is displayed on equipment.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    9
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Barricading of the area below lifting machine (crane), chain
                    pulley blocks etc, should be ensured before starting the
                    job.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    10
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Remove all scraps, unused material from site on completion
                    of work.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    11
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    Receiver/worker should know the nearest fire alarm point,
                    fire order, emergency contact no., escape route and location
                    assembly points.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    12
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-green-800">
                    After the completion of the job, copies of work permit
                    should be returned to the ISSUER.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-red-800"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Save Draft
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Submit for Approval
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeightWorkPermit;
