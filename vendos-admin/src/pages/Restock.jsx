import { useState } from 'react'
import { AlertTriangle, Plus, Check } from 'lucide-react'
import { useSlotStore } from '../store/slotStore'
import styles from './Restock.module.css'

const EMOJIS = { Drinks:'🥤', Snacks:'🍟', Food:'🍱', Other:'📦', Stationery: '✏️' }

const RestockRow = ({ slot }) => {
  const updateSlot = useSlotStore(s => s.updateSlot)
  const [qty, setQty] = useState('')

  const isAlert = slot.stock <= (slot.max * slot.alertThreshold)
  const isZero = slot.stock === 0
  const maxAllowedRestock = slot.max - slot.stock

  const handleRestock = async () => {
    const n = parseInt(qty)
    if (!n || n <= 0) return
    
    const newStock = Math.min(slot.stock + n, slot.max)
    const newStatus =
      newStock === 0        ? 'empty' :
      newStock <= (slot.max * slot.alertThreshold) ? 'low' : 'ok'

    await updateSlot(slot.id, { 
      stock: newStock, 
      status: newStatus 
    })

    setQty('')
  }

  const handleFillMax = async () => {
    if (maxAllowedRestock <= 0) return
    const newStock = slot.max
    await updateSlot(slot.id, {
      stock: newStock,
      status: 'ok'
    })
  }

  const alertClass = isZero ? styles.dangerRow : (isAlert ? styles.warnRow : '')

  return (
    <div className={[styles.row, alertClass].join(' ')}>
      <div className={styles.emojiCol}>
        {slot.image ? (
          <img src={slot.image} alt={slot.name} className={styles.slotImgTile} />
        ) : (
          EMOJIS[slot.category] || '📦'
        )}
      </div>
      
      <div className={styles.productCol}>
        <div className={styles.name}>
          {slot.name || <span className={styles.unnamed}>Unassigned Product</span>}
          <span className={styles.slotId}> · Slot {slot.id}</span>
        </div>
        <div className={styles.category}>
          {slot.category}
        </div>
      </div>

      <div className={styles.stockCol}>
        <div className={styles.stockText}>
          {slot.stock} / {slot.max} units
        </div>
        <div className={styles.barWrap}>
          <div
            className={styles.bar}
            style={{
              width: `${(slot.stock / slot.max) * 100}%`,
              background: isZero ? 'var(--danger)' : (isAlert ? 'var(--warn)' : 'var(--success)')
            }}
          />
        </div>
      </div>

      <div className={styles.statusCol}>
        {isZero ? (
          <span className={[styles.statusBadge, styles.badgeDanger].join(' ')}>
            <AlertTriangle size={11} /> Empty
          </span>
        ) : isAlert ? (
          <span className={[styles.statusBadge, styles.badgeWarn].join(' ')}>
            <AlertTriangle size={11} /> Low Stock
          </span>
        ) : (
          <span className={[styles.statusBadge, styles.badgeOk].join(' ')}>
            <Check size={11} /> Replenished
          </span>
        )}
      </div>

      <div className={styles.actionsCol}>
        {maxAllowedRestock > 0 ? (
          <>
            <input
              className={styles.input}
              type="number"
              placeholder={`+${maxAllowedRestock}`}
              value={qty}
              min={1}
              max={maxAllowedRestock}
              onChange={e => setQty(e.target.value)}
            />
            <button 
              className={styles.btn} 
              onClick={handleRestock}
            >
              Fill
            </button>
            <button
              className={styles.maxBtn}
              onClick={handleFillMax}
            >
              Max
            </button>
          </>
        ) : (
          <span className={styles.fullText}>Fully Stocked</span>
        )}
      </div>
    </div>
  )
}

const Restock = () => {
  const slotsObj = useSlotStore(s => s.slots)
  const allSlots = Object.values(slotsObj)
  
  // Retrieve and sort all active (enabled & named) slots, lowest stock ratio first
  const activeSlots = allSlots
    .filter(s => s.enabled && s.name)
    .sort((a, b) => (a.stock / a.max) - (b.stock / b.max))

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>
            Vending Machine Refill Manager
          </h3>
          <p className={styles.panelSubtitle}>
            Showing all {activeSlots.length} active chambers sorted by lowest stock levels.
          </p>
        </div>
        
        {/* Table Header for large screens */}
        <div className={styles.tableHeader}>
          <div className={styles.emojiCol} />
          <div className={styles.productCol}>Product Details</div>
          <div className={styles.stockCol}>Stock Level</div>
          <div className={styles.statusCol}>Status Alert</div>
          <div className={styles.actionsCol}>Refill Controls</div>
        </div>

        <div className={styles.rowsContainer}>
          {activeSlots.map(s => (
            <RestockRow key={s.id} slot={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Restock