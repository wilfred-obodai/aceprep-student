import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const AiTutor = () => {
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [history,    setHistory]    = useState([]);
  const [showHistory,setShowHistory]= useState(false);
  const [sessionId,  setSessionId]  = useState(() => `session_${Date.now()}`);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
    // Load welcome message
    setMessages([{
      role: 'assistant',
      message: "👋 Hello! I'm your AcePrep AI Tutor. I'm here to help you with BECE and WASSCE preparation. What subject or topic would you like help with today?"
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await API.get('/ai-tutor-history/history');
      if (res.data.success) setHistory(res.data.history || []);
    } catch (e) { console.error(e); }
  };

  const loadSession = async (sid) => {
    try {
      const res = await API.get(`/ai-tutor-history/history/${sid}`);
      if (res.data.success) {
        setMessages(res.data.messages.map(m => ({ role: m.role, message: m.message })));
        setSessionId(sid);
        setShowHistory(false);
      }
    } catch (e) { console.error(e); }
  };

  const startNewChat = () => {
    const newId = `session_${Date.now()}`;
    setSessionId(newId);
    setMessages([{
      role: 'assistant',
      message: "👋 Hello! I'm your AcePrep AI Tutor. What would you like to study today?"
    }]);
    setShowHistory(false);
  };

  const deleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/ai-tutor-history/history/${sid}`);
      loadHistory();
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', message: msg };
    setMessages(prev => [...prev, userMsg]);

    // Save user message
    try {
      await API.post('/ai-tutor-history/save', {
        session_id: sessionId, role: 'user', message: msg
      });
    } catch (e) { console.error(e); }

    try {
      const history_context = messages.slice(-6).map(m => ({
        role:    m.role === 'user' ? 'user' : 'assistant',
        content: m.message,
      }));

      const res = await API.post('/ai/chat', {
        messages: [
          ...history_context,
          { role: 'user', content: `You are AcePrep AI Tutor for Ghanaian JHS/SHS students preparing for BECE and WASSCE exams. Be helpful, encouraging and use simple clear language. Current question: ${msg}` }
        ]
      });

      const reply = res.data.message || 'Sorry, I could not answer that.';
      setMessages(prev => [...prev, { role: 'assistant', message: reply }]);

      await API.post('/ai-tutor-history/save', {
        session_id: sessionId, role: 'assistant', message: reply
      });

      loadHistory();
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', message: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '📐 Help me with Maths',
    '📖 Explain English grammar',
    '🔬 Integrated Science topics',
    '🌍 Social Studies revision',
    '💡 Study tips for BECE',
  ];

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🤖 AI Tutor</h1>
            <p style={styles.subtitle}>Your personal BECE & WASSCE study assistant</p>
          </div>
          <div style={styles.headerBtns}>
            <button onClick={startNewChat} style={styles.newChatBtn}>+ New Chat</button>
            <button onClick={() => setShowHistory(!showHistory)} style={styles.historyBtn}>
              📋 History
            </button>
          </div>
        </div>

        <div style={styles.body}>
          {/* History Panel */}
          {showHistory && (
            <div style={styles.historyPanel}>
              <h3 style={styles.historyTitle}>💬 Chat History</h3>
              {history.length === 0 ? (
                <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>No history yet</p>
              ) : (
                history.map(h => (
                  <div key={h.session_id} style={styles.historyItem}
                    onClick={() => loadSession(h.session_id)}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.historyMsg}>{h.first_message?.substring(0, 50) || 'Chat session'}...</p>
                      <p style={styles.historyDate}>{new Date(h.started_at).toLocaleDateString()} • {h.message_count} messages</p>
                    </div>
                    <button onClick={e => deleteSession(h.session_id, e)} style={styles.deleteHistBtn}>🗑️</button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chat Area */}
          <div style={styles.chatArea}>
            <div style={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...styles.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' && <span style={styles.botAvatar}>🤖</span>}
                  <div style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.botBubble) }}>
                    <p style={styles.bubbleText}>{m.message}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
                  <span style={styles.botAvatar}>🤖</span>
                  <div style={styles.botBubble}>
                    <p style={styles.bubbleText}>Thinking... ⏳</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div style={styles.quickPrompts}>
                {quickPrompts.map(p => (
                  <button key={p} style={styles.quickBtn}
                    onClick={() => { setInput(p); }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={styles.inputRow}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything about BECE/WASSCE..."
                style={styles.inputField}
              />
              <button onClick={sendMessage} style={styles.sendBtn} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:         { marginLeft: 235, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  header:       { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title:        { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerBtns:   { display: 'flex', gap: 8 },
  newChatBtn:   { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  historyBtn:   { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  body:         { display: 'flex', flex: 1, overflow: 'hidden' },
  historyPanel: { width: 260, background: '#fff', borderRight: '1px solid #eee', overflowY: 'auto', padding: 16, flexShrink: 0 },
  historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  historyItem:  { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: '#f8f9fa', border: '1px solid #eee' },
  historyMsg:   { fontSize: 13, color: '#333', margin: '0 0 4px', fontWeight: 'bold' },
  historyDate:  { fontSize: 11, color: '#888', margin: 0 },
  deleteHistBtn:{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 },
  chatArea:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  messages:     { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  msgRow:       { display: 'flex', gap: 10, alignItems: 'flex-end' },
  botAvatar:    { fontSize: 24, flexShrink: 0 },
  bubble:       { maxWidth: '70%', borderRadius: 16, padding: '12px 16px' },
  userBubble:   { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', borderBottomRightRadius: 4 },
  botBubble:    { background: '#fff', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderBottomLeftRadius: 4 },
  bubbleText:   { fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },
  quickPrompts: { padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' },
  quickBtn:     { background: '#EAF4FB', color: '#2E86AB', border: '1px solid #2E86AB33', borderRadius: 20, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 'bold' },
  inputRow:     { padding: '12px 24px', borderTop: '1px solid #eee', display: 'flex', gap: 10, flexShrink: 0 },
  inputField:   { flex: 1, padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 24, fontSize: 14, outline: 'none' },
  sendBtn:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 18, cursor: 'pointer', flexShrink: 0 },
};

export default AiTutor;