import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const Profile = () => {
  const { logout }  = useAuth();
  const navigate    = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfile();
        if (res.data.success) setProfile(res.data.student);
      } catch (e) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <BottomNav />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>
              {profile?.fullName?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <h2 style={styles.name}>{profile?.fullName || 'Student'}</h2>
          <p style={styles.email}>{profile?.email || ''}</p>
        </div>

        {loading ? (
          <p style={styles.center}>Loading profile...</p>
        ) : error ? (
          <p style={{ ...styles.center, color: '#E74C3C' }}>{error}</p>
        ) : profile && (
          <div style={styles.content}>
            {/* Stats */}
            <div style={styles.statsRow}>
              <div style={{ ...styles.statCard, borderTop: '4px solid #2E86AB' }}>
                <p style={styles.statValue}>{profile.studyMinutesThisWeek}m</p>
                <p style={styles.statLabel}>Study Time</p>
                <p style={styles.statSub}>This week</p>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #27AE60' }}>
                <p style={styles.statValue}>{profile.totalSessions}</p>
                <p style={styles.statLabel}>Sessions</p>
                <p style={styles.statSub}>Total</p>
              </div>
              <div style={{ ...styles.statCard, borderTop: '4px solid #F39C12' }}>
                <p style={styles.statValue}>{profile.studyDaysThisMonth}</p>
                <p style={styles.statLabel}>Study Days</p>
                <p style={styles.statSub}>This month</p>
              </div>
            </div>

            {/* Student Info */}
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Student Information</h3>
              <InfoRow label="Level"      value={profile.level} />
              <InfoRow label="Year Group" value={`Year ${profile.yearGroup}`} />
              <InfoRow label="Class"      value={profile.className || '—'} />
              {profile.shsTrack &&
                <InfoRow label="SHS Track" value={profile.shsTrack} />
              }
              <InfoRow
                label="Student Type"
                value={profile.studentType === 'school-linked'
                  ? '🏫 School-Linked' : '📱 Independent'}
              />
            </div>

            {/* School Info */}
            {profile.schoolName && (
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>School Information</h3>
                <InfoRow label="School"      value={profile.schoolName} />
                <InfoRow label="School Code" value={profile.schoolCode || '—'} />
              </div>
            )}

            {/* Monitoring Notice */}
            {profile.studentType === 'school-linked' && (
              <div style={styles.noticeCard}>
                <span style={{ fontSize: 24 }}>👁️</span>
                <div style={{ flex: 1 }}>
                  <p style={styles.noticeTitle}>Monitored Account</p>
                  <p style={styles.noticeSub}>
                    Your school can see your study activity and grades
                  </p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button style={styles.logoutBtn} onClick={handleLogout}>
              🚪 Logout
            </button>

            <p style={styles.footer}>
              AcePrep — Ace Your Exams. Change Your Future.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

const styles = {
  container:   { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:        { marginLeft: 235, flex: 1 },
  header:      { background: 'linear-gradient(135deg, #1A5276, #2E86AB)', padding: '32px 20px 28px', textAlign: 'center' },
  avatar:      { width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  avatarText:  { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name:        { fontSize: 22, fontWeight: 'bold', color: '#fff', margin: '0 0 4px' },
  email:       { fontSize: 13, color: '#AED6F1', margin: 0 },
  content:     { padding: 16 },
  center:      { textAlign: 'center', color: '#888', padding: 40 },
  statsRow:    { display: 'flex', gap: 12, marginBottom: 16 },
  statCard:    { flex: 1, background: '#fff', borderRadius: 10, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue:   { fontSize: 24, fontWeight: 'bold', color: '#1A5276', margin: 0 },
  statLabel:   { fontSize: 12, color: '#555', margin: '4px 0 0', fontWeight: 'bold' },
  statSub:     { fontSize: 10, color: '#888', margin: 0 },
  infoCard:    { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoTitle:   { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  infoRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  infoLabel:   { fontSize: 14, color: '#888' },
  infoValue:   { fontSize: 14, fontWeight: 'bold', color: '#1A5276' },
  noticeCard:  { background: '#FEF9E7', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 },
  noticeTitle: { fontSize: 14, fontWeight: 'bold', color: '#7D6608', margin: '0 0 4px' },
  noticeSub:   { fontSize: 12, color: '#7D6608', margin: 0 },
  logoutBtn:   { width: '100%', padding: 14, background: '#E74C3C', color: '#fff', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginBottom: 20, border: 'none' },
  footer:      { textAlign: 'center', fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 8 },
};

export default Profile;