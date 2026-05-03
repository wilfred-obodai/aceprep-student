import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showForgot,  setShowForgot]  = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg,   setForgotMsg]   = useState('');
  const [forgotLoad,  setForgotLoad]  = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const { loginStudent, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await loginStudent(email, password);
    if (success) navigate('/home');
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoad(true);
    setForgotMsg('');
    try {
      await API.post('/auth/forgot-password', { email: forgotEmail, role: 'student' });
      setForgotMsg('success');
    } catch { setForgotMsg('error'); }
    finally { setForgotLoad(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>

        <div style={styles.header}>
          <div style={styles.flagStrip}>
            <div style={{ flex:1, background:'#006B3F' }} />
            <div style={{ flex:1, background:'#FCD116' }} />
            <div style={{ flex:1, background:'#CE1126' }} />
          </div>
          <h1 style={styles.logo}>ACEPREP</h1>
          <p style={styles.tagline}>Ghana's Premier BECE & WASSCE Platform</p>
          <div style={styles.badge}>🎓 Student Portal</div>
          <div style={styles.divider} />
        </div>

        {!showForgot ? (
          <>
            {error && <div style={styles.error}>⚠️ {error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" style={styles.input} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <div style={styles.passWrap}>
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" style={{ ...styles.input, flex: 1 }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <p style={{ ...styles.forgotLink, color: '#006B3F' }} onClick={() => setShowForgot(true)}>
                Forgot password?
              </p>
              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p style={styles.registerLink}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#006B3F', fontWeight: 'bold' }}>Register here</Link>
            </p>
          </>
        ) : (
          <div>
            <h3 style={{ color: '#006B3F', textAlign: 'center', marginBottom: 8 }}>🔑 Reset Password</h3>
            <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              Enter your email and we'll send you a reset link
            </p>
            {forgotMsg === 'success' ? (
              <div style={styles.successBox}>✅ Reset link sent! Check your email inbox.</div>
            ) : (
              <form onSubmit={handleForgot} style={styles.form}>
                {forgotMsg === 'error' && <div style={styles.error}>⚠️ Email not found. Check and try again.</div>}
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your@email.com" style={styles.input} required />
                </div>
                <button type="submit" style={styles.btn} disabled={forgotLoad}>
                  {forgotLoad ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <p style={{ color: '#006B3F', cursor: 'pointer', textAlign: 'center', marginTop: 16, fontSize: 13 }}
              onClick={() => { setShowForgot(false); setForgotMsg(''); }}>
              ← Back to Login
            </p>
          </div>
        )}
        <p style={styles.footer}>AcePrep — Ace Your Exams. Change Your Future.</p>
      </div>
    </div>
  );
};

const styles = {
  container:   { minHeight: '100vh', background: 'linear-gradient(135deg, #003d24 0%, #006B3F 50%, #004d2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card:        { background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' },
  backBtn:     { position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#006B3F', fontSize: 14, cursor: 'pointer', fontWeight: 'bold', zIndex: 2 },
  flagStrip:   { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 16, width: '80%', margin: '0 auto 16px' },
  header:      { textAlign: 'center', marginBottom: 24 },
  logo:        { fontSize: 38, fontWeight: '900', color: '#006B3F', letterSpacing: 4, margin: '8px 0 4px' },
  tagline:     { fontSize: 11, color: '#888', marginBottom: 10 },
  badge:       { display: 'inline-block', background: '#006B3F15', color: '#006B3F', padding: '5px 16px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', border: '1px solid #006B3F33' },
  divider:     { height: 3, background: 'linear-gradient(90deg, #006B3F, #FCD116, #CE1126)', borderRadius: 2, margin: '16px auto 0', width: 80 },
  error:       { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  successBox:  { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: 16, color: '#27AE60', fontSize: 14, textAlign: 'center' },
  form:        { display: 'flex', flexDirection: 'column', gap: 16 },
  field:       { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 13, fontWeight: 'bold', color: '#444' },
  input:       { padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, outline: 'none', width: '100%' },
  passWrap:    { display: 'flex', gap: 8, alignItems: 'center' },
  eyeBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 4px' },
  forgotLink:  { fontSize: 13, cursor: 'pointer', textAlign: 'right', margin: '-8px 0 0' },
  btn:         { background: 'linear-gradient(135deg, #006B3F, #004d2e)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 4 },
  registerLink:{ textAlign: 'center', fontSize: 14, color: '#555', marginTop: 20 },
  footer:      { textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 20, fontStyle: 'italic' },
};

export default Login;