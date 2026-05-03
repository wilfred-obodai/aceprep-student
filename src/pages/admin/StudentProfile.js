import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/AdminSidebar';
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
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { token }  = useAuth();
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [downloading,  setDownloading]  = useState(false);
  const [sending,      setSending]      = useState(false);
  const [sendMsg,      setSendMsg]      = useState('');
  const [showEmailForm,setShowEmailForm]= useState(false);
  const [parentEmail,  setParentEmail]  = useState('');
  const [parentName,   setParentName]   = useState('');

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
      const res  = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob    = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link    = document.createElement('a');
      link.href     = blobUrl;
      link.setAttribute('download', `report-card-${data?.student?.fullName || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('Failed to download report card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const sendToParent = async () => {
    if (!parentEmail) return;
    setSending(true);
    setSendMsg('');
    try {
      const res = await fetch(
        `http://localhost:5000/api/report-card/${id}/send-email`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            parentEmail,
            parentName,
            academicYear: '2026'
          })
        }
      );
      const resData = await res.json();
      if (resData.success) {
        setSendMsg('✅ Report card sent to parent successfully!');
        setShowEmailForm(false);
        setParentEmail('');
        setParentName('');
      } else {
        setSendMsg(`❌ ${resData.message}`);
      }
    } catch (e) {
      setSendMsg('❌ Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <p style={styles.loading}>Loading student profile...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <p style={styles.loading}>Student not found</p>
      </div>
    </div>
  );

  const { student, summary, grades } = data;
  const gc = gradeColor(summary.overallGrade);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>

        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Student Header */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {student.fullName.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.studentName}>{student.fullName}</h1>
            <p style={styles.studentMeta}>
              {student.email} &nbsp;|&nbsp;
              {student.level} Year {student.yearGroup} &nbsp;|&nbsp;
              Class {student.className || '—'}
            </p>

            {/* Action Buttons */}
            <div style={styles.actionBtns}>
              <button
                style={styles.reportBtn}
                onClick={downloadReportCard}
                disabled={downloading}
              >
                {downloading ? '⏳ Generating...' : '📄 Download Report Card'}
              </button>

              <button
                style={styles.emailBtn}
                onClick={() => { setShowEmailForm(!showEmailForm); setSendMsg(''); }}
              >
                📧 Send to Parent
              </button>
            </div>

            {/* Email Form */}
            {showEmailForm && (
              <div style={styles.emailForm}>
                <p style={styles.emailFormTitle}>Send Report Card to Parent/Guardian</p>
                <input
                  style={styles.emailInput}
                  type="text"
                  placeholder="Parent/Guardian Name (Optional)"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                />
                <input
                  style={styles.emailInput}
                  type="email"
                  placeholder="Parent/Guardian Email *"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      ...styles.emailSendBtn,
                      opacity: !parentEmail || sending ? 0.6 : 1,
                      flex: 1,
                    }}
                    onClick={sendToParent}
                    disabled={!parentEmail || sending}
                  >
                    {sending ? '⏳ Sending...' : '📤 Send Report Card'}
                  </button>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => { setShowEmailForm(false); setSendMsg(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Send Message */}
            {sendMsg && (
              <p style={{
                fontSize:   13,
                marginTop:  8,
                color:      sendMsg.includes('✅') ? '#27AE60' : '#E74C3C',
                fontWeight: 'bold',
              }}>
                {sendMsg}
              </p>
            )}
          </div>

          {/* Overall Grade */}
          <div style={{
            ...styles.overallGrade,
            background: gc.bg,
            color:      gc.color,
            border:     `2px solid ${gc.color}`,
          }}>
            <p style={styles.gradeLabel}>Overall</p>
            <p style={styles.gradeLetter}>{summary.overallGrade}</p>
            <p style={styles.gradeAvg}>{summary.overallAverage}%</p>
          </div>
        </div>

        {/* Subject Summary */}
        <h2 style={styles.sectionTitle}>Subject Performance</h2>
        <div style={styles.subjectCards}>
          {summary.subjectSummary.map(s => {
            const sc = gradeColor(s.gradeLetter);
            return (
              <div key={s.subject} style={{
                ...styles.subjectCard,
                borderTop: `4px solid ${sc.color}`
              }}>
                <p style={styles.subjectName}>{s.subject}</p>
                <p style={{ ...styles.subjectGrade, color: sc.color }}>
                  {s.gradeLetter}
                </p>
                <p style={styles.subjectAvg}>{s.average}%</p>
                <p style={styles.subjectCount}>{s.totalTaken} assessments</p>
              </div>
            );
          })}
        </div>

        {/* Grade History */}
        <h2 style={styles.sectionTitle}>Full Grade History</h2>
        <div style={styles.section}>
          {grades.length === 0 ? (
            <p style={styles.empty}>No grades yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Assessment</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Percentage</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => {
                  const gc = gradeColor(g.gradeLetter);
                  return (
                    <tr key={g.id} style={styles.tr}>
                      <td style={styles.td}>{g.subject}</td>
                      <td style={styles.td}>{g.assessmentName}</td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{g.assessmentType}</span>
                      </td>
                      <td style={styles.td}>{g.score}/{g.maxScore}</td>
                      <td style={styles.td}>{g.percentage}%</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.gradeBadge,
                          background: gc.bg,
                          color:      gc.color,
                        }}>
                          {g.gradeLetter}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(g.takenAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:        { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:          { marginLeft: 240, flex: 1, padding: '32px 28px' },
  loading:       { textAlign: 'center', color: '#888', padding: 40 },
  backBtn:       { background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '8px 16px', fontSize: 14, color: '#555', marginBottom: 24, cursor: 'pointer' },
  profileCard:   { background: '#fff', borderRadius: 12, padding: 28, display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  avatar:        { width: 70, height: 70, borderRadius: '50%', background: '#2E86AB', color: '#fff', fontSize: 28, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileInfo:   { flex: 1 },
  studentName:   { fontSize: 22, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  studentMeta:   { fontSize: 14, color: '#888', marginBottom: 12 },
  actionBtns:    { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  reportBtn:     { background: 'linear-gradient(135deg, #27AE60, #1E8449)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  emailBtn:      { background: 'linear-gradient(135deg, #8E44AD, #6C3483)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  emailForm:     { background: '#f8f9fa', borderRadius: 10, padding: 16, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #eee' },
  emailFormTitle:{ fontSize: 14, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  emailInput:    { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  emailSendBtn:  { background: 'linear-gradient(135deg, #8E44AD, #6C3483)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn:     { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: '#555', cursor: 'pointer' },
  overallGrade:  { textAlign: 'center', borderRadius: 12, padding: '16px 24px', flexShrink: 0 },
  gradeLabel:    { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', margin: 0 },
  gradeLetter:   { fontSize: 40, fontWeight: 'bold', lineHeight: 1.2, margin: 0 },
  gradeAvg:      { fontSize: 14, fontWeight: 'bold', margin: 0 },
  sectionTitle:  { fontSize: 18, color: '#1A5276', fontWeight: 'bold', marginBottom: 16 },
  subjectCards:  { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 },
  subjectCard:   { background: '#fff', borderRadius: 10, padding: '16px 20px', minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  subjectName:   { fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 'bold' },
  subjectGrade:  { fontSize: 32, fontWeight: 'bold', margin: 0 },
  subjectAvg:    { fontSize: 14, color: '#888', marginTop: 4 },
  subjectCount:  { fontSize: 12, color: '#aaa', marginTop: 2 },
  section:       { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  empty:         { textAlign: 'center', color: '#888', padding: 40 },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { background: '#EAF4FB' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#1A5276', fontWeight: 'bold', borderBottom: '2px solid #2E86AB' },
  tr:            { borderBottom: '1px solid #f0f0f0' },
  td:            { padding: '12px 16px', fontSize: 14, color: '#333' },
  typeBadge:     { background: '#EAF4FB', color: '#2E86AB', padding: '3px 8px', borderRadius: 4, fontSize: 12 },
  gradeBadge:    { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' },
};

export default StudentProfile;