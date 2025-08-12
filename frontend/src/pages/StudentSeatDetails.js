import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { 
  GraduationCap, 
  Building, 
  Layout, 
  User, 
  Download, 
  LogOut,
  MapPin,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentSeatDetails = () => {
  const { user, logout } = useAuth();
  const [seatDetails, setSeatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchSeatDetails();
  }, []);

  const fetchSeatDetails = async () => {
    try {
      const response = await studentAPI.getSeatDetails();
      setSeatDetails(response.data);
    } catch (error) {
      console.error('Error fetching seat details:', error);
      if (error.response?.status === 404) {
        toast.error('No seating allocation found for you. Please contact the administrator.');
      } else {
        toast.error('Failed to load seat details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAdmitCard = async () => {
    setDownloading(true);
    try {
      const response = await studentAPI.generateAdmitCard();
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admit-card-${user.rollNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Admit card downloaded successfully');
    } catch (error) {
      toast.error('Failed to download admit card');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!seatDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="card-body">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Seating Allocation</h3>
              <p className="text-gray-600 mb-6">
                Your seating allocation has not been generated yet. Please contact your examination office.
              </p>
              <button
                onClick={handleLogout}
                className="btn-primary flex items-center justify-center mx-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Seat Details</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.rollNumber}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Information */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Exam Information
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Exam Name</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.examName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Exam Time</p>
                  <p className="text-lg font-semibold text-gray-900">9:00 AM - 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seating Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Student Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Student Information
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.studentDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.studentDetails.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.studentDetails.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.studentDetails.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seating Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Layout className="w-5 h-5 mr-2" />
                Seating Information
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hall</p>
                    <p className="text-lg font-semibold text-gray-900">{seatDetails.hallName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Row</p>
                    <p className="text-lg font-semibold text-gray-900">{seatDetails.row}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Layout className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bench</p>
                    <p className="text-lg font-semibold text-gray-900">{seatDetails.bench}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Seat Position</p>
                    <p className="text-lg font-semibold text-gray-900">{seatDetails.seatPosition}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bench Mate Information */}
        {seatDetails.benchMate && (
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Bench Mate Information</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.benchMate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.benchMate.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{seatDetails.benchMate.department}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadAdmitCard}
                disabled={downloading}
                className="btn-primary flex items-center justify-center"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Admit Card
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="card mt-8">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Important Instructions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">1</span>
                </div>
                <p className="text-gray-700">Please arrive at least 30 minutes before the exam time</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">2</span>
                </div>
                <p className="text-gray-700">Bring your own stationery and calculator if required</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">3</span>
                </div>
                <p className="text-gray-700">Mobile phones and electronic devices are not allowed</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-primary-600">4</span>
                </div>
                <p className="text-gray-700">Follow all examination rules and regulations</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentSeatDetails;
