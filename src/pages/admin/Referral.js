import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const Referral = () => {
  const { school } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => { fetchReferral(); }, []);

  const fetchReferral = async () => {
    try {
      const res = await API.get('/schools/referral');
      if (res.data.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const copyLink = () => {
    const link = `https://aceprep.gh/register?ref=${school?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = data?.referralCount || 0;
  const target   = 5;
  const pct      = Math.min((progress / target) * 100, 100);
  const isFree   = data?.freeMonthActive;

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎁 Referral Program</h1>
          <p style={styles.subtitle}>Invite 5 schools and get 1 month FREE!</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</p>
        ) : (
          <div style={styles.content}>

            {/* Status Card */}
            <div style={{ ...styles.statusCard, borderTop: isFree ? '4px solid #006B3F' : '4px solid #2E86AB' }}>
              <div style={styles.statusLeft}>
                <p style={{ fontSize: 48, margin: 0 }}>{isFree ? '🎉' : '🎁'}</p>
                <div>
                  <h2 style={styles.statusTitle}>
                    {isFree ? 'Free Month Active!' : 'Refer Schools, Get Free Month'}
                  </h2>
                  <p style={styles.statusDesc}>
                    {isFree
                      ? `Your free month is active until ${data?.freeUntil ? new Date(data.freeUntil).toLocaleDateString() : 'next month'}`
                      : `Invite ${target - progress} more schools to unlock your free month`}
                  </p>
                </div>
              </div>
              {isFree && (
                <div style={styles.freeBadge}>✅ FREE</div>
              )}
            </div>

            {/* Progress */}
            <div style={styles.progressCard}>
              <div style={styles.progressHeader}>
                <h3 style={styles.progressTitle}>📊 Referral Progress</h3>
                <span style={styles.progressCount}>{progress}/{target} schools</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${pct}%` }} />
              </div>
              <div style={styles.progressSteps}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ ...styles.step, background: n <= progress ? '#006B3F' : '#ddd' }}>
                    {n <= progress ? '✓' : n}
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Link */}
            <div style={styles.linkCard}>
              <h3 style={styles.linkTitle}>🔗 Your Referral Link</h3>
              <p style={styles.linkDesc}>Share this link with other schools. When they register, you get credit!</p>
              <div style={styles.linkBox}>
                <code style={styles.linkCode}>
                  https://aceprep.gh/register?ref={school?.code}
                </code>
                <button onClick={copyLink} style={styles.copyBtn}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div style={styles.shareRow}>
                <p style={styles.shareLabel}>Share via:</p>
                <button style={styles.whatsappBtn}
                  onClick={() => window.open(`https://wa.me/?text=Join AcePrep - Ghana's #1 BECE/WASSCE platform! Register here: https://aceprep.gh/register?ref=${school?.code}`)}>
                  📱 WhatsApp
                </button>
                <button style={styles.emailShareBtn}
                  onClick={() => window.open(`mailto:?subject=Join AcePrep&body=Register your school at: https://aceprep.gh/register?ref=${school?.code}`)}>
                  📧 Email
                </button>
              </div>
            </div>

            {/* Referred Schools */}
            <div style={styles.referredCard}>
              <h3 style={styles.referredTitle}>🏫 Schools You've Referred ({data?.referredSchools?.length || 0})</h3>
              {!data?.referredSchools?.length ? (
                <p style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  No referrals yet. Start sharing your link!
                </p>
              ) : (
                data.referredSchools.map((s, i) => (
                  <div key={i} style={styles.referredItem}>
                    <span style={styles.referredAvatar}>{s.name?.charAt(0)}</span>
                    <div>
                      <p style={styles.referredName}>{s.name}</p>
                      <p style={styles.referredDate}>Joined {new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={styles.referredBadge}>✅ Verified</span>
                  </div>
                ))
              )}
            </div>

            {/* How it works */}
            <div style={styles.howCard}>
              <h3 style={styles.howTitle}>❓ How It Works</h3>
              <div style={styles.howSteps}>
                {[
                  { n: '1', text: 'Copy your unique referral link above' },
                  { n: '2', text: 'Share it with other school admins via WhatsApp or email' },
                  { n: '3', text: 'When 5 schools register using your link, you get 1 FREE month' },
                  { n: '4', text: 'Existing schools already on AcePrep cannot use this offer' },
                ].map(s => (
                  <div key={s.n} style={styles.howStep}>
                    <span style={styles.howNum}>{s.n}</span>
                    <p style={styles.howText}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

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
  content:       { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  statusCard:    { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusLeft:    { display: 'flex', gap: 16, alignItems: 'center' },
  statusTitle:   { fontSize: 20, fontWeight: 'bold', color: '#1A5276', margin: '0 0 6px' },
  statusDesc:    { fontSize: 14, color: '#888', margin: 0 },
  freeBadge:     { background: '#006B3F', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 16, fontWeight: 'bold' },
  progressCard:  { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  progressHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  progressCount: { fontSize: 16, fontWeight: 'bold', color: '#2E86AB' },
  progressBar:   { height: 16, background: '#f0f0f0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg, #006B3F, #27AE60)', borderRadius: 8, transition: 'width 0.5s ease' },
  progressSteps: { display: 'flex', justifyContent: 'space-between' },
  step:          { width: 36, height: 36, borderRadius: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' },
  linkCard:      { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  linkTitle:     { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  linkDesc:      { fontSize: 14, color: '#888', margin: '0 0 16px' },
  linkBox:       { display: 'flex', gap: 10, alignItems: 'center', background: '#f8f9fa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  linkCode:      { flex: 1, fontSize: 13, color: '#333', wordBreak: 'break-all' },
  copyBtn:       { background: '#2E86AB', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 },
  shareRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  shareLabel:    { fontSize: 13, color: '#888', margin: 0 },
  whatsappBtn:   { background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  emailShareBtn: { background: '#EA4335', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' },
  referredCard:  { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  referredTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  referredItem:  { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  referredAvatar:{ width: 40, height: 40, borderRadius: 20, background: '#2E86AB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', flexShrink: 0 },
  referredName:  { fontSize: 14, fontWeight: 'bold', color: '#333', margin: '0 0 2px' },
  referredDate:  { fontSize: 12, color: '#888', margin: 0 },
  referredBadge: { marginLeft: 'auto', background: '#EAFAF1', color: '#27AE60', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  howCard:       { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  howTitle:      { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  howSteps:      { display: 'flex', flexDirection: 'column', gap: 12 },
  howStep:       { display: 'flex', gap: 14, alignItems: 'flex-start' },
  howNum:        { width: 30, height: 30, borderRadius: 15, background: '#2E86AB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', flexShrink: 0 },
  howText:       { fontSize: 14, color: '#555', margin: '4px 0 0', lineHeight: 1.5 },
};

export default Referral;