import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import { getSchoolProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { token }    = useAuth();
  const [school,     setSchool]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [logoFile,   setLogoFile]   = useState(null);
  const [logoPreview,setLogoPreview]= useState(null);
  const [uploadMsg,  setUploadMsg]  = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSchoolProfile();
        if (res.data.success) setSchool(res.data.school);
      } catch (e) {
        console.error('Failed to load school profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const res = await fetch('http://localhost:5000/api/upload/logo', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadMsg('✅ Logo uploaded successfully! It will appear on report cards.');
        setSchool(prev => ({ ...prev, logoUrl: data.logoUrl }));
        setLogoFile(null);
      } else {
        setUploadMsg(`❌ ${data.message}`);
      }
    } catch (e) {
      setUploadMsg('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}><p style={styles.center}>Loading...</p></div>
    </div>
  );

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>⚙️ School Settings</h1>
        <p style={styles.subtitle}>Manage your school profile and branding</p>

        {/* School Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🏫 School Information</h2>
          <div style={styles.infoGrid}>
            <InfoRow label="School Name"  value={school?.name} />
            <InfoRow label="School Code"  value={school?.code} />
            <InfoRow label="Email"        value={school?.email} />
            <InfoRow label="Phone"        value={school?.phone || '—'} />
            <InfoRow label="City"         value={school?.city || '—'} />
            <InfoRow label="Region"       value={school?.region || '—'} />
            <InfoRow label="Motto"        value={school?.motto || '—'} />
            <InfoRow label="Total Students" value={school?.totalStudents} />
            <InfoRow label="Total Teachers" value={school?.totalTeachers} />
          </div>
        </div>

        {/* Logo Upload */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🖼️ School Logo</h2>
          <p style={styles.cardDesc}>
            Upload your school logo to appear on report cards and the student portal.
            Recommended size: 200x200px, PNG or JPG.
          </p>

          <div style={styles.logoSection}>
            {/* Current Logo */}
            <div style={styles.logoPreviewBox}>
              {logoPreview || school?.logoUrl ? (
                <img
                  src={logoPreview || `http://localhost:5000${school?.logoUrl}`}
                  alt="School Logo"
                  style={styles.logoImg}
                />
              ) : (
                <div style={styles.logoPlaceholder}>
                  <p style={{ fontSize: 40 }}>🏫</p>
                  <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>No logo uploaded</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div style={styles.uploadControls}>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={styles.fileInput}
                id="logoUpload"
              />
              <label htmlFor="logoUpload" style={styles.fileLabel}>
                📁 Choose Logo File
              </label>

              {logoFile && (
                <p style={styles.fileName}>Selected: {logoFile.name}</p>
              )}

              {uploadMsg && (
                <p style={{
                  fontSize:   13,
                  fontWeight: 'bold',
                  color:      uploadMsg.includes('✅') ? '#27AE60' : '#E74C3C',
                  margin:     '8px 0',
                }}>
                  {uploadMsg}
                </p>
              )}

              <button
                style={{
                  ...styles.uploadBtn,
                  opacity: (!logoFile || uploading) ? 0.6 : 1
                }}
                onClick={handleLogoUpload}
                disabled={!logoFile || uploading}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload Logo'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Card Preview */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📄 Report Card Branding</h2>
          <p style={styles.cardDesc}>
            This is how your school information will appear on student report cards:
          </p>
          <div style={styles.reportPreview}>
            <div style={styles.previewHeader}>
              {(logoPreview || school?.logoUrl) && (
                <img
                  src={logoPreview || `http://localhost:5000${school?.logoUrl}`}
                  alt="Logo"
                  style={styles.previewLogo}
                />
              )}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={styles.previewSchoolName}>{school?.name}</p>
                {school?.motto && (
                  <p style={styles.previewMotto}>"{school.motto}"</p>
                )}
                {(school?.city || school?.region) && (
                  <p style={styles.previewLocation}>
                    {school?.city}, {school?.region}
                  </p>
                )}
              </div>
            </div>
            <div style={styles.previewDivider} />
            <p style={styles.previewReportTitle}>STUDENT REPORT CARD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
      {label}
    </p>
    <p style={{ fontSize: 15, color: '#1A5276', margin: 0, fontWeight: 'bold' }}>
      {value || '—'}
    </p>
  </div>
);

const styles = {
  layout:          { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 240, flex: 1, padding: '28px 24px' },
  title:           { fontSize: 26, color: '#1A5276', fontWeight: 'bold', margin: 0 },
  subtitle:        { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 24 },
  center:          { textAlign: 'center', color: '#888', padding: 40 },
  card:            { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:       { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  cardDesc:        { fontSize: 14, color: '#666', margin: '0 0 16px', lineHeight: 1.6 },
  infoGrid:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  logoSection:     { display: 'flex', gap: 24, alignItems: 'flex-start' },
  logoPreviewBox:  { width: 160, height: 160, borderRadius: 12, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  logoImg:         { width: '100%', height: '100%', objectFit: 'contain' },
  logoPlaceholder: { textAlign: 'center', padding: 16 },
  uploadControls:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  fileInput:       { display: 'none' },
  fileLabel:       { display: 'inline-block', background: '#EAF4FB', color: '#2E86AB', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  fileName:        { fontSize: 13, color: '#555', margin: 0 },
  uploadBtn:       { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' },
  reportPreview:   { border: '2px solid #1A5276', borderRadius: 10, overflow: 'hidden' },
  previewHeader:   { background: '#1A5276', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  previewLogo:     { width: 60, height: 60, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 },
  previewSchoolName: { fontSize: 18, fontWeight: 'bold', color: '#fff', margin: 0 },
  previewMotto:    { fontSize: 12, color: '#AED6F1', margin: '4px 0 0', fontStyle: 'italic' },
  previewLocation: { fontSize: 11, color: '#AED6F1', margin: '4px 0 0' },
  previewDivider:  { height: 3, background: '#2E86AB' },
  previewReportTitle: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#1A5276', padding: '12px', margin: 0 },
};

export default Settings;