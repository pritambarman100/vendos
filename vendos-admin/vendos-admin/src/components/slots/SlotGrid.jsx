import SlotCard from './SlotCard';
import styles from './SlotGrid.module.css';

const SlotGrid = ({ slots, onSlotClick }) => (
  <div className={styles.grid}>
    {slots.map((slot) => (
      <SlotCard key={slot.id} slot={slot} onClick={onSlotClick} />
    ))}
  </div>
);

export default SlotGrid;
