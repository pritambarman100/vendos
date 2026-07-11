import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { COLORS, AVATAR_COLORS } from '../constants/colors'
import { useCartStore } from '../store/cartStore'
import { LinearGradient } from 'expo-linear-gradient'

export default function CartItem({ item, index }) {
  const addItem    = useCartStore(s => s.addItem)
  const removeItem = useCartStore(s => s.removeItem)
  const avatarBg   = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const hasReachStockLimit = item.qty >= item.stock

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.04)']}
      style={styles.itemOutline}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.itemInner}>
        <View style={styles.avatarContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price} each</Text>
          {item.offer && (
            <View style={styles.offerTag}>
              <Text style={styles.offerTxt}>🎉 {item.offer}</Text>
            </View>
          )}
        </View>
        <View style={styles.qtyRow}>
          <TouchableOpacity 
            style={styles.qBtn} 
            onPress={() => removeItem(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.qBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.qty}</Text>
          <TouchableOpacity 
            style={[styles.qBtn, hasReachStockLimit && styles.qtyBtnDisabled]} 
            onPress={() => !hasReachStockLimit && addItem(item)}
            disabled={hasReachStockLimit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.qBtnText, hasReachStockLimit && { color: COLORS.muted }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  itemOutline: {
    padding: 1.2,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 23, 28, 0.85)',
    borderRadius: 13,
    padding: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
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
    borderRadius: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  price: { 
    fontSize: 12, 
    color: COLORS.muted,
    fontWeight: '600',
  },
  offerTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  offerTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.success,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  qBtnText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
  },
  qty: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    minWidth: 20,
    textAlign: 'center',
  },
})