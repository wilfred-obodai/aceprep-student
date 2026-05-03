import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { createAnnouncement, getSchoolAnnouncements, deleteAnnouncement } from '../../services/api';

const priorityConfig = {
  urgent: { bg: '#FDEDEC', color: '#E74C3C', label: '🚨 Urgent' },
  high:   { bg: '#FEF9E7', color: '#F39C12', label: '⚠️ High'   },
  normal: { bg: '#EAF4FB', color: '#2E86AB', label: '📢 Normal' },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [level,     setLevel]     = useState('');
  const [yearGroup, setYearGroup] = useState('');
  const [className, setClassName] = useState('');
  const [priority,  setPriority]  = useState('normal');

  const fetchAnnouncements = async () => {
    try {
      const res = await getSchoolAnnouncements();
      if (res.data.success) setAnnouncements(res.data.announcements);
    } catch (e) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await createAnnouncement({
        title, content, priority,
        level:     level     || undefined,
        yearGroup: yearGroup ? parseInt(yearGroup) : undefined,
        className: className || undefined,
      });
      if (res.data.success) {
        setSuccess('Announcement posted!');
        setTitle(''); setContent(''); setLevel('');
        setYearGroup(''); setClassName(''); setPriority('normal');
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📢 Announcements</h1>
            <p style={styles.subtitle}>Post announcements to your students</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Announcement'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>📢 New Announcement</h2>
            {error   && <div style={styles.errorBox}>⚠️ {error}</div>}
            {success && <div style={styles.successBox}>✅ {success}</div>}
            <form onSubmit={handleCreate} style={styles.form}>
              <Field label="Title *">
                <input style={styles.input} value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Important Exam Notice" required />
              </Field>
              <Field label="Content *">
                <textarea
                  style={{ ...styles.input, height: 120, resize: 'vertical' }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your announcement here..."
                  required
                />
              </Field>
              <div style={styles.row}>
                <Field label="Priority">
                  <select style={styles.input} value={priority}
                    onChange={e => setPriority(e.target.value)}>
                    <option value="normal">📢 Normal</option>
                    <option value="high">⚠️ High</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                </Field>
                <Field label="Level (Optional)">
                  <select style={styles.input} value={level}
                    onChange={e => setLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </Field>
                <Field label="Year Group (Optional)">
                  <select style={styles.input} value={yearGroup}
                    onChange={e => setYearGroup(e.target.value)}>
                    <option value="">All Years</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </Field>
                <Field label="Class (Optional)">
                  <input style={styles.input} value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="e.g. 2A" />
                </Field>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Posting...' : '📢 Post Announcement'}
              </button>
            </form>
          </div>
        )}

        {/* Announcements List */}
        {loading ? (
          <p style={styles.center}>Loading...</p>
        ) : announcements.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>📢</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No announcements yet</h3>
            <p style={{ color: '#888' }}>Post your first announcement to students</p>
          </div>
        ) : (
          <div style={styles.list}>
            {announcements.map(a => {
              const pc = priorityConfig[a.priority] || priorityConfig.normal;
              return (
                <div key={a.id} style={styles.announcementCard}>
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.priorityBadge, background: pc.bg, color: pc.color }}>
                      {pc.label}
                    </span>
                    <div style={styles.cardMeta}>
                      <span style={styles.metaText}>
                        By {a.teacherName} • {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      {(a.level || a.yearGroup) && (
                        <span style={styles.audienceBadge}>
                          🎓 {a.level || 'All'} {a.yearGroup ? `Year ${a.yearGroup}` : ''} {a.className || ''}
                        </span>
                      )}
                    </div>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(a.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <h3 style={styles.announcementTitle}>{a.title}</h3>
                  <p style={styles.announcementContent}>{a.content}</p>
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

const styles = {
  layout:              { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:                { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:              { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:               { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:            { fontSize: 14, color: '#888', marginTop: 4 },
  createBtn:           { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  formCard:            { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:           { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  errorBox:            { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: 12, marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  successBox:          { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: 12, marginBottom: 12, color: '#27AE60', fontSize: 14 },
  form:                { display: 'flex', flexDirection: 'column', gap: 16 },
  row:                 { display: 'flex', gap: 12 },
  input:               { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:           { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  center:              { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:          { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  list:                { display: 'flex', flexDirection: 'column', gap: 16 },
  announcementCard:    { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:             { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  priorityBadge:       { padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  cardMeta:            { flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaText:            { fontSize: 12, color: '#888' },
  audienceBadge:       { fontSize: 12, color: '#8E44AD', background: '#F5EEF8', padding: '2px 8px', borderRadius: 4 },
  deleteBtn:           { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#E74C3C' },
  announcementTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  announcementContent: { fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 },
};

export default Announcements;