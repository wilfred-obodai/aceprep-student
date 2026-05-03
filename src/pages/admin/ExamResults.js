import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { getExamResults } from '../../services/api';

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

const ExamResults = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getExamResults(id);
        if (res.data.success) setData(res.data);
        else setError('Failed to load results');
      } catch (e) {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/admin/exams')}>
          ← Back to Exams
        </button>

        {loading ? (
          <p style={styles.center}>Loading results...</p>
        ) : error ? (
          <p style={{ ...styles.center, color: '#E74C3C' }}>{error}</p>
        ) : data && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>{data.exam.title}</h1>
              <p style={styles.subtitle}>{data.exam.subject} — Exam Results</p>
            </div>

            {/* Summary Cards */}
            <div style={styles.summaryRow}>
              <SummaryCard label="Total Attempts"  value={data.summary.totalAttempts}  color="#2E86AB" />
              <SummaryCard label="Completed"        value={data.summary.completed}       color="#27AE60" />
              <SummaryCard label="Average Score"    value={`${data.summary.averageScore}%`} color="#F39C12" />
              <SummaryCard label="Highest Score"    value={`${data.summary.highestScore}%`} color="#8E44AD" />
              <SummaryCard label="Lowest Score"     value={`${data.summary.lowestScore}%`}  color="#E74C3C" />
            </div>

            {/* Results Table */}
            <div style={styles.tableCard}>
              <h2 style={styles.tableTitle}>Student Results</h2>
              {data.results.length === 0 ? (
                <p style={styles.center}>No students have taken this exam yet</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Percentage</th>
                      <th style={styles.th}>Grade</th>
                      <th style={styles.th}>Time Taken</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((r, i) => {
                      const gc = gradeColor(r.gradeLetter);
                      return (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}>
                            <p style={styles.studentName}>{r.fullName}</p>
                            <p style={styles.studentEmail}>{r.email}</p>
                          </td>
                          <td style={styles.td}>
                            {r.level} {r.yearGroup}
                            {r.className ? ` — ${r.className}` : ''}
                          </td>
                          <td style={styles.td}>
                            {r.score !== null ? `${r.score}/${r.totalMarks}` : '—'}
                          </td>
                          <td style={styles.td}>
                            {r.percentage !== null ? `${r.percentage}%` : '—'}
                          </td>
                          <td style={styles.td}>
                            {r.gradeLetter ? (
                              <span style={{ ...styles.gradeBadge, background: gc.bg, color: gc.color }}>
                                {r.gradeLetter}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={styles.td}>
                            {r.timeTaken
                              ? `${Math.floor(r.timeTaken/60)}m ${r.timeTaken%60}s`
                              : '—'}
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              background: r.status === 'completed' ? '#EAFAF1' : '#FEF9E7',
                              color:      r.status === 'completed' ? '#27AE60' : '#F39C12',
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {r.submittedAt
                              ? new Date(r.submittedAt).toLocaleString()
                              : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <div style={{ ...styles.summaryCard, borderTop: `4px solid ${color}` }}>
    <p style={{ ...styles.summaryValue, color }}>{value}</p>
    <p style={styles.summaryLabel}>{label}</p>
  </div>
);

const styles = {
  layout:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 240, flex: 1, padding: '28px 24px' },
  backBtn:       { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontSize: 14, color: '#555', cursor: 'pointer', marginBottom: 20 },
  center:        { textAlign: 'center', color: '#888', padding: 40 },
  header:        { marginBottom: 24 },
  title:         { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:      { fontSize: 14, color: '#888', marginTop: 4 },
  summaryRow:    { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  summaryCard:   { flex: 1, minWidth: 140, background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  summaryValue:  { fontSize: 28, fontWeight: 'bold', margin: 0 },
  summaryLabel:  { fontSize: 12, color: '#888', margin: '4px 0 0', textTransform: 'uppercase' },
  tableCard:     { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  tableTitle:    { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { background: '#EAF4FB' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:            { borderBottom: '1px solid #f0f0f0' },
  td:            { padding: '12px 16px', fontSize: 14, color: '#333' },
  studentName:   { fontWeight: 'bold', color: '#1A5276', margin: 0 },
  studentEmail:  { fontSize: 12, color: '#888', margin: '2px 0 0' },
  gradeBadge:    { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' },
  statusBadge:   { padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
};

export default ExamResults;