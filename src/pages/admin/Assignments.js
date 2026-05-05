import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { createAssignment, getSchoolAssignments } from '../../services/api';

const subjectConfig = {
  'Mathematics':        { icon: '📐', color: '#2E86AB' },
  'English Language':   { icon: '✍️', color: '#8E44AD' },
  'Integrated Science': { icon: '🔬', color: '#27AE60' },
  'Social Studies':     { icon: '🌍', color: '#F39C12' },
  'ICT':                { icon: '💻', color: '#2980B9' },
  'Physics':            { icon: '⚡', color: '#E67E22' },
  'Chemistry':          { icon: '⚗️', color: '#E74C3C' },
  'Biology':            { icon: '🧬', color: '#1E8449' },
  'Economics':          { icon: '📈', color: '#1A5276' },
};

const subjects = Object.keys(subjectConfig);

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [tab,         setTab]         = useState('active');
  const navigate = useNavigate();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [subject,     setSubject]     = useState('Mathematics');
  const [level,       setLevel]       = useState('JHS');
  const [yearGroup,   setYearGroup]   = useState('2');
  const [className,   setClassName]   = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [totalMarks,  setTotalMarks]  = useState(100);

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const res = await getSchoolAssignments();
      if (res.data.success) setAssignments(res.data.assignments || []);
    } catch (e) { console.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description) { setError('Title and description are required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await createAssignment({
        title, description, subject,
        level, yearGroup: parseInt(yearGroup),
        className:  className  || undefined,
        dueDate:    dueDate    || undefined,
        totalMarks: parseInt(totalMarks),
      });
      if (res.data.success) {
        setSuccess('✅ Assignment created successfully!');
        setTitle(''); setDescription(''); setClassName(''); setDueDate(''); setTotalMarks(100);
        setShowForm(false);
        fetchAssignments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create assignment');
    } finally { setSaving(false); }
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const activeAssignments  = assignments.filter(a => !isOverdue(a.dueDate));
  const overdueAssignments = assignments.filter(a => isOverdue(a.dueDate));
  const displayList        = tab === 'active' ? activeAssignments : overdueAssignments;

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📋 Assignments</h1>
            <p style={styles.subtitle}>Create and manage student assignments</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Create Assignment'}
          </button>
        </div>

        {success && <div style={styles.successBanner}>{success}</div>}

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>📚 New Assignment</h2>
            {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            <form onSubmit={handleCreate} style={styles.form}>
              <Field label="Assignment Title *">
                <input style={styles.input} value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 Exercise Questions" required />
              </Field>
              <Field label="Description / Instructions *">
                <textarea style={{ ...styles.input, height: 120, resize: 'vertical' }}
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the assignment in detail..." required />
              </Field>
              <div style={styles.row}>
                <Field label="Subject *">
                  <select style={styles.input} value={subject} onChange={e => setSubject(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Total Marks">
                  <input style={styles.input} type="number" min="1"
                    value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
                </Field>
              </div>
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
                <Field label="Class (Optional)">
                  <input style={styles.input} value={className}
                    onChange={e => setClassName(e.target.value)} placeholder="e.g. 2A" />
                </Field>
              </div>
              <Field label="Due Date (Optional)">
                <input style={styles.input} type="datetime-local"
                  value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </Field>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Creating...' : '✅ Create Assignment'}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div style={styles.statsRow}>
            <StatBox label="Total"    value={assignments.length}                                                     color="#2E86AB" />
            <StatBox label="Active"   value={activeAssignments.length}                                               color="#006B3F" />
            <StatBox label="Overdue"  value={overdueAssignments.length}                                              color="#CE1126" />
            <StatBox label="Submissions" value={assignments.reduce((s, a) => s + (a.submissionCount || 0), 0)}      color="#F39C12" />
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'active'  ? styles.tabActive : {}) }} onClick={() => setTab('active')}>
            📋 Active ({activeAssignments.length})
          </button>
          <button style={{ ...styles.tab, ...(tab === 'history' ? styles.tabActive : {}) }} onClick={() => setTab('history')}>
            📁 History / Overdue ({overdueAssignments.length})
          </button>
        </div>

        {/* Assignments List */}
        {loading ? (
          <p style={styles.center}>Loading assignments...</p>
        ) : displayList.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>{tab === 'active' ? '📋' : '📁'}</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>
              {tab === 'active' ? 'No active assignments' : 'No overdue assignments'}
            </h3>
            <p style={{ color: '#888' }}>
              {tab === 'active' ? 'Create your first assignment above' : 'Overdue assignments will appear here'}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {displayList.map(a => {
              const cfg     = subjectConfig[a.subject] || { icon: '📚', color: '#333' };
              const overdue = isOverdue(a.dueDate);
              return (
                <div key={a.id} style={{ ...styles.assignmentCard, borderTop: `4px solid ${overdue ? '#CE1126' : cfg.color}` }}>
                  <div style={styles.cardTop}>
                    <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ ...styles.cardSubject, color: overdue ? '#CE1126' : cfg.color }}>
                        {a.subject} {overdue && '• OVERDUE'}
                      </p>
                      <p style={styles.cardTitle}>{a.title}</p>
                    </div>
                  </div>
                  <p style={styles.cardDesc}>{a.description?.substring(0, 100)}{a.description?.length > 100 ? '...' : ''}</p>
                  <div style={styles.cardMeta}>
                    <span style={styles.metaChip}>🎓 {a.level} Year {a.yearGroup}</span>
                    <span style={styles.metaChip}>🎯 {a.totalMarks} marks</span>
                    <span style={{ ...styles.metaChip, background: '#EAFAF1', color: '#006B3F' }}>
                      📤 {a.submissionCount || 0} submissions
                    </span>
                    {a.dueDate && (
                      <span style={{ ...styles.metaChip, background: overdue ? '#FDEDEC' : '#EAF4FB', color: overdue ? '#CE1126' : '#2E86AB' }}>
                        📅 {overdue ? 'Was due: ' : 'Due: '}{new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button style={styles.viewBtn}
                    onClick={() => navigate(`/admin/assignments/${a.id}/submissions`)}>
                    👁️ View Submissions ({a.submissionCount || 0})
                  </button>
                </div>
              );
            })}
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

const StatBox = ({ label, value, color }) => (
  <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: 28, fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{label}</p>
  </div>
);

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 240, flex: 1 },
  header:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:          { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  createBtn:      { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  successBanner:  { background: '#EAFAF1', border: '1px solid #006B3F', color: '#006B3F', padding: '12px 24px', fontSize: 14, fontWeight: 'bold' },
  formCard:       { background: '#fff', borderRadius: 0, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:      { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  errorBox:       { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: 12, marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  form:           { display: 'flex', flexDirection: 'column', gap: 16 },
  row:            { display: 'flex', gap: 16 },
  input:          { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:      { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  statsRow:       { display: 'flex', gap: 16, padding: '20px 24px 0' },
  tabs:           { display: 'flex', background: '#fff', borderBottom: '2px solid #eee', margin: '20px 0 0' },
  tab:            { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:      { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  center:         { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:     { textAlign: 'center', padding: '60px 20px', background: '#fff' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, padding: 24 },
  assignmentCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:        { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  cardSubject:    { fontSize: 11, fontWeight: 'bold', margin: 0, textTransform: 'uppercase' },
  cardTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '3px 0 0' },
  cardDesc:       { fontSize: 13, color: '#666', margin: '0 0 12px', lineHeight: 1.5 },
  cardMeta:       { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  metaChip:       { background: '#EAF4FB', color: '#2E86AB', fontSize: 11, padding: '3px 8px', borderRadius: 4 },
  viewBtn:        { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1A5276, #2E86AB)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
};

export default AdminAssignments;