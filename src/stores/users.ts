import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useFundStore } from './fund'
import type {
  Transaction,
  InvestmentTransaction,
  DivestmentTransaction,
  DividendTransaction,
  UserDividend
} from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const isLoading = ref(false)
  const tesseractBalance = ref(1250.50)
  const walletBalances = ref({
    USDC: 5000.00,
    ETH: 2.5,
    BTC: 0.1,
    USDT: 3200.00
  })

  const transactions = ref<Transaction[]>([
    {
      id: 'tx_001',
      type: 'invest',
      amount: 1000,
      currency: 'USDC',
      price: 120.50,
      fee: 0,
      status: 'completed',
      hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456789',
      timestamp: new Date('2024-03-15T10:30:00Z'),
      userId: 'user_123'
    } as InvestmentTransaction & { tokensReceived: 8.30 },
    {
      id: 'tx_002',
      type: 'dividend',
      amount: 125.50,
      currency: 'USDC',
      price: 125.67,
      fee: 0,
      status: 'completed',
      timestamp: new Date('2024-03-01T09:00:00Z'),
      userId: 'user_123'
    } as DividendTransaction & { dividendRate: 0.85, reinvestmentAmount: 87.85, cashAmount: 37.65 },
    {
      id: 'tx_003',
      type: 'invest',
      amount: 500,
      currency: 'ETH',
      price: 118.75,
      fee: 0,
      status: 'completed',
      hash: '0x2345678901bcdef12345678901bcdef123456789012345678901bcdef1234567890',
      timestamp: new Date('2024-02-20T14:15:00Z'),
      userId: 'user_123'
    } as InvestmentTransaction & { tokensReceived: 4.21 }
  ])

  const dividendHistory = ref<UserDividend[]>([
    {
      distributionId: 'div_001',
      userId: 'user_123',
      tokensHeld: 1200,
      totalEarned: 102.00,
      reinvestedAmount: 71.40,
      cashAmount: 30.60,
      payoutMethod: 'mixed',
      processed: true
    },
    {
      distributionId: 'div_002',
      userId: 'user_123',
      tokensHeld: 1250,
      totalEarned: 115.00,
      reinvestedAmount: 80.50,
      cashAmount: 34.50,
      payoutMethod: 'mixed',
      processed: true
    }
  ])

  // Dependencies
  const authStore = useAuthStore()
  const fundStore = useFundStore()

  // Getters
  const totalPortfolioValue = computed(() => {
    return tesseractBalance.value * fundStore.fundData.tesseractPrice
  })

  const portfolioAllocation = computed(() => {
    if (!authStore.isAuthenticated) return []

    const userShare = tesseractBalance.value / fundStore.fundData.totalSupply

    return fundStore.assets.map(asset => ({
      ...asset,
      userValue: asset.value * userShare,
      userTokens: (asset.value * userShare) / getCurrentAssetPrice(asset.symbol)
    }))
  })

  const totalDividendsEarned = computed(() => {
    return dividendHistory.value.reduce((sum, dividend) => sum + dividend.totalEarned, 0)
  })

  const estimatedNextDividend = computed(() => {
    const nextDistribution = fundStore.nextDividend
    if (!nextDistribution) return 0
    return tesseractBalance.value * nextDistribution.ratePerToken
  })

  const recentTransactions = computed(() => {
    return transactions.value
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  })

  const investmentPerformance = computed(() => {
    const investments = transactions.value.filter(tx => tx.type === 'invest') as InvestmentTransaction[]
    const totalInvested = investments.reduce((sum, tx) => sum + tx.amount, 0)
    const currentValue = totalPortfolioValue.value

    if (totalInvested === 0) return { totalInvested: 0, currentValue: 0, profit: 0, returnPercent: 0 }

    const profit = currentValue - totalInvested
    const returnPercent = (profit / totalInvested) * 100

    return {
      totalInvested,
      currentValue,
      profit,
      returnPercent
    }
  })

  // Actions
  const loadUserData = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return

    isLoading.value = true

    try {
      // Simulate API call to load user data
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would fetch user-specific data from API
      // For demo, we're using the mock data already initialized

    } catch (error) {
      console.error('Failed to load user data:', error)
      throw new Error('Failed to load user data')
    } finally {
      isLoading.value = false
    }
  }

  const investInFund = async (amount: number, currency: string): Promise<Transaction> => {
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    const balance = walletBalances.value[currency as keyof typeof walletBalances.value]
    if (!balance || balance < amount) {
      throw new Error('Insufficient balance')
    }

    isLoading.value = true

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000))

      const currentPrice = fundStore.fundData.tesseractPrice
      const tokensReceived = amount / currentPrice

      // Create transaction record
      const transaction: InvestmentTransaction = {
        id: `tx_${Date.now()}`,
        type: 'invest',
        amount,
        currency,
        price: currentPrice,
        fee: 0,
        status: 'completed',
        hash: generateMockTxHash(),
        timestamp: new Date(),
        userId: authStore.user?.id || '',
        dividendRate: distribution.ratePerToken,
        reinvestmentAmount: reinvestAmount,
        cashAmount: cashAmount
      }

      // Update balances
      if (reinvestAmount > 0) {
        const additionalTokens = reinvestAmount / fundStore.fundData.tesseractPrice
        tesseractBalance.value += additionalTokens
      }

      if (cashAmount > 0) {
        walletBalances.value.USDC += cashAmount
      }

      // Add to transaction history
      transactions.value.unshift(transaction)

      // Update dividend history
      const existingDividend = dividendHistory.value.find(d => d.distributionId === distributionId)
      if (existingDividend) {
        existingDividend.processed = true
        existingDividend.totalEarned = dividendAmount
        existingDividend.reinvestedAmount = reinvestAmount
        existingDividend.cashAmount = cashAmount
      } else {
        dividendHistory.value.push({
          distributionId,
          userId: authStore.user?.id || '',
          tokensHeld: tesseractBalance.value,
          totalEarned: dividendAmount,
          reinvestedAmount: reinvestAmount,
          cashAmount: cashAmount,
          payoutMethod: userPrefs?.dividendPayout || 'mixed',
          processed: true
        })
      }

    } catch (error) {
      console.error('Dividend claim failed:', error)
      throw new Error('Failed to claim dividend')
    } finally {
      isLoading.value = false
    }
  }

  const updateDividendPreferences = async (preferences: {
    payoutMethod: string
    reinvestmentPercentage: number
  }): Promise<void> => {
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    isLoading.value = true

    try {
      // Update auth store preferences
      await authStore.updateUserPreferences({
        dividendPayout: preferences.payoutMethod as any,
        reinvestmentPercentage: preferences.reinvestmentPercentage
      })

    } catch (error) {
      console.error('Failed to update dividend preferences:', error)
      throw new Error('Failed to update dividend preferences')
    } finally {
      isLoading.value = false
    }
  }

  const getTransactionHistory = (
    type?: 'invest' | 'divest' | 'dividend',
    limit?: number
  ): Transaction[] => {
    let filtered = transactions.value

    if (type) {
      filtered = filtered.filter(tx => tx.type === type)
    }

    const sorted = filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return limit ? sorted.slice(0, limit) : sorted
  }

  const getBalanceInCurrency = (currency: string): number => {
    if (currency === 'TSRT') return tesseractBalance.value
    return walletBalances.value[currency as keyof typeof walletBalances.value] || 0
  }

  const refreshBalances = async (): Promise<void> => {
    if (!authStore.isAuthenticated) return

    isLoading.value = true

    try {
      // Simulate balance refresh from blockchain
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would query the blockchain for current balances
      // For demo, we'll add some small random variations
      Object.keys(walletBalances.value).forEach(currency => {
        const key = currency as keyof typeof walletBalances.value
        const variation = (Math.random() - 0.5) * 0.01 // ±0.5% variation
        walletBalances.value[key] *= (1 + variation)
      })

    } catch (error) {
      console.error('Failed to refresh balances:', error)
      throw new Error('Failed to refresh balances')
    } finally {
      isLoading.value = false
    }
  }

  const exportTransactionHistory = (format: 'csv' | 'json' = 'csv'): string => {
    if (format === 'json') {
      return JSON.stringify(transactions.value, null, 2)
    }

    // CSV format
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Price', 'Fee', 'Status', 'Hash']
    const rows = transactions.value.map(tx => [
      tx.timestamp.toISOString(),
      tx.type,
      tx.amount.toString(),
      tx.currency,
      tx.price.toString(),
      tx.fee.toString(),
      tx.status,
      tx.hash || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }

  // Helper functions
  const getCurrentAssetPrice = (symbol: string): number => {
    // Mock asset prices - in real app, this would come from price feeds
    const prices: Record<string, number> = {
      BTC: 51200,
      ETH: 3100,
      SOL: 95,
      AVAX: 32,
      USDC: 1,
      USDT: 1
    }
    return prices[symbol] || 1
  }

  const generateMockTxHash = (): string => {
    return '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  }

  const calculatePortfolioPerformance = (days: number) => {
    // Calculate performance over specified days
    // This would use historical data in a real app
    const baseReturn = Math.random() * 20 - 10 // Random return between -10% and +10%
    const volatility = Math.random() * 5 // Random volatility up to 5%

    return {
      return: baseReturn,
      volatility: volatility,
      sharpeRatio: volatility > 0 ? baseReturn / volatility : 0
    }
  }

  return {
    // State
    isLoading,
    tesseractBalance,
    walletBalances,
    transactions,
    dividendHistory,

    // Getters
    totalPortfolioValue,
    portfolioAllocation,
    totalDividendsEarned,
    estimatedNextDividend,
    recentTransactions,
    investmentPerformance,

    // Actions
    loadUserData,
    investInFund,
    divestFromFund,
    claimDividend,
    updateDividendPreferences,
    getTransactionHistory,
    getBalanceInCurrency,
    refreshBalances,
    exportTransactionHistory,
    calculatePortfolioPerformance
  }
})id || '',
  tokensReceived
      }

