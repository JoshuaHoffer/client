import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FundData, PerformanceData, Asset, PeggedToken, DividendDistribution } from '@/types'

export const useFundStore = defineStore('fund', () => {
  // State
  const isLoading = ref(false)
  const fundData = ref<FundData>({
    totalAUM: 2847392,
    tesseractPrice: 125.67,
    totalSupply: 100000,
    performanceData: [],
    dailyChange: 8.3,
    monthlyChange: 24.5,
    yearlyChange: 87.2
  })

  const assets = ref<Asset[]>([
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      allocation: 45,
      value: 1283750,
      change24h: 5.2,
      peggedToken: 'pBTC',
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      allocation: 25,
      value: 712100,
      change24h: 7.8,
      peggedToken: 'pETH',
      contractAddress: '0x2345678901bcdef12345678901bcdef123456789'
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      allocation: 15,
      value: 427108,
      change24h: -2.1,
      peggedToken: 'pSOL',
      contractAddress: '0x3456789012cdef123456789012cdef1234567890'
    },
    {
      name: 'Avalanche',
      symbol: 'AVAX',
      allocation: 10,
      value: 284739,
      change24h: 12.4,
      peggedToken: 'pAVAX',
      contractAddress: '0x456789013def1234567890123def12345678901'
    },
    {
      name: 'Other Assets',
      symbol: 'OTHER',
      allocation: 5,
      value: 142369,
      change24h: 3.6,
      peggedToken: 'Various',
      contractAddress: undefined
    }
  ])

  const peggedTokens = ref<PeggedToken[]>([
    {
      symbol: 'pBTC',
      name: 'Pegged Bitcoin',
      ratio: 1.0,
      totalSupply: 28.5,
      backingAsset: 'BTC',
      contractAddress: '0x567890124ef123456789012345ef123456789012'
    },
    {
      symbol: 'pETH',
      name: 'Pegged Ethereum',
      ratio: 1.0,
      totalSupply: 245.8,
      backingAsset: 'ETH',
      contractAddress: '0x6789012345f1234567890123456f1234567890123'
    },
    {
      symbol: 'pSOL',
      name: 'Pegged Solana',
      ratio: 1.0,
      totalSupply: 1250.0,
      backingAsset: 'SOL',
      contractAddress: '0x789012346f123456789012346f12345678901234'
    },
    {
      symbol: 'pAVAX',
      name: 'Pegged Avalanche',
      ratio: 1.0,
      totalSupply: 890.3,
      backingAsset: 'AVAX',
      contractAddress: '0x8901234567f12345678901234567f123456789012'
    }
  ])

  const dividendDistributions = ref<DividendDistribution[]>([
    {
      id: 'div_001',
      period: '2024-01',
      ratePerToken: 0.85,
      totalAmount: 85000,
      distributionDate: new Date('2024-02-01'),
      eligibleTokens: 100000,
      status: 'completed'
    },
    {
      id: 'div_002',
      period: '2024-02',
      ratePerToken: 0.92,
      totalAmount: 92000,
      distributionDate: new Date('2024-03-01'),
      eligibleTokens: 100000,
      status: 'completed'
    },
    {
      id: 'div_003',
      period: '2024-03',
      ratePerToken: 0.78,
      totalAmount: 78000,
      distributionDate: new Date('2024-04-01'),
      eligibleTokens: 100000,
      status: 'scheduled'
    }
  ])

  // Performance data for charts
  const performanceData = ref<PerformanceData[]>([
    { date: '2024-01-01', tesseract: 98.5, btc: 42000, eth: 2500, volume: 125000 },
    { date: '2024-01-15', tesseract: 105.2, btc: 44500, eth: 2650, volume: 142000 },
    { date: '2024-02-01', tesseract: 112.8, btc: 46200, eth: 2750, volume: 156000 },
    { date: '2024-02-15', tesseract: 118.4, btc: 48900, eth: 2920, volume: 167000 },
    { date: '2024-03-01', tesseract: 125.67, btc: 51200, eth: 3100, volume: 178000 }
  ])

  // Getters
  const navPerShare = computed(() => {
    return fundData.value.totalAUM / fundData.value.totalSupply
  })

  const totalMarketCap = computed(() => {
    return fundData.value.tesseractPrice * fundData.value.totalSupply
  })

  const performanceMetrics = computed(() => {
    const data = performanceData.value
    if (data.length < 2) return null

    const latest = data[data.length - 1]
    const previous = data[data.length - 2]

    return {
      tesseractReturn: ((latest.tesseract - previous.tesseract) / previous.tesseract) * 100,
      btcReturn: ((latest.btc - previous.btc) / previous.btc) * 100,
      ethReturn: ((latest.eth - previous.eth) / previous.eth) * 100,
      volumeChange: ((latest.volume - previous.volume) / previous.volume) * 100
    }
  })

  const nextDividend = computed(() => {
    return dividendDistributions.value.find(d => d.status === 'scheduled') || null
  })

  const lastDividend = computed(() => {
    const completed = dividendDistributions.value
      .filter(d => d.status === 'completed')
      .sort((a, b) => new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime())
    return completed[0] || null
  })

  // Actions
  const loadFundData = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would fetch data from API
      // For now, we'll simulate some price updates
      updatePrices()

    } catch (error) {
      console.error('Failed to load fund data:', error)
      throw new Error('Failed to load fund data')
    } finally {
      isLoading.value = false
    }
  }

  const refreshPrices = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate price refresh
      await new Promise(resolve => setTimeout(resolve, 500))
      updatePrices()

    } catch (error) {
      console.error('Failed to refresh prices:', error)
      throw new Error('Failed to refresh prices')
    } finally {
      isLoading.value = false
    }
  }

  const rebalancePortfolio = async (newAllocations: Record<string, number>): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate rebalancing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update asset allocations
      assets.value.forEach(asset => {
        if (newAllocations[asset.symbol]) {
          asset.allocation = newAllocations[asset.symbol]
          asset.value = (fundData.value.totalAUM * asset.allocation) / 100
        }
      })

    } catch (error) {
      console.error('Portfolio rebalancing failed:', error)
      throw new Error('Portfolio rebalancing failed')
    } finally {
      isLoading.value = false
    }
  }

  const mintPeggedTokens = async (asset: string, amount: number): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 1500))

      const peggedToken = peggedTokens.value.find(p => p.backingAsset === asset)
      if (peggedToken) {
        peggedToken.totalSupply += amount
      }

    } catch (error) {
      console.error('Pegged token minting failed:', error)
      throw new Error('Pegged token minting failed')
    } finally {
      isLoading.value = false
    }
  }

  const processDividendDistribution = async (distributionId: string): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate dividend processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      const distribution = dividendDistributions.value.find(d => d.id === distributionId)
      if (distribution && distribution.status === 'scheduled') {
        distribution.status = 'completed'
        distribution.distributionDate = new Date()
      }

    } catch (error) {
      console.error('Dividend distribution failed:', error)
      throw new Error('Dividend distribution failed')
    } finally {
      isLoading.value = false
    }
  }

  const getPerformanceData = (period: string): PerformanceData[] => {
    // In a real app, this would filter data based on the period
    // For demo purposes, return all data
    return performanceData.value
  }

  const getAssetBySymbol = (symbol: string): Asset | undefined => {
    return assets.value.find(asset => asset.symbol === symbol)
  }

  const getPeggedTokenBySymbol = (symbol: string): PeggedToken | undefined => {
    return peggedTokens.value.find(token => token.symbol === symbol)
  }

  // Helper functions
  const updatePrices = () => {
    // Simulate price fluctuations
    const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
    fundData.value.tesseractPrice *= (1 + priceVariation)

    // Update daily change
    fundData.value.dailyChange = (Math.random() - 0.5) * 20 // ±10% range

    // Update asset values
    assets.value.forEach(asset => {
      const variation = (Math.random() - 0.5) * 0.04 // ±2% variation
      asset.change24h = variation * 100
      asset.value *= (1 + variation)
    })

    // Update total AUM
    fundData.value.totalAUM = assets.value.reduce((sum, asset) => sum + asset.value, 0)
  }

  // Initialize performance data in fund data
  fundData.value.performanceData = performanceData.value

  return {
    // State
    isLoading,
    fundData,
    assets,
    peggedTokens,
    dividendDistributions,
    performanceData,

    // Getters
    navPerShare,
    totalMarketCap,
    performanceMetrics,
    nextDividend,
    lastDividend,

    // Actions
    loadFundData,
    refreshPrices,
    rebalancePortfolio,
    mintPeggedTokens,
    processDividendDistribution,
    getPerformanceData,
    getAssetBySymbol,
    getPeggedTokenBySymbol
  }
})