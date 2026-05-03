import React, { useEffect, useState } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import API from '../../services/api';

const ParentMessages = () => {
  const [inbox,    setInbox]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [teachers, setTeachers]  = useState([]);
  const [composeData, setComposeData] = useState({ to: '', subject: '', message: '' });
  const [sending,  setSending]   = useState(false);
  const [sentMsg,  setSentMsg]   = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inboxRes, progressRes] = await Promise.all([
        API.get('/messages/inbox'),
        API.get('/parents/child-progress'),
      ]);
      if (inboxRes.data.success)   setInbox(inboxRes.data.messages || []);
      if (progressRes.data.success && progressRes.data.student) {
        // Get school teachers
        const schoolId = progressRes.data.student.schoolId;
        try {
          const teachersRes = await API.get('/schools/teachers');
          setTeachers(teachersRes.data.teachers || []);
        } catch (e) { console.error(e); }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSentMsg('');
    try {
      await API.post('/messages/send', {
        recipientId:   composeData.to,
        recipientType: 'teacher',
        message:       `[${composeData.subject}]\n\n${composeData.message}`,
      });
      setSentMsg('✅ Message sent successfully!');
      setComposeData({ to: '', subject: '', message: '' });
      fetchData();
    } catch (e) {
      setSentMsg('❌ Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>✉️ Messages</h1>
            <p style={styles.subtitle}>Messages from your child's school</p>
          </div>
          <button style={styles.composeBtn} onClick={() => setShowCompose(!showCompose)}>
            ✏️ Message School
          </button>
        </div>

        <div style={styles.content}>
          {/* Compose Form */}
          {showCompose && (
            <div style={styles.composeCard}>
              <h3 style={styles.composeTitle}>✏️ Send Message to School</h3>
              <form onSubmit={handleSend} style={styles.composeForm}>
                <div style={styles.field}>
                  <label style={styles.label}>Send To</label>
                  <select style={styles.input} value={composeData.to}
                    onChange={e => setComposeData({...composeData, to: e.target.value})} required>
                    <option value="">Select teacher/admin...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName} — {t.role}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Subject</label>
                  <input style={styles.input} value={composeData.subject}
                    onChange={e => setComposeData({...composeData, subject: e.target.value})}
                    placeholder="e.g. Regarding my child's performance" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Message</label>
                  <textarea style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                    value={composeData.message}
                    onChange={e => setComposeData({...composeData, message: e.target.value})}
                    placeholder="Type your message here..." required />
                </div>
                {sentMsg && (
                  <p style={{ color: sentMsg.includes('✅') ? '#006B3F' : '#CE1126', fontSize: 14 }}>
                    {sentMsg}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={styles.sendBtn} disabled={sending}>
                    {sending ? 'Sending...' : '📤 Send Message'}
                  </button>
                  <button type="button" style={styles.cancelBtn}
                    onClick={() => { setShowCompose(false); setSentMsg(''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Inbox */}
          <div style={styles.inboxCard}>
            <h3 style={styles.inboxTitle}>📥 Inbox ({inbox.length})</h3>
            {loading ? <p style={styles.center}>Loading...</p> :
             inbox.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ fontSize: 48 }}>✉️</p>
                <p style={{ color: '#888', fontSize: 14 }}>No messages yet. Messages from teachers will appear here.</p>
              </div>
            ) : (
              inbox.map((msg, i) => (
                <div key={i}
                  style={{ ...styles.messageCard, borderLeft: msg.is_read ? '3px solid #ddd' : '3px solid #CE1126' }}
                  onClick={() => setSelected(msg)}>
                  <div style={styles.msgTop}>
                    <span style={styles.msgFrom}>👤 {msg.sender_name || 'Teacher'}</span>
                    <span style={styles.msgDate}>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={styles.msgText}>
                    {msg.message?.substring(0, 100)}{msg.message?.length > 100 ? '...' : ''}
                  </p>
                  {!msg.is_read && <span style={styles.unreadBadge}>New</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Modal */}
        {selected && (
          <div style={styles.modal} onClick={() => setSelected(null)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, color: '#fff' }}>From: {selected.sender_name}</h3>
                <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
                  {new Date(selected.created_at).toLocaleString()}
                </p>
                <p style={{ color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 235, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #7a0015, #CE1126)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  composeBtn:   { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  content:      { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  composeCard:  { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #CE1126' },
  composeTitle: { fontSize: 16, fontWeight: 'bold', color: '#CE1126', margin: '0 0 16px' },
  composeForm:  { display: 'flex', flexDirection: 'column', gap: 14 },
  field:        { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: 13, fontWeight: 'bold', color: '#555' },
  input:        { padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 14, width: '100%' },
  sendBtn:      { background: 'linear-gradient(135deg, #CE1126, #7a0015)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn:    { background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, cursor: 'pointer' },
  inboxCard:    { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  inboxTitle:   { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  center:       { textAlign: 'center', color: '#888', padding: 20 },
  empty:        { textAlign: 'center', padding: '30px 20px' },
  messageCard:  { background: '#f8f9fa', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', position: 'relative', border: '1px solid #eee' },
  msgTop:       { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  msgFrom:      { fontWeight: 'bold', color: '#1A5276', fontSize: 14 },
  msgDate:      { color: '#888', fontSize: 12 },
  msgText:      { color: '#555', fontSize: 13, margin: 0, lineHeight: 1.5 },
  unreadBadge:  { position: 'absolute', top: 10, right: 10, background: '#CE1126', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10 },
  modal:        { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard:    { background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, overflow: 'hidden' },
  modalHeader:  { background: '#CE1126', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn:     { background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' },
  modalBody:    { padding: 24 },
};

export default ParentMessages;