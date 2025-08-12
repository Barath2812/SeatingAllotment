import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Mail, 
  Search,
  Building,
  Users,
  Layout
} from 'lucide-react';
import toast from 'react-hot-toast';

const SeatingView = () => {
  const { user } = useAuth();
  const [seatingPlan, setSeatingPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHall, setSelectedHall] = useState('all');

  useEffect(() => {
    fetchSeatingPlan();
  }, []);

  const fetchSeatingPlan = async () => {
    try {
      const response = await adminAPI.getSeatingPlan();
      setSeatingPlan(response.data.seatingPlan);
    } catch (error) {
      console.error('Error fetching seating plan:', error);
      toast.error('Failed to load seating plan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await adminAPI.exportToExcel();
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'seating-plan.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await adminAPI.exportToPDF();
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'seating-plan.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      toast.error('Failed to export to PDF');
    }
  };

  const handleSendNotifications = async () => {
    try {
      const response = await adminAPI.sendNotifications();
      toast.success(`${response.data.message} - ${response.data.sentCount} emails sent`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notifications');
    }
  };

  const filteredSeatingPlan = () => {
    let filtered = { ...seatingPlan };
    
    // Filter by hall
    if (selectedHall !== 'all') {
      filtered = { [selectedHall]: seatingPlan[selectedHall] };
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      Object.keys(filtered).forEach(hallName => {
        filtered[hallName] = filtered[hallName].filter(seat => 
          seat.seat1.rollNumber.toLowerCase().includes(searchLower) ||
          seat.seat1.department.toLowerCase().includes(searchLower) ||
          seat.seat2.rollNumber.toLowerCase().includes(searchLower) ||
          seat.seat2.department.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const getTotalBenches = () => {
    return Object.values(seatingPlan).reduce((total, hallSeats) => total + hallSeats.length, 0);
  };

  const getTotalStudents = () => {
    return getTotalBenches() * 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredData = filteredSeatingPlan();
  const halls = Object.keys(seatingPlan);

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
                <h1 className="text-2xl font-bold text-gray-900">Seating Plan</h1>
                <p className="text-gray-600">View and manage seating arrangements</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Halls</p>
                  <p className="text-2xl font-semibold text-gray-900">{halls.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <Layout className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Benches</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTotalBenches()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTotalStudents()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Actions</p>
                  <p className="text-lg font-semibold text-gray-900">Export</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by roll number or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                {/* Hall Filter */}
                <select
                  value={selectedHall}
                  onChange={(e) => setSelectedHall(e.target.value)}
                  className="input-field max-w-xs"
                >
                  <option value="all">All Halls</option>
                  {halls.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="btn-secondary flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="btn-secondary flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={handleSendNotifications}
                  className="btn-primary flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seating Tables */}
        {Object.keys(filteredData).length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No seating data found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedHall !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No seating plan has been generated yet. Please generate seating first.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredData).map(([hallName, seats]) => (
              <div key={hallName} className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {hallName} - {seats.length} Benches
                  </h2>
                </div>
                <div className="card-body">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Row
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bench
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seat 1
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seat 2
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {seats.map((seat, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {seat.row}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {seat.bench}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {seat.seat1.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {seat.seat1.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {seat.seat2.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {seat.seat2.department}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SeatingView;
