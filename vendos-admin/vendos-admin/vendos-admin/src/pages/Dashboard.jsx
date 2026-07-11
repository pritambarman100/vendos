import { useState } from 'react';
import { useSlotStore }  from '../store/slotStore';
import { useSalesStore } from '../store/salesStore';
import { formatCompact } from '../utils/formatCurrency';
import { timeAgo }       from '../utils/dateHelpers';
import StatCard  from '../components/ui/StatCard';
import SlotGrid  from '../components/slots/SlotGrid';
import styles    from './Dashboard.module.css';

const DAYS    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const BAR_DATA= [62, 80, 45, 92, 70, 100, 85];

const Dashboard = ({ onSlotClick }) => {
  const slots          = useSlotStore(s => Object.values(s.slots));
  const getEmptySlots  = useSlotStore(s => s.getEmptySlots);
  const getLowSlots    = useSlotStore(s => s.getLowSlots);
  const getTodayRev    = useSalesStore(s => s.getTodayRevenue);
  const getTodayCount  = useSalesStore(s => s.getTodayCount);
  const getRecentSales = useSalesStore(s => s.getRecentSales);

  const [filter, setFilter] = useState('all');

  const emptySlots = getEmptySlots();
  const lowSlots   = getLowSlots();
  const recentSales= getRecentSales(6);
  const maxBar     = Math.max(...BAR_DATA);

  const filteredSlots = filter === 'low'   ? lowSlots
                      : filter === 'empty' ? emptySlots
                      : slots;

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Today's Revenue"  value={formatCompact(getTodayRev())}  accent="var(--accent)" change="↑ 12% vs yesterday" changeType="up" />
        <StatCard label="Items Sold"        value={getTodayCount()}               change="↑ 8 more than avg"  changeType="up" />
        <StatCard label="Low Stock Slots"   value={lowSlots.length}   accent="var(--warn)"   change="Needs restock soon"  changeType="neutral" />
        <StatCard label="Empty Slots"       value={emptySlots.length} accent="var(--danger)" change="Revenue loss risk"   changeType="down" />
      </div>

      {/* Slot overview */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Slot Overview</h2>
          <div className={styles.filters}>
            {[['all','All 20'],['low','Low'],['empty','Empty']].map(([key,label]) => (
              <button
                key={key}
                className={[styles.filter, filter===key ? styles.active : ''].join(' ')}
                onClick={() => setFilter(key)}
              >{label}</button>
            ))}
          </div>
        </div>
        <SlotGrid slots={filteredSlots} onSlotClick={onSlotClick} />
      </div>

      {/* Bottom panels */}
      <div className={styles.panels}>
        {/* Recent sales */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Recent Sales</h3>
            <span className={styles.live}>● Live</span>
          </div>
          <div className={styles.salesList}>
            {recentSales.map(s => (
              <div key={s.id} className={styles.saleRow}>
                <div className={styles.saleDot} />
                <div className={styles.saleInfo}>
                  <span className={styles.saleName}>{s.product}</span>
                  <span className={styles.saleSlot}>Slot {s.slotId}</span>
                </div>
                <span className={styles.salePrice}>₹{s.price * s.qty}</span>
                <span className={styles.saleTime}>{timeAgo(s.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly chart */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Weekly Revenue</h3>
          </div>
          <div className={styles.chartWrap}>
            <div className={styles.chart}>
              {BAR_DATA.map((v, i) => (
                <div key={i} className={styles.barCol}>
                  <div
                    className={[styles.bar, i === 6 ? styles.barLit : ''].join(' ')}
                    style={{ height: `${Math.round(v / maxBar * 100)}%` }}
                  />
                  <span className={styles.barLabel}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartSummary}>
              <span className={styles.chartValue}>₹9,240</span>
              <span className={styles.chartChange}>↑ 18% this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
