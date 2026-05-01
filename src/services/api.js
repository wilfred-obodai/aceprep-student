import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────
export const loginStudent    = (data) => API.post('/auth/login', data);
export const registerStudent = (data) => API.post('/auth/register/student', data);
export const validateCode    = (code) => API.get(`/schools/validate-code/${code}`);

// ── Student ───────────────────────────────────────
export const getProfile      = ()     => API.get('/students/profile');
export const startSession    = (data) => API.post('/students/session/start', data);
export const endSession      = ()     => API.post('/students/session/end');

// ── Grades ────────────────────────────────────────
export const getMyGrades     = ()     => API.get('/grades/mine');
export const submitGrade     = (data) => API.post('/grades/submit', data);

// ── Past Questions ────────────────────────────────
export const getPastQuestions = (params) => API.get('/questions', { params });
export const getSubjects      = (params) => API.get('/questions/subjects', { params });

// ── Exams ─────────────────────────────────────────
export const getStudentExams   = ()           => API.get('/exams/student');
export const getExamQuestions  = (id)         => API.get(`/exams/${id}/questions`);
export const submitExam        = (id, data)   => API.post(`/exams/${id}/submit`, data);

// ── Assignments ───────────────────────────────────
export const getStudentAssignments = ()         => API.get('/assignments/student');
export const submitAssignment      = (id, data) => API.post(`/assignments/${id}/submit`, data);

// ── Leaderboard ───────────────────────────────
export const getMyRank    = () => API.get('/leaderboard/my-rank');

// ── Streaks ───────────────────────────────────
export const getMyStreak  = () => API.get('/streaks/mine');

// ── Announcements ─────────────────────────────
export const getStudentAnnouncements = () => API.get('/announcements/student');

// ── Timetable ─────────────────────────────────
export const getStudentTimetable     = () => API.get('/timetable/student');

// ── Attendance ────────────────────────────────
export const getMyAttendance   = () => API.get('/attendance/mine');

// ── Messages ──────────────────────────────────
export const getMyInbox        = () => API.get('/messages/inbox');
export const getMySent         = () => API.get('/messages/sent');
export const markMessageAsRead = (id) => API.put(`/messages/${id}/read`);

// ── Materials ─────────────────────────────────
export const getMyMaterials    = () => API.get('/upload/materials');

export default API;