import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.notifications?.filter(n => !n.is_read).length || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    const icons = {
      exam:         '📝',
      grade:        '📊',
      announcement: '📢',
      assignment:   '📋',
      streak:       '🔥',
      xp:           '⭐',
      message:      '✉️',
      general:      '🔔',
    };
    return icons[type] || '🔔';
  };

  const getColor = (type) => {
    const colors = {
      exam:         '#2E86AB',
      grade:        '#27AE60',
      announcement: '#F39C12',
      assignment:   '#8E44AD',
      streak:       '#E74C3C',
      xp:           '#F39C12',
      message:      '#1ABC9C',
      general:      '#95A5A6',
    };
    return colors[type] || '#95A5A6';
  };

  // Demo notifications if none exist
  const demoNotifications = [
    { id: 1, type: 'exam',         title: 'New Exam Available',      message: 'Mathematics Mid-Term exam is now available', is_read: false, created_at: new Date() },
    { id: 2, type: 'grade',        title: 'Grade Posted',            message: 'Your English Language score: 78%', is_read: false, created_at: new Date(Date.now() - 3600000) },
    { id: 3, type: 'announcement', title: 'School Announcement',     message: 'School will close early on Friday', is_read: true,  created_at: new Date(Date.now() - 86400000) },
    { id: 4, type: 'streak',       title: '3-Day Streak! 🔥',        message: 'You have studied 3 days in a row!', is_read: true,  created_at: new Date(Date.now() - 172800000) },
    { id: 5, type: 'xp',           title: 'XP Earned!',              message: 'You earned 20 XP for completing an exam', is_read: true,  created_at: new Date(Date.now() - 259200000) },
  ];

  const displayNotifications = notifications.length > 0 ? notifications : demoNotifications;

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🔔 Notifications</h1>
            <p style={styles.subtitle}>Stay updated with your school activities</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={styles.markAllBtn}>
              ✅ Mark all read
            </button>
          )}
        </div>

        <div style={styles.content}>
          {unreadCount > 0 && (
            <div style={styles.unreadBanner}>
              🔔 You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </div>
          )}

          {loading ? (
            <p style={styles.center}>Loading notifications...</p>
          ) : (
            displayNotifications.map(n => (
              <div
                key={n.id}
                style={{ ...styles.notifCard, borderLeft: `4px solid ${getColor(n.type)}`, opacity: n.is_read ? 0.75 : 1 }}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <div style={{ ...styles.notifIcon, background: `${getColor(n.type)}15`, color: getColor(n.type) }}>
                  {getIcon(n.type)}
                </div>
                <div style={styles.notifContent}>
                  <div style={styles.notifTop}>
                    <p style={styles.notifTitle}>{n.title}</p>
                    <span style={styles.notifTime}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={styles.notifMsg}>{n.message}</p>
                </div>
                {!n.is_read && <div style={styles.unreadDot} />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 235, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  markAllBtn:   { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  content:      { padding: 20 },
  unreadBanner: { background: '#EAF4FB', border: '1px solid #2E86AB', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#2E86AB', fontSize: 14, fontWeight: 'bold' },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  notifCard:    { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', position: 'relative' },
  notifIcon:    { width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle:   { fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  notifTime:    { fontSize: 11, color: '#aaa', flexShrink: 0, marginLeft: 8 },
  notifMsg:     { fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 },
  unreadDot:    { width: 10, height: 10, borderRadius: 5, background: '#2E86AB', flexShrink: 0, marginTop: 4 },
};

export default Notifications;