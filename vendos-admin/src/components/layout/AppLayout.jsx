import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import styles  from './AppLayout.module.css'

const AppLayout = ({ onAddSlot }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={[
        styles.sidebarWrap,
        sidebarOpen ? styles.open : ''
      ].join(' ')}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className={styles.main}>
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddSlot={onAddSlot}
        />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout