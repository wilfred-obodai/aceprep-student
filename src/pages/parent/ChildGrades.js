import React, { useEffect, useState } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import API from '../../services/api';

const ChildGrades = () => {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/parents/child-grades');
        if (res.data.success) setGrades(res.data.grades || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Child's Grades</h1>
          <p style={styles.subtitle}>Academic performance overview</p>
        </div>
        <div style={styles.content}>
          {loading ? <p style={styles.center}>Loading grades...</p> :
           grades.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>📊</p>
              <h3 style={{ color: '#CE1126' }}>No grades yet</h3>
              <p style={{ color: '#888', fontSize: 14 }}>Grades will appear here once submitted by teachers.</p>
            </div>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Subject</span>
                <span>Score</span>
                <span>Grade</span>
                <span>Term</span>
                <span>Date</span>
              </div>
              {grades.map((g, i) => (
                <div key={i} style={styles.tableRow}>
                  <span style={{ fontWeight: 'bold', color: '#1A5276' }}>{g.subject}</span>
                  <span>{g.score}%</span>
                  <span style={{ fontWeight: 'bold', color: g.grade === 'A' ? '#006B3F' : g.grade === 'F' ? '#CE1126' : '#FCD116' }}>{g.grade}</span>
                  <span style={{ color: '#888' }}>{g.term || 'Term 1'}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>{new Date(g.created_at).toLocaleDateString()}</span>
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
  layout:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 235, flex: 1 },
  header:      { background: 'linear-gradient(135deg, #7a0015, #CE1126)', padding: '28px 24px' },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:    { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:     { padding: 20 },
  center:      { textAlign: 'center', color: '#888', padding: 40 },
  empty:       { textAlign: 'center', padding: '60px 20px' },
  table:       { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: '#CE1126', color: '#fff', fontSize: 13, fontWeight: 'bold' },
  tableRow:    { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 14, alignItems: 'center' },
};

export default ChildGrades;