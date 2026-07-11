import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, FlatList,
  ScrollView, StyleSheet, StatusBar, Dimensions, ActivityIndicator, RefreshControl
} from 'react-native'
import { COLORS } from '../constants/colors'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

export default function ProductsScreen({ navigation }) {
  const selectedCategory = useProductStore(s => s.selectedCategory)
  const setCategory      = useProductStore(s => s.setCategory)
  const getFiltered      = useProductStore(s => s.getFiltered)
  const fetchProducts    = useProductStore(s => s.fetchProducts)
  const allProducts      = useProductStore(s => s.products)
  const itemsMap         = useCartStore(s => s.items)

  const [refreshing, setRefreshing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const totalQty         = Object.values(itemsMap).reduce((sum, i) => sum + i.qty, 0)
  const products         = getFiltered()

  useEffect(() => {
    fetchProducts().finally(() => setInitialLoading(false))
    const timer = setInterval(() => {
      fetchProducts()
    }, 5000)
    return () => clearInterval(timer)
  }, [fetchProducts])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProducts()
    setRefreshing(false)
  }

  // Compute unique categories dynamically from slots loaded from database
  const categories = ['All', ...new Set(allProducts.map(p => p.cat).filter(Boolean))]

  const renderProduct = ({ item, index }) => (
    <ProductCard product={item} index={index} />
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Our Products</Text>
          <Text style={styles.sub}>{products.length} items available</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtnContainer}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={totalQty > 0 ? [COLORS.purple, '#6353E6'] : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            style={[styles.cartBtn, totalQty > 0 && styles.cartBtnActive]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather 
              name="shopping-bag" 
              size={15} 
              color={totalQty > 0 ? '#fff' : COLORS.muted} 
              style={{ marginRight: 2 }}
            />
            <Text style={[styles.cartTxt, totalQty > 0 && { color: '#fff' }]}>Cart</Text>
            {totalQty > 0 && (
              <LinearGradient
                colors={[COLORS.accent, '#B6E61C']}
                style={styles.cartBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.cartNum}>{totalQty}</Text>
              </LinearGradient>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catContent}
        >
          {categories.map(cat => {
            const isActive = selectedCategory === cat
            return isActive ? (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.accent, '#B6E61C']}
                  style={styles.catActivePill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.catActiveTxt}>{cat}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={cat}
                style={styles.catPill}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={styles.catTxt}>{cat}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Loading & Products list */}
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Fetching products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="box" size={32} color={COLORS.muted} />
          </View>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySubtitle}>We couldn't load any products. Make sure your server is running and slots are enabled.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
              progressBackgroundColor={COLORS.surface}
            />
          }
        />
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 13, 0.9)',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  cartBtnContainer: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  cartBtnActive: {
    borderColor: 'rgba(123, 110, 246, 0.3)',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cartIcon: { fontSize: 14 },
  cartTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  cartBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  cartNum: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0A0A0D',
  },
  catContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 13, 0.5)',
  },
  catScroll: {
    maxHeight: 56,
  },
  catContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  catActivePill: {
    paddingHorizontal: 16,
    paddingVertical: 8, // accounts for the border thickness offset
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  catActiveTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A0A0D',
  },
  grid: {
    padding: 16,
    paddingTop: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
})