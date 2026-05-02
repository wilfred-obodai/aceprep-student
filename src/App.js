import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Home          from './pages/Home';
import PastQuestions from './pages/PastQuestions';
import Grades        from './pages/Grades';
import Profile       from './pages/Profile';
import AiTutor       from './pages/AiTutor';
import Exams         from './pages/Exams';
import TakeExam      from './pages/TakeExam';
import Assignments from './pages/Assignments';
import Leaderboard  from './pages/Leaderboard';
import Streak       from './pages/Streak';
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
import Teachers from './pages/Teachers';


const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/questions" element={
            <ProtectedRoute><PastQuestions /></ProtectedRoute>
          } />
          <Route path="/grades" element={
            <ProtectedRoute><Grades /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/ai-tutor" element={
            <ProtectedRoute><AiTutor /></ProtectedRoute>
          } />
          <Route path="/exams" element={
            <ProtectedRoute><Exams /></ProtectedRoute>
          } />
          <Route path="/exams/:id" element={
            <ProtectedRoute><TakeExam /></ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute><Assignments /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><Leaderboard /></ProtectedRoute>
          } />
          <Route path="/streak" element={
            <ProtectedRoute><Streak /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/timetable"     element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="/attendance"      element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/messages"        element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/study-materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
          <Route path="/xp"        element={<ProtectedRoute><XPLevel /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/battle"    element={<ProtectedRoute><QuizBattle /></ProtectedRoute>} />
          <Route path="/video"     element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />
          <Route path="/countdown" element={<ProtectedRoute><ExamCountdown /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;