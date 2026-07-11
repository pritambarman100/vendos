import styles from './Toggle.module.css';

const Toggle = ({ checked, onChange, label }) => (
  <label className={styles.wrap}>
    {label && <span className={styles.label}>{label}</span>}
    <div
      className={[styles.track, checked ? styles.on : ''].join(' ')}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
    >
      <div className={styles.thumb} />
    </div>
  </label>
);

export default Toggle;
