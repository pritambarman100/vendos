import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Platform } from 'react-native'
import { COLORS, AVATAR_COLORS } from '../constants/colors'
import { useCartStore } from '../store/cartStore'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

export default function ProductCard({ product, index }) {
  const addItem  = useCartStore(s => s.addItem)
  const removeItem = useCartStore(s => s.removeItem)
  const items    = useCartStore(s => s.items)
  const inCart   = items[product.id]
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const isOos    = product.stock === 0
  const hasReachStockLimit = inCart && inCart.qty >= product.stock

  return (
    <LinearGradient
      colors={
        isOos 
          ? ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']
          : inCart 
            ? ['rgba(212, 255, 58, 0.75)', 'rgba(123, 110, 246, 0.4)'] 
            : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.02)']
      }
      style={[styles.cardOutline, isOos && { opacity: 0.55 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardInner}>

        {/* Image box with padding — floats inside card */}
        <View style={styles.imgPad}>
          <View style={[styles.imgBox, { backgroundColor: avatarBg }]}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.image} />
            ) : (
              <Text style={styles.avatar}>{product.name[0]}</Text>
            )}
            {product.offer && (
              <LinearGradient
                colors={['#22C55E', '#15803D']}
                style={styles.offerTag}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.offerTxt}>{product.offer}</Text>
              </LinearGradient>
            )}
            {isOos && (
              <View style={styles.oosLayer}>
                <Text style={styles.oosTxt}>OUT OF STOCK</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {!isOos && (
              <Text style={[styles.stockStatus, product.stock <= 3 && styles.lowStock]}>
                {product.stock <= 3 ? `${product.stock} left` : `${product.stock} in stock`}
              </Text>
            )}
          </View>

          {isOos ? (
            <View style={styles.disabledBtn}>
              <Text style={styles.disabledTxt}>Sold Out</Text>
            </View>
          ) : inCart ? (
            <View style={styles.qtyContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => removeItem(product.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{inCart.qty}</Text>
              <TouchableOpacity 
                style={[styles.qtyBtn, hasReachStockLimit && styles.qtyBtnDisabled]} 
                onPress={() => !hasReachStockLimit && addItem(product)}
                disabled={hasReachStockLimit}
                activeOpacity={0.7}
              >
                <Text style={[styles.qtyBtnTxt, hasReachStockLimit && { color: COLORS.muted }]}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtnContainer}
              onPress={() => addItem(product)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.accent, '#B6E61C']}
                style={styles.addBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.addBtnRow}>
                  <Feather name="shopping-bag" size={12} color="#0A0A0D" />
                  <Text style={styles.addTxt}>Add</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  cardOutline: {
    width: CARD_WIDTH,
    padding: 1.2,
    borderRadius: 18,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  cardInner: {
    backgroundColor: 'rgba(23, 23, 28, 0.85)',
    borderRadius: 17,
    overflow: 'hidden',
  },
  imgPad: {
    padding: 8,
    paddingBottom: 0,
  },
  imgBox: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  offerTxt: {
    fontSize: 9,
    fontWeight: '850',
    color: '#fff',
    textTransform: 'uppercase',
  },
  oosLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oosTxt: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
    paddingTop: 6,
  },
  name: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.accent,
  },
  stockStatus: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '600',
  },
  lowStock: {
    color: COLORS.warn,
    fontWeight: '700',
  },
  addBtnContainer: {
    borderRadius: 9,
    overflow: 'hidden',
  },
  addBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addTxt: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 12,
    fontWeight: '800',
    color: '#0A0A0D',
  },
  qtyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 110, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(123, 110, 246, 0.25)',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(123, 110, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: 'transparent',
  },
  qtyBtnTxt: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },
  qtyVal: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabledTxt: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
  },
})