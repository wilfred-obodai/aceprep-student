import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolExams } from '../../services/api';

const statusColor = (status) => {
  if (status === 'published') return { bg: '#EAFAF1', color: '#27AE60' };
  if (status === 'draft')     return { bg: '#FEF9E7', color: '#F39C12' };
  return { bg: '#EAF4FB', color: '#2E86AB' };
};

const Exams = () => {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSchoolExams();
        if (res.data.success) setExams(res.data.exams);
      } catch (e) {
        console.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Exam Management</h1>
            <p style={styles.subtitle}>Create and manage exams for your students</p>
          </div>
          <button
            style={styles.createBtn}
            onClick={() => navigate('/admin/exams/create')}
          >
            + Create New Exam
          </button>
        </div>

        {/* Exams List */}
        {loading ? (
          <p style={styles.center}>Loading exams...</p>
        ) : exams.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>📋</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No exams yet</h3>
            <p style={{ color: '#888', marginBottom: 20 }}>
              Create your first exam and assign it to your students
            </p>
            <button
              style={styles.createBtn}
              onClick={() => navigate('/admin/exams/create')}
            >
              + Create First Exam
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {exams.map(exam => {
              const sc = statusColor(exam.status);
              return (
                <div key={exam.id} style={styles.examCard}>
                  {/* Top */}
                  <div style={styles.cardTop}>
                    <span style={styles.subjectBadge}>{exam.subject}</span>
                    <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}>
                      {exam.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={styles.examTitle}>{exam.title}</h3>

                  {/* Details */}
                  <div style={styles.detailsRow}>
                    <span style={styles.detail}>⏱️ {exam.durationMins} mins</span>
                    <span style={styles.detail}>❓ {exam.questionCount} questions</span>
                    <span style={styles.detail}>🎯 {exam.totalMarks} marks</span>
                  </div>

                  <div style={styles.detailsRow}>
                    <span style={styles.detail}>
                      🎓 {exam.level} Year {exam.yearGroup}
                      {exam.className ? ` — Class ${exam.className}` : ''}
                    </span>
                    <span style={styles.detail}>
                      👥 {exam.attemptCount} attempt{exam.attemptCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Schedule */}
                  {exam.startsAt && (
                    <p style={styles.schedule}>
                      📅 {new Date(exam.startsAt).toLocaleString()} →{' '}
                      {exam.endsAt ? new Date(exam.endsAt).toLocaleString() : 'No end date'}
                    </p>
                  )}

                  {/* Actions */}
                  <div style={styles.cardActions}>
                    <button
                      style={styles.resultsBtn}
                      onClick={() => navigate(`/admin/exams/${exam.id}/results`)}
                    >
                      📊 View Results
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },
  createBtn:    { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  examCard:     { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectBadge: { background: '#EAF4FB', color: '#2E86AB', fontSize: 12, fontWeight: 'bold', padding: '4px 10px', borderRadius: 6 },
  statusBadge:  { fontSize: 12, fontWeight: 'bold', padding: '4px 10px', borderRadius: 6, textTransform: 'capitalize' },
  examTitle:    { fontSize: 17, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  detailsRow:   { display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' },
  detail:       { fontSize: 13, color: '#555' },
  schedule:     { fontSize: 12, color: '#888', marginTop: 8 },
  cardActions:  { marginTop: 16, display: 'flex', gap: 8 },
  resultsBtn:   { flex: 1, padding: '10px', background: '#EAF4FB', border: 'none', borderRadius: 8, color: '#2E86AB', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
};

export default Exams;