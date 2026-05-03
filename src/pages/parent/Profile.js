import React from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import { useAuth } from '../../context/AuthContext';

const ParentProfile = () => {
  const { user } = useAuth();

  return (
    <div style={styles.layout}>
      <ParentSidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 My Profile</h1>
          <p style={styles.subtitle}>Your parent account details</p>
        </div>
        <div style={styles.content}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user?.fullName?.charAt(0).toUpperCase() || 'P'}
            </div>
            <h2 style={styles.name}>{user?.fullName}</h2>
            <p style={styles.email}>{user?.email}</p>
            <p style={styles.role}>👨‍👩‍👧 Parent Account</p>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Account Information</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Full Name</span>
              <span style={styles.infoValue}>{user?.fullName || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user?.email || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phone</span>
              <span style={styles.infoValue}>{user?.phone || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Account Type</span>
              <span style={styles.infoValue}>Parent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout:     { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  main:       { marginLeft: 235, flex: 1 },
  header:     { background: 'linear-gradient(135deg, #7a0015, #CE1126)', padding: '28px 24px' },
  title:      { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 0 },
  subtitle:   { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:    { padding: 20, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 },
  profileCard:{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  avatar:     { width: 80, height: 80, borderRadius: 40, background: '#CE1126', color: '#fff', fontSize: 32, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  name:       { fontSize: 22, fontWeight: 'bold', color: '#1A5276', margin: '0 0 8px' },
  email:      { fontSize: 14, color: '#888', margin: '0 0 8px' },
  role:       { fontSize: 14, color: '#CE1126', fontWeight: 'bold', margin: 0 },
  infoCard:   { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoTitle:  { fontSize: 16, fontWeight: 'bold', color: '#1A5276', margin: '0 0 16px' },
  infoRow:    { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  infoLabel:  { fontSize: 14, color: '#888' },
  infoValue:  { fontSize: 14, color: '#333', fontWeight: 'bold' },
};

export default ParentProfile;