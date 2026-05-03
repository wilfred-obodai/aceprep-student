import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRegister = () => {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phone,    setPhone]    = useState('');
  const [city,     setCity]     = useState('');
  const [region,   setRegion]   = useState('');
  const [motto,    setMotto]    = useState('');
  const [address,  setAddress]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const { registerSchool } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const result = await registerSchool({ name, email, password, phone, city, region, motto, address });
    if (result.success) {
      setSuccess('School registered! Please check your email to verify your account.');
    } else {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const regions = ['Ashanti','Greater Accra','Eastern','Western','Central','Northern','Upper East','Upper West','Volta','Brong-Ahafo','Oti','Bono East','Ahafo','Savannah','North East','Western North'];

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64 }}>🏫</div>
            <h2 style={{ color: '#b8860b', marginTop: 16 }}>School Registered!</h2>
            <p style={{ color: '#555', marginTop: 12, lineHeight: 1.6 }}>{success}</p>
            <button style={styles.btn} onClick={() => navigate('/admin/login')}>Go to Login</button>
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
          <div style={styles.badge}>🏫 Register Your School</div>
          <div style={styles.divider} />
          <p style={styles.subtitle}>Join AcePrep — Ghana's #1 Exam Prep Platform</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="School Name *">
            <input style={styles.input} value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Prempeh College" required />
          </Field>

          <Field label="School Email *">
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="school@email.com" required />
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

          <Field label="Phone Number">
            <input style={styles.input} value={phone}
              onChange={e => setPhone(e.target.value)} placeholder="024XXXXXXX" />
          </Field>

          <div style={styles.row}>
            <Field label="City">
              <input style={styles.input} value={city}
                onChange={e => setCity(e.target.value)} placeholder="e.g. Kumasi" />
            </Field>
            <Field label="Region">
              <select style={styles.input} value={region} onChange={e => setRegion(e.target.value)}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          <Field label="School Motto (Optional)">
            <input style={styles.input} value={motto}
              onChange={e => setMotto(e.target.value)} placeholder="e.g. Excellence in All Things" />
          </Field>

          <Field label="School Address (Optional)">
            <input style={styles.input} value={address}
              onChange={e => setAddress(e.target.value)} placeholder="e.g. P.O. Box 1, Kumasi" />
          </Field>

          <div style={styles.privacyBox}>
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
              🔒 By registering, you agree to AcePrep's terms of service. Your school data is secure and never shared with third parties. <strong>Free until January 2027!</strong>
            </p>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Registering school...' : 'Register School — It\'s Free!'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already registered?{' '}
          <Link to="/admin/login" style={{ color: '#b8860b', fontWeight: 'bold' }}>Sign in here</Link>
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
  container:  { minHeight: '100vh', background: 'linear-gradient(135deg, #7d6000 0%, #c9a800 50%, #7d6000 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 },
  card:       { background: '#fff', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', marginTop: 20, marginBottom: 20, position: 'relative' },
  backBtn:    { position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#b8860b', fontSize: 14, cursor: 'pointer', fontWeight: 'bold' },
  flagStrip:  { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', width: '80%', margin: '0 auto 14px' },
  header:     { textAlign: 'center', marginBottom: 20 },
  logo:       { fontSize: 36, fontWeight: '900', color: '#b8860b', letterSpacing: 4, margin: '8px 0 8px' },
  badge:      { display: 'inline-block', background: '#FCD11615', color: '#b8860b', padding: '5px 16px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', border: '1px solid #FCD11633' },
  divider:    { height: 3, background: 'linear-gradient(90deg, #006B3F, #FCD116, #CE1126)', borderRadius: 2, margin: '12px auto 8px', width: 80 },
  subtitle:   { fontSize: 13, color: '#888', margin: 0 },
  error:      { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  row:        { display: 'flex', gap: 12 },
  input:      { padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, width: '100%' },
  passWrap:   { display: 'flex', gap: 8, alignItems: 'center' },
  eyeBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 },
  privacyBox: { background: '#FCD11610', border: '1px solid #FCD11640', borderRadius: 8, padding: '12px 14px' },
  btn:        { background: 'linear-gradient(135deg, #c9a800, #7d6000)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 'bold', marginTop: 4, cursor: 'pointer', width: '100%' },
  loginLink:  { textAlign: 'center', fontSize: 14, color: '#555', marginTop: 16 },
};

export default AdminRegister;