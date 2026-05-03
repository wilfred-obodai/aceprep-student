import React, { useEffect, useState } from 'react';
import { getMyAnalytics } from '../services/api';
import BottomNav from '../components/BottomNav';

const gradeColor = (avg) => {
  if (avg >= 80) return '#27AE60';
  if (avg >= 70) return '#2E86AB';
  if (avg >= 60) return '#2980B9';
  if (avg >= 50) return '#F39C12';
  return '#E74C3C';
};

const Analytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyAnalytics();
        if (res.data.success) setData(res.data.analytics);
      } catch (e) { console.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 My Analytics</h1>
          <p style={styles.subtitle}>Your personal performance insights</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading analytics...</p>
          ) : !data ? (
            <p style={styles.center}>Failed to load analytics</p>
          ) : data.totalAssessments === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📊</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No data yet</h3>
              <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                Complete exams and assignments to see your analytics here.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={styles.summaryRow}>
                <SummaryCard value={`${data.overallAverage}%`} label="Overall Average" color={gradeColor(data.overallAverage)} />
                <SummaryCard value={data.totalAssessments}      label="Assessments"     color="#2E86AB" />
                <SummaryCard value={`${Math.round(data.totalStudyMins / 60)}h`} label="Study Time" color="#8E44AD" />
              </div>

              {/* AI Recommendations */}
              <div style={styles.aiCard}>
                <h3 style={styles.sectionTitle}>🤖 AI Study Recommendations</h3>
                {data.recommendations.map((r, i) => (
                  <div key={i} style={styles.recommendationRow}>
                    <p style={styles.recommendationText}>{r.tip}</p>
                  </div>
                ))}
              </div>

              {/* Subject Performance */}
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>📚 Subject Performance</h3>
                {data.subjectAverages.map(s => (
                  <div key={s.subject} style={styles.subjectRow}>
                    <div style={styles.subjectInfo}>
                      <p style={styles.subjectName}>{s.subject}</p>
                      <p style={styles.subjectCount}>{s.count} assessments</p>
                    </div>
                    <div style={styles.subjectBarContainer}>
                      <div style={{
                        ...styles.subjectBar,
                        width:      `${s.average}%`,
                        background: gradeColor(s.average),
                      }} />
                    </div>
                    <span style={{ ...styles.subjectAvg, color: gradeColor(s.average) }}>
                      {s.average}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Weak Subjects */}
              {data.weakSubjects.length > 0 && (
                <div style={{ ...styles.card, border: '2px solid #E74C3C' }}>
                  <h3 style={{ ...styles.sectionTitle, color: '#E74C3C' }}>
                    ⚠️ Needs Improvement
                  </h3>
                  {data.weakSubjects.map(s => (
                    <div key={s.subject} style={styles.weakRow}>
                      <span style={styles.weakSubject}>{s.subject}</span>
                      <span style={styles.weakScore}>{s.average}%</span>
                    </div>
                  ))}
                  <p style={styles.weakTip}>
                    💡 Focus on these subjects during your next study session!
                  </p>
                </div>
              )}

              {/* Strong Subjects */}
              {data.strongSubjects.length > 0 && (
                <div style={{ ...styles.card, border: '2px solid #27AE60' }}>
                  <h3 style={{ ...styles.sectionTitle, color: '#27AE60' }}>
                    🌟 Your Strong Subjects
                  </h3>
                  {data.strongSubjects.map(s => (
                    <div key={s.subject} style={styles.weakRow}>
                      <span style={styles.weakSubject}>{s.subject}</span>
                      <span style={{ ...styles.weakScore, color: '#27AE60', background: '#EAFAF1' }}>
                        {s.average}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Study Activity */}
              {data.studyActivity.length > 0 && (
                <div style={styles.card}>
                  <h3 style={styles.sectionTitle}>⏱️ Study Activity (Last 30 days)</h3>
                  <div style={styles.activityGrid}>
                    {data.studyActivity.map((a, i) => (
                      <div key={i} style={styles.activityDay}>
                        <div style={{
                          ...styles.activityBar,
                          height: `${Math.min(60, (a.totalMinutes / 120) * 60)}px`,
                          background: '#2E86AB',
                        }} />
                        <p style={styles.activityLabel}>
                          {new Date(a.date).toLocaleDateString('en-GH', { weekday: 'short' })}
                        </p>
                        <p style={styles.activityMins}>{a.totalMinutes}m</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ value, label, color }) => (
  <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: 22, fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>{label}</p>
  </div>
);

const styles = {
  container:           { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:                { marginLeft: 235, flex: 1 },
  header:              { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:               { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:            { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:             { padding: 16 },
  center:              { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:          { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  summaryRow:          { display: 'flex', gap: 10, marginBottom: 16 },
  aiCard:              { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle:        { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  recommendationRow:   { background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 },
  recommendationText:  { fontSize: 13, color: '#fff', margin: 0, lineHeight: 1.5 },
  card:                { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  subjectRow:          { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  subjectInfo:         { width: 130, flexShrink: 0 },
  subjectName:         { fontSize: 12, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  subjectCount:        { fontSize: 10, color: '#888', margin: '2px 0 0' },
  subjectBarContainer: { flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  subjectBar:          { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  subjectAvg:          { fontSize: 13, fontWeight: 'bold', width: 40, textAlign: 'right', flexShrink: 0 },
  weakRow:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
  weakSubject:         { fontSize: 14, color: '#333', fontWeight: 'bold' },
  weakScore:           { fontSize: 13, fontWeight: 'bold', color: '#E74C3C', background: '#FDEDEC', padding: '3px 10px', borderRadius: 6 },
  weakTip:             { fontSize: 12, color: '#888', margin: '10px 0 0', fontStyle: 'italic' },
  activityGrid:        { display: 'flex', gap: 6, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 4 },
  activityDay:         { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 },
  activityBar:         { width: 24, borderRadius: '4px 4px 0 0', minHeight: 4 },
  activityLabel:       { fontSize: 9, color: '#888', margin: '4px 0 0' },
  activityMins:        { fontSize: 9, color: '#2E86AB', margin: '2px 0 0' },
};

export default Analytics;