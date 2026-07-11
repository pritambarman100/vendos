import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Grid2X2, BarChart2,
  PackagePlus, Bell, Settings, Zap,
} from 'lucide-react';
import { useSlotStore } from '../../store/slotStore';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/slots',     icon: Grid2X2,         label: 'Slot Manager' },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics' },
  { to: '/restock',   icon: PackagePlus,      label: 'Restock',  badge: 'restock' },
  { to: '/alerts',    icon: Bell,             label: 'Alerts',   badge: 'alerts' },
  { to: '/settings',  icon: Settings,         label: 'Settings' },
];

const Sidebar = ({ onClose }) => {
  const getEmptySlots = useSlotStore(s => s.getEmptySlots);
  const getLowSlots   = useSlotStore(s => s.getLowSlots);
  const alertCount    = getEmptySlots().length + getLowSlots().length;
  const restockCount  = getEmptySlots().length;

  const getBadge = (key) => {
    if (key === 'alerts'  && alertCount  > 0) return alertCount;
    if (key === 'restock' && restockCount > 0) return restockCount;
    return null;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Zap size={18} color="#0C0C0F" fill="#0C0C0F" /></div>
        <div>
          <div className={styles.logoText}>VendOS</div>
          <div className={styles.logoSub}>Machine Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.active : ''].join(' ')
            }
            onClick={onClose}
          >
            <Icon size={16} />
            <span className={styles.label}>{label}</span>
            {badge && getBadge(badge) ? (
              <span className={styles.badge}>{getBadge(badge)}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {/* Machine status */}
      <div className={styles.footer}>
        <div className={styles.status}>
          <span className={styles.dot} />
          <div>
            <div className={styles.statusText}>VM-01 Online</div>
            <div className={styles.statusSub}>Campus Canteen</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
