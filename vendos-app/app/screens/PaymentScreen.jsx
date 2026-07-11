import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Image, Animated
} from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { COLORS } from '../constants/colors'
import { useCartStore } from '../store/cartStore'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PaymentScreen({ navigation }) {
  const itemsMap = useCartStore(s => s.items)
  const insets   = useSafeAreaInsets()
  const [secs, setSecs] = useState(299)
  const slideAnim = useRef(new Animated.Value(0)).current

  const items = Object.values(itemsMap)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  let discount = 0
  items.forEach(i => {
    if (i.offer === 'Buy 2 Get 1' && i.qty >= 2) {
      discount += i.price
    } else if (i.offer === '10% OFF') {
      discount += Math.round(i.price * i.qty * 0.1)
    } else if (i.offer === '15% OFF') {
      discount += Math.round(i.price * i.qty * 0.15)
    }
  })
  const total = subtotal - discount

  useEffect(() => {
    // Loop arrow slide
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start()

    const t = setInterval(() => {
      setSecs(s => {
        if (s <= 0) { clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const mins = Math.floor(secs / 60)
  const sec  = secs % 60
  const timerTxt = `${mins}:${sec < 10 ? '0' : ''}${sec}`

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 38 }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.backRow, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.backTxt}>←</Text>
            <Text style={styles.backLabel}>Cart</Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Checkout</Text>
      </View>

      <View style={styles.body}>

        {/* Amount */}
        <View style={styles.amtBox}>
          <Text style={styles.amtLabel}>Amount to Pay</Text>
          <Text style={styles.amt}>₹{total}</Text>
        </View>

        {/* QR Code with scanning frame */}
        <View style={styles.qrOuterFrame}>
          {/* Corner Markers for scanner style */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          <View style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <View style={styles.qrGrid}>
                {[...Array(7)].map((_, r) => (
                  <View key={r} style={styles.qrRow}>
                    {[...Array(7)].map((_, c) => (
                      <View
                        key={c}
                        style={[
                          styles.qrCell,
                          ((r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)) && styles.qrFill
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.qrHint}>Scan QR with any UPI App to Pay</Text>

        {/* UPI apps */}
        <View style={styles.upiContainer}>
          <Text style={styles.sectionTitle}>Supported Apps</Text>
          <View style={styles.upiRow}>
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
              <LinearGradient
                key={app}
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)']}
                style={styles.upiApp}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.upiTxt}>{app}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Timer */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.12)', 'rgba(245, 158, 11, 0.02)']}
          style={styles.timerBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.timerLabel}>⏱ Session expires in </Text>
          <Text style={styles.timerVal}>{timerTxt}</Text>
        </LinearGradient>

        {/* Payment done button */}
        <TouchableOpacity
          style={styles.doneBtnContainer}
          onPress={() => navigation.navigate('Dispensing')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.success, '#16A34A']}
            style={styles.doneBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.doneTxt}>✓  Payment Done</Text>
            <Text style={styles.doneSubTxt}>Dispense order now</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16, // dynamic padding added inline in component
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 13, 0.9)',
  },
  backBtn: {
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  backTxt: { 
    fontSize: 16, 
    color: COLORS.accent, 
    fontWeight: '900',
    marginTop: -2,
  },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  body: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    gap: 20,
    justifyContent: 'center',
  },
  amtBox: { alignItems: 'center', marginBottom: 8 },
  amtLabel: {
    fontSize: 12,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  amt: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accent,
    textShadowColor: 'rgba(212, 255, 58, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  qrOuterFrame: {
    position: 'relative',
    padding: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.accent,
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  qrWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: 172,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  qrBox: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrGrid: { gap: 4 },
  qrRow: { flexDirection: 'row', gap: 4 },
  qrCell: {
    width: 15, height: 15,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  qrFill: { backgroundColor: '#0A0A0D' },
  qrHint: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    marginBottom: 4,
  },
  upiContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  upiRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  upiApp: {
    flex: 1,
    maxWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  upiTxt: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  timerLabel: { fontSize: 12, color: COLORS.warn, fontWeight: '600' },
  timerVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.warn,
  },
  doneBtnContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneBtn: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  doneTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  doneSubTxt: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '650',
  },
})