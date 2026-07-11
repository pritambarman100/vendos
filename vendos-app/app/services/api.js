import AsyncStorage from '@react-native-async-storage/async-storage'

// Base URL of your backend (default fallback)
export let BASE_URL = 'http://10.244.110.218:5000'

export const loadBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem('BACKEND_URL')
    if (saved) {
      BASE_URL = saved
    }
  } catch (err) {
    console.log('Error loading backend URL:', err)
  }
  return BASE_URL
}

export const saveBaseUrl = async (url) => {
  try {
    let cleanUrl = url.trim()
    if (cleanUrl) {
      // Remove trailing slash
      if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1)
      }

      // Add http:// if no protocol
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `http://${cleanUrl}`
      }

      // Auto-append port :5000 if not present
      const protocolLength = cleanUrl.startsWith('https://') ? 8 : 7;
      const hostAndPort = cleanUrl.substring(protocolLength);
      if (!hostAndPort.includes(':')) {
        cleanUrl = `${cleanUrl}:5000`
      }
    }
    await AsyncStorage.setItem('BACKEND_URL', cleanUrl)
    BASE_URL = cleanUrl
    console.log('Backend URL saved:', cleanUrl)
  } catch (err) {
    console.log('Error saving backend URL:', err)
  }
}

export const api = {
  // Get all slots/products from backend
  getProducts: async () => {
    try {
      await loadBaseUrl()
      const res = await fetch(`${BASE_URL}/api/slots`)
      return await res.json()
    } catch (err) {
      console.log('Backend not connected, using local data:', err)
      return null
    }
  },

  // Send order to backend after payment
  sendOrder: async (items, total) => {
    try {
      await loadBaseUrl()
      const res = await fetch(`${BASE_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total }),
      })
      return await res.json()
    } catch (err) {
      console.log('Order API error:', err)
      return null
    }
  },

  // Process a slot transaction on backend (updates inventory, logs sale, triggers hardware motor)
  processTransaction: async (slotId, quantity, pricePaid) => {
    try {
      await loadBaseUrl()
      const res = await fetch(`${BASE_URL}/api/transactions/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: slotId,
          quantity: quantity,
          price_paid: pricePaid
        }),
      })
      return await res.json()
    } catch (err) {
      console.log('Transaction process API error:', err)
      return null
    }
  },

  // Trigger motor dispense
  dispense: async (slots) => {
    try {
      await loadBaseUrl()
      const res = await fetch(`${BASE_URL}/api/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      })
      return await res.json()
    } catch (err) {
      console.log('Dispense API error:', err)
      return null
    }
  },
}