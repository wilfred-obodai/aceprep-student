import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamQuestions, submitExam } from '../services/api';
import BottomNav from '../components/BottomNav';

const TakeExam = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [exam,         setExam]         = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [attemptId,    setAttemptId]    = useState(null);
  const [answers,      setAnswers]      = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState('');
  const startTime = useRef(Date.now());
  const timerRef  = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getExamQuestions(id);
        if (res.data.success) {
          setExam(res.data.exam);
          setQuestions(res.data.questions);
          setAttemptId(res.data.attemptId);
          setTimeLeft(res.data.exam.durationMins * 60);
        } else {
          setError(res.data.message || 'Failed to load exam');
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || !exam) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [exam]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, letter) => {
    setAnswers(prev => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    if (!autoSubmit) {
      const unanswered = questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        const confirm = window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        if (!confirm) return;
      }
    }

    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      const res = await submitExam(id, { attemptId, answers, timeTaken });
      if (res.data.success) setResult(res.data.result);
    } catch (e) {
      setError('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  // ── Result Screen ─────────────────────────────
  if (result) {
    const pct    = parseFloat(result.percentage);
    const passed = pct >= 50;
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 220, flex: 1 }}>
          <div style={styles.resultContainer}>
            <div style={{ fontSize: 64, textAlign: 'center' }}>
              {passed ? '🎉' : '📚'}
            </div>
            <h2 style={{ textAlign: 'center', color: '#1A5276', margin: '16px 0 8px' }}>
              {passed ? 'Well Done!' : 'Keep Studying!'}
            </h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
              {exam?.title}
            </p>
            <div style={{
              ...styles.scoreCircle,
              background: passed ? '#EAFAF1' : '#FDEDEC',
              border: `4px solid ${passed ? '#27AE60' : '#E74C3C'}`
            }}>
              <p style={{ fontSize: 36, fontWeight: 'bold', color: passed ? '#27AE60' : '#E74C3C', margin: 0 }}>
                {result.gradeLetter}
              </p>
              <p style={{ fontSize: 20, fontWeight: 'bold', color: passed ? '#27AE60' : '#E74C3C', margin: 0 }}>
                {pct}%
              </p>
            </div>
            <div style={styles.resultDetails}>
              <ResultRow label="Score"      value={`${result.score} / ${result.totalMarks}`} />
              <ResultRow label="Percentage" value={`${pct}%`} />
              <ResultRow label="Grade"      value={result.gradeLetter} />
              <ResultRow label="Time Taken" value={`${Math.floor(result.timeTaken / 60)} mins ${result.timeTaken % 60} secs`} />
            </div>
            <button style={styles.doneBtn} onClick={() => navigate('/exams')}>
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error Screen ──────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 220, flex: 1 }}>
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 48 }}>❌</p>
            <h3 style={{ color: '#E74C3C', margin: '16px 0 8px' }}>Error</h3>
            <p style={{ color: '#555' }}>{error}</p>
            <button style={styles.doneBtn} onClick={() => navigate('/exams')}>
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading Screen ────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
        <BottomNav />
        <div style={{ marginLeft: 220, flex: 1, textAlign: 'center' }}>
          <p style={{ color: '#888' }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  const question   = questions[currentIndex];
  const answered   = Object.keys(answers).length;
  const timerColor = timeLeft < 60 ? '#E74C3C' : timeLeft < 300 ? '#F39C12' : '#27AE60';

  // ── Exam Screen ───────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <BottomNav />
      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <div style={styles.examHeader}>
          <div style={styles.examHeaderTop}>
            <div>
              <p style={styles.examTitle}>{exam?.title}</p>
              <p style={styles.examSubject}>{exam?.subject}</p>
            </div>
            <div style={{ ...styles.timer, color: timerColor, borderColor: timerColor }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          <div style={styles.progressInfo}>
            <span style={{ color: '#AED6F1', fontSize: 13 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ color: '#AED6F1', fontSize: 13 }}>
              Answered: {answered}/{questions.length}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${((currentIndex + 1) / questions.length) * 100}%`
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={styles.content}>
          <div style={styles.questionCard}>
            <p style={styles.questionNumber}>Question {currentIndex + 1}</p>
            <p style={styles.questionText}>{question.questionText}</p>
          </div>

          {/* Options */}
          {['A', 'B', 'C', 'D'].map(letter => {
            const text       = question.options[letter];
            const isSelected = answers[question.id] === letter;
            return (
              <div
                key={letter}
                style={{
                  ...styles.optionCard,
                  background:  isSelected ? '#EAF4FB' : '#fff',
                  borderColor: isSelected ? '#2E86AB' : '#eee',
                  borderWidth: isSelected ? 2 : 1,
                }}
                onClick={() => handleAnswer(question.id, letter)}
              >
                <div style={{
                  ...styles.optionBadge,
                  background: isSelected ? '#2E86AB' : '#f0f0f0',
                  color:      isSelected ? '#fff' : '#555',
                }}>
                  {letter}
                </div>
                <p style={{ margin: 0, fontSize: 15, color: '#333', flex: 1 }}>{text}</p>
                {isSelected && <span style={{ color: '#2E86AB', fontSize: 18 }}>✓</span>}
              </div>
            );
          })}

          {/* Navigation */}
          <div style={styles.navRow}>
            <button
              style={{ ...styles.navBtn, opacity: currentIndex === 0 ? 0.4 : 1 }}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                style={{ ...styles.navBtn, background: '#2E86AB', color: '#fff' }}
                onClick={() => setCurrentIndex(i => i + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                style={{ ...styles.navBtn, background: '#27AE60', color: '#fff' }}
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '✅ Submit Exam'}
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div style={styles.questionNav}>
            <p style={styles.navLabel}>Jump to question:</p>
            <div style={styles.navGrid}>
              {questions.map((q, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.navDot,
                    background: answers[q.id]
                      ? '#2E86AB'
                      : i === currentIndex
                      ? '#1A5276'
                      : '#e0e0e0',
                    color: answers[q.id] || i === currentIndex ? '#fff' : '#333',
                  }}
                  onClick={() => setCurrentIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            style={styles.submitBtn}
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : `✅ Submit Exam (${answered}/${questions.length} answered)`}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
    <span style={{ color: '#1A5276', fontSize: 14, fontWeight: 'bold' }}>{value}</span>
  </div>
);

const styles = {
  examHeader:     { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '20px 24px 16px' },
  examHeaderTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examTitle:      { fontSize: 16, fontWeight: 'bold', color: '#fff', margin: '0 0 4px' },
  examSubject:    { fontSize: 13, color: '#AED6F1', margin: 0 },
  timer:          { fontSize: 18, fontWeight: 'bold', padding: '8px 12px', borderRadius: 8, border: '2px solid', background: 'rgba(255,255,255,0.1)' },
  progressInfo:   { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  progressBar:    { height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: '100%', background: '#F39C12', borderRadius: 3, transition: 'width 0.3s' },
  content:        { padding: 16 },
  questionCard:   { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  questionNumber: { fontSize: 12, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px' },
  questionText:   { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0, lineHeight: 1.5 },
  optionCard:     { display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, marginBottom: 8, cursor: 'pointer', border: '1px solid #eee', background: '#fff' },
  optionBadge:    { width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 },
  navRow:         { display: 'flex', gap: 12, margin: '16px 0' },
  navBtn:         { flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', color: '#555' },
  questionNav:    { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  navLabel:       { fontSize: 13, color: '#888', margin: '0 0 10px' },
  navGrid:        { display: 'flex', flexWrap: 'wrap', gap: 8 },
  navDot:         { width: 36, height: 36, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  submitBtn:      { width: '100%', padding: 16, background: '#27AE60', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', border: 'none', marginBottom: 24 },
  resultContainer:{ padding: '40px 24px', maxWidth: 500, margin: '0 auto' },
  scoreCircle:    { width: 130, height: 130, borderRadius: 65, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  resultDetails:  { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  doneBtn:        { width: '100%', padding: 14, background: '#2E86AB', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', border: 'none' },
};

export default TakeExam;