import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rollNumber || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData, 'student');
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/student/seat-details');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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
            Student Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            View your exam seating allocation and admit card
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your roll number"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Login Information:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Use your roll number from the Excel file uploaded by your institution</p>
                <p>• Default password: <strong>student123</strong></p>
                <p>• Contact your administrator if you can't access your account</p>
                <p>• Students are automatically registered when Excel files are uploaded</p>
              </div>
            </div>


          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Contact your examination office
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
