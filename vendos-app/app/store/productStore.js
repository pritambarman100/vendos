import { create } from 'zustand'
import { api, loadBaseUrl } from '../services/api'

export const useProductStore = create((set, get) => ({
  products: [],
  selectedCategory: 'All',

  setCategory: (cat) => set({ selectedCategory: cat }),

  getFiltered: () => {
    const { products, selectedCategory } = get()
    if (selectedCategory === 'All') return products
    return products.filter(p => p.cat === selectedCategory)
  },

  fetchProducts: async () => {
    try {
      const activeBaseUrl = await loadBaseUrl()
      const slots = await api.getProducts()
      if (slots && slots.length > 0) {
        // Map backend slots to products
        const formatted = slots
          .filter(s => s.enabled === 1 && s.name !== '')
          .map(s => {
            let offerStr = null
            if (s.offer_type === 'Buy X Get Y Free' && s.offer_value === '2+1') {
              offerStr = 'Buy 2 Get 1'
            } else if (s.offer_type === 'Discount (%)') {
              offerStr = `${s.offer_value}% OFF`
            }
            let imgUrl = s.image
            if (imgUrl) {
              if (imgUrl.includes('/uploads/')) {
                const relativePath = imgUrl.substring(imgUrl.indexOf('/uploads/'))
                imgUrl = `${activeBaseUrl}${relativePath}`
              }
            }
            return {
              id: s.slot_id,
              name: s.name,
              price: Number(s.price),
              cat: s.category || 'Other',
              offer: offerStr,
              stock: Number(s.stock),
              image: imgUrl
            }
          })
        set({ products: formatted })
      } else if (slots && slots.length === 0) {
        set({ products: [] })
      }
    } catch (err) {
      console.log('Error fetching products inside store:', err)
    }
  },

  updateStock: (id, qty) => set((state) => ({
    products: state.products.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p
    ),
  })),
}))