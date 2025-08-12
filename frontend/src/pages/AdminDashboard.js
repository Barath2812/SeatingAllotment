import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { 
  Users, 
  Building, 
  Layout, 
  Upload, 
  Settings, 
  FileText, 
  Mail, 
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studentCount: 0,
    hallCount: 0,
    seatingCount: 0,
    totalCapacity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleGenerateSeating = async () => {
    try {
      const response = await adminAPI.generateSeating();
      toast.success(response.data.message);
      fetchDashboardStats(); // Refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate seating');
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

  const handleDeleteStudents = async () => {
    if (stats.studentCount === 0) {
      toast.error('No Excel students to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${stats.studentCount} Excel-uploaded students?\n\n` +
      '⚠️ This action cannot be undone and will also clear any seating plans.\n\n' +
      'Type "DELETE" to confirm:'
    );

    if (confirmed) {
      const userInput = prompt('Please type "DELETE" to confirm:');
      if (userInput !== 'DELETE') {
        toast.error('Deletion cancelled');
        return;
      }

      try {
        const response = await adminAPI.deleteStudents();
        toast.success(response.data.message);
        fetchDashboardStats(); // Refresh stats
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete students');
      }
    }
  };

  const handleDeleteHalls = async () => {
    if (stats.hallCount === 0) {
      toast.error('No halls to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${stats.hallCount} halls?\n\n` +
      '⚠️ This action cannot be undone and will also clear any seating plans.\n\n' +
      'Type "DELETE" to confirm:'
    );

    if (confirmed) {
      const userInput = prompt('Please type "DELETE" to confirm:');
      if (userInput !== 'DELETE') {
        toast.error('Deletion cancelled');
        return;
      }

      try {
        const response = await adminAPI.deleteHalls();
        toast.success(response.data.message);
        fetchDashboardStats(); // Refresh stats
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete halls');
      }
    }
  };

  const handleDeleteAllStudents = async () => {
    const totalStudents = stats.studentCount || 0;
    
    if (totalStudents === 0) {
      toast.error('No students to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${totalStudents} students?\n\n` +
      '⚠️ This action cannot be undone and will also clear any seating plans.\n\n' +
      'Type "DELETE ALL" to confirm:'
    );

    if (confirmed) {
      const userInput = prompt('Please type "DELETE ALL" to confirm:');
      if (userInput !== 'DELETE ALL') {
        toast.error('Deletion cancelled');
        return;
      }

      try {
        const response = await adminAPI.deleteAllStudents();
        toast.success(response.data.message);
        fetchDashboardStats(); // Refresh stats
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete all students');
      }
    }
  };

  const handleResetExcelPasswords = async () => {
    if (stats.studentCount === 0) {
      toast.error('No Excel students found');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reset passwords for ${stats.studentCount} Excel-uploaded students?\n\n` +
      'This will set all their passwords to: student123\n\n' +
      'Type "RESET" to confirm:'
    );

    if (confirmed) {
      const userInput = prompt('Please type "RESET" to confirm:');
      if (userInput !== 'RESET') {
        toast.error('Password reset cancelled');
        return;
      }

      try {
        const response = await adminAPI.resetExcelPasswords();
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset passwords');
      }
    }
  };

  const quickActions = [
    {
      title: 'Upload Students',
      description: 'Upload student data from Excel file',
      icon: Users,
      link: '/admin/upload/students',
      color: 'bg-blue-500'
    },
    {
      title: 'Upload Halls',
      description: 'Upload hall information from Excel file',
      icon: Building,
      link: '/admin/upload/halls',
      color: 'bg-green-500'
    },
    {
      title: 'Generate Seating',
      description: 'Automatically allocate seats for all students',
      icon: Layout,
      action: handleGenerateSeating,
      color: 'bg-purple-500'
    },
    {
      title: 'View Seating Plan',
      description: 'View and export seating arrangements',
      icon: FileText,
      link: '/admin/seating',
      color: 'bg-orange-500'
    }
  ];

  const exportActions = [
    {
      title: 'Export to Excel',
      description: 'Download seating plan as Excel file',
      icon: FileText,
      action: async () => {
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
      }
    },
    {
      title: 'Export to PDF',
      description: 'Download seating plan as PDF file',
      icon: FileText,
      action: async () => {
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
      }
    },
    {
      title: 'Send Notifications',
      description: 'Send email notifications to all students',
      icon: Mail,
      action: handleSendNotifications
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.studentCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Halls</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.hallCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                                 <div className="flex-shrink-0">
                   <Layout className="h-8 w-8 text-purple-600" />
                 </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Allocated Benches</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.seatingCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Capacity</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCapacity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  {action.link ? (
                    <Link to={action.link} className="btn-primary w-full text-center">
                      Go to {action.title}
                    </Link>
                  ) : (
                    <button onClick={action.action} className="btn-primary w-full">
                      {action.title}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export & Notifications */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export & Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportActions.map((action, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-gray-500">
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <button onClick={action.action} className="btn-secondary w-full">
                    {action.title}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Student registration is now exclusively through Excel uploads. 
              Manual student registration has been disabled. All students must be uploaded via Excel files.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card border-l-4 border-red-500">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-red-500">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Excel Students</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Remove all Excel-uploaded student data. This will also clear any seating plans.
                </p>
                <button 
                  onClick={handleDeleteStudents} 
                  className="btn-danger w-full"
                  disabled={stats.studentCount === 0}
                >
                  Delete Excel Students ({stats.studentCount})
                </button>
              </div>
            </div>

            <div className="card border-l-4 border-red-500">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-red-500">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Halls</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Remove all uploaded hall data. This will also clear any seating plans.
                </p>
                <button 
                  onClick={handleDeleteHalls} 
                  className="btn-danger w-full"
                  disabled={stats.hallCount === 0}
                >
                  Delete All Halls ({stats.hallCount})
                </button>
              </div>
            </div>

            <div className="card border-l-4 border-red-600">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-red-600">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete All Students</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Remove ALL students (Excel + Manual). Use this to resolve roll number conflicts.
                </p>
                <button 
                  onClick={handleDeleteAllStudents} 
                  className="btn-danger w-full"
                  disabled={stats.studentCount === 0}
                >
                  Delete All Students ({stats.studentCount})
                </button>
              </div>
            </div>

            <div className="card border-l-4 border-orange-500">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-orange-500">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Excel Passwords</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reset passwords for all Excel-uploaded students to: student123
                </p>
                <button 
                  onClick={handleResetExcelPasswords} 
                  className="btn-secondary w-full"
                  disabled={stats.studentCount === 0}
                >
                  Reset Passwords ({stats.studentCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Excel Students</h3>
                  <p className="text-sm text-gray-600">{stats.studentCount > 0 ? `${stats.studentCount} uploaded` : 'Not uploaded'}</p>
                </div>
              </div>
            </div>
          </div>



          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Halls Uploaded</h3>
                  <p className="text-sm text-gray-600">{stats.hallCount > 0 ? 'Ready' : 'Not uploaded'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                {stats.seatingCount > 0 ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600 mr-3" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">Seating Generated</h3>
                  <p className="text-sm text-gray-600">
                    {stats.seatingCount > 0 ? `${stats.seatingCount} benches allocated` : 'Not generated'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
