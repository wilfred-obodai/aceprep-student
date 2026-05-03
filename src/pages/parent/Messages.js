import React, { useEffect, useState } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import API from '../../services/api';

const ParentMessages = () => {
  const [inbox,    setInbox]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/messages/inbox');
        if (res.data.success) setInbox(res.data.messages || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>✉️ Messages</h1>
          <p style={styles.subtitle}>Messages from your child's school</p>
        </div>
        <div style={styles.content}>
          {loading ? <p style={styles.center}>Loading...</p> :
           inbox.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>✉️</p>
              <h3 style={{ color: '#CE1126' }}>No messages yet</h3>
              <p style={{ color: '#888', fontSize: 14 }}>Messages from teachers will appear here.</p>
            </div>
          ) : (
            <div style={styles.messageList}>
              {inbox.map((msg, i) => (
                <div key={i} style={{ ...styles.messageCard, borderLeft: msg.is_read ? '3px solid #ddd' : '3px solid #CE1126' }}
                  onClick={() => setSelected(msg)}>
                  <div style={styles.msgTop}>
                    <span style={styles.msgFrom}>👤 {msg.sender_name || 'Teacher'}</span>
                    <span style={styles.msgDate}>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={styles.msgText}>{msg.message?.substring(0, 100)}{msg.message?.length > 100 ? '...' : ''}</p>
                  {!msg.is_read && <span style={styles.unreadBadge}>New</span>}
                </div>
              ))}
            </div>
          )}

          {/* Message Modal */}
          {selected && (
            <div style={styles.modal} onClick={() => setSelected(null)}>
              <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Message from {selected.sender_name}</h3>
                  <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
                </div>
                <div style={styles.modalBody}>
                  <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                  <p style={{ color: '#333', lineHeight: 1.7 }}>{selected.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 235, flex: 1 },
  header:       { background: 'linear-gradient(135deg, #7a0015, #CE1126)', padding: '28px 24px' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:      { padding: 20 },
  center:       { textAlign: 'center', color: '#888', padding: 40 },
  empty:        { textAlign: 'center', padding: '60px 20px' },
  messageList:  { display: 'flex', flexDirection: 'column', gap: 12 },
  messageCard:  { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', position: 'relative' },
  msgTop:       { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  msgFrom:      { fontWeight: 'bold', color: '#1A5276', fontSize: 14 },
  msgDate:      { color: '#888', fontSize: 12 },
  msgText:      { color: '#555', fontSize: 14, margin: 0, lineHeight: 1.5 },
  unreadBadge:  { position: 'absolute', top: 12, right: 12, background: '#CE1126', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10 },
  modal:        { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard:    { background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, overflow: 'hidden' },
  modalHeader:  { background: '#CE1126', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn:     { background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' },
  modalBody:    { padding: 20 },
};

export default ParentMessages;