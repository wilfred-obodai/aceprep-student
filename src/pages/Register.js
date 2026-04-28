import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent, validateCode } from '../services/api';

const Register = () => {
  const [step,       setStep]       = useState(1);
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
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
    } catch (err) {
      setError('School code not found. Leave blank to register as independent learner.');
      setCodeValid(false);
      setSchoolName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerStudent({
        fullName,
        email,
        password,
        level,
        yearGroup: parseInt(yearGroup),
        className:  className  || undefined,
        shsTrack:   shsTrack   || undefined,
        schoolCode: schoolCode || undefined,
      });
      if (res.data.success) {
        setSuccess('Account created! Please check your email to verify your account before logging in.');
      }
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
            <h2 style={{ color: '#27AE60', marginTop: 16 }}>Account Created!</h2>
            <p style={{ color: '#555', marginTop: 12, lineHeight: 1.6 }}>{success}</p>
            <button
              style={{ ...styles.btn, marginTop: 24 }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>ACEPREP</h1>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join thousands of Ghanaian students</p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <Field label="Full Name">
            <input
              style={styles.input}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Kwame Mensah"
              required
            />
          </Field>

          {/* Email */}
          <Field label="Email Address">
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </Field>

          {/* Password */}
          <Field label="Password">
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </Field>

          {/* Level */}
          <Field label="Level">
            <select
              style={styles.input}
              value={level}
              onChange={e => setLevel(e.target.value)}
            >
              <option value="JHS">JHS</option>
              <option value="SHS">SHS</option>
            </select>
          </Field>

          {/* Year Group */}
          <Field label="Year Group">
            <select
              style={styles.input}
              value={yearGroup}
              onChange={e => setYearGroup(e.target.value)}
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
            </select>
          </Field>

          {/* Class */}
          <Field label="Class (Optional)">
            <input
              style={styles.input}
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="e.g. 3A"
            />
          </Field>

          {/* SHS Track */}
          {level === 'SHS' && (
            <Field label="SHS Track">
              <select
                style={styles.input}
                value={shsTrack}
                onChange={e => setShsTrack(e.target.value)}
              >
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

          {/* School Code */}
          <Field label="School Code (Optional)">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1 }}
                value={schoolCode}
                onChange={e => {
                  setSchoolCode(e.target.value.toUpperCase());
                  setCodeValid(false);
                  setSchoolName('');
                }}
                placeholder="e.g. ACP-38741"
              />
              <button
                type="button"
                style={styles.checkBtn}
                onClick={checkSchoolCode}
              >
                Check
              </button>
            </div>
            {codeValid && (
              <p style={{ color: '#27AE60', fontSize: 12, marginTop: 4 }}>
                ✅ Linked to: {schoolName}
              </p>
            )}
            <p style={{ color: '#888', fontSize: 11, marginTop: 4 }}>
              Ask your teacher for your school's AcePrep code
            </p>
          </Field>

          <button
            type="submit"
            style={styles.btn}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2E86AB', fontWeight: 'bold' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

// Reusable Field component
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>
      {label}
    </label>
    {children}
  </div>
);

const styles = {
  container: {
    minHeight:      '100vh',
    background:     'linear-gradient(135deg, #1A5276 0%, #2E86AB 100%)',
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'center',
    padding:        20,
  },
  card: {
    background:   '#ffffff',
    borderRadius: 16,
    padding:      '28px 24px',
    width:        '100%',
    maxWidth:     440,
    boxShadow:    '0 20px 60px rgba(0,0,0,0.2)',
    marginTop:    20,
    marginBottom: 20,
  },
  header: {
    textAlign:    'center',
    marginBottom: 20,
  },
  logo: {
    fontSize:      32,
    fontWeight:    'bold',
    color:         '#2E86AB',
    letterSpacing: 3,
    margin:        0,
  },
  title: {
    fontSize: 20,
    color:    '#1A5276',
    margin:   '8px 0 4px',
  },
  subtitle: {
    fontSize: 13,
    color:    '#888',
    margin:   0,
  },
  error: {
    background:   '#FDEDEC',
    border:       '1px solid #E74C3C',
    borderRadius: 8,
    padding:      '12px 16px',
    marginBottom: 16,
    color:        '#E74C3C',
    fontSize:     14,
  },
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           14,
  },
  input: {
    padding:      '11px 14px',
    border:       '1px solid #ddd',
    borderRadius: 8,
    fontSize:     15,
    width:        '100%',
  },
  checkBtn: {
    background:   '#2E86AB',
    color:        '#fff',
    borderRadius: 8,
    padding:      '0 16px',
    fontSize:     14,
    fontWeight:   'bold',
    cursor:       'pointer',
    whiteSpace:   'nowrap',
  },
  btn: {
    background:   'linear-gradient(135deg, #2E86AB, #1A5276)',
    color:        '#ffffff',
    borderRadius: 8,
    padding:      '14px',
    fontSize:     16,
    fontWeight:   'bold',
    marginTop:    8,
    cursor:       'pointer',
    width:        '100%',
  },
  loginLink: {
    textAlign: 'center',
    fontSize:  14,
    color:     '#555',
    marginTop: 16,
  },
};

export default Register;