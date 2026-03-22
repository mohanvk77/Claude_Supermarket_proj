import React from 'react';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const StatCard = ({ title, value, icon, color, trend, trendLabel, subtitle }) => {
  const isPositive = parseFloat(trend) >= 0;

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
      <div style={styles.top}>
        <div>
          <p style={styles.title}>{title}</p>
          <p style={styles.value}>{value}</p>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={{ ...styles.iconBox, background: color + '20' }}>
          {React.cloneElement(icon, { size: 24, color })}
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div style={styles.trend}>
          {isPositive ? <MdTrendingUp color="#22c55e" size={16} /> : <MdTrendingDown color="#ef4444" size={16} />}
          <span style={{ color: isPositive ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span style={styles.trendLabel}>{trendLabel || 'vs yesterday'}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  value: { fontSize: 26, fontWeight: 700, color: '#1e293b', marginTop: 4, fontFamily: 'Poppins, sans-serif' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trend: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 },
  trendLabel: { fontSize: 12, color: '#94a3b8' },
};

export default StatCard;
