import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolStudents } from '../../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState({ level: '', yearGroup: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getSchoolStudents(filter);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Students error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [filter]);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>

        <h1 style={styles.title}>Students</h1>
        <p style={styles.subtitle}>
          All students registered under your school code
        </p>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            style={styles.select}
            value={filter.level}
            onChange={e => setFilter({ ...filter, level: e.target.value })}
          >
            <option value="">All Levels</option>
            <option value="JHS">JHS</option>
            <option value="SHS">SHS</option>
          </select>

          <select
            style={styles.select}
            value={filter.yearGroup}
            onChange={e => setFilter({ ...filter, yearGroup: e.target.value })}
          >
            <option value="">All Year Groups</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
          </select>
        </div>

        {/* Students Table */}
        <div style={styles.section}>
          {loading ? (
            <p style={styles.loading}>Loading students...</p>
          ) : students.length === 0 ? (
            <p style={styles.empty}>No students found</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>Year</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Track</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.name}>{s.fullName}</p>
                      <p style={styles.email}>{s.email}</p>
                    </td>
                    <td style={styles.td}>{s.level}</td>
                    <td style={styles.td}>Year {s.yearGroup}</td>
                    <td style={styles.td}>{s.className || '—'}</td>
                    <td style={styles.td}>{s.shsTrack || '—'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: '#EAFAF1',
                        color: '#27AE60',
                      }}>
                        {s.studentType}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(s.joinedAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/students/${s.id}`)}
                      >
                        View Profile
                      </button>
                    </td>
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
  layout:   { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:     { marginLeft: 240, flex: 1, padding: '32px 28px' },
  title:    { fontSize: 26, color: '#1A5276', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },
  filters:  { display: 'flex', gap: 16, marginBottom: 24 },
  select:   { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  section:  { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  loading:  { textAlign: 'center', color: '#888', padding: 40 },
  empty:    { textAlign: 'center', color: '#888', padding: 40 },
  table:    { width: '100%', borderCollapse: 'collapse' },
  thead:    { background: '#EAF4FB' },
  th:       { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:       { borderBottom: '1px solid #f0f0f0' },
  td:       { padding: '12px 16px', fontSize: 14, color: '#333' },
  name:     { fontWeight: 'bold', color: '#1A5276' },
  email:    { fontSize: 12, color: '#888', marginTop: 2 },
  badge:    { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' },
  viewBtn:  { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13 },
};

export default Students;