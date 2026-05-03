import React, { useEffect, useState } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import API from '../../services/api';

const ParentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({ present: 0, absent: 0, late: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/parents/child-attendance');
        if (res.data.success) {
          setRecords(res.data.records || []);
          setStats(res.data.stats || { present: 0, absent: 0, late: 0 });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'present') return '#006B3F';
    if (status === 'absent')  return '#CE1126';
    return '#FCD116';
  };

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>✅ Child's Attendance</h1>
          <p style={styles.subtitle}>Track your child's school attendance</p>
        </div>
        <div style={styles.content}>
          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderTop: '4px solid #006B3F' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#006B3F', margin: 0 }}>{stats.present}</p>
              <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Days Present</p>
            </div>
            <div style={{ ...styles.statCard, borderTop: '4px solid #CE1126' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#CE1126', margin: 0 }}>{stats.absent}</p>
              <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Days Absent</p>
            </div>
            <div style={{ ...styles.statCard, borderTop: '4px solid #FCD116' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#b8860b', margin: 0 }}>{stats.late}</p>
              <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Days Late</p>
            </div>
          </div>

          {loading ? <p style={styles.center}>Loading...</p> :
           records.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>✅</p>
              <h3 style={{ color: '#CE1126' }}>No attendance records yet</h3>
            </div>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Date</span>
                <span>Status</span>
                <span>Note</span>
              </div>
              {records.map((r, i) => (
                <div key={i} style={styles.tableRow}>
                  <span style={{ color: '#555' }}>{new Date(r.date).toLocaleDateString()}</span>
                  <span style={{ color: getStatusColor(r.status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {r.status === 'present' ? '✅' : r.status === 'absent' ? '❌' : '⏰'} {r.status}
                  </span>
                  <span style={{ color: '#888', fontSize: 13 }}>{r.note || '-'}</span>
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
  empty:       { textAlign: 'center', padding: '40px 20px' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  statCard:    { background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table:       { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', padding: '14px 20px', background: '#CE1126', color: '#fff', fontSize: 13, fontWeight: 'bold' },
  tableRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 14, alignItems: 'center' },
};

export default ParentAttendance;