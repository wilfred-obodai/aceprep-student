import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getInbox, getSent, sendMessage, markAsRead, getSchoolStudents } from '../../services/api';

const Messages = () => {
  const [inbox,      setInbox]      = useState([]);
  const [sent,       setSent]       = useState([]);
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('inbox');
  const [selected,   setSelected]   = useState(null);
  const [showCompose,setShowCompose] = useState(false);
  const [sending,    setSending]    = useState(false);

  const [toId,      setToId]      = useState('');
  const [msgSubject,setMsgSubject] = useState('');
  const [msgContent,setMsgContent] = useState('');
  const [sendMsg,   setSendMsg]   = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [inboxRes, sentRes, studentsRes] = await Promise.all([
          getInbox(), getSent(), getSchoolStudents()
        ]);
        if (inboxRes.data.success)    setInbox(inboxRes.data.messages);
        if (sentRes.data.success)     setSent(sentRes.data.messages);
        if (studentsRes.data.success) setStudents(studentsRes.data.students);
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
        await markAsRead(msg.id);
        setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch (e) {}
    }
  };

  const handleSend = async () => {
    if (!toId || !msgContent) return;
    setSending(true);
    setSendMsg('');
    try {
      const res = await sendMessage({
        receiverId:   parseInt(toId),
        receiverRole: 'student',
        subject:      msgSubject || 'No Subject',
        content:      msgContent,
      });
      if (res.data.success) {
        setSendMsg('✅ Message sent!');
        setMsgContent(''); setMsgSubject(''); setToId('');
        setShowCompose(false);
        const sentRes = await getSent();
        if (sentRes.data.success) setSent(sentRes.data.messages);
      }
    } catch (e) {
      setSendMsg('❌ Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const unread = inbox.filter(m => !m.isRead).length;
  const messages = view === 'inbox' ? inbox : sent;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>💬 Messages</h1>
            <p style={styles.subtitle}>Communicate with your students</p>
          </div>
          <button style={styles.composeBtn} onClick={() => setShowCompose(!showCompose)}>
            {showCompose ? '✕ Cancel' : '✏️ Compose'}
          </button>
        </div>

        {/* Compose */}
        {showCompose && (
          <div style={styles.composeCard}>
            <h3 style={styles.composeTitle}>New Message</h3>
            {sendMsg && (
              <p style={{ color: sendMsg.includes('✅') ? '#27AE60' : '#E74C3C', fontWeight: 'bold', fontSize: 14 }}>
                {sendMsg}
              </p>
            )}
            <div style={styles.composeForm}>
              <div style={styles.composeField}>
                <label style={styles.composeLabel}>To (Student)</label>
                <select style={styles.composeInput} value={toId}
                  onChange={e => setToId(e.target.value)}>
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} — {s.level} Year {s.yearGroup}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.composeField}>
                <label style={styles.composeLabel}>Subject</label>
                <input style={styles.composeInput} value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="Message subject..." />
              </div>
              <div style={styles.composeField}>
                <label style={styles.composeLabel}>Message *</label>
                <textarea
                  style={{ ...styles.composeInput, height: 100, resize: 'vertical' }}
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>
              <button
                style={{ ...styles.sendBtn, opacity: (!toId || !msgContent || sending) ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={!toId || !msgContent || sending}
              >
                {sending ? 'Sending...' : '📤 Send Message'}
              </button>
            </div>
          </div>
        )}

        <div style={styles.messagesLayout}>
          {/* Sidebar */}
          <div style={styles.messagesSidebar}>
            <button
              style={{ ...styles.folderBtn, background: view === 'inbox' ? '#EAF4FB' : 'transparent', color: view === 'inbox' ? '#2E86AB' : '#555' }}
              onClick={() => { setView('inbox'); setSelected(null); }}
            >
              📥 Inbox {unread > 0 && <span style={styles.unreadBadge}>{unread}</span>}
            </button>
            <button
              style={{ ...styles.folderBtn, background: view === 'sent' ? '#EAF4FB' : 'transparent', color: view === 'sent' ? '#2E86AB' : '#555' }}
              onClick={() => { setView('sent'); setSelected(null); }}
            >
              📤 Sent
            </button>
          </div>

          {/* Message List */}
          <div style={styles.messageList}>
            {loading ? (
              <p style={styles.center}>Loading...</p>
            ) : messages.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: 40 }}>{view === 'inbox' ? '📥' : '📤'}</p>
                <p style={{ color: '#888' }}>No messages yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    background: selected?.id === msg.id ? '#EAF4FB' :
                                (!msg.isRead && view === 'inbox') ? '#F8FBFF' : '#fff',
                    borderLeft: selected?.id === msg.id ? '3px solid #2E86AB' : '3px solid transparent',
                  }}
                  onClick={() => handleOpen(msg)}
                >
                  <div style={styles.msgAvatar}>
                    {(view === 'inbox' ? msg.senderName : msg.receiverName)?.charAt(0) || '?'}
                  </div>
                  <div style={styles.msgInfo}>
                    <div style={styles.msgTop}>
                      <p style={{
                        ...styles.msgName,
                        fontWeight: !msg.isRead && view === 'inbox' ? 'bold' : 'normal'
                      }}>
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
                  {!msg.isRead && view === 'inbox' && (
                    <div style={styles.unreadDot} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          {selected && (
            <div style={styles.messageDetail}>
              <button style={styles.closeDetail} onClick={() => setSelected(null)}>✕</button>
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
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:          { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 240, flex: 1, padding: '28px 24px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:           { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:        { fontSize: 14, color: '#888', marginTop: 4 },
  composeBtn:      { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  composeCard:     { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  composeTitle:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  composeForm:     { display: 'flex', flexDirection: 'column', gap: 12 },
  composeField:    { display: 'flex', flexDirection: 'column', gap: 4 },
  composeLabel:    { fontSize: 13, fontWeight: 'bold', color: '#555' },
  composeInput:    { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  sendBtn:         { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  messagesLayout:  { display: 'flex', gap: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 500 },
  messagesSidebar: { width: 140, borderRight: '1px solid #f0f0f0', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 },
  folderBtn:       { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' },
  unreadBadge:     { background: '#E74C3C', color: '#fff', borderRadius: 10, padding: '2px 6px', fontSize: 11, marginLeft: 'auto' },
  messageList:     { flex: 1, borderRight: '1px solid #f0f0f0', overflowY: 'auto', maxHeight: 600 },
  center:          { textAlign: 'center', color: '#888', padding: 40 },
  emptyState:      { textAlign: 'center', padding: '40px 20px' },
  messageRow:      { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  msgAvatar:       { width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgInfo:         { flex: 1, overflow: 'hidden' },
  msgTop:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  msgName:         { fontSize: 14, color: '#1A5276', margin: 0 },
  msgDate:         { fontSize: 11, color: '#aaa' },
  msgSubject:      { fontSize: 13, fontWeight: 'bold', color: '#333', margin: '0 0 2px' },
  msgPreview:      { fontSize: 12, color: '#888', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, background: '#2E86AB', flexShrink: 0 },
  messageDetail:   { width: 340, padding: 20, position: 'relative' },
  closeDetail:     { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' },
  detailSubject:   { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px', paddingRight: 24 },
  detailMeta:      { fontSize: 12, color: '#888', margin: '0 0 16px' },
  detailContent:   { background: '#f8f9fa', borderRadius: 8, padding: 16 },
  detailText:      { fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 },
};

export default Messages;