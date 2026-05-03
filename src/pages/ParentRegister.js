import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ParentRegister = () => {
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [phone,      setPhone]      = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [loading,    setLoading]    = useState(false);

  const { registerParent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const result = await registerParent({ fullName, email, password, phone, schoolCode });
    if (result.success) {
      setSuccess('Account created successfully! You can now login.');
    } else {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64 }}>👨‍👩‍👧</div>
            <h2 style={{ color: '#CE1126', marginTop: 16 }}>Account Created!</h2>
            <p style={{ color: '#555', marginTop: 12, lineHeight: 1.6 }}>{success}</p>
            <button style={styles.btn} onClick={() => navigate('/parent/login')}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

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
          <div style={styles.badge}>👨‍👩‍👧 Parent Registration</div>
          <div style={styles.divider} />
          <p style={styles.subtitle}>Stay connected to your child's education</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Full Name *">
            <input style={styles.input} value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Kofi Mensah" required />
          </Field>

          <Field label="Email Address *">
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="parent@email.com" required />
          </Field>

          <Field label="Password *">
            <div style={styles.passWrap}>
              <input style={{ ...styles.input, flex: 1 }}
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters" required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </Field>

          <Field label="Phone Number (Optional)">
            <input style={styles.input} value={phone}
              onChange={e => setPhone(e.target.value)} placeholder="024XXXXXXX" />
          </Field>

          <Field label="School Code (Optional)">
            <input style={styles.input} value={schoolCode}
              onChange={e => setSchoolCode(e.target.value.toUpperCase())}
              placeholder="e.g. ACP-38741" />
            <p style={{ color: '#888', fontSize: 11, marginTop: 4 }}>
              Enter your child's school code to link your account
            </p>
          </Field>

          <div style={styles.infoBox}>
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
              📱 As a parent you can monitor your child's grades, attendance, streaks and receive performance alerts.
            </p>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Parent Account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/parent/login" style={{ color: '#CE1126', fontWeight: 'bold' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 'bold', color: '#444' }}>{label}</label>
    {children}
  </div>
);

const styles = {
  container:  { minHeight: '100vh', background: 'linear-gradient(135deg, #7a0015 0%, #CE1126 50%, #7a0015 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 },
  card:       { background: '#fff', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', marginTop: 20, marginBottom: 20, position: 'relative' },
  backBtn:    { position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#CE1126', fontSize: 14, cursor: 'pointer', fontWeight: 'bold' },
  flagStrip:  { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', width: '80%', margin: '0 auto 14px' },
  header:     { textAlign: 'center', marginBottom: 20 },
  logo:       { fontSize: 36, fontWeight: '900', color: '#CE1126', letterSpacing: 4, margin: '8px 0 8px' },
  badge:      { display: 'inline-block', background: '#CE112615', color: '#CE1126', padding: '5px 16px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', border: '1px solid #CE112633' },
  divider:    { height: 3, background: 'linear-gradient(90deg, #006B3F, #FCD116, #CE1126)', borderRadius: 2, margin: '12px auto 8px', width: 80 },
  subtitle:   { fontSize: 13, color: '#888', margin: 0 },
  error:      { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  input:      { padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, width: '100%' },
  passWrap:   { display: 'flex', gap: 8, alignItems: 'center' },
  eyeBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 },
  infoBox:    { background: '#CE112610', border: '1px solid #CE112630', borderRadius: 8, padding: '12px 14px' },
  btn:        { background: 'linear-gradient(135deg, #CE1126, #7a0015)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 'bold', marginTop: 4, cursor: 'pointer', width: '100%' },
  loginLink:  { textAlign: 'center', fontSize: 14, color: '#555', marginTop: 16 },
};

export default ParentRegister;