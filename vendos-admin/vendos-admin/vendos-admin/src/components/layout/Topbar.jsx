import { Menu, Bell, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSlotStore } from '../../store/slotStore';
import { todayLabel } from '../../utils/dateHelpers';
import Button from '../ui/Button';
import styles from './Topbar.module.css';

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',   sub: todayLabel() },
  '/slots':     { title: 'Slot Manager', sub: 'Configure all 20 product slots' },
  '/analytics': { title: 'Analytics',   sub: 'Sales performance & insights' },
  '/restock':   { title: 'Restock',     sub: 'Update stock counts after refilling' },
  '/alerts':    { title: 'Alerts',      sub: 'Machine notifications & warnings' },
  '/settings':  { title: 'Settings',    sub: 'Machine configuration & preferences' },
};

const Topbar = ({ onMenuClick, onAddSlot }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const alertCount = useSlotStore(s =>
    s.getEmptySlots().length + s.getLowSlots().length
  );
  const { title, sub } = PAGE_TITLES[pathname] || { title: '', sub: '' };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p  className={styles.sub}>{sub}</p>
        </div>
      </div>
      <div className={styles.right}>
        <button
          className={styles.alertBtn}
          onClick={() => navigate('/alerts')}
          aria-label="Alerts"
        >
          <Bell size={18} />
          {alertCount > 0 && <span className={styles.alertDot}>{alertCount}</span>}
        </button>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onAddSlot}
        >
          Add Product
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
