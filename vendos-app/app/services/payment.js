import { BASE_URL } from './api'

// Payment service
// For demo = simulate payment
// For production = connect Razorpay

export const payment = {
  // Generate UPI QR data
  generateQR: (amount, upiId = 'vendos@upi') => {
    return `upi://pay?pa=${upiId}&pn=VendOS&am=${amount}&cu=INR`
  },

  // Simulate payment verification (for demo)
  verifyPayment: async (orderId) => {
    // For demo — always returns success after 3 seconds
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionId: 'TXN' + Date.now() })
      }, 3000)
    })
  },

  // Real Razorpay verification (connect later)
  verifyRazorpay: async (paymentId, orderId, signature) => {
    try {
      const res = await fetch(`${BASE_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, orderId, signature }),
      })
      return await res.json()
    } catch (err) {
      console.log('Payment verification error:', err)
      return { success: false }
    }
  },
}