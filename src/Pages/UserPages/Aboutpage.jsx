import React, { useState } from 'react';
import { Filter, CheckCircle, XCircle, FileText, Clock, MapPin, Users } from 'lucide-react';

// Dummy data for height work permit requests
const dummyRequests = [
  {
    id: 1,
    permitNumber: 'HTPL/HWP/001',
    location: 'Building A, Floor 5',
    permitDate: '2025-07-01',
    validUpto: '2025-07-02T18:00',
    totalWorkers: 5,
    workDescription: 'Roof maintenance and HVAC installation',
    status: 'Pending',
  },
  {
    id: 2,
    permitNumber: 'HTPL/HWP/002',
    location: 'Warehouse B, Section C',
    permitDate: '2025-07-03',
    validUpto: '2025-07-04T17:00',
    totalWorkers: 8,
    workDescription: 'Scaffold erection for painting',
    status: 'Approved',
  },
  {
    id: 3,
    permitNumber: 'HTPL/HWP/003',
    location: 'Tower C, Exterior',
    permitDate: '2025-07-05',
    validUpto: '2025-07-06T20:00',
    totalWorkers: 3,
    workDescription: 'Window cleaning at height',
    status: 'Rejected',
  },
  {
    id: 4,
    permitNumber: 'HTPL/HWP/004',
    location: 'Site D, Roof',
    permitDate: '2025-07-07',
    validUpto: '2025-07-08T16:00',
    totalWorkers: 6,
    workDescription: 'Antenna installation',
    status: 'Pending',
  },
];

const MyRequests = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [requests, setRequests] = useState(dummyRequests);

  // Filter requests based on status
  const filteredRequests = statusFilter === 'All'
    ? requests
    : requests.filter(request => request.status === statusFilter);

  // Handle status change (Approve/Reject)
  const handleStatusChange = (id, newStatus) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Requests</h1>
              <p className="text-gray-600">Manage and review height work permit requests</p>
            </div>
            <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              <FileText className="w-5 h-5 mr-2" />
              <span className="font-medium">AS PER IS 17893:2023</span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Requests
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Permit Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Permit Number</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Location</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Permit Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Valid Up To</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Workers</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Status</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="border border-gray-300 px-4 py-3 text-center text-gray-600">
                      No requests found for the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          {request.permitNumber}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          {request.location}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{request.permitDate}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          {new Date(request.validUpto).toLocaleString()}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          {request.totalWorkers}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{request.workDescription}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            request.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {request.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(request.id, 'Approved')}
                              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'Rejected')}
                              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;