import { create } from 'zustand';
import { getSlotStatus } from '../utils/stockHelpers';
import { generateAllSlotIds } from '../utils/stockHelpers';

const buildEmptySlots = () => {
  const slots = {};
  for (const id of generateAllSlotIds()) {
    slots[id] = {
      id,
      name: '',
      image: null,
      price: 0,
      stock: 0,
      maxCapacity: 20,
      category: 'Other',
      offer: null,
      motorPin: null,
      status: 'off',
      enabled: false,
    };
  }
  return slots;
};

const DEMO_SLOTS = {
  A1: { id:'A1', name:'Coca Cola',    image:null, price:50,  stock:14, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  A2: { id:'A2', name:'Pepsi',        image:null, price:45,  stock:2,  maxCapacity:20, category:'Drinks',  offer:null, status:'low',   enabled:true },
  A3: { id:'A3', name:'Lays Classic', image:null, price:30,  stock:0,  maxCapacity:20, category:'Snacks',  offer:null, status:'empty', enabled:true },
  A4: { id:'A4', name:'Water 500ml',  image:null, price:20,  stock:18, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  A5: { id:'A5', name:'Kurkure',      image:null, price:25,  stock:7,  maxCapacity:20, category:'Snacks',  offer:null, status:'ok',    enabled:true },
  B1: { id:'B1', name:'Red Bull',     image:null, price:120, stock:9,  maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  B2: { id:'B2', name:'Oreo Pack',    image:null, price:35,  stock:3,  maxCapacity:20, category:'Snacks',  offer:null, status:'low',   enabled:true },
  B3: { id:'B3', name:'Dairy Milk',   image:null, price:40,  stock:0,  maxCapacity:20, category:'Snacks',  offer:null, status:'empty', enabled:true },
  B4: { id:'B4', name:'Juice Box',    image:null, price:30,  stock:15, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  B5: { id:'B5', name:'Green Tea',    image:null, price:25,  stock:19, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  C1: { id:'C1', name:'Biscuit Pack', image:null, price:20,  stock:11, maxCapacity:20, category:'Snacks',  offer:null, status:'ok',    enabled:true },
  C2: { id:'C2', name:'Mango Drink',  image:null, price:35,  stock:2,  maxCapacity:20, category:'Drinks',  offer:null, status:'low',   enabled:true },
  C3: { id:'C3', name:'Chips Mix',    image:null, price:40,  stock:8,  maxCapacity:20, category:'Snacks',  offer:null, status:'ok',    enabled:true },
  C4: { id:'C4', name:'Soda Water',   image:null, price:25,  stock:6,  maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  C5: { id:'C5', name:'Protein Bar',  image:null, price:80,  stock:4,  maxCapacity:20, category:'Food',    offer:null, status:'low',   enabled:true },
  D1: { id:'D1', name:'Coffee Can',   image:null, price:60,  stock:13, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  D2: { id:'D2', name:'Nimbu Pani',   image:null, price:20,  stock:16, maxCapacity:20, category:'Drinks',  offer:null, status:'ok',    enabled:true },
  D3: { id:'D3', name:'Popcorn',      image:null, price:45,  stock:9,  maxCapacity:20, category:'Snacks',  offer:null, status:'ok',    enabled:true },
  D4: { id:'D4', name:'Gummy Bears',  image:null, price:30,  stock:7,  maxCapacity:20, category:'Snacks',  offer:null, status:'ok',    enabled:true },
  D5: { id:'D5', name:'',             image:null, price:0,   stock:0,  maxCapacity:20, category:'Other',   offer:null, status:'off',   enabled:false },
};

export const useSlotStore = create((set, get) => ({
  slots: DEMO_SLOTS,

  updateSlot: (id, data) => set((state) => ({
    slots: {
      ...state.slots,
      [id]: {
        ...state.slots[id],
        ...data,
        status: getSlotStatus(data.stock ?? state.slots[id].stock),
      },
    },
  })),

  restockSlot: (id, addQty) => set((state) => {
    const slot = state.slots[id];
    const newStock = Math.min(slot.stock + addQty, slot.maxCapacity);
    return {
      slots: {
        ...state.slots,
        [id]: { ...slot, stock: newStock, status: getSlotStatus(newStock) },
      },
    };
  }),

  dispenseItem: (id) => set((state) => {
    const slot = state.slots[id];
    if (slot.stock <= 0) return state;
    const newStock = slot.stock - 1;
    return {
      slots: {
        ...state.slots,
        [id]: { ...slot, stock: newStock, status: getSlotStatus(newStock) },
      },
    };
  }),

  getEmptySlots:   () => Object.values(get().slots).filter(s => s.status === 'empty'),
  getLowSlots:     () => Object.values(get().slots).filter(s => s.status === 'low'),
  getEnabledSlots: () => Object.values(get().slots).filter(s => s.enabled),
}));
