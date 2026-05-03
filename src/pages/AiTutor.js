import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import API from '../services/api';

const AiTutor = () => {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [history,       setHistory]       = useState([]);
  const [showHistory,   setShowHistory]   = useState(false);
  const [sessionId,     setSessionId]     = useState(() => `session_${Date.now()}`);
  const [image,         setImage]         = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const chatEndRef  = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
    setMessages([{
      role: 'assistant',
      message: "👋 Hello! I'm your AcePrep AI Tutor. I'm here to help you with BECE and WASSCE preparation. You can ask me questions or 📷 send a photo of a question and I'll solve it!"
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
    setSessionId(`session_${Date.now()}`);
    setMessages([{
      role: 'assistant',
      message: "👋 Hello! I'm your AcePrep AI Tutor. What would you like to study today?"
    }]);
    setShowHistory(false);
    removeImage();
  };

  const deleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/ai-tutor-history/history/${sid}`);
      loadHistory();
    } catch (e) { console.error(e); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg && !image || loading) return;

    setInput('');
    setLoading(true);

    const userMsg = {
      role:    'user',
      message: msg || '📷 Please solve this question from the image.',
      image:   imagePreview,
    };
    setMessages(prev => [...prev, userMsg]);

    const currentImage        = image;
    const currentImagePreview = imagePreview;
    removeImage();

    // Save user message
    try {
      await API.post('/ai-tutor-history/save', {
        session_id: sessionId,
        role:       'user',
        message:    msg || 'Image question',
      });
    } catch (e) { console.error(e); }

    try {
      let requestBody;

      if (currentImage) {
        // Image message
        const base64    = currentImagePreview.split(',')[1];
        const mediaType = currentImage.type;

        requestBody = {
          messages: [{
            role: 'user',
            content: [
              {
                type:   'image',
                source: { type: 'base64', media_type: mediaType, data: base64 }
              },
              {
                type: 'text',
                text: `You are AcePrep AI Tutor for Ghanaian JHS/SHS students preparing for BECE and WASSCE. ${msg ? msg : 'Please solve this question from the image. Show clear step-by-step working and explain each step simply.'}`
              }
            ]
          }]
        };
      } else {
        // Text message with history context
        const history_context = messages.slice(-6).map(m => ({
          role:    m.role === 'user' ? 'user' : 'assistant',
          content: m.message,
        }));

        requestBody = {
          messages: [
            ...history_context,
            {
              role:    'user',
              content: `You are AcePrep AI Tutor for Ghanaian JHS/SHS students preparing for BECE and WASSCE exams. Be helpful, encouraging and use simple clear language. Current question: ${msg}`
            }
          ]
        };
      }

      const res   = await API.post('/ai/chat', requestBody);
      const reply = res.data.message || 'Sorry, I could not answer that. Please try again.';

      setMessages(prev => [...prev, { role: 'assistant', message: reply }]);

      await API.post('/ai-tutor-history/save', {
        session_id: sessionId, role: 'assistant', message: reply
      });

      loadHistory();
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: '⚠️ Connection error. Please try again.'
      }]);
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
                <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  No history yet
                </p>
              ) : (
                history.map(h => (
                  <div key={h.session_id} style={styles.historyItem}
                    onClick={() => loadSession(h.session_id)}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.historyMsg}>
                        {h.first_message?.substring(0, 50) || 'Chat session'}...
                      </p>
                      <p style={styles.historyDate}>
                        {new Date(h.started_at).toLocaleDateString()} • {h.message_count} messages
                      </p>
                    </div>
                    <button onClick={e => deleteSession(h.session_id, e)} style={styles.deleteHistBtn}>
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chat Area */}
          <div style={styles.chatArea}>
            <div style={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  ...styles.msgRow,
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {m.role === 'assistant' && <span style={styles.botAvatar}>🤖</span>}
                  <div style={{
                    ...styles.bubble,
                    ...(m.role === 'user' ? styles.userBubble : styles.botBubble)
                  }}>
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Question"
                        style={styles.msgImage}
                      />
                    )}
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
                  <button key={p} style={styles.quickBtn} onClick={() => setInput(p)}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div style={styles.imagePreviewRow}>
                <img src={imagePreview} alt="Selected" style={styles.imageThumb} />
                <button onClick={removeImage} style={styles.removeImageBtn}>✕ Remove</button>
                <span style={{ fontSize: 12, color: '#888' }}>📷 Image ready to send</span>
              </div>
            )}

            {/* Input Row */}
            <div style={styles.inputRow}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.imageBtn}
                title="Upload question image"
              >
                📷
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder={image
                  ? "Add a message or just send the image..."
                  : "Ask me anything about BECE/WASSCE..."}
                style={styles.inputField}
              />
              <button
                onClick={sendMessage}
                style={styles.sendBtn}
                disabled={loading || (!input.trim() && !image)}
              >
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
  container:      { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 235, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  header:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title:          { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:       { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerBtns:     { display: 'flex', gap: 8 },
  newChatBtn:     { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  historyBtn:     { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  body:           { display: 'flex', flex: 1, overflow: 'hidden' },
  historyPanel:   { width: 260, background: '#fff', borderRight: '1px solid #eee', overflowY: 'auto', padding: 16, flexShrink: 0 },
  historyTitle:   { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  historyItem:    { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: '#f8f9fa', border: '1px solid #eee' },
  historyMsg:     { fontSize: 13, color: '#333', margin: '0 0 4px', fontWeight: 'bold' },
  historyDate:    { fontSize: 11, color: '#888', margin: 0 },
  deleteHistBtn:  { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0 },
  chatArea:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  messages:       { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  msgRow:         { display: 'flex', gap: 10, alignItems: 'flex-end' },
  botAvatar:      { fontSize: 24, flexShrink: 0 },
  bubble:         { maxWidth: '70%', borderRadius: 16, padding: '12px 16px' },
  userBubble:     { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', borderBottomRightRadius: 4 },
  botBubble:      { background: '#fff', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderBottomLeftRadius: 4 },
  bubbleText:     { fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },
  msgImage:       { width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 200, objectFit: 'contain' },
  quickPrompts:   { padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' },
  quickBtn:       { background: '#EAF4FB', color: '#2E86AB', border: '1px solid #2E86AB33', borderRadius: 20, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 'bold' },
  imagePreviewRow:{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 24px', background: '#f8f9fa', borderTop: '1px solid #eee', flexShrink: 0 },
  imageThumb:     { width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' },
  removeImageBtn: { background: '#FDEDEC', border: 'none', color: '#E74C3C', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' },
  inputRow:       { padding: '12px 24px', borderTop: '1px solid #eee', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' },
  imageBtn:       { background: '#EAF4FB', border: '1px solid #2E86AB33', borderRadius: '50%', width: 44, height: 44, fontSize: 20, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  inputField:     { flex: 1, padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 24, fontSize: 14, outline: 'none' },
  sendBtn:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default AiTutor;