import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, startSession, endSession } from '../services/api';
import API from '../services/api';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [xp,            setXP]            = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAll();
    autoStartSession();
  }, []); // eslint-disable-line

  const fetchAll = async () => {
    try {
      const [profileRes, xpRes, annRes] = await Promise.all([
        getProfile(),
        API.get('/xp/mine'),
        API.get('/announcements/student').catch(() => ({ data: { announcements: [] } })),
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.student);
      if (xpRes.data.success)      setXP(xpRes.data.xp);
      if (annRes.data.success)     setAnnouncements(annRes.data.announcements?.slice(0, 3) || []);
    } catch (e) { console.error(e); }
  };

  const autoStartSession = async () => {
    try {
      await startSession({ deviceType: 'Web' });
      await API.post('/xp/session'); // Award XP for session
      setSessionActive(true);
    } catch (e) { console.error(e); }
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      await endSession();
      setSessionActive(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const quickLinks = [
    { icon: '📄', label: 'Past Questions', path: '/questions',  color: '#2E86AB' },
    { icon: '📝', label: 'My Exams',       path: '/exams',      color: '#27AE60' },
    { icon: '🤖', label: 'AI Tutor',       path: '/ai-tutor',   color: '#8E44AD' },
    { icon: '📋', label: 'Assignments',    path: '/work',       color: '#E67E22' },
    { icon: '🏆', label: 'Leaderboard',    path: '/leaderboard',color: '#F39C12' },
    { icon: '⚔️',  label: 'Quiz Battle',   path: '/battle',     color: '#E74C3C' },
    { icon: '📊', label: 'My Grades',      path: '/grades',     color: '#16A085' },
    { icon: '🔥', label: 'Study Streak',   path: '/streak',     color: '#E74C3C' },
  ];

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.flagStrip}>
            <div style={{ flex:1, background:'#006B3F' }} />
            <div style={{ flex:1, background:'#FCD116' }} />
            <div style={{ flex:1, background:'#CE1126' }} />
          </div>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.greeting}>
                👋 Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
              </h1>
              <p style={styles.subGreeting}>
                {profile?.level} Student • Year {profile?.yearGroup}
                {profile?.className ? ` • Class ${profile.className}` : ''}
                {profile?.shsTrack ? ` • ${profile.shsTrack}` : ''}
              </p>
            </div>
            <div style={styles.sessionBox}>
              {sessionActive ? (
                <button onClick={handleEndSession} style={styles.endSessionBtn} disabled={loading}>
                  ⏹ End Session
                </button>
              ) : (
                <button onClick={autoStartSession} style={styles.startSessionBtn}>
                  ▶ Start Session
                </button>
              )}
              {sessionActive && <p style={styles.sessionBadge}>📚 Session Active</p>}
            </div>
          </div>
        </div>

        <div style={styles.content}>

          {/* XP Card */}
          {xp && (
            <div style={{ ...styles.xpCard, borderTop: `4px solid ${xp.levelColor}` }}>
              <div style={styles.xpLeft}>
                <p style={styles.xpLevel}>{xp.levelName}</p>
                <p style={styles.xpTotal}>{xp.total} XP</p>
                <p style={styles.xpWeekly}>+{xp.weekly} XP this week</p>
              </div>
              <div style={styles.xpRight}>
                <div style={styles.xpBarWrap}>
                  <div style={{ ...styles.xpBarFill, width: `${xp.progress}%`, background: xp.levelColor }} />
                </div>
                <p style={styles.xpNext}>
                  {xp.nextLevel ? `${xp.total}/${xp.nextLevel} XP to next level` : '🏆 Max Level!'}
                </p>
                <button onClick={() => navigate('/xp')} style={{ ...styles.xpBtn, background: xp.levelColor }}>
                  View XP →
                </button>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>⚡ Quick Access</h2>
            <div style={styles.quickGrid}>
              {quickLinks.map(l => (
                <div key={l.path} style={{ ...styles.quickCard, borderTop: `3px solid ${l.color}` }}
                  onClick={() => navigate(l.path)}>
                  <span style={{ fontSize: 28 }}>{l.icon}</span>
                  <p style={{ ...styles.quickLabel, color: l.color }}>{l.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>📢 Latest Announcements</h2>
                <button onClick={() => navigate('/news')} style={styles.viewAllBtn}>View All →</button>
              </div>
              {announcements.map((a, i) => (
                <div key={i} style={styles.announcementCard}>
                  <div style={styles.annTop}>
                    <span style={{ ...styles.annBadge, background: a.priority === 'urgent' ? '#FDEDEC' : '#EAF4FB', color: a.priority === 'urgent' ? '#E74C3C' : '#2E86AB' }}>
                      {a.priority === 'urgent' ? '🚨 Urgent' : '📢 Notice'}
                    </span>
                    <span style={styles.annDate}>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={styles.annTitle}>{a.title}</p>
                  <p style={styles.annContent}>{a.content?.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}

          {/* Study Tips */}
          <div style={styles.tipCard}>
            <h3 style={styles.tipTitle}>💡 Study Tip of the Day</h3>
            <p style={styles.tipText}>
              {[
                "Practice past questions daily — BECE rewards consistent revision more than last-minute cramming! 📚",
                "Use the AI Tutor to explain concepts you don't understand. Ask it to give examples! 🤖",
                "Study in 25-minute sessions with 5-minute breaks (Pomodoro technique) for better focus! ⏰",
                "Review your weakest subjects first when your mind is freshest in the morning! 🌅",
                "Teaching a concept to someone else is the best way to know if you truly understand it! 👥",
              ][new Date().getDay() % 5]}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 235, flex: 1 },
  header:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', paddingBottom: 24 },
  flagStrip:      { display: 'flex', height: 5 },
  headerContent:  { padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:       { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subGreeting:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  sessionBox:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  startSessionBtn:{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  endSessionBtn:  { background: 'rgba(231,76,60,0.3)', color: '#fff', border: '1px solid rgba(231,76,60,0.5)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  sessionBadge:   { color: '#98FB98', fontSize: 12, margin: 0, fontWeight: 'bold' },
  content:        { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  xpCard:         { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 20, alignItems: 'center' },
  xpLeft:         { flexShrink: 0 },
  xpLevel:        { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  xpTotal:        { fontSize: 28, fontWeight: 'bold', color: '#1A5276', margin: '0 0 2px' },
  xpWeekly:       { fontSize: 12, color: '#888', margin: 0 },
  xpRight:        { flex: 1 },
  xpBarWrap:      { height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  xpBarFill:      { height: '100%', borderRadius: 5, transition: 'width 0.5s ease' },
  xpNext:         { fontSize: 12, color: '#888', margin: '0 0 10px' },
  xpBtn:          { color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  section:        { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:   { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  viewAllBtn:     { background: 'none', border: 'none', color: '#2E86AB', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  quickGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  quickCard:      { background: '#f8f9fa', borderRadius: 12, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
  quickLabel:     { fontSize: 12, fontWeight: 'bold', margin: '8px 0 0' },
  announcementCard:{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px', marginBottom: 10 },
  annTop:         { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  annBadge:       { padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 'bold' },
  annDate:        { fontSize: 12, color: '#888' },
  annTitle:       { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  annContent:     { fontSize: 13, color: '#666', margin: 0 },
  tipCard:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', borderRadius: 14, padding: 20 },
  tipTitle:       { fontSize: 15, fontWeight: 'bold', color: '#fff', margin: '0 0 10px' },
  tipText:        { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 },
};

export default Home;