import React, { useState, useEffect } from 'react';
import { getPastQuestions } from '../services/api';
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
  'Mathematics':        { icon: '📐', bg: '#EAF4FB', color: '#2E86AB',  years: ['2019','2020','2021','2022','2023'] },
  'English Language':   { icon: '✍️', bg: '#F5EEF8', color: '#8E44AD',  years: ['2019','2020','2021','2022','2023'] },
  'Integrated Science': { icon: '🔬', bg: '#EAFAF1', color: '#27AE60',  years: ['2019','2020','2021','2022','2023'] },
  'Social Studies':     { icon: '🌍', bg: '#FEF9E7', color: '#F39C12',  years: ['2019','2020','2021','2022','2023'] },
  'ICT':                { icon: '💻', bg: '#EBF5FB', color: '#2980B9',  years: ['2021','2022','2023'] },
  'Physics':            { icon: '⚡', bg: '#FEF9E7', color: '#E67E22',  years: ['2019','2020','2021','2022','2023'] },
  'Chemistry':          { icon: '⚗️', bg: '#FDEDEC', color: '#E74C3C',  years: ['2019','2020','2021','2022','2023'] },
  'Biology':            { icon: '🧬', bg: '#EAFAF1', color: '#1E8449',  years: ['2019','2020','2021','2022','2023'] },
  'Economics':          { icon: '📈', bg: '#EAF4FB', color: '#1A5276',  years: ['2019','2020','2021','2022','2023'] },
};

const jhsSubjects = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'ICT'];
const shsSubjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'ICT'];

