import { getStatusColor, getStockPercent } from '../../utils/stockHelpers';
import Badge from '../ui/Badge';
import styles from './SlotCard.module.css';

const EMOJIS = {
  Drinks: '🥤', Snacks: '🍟', Food: '🍱', Stationery: '✏️', Other: '📦',
};

const SlotCard = ({ slot, onClick }) => {
  const { id, name, price, stock, maxCapacity, category, status, enabled } = slot;
  const pct    = getStockPercent(stock, maxCapacity);
  const color  = getStatusColor(status);
  const isEmpty = status === 'empty';
  const isOff   = !enabled || status === 'off';

  return (
    <div
      className={[styles.card, styles[status]].join(' ')}
      onClick={() => onClick(slot)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(slot)}
    >
      <div className={styles.top}>
        <span className={styles.slotId}>{id}</span>
        <Badge variant={isOff ? 'off' : status} size="sm">
          {isOff ? 'Off' : isEmpty ? 'Empty' : status === 'low' ? 'Low' : 'OK'}
        </Badge>
      </div>

      <div className={styles.emoji}>
        {name ? (EMOJIS[category] || '📦') : '＋'}
      </div>

      <div className={styles.name}>{name || 'Empty slot'}</div>
      <div className={styles.price}>{price > 0 ? `₹${price}` : '—'}</div>

      <div className={styles.barWrap}>
        <div className={styles.bar} style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className={styles.count}>{stock}/{maxCapacity}</div>
    </div>
  );
};

export default SlotCard;
