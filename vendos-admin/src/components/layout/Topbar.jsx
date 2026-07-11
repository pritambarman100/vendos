import { useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

const TITLES = {
  '/':          'Dashboard',
  '/slots':     'Slot Manager',
  '/analytics': 'Analytics',
  '/restock':   'Restock',
  '/settings':  'Settings',
}

const Topbar = ({ onMenuClick, onAddSlot }) => {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'VendOS'

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <button className={styles.addBtn} onClick={onAddSlot}>
          + Add Product
        </button>
      </div>
    </header>
  )
}

export default Topbar