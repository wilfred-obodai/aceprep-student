import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const subjectColors = {
  'Mathematics':        '#2E86AB',
  'English Language':   '#8E44AD',
  'Integrated Science': '#27AE60',
  'Social Studies':     '#F39C12',
  'ICT':                '#2980B9',
  'Physics':            '#E67E22',
  'Chemistry':          '#E74C3C',
  'Biology':            '#1E8449',
  'Economics':          '#1A5276',
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/schools/teachers');
        if (res.data.success) setTeachers(res.data.teachers);
      } catch (e) { console.error('Failed to load teachers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>👨‍🏫 My Teachers</h1>
          <p style={styles.subtitle}>Teachers at your school</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>👨‍🏫</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No teachers yet</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                Your school hasn't added any teachers yet.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {teachers.map(t => (
                <div key={t.id} style={styles.teacherCard}>
                  <div style={styles.avatar}>
                    {t.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.info}>
                    <p style={styles.name}>{t.fullName}</p>
                    <p style={styles.role}>
                      {t.role === 'admin' ? '🏫 School Admin' : '👨‍🏫 Teacher'}
                    </p>
                    {t.subjects && t.subjects.length > 0 && (
                      <div style={styles.subjects}>
                        {t.subjects.map(s => (
                          <span
                            key={s}
                            style={{
                              ...styles.subjectChip,
                              background: `${subjectColors[s] || '#2E86AB'}22`,
                              color:      subjectColors[s] || '#2E86AB',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:   { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 220, flex: 1 },
  header:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:    { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:     { padding: 16 },
  center:      { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:  { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
  teacherCard: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar:      { width: 52, height: 52, borderRadius: 26, background: '#2E86AB', color: '#fff', fontSize: 22, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1 },
  name:        { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  role:        { fontSize: 13, color: '#888', margin: '0 0 8px' },
  subjects:    { display: 'flex', flexWrap: 'wrap', gap: 6 },
  subjectChip: { fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 6 },
};

export default Teachers;