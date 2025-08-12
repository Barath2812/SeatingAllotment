import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';

const StudentSignup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Student Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Student accounts are managed by administrators
          </p>
        </div>

        {/* Disabled Message */}
        <div className="card">
          <div className="card-body text-center">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Student Registration Disabled
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Student accounts are automatically created when your institution uploads the student list via Excel file.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to Access Your Account:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Your account is created automatically from Excel data</p>
                <p>• Use your roll number from the Excel file</p>
                <p>• Default password: <strong>student123</strong></p>
                <p>• Contact your administrator for access</p>
              </div>
            </div>

            <Link 
              to="/student/login" 
              className="btn-primary w-full"
            >
              Go to Student Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your examination office
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
