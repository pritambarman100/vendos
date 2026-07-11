import { create } from 'zustand';

const DEMO_SALES = [
  { id:1, slotId:'A1', product:'Coca Cola',    price:50,  qty:1, timestamp: Date.now() - 2*60000 },
  { id:2, slotId:'B1', product:'Red Bull',     price:120, qty:1, timestamp: Date.now() - 8*60000 },
  { id:3, slotId:'A3', product:'Lays Classic', price:30,  qty:2, timestamp: Date.now() - 15*60000 },
  { id:4, slotId:'A4', product:'Water 500ml',  price:20,  qty:1, timestamp: Date.now() - 23*60000 },
  { id:5, slotId:'B3', product:'Dairy Milk',   price:40,  qty:1, timestamp: Date.now() - 41*60000 },
  { id:6, slotId:'D1', product:'Coffee Can',   price:60,  qty:1, timestamp: Date.now() - 55*60000 },
  { id:7, slotId:'A1', product:'Coca Cola',    price:50,  qty:2, timestamp: Date.now() - 70*60000 },
];

export const useSalesStore = create((set, get) => ({
  sales: DEMO_SALES,

  addSale: (sale) => set((state) => ({
    sales: [{ ...sale, id: Date.now(), timestamp: Date.now() }, ...state.sales],
  })),

  getTodayRevenue: () => {
    const today = new Date(); today.setHours(0,0,0,0);
    return get().sales
      .filter(s => new Date(s.timestamp) >= today)
      .reduce((sum, s) => sum + s.price * s.qty, 0);
  },

  getTodayCount: () => {
    const today = new Date(); today.setHours(0,0,0,0);
    return get().sales
      .filter(s => new Date(s.timestamp) >= today)
      .reduce((sum, s) => sum + s.qty, 0);
  },

  getRecentSales: (limit = 5) => get().sales.slice(0, limit),

  getProductStats: () => {
    const stats = {};
    for (const s of get().sales) {
      if (!stats[s.product]) stats[s.product] = { product: s.product, slotId: s.slotId, units: 0, revenue: 0 };
      stats[s.product].units   += s.qty;
      stats[s.product].revenue += s.price * s.qty;
    }
    return Object.values(stats).sort((a, b) => b.units - a.units);
  },
}));
