import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout } = useAuth();

  const tabs = [
  { path: '/',             icon: '🏠', label: 'Home'        },
  { path: '/questions',    icon: '📝', label: 'Questions'   },
  { path: '/exams',        icon: '📋', label: 'Exams'       },
  { path: '/assignments',  icon: '📚', label: 'Assignments' },
  { path: '/ai-tutor',     icon: '🤖', label: 'AI Tutor'    },
  { path: '/grades',       icon: '📊', label: 'Grades'      },
  { path: '/leaderboard',  icon: '🏆', label: 'Ranking'     },
  { path: '/streak',       icon: '🔥', label: 'Streak'      },
  { path: '/profile',      icon: '👤', label: 'Profile'     },
];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <h2 style={styles.logoText}>ACEPREP</h2>
        <p style={styles.logoSub}>Student Portal</p>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
              onClick={() => navigate(tab.path)}
            >
              <span style={styles.navIcon}>{tab.icon}</span>
              <span style={{
                ...styles.navLabel,
                color: isActive ? '#ffffff' : '#AED6F1',
                fontWeight: isActive ? 'bold' : 'normal',
              }}>
                {tab.label}
              </span>
              {isActive && <div style={styles.activeLine} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={styles.bottom}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width:          220,
    minHeight:      '100vh',
    background:     'linear-gradient(180deg, #1A5276 0%, #2E86AB 100%)',
    display:        'flex',
    flexDirection:  'column',
    position:       'fixed',
    top:            0,
    left:           0,
    zIndex:         1000,
    boxShadow:      '2px 0 10px rgba(0,0,0,0.15)',
  },
  logo: {
    padding:      '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoText: {
    color:         '#ffffff',
    fontSize:      22,
    fontWeight:    'bold',
    letterSpacing: 2,
    margin:        0,
  },
  logoSub: {
    color:     '#AED6F1',
    fontSize:  11,
    marginTop: 4,
  },
  nav: {
    flex:    1,
    padding: '16px 0',
  },
  navItem: {
    display:        'flex',
    alignItems:     'center',
    width:          '100%',
    padding:        '12px 20px',
    background:     'none',
    border:         'none',
    cursor:         'pointer',
    position:       'relative',
    borderLeft:     '3px solid transparent',
    transition:     'all 0.2s',
  },
  navItemActive: {
    background:  'rgba(255,255,255,0.15)',
    borderLeft:  '3px solid #F39C12',
  },
  navIcon: {
    fontSize:    18,
    marginRight: 12,
    flexShrink:  0,
  },
  navLabel: {
    fontSize: 14,
    color:    '#AED6F1',
  },
  activeLine: {
    position: 'absolute',
    right:    0,
    top:      '20%',
    bottom:   '20%',
    width:    3,
    background:   '#F39C12',
    borderRadius: '3px 0 0 3px',
  },
  bottom: {
    padding:      '16px 20px',
    borderTop:    '1px solid rgba(255,255,255,0.1)',
  },
  logoutBtn: {
    width:        '100%',
    padding:      '10px',
    background:   'rgba(231,76,60,0.2)',
    border:       '1px solid #E74C3C',
    borderRadius: 8,
    color:        '#E74C3C',
    fontSize:     13,
    fontWeight:   'bold',
    cursor:       'pointer',
  },
};

export default Sidebar;