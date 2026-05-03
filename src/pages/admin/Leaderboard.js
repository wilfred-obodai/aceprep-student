import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolLeaderboard } from '../../services/api';

const gradeColor = (grade) => {
  const map = {
    A: '#27AE60', B: '#2E86AB', C: '#2980B9',
    D: '#F39C12', E: '#E67E22', F: '#E74C3C',
  };
  return map[grade] || '#333';
};

const Leaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSchoolLeaderboard();
        if (res.data.success) setStudents(res.data.leaderboard);
      } catch (e) {
        console.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getRankDisplay = (rank) => {
    if (rank === 1) return { emoji: '🥇', bg: '#FEF9E7', color: '#F39C12' };
    if (rank === 2) return { emoji: '🥈', bg: '#F8F9FA', color: '#888' };
    if (rank === 3) return { emoji: '🥉', bg: '#FDF3E7', color: '#CD7F32' };
    return { emoji: `#${rank}`, bg: '#EAF4FB', color: '#2E86AB' };
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🏆 School Leaderboard</h1>
            <p style={styles.subtitle}>Top performing students ranked by average score</p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && students.length >= 3 && (
          <div style={styles.podium}>
            {/* 2nd Place */}
            <div style={styles.podiumCard}>
              <p style={styles.podiumEmoji}>🥈</p>
              <div style={styles.podiumAvatar}>
                {students[1].fullName.charAt(0)}
              </div>
              <p style={styles.podiumName}>{students[1].fullName}</p>
              <p style={styles.podiumScore}>{students[1].averageScore}%</p>
              <div style={{ ...styles.podiumBar, height: 80, background: '#888' }} />
            </div>

            {/* 1st Place */}
            <div style={{ ...styles.podiumCard, transform: 'scale(1.05)' }}>
              <p style={styles.podiumEmoji}>🥇</p>
              <div style={{ ...styles.podiumAvatar, background: '#F39C12', width: 64, height: 64, fontSize: 28 }}>
                {students[0].fullName.charAt(0)}
              </div>
              <p style={styles.podiumName}>{students[0].fullName}</p>
              <p style={styles.podiumScore}>{students[0].averageScore}%</p>
              <div style={{ ...styles.podiumBar, height: 100, background: '#F39C12' }} />
            </div>

            {/* 3rd Place */}
            <div style={styles.podiumCard}>
              <p style={styles.podiumEmoji}>🥉</p>
              <div style={{ ...styles.podiumAvatar, background: '#CD7F32' }}>
                {students[2].fullName.charAt(0)}
              </div>
              <p style={styles.podiumName}>{students[2].fullName}</p>
              <p style={styles.podiumScore}>{students[2].averageScore}%</p>
              <div style={{ ...styles.podiumBar, height: 60, background: '#CD7F32' }} />
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>Full Rankings</h2>
          {loading ? (
            <p style={styles.center}>Loading leaderboard...</p>
          ) : students.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 48 }}>🏆</p>
              <p style={{ color: '#888', marginTop: 8 }}>
                No students ranked yet. Students need to complete assessments first.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Avg Score</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Assessments</th>
                  <th style={styles.th}>Streak</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const rd = getRankDisplay(s.rank);
                  return (
                    <tr key={s.studentId} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.rankBadge,
                          background: rd.bg,
                          color:      rd.color,
                        }}>
                          {rd.emoji}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.studentCell}>
                          <div style={styles.miniAvatar}>
                            {s.fullName.charAt(0)}
                          </div>
                          <div>
                            <p style={styles.studentName}>{s.fullName}</p>
                            <p style={styles.studentLevel}>
                              {s.level} Year {s.yearGroup}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{s.className || '—'}</td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 'bold', color: gradeColor(s.grade) }}>
                          {s.averageScore}%
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.gradeBadge,
                          color:      gradeColor(s.grade),
                          background: `${gradeColor(s.grade)}22`,
                        }}>
                          {s.grade}
                        </span>
                      </td>
                      <td style={styles.td}>{s.totalAssessments}</td>
                      <td style={styles.td}>
                        {s.currentStreak > 0
                          ? `🔥 ${s.currentStreak} days`
                          : '—'}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => navigate(`/students/${s.studentId}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },

  // Podium
  podium:       { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 24, background: '#fff', borderRadius: 16, padding: '24px 20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  podiumCard:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 140 },
  podiumEmoji:  { fontSize: 32, margin: 0 },
  podiumAvatar: { width: 52, height: 52, borderRadius: 26, background: '#2E86AB', color: '#fff', fontSize: 22, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  podiumName:   { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: 0, textAlign: 'center' },
  podiumScore:  { fontSize: 16, fontWeight: 'bold', color: '#555', margin: 0 },
  podiumBar:    { width: '100%', borderRadius: '8px 8px 0 0', marginTop: 8 },

  // Table
  tableCard:    { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  tableTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '40px 20px' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#EAF4FB' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:           { borderBottom: '1px solid #f0f0f0' },
  td:           { padding: '12px 16px', fontSize: 14, color: '#333' },
  rankBadge:    { padding: '4px 10px', borderRadius: 6, fontSize: 14, fontWeight: 'bold' },
  studentCell:  { display: 'flex', alignItems: 'center', gap: 10 },
  miniAvatar:   { width: 36, height: 36, borderRadius: 18, background: '#2E86AB', color: '#fff', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  studentName:  { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  studentLevel: { fontSize: 12, color: '#888', margin: '2px 0 0' },
  gradeBadge:   { padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' },
  viewBtn:      { background: '#EAF4FB', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#2E86AB', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
};

export default Leaderboard;