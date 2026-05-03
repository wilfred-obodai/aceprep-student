import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Auth Pages ─────────────────────────────────
import RoleSelect    from './pages/RoleSelect';
import Login         from './pages/Login';
import Register      from './pages/Register';
import AdminLogin    from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ParentLogin   from './pages/ParentLogin';
import ParentRegister from './pages/ParentRegister';

// ── Student Pages ──────────────────────────────
import Home          from './pages/Home';
import PastQuestions from './pages/PastQuestions';
import Grades        from './pages/Grades';
import Profile       from './pages/Profile';
import AiTutor       from './pages/AiTutor';
import Exams         from './pages/Exams';
import TakeExam      from './pages/TakeExam';
import Assignments   from './pages/Assignments';
import Leaderboard   from './pages/Leaderboard';
import Streak        from './pages/Streak';
import Announcements from './pages/Announcements';
import Timetable     from './pages/Timetable';
import Attendance    from './pages/Attendance';
import Messages      from './pages/Messages';
import StudyMaterials from './pages/StudyMaterials';
import XPLevel       from './pages/XPLevel';
import Analytics     from './pages/Analytics';
import QuizBattle    from './pages/QuizBattle';
import VideoRoom     from './pages/VideoRoom';
import ExamCountdown from './pages/ExamCountdown';
import Teachers      from './pages/Teachers';

// ── Admin Pages ────────────────────────────────
import AdminDashboard     from './pages/admin/Dashboard';
import AdminStudents      from './pages/admin/Students';
import AdminStudentProfile from './pages/admin/StudentProfile';
import AdminGrades        from './pages/admin/Grades';
import AdminExams         from './pages/admin/Exams';
import AdminCreateExam    from './pages/admin/CreateExam';
import AdminExamResults   from './pages/admin/ExamResults';
import AdminAssignments   from './pages/admin/Assignments';
import AdminAssignmentSubmissions from './pages/admin/AssignmentSubmissions';
import AdminLeaderboard   from './pages/admin/Leaderboard';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminTimetable     from './pages/admin/Timetable';
import AdminAnalytics     from './pages/admin/Analytics';
import AdminAttendance    from './pages/admin/Attendance';
import AdminMessages      from './pages/admin/Messages';
import AdminStudyMaterials from './pages/admin/StudyMaterials';
import AdminSettings      from './pages/admin/Settings';
import AdminVideoRooms    from './pages/admin/VideoRooms';
import AdminXPLeaderboard from './pages/admin/XPLeaderboard';
import AdminTeachers      from './pages/admin/Teachers';
import AIQuestionGenerator from './pages/admin/AIQuestionGenerator';
import ResetPassword from './pages/ResetPassword';
import PastQuestionsPDF   from './pages/admin/PastQuestionsPDF';
import PerformanceReport  from './pages/admin/PerformanceReport';
import Certificates       from './pages/admin/Certificates';

// ── Parent Pages ───────────────────────────────
import ParentDashboard   from './pages/parent/Dashboard';
import ParentChildGrades from './pages/parent/ChildGrades';
import ParentAttendance  from './pages/parent/Attendance';
import ParentMessages    from './pages/parent/Messages';
import ParentProfile     from './pages/parent/Profile';

// ── Protected Route Components ─────────────────
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

const StudentRoute = ({ children }) => {
  const { token, isStudent } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (!isStudent) return <Navigate to="/unauthorized" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (role !== 'admin' && role !== 'teacher') return <Navigate to="/unauthorized" />;
  return children;
};

