import React, { useEffect, useState } from 'react';
import { getMyAttendance } from '../services/api';
import BottomNav from '../components/BottomNav';

const statusConfig = {
  present: { bg: '#EAFAF1', color: '#27AE60', icon: '✅', label: 'Present' },
  absent:  { bg: '#FDEDEC', color: '#E74C3C', icon: '❌', label: 'Absent'  },
  late:    { bg: '#FEF9E7', color: '#F39C12', icon: '⏰', label: 'Late'    },
};

const Attendance = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyAttendance();
        if (res.data.success) setData(res.data);
      } catch (e) {
        console.error('Failed to load attendance');
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
          <h1 style={styles.title}>📋 My Attendance</h1>
          <p style={styles.subtitle}>Your attendance record</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading attendance...</p>
          ) : !data ? (
            <p style={styles.center}>No attendance records yet</p>
          ) : (
            <>
              {/* Summary */}
              <div style={styles.summaryCard}>
                <div style={styles.rateCircle}>
                  <p style={styles.rateNum}>{data.summary.attendanceRate}%</p>
                  <p style={styles.rateLabel}>Attendance Rate</p>
                </div>
                <div style={styles.statsGrid}>
                  <StatBox value={data.summary.present} label="Present" color="#27AE60" />
                  <StatBox value={data.summary.absent}  label="Absent"  color="#E74C3C" />
                  <StatBox value={data.summary.late}    label="Late"    color="#F39C12" />
                  <StatBox value={data.summary.total}   label="Total"   color="#2E86AB" />
                </div>
              </div>

              {/* Records */}
              {data.records.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={{ fontSize: 48 }}>📋</p>
                  <p style={{ color: '#888' }}>No attendance records yet</p>
                </div>
              ) : (
                data.records.map(r => {
                  const sc = statusConfig[r.status] || statusConfig.present;
                  return (
                    <div key={r.id} style={{ ...styles.recordCard, borderLeft: `4px solid ${sc.color}` }}>
                      <div style={{ ...styles.statusIcon, background: sc.bg }}>
                        <span style={{ fontSize: 20 }}>{sc.icon}</span>
                      </div>
                      <div style={styles.recordInfo}>
                        <p style={{ ...styles.recordStatus, color: sc.color }}>{sc.label}</p>
                        <p style={styles.recordDate}>
                          {new Date(r.date).toLocaleDateString('en-GH', {
                            weekday: 'long', year: 'numeric',
                            month: 'long', day: 'numeric'
                          })}
                        </p>
                        {r.subject && <p style={styles.recordSubject}>📚 {r.subject}</p>}
                        {r.notes   && <p style={styles.recordNotes}>📝 {r.notes}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ value, label, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <p style={{ fontSize: 22, fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>{label}</p>
  </div>
);

const styles = {
  container:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 220, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:      { padding: 16 },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  summaryCard:  { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', borderRadius: 16, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 },
  rateCircle:   { width: 90, height: 90, borderRadius: 45, background: 'rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rateNum:      { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  rateLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0', textAlign: 'center' },
  statsGrid:    { flex: 1, display: 'flex', gap: 8 },
  emptyState:   { textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  recordCard:   { background: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statusIcon:   { width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recordInfo:   { flex: 1 },
  recordStatus: { fontSize: 14, fontWeight: 'bold', margin: 0 },
  recordDate:   { fontSize: 13, color: '#555', margin: '2px 0' },
  recordSubject:{ fontSize: 12, color: '#2E86AB', margin: '2px 0' },
  recordNotes:  { fontSize: 12, color: '#888', margin: '2px 0' },
};

export default Attendance;