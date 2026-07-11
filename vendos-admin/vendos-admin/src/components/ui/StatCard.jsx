import styles from './StatCard.module.css';

const StatCard = ({ label, value, change, changeType = 'neutral', accent }) => (
  <div className={styles.card}>
    <div className={styles.label}>{label}</div>
    <div className={styles.value} style={accent ? { color: accent } : {}}>
      {value}
    </div>
    {change && (
      <div className={[styles.change, styles[changeType]].join(' ')}>
        {change}
      </div>
    )}
  </div>
);

export default StatCard;
