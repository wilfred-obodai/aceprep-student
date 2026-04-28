import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentExams } from '../services/api';
import BottomNav from '../components/BottomNav';

const statusColor = (attempt) => {
  if (!attempt) return { bg: '#EAF4FB', color: '#2E86AB', label: 'Not Started' };
  if (attempt.status === 'completed') {
    const pct = parseFloat(attempt.percentage);
    if (pct >= 70) return { bg: '#EAFAF1', color: '#27AE60', label: `${pct}% — ${attempt.grade}` };
    if (pct >= 50) return { bg: '#FEF9E7', color: '#F39C12', label: `${pct}% — ${attempt.grade}` };
    return { bg: '#FDEDEC', color: '#E74C3C', label: `${pct}% — ${attempt.grade}` };
  }
  return { bg: '#FEF9E7', color: '#F39C12', label: 'In Progress' };
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
  subjectConfig[subject] || { icon: '📋', bg: '#f0f0f0', color: '#333' };

const Exams = () => {
  const [exams,    setExams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentExams();
        if (res.data.success) setExams(res.data.exams);
      } catch (e) {
        setError('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Group exams by subject
  const grouped = exams.reduce((acc, exam) => {
    if (!acc[exam.subject]) acc[exam.subject] = [];
    acc[exam.subject].push(exam);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Exams</h1>
          <p style={styles.subtitle}>Exams assigned by your school</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading exams...</p>
          ) : error ? (
            <p style={{ ...styles.center, color: '#E74C3C' }}>{error}</p>
          ) : exams.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📋</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No exams yet</h3>
              <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                Your teacher hasn't assigned any exams yet. Check back later!
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
              {grouped[selected].map(exam => {
                const sc          = statusColor(exam.attempt);
                const isCompleted = exam.attempt?.status === 'completed';
                const isProgress  = exam.attempt?.status === 'in_progress';
                return (
                  <div key={exam.id} style={styles.examCard}>
                    <div style={styles.examCardTop}>
                      <p style={styles.examTitle}>{exam.title}</p>
                      <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                    {exam.instructions && (
                      <p style={styles.instructions}>{exam.instructions}</p>
                    )}
                    <div style={styles.detailsRow}>
                      <span style={styles.detail}>⏱️ {exam.durationMins} mins</span>
                      <span style={styles.detail}>❓ {exam.questionCount} questions</span>
                      <span style={styles.detail}>🎯 {exam.totalMarks} marks</span>
                    </div>
                    {isCompleted ? (
                      <div style={{ ...styles.resultBar, background: sc.bg }}>
                        <span style={{ color: sc.color, fontWeight: 'bold', fontSize: 14 }}>
                          ✅ Score: {exam.attempt.score}/{exam.totalMarks} ({exam.attempt.percentage}%)
                        </span>
                      </div>
                    ) : (
                      <button
                        style={{
                          ...styles.actionBtn,
                          background: isProgress
                            ? 'linear-gradient(135deg, #F39C12, #D35400)'
                            : 'linear-gradient(135deg, #2E86AB, #1A5276)'
                        }}
                        onClick={() => navigate(`/exams/${exam.id}`)}
                      >
                        {isProgress ? '▶️ Continue Exam' : '🚀 Start Exam'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // ── Subject Grid ──────────────────────────
            <div style={styles.subjectGrid}>
              {Object.entries(grouped).map(([subject, subjectExams]) => {
                const cfg       = getSubjectConfig(subject);
                const completed = subjectExams.filter(e => e.attempt?.status === 'completed').length;
                const avgPct    = completed > 0
                  ? Math.round(
                      subjectExams
                        .filter(e => e.attempt?.status === 'completed')
                        .reduce((s, e) => s + parseFloat(e.attempt?.percentage || 0), 0) / completed
                    )
                  : null;

                return (
                  <div
                    key={subject}
                    style={{ ...styles.subjectCard, background: cfg.bg }}
                    onClick={() => setSelected(subject)}
                  >
                    <span style={styles.subjectCardIcon}>{cfg.icon}</span>
                    <p style={{ ...styles.subjectCardName, color: cfg.color }}>{subject}</p>
                    {avgPct !== null && (
                      <div style={{
                        ...styles.avgBadge,
                        background: avgPct >= 70 ? '#EAFAF1' : avgPct >= 50 ? '#FEF9E7' : '#FDEDEC',
                        color:      avgPct >= 70 ? '#27AE60' : avgPct >= 50 ? '#F39C12' : '#E74C3C',
                      }}>
                        {avgPct}%
                      </div>
                    )}
                    <p style={styles.subjectCardMeta}>
                      {subjectExams.length} exam{subjectExams.length !== 1 ? 's' : ''} •{' '}
                      {completed} done
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
  container:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 220, flex: 1 },
  header:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:          { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:       { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:        { padding: '16px' },
  center:         { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:     { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // Subject Grid
  subjectGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  subjectCard:    { borderRadius: 16, padding: '20px 12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  subjectCardIcon:{ fontSize: 32 },
  subjectCardName:{ fontSize: 12, fontWeight: 'bold', margin: '8px 0 6px', lineHeight: 1.3 },
  avgBadge:       { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', margin: '0 0 4px' },
  subjectCardMeta:{ fontSize: 10, color: '#888', margin: '4px 0 6px' },
  tapHint:        { fontSize: 10, margin: 0, opacity: 0.7 },

  // Detail View
  backBtn:        { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '8px 0', marginBottom: 8 },
  detailTitle:    { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  examCard:       { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  examCardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  examTitle:      { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: 0, flex: 1 },
  statusBadge:    { fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 6, flexShrink: 0 },
  instructions:   { fontSize: 13, color: '#666', margin: '0 0 10px', lineHeight: 1.5 },
  detailsRow:     { display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  detail:         { fontSize: 12, color: '#555' },
  resultBar:      { padding: '10px 14px', borderRadius: 8, textAlign: 'center' },
  actionBtn:      { width: '100%', padding: '12px', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', border: 'none' },
};

export default Exams;