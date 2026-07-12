import { create } from 'zustand'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`

const generateDefaultSlots = (dbSlots) => {
  const defaultSlots = {};
  
  // 1. Determine the maximum row letter we need to support
  // Start with at least 'D' (row 4)
  let maxRowCode = 68; // 'D'
  
  Object.keys(dbSlots).forEach(id => {
    if (id && id.length >= 2) {
      const rowCode = id.charAt(0).toUpperCase().charCodeAt(0);
      if (rowCode > maxRowCode && rowCode <= 74) { // Up to 'J'
        maxRowCode = rowCode;
      }
    }
  });

  const rows = [];
  for (let code = 65; code <= maxRowCode; code++) {
    rows.push(String.fromCharCode(code));
  }

  // 2. Generate all slots for this grid size
  rows.forEach(row => {
    for (let col = 1; col <= 5; col++) {
      const paddedCol = col < 10 ? `0${col}` : String(col);
      const id = `${row}${paddedCol}`;
      defaultSlots[id] = {
        id,
        name: '',
        price: 0,
        stock: 0,
        max: 20,
        alertThreshold: 0.20,
        category: 'Other',
        status: 'off',
        image: null,
        offer: null,
        enabled: false
      };
    }
  });

  // 3. Merge database slots, normalizing legacy IDs (e.g. "A1" -> "A01")
  Object.keys(dbSlots).forEach(id => {
    const slot = dbSlots[id];
    let normalizedId = id;
    if (id && id.length === 2) {
      const row = id.charAt(0).toUpperCase();
      const col = id.charAt(1);
      normalizedId = `${row}0${col}`;
    }
    
    defaultSlots[normalizedId] = {
      ...defaultSlots[normalizedId],
      ...slot,
      id: normalizedId
    };
  });

  return defaultSlots;
};

export const useSlotStore = create((set, get) => ({
  slots: {},
  machines: [],
  activeMachineId: 'VM-01',
  stats: {
    total_revenue: 0,
    items_sold: 0,
    low_slots: 0,
    empty_slots: 0
  },
  sales: [],
  loading: false,

  // Keep these dynamic getters fully backward-compatible
  getAll:   () => Object.values(get().slots),
  getEmpty: () => Object.values(get().slots).filter(s => s.status === 'empty'),
  getLow:   () => Object.values(get().slots).filter(s => s.status === 'low'),

  setActiveMachineId: (id) => {
    set({ activeMachineId: id })
    get().fetchSlots()
    get().fetchStats()
    get().fetchSales()
  },

  fetchMachines: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/machines`)
      if (!response.ok) throw new Error("Failed to load machines")
      const data = await response.json()
      set({ machines: data })
      
      // Default to first machine if the active machine is missing
      if (data.length > 0 && !data.some(m => m.machine_id === get().activeMachineId)) {
        get().setActiveMachineId(data[0].machine_id)
      }
    } catch (error) {
      console.error("Error fetching machines:", error)
    }
  },

  addMachine: async (machineData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/machines/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machineData)
      })
      if (!response.ok) throw new Error("Failed to save machine")
      await get().fetchMachines()
    } catch (error) {
      console.error("Error saving machine:", error)
    }
  },

  updateMachine: async (machineId, machineData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/machines/${machineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machineData)
      })
      if (!response.ok) throw new Error("Failed to update machine settings")
      await get().fetchMachines()
    } catch (error) {
      console.error("Error updating machine settings:", error)
      throw error
    }
  },

  deleteMachine: async (machineId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/machines/${machineId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Failed to delete machine")
      
      await get().fetchMachines()
      
      // If deleted machine was active, reset to another machine
      if (get().activeMachineId === machineId) {
        const remaining = get().machines
        if (remaining.length > 0) {
          get().setActiveMachineId(remaining[0].machine_id)
        } else {
          set({ activeMachineId: '' })
        }
      }
    } catch (error) {
      console.error("Error deleting machine:", error)
      throw error
    }
  },

  reorderMachines: async (orderedIds) => {
    // 1. Optimistic UI update locally
    const currentMachines = get().machines
    const reordered = [...currentMachines].sort((a, b) => {
      return orderedIds.indexOf(a.machine_id) - orderedIds.indexOf(b.machine_id)
    })
    set({ machines: reordered })

    // 2. Sync to backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/machines/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      })
      if (!response.ok) throw new Error("Failed to save reordered machines")
    } catch (error) {
      console.error("Error reordering machines:", error)
      // Fallback
      set({ machines: currentMachines })
    }
  },

  fetchSlots: async () => {
    set({ loading: true })
    try {
      const activeId = get().activeMachineId
      const response = await fetch(`${BACKEND_URL}/api/slots?machine_id=${activeId}`)
      if (!response.ok) throw new Error("Failed to load slots")
      const data = await response.json()
      
      const dbSlots = {}
      if (data && data.length > 0) {
        data.forEach(s => {
          const normId = s.slot_id ? s.slot_id.toUpperCase() : '';
          if (!normId) return;

          dbSlots[normId] = {
            id: normId,
            name: s.name || '',
            category: s.category || 'Other',
            price: Number(s.price) || 0,
            stock: Number(s.stock) || 0,
            max: Number(s.max_capacity) || 20,
            alertThreshold: Number(s.alert_threshold) || 0.20,
            status: s.status || 'off',
            image: s.image ? (s.image.startsWith('http') || s.image.startsWith('data:') ? s.image : `${BACKEND_URL}${s.image}`) : null,
            offer: s.offer_type ? { type: s.offer_type, value: s.offer_value } : null,
            enabled: s.enabled === 1
          }
        })
      }
      
      const slotsObj = generateDefaultSlots(dbSlots);
      set({ slots: slotsObj })
    } catch (error) {
      console.error("Error fetching slots from backend:", error)
    } finally {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const activeId = get().activeMachineId
      const response = await fetch(`${BACKEND_URL}/api/dashboard/stats?machine_id=${activeId}`)
      if (!response.ok) throw new Error("Failed to load stats")
      const data = await response.json()
      set({ stats: data })
    } catch (error) {
      console.error("Error fetching stats from backend:", error)
    }
  },

  fetchSales: async () => {
    try {
      const activeId = get().activeMachineId
      const response = await fetch(`${BACKEND_URL}/api/sales?machine_id=${activeId}`)
      if (!response.ok) throw new Error("Failed to load sales logs")
      const data = await response.json()
      set({ sales: data })
    } catch (error) {
      console.error("Error fetching sales logs from backend:", error)
    }
  },

  updateSlot: async (id, updatedData) => {
    const activeId = get().activeMachineId
    // 1. Optimistic UI update locally
    set(state => {
      const currentSlot = state.slots[id] || {}
      return {
        slots: {
          ...state.slots,
          [id]: { ...currentSlot, ...updatedData }
        }
      }
    })

    // 2. Network sync
    try {
      const slot = get().slots[id]
      
      const payload = {
        machine_id: activeId,
        slot_number: id,
        name: slot.name || '',
        price: Number(slot.price) || 0,
        stock: Number(slot.stock) || 0,
        max: Number(slot.max) || 20,
        alertThreshold: Number(slot.alertThreshold) || 0.20,
        category: slot.category || 'Other',
        enabled: slot.enabled ?? true,
        status: slot.status || 'ok',
        image: slot.image || null,
        offer_type: slot.offer?.type || null,
        offer_value: slot.offer?.value || null
      }

      const response = await axios.post(`${BACKEND_URL}/api/admin/update-slot`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status !== 200) throw new Error("Server rejected save")
      
      // Refresh database records and stats to ensure consistent state
      await get().fetchSlots()
      await get().fetchStats()
      await get().fetchMachines()
    } catch (error) {
      console.error("Failed to sync slot update with backend:", error)
    }
  },

  deleteSlot: async (id) => {
    const activeId = get().activeMachineId
    // 1. Optimistic UI update locally
    set(state => {
      const updatedSlots = { ...state.slots }
      delete updatedSlots[id]
      return { slots: updatedSlots }
    })

    // 2. Network sync deletion
    try {
      const response = await fetch(`${BACKEND_URL}/api/slots/delete/${id}?machine_id=${activeId}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error("Server rejected deletion")
      await get().fetchSlots()
      await get().fetchStats()
      await get().fetchMachines()
    } catch (error) {
      console.error("Failed to delete slot from backend:", error)
    }
  },

  resetSystem: async (machineId, password, confirmationText) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/system/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmation_text: confirmationText, machine_id: machineId })
      })
      const result = await response.json()
      if (response.ok && result.success) {
        if (machineId === get().activeMachineId) {
          await get().fetchSlots()
          await get().fetchStats()
        }
        await get().fetchMachines()
        return { success: true }
      } else {
        return { success: false, message: result.message || "Reset failed" }
      }
    } catch (error) {
      console.error("Reset API connection failed:", error)
      return { success: false, message: "Server connection failed" }
    }
  }
}))