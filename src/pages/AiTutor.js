import React, { useState, useRef, useEffect } from 'react';
import BottomNav from '../components/BottomNav';

const AiTutor = () => {
  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      content: '👋 Hello! I am your AcePrep AI Tutor. I can help you with any BECE or WASSCE topic, explain answers, solve questions, and recommend what to study. What would you like help with today?'
    }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: '❌ Sorry, I could not generate a response. Please try again.'
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: '❌ Connection error. Please make sure the server is running.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    '📐 Solve: If 2x + 3 = 11, find x',
    '🌱 Explain photosynthesis',
    '🇬🇭 Who founded Ghana?',
    '📊 What topics should I study for BECE Maths?',
    '✍️ What is personification?',
    '⚛️ What is the chemical symbol for water?',
  ];

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.aiAvatar}>🤖</div>
            <div>
              <h2 style={styles.headerTitle}>AI Tutor</h2>
              <p style={styles.headerSub}>Powered by Claude AI</p>
            </div>
          </div>
          <div style={styles.onlineDot} />
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.length === 1 && (
            <div style={styles.quickPrompts}>
              <p style={styles.quickLabel}>Try asking:</p>
              <div style={styles.promptsGrid}>
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    style={styles.promptChip}
                    onClick={() => setInput(prompt.substring(2).trim())}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageBubble,
                ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble)
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.aiLabel}>🤖 AI Tutor</div>
              )}
              <p style={{
                ...styles.messageText,
                color: msg.role === 'user' ? '#fff' : '#333'
              }}>
                {msg.content}
              </p>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageBubble, ...styles.aiBubble }}>
              <div style={styles.aiLabel}>🤖 AI Tutor</div>
              <div style={styles.typingIndicator}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <textarea
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about BECE or WASSCE..."
            rows={2}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: (!input.trim() || loading) ? 0.5 : 1
            }}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

const styles = {
  container:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:              { marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  header:            { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft:        { display: 'flex', alignItems: 'center', gap: 12 },
  aiAvatar:          { width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  headerTitle:       { fontSize: 18, fontWeight: 'bold', color: '#fff', margin: 0 },
  headerSub:         { fontSize: 12, color: '#AED6F1', margin: 0 },
  onlineDot:         { width: 10, height: 10, borderRadius: 5, background: '#27AE60', boxShadow: '0 0 6px #27AE60' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '16px 16px 8px' },
  quickPrompts:      { marginBottom: 16 },
  quickLabel:        { fontSize: 13, color: '#888', marginBottom: 8 },
  promptsGrid:       { display: 'flex', flexDirection: 'column', gap: 8 },
  promptChip:        { background: '#fff', border: '1px solid #ddd', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: '#2E86AB', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  messageBubble:     { marginBottom: 12, maxWidth: '85%' },
  userBubble:        { marginLeft: 'auto', background: 'linear-gradient(135deg, #2E86AB, #1A5276)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px' },
  aiBubble:          { marginRight: 'auto', background: '#fff', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  aiLabel:           { fontSize: 11, color: '#2E86AB', fontWeight: 'bold', marginBottom: 6 },
  messageText:       { fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },
  typingIndicator:   { display: 'flex', gap: 4, alignItems: 'center', height: 20 },
  dot:               { width: 8, height: 8, borderRadius: 4, background: '#2E86AB', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' },
  inputContainer:    { display: 'flex', gap: 8, padding: '12px 16px', background: '#fff', borderTop: '1px solid #eee' },
  input:             { flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 20, fontSize: 14, resize: 'none', fontFamily: 'Arial, sans-serif' },
  sendBtn:           { width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-end', border: 'none' },
};

export default AiTutor;