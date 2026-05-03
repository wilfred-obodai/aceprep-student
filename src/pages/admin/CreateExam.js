import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { createExam } from '../../services/api';

const emptyQuestion = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1,
});

const CreateExam = () => {
  const navigate = useNavigate();

  // Exam details
  const [title,        setTitle]        = useState('');
  const [subject,      setSubject]      = useState('Mathematics');
  const [instructions, setInstructions] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [level,        setLevel]        = useState('SHS');
  const [yearGroup,    setYearGroup]    = useState('2');
  const [className,    setClassName]    = useState('');
  const [startsAt,     setStartsAt]     = useState('');
  const [endsAt,       setEndsAt]       = useState('');

  // Questions
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const subjects = [
    'Mathematics', 'English Language', 'Integrated Science',
    'Social Studies', 'ICT', 'General Science', 'General Arts',
    'Business Studies', 'Economics', 'Physics', 'Chemistry', 'Biology'
  ];

  // ── Question handlers ──────────────────────────
  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index) => {
    const copy = { ...questions[index] };
    const updated = [...questions];
    updated.splice(index + 1, 0, copy);
    setQuestions(updated);
  };

  // ── Validate ───────────────────────────────────
  const validate = () => {
    if (!title.trim()) return 'Exam title is required';
    if (!subject)      return 'Subject is required';
    if (durationMins < 1) return 'Duration must be at least 1 minute';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question ${i+1}: Question text is required`;
      if (!q.optionA.trim())      return `Question ${i+1}: Option A is required`;
      if (!q.optionB.trim())      return `Question ${i+1}: Option B is required`;
      if (!q.optionC.trim())      return `Question ${i+1}: Option C is required`;
      if (!q.optionD.trim())      return `Question ${i+1}: Option D is required`;
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────
  const handleSubmit = async (publish) => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      const res = await createExam({
        title,
        subject,
        instructions,
        durationMins: parseInt(durationMins),
        level,
        yearGroup:  parseInt(yearGroup),
        className:  className || undefined,
        startsAt:   publish && startsAt ? startsAt : undefined,
        endsAt:     publish && endsAt   ? endsAt   : undefined,
        questions,
      });

      if (res.data.success) {
        setSuccess(`Exam "${title}" ${publish ? 'published' : 'saved as draft'} successfully!`);
        setTimeout(() => navigate('/admin/exams'), 2000);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Create New Exam</h1>
            <p style={styles.pageSubtitle}>Set questions, duration and assign to a class</p>
          </div>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/admin/exams')}
          >
            ← Back to Exams
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}
        {success && (
          <div style={styles.successBox}>✅ {success}</div>
        )}

        <div style={styles.grid}>
          {/* ── LEFT: Exam Details ── */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Exam Details</h2>

              <Field label="Exam Title *">
                <input
                  style={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mathematics Mid-Term Exam"
                />
              </Field>

              <Field label="Subject *">
                <select
                  style={styles.input}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Instructions (shown to students)">
                <textarea
                  style={{ ...styles.input, height: 80, resize: 'vertical' }}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Answer all questions. Each question carries 1 mark."
                />
              </Field>

              <div style={styles.row}>
                <Field label="Duration (minutes) *" style={{ flex: 1 }}>
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    value={durationMins}
                    onChange={e => setDurationMins(e.target.value)}
                  />
                </Field>

                <Field label="Level *" style={{ flex: 1 }}>
                  <select
                    style={styles.input}
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                  >
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </Field>
              </div>

              <div style={styles.row}>
                <Field label="Year Group *" style={{ flex: 1 }}>
                  <select
                    style={styles.input}
                    value={yearGroup}
                    onChange={e => setYearGroup(e.target.value)}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </Field>

                <Field label="Class (Optional)" style={{ flex: 1 }}>
                  <input
                    style={styles.input}
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="e.g. 2A"
                  />
                </Field>
              </div>
            </div>

            {/* Schedule */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📅 Schedule (Optional)</h2>
              <p style={styles.cardHint}>
                Leave blank to publish immediately. Set dates to schedule the exam.
              </p>

              <div style={styles.row}>
                <Field label="Start Date & Time" style={{ flex: 1 }}>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={startsAt}
                    onChange={e => setStartsAt(e.target.value)}
                  />
                </Field>
                <Field label="End Date & Time" style={{ flex: 1 }}>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={endsAt}
                    onChange={e => setEndsAt(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Summary */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>📊 Exam Summary</h3>
              <div style={styles.summaryGrid}>
                <SummaryItem label="Questions" value={questions.length} />
                <SummaryItem label="Total Marks" value={questions.reduce((s, q) => s + (parseInt(q.marks) || 1), 0)} />
                <SummaryItem label="Duration" value={`${durationMins} mins`} />
                <SummaryItem label="Level" value={`${level} Year ${yearGroup}`} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionRow}>
              <button
                style={styles.draftBtn}
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                💾 Save as Draft
              </button>
              <button
                style={styles.publishBtn}
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                {loading ? 'Publishing...' : '🚀 Publish Exam'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Questions ── */}
          <div style={styles.rightCol}>
            <div style={styles.questionsHeader}>
              <h2 style={styles.cardTitle}>
                ❓ Questions ({questions.length})
              </h2>
              <button style={styles.addBtn} onClick={addQuestion}>
                + Add Question
              </button>
            </div>

            {questions.map((q, index) => (
              <div key={index} style={styles.questionCard}>
                {/* Question Header */}
                <div style={styles.questionHeader}>
                  <span style={styles.questionNum}>Question {index + 1}</span>
                  <div style={styles.questionActions}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => duplicateQuestion(index)}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      style={{ ...styles.actionBtn, color: '#E74C3C' }}
                      onClick={() => removeQuestion(index)}
                      title="Remove"
                      disabled={questions.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <Field label="Question Text *">
                  <textarea
                    style={{ ...styles.input, height: 70, resize: 'vertical' }}
                    value={q.questionText}
                    onChange={e => updateQuestion(index, 'questionText', e.target.value)}
                    placeholder="Type your question here..."
                  />
                </Field>

                {/* Options */}
                <div style={styles.optionsGrid}>
                  {['A', 'B', 'C', 'D'].map(letter => (
                    <Field key={letter} label={`Option ${letter} *`}>
                      <div style={styles.optionRow}>
                        <input
                          style={{
                            ...styles.input,
                            flex: 1,
                            borderColor: q.correctAnswer === letter ? '#27AE60' : '#ddd',
                            borderWidth: q.correctAnswer === letter ? 2 : 1,
                          }}
                          value={q[`option${letter}`]}
                          onChange={e => updateQuestion(index, `option${letter}`, e.target.value)}
                          placeholder={`Option ${letter}`}
                        />
                        <button
                          style={{
                            ...styles.correctBtn,
                            background: q.correctAnswer === letter ? '#27AE60' : '#f0f0f0',
                            color:      q.correctAnswer === letter ? '#fff' : '#555',
                          }}
                          onClick={() => updateQuestion(index, 'correctAnswer', letter)}
                          title="Mark as correct answer"
                        >
                          ✓
                        </button>
                      </div>
                    </Field>
                  ))}
                </div>

                {/* Marks */}
                <Field label="Marks for this question">
                  <input
                    style={{ ...styles.input, width: 80 }}
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={e => updateQuestion(index, 'marks', parseInt(e.target.value) || 1)}
                  />
                </Field>

                {/* Correct Answer Display */}
                <div style={styles.correctDisplay}>
                  ✅ Correct Answer: <strong>Option {q.correctAnswer}</strong>
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <button style={styles.addQuestionBtn} onClick={addQuestion}>
              + Add Another Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper Components ─────────────────────────────
const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div style={styles.summaryItem}>
    <p style={styles.summaryValue}>{value}</p>
    <p style={styles.summaryLabel}>{label}</p>
  </div>
);

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 240, flex: 1, padding: '28px 24px' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle:      { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  pageSubtitle:   { fontSize: 14, color: '#888', marginTop: 4 },
  backBtn:        { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontSize: 14, color: '#555', cursor: 'pointer' },
  errorBox:       { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  successBox:     { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#27AE60', fontSize: 14 },
  grid:           { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'flex-start' },
  leftCol:        { display: 'flex', flexDirection: 'column', gap: 16 },
  rightCol:       { display: 'flex', flexDirection: 'column', gap: 16 },
  card:           { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:      { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  cardHint:       { fontSize: 13, color: '#888', margin: '-8px 0 16px' },
  row:            { display: 'flex', gap: 12 },
  label:          { display: 'block', fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  input:          { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' },
  summaryCard:    { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', borderRadius: 12, padding: 20 },
  summaryTitle:   { fontSize: 16, fontWeight: 'bold', color: '#fff', margin: '0 0 16px' },
  summaryGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  summaryItem:    { background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px', textAlign: 'center' },
  summaryValue:   { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  summaryLabel:   { fontSize: 12, color: '#AED6F1', margin: '4px 0 0' },
  actionRow:      { display: 'flex', gap: 12 },
  draftBtn:       { flex: 1, padding: '12px', background: '#fff', border: '2px solid #2E86AB', borderRadius: 8, color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  publishBtn:     { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #2E86AB, #1A5276)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  questionsHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addBtn:         { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  questionCard:   { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  questionNum:    { fontSize: 15, fontWeight: 'bold', color: '#1A5276' },
  questionActions:{ display: 'flex', gap: 8 },
  actionBtn:      { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '4px 8px' },
  optionsGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '12px 0' },
  optionRow:      { display: 'flex', gap: 6 },
  correctBtn:     { padding: '0 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16 },
  correctDisplay: { fontSize: 13, color: '#27AE60', background: '#EAFAF1', padding: '8px 12px', borderRadius: 6, marginTop: 8 },
  addQuestionBtn: { width: '100%', padding: '14px', background: '#EAF4FB', border: '2px dashed #2E86AB', borderRadius: 10, color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
};

export default CreateExam;