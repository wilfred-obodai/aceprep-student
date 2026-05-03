import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import API from '../../services/api';

const subjects = ['Mathematics','English Language','Integrated Science','Social Studies','ICT','Physics','Chemistry','Biology','Economics'];

const PastQuestionsPDF = () => {
  const [pdfs,     setPdfs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading,setUploading]= useState(false);
  const [msg,      setMsg]      = useState('');
  const [form,     setForm]     = useState({ subject: 'Mathematics', exam_year: '2023', level: 'JHS', exam_type: 'BECE' });
  const [file,     setFile]     = useState(null);

  useEffect(() => { fetchPdfs(); }, []);

  const fetchPdfs = async () => {
    try {
      const res = await API.get('/past-questions-pdf');
      if (res.data.success) setPdfs(res.data.pdfs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setMsg('❌ Please select a PDF file'); return; }
    setUploading(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('subject',   form.subject);
      formData.append('exam_year', form.exam_year);
      formData.append('level',     form.level);
      formData.append('exam_type', form.exam_type);
      const res = await API.post('/past-questions-pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMsg('✅ PDF uploaded successfully!');
        setFile(null);
        fetchPdfs();
      }
    } catch (e) {
      setMsg('❌ Upload failed: ' + (e.response?.data?.message || e.message));
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this PDF?')) return;
    try {
      await API.delete(`/past-questions-pdf/${id}`);
      fetchPdfs();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>📄 Past Questions PDFs</h1>
          <p style={styles.subtitle}>Upload real BECE/WASSCE past question papers for students</p>
        </div>

        {/* Upload Form */}
        <div style={styles.uploadCard}>
          <h3 style={styles.cardTitle}>📤 Upload New PDF</h3>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <select style={styles.input} value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Exam Type</label>
                <select style={styles.input} value={form.exam_type}
                  onChange={e => setForm({...form, exam_type: e.target.value})}>
                  <option value="BECE">BECE</option>
                  <option value="WASSCE">WASSCE</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Year</label>
                <select style={styles.input} value={form.exam_year}
                  onChange={e => setForm({...form, exam_year: e.target.value})}>
                  {[2024,2023,2022,2021,2020,2019,2018,2017,2016,2015].map(y =>
                    <option key={y} value={y}>{y}</option>
                  )}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Level</label>
                <select style={styles.input} value={form.level}
                  onChange={e => setForm({...form, level: e.target.value})}>
                  <option value="JHS">JHS</option>
                  <option value="SHS">SHS</option>
                </select>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>PDF File</label>
              <input type="file" accept=".pdf"
                onChange={e => setFile(e.target.files[0])}
                style={styles.fileInput} />
              {file && <p style={{ color: '#27AE60', fontSize: 13, marginTop: 4 }}>✅ {file.name}</p>}
            </div>
            {msg && <p style={{ color: msg.includes('✅') ? '#27AE60' : '#E74C3C', fontSize: 14 }}>{msg}</p>}
            <button type="submit" style={styles.uploadBtn} disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
            </button>
          </form>
        </div>

        {/* PDF List */}
        <div style={styles.listCard}>
          <h3 style={styles.cardTitle}>📚 Uploaded PDFs ({pdfs.length})</h3>
          {loading ? <p style={styles.center}>Loading...</p> :
           pdfs.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>📄</p>
              <p style={{ color: '#888' }}>No PDFs uploaded yet</p>
            </div>
          ) : (
            <div style={styles.pdfGrid}>
              {pdfs.map(pdf => (
                <div key={pdf.id} style={styles.pdfCard}>
                  <div style={styles.pdfIcon}>📄</div>
                  <div style={styles.pdfInfo}>
                    <p style={styles.pdfTitle}>{pdf.subject}</p>
                    <p style={styles.pdfMeta}>{pdf.exam_type} {pdf.exam_year} • {pdf.level}</p>
                    <p style={styles.pdfFile}>{pdf.file_name}</p>
                  </div>
                  <div style={styles.pdfActions}>
                    <a href={`http://localhost:5000${pdf.file_url}`} target="_blank"
                      rel="noreferrer" style={styles.viewPdfBtn}>👁️ View</a>
                    <button onClick={() => handleDelete(pdf.id)} style={styles.deletePdfBtn}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:    { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:      { marginLeft: 240, flex: 1 },
  header:    { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '28px 24px' },
  title:     { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:  { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  uploadCard:{ background: '#fff', borderRadius: 12, padding: 24, margin: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  listCard:  { background: '#fff', borderRadius: 12, padding: 24, margin: '0 20px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  form:      { display: 'flex', flexDirection: 'column', gap: 16 },
  formGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontSize: 13, fontWeight: 'bold', color: '#555' },
  input:     { padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14 },
  fileInput: { padding: '10px', border: '2px dashed #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  uploadBtn: { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' },
  center:    { textAlign: 'center', color: '#888', padding: 40 },
  empty:     { textAlign: 'center', padding: '40px 20px' },
  pdfGrid:   { display: 'flex', flexDirection: 'column', gap: 12 },
  pdfCard:   { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f8f9fa', borderRadius: 10, border: '1px solid #eee' },
  pdfIcon:   { fontSize: 32, flexShrink: 0 },
  pdfInfo:   { flex: 1 },
  pdfTitle:  { fontSize: 15, fontWeight: 'bold', color: '#1A5276', margin: '0 0 4px' },
  pdfMeta:   { fontSize: 13, color: '#2E86AB', margin: '0 0 2px' },
  pdfFile:   { fontSize: 12, color: '#888', margin: 0 },
  pdfActions:{ display: 'flex', gap: 8, alignItems: 'center' },
  viewPdfBtn:{ background: '#EAF4FB', color: '#2E86AB', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' },
  deletePdfBtn:{ background: '#FDEDEC', color: '#E74C3C', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' },
};

export default PastQuestionsPDF;