import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Upload, Download, ArrowLeft, FileText, Building, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadHalls = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      const response = await adminAPI.uploadHalls(selectedFile);
      setUploadResult(response.data);
      toast.success(response.data.message);
      setSelectedFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload halls');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample Excel data
    const sampleData = [
      {
        'Hall Name': 'Hall A',
        'Capacity': 120
      },
      {
        'Hall Name': 'Hall B',
        'Capacity': 80
      },
      {
        'Hall Name': 'Hall C',
        'Capacity': 100
      }
    ];

    // Convert to CSV format
    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'halls-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="text-primary-600 hover:text-primary-700 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Halls</h1>
                <p className="text-gray-600">Upload hall information from Excel file</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Upload Hall Data</h2>
              </div>
              <div className="card-body">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="file-input" className="btn-primary cursor-pointer">
                        Choose Excel File
                      </label>
                      <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      or drag and drop your Excel file here
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports .xlsx and .xls files up to 5MB
                    </p>
                  </div>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                        <p className="text-xs text-blue-700">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          document.getElementById('file-input').value = '';
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {selectedFile && (
                  <div className="mt-6">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full btn-primary flex justify-center items-center"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Halls
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Upload Result */}
                {uploadResult && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {uploadResult.message}
                        </p>
                        <p className="text-xs text-green-700">
                          {uploadResult.count} halls uploaded successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions & Template */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Hall Name:</strong> Name of the examination hall</li>
                      <li>• <strong>Capacity:</strong> Number of seats in the hall</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• First row should contain column headers</li>
                      <li>• Hall names must be unique</li>
                      <li>• Capacity must be a positive number</li>
                      <li>• Each bench accommodates 2 students</li>
                      <li>• Existing halls will be replaced</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Template */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Template</h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600 mb-4">
                  Download a sample template to see the required format
                </p>
                <button
                  onClick={downloadTemplate}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>
            </div>

            {/* Sample Data */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Sample Data</h3>
              </div>
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Hall Name</th>
                        <th className="text-left py-2">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Hall A</td>
                        <td className="py-2">120</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Hall B</td>
                        <td className="py-2">80</td>
                      </tr>
                      <tr>
                        <td className="py-2">Hall C</td>
                        <td className="py-2">100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadHalls;
