import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleSelect = () => {
  const navigate = useNavigate();
  const { token, role } = useAuth();

  // If already logged in, redirect to correct dashboard
  React.useEffect(() => {
    if (token && role) {
      if (role === 'student') navigate('/home');
      else if (role === 'admin')  navigate('/admin');
      else if (role === 'parent') navigate('/parent');
    }
  }, [token, role, navigate]);

  const roles = [
    {
      id:       'student',
      icon:     '🎓',
      title:    'I am a Student',
      desc:     'Access past questions, exams, AI tutor and more',
      color:    '#2E86AB',
      loginPath: '/login',
      registerPath: '/register',
    },
    {
      id:       'admin',
      icon:     '🏫',
      title:    'I am a School Admin',
      desc:     'Manage students, exams, grades and school analytics',
      color:    '#1A5276',
      loginPath: '/admin/login',
      registerPath: '/admin/register',
    },
    {
      id:       'parent',
      icon:     '👨‍👩‍👧',
      title:    'I am a Parent',
      desc:     'Monitor your child\'s performance and attendance',
      color:    '#27AE60',
      loginPath: '/parent/login',
      registerPath: '/parent/register',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      {/* Logo */}
      <div style={styles.logoSection}>
        <h1 style={styles.logo}>ACEPREP</h1>
        <p style={styles.tagline}>Ghana's #1 BECE & WASSCE Prep Platform</p>
        <p style={styles.subtitle}>Who are you? Select your role to continue</p>
      </div>

      {/* Role Cards */}
      <div style={styles.cards}>
        {roles.map(r => (
          <div key={r.id} style={{ ...styles.card, borderTop: `4px solid ${r.color}` }}>
            <div style={{ ...styles.iconBox, background: `${r.color}15` }}>
              <span style={styles.icon}>{r.icon}</span>
            </div>
            <h2 style={{ ...styles.cardTitle, color: r.color }}>{r.title}</h2>
            <p style={styles.cardDesc}>{r.desc}</p>
            <div style={styles.cardBtns}>
              <button
                style={{ ...styles.loginBtn, background: r.color }}
                onClick={() => navigate(r.loginPath)}
              >
                Login
              </button>
              <button
                style={{ ...styles.registerBtn, borderColor: r.color, color: r.color }}
                onClick={() => navigate(r.registerPath)}
              >
                Register
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        © 2026 AcePrep Ghana · Built with ❤️ for Ghanaian students
      </p>
    </div>
  );
};

const styles = {
  container:   { minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1A5276 50%, #0a1628 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' },
  bgCircle1:   { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(46,134,171,0.08)', top: -100, right: -100 },
  bgCircle2:   { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(39,174,96,0.06)', bottom: -80, left: -80 },
  logoSection: { textAlign: 'center', marginBottom: 48, zIndex: 1 },
  logo:        { fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: 6, margin: 0 },
  tagline:     { fontSize: 16, color: '#AED6F1', marginTop: 8, fontWeight: '500' },
  subtitle:    { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
  cards:       { display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, maxWidth: 1000, width: '100%' },
  card:        { background: '#ffffff', borderRadius: 20, padding: '32px 28px', width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', transition: 'transform 0.2s' },
  iconBox:     { width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  icon:        { fontSize: 36 },
  cardTitle:   { fontSize: 20, fontWeight: 'bold', margin: '0 0 10px' },
  cardDesc:    { fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 24px', flexGrow: 1 },
  cardBtns:    { display: 'flex', gap: 10, width: '100%' },
  loginBtn:    { flex: 1, padding: '12px', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  registerBtn: { flex: 1, padding: '12px', background: 'transparent', border: '2px solid', borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  footer:      { marginTop: 48, color: 'rgba(255,255,255,0.3)', fontSize: 12, zIndex: 1 },
};

export default RoleSelect;