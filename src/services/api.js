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

// ── Auth ───────────────────────────────────────
export const loginStudent    = (data) => API.post('/auth/student/login', data);
export const registerStudent = (data) => API.post('/auth/student/register', data);
export const validateCode    = (code) => API.get(`/schools/validate-code/${code}`);

// ── Student ────────────────────────────────────
export const getProfile      = ()     => API.get('/students/profile');
export const startSession    = (data) => API.post('/students/session/start', data);
export const endSession      = ()     => API.post('/students/session/end');

// ── Grades ─────────────────────────────────────
export const getMyGrades     = ()     => API.get('/grades/mine');
export const submitGrade     = (data) => API.post('/grades/submit', data);

// ── Past Questions ─────────────────────────────
export const getPastQuestions = (params) => API.get('/questions', { params });
export const getSubjects      = (params) => API.get('/questions/subjects', { params });

// ── Exams ──────────────────────────────────────
export const getStudentExams   = ()           => API.get('/exams/student');
export const getExamQuestions  = (id)         => API.get(`/exams/${id}/questions`);
export const submitExam        = (id, data)   => API.post(`/exams/${id}/submit`, data);

// ── Assignments ────────────────────────────────
export const getStudentAssignments = ()         => API.get('/assignments/student');
export const submitAssignment      = (id, data) => API.post(`/assignments/${id}/submit`, data);

// ── Leaderboard ────────────────────────────────
export const getMyRank    = () => API.get('/leaderboard/my-rank');

// ── Streaks ────────────────────────────────────
export const getMyStreak  = () => API.get('/streaks/mine');

// ── Announcements ──────────────────────────────
export const getStudentAnnouncements = () => API.get('/announcements/student');

// ── Timetable ──────────────────────────────────
export const getStudentTimetable     = () => API.get('/timetable/student');

// ── Attendance ─────────────────────────────────
export const getMyAttendance   = () => API.get('/attendance/mine');

// ── Messages ───────────────────────────────────
export const getMyInbox        = () => API.get('/messages/inbox');
export const getMySent         = () => API.get('/messages/sent');
export const markMessageAsRead = (id) => API.put(`/messages/${id}/read`);

// ── Materials ──────────────────────────────────
export const getMyMaterials    = () => API.get('/upload/materials');

// ── XP & Gamification ──────────────────────────
export const getMyXP          = ()     => API.get('/xp/mine');

// ── Analytics ──────────────────────────────────
export const getMyAnalytics   = ()     => API.get('/analytics/mine');

// ── Video Rooms ────────────────────────────────
export const joinVideoRoom    = (code) => API.get(`/video-rooms/join/${code}`);

// ── Battle ─────────────────────────────────────
export const createBattle     = (data) => API.post('/battle/create', data);
export const joinBattle       = (data) => API.post('/battle/join', data);
export const getBattle        = (code) => API.get(`/battle/${code}`);

// ══════════════════════════════════════════════
// ADMIN API FUNCTIONS
// ══════════════════════════════════════════════

// ── School ─────────────────────────────────────
export const getSchoolProfile   = ()     => API.get('/schools/profile');
export const getSchoolMonitoring = ()    => API.get('/schools/monitoring');
export const getSchoolStudents  = ()     => API.get('/schools/students');
export const getStudentAnalytics = (id) => API.get(`/analytics/student/${id}`);

// ── Admin Grades ───────────────────────────────
export const getSchoolGrades    = ()     => API.get('/grades/school');
export const getStudentGrades   = (id)   => API.get(`/grades/student/${id}`);

// ── Admin Exams ────────────────────────────────
export const getSchoolExams     = ()           => API.get('/exams/school');
export const createExam         = (data)       => API.post('/exams/create', data);
export const getExamResults     = (id)         => API.get(`/exams/${id}/results`);

// ── Admin Assignments ──────────────────────────
export const getSchoolAssignments = ()         => API.get('/assignments/school');
export const createAssignment     = (data)     => API.post('/assignments/create', data);
export const getSubmissions       = (id)       => API.get(`/assignments/${id}/submissions`);
export const gradeSubmission      = (id, data) => API.put(`/assignments/submissions/${id}/grade`, data);

// ── Admin Leaderboard ──────────────────────────
export const getSchoolLeaderboard = () => API.get('/leaderboard/school');
export const getXPLeaderboard     = () => API.get('/xp/leaderboard');

// ── Admin Announcements ────────────────────────
export const getSchoolAnnouncements = ()     => API.get('/announcements/school');
export const createAnnouncement     = (data) => API.post('/announcements/create', data);
export const deleteAnnouncement     = (id)   => API.delete(`/announcements/${id}`);

// ── Admin Timetable ────────────────────────────
export const getSchoolTimetable     = ()     => API.get('/timetable/school');
export const createTimetableEntry   = (data) => API.post('/timetable/create', data);
export const deleteTimetableEntry   = (id)   => API.delete(`/timetable/${id}`);

// ── Admin Attendance ───────────────────────────
export const getSchoolAttendance    = (params) => API.get('/attendance/school', { params });
export const markAttendance         = (data)   => API.post('/attendance/mark', data);

// ── Admin Messages ─────────────────────────────
export const getInbox       = ()     => API.get('/messages/inbox');
export const getSent        = ()     => API.get('/messages/sent');
export const sendMessage    = (data) => API.post('/messages/send', data);
export const markAsRead     = (id)   => API.put(`/messages/${id}/read`);

// ── Admin Study Materials ──────────────────────
export const uploadMaterial   = (data) => API.post('/upload/material', data);
export const deleteMaterial   = (id)   => API.delete(`/upload/material/${id}`);

// ── Admin Settings ─────────────────────────────
export const updateSchoolProfile = (data) => API.put('/schools/profile', data);
export const uploadSchoolLogo    = (data) => API.post('/upload/school-logo', data);

// ── Admin Video Rooms ──────────────────────────
export const getSchoolVideoRooms = ()     => API.get('/video-rooms/school');
export const createVideoRoom     = (data) => API.post('/video-rooms/create', data);
export const deleteVideoRoom     = (id)   => API.delete(`/video-rooms/${id}`);

// ── Teachers ───────────────────────────────────
export const getTeachers  = () => API.get('/schools/teachers');
export const addTeacher   = (data) => API.post('/auth/register/teacher', data);

// PARENT API FUNCTIONS
export const getChildProgress   = ()     => API.get('/parents/child-progress');
export const getChildGrades     = ()     => API.get('/parents/child-grades');
export const getChildAttendance = ()     => API.get('/parents/child-attendance');
export const getParentMessages  = ()     => API.get('/messages/inbox');
export const sendParentMessage  = (data) => API.post('/messages/send', data);

// Notifications
export const getNotifications  = () => API.get('/notifications');
export const markAllRead       = () => API.put('/notifications/read-all');
export const markNotifRead     = (id) => API.put(`/notifications/${id}/read`);

export default API;