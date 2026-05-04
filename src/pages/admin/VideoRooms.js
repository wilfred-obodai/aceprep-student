import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { createVideoRoom, getSchoolVideoRooms, deleteVideoRoom } from '../../services/api';

const subjects = [
  'Mathematics', 'English Language', 'Integrated Science',
  'Social Studies', 'ICT', 'Physics', 'Chemistry', 'Biology', 'Economics'
];

const VideoRooms = () => {
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [roomName,  setRoomName]  = useState('');
  const [subject,   setSubject]   = useState('Mathematics');
  const [level,     setLevel]     = useState('JHS');
  const [yearGroup, setYearGroup] = useState('2');

  const fetchRooms = async () => {
    try {
      const res = await getSchoolVideoRooms();
      if (res.data.success) setRooms(res.data.rooms || []);
    } catch (e) { console.error('Failed to load rooms'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await createVideoRoom({ roomName, subject, level, yearGroup: parseInt(yearGroup) });
      if (res.data.success) { setShowForm(false); setRoomName(''); fetchRooms(); }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create room');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('End this video room?')) return;
    try {
      await deleteVideoRoom(id);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert('Failed to end room'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Room code ${code} copied!`);
  };

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎥 Video Study Rooms</h1>
            <p style={styles.subtitle}>Create live video sessions for your students</p>
          </div>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Create Room'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>🎥 Create Video Room</h2>
            {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            <form onSubmit={handleCreate} style={styles.form}>
              <Field label="Room Name *">
                <input style={styles.input} value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="e.g. Mathematics Extra Class" required />
              </Field>
              <div style={styles.row}>
                <Field label="Subject">
                  <select style={styles.input} value={subject} onChange={e => setSubject(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Level">
                  <select style={styles.input} value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="JHS">JHS</option>
                    <option value="SHS">SHS</option>
                  </select>
                </Field>
                <Field label="Year Group">
                  <select style={styles.input} value={yearGroup} onChange={e => setYearGroup(e.target.value)}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </Field>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Creating...' : '🎥 Create Video Room'}
              </button>
            </form>
          </div>
        )}

        {/* Rooms List */}
        {loading ? (
          <p style={styles.center}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48 }}>🎥</p>
            <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No active rooms</h3>
            <p style={{ color: '#888' }}>Create a video room for your students</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {rooms.map(room => (
              <div key={room.id} style={styles.roomCard}>
                <div style={styles.roomTop}>
                  <span style={{ fontSize: 32 }}>🎥</span>
                  <button style={styles.endBtn} onClick={() => handleDelete(room.id)}>
                    🔴 End Room
                  </button>
                </div>
                <h3 style={styles.roomName}>{room.roomName || room.room_name}</h3>
                <p style={styles.roomMeta}>
                  📚 {room.subject} • 🎓 {room.level} Year {room.yearGroup || room.year_group}
                </p>
                <p style={styles.roomTeacher}>👨‍🏫 {room.teacherName || room.teacher_name || 'Teacher'}</p>
                <div style={styles.codeBox}>
                  <p style={styles.codeLabel}>Room Code for Students</p>
                  <p style={styles.codeValue}>{room.roomCode || room.room_code}</p>
                  <button onClick={() => copyCode(room.roomCode || room.room_code)} style={styles.copyBtn}>
                    📋 Copy Code
                  </button>
                </div>
                {room.dailyUrl && (
                  <a href={room.dailyUrl} target="_blank" rel="noreferrer" style={styles.joinLink}>
                    🚀 Open Video Room
                  </a>
                )}
                <p style={styles.roomDate}>
                  Created: {new Date(room.createdAt || room.created_at).toLocaleString()}
                </p>
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
  layout:     { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:       { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:      { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:   { fontSize: 14, color: '#888', marginTop: 4 },
  createBtn:  { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  formCard:   { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle:  { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  errorBox:   { background: '#FDEDEC', borderRadius: 8, padding: 12, marginBottom: 12, color: '#E74C3C', fontSize: 14 },
  form:       { display: 'flex', flexDirection: 'column', gap: 16 },
  row:        { display: 'flex', gap: 16 },
  input:      { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: '100%' },
  submitBtn:  { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  center:     { textAlign: 'center', color: '#888', padding: 40 },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  roomCard:   { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  roomTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  endBtn:     { background: '#FDEDEC', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#E74C3C', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  roomName:   { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  roomMeta:   { fontSize: 13, color: '#555', margin: '0 0 4px' },
  roomTeacher:{ fontSize: 13, color: '#27AE60', margin: '0 0 12px' },
  codeBox:    { background: '#1A5276', borderRadius: 10, padding: '12px 16px', textAlign: 'center', marginBottom: 12 },
  codeLabel:  { fontSize: 11, color: '#AED6F1', margin: '0 0 4px' },
  codeValue:  { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 6, margin: '0 0 8px' },
  copyBtn:    { background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' },
  joinLink:   { display: 'block', textAlign: 'center', background: '#27AE60', color: '#fff', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', textDecoration: 'none', marginBottom: 10 },
  roomDate:   { fontSize: 11, color: '#aaa', margin: 0 },
};

export default VideoRooms;