const PastQuestions = () => {
  const [questions,       setQuestions]       = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [selectedLevel,   setSelectedLevel]   = useState('JHS');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedYear,    setSelectedYear]    = useState(null);

  // Quiz state
  const [quizMode,        setQuizMode]        = useState(false);
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [selectedAnswer,  setSelectedAnswer]  = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [score,           setScore]           = useState(0);
  const [quizFinished,    setQuizFinished]    = useState(false);

  const subjects = selectedLevel === 'JHS' ? jhsSubjects : shsSubjects;

  const fetchQuestions = async (subject, year) => {
    setLoading(true);
    setError('');
    try {
      const res = await getPastQuestions({
        level:    selectedLevel,
        subject,
        examYear: year || undefined,
        examType: selectedLevel === 'JHS' ? 'BECE' : 'WASSCE',
      });
      if (res.data.success) {
        setQuestions(res.data.questions);
        resetQuiz();
      }
    } catch (e) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedYear(null);
    setQuestions([]);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    fetchQuestions(selectedSubject, year);
  };

  const handleAnswer = (letter) => {
    if (selectedAnswer) return;
    setSelectedAnswer(letter);
    setShowExplanation(true);
    if (letter === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  // ── Quiz Finished ─────────────────────────────
  if (quizMode && quizFinished) {
    const pct    = Math.round((score / questions.length) * 100);
    const letter = pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : pct >= 40 ? 'E' : 'F';
    const gc     = gradeColor(letter);
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 220, flex: 1 }}>
          <div style={styles.resultScreen}>
            <div style={{ fontSize: 64, textAlign: 'center' }}>🎉</div>
            <h2 style={{ color: '#1A5276', textAlign: 'center', marginTop: 16 }}>Quiz Complete!</h2>
            <div style={{ ...styles.gradeBadge, background: gc.bg, color: gc.color, margin: '20px auto' }}>
              <p style={{ fontSize: 48, fontWeight: 'bold', margin: 0 }}>{letter}</p>
              <p style={{ fontSize: 20, margin: 0 }}>{pct}%</p>
            </div>
            <p style={{ textAlign: 'center', color: '#555', fontSize: 16, marginBottom: 20 }}>
              You scored <strong>{score}</strong> out of <strong>{questions.length}</strong>
            </p>
            <button style={styles.btn} onClick={() => { resetQuiz(); setQuizMode(false); }}>
              Try Again
            </button>
            <button
              style={{ ...styles.btn, background: '#888', marginTop: 8 }}
              onClick={() => { setQuizMode(false); resetQuiz(); setSelectedYear(null); }}
            >
              Back to Years
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Mode ─────────────────────────────────
  if (quizMode && questions.length > 0) {
    const q           = questions[currentIndex];
    const optionTexts = { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D };

    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 220, flex: 1 }}>
          <div style={styles.quizHeader}>
            <div style={styles.quizHeaderTop}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>
                Question {currentIndex + 1}/{questions.length}
              </span>
              <span style={{ color: '#AED6F1' }}>Score: {score}</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${((currentIndex + 1) / questions.length) * 100}%`
              }} />
            </div>
          </div>

          <div style={styles.quizContent}>
            <div style={styles.badgeRow}>
              <span style={styles.badge}>{q.subject}</span>
              <span style={{ ...styles.badge, background: '#F5EEF8', color: '#8E44AD' }}>
                {q.examYear} {q.examType}
              </span>
            </div>

            <div style={styles.questionCard}>
              <p style={styles.questionText}>{q.questionText}</p>
            </div>

            {['A', 'B', 'C', 'D'].map(letter => {
              const isCorrect  = letter === q.correctAnswer;
              const isSelected = letter === selectedAnswer;
              let bg = '#fff', border = '#ddd', color = '#333';
              if (showExplanation) {
                if (isCorrect)       { bg = '#EAFAF1'; border = '#27AE60'; color = '#27AE60'; }
                else if (isSelected) { bg = '#FDEDEC'; border = '#E74C3C'; color = '#E74C3C'; }
              }
              return (
                <div
                  key={letter}
                  style={{ ...styles.optionCard, background: bg, border: `2px solid ${border}` }}
                  onClick={() => handleAnswer(letter)}
                >
                  <div style={{
                    ...styles.optionLetter,
                    background: showExplanation && isCorrect ? '#27AE60'
                              : showExplanation && isSelected ? '#E74C3C' : '#2E86AB'
                  }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{letter}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, color }}>{optionTexts[letter]}</p>
                </div>
              );
            })}

            {showExplanation && (
              <div style={styles.explanationCard}>
                <p style={{
                  fontWeight: 'bold',
                  color: selectedAnswer === q.correctAnswer ? '#27AE60' : '#E74C3C',
                  margin: '0 0 8px'
                }}>
                  {selectedAnswer === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect!'}
                </p>
                {q.explanation && (
                  <p style={{ margin: 0, fontSize: 13, color: '#7D6608' }}>💡 {q.explanation}</p>
                )}
                <button style={{ ...styles.btn, marginTop: 12 }} onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <BottomNav />
      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Past Questions</h1>
          <p style={styles.headerSub}>
            {selectedSubject
              ? selectedYear
                ? `${selectedSubject} — ${selectedYear}`
                : selectedSubject
              : 'Select a subject to begin'}
          </p>
        </div>

        <div style={{ padding: 16 }}>
          {/* Level Tabs */}
          <div style={styles.levelTabs}>
            {['JHS', 'SHS'].map(l => (
              <button
                key={l}
                style={{
                  ...styles.levelTab,
                  background: selectedLevel === l ? '#2E86AB' : '#fff',
                  color:      selectedLevel === l ? '#fff' : '#555',
                }}
                onClick={() => {
                  setSelectedLevel(l);
                  setSelectedSubject(null);
                  setSelectedYear(null);
                  setQuestions([]);
                }}
              >
                {l} ({l === 'JHS' ? 'BECE' : 'WASSCE'})
              </button>
            ))}
          </div>

          {/* Back button */}
          {selectedSubject && (
            <button
              style={styles.backBtn}
              onClick={() => {
                setSelectedSubject(null);
                setSelectedYear(null);
                setQuestions([]);
              }}
            >
              ← Back to Subjects
            </button>
          )}

          {!selectedSubject ? (
            // ── Subject Grid ──────────────────────
            <>
              <h3 style={styles.sectionTitle}>Choose a Subject</h3>
              <div style={styles.subjectGrid}>
                {subjects.map(subject => {
                  const cfg = subjectConfig[subject];
                  return (
                    <div
                      key={subject}
                      style={{ ...styles.subjectCard, background: cfg.bg }}
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <span style={styles.subjectIcon}>{cfg.icon}</span>
                      <p style={{ ...styles.subjectName, color: cfg.color }}>{subject}</p>
                      <p style={styles.subjectMeta}>
                        {cfg.years.length} years available
                      </p>
                      <p style={{ ...styles.tapHint, color: cfg.color }}>Tap to explore →</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : !selectedYear ? (
            // ── Year Grid ─────────────────────────
            <>
              <div style={{ ...styles.selectedSubjectBanner, background: subjectConfig[selectedSubject]?.bg }}>
                <span style={{ fontSize: 28 }}>{subjectConfig[selectedSubject]?.icon}</span>
                <div>
                  <p style={{ ...styles.bannerTitle, color: subjectConfig[selectedSubject]?.color }}>
                    {selectedSubject}
                  </p>
                  <p style={styles.bannerSub}>Select a year to practice</p>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Select Exam Year</h3>
              <div style={styles.yearGrid}>
                <div
                  style={{ ...styles.yearCard, background: '#1A5276' }}
                  onClick={() => handleYearSelect(null)}
                >
                  <p style={styles.yearText}>All Years</p>
                  <p style={styles.yearSub}>Mixed practice</p>
                </div>
                {(subjectConfig[selectedSubject]?.years || []).map(year => (
                  <div
                    key={year}
                    style={{ ...styles.yearCard, background: '#2E86AB' }}
                    onClick={() => handleYearSelect(year)}
                  >
                    <p style={styles.yearText}>{year}</p>
                    <p style={styles.yearSub}>{selectedLevel === 'JHS' ? 'BECE' : 'WASSCE'}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // ── Questions View ────────────────────
            <>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading questions...</p>
              ) : error ? (
                <p style={{ textAlign: 'center', color: '#E74C3C', padding: 40 }}>{error}</p>
              ) : questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ fontSize: 48 }}>📭</p>
                  <p style={{ color: '#888', marginTop: 12 }}>
                    No questions found for {selectedSubject} {selectedYear}.
                    More questions coming soon!
                  </p>
                </div>
              ) : (
                <>
                  <button
                    style={styles.quizBtn}
                    onClick={() => { resetQuiz(); setQuizMode(true); }}
                  >
                    🎯 Start Quiz ({questions.length} questions)
                  </button>

                  {questions.map((q, index) => (
                    <div key={q.id} style={styles.questionBrowseCard}>
                      <div style={styles.badgeRow}>
                        <span style={styles.badge}>{q.examYear}</span>
                        {q.topic && (
                          <span style={{ ...styles.badge, background: '#EAFAF1', color: '#27AE60' }}>
                            {q.topic}
                          </span>
                        )}
                        <span style={{ ...styles.badge, background: '#FEF9E7', color: '#F39C12' }}>
                          Q{index + 1}
                        </span>
                      </div>
                      <p style={styles.questionText}>{q.questionText}</p>
                      {['A', 'B', 'C', 'D'].map(letter => {
                        const text = { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D }[letter];
                        return (
                          <div key={letter} style={styles.browseOption}>
                            <span style={{ fontWeight: 'bold', color: '#1A5276', width: 20, flexShrink: 0 }}>
                              {letter}.
                            </span>
                            <span style={{ fontSize: 13, color: '#555', flex: 1 }}>{text}</span>
                          </div>
                        );
                      })}
                      <p style={styles.quizHint}>👆 Start the quiz to test yourself!</p>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  headerTitle:      { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  headerSub:        { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  levelTabs:        { display: 'flex', gap: 10, marginBottom: 16 },
  levelTab:         { flex: 1, padding: '10px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  backBtn:          { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '4px 0', marginBottom: 12 },
  sectionTitle:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },

  // Subject Grid
  subjectGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  subjectCard:      { borderRadius: 16, padding: '20px 10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  subjectIcon:      { fontSize: 30 },
  subjectName:      { fontSize: 11, fontWeight: 'bold', margin: '8px 0 4px', lineHeight: 1.3 },
  subjectMeta:      { fontSize: 10, color: '#888', margin: '0 0 6px' },
  tapHint:          { fontSize: 10, margin: 0, opacity: 0.7 },

  // Selected Subject Banner
  selectedSubjectBanner: { display: 'flex', alignItems: 'center', gap: 14, borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  bannerTitle:      { fontSize: 18, fontWeight: 'bold', margin: 0 },
  bannerSub:        { fontSize: 12, color: '#888', margin: '3px 0 0' },

  // Year Grid
  yearGrid:         { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  yearCard:         { borderRadius: 12, padding: '16px 8px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  yearText:         { fontSize: 18, fontWeight: 'bold', color: '#fff', margin: 0 },
  yearSub:          { fontSize: 10, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' },

  // Quiz Button
  quizBtn:          { display: 'block', width: '100%', padding: '14px', background: '#27AE60', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', border: 'none', marginBottom: 16 },

  // Question Cards
  questionBrowseCard: { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  badgeRow:         { display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  badge:            { background: '#EAF4FB', color: '#2E86AB', fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 4 },
  questionText:     { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 10px' },
  browseOption:     { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, marginBottom: 4, background: '#F8F9FA' },
  quizHint:         { fontSize: 12, color: '#2E86AB', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },

  // Quiz Mode
  quizHeader:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '20px 20px 16px' },
  quizHeaderTop:    { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  progressBar:      { height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: '100%', background: '#F39C12', borderRadius: 3, transition: 'width 0.3s' },
  quizContent:      { padding: 16 },
  questionCard:     { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  optionCard:       { display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, marginBottom: 8, cursor: 'pointer' },
  optionLetter:     { width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  explanationCard:  { background: '#FEF9E7', borderRadius: 10, padding: 16, marginTop: 8 },
  btn:              { width: '100%', padding: 14, background: '#2E86AB', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', border: 'none' },
  resultScreen:     { padding: '40px 24px', maxWidth: 440, margin: '0 auto' },
  gradeBadge:       { width: 120, height: 120, borderRadius: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};

export default PastQuestions;