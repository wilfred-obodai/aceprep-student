import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { getStudentGrades } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const gradeColor = (letter) => {
  const colors = {
    A: { bg: '#EAFAF1', color: '#27AE60' },
    B: { bg: '#EAF4FB', color: '#2E86AB' },
    C: { bg: '#EBF5FB', color: '#2980B9' },
    D: { bg: '#FEF9E7', color: '#F39C12' },
    E: { bg: '#FDEBD0', color: '#E67E22' },
    F: { bg: '#FDEDEC', color: '#E74C3C' },
  };
  return colors[letter] || { bg: '#f0f0f0', color: '#333' };
};

const StudentProfile = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { token } = useAuth();
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [downloading,   setDownloading]   = useState(false);
  const [sendMsg,       setSendMsg]       = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [parentEmail,   setParentEmail]   = useState('');
  const [parentName,    setParentName]    = useState('');
  const [tab,           setTab]           = useState('grades');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentGrades(id);
        setData(res.data);
      } catch (err) {
        console.error('Student profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const downloadReportCard = async () => {
    setDownloading(true);
    try {
      const url = `http://localhost:5000/api/report-card/${id}?academicYear=2026`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link    = document.createElement('a');
      link.href     = blobUrl;
      link.setAttribute('download', `report-card-${data?.student?.fullName || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Failed to download report card');
    } finally {
      setDownloading(false);
    }
  };

  const shareOnWhatsApp = () => {
    const student = data?.student;
    const grades  = data?.grades || [];
    const avg     = grades.length > 0
      ? Math.round(grades.reduce((s, g) => s + parseFloat(g.percentage || 0), 0) / grades.length)
      : 0;
    const msg = `🎓 *${student?.fullName}'s AcePrep Report*\n\n📊 Average Score: *${avg}%*\n📚 Level: ${student?.level} Year ${student?.yearGroup}\n🏫 School: ${student?.schoolName}\n\n📱 Track progress on AcePrep Ghana 🇬🇭`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if (loading) return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}><p style={styles.center}>Loading student profile...</p></div>
    </div>
  );

  if (!data || !data.student) return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <p style={styles.center}>Student not found.</p>
        <button onClick={() => navigate('/admin/students')} style={styles.backBtn}>← Back to Students</button>
      </div>
    </div>
  );

  const student   = data.student;
  const grades    = data.grades || [];
  const avgScore  = grades.length > 0
    ? Math.round(grades.reduce((s, g) => s + parseFloat(g.percentage || 0), 0) / grades.length)
    : 0;

  const subjectMap = grades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(parseFloat(g.percentage || 0));
    return acc;
  }, {});

  const subjectAverages = Object.entries(subjectMap).map(([subject, scores]) => ({
    subject,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count:   scores.length,
  })).sort((a, b) => b.average - a.average);

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate('/admin/students')} style={styles.backBtn}>← Back to Students</button>
          <div style={styles.headerContent}>
            <div style={styles.avatar}>{student.fullName?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={styles.studentName}>{student.fullName}</h1>
              <p style={styles.studentMeta}>
                {student.level} • Year {student.yearGroup}
                {student.className ? ` • Class ${student.className}` : ''}
                {student.shsTrack ? ` • ${student.shsTrack}` : ''}
              </p>
              <p style={styles.studentEmail}>{student.email}</p>
            </div>
            <div style={styles.headerActions}>
              <button onClick={downloadReportCard} style={styles.reportBtn} disabled={downloading}>
                {downloading ? '⏳ Generating...' : '📄 Report Card'}
              </button>
              <button onClick={shareOnWhatsApp} style={styles.whatsappBtn}>
                📱 Share on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="📊" label="Average Score" value={`${avgScore}%`} color={avgScore >= 70 ? '#006B3F' : avgScore >= 50 ? '#b8860b' : '#CE1126'} />
          <StatCard icon="📝" label="Total Assessments" value={grades.length} color="#2E86AB" />
          <StatCard icon="📚" label="Subjects" value={subjectAverages.length} color="#8E44AD" />
          <StatCard icon="🎓" label="Student Type" value={student.studentType || 'School'} color="#F39C12" />
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'grades'    ? styles.tabActive : {}) }} onClick={() => setTab('grades')}>📊 Grades</button>
          <button style={{ ...styles.tab, ...(tab === 'subjects'  ? styles.tabActive : {}) }} onClick={() => setTab('subjects')}>📚 By Subject</button>
          <button style={{ ...styles.tab, ...(tab === 'info'      ? styles.tabActive : {}) }} onClick={() => setTab('info')}>👤 Info</button>
        </div>

        <div style={styles.content}>
          {/* Grades Tab */}
          {tab === 'grades' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 All Grades ({grades.length})</h3>
              {grades.length === 0 ? (
                <p style={styles.center}>No grades yet</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Assessment</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Grade</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g, i) => {
                      const gc = gradeColor(g.grade_letter);
                      return (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}><strong>{g.subject}</strong></td>
                          <td style={styles.td}>{g.assessment_name || g.assessment_type}</td>
                          <td style={styles.td}><strong>{g.percentage}%</strong></td>
                          <td style={styles.td}>
                            <span style={{ ...styles.gradeBadge, background: gc.bg, color: gc.color }}>
                              {g.grade_letter}
                            </span>
                          </td>
                          <td style={styles.td}>{new Date(g.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {tab === 'subjects' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📚 Performance by Subject</h3>
              {subjectAverages.length === 0 ? (
                <p style={styles.center}>No grades yet</p>
              ) : (
                subjectAverages.map((s, i) => (
                  <div key={i} style={styles.subjectRow}>
                    <span style={styles.subjectName}>{s.subject}</span>
                    <div style={styles.barWrap}>
                      <div style={{
                        ...styles.bar,
                        width: `${s.average}%`,
                        background: s.average >= 70 ? '#006B3F' : s.average >= 50 ? '#FCD116' : '#CE1126'
                      }} />
                    </div>
                    <span style={{ ...styles.subjectScore, color: s.average >= 70 ? '#006B3F' : s.average >= 50 ? '#b8860b' : '#CE1126' }}>
                      {s.average}%
                    </span>
                    <span style={styles.subjectCount}>{s.count} assessments</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Info Tab */}
          {tab === 'info' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>👤 Student Information</h3>
              <div style={styles.infoGrid}>
                <InfoRow label="Full Name"    value={student.fullName} />
                <InfoRow label="Email"        value={student.email} />
                <InfoRow label="Level"        value={student.level} />
                <InfoRow label="Year Group"   value={`Year ${student.yearGroup}`} />
                <InfoRow label="Class"        value={student.className || '—'} />
                <InfoRow label="SHS Track"    value={student.shsTrack || '—'} />
                <InfoRow label="Student Type" value={student.studentType} />
                <InfoRow label="School"       value={student.schoolName} />
                <InfoRow label="Joined"       value={student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : '—'} />
              </div>

              {/* Send message to parent */}
              <div style={styles.parentSection}>
                <h4 style={{ color: '#1A5276', margin: '0 0 12px' }}>📧 Contact Parent</h4>
                {!showEmailForm ? (
                  <button style={styles.contactBtn} onClick={() => setShowEmailForm(true)}>
                    ✉️ Send Message to Parent
                  </button>
                ) : (
                  <div style={styles.emailForm}>
                    <input style={styles.input} value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Parent's name" />
                    <input style={styles.input} type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Parent's email" />
                    {sendMsg && <p style={{ color: sendMsg.includes('✅') ? '#006B3F' : '#CE1126', fontSize: 13 }}>{sendMsg}</p>}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button style={styles.sendBtn} onClick={async () => {
                        setSendMsg('✅ Feature coming soon! Use WhatsApp share above.');
                      }}>Send</button>
                      <button style={styles.cancelBtn} onClick={() => setShowEmailForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: 28, margin: 0 }}>{icon}</p>
    <p style={{ fontSize: 22, fontWeight: 'bold', color, margin: '6px 0 4px' }}>{value}</p>
    <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{label}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <p style={{ fontSize: 11, color: '#888', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ fontSize: 14, color: '#1A5276', margin: 0, fontWeight: 'bold' }}>{value || '—'}</p>
  </div>
);

const styles = {
  layout:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 240, flex: 1 },
  header:        { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '20px 24px' },
  backBtn:       { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 12 },
  headerContent: { display: 'flex', alignItems: 'center', gap: 20 },
  avatar:        { width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 28, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  studentName:   { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: '0 0 4px' },
  studentMeta:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 2px' },
  studentEmail:  { fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 },
  headerActions: { marginLeft: 'auto', display: 'flex', gap: 10 },
  reportBtn:     { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  whatsappBtn:   { background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 24px 0' },
  tabs:          { display: 'flex', background: '#fff', borderBottom: '2px solid #eee', margin: '20px 0 0' },
  tab:           { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:     { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  content:       { padding: '20px 24px' },
  center:        { textAlign: 'center', color: '#888', padding: 40 },
  card:          { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { background: '#EAF4FB' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:            { borderBottom: '1px solid #f0f0f0' },
  td:            { padding: '12px 16px', fontSize: 14, color: '#333' },
  gradeBadge:    { padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 'bold' },
  subjectRow:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  subjectName:   { width: 160, fontSize: 14, color: '#333', fontWeight: 'bold', flexShrink: 0 },
  barWrap:       { flex: 1, height: 12, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' },
  bar:           { height: '100%', borderRadius: 6, transition: 'width 0.5s' },
  subjectScore:  { width: 45, fontSize: 14, fontWeight: 'bold', textAlign: 'right', flexShrink: 0 },
  subjectCount:  { width: 100, fontSize: 12, color: '#aaa', flexShrink: 0 },
  infoGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 },
  parentSection: { borderTop: '1px solid #f0f0f0', paddingTop: 20 },
  contactBtn:    { background: '#EAF4FB', color: '#2E86AB', border: '1px solid #2E86AB', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  emailForm:     { display: 'flex', flexDirection: 'column', gap: 10 },
  input:         { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14 },
  sendBtn:       { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn:     { background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' },
};

export default StudentProfile;