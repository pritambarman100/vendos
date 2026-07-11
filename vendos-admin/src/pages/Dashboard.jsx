import { useState } from 'react'
import { X, Package, Tag, Grid, Percent, Info, Settings, Trash2, Plus, Cpu, PackagePlus, Bell } from 'lucide-react'
import { useSlotStore } from '../store/slotStore'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import styles from './Dashboard.module.css'

const EMOJIS = {
  Drinks: '🥤', Snacks: '🍟',
  Food: '🍱', Other: '📦', Stationery: '✏️'
}

// Helper to parse SQLite DATETIME (YYYY-MM-DD HH:MM:SS) and format to local time
const formatSaleTime = (timestampStr) => {
  if (!timestampStr) return '';
  const parts = timestampStr.split(/[- :]/);
  if (parts.length < 5) return timestampStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const minute = parseInt(parts[4], 10);
  
  const date = new Date(year, month, day, hour, minute);
  if (isNaN(date.getTime())) return timestampStr;
  
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

const getGridStyle = (slotId) => {
  if (!slotId) return {}
  const rowLetter = slotId.charAt(0).toUpperCase()
  const colNumber = parseInt(slotId.slice(1), 10)
  const rowNumber = rowLetter.charCodeAt(0) - 64
  
  return {
    gridRow: (rowNumber >= 1 && rowNumber <= 26) ? rowNumber : 'auto',
    gridColumn: colNumber || 'auto'
  }
}

const SlotCard = ({ slot, onClick }) => {
  const pct = Math.round((slot.stock / slot.max) * 100)
  const barColor =
    slot.status === 'ok'    ? 'var(--success)' :
    slot.status === 'low'   ? 'var(--warn)'    :
    slot.status === 'empty' ? 'var(--danger)'  : 'var(--border)'

  const isUnassigned = !slot.name;

  if (isUnassigned) {
    return (
      <div
        className={[styles.slotCard, styles.unassigned].join(' ')}
        onClick={() => onClick(slot)}
        style={getGridStyle(slot.id)}
      >
        <div className={styles.slotTop}>
          <span className={styles.slotId}>{slot.id}</span>
        </div>
        <div className={styles.slotEmojiUnassigned}>
          <Plus size={24} color="var(--text-muted)" />
        </div>
        <div className={styles.slotNameUnassigned}>
          Empty Chamber
        </div>
        <div className={styles.slotEmptyDesc}>
          Click to configure
        </div>
      </div>
    )
  }

  return (
    <div
      className={[styles.slotCard, styles[slot.status]].join(' ')}
      onClick={() => onClick(slot)}
      style={getGridStyle(slot.id)}
    >
      <div className={styles.slotTop}>
        <span className={styles.slotId}>{slot.id}</span>
        <span className={[
          styles.badge,
          slot.status === 'empty' ? styles.badgeDanger :
          slot.status === 'low'   ? styles.badgeWarn   :
          slot.status === 'off'   ? styles.badgeOff    :
          styles.badgeOk
        ].join(' ')}>
          {slot.status === 'empty' ? 'Empty' :
           slot.status === 'low'   ? 'Low'   :
           slot.status === 'off'   ? 'Off'   : 'OK'}
        </span>
      </div>
      <div className={styles.slotEmoji}>
        {slot.image ? (
          <img src={slot.image} alt={slot.name} className={styles.slotImgTile} />
        ) : (
          EMOJIS[slot.category] || '📦'
        )}
      </div>
      <div className={styles.slotName}>
        {slot.name}
      </div>
      <div className={styles.slotPrice}>
        {slot.price > 0 ? `₹${slot.price}` : '—'}
      </div>
      <div className={styles.barWrap}>
        <div
          className={styles.bar}
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <div className={styles.slotCount}>
        {slot.stock}/{slot.max}
      </div>
    </div>
  )
}

const getAvailableMachineIds = (machinesList) => {
  const ids = (machinesList || []).map(m => m.machine_id || '');
  const nums = [];
  ids.forEach(id => {
    const match = id.match(/VM-(\d+)/i) || id.match(/VM(\d+)/i) || id.match(/(\d+)/);
    if (match) {
      nums.push(parseInt(match[1], 10));
    }
  });

  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const available = [];
  
  // Find gaps from 1 to maxNum
  for (let i = 1; i <= maxNum; i++) {
    if (!nums.includes(i)) {
      const padded = i < 10 ? `0${i}` : `${i}`;
      available.push(`VM-${padded}`);
    }
  }
  
  // Add next sequential
  const nextNum = maxNum + 1;
  const nextPadded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  available.push(`VM-${nextPadded}`);
  
  return available;
};

const Dashboard = ({ onSlotClick }) => {
  const slots = useSlotStore(s => s.slots)
  const stats = useSlotStore(s => s.stats)
  const sales = useSlotStore(s => s.sales)
  const machines = useSlotStore(s => s.machines)
  const activeMachineId = useSlotStore(s => s.activeMachineId)
  const setActiveMachineId = useSlotStore(s => s.setActiveMachineId)
  const addMachine = useSlotStore(s => s.addMachine)
  const deleteMachine = useSlotStore(s => s.deleteMachine)
  const reorderMachines = useSlotStore(s => s.reorderMachines)

  const handleDragEnd = (result) => {
    if (!result.destination) return
    const items = Array.from(machines)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    reorderMachines(items.map(m => m.machine_id))
  }

  const allSlots = Object.values(slots)

  // Drawer local state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)

  // Add machine form local state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMachineId, setNewMachineId] = useState('')
  const [newMachineName, setNewMachineName] = useState('')
  const [newMachineLoc, setNewMachineLoc] = useState('')
  const [newMachineStatus, setNewMachineStatus] = useState('online')
  const [newMachineUpi, setNewMachineUpi] = useState('owner@upi')

  const handleToggleAddForm = () => {
    const nextShow = !showAddForm;
    setShowAddForm(nextShow);
    if (nextShow) {
      const opts = getAvailableMachineIds(machines);
      setNewMachineId(opts[0] || 'VM-01');
    }
  };

  const handleAddMachineSubmit = (e) => {
    e.preventDefault()
    let cleanId = newMachineId.trim().toUpperCase()
    if (!cleanId) return
    
    // Auto-formatting and validating machine ID
    if (!cleanId.startsWith('VM-')) {
      const numMatch = cleanId.match(/^(\d+)$/)
      if (numMatch) {
        const num = parseInt(numMatch[1], 10)
        cleanId = `VM-${num < 10 ? '0' + num : num}`
      } else {
        alert("Machine ID must start with 'VM-' followed by a number (e.g. VM-02)!")
        return
      }
    }
    
    // Check for duplicate machine ID
    if (machines.some(m => m.machine_id === cleanId)) {
      alert(`Machine ID ${cleanId} already exists!`)
      return
    }

    addMachine({
      machine_id: cleanId,
      name: newMachineName.trim(),
      location: newMachineLoc.trim(),
      status: newMachineStatus,
      upi_id: newMachineUpi.trim()
    })
    setNewMachineId('')
    setNewMachineName('')
    setNewMachineLoc('')
    setNewMachineStatus('online')
    setNewMachineUpi('owner@upi')
    setShowAddForm(false)
  }

  const handleTileClick = (slot) => {
    setActiveSlot(slot)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  const getPercentageStock = (slot) => {
    if (!slot) return 0
    return Math.round((slot.stock / slot.max) * 100)
  }

  const getProgressColor = (slot) => {
    if (!slot) return 'var(--border)'
    if (slot.status === 'ok') return 'var(--success)'
    if (slot.status === 'low') return 'var(--warn)'
    return 'var(--danger)'
  }

  return (
    <div className={styles.page}>

      {/* Vending Network Panel */}
      <div className={styles.networkPanel}>
        <div className={styles.networkHeader}>
          <h2 className={styles.networkTitle}>
            <Cpu size={16} color="var(--accent)" />
            Connected Vending Network ({machines.length} Active Controllers)
          </h2>
          <button 
            className={styles.addBtn}
            onClick={handleToggleAddForm}
          >
            <Plus size={14} /> Add Vending Machine
          </button>
        </div>

        {showAddForm && (
          <form className={styles.modalFormWrap} onSubmit={handleAddMachineSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Machine ID</label>
                <select 
                  className={styles.formInput} 
                  value={newMachineId} 
                  onChange={e => setNewMachineId(e.target.value)}
                  style={{ background: 'var(--surface)', color: 'var(--text)' }}
                >
                  {getAvailableMachineIds(machines).map(id => {
                    const maxMachineNum = machines.reduce((max, m) => {
                      const match = m.machine_id.match(/VM-(\d+)/i);
                      const num = match ? parseInt(match[1], 10) : 0;
                      return num > max ? num : max;
                    }, 0);
                    const matchId = id.match(/VM-(\d+)/i);
                    const isRecycled = matchId ? parseInt(matchId[1], 10) < maxMachineNum : false;
                    return (
                      <option key={id} value={id}>
                        {id} {isRecycled ? ' (Recycled / Empty Slot)' : ' (Next Sequential)'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Friendly Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Library Lobby" 
                  className={styles.formInput} 
                  value={newMachineName} 
                  onChange={e => setNewMachineName(e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Physical Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Floor 2, Block B" 
                  className={styles.formInput} 
                  value={newMachineLoc} 
                  onChange={e => setNewMachineLoc(e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gateway UPI ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. name@upi" 
                  className={styles.formInput} 
                  value={newMachineUpi} 
                  onChange={e => setNewMachineUpi(e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Operational Status</label>
                <select 
                  className={styles.formInput} 
                  value={newMachineStatus} 
                  onChange={e => setNewMachineStatus(e.target.value)}
                  style={{ background: 'var(--surface)', color: 'var(--text)' }}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.formBtnCancel} onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className={styles.formBtnSubmit}>Register Machine</button>
            </div>
          </form>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="machines" direction="horizontal">
            {(provided) => (
              <div 
                className={styles.networkGrid}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {machines.map((m, index) => {
                  const isActive = m.machine_id === activeMachineId;
                  const statusClass = 
                    m.status === 'online' ? styles.statusOnline :
                    m.status === 'offline' ? styles.statusOffline :
                    styles.statusMaintenance;
                  
                  return (
                    <Draggable key={m.machine_id} draggableId={m.machine_id} index={index}>
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={[styles.machineCard, isActive ? styles.machineCardActive : ''].join(' ')}
                          onClick={() => setActiveMachineId(m.machine_id)}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className={styles.machineMeta}>
                            <div className={styles.machineNameWrap}>
                              <span className={styles.machineId}>{m.machine_id}</span>
                              <span className={styles.machineName}>{m.name || 'VendOS Machine'}</span>
                            </div>
                            <span className={[styles.statusPill, statusClass].join(' ')}>
                              ● {m.status}
                            </span>
                          </div>

                          <div className={styles.machineFooter}>
                            <span className={styles.machineLoc}>{m.location || 'No location set'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className={styles.miniStatSimple} title="Empty Chambers" style={{ color: (m.emptyCount || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                <PackagePlus size={12} />
                                <span className={styles.miniCount}>{m.emptyCount || 0}</span>
                              </div>
                              <div className={styles.miniStatSimple} title="Low Stock Alerts" style={{ color: (m.lowCount || 0) > 0 ? 'var(--warn)' : 'var(--text-muted)' }}>
                                <Bell size={12} />
                                <span className={styles.miniCount}>{m.lowCount || 0}</span>
                              </div>

                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Summary Stats Grid (Live Backend Calculations) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue} style={{ color: 'var(--accent)' }}>
            ₹{Number(stats.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--text-muted)' }}>
            Calculated live from database
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Units Dispensed</div>
          <div className={styles.statValue}>
            {stats.items_sold}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--success)' }}>
            Success transactions logged
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Low Stock Alerts</div>
          <div className={styles.statValue} style={{ color: 'var(--warn)' }}>
            {stats.low_slots}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--text-muted)' }}>
            Needs restocking soon
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Empty Chambers</div>
          <div className={styles.statValue} style={{ color: 'var(--danger)' }}>
            {stats.empty_slots}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--danger)' }}>
            Losing sales opportunity
          </div>
        </div>
      </div>

      {/* Slot Overview Grid */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Vending Chambers Overview</h2>
        </div>
        {machines.length === 0 || !activeMachineId ? (
          <div className={styles.lockedGridPlaceholder}>
            <span style={{ fontSize: 32 }}>⚠️</span>
            <h3>Vending Chambers Locked</h3>
            <p>Please register or select a vending machine first to manage its slots.</p>
          </div>
        ) : (
          <div className={styles.slotGrid}>
            {allSlots.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onClick={handleTileClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Recent Sales Activity</h3>
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>● Connected Live</span>
        </div>
        {sales.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No recent sales transactions recorded.
          </div>
        ) : (
          sales.slice(0, 5).map(s => (
            <div key={s.id} className={styles.saleRow}>
              <div className={styles.saleDot} />
              <div className={styles.saleInfo}>
                <span className={styles.saleName}>{s.product_name || s.name}</span>
                <span className={styles.saleSlot}>Chamber {s.slot_id || s.slot}</span>
              </div>
              <span className={styles.salePrice}>₹{s.price_paid || s.price}</span>
              <span className={styles.saleTime}>{formatSaleTime(s.timestamp)}</span>
            </div>
          ))
        )}
      </div>

      {/* Sliding Drawer Overlay */}
      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={closeDrawer} />
      )}

      {/* Right Side Sliding Drawer */}
      <div className={[styles.drawer, drawerOpen ? styles.drawerOpen : ''].join(' ')}>
        <div className={styles.drawerHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={styles.badge} style={{ background: 'var(--border)', color: 'var(--text)', fontSize: '11px', padding: '4px 9px' }}>
              {activeSlot?.id}
            </span>
            <h3 className={styles.drawerTitle}>Product Profile</h3>
          </div>
          <button className={styles.drawerCloseBtn} onClick={closeDrawer}>
            <X size={20} />
          </button>
        </div>

        {activeSlot && (
          <div className={styles.drawerBody}>
            {/* Image Preview inside Drawer */}
            <div className={styles.drawerImageWrap}>
              {activeSlot.image ? (
                <img src={activeSlot.image} alt={activeSlot.name} className={styles.drawerImg} />
              ) : (
                <span className={styles.drawerNoImage}>
                  {EMOJIS[activeSlot.category] || '📦'}
                </span>
              )}
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Product Name</span>
              <span className={styles.drawerValue} style={{ fontSize: 18, fontWeight: 700 }}>
                {activeSlot.name || 'Empty / Unassigned'}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Chamber Category</span>
              <span className={styles.drawerValue} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Grid size={13} color="var(--purple)" />
                {activeSlot.category}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Unit Price</span>
              <span className={styles.drawerValueAccent}>
                ₹{activeSlot.price}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Active Offers & Discounts</span>
              {activeSlot.offer ? (
                <span className={styles.drawerValue} style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Percent size={13} />
                  {activeSlot.offer.type} ({activeSlot.offer.value})
                </span>
              ) : (
                <span className={styles.drawerValue} style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  No active discount rules applied
                </span>
              )}
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Inventory Level status</span>
              <span className={styles.drawerValue} style={{ textTransform: 'uppercase', color: getProgressColor(activeSlot), fontWeight: 700, fontSize: 12 }}>
                {activeSlot.status === 'ok' ? '✅ Adequate stock' : activeSlot.status === 'low' ? '⚠️ Low Stock warning' : activeSlot.status === 'empty' ? '❌ Chamber Depleted' : '🔌 Disabled'}
              </span>
              <div className={styles.drawerProgressWrap}>
                <div className={styles.drawerProgressBar}>
                  <div
                    className={styles.drawerProgressFill}
                    style={{
                      width: `${getPercentageStock(activeSlot)}%`,
                      background: getProgressColor(activeSlot)
                    }}
                  />
                </div>
                <div className={styles.drawerProgressText}>
                  <span>{activeSlot.stock} units remaining</span>
                  <span>{getPercentageStock(activeSlot)}% of {activeSlot.max} max capacity</span>
                </div>
              </div>
            </div>

            <div className={styles.drawerField} style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span className={styles.drawerLabel} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Info size={12} /> Threshold Alarm limit
              </span>
              <span className={styles.drawerValue} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                System triggers alert notifications at **{Math.round(activeSlot.alertThreshold * 100)}%** stock level (≤ {Math.round(activeSlot.max * activeSlot.alertThreshold)} units).
              </span>
            </div>
          </div>
        )}

        <div className={styles.drawerFooter}>
          <button
            className={styles.drawerEditBtn}
            onClick={() => {
              onSlotClick(activeSlot)
              closeDrawer()
            }}
          >
            Edit Settings
          </button>
          <button className={styles.drawerCloseActionBtn} onClick={closeDrawer}>
            Close
          </button>
        </div>
      </div>

    </div>
  )
}

export default Dashboard