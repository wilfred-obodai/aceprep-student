import React, { useEffect, useState } from 'react';
import { getStudentAnnouncements } from '../services/api';
import BottomNav from '../components/BottomNav';

const priorityConfig = {
  urgent: { bg: '#FDEDEC', color: '#E74C3C', label: '🚨 Urgent',  border: '#E74C3C' },
  high:   { bg: '#FEF9E7', color: '#F39C12', label: '⚠️ High',    border: '#F39C12' },
  normal: { bg: '#EAF4FB', color: '#2E86AB', label: '📢 Normal',  border: '#2E86AB' },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentAnnouncements();
        if (res.data.success) setAnnouncements(res.data.announcements);
      } catch (e) {
        console.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📢 Announcements</h1>
          <p style={styles.subtitle}>Messages from your school and teachers</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📢</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No announcements</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                Your school hasn't posted any announcements yet.
              </p>
            </div>
          ) : (
            announcements.map(a => {
              const pc = priorityConfig[a.priority] || priorityConfig.normal;
              return (
                <div
                  key={a.id}
                  style={{ ...styles.card, borderLeft: `4px solid ${pc.border}` }}
                >
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.priorityBadge, background: pc.bg, color: pc.color }}>
                      {pc.label}
                    </span>
                    <span style={styles.date}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={styles.announcementTitle}>{a.title}</h3>
                  <p style={styles.announcementContent}>{a.content}</p>
                  <p style={styles.teacher}>— {a.teacherName}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:           { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:                { marginLeft: 235, flex: 1 },
  header:              { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:               { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:            { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:             { padding: 16 },
  center:              { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:          { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  card:                { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priorityBadge:       { padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  date:                { fontSize: 12, color: '#888' },
  announcementTitle:   { fontSize: 17, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  announcementContent: { fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 10px' },
  teacher:             { fontSize: 13, color: '#888', fontStyle: 'italic', margin: 0 },
};

export default Announcements;