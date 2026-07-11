import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import styles from './Login.module.css';

const Login = () => {
  const login = useAuthStore(s => s.login);
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');

  const handleLogin = () => {
    const ok = login(email, password);
    if (!ok) setError('Invalid email or password');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={20} color="#0C0C0F" fill="#0C0C0F"/></div>
          <span className={styles.logoText}>VendOS</span>
        </div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p  className={styles.sub}>Sign in to manage your machine</p>
        <div className={styles.hint}>Email: admin@vendos.com · Pass: admin123</div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} type="email" placeholder="admin@vendos.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input className={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => { setPass(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button variant="primary" fullWidth onClick={handleLogin}>Sign In</Button>
      </div>
    </div>
  );
};

export default Login;
