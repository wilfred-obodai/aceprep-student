import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { getSchoolProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const Settings = () => {
  const { token, school: authSchool } = useAuth();
  const [school,      setSchool]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadMsg,   setUploadMsg]   = useState('');
  const [referral,    setReferral]    = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [tab,         setTab]         = useState('profile');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, referralRes] = await Promise.all([
        getSchoolProfile(),
        API.get('/schools/referral').catch(() => ({ data: { success: false } })),
      ]);
      if (profileRes.data.success)  setSchool(profileRes.data.school);
      if (referralRes.data.success) setReferral(referralRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      const res = await fetch('https://aceprep-backend-uvdn.onrender.com/api/upload/logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg('✅ Logo uploaded successfully!');
        setSchool(prev => ({ ...prev, logoUrl: data.logoUrl }));
        setLogoFile(null);
      } else {
        setUploadMsg(`❌ ${data.message}`);
      }
    } catch (e) {
      setUploadMsg('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false); }
  };

  const copyLink = () => {
    const link = `https://aceprep.gh/register?ref=${authSchool?.code || school?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const code = authSchool?.code || school?.code;
    const msg  = `🇬🇭 *Join AcePrep — Ghana's #1 BECE & WASSCE Prep Platform!*

✅ Real Past Questions (PDF + MCQ)
✅ AI Tutor that solves questions with photos
✅ Track student grades & attendance
✅ Quiz Battle between schools
✅ Parent portal to monitor children
🆓 FREE until January 2027!

🔗 Register your school:\nhttps://aceprep.gh/register?ref=${code}\n\n📌 Referral code: *${code}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const progress = referral?.referralCount || 0;
  const pct      = Math.min((progress / 5) * 100, 100);

  if (loading) return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}><p style={styles.center}>Loading...</p></div>
    </div>
  );

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>⚙️ School Settings</h1>
          <p style={styles.subtitle}>Manage your school profile, branding and referrals</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'profile'  ? styles.tabActive : {}) }} onClick={() => setTab('profile')}>🏫 School Profile</button>
          <button style={{ ...styles.tab, ...(tab === 'logo'     ? styles.tabActive : {}) }} onClick={() => setTab('logo')}>🖼️ Logo & Branding</button>
          <button style={{ ...styles.tab, ...(tab === 'referral' ? styles.tabActive : {}) }} onClick={() => setTab('referral')}>🎁 Referral Program</button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏫 School Information</h2>
            <div style={styles.infoGrid}>
              <InfoRow label="School Name"    value={school?.name} />
              <InfoRow label="School Code"    value={school?.code} />
              <InfoRow label="Email"          value={school?.email} />
              <InfoRow label="Phone"          value={school?.phone || '—'} />
              <InfoRow label="City"           value={school?.city || '—'} />
              <InfoRow label="Region"         value={school?.region || '—'} />
              <InfoRow label="Motto"          value={school?.motto || '—'} />
              <InfoRow label="Total Students" value={school?.totalStudents} />
              <InfoRow label="Total Teachers" value={school?.totalTeachers} />
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {tab === 'logo' && (
          <>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🖼️ School Logo</h2>
              <p style={styles.cardDesc}>Upload your school logo to appear on report cards and the student portal. Recommended: 200x200px, PNG or JPG.</p>
              <div style={styles.logoSection}>
                <div style={styles.logoPreviewBox}>
                  {logoPreview || school?.logoUrl ? (
                    <img src={logoPreview || `https://aceprep-backend-uvdn.onrender.com${school?.logoUrl}`} alt="School Logo" style={styles.logoImg} />
                  ) : (
                    <div style={styles.logoPlaceholder}>
                      <p style={{ fontSize: 40 }}>🏫</p>
                      <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>No logo uploaded</p>
                    </div>
                  )}
                </div>
                <div style={styles.uploadControls}>
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} id="logoUpload" />
                  <label htmlFor="logoUpload" style={styles.fileLabel}>📁 Choose Logo File</label>
                  {logoFile && <p style={styles.fileName}>Selected: {logoFile.name}</p>}
                  {uploadMsg && <p style={{ fontSize: 13, fontWeight: 'bold', color: uploadMsg.includes('✅') ? '#27AE60' : '#E74C3C', margin: '8px 0' }}>{uploadMsg}</p>}
                  <button style={{ ...styles.uploadBtn, opacity: (!logoFile || uploading) ? 0.6 : 1 }}
                    onClick={handleLogoUpload} disabled={!logoFile || uploading}>
                    {uploading ? '⏳ Uploading...' : '📤 Upload Logo'}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📄 Report Card Preview</h2>
              <div style={styles.reportPreview}>
                <div style={styles.previewHeader}>
                  {(logoPreview || school?.logoUrl) && (
                    <img src={logoPreview || `https://aceprep-backend-uvdn.onrender.com${school?.logoUrl}`} alt="Logo" style={styles.previewLogo} />
                  )}
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={styles.previewSchoolName}>{school?.name}</p>
                    {school?.motto && <p style={styles.previewMotto}>"{school.motto}"</p>}
                    {(school?.city || school?.region) && <p style={styles.previewLocation}>{school?.city}, {school?.region}</p>}
                  </div>
                </div>
                <div style={styles.previewDivider} />
                <p style={styles.previewReportTitle}>STUDENT REPORT CARD</p>
              </div>
            </div>
          </>
        )}

        {/* Referral Tab */}
        {tab === 'referral' && (
          <>
            {/* Status */}
            <div style={{ ...styles.card, borderTop: referral?.freeMonthActive ? '4px solid #006B3F' : '4px solid #2E86AB' }}>
              <div style={styles.refStatusRow}>
                <p style={{ fontSize: 48, margin: 0 }}>{referral?.freeMonthActive ? '🎉' : '🎁'}</p>
                <div style={{ flex: 1 }}>
                  <h2 style={styles.refTitle}>
                    {referral?.freeMonthActive ? 'Free Month Active!' : 'Refer 5 Schools → Get 1 Month FREE'}
                  </h2>
                  <p style={styles.refDesc}>
                    {referral?.freeMonthActive
                      ? 'Your school is enjoying a free month on AcePrep!'
                      : `Invite ${5 - progress} more schools to unlock your free month`}
                  </p>
                </div>
                {referral?.freeMonthActive && (
                  <div style={styles.freeBadge}>✅ FREE</div>
                )}
              </div>

              {/* Progress */}
              <div style={styles.progressWrap}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                </div>
                <span style={styles.progressText}>{progress}/5 schools referred</span>
              </div>

              <div style={styles.progressSteps}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ ...styles.step, background: n <= progress ? '#006B3F' : '#ddd' }}>
                    {n <= progress ? '✓' : n}
                  </div>
                ))}
              </div>
            </div>

            {/* Share Link */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🔗 Your Referral Link</h2>
              <p style={styles.cardDesc}>Share this with other school admins. When they register, you get credit!</p>
              <div style={styles.linkBox}>
                <code style={styles.linkCode}>https://aceprep.gh/register?ref={authSchool?.code || school?.code}</code>
                <button onClick={copyLink} style={styles.copyBtn}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
              </div>
              <div style={styles.shareRow}>
                <button style={styles.whatsappBtn} onClick={shareWhatsApp}>📱 Share on WhatsApp</button>
                <button style={styles.emailBtn} onClick={() => window.open(`mailto:?subject=Join AcePrep Ghana&body=Register your school at: https://aceprep.gh/register?ref=${authSchool?.code || school?.code}`)}>
                  📧 Share by Email
                </button>
              </div>
            </div>

            {/* Referred Schools */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🏫 Schools You've Referred ({referral?.referredSchools?.length || 0})</h2>
              {!referral?.referredSchools?.length ? (
                <p style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: 20 }}>No referrals yet. Start sharing your link!</p>
              ) : (
                referral.referredSchools.map((s, i) => (
                  <div key={i} style={styles.referredItem}>
                    <span style={styles.refAvatar}>{s.name?.charAt(0)}</span>
                    <div>
                      <p style={styles.refName}>{s.name}</p>
                      <p style={styles.refDate}>Joined {new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={styles.refBadge}>✅ Verified</span>
                  </div>
                ))
              )}
            </div>

            {/* How it works */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>❓ How It Works</h2>
              {[
                { n: '1', text: 'Copy your unique referral link above' },
                { n: '2', text: 'Share it with other school admins via WhatsApp or email' },
                { n: '3', text: 'When 5 new schools register using your link, you get 1 FREE month' },
                { n: '4', text: 'Schools already on AcePrep cannot count towards this offer' },
              ].map(s => (
                <div key={s.n} style={styles.howStep}>
                  <span style={styles.howNum}>{s.n}</span>
                  <p style={styles.howText}>{s.text}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ fontSize: 15, color: '#1A5276', margin: 0, fontWeight: 'bold' }}>{value || '—'}</p>
  </div>
);

const styles = {
  layout:          { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:            { marginLeft: 240, flex: 1 },
  header:          { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '24px' },
  title:           { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:        { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  tabs:            { display: 'flex', background: '#fff', borderBottom: '2px solid #eee' },
  tab:             { flex: 1, padding: '14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 'bold', color: '#888', cursor: 'pointer' },
  tabActive:       { color: '#2E86AB', borderBottom: '3px solid #2E86AB', background: '#EAF4FB' },
  card:            { background: '#fff', borderRadius: 12, padding: 24, margin: '20px 20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:       { fontSize: 18, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  cardDesc:        { fontSize: 14, color: '#666', margin: '0 0 16px', lineHeight: 1.6 },
  center:          { textAlign: 'center', color: '#888', padding: 40 },
  infoGrid:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  logoSection:     { display: 'flex', gap: 24, alignItems: 'flex-start' },
  logoPreviewBox:  { width: 160, height: 160, borderRadius: 12, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  logoImg:         { width: '100%', height: '100%', objectFit: 'contain' },
  logoPlaceholder: { textAlign: 'center', padding: 16 },
  uploadControls:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  fileLabel:       { display: 'inline-block', background: '#EAF4FB', color: '#2E86AB', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  fileName:        { fontSize: 13, color: '#555', margin: 0 },
  uploadBtn:       { background: 'linear-gradient(135deg, #2E86AB, #1A5276)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' },
  reportPreview:   { border: '2px solid #1A5276', borderRadius: 10, overflow: 'hidden' },
  previewHeader:   { background: '#1A5276', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  previewLogo:     { width: 60, height: 60, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 },
  previewSchoolName:{ fontSize: 18, fontWeight: 'bold', color: '#fff', margin: 0 },
  previewMotto:    { fontSize: 12, color: '#AED6F1', margin: '4px 0 0', fontStyle: 'italic' },
  previewLocation: { fontSize: 11, color: '#AED6F1', margin: '4px 0 0' },
  previewDivider:  { height: 3, background: '#2E86AB' },
  previewReportTitle:{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#1A5276', padding: '12px', margin: 0 },
  refStatusRow:    { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 },
  refTitle:        { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  refDesc:         { fontSize: 14, color: '#888', margin: 0 },
  freeBadge:       { background: '#006B3F', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 16, fontWeight: 'bold', flexShrink: 0 },
  progressWrap:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressBar:     { flex: 1, height: 14, background: '#f0f0f0', borderRadius: 7, overflow: 'hidden' },
  progressFill:    { height: '100%', background: 'linear-gradient(90deg, #006B3F, #27AE60)', borderRadius: 7, transition: 'width 0.5s' },
  progressText:    { fontSize: 13, color: '#888', fontWeight: 'bold', whiteSpace: 'nowrap' },
  progressSteps:   { display: 'flex', gap: 10 },
  step:            { width: 36, height: 36, borderRadius: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' },
  linkBox:         { display: 'flex', gap: 10, alignItems: 'center', background: '#f8f9fa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  linkCode:        { flex: 1, fontSize: 13, color: '#333', wordBreak: 'break-all' },
  copyBtn:         { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 },
  shareRow:        { display: 'flex', gap: 10 },
  whatsappBtn:     { background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  emailBtn:        { background: '#EA4335', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  referredItem:    { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  refAvatar:       { width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', flexShrink: 0 },
  refName:         { fontSize: 14, fontWeight: 'bold', color: '#333', margin: '0 0 2px' },
  refDate:         { fontSize: 12, color: '#888', margin: 0 },
  refBadge:        { marginLeft: 'auto', background: '#EAFAF1', color: '#27AE60', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  howStep:         { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  howNum:          { width: 30, height: 30, borderRadius: 15, background: '#2E86AB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', flexShrink: 0 },
  howText:         { fontSize: 14, color: '#555', margin: '4px 0 0', lineHeight: 1.5 },
};

export default Settings;