// Update balances
walletBalances.value[currency as keyof typeof walletBalances.value] -= amount
tesseractBalance.value += tokensReceived

// Add to transaction history
transactions.value.unshift(transaction)

return transaction
      
    } catch (error) {
  console.error('Investment failed:', error)
  throw new Error('Investment transaction failed')
} finally {
  isLoading.value = false
}
  }

const divestFromFund = async (tokenAmount: number, payoutCurrency: string): Promise<Transaction> => {
  if (!authStore.isAuthenticated) throw new Error('User not authenticated')

  if (tesseractBalance.value < tokenAmount) {
    throw new Error('Insufficient TSRT balance')
  }

  isLoading.value = true

  try {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000))

    const currentPrice = fundStore.fundData.tesseractPrice
    const exitFee = 0.005 // 0.5%
    const grossValue = tokenAmount * currentPrice
    const netValue = grossValue * (1 - exitFee)

    // Create transaction record
    const transaction: DivestmentTransaction = {
      id: `tx_${Date.now()}`,
      type: 'divest',
      amount: tokenAmount,
      currency: 'TSRT',
      price: currentPrice,
      fee: grossValue * exitFee,
      status: 'completed',
      hash: generateMockTxHash(),
      timestamp: new Date(),
      userId: authStore.user?.id || '',
      tokensRedeemed: tokenAmount,
      payoutCurrency
    }

    // Update balances
    tesseractBalance.value -= tokenAmount
    walletBalances.value[payoutCurrency as keyof typeof walletBalances.value] += netValue

    // Add to transaction history
    transactions.value.unshift(transaction)

    return transaction

  } catch (error) {
    console.error('Divestment failed:', error)
    throw new Error('Divestment transaction failed')
  } finally {
    isLoading.value = false
  }
}

const claimDividend = async (distributionId: string): Promise<void> => {
  if (!authStore.isAuthenticated) throw new Error('User not authenticated')

  isLoading.value = true

  try {
    // Simulate dividend claim process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const distribution = fundStore.dividendDistributions.find(d => d.id === distributionId)
    if (!distribution) throw new Error('Distribution not found')

    const dividendAmount = tesseractBalance.value * distribution.ratePerToken
    const userPrefs = authStore.user?.preferences
    const reinvestPercent = userPrefs?.reinvestmentPercentage || 70

    const reinvestAmount = dividendAmount * (reinvestPercent / 100)
    const cashAmount = dividendAmount - reinvestAmount

    // Create dividend transaction
    const transaction: DividendTransaction = {
      id: `tx_${Date.now()}`,
      type: 'dividend',
      amount: dividendAmount,
      currency: 'USDC',
      price: fundStore.fundData.tesseractPrice,
      fee: 0,
      status: 'completed',
      timestamp: new Date(),
      userId: authStore.user?.