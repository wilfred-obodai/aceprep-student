import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

const ResetPassword = () => {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState('');
  const [success,   setSuccess]   = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const role  = searchParams.get('role') || 'student';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMsg('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      await API.post('/auth/reset-password', { token, password, role });
      setSuccess(true);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const getColor = () => {
    if (role === 'admin')  return '#1A5276';
    if (role === 'parent') return '#27AE60';
    return '#2E86AB';
  };

  const getLoginPath = () => {
    if (role === 'admin')  return '/admin/login';
    if (role === 'parent') return '/parent/login';
    return '/login';
  };

  return (
    <div style={{ ...styles.container, background: `linear-gradient(135deg, #0a1628, ${getColor()})` }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={{ ...styles.logo, color: getColor() }}>ACEPREP</h1>
          <div style={{ ...styles.divider, background: `linear-gradient(90deg, ${getColor()}, #F39C12)` }} />
          <h2 style={styles.title}>🔑 Reset Password</h2>
        </div>

        {success ? (
          <div style={styles.successBox}>
            <p style={{ fontSize: 40, margin: 0 }}>✅</p>
            <h3 style={{ color: '#27AE60', margin: '12px 0 8px' }}>Password Reset!</h3>
            <p style={{ color: '#555', fontSize: 14, margin: '0 0 20px' }}>
              Your password has been reset successfully.
            </p>
            <button
              onClick={() => navigate(getLoginPath())}
              style={{ ...styles.btn, background: getColor() }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {msg && <div style={styles.error}>⚠️ {msg}</div>}

            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.btn, background: getColor() }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p
              style={styles.backLink}
              onClick={() => navigate(getLoginPath())}
            >
              ← Back to Login
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card:       { background: '#fff', borderRadius: 16, padding: '36px 28px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  header:     { textAlign: 'center', marginBottom: 24 },
  logo:       { fontSize: 32, fontWeight: 'bold', letterSpacing: 3, margin: 0 },
  divider:    { height: 3, borderRadius: 2, margin: '12px auto', width: 60 },
  title:      { fontSize: 22, color: '#1A5276', margin: '8px 0 0' },
  successBox: { textAlign: 'center', padding: '20px 0' },
  error:      { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 16 },
  field:      { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 'bold', color: '#555' },
  input:      { padding: '12px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 },
  btn:        { color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 4 },
  backLink:   { textAlign: 'center', fontSize: 13, color: '#2E86AB', cursor: 'pointer', marginTop: 8 },
};

export default ResetPassword;