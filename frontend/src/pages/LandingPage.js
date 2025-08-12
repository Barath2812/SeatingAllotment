import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, ArrowRight, Shield, Clock, FileText } from 'lucide-react';
import { logo } from '../assets/assert';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
          <img src={logo} alt="Karpaga Vinayaga Educational Group" className="h-20 w-30 " />
            <div className="flex items-center">
            
              <div className="flex-shrink-0">
                
                <h1 className="text-2xl font-bold text-primary-600">Smart Seating Solutions</h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/admin/login"
                className="btn-primary flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
              <Link
                to="/student/login"
                className="btn-secondary flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Automated Seating Allocation
            <span className="text-primary-600"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your examination seating arrangements with our intelligent system. 
            Ensure fair distribution, prevent cheating, and save hours of manual work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/admin/login"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Admin Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/student/login"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Signup Options */}
          <div className="flex justify-center mb-12">
            <Link
              to="/admin/signup"
              className="text-primary-600 hover:text-primary-500 font-medium text-center"
            >
              Create Admin Account
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Allocation</h3>
            <p className="text-gray-600">
              Advanced algorithm ensures students from the same department never sit together, 
              preventing collaboration during exams.
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Efficient</h3>
            <p className="text-gray-600">
              Generate seating arrangements for hundreds of students in seconds, 
              saving hours of manual work.
            </p>
          </div>

          <div className="card text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Export</h3>
            <p className="text-gray-600">
              Export seating plans to Excel and PDF formats. 
              Send automatic email notifications to all students.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Data</h3>
              <p className="text-gray-600 text-sm">
                Upload student and hall information via Excel files
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Seating</h3>
              <p className="text-gray-600 text-sm">
                Click one button to automatically allocate seats
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Export & Notify</h3>
              <p className="text-gray-600 text-sm">
                Export results and send notifications to students
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Students Access</h3>
              <p className="text-gray-600 text-sm">
                Students can view their seat details and download admit cards
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Smart Seating Solutions. All rights reserved.</p>
          <p className="text-gray-400 mt-2">
            Automated seating allocation system for educational institutions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
