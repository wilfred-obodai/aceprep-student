import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];

const jhsSubjects = ['Mathematics','English Language','Integrated Science','Social Studies','ICT','French','Creative Arts'];
const shsSubjects = ['Core Mathematics','Core English','Elective Mathematics','Physics','Chemistry','Biology','Economics','History'];

const StudyPlanner = () => {
  const { user } = useAuth();
  const [plan,      setPlan]      = useState({});
  const [showAdd,   setShowAdd]   = useState(false);
  const [selDay,    setSelDay]    = useState('Mon');
  const [selTime,   setSelTime]   = useState('6:00 AM');
  const [selSubj,   setSelSubj]   = useState('Mathematics');
  const [selDur,    setSelDur]    = useState('60');
  const [aiSuggest, setAiSuggest] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saved,     setSaved]     = useState(false);

  const subjects = user?.level === 'SHS' ? shsSubjects : jhsSubjects;

  useEffect(() => {
    const saved = localStorage.getItem('aceprep_study_plan');
    if (saved) setPlan(JSON.parse(saved));
    getAISuggestions();
  }, []); // eslint-disable-line

  const savePlan = (newPlan) => {
    setPlan(newPlan);
    localStorage.setItem('aceprep_study_plan', JSON.stringify(newPlan));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSession = () => {
    const key   = selDay;
    const entry = { time: selTime, subject: selSubj, duration: parseInt(selDur) };
    const newPlan = { ...plan, [key]: [...(plan[key] || []), entry].sort((a, b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time)) };
    savePlan(newPlan);
    setShowAdd(false);
  };

  const removeSession = (day, index) => {
    const newPlan = { ...plan, [day]: plan[day].filter((_, i) => i !== index) };
    savePlan(newPlan);
  };

  const getAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const res = await API.post('/ai/chat', {
        messages: [{
          role: 'user',
          content: `You are AcePrep AI Tutor. Create a simple weekly study plan for a Ghanaian ${user?.level || 'JHS'} student${user?.shsTrack ? ` studying ${user.shsTrack}` : ''} preparing for ${user?.level === 'SHS' ? 'WASSCE' : 'BECE'}. Suggest which subjects to study each day of the week with duration in minutes. Format as JSON array like: [{"day":"Mon","subject":"Mathematics","duration":60,"tip":"Focus on algebra"},{"day":"Tue",...}]. Return ONLY the JSON array, nothing else.`
        }]
      });

      const text = res.data.message || '[]';
      const clean = text.replace(/```json|```/g, '').trim();
      const suggestions = JSON.parse(clean);
      setAiSuggest(suggestions);
    } catch (e) { console.error(e); }
    finally { setLoadingAI(false); }
  };

  const applyAISuggestion = () => {
    const newPlan = {};
    aiSuggest.forEach(s => {
      if (!newPlan[s.day]) newPlan[s.day] = [];
      newPlan[s.day].push({ time: '4:00 PM', subject: s.subject, duration: s.duration });
    });
    savePlan(newPlan);
  };

  const totalSessions = Object.values(plan).reduce((sum, sessions) => sum + sessions.length, 0);
  const totalHours    = Object.values(plan).reduce((sum, sessions) => sum + sessions.reduce((s, sess) => s + sess.duration, 0), 0) / 60;

  const subjectColors = { 'Mathematics': '#2E86AB', 'English Language': '#27AE60', 'Integrated Science': '#E74C3C', 'Social Studies': '#F39C12', 'ICT': '#8E44AD', 'Core Mathematics': '#2E86AB', 'Physics': '#1ABC9C', 'Chemistry': '#E67E22', 'Biology': '#16A085', 'Economics': '#D35400' };
  const getColor = (subject) => subjectColors[subject] || '#95A5A6';

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎯 Study Planner</h1>
            <p style={styles.subtitle}>Plan your weekly study schedule for {user?.level === 'SHS' ? 'WASSCE' : 'BECE'}</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? '✕ Cancel' : '+ Add Session'}
          </button>
        </div>

        <div style={styles.content}>
          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{totalSessions}</p>
              <p style={styles.statLabel}>Study Sessions</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{totalHours.toFixed(1)}h</p>
              <p style={styles.statLabel}>Hours/Week</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statVal}>{Object.keys(plan).length}</p>
              <p style={styles.statLabel}>Active Days</p>
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggest.length > 0 && (
            <div style={styles.aiCard}>
              <div style={styles.aiCardTop}>
                <h3 style={styles.aiCardTitle}>🤖 AI Recommended Study Plan</h3>
                <button onClick={applyAISuggestion} style={styles.applyBtn}>
                  ✨ Apply This Plan
                </button>
              </div>
              <div style={styles.suggestGrid}>
                {aiSuggest.slice(0, 7).map((s, i) => (
                  <div key={i} style={{ ...styles.suggestCard, borderTop: `3px solid ${getColor(s.subject)}` }}>
                    <p style={styles.suggestDay}>{s.day}</p>
                    <p style={{ ...styles.suggestSubj, color: getColor(s.subject) }}>{s.subject}</p>
                    <p style={styles.suggestDur}>{s.duration} min</p>
                    {s.tip && <p style={styles.suggestTip}>💡 {s.tip}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingAI && (
            <div style={styles.aiLoading}>
              <p>🤖 AI is generating your personalized study plan...</p>
            </div>
          )}

          {/* Add Session Form */}
          {showAdd && (
            <div style={styles.addCard}>
              <h3 style={styles.addTitle}>➕ Add Study Session</h3>
              <div style={styles.addGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Day</label>
                  <select style={styles.input} value={selDay} onChange={e => setSelDay(e.target.value)}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Time</label>
                  <select style={styles.input} value={selTime} onChange={e => setSelTime(e.target.value)}>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Subject</label>
                  <select style={styles.input} value={selSubj} onChange={e => setSelSubj(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Duration</label>
                  <select style={styles.input} value={selDur} onChange={e => setSelDur(e.target.value)}>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
              <button onClick={addSession} style={styles.saveBtn}>✅ Add to Plan</button>
            </div>
          )}

          {saved && <div style={styles.savedMsg}>✅ Plan saved!</div>}

          {/* Weekly Plan */}
          <div style={styles.weekGrid}>
            {days.map(day => (
              <div key={day} style={styles.dayCol}>
                <div style={styles.dayHeader}>
                  <span style={styles.dayName}>{day}</span>
                  <span style={styles.dayCount}>{plan[day]?.length || 0}</span>
                </div>
                <div style={styles.daySessions}>
                  {(plan[day] || []).map((session, i) => (
                    <div key={i} style={{ ...styles.sessionCard, borderLeft: `3px solid ${getColor(session.subject)}` }}>
                      <p style={styles.sessionTime}>{session.time}</p>
                      <p style={{ ...styles.sessionSubj, color: getColor(session.subject) }}>{session.subject}</p>
                      <p style={styles.sessionDur}>{session.duration} min</p>
                      <button onClick={() => removeSession(day, i)} style={styles.removeBtn}>✕</button>
                    </div>
                  ))}
                  {(!plan[day] || plan[day].length === 0) && (
                    <p style={styles.emptyDay}>Free day</p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container:   { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 235, flex: 1 },
  header:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:    { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  addBtn:      { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  content:     { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  statBox:     { background: '#fff', borderRadius: 12, padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statVal:     { fontSize: 28, fontWeight: 'bold', color: '#2E86AB', margin: 0 },
  statLabel:   { fontSize: 13, color: '#888', margin: '4px 0 0' },
  aiCard:      { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  aiCardTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  aiCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  applyBtn:    { background: 'linear-gradient(135deg, #8E44AD, #6C3483)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  suggestGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 },
  suggestCard: { background: '#f8f9fa', borderRadius: 10, padding: '10px 8px', textAlign: 'center' },
  suggestDay:  { fontSize: 12, fontWeight: 'bold', color: '#888', margin: '0 0 4px' },
  suggestSubj: { fontSize: 12, fontWeight: 'bold', margin: '0 0 4px', lineHeight: 1.3 },
  suggestDur:  { fontSize: 11, color: '#aaa', margin: '0 0 4px' },
  suggestTip:  { fontSize: 10, color: '#888', margin: 0, lineHeight: 1.4 },
  aiLoading:   { background: '#EAF4FB', borderRadius: 10, padding: '14px 20px', color: '#2E86AB', fontSize: 14, textAlign: 'center' },
  addCard:     { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  addTitle:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  addGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 },
  field:       { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 13, fontWeight: 'bold', color: '#555' },
  input:       { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14 },
  saveBtn:     { background: 'linear-gradient(135deg, #27AE60, #1e8449)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  savedMsg:    { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: '10px 16px', color: '#27AE60', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  weekGrid:    { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 },
  dayCol:      { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  dayHeader:   { background: '#1A5276', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dayName:     { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  dayCount:    { background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11 },
  daySessions: { padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 },
  sessionCard: { background: '#f8f9fa', borderRadius: 8, padding: '8px 10px', position: 'relative' },
  sessionTime: { fontSize: 10, color: '#888', margin: '0 0 2px' },
  sessionSubj: { fontSize: 11, fontWeight: 'bold', margin: '0 0 2px', lineHeight: 1.3 },
  sessionDur:  { fontSize: 10, color: '#aaa', margin: 0 },
  removeBtn:   { position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', padding: 0 },
  emptyDay:    { fontSize: 11, color: '#ccc', textAlign: 'center', padding: '8px 0' },
};

export default StudyPlanner;