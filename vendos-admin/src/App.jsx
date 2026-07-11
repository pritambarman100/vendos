import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/globals.css'
import Login       from './pages/Login'
import AppLayout   from './components/layout/AppLayout'
import Dashboard   from './pages/Dashboard'
import SlotManager from './pages/SlotManager'
import Analytics   from './pages/Analytics'
import Restock     from './pages/Restock'
import Settings    from './pages/Settings'
import SlotModal   from './components/slots/SlotModal'
import { useSlotStore } from './store/slotStore'

const App = () => {
  const [loggedIn,      setLoggedIn]      = useState(false)
  const [selectedSlot,  setSelectedSlot]  = useState(null)
  const [modalOpen,     setModalOpen]     = useState(false)

  const fetchSlots = useSlotStore(s => s.fetchSlots)
  const fetchStats = useSlotStore(s => s.fetchStats)
  const fetchSales = useSlotStore(s => s.fetchSales)
  const fetchMachines = useSlotStore(s => s.fetchMachines)

  useEffect(() => {
    if (loggedIn) {
      fetchMachines()
      fetchSlots()
      fetchStats()
      fetchSales()

      // Poll backend every 10 seconds to keep the dashboard live with customer purchases
      const timer = setInterval(() => {
        fetchMachines()
        fetchSlots()
        fetchStats()
        fetchSales()
      }, 10000)

      return () => clearInterval(timer)
    }
  }, [loggedIn, fetchSlots, fetchStats, fetchSales, fetchMachines])

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelectedSlot(null)
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout onAddSlot={() => handleSlotClick({ id: '', name: '', price: 0, stock: 0, max: 20, alertThreshold: 0.20, category: 'Other', status: 'off', enabled: true, isNew: true })} />}>
          <Route index              element={<Dashboard   onSlotClick={handleSlotClick} />} />
          <Route path="slots"       element={<SlotManager onSlotClick={handleSlotClick} />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="restock"     element={<Restock />} />
          <Route path="settings"    element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {modalOpen && (
        <SlotModal
          slot={selectedSlot}
          onClose={handleClose}
        />
      )}
    </BrowserRouter>
  )
}

export default App