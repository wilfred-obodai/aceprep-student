import React, { useEffect, useState } from 'react';
import { getMyGrades } from '../services/api';
import BottomNav from '../components/BottomNav';

const gradeColor = (letter) => {
  const map = {
    A: { bg: '#EAFAF1', color: '#27AE60' },
    B: { bg: '#EAF4FB', color: '#2E86AB' },
    C: { bg: '#EBF5FB', color: '#2980B9' },
    D: { bg: '#FEF9E7', color: '#F39C12' },
    E: { bg: '#FDEBD0', color: '#E67E22' },
    F: { bg: '#FDEDEC', color: '#E74C3C' },
  };
  return map[letter] || { bg: '#f0f0f0', color: '#333' };
};

const subjectConfig = {
  'Mathematics':        { icon: '📐', bg: '#EAF4FB', color: '#2E86AB' },
  'English Language':   { icon: '✍️', bg: '#F5EEF8', color: '#8E44AD' },
  'Integrated Science': { icon: '🔬', bg: '#EAFAF1', color: '#27AE60' },
  'Social Studies':     { icon: '🌍', bg: '#FEF9E7', color: '#F39C12' },
  'ICT':                { icon: '💻', bg: '#EBF5FB', color: '#2980B9' },
  'Physics':            { icon: '⚡', bg: '#FEF9E7', color: '#E67E22' },
  'Chemistry':          { icon: '⚗️', bg: '#FDEDEC', color: '#E74C3C' },
  'Biology':            { icon: '🧬', bg: '#EAFAF1', color: '#1E8449' },
  'Economics':          { icon: '📈', bg: '#EAF4FB', color: '#1A5276' },
};

const getSubjectConfig = (subject) =>
  subjectConfig[subject] || { icon: '📊', bg: '#f0f0f0', color: '#333' };

