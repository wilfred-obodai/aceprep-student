import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { getSubmissions, gradeSubmission } from '../../services/api';

const AssignmentSubmissions = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [marks,     setMarks]     = useState('');
  const [feedback,  setFeedback]  = useState('');
  const [grading,   setGrading]   = useState(false);
  const [gradeMsg,  setGradeMsg]  = useState('');

  const fetchData = async () => {
    try {
      const res = await getSubmissions(id);
      if (res.data.success) setData(res.data);
    } catch (e) {
      console.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleGrade = async () => {
    if (!marks && marks !== 0) return;
    setGrading(true);
    setGradeMsg('');
    try {
      const res = await gradeSubmission(selected.id, {
        marksAwarded: parseFloat(marks),
        feedback:     feedback || undefined,
      });
      if (res.data.success) {
        setGradeMsg(`✅ Graded! Score: ${marks}/${data.assignment.total_marks} (${res.data.percentage}% — ${res.data.grade})`);
        fetchData();
        setSelected(null);
        setMarks('');
        setFeedback('');
      }
    } catch (e) {
      setGradeMsg('❌ Failed to grade. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/admin/assignments')}>
          ← Back to Assignments
        </button>

        {loading ? (
          <p style={styles.center}>Loading submissions...</p>
        ) : !data ? (
          <p style={styles.center}>Failed to load data</p>
        ) : (
          <>
            {/* Assignment Info */}
            <div style={styles.assignmentInfo}>
              <h1 style={styles.title}>{data.assignment.title}</h1>
              <p style={styles.subtitle}>
                {data.assignment.subject} •{' '}
                {data.assignment.level} Year {data.assignment.year_group} •{' '}
                Total: {data.assignment.total_marks} marks
              </p>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
              <StatBox label="Total Submissions" value={data.total}           color="#2E86AB" />
              <StatBox label="Graded"             value={data.submissions.filter(s => s.status === 'graded').length}   color="#27AE60" />
              <StatBox label="Pending"            value={data.submissions.filter(s => s.status === 'submitted').length} color="#F39C12" />
            </div>

            {gradeMsg && (
              <div style={{
                ...styles.gradeMsg,
                background: gradeMsg.includes('✅') ? '#EAFAF1' : '#FDEDEC',
                color:      gradeMsg.includes('✅') ? '#27AE60' : '#E74C3C',
              }}>
                {gradeMsg}
              </div>
            )}

            {/* Grading Panel */}
            {selected && (
              <div style={styles.gradingPanel}>
                <div style={styles.gradingHeader}>
                  <h3 style={styles.gradingTitle}>
                    Grading: {selected.fullName}
                  </h3>
                  <button style={styles.closeBtn} onClick={() => {
                    setSelected(null); setMarks(''); setFeedback('');
                  }}>✕</button>
                </div>

                <div style={styles.answerBox}>
                  <p style={styles.answerLabel}>Student's Answer:</p>
                  <p style={styles.answerText}>{selected.answerText}</p>
                </div>

                <div style={styles.gradingForm}>
                  <div style={styles.marksRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>
                        Marks Awarded (out of {data.assignment.total_marks})
                      </label>
                      <input
                        style={styles.input}
                        type="number"
                        min="0"
                        max={data.assignment.total_marks}
                        value={marks}
                        onChange={e => setMarks(e.target.value)}
                        placeholder={`0 - ${data.assignment.total_marks}`}
                      />
                    </div>
                    {marks !== '' && (
                      <div style={styles.scorePreview}>
                        <p style={styles.scoreVal}>
                          {Math.round((marks / data.assignment.total_marks) * 100)}%
                        </p>
                        <p style={styles.scoreLabel}>Score</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={styles.label}>Feedback for Student (Optional)</label>
                    <textarea
                      style={{ ...styles.input, height: 80, resize: 'vertical' }}
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder="Write feedback to help the student improve..."
                    />
                  </div>

                  <button
                    style={{
                      ...styles.gradeBtn,
                      opacity: (!marks && marks !== 0) || grading ? 0.6 : 1
                    }}
                    onClick={handleGrade}
                    disabled={(!marks && marks !== 0) || grading}
                  >
                    {grading ? 'Grading...' : '✅ Submit Grade'}
                  </button>
                </div>
              </div>
            )}

            {/* Submissions Table */}
            <div style={styles.tableCard}>
              <h2 style={styles.tableTitle}>
                Student Submissions ({data.total})
              </h2>
              {data.submissions.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={{ fontSize: 40 }}>📭</p>
                  <p style={{ color: '#888', marginTop: 8 }}>No submissions yet</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Submitted</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.submissions.map(sub => (
                      <tr key={sub.id} style={styles.tr}>
                        <td style={styles.td}>
                          <p style={styles.studentName}>{sub.fullName}</p>
                          <p style={styles.studentEmail}>{sub.email}</p>
                        </td>
                        <td style={styles.td}>
                          {sub.level} {sub.yearGroup}
                          {sub.className ? ` — ${sub.className}` : ''}
                        </td>
                        <td style={styles.td}>
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            background: sub.status === 'graded' ? '#EAFAF1' : '#FEF9E7',
                            color:      sub.status === 'graded' ? '#27AE60' : '#F39C12',
                          }}>
                            {sub.status === 'graded' ? '✅ Graded' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {sub.marksAwarded !== null
                            ? `${sub.marksAwarded}/${data.assignment.total_marks}`
                            : '—'}
                        </td>
                        <td style={styles.td}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => {
                              setSelected(sub);
                              setMarks(sub.marksAwarded || '');
                              setFeedback(sub.feedback || '');
                              setGradeMsg('');
                            }}
                          >
                            {sub.status === 'graded' ? '✏️ Re-grade' : '📝 Grade'}
                          </button>
                        </td>
                      </tr>
                    ))}
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

const StatBox = ({ label, value, color }) => (
  <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: 28, fontWeight: 'bold', color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{label}</p>
  </div>
);

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 240, flex: 1, padding: '28px 24px' },
  backBtn:        { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontSize: 14, color: '#555', cursor: 'pointer', marginBottom: 20 },
  center:         { textAlign: 'center', color: '#888', padding: 40 },
  assignmentInfo: { marginBottom: 24 },
  title:          { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:       { fontSize: 14, color: '#888', marginTop: 4 },
  statsRow:       { display: 'flex', gap: 16, marginBottom: 24 },
  gradeMsg:       { padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 'bold' },

  // Grading Panel
  gradingPanel:   { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid #2E86AB' },
  gradingHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gradingTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  closeBtn:       { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' },
  answerBox:      { background: '#f8f9fa', borderRadius: 8, padding: 16, marginBottom: 16, maxHeight: 200, overflowY: 'auto' },
  answerLabel:    { fontSize: 12, fontWeight: 'bold', color: '#888', margin: '0 0 8px', textTransform: 'uppercase' },
  answerText:     { fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 },
  gradingForm:    { display: 'flex', flexDirection: 'column', gap: 14 },
  marksRow:       { display: 'flex', gap: 12, alignItems: 'flex-end' },
  label:          { display: 'block', fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  input:          { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  scorePreview:   { background: '#EAF4FB', borderRadius: 10, padding: '12px 20px', textAlign: 'center', flexShrink: 0 },
  scoreVal:       { fontSize: 24, fontWeight: 'bold', color: '#2E86AB', margin: 0 },
  scoreLabel:     { fontSize: 11, color: '#888', margin: '2px 0 0' },
  gradeBtn:       { background: 'linear-gradient(135deg, #27AE60, #1E8449)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },

  // Table
  tableCard:      { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  tableTitle:     { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  emptyState:     { textAlign: 'center', padding: '40px 20px' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  thead:          { background: '#EAF4FB' },
  th:             { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:             { borderBottom: '1px solid #f0f0f0' },
  td:             { padding: '12px 16px', fontSize: 14, color: '#333' },
  studentName:    { fontWeight: 'bold', color: '#1A5276', margin: 0 },
  studentEmail:   { fontSize: 12, color: '#888', margin: '2px 0 0' },
  statusBadge:    { padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  actionBtn:      { background: '#EAF4FB', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#2E86AB', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
};

export default AssignmentSubmissions;