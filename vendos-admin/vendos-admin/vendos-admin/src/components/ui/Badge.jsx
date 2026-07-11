import styles from './Badge.module.css';

const Badge = ({ children, variant = 'default', size = 'md' }) => (
  <span className={[styles.badge, styles[variant], styles[size]].join(' ')}>
    {children}
  </span>
);

export default Badge;
