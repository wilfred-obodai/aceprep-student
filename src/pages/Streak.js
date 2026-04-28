import React, { useEffect, useState } from 'react';
import { getMyStreak } from '../services/api';
import BottomNav from '../components/BottomNav';

const Streak = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyStreak();
        if (res.data.success) setData(res.data);
      } catch (e) {
        console.error('Failed to load streak');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const allBadges = [
    { type: 'streak_3',  name: '🔥 3-Day Streak',   desc: 'Study 3 days in a row'    },
    { type: 'streak_7',  name: '🔥 7-Day Streak',   desc: 'Study 7 days in a row'    },
    { type: 'streak_14', name: '🔥 14-Day Streak',  desc: 'Study 14 days in a row'   },
    { type: 'streak_30', name: '🏆 30-Day Streak',  desc: 'Study 30 days in a row'   },
    { type: 'days_10',   name: '📅 10 Study Days',  desc: 'Study 10 days total'      },
    { type: 'days_30',   name: '📅 30 Study Days',  desc: 'Study 30 days total'      },
    { type: 'days_100',  name: '💯 100 Study Days', desc: 'Study 100 days total'     },
  ];

  const earnedTypes = data?.badges?.map(b => b.type) || [];

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Study Streak & Badges</h1>
          <p style={styles.subtitle}>Keep studying daily to earn badges!</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading streak...</p>
          ) : (
            <>
              {/* Streak Card */}
              <div style={styles.streakCard}>
                <div style={styles.streakTop}>
                  <div style={styles.flameBox}>
                    <span style={styles.flame}>🔥</span>
                    <p style={styles.streakNum}>{data?.streak?.currentStreak || 0}</p>
                    <p style={styles.streakLabel}>Day Streak</p>
                  </div>
                  <div style={styles.streakStats}>
                    <div style={styles.streakStat}>
                      <p style={styles.streakStatVal}>{data?.streak?.longestStreak || 0}</p>
                      <p style={styles.streakStatLabel}>Best Streak</p>
                    </div>
                    <div style={styles.streakStat}>
                      <p style={styles.streakStatVal}>{data?.streak?.totalDays || 0}</p>
                      <p style={styles.streakStatLabel}>Total Days</p>
                    </div>
                    <div style={styles.streakStat}>
                      <p style={styles.streakStatVal}>{data?.badges?.length || 0}</p>
                      <p style={styles.streakStatLabel}>Badges</p>
                    </div>
                  </div>
                </div>

                {/* Streak message */}
                <div style={styles.streakMsg}>
                  <p style={styles.streakMsgText}>
                    {data?.streak?.currentStreak >= 7
                      ? '🔥 Amazing! You are on fire! Keep it up!'
                      : data?.streak?.currentStreak >= 3
                      ? '💪🏾 Great streak! Keep studying daily!'
                      : data?.streak?.currentStreak >= 1
                      ? '✅ Good start! Study tomorrow to continue!'
                      : '📚 Start studying today to begin your streak!'}
                  </p>
                </div>
              </div>

              {/* Earned Badges */}
              {data?.badges?.length > 0 && (
                <>
                  <h2 style={styles.sectionTitle}>🏅 Earned Badges ({data.badges.length})</h2>
                  <div style={styles.badgesGrid}>
                    {data.badges.map(badge => (
                      <div key={badge.id} style={styles.earnedBadge}>
                        <p style={styles.badgeName}>{badge.name}</p>
                        <p style={styles.badgeDesc}>{badge.description}</p>
                        <p style={styles.badgeDate}>
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* All Badges */}
              <h2 style={styles.sectionTitle}>🎯 All Badges</h2>
              <div style={styles.badgesGrid}>
                {allBadges.map(badge => {
                  const earned = earnedTypes.includes(badge.type);
                  return (
                    <div
                      key={badge.type}
                      style={{
                        ...styles.badgeCard,
                        background: earned ? '#EAFAF1' : '#f8f9fa',
                        border:     earned ? '2px solid #27AE60' : '2px solid #eee',
                        opacity:    earned ? 1 : 0.6,
                      }}
                    >
                      <p style={styles.badgeName}>{badge.name}</p>
                      <p style={styles.badgeDesc}>{badge.desc}</p>
                      {earned && (
                        <p style={styles.earnedLabel}>✅ Earned!</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:             { marginLeft: 220, flex: 1 },
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:         { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:          { padding: 16 },
  center:           { textAlign: 'center', color: '#888', padding: 40 },
  streakCard:       { background: 'linear-gradient(135deg, #E74C3C, #C0392B)', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 4px 20px rgba(231,76,60,0.3)' },
  streakTop:        { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 },
  flameBox:         { textAlign: 'center', flexShrink: 0 },
  flame:            { fontSize: 48, display: 'block' },
  streakNum:        { fontSize: 48, fontWeight: 'bold', color: '#fff', margin: 0, lineHeight: 1 },
  streakLabel:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' },
  streakStats:      { flex: 1, display: 'flex', gap: 12 },
  streakStat:       { flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' },
  streakStatVal:    { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  streakStatLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.8)', margin: '3px 0 0' },
  streakMsg:        { background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px' },
  streakMsgText:    { fontSize: 14, color: '#fff', margin: 0, fontWeight: 'bold' },
  sectionTitle:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '16px 0 10px' },
  badgesGrid:       { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 },
  earnedBadge:      { background: '#EAFAF1', border: '2px solid #27AE60', borderRadius: 12, padding: 14 },
  badgeCard:        { borderRadius: 12, padding: 14 },
  badgeName:        { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  badgeDesc:        { fontSize: 12, color: '#888', margin: 0 },
  badgeDate:        { fontSize: 11, color: '#27AE60', margin: '6px 0 0', fontStyle: 'italic' },
  earnedLabel:      { fontSize: 12, color: '#27AE60', fontWeight: 'bold', margin: '6px 0 0' },
};

export default Streak;