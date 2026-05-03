import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getTeachers, addTeacher } from '../../services/api';

const Teachers = () => {
  const [teachers,  setTeachers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [subjects,  setSubjects]  = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [saving,    setSaving]    = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await getTeachers();
      if (res.data.success) setTeachers(res.data.teachers);
    } catch (e) {
      console.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await addTeacher({
        fullName,
        email,
        password,
        phone,
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
      });
      if (res.data.success) {
        setSuccess(`Teacher ${fullName} added successfully!`);
        setFullName(''); setEmail(''); setPassword('');
        setPhone(''); setSubjects('');
        setShowForm(false);
        fetchTeachers();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add teacher');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Teachers</h1>
            <p style={styles.subtitle}>Manage teacher accounts for your school</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Teacher'}
          </button>
        </div>

        {/* Add Teacher Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Add New Teacher</h2>
            {error   && <div style={styles.error}>⚠️ {error}</div>}
            {success && <div style={styles.successBox}>✅ {success}</div>}
            <form onSubmit={handleAddTeacher} style={styles.form}>
              <div style={styles.row}>
                <Field label="Full Name *">
                  <input style={styles.input} value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Mr. Kofi Mensah" required />
                </Field>
                <Field label="Email Address *">
                  <input style={styles.input} type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="teacher@school.com" required />
                </Field>
              </div>
              <div style={styles.row}>
                <Field label="Password *">
                  <input style={styles.input} type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters" required />
                </Field>
                <Field label="Phone Number">
                  <input style={styles.input} value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0244123456" />
                </Field>
              </div>
              <Field label="Subjects (comma separated)">
                <input style={styles.input} value={subjects}
                  onChange={e => setSubjects(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, Chemistry" />
              </Field>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Adding Teacher...' : '✅ Add Teacher'}
              </button>
            </form>
          </div>
        )}

        {/* Teachers List */}
        {loading ? (
          <p style={styles.center}>Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>👨‍🏫</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No teachers yet</h3>
            <p style={{ color: '#888' }}>Add teachers so they can create exams and assignments</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {teachers.map(t => (
              <div key={t.id} style={styles.teacherCard}>
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {t.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.teacherInfo}>
                    <p style={styles.teacherName}>{t.fullName}</p>
                    <p style={styles.teacherEmail}>{t.email}</p>
                  </div>
                  <span style={{
                    ...styles.roleBadge,
                    background: t.role === 'admin' ? '#EAF4FB' : '#EAFAF1',
                    color:      t.role === 'admin' ? '#2E86AB' : '#27AE60',
                  }}>
                    {t.role === 'admin' ? '👑 Admin' : '👨‍🏫 Teacher'}
                  </span>
                </div>
                {t.subjects?.length > 0 && (
                  <div style={styles.subjects}>
                    {t.subjects.map(s => (
                      <span key={s} style={styles.subjectTag}>{s}</span>
                    ))}
                  </div>
                )}
                {t.phone && (
                  <p style={styles.phone}>📞 {t.phone}</p>
                )}
                <p style={styles.joined}>
                  Joined: {new Date(t.joinedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
    <label style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>{label}</label>
    {children}
  </div>
);

const styles = {
  layout:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:       { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:    { fontSize: 14, color: '#888', marginTop: 4 },
  addBtn:      { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  formCard:    { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  error:       { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px', marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  successBox:  { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: '12px', marginBottom: 12, color: '#27AE60', fontSize: 14 },
  form:        { display: 'flex', flexDirection: 'column', gap: 14 },
  row:         { display: 'flex', gap: 16 },
  input:       { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:   { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  center:      { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:  { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  teacherCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:      { width: 48, height: 48, borderRadius: 24, background: '#2E86AB', color: '#fff', fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  teacherEmail:{ fontSize: 13, color: '#888', margin: '2px 0 0' },
  roleBadge:   { fontSize: 12, fontWeight: 'bold', padding: '4px 10px', borderRadius: 6, flexShrink: 0 },
  subjects:    { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  subjectTag:  { background: '#EAF4FB', color: '#2E86AB', fontSize: 11, padding: '3px 8px', borderRadius: 4 },
  phone:       { fontSize: 13, color: '#555', margin: '4px 0' },
  joined:      { fontSize: 12, color: '#aaa', margin: '4px 0 0' },
};

export default Teachers;