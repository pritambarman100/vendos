import { useSlotStore } from '../store/slotStore';
import Badge  from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import styles from './Alerts.module.css';

const Alerts = () => {
  const navigate = useNavigate();
  const getEmptySlots = useSlotStore(s => s.getEmptySlots);
  const getLowSlots   = useSlotStore(s => s.getLowSlots);
  const emptySlots    = getEmptySlots();
  const lowSlots      = getLowSlots();

  const allAlerts = [
    ...emptySlots.map(s => ({ id: s.id, type: 'empty', title: `Slot ${s.id} is EMPTY`, sub: s.name, slot: s })),
    ...lowSlots.map(s =>   ({ id: s.id, type: 'low',   title: `Slot ${s.id} running low`, sub: `${s.name} · ${s.stock} of ${s.maxCapacity} left`, slot: s })),
  ];

  return (
    <div className={styles.page}>
      {allAlerts.length === 0 ? (
        <div className={styles.empty}>
          <span style={{fontSize:40}}>🎉</span>
          <p>No alerts right now!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {allAlerts.map(a => (
            <div key={a.id} className={[styles.item, styles[a.type]].join(' ')}>
              <div className={styles.icon}>{a.type === 'empty' ? '🔴' : '⚠️'}</div>
              <div className={styles.info}>
                <div className={styles.title}>{a.title}</div>
                <div className={styles.sub}>{a.sub}</div>
              </div>
              <Badge variant={a.type}>{a.type === 'empty' ? 'Empty' : 'Low'}</Badge>
              <Button size="sm" variant="ghost" onClick={() => navigate('/restock')}>Restock</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