const Grades = () => {
  const [grades,   setGrades]   = useState([]);
  const [average,  setAverage]  = useState(0);
  const [overall,  setOverall]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyGrades();
        if (res.data.success) {
          setGrades(res.data.grades || []);
          setAverage(res.data.average || 0);
          setOverall(res.data.overallGrade || '—');
        }
      } catch (e) {
        setError('Failed to load grades');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Group grades by subject
  const grouped = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) acc[grade.subject] = [];
    acc[grade.subject].push(grade);
    return acc;
  }, {});

  const gc = gradeColor(overall);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>My Grades</h1>
          <p style={styles.headerSub}>All your assessment results</p>
        </div>

        {/* Overall Summary */}
        {!loading && grades.length > 0 && (
          <div style={styles.summaryCard}>
            <div style={styles.summaryLeft}>
              <p style={styles.summaryLabel}>Overall Performance</p>
              <p style={styles.summaryAvg}>{average}% Average</p>
              <p style={styles.summaryCount}>
                {grades.length} assessments • {Object.keys(grouped).length} subjects
              </p>
            </div>
            <div style={{ ...styles.overallBadge, background: gc.bg }}>
              <p style={{ ...styles.overallLetter, color: gc.color }}>{overall}</p>
            </div>
          </div>
        )}

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading grades...</p>
          ) : error ? (
            <p style={{ ...styles.center, color: '#E74C3C' }}>{error}</p>
          ) : grades.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📝</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No grades yet</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                Complete a quiz or exam to see your grades here
              </p>
            </div>
          ) : selected ? (
            // ── Detail View ──────────────────────────
            <div>
              <button style={styles.backBtn} onClick={() => setSelected(null)}>
                ← Back to Subjects
              </button>
              <h2 style={styles.detailTitle}>
                {getSubjectConfig(selected).icon} {selected}
              </h2>
              {grouped[selected].map(g => {
                const gc = gradeColor(g.gradeLetter);
                return (
                  <div key={g.id} style={styles.gradeCard}>
                    <div style={{ ...styles.gradeBadge, background: gc.bg }}>
                      <p style={{ ...styles.gradeLetter, color: gc.color }}>{g.gradeLetter}</p>
                    </div>
                    <div style={styles.gradeInfo}>
                      <p style={styles.assessmentName}>{g.assessmentName}</p>
                      <div style={styles.tagRow}>
                        <span style={styles.tag}>{g.score}/{g.maxScore} marks</span>
                        <span style={{ ...styles.tag, background: '#F5EEF8', color: '#8E44AD' }}>
                          {g.assessmentType}
                        </span>
                      </div>
                    </div>
                    <p style={{ ...styles.percentage, color: gc.color }}>{g.percentage}%</p>
                  </div>
                );
              })}
            </div>
          ) : (
            // ── Subject Grid ──────────────────────────
            <div style={styles.subjectGrid}>
              {Object.entries(grouped).map(([subject, subjectGrades]) => {
                const cfg    = getSubjectConfig(subject);
                const subAvg = Math.round(
                  subjectGrades.reduce((s, g) => s + parseFloat(g.percentage || 0), 0) / subjectGrades.length
                );
                const subGC  = gradeColor(
                  subAvg >= 80 ? 'A' : subAvg >= 70 ? 'B' : subAvg >= 60 ? 'C' :
                  subAvg >= 50 ? 'D' : subAvg >= 40 ? 'E' : 'F'
                );

                return (
                  <div
                    key={subject}
                    style={{ ...styles.subjectCard, background: cfg.bg }}
                    onClick={() => setSelected(subject)}
                  >
                    <span style={styles.subjectCardIcon}>{cfg.icon}</span>
                    <p style={{ ...styles.subjectCardName, color: cfg.color }}>{subject}</p>
                    <div style={{ ...styles.subjectAvgBadge, background: subGC.bg, color: subGC.color }}>
                      {subAvg}%
                    </div>
                    <p style={styles.subjectCardMeta}>
                      {subjectGrades.length} assessment{subjectGrades.length !== 1 ? 's' : ''}
                    </p>
                    <p style={{ ...styles.tapHint, color: cfg.color }}>Tap to view →</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  ); 
};

const styles = {
  container:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:             { marginLeft: 235, flex: 1 },
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  headerTitle:      { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  headerSub:        { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  summaryCard:      { background: '#fff', margin: 16, borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  summaryLeft:      { flex: 1 },
  summaryLabel:     { fontSize: 13, color: '#888', margin: 0 },
  summaryAvg:       { fontSize: 24, fontWeight: 'bold', color: '#1A5276', margin: '4px 0 2px' },
  summaryCount:     { fontSize: 12, color: '#888', margin: 0 },
  overallBadge:     { width: 72, height: 72, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  overallLetter:    { fontSize: 36, fontWeight: 'bold', margin: 0 },
  content:          { padding: '0 16px 16px' },
  center:           { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:       { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // Subject Grid
  subjectGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 4 },
  subjectCard:      { borderRadius: 16, padding: '20px 12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  subjectCardIcon:  { fontSize: 32 },
  subjectCardName:  { fontSize: 12, fontWeight: 'bold', margin: '8px 0 6px', lineHeight: 1.3 },
  subjectAvgBadge:  { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', margin: '0 0 4px' },
  subjectCardMeta:  { fontSize: 10, color: '#888', margin: '4px 0 6px' },
  tapHint:          { fontSize: 10, margin: 0, opacity: 0.7 },

  // Detail View
  backBtn:          { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '8px 0', marginBottom: 8 },
  detailTitle:      { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  gradeCard:        { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  gradeBadge:       { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  gradeLetter:      { fontSize: 22, fontWeight: 'bold', margin: 0 },
  gradeInfo:        { flex: 1 },
  assessmentName:   { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  tagRow:           { display: 'flex', gap: 6 },
  tag:              { background: '#EAF4FB', color: '#2E86AB', fontSize: 11, padding: '3px 8px', borderRadius: 4 },
  percentage:       { fontSize: 18, fontWeight: 'bold', flexShrink: 0 },
};

export default Grades;