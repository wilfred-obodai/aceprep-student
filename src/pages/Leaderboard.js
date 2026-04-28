import React, { useEffect, useState } from 'react';
import { getMyRank } from '../services/api';
import BottomNav from '../components/BottomNav';

const Leaderboard = () => {
  const [rankData, setRankData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyRank();
        if (res.data.success) setRankData(res.data);
      } catch (e) {
        console.error('Failed to load rank');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#F39C12';
    if (rank === 2) return '#888';
    if (rank === 3) return '#CD7F32';
    return '#2E86AB';
  };

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Ranking</h1>
          <p style={styles.subtitle}>Your position among school students</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading your rank...</p>
          ) : !rankData?.rank ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>🏆</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No ranking yet</h3>
              <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                Complete exams and assignments to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <>
              {/* Rank Card */}
              <div style={styles.rankCard}>
                <div style={styles.rankCircle}>
                  <p style={{ ...styles.rankEmoji, color: getRankColor(rankData.rank) }}>
                    {getRankEmoji(rankData.rank)}
                  </p>
                  {rankData.rank > 3 && (
                    <p style={styles.rankNum}>{rankData.rank}</p>
                  )}
                </div>
                <p style={styles.rankTitle}>Your School Rank</p>
                <p style={styles.rankSub}>
                  Out of {rankData.totalStudents} students
                </p>
              </div>

              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard
                  icon="📊"
                  label="Average Score"
                  value={`${rankData.averageScore}%`}
                  color="#2E86AB"
                />
                <StatCard
                  icon="📝"
                  label="Assessments"
                  value={rankData.totalAssessments}
                  color="#27AE60"
                />
                <StatCard
                  icon="🎯"
                  label="Rank"
                  value={`${rankData.rank} of ${rankData.totalStudents}`}
                  color="#F39C12"
                />
                <StatCard
                  icon="💯"
                  label="Top"
                  value={`${Math.round((rankData.rank / rankData.totalStudents) * 100)}%`}
                  color="#8E44AD"
                />
              </div>

              {/* Motivation */}
              <div style={styles.motivationCard}>
                <p style={styles.motivationIcon}>💪🏾</p>
                <div>
                  <p style={styles.motivationTitle}>
                    {rankData.rank === 1
                      ? 'You are the TOP student! 🎉'
                      : rankData.rank <= 3
                      ? 'You are in the top 3! Keep it up!'
                      : rankData.rank <= 10
                      ? 'You are in the top 10! Great work!'
                      : 'Keep studying to improve your rank!'}
                  </p>
                  <p style={styles.motivationSub}>
                    AcePrep — Ace Your Exams. Change Your Future.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <p style={{ ...styles.statValue, color }}>{value}</p>
    <p style={styles.statLabel}>{label}</p>
  </div>
);

const styles = {
  container:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:             { marginLeft: 220, flex: 1 },
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:         { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:          { padding: 16 },
  center:           { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:       { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  rankCard:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', borderRadius: 20, padding: '32px 20px', textAlign: 'center', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  rankCircle:       { width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  rankEmoji:        { fontSize: 48, fontWeight: 'bold', margin: 0 },
  rankNum:          { fontSize: 36, fontWeight: 'bold', color: '#fff', margin: 0 },
  rankTitle:        { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: '0 0 8px' },
  rankSub:          { fontSize: 14, color: '#AED6F1', margin: 0 },
  statsGrid:        { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 },
  statCard:         { background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue:        { fontSize: 22, fontWeight: 'bold', margin: '8px 0 4px' },
  statLabel:        { fontSize: 12, color: '#888', margin: 0 },
  motivationCard:   { background: '#fff', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  motivationIcon:   { fontSize: 36, flexShrink: 0 },
  motivationTitle:  { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  motivationSub:    { fontSize: 12, color: '#888', margin: 0, fontStyle: 'italic' },
};

export default Leaderboard;