import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getSchoolGrades } from '../../services/api';

const gradeColor = (letter) => {
  const colors = {
    A: { bg: '#EAFAF1', color: '#27AE60' },
    B: { bg: '#EAF4FB', color: '#2E86AB' },
    C: { bg: '#EBF5FB', color: '#2980B9' },
    D: { bg: '#FEF9E7', color: '#F39C12' },
    E: { bg: '#FDEBD0', color: '#E67E22' },
    F: { bg: '#FDEDEC', color: '#E74C3C' },
  };
  return colors[letter] || { bg: '#f0f0f0', color: '#333' };
};

const Grades = () => {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState({ subject: '', assessmentType: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrades();
  }, [filter]); // eslint-disable-line

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await getSchoolGrades(filter);
      if (res.data.success) setGrades(res.data.grades || []);
    } catch (err) {
      console.error('Grades error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Export CSV ────────────────────────────────
  const exportCSV = () => {
    if (grades.length === 0) return;

    const headers = ['Student Name', 'Level', 'Year', 'Class', 'Subject', 'Assessment', 'Type', 'Score', 'Max Score', 'Percentage', 'Grade', 'Date'];

    const rows = grades.map(g => [
      g.student?.fullName || '',
      g.student?.level || '',
      g.student?.yearGroup || '',
      g.student?.className || '',
      g.subject || '',
      g.assessmentName || '',
      g.assessmentType || '',
      g.score || '',
      g.maxScore || '',
      `${g.percentage}%`,
      g.gradeLetter || '',
      new Date(g.takenAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `aceprep-grades-${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Stats ─────────────────────────────────────
  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((s, g) => s + parseFloat(g.percentage || 0), 0) / grades.length)
    : 0;

  const gradeDistribution = grades.reduce((acc, g) => {
    acc[g.gradeLetter] = (acc[g.gradeLetter] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 Grade Management</h1>
            <p style={styles.subtitle}>Live grades — updated when students submit assessments</p>
          </div>
          <button
            style={styles.exportBtn}
            onClick={exportCSV}
            disabled={grades.length === 0}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Stats */}
        {!loading && grades.length > 0 && (
          <div style={styles.statsGrid}>
            <StatCard icon="📝" label="Total Grades"  value={grades.length}  color="#2E86AB" />
            <StatCard icon="📊" label="Average Score" value={`${avgScore}%`} color={avgScore >= 70 ? '#006B3F' : avgScore >= 50 ? '#b8860b' : '#CE1126'} />
            <StatCard icon="🌟" label="A Grades"      value={gradeDistribution['A'] || 0} color="#006B3F" />
            <StatCard icon="⚠️"  label="F Grades"      value={gradeDistribution['F'] || 0} color="#CE1126" />
          </div>
        )}

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filters}>
            <select style={styles.select} value={filter.subject}
              onChange={e => setFilter({ ...filter, subject: e.target.value })}>
              <option value="">All Subjects</option>
              {['Mathematics','English Language','Integrated Science','Social Studies','ICT','Physics','Chemistry','Biology','Economics'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select style={styles.select} value={filter.assessmentType}
              onChange={e => setFilter({ ...filter, assessmentType: e.target.value })}>
              <option value="">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="mock-exam">Mock Exam</option>
              <option value="assignment">Assignment</option>
              <option value="test">Test</option>
            </select>
          </div>
          <p style={styles.resultCount}>
            Showing {grades.length} grade{grades.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grade Distribution */}
        {!loading && grades.length > 0 && (
          <div style={styles.distCard}>
            <p style={styles.distTitle}>Grade Distribution</p>
            <div style={styles.distRow}>
              {['A','B','C','D','E','F'].map(letter => {
                const gc    = gradeColor(letter);
                const count = gradeDistribution[letter] || 0;
                const pct   = grades.length > 0 ? Math.round((count / grades.length) * 100) : 0;
                return (
                  <div key={letter} style={styles.distItem}>
                    <div style={styles.distBarWrap}>
                      <div style={{ ...styles.distBar, height: `${Math.max(pct, 4)}%`, background: gc.color }} />
                    </div>
                    <span style={{ ...styles.distLetter, color: gc.color }}>{letter}</span>
                    <span style={styles.distCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grades Table */}
        <div style={styles.section}>
          {loading ? (
            <p style={styles.center}>Loading grades...</p>
          ) : grades.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>📊</p>
              <p style={{ color: '#888' }}>No grades found</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Assessment</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>%</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => {
                  const gc = gradeColor(g.gradeLetter);
                  return (
                    <tr key={g.id} style={styles.tr}
                      onClick={() => navigate(`/admin/students/${g.student?.id}`)}>
                      <td style={styles.td}>
                        <p style={styles.name}>{g.student?.fullName}</p>
                        <p style={styles.small}>{g.student?.level} Year {g.student?.yearGroup}{g.student?.className ? ` • ${g.student.className}` : ''}</p>
                      </td>
                      <td style={styles.td}>{g.subject}</td>
                      <td style={styles.td}>{g.assessmentName}</td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{g.assessmentType}</span>
                      </td>
                      <td style={styles.td}>{g.score}/{g.maxScore}</td>
                      <td style={styles.td}><strong>{g.percentage}%</strong></td>
                      <td style={styles.td}>
                        <span style={{ ...styles.gradeBadge, background: gc.bg, color: gc.color }}>
                          {g.gradeLetter}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(g.takenAt).toLocaleDateString()}</td>
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

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: 24, margin: 0 }}>{icon}</p>
    <p style={{ fontSize: 22, fontWeight: 'bold', color, margin: '6px 0 4px' }}>{value}</p>
    <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{label}</p>
  </div>
);

const styles = {
  layout:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 240, flex: 1 },
  header:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:    { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  exportBtn:   { background: '#006B3F', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 24px 0' },
  filterRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' },
  filters:     { display: 'flex', gap: 12 },
  select:      { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  resultCount: { fontSize: 14, color: '#888', margin: 0 },
  distCard:    { background: '#fff', borderRadius: 12, padding: '16px 24px', margin: '0 24px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  distTitle:   { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  distRow:     { display: 'flex', gap: 16, alignItems: 'flex-end', height: 80 },
  distItem:    { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  distBarWrap: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', marginBottom: 4 },
  distBar:     { width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.3s', minHeight: 4 },
  distLetter:  { fontSize: 14, fontWeight: 'bold' },
  distCount:   { fontSize: 12, color: '#aaa' },
  section:     { background: '#fff', borderRadius: 12, margin: '0 24px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  center:      { textAlign: 'center', color: '#888', padding: 40 },
  empty:       { textAlign: 'center', padding: '40px 20px' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: '#EAF4FB' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:          { borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  td:          { padding: '12px 16px', fontSize: 14, color: '#333' },
  name:        { fontWeight: 'bold', color: '#1A5276', margin: 0 },
  small:       { fontSize: 12, color: '#888', marginTop: 2, margin: 0 },
  typeBadge:   { background: '#EAF4FB', color: '#2E86AB', padding: '3px 8px', borderRadius: 4, fontSize: 12 },
  gradeBadge:  { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' },
};

export default Grades;