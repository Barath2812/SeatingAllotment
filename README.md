# Smart Seating Solutions

A complete MERN stack web application for automated seating allocation in examination halls. This system ensures fair distribution of students while preventing collaboration between students from the same department.

## 🚀 Features

### Admin Features
- **Secure Login**: JWT-based authentication for administrators
- **Excel Upload**: Upload student and hall data via Excel files
- **Smart Seating Algorithm**: Automatically allocate seats ensuring students from the same department never sit together
- **Dashboard**: View statistics and manage the entire process
- **Export Options**: Export seating plans to Excel and PDF formats
- **Email Notifications**: Send automatic notifications to all students
- **Real-time Updates**: View seating arrangements in organized tables

### Student Features
- **Secure Login**: Login with roll number and password
- **Seat Details**: View complete seating information
- **Admit Card**: Download personalized admit card as PDF
- **Bench Mate Info**: See who you're sitting next to

### Technical Features
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **Real-time Validation**: Form validation and error handling
- **File Upload**: Support for Excel files (.xlsx, .xls)
- **PDF Generation**: Dynamic PDF generation for reports
- **Email Integration**: Automated email notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **xlsx** - Excel file parsing
- **nodemailer** - Email notifications
- **exceljs** - Excel file generation
- **jspdf** - PDF generation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-seating-solutions
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration
Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/smart-seating?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important Notes:**
- Replace `your-username`, `your-password`, and `cluster0.mongodb.net` with your MongoDB Atlas credentials
- Generate a strong JWT secret for production
- For email notifications, use a Gmail account with App Password enabled

### 4. Start the Application

#### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

#### Production Mode
```bash
# Build the frontend
cd frontend
npm run build

# Start the backend
cd ../backend
npm start
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  role: 'admin' | 'student',
  rollNumber: String,
  department: String,
  email: String,
  passwordHash: String
}
```

### Hall Model
```javascript
{
  hallName: String,
  capacity: Number
}
```

### SeatingPlan Model
```javascript
{
  examId: String,
  hallName: String,
  row: Number,
  bench: Number,
  seat1: { studentId, rollNumber, department },
  seat2: { studentId, rollNumber, department }
}
```

## 🎯 Usage Guide

### For Administrators

1. **Login**: Use the default admin credentials:
   - Email: `admin@smartseating.com`
   - Password: `admin123`

2. **Upload Students**: 
   - Go to "Upload Students" page
   - Download the template
   - Fill in student data (Roll No, Name, Department, Email, Phone)
   - Upload the Excel file

3. **Upload Halls**:
   - Go to "Upload Halls" page
   - Download the template
   - Fill in hall data (Hall Name, Capacity)
   - Upload the Excel file

4. **Generate Seating**:
   - Click "Generate Seating" from the dashboard
   - The system will automatically allocate seats

5. **View & Export**:
   - View seating arrangements in organized tables
   - Export to Excel or PDF
   - Send email notifications to students

### For Students

1. **Login**: Use your roll number and default password (`student123`)

2. **View Details**: See your complete seating information

3. **Download Admit Card**: Get your personalized admit card as PDF

## 📁 File Structure

```
smart-seating-solutions/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Hall.js
│   │   └── SeatingPlan.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   └── studentController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── student.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── excelParser.js
│   │   └── seatingAllocator.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── StudentLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UploadStudents.js
│   │   │   ├── UploadHalls.js
│   │   │   ├── SeatingView.js
│   │   │   └── StudentSeatDetails.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `GET /api/auth/profile` - Get user profile

### Admin Routes
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `POST /api/admin/upload/students` - Upload students Excel file
- `POST /api/admin/upload/halls` - Upload halls Excel file
- `POST /api/admin/generate-seating` - Generate seating allocation
- `GET /api/admin/seating-plan` - Get seating plan
- `GET /api/admin/export/excel` - Export to Excel
- `GET /api/admin/export/pdf` - Export to PDF
- `POST /api/admin/send-notifications` - Send email notifications

### Student Routes
- `GET /api/student/seat-details` - Get seat details
- `GET /api/student/admit-card` - Generate admit card

## 🎨 Seating Algorithm

The seating allocation algorithm ensures:

1. **Department Separation**: Students from the same department never sit on the same bench
2. **Fair Distribution**: Students are distributed evenly across halls
3. **Bench Allocation**: Each bench accommodates exactly 2 students
4. **Hall Filling**: Halls are filled sequentially to maximize capacity usage

### Algorithm Steps:
1. Group students by department
2. Shuffle each department group (Fisher-Yates algorithm)
3. Interleave students from different departments
4. Allocate seats bench by bench, hall by hall
5. Validate seating plan for conflicts

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Separate admin and student access
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size validation

## 📧 Email Configuration

To enable email notifications:

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in your environment variables

2. **Environment Variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Set environment variables in Heroku dashboard
# Deploy using Heroku CLI or GitHub integration
```

### Frontend Deployment (Netlify/Vercel)
```bash
# Build the project
npm run build

# Deploy the build folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

### Version 1.0.0
- Initial release with core functionality
- Admin and student portals
- Excel upload and export
- Email notifications
- PDF generation

---

**Smart Seating Solutions** - Making examination seating allocation simple, fair, and efficient! 🎓
