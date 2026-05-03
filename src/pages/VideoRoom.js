import React, { useState, useEffect } from 'react';
import { joinVideoRoom } from '../services/api';
import BottomNav from '../components/BottomNav';

const VideoRoom = () => {
  const [code,     setCode]     = useState('');
  const [room,     setRoom]     = useState(null);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [inRoom,   setInRoom]   = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await joinVideoRoom(code.toUpperCase());
      if (res.data.success) {
        setRoom(res.data.room);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Room not found. Check the code!');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = () => {
    if (room?.dailyUrl) {
      window.open(room.dailyUrl, '_blank');
    } else {
      setInRoom(true);
    }
  };

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎥 Video Study Room</h1>
          <p style={styles.subtitle}>Join your teacher's live study session</p>
        </div>

        <div style={styles.content}>
          {inRoom && room ? (
            // In-app fallback room (when Daily.co not configured)
            <div style={styles.roomContainer}>
              <div style={styles.roomHeader}>
                <h2 style={styles.roomName}>{room.roomName}</h2>
                <p style={styles.roomInfo}>
                  {room.subject} • Hosted by {room.teacherName}
                </p>
              </div>
              <div style={styles.videoPlaceholder}>
                <p style={{ fontSize: 64 }}>🎥</p>
                <p style={{ color: '#888', fontSize: 16, margin: '16px 0 8px' }}>
                  Video room is active
                </p>
                <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', maxWidth: 300 }}>
                  To enable video calls, your school admin needs to configure Daily.co API.
                  Share this room code with classmates: <strong>{room.roomCode}</strong>
                </p>
              </div>
              <button
                style={styles.leaveBtn}
                onClick={() => { setInRoom(false); setRoom(null); setCode(''); }}
              >
                🚪 Leave Room
              </button>
            </div>
          ) : room ? (
            // Room found — show details
            <div style={styles.roomFoundCard}>
              <div style={styles.roomFoundHeader}>
                <span style={{ fontSize: 48 }}>🎥</span>
                <div>
                  <h2 style={styles.roomFoundName}>{room.roomName}</h2>
                  <p style={styles.roomFoundInfo}>
                    📚 {room.subject || 'General'} • 👨‍🏫 {room.teacherName}
                  </p>
                </div>
              </div>
              <div style={styles.roomCodeDisplay}>
                <p style={styles.roomCodeLabel}>Room Code</p>
                <p style={styles.roomCodeValue}>{room.roomCode}</p>
              </div>
              <button style={styles.enterBtn} onClick={handleEnterRoom}>
                🚀 Enter Study Room
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => { setRoom(null); setCode(''); }}
              >
                ← Back
              </button>
            </div>
          ) : (
            // Join Room Form
            <>
              <div style={styles.joinCard}>
                <h2 style={styles.joinTitle}>Enter Room Code</h2>
                <p style={styles.joinDesc}>
                  Ask your teacher for the room code to join the live session
                </p>
                <input
                  style={styles.codeInput}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={10}
                />
                {error && <p style={styles.errorText}>{error}</p>}
                <button
                  style={{ ...styles.joinBtn, opacity: !code.trim() || loading ? 0.7 : 1 }}
                  onClick={handleJoin}
                  disabled={!code.trim() || loading}
                >
                  {loading ? 'Finding room...' : '🔍 Find Room'}
                </button>
              </div>

              {/* Info */}
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>🎥 About Video Study Rooms</h3>
                {[
                  '👨‍🏫 Your teacher creates a room and shares a code',
                  '📱 You join using the code on this page',
                  '🎥 Video, audio and screen sharing available',
                  '💬 Chat with classmates during the session',
                  '📚 Study together in real-time',
                ].map((item, i) => (
                  <p key={i} style={styles.infoItem}>{item}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:             { marginLeft: 235, flex: 1 },
  header:           { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:         { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  content:          { padding: 16 },
  joinCard:         { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  joinTitle:        { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  joinDesc:         { fontSize: 13, color: '#888', margin: '0 0 20px' },
  codeInput:        { width: '100%', padding: '16px', border: '2px solid #2E86AB', borderRadius: 12, fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 8, boxSizing: 'border-box', marginBottom: 12 },
  errorText:        { color: '#E74C3C', fontSize: 14, margin: '0 0 12px' },
  joinBtn:          { width: '100%', padding: 14, background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  infoCard:         { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoTitle:        { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  infoItem:         { fontSize: 13, color: '#555', padding: '8px 0', borderBottom: '1px solid #f0f0f0', margin: 0 },
  roomFoundCard:    { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  roomFoundHeader:  { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 },
  roomFoundName:    { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  roomFoundInfo:    { fontSize: 13, color: '#888', margin: 0 },
  roomCodeDisplay:  { background: '#EAF4FB', borderRadius: 10, padding: '12px 16px', textAlign: 'center', marginBottom: 16 },
  roomCodeLabel:    { fontSize: 12, color: '#2E86AB', margin: '0 0 4px', fontWeight: 'bold' },
  roomCodeValue:    { fontSize: 24, fontWeight: 'bold', color: '#1A5276', letterSpacing: 4, margin: 0 },
  enterBtn:         { width: '100%', padding: 14, background: 'linear-gradient(135deg, #27AE60, #1E8449)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginBottom: 10 },
  cancelBtn:        { width: '100%', padding: 12, background: '#f0f0f0', border: 'none', borderRadius: 10, fontSize: 14, color: '#555', cursor: 'pointer' },
  roomContainer:    { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  roomHeader:       { marginBottom: 16, textAlign: 'center' },
  roomName:         { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  roomInfo:         { fontSize: 13, color: '#888', margin: 0 },
  videoPlaceholder: { background: '#f8f9fa', borderRadius: 12, padding: '40px 20px', textAlign: 'center', marginBottom: 16, border: '2px dashed #ddd' },
  leaveBtn:         { width: '100%', padding: 14, background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
};

export default VideoRoom;