const ParentRoute = ({ children }) => {
  const { token, isParent } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (!isParent) return <Navigate to="/unauthorized" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public Routes ───────────────────── */}
          <Route path="/"               element={<RoleSelect />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/admin/login"    element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/parent/login"   element={<ParentLogin />} />
          <Route path="/parent/register" element={<ParentRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized"   element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
              <h2>⛔ Access Denied</h2>
              <p>You don't have permission to view this page.</p>
              <button onClick={() => window.location.href = '/'} style={{ padding: '10px 24px', background: '#1A5276', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Go Home
              </button>
            </div>
          } />

          {/* ── Student Routes ───────────────────── */}
          <Route path="/home"          element={<StudentRoute><Home /></StudentRoute>} />
          <Route path="/questions"     element={<StudentRoute><PastQuestions /></StudentRoute>} />
          <Route path="/grades"        element={<StudentRoute><Grades /></StudentRoute>} />
          <Route path="/profile"       element={<StudentRoute><Profile /></StudentRoute>} />
          <Route path="/ai-tutor"      element={<StudentRoute><AiTutor /></StudentRoute>} />
          <Route path="/exams"         element={<StudentRoute><Exams /></StudentRoute>} />
          <Route path="/exams/:id"     element={<StudentRoute><TakeExam /></StudentRoute>} />
          <Route path="/work"          element={<StudentRoute><Assignments /></StudentRoute>} />
          <Route path="/leaderboard"   element={<StudentRoute><Leaderboard /></StudentRoute>} />
          <Route path="/streak"        element={<StudentRoute><Streak /></StudentRoute>} />
          <Route path="/announcements" element={<StudentRoute><Announcements /></StudentRoute>} />
          <Route path="/timetable"     element={<StudentRoute><Timetable /></StudentRoute>} />
          <Route path="/attendance"    element={<StudentRoute><Attendance /></StudentRoute>} />
          <Route path="/messages"      element={<StudentRoute><Messages /></StudentRoute>} />
          <Route path="/materials"     element={<StudentRoute><StudyMaterials /></StudentRoute>} />
          <Route path="/xp"            element={<StudentRoute><XPLevel /></StudentRoute>} />
          <Route path="/analytics"     element={<StudentRoute><Analytics /></StudentRoute>} />
          <Route path="/battle"        element={<StudentRoute><QuizBattle /></StudentRoute>} />
          <Route path="/video"         element={<StudentRoute><VideoRoom /></StudentRoute>} />
          <Route path="/countdown"     element={<StudentRoute><ExamCountdown /></StudentRoute>} />
          <Route path="/teachers"      element={<StudentRoute><Teachers /></StudentRoute>} />

          {/* ── Admin Routes ─────────────────────── */}
          <Route path="/admin"                       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/students"              element={<AdminRoute><AdminStudents /></AdminRoute>} />
          <Route path="/admin/students/:id"          element={<AdminRoute><AdminStudentProfile /></AdminRoute>} />
          <Route path="/admin/grades"                element={<AdminRoute><AdminGrades /></AdminRoute>} />
          <Route path="/admin/exams"                 element={<AdminRoute><AdminExams /></AdminRoute>} />
          <Route path="/admin/exams/create"          element={<AdminRoute><AdminCreateExam /></AdminRoute>} />
          <Route path="/admin/exams/:id/results"     element={<AdminRoute><AdminExamResults /></AdminRoute>} />
          <Route path="/admin/assignments"           element={<AdminRoute><AdminAssignments /></AdminRoute>} />
          <Route path="/admin/assignments/:id/submissions" element={<AdminRoute><AdminAssignmentSubmissions /></AdminRoute>} />
          <Route path="/admin/leaderboard"           element={<AdminRoute><AdminLeaderboard /></AdminRoute>} />
          <Route path="/admin/announcements"         element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
          <Route path="/admin/timetable"             element={<AdminRoute><AdminTimetable /></AdminRoute>} />
          <Route path="/admin/analytics"             element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/attendance"            element={<AdminRoute><AdminAttendance /></AdminRoute>} />
          <Route path="/admin/messages"              element={<AdminRoute><AdminMessages /></AdminRoute>} />
          <Route path="/admin/study-materials"       element={<AdminRoute><AdminStudyMaterials /></AdminRoute>} />
          <Route path="/admin/settings"              element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/video-rooms"           element={<AdminRoute><AdminVideoRooms /></AdminRoute>} />
          <Route path="/admin/xp-leaderboard"        element={<AdminRoute><AdminXPLeaderboard /></AdminRoute>} />
          <Route path="/admin/teachers"              element={<AdminRoute><AdminTeachers /></AdminRoute>} />
          <Route path="/admin/ai-questions"          element={<AdminRoute><AIQuestionGenerator /></AdminRoute>} />
          <Route path="/admin/past-questions-pdf" element={<AdminRoute><PastQuestionsPDF /></AdminRoute>} />
          <Route path="/admin/past-questions-pdf"  element={<AdminRoute><PastQuestionsPDF /></AdminRoute>} />
<Route path="/admin/performance-report"  element={<AdminRoute><PerformanceReport /></AdminRoute>} />
<Route path="/admin/certificates"        element={<AdminRoute><Certificates /></AdminRoute>} />

          {/* ── Parent Routes ────────────────────── */}
          <Route path="/parent"              element={<ParentRoute><ParentDashboard /></ParentRoute>} />
          <Route path="/parent/grades"       element={<ParentRoute><ParentChildGrades /></ParentRoute>} />
          <Route path="/parent/attendance"   element={<ParentRoute><ParentAttendance /></ParentRoute>} />
          <Route path="/parent/messages"     element={<ParentRoute><ParentMessages /></ParentRoute>} />
          <Route path="/parent/profile"      element={<ParentRoute><ParentProfile /></ParentRoute>} />

          {/* ── Fallback ─────────────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;