import React, { useEffect, useState } from 'react';
import { getMyInbox, getMySent, markMessageAsRead } from '../services/api';
import BottomNav from '../components/BottomNav';

const Messages = () => {
  const [inbox,    setInbox]    = useState([]);
  const [sent,     setSent]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('inbox');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [inboxRes, sentRes] = await Promise.all([getMyInbox(), getMySent()]);
        if (inboxRes.data.success) setInbox(inboxRes.data.messages);
        if (sentRes.data.success)  setSent(sentRes.data.messages);
      } catch (e) {
        console.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (!msg.isRead && view === 'inbox') {
      try {
        await markMessageAsRead(msg.id);
        setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch (e) {}
    }
  };

  const unread   = inbox.filter(m => !m.isRead).length;
  const messages = view === 'inbox' ? inbox : sent;

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>💬 Messages</h1>
          <p style={styles.subtitle}>Messages from your teachers</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, background: view === 'inbox' ? '#2E86AB' : '#fff', color: view === 'inbox' ? '#fff' : '#555' }}
            onClick={() => { setView('inbox'); setSelected(null); }}
          >
            📥 Inbox {unread > 0 && <span style={styles.badge}>{unread}</span>}
          </button>
          <button
            style={{ ...styles.tab, background: view === 'sent' ? '#2E86AB' : '#fff', color: view === 'sent' ? '#fff' : '#555' }}
            onClick={() => { setView('sent'); setSelected(null); }}
          >
            📤 Sent
          </button>
        </div>

        <div style={styles.content}>
          {selected ? (
            <div>
              <button style={styles.backBtn} onClick={() => setSelected(null)}>← Back</button>
              <div style={styles.messageDetail}>
                <h3 style={styles.detailSubject}>{selected.subject}</h3>
                <p style={styles.detailMeta}>
                  {view === 'inbox'
                    ? `From: ${selected.senderName}`
                    : `To: ${selected.receiverName}`}
                  {' • '}{new Date(selected.createdAt).toLocaleString()}
                </p>
                <div style={styles.detailContent}>
                  <p style={styles.detailText}>{selected.content}</p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <p style={styles.center}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 48 }}>{view === 'inbox' ? '📥' : '📤'}</p>
              <h3 style={{ color: '#1A5276', margin: '12px 0 8px' }}>No messages</h3>
              <p style={{ color: '#888', fontSize: 14 }}>
                {view === 'inbox' ? 'No messages from your teachers yet' : 'No sent messages'}
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  background: !msg.isRead && view === 'inbox' ? '#F0F7FF' : '#fff',
                }}
                onClick={() => handleOpen(msg)}
              >
                <div style={styles.msgAvatar}>
                  {(view === 'inbox' ? msg.senderName : msg.receiverName)?.charAt(0) || '?'}
                </div>
                <div style={styles.msgInfo}>
                  <div style={styles.msgTop}>
                    <p style={{ ...styles.msgName, fontWeight: !msg.isRead && view === 'inbox' ? 'bold' : 'normal' }}>
                      {view === 'inbox' ? msg.senderName : msg.receiverName}
                    </p>
                    <p style={styles.msgDate}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p style={styles.msgSubject}>{msg.subject}</p>
                  <p style={styles.msgPreview}>
                    {msg.content.substring(0, 60)}{msg.content.length > 60 ? '...' : ''}
                  </p>
                </div>
                {!msg.isRead && view === 'inbox' && <div style={styles.unreadDot} />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:     { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 235, flex: 1 },
  header:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:         { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:      { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  tabs:          { display: 'flex', gap: 8, padding: '12px 16px', background: '#fff', borderBottom: '1px solid #eee' },
  tab:           { flex: 1, padding: '10px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  badge:         { background: '#E74C3C', color: '#fff', borderRadius: 10, padding: '2px 6px', fontSize: 11, marginLeft: 6 },
  content:       { padding: 16 },
  center:        { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:    { textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  backBtn:       { background: 'none', border: 'none', color: '#2E86AB', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', padding: '0 0 12px', display: 'block' },
  messageDetail: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  detailSubject: { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  detailMeta:    { fontSize: 12, color: '#888', margin: '0 0 16px' },
  detailContent: { background: '#f8f9fa', borderRadius: 8, padding: 16 },
  detailText:    { fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 },
  messageRow:    { borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  msgAvatar:     { width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgInfo:       { flex: 1, overflow: 'hidden' },
  msgTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  msgName:       { fontSize: 14, color: '#1A5276', margin: 0 },
  msgDate:       { fontSize: 11, color: '#aaa' },
  msgSubject:    { fontSize: 13, fontWeight: 'bold', color: '#333', margin: '0 0 2px' },
  msgPreview:    { fontSize: 12, color: '#888', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  unreadDot:     { width: 8, height: 8, borderRadius: 4, background: '#2E86AB', flexShrink: 0 },
};

export default Messages;