import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

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

const getFileIcon = (fileType) => {
  if (!fileType) return '📄';
  if (fileType.includes('pdf'))         return '📕';
  if (fileType.includes('word'))        return '📘';
  if (fileType.includes('image'))       return '🖼️';
  if (fileType.includes('presentation'))return '📊';
  return '📄';
};

const StudyMaterials = () => {
  const { token }      = useAuth();
  const [materials,    setMaterials]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [filter,       setFilter]       = useState('All');

  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [subject,      setSubject]      = useState('Mathematics');
  const [level,        setLevel]        = useState('SHS');
  const [yearGroup,    setYearGroup]    = useState('2');
  const [content,      setContent]      = useState('');
  const [file,         setFile]         = useState(null);
  const fileRef = useRef();

  const fetchMaterials = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/upload/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMaterials(data.materials);
    } catch (e) {
      console.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !subject) { setError('Title and subject required'); return; }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title',       title);
      formData.append('description', description);
      formData.append('subject',     subject);
      formData.append('level',       level);
      formData.append('yearGroup',   yearGroup);
      formData.append('content',     content);
      if (file) formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/upload/material', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Material uploaded successfully!');
        setTitle(''); setDescription(''); setContent('');
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        setShowForm(false);
        fetchMaterials();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError('Upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await fetch(`http://localhost:5000/api/upload/materials/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const allSubjects = ['All', ...new Set(materials.map(m => m.subject))];
  const filtered    = filter === 'All'
    ? materials
    : materials.filter(m => m.subject === filter);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📚 Study Materials</h1>
            <p style={styles.subtitle}>Upload resources for your students</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Upload Material'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Upload Study Material</h2>
            {error   && <div style={styles.errorBox}>⚠️ {error}</div>}
            {success && <div style={styles.successBox}>✅ {success}</div>}
            <form onSubmit={handleUpload} style={styles.form}>
              <div style={styles.row}>
                <Field label="Title *">
                  <input style={styles.input} value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 Notes" required />
                </Field>
                <Field label="Subject *">
                  <select style={styles.input} value={subject}
                    onChange={e => setSubject(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div style={styles.row}>
                <Field label="Level">
                  <select style={styles.input} value={level}
                    onChange={e => setLevel(e.target.value)}>
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </Field>
                <Field label="Year Group">
                  <select style={styles.input} value={yearGroup}
                    onChange={e => setYearGroup(e.target.value)}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <input style={styles.input} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the material" />
              </Field>
              <Field label="Text Content (Optional)">
                <textarea
                  style={{ ...styles.input, height: 100, resize: 'vertical' }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste text content here (notes, summaries, etc.)"
                />
              </Field>
              <Field label="Upload File (PDF, Word, Image, PPT — max 20MB)">
                <input
                  ref={fileRef}
                  style={styles.input}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx"
                  onChange={e => setFile(e.target.files[0])}
                />
              </Field>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Uploading...' : '📤 Upload Material'}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        {!loading && materials.length > 0 && (
          <div style={styles.statsRow}>
            <StatBox label="Total Materials" value={materials.length}                                       color="#2E86AB" />
            <StatBox label="Subjects"        value={new Set(materials.map(m => m.subject)).size}            color="#27AE60" />
            <StatBox label="With Files"      value={materials.filter(m => m.fileUrl).length}               color="#F39C12" />
            <StatBox label="Text Only"       value={materials.filter(m => !m.fileUrl && m.content).length} color="#8E44AD" />
          </div>
        )}

        {/* Filter */}
        <div style={styles.filterRow}>
          {allSubjects.map(s => (
            <button
              key={s}
              style={{
                ...styles.filterBtn,
                background: filter === s ? '#2E86AB' : '#fff',
                color:      filter === s ? '#fff' : '#555',
              }}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        {loading ? (
          <p style={styles.center}>Loading materials...</p>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>📚</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No materials yet</h3>
            <p style={{ color: '#888' }}>Upload your first study material for students</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(m => {
              const cfg = subjectConfig[m.subject] || { icon: '📄', color: '#333' };
              return (
                <div key={m.id} style={styles.materialCard}>
                  <div style={styles.cardTop}>
                    <span style={{ fontSize: 24 }}>{getFileIcon(m.fileType)}</span>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(m.id)}
                    >🗑️</button>
                  </div>
                  <p style={{ ...styles.cardSubject, color: cfg.color }}>
                    {cfg.icon} {m.subject}
                  </p>
                  <p style={styles.cardTitle}>{m.title}</p>
                  {m.description && (
                    <p style={styles.cardDesc}>
                      {m.description.substring(0, 80)}
                      {m.description.length > 80 ? '...' : ''}
                    </p>
                  )}
                  <div style={styles.cardMeta}>
                    <span style={styles.metaChip}>
                      🎓 {m.level} Year {m.yearGroup}
                    </span>
                    <span style={styles.metaChip}>
                      👨‍🏫 {m.teacherName}
                    </span>
                  </div>
                  {m.fileUrl && (
                    
                    <a href={`http://localhost:5000${m.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.downloadbtn}
                    >
                      ⬇️ Download File
                    </a>
                  )}
                  {m.content && !m.fileUrl && (
                    <p style={styles.textOnlyBadge}>📝 Text Content</p>
                  )}
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
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },
  createBtn:    { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  formCard:     { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:    { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  errorBox:     { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: 12, marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  successBox:   { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: 12, marginBottom: 12, color: '#27AE60', fontSize: 14 },
  form:         { display: 'flex', flexDirection: 'column', gap: 16 },
  row:          { display: 'flex', gap: 16 },
  input:        { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:    { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  statsRow:     { display: 'flex', gap: 16, marginBottom: 20 },
  filterRow:    { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  filterBtn:    { padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  materialCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  deleteBtn:    { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#E74C3C' },
  cardSubject:  { fontSize: 12, fontWeight: 'bold', margin: '0 0 6px', textTransform: 'uppercase' },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  cardDesc:     { fontSize: 13, color: '#666', margin: '0 0 10px', lineHeight: 1.5 },
  cardMeta:     { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  metaChip:     { background: '#EAF4FB', color: '#2E86AB', fontSize: 11, padding: '3px 8px', borderRadius: 4 },
  downloadLink: { display: 'block', textAlign: 'center', background: '#EAF4FB', color: '#2E86AB', padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 'bold', textDecoration: 'none' },
  textOnlyBadge:{ background: '#F5EEF8', color: '#8E44AD', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', textAlign: 'center', margin: 0 },
};

export default StudyMaterials;