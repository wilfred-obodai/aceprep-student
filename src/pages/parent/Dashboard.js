import React, { useEffect, useState } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

// ── Link Child Section ─────────────────────────
const LinkChildSection = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await API.post('/parents/link-child', { childEmail: email });
      setSuccess(true);
      setMsg('Child linked successfully! Refresh to see their progress.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to link child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ fontSize: 56, margin: 0 }}>👶</p>
      <h3 style={{ color: '#CE1126', margin: '12px 0 8px' }}>No child linked yet</h3>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        Enter your child's registered email to link their account
      </p>
      <form onSubmit={handleLink} style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Child's email address"
          style={{ padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15 }}
          required
        />
        {msg && (
          <p style={{ color: success ? '#006B3F' : '#CE1126', fontSize: 14, margin: 0 }}>
            {success ? '✅' : '⚠️'} {msg}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #CE1126, #7a0015)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Linking...' : '🔗 Link My Child'}
        </button>
      </form>
      {success && (
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 16, background: '#006B3F', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔄 Refresh Now
        </button>
      )}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`, textAlign: 'center' }}>
    <p style={{ fontSize: 32, margin: 0 }}>{icon}</p>
    <p style={{ fontSize: 24, fontWeight: 'bold', color, margin: '8px 0 4px' }}>{value}</p>
    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{label}</p>
  </div>
);

// ── Parent Dashboard ───────────────────────────
const ParentDashboard = () => {
  const { user } = useAuth();
  const [childData, setChildData] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/parents/child-progress');
        if (res.data.success) setChildData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.flagStrip}>
            <div style={{ flex:1, background:'#006B3F' }} />
            <div style={{ flex:1, background:'#FCD116' }} />
            <div style={{ flex:1, background:'#CE1126' }} />
          </div>
          <h1 style={styles.title}>
            👨‍👩‍👧 Welcome, {user?.fullName?.split(' ')[0] || 'Parent'}!
          </h1>
          <p style={styles.subtitle}>Monitor your child's academic progress</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingBox}>
              <p style={{ fontSize: 40 }}>⏳</p>
              <p style={{ color: '#888' }}>Loading child data...</p>
            </div>
          ) : !childData?.student ? (
            <LinkChildSection />
          ) : (
            <>
              {/* Child Info Card */}
              <div style={styles.childCard}>
                <div style={styles.childAvatar}>
                  {childData.student.fullName?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={styles.childName}>{childData.student.fullName}</h2>
                  <p style={styles.childInfo}>
                    {childData.student.level} • Year {childData.student.yearGroup}
                    {childData.student.className && ` • Class ${childData.student.className}`}
                  </p>
                  <p style={styles.childSchool}>
                    🏫 {childData.student.schoolName || 'Independent Learner'}
                  </p>
                </div>
                <div style={styles.schoolCodeBadge}>
                  {childData.student.schoolCode || 'N/A'}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard icon="📊" label="Average Score"  value={`${childData.stats?.avgScore || 0}%`}      color="#CE1126" />
                <StatCard icon="📝" label="Exams Taken"    value={childData.stats?.examsTaken || 0}           color="#FCD116" />
                <StatCard icon="✅" label="Attendance"     value={`${childData.stats?.attendance || 0}%`}     color="#006B3F" />
                <StatCard icon="🔥" label="Study Streak"   value={`${childData.stats?.streak || 0} days`}     color="#CE1126" />
              </div>

              {/* Performance Bar */}
              <div style={styles.performanceCard}>
                <h3 style={styles.sectionTitle}>📈 Overall Performance</h3>
                <div style={styles.performanceBar}>
                  <div style={{
                    ...styles.performanceFill,
                    width: `${childData.stats?.avgScore || 0}%`,
                    background: childData.stats?.avgScore >= 70
                      ? '#006B3F'
                      : childData.stats?.avgScore >= 50
                      ? '#FCD116'
                      : '#CE1126',
                  }} />
                </div>
                <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                  {childData.stats?.avgScore >= 70
                    ? '🌟 Excellent performance! Keep it up!'
                    : childData.stats?.avgScore >= 50
                    ? '📚 Good progress. More effort needed.'
                    : '⚠️ Needs improvement. Encourage more studying.'}
                </p>
              </div>

              {/* Recent Grades */}
              {childData.recentGrades?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>📊 Recent Grades</h3>
                  <div style={styles.gradesList}>
                    {childData.recentGrades.map((g, i) => (
                      <div key={i} style={styles.gradeRow}>
                        <span style={styles.gradeSubject}>{g.subject}</span>
                        <span style={styles.gradeScore}>{g.score}%</span>
                        <span style={{
                          ...styles.gradeLetter,
                          color: g.grade === 'A' ? '#006B3F'
                               : g.grade === 'F' ? '#CE1126'
                               : '#b8860b',
                          background: g.grade === 'A' ? '#006B3F15'
                                    : g.grade === 'F' ? '#CE112615'
                                    : '#FCD11615',
                        }}>
                          {g.grade}
                        </span>
                        <span style={styles.gradeDate}>
                          {new Date(g.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={styles.quickActions}>
                <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
                <div style={styles.actionBtns}>
                  <a href="/parent/grades" style={{ ...styles.actionBtn, background: '#CE112615', color: '#CE1126', borderColor: '#CE1126' }}>
                    📊 View All Grades
                  </a>
                  <a href="/parent/attendance" style={{ ...styles.actionBtn, background: '#006B3F15', color: '#006B3F', borderColor: '#006B3F' }}>
                    ✅ Check Attendance
                  </a>
                  <a href="/parent/messages" style={{ ...styles.actionBtn, background: '#FCD11615', color: '#b8860b', borderColor: '#FCD116' }}>
                    ✉️ Messages
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:          { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 235, flex: 1 },
  header:          { background: 'linear-gradient(135deg, #7a0015, #CE1126)', padding: '0 0 24px' },
  flagStrip:       { display: 'flex', height: 5 },
  title:           { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: '20px 24px 4px' },
  subtitle:        { fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 24px' },
  content:         { padding: 20 },
  loadingBox:      { textAlign: 'center', padding: '60px 20px' },
  childCard:       { background: '#fff', borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '5px solid #CE1126' },
  childAvatar:     { width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #CE1126, #7a0015)', color: '#fff', fontSize: 26, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  childName:       { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  childInfo:       { fontSize: 14, color: '#888', margin: '0 0 4px' },
  childSchool:     { fontSize: 13, color: '#CE1126', fontWeight: 'bold', margin: 0 },
  schoolCodeBadge: { background: '#1A527615', color: '#1A5276', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 'bold', border: '1px solid #1A527633' },
  statsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  performanceCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  performanceBar:  { height: 16, background: '#f0f0f0', borderRadius: 8, overflow: 'hidden' },
  performanceFill: { height: '100%', borderRadius: 8, transition: 'width 0.5s ease' },
  section:         { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  gradesList:      { display: 'flex', flexDirection: 'column', gap: 8 },
  gradeRow:        { display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#f8f9fa', borderRadius: 8, gap: 12 },
  gradeSubject:    { flex: 1, fontSize: 14, color: '#333', fontWeight: 'bold' },
  gradeScore:      { fontSize: 14, color: '#555' },
  gradeLetter:     { fontSize: 13, fontWeight: 'bold', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  gradeDate:       { fontSize: 12, color: '#aaa' },
  quickActions:    { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  actionBtns:      { display: 'flex', gap: 12 },
  actionBtn:       { flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 'bold', textAlign: 'center', border: '1px solid', textDecoration: 'none', cursor: 'pointer' },
};

export default ParentDashboard;