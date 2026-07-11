import { useState } from 'react';
import { useSalesStore } from '../store/salesStore';
import { formatCompact }  from '../utils/formatCurrency';
import StatCard from '../components/ui/StatCard';
import styles   from './Analytics.module.css';

const PERIODS = ['Today', 'This Week', 'This Month'];

const Analytics = () => {
  const [period, setPeriod] = useState('Today');
  const getProductStats = useSalesStore(s => s.getProductStats);
  const stats = getProductStats();
  const maxUnits = Math.max(...stats.map(s => s.units), 1);
  const slow = stats.filter(s => s.units === 0);
  const best = stats.filter(s => s.units > 0).slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        {PERIODS.map(p => (
          <button
            key={p}
            className={[styles.tab, period===p ? styles.active : ''].join(' ')}
            onClick={() => setPeriod(p)}
          >{p}</button>
        ))}
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Revenue"      value="₹1,840" change="↑ 12%" changeType="up" accent="var(--accent)" />
        <StatCard label="Transactions" value="36"     change="↑ 5"   changeType="up" />
        <StatCard label="Avg Order"    value="₹51"    change="per customer" changeType="neutral" />
        <StatCard label="Peak Hour"    value="1–2 PM" change="12 orders"    changeType="neutral" />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Best Sellers</h3>
        </div>
        <div className={styles.panelBody}>
          {best.map((s, i) => (
            <div key={s.product} className={styles.productRow}>
              <span className={styles.rank}>#{i+1}</span>
              <div className={styles.productInfo}>
                <div className={styles.productTop}>
                  <span className={styles.productName}>{s.product}</span>
                  <span className={styles.productRev}>{formatCompact(s.revenue)}</span>
                </div>
                <div className={styles.barWrap}>
                  <div className={styles.barFill} style={{ width: `${(s.units/maxUnits)*100}%` }} />
                </div>
                <span className={styles.units}>{s.units} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slow.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Slow Movers</h3>
            <span className={styles.warnBadge}>Consider replacing</span>
          </div>
          <div className={styles.panelBody}>
            {slow.map(s => (
              <div key={s.product} className={styles.slowRow}>
                <span className={styles.slowName}>{s.product}</span>
                <span className={styles.slowNote}>0 sold today</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
