import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: {},

  addItem: (product) => set((state) => {
    const existing = state.items[product.id]
    return {
      items: {
        ...state.items,
        [product.id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { ...product, qty: 1 },
      },
    }
  }),

  removeItem: (id) => set((state) => {
    const existing = state.items[id]
    if (!existing) return state
    if (existing.qty <= 1) {
      const newItems = { ...state.items }
      delete newItems[id]
      return { items: newItems }
    }
    return {
      items: {
        ...state.items,
        [id]: { ...existing, qty: existing.qty - 1 },
      },
    }
  }),

  clearCart: () => set({ items: {} }),

  getItemList: () => Object.values(get().items),

  getTotalQty: () =>
    Object.values(get().items).reduce((sum, i) => sum + i.qty, 0),

  getSubtotal: () =>
    Object.values(get().items).reduce((sum, i) => sum + i.price * i.qty, 0),

  getDiscount: () => {
    let disc = 0
    Object.values(get().items).forEach(i => {
      if (i.offer === 'Buy 2 Get 1' && i.qty >= 2) disc += i.price
      if (i.offer === '10% OFF') disc += Math.round(i.price * i.qty * 0.1)
      if (i.offer === '15% OFF') disc += Math.round(i.price * i.qty * 0.15)
    })
    return disc
  },

  getTotal: () => get().getSubtotal() - get().getDiscount(),
}))