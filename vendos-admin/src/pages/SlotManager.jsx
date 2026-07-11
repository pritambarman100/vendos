import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSlotStore } from '../store/slotStore'
import styles from './SlotManager.module.css'

const EMOJIS = {
  Drinks: '🥤', Snacks: '🍟',
  Food: '🍱', Other: '📦'
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

const SlotManager = ({ onSlotClick }) => {
  const slotsObj = useSlotStore(s => s.slots)
  const machines = useSlotStore(s => s.machines)
  const activeMachineId = useSlotStore(s => s.activeMachineId)
  const [filter, setFilter] = useState('all')

  const allSlots   = Object.values(slotsObj)
  const emptySlots = allSlots.filter(s => s.status === 'empty')
  const lowSlots   = allSlots.filter(s => s.status === 'low')

  const filtered =
    filter === 'empty' ? emptySlots :
    filter === 'low'   ? lowSlots   :
    allSlots

  if (machines.length === 0 || !activeMachineId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: 'var(--text-muted)' }}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', color: 'var(--text)' }}>No Vending Machine Selected</h3>
        <p style={{ maxWidth: 400, textAlign: 'center', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Please register a new machine or select an active machine from the sidebar to manage slots.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        {[
          ['all',   `All (${allSlots.length})`],
          ['low',   `Low (${lowSlots.length})`],
          ['empty', `Empty (${emptySlots.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            className={[styles.tab, filter === key ? styles.active : ''].join(' ')}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.slotGrid}>
        {filtered.map(slot => (
          <SlotCard
            key={slot.id}
            slot={slot}
            onClick={onSlotClick}
          />
        ))}
      </div>
    </div>
  )
}

export default SlotManager