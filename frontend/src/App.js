import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import pages
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminDashboard from './pages/AdminDashboard';
import UploadStudents from './pages/UploadStudents';
import UploadHalls from './pages/UploadHalls';
import SeatingView from './pages/SeatingView';
import StudentSeatDetails from './pages/StudentSeatDetails';
import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            isAuthenticated ? (
              user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/student/seat-details" />
            ) : (
              <Navigate to="/" />
            )
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            isAuthenticated && user?.role === 'admin' ? 
              <Navigate to="/admin/dashboard" /> : 
              <AdminLogin />
          } />
          
          <Route path="/admin/signup" element={
            isAuthenticated && user?.role === 'admin' ? 
              <Navigate to="/admin/dashboard" /> : 
              <AdminSignup />
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/upload/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UploadStudents />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/upload/halls" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UploadHalls />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/seating" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SeatingView />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student/login" element={
            isAuthenticated && user?.role === 'student' ? 
              <Navigate to="/student/seat-details" /> : 
              <StudentLogin />
          } />
          
          <Route path="/student/signup" element={
            isAuthenticated && user?.role === 'student' ? 
              <Navigate to="/student/seat-details" /> : 
              <StudentSignup />
          } />
          
          <Route path="/student/seat-details" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSeatDetails />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

// App wrapper with providers
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
