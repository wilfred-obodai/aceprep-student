import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { createTimetableEntry, getSchoolTimetable, deleteTimetableEntry } from '../../services/api';

const days    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const subjects = [
  'Mathematics', 'English Language', 'Integrated Science',
  'Social Studies', 'ICT', 'Physics', 'Chemistry',
  'Biology', 'Economics', 'Physical Education', 'French', 'Religious Studies'
];

const subjectColors = {
  'Mathematics':        '#2E86AB',
  'English Language':   '#8E44AD',
  'Integrated Science': '#27AE60',
  'Social Studies':     '#F39C12',
  'ICT':                '#2980B9',
  'Physics':            '#E67E22',
  'Chemistry':          '#E74C3C',
  'Biology':            '#1E8449',
  'Economics':          '#1A5276',
  'Physical Education': '#16A085',
  'French':             '#8E44AD',
  'Religious Studies':  '#D35400',
};

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const [subject,   setSubject]   = useState('Mathematics');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime,   setEndTime]   = useState('08:30');
  const [level,     setLevel]     = useState('SHS');
  const [yearGroup, setYearGroup] = useState('2');
  const [className, setClassName] = useState('');
  const [room,      setRoom]      = useState('');

  const fetchTimetable = async () => {
    try {
      const res = await getSchoolTimetable();
      if (res.data.success) setTimetable(res.data.timetable);
    } catch (e) {
      console.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetable(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await createTimetableEntry({
        subject, dayOfWeek, startTime, endTime,
        level, yearGroup: parseInt(yearGroup),
        className: className || undefined,
        room:      room      || undefined,
      });
      if (res.data.success) {
        setShowForm(false);
        fetchTimetable();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteTimetableEntry(id);
      setTimetable(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  // Group by day
  const grouped = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.dayOfWeek === day);
    return acc;
  }, {});

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📅 School Timetable</h1>
            <p style={styles.subtitle}>Manage class schedules for your school</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Class'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Add Timetable Entry</h2>
            {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.row}>
                <Field label="Subject *">
                  <select style={styles.input} value={subject}
                    onChange={e => setSubject(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Day *">
                  <select style={styles.input} value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value)}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div style={styles.row}>
                <Field label="Start Time *">
                  <input style={styles.input} type="time" value={startTime}
                    onChange={e => setStartTime(e.target.value)} required />
                </Field>
                <Field label="End Time *">
                  <input style={styles.input} type="time" value={endTime}
                    onChange={e => setEndTime(e.target.value)} required />
                </Field>
                <Field label="Room">
                  <input style={styles.input} value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="e.g. Room 12" />
                </Field>
              </div>
              <div style={styles.row}>
                <Field label="Level">
                  <select style={styles.input} value={level}
                    onChange={e => setLevel(e.target.value)}>
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </Field>
                <Field label="Year Group">
                  <select style={styles.input} value={yearGroup}
                    onChange={e => setYearGroup(e.target.value)}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </Field>
                <Field label="Class (Optional)">
                  <input style={styles.input} value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="e.g. 2A" />
                </Field>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Adding...' : '✅ Add to Timetable'}
              </button>
            </form>
          </div>
        )}

        {/* Timetable Grid */}
        {loading ? (
          <p style={styles.center}>Loading timetable...</p>
        ) : (
          <div style={styles.timetableGrid}>
            {days.map(day => (
              <div key={day} style={styles.dayColumn}>
                <div style={styles.dayHeader}>
                  <p style={styles.dayName}>{day}</p>
                  <span style={styles.dayCount}>
                    {grouped[day].length} class{grouped[day].length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div style={styles.dayEntries}>
                  {grouped[day].length === 0 ? (
                    <p style={styles.noClass}>No classes</p>
                  ) : (
                    grouped[day].map(entry => {
                      const color = subjectColors[entry.subject] || '#2E86AB';
                      return (
                        <div
                          key={entry.id}
                          style={{ ...styles.classEntry, borderLeft: `4px solid ${color}` }}
                        >
                          <div style={styles.entryTop}>
                            <p style={{ ...styles.entrySubject, color }}>{entry.subject}</p>
                            <button
                              style={styles.entryDelete}
                              onClick={() => handleDelete(entry.id)}
                            >✕</button>
                          </div>
                          <p style={styles.entryTime}>
                            ⏰ {entry.startTime.substring(0,5)} — {entry.endTime.substring(0,5)}
                          </p>
                          <p style={styles.entryMeta}>
                            {entry.level} Year {entry.yearGroup}
                            {entry.className ? ` — ${entry.className}` : ''}
                          </p>
                          {entry.room && (
                            <p style={styles.entryRoom}>📍 {entry.room}</p>
                          )}
                          {entry.teacherName && (
                            <p style={styles.entryTeacher}>👨‍🏫 {entry.teacherName}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
    <label style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>{label}</label>
    {children}
  </div>
);

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:     { fontSize: 14, color: '#888', marginTop: 4 },
  createBtn:    { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  formCard:     { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:    { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  errorBox:     { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: 12, marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  form:         { display: 'flex', flexDirection: 'column', gap: 16 },
  row:          { display: 'flex', gap: 12 },
  input:        { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:    { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  timetableGrid:{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  dayColumn:    { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  dayHeader:    { background: '#1A5276', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dayName:      { fontSize: 15, fontWeight: 'bold', color: '#fff', margin: 0 },
  dayCount:     { fontSize: 11, color: '#AED6F1' },
  dayEntries:   { padding: 10 },
  noClass:      { textAlign: 'center', color: '#aaa', fontSize: 13, padding: '20px 0' },
  classEntry:   { background: '#f8f9fa', borderRadius: 8, padding: 10, marginBottom: 8 },
  entryTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  entrySubject: { fontSize: 13, fontWeight: 'bold', margin: 0 },
  entryDelete:  { background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', fontSize: 12, padding: '0 2px' },
  entryTime:    { fontSize: 12, color: '#555', margin: '2px 0' },
  entryMeta:    { fontSize: 11, color: '#888', margin: '2px 0' },
  entryRoom:    { fontSize: 11, color: '#2E86AB', margin: '2px 0' },
  entryTeacher: { fontSize: 11, color: '#27AE60', margin: '2px 0' },
};

export default Timetable;