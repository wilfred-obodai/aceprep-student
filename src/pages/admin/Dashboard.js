import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/AdminSidebar';
import SummaryCard from '../../components/SummaryCard';
import { getSchoolProfile, getSchoolMonitoring } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaUserCheck, FaBookOpen, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile,    setProfile]    = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, monitoringRes] = await Promise.all([
          getSchoolProfile(),
          getSchoolMonitoring(),
        ]);
        setProfile(profileRes.data.school);
        setMonitoring(monitoringRes.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <p style={styles.loading}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>

        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.schoolName}>
              {profile?.name || 'School Dashboard'}
            </h1>
            <p style={styles.schoolInfo}>
              {profile?.city}, {profile?.region} &nbsp;|&nbsp;
              School Code: <strong>{profile?.code}</strong>
            </p>
          </div>
          <div style={styles.welcome}>
            <p style={styles.welcomeText}>Welcome back,</p>
            <p style={styles.welcomeName}>{user?.fullName}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.cards}>
          <SummaryCard
            title="Total Students"
            value={monitoring?.summary?.totalStudents || 0}
            icon={<FaUsers />}
            color="#2E86AB"
            subtitle="Registered with school code"
          />
          <SummaryCard
            title="Active Now"
            value={monitoring?.summary?.activeNow || 0}
            icon={<FaUserCheck />}
            color="#27AE60"
            subtitle="Currently studying"
          />
          <SummaryCard
            title="Studied Today"
            value={monitoring?.summary?.studiedToday || 0}
            icon={<FaBookOpen />}
            color="#F39C12"
            subtitle="Logged in today"
          />
          <SummaryCard
            title="Need Attention"
            value={monitoring?.summary?.neverLoggedIn || 0}
            icon={<FaExclamationTriangle />}
            color="#E74C3C"
            subtitle="Never logged in"
          />
        </div>

        {/* Recent Student Activity */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Student Activity Overview</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Study Time (Week)</th>
                  <th style={styles.th}>Sessions</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {monitoring?.students?.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.empty}>
                      No students registered yet
                    </td>
                  </tr>
                ) : (
                  monitoring?.students?.map(s => (
                    <tr key={s.id} style={styles.tr}>
                      <td style={styles.td}>
                        <p style={styles.name}>{s.fullName}</p>
                        <p style={styles.email}>{s.email}</p>
                      </td>
                      <td style={styles.td}>{s.level}</td>
                      <td style={styles.td}>{s.className || '—'}</td>
                      <td style={styles.td}>
                        {s.lastLogin
                          ? new Date(s.lastLogin).toLocaleDateString()
                          : '—'}
                      </td>
                      <td style={styles.td}>
                        {s.studyMinutesThisWeek} mins
                      </td>
                      <td style={styles.td}>{s.totalSessions}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: s.isActiveNow ? '#EAFAF1' : '#F9EBEA',
                          color:      s.isActiveNow ? '#27AE60' : '#E74C3C',
                        }}>
                          {s.isActiveNow ? '🟢 Active' : '⚪ Offline'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f4f8',
  },
  main: {
    marginLeft: 240,
    flex: 1,
    padding: '32px 28px',
  },
  loading: {
    color: '#888',
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  schoolName: {
    fontSize: 26,
    color: '#1A5276',
    fontWeight: 'bold',
  },
  schoolInfo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  welcome: {
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 13,
    color: '#888',
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A5276',
  },
  cards: {
    display: 'flex',
    gap: 20,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  section: {
    background: '#ffffff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A5276',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    background: '#EAF4FB',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 13,
    color: '#1A5276',
    fontWeight: 'bold',
    borderBottom: '2px solid #2E86AB',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    color: '#333',
  },
  name: {
    fontWeight: 'bold',
    color: '#1A5276',
  },
  email: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#888',
  },
};

export default Dashboard;