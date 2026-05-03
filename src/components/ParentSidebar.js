import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/parent',            icon: '🏠', label: 'Dashboard' },
  { path: '/parent/grades',     icon: '📊', label: 'Child Grades' },
  { path: '/parent/attendance', icon: '✅', label: 'Attendance' },
  { path: '/parent/messages',   icon: '✉️',  label: 'Messages' },
  { path: '/parent/profile',    icon: '👤', label: 'My Profile' },
];

const ghanaColors = ['#CE1126', '#FCD116', '#006B3F', '#CE1126', '#FCD116'];

const ParentSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.flagStrip}>
          <div style={{ flex:1, background:'#006B3F' }} />
          <div style={{ flex:1, background:'#FCD116' }} />
          <div style={{ flex:1, background:'#CE1126' }} />
        </div>
        <h1 style={styles.logoText}>ACEPREP</h1>
        <p style={styles.logoSub}>Parent Portal</p>
      </div>

      <nav style={styles.nav}>
        {navLinks.map((link, index) => {
          const isActive = location.pathname === link.path;
          const color    = ghanaColors[index];
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

      <div style={styles.bottom}>
        <p style={styles.userEmail}>{user?.fullName?.split(' ')[0] || 'Parent'}</p>
        <button onClick={logout} style={styles.logoutBtn}>🚪 Logout</button>
      </div>
    </div>
  );
};

const styles = {
  sidebar:    { width: 235, minHeight: '100vh', height: '100vh', background: '#7a0015', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, overflowY: 'auto' },
  logo:       { padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  flagStrip:  { display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  logoText:   { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2, margin: 0 },
  logoSub:    { color: '#ffaaaa', fontSize: 11, marginTop: 2 },
  nav:        { flex: 1, padding: '8px 0' },
  navLink:    { display: 'flex', alignItems: 'center', padding: '12px 18px', color: '#ffcccc', fontSize: 14, textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'all 0.2s', margin: '1px 0' },
  navIcon:    { marginRight: 12, fontSize: 15, width: 20, textAlign: 'center' },
  bottom:     { padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 },
  userEmail:  { color: '#ffcccc', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
  logoutBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(231,76,60,0.2)', color: '#ff8888', border: '1px solid #ff4444', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer', width: '100%' },
};

export default ParentSidebar;