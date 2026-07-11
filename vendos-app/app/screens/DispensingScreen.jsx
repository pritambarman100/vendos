import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Animated, Dimensions, Image, ScrollView
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { COLORS, AVATAR_COLORS } from '../constants/colors'
import { useCartStore } from '../store/cartStore'
import { useProductStore } from '../store/productStore'
import { api } from '../services/api'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

function DispenseItem({ item, index, delay }) {
  const progress = useRef(new Animated.Value(0)).current
  const [isDone, setIsDone] = useState(false)
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length]

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: false,
      }).start(() => {
        setIsDone(true)
      })
    }, delay)
  }, [])

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <LinearGradient
      colors={isDone ? ['rgba(34, 197, 94, 0.16)', 'rgba(34, 197, 94, 0.02)'] : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.02)']}
      style={[styles.itemOutline, isDone && styles.itemOutlineDone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.itemInner}>
        <View style={styles.avatarContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarTxt}>{item.name[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name} ×{item.qty}</Text>
          <Text style={[styles.statusText, isDone && { color: COLORS.success }]}>
            {isDone ? 'Completed' : 'Dispensing...'}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.barWrap}>
            <Animated.View style={[styles.bar, { width: widthInterpolate }]}>
              <LinearGradient
                colors={['#22C55E', '#4ADE80']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          {isDone && <Text style={styles.doneCheck}>✓</Text>}
        </View>
      </View>
    </LinearGradient>
  )
}

export default function DispensingScreen({ navigation }) {
  const itemsMap   = useCartStore(s => s.items)
  const clearCart  = useCartStore(s => s.clearCart)
  const updateStock  = useProductStore(s => s.updateStock)
  const insets     = useSafeAreaInsets()

  const items = Object.values(itemsMap)

  // Compute discount dynamically
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

  useEffect(() => {
    // Update stock locally in the store
    items.forEach(item => updateStock(item.id, item.qty))

    // Process transactions asynchronously
    const sendTransactions = async () => {
      let itemDiscount = 0
      if (items.length > 0) {
        itemDiscount = Math.floor(discount / items.length)
      }

      for (const item of items) {
        try {
          const pricePaid = Math.max(0, (item.price * item.qty) - itemDiscount)
          console.log(`Sending dispense transaction to Flask: Slot ${item.id}, Qty ${item.qty}, Paid ₹${pricePaid}`)
          const res = await api.processTransaction(item.id, item.qty, pricePaid)
          console.log(`Dispense transaction response for ${item.id}:`, res)
        } catch (error) {
          console.error(`Failed to process transaction for item ${item.id}:`, error)
        }
      }
    }

    sendTransactions()
  }, [])

  const handleNewOrder = () => {
    clearCart()
    navigation.navigate('Welcome')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Ambient background glowing orbs using LinearGradient */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.14)', 'transparent']}
          style={[styles.orb, { width: width * 1.0, height: width * 1.0, top: '25%', left: '0%' }]}
        />
      </View>

      <View style={styles.body}>

        {/* Check icon */}
        <View style={styles.checkRing}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Enjoy your order!</Text>
        <Text style={styles.sub}>Collect from the bottom tray</Text>

        {/* Scrollable list to prevent footer overflow */}
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.dispList}>
            {items.map((item, i) => (
              <DispenseItem
                key={item.id}
                item={item}
                index={i}
                delay={i * 2000}
              />
            ))}
          </View>
        </ScrollView>

        <Text style={styles.tray}>↓  Dispensing in progress below</Text>

      </View>

      {/* Sticky Bottom Footer containing New Order button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.newBtnContainer}
          onPress={handleNewOrder}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#cdf200', '#B6E61C']}
            style={styles.newBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.newBtnRow}>
              <Feather name="refresh-cw" size={15} color="#181e00" />
              <Text style={styles.newTxt}>New Order</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, position: 'relative' },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.85,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    zIndex: 1,
  },
  checkRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
  },
  checkIcon: { 
    fontSize: 40, 
    color: COLORS.success, 
    fontWeight: '800',
    textShadowColor: 'rgba(34, 197, 94, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: -8,
  },
  dispList: {
    width: '100%',
    gap: 10,
    marginVertical: 12,
  },
  itemOutline: {
    padding: 1.2,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  itemOutlineDone: {
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 23, 28, 0.75)',
    borderRadius: 13,
    padding: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 9,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barWrap: {
    width: 70,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  doneCheck: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '950',
  },
  tray: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  scrollArea: {
    flex: 1,
    width: '100%',
    marginTop: 8,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 13, 0.95)',
  },
  newBtnContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#cdf200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  newBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181e00',
  },
})