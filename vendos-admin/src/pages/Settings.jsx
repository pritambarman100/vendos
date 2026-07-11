import { useState, useEffect } from 'react'
import { AlertTriangle, Lock, RefreshCw, Trash2, X } from 'lucide-react'
import { useSlotStore } from '../store/slotStore'
import styles from './Settings.module.css'

const Settings = () => {
  const activeMachineId = useSlotStore(s => s.activeMachineId)
  const machines = useSlotStore(s => s.machines)
  const addMachine = useSlotStore(s => s.addMachine)
  const updateMachine = useSlotStore(s => s.updateMachine)
  const deleteMachine = useSlotStore(s => s.deleteMachine)
  const resetSystem = useSlotStore(s => s.resetSystem)

  // Dynamic machine search
  const activeMachine = machines.find(m => m.machine_id === activeMachineId) || {
    machine_id: activeMachineId,
    name: '',
    location: '',
    upi_id: 'owner@upi'
  }

  const [editedName, setEditedName] = useState('')
  const [editedLocation, setEditedLocation] = useState('')
  const [editedUpi, setEditedUpi] = useState('')

  useEffect(() => {
    if (activeMachine) {
      setEditedName(activeMachine.name || '')
      setEditedLocation(activeMachine.location || '')
      setEditedUpi(activeMachine.upi_id || 'owner@upi')
    }
  }, [activeMachineId, activeMachine.name, activeMachine.location, activeMachine.upi_id])

  const [notifs, setNotifs] = useState({
    empty: true, low: true, sale: false, report: true
  })

  // Modal local states
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [decommissionModalOpen, setDecommissionModalOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmTextInput, setConfirmTextInput] = useState('')
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
  const [isProcessing, setIsProcessing] = useState(false)

  const toggle = (key) =>
    setNotifs(n => ({ ...n, [key]: !n[key] }))

  // Modals management
  const handleOpenResetModal = () => {
    setPasswordInput('')
    setConfirmTextInput('')
    setStatusMessage({ type: '', text: '' })
    setResetModalOpen(true)
  }

  const handleOpenDecommissionModal = () => {
    setPasswordInput('')
    setConfirmTextInput('')
    setStatusMessage({ type: '', text: '' })
    setDecommissionModalOpen(true)
  }

  const handleCloseModals = () => {
    if (isProcessing) return
    setResetModalOpen(false)
    setDecommissionModalOpen(false)
  }

  const handleSaveSettings = async () => {
    try {
      await updateMachine(activeMachineId, {
        name: editedName.trim(),
        location: editedLocation.trim(),
        status: activeMachine.status || 'online',
        upi_id: editedUpi.trim()
      })
      alert('Settings saved successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to save settings.')
    }
  }

  const handleExecuteReset = async () => {
    setIsProcessing(true)
    setStatusMessage({ type: 'info', text: 'Connecting to database engine...' })
    
    const result = await resetSystem(activeMachineId, passwordInput, confirmTextInput)
    
    setIsProcessing(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Wipe complete! Vending machine data has been reset to zero.' })
      setTimeout(() => {
        setResetModalOpen(false)
      }, 2000)
    } else {
      setStatusMessage({ type: 'error', text: result.message || 'Wipe failed. Please check your admin password.' })
    }
  }

  const handleExecuteDecommission = async () => {
    setIsProcessing(true)
    setStatusMessage({ type: 'info', text: 'Processing decommission...' })
    
    try {
      await deleteMachine(activeMachineId)
      setStatusMessage({ type: 'success', text: `Machine ${activeMachineId} and all associated data deleted successfully!` })
      setTimeout(() => {
        setDecommissionModalOpen(false)
      }, 2000)
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Decommission failed.' })
      setIsProcessing(false)
    }
  }

  const isResetConfirmDisabled = !passwordInput || confirmTextInput !== "RESET VENDOS ENGINE" || isProcessing
  const isDecommissionConfirmDisabled = !passwordInput || confirmTextInput !== `DELETE ${activeMachineId}` || isProcessing

  if (machines.length === 0 || !activeMachineId) {
    return (
      <div className={styles.lockedSettingsPlaceholder}>
        <div className={styles.placeholderCard}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <h2>No Vending Machine Selected</h2>
          <p>⚠️ No Vending Machine Selected. Please register or select a machine first to manage its settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.leftColumn}>
        {/* Machine Details panel */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Vending Machine Profile</h3>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.field}>
              <label className={styles.label}>Machine Identifier (Read-only)</label>
              <input className={styles.input} value={activeMachineId} disabled style={{ opacity: 0.65, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.03)' }} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Friendly Name</label>
              <input 
                className={styles.input} 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)} 
                placeholder="e.g. Library Lobby" 
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Physical Location</label>
              <input 
                className={styles.input} 
                value={editedLocation} 
                onChange={e => setEditedLocation(e.target.value)} 
                placeholder="e.g. Floor 2, Block B" 
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>UPI Gateway ID</label>
              <input 
                className={styles.input} 
                value={editedUpi} 
                onChange={e => setEditedUpi(e.target.value)} 
                placeholder="e.g. name@upi" 
              />
            </div>
          </div>
        </div>

        {/* Decommission & Delete Machine Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
              <Trash2 size={15} color="var(--danger)" /> Decommission Vending Machine
            </h3>
          </div>
          <div className={styles.panelBody}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              Decommissioning a machine will permanently delete the machine profile, all associated vending chambers (slots), and sales history from the database. <strong>This action is irreversible.</strong>
            </p>
            <button className={styles.dangerBtn} onClick={handleOpenDecommissionModal}>
              Decommission Machine
            </button>
          </div>
        </div>
      </div>

      <div className={styles.rightColumn}>
        {/* Notifications rules panel */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Telegram Notification Rules</h3>
          </div>
          <div className={styles.panelBody}>
            {[
              ['empty',  'Notify instantly on empty slot (0 stock)'],
              ['low',    'Notify when stocks fall below set alert threshold'],
              ['sale',   'Ping on every successful mobile sale'],
              ['report', 'Send daily business report at 9:00 PM'],
            ].map(([key, label]) => (
              <div key={key} className={styles.toggleRow}>
                <span className={styles.toggleLabel}>{label}</span>
                <div
                  className={[styles.toggle, notifs[key] ? styles.on : ''].join(' ')}
                  onClick={() => toggle(key)}
                >
                  <div className={styles.thumb} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Factory Purge Panel (Security Reset) with Save Settings nested inside */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={15} color="var(--accent)" /> System Maintenance & Restart
            </h3>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.resetContainer}>
              <div className={styles.resetLeft}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  Resets database operational records (clears sales history) and resets all product stock counts to zero. Use this for general maintenance, product turnovers, or seasonal re-configurations.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  <button className={styles.resetBtn} onClick={handleOpenResetModal}>
                    Initialize System Reset
                  </button>
                  <button className={styles.saveBtn} onClick={handleSaveSettings}>
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Double Verification Purge Modal */}
      {resetModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModals}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={16} /> Confirm System Reset
              </h3>
              <button 
                className={styles.modalCancelBtn} 
                onClick={handleCloseModals}
                disabled={isProcessing}
                style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <p className={styles.modalText}>
              This will clear all sales records and reset all vending stock levels to zero. <strong>This action cannot be undone.</strong>
            </p>

            {/* Input 1: Admin Password */}
            <div className={styles.field} style={{ marginTop: 5 }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={12} /> Enter Admin Password
              </label>
              <input
                className={styles.modalInput}
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Input 2: Literal Confirmation String */}
            <div className={styles.field}>
              <label className={styles.label}>
                Type confirmation phrase: <span style={{ color: 'var(--text)', fontStyle: 'italic', textDecoration: 'underline' }}>RESET VENDOS ENGINE</span>
              </label>
              <input
                className={styles.modalInput}
                type="text"
                placeholder="RESET VENDOS ENGINE"
                value={confirmTextInput}
                onChange={e => setConfirmTextInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Status alerts */}
            {statusMessage.text && (
              <div style={{
                fontSize: 12,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: statusMessage.type === 'error' ? 'rgba(245,199,93,0.1)' : statusMessage.type === 'success' ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.05)',
                color: statusMessage.type === 'error' ? 'var(--warn)' : statusMessage.type === 'success' ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${statusMessage.type === 'error' ? 'rgba(245,199,93,0.2)' : statusMessage.type === 'success' ? 'rgba(46,204,113,0.2)' : 'var(--border)'}`
              }}>
                {statusMessage.text}
              </div>
            )}

            {/* Modal Actions */}
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn} 
                onClick={handleCloseModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={styles.modalConfirmBtn}
                onClick={handleExecuteReset}
                disabled={isResetConfirmDisabled}
              >
                {isProcessing ? 'Resetting...' : 'Perform Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Verification Decommission Modal */}
      {decommissionModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModals}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
                <Trash2 size={16} /> Confirm Decommission Machine
              </h3>
              <button 
                className={styles.modalCancelBtn} 
                onClick={handleCloseModals}
                disabled={isProcessing}
                style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <p className={styles.modalText}>
              This will permanently decommission and delete the machine <strong>{activeMachineId}</strong>, including all of its vending chambers (slots) and sales history from the database. <strong>This action is irreversible.</strong>
            </p>

            {/* Input 1: Admin Password */}
            <div className={styles.field} style={{ marginTop: 5 }}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={12} /> Enter Admin Password
              </label>
              <input
                className={styles.modalInput}
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Input 2: Literal Confirmation String */}
            <div className={styles.field}>
              <label className={styles.label}>
                Type confirmation phrase: <span style={{ color: 'var(--text)', fontStyle: 'italic', textDecoration: 'underline' }}>DELETE {activeMachineId}</span>
              </label>
              <input
                className={styles.modalInput}
                type="text"
                placeholder={`DELETE ${activeMachineId}`}
                value={confirmTextInput}
                onChange={e => setConfirmTextInput(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Status alerts */}
            {statusMessage.text && (
              <div style={{
                fontSize: 12,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: statusMessage.type === 'error' ? 'rgba(245,199,93,0.1)' : statusMessage.type === 'success' ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.05)',
                color: statusMessage.type === 'error' ? 'var(--warn)' : statusMessage.type === 'success' ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${statusMessage.type === 'error' ? 'rgba(245,199,93,0.2)' : statusMessage.type === 'success' ? 'rgba(46,204,113,0.2)' : 'var(--border)'}`
              }}>
                {statusMessage.text}
              </div>
            )}

            {/* Modal Actions */}
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn} 
                onClick={handleCloseModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={styles.modalConfirmBtn}
                onClick={handleExecuteDecommission}
                disabled={isDecommissionConfirmDisabled}
                style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
              >
                {isProcessing ? 'Decommissioning...' : 'Perform Decommission'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Settings