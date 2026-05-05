import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/admin',                  icon: '🏠', label: 'Dashboard' },
  { path: '/admin/students',         icon: '👥', label: 'Students' },
  { path: '/admin/grades',           icon: '📊', label: 'Grades' },
  { path: '/admin/exams',            icon: '📝', label: 'Exams' },
  { path: '/admin/assignments',      icon: '📋', label: 'Assignments' },
  { path: '/admin/announcements',    icon: '📢', label: 'Announce' },
  { path: '/admin/timetable',        icon: '📅', label: 'Timetable' },
  { path: '/admin/attendance',       icon: '✅', label: 'Attendance' },
  { path: '/admin/study-materials',  icon: '📚', label: 'Materials' },
  { path: '/admin/past-questions-pdf',  icon: '📄', label: 'Past Q. PDFs' },
  { path: '/admin/performance-report',  icon: '📊', label: 'Performance' },
  { path: '/admin/certificates',        icon: '📜', label: 'Certificates' },
  { path: '/admin/messages',         icon: '✉️',  label: 'Messages' },
  { path: '/admin/video-rooms',      icon: '🎥', label: 'Video Rooms' },
  { path: '/admin/leaderboard',      icon: '🏆', label: 'Leaderboard' },
  { path: '/admin/xp-leaderboard',   icon: '⭐', label: 'XP Ranks' },
  { path: '/admin/analytics',        icon: '📈', label: 'Analytics' },
  { path: '/admin/ai-questions',     icon: '🤖', label: 'AI Questions' },
  { path: '/admin/teachers',         icon: '👨‍🏫', label: 'Teachers' },
    { path: '/admin/school-search', icon: '🔍', label: 'Find Schools' },
  { path: '/admin/settings',         icon: '⚙️',  label: 'Settings' },
];

// Ghana flag colors
const ghanaColors = ['#FCD116', '#006B3F', '#CE1126'];
const getColor = (index) => ghanaColors[index % 3];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, school } = useAuth();

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.flagStrip}>
          <div style={{ flex:1, background:'#006B3F' }} />
          <div style={{ flex:1, background:'#FCD116' }} />
          <div style={{ flex:1, background:'#CE1126' }} />
        </div>
        <h1 style={styles.logoText}>ACEPREP</h1>
        <p style={styles.logoSub}>School Dashboard</p>
        {school?.name && (
          <p style={styles.schoolName}>🏫 {school.name}</p>
        )}
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {navLinks.map((link, index) => {
          const isActive = location.pathname === link.path;
          const color    = getColor(index);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive ? {
                  color:           '#ffffff',
                  background:      `${color}22`,
                  borderLeftColor: color,
                  fontWeight:      'bold',
                } : {}),
              }}
            >
              <span style={styles.navIcon}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <p style={styles.userEmail}>{user?.fullName?.split(' ')[0] || user?.email}</p>
        <button onClick={logout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar:    { width: 240, minHeight: '100vh', height: '100vh', background: '#1A5276', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, overflowY: 'auto' },
  logo:       { padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  flagStrip:  { display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  logoText:   { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2, margin: 0 },
  logoSub:    { color: '#AED6F1', fontSize: 11, marginTop: 2 },
  schoolName: { color: '#FCD116', fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  nav:        { flex: 1, padding: '8px 0' },
  navLink:    { display: 'flex', alignItems: 'center', padding: '10px 18px', color: '#AED6F1', fontSize: 14, textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'all 0.2s', margin: '1px 0' },
  navIcon:    { marginRight: 12, fontSize: 15, width: 20, textAlign: 'center' },
  bottom:     { padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  userEmail:  { color: '#AED6F1', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
  logoutBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(231,76,60,0.2)', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer', width: '100%' },
};

export default AdminSidebar;