import React from 'react';

const SummaryCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.top}>
        <div>
          <p style={styles.title}>{title}</p>
          <h2 style={{ ...styles.value, color }}>{value}</h2>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{ ...styles.icon, background: `${color}22` }}>
          <span style={{ color, fontSize: 24 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: 10,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: 180,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default SummaryCard;