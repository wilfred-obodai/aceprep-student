import React, { useEffect, useState } from 'react';
import { getStudentAssignments, submitAssignment } from '../services/api';
import BottomNav from '../components/BottomNav';

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

const getConfig = (subject) =>
  subjectConfig[subject] || { icon: '📚', bg: '#f0f0f0', color: '#333' };

const statusBadge = (submission) => {
  if (!submission) return { label: 'Not Submitted', bg: '#FDEDEC', color: '#E74C3C' };
  if (submission.status === 'graded') return { label: '✅ Graded', bg: '#EAFAF1', color: '#27AE60' };
  return { label: '📤 Submitted', bg: '#EAF4FB', color: '#2E86AB' };
};

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [selected,    setSelected]    = useState(null);
  const [answer,      setAnswer]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitMsg,   setSubmitMsg]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentAssignments();
        if (res.data.success) setAssignments(res.data.assignments);
      } catch (e) {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const res = await submitAssignment(selected.id, { answerText: answer });
      if (res.data.success) {
        setSubmitMsg('✅ Assignment submitted successfully!');
        // Update local state
        setAssignments(prev => prev.map(a =>
          a.id === selected.id
            ? { ...a, submission: { status: 'submitted', answerText: answer, submittedAt: new Date() } }
            : a
        ));
        setSelected(prev => ({
          ...prev,
          submission: { status: 'submitted', answerText: answer, submittedAt: new Date() }
        }));
      }
    } catch (e) {
      setSubmitMsg('❌ Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group by subject
  const grouped = assignments.reduce((acc, a) => {
    if (!acc[a.subject]) acc[a.subject] = [];
    acc[a.subject].push(a);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Assignments</h1>
          <p style={styles.subtitle}>View and submit your assignments</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading assignments...</p>
          ) : error ? (
            <p style={{ ...styles.center, color: '#E74C3C' }}>{error}</p>
          ) : assignments.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📚</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No assignments yet</h3>
              <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                Your teacher hasn't set any assignments yet. Check back later!
              </p>
            </div>
          ) : selected ? (
            // ── Assignment Detail ─────────────────
            <div>
              <button style={styles.backBtn} onClick={() => {
                setSelected(null);
                setAnswer('');
                setSubmitMsg('');
              }}>
                ← Back to Assignments
              </button>

              {/* Assignment Info */}
              <div style={{ ...styles.assignmentDetailCard, background: getConfig(selected.subject).bg }}>
                <div style={styles.detailTop}>
                  <span style={{ fontSize: 36 }}>{getConfig(selected.subject).icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ ...styles.detailSubject, color: getConfig(selected.subject).color }}>
                      {selected.subject}
                    </p>
                    <h2 style={styles.detailTitle}>{selected.title}</h2>
                    <p style={styles.detailTeacher}>Set by: {selected.teacherName}</p>
                  </div>
                </div>
                <div style={styles.detailMeta}>
                  <span style={styles.metaChip}>🎯 {selected.totalMarks} marks</span>
                  {selected.dueDate && (
                    <span style={{
                      ...styles.metaChip,
                      background: new Date(selected.dueDate) < new Date() ? '#FDEDEC' : '#EAFAF1',
                      color:      new Date(selected.dueDate) < new Date() ? '#E74C3C' : '#27AE60',
                    }}>
                      📅 Due: {new Date(selected.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={styles.descriptionCard}>
                <h3 style={styles.descTitle}>📋 Assignment Description</h3>
                <p style={styles.descText}>{selected.description}</p>
              </div>

              {/* If already graded show result */}
              {selected.submission?.status === 'graded' && (
                <div style={styles.gradedCard}>
                  <h3 style={styles.gradedTitle}>✅ Assignment Graded!</h3>
                  <div style={styles.gradeRow}>
                    <div style={styles.gradeBox}>
                      <p style={styles.gradeValue}>{selected.submission.marks}</p>
                      <p style={styles.gradeLabel}>Marks</p>
                    </div>
                    <div style={styles.gradeBox}>
                      <p style={styles.gradeValue}>{selected.totalMarks}</p>
                      <p style={styles.gradeLabel}>Total</p>
                    </div>
                    <div style={styles.gradeBox}>
                      <p style={styles.gradeValue}>
                        {Math.round((selected.submission.marks / selected.totalMarks) * 100)}%
                      </p>
                      <p style={styles.gradeLabel}>Score</p>
                    </div>
                  </div>
                  {selected.submission.feedback && (
                    <div style={styles.feedbackBox}>
                      <p style={styles.feedbackTitle}>💬 Teacher Feedback:</p>
                      <p style={styles.feedbackText}>{selected.submission.feedback}</p>
                    </div>
                  )}
                  <div style={styles.submittedAnswer}>
                    <p style={styles.submittedTitle}>Your Answer:</p>
                    <p style={styles.submittedText}>{selected.submission.answerText}</p>
                  </div>
                </div>
              )}

              {/* If submitted but not graded */}
              {selected.submission?.status === 'submitted' && (
                <div style={styles.submittedCard}>
                  <p style={{ color: '#2E86AB', fontWeight: 'bold', margin: '0 0 8px' }}>
                    📤 Assignment Submitted — Awaiting grading
                  </p>
                  <div style={styles.submittedAnswer}>
                    <p style={styles.submittedTitle}>Your Answer:</p>
                    <p style={styles.submittedText}>{selected.submission.answerText}</p>
                  </div>
                </div>
              )}

              {/* Submit form if not submitted */}
              {!selected.submission && (
                <div style={styles.submitCard}>
                  <h3 style={styles.submitTitle}>✍️ Your Answer</h3>
                  <p style={styles.submitHint}>
                    Type your answer below. Be detailed and clear in your response.
                  </p>
                  {submitMsg && (
                    <div style={{
                      ...styles.submitMsg,
                      background: submitMsg.includes('✅') ? '#EAFAF1' : '#FDEDEC',
                      color:      submitMsg.includes('✅') ? '#27AE60' : '#E74C3C',
                    }}>
                      {submitMsg}
                    </div>
                  )}
                  <textarea
                    style={styles.answerInput}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your detailed answer here..."
                    rows={10}
                  />
                  <div style={styles.charCount}>
                    {answer.length} characters
                  </div>
                  <button
                    style={{
                      ...styles.submitBtn,
                      opacity: (!answer.trim() || submitting) ? 0.6 : 1
                    }}
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                  >
                    {submitting ? 'Submitting...' : '📤 Submit Assignment'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ── Assignment Grid ────────────────────
            <>
              {/* Stats */}
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <p style={styles.statVal}>{assignments.length}</p>
                  <p style={styles.statLbl}>Total</p>
                </div>
                <div style={styles.statBox}>
                  <p style={{ ...styles.statVal, color: '#27AE60' }}>
                    {assignments.filter(a => a.submission).length}
                  </p>
                  <p style={styles.statLbl}>Submitted</p>
                </div>
                <div style={styles.statBox}>
                  <p style={{ ...styles.statVal, color: '#E74C3C' }}>
                    {assignments.filter(a => !a.submission).length}
                  </p>
                  <p style={styles.statLbl}>Pending</p>
                </div>
                <div style={styles.statBox}>
                  <p style={{ ...styles.statVal, color: '#F39C12' }}>
                    {assignments.filter(a => a.submission?.status === 'graded').length}
                  </p>
                  <p style={styles.statLbl}>Graded</p>
                </div>
              </div>

              {/* Subject Groups */}
              {Object.entries(grouped).map(([subject, subAssignments]) => {
                const cfg = getConfig(subject);
                return (
                  <div key={subject} style={styles.subjectSection}>
                    <div style={styles.subjectHeader}>
                      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                      <p style={{ ...styles.subjectName, color: cfg.color }}>{subject}</p>
                      <span style={styles.subjectCount}>
                        {subAssignments.length} assignment{subAssignments.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {subAssignments.map(assignment => {
                      const sb      = statusBadge(assignment.submission);
                      const isOverdue = assignment.dueDate &&
                        new Date(assignment.dueDate) < new Date() &&
                        !assignment.submission;

                      return (
                        <div
                          key={assignment.id}
                          style={styles.assignmentCard}
                          onClick={() => {
                            setSelected(assignment);
                            setAnswer(assignment.submission?.answerText || '');
                          }}
                        >
                          <div style={styles.cardTop}>
                            <p style={styles.assignmentTitle}>{assignment.title}</p>
                            <span style={{ ...styles.statusChip, background: sb.bg, color: sb.color }}>
                              {sb.label}
                            </span>
                          </div>
                          <p style={styles.assignmentDesc}>
                            {assignment.description.substring(0, 100)}
                            {assignment.description.length > 100 ? '...' : ''}
                          </p>
                          <div style={styles.cardMeta}>
                            <span style={styles.metaItem}>
                              👨‍🏫 {assignment.teacherName}
                            </span>
                            <span style={styles.metaItem}>
                              🎯 {assignment.totalMarks} marks
                            </span>
                            {assignment.dueDate && (
                              <span style={{
                                ...styles.metaItem,
                                color: isOverdue ? '#E74C3C' : '#555'
                              }}>
                                📅 {isOverdue ? 'Overdue! ' : ''}
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {assignment.submission?.status === 'graded' && (
                            <div style={styles.gradePreview}>
                              Score: {assignment.submission.marks}/{assignment.totalMarks} (
                              {Math.round((assignment.submission.marks / assignment.totalMarks) * 100)}%)
                            </div>
                          )}
                          <p style={{ ...styles.tapHint, color: cfg.color }}>
                            Tap to {assignment.submission ? 'view' : 'submit'} →
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
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
  backBtn:             { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '4px 0', marginBottom: 12 },

  // Stats
  statsRow:            { display: 'flex', gap: 10, marginBottom: 16 },
  statBox:             { flex: 1, background: '#fff', borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statVal:             { fontSize: 22, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  statLbl:             { fontSize: 10, color: '#888', margin: '3px 0 0' },

  // Subject Section
  subjectSection:      { marginBottom: 16 },
  subjectHeader:       { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  subjectName:         { fontSize: 15, fontWeight: 'bold', margin: 0, flex: 1 },
  subjectCount:        { fontSize: 12, color: '#888' },

  // Assignment Card
  assignmentCard:      { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardTop:             { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  assignmentTitle:     { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: 0, flex: 1 },
  statusChip:          { fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 6, flexShrink: 0 },
  assignmentDesc:      { fontSize: 13, color: '#666', margin: '0 0 10px', lineHeight: 1.5 },
  cardMeta:            { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 },
  metaItem:            { fontSize: 12, color: '#555' },
  gradePreview:        { fontSize: 13, color: '#27AE60', fontWeight: 'bold', background: '#EAFAF1', padding: '6px 10px', borderRadius: 6, marginBottom: 6 },
  tapHint:             { fontSize: 11, margin: 0, opacity: 0.7 },

  // Detail View
  assignmentDetailCard:{ borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  detailTop:           { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  detailSubject:       { fontSize: 12, fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' },
  detailTitle:         { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  detailTeacher:       { fontSize: 12, color: '#888', margin: 0 },
  detailMeta:          { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaChip:            { background: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' },

  // Description
  descriptionCard:     { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  descTitle:           { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 10px' },
  descText:            { fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 },

  // Graded
  gradedCard:          { background: '#EAFAF1', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #27AE60' },
  gradedTitle:         { fontSize: 16, fontWeight: 'bold', color: '#27AE60', margin: '0 0 16px' },
  gradeRow:            { display: 'flex', gap: 12, marginBottom: 16 },
  gradeBox:            { flex: 1, background: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center' },
  gradeValue:          { fontSize: 24, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  gradeLabel:          { fontSize: 11, color: '#888', margin: '4px 0 0' },
  feedbackBox:         { background: '#fff', borderRadius: 8, padding: 14, marginBottom: 12 },
  feedbackTitle:       { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  feedbackText:        { fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 },

  // Submitted
  submittedCard:       { background: '#EAF4FB', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #2E86AB' },
  submittedAnswer:     { background: '#fff', borderRadius: 8, padding: 14, marginTop: 8 },
  submittedTitle:      { fontSize: 12, fontWeight: 'bold', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' },
  submittedText:       { fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 },

  // Submit Form
  submitCard:          { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  submitTitle:         { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  submitHint:          { fontSize: 13, color: '#888', margin: '0 0 16px' },
  submitMsg:           { padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14 },
  answerInput:         { width: '100%', padding: '14px', border: '2px solid #ddd', borderRadius: 10, fontSize: 14, lineHeight: 1.6, resize: 'vertical', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' },
  charCount:           { fontSize: 12, color: '#888', textAlign: 'right', margin: '6px 0 12px' },
  submitBtn:           { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', border: 'none' },
};

export default Assignments;