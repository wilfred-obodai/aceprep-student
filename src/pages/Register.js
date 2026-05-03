import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent, validateCode } from '../services/api';

const Register = () => {
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [level,      setLevel]      = useState('JHS');
  const [yearGroup,  setYearGroup]  = useState('3');
  const [className,  setClassName]  = useState('');
  const [shsTrack,   setShsTrack]   = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [codeValid,  setCodeValid]  = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const navigate = useNavigate();

  const checkSchoolCode = async () => {
    if (!schoolCode) return;
    try {
      const res = await validateCode(schoolCode.toUpperCase());
      if (res.data.success) {
        setSchoolName(res.data.school.name);
        setCodeValid(true);
        setError('');
      }
    } catch {
      setError('School code not found. Leave blank to register as independent learner.');
      setCodeValid(false);
      setSchoolName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await registerStudent({
        fullName, email, password, level,
        yearGroup:  parseInt(yearGroup),
        className:  className  || undefined,
        shsTrack:   shsTrack   || undefined,
        schoolCode: schoolCode || undefined,
      });
      if (res.data.success) setSuccess('Account created! Please check your email to verify your account before logging in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64 }}>✅</div>
            <h2 style={{ color: '#006B3F', marginTop: 16 }}>Account Created!</h2>
            <p style={{ color: '#555', marginTop: 12, lineHeight: 1.6 }}>{success}</p>
            <button style={styles.btn} onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Back */}
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.flagStrip}>
            <div style={{ flex:1, background:'#006B3F' }} />
            <div style={{ flex:1, background:'#FCD116' }} />
            <div style={{ flex:1, background:'#CE1126' }} />
          </div>
          <h1 style={styles.logo}>ACEPREP</h1>
          <div style={styles.badge}>🎓 Student Registration</div>
          <div style={styles.divider} />
          <p style={styles.subtitle}>Join thousands of Ghanaian students</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Full Name">
            <input style={styles.input} value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Kwame Mensah" required />
          </Field>

          <Field label="Email Address">
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required />
          </Field>

          <Field label="Password">
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

          <div style={styles.row}>
            <Field label="Level">
              <select style={styles.input} value={level} onChange={e => setLevel(e.target.value)}>
                <option value="JHS">JHS</option>
                <option value="SHS">SHS</option>
              </select>
            </Field>
            <Field label="Year Group">
              <select style={styles.input} value={yearGroup} onChange={e => setYearGroup(e.target.value)}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
              </select>
            </Field>
          </div>

          <Field label="Class (Optional)">
            <input style={styles.input} value={className}
              onChange={e => setClassName(e.target.value)} placeholder="e.g. 3A" />
          </Field>

          {level === 'SHS' && (
            <Field label="SHS Track">
              <select style={styles.input} value={shsTrack} onChange={e => setShsTrack(e.target.value)}>
                <option value="">Select Track</option>
                <option value="General Science">General Science</option>
                <option value="General Arts">General Arts</option>
                <option value="Business">Business</option>
                <option value="Technical">Technical</option>
                <option value="Home Economics">Home Economics</option>
                <option value="Visual Arts">Visual Arts</option>
              </select>
            </Field>
          )}

          <Field label="School Code (Optional)">
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...styles.input, flex: 1 }} value={schoolCode}
                onChange={e => { setSchoolCode(e.target.value.toUpperCase()); setCodeValid(false); setSchoolName(''); }}
                placeholder="e.g. ACP-38741" />
              <button type="button" style={styles.checkBtn} onClick={checkSchoolCode}>Check</button>
            </div>
            {codeValid && <p style={{ color: '#006B3F', fontSize: 12, marginTop: 4 }}>✅ Linked to: {schoolName}</p>}
            <p style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Ask your teacher for your school's AcePrep code</p>
          </Field>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#006B3F', fontWeight: 'bold' }}>Sign in</Link>
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
  container:  { minHeight: '100vh', background: 'linear-gradient(135deg, #003d24 0%, #006B3F 50%, #004d2e 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 },
  card:       { background: '#fff', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', marginTop: 20, marginBottom: 20, position: 'relative' },
  backBtn:    { position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#006B3F', fontSize: 14, cursor: 'pointer', fontWeight: 'bold' },
  flagStrip:  { display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', width: '80%', margin: '0 auto 14px' },
  header:     { textAlign: 'center', marginBottom: 20 },
  logo:       { fontSize: 36, fontWeight: '900', color: '#006B3F', letterSpacing: 4, margin: '8px 0 8px' },
  badge:      { display: 'inline-block', background: '#006B3F15', color: '#006B3F', padding: '5px 16px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', border: '1px solid #006B3F33' },
  divider:    { height: 3, background: 'linear-gradient(90deg, #006B3F, #FCD116, #CE1126)', borderRadius: 2, margin: '12px auto 8px', width: 80 },
  subtitle:   { fontSize: 13, color: '#888', margin: 0 },
  error:      { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  row:        { display: 'flex', gap: 12 },
  input:      { padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, width: '100%' },
  passWrap:   { display: 'flex', gap: 8, alignItems: 'center' },
  eyeBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 },
  checkBtn:   { background: '#006B3F', color: '#fff', borderRadius: 8, padding: '0 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' },
  btn:        { background: 'linear-gradient(135deg, #006B3F, #004d2e)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 16, fontWeight: 'bold', marginTop: 8, cursor: 'pointer', width: '100%' },
  loginLink:  { textAlign: 'center', fontSize: 14, color: '#555', marginTop: 16 },
};

export default Register;