import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { createBattle, joinBattle, getPastQuestions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const subjects = [
  'Mathematics', 'English Language', 'Integrated Science',
  'Social Studies', 'ICT', 'Physics', 'Chemistry', 'Biology'
];

const QuizBattle = () => {
  const { user }   = useAuth();
  const socketRef  = useRef(null);

  const [screen,       setScreen]       = useState('lobby');
  const [roomCode,     setRoomCode]     = useState('');
  const [joinCode,     setJoinCode]     = useState('');
  const [subject,      setSubject]      = useState('Mathematics');
  const [players,      setPlayers]      = useState([]);
  const [roomId,       setRoomId]       = useState(null);
  const [isHost,       setIsHost]       = useState(false);
  const [question,     setQuestion]     = useState(null);
  const [questionNum,  setQuestionNum]  = useState(0);
  const [totalQ,       setTotalQ]       = useState(0);
  const [selected,     setSelected]     = useState('');
  const [scores,       setScores]       = useState([]);
  const [results,      setResults]      = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(15);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const timerRef = useRef(null);

  // Connect socket
  useEffect(() => {
    socketRef.current = io('https://aceprep-backend-uvdn.onrender.com');

    socketRef.current.on('players_update', ({ players }) => {
      setPlayers(players);
    });

    socketRef.current.on('battle_started', ({ question, questionNum, total }) => {
      setQuestion(question);
      setQuestionNum(questionNum);
      setTotalQ(total);
      setSelected('');
      setTimeLeft(15);
      setScreen('battle');
    });

    socketRef.current.on('next_question', ({ question, questionNum, total }) => {
      setQuestion(question);
      setQuestionNum(questionNum);
      setTotalQ(total);
      setSelected('');
      setTimeLeft(15);
    });

    socketRef.current.on('score_update', ({ players }) => {
      setScores(players.sort((a, b) => b.score - a.score));
    });

    socketRef.current.on('battle_ended', ({ results }) => {
      setResults(results);
      setScreen('results');
    });

    return () => socketRef.current.disconnect();
  }, []);

  // Timer
  useEffect(() => {
    if (screen !== 'battle') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!selected) handleAnswer('');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question, screen]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createBattle({ subject });
      if (res.data.success) {
        setRoomCode(res.data.roomCode);
        setRoomId(res.data.roomId);
        setIsHost(true);
        socketRef.current.emit('join_battle', {
          roomCode: res.data.roomCode,
          studentId: user?.id,
          fullName:  user?.fullName || 'You',
        });
        setScreen('waiting');
      }
    } catch (e) {
      setError('Failed to create battle room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await joinBattle({ roomCode: joinCode.toUpperCase() });
      if (res.data.success) {
        setRoomCode(joinCode.toUpperCase());
        setRoomId(res.data.roomId);
        setIsHost(false);
        socketRef.current.emit('join_battle', {
          roomCode:  joinCode.toUpperCase(),
          studentId: user?.id,
          fullName:  user?.fullName || 'You',
        });
        setScreen('waiting');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await getPastQuestions({
        subject,
        level:    'JHS',
        examType: 'BECE',
      });
      const questions = (res.data.questions || []).slice(0, 10);
      if (questions.length === 0) {
        setError('No questions found for this subject. Add questions first!');
        setLoading(false);
        return;
      }
      socketRef.current.emit('start_battle', { roomCode, questions });
    } catch (e) {
      setError('Failed to start battle');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (letter) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(letter);
    socketRef.current.emit('submit_answer', {
      roomCode,
      studentId:     user?.id,
      answer:        letter,
      questionIndex: questionNum - 1,
    });
  };

  // ── Screens ────────────────────────────────────

  if (screen === 'results') {
    const myResult = results.find(r => String(r.studentId) === String(user?.id));
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 235, flex: 1, padding: 16 }}>
          <div style={styles.resultsCard}>
            <p style={{ fontSize: 64, textAlign: 'center' }}>
              {myResult?.rank === 1 ? '🏆' : myResult?.rank === 2 ? '🥈' : '🥉'}
            </p>
            <h2 style={{ textAlign: 'center', color: '#1A5276', margin: '16px 0' }}>
              Battle Over!
            </h2>
            {results.map((r, i) => (
              <div key={i} style={{
                ...styles.resultRow,
                background: r.rank === 1 ? '#FEF9E7' : '#fff',
                border:     r.rank === 1 ? '2px solid #F39C12' : '1px solid #eee',
              }}>
                <span style={styles.resultRank}>
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                </span>
                <p style={styles.resultName}>{r.fullName}</p>
                <span style={styles.resultScore}>{r.score} pts</span>
              </div>
            ))}
            <button
              style={styles.lobbyBtn}
              onClick={() => { setScreen('lobby'); setResults(null); setPlayers([]); }}
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'battle' && question) {
    const timerColor = timeLeft <= 5 ? '#E74C3C' : timeLeft <= 10 ? '#F39C12' : '#27AE60';
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 235, flex: 1 }}>
          {/* Battle Header */}
          <div style={styles.battleHeader}>
            <div style={styles.battleTop}>
              <span style={{ color: '#AED6F1', fontSize: 13 }}>
                ⚔️ Question {questionNum}/{totalQ}
              </span>
              <div style={{ ...styles.battleTimer, color: timerColor, borderColor: timerColor }}>
                ⏱️ {timeLeft}s
              </div>
            </div>
            <div style={styles.battleProgress}>
              <div style={{
                ...styles.battleProgressFill,
                width: `${(questionNum / totalQ) * 100}%`
              }} />
            </div>
          </div>

          <div style={{ padding: 16 }}>
            {/* Scoreboard */}
            <div style={styles.scoreboard}>
              {scores.map((p, i) => (
                <div key={i} style={styles.scoreItem}>
                  <span style={styles.scoreRank}>#{i + 1}</span>
                  <span style={styles.scoreName}>
                    {String(p.studentId) === String(user?.id) ? '👤 You' : p.fullName}
                  </span>
                  <span style={styles.scorePoints}>{p.score} pts</span>
                </div>
              ))}
            </div>

            {/* Question */}
            <div style={styles.questionBox}>
              <p style={styles.questionText}>{question.questionText}</p>
            </div>

            {/* Options */}
            {['A', 'B', 'C', 'D'].map(letter => {
              const text      = question.options?.[letter] || question[`option${letter}`];
              const isCorrect = selected && letter === question.correctAnswer;
              const isWrong   = selected === letter && letter !== question.correctAnswer;
              return (
                <div
                  key={letter}
                  style={{
                    ...styles.optionCard,
                    background: isCorrect ? '#EAFAF1'
                               : isWrong  ? '#FDEDEC'
                               : selected === letter ? '#EAF4FB' : '#fff',
                    border:     isCorrect ? '2px solid #27AE60'
                               : isWrong  ? '2px solid #E74C3C'
                               : selected === letter ? '2px solid #2E86AB' : '1px solid #eee',
                    opacity:    selected && !isCorrect && selected !== letter ? 0.6 : 1,
                  }}
                  onClick={() => !selected && handleAnswer(letter)}
                >
                  <div style={{
                    ...styles.optionLetter,
                    background: isCorrect ? '#27AE60' : isWrong ? '#E74C3C' : '#2E86AB'
                  }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{letter}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15 }}>{text}</p>
                </div>
              );
            })}

            {selected && (
              <div style={{
                ...styles.answerFeedback,
                background: selected === question.correctAnswer ? '#EAFAF1' : '#FDEDEC',
                color:      selected === question.correctAnswer ? '#27AE60' : '#E74C3C',
              }}>
                {selected === question.correctAnswer
                  ? '✅ Correct! +10 points'
                  : `❌ Wrong! Correct answer: ${question.correctAnswer}`}
                <p style={{ fontSize: 12, margin: '4px 0 0', opacity: 0.8 }}>
                  Next question coming...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
        <BottomNav />
        <div style={{ marginLeft: 235, flex: 1, padding: 16 }}>
          <div style={styles.waitingCard}>
            <p style={{ fontSize: 48, textAlign: 'center' }}>⚔️</p>
            <h2 style={styles.waitingTitle}>Battle Room</h2>
            <div style={styles.roomCodeBox}>
              <p style={styles.roomCodeLabel}>Room Code</p>
              <p style={styles.roomCodeText}>{roomCode}</p>
              <p style={styles.roomCodeHint}>Share this code with friends!</p>
            </div>

            <h3 style={{ color: '#1A5276', margin: '20px 0 10px' }}>
              Players ({players.length})
            </h3>
            {players.map((p, i) => (
              <div key={i} style={styles.playerRow}>
                <div style={styles.playerAvatar}>
                  {(p.fullName || 'P').charAt(0).toUpperCase()}
                </div>
                <p style={styles.playerName}>
                  {String(p.studentId) === String(user?.id) ? `${p.fullName} (You)` : p.fullName}
                </p>
              </div>
            ))}

            {error && <p style={{ color: '#E74C3C', textAlign: 'center', marginTop: 12 }}>{error}</p>}

            {isHost && (
              <button
                style={{
                  ...styles.startBtn,
                  opacity: players.length < 1 || loading ? 0.6 : 1
                }}
                onClick={handleStart}
                disabled={loading}
              >
                {loading ? 'Starting...' : `🚀 Start Battle (${players.length} players)`}
              </button>
            )}

            {!isHost && (
              <p style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>
                ⏳ Waiting for host to start the battle...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lobby Screen
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <BottomNav />
      <div style={{ marginLeft: 235, flex: 1 }}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚔️ Quiz Battle</h1>
          <p style={styles.subtitle}>Challenge your classmates in real-time!</p>
        </div>

        <div style={{ padding: 16 }}>
          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          {/* Create Room */}
          <div style={styles.lobbyCard}>
            <h2 style={styles.lobbyTitle}>🎮 Create a Battle Room</h2>
            <p style={styles.lobbyDesc}>Host a quiz battle and invite your friends!</p>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.inputLabel}>Select Subject</label>
              <select style={styles.input} value={subject}
                onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button
              style={{ ...styles.createBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Creating...' : '⚔️ Create Battle Room'}
            </button>
          </div>

          {/* Join Room */}
          <div style={styles.lobbyCard}>
            <h2 style={styles.lobbyTitle}>🔑 Join a Battle Room</h2>
            <p style={styles.lobbyDesc}>Enter a room code shared by your friend!</p>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.inputLabel}>Room Code</label>
              <input
                style={{ ...styles.input, textTransform: 'uppercase', letterSpacing: 4, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
            <button
              style={{ ...styles.joinBtn, opacity: !joinCode.trim() || loading ? 0.7 : 1 }}
              onClick={handleJoin}
              disabled={!joinCode.trim() || loading}
            >
              {loading ? 'Joining...' : '🚀 Join Battle'}
            </button>
          </div>

          {/* How it works */}
          <div style={styles.howCard}>
            <h3 style={styles.howTitle}>❓ How Quiz Battle Works</h3>
            {[
              '1️⃣  One student creates a room and shares the code',
              '2️⃣  Friends join using the room code',
              '3️⃣  Host starts the battle when everyone is ready',
              '4️⃣  Answer questions as fast as possible — speed matters!',
              '5️⃣  First to answer correctly gets 10 points',
              '6️⃣  Most points after all questions wins! 🏆',
            ].map((step, i) => (
              <p key={i} style={styles.howStep}>{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header:            { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px 24px' },
  title:             { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:          { fontSize: 13, color: '#AED6F1', marginTop: 4 },
  errorBox:          { background: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: 12, marginBottom: 16, color: '#E74C3C', fontSize: 14 },
  lobbyCard:         { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  lobbyTitle:        { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  lobbyDesc:         { fontSize: 13, color: '#888', margin: '0 0 16px' },
  inputLabel:        { display: 'block', fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  input:             { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 10, fontSize: 16, boxSizing: 'border-box' },
  createBtn:         { width: '100%', padding: 14, background: 'linear-gradient(135deg, #E74C3C, #C0392B)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  joinBtn:           { width: '100%', padding: 14, background: 'linear-gradient(135deg, #27AE60, #1E8449)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  howCard:           { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  howTitle:          { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 12px' },
  howStep:           { fontSize: 13, color: '#555', padding: '6px 0', borderBottom: '1px solid #f0f0f0', margin: 0, lineHeight: 1.5 },
  waitingCard:       { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  waitingTitle:      { fontSize: 22, fontWeight: 'bold', color: '#1A5276', textAlign: 'center', margin: '12px 0 20px' },
  roomCodeBox:       { background: '#1A5276', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 8 },
  roomCodeLabel:     { fontSize: 13, color: '#AED6F1', margin: '0 0 8px' },
  roomCodeText:      { fontSize: 40, fontWeight: 'bold', color: '#fff', letterSpacing: 8, margin: 0 },
  roomCodeHint:      { fontSize: 12, color: '#AED6F1', margin: '8px 0 0' },
  playerRow:         { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  playerAvatar:      { width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  playerName:        { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  startBtn:          { width: '100%', padding: 14, background: 'linear-gradient(135deg, #E74C3C, #C0392B)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 20 },
  battleHeader:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '16px 20px 12px' },
  battleTop:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  battleTimer:       { fontSize: 18, fontWeight: 'bold', padding: '6px 12px', borderRadius: 8, border: '2px solid', background: 'rgba(255,255,255,0.1)' },
  battleProgress:    { height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  battleProgressFill:{ height: '100%', background: '#F39C12', transition: 'width 0.3s' },
  scoreboard:        { background: '#1A5276', borderRadius: 12, padding: 12, marginBottom: 12 },
  scoreItem:         { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  scoreRank:         { fontSize: 12, color: '#AED6F1', width: 24 },
  scoreName:         { flex: 1, fontSize: 13, color: '#fff', fontWeight: 'bold' },
  scorePoints:       { fontSize: 14, color: '#F39C12', fontWeight: 'bold' },
  questionBox:       { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  questionText:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0, lineHeight: 1.5 },
  optionCard:        { display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, marginBottom: 8, cursor: 'pointer' },
  optionLetter:      { width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  answerFeedback:    { borderRadius: 10, padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  resultsCard:       { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  resultRow:         { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, marginBottom: 8 },
  resultRank:        { fontSize: 24 },
  resultName:        { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  resultScore:       { fontSize: 16, fontWeight: 'bold', color: '#F39C12' },
  lobbyBtn:          { width: '100%', padding: 14, background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', marginTop: 16 },
};

export default QuizBattle;