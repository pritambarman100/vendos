import { useState } from 'react';
import { useSlotStore } from '../store/slotStore';
import SlotGrid from '../components/slots/SlotGrid';
import styles   from './SlotManager.module.css';

const SlotManager = ({ onSlotClick }) => {
  const slots         = useSlotStore(s => Object.values(s.slots));
  const getEmptySlots = useSlotStore(s => s.getEmptySlots);
  const getLowSlots   = useSlotStore(s => s.getLowSlots);
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'empty'   ? getEmptySlots() :
    filter === 'low'     ? getLowSlots()   :
    filter === 'enabled' ? slots.filter(s => s.enabled) :
    slots;

  return (
    <div>
      <div className={styles.toolbar}>
        {[
          ['all',     `All (${slots.length})`],
          ['enabled', 'Active'],
          ['low',     `Low (${getLowSlots().length})`],
          ['empty',   `Empty (${getEmptySlots().length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            className={[styles.tab, filter === key ? styles.active : ''].join(' ')}
            onClick={() => setFilter(key)}
          >{label}</button>
        ))}
      </div>
      <SlotGrid slots={filtered} onSlotClick={onSlotClick} />
    </div>
  );
};

export default SlotManager;
