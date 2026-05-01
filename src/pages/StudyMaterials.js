import React, { useEffect, useState } from 'react';
import { getMyMaterials } from '../services/api';
import BottomNav from '../components/BottomNav';

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

const getFileIcon = (fileType) => {
  if (!fileType) return '📄';
  if (fileType.includes('pdf'))   return '📕';
  if (fileType.includes('word'))  return '📘';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('presentation')) return '📊';
  return '📄';
};

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyMaterials();
        if (res.data.success) setMaterials(res.data.materials);
      } catch (e) {
        console.error('Failed to load materials');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const subjects = ['All', ...new Set(materials.map(m => m.subject))];
  const filtered = filter === 'All'
    ? materials
    : materials.filter(m => m.subject === filter);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Study Materials</h1>
          <p style={styles.subtitle}>Resources uploaded by your teachers</p>
        </div>

        {selected ? (
          // ── Material Detail ─────────────────────
          <div style={styles.content}>
            <button style={styles.backBtn} onClick={() => setSelected(null)}>
              ← Back to Materials
            </button>

            <div style={styles.detailCard}>
              <div style={styles.detailHeader}>
                <span style={{ fontSize: 36 }}>
                  {getFileIcon(selected.fileType)}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    ...styles.detailSubject,
                    color: subjectConfig[selected.subject]?.color || '#2E86AB'
                  }}>
                    {selected.subject}
                  </p>
                  <h2 style={styles.detailTitle}>{selected.title}</h2>
                  <p style={styles.detailTeacher}>
                    By {selected.teacherName} •{' '}
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selected.description && (
                <p style={styles.detailDesc}>{selected.description}</p>
              )}

              {selected.content && (
                <div style={styles.contentBox}>
                  <p style={styles.contentTitle}>📖 Content:</p>
                  <p style={styles.contentText}>{selected.content}</p>
                </div>
              )}

              {selected.fileUrl && (
                
                <a href={`http://localhost:5000${selected.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.downloadLink}
                >
                  ⬇️ Download File
                </a>
              )}
            </div>
          </div>
        ) : (
          // ── Materials List ──────────────────────
          <div style={styles.content}>
            {/* Subject Filter */}
            <div style={styles.filterRow}>
              {subjects.map(s => (
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

            {loading ? (
              <p style={styles.center}>Loading materials...</p>
            ) : filtered.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: 56 }}>📚</p>
                <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>
                  No materials yet
                </h3>
                <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                  Your teachers haven't uploaded any study materials yet.
                </p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filtered.map(m => {
                  const cfg   = subjectConfig[m.subject] || { icon: '📄', color: '#333' };
                  return (
                    <div
                      key={m.id}
                      style={styles.materialCard}
                      onClick={() => setSelected(m)}
                    >
                      <div style={styles.cardTop}>
                        <span style={{ fontSize: 28 }}>{getFileIcon(m.fileType)}</span>
                        <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                      </div>
                      <p style={{ ...styles.cardSubject, color: cfg.color }}>
                        {m.subject}
                      </p>
                      <p style={styles.cardTitle}>{m.title}</p>
                      {m.description && (
                        <p style={styles.cardDesc}>
                          {m.description.substring(0, 60)}
                          {m.description.length > 60 ? '...' : ''}
                        </p>
                      )}
                      <p style={styles.cardTeacher}>👨‍🏫 {m.teacherName}</p>
                      <p style={{ ...styles.tapHint, color: cfg.color }}>
                        Tap to view →
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 220, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:      { padding: 16 },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  backBtn:      { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '4px 0', marginBottom: 12 },
  filterRow:    { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  filterBtn:    { padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  materialCard: { background: '#fff', borderRadius: 16, padding: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  cardSubject:  { fontSize: 11, fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' },
  cardTitle:    { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  cardDesc:     { fontSize: 12, color: '#888', margin: '0 0 6px', lineHeight: 1.4 },
  cardTeacher:  { fontSize: 11, color: '#27AE60', margin: '0 0 6px' },
  tapHint:      { fontSize: 10, margin: 0, opacity: 0.7 },
  detailCard:   { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  detailHeader: { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
  detailSubject:{ fontSize: 12, fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' },
  detailTitle:  { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  detailTeacher:{ fontSize: 12, color: '#888', margin: 0 },
  detailDesc:   { fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 16px' },
  contentBox:   { background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16 },
  contentTitle: { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  contentText:  { fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 },
  downloadBtn:  { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 'bold', textDecoration: 'none' },
};

export default StudyMaterials;