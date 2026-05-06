import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = (process.env.REACT_APP_API_URL || 'https://aceprep-backend-uvdn.onrender.com/api').replace('/api', '');

const RoleSelect = () => {
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [checking, setChecking] = useState(true);
  const [attempt,  setAttempt]  = useState(0);

  useEffect(() => {
    if (token && role) {
      if (role === 'student') navigate('/home');
      else if (role === 'admin')  navigate('/admin');
      else if (role === 'parent') navigate('/parent');
      return;
    }

    let tries = 0;
    const checkBackend = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(8000) });
        if (res.ok) { setChecking(false); return; }
      } catch (e) {}
      tries++;
      setAttempt(tries);
      if (tries < 10) setTimeout(checkBackend, 4000);
      else setChecking(false); // give up after 40 seconds
    };
    checkBackend();
  }, [token, role, navigate]);

  const roles = [
    {
      id:           'student',
      icon:         '🎓',
      title:        'I am a Student',
      desc:         'Access past questions, exams, AI tutor and more',
      color:        '#006B3F',
      loginPath:    '/login',
      registerPath: '/register',
    },
    {
      id:           'admin',
      icon:         '🏫',
      title:        'I am a School Admin',
      desc:         'Manage students, exams, grades and school analytics',
      color:        '#b8860b',
      loginPath:    '/admin/login',
      registerPath: '/admin/register',
    },
    {
      id:           'parent',
      icon:         '👨‍👩‍👧',
      title:        'I am a Parent',
      desc:         "Monitor your child's performance and attendance",
      color:        '#CE1126',
      loginPath:    '/parent/login',
      registerPath: '/parent/register',
    },
  ];

  // ── Loading Screen ─────────────────────────────
  if (checking) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />

        {/* Ghana flag strip */}
        <div style={styles.flagStrip}>
          <div style={{ flex:1, background:'#006B3F' }} />
          <div style={{ flex:1, background:'#FCD116' }} />
          <div style={{ flex:1, background:'#CE1126' }} />
        </div>

        <div style={styles.loadingContent}>
          <h1 style={styles.loadingLogo}>ACEPREP</h1>
          <p style={styles.loadingTagline}>Ghana's #1 BECE & WASSCE Prep Platform 🇬🇭</p>

          {/* Spinner */}
          <div style={styles.spinnerWrap}>
            <div style={styles.spinner} />
          </div>

          <p style={styles.loadingMsg}>
            {attempt === 0 ? 'Starting up...' :
             attempt < 3  ? 'Waking up server...' :
             attempt < 6  ? 'Almost ready...' :
                            'Taking a bit longer than usual...'}
          </p>
          <p style={styles.loadingSubMsg}>
            First load may take up to 30 seconds
          </p>

          {/* Progress dots */}
          <div style={styles.dots}>
            {[0,1,2,3,4,5,6,7,8,9].map(i => (
              <div key={i} style={{
                ...styles.dot,
                background: i < attempt ? '#FCD116' : 'rgba(255,255,255,0.2)',
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // ── Role Select ────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      {/* Ghana flag strip at top */}
      <div style={styles.flagStrip}>
        <div style={{ flex:1, background:'#006B3F' }} />
        <div style={{ flex:1, background:'#FCD116' }} />
        <div style={{ flex:1, background:'#CE1126' }} />
      </div>

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

      <p style={styles.footer}>© 2026 AcePrep Ghana</p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  // Loading
  loadingScreen:  { minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1A5276 50%, #0a1628 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  loadingContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1, padding: 20, textAlign: 'center' },
  loadingLogo:    { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: 6, margin: 0 },
  loadingTagline: { fontSize: 16, color: '#AED6F1', margin: 0 },
  spinnerWrap:    { margin: '20px 0 10px' },
  spinner:        { width: 52, height: 52, border: '4px solid rgba(255,255,255,0.15)', borderTop: '4px solid #FCD116', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingMsg:     { fontSize: 16, color: '#fff', fontWeight: 'bold', margin: 0 },
  loadingSubMsg:  { fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 },
  dots:           { display: 'flex', gap: 8, marginTop: 8 },
  dot:            { width: 10, height: 10, borderRadius: 5, transition: 'background 0.3s' },
  flagStrip:      { display: 'flex', height: 5, width: '100%', position: 'absolute', top: 0 },

  // Role Select
  container:   { minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #1A5276 50%, #0a1628 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 40px', position: 'relative', overflow: 'hidden' },
  bgCircle1:   { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(46,134,171,0.08)', top: -100, right: -100 },
  bgCircle2:   { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(39,174,96,0.06)', bottom: -80, left: -80 },
  logoSection: { textAlign: 'center', marginBottom: 48, zIndex: 1 },
  logo:        { fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: 6, margin: 0 },
  tagline:     { fontSize: 16, color: '#AED6F1', marginTop: 8, fontWeight: '500' },
  subtitle:    { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
  cards:       { display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, maxWidth: 1000, width: '100%' },
  card:        { background: '#ffffff', borderRadius: 20, padding: '32px 28px', width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
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