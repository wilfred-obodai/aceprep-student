import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const subjects = ['Mathematics','English Language','Integrated Science','Social Studies','ICT','Physics','Chemistry','Biology','Economics'];

const PastQuestions = () => {
  const [view,       setView]       = useState('subjects'); // subjects | years | pdf | mcq
  const [subject,    setSubject]    = useState('');
  const [year,       setYear]       = useState('');
  const [pdfs,       setPdfs]       = useState([]);
  const [questions,  setQuestions]  = useState([]);
  const [selPdf,     setSelPdf]     = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingQ,   setLoadingQ]   = useState(false);

  // AI Tutor state
  const [showAI,     setShowAI]     = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput,    setAiInput]    = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const [sessionId]                 = useState(() => `session_${Date.now()}`);
  const chatEndRef                  = useRef(null);

  const years = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015];

  // Load PDFs when subject+year selected
  useEffect(() => {
    if (subject && year) {
      loadContent();
    }
  // eslint-disable-next-line
  }, [subject, year]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const loadContent = async () => {
    setLoadingPdf(true);
    setLoadingQ(true);
    try {
      const [pdfRes, qRes] = await Promise.all([
        API.get('/past-questions-pdf', { params: { subject, exam_year: year } }),
        API.get('/questions', { params: { subject, exam_year: year } }),
      ]);
      setPdfs(pdfRes.data.pdfs || []);
      setQuestions(qRes.data.questions || []);
      setView(pdfRes.data.pdfs?.length > 0 ? 'pdf' : 'mcq');
    } catch (e) { console.error(e); }
    finally { setLoadingPdf(false); setLoadingQ(false); }
  };

  const sendAIMessage = async (customMsg) => {
    const msg = customMsg || aiInput.trim();
    if (!msg) return;
    setAiInput('');
    setAiLoading(true);

    const userMsg = { role: 'user', message: msg };
    setAiMessages(prev => [...prev, userMsg]);

    // Save user message
    try {
      await API.post('/ai-tutor-history/save', {
        session_id:  sessionId,
        role:        'user',
        message:     msg,
        pdf_context: selPdf ? `${subject} ${year} Past Questions` : null,
      });
    } catch (e) { console.error(e); }

    try {
      const context = selPdf
        ? `You are AcePrep AI Tutor helping a Ghanaian student with ${subject} ${year} BECE/WASSCE past questions. The student is viewing the actual past question paper. Help them understand the questions and provide clear explanations. Be encouraging and use simple language suitable for JHS/SHS students in Ghana.`
        : `You are AcePrep AI Tutor helping a Ghanaian student with ${subject}. Be encouraging and use simple language suitable for JHS/SHS students in Ghana.`;

      const res = await API.post('/ai/chat', {
        messages: [
          { role: 'user', content: context + '\n\nStudent question: ' + msg }
        ]
      });

      const aiReply = res.data.message || 'Sorry, I could not answer that. Please try again.';
      const aiMsg   = { role: 'assistant', message: aiReply };
      setAiMessages(prev => [...prev, aiMsg]);

      // Save AI response
      await API.post('/ai-tutor-history/save', {
        session_id: sessionId,
        role:       'assistant',
        message:    aiReply,
      });
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'assistant', message: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // ── SUBJECTS VIEW ──────────────────────────
  if (view === 'subjects') {
    return (
      <div style={styles.container}>
        <BottomNav />
        <div style={styles.main}>
          <div style={styles.header}>
            <h1 style={styles.title}>📚 Past Questions</h1>
            <p style={styles.subtitle}>Select a subject to start practicing</p>
          </div>
          <div style={styles.content}>
            <div style={styles.subjectGrid}>
              {subjects.map((s, i) => (
                <div key={s} style={{ ...styles.subjectCard, borderTop: `4px solid ${subjectColors[i % subjectColors.length]}` }}
                  onClick={() => { setSubject(s); setView('years'); }}>
                  <span style={{ fontSize: 32 }}>{subjectIcons[s] || '📖'}</span>
                  <p style={styles.subjectName}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── YEARS VIEW ─────────────────────────────
  if (view === 'years') {
    return (
      <div style={styles.container}>
        <BottomNav />
        <div style={styles.main}>
          <div style={styles.header}>
            <button onClick={() => setView('subjects')} style={styles.backBtn}>← Back</button>
            <h1 style={styles.title}>{subject}</h1>
            <p style={styles.subtitle}>Select a year</p>
          </div>
          <div style={styles.content}>
            <div style={styles.yearGrid}>
              {years.map(y => (
                <div key={y} style={styles.yearCard}
                  onClick={() => { setYear(y); }}>
                  <span style={{ fontSize: 28 }}>📅</span>
                  <p style={styles.yearNum}>{y}</p>
                  <p style={styles.yearLabel}>BECE/WASSCE</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PDF + MCQ VIEW ─────────────────────────
  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => { setView('years'); setSelPdf(null); }} style={styles.backBtn}>← Back</button>
          <h1 style={styles.title}>{subject} — {year}</h1>
          <p style={styles.subtitle}>Past Questions</p>
        </div>

        {/* Tab Toggle */}
        {pdfs.length > 0 && questions.length > 0 && (
          <div style={styles.tabs}>
            <button style={{ ...styles.tab, ...(view === 'pdf' ? styles.tabActive : {}) }}
              onClick={() => setView('pdf')}>📄 PDF Paper</button>
            <button style={{ ...styles.tab, ...(view === 'mcq' ? styles.tabActive : {}) }}
              onClick={() => setView('mcq')}>📝 Practice MCQ</button>
          </div>
        )}

        <div style={styles.contentRow}>
          {/* Main Content */}
          <div style={{ flex: 1 }}>

            {/* PDF View */}
            {view === 'pdf' && (
              <div style={styles.pdfSection}>
                {loadingPdf ? (
                  <p style={styles.center}>Loading PDFs...</p>
                ) : pdfs.length === 0 ? (
                  <div style={styles.noPdf}>
                    <p style={{ fontSize: 48 }}>📄</p>
                    <p style={{ color: '#888' }}>No PDF available for this year yet.</p>
                    <button style={styles.switchBtn} onClick={() => setView('mcq')}>
                      Switch to MCQ Practice →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* PDF selector if multiple */}
                    {pdfs.length > 1 && (
                      <div style={styles.pdfList}>
                        {pdfs.map(pdf => (
                          <button key={pdf.id}
                            style={{ ...styles.pdfChip, ...(selPdf?.id === pdf.id ? styles.pdfChipActive : {}) }}
                            onClick={() => setSelPdf(pdf)}>
                            📄 {pdf.file_name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* PDF Viewer */}
                    <div style={styles.pdfViewer}>
                      <iframe
                        src={`http://localhost:5000${(selPdf || pdfs[0])?.file_url}`}
                        style={styles.pdfFrame}
                        title="Past Questions PDF"
                      />
                    </div>

                    {/* Stuck Button */}
                    <div style={styles.stuckBar}>
                      <p style={styles.stuckText}>😕 Stuck on a question?</p>
                      <button style={styles.stuckBtn} onClick={() => {
                        setSelPdf(selPdf || pdfs[0]);
                        setShowAI(true);
                        if (aiMessages.length === 0) {
                          sendAIMessage(`I am looking at the ${subject} ${year} past questions paper. Please introduce yourself and tell me how you can help me.`);
                        }
                      }}>
                        🤖 Ask AI Tutor
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MCQ View */}
            {view === 'mcq' && (
              <MCQPractice
                questions={questions}
                loading={loadingQ}
                subject={subject}
                year={year}
                onAskAI={(q) => {
                  setShowAI(true);
                  sendAIMessage(`Please explain this question from the ${subject} ${year} past questions: "${q}"`);
                }}
              />
            )}
          </div>

          {/* AI Tutor Panel */}
          {showAI && (
            <div style={styles.aiPanel}>
              <div style={styles.aiHeader}>
                <span style={styles.aiTitle}>🤖 AI Tutor</span>
                <button onClick={() => setShowAI(false)} style={styles.aiClose}>✕</button>
              </div>
              <div style={styles.aiMessages}>
                {aiMessages.length === 0 && (
                  <div style={styles.aiWelcome}>
                    <p style={{ fontSize: 32 }}>🤖</p>
                    <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                      Ask me anything about this paper!
                    </p>
                  </div>
                )}
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ ...styles.aiMsg, ...(m.role === 'user' ? styles.aiMsgUser : styles.aiMsgBot) }}>
                    {m.role === 'assistant' && <span style={styles.botIcon}>🤖</span>}
                    <p style={styles.aiMsgText}>{m.message}</p>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ ...styles.aiMsg, ...styles.aiMsgBot }}>
                    <span style={styles.botIcon}>🤖</span>
                    <p style={styles.aiMsgText}>Thinking... ⏳</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={styles.aiInput}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Ask about any question..."
                  style={styles.aiInputField}
                />
                <button onClick={() => sendAIMessage()} style={styles.aiSendBtn} disabled={aiLoading}>
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MCQ Practice Component ─────────────────────
const MCQPractice = ({ questions, loading, subject, year, onAskAI }) => {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [showResult, setShowResult] = useState(false);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading questions...</p>;
  if (questions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ fontSize: 48 }}>📝</p>
      <p style={{ color: '#888' }}>No MCQ questions available for this year yet.</p>
    </div>
  );

  if (showResult) {
    const score = answered.filter(a => a.correct).length;
    const pct   = Math.round((score / questions.length) * 100);
    return (
      <div style={styles.resultCard}>
        <p style={{ fontSize: 56 }}>{pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '📚'}</p>
        <h2 style={{ color: '#1A5276', margin: '12px 0 8px' }}>
          {score}/{questions.length} Correct
        </h2>
        <p style={{ fontSize: 28, fontWeight: 'bold', color: pct >= 70 ? '#006B3F' : pct >= 50 ? '#b8860b' : '#CE1126' }}>
          {pct}%
        </p>
        <p style={{ color: '#888', marginBottom: 24 }}>
          {pct >= 70 ? 'Excellent! Keep it up!' : pct >= 50 ? 'Good effort! Review and try again.' : 'Keep practicing — you can do it!'}
        </p>
        <button style={styles.retryBtn} onClick={() => { setCurrent(0); setSelected(null); setAnswered([]); setShowResult(false); }}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={styles.mcqCard}>
      {/* Progress */}
      <div style={styles.mcqProgress}>
        <div style={styles.mcqProgressBar}>
          <div style={{ ...styles.mcqProgressFill, width: `${((current) / questions.length) * 100}%` }} />
        </div>
        <span style={styles.mcqCount}>{current + 1}/{questions.length}</span>
      </div>

      {/* Section badge */}
      {q.section && (
        <span style={styles.sectionBadge}>{q.section}</span>
      )}

      {/* Question */}
      <p style={styles.mcqQuestion}>{q.question_text}</p>

      {/* Options */}
      <div style={styles.options}>
        {['A','B','C','D'].map(letter => {
          const optKey  = `option_${letter.toLowerCase()}`;
          const isRight = letter === q.correct_answer;
          const isPicked = selected === letter;
          let bg = '#f8f9fa';
          let border = '1.5px solid #eee';
          let color = '#333';
          if (selected) {
            if (isRight)  { bg = '#EAFAF1'; border = '2px solid #006B3F'; color = '#006B3F'; }
            if (isPicked && !isRight) { bg = '#FDEDEC'; border = '2px solid #CE1126'; color = '#CE1126'; }
          }
          return (
            <div key={letter} style={{ ...styles.option, background: bg, border, color }}
              onClick={() => !selected && setSelected(letter)}>
              <span style={styles.optionLetter}>{letter}</span>
              <span style={styles.optionText}>{q[optKey]}</span>
              {selected && isRight  && <span style={{ marginLeft: 'auto', color: '#006B3F', fontWeight: 'bold' }}>✓</span>}
              {selected && isPicked && !isRight && <span style={{ marginLeft: 'auto', color: '#CE1126', fontWeight: 'bold' }}>✗</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {selected && q.explanation && (
        <div style={styles.explanation}>
          <span>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: '#7D6608', lineHeight: 1.5 }}>{q.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div style={styles.mcqActions}>
        <button style={styles.askAIBtn}
          onClick={() => onAskAI(q.question_text)}>
          🤖 Ask AI Tutor
        </button>
        {selected && (
          <button style={styles.nextBtn}
            onClick={() => {
              setAnswered(prev => [...prev, { correct: selected === q.correct_answer }]);
              setSelected(null);
              if (current + 1 >= questions.length) setShowResult(true);
              else setCurrent(prev => prev + 1);
            }}>
            {current + 1 >= questions.length ? 'See Results 🏆' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
};

const subjectColors = ['#2E86AB','#27AE60','#E74C3C','#F39C12','#8E44AD','#1ABC9C','#E67E22','#2ECC71','#3498DB'];
const subjectIcons = {
  'Mathematics': '🔢', 'English Language': '📖', 'Integrated Science': '🔬',
  'Social Studies': '🌍', 'ICT': '💻', 'Physics': '⚡', 'Chemistry': '🧪',
  'Biology': '🧬', 'Economics': '💰',
};

const styles = {
  container:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 235, flex: 1, display: 'flex', flexDirection: 'column' },
  header:          { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px 20px', position: 'relative' },
  title:           { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:        { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  backBtn:         { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', marginBottom: 8 },
  content:         { padding: 16 },
  contentRow:      { display: 'flex', gap: 0, flex: 1 },
  subjectGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  subjectCard:     { background: '#fff', borderRadius: 14, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s' },
  subjectName:     { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: '10px 0 0' },
  yearGrid:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  yearCard:        { background: '#fff', borderRadius: 14, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  yearNum:         { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '8px 0 4px' },
  yearLabel:       { fontSize: 12, color: '#888', margin: 0 },
  tabs:            { display: 'flex', gap: 0, background: '#fff', borderBottom: '2px solid #eee' },
  tab:             { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:       { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  pdfSection:      { padding: 16 },
  pdfList:         { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  pdfChip:         { background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  pdfChipActive:   { background: '#2E86AB', color: '#fff', border: '1px solid #2E86AB' },
  pdfViewer:       { borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  pdfFrame:        { width: '100%', height: '70vh', border: 'none' },
  stuckBar:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: '14px 20px', marginTop: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  stuckText:       { fontSize: 15, color: '#555', margin: 0, fontWeight: 'bold' },
  stuckBtn:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  noPdf:           { textAlign: 'center', padding: '40px 20px' },
  switchBtn:       { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', marginTop: 12 },
  center:          { textAlign: 'center', color: '#888', padding: 40 },
  aiPanel:         { width: 340, background: '#fff', borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', position: 'sticky', top: 0 },
  aiHeader:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px', background: 'linear-gradient(135deg, #1A5276, #2E86AB)', flexShrink: 0 },
  aiTitle:         { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  aiClose:         { background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' },
  aiMessages:      { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  aiWelcome:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
  aiMsg:           { display: 'flex', gap: 8, maxWidth: '90%' },
  aiMsgUser:       { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiMsgBot:        { alignSelf: 'flex-start' },
  aiMsgText:       { background: '#f0f4f8', borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.6, margin: 0, color: '#333' },
  botIcon:         { fontSize: 20, flexShrink: 0 },
  aiInput:         { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #eee', flexShrink: 0 },
  aiInputField:    { flex: 1, padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 20, fontSize: 14, outline: 'none' },
  aiSendBtn:       { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 20, width: 40, height: 40, fontSize: 16, cursor: 'pointer', flexShrink: 0 },
  mcqCard:         { background: '#fff', borderRadius: 16, padding: 20, margin: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  mcqProgress:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  mcqProgressBar:  { flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  mcqProgressFill: { height: '100%', background: 'linear-gradient(90deg, #006B3F, #2E86AB)', borderRadius: 4, transition: 'width 0.3s' },
  mcqCount:        { fontSize: 13, color: '#888', fontWeight: 'bold', whiteSpace: 'nowrap' },
  sectionBadge:    { display: 'inline-block', background: '#EAF4FB', color: '#2E86AB', fontSize: 12, fontWeight: 'bold', padding: '4px 12px', borderRadius: 20, marginBottom: 12 },
  mcqQuestion:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', lineHeight: 1.6, margin: '0 0 16px' },
  options:         { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  option:          { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' },
  optionLetter:    { width: 28, height: 28, borderRadius: 14, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold', flexShrink: 0 },
  optionText:      { fontSize: 14, lineHeight: 1.4, flex: 1 },
  explanation:     { display: 'flex', gap: 10, background: '#FEF9E7', borderRadius: 10, padding: '12px 14px', marginBottom: 16, alignItems: 'flex-start' },
  mcqActions:      { display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' },
  askAIBtn:        { background: '#EAF4FB', color: '#2E86AB', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  nextBtn:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  resultCard:      { background: '#fff', borderRadius: 16, padding: '40px 24px', margin: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  retryBtn:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
};

export default PastQuestions;