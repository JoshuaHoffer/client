import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TradingBot, Trade } from '@/types'

export const useTradingStore = defineStore('trading', () => {
  // State
  const isLoading = ref(false)

  const tradingBots = ref<TradingBot[]>([
    {
      id: 'bot_001',
      name: 'Arbitrage Alpha',
      strategy: 'Cross-exchange arbitrage with automated execution',
      status: 'active',
      profit24h: 284.52,
      profitTotal: 12847.30,
      trades24h: 23,
      tradesTotal: 1847,
      winRate: 73.2,
      maxDrawdown: 5.8,
      createdAt: new Date('2024-01-15'),
      lastTradeAt: new Date('2024-03-20T14:30:00Z')
    },
    {
      id: 'bot_002',
      name: 'DCA Strategy Bot',
      strategy: 'Dollar-cost averaging with market timing optimization',
      status: 'active',
      profit24h: 192.18,
      profitTotal: 8934.67,
      trades24h: 8,
      tradesTotal: 892,
      winRate: 68.4,
      maxDrawdown: 3.2,
      createdAt: new Date('2024-01-20'),
      lastTradeAt: new Date('2024-03-20T16:45:00Z')
    },
    {
      id: 'bot_003',
      name: 'Momentum Trader',
      strategy: 'Trend-following with technical indicator signals',
      status: 'paused',
      profit24h: -43.20,
      profitTotal: 5621.89,
      trades24h: 12,
      tradesTotal: 634,
      winRate: 45.8,
      maxDrawdown: 12.4,
      createdAt: new Date('2024-02-01'),
      lastTradeAt: new Date('2024-03-19T22:15:00Z')
    },
    {
      id: 'bot_004',
      name: 'Mean Reversion Bot',
      strategy: 'Statistical arbitrage using price mean reversion',
      status: 'active',
      profit24h: 342.67,
      profitTotal: 15923.44,
      trades24h: 31,
      tradesTotal: 2156,
      winRate: 81.3,
      maxDrawdown: 4.6,
      createdAt: new Date('2024-01-10'),
      lastTradeAt: new Date('2024-03-20T17:20:00Z')
    }
  ])

  const trades = ref<Trade[]>([
    {
      id: 'trade_001',
      botId: 'bot_001',
      pair: 'BTC/USDC',
      side: 'buy',
      amount: 0.25,
      price: 51200,
      profit: 45.30,
      timestamp: new Date('2024-03-20T14:30:00Z'),
      status: 'completed'
    },
    {
      id: 'trade_002',
      botId: 'bot_004',
      pair: 'ETH/USDC',
      side: 'sell',
      amount: 2.5,
      price: 3100,
      profit: 78.20,
      timestamp: new Date('2024-03-20T14:25:00Z'),
      status: 'completed'
    },
    {
      id: 'trade_003',
      botId: 'bot_002',
      pair: 'SOL/USDC',
      side: 'buy',
      amount: 50,
      price: 95.40,
      profit: 12.80,
      timestamp: new Date('2024-03-20T14:20:00Z'),
      status: 'completed'
    },
    {
      id: 'trade_004',
      botId: 'bot_003',
      pair: 'AVAX/USDC',
      side: 'sell',
      amount: 15,
      price: 32.10,
      profit: -8.50,
      timestamp: new Date('2024-03-20T14:15:00Z'),
      status: 'completed'
    },
    {
      id: 'trade_005',
      botId: 'bot_001',
      pair: 'BTC/USDC',
      side: 'buy',
      amount: 0.1,
      price: 51150,
      profit: 0,
      timestamp: new Date('2024-03-20T17:30:00Z'),
      status: 'pending'
    }
  ])

  // Getters
  const activeBots = computed(() => {
    return tradingBots.value.filter(bot => bot.status === 'active')
  })

  const totalProfit24h = computed(() => {
    return tradingBots.value.reduce((sum, bot) => sum + bot.profit24h, 0)
  })

  const totalProfitAllTime = computed(() => {
    return tradingBots.value.reduce((sum, bot) => sum + bot.profitTotal, 0)
  })

  const totalTrades24h = computed(() => {
    return tradingBots.value.reduce((sum, bot) => sum + bot.trades24h, 0)
  })

  const averageWinRate = computed(() => {
    if (tradingBots.value.length === 0) return 0
    const totalWinRate = tradingBots.value.reduce((sum, bot) => sum + bot.winRate, 0)
    return totalWinRate / tradingBots.value.length
  })

  const bestPerformingBot = computed(() => {
    return tradingBots.value.reduce((best, current) =>
      current.profit24h > best.profit24h ? current : best
    )
  })

  const recentTrades = computed(() => {
    return trades.value
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
  })

  const profitableTrades = computed(() => {
    return trades.value.filter(trade => trade.profit > 0)
  })

  const profitabilityRate = computed(() => {
    if (trades.value.length === 0) return 0
    return (profitableTrades.value.length / trades.value.length) * 100
  })

  // Actions
  const loadTradingData = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would fetch data from trading API
      updateBotMetrics()

    } catch (error) {
      console.error('Failed to load trading data:', error)
      throw new Error('Failed to load trading data')
    } finally {
      isLoading.value = false
    }
  }

  const startBot = async (botId: string): Promise<void> => {
    const bot = tradingBots.value.find(b => b.id === botId)
    if (!bot) throw new Error('Bot not found')

    isLoading.value = true

    try {
      // Simulate bot startup
      await new Promise(resolve => setTimeout(resolve, 2000))

      bot.status = 'active'
      bot.lastTradeAt = new Date()

    } catch (error) {
      console.error('Failed to start bot:', error)
      throw new Error('Failed to start trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const stopBot = async (botId: string): Promise<void> => {
    const bot = tradingBots.value.find(b => b.id === botId)
    if (!bot) throw new Error('Bot not found')

    isLoading.value = true

    try {
      // Simulate bot shutdown
      await new Promise(resolve => setTimeout(resolve, 1500))

      bot.status = 'stopped'

    } catch (error) {
      console.error('Failed to stop bot:', error)
      throw new Error('Failed to stop trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const pauseBot = async (botId: string): Promise<void> => {
    const bot = tradingBots.value.find(b => b.id === botId)
    if (!bot) throw new Error('Bot not found')

    isLoading.value = true

    try {
      // Simulate bot pause
      await new Promise(resolve => setTimeout(resolve, 1000))

      bot.status = 'paused'

    } catch (error) {
      console.error('Failed to pause bot:', error)
      throw new Error('Failed to pause trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const configureBotSettings = async (
    botId: string,
    settings: Record<string, any>
  ): Promise<void> => {
    const bot = tradingBots.value.find(b => b.id === botId)
    if (!bot) throw new Error('Bot not found')

    isLoading.value = true

    try {
      // Simulate configuration update
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, this would update bot configuration
      console.log(`Updated settings for ${bot.name}:`, settings)

    } catch (error) {
      console.error('Failed to configure bot:', error)
      throw new Error('Failed to configure trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const createNewBot = async (botConfig: {
    name: string
    strategy: string
    parameters: Record<string, any>
  }): Promise<TradingBot> => {
    isLoading.value = true

    try {
      // Simulate bot creation
      await new Promise(resolve => setTimeout(resolve, 3000))

      const newBot: TradingBot = {
        id: `bot_${Date.now()}`,
        name: botConfig.name,
        strategy: botConfig.strategy,
        status: 'stopped',
        profit24h: 0,
        profitTotal: 0,
        trades24h: 0,
        tradesTotal: 0,
        winRate: 0,
        maxDrawdown: 0,
        createdAt: new Date(),
        lastTradeAt: undefined
      }

      tradingBots.value.push(newBot)
      return newBot

    } catch (error) {
      console.error('Failed to create bot:', error)
      throw new Error('Failed to create trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const deleteBot = async (botId: string): Promise<void> => {
    const botIndex = tradingBots.value.findIndex(b => b.id === botId)
    if (botIndex === -1) throw new Error('Bot not found')

    isLoading.value = true

    try {
      // Simulate bot deletion
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Remove bot and its trades
      tradingBots.value.splice(botIndex, 1)
      trades.value = trades.value.filter(trade => trade.botId !== botId)

    } catch (error) {
      console.error('Failed to delete bot:', error)
      throw new Error('Failed to delete trading bot')
    } finally {
      isLoading.value = false
    }
  }

  const getBotById = (botId: string): TradingBot | undefined => {
    return tradingBots.value.find(bot => bot.id === botId)
  }

  const getTradesByBot = (botId: string): Trade[] => {
    return trades.value.filter(trade => trade.botId === botId)
  }

  const getBotPerformanceData = (botId: string, days: number = 30) => {
    // In a real app, this would fetch historical performance data
    // For demo, generate mock data
    const bot = getBotById(botId)
    if (!bot) return []

    const data = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const profit = (Math.random() - 0.3) * 100 // Slightly positive bias

      data.push({
        date: date.toISOString().split('T')[0],
        profit: profit,
        trades: Math.floor(Math.random() * 20),
        winRate: 50 + (Math.random() - 0.5) * 40 // 30-70% range
      })
    }

    return data
  }

  const getAggregatedStats = (period: 'day' | 'week' | 'month' = 'day') => {
    // Calculate aggregated statistics across all bots
    const multiplier = period === 'day' ? 1 : period === 'week' ? 7 : 30

    return {
      totalProfit: totalProfit24h.value * multiplier,
      totalTrades: totalTrades24h.value * multiplier,
      averageWinRate: averageWinRate.value,
      activeBots: activeBots.value.length,
      totalBots: tradingBots.value.length,
      profitabilityRate: profitabilityRate.value
    }
  }

  // Helper functions
  const updateBotMetrics = () => {
    // Simulate real-time updates to bot metrics
    tradingBots.value.forEach(bot => {
      if (bot.status === 'active') {
        // Small random variations in daily metrics
        const profitVariation = (Math.random() - 0.5) * 50
        bot.profit24h += profitVariation
        bot.profitTotal += Math.max(0, profitVariation) // Only add positive profits to total

        // Occasionally add trades
        if (Math.random() < 0.3) {
          bot.trades24h += Math.floor(Math.random() * 3) + 1
          bot.tradesTotal += 1
          bot.lastTradeAt = new Date()
        }

        // Slight win rate adjustments
        const winRateChange = (Math.random() - 0.5) * 2
        bot.winRate = Math.max(0, Math.min(100, bot.winRate + winRateChange))
      }
    })
  }

  const simulateNewTrade = (botId: string) => {
    const pairs = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'AVAX/USDC']
    const sides: ('buy' | 'sell')[] = ['buy', 'sell']

    const newTrade: Trade = {
      id: `trade_${Date.now()}`,
      botId,
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      side: sides[Math.floor(Math.random() * sides.length)],
      amount: Math.random() * 10,
      price: Math.random() * 50000 + 1000,
      profit: (Math.random() - 0.3) * 100, // Slightly positive bias
      timestamp: new Date(),
      status: 'completed'
    }

    trades.value.unshift(newTrade)

    // Keep only recent trades to prevent memory issues
    if (trades.value.length > 1000) {
      trades.value = trades.value.slice(0, 500)
    }
  }

  return {
    // State
    isLoading,
    tradingBots,
    trades,

    // Getters
    activeBots,
    totalProfit24h,
    totalProfitAllTime,
    totalTrades24h,
    averageWinRate,
    bestPerformingBot,
    recentTrades,
    profitableTrades,
    profitabilityRate,

    // Actions
    loadTradingData,
    startBot,
    stopBot,
    pauseBot,
    configureBotSettings,
    createNewBot,
    deleteBot,
    getBotById,
    getTradesByBot,
    getBotPerformanceData,
    getAggregatedStats,
    simulateNewTrade
  }
})