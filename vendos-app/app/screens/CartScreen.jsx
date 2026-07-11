import {
  View, Text, TouchableOpacity,
  FlatList, StyleSheet, StatusBar, Animated
} from 'react-native'
import { useEffect, useRef } from 'react'
import { COLORS } from '../constants/colors'
import { useCartStore } from '../store/cartStore'
import CartItem from '../components/CartItem'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

export default function CartScreen({ navigation }) {
  const itemsMap   = useCartStore(s => s.items)
  const insets     = useSafeAreaInsets()

  const items = Object.values(itemsMap)

  // Compute pricing dynamically for real-time selector updates
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

  const slideAnim = useRef(new Animated.Value(0)).current
  const checkoutArrowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Back button loop
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

    // Checkout arrow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(checkoutArrowAnim, {
          toValue: 4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(checkoutArrowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

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
            <Text style={styles.backLabel}>Products</Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
      </View>

      {/* Items */}
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTxt}>Your shopping cart is empty</Text>
          <TouchableOpacity
            style={styles.emptyShopBtn}
            onPress={() => navigation.navigate('Products')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyShopBtnTxt}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={({ item, index }) => (
            <CartItem item={item} index={index} />
          )}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Discount row */}
      {discount > 0 && (
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.02)']}
          style={styles.discCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.discLabel}>🎉 Special promotion applied!</Text>
          <Text style={styles.discVal}>-₹{discount}</Text>
        </LinearGradient>
      )}

      {/* Total + Pay */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {items.length > 0 && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']}
            style={styles.receiptCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>₹{subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Special Discount</Text>
              <Text style={[styles.totalVal, { color: COLORS.success, fontWeight: '750' }]}>-₹{discount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={styles.grandLabel}>Total Amount</Text>
              <Text style={styles.grandVal}>₹{total}</Text>
            </View>
          </LinearGradient>
        )}
        <TouchableOpacity
          style={[styles.payBtnContainer, items.length === 0 && { opacity: 0.4 }]}
          disabled={items.length === 0}
          onPress={() => items.length > 0 && navigation.navigate('Payment')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#cdf200', '#B6E61C']}
            style={styles.payBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.payTxt}>PROCEED TO CHECKOUT</Text>
            <View style={styles.payArrowBox}>
              <Animated.View style={{ transform: [{ translateX: checkoutArrowAnim }] }}>
                <Feather name="arrow-right" size={16} color="#181e00" />
              </Animated.View>
            </View>
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 30,
  },
  emptyIcon: { fontSize: 54 },
  emptyTxt: { fontSize: 15, color: COLORS.muted, fontWeight: '600' },
  emptyShopBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(212, 255, 58, 0.05)',
  },
  emptyShopBtnTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
  },
  list: { padding: 16 },
  discCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  discLabel: { fontSize: 12, color: COLORS.success, fontWeight: '700' },
  discVal: { fontSize: 14, fontWeight: '800', color: COLORS.success },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
    backgroundColor: 'rgba(10, 10, 13, 0.9)',
  },
  receiptCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  totalVal: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  grandLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  grandVal: { fontSize: 18, fontWeight: '900', color: COLORS.accent },
  payBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#cdf200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  payBtn: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  payTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181e00', // on-primary-fixed
    letterSpacing: -0.3,
  },
  payArrowBox: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(24, 30, 0, 0.08)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})