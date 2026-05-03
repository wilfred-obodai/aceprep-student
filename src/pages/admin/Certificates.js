import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import API from '../../services/api';

const certTypes = [
  { id: 'top_student',    label: '🌟 Top Student',          desc: 'Highest average score' },
  { id: 'perfect_attend', label: '✅ Perfect Attendance',    desc: '100% attendance record' },
  { id: 'most_improved',  label: '📈 Most Improved',         desc: 'Greatest score improvement' },
  { id: 'exam_champion',  label: '🏆 Exam Champion',         desc: 'Highest exam score' },
  { id: 'streak_master',  label: '🔥 Streak Master',         desc: 'Longest study streak' },
];

const Certificates = () => {
  const [students,    setStudents]    = useState([]);
  const [selStudent,  setSelStudent]  = useState('');
  const [selType,     setSelType]     = useState('top_student');
  const [school,      setSchool]      = useState(null);
  const [preview,     setPreview]     = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, schRes] = await Promise.all([
          API.get('/schools/students'),
          API.get('/schools/profile'),
        ]);
        if (sRes.data.success)   setStudents(sRes.data.students || []);
        if (schRes.data.success) setSchool(schRes.data.school);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const student  = students.find(s => s.id === parseInt(selStudent));
  const certType = certTypes.find(c => c.id === selType);
  const today    = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const printCert = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body { margin: 0; font-family: 'Georgia', serif; }
        .cert { width: 842px; height: 595px; position: relative; background: linear-gradient(135deg, #f8f0e3, #fff8f0); border: 20px solid #1A5276; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
        .flag { display: flex; width: 100px; height: 10px; margin: 0 auto 20px; }
        .flag-g { flex: 1; background: #006B3F; }
        .flag-y { flex: 1; background: #FCD116; }
        .flag-r { flex: 1; background: #CE1126; }
        h1 { font-size: 48px; color: #1A5276; margin: 0 0 4px; letter-spacing: 4px; }
        .sub { font-size: 14px; color: #888; margin: 0 0 24px; }
        .presents { font-size: 16px; color: #555; margin: 0 0 8px; }
        .cert-type { font-size: 32px; font-weight: bold; color: #F39C12; margin: 0 0 16px; }
        .student-name { font-size: 40px; color: #1A5276; font-style: italic; margin: 0 0 8px; border-bottom: 2px solid #F39C12; padding-bottom: 8px; }
        .desc { font-size: 16px; color: #555; margin: 16px 0 24px; max-width: 500px; }
        .school-name { font-size: 18px; color: #2E86AB; font-weight: bold; margin: 0 0 4px; }
        .date { font-size: 14px; color: #888; margin: 0; }
        .divider { width: 80px; height: 3px; background: linear-gradient(90deg, #006B3F, #FCD116, #CE1126); margin: 16px auto; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style></head>
      <body>
        <div class="cert">
          <div class="flag"><div class="flag-g"></div><div class="flag-y"></div><div class="flag-r"></div></div>
          <h1>ACEPREP</h1>
          <p class="sub">Ghana's Premier BECE & WASSCE Platform</p>
          <div class="divider"></div>
          <p class="presents">This certificate is proudly presented to</p>
          <p class="student-name">${student?.fullName || 'Student Name'}</p>
          <p class="cert-type">${certType?.label || ''}</p>
          <p class="desc">${certType?.desc || ''} — awarded in recognition of outstanding achievement.</p>
          <div class="divider"></div>
          <p class="school-name">${school?.name || 'School Name'}</p>
          <p class="date">Awarded on ${today}</p>
        </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>📜 Digital Certificates</h1>
          <p style={styles.subtitle}>Generate and print achievement certificates for students</p>
        </div>

        <div style={styles.content}>
          {/* Form */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>Generate Certificate</h3>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Select Student</label>
                <select style={styles.input} value={selStudent}
                  onChange={e => setSelStudent(e.target.value)}>
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Certificate Type</label>
                <select style={styles.input} value={selType}
                  onChange={e => setSelType(e.target.value)}>
                  {certTypes.map(c => (
                    <option key={c.id} value={c.id}>{c.label} — {c.desc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.formBtns}>
              <button style={styles.previewBtn} onClick={() => setPreview(true)} disabled={!selStudent}>
                👁️ Preview Certificate
              </button>
              <button style={styles.printBtnForm} onClick={printCert} disabled={!selStudent}>
                🖨️ Print / Download
              </button>
            </div>
          </div>

          {/* Certificate Types */}
          <div style={styles.typesCard}>
            <h3 style={styles.cardTitle}>📋 Available Certificate Types</h3>
            <div style={styles.typeGrid}>
              {certTypes.map(c => (
                <div key={c.id} style={{ ...styles.typeCard, ...(selType === c.id ? styles.typeCardActive : {}) }}
                  onClick={() => setSelType(c.id)}>
                  <p style={{ fontSize: 28, margin: '0 0 8px' }}>{c.label.split(' ')[0]}</p>
                  <p style={styles.typeLabel}>{c.label.substring(2)}</p>
                  <p style={styles.typeDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {preview && selStudent && (
            <div style={styles.certPreview} ref={certRef}>
              {/* Flag Strip */}
              <div style={styles.certFlag}>
                <div style={{ flex:1, background:'#006B3F' }} />
                <div style={{ flex:1, background:'#FCD116' }} />
                <div style={{ flex:1, background:'#CE1126' }} />
              </div>
              <h1 style={styles.certLogo}>ACEPREP</h1>
              <p style={styles.certSub}>Ghana's Premier BECE & WASSCE Platform</p>
              <div style={styles.certDivider} />
              <p style={styles.certPresents}>This certificate is proudly presented to</p>
              <h2 style={styles.certStudent}>{student?.fullName}</h2>
              <p style={styles.certType}>{certType?.label}</p>
              <p style={styles.certDesc}>{certType?.desc} — awarded in recognition of outstanding achievement.</p>
              <div style={styles.certDivider} />
              <p style={styles.certSchool}>{school?.name || 'School Name'}</p>
              <p style={styles.certDate}>Awarded on {today}</p>
              <button onClick={printCert} style={styles.certPrintBtn}>🖨️ Print This Certificate</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:           { marginLeft: 240, flex: 1 },
  header:         { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px' },
  title:          { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:       { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:        { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  formCard:       { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  typesCard:      { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  formGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  field:          { display: 'flex', flexDirection: 'column', gap: 6 },
  label:          { fontSize: 13, fontWeight: 'bold', color: '#555' },
  input:          { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14 },
  formBtns:       { display: 'flex', gap: 12 },
  previewBtn:     { background: '#EAF4FB', color: '#2E86AB', border: '1px solid #2E86AB', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  printBtnForm:   { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  typeGrid:       { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  typeCard:       { background: '#f8f9fa', borderRadius: 10, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' },
  typeCardActive: { border: '2px solid #2E86AB', background: '#EAF4FB' },
  typeLabel:      { fontSize: 13, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  typeDesc:       { fontSize: 11, color: '#888', margin: 0 },
  certPreview:    { background: '#fff', borderRadius: 16, padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '8px solid #1A5276', position: 'relative' },
  certFlag:       { display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', width: 120, margin: '0 auto 20px' },
  certLogo:       { fontSize: 42, fontWeight: '900', color: '#1A5276', letterSpacing: 4, margin: '0 0 4px' },
  certSub:        { fontSize: 13, color: '#888', margin: '0 0 16px' },
  certDivider:    { height: 3, background: 'linear-gradient(90deg, #006B3F, #FCD116, #CE1126)', borderRadius: 2, width: 80, margin: '16px auto' },
  certPresents:   { fontSize: 15, color: '#555', margin: '0 0 8px' },
  certStudent:    { fontSize: 36, color: '#1A5276', fontStyle: 'italic', margin: '0 0 8px', borderBottom: '2px solid #F39C12', paddingBottom: 8, display: 'inline-block' },
  certType:       { fontSize: 24, fontWeight: 'bold', color: '#F39C12', margin: '16px 0 8px' },
  certDesc:       { fontSize: 14, color: '#555', margin: '0 0 16px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' },
  certSchool:     { fontSize: 16, color: '#2E86AB', fontWeight: 'bold', margin: '0 0 4px' },
  certDate:       { fontSize: 13, color: '#888', margin: '0 0 20px' },
  certPrintBtn:   { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
};

export default Certificates;