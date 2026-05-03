import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolStudents, markAttendance, getSchoolAttendance } from '../../services/api';

const statusConfig = {
  present: { bg: '#EAFAF1', color: '#27AE60', label: '✅ Present' },
  absent:  { bg: '#FDEDEC', color: '#E74C3C', label: '❌ Absent'  },
  late:    { bg: '#FEF9E7', color: '#F39C12', label: '⏰ Late'    },
};

const Attendance = () => {
  const [students,   setStudents]   = useState([]);
  const [records,    setRecords]    = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [view,       setView]       = useState('mark');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [subject,    setSubject]    = useState('');
  const [summary,    setSummary]    = useState(null);
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getSchoolStudents();
        if (res.data.success) {
          setStudents(res.data.students);
          // Default all to present
          const defaultAttendance = {};
          res.data.students.forEach(s => {
            defaultAttendance[s.id] = 'present';
          });
          setAttendance(defaultAttendance);
        }
      } catch (e) {
        console.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await getSchoolAttendance({ date, subject: subject || undefined });
      if (res.data.success) {
        setRecords(res.data.records);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error('Failed to load records');
    }
  };

  useEffect(() => {
    if (view === 'view') fetchRecords();
  }, [view, date, subject]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsArr = students.map(s => ({
        studentId: s.id,
        status:    attendance[s.id] || 'present',
      }));
      const res = await markAttendance({
        records: recordsArr,
        date,
        subject: subject || undefined,
      });
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = filterYear
    ? students.filter(s => String(s.yearGroup) === filterYear)
    : students;

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount  = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount    = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📋 Attendance</h1>
            <p style={styles.subtitle}>Mark and view student attendance</p>
          </div>
          <div style={styles.viewTabs}>
            <button
              style={{ ...styles.viewTab, background: view === 'mark' ? '#2E86AB' : '#fff', color: view === 'mark' ? '#fff' : '#555' }}
              onClick={() => setView('mark')}
            >✏️ Mark</button>
            <button
              style={{ ...styles.viewTab, background: view === 'view' ? '#2E86AB' : '#fff', color: view === 'view' ? '#fff' : '#555' }}
              onClick={() => setView('view')}
            >👁️ View</button>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filtersRow}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Date</label>
            <input style={styles.filterInput} type="date" value={date}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Subject (Optional)</label>
            <input style={styles.filterInput} value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Mathematics" />
          </div>
          {view === 'mark' && (
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>Year Group</label>
              <select style={styles.filterInput} value={filterYear}
                onChange={e => setFilterYear(e.target.value)}>
                <option value="">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
              </select>
            </div>
          )}
        </div>

        {view === 'mark' ? (
          <>
            {/* Quick Mark All */}
            <div style={styles.quickMark}>
              <span style={styles.quickLabel}>Mark all as:</span>
              <button style={{ ...styles.quickBtn, background: '#EAFAF1', color: '#27AE60' }}
                onClick={() => handleMarkAll('present')}>✅ All Present</button>
              <button style={{ ...styles.quickBtn, background: '#FDEDEC', color: '#E74C3C' }}
                onClick={() => handleMarkAll('absent')}>❌ All Absent</button>
              <button style={{ ...styles.quickBtn, background: '#FEF9E7', color: '#F39C12' }}
                onClick={() => handleMarkAll('late')}>⏰ All Late</button>
            </div>

            {/* Summary */}
            <div style={styles.summaryRow}>
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryVal, color: '#27AE60' }}>{presentCount}</p>
                <p style={styles.summaryLbl}>Present</p>
              </div>
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryVal, color: '#E74C3C' }}>{absentCount}</p>
                <p style={styles.summaryLbl}>Absent</p>
              </div>
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryVal, color: '#F39C12' }}>{lateCount}</p>
                <p style={styles.summaryLbl}>Late</p>
              </div>
              <div style={styles.summaryBox}>
                <p style={{ ...styles.summaryVal, color: '#2E86AB' }}>{filteredStudents.length}</p>
                <p style={styles.summaryLbl}>Total</p>
              </div>
            </div>

            {/* Student List */}
            {loading ? (
              <p style={styles.center}>Loading students...</p>
            ) : (
              <>
                {filteredStudents.map(student => {
                  const status = attendance[student.id] || 'present';
                  const sc     = statusConfig[status];
                  return (
                    <div key={student.id} style={styles.studentRow}>
                      <div style={styles.studentAvatar}>
                        {student.fullName.charAt(0)}
                      </div>
                      <div style={styles.studentInfo}>
                        <p style={styles.studentName}>{student.fullName}</p>
                        <p style={styles.studentMeta}>
                          {student.level} Year {student.yearGroup}
                          {student.className ? ` — ${student.className}` : ''}
                        </p>
                      </div>
                      <div style={styles.statusBtns}>
                        {Object.entries(statusConfig).map(([key, val]) => (
                          <button
                            key={key}
                            style={{
                              ...styles.statusBtn,
                              background: status === key ? val.bg : '#f8f9fa',
                              color:      status === key ? val.color : '#aaa',
                              border:     status === key ? `2px solid ${val.color}` : '1px solid #eee',
                            }}
                            onClick={() => handleStatusChange(student.id, key)}
                          >
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {saved && (
                  <div style={styles.savedMsg}>✅ Attendance saved successfully!</div>
                )}

                <button
                  style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '💾 Save Attendance'}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {/* View Records */}
            {summary && (
              <div style={styles.summaryRow}>
                <div style={styles.summaryBox}>
                  <p style={{ ...styles.summaryVal, color: '#27AE60' }}>{summary.present}</p>
                  <p style={styles.summaryLbl}>Present</p>
                </div>
                <div style={styles.summaryBox}>
                  <p style={{ ...styles.summaryVal, color: '#E74C3C' }}>{summary.absent}</p>
                  <p style={styles.summaryLbl}>Absent</p>
                </div>
                <div style={styles.summaryBox}>
                  <p style={{ ...styles.summaryVal, color: '#F39C12' }}>{summary.late}</p>
                  <p style={styles.summaryLbl}>Late</p>
                </div>
                <div style={styles.summaryBox}>
                  <p style={{ ...styles.summaryVal, color: '#2E86AB' }}>{summary.total}</p>
                  <p style={styles.summaryLbl}>Total</p>
                </div>
              </div>
            )}

            {records.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: 48 }}>📋</p>
                <p style={{ color: '#888' }}>No attendance records for this date</p>
              </div>
            ) : (
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => {
                      const sc = statusConfig[r.status] || statusConfig.present;
                      return (
                        <tr key={r.id} style={styles.tr}>
                          <td style={styles.td}>{r.fullName}</td>
                          <td style={styles.td}>
                            {r.level} Year {r.yearGroup}
                            {r.className ? ` — ${r.className}` : ''}
                          </td>
                          <td style={styles.td}>
                            {new Date(r.date).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>{r.subject || '—'}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },
  viewTabs:     { display: 'flex', gap: 8 },
  viewTab:      { padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  filtersRow:   { display: 'flex', gap: 16, marginBottom: 16, background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  filterItem:   { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  filterLabel:  { fontSize: 12, fontWeight: 'bold', color: '#555' },
  filterInput:  { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  quickMark:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  quickLabel:   { fontSize: 14, color: '#555', fontWeight: 'bold' },
  quickBtn:     { padding: '8px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  summaryRow:   { display: 'flex', gap: 12, marginBottom: 16 },
  summaryBox:   { flex: 1, background: '#fff', borderRadius: 12, padding: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  summaryVal:   { fontSize: 28, fontWeight: 'bold', margin: 0 },
  summaryLbl:   { fontSize: 12, color: '#888', margin: '4px 0 0' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  studentRow:   { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  studentAvatar:{ width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  studentInfo:  { flex: 1 },
  studentName:  { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  studentMeta:  { fontSize: 12, color: '#888', margin: '2px 0 0' },
  statusBtns:   { display: 'flex', gap: 6 },
  statusBtn:    { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', cursor: 'pointer' },
  savedMsg:     { background: '#EAFAF1', border: '1px solid #27AE60', borderRadius: 8, padding: '12px 16px', marginBottom: 12, color: '#27AE60', fontWeight: 'bold', textAlign: 'center' },
  saveBtn:      { width: '100%', padding: 14, background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginTop: 8 },
  emptyState:   { textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 12 },
  tableCard:    { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#EAF4FB' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:           { borderBottom: '1px solid #f0f0f0' },
  td:           { padding: '12px 16px', fontSize: 14, color: '#333' },
  statusBadge:  { padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
};

export default Attendance;