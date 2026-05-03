import React, { useEffect, useState } from 'react';
import { getMyXP } from '../services/api';
import BottomNav from '../components/BottomNav';

const XPLevel = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyXP();
        if (res.data.success) setData(res.data);
      } catch (e) { console.error('Failed to load XP'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎯 XP & Level</h1>
          <p style={styles.subtitle}>Earn XP by studying and completing challenges</p>
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading...</p>
          ) : !data ? (
            <p style={styles.center}>Failed to load XP data</p>
          ) : (
            <>
              {/* Level Card */}
              <div style={{
                ...styles.levelCard,
                background: `linear-gradient(135deg, ${data.xp.levelColor}, ${data.xp.levelColor}99)`
              }}>
                <p style={styles.levelName}>{data.xp.levelName}</p>
                <p style={styles.xpTotal}>{data.xp.total} XP</p>
                <p style={styles.weeklyXP}>+{data.xp.weekly} XP this week</p>

                {/* Progress bar */}
                {data.xp.nextLevel && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${data.xp.progress}%`,
                      }} />
                    </div>
                    <p style={styles.progressText}>
                      {data.xp.total} / {data.xp.nextLevel} XP to next level
                    </p>
                  </div>
                )}
              </div>

              {/* XP Sources */}
              <div style={styles.sourcesCard}>
                <h3 style={styles.sectionTitle}>💡 How to Earn XP</h3>
                {[
                  { action: 'Start a study session',    xp: '+5 XP'  },
                  { action: 'Complete an exam',          xp: '+20 XP' },
                  { action: 'Score 80%+ on an exam',     xp: '+50 XP' },
                  { action: 'Submit an assignment',      xp: '+10 XP' },
                  { action: 'Answer past questions',     xp: '+2 XP'  },
                  { action: 'Complete a challenge',      xp: '+50-300 XP' },
                  { action: 'Win a quiz battle',         xp: '+100 XP'},
                  { action: '7-day study streak',        xp: '+70 XP' },
                ].map((s, i) => (
                  <div key={i} style={styles.sourceRow}>
                    <p style={styles.sourceAction}>{s.action}</p>
                    <span style={styles.sourceXP}>{s.xp}</span>
                  </div>
                ))}
              </div>

              {/* Weekly Challenges */}
              <h3 style={styles.sectionTitle}>🏆 Weekly Challenges</h3>
              {data.challenges.map(c => (
                <div
                  key={c.id}
                  style={{
                    ...styles.challengeCard,
                    borderLeft: `4px solid ${c.completed ? '#27AE60' : '#2E86AB'}`,
                    background: c.completed ? '#EAFAF1' : '#fff',
                  }}
                >
                  <div style={styles.challengeTop}>
                    <p style={styles.challengeTitle}>{c.title}</p>
                    <span style={{
                      ...styles.xpBadge,
                      background: c.completed ? '#27AE60' : '#2E86AB',
                    }}>
                      +{c.xpReward} XP
                    </span>
                  </div>
                  <p style={styles.challengeDesc}>{c.description}</p>

                  {/* Progress */}
                  <div style={styles.challengeProgress}>
                    <div style={styles.challengeBar}>
                      <div style={{
                        ...styles.challengeFill,
                        width: `${Math.min(100, (c.myProgress / c.target) * 100)}%`,
                        background: c.completed ? '#27AE60' : '#2E86AB',
                      }} />
                    </div>
                    <p style={styles.challengeCount}>
                      {c.completed
                        ? '✅ Completed!'
                        : `${c.myProgress} / ${c.target}`}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:              { marginLeft: 235, flex: 1 },
  header:            { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:             { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:          { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:           { padding: 16 },
  center:            { textAlign: 'center', color: '#888', padding: 40 },
  levelCard:         { borderRadius: 20, padding: '28px 24px', marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  levelName:         { fontSize: 28, fontWeight: 'bold', color: '#fff', margin: '0 0 8px' },
  xpTotal:           { fontSize: 48, fontWeight: 'bold', color: '#fff', margin: '0 0 4px' },
  weeklyXP:          { fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 20px' },
  progressContainer: { background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 16px' },
  progressBar:       { height: 10, background: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill:      { height: '100%', background: '#fff', borderRadius: 5, transition: 'width 0.5s' },
  progressText:      { fontSize: 12, color: 'rgba(255,255,255,0.9)', margin: 0 },
  sourcesCard:       { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  sourceRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
  sourceAction:      { fontSize: 13, color: '#555', margin: 0 },
  sourceXP:          { fontSize: 13, fontWeight: 'bold', color: '#27AE60', background: '#EAFAF1', padding: '3px 8px', borderRadius: 6 },
  challengeCard:     { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  challengeTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  challengeTitle:    { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  xpBadge:           { color: '#fff', fontSize: 12, fontWeight: 'bold', padding: '3px 8px', borderRadius: 6 },
  challengeDesc:     { fontSize: 13, color: '#888', margin: '0 0 10px' },
  challengeProgress: { display: 'flex', alignItems: 'center', gap: 10 },
  challengeBar:      { flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  challengeFill:     { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  challengeCount:    { fontSize: 12, color: '#888', flexShrink: 0, margin: 0 },
};

export default XPLevel;