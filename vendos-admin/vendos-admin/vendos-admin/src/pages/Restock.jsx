import { useState } from 'react';
import { useSlotStore } from '../store/slotStore';
import Button from '../components/ui/Button';
import Badge  from '../components/ui/Badge';
import styles from './Restock.module.css';

const EMOJIS = { Drinks:'🥤', Snacks:'🍟', Food:'🍱', Other:'📦' };

const RestockRow = ({ slot }) => {
  const restockSlot = useSlotStore(s => s.restockSlot);
  const [qty, setQty] = useState('');

  const handleRestock = () => {
    const n = parseInt(qty);
    if (!n || n <= 0) return;
    restockSlot(slot.id, n);
    setQty('');
  };

  const max = slot.maxCapacity - slot.stock;

  return (
    <div className={styles.row}>
      <div className={styles.emoji}>{EMOJIS[slot.category] || '📦'}</div>
      <div className={styles.info}>
        <div className={styles.name}>{slot.name} <span className={styles.slotId}>· {slot.id}</span></div>
        <div className={styles.stock}>{slot.stock}/{slot.maxCapacity} remaining</div>
        <div className={styles.barWrap}>
          <div className={styles.bar} style={{ width: `${(slot.stock/slot.maxCapacity)*100}%` }} />
        </div>
      </div>
      <Badge variant={slot.status}>{slot.status === 'empty' ? 'Empty' : 'Low'}</Badge>
      <div className={styles.actions}>
        <input
          className={styles.input}
          type="number"
          placeholder={`max ${max}`}
          max={max} min={1}
          value={qty}
          onChange={e => setQty(e.target.value)}
        />
        <Button size="sm" onClick={handleRestock}>Update</Button>
      </div>
    </div>
  );
};

const Restock = () => {
  const getEmptySlots = useSlotStore(s => s.getEmptySlots);
  const getLowSlots   = useSlotStore(s => s.getLowSlots);
  const needsRestock  = [...getEmptySlots(), ...getLowSlots()];

  return (
    <div>
      {needsRestock.length === 0 ? (
        <div className={styles.empty}>
          <span style={{fontSize:40}}>✅</span>
          <p>All slots are well stocked!</p>
        </div>
      ) : (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Slots needing restock ({needsRestock.length})</h3>
          </div>
          <div className={styles.list}>
            {needsRestock.map(s => <RestockRow key={s.id} slot={s} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Restock;
