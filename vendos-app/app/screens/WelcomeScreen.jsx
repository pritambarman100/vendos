import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Animated, Modal, TextInput } from 'react-native'
import { COLORS } from '../constants/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { loadBaseUrl, saveBaseUrl } from '../services/api'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen({ navigation }) {
  // Logo floating animation
  const floatAnim = useRef(new Animated.Value(0)).current
  // Bottom arrow bouncing animation
  const bounceAnim = useRef(new Animated.Value(0)).current

  const [showSettings, setShowSettings] = useState(false)
  const [tempUrl, setTempUrl] = useState('')

  useEffect(() => {
    // Load current base URL on mount
    loadBaseUrl().then(url => {
      setTempUrl(url)
    })
  }, [])

  const handleSaveSettings = async () => {
    await saveBaseUrl(tempUrl)
    setShowSettings(false)
  }

  useEffect(() => {
    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Settings button */}
      <TouchableOpacity 
        style={styles.settingsBtn} 
        onPress={() => {
          loadBaseUrl().then(url => {
            setTempUrl(url)
            setShowSettings(true)
          })
        }}
        activeOpacity={0.7}
      >
        <Feather name="settings" size={20} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>

      {/* Atmospheric glows from HTML configuration */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['rgba(205, 242, 0, 0.08)', 'transparent']}
          style={[styles.orb, { width: 300, height: 300, top: -100, left: -100 }]}
        />
        <LinearGradient
          colors={['rgba(198, 192, 255, 0.05)', 'transparent']}
          style={[styles.orb, { width: 300, height: 300, bottom: '10%', right: -50 }]}
        />
      </View>

      <View style={styles.content}>
        
        {/* Animated Brand Logo Box */}
        <View style={styles.brandContainer}>
          <Animated.View style={[styles.logoBox, { transform: [{ translateY: floatAnim }] }]}>
            <Feather name="zap" size={40} color="#181e00" />
          </Animated.View>
          <Text style={styles.title}>Vendos</Text>
          <Text style={styles.subtitle}>SMART VENDING</Text>
          <Text style={styles.tagline}>Fresh snacks and drinks, just a tap away</Text>
        </View>

        {/* Feature Cards Grid (3 Columns) */}
        <View style={styles.grid}>
          {/* Card 1: Instant Dispense */}
          <View style={styles.glassCard}>
            <Feather name="zap" size={26} color="#cdf200" style={styles.cardIcon} />
            <Text style={styles.cardText}>Instant Dispense</Text>
          </View>

          {/* Card 2: UPI Secure Pay */}
          <View style={styles.glassCard}>
            <Feather name="shield" size={26} color="#c6c0ff" style={styles.cardIcon} />
            <Text style={styles.cardText}>UPI Secure Pay</Text>
          </View>

          {/* Card 3: Great Offers */}
          <View style={styles.glassCard}>
            <Feather name="percent" size={26} color="#00dbe9" style={styles.cardIcon} />
            <Text style={styles.cardText}>Great Offers</Text>
          </View>
        </View>

        {/* Start Shopping Button (Full lime container) */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('Products')}
          activeOpacity={0.9}
        >
          <Text style={styles.startTxt}>START SHOPPING</Text>
          <Feather name="arrow-right" size={20} color="#181e00" style={styles.btnArrow} />
        </TouchableOpacity>

        {/* Bottom bounce indicator and Availability */}
        <View style={styles.bottomSection}>
          <Animated.View style={[styles.scrollBtn, { transform: [{ translateY: bounceAnim }] }]}>
            <Feather name="arrow-down" size={18} color="#8f9378" />
          </Animated.View>
          <View style={styles.hoursRow}>
            <Feather name="clock" size={14} color="rgba(229, 226, 225, 0.6)" />
            <Text style={styles.hoursTxt}>Available 8 AM – 10 PM</Text>
          </View>
        </View>

      </View>

      {/* Developer settings modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#17171C', '#0E0E12']}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.modalTitle}>Developer Settings</Text>
            <Text style={styles.modalLabel}>Backend Server URL</Text>
            
            <TextInput
              style={styles.ipInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://10.244.110.218:5000"
              placeholderTextColor="rgba(255, 255, 255, 0.25)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            
            <Text style={styles.modalInfo}>
              Ensure your phone and backend server PC are on the same Wi-Fi network.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowSettings(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveSettings}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    position: 'relative',
  },
  settingsBtn: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#cdf200', // primary-container
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#cdf200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c5c9ac', // text-on-surface-variant
    letterSpacing: 2,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#e5e2e1',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 26,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  glassCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardIcon: {
    marginBottom: 2,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e2e1',
    textAlign: 'center',
    lineHeight: 16,
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#cdf200',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    shadowColor: '#cdf200',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  startTxt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181e00', // on-primary-fixed
    letterSpacing: -0.3,
  },
  btnArrow: {
    fontWeight: '900',
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
  },
  scrollBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#454932',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursTxt: {
    fontSize: 12,
    color: 'rgba(229, 226, 225, 0.6)',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c5c9ac',
    marginBottom: 8,
  },
  ipInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
  },
  modalInfo: {
    fontSize: 11,
    color: '#8f9378',
    lineHeight: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e5e2e1',
  },
  saveBtn: {
    backgroundColor: '#cdf200',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181e00',
  },
})