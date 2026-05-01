import React, { useEffect, useState } from 'react';
import { getStudentTimetable } from '../services/api';
import BottomNav from '../components/BottomNav';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
  const [activeDay, setActiveDay] = useState(
    days[new Date().getDay() - 1] || 'Monday'
  );

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentTimetable();
        if (res.data.success) setTimetable(res.data.timetable);
      } catch (e) {
        console.error('Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const grouped = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.dayOfWeek === day);
    return acc;
  }, {});

  const todayClasses = grouped[activeDay] || [];

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📅 My Timetable</h1>
          <p style={styles.subtitle}>Your class schedule for the week</p>
        </div>

        {/* Day Selector */}
        <div style={styles.daySelector}>
          {days.map(day => (
            <button
              key={day}
              style={{
                ...styles.dayBtn,
                background: activeDay === day ? '#2E86AB' : '#fff',
                color:      activeDay === day ? '#fff' : '#555',
              }}
              onClick={() => setActiveDay(day)}
            >
              <p style={styles.dayShort}>{day.substring(0, 3)}</p>
              <p style={styles.dayCount}>{grouped[day]?.length || 0}</p>
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {loading ? (
            <p style={styles.center}>Loading timetable...</p>
          ) : timetable.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 56 }}>📅</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No timetable yet</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                Your school hasn't uploaded a timetable yet.
              </p>
            </div>
          ) : todayClasses.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 48 }}>🎉</p>
              <p style={{ color: '#888', fontSize: 14 }}>No classes on {activeDay}!</p>
            </div>
          ) : (
            todayClasses.map(entry => {
              const color = subjectColors[entry.subject] || '#2E86AB';
              return (
                <div key={entry.id} style={{ ...styles.classCard, borderLeft: `5px solid ${color}` }}>
                  <div style={styles.classTime}>
                    <p style={styles.timeText}>
                      {entry.startTime.substring(0,5)}
                    </p>
                    <p style={styles.timeSep}>|</p>
                    <p style={styles.timeText}>
                      {entry.endTime.substring(0,5)}
                    </p>
                  </div>
                  <div style={styles.classInfo}>
                    <p style={{ ...styles.classSubject, color }}>{entry.subject}</p>
                    <p style={styles.classMeta}>
                      {entry.level} Year {entry.yearGroup}
                      {entry.className ? ` — ${entry.className}` : ''}
                    </p>
                    {entry.teacherName && (
                      <p style={styles.classTeacher}>👨‍🏫 {entry.teacherName}</p>
                    )}
                    {entry.room && (
                      <p style={styles.classRoom}>📍 {entry.room}</p>
                    )}
                  </div>
                  <div style={{ ...styles.durationBadge, background: `${color}22`, color }}>
                    {Math.round((new Date(`2000-01-01T${entry.endTime}`) -
                                 new Date(`2000-01-01T${entry.startTime}`)) / 60000)} min
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 220, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  daySelector:  { display: 'flex', gap: 8, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #eee' },
  dayBtn:       { flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'center' },
  dayShort:     { fontSize: 13, fontWeight: 'bold', margin: 0 },
  dayCount:     { fontSize: 11, margin: '2px 0 0', opacity: 0.7 },
  content:      { padding: 16 },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:   { textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  classCard:    { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  classTime:    { textAlign: 'center', flexShrink: 0, width: 50 },
  timeText:     { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  timeSep:      { fontSize: 10, color: '#aaa', margin: '2px 0' },
  classInfo:    { flex: 1 },
  classSubject: { fontSize: 16, fontWeight: 'bold', margin: '0 0 4px' },
  classMeta:    { fontSize: 12, color: '#888', margin: '0 0 3px' },
  classTeacher: { fontSize: 12, color: '#27AE60', margin: '0 0 2px' },
  classRoom:    { fontSize: 12, color: '#2E86AB', margin: 0 },
  durationBadge:{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 'bold', flexShrink: 0 },
};

export default Timetable;