import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getXPLeaderboard } from '../../services/api';

const XPLeaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getXPLeaderboard();
        if (res.data.success) setStudents(res.data.leaderboard);
      } catch (e) { console.error('Failed to load XP leaderboard'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>🎯 XP Leaderboard</h1>
        <p style={styles.subtitle}>Students ranked by XP points and level</p>

        {/* Top 3 */}
        {!loading && students.length >= 3 && (
          <div style={styles.podium}>
            {[students[1], students[0], students[2]].map((s, i) => (
              <div key={s.studentId} style={{
                ...styles.podiumCard,
                transform: i === 1 ? 'scale(1.05)' : 'none'
              }}>
                <p style={{ fontSize: 32, margin: 0 }}>
                  {i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}
                </p>
                <div style={styles.podiumAvatar}>
                  {s.fullName.charAt(0)}
                </div>
                <p style={styles.podiumName}>{s.fullName}</p>
                <p style={styles.podiumLevel}>{s.levelName}</p>
                <p style={styles.podiumXP}>{s.xpPoints} XP</p>
              </div>
            ))}
          </div>
        )}

        {/* Full Table */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>All Students</h2>
          {loading ? (
            <p style={styles.center}>Loading...</p>
          ) : students.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 48 }}>🎯</p>
              <p style={{ color: '#888' }}>No XP data yet</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>XP Points</th>
                  <th style={styles.th}>Weekly XP</th>
                  <th style={styles.th}>Class</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.studentId} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.rankBadge}>
                        {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `#${s.rank}`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.studentName}>{s.fullName}</p>
                      <p style={styles.studentMeta}>{s.level} Year {s.yearGroup}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.levelBadge}>{s.levelName}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.xpValue}>{s.xpPoints} XP</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.weeklyXP}>+{s.weeklyXP}</span>
                    </td>
                    <td style={styles.td}>{s.className || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 240, flex: 1, padding: '28px 24px' },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },
  podium:       { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, background: '#fff', borderRadius: 16, padding: '24px 20px 0', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  podiumCard:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 140, paddingBottom: 20 },
  podiumAvatar: { width: 52, height: 52, borderRadius: 26, background: '#2E86AB', color: '#fff', fontSize: 22, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  podiumName:   { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: 0, textAlign: 'center' },
  podiumLevel:  { fontSize: 11, color: '#888', margin: 0 },
  podiumXP:     { fontSize: 16, fontWeight: 'bold', color: '#F39C12', margin: 0 },
  tableCard:    { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  tableTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '40px 20px' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#EAF4FB' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:           { borderBottom: '1px solid #f0f0f0' },
  td:           { padding: '12px 16px', fontSize: 14, color: '#333' },
  rankBadge:    { fontSize: 18 },
  studentName:  { fontWeight: 'bold', color: '#1A5276', margin: 0 },
  studentMeta:  { fontSize: 12, color: '#888', margin: '2px 0 0' },
  levelBadge:   { fontSize: 13, fontWeight: 'bold' },
  xpValue:      { fontSize: 15, fontWeight: 'bold', color: '#F39C12' },
  weeklyXP:     { fontSize: 13, color: '#27AE60', fontWeight: 'bold', background: '#EAFAF1', padding: '3px 8px', borderRadius: 6 },
};

export default XPLeaderboard;