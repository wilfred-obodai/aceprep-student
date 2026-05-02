import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';

const EXAMS = [
  { name: 'BECE 2025',   date: '2025-08-04', level: 'JHS', color: '#2E86AB' },
  { name: 'WASSCE 2025', date: '2025-08-25', level: 'SHS', color: '#8E44AD' },
  { name: 'BECE 2026',   date: '2026-08-03', level: 'JHS', color: '#2E86AB' },
  { name: 'WASSCE 2026', date: '2026-08-24', level: 'SHS', color: '#8E44AD' },
];

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

const CountdownCard = ({ exam }) => {
  const timeLeft = useCountdown(exam.date);
  const isPast   = timeLeft.expired;

  return (
    <div style={{ ...styles.examCard, borderTop: `4px solid ${exam.color}` }}>
      <div style={styles.examHeader}>
        <div>
          <p style={{ ...styles.examName, color: exam.color }}>{exam.name}</p>
          <p style={styles.examDate}>
            📅 {new Date(exam.date).toLocaleDateString('en-GH', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <span style={{
            ...styles.levelBadge,
            background: exam.level === 'JHS' ? '#EAF4FB' : '#F5EEF8',
            color:      exam.level === 'JHS' ? '#2E86AB' : '#8E44AD',
          }}>
            {exam.level} • {exam.level === 'JHS' ? 'BECE' : 'WASSCE'}
          </span>
        </div>
      </div>

      {isPast ? (
        <div style={styles.pastBadge}>✅ Exam has passed</div>
      ) : (
        <div style={styles.countdownGrid}>
          {[
            { value: timeLeft.days,    label: 'Days'    },
            { value: timeLeft.hours,   label: 'Hours'   },
            { value: timeLeft.minutes, label: 'Minutes' },
            { value: timeLeft.seconds, label: 'Seconds' },
          ].map(({ value, label }) => (
            <div key={label} style={{ ...styles.timeBox, background: `${exam.color}15` }}>
              <p style={{ ...styles.timeValue, color: exam.color }}>
                {String(value).padStart(2, '0')}
              </p>
              <p style={styles.timeLabel}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {!isPast && (
        <div style={styles.motivationBox}>
          <p style={styles.motivationText}>
            {timeLeft.days > 180
              ? '📚 You have plenty of time — start building good study habits now!'
              : timeLeft.days > 90
              ? '💪🏾 Good time to intensify your preparation!'
              : timeLeft.days > 30
              ? '🔥 Final stretch — focus on your weak subjects!'
              : timeLeft.days > 7
              ? '⚡ Last weeks — review past questions daily!'
              : '🚨 Almost there — stay calm and trust your preparation!'}
          </p>
        </div>
      )}
    </div>
  );
};

const ExamCountdown = () => {
  const [studyTarget,    setStudyTarget]    = useState(2);
  const [todayStudied,   setTodayStudied]   = useState(0);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>⏳ Exam Countdown</h1>
          <p style={styles.subtitle}>BECE & WASSCE countdown timers</p>
        </div>

        <div style={styles.content}>
          {/* Study Target */}
          <div style={styles.targetCard}>
            <h3 style={styles.targetTitle}>🎯 Today's Study Target</h3>
            <div style={styles.targetRow}>
              <div style={styles.targetInfo}>
                <p style={styles.targetHours}>{studyTarget} hours</p>
                <p style={styles.targetSub}>Daily goal</p>
              </div>
              <div style={styles.targetControls}>
                <button style={styles.targetBtn} onClick={() => setStudyTarget(t => Math.max(1, t - 1))}>−</button>
                <button style={styles.targetBtn} onClick={() => setStudyTarget(t => Math.min(12, t + 1))}>+</button>
              </div>
            </div>
            <div style={styles.targetBar}>
              <div style={{
                ...styles.targetFill,
                width: `${Math.min(100, (todayStudied / studyTarget) * 100)}%`
              }} />
            </div>
            <p style={styles.targetProgress}>
              {todayStudied} / {studyTarget} hours studied today
            </p>
          </div>

          {/* Countdown Cards */}
          {EXAMS.map(exam => (
            <CountdownCard key={exam.name} exam={exam} />
          ))}

          {/* Study Tips */}
          <div style={styles.tipsCard}>
            <h3 style={styles.tipsTitle}>💡 Exam Preparation Tips</h3>
            {[
              '📝 Practice with past BECE/WASSCE questions daily',
              '⏰ Study in 45-minute sessions with 15-minute breaks',
              '🔄 Review your weak subjects more frequently',
              '💤 Get 8 hours of sleep before exam day',
              '🍎 Eat well and stay hydrated during preparation',
              '🤖 Use the AI Tutor to explain difficult topics',
              '👥 Form study groups with classmates',
            ].map((tip, i) => (
              <p key={i} style={styles.tip}>{tip}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 220, flex: 1 },
  header:          { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:           { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:        { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:         { padding: 16 },
  targetCard:      { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  targetTitle:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  targetRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  targetInfo:      {},
  targetHours:     { fontSize: 28, fontWeight: 'bold', color: '#2E86AB', margin: 0 },
  targetSub:       { fontSize: 12, color: '#888', margin: 0 },
  targetControls:  { display: 'flex', gap: 8 },
  targetBtn:       { width: 36, height: 36, borderRadius: 18, border: 'none', background: '#EAF4FB', color: '#2E86AB', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' },
  targetBar:       { height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  targetFill:      { height: '100%', background: '#2E86AB', borderRadius: 4, transition: 'width 0.3s' },
  targetProgress:  { fontSize: 12, color: '#888', margin: 0 },
  examCard:        { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  examHeader:      { marginBottom: 16 },
  examName:        { fontSize: 20, fontWeight: 'bold', margin: '0 0 4px' },
  examDate:        { fontSize: 13, color: '#555', margin: '0 0 8px' },
  levelBadge:      { fontSize: 12, fontWeight: 'bold', padding: '3px 10px', borderRadius: 6 },
  countdownGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 },
  timeBox:         { borderRadius: 12, padding: '12px 4px', textAlign: 'center' },
  timeValue:       { fontSize: 28, fontWeight: 'bold', margin: 0, lineHeight: 1 },
  timeLabel:       { fontSize: 10, color: '#888', margin: '4px 0 0', textTransform: 'uppercase' },
  pastBadge:       { background: '#EAFAF1', color: '#27AE60', padding: '10px', borderRadius: 8, textAlign: 'center', fontWeight: 'bold', marginBottom: 12 },
  motivationBox:   { background: '#f8f9fa', borderRadius: 8, padding: '10px 14px' },
  motivationText:  { fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 },
  tipsCard:        { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tipsTitle:       { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  tip:             { fontSize: 13, color: '#555', padding: '8px 0', borderBottom: '1px solid #f0f0f0', margin: 0, lineHeight: 1.5 },
};

export default ExamCountdown;