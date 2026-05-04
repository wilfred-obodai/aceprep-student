import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const SchoolSearch = () => {
  const { school, user } = useAuth();
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [requests,  setRequests]  = useState([]);
  const [sending,   setSending]   = useState({});
  const [msg,       setMsg]       = useState('');
  const [tab,       setTab]       = useState('search');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/schools/search?q=${query}`);
      setResults(res.data.schools || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadRequests = async () => {
    try {
      const res = await API.get('/schools/challenge-requests');
      setRequests(res.data.requests || []);
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => {
    if (tab === 'requests') loadRequests();
  }, [tab]);

  const sendChallenge = async (targetSchoolId, targetSchoolName) => {
    setSending(prev => ({ ...prev, [targetSchoolId]: true }));
    setMsg('');
    try {
      await API.post('/schools/challenge', {
        targetSchoolId,
        message: `${school?.name || 'A school'} challenges ${targetSchoolName} to a Quiz Battle! Accept to compete.`,
      });
      setMsg(`✅ Challenge sent to ${targetSchoolName}!`);
    } catch (e) {
      setMsg('❌ Failed to send challenge. Try again.');
    } finally {
      setSending(prev => ({ ...prev, [targetSchoolId]: false }));
    }
  };

  const respondToChallenge = async (requestId, accept) => {
    try {
      await API.put(`/schools/challenge/${requestId}`, { accept });
      loadRequests();
      setMsg(accept ? '✅ Challenge accepted!' : '❌ Challenge declined.');
    } catch (e) { console.error(e); }
  };

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏫 School Directory</h1>
          <p style={styles.subtitle}>Search schools and send quiz challenge requests</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'search' ? styles.tabActive : {}) }}
            onClick={() => setTab('search')}>🔍 Search Schools</button>
          <button style={{ ...styles.tab, ...(tab === 'requests' ? styles.tabActive : {}) }}
            onClick={() => setTab('requests')}>⚔️ Challenge Requests</button>
        </div>

        {msg && (
          <div style={{ ...styles.msgBox, background: msg.includes('✅') ? '#EAFAF1' : '#FDEDEC', color: msg.includes('✅') ? '#27AE60' : '#E74C3C' }}>
            {msg}
          </div>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <div style={styles.content}>
            <div style={styles.searchBar}>
              <input
                style={styles.searchInput}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by school name, city or region..."
              />
              <button style={styles.searchBtn} onClick={handleSearch} disabled={loading}>
                {loading ? '⏳' : '🔍 Search'}
              </button>
            </div>

            {results.length === 0 && !loading && query && (
              <div style={styles.empty}>
                <p style={{ fontSize: 48 }}>🏫</p>
                <p style={{ color: '#888' }}>No schools found for "{query}"</p>
              </div>
            )}

            {results.length === 0 && !query && (
              <div style={styles.empty}>
                <p style={{ fontSize: 48 }}>🔍</p>
                <p style={{ color: '#888' }}>Search for schools to send quiz challenges</p>
              </div>
            )}

            <div style={styles.schoolGrid}>
              {results.map(s => (
                <div key={s.id} style={styles.schoolCard}>
                  <div style={styles.schoolTop}>
                    <div style={styles.schoolAvatar}>
                      {s.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.schoolName}>{s.name}</h3>
                      <p style={styles.schoolLocation}>📍 {s.city || 'Ghana'}{s.region ? `, ${s.region}` : ''}</p>
                    </div>
                  </div>
                  <div style={styles.schoolInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>📧 Email</span>
                      <span style={styles.infoValue}>{s.email || 'N/A'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>📞 Phone</span>
                      <span style={styles.infoValue}>{s.phone || 'N/A'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>👥 Students</span>
                      <span style={styles.infoValue}>{s.studentCount || 0} students</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>🏫 Code</span>
                      <span style={styles.infoValue}>{s.code}</span>
                    </div>
                  </div>
                  {s.id !== school?.id && (
                    <button
                      style={styles.challengeBtn}
                      onClick={() => sendChallenge(s.id, s.name)}
                      disabled={sending[s.id]}
                    >
                      {sending[s.id] ? 'Sending...' : '⚔️ Send Quiz Challenge'}
                    </button>
                  )}
                  {s.id === school?.id && (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: 13, margin: '10px 0 0' }}>
                      This is your school
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div style={styles.content}>
            {requests.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ fontSize: 48 }}>⚔️</p>
                <p style={{ color: '#888' }}>No challenge requests yet</p>
                <p style={{ color: '#aaa', fontSize: 13 }}>Search for schools and send them a quiz challenge!</p>
              </div>
            ) : (
              requests.map(r => (
                <div key={r.id} style={styles.requestCard}>
                  <div style={styles.requestTop}>
                    <div>
                      <h3 style={styles.requestSchool}>
                        {r.from_school_id === school?.id ? `📤 To: ${r.to_school_name}` : `📥 From: ${r.from_school_name}`}
                      </h3>
                      <p style={styles.requestMsg}>{r.message}</p>
                      <p style={styles.requestDate}>{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ ...styles.statusBadge, background: r.status === 'pending' ? '#FEF9E7' : r.status === 'accepted' ? '#EAFAF1' : '#FDEDEC', color: r.status === 'pending' ? '#b8860b' : r.status === 'accepted' ? '#27AE60' : '#E74C3C' }}>
                      {r.status === 'pending' ? '⏳ Pending' : r.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                    </span>
                  </div>
                  {r.status === 'pending' && r.from_school_id !== school?.id && (
                    <div style={styles.requestBtns}>
                      <button style={styles.acceptBtn} onClick={() => respondToChallenge(r.id, true)}>
                        ✅ Accept Challenge
                      </button>
                      <button style={styles.declineBtn} onClick={() => respondToChallenge(r.id, false)}>
                        ❌ Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 240, flex: 1 },
  header:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px' },
  title:         { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:      { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  tabs:          { display: 'flex', background: '#fff', borderBottom: '2px solid #eee' },
  tab:           { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:     { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  msgBox:        { margin: '16px 20px 0', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 'bold' },
  content:       { padding: 20 },
  searchBar:     { display: 'flex', gap: 12, marginBottom: 20 },
  searchInput:   { flex: 1, padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, outline: 'none' },
  searchBtn:     { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  empty:         { textAlign: 'center', padding: '40px 20px' },
  schoolGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  schoolCard:    { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  schoolTop:     { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 },
  schoolAvatar:  { width: 50, height: 50, borderRadius: 25, background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', fontSize: 22, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  schoolName:    { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  schoolLocation:{ fontSize: 13, color: '#888', margin: 0 },
  schoolInfo:    { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  infoItem:      { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f0f0f0' },
  infoLabel:     { color: '#888' },
  infoValue:     { color: '#333', fontWeight: 'bold' },
  challengeBtn:  { width: '100%', background: 'linear-gradient(135deg, #E74C3C, #C0392B)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  requestCard:   { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  requestTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  requestSchool: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  requestMsg:    { fontSize: 14, color: '#555', margin: '0 0 4px' },
  requestDate:   { fontSize: 12, color: '#aaa', margin: 0 },
  statusBadge:   { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', flexShrink: 0 },
  requestBtns:   { display: 'flex', gap: 10 },
  acceptBtn:     { flex: 1, background: '#EAFAF1', color: '#27AE60', border: '1px solid #27AE60', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  declineBtn:    { flex: 1, background: '#FDEDEC', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
};

export default SchoolSearch;