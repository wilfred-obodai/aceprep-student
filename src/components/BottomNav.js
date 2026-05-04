import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/home',      icon: '🏠', label: 'Home' },
  { path: '/questions', icon: '📄', label: 'Past Questions' },
  { path: '/exams',     icon: '📝', label: 'Exams' },
  { path: '/work',      icon: '📋', label: 'Assignments' },
  { path: '/ai-tutor',  icon: '🤖', label: 'AI Tutor' },
  { path: '/materials', icon: '📚', label: 'Materials' },
  { path: '/battle',    icon: '⚔️',  label: 'Quiz Battle' },
  { path: '/countdown', icon: '⏳', label: 'Countdown' },
  { path: '/grades',    icon: '📊', label: 'Grades' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/streak',    icon: '🔥', label: 'Streaks' },
  { path: '/xp',        icon: '⭐', label: 'XP Level' },
  { path: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
  { path: '/news',      icon: '📢', label: 'Announcements' },
  { path: '/timetable', icon: '📅', label: 'Timetable' },
  { path: '/attendance',icon: '✅', label: 'Attendance' },
  { path: '/messages',  icon: '✉️',  label: 'Messages' },
  { path: '/teachers',  icon: '👨‍🏫', label: 'Teachers' },
  { path: '/video',     icon: '🎥', label: 'Video Rooms' },
  { path: '/profile',   icon: '👤', label: 'Profile' },
  { path: '/notifications', icon: '🔔', label: 'Notifications' },
  { path: '/planner',       icon: '🎯', label: 'Study Planner' },
];

// Ghana flag colors for active links
const ghanaColors = ['#006B3F', '#FCD116', '#CE1126'];
const getGhanaColor = (index) => ghanaColors[index % 3];

const BottomNav = () => {
  const location  = useLocation();
  const { logout, user } = useAuth();

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        {/* Ghana flag strip */}
        <div style={styles.flagStrip}>
          <div style={{ flex:1, background:'#006B3F' }} />
          <div style={{ flex:1, background:'#FCD116' }} />
          <div style={{ flex:1, background:'#CE1126' }} />
        </div>
        <h1 style={styles.logoText}>ACEPREP</h1>
        <p style={styles.logoSub}>Student Portal</p>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {navLinks.map((link, index) => {
          const isActive = location.pathname === link.path;
          const color    = getGhanaColor(index);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive ? {
                  color:            '#ffffff',
                  background:       `${color}22`,
                  borderLeftColor:  color,
                  fontWeight:       'bold',
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
  sidebar:     { width: 235, minHeight: '100vh', height: '100vh', background: '#1A5276', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, overflowY: 'auto' },
  logo:        { padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  flagStrip:   { display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  logoText:    { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2, margin: 0 },
  logoSub:     { color: '#AED6F1', fontSize: 11, marginTop: 2 },
  nav:         { flex: 1, padding: '8px 0' },
  navLink:     { display: 'flex', alignItems: 'center', padding: '10px 18px', color: '#AED6F1', fontSize: 13, textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'all 0.2s', margin: '1px 0' },
  navIcon:     { marginRight: 10, fontSize: 15, width: 20, textAlign: 'center' },
  bottom:      { padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  userEmail:   { color: '#AED6F1', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
  logoutBtn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(231,76,60,0.2)', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer', width: '100%' },
};

export default BottomNav;