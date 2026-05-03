import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
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
    const fetchGrades = async () => {
      try {
        const res = await getSchoolGrades(filter);
        setGrades(res.data.grades);
      } catch (err) {
        console.error('Grades error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [filter]);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>

        <h1 style={styles.title}>Grade Management</h1>
        <p style={styles.subtitle}>
          Live grades — updated instantly when students submit assessments
        </p>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            style={styles.select}
            value={filter.subject}
            onChange={e => setFilter({ ...filter, subject: e.target.value })}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English Language">English Language</option>
            <option value="Integrated Science">Integrated Science</option>
            <option value="Social Studies">Social Studies</option>
            <option value="ICT">ICT</option>
          </select>

          <select
            style={styles.select}
            value={filter.assessmentType}
            onChange={e => setFilter({ ...filter, assessmentType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="mock-exam">Mock Exam</option>
            <option value="assignment">Assignment</option>
            <option value="test">Test</option>
          </select>
        </div>

        {/* Grades Table */}
        <div style={styles.section}>
          {loading ? (
            <p style={styles.loading}>Loading grades...</p>
          ) : grades.length === 0 ? (
            <p style={styles.empty}>No grades found</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Assessment</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Percentage</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => {
                  const gc = gradeColor(g.gradeLetter);
                  return (
                    <tr
                      key={g.id}
                      style={styles.tr}
                      onClick={() => navigate(`/students/${g.student.id}`)}
                    >
                      <td style={styles.td}>
                        <p style={styles.name}>{g.student.fullName}</p>
                        <p style={styles.small}>
                          {g.student.level} {g.student.yearGroup} — {g.student.className}
                        </p>
                      </td>
                      <td style={styles.td}>{g.subject}</td>
                      <td style={styles.td}>{g.assessmentName}</td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{g.assessmentType}</span>
                      </td>
                      <td style={styles.td}>
                        {g.score}/{g.maxScore}
                      </td>
                      <td style={styles.td}>{g.percentage}%</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.gradeBadge,
                          background: gc.bg,
                          color: gc.color,
                        }}>
                          {g.gradeLetter}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(g.takenAt).toLocaleDateString()}
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
  layout:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:      { marginLeft: 240, flex: 1, padding: '32px 28px' },
  title:     { fontSize: 26, color: '#1A5276', fontWeight: 'bold' },
  subtitle:  { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },
  filters:   { display: 'flex', gap: 16, marginBottom: 24 },
  select:    { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  section:   { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  loading:   { textAlign: 'center', color: '#888', padding: 40 },
  empty:     { textAlign: 'center', color: '#888', padding: 40 },
  table:     { width: '100%', borderCollapse: 'collapse' },
  thead:     { background: '#EAF4FB' },
  th:        { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:        { borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  td:        { padding: '12px 16px', fontSize: 14, color: '#333' },
  name:      { fontWeight: 'bold', color: '#1A5276' },
  small:     { fontSize: 12, color: '#888', marginTop: 2 },
  typeBadge: { background: '#EAF4FB', color: '#2E86AB', padding: '3px 8px', borderRadius: 4, fontSize: 12 },
  gradeBadge:{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' },
};

export default Grades;