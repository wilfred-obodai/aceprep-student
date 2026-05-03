import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolLeaderboard } from '../../services/api';

const gradeColor = (grade) => {
  const map = {
    A: '#27AE60', B: '#2E86AB', C: '#2980B9',
    D: '#F39C12', E: '#E67E22', F: '#E74C3C',
  };
  return map[grade] || '#333';
};

const Analytics = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSchoolLeaderboard();
        if (res.data.success) setStudents(res.data.leaderboard);
      } catch (e) {
        console.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Calculate analytics
  const withGrades  = students.filter(s => s.totalAssessments > 0);
  const avgScore    = withGrades.length > 0
    ? Math.round(withGrades.reduce((s, st) => s + st.averageScore, 0) / withGrades.length)
    : 0;

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  withGrades.forEach(s => {
    if (s.grade) gradeDistribution[s.grade]++;
  });

  const levelDistribution = students.reduce((acc, s) => {
    acc[s.level] = (acc[s.level] || 0) + 1;
    return acc;
  }, {});

  const top5     = students.slice(0, 5);
  const bottom5  = [...students].reverse().slice(0, 5);
  const maxScore = Math.max(...withGrades.map(s => s.averageScore), 1);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📊 School Analytics</h1>
          <p style={styles.subtitle}>Performance insights for your school</p>
        </div>

        {loading ? (
          <p style={styles.center}>Loading analytics...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryRow}>
              <SummaryCard label="Total Students"    value={students.length}       color="#2E86AB" icon="👥" />
              <SummaryCard label="With Grades"       value={withGrades.length}     color="#27AE60" icon="📝" />
              <SummaryCard label="School Average"    value={`${avgScore}%`}        color="#F39C12" icon="📊" />
              <SummaryCard label="Top Scorer"        value={top5[0] ? `${top5[0].averageScore}%` : '—'} color="#8E44AD" icon="🏆" />
            </div>

            {/* Grade Distribution */}
            <div style={styles.row}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📈 Grade Distribution</h2>
                {Object.entries(gradeDistribution).map(([grade, count]) => {
                  const pct   = withGrades.length > 0
                    ? Math.round((count / withGrades.length) * 100) : 0;
                  const color = gradeColor(grade);
                  return (
                    <div key={grade} style={styles.gradeRow}>
                      <span style={{ ...styles.gradeBadge, color, background: `${color}22` }}>
                        {grade}
                      </span>
                      <div style={styles.barContainer}>
                        <div style={{
                          ...styles.bar,
                          width:      `${pct}%`,
                          background: color,
                        }} />
                      </div>
                      <span style={styles.gradeCount}>{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>

              {/* Level Distribution */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🎓 Level Distribution</h2>
                {Object.entries(levelDistribution).map(([level, count]) => {
                  const pct = Math.round((count / students.length) * 100);
                  return (
                    <div key={level} style={styles.gradeRow}>
                      <span style={styles.levelBadge}>{level}</span>
                      <div style={styles.barContainer}>
                        <div style={{
                          ...styles.bar,
                          width:      `${pct}%`,
                          background: '#2E86AB',
                        }} />
                      </div>
                      <span style={styles.gradeCount}>{count} ({pct}%)</span>
                    </div>
                  );
                })}

                <h2 style={{ ...styles.cardTitle, marginTop: 24 }}>⏱️ Study Activity</h2>
                <div style={styles.activityStats}>
                  <div style={styles.activityStat}>
                    <p style={styles.activityVal}>
                      {students.filter(s => s.currentStreak > 0).length}
                    </p>
                    <p style={styles.activityLabel}>Active Streaks</p>
                  </div>
                  <div style={styles.activityStat}>
                    <p style={styles.activityVal}>
                      {students.filter(s => s.totalSessions > 0).length}
                    </p>
                    <p style={styles.activityLabel}>Have Studied</p>
                  </div>
                  <div style={styles.activityStat}>
                    <p style={styles.activityVal}>
                      {students.filter(s => s.totalSessions === 0).length}
                    </p>
                    <p style={styles.activityLabel}>Never Studied</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top & Bottom Performers */}
            <div style={styles.row}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🏆 Top 5 Performers</h2>
                {top5.map((s, i) => (
                  <div key={s.studentId} style={styles.performerRow}>
                    <span style={styles.rank}>#{i + 1}</span>
                    <div style={styles.performerInfo}>
                      <p style={styles.performerName}>{s.fullName}</p>
                      <p style={styles.performerMeta}>
                        {s.level} Year {s.yearGroup} {s.className ? `— ${s.className}` : ''}
                      </p>
                    </div>
                    <div style={styles.scoreBar}>
                      <div style={{
                        height:     8,
                        borderRadius: 4,
                        background: gradeColor(s.grade),
                        width:      `${(s.averageScore / maxScore) * 100}%`,
                        transition: 'width 0.5s',
                      }} />
                    </div>
                    <span style={{ ...styles.scoreText, color: gradeColor(s.grade) }}>
                      {s.averageScore}%
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📚 Need Attention</h2>
                {bottom5.length === 0 ? (
                  <p style={styles.center}>No data yet</p>
                ) : (
                  bottom5.map((s, i) => (
                    <div key={s.studentId} style={styles.performerRow}>
                      <span style={{ ...styles.rank, background: '#FDEDEC', color: '#E74C3C' }}>
                        {students.length - i}
                      </span>
                      <div style={styles.performerInfo}>
                        <p style={styles.performerName}>{s.fullName}</p>
                        <p style={styles.performerMeta}>
                          {s.level} Year {s.yearGroup}
                          {s.totalAssessments === 0 ? ' — No grades yet' : ` — ${s.averageScore}%`}
                        </p>
                      </div>
                      <span style={{ color: '#E74C3C', fontSize: 13, fontWeight: 'bold' }}>
                        {s.totalAssessments === 0 ? 'No grades' : `${s.averageScore}%`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon }) => (
  <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    <p style={{ fontSize: 28, fontWeight: 'bold', color, margin: '8px 0 4px' }}>{value}</p>
    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{label}</p>
  </div>
);

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:         { marginBottom: 24 },
  title:          { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:       { fontSize: 14, color: '#888', marginTop: 4 },
  summaryRow:     { display: 'flex', gap: 16, marginBottom: 24 },
  row:            { display: 'flex', gap: 16, marginBottom: 24 },
  card:           { flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  center:         { textAlign: 'center', color: '#888', padding: 20 },
  gradeRow:       { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  gradeBadge:     { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold', flexShrink: 0 },
  barContainer:   { flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  bar:            { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  gradeCount:     { fontSize: 12, color: '#888', width: 70, textAlign: 'right' },
  levelBadge:     { background: '#EAF4FB', color: '#2E86AB', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold', flexShrink: 0, width: 28, textAlign: 'center' },
  activityStats:  { display: 'flex', gap: 12, marginTop: 8 },
  activityStat:   { flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '12px', textAlign: 'center' },
  activityVal:    { fontSize: 24, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  activityLabel:  { fontSize: 11, color: '#888', margin: '4px 0 0' },
  performerRow:   { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  rank:           { width: 28, height: 28, borderRadius: 6, background: '#EAF4FB', color: '#2E86AB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 },
  performerInfo:  { flex: 1 },
  performerName:  { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  performerMeta:  { fontSize: 12, color: '#888', margin: '2px 0 0' },
  scoreBar:       { width: 80, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  scoreText:      { fontSize: 14, fontWeight: 'bold', width: 45, textAlign: 'right' },
};

export default Analytics;