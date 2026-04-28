import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, startSession, endSession } from '../services/api';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.data.success) setProfile(res.data.student);
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await startSession({ deviceType: 'Web' });
      setMessage('✅ Study session started! Study hard! 💪🏾');
      setSessionActive(true);
    } catch (e) {
      setMessage('❌ Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      const res = await endSession();
      if (res.data.success) {
        const mins = res.data.durationMinutes || 0;
        setMessage(`✅ Session ended! You studied for ${mins} minutes!`);
        setSessionActive(false);
      }
    } catch (e) {
      setMessage('❌ No active session found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.logo}>ACEPREP</h1>
              <p style={styles.greeting}>
                Good day, {profile?.fullName || user?.fullName || 'Student'}! 👋
              </p>
              <p style={styles.subGreeting}>
                {profile?.level || 'Student'}
                {profile?.schoolName ? ` — ${profile.schoolName}` : ' — Independent Learner'}
              </p>
            </div>
            <div style={styles.avatarCircle}>
              <span style={styles.avatarText}>
                {(profile?.fullName || 'S').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={styles.message}>
            {message}
            <button
              style={styles.dismissBtn}
              onClick={() => setMessage('')}
            >✕</button>
          </div>
        )}

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <StatCard value={`${profile?.studyMinutesThisWeek || 0}m`} label="Study Time" sub="This week" color="#2E86AB" />
          <StatCard value={profile?.totalSessions || 0} label="Sessions" sub="Total" color="#27AE60" />
          <StatCard value={profile?.studyDaysThisMonth || 0} label="Study Days" sub="This month" color="#F39C12" />
        </div>

        {/* Study Session Card */}
        <div style={styles.sessionCard}>
          <div style={styles.sessionCardHeader}>
            <span style={styles.sessionCardIcon}>📚</span>
            <div>
              <p style={styles.sessionCardTitle}>Study Session</p>
              <p style={styles.sessionCardSub}>
                {sessionActive ? '🟢 Session in progress' : '⚪ No active session'}
              </p>
            </div>
          </div>
          <div style={styles.sessionBtns}>
            <button
              style={{
                ...styles.sessionBtn,
                background: sessionActive ? '#e0e0e0' : 'linear-gradient(135deg, #2E86AB, #1A5276)',
                color: sessionActive ? '#888' : '#fff',
              }}
              onClick={handleStartSession}
              disabled={loading || sessionActive}
            >
              ▶ Start Session
            </button>
            <button
              style={{
                ...styles.sessionBtn,
                background: !sessionActive ? '#e0e0e0' : 'linear-gradient(135deg, #E74C3C, #C0392B)',
                color: !sessionActive ? '#888' : '#fff',
              }}
              onClick={handleEndSession}
              disabled={loading || !sessionActive}
            >
              ⏹ End Session
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <ActionCard
            icon="📝" title="Past Questions"
            subtitle="BECE & WASSCE practice"
            color="#8E44AD" bg="#F5EEF8"
            onClick={() => navigate('/questions')}
          />
          <ActionCard
            icon="🤖" title="AI Tutor"
            subtitle="Get AI help instantly"
            color="#1A5276" bg="#EAF4FB"
            onClick={() => navigate('/ai-tutor')}
          />
          <ActionCard
            icon="📋" title="My Exams"
            subtitle="School assigned exams"
            color="#E74C3C" bg="#FDEDEC"
            onClick={() => navigate('/exams')}
          />
          <ActionCard
            icon="📊" title="My Grades"
            subtitle="View your results"
            color="#27AE60" bg="#EAFAF1"
            onClick={() => navigate('/grades')}
          />
          <ActionCard
            icon="📚" title="Assignments"
            subtitle="View & submit work"
            color="#F39C12" bg="#FEF9E7"
            onClick={() => navigate('/assignments')}
          />
          <ActionCard
            icon="👤" title="My Profile"
            subtitle="View your stats"
            color="#2E86AB" bg="#EAF4FB"
            onClick={() => navigate('/profile')}
          />
          <ActionCard
            icon="🏆" title="My Ranking"
            subtitle="See where you rank in school"
            color="#F39C12" bg="#FEF9E7"
            onClick={() => navigate('/leaderboard')}
          />
          <ActionCard
            icon="🔥" title="Study Streak"
            subtitle="Track your daily study streak"
            color="#E74C3C" bg="#FDEDEC"
            onClick={() => navigate('/streak')}
          />
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
};

const StatCard = ({ value, label, sub, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <p style={{ ...styles.statValue, color }}>{value}</p>
    <p style={styles.statLabel}>{label}</p>
    <p style={styles.statSub}>{sub}</p>
  </div>
);

const ActionCard = ({ icon, title, subtitle, color, bg, onClick }) => (
  <div style={{ ...styles.actionCard, background: bg }} onClick={onClick}>
    <div style={{ ...styles.actionIconBox, background: `${color}22` }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
    </div>
    <p style={{ ...styles.actionTitle, color }}>{title}</p>
    <p style={styles.actionSubtitle}>{subtitle}</p>
  </div>
);

const styles = {
  container:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 220, flex: 1, paddingBottom: 20 },
  header:          { background: 'linear-gradient(135deg, #1A5276 0%, #2E86AB 100%)', padding: '28px 24px 24px' },
  headerContent:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo:            { fontSize: 20, fontWeight: 'bold', letterSpacing: 3, margin: '0 0 8px', color: 'rgba(255,255,255,0.8)' },
  greeting:        { fontSize: 22, fontWeight: 'bold', margin: 0, color: '#fff' },
  subGreeting:     { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  avatarCircle:    { width: 56, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' },
  avatarText:      { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  message:         { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: '12px 16px', margin: '12px 16px', color: '#27AE60', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dismissBtn:      { background: 'none', border: 'none', color: '#27AE60', fontSize: 16, cursor: 'pointer', padding: '0 4px' },
  statsRow:        { display: 'flex', gap: 12, padding: '16px 16px 0' },
  statCard:        { flex: 1, background: '#fff', borderRadius: 12, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue:       { fontSize: 22, fontWeight: 'bold', margin: 0 },
  statLabel:       { fontSize: 11, color: '#555', margin: '4px 0 0', fontWeight: 'bold' },
  statSub:         { fontSize: 10, color: '#888', margin: 0 },

  // Session Card
  sessionCard:     { background: '#fff', borderRadius: 16, margin: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  sessionCardHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  sessionCardIcon: { fontSize: 32 },
  sessionCardTitle:{ fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  sessionCardSub:  { fontSize: 13, color: '#888', margin: '3px 0 0' },
  sessionBtns:     { display: 'flex', gap: 12 },
  sessionBtn:      { flex: 1, padding: '12px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },

  // Actions Grid
  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', padding: '0 16px', margin: '4px 0 12px' },
  actionsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 16px' },
  actionCard:      { borderRadius: 16, padding: '20px 12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s' },
  actionIconBox:   { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
  actionTitle:     { fontSize: 13, fontWeight: 'bold', margin: '0 0 4px' },
  actionSubtitle:  { fontSize: 11, color: '#888', margin: 0 },

  
};

export default Home;