import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import API from '../../services/api';

const PerformanceReport = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [year,    setYear]    = useState(new Date().getFullYear());

  useEffect(() => { fetchReport(); }, [year]); // eslint-disable-line

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/analytics/school-report?year=${year}`);
      if (res.data.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const printReport = () => window.print();

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 School Performance Report</h1>
            <p style={styles.subtitle}>Detailed analytics and insights for your school</p>
          </div>
          <div style={styles.headerActions}>
            <select style={styles.yearSelect} value={year} onChange={e => setYear(e.target.value)}>
              {[2026,2025,2024,2023].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={printReport} style={styles.printBtn}>🖨️ Print Report</button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}><p>📊 Generating report...</p></div>
        ) : !data ? (
          <div style={styles.loading}><p>No data available</p></div>
        ) : (
          <div style={styles.content} id="report">

            {/* Overview Cards */}
            <div style={styles.statsGrid}>
              <StatCard icon="👥" label="Total Students"  value={data.totalStudents || 0}  color="#2E86AB" />
              <StatCard icon="📊" label="Average Score"   value={`${data.avgScore || 0}%`} color="#27AE60" />
              <StatCard icon="📝" label="Exams Conducted" value={data.totalExams || 0}      color="#F39C12" />
              <StatCard icon="✅" label="Avg Attendance"  value={`${data.avgAttendance || 0}%`} color="#8E44AD" />
            </div>

            {/* Subject Performance */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📚 Subject Performance</h3>
              {data.subjectPerformance?.length > 0 ? (
                <div style={styles.subjectList}>
                  {data.subjectPerformance.map((s, i) => (
                    <div key={i} style={styles.subjectRow}>
                      <span style={styles.subjectName}>{s.subject}</span>
                      <div style={styles.barWrap}>
                        <div style={{ ...styles.bar, width: `${s.avg_score || 0}%`, background: s.avg_score >= 70 ? '#27AE60' : s.avg_score >= 50 ? '#F39C12' : '#E74C3C' }} />
                      </div>
                      <span style={{ ...styles.scoreLabel, color: s.avg_score >= 70 ? '#27AE60' : s.avg_score >= 50 ? '#F39C12' : '#E74C3C' }}>
                        {Math.round(s.avg_score || 0)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p style={styles.noData}>No grade data yet</p>}
            </div>

            {/* Top Performers */}
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🌟 Top Performers</h3>
                {data.topStudents?.length > 0 ? (
                  data.topStudents.map((s, i) => (
                    <div key={i} style={styles.studentRow}>
                      <span style={styles.rank}>#{i+1}</span>
                      <span style={styles.studentName}>{s.full_name}</span>
                      <span style={{ ...styles.score, color: '#27AE60' }}>{Math.round(s.avg_score)}%</span>
                    </div>
                  ))
                ) : <p style={styles.noData}>No data yet</p>}
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>⚠️ Needs Attention</h3>
                {data.bottomStudents?.length > 0 ? (
                  data.bottomStudents.map((s, i) => (
                    <div key={i} style={styles.studentRow}>
                      <span style={styles.rank}>#{i+1}</span>
                      <span style={styles.studentName}>{s.full_name}</span>
                      <span style={{ ...styles.score, color: '#E74C3C' }}>{Math.round(s.avg_score)}%</span>
                    </div>
                  ))
                ) : <p style={styles.noData}>No data yet</p>}
              </div>
            </div>

            {/* Year Group Breakdown */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📈 Year Group Performance</h3>
              {data.yearGroupPerformance?.length > 0 ? (
                <div style={styles.yearGroupGrid}>
                  {data.yearGroupPerformance.map((y, i) => (
                    <div key={i} style={styles.yearGroupCard}>
                      <p style={styles.yearGroupLabel}>Year {y.year_group}</p>
                      <p style={{ ...styles.yearGroupScore, color: y.avg_score >= 70 ? '#27AE60' : y.avg_score >= 50 ? '#F39C12' : '#E74C3C' }}>
                        {Math.round(y.avg_score || 0)}%
                      </p>
                      <p style={styles.yearGroupCount}>{y.student_count} students</p>
                    </div>
                  ))}
                </div>
              ) : <p style={styles.noData}>No data yet</p>}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`, textAlign: 'center' }}>
    <p style={{ fontSize: 30, margin: 0 }}>{icon}</p>
    <p style={{ fontSize: 26, fontWeight: 'bold', color, margin: '8px 0 4px' }}>{value}</p>
    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{label}</p>
  </div>
);

const styles = {
  layout:           { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:             { marginLeft: 240, flex: 1 },
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:            { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:         { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerActions:    { display: 'flex', gap: 10, alignItems: 'center' },
  yearSelect:       { padding: '8px 12px', borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' },
  printBtn:         { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  loading:          { textAlign: 'center', padding: '60px 20px', color: '#888' },
  content:          { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  statsGrid:        { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  card:             { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:        { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  subjectList:      { display: 'flex', flexDirection: 'column', gap: 12 },
  subjectRow:       { display: 'flex', alignItems: 'center', gap: 12 },
  subjectName:      { width: 160, fontSize: 14, color: '#333', fontWeight: 'bold', flexShrink: 0 },
  barWrap:          { flex: 1, height: 12, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' },
  bar:              { height: '100%', borderRadius: 6, transition: 'width 0.5s ease' },
  scoreLabel:       { width: 45, fontSize: 14, fontWeight: 'bold', textAlign: 'right', flexShrink: 0 },
  twoCol:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  studentRow:       { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  rank:             { width: 28, height: 28, borderRadius: 14, background: '#EAF4FB', color: '#2E86AB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 },
  studentName:      { flex: 1, fontSize: 14, color: '#333', fontWeight: 'bold' },
  score:            { fontSize: 15, fontWeight: 'bold' },
  yearGroupGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  yearGroupCard:    { background: '#f8f9fa', borderRadius: 10, padding: '16px', textAlign: 'center' },
  yearGroupLabel:   { fontSize: 14, color: '#888', margin: '0 0 8px', fontWeight: 'bold' },
  yearGroupScore:   { fontSize: 28, fontWeight: 'bold', margin: '0 0 4px' },
  yearGroupCount:   { fontSize: 12, color: '#888', margin: 0 },
  noData:           { color: '#888', fontSize: 14, textAlign: 'center', padding: 20 },
};

export default PerformanceReport;