import { useState } from 'react';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import styles from './Settings.module.css';

const Settings = () => {
  const [notifs, setNotifs] = useState({ empty: true, low: true, sale: false, report: true });
  const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}><h3 className={styles.panelTitle}>Machine Info</h3></div>
        <div className={styles.panelBody}>
          {[
            ['Machine Name',    'VM-01 Campus Canteen'],
            ['Location',        'Block A, Ground Floor'],
            ['UPI ID',          'owner@upi'],
            ['Telegram Chat ID','@vendos_alerts'],
          ].map(([label, val]) => (
            <div key={label} className={styles.field}>
              <label className={styles.label}>{label}</label>
              <input className={styles.input} defaultValue={val} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}><h3 className={styles.panelTitle}>Notifications</h3></div>
        <div className={styles.panelBody}>
          {[
            ['empty',  'Empty slot alerts'],
            ['low',    'Low stock warnings'],
            ['sale',   'Every sale notification'],
            ['report', 'Daily report at 9 PM'],
          ].map(([key, label]) => (
            <div key={key} className={styles.toggleRow}>
              <Toggle checked={notifs[key]} onChange={() => toggle(key)} label={label} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
