import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
}) => (
  <button
    type={type}
    className={[
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth ? styles.full : '',
    ].join(' ')}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <span className={styles.icon}>{icon}</span>}
    {children}
  </button>
);

export default Button;
