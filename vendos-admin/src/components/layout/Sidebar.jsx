import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Grid2X2, BarChart2,
  PackagePlus, Bell, Settings, Zap
} from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/slots',     icon: Grid2X2,         label: 'Slot Manager' },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics'   },
  { to: '/restock',   icon: PackagePlus,      label: 'Restock',  badge: 'restock' },
  { to: '/settings',  icon: Settings,         label: 'Settings'  },
]

const Sidebar = ({ onClose }) => {
  const slots = useSlotStore(s => s.slots)
  const activeMachineId = useSlotStore(s => s.activeMachineId)
  const setActiveMachineId = useSlotStore(s => s.setActiveMachineId)
  const machines = useSlotStore(s => s.machines)

  const slotsArray = Object.values(slots)
  const emptySlots = slotsArray.filter(s => s.enabled && s.name && (s.stock === 0 || s.status === 'empty'))
  const lowSlots   = slotsArray.filter(s => s.enabled && s.name && s.status === 'low')

  const alertCount   = emptySlots.length + lowSlots.length
  const restockCount = emptySlots.length

  const activeMachine = machines.find(m => m.machine_id === activeMachineId) || {
    machine_id: activeMachineId,
    name: 'Offline',
    location: 'Loading...',
    status: 'offline'
  }

  const getDotColor = (status) => {
    if (status === 'online') return 'var(--success)'
    if (status === 'maintenance') return 'var(--warn)'
    return 'var(--text-muted)'
  }

  const getBadge = (key) => {
    if (key === 'alerts'  && alertCount   > 0) return alertCount
    if (key === 'restock' && restockCount > 0) return restockCount
    return null
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={18} color="#0C0C0F" fill="#0C0C0F" />
        </div>
        <div>
          <div className={styles.logoText}>VendOS</div>
          <div className={styles.logoSub}>Machine Admin</div>
        </div>
      </div>

      {machines.length > 0 && (
        <div className={styles.machineSelector}>
          <label className={styles.selectorLabel}>Active Machine</label>
          <select
            value={activeMachineId}
            onChange={(e) => setActiveMachineId(e.target.value)}
            className={styles.selectorSelect}
          >
            {machines.map(m => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_id} - {m.name || 'VendOS Machine'}
              </option>
            ))}
          </select>
        </div>
      )}

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

      <div className={styles.footer}>
        <div className={styles.status}>
          <span 
            className={styles.dot} 
            style={{ backgroundColor: getDotColor(activeMachine.status) }}
          />
          <div>
            <div className={styles.statusText} style={{ textTransform: 'capitalize' }}>
              {activeMachine.machine_id} ({activeMachine.status})
            </div>
            <div className={styles.statusSub}>{activeMachine.name || activeMachine.location}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar