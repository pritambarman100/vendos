import { useState } from 'react'
import { Download, FileText, TrendingUp, Zap, BarChart2, AlertTriangle, Check } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { useSlotStore } from '../store/slotStore'
import styles from './Analytics.module.css'

const PERIODS = ['Today', 'This Week', 'This Month']

const Analytics = () => {
  const [period, setPeriod] = useState('Today')
  const slots = useSlotStore(s => s.slots)
  const sales = useSlotStore(s => s.sales)
  const stats = useSlotStore(s => s.stats)
  
  const allSlots = Object.values(slots)

  // Helper function to filter sales by date period
  const filterSalesByPeriod = (p) => {
    const now = new Date()
    return sales.filter(item => {
      if (!item.timestamp) return false
      // Parse SQLite timestamp: YYYY-MM-DD HH:MM:SS
      const itemDate = new Date(item.timestamp.replace(' ', 'T') + 'Z')
      const diffMs = now - itemDate
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      
      if (p === 'Today') {
        return diffDays <= 1
      } else if (p === 'This Week') {
        return diffDays <= 7
      } else if (p === 'This Month') {
        return diffDays <= 30
      }
      return true
    })
  }

  const currentSales = filterSalesByPeriod(period)

  // 1. Hourly activity dynamic aggregation
  const hourlyIntervals = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const hourlyData = hourlyIntervals.map(h => {
    const targetHour = parseInt(h.split(':')[0])
    const salesInHour = currentSales.filter(item => {
      if (!item.timestamp) return false
      const date = new Date(item.timestamp.replace(' ', 'T') + 'Z')
      const itemHour = date.getHours()
      return itemHour >= targetHour && itemHour < targetHour + 2
    })
    return {
      hour: h,
      sales: salesInHour.length,
      revenue: salesInHour.reduce((sum, s) => sum + (Number(s.price_paid) || 0), 0)
    }
  })

  // 2. Product sales performance breakdown & ranking calculations
  const productSalesMap = {}
  currentSales.forEach(s => {
    const name = s.product_name || s.slot_id
    if (!productSalesMap[name]) {
      productSalesMap[name] = {
        name,
        slotId: s.slot_id,
        category: s.category || 'Other',
        unitsSold: 0,
        revenue: 0,
        originalPrice: 0,
        discountGiven: 0
      }
    }
    productSalesMap[name].unitsSold += 1
    productSalesMap[name].revenue += Number(s.price_paid) || 0
    
    // Cross-reference with current slot to check base price and find discounts
    const currentSlot = slots[s.slot_id]
    if (currentSlot) {
      productSalesMap[name].originalPrice = currentSlot.price
      const diff = Math.max(0, currentSlot.price - s.price_paid)
      productSalesMap[name].discountGiven += diff
    } else {
      productSalesMap[name].originalPrice = s.price_paid
    }
  })

  // Ensure configured active slots are represented even if they have 0 sales
  const activeSlots = allSlots.filter(s => s.enabled && s.name)
  const allProductsList = activeSlots.map(s => {
    const name = s.name
    return productSalesMap[name] || {
      name,
      slotId: s.id,
      category: s.category,
      unitsSold: 0,
      revenue: 0,
      originalPrice: s.price,
      discountGiven: 0
    }
  })

  // Sort by units sold to calculate rank performance
  const sortedBySold = [...allProductsList].sort((a, b) => b.unitsSold - a.unitsSold)
  const topProduct = sortedBySold.length > 0 && sortedBySold[0].unitsSold > 0 ? sortedBySold[0] : null
  
  // Least product will be the one with the lowest sales (could be 0)
  const leastProduct = sortedBySold.length > 0 ? sortedBySold[sortedBySold.length - 1] : null

  // 3. Category sales aggregation for bar chart
  const categoryCounts = currentSales.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})
  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  })).sort((a, b) => b.value - a.value)

  const displayCategoryData = categoryData.length > 0 ? categoryData : [
    { name: 'Drinks', value: 0 },
    { name: 'Snacks', value: 0 },
    { name: 'Food', value: 0 },
    { name: 'Other', value: 0 },
  ]

  // 4. Inventory depletion velocity
  const depletionVelocity = allSlots
    .filter(s => s.name && s.enabled)
    .map(s => {
      const depletedQty = s.max - s.stock
      const depletionPct = Math.round((depletedQty / s.max) * 100)
      return {
        ...s,
        depletedQty,
        depletionPct
      }
    })
    .sort((a, b) => b.depletionPct - a.depletionPct)
    .slice(0, 5)

  // Report statistics calculations
  const totalRevenue = currentSales.reduce((sum, s) => sum + (Number(s.price_paid) || 0), 0)
  const totalDiscounts = allProductsList.reduce((sum, p) => sum + p.discountGiven, 0)
  const totalTransactions = currentSales.length

  // Download PDF Report Action
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableHTML = allProductsList.map(p => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; font-family: monospace; color: #c9d1d9;">${p.slotId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #c9d1d9; font-weight: 600;">${p.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #8b949e;">${p.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #c9d1d9;">₹${p.originalPrice}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #c9d1d9; text-align: center;">${p.unitsSold}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #f85149; text-align: right;">₹${p.discountGiven.toFixed(1)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #30363D; color: #2ea44f; text-align: right; font-weight: 600;">₹${p.revenue.toFixed(1)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>VendOS Vending Network Business Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; padding: 45px; background: #0d1117; color: #c9d1d9; }
            h1 { font-size: 26px; margin-bottom: 4px; color: #58a6ff; font-weight: 700; }
            .meta { font-size: 12px; color: #8b949e; margin-bottom: 30px; border-bottom: 1px solid #30363D; padding-bottom: 12px; }
            .section-title { font-size: 16px; font-weight: 600; border-bottom: 2px solid #30363D; padding-bottom: 6px; margin-top: 35px; color: #c9d1d9; text-transform: uppercase; letter-spacing: 0.05em; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #161b22; text-align: left; padding: 10px; border-bottom: 2px solid #30363D; font-size: 11px; text-transform: uppercase; color: #8b949e; letter-spacing: 0.05em; }
            td { font-size: 13px; }
            .stats-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
            .stat-box { border: 1px solid #30363D; padding: 16px; border-radius: 6px; background: #161b22; }
            .stat-label { font-size: 10px; color: #8b949e; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
            .stat-value { font-size: 22px; font-weight: bold; margin-top: 6px; }
            .kpi-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
            .kpi-box { border: 1px solid #30363D; padding: 14px; border-radius: 6px; background: #161b22; display: flex; justify-content: space-between; align-items: center; }
            .kpi-name { font-size: 13px; font-weight: 600; color: #c9d1d9; }
            .kpi-val { font-size: 13px; color: #58a6ff; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>VendOS Business & Sales Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()} | Period Selected: ${period} | Device Network Node: VM-01</div>
          
          <div class="section-title">Financial & Operational Performance</div>
          <div class="stats-container">
            <div class="stat-box">
              <div class="stat-label">Net Earnings</div>
              <div class="stat-value" style="color: #2ea44f">₹${totalRevenue.toFixed(1)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Discounts Applied</div>
              <div class="stat-value" style="color: #f85149">₹${totalDiscounts.toFixed(1)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Product Sales</div>
              <div class="stat-value">${totalTransactions} units</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Stock Decrements</div>
              <div class="stat-value">${totalTransactions} events</div>
            </div>
          </div>

          <div class="section-title">Sales Rank Highlights</div>
          <div class="kpi-container">
            <div class="kpi-box">
              <span class="kpi-name">🔥 Top Performing Product</span>
              <span class="kpi-val">${topProduct ? `${topProduct.name} (${topProduct.unitsSold} units)` : 'No transactions recorded'}</span>
            </div>
            <div class="kpi-box">
              <span class="kpi-name">❄️ Least Performing Product</span>
              <span class="kpi-val">${leastProduct ? `${leastProduct.name} (${leastProduct.unitsSold} units)` : 'No transactions recorded'}</span>
            </div>
          </div>
          
          <div class="section-title">Product Sales Performance breakdown</div>
          <table>
            <thead>
              <tr>
                <th style="width: 100px;">Chamber ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th style="text-align: center;">Qty Sold</th>
                <th style="text-align: right;">Discounts given</th>
                <th style="text-align: right;">Net Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${tableHTML}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export rows to Excel sheet data structure (CSV format)
  const handleExportExcel = () => {
    const headers = ['Chamber ID', 'Product Name', 'Category', 'Base Unit Price', 'Units Sold', 'Discount Offered (Total)', 'Net Earnings'];
    const rows = allProductsList.map(p => [
      `"${p.slotId}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      p.originalPrice,
      p.unitsSold,
      p.discountGiven,
      p.revenue
    ]);

    // Add overview rows at the top or bottom of CSV
    const summaryRows = [
      [],
      ['SUMMARY METRICS'],
      ['Period Selected', `"${period}"`],
      ['Total Net Earnings', totalRevenue],
      ['Total Discounts Applied', totalDiscounts],
      ['Total Units Sold', totalTransactions],
      ['Stock Decrements (Purchases)', totalTransactions],
      ['Top Performing Product', `"${topProduct ? `${topProduct.name} (${topProduct.unitsSold} sold)` : 'N/A'}"`],
      ['Least Performing Product', `"${leastProduct ? `${leastProduct.name} (${leastProduct.unitsSold} sold)` : 'N/A'}"`],
      []
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          ...summaryRows.map(e => e.join(',')),
          headers.join(','), 
          ...rows.map(e => e.join(','))
        ].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vendos_business_report_${period.toLowerCase().replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.page}>
      
      {/* Page Header Actions */}
      <div className={styles.exportHeader}>
        <div className={styles.tabs}>
          {PERIODS.map(p => (
            <button
              key={p}
              className={[styles.tab, period === p ? styles.active : ''].join(' ')}
              onClick={() => setPeriod(p)}
            >{p}</button>
          ))}
        </div>
        <div className={styles.btnGroup}>
          <button className={styles.exportBtn} onClick={handleDownloadPDF}>
            <FileText size={14} />
            Download PDF Report
          </button>
          <button className={styles.exportBtn} onClick={handleExportExcel}>
            <Download size={14} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Revenue</div>
          <div className={styles.statValue} style={{ color: 'var(--accent)' }}>
            ₹{totalRevenue.toFixed(1)}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--success)' }}>
            After-discount net income
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Transactions</div>
          <div className={styles.statValue}>{totalTransactions}</div>
          <div className={styles.statChange} style={{ color: 'var(--success)' }}>
            Stock Decrements registered
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Ticket Size</div>
          <div className={styles.statValue}>
            ₹{totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--text-muted)' }}>
            Per vendor transaction
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Discounts Given</div>
          <div className={styles.statValue} style={{ color: 'var(--danger)' }}>
            ₹{totalDiscounts.toFixed(1)}
          </div>
          <div className={styles.statChange} style={{ color: 'var(--text-muted)' }}>
            Promo campaign expense
          </div>
        </div>
      </div>

      {/* Three Column Grid for Single Screen View */}
      <div className={styles.threeCol}>
        
        {/* Hourly Transactions Line Area Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="var(--purple)" /> Hourly Activity
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Peak load frequency</span>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card)', 
                      borderColor: 'var(--border)', 
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="sales" name="Items Sold" stroke="var(--purple)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Performance Horizontal Bar Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={15} color="var(--accent)" /> Category Breakdown
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Units depleted by type</span>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayCategoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card)', 
                      borderColor: 'var(--border)', 
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" name="Sold Units" radius={[0, 4, 4, 0]} barSize={12}>
                    {displayCategoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? 'var(--accent)' : 'var(--purple)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic Velocity Depletion Rate List */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} color="var(--danger)" /> Depletion Velocity
            </h3>
            <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Fastest draining chambers</span>
          </div>
          <div className={styles.panelBody} style={{ gap: 8 }}>
            {depletionVelocity.map(s => (
              <div key={s.id} className={styles.velocityItem} style={{ padding: '8px 10px' }}>
                <div className={styles.velocityHeader} style={{ fontSize: '12px' }}>
                  <span>Chamber {s.id} — {s.name}</span>
                  <span className={styles.velocityValue}>-{s.depletionPct}%</span>
                </div>
                <div className={styles.velocityBar} style={{ height: '4px' }}>
                  <div className={styles.velocityFill} style={{ width: `${s.depletionPct}%` }} />
                </div>
                <div className={styles.velocityMeta} style={{ fontSize: '9px' }}>
                  <span>Depleted: {s.depletedQty} u</span>
                  <span>Rem: {s.stock}/{s.max}</span>
                </div>
              </div>
            ))}
            {depletionVelocity.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
                All vending chambers are fully stocked!
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default Analytics