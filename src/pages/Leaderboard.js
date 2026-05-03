import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const Leaderboard = () => {
  const [tab,       setTab]       = useState('school');
  const [school,    setSchool]    = useState({ leaderboard: [], rank: null, total: 0, myStats: null });
  const [national,  setNational]  = useState({ schoolRankings: [], topStudents: [] });
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schoolRes, nationalRes] = await Promise.all([
        API.get('/leaderboard/my-rank'),
        API.get('/leaderboard/national'),
      ]);
      if (schoolRes.data.success)   setSchool(schoolRes.data);
      if (nationalRes.data.success) setNational(nationalRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#006B3F';
    if (score >= 50) return '#b8860b';
    return '#CE1126';
  };

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Leaderboard</h1>
          <p style={styles.subtitle}>See how you rank against others</p>

          {/* My Stats Card */}
          {school.myStats && (
            <div style={styles.myStatCard}>
              <div style={styles.myRankBadge}>
                {getRankIcon(school.myStats.rank)}
              </div>
              <div>
                <p style={styles.myRankText}>Your Rank</p>
                <p style={styles.myRankNum}>#{school.myStats.rank} of {school.total}</p>
              </div>
              <div style={styles.myStatDivider} />
              <div style={styles.myStat}>
                <p style={styles.myStatVal}>{school.myStats.avgScore}%</p>
                <p style={styles.myStatLabel}>Avg Score</p>
              </div>
              <div style={styles.myStat}>
                <p style={styles.myStatVal}>{school.myStats.totalXP}</p>
                <p style={styles.myStatLabel}>XP Points</p>
              </div>
              <div style={styles.myStat}>
                <p style={styles.myStatVal}>{school.myStats.streak}🔥</p>
                <p style={styles.myStatLabel}>Streak</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'school'   ? styles.tabActive : {}) }} onClick={() => setTab('school')}>🏫 My School</button>
          <button style={{ ...styles.tab, ...(tab === 'national' ? styles.tabActive : {}) }} onClick={() => setTab('national')}>🇬🇭 National</button>
          <button style={{ ...styles.tab, ...(tab === 'students' ? styles.tabActive : {}) }} onClick={() => setTab('students')}>⭐ Top Students</button>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading leaderboard...</p>
          ) : (
            <>
              {/* School Tab */}
              {tab === 'school' && (
                <div>
                  {school.leaderboard.length === 0 ? (
                    <div style={styles.empty}>
                      <p style={{ fontSize: 48 }}>🏆</p>
                      <p style={{ color: '#888' }}>No leaderboard data yet. Start taking exams!</p>
                    </div>
                  ) : (
                    school.leaderboard.map(s => (
                      <div key={s.id} style={{ ...styles.row, ...(s.isMe ? styles.myRow : {}) }}>
                        <span style={styles.rankBadge}>{getRankIcon(s.rank)}</span>
                        <div style={styles.rowInfo}>
                          <p style={styles.rowName}>{s.fullName} {s.isMe && <span style={styles.youBadge}>YOU</span>}</p>
                          <p style={styles.rowMeta}>{s.level} • Year {s.yearGroup}{s.className ? ` • ${s.className}` : ''}</p>
                        </div>
                        <div style={styles.rowStats}>
                          <p style={{ ...styles.rowScore, color: getScoreColor(s.avgScore) }}>{s.avgScore}%</p>
                          <p style={styles.rowXP}>{s.totalXP} XP</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* National Schools Tab */}
              {tab === 'national' && (
                <div>
                  <p style={styles.sectionLabel}>🏫 School Rankings — Ghana</p>
                  {national.schoolRankings.length === 0 ? (
                    <div style={styles.empty}>
                      <p style={{ fontSize: 48 }}>🇬🇭</p>
                      <p style={{ color: '#888' }}>National rankings coming soon!</p>
                    </div>
                  ) : (
                    national.schoolRankings.map(s => (
                      <div key={s.id} style={styles.row}>
                        <span style={styles.rankBadge}>{getRankIcon(s.rank)}</span>
                        <div style={styles.rowInfo}>
                          <p style={styles.rowName}>{s.name}</p>
                          <p style={styles.rowMeta}>{s.city} • {s.region} • {s.studentCount} students</p>
                        </div>
                        <div style={styles.rowStats}>
                          <p style={{ ...styles.rowScore, color: getScoreColor(s.avgScore) }}>{s.avgScore}%</p>
                          <p style={styles.rowXP}>{s.totalXP} XP</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Top Students Nationally */}
              {tab === 'students' && (
                <div>
                  <p style={styles.sectionLabel}>⭐ Top Students — Ghana</p>
                  {national.topStudents.length === 0 ? (
                    <div style={styles.empty}>
                      <p style={{ fontSize: 48 }}>⭐</p>
                      <p style={{ color: '#888' }}>Top students will appear here!</p>
                    </div>
                  ) : (
                    national.topStudents.map(s => (
                      <div key={s.rank} style={styles.row}>
                        <span style={styles.rankBadge}>{getRankIcon(s.rank)}</span>
                        <div style={styles.rowInfo}>
                          <p style={styles.rowName}>{s.fullName}</p>
                          <p style={styles.rowMeta}>{s.schoolName} • {s.city} • {s.level}</p>
                        </div>
                        <div style={styles.rowStats}>
                          <p style={{ ...styles.rowScore, color: getScoreColor(s.avgScore) }}>{s.avgScore}%</p>
                          <p style={styles.rowXP}>{s.totalXP} XP</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 235, flex: 1 },
  header:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px 20px' },
  title:         { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16 },
  myStatCard:    { background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  myRankBadge:   { fontSize: 32, flexShrink: 0 },
  myRankText:    { color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 },
  myRankNum:     { color: '#fff', fontSize: 18, fontWeight: 'bold', margin: 0 },
  myStatDivider: { width: 1, height: 40, background: 'rgba(255,255,255,0.3)', margin: '0 8px' },
  myStat:        { textAlign: 'center' },
  myStatVal:     { color: '#fff', fontSize: 18, fontWeight: 'bold', margin: 0 },
  myStatLabel:   { color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 },
  tabs:          { display: 'flex', background: '#fff', borderBottom: '2px solid #eee' },
  tab:           { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:     { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  content:       { padding: 16 },
  center:        { textAlign: 'center', color: '#888', padding: 40 },
  empty:         { textAlign: 'center', padding: '40px 20px' },
  sectionLabel:  { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  row:           { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  myRow:         { border: '2px solid #2E86AB', background: '#EAF4FB' },
  rankBadge:     { fontSize: 20, width: 40, textAlign: 'center', flexShrink: 0 },
  rowInfo:       { flex: 1 },
  rowName:       { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 },
  youBadge:      { background: '#2E86AB', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4 },
  rowMeta:       { fontSize: 12, color: '#888', margin: 0 },
  rowStats:      { textAlign: 'right', flexShrink: 0 },
  rowScore:      { fontSize: 18, fontWeight: 'bold', margin: '0 0 2px' },
  rowXP:         { fontSize: 12, color: '#888', margin: 0 },
};

export default Leaderboard;