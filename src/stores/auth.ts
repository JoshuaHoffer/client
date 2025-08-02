import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WalletConnection, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isLoading = ref(false)
  const showConnectModal = ref(false)
  const user = ref<User | null>(null)
  const walletConnection = ref<WalletConnection | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!walletConnection.value?.isConnected)
  const userAddress = computed(() => walletConnection.value?.address || '')
  const userRole = computed(() => user.value?.role || 'investor')
  const isManager = computed(() => user.value?.role === 'manager')

  // Actions
  const initializeAuth = async (): Promise<void> => {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      await restoreSession()
      isInitialized.value = true
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const connectWallet = async (walletType: string): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock wallet connection based on type
      const mockAddress = generateMockAddress(walletType)

      walletConnection.value = {
        address: mockAddress,
        chainId: 1, // Ethereum mainnet
        provider: walletType as 'metamask' | 'walletconnect' | 'coinbase',
        isConnected: true
      }

      // Mock user data - in real app this would come from API
      user.value = {
        id: `user_${Date.now()}`,
        address: mockAddress,
        role: mockAddress.endsWith('1') ? 'manager' : 'investor', // Demo: addresses ending in 1 are managers
        balance: 1250.50,
        joinedAt: new Date(),
        preferences: {
          dividendPayout: 'reinvest',
          reinvestmentPercentage: 70,
          notifications: {
            email: true,
            browser: true,
            dividends: true,
            transactions: true,
            priceAlerts: false
          }
        }
      }

      // Store connection in localStorage for persistence
      localStorage.setItem('wallet_connection', JSON.stringify({
        address: mockAddress,
        provider: walletType,
        timestamp: Date.now()
      }))

      showConnectModal.value = false

    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw new Error('Failed to connect wallet. Please try again.')
    } finally {
      isLoading.value = false
    }
  }

  const disconnect = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Clear state
      user.value = null
      walletConnection.value = null

      // Clear localStorage
      localStorage.removeItem('wallet_connection')
      localStorage.removeItem('user_preferences')

    } catch (error) {
      console.error('Disconnection failed:', error)
      throw new Error('Failed to disconnect wallet')
    } finally {
      isLoading.value = false
    }
  }

  const restoreSession = async (): Promise<void> => {
    try {
      const storedConnection = localStorage.getItem('wallet_connection')
      if (!storedConnection) return

      const connectionData = JSON.parse(storedConnection)

      // Check if connection is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - connectionData.timestamp > maxAge) {
        localStorage.removeItem('wallet_connection')
        return
      }

      // Restore wallet connection
      walletConnection.value = {
        address: connectionData.address,
        chainId: 1,
        provider: connectionData.provider,
        isConnected: true
      }

      // Restore user data (including preferences from localStorage if available)
      const storedPreferences = localStorage.getItem('user_preferences')
      const preferences = storedPreferences
        ? JSON.parse(storedPreferences)
        : {
          dividendPayout: 'reinvest',
          reinvestmentPercentage: 70,
          notifications: {
            email: true,
            browser: true,
            dividends: true,
            transactions: true,
            priceAlerts: false
          }
        }

      user.value = {
        id: `user_${connectionData.address}`,
        address: connectionData.address,
        role: connectionData.address.endsWith('1') ? 'manager' : 'investor',
        balance: 1250.50,
        joinedAt: new Date(connectionData.timestamp),
        preferences
      }

    } catch (error) {
      console.error('Session restoration failed:', error)
      // Clear corrupted data
      localStorage.removeItem('wallet_connection')
      localStorage.removeItem('user_preferences')
    }
  }

  const updateUserPreferences = async (preferences: Partial<User['preferences']>): Promise<void> => {
    if (!user.value) throw new Error('User not authenticated')

    isLoading.value = true

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      user.value.preferences = {
        ...user.value.preferences,
        ...preferences
      }

      // Store preferences in localStorage
      localStorage.setItem('user_preferences', JSON.stringify(user.value.preferences))

    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw new Error('Failed to update preferences')
    } finally {
      isLoading.value = false
    }
  }

  const switchNetwork = async (chainId: number): Promise<void> => {
    if (!walletConnection.value) throw new Error('No wallet connected')

    isLoading.value = true

    try {
      // Simulate network switch
      await new Promise(resolve => setTimeout(resolve, 1500))

      walletConnection.value.chainId = chainId

    } catch (error) {
      console.error('Network switch failed:', error)
      throw new Error('Failed to switch network')
    } finally {
      isLoading.value = false
    }
  }

  // New method to get user balance with currency conversion
  const getBalanceInCurrency = (currency: string = 'USD'): number => {
    if (!user.value) return 0

    // Mock currency conversion rates
    const conversionRates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'ETH': 0.0004,
      'BTC': 0.000025
    }

    const rate = conversionRates[currency.toUpperCase()] || 1
    return user.value.balance * rate
  }

  // Method to load additional user data
  const loadUserData = async (): Promise<void> => {
    if (!user.value) return

    isLoading.value = true

    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would fetch fresh data from the API
      // For now, we'll just update the balance with some mock variation
      const balanceVariation = (Math.random() - 0.5) * 100 // +/- $50 variation
      user.value.balance = Math.max(0, user.value.balance + balanceVariation)

    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Helper functions
  const generateMockAddress = (walletType: string): string => {
    const prefixes = {
      metamask: '0x1234',
      walletconnect: '0x5678',
      coinbase: '0x9abc'
    }

    const prefix = prefixes[walletType as keyof typeof prefixes] || '0x0000'
    const suffix = Math.random().toString(16).substring(2, 34).padEnd(32, '0')
    return prefix + suffix
  }

  return {
    // State
    isLoading,
    showConnectModal,
    user,
    walletConnection,
    isInitialized,

    // Getters
    isAuthenticated,
    userAddress,
    userRole,
    isManager,

    // Actions
    initializeAuth,
    connectWallet,
    disconnect,
    restoreSession,
    updateUserPreferences,
    switchNetwork,
    getBalanceInCurrency,
    loadUserData
  }
})