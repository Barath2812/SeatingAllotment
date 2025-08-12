import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  adminSignup: (userData) => api.post('/auth/admin/signup', userData),
  studentLogin: (credentials) => api.post('/auth/student/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  uploadStudents: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadHalls: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload/halls', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generateSeating: () => api.post('/admin/generate-seating'),
  getSeatingPlan: () => api.get('/admin/seating-plan'),
  exportToExcel: () => api.get('/admin/export/excel', { responseType: 'blob' }),
  exportToPDF: () => api.get('/admin/export/pdf', { responseType: 'blob' }),
  sendNotifications: () => api.post('/admin/send-notifications'),
  deleteStudents: () => api.delete('/admin/delete/students'),
  deleteHalls: () => api.delete('/admin/delete/halls'),
  deleteAllStudents: () => api.delete('/admin/delete/all-students'),
  resetExcelPasswords: () => api.post('/admin/reset-excel-passwords'),
};

// Student API
export const studentAPI = {
  getSeatDetails: () => api.get('/student/seat-details'),
  generateAdmitCard: () => api.get('/student/admit-card', { responseType: 'blob' }),
};

// Utility function to download files
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
