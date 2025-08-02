<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-2">
            Welcome {{ authStore.isAuthenticated ? 'back' : 'to Tesseract Fund' }}
          </h1>
          <p class="text-primary-100">
            {{ authStore.isAuthenticated 
              ? getWelcomeMessage() 
              : 'Professional crypto fund management with automated trading strategies' 
            }}
          </p>
        </div>
        <div v-if="!authStore.isAuthenticated" class="hidden sm:block">
          <button
            @click="authStore.showConnectModal = true"
            class="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tesseract Price"
        :value="formatCurrency(fundStore.fundData.tesseractPrice)"
        :change="fundStore.fundData.dailyChange"
        change-unit="%"
        change-period="24h"
        color="blue"
        :format-value="false"
      />
      
      <StatCard
        title="Total AUM"
        :value="fundStore.fundData.totalAUM"
        :change="fundStore.fundData.monthlyChange"
        change-unit="%"
        change-period="30d"
        color="green"
      />
      
      <StatCard
        v-if="authStore.isAuthenticated"
        title="Your Holdings"
        :value="userStore.tesseractBalance"
        :change="userStore.investmentPerformance.returnPercent"
        change-unit="%"
        change-period="All time"
        :subtitle="formatCurrency(userStore.totalPortfolioValue)"
        color="purple"
        clickable
        @click="$router.push('/portfolio')"
      />
      
      <StatCard
        v-else
        title="30-Day Return"
        :value="fundStore.fundData.monthlyChange"
        change-unit="%"
        color="purple"
        :format-value="false"
      />
      
      <StatCard
        title="Active Strategies"
        :value="tradingStore.activeBots.length"
        :subtitle="`${tradingStore.tradingBots.length} total bots`"
        color="orange"
        :format-value="false"
        clickable
        @click="$router.push('/bots')"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Performance Chart -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Fund Performance</h2>
          <div class="flex space-x-2">
            <button
              v-for="period in timePeriods"
              :key="period"
              @click="selectedPeriod = period"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="selectedPeriod === period 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p class="font-medium">Performance Chart</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ selectedPeriod }} return: {{ fundStore.fundData.monthlyChange.toFixed(1) }}%
            </p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="text-gray-500">TSRT</div>
            <div class="font-semibold text-primary-600">{{ fundStore.fundData.dailyChange.toFixed(1) }}%</div>
          </div>
          <div class="text-center">
            <div class="text-gray-500">vs BTC</div>
            <div class="font-semibold text-gray-900">+2.1%</div>
          </div>
          <div class="text-center">
            <div class="text-gray-500">vs ETH</div>
            <div class="font-semibold text-gray-900">+1.8%</div>
          </div>
        </div>
      </div>

      <!-- Portfolio Allocation -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h2>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
          <div class="text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p class="font-medium">Portfolio Distribution</p>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="(asset, index) in fundStore.assets" :key="asset.symbol" class="flex justify-between items-center">
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-3" 
                :style="{ backgroundColor: getAssetColor(index) }"
              ></div>
              <div>
                <div class="text-sm font-medium">{{ asset.symbol }}</div>
                <div class="text-xs text-gray-500">{{ asset.name }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">{{ asset.allocation }}%</div>
              <div class="text-xs text-gray-500">${{ formatLargeNumber(asset.value) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <button
            v-if="authStore.isAuthenticated"
            @click="$router.push('/invest')"
            class="w-full flex items-center justify-center px-4 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invest Now
          </button>
          
          <button
            v-if="authStore.isAuthenticated && userStore.tesseractBalance > 0"
            @click="$router.push('/invest')"
            class="w-full flex items-center justify-center px-4 py-3 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            Divest
          </button>

          <button
            v-if="!authStore.isAuthenticated"
            @click="authStore.showConnectModal = true"
            class="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Wallet
          </button>
          
          <button
            @click="$router.push('/portfolio')"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>

          <button
            v-if="authStore.isAuthenticated && fundStore.nextDividend"
            @click="$router.push('/dividends')"
            class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Next Dividend: ${{ userStore.estimatedNextDividend.toFixed(2) }}
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/portfolio" 
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </router-link>
        </div>
        
        <div v-if="authStore.isAuthenticated" class="space-y-4">
          <div v-for="transaction in userStore.recentTransactions.slice(0, 5)" :key="transaction.id" 
               class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :class="getTransactionIconBg(transaction.type)">
                <component :is="getTransactionIcon(transaction.type)" class="w-5 h-5" :class="getTransactionIconColor(transaction.type)" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ getTransactionTitle(transaction) }}</p>
                <p class="text-xs text-gray-500">{{ formatRelativeTime(transaction.timestamp) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium" :class="getTransactionAmountColor(transaction)">
                {{ formatTransactionAmount(transaction) }}
              </p>
              <p class="text-xs text-gray-500">{{ transaction.status }}</p>
            </div>
          </div>
          
          <div v-if="userStore.recentTransactions.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No recent activity</p>
            <p class="text-xs text-gray-400 mt-1">Your transactions will appear here</p>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p class="text-gray-500 mb-4">Connect your wallet to view your investment activity and portfolio performance</p>
          <button
            @click="authStore.showConnectModal = true"
            class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>

    <!-- Trading Bots Overview (if authenticated) -->
    <div v-if="authStore.isAuthenticated" class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Trading Bots Performance</h2>
          <p class="text-sm text-gray-500">24h profit: {{ formatCurrency(tradingStore.totalProfit24h) }}</p>
        </div>
        <router-link to="/bots" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Manage Bots →
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="bot in tradingStore.tradingBots" :key="bot.id" class="border rounded-lg p-4 hover:border-primary-300 transition-colors">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-gray-900 text-sm">{{ bot.name }}</h3>
            <span 
              class="px-2 py-1 text-xs rounded-full font-medium"
              :class="getBotStatusBadge(bot.status)"
            >
              {{ bot.status }}
            </span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">24h Profit:</span>
              <span :class="bot.profit24h >= 0 ? 'text-success-600' : 'text-danger-600'">
                {{ bot.profit24h >= 0 ? '+' : '' }}{{ formatCurrency(bot.profit24h) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Win Rate:</span>
              <span>{{ bot.winRate.toFixed(1) }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Trades:</span>
              <span>{{ bot.trades24h }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFundStore } from '@/stores/fund'
import { useUserStore } from '@/stores/user'
import { useTradingStore } from '@/stores/trading'
import StatCard from '@/components/common/StatCard.vue'
import type { Transaction } from '@/types'

// Stores
const authStore = useAuthStore()
const fundStore = useFundStore()
const userStore = useUserStore()
const tradingStore = useTradingStore()

// Local state
const selectedPeriod = ref('30D')
const timePeriods = ['7D', '30D', '90D', '1Y']

// Asset colors for pie chart legend
const assetColors = ['#F7931A', '#627EEA', '#00FFA3', '#E84142', '#8B5CF6']

// Computed
const portfolioChange = computed(() => {
  return userStore.investmentPerformance.returnPercent
})

// Methods
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

const getAssetColor = (index: number): string => {
  return assetColors[index % assetColors.length]
}

const getWelcomeMessage = (): string => {
  const change = portfolioChange.value
  if (change >= 0) {
    return `Your portfolio is up ${change.toFixed(1)}% since your first investment`
  } else {
    return `Stay strong! Markets are volatile but our strategies are working`
  }
}

const getTransactionTitle = (transaction: Transaction): string => {
  switch (transaction.type) {
    case 'invest':
      return 'Investment'
    case 'divest':
      return 'Divestment'
    case 'dividend':
      return 'Dividend Received'
    default:
      return 'Transaction'
  }
}

const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'invest':
      return 'TrendingUpIcon'
    case 'divest':
      return 'TrendingDownIcon'
    case 'dividend':
      return 'CurrencyDollarIcon'
    default:
      return 'CircleIcon'
  }
}

const getTransactionIconBg = (type: string): string => {
  switch (type) {
    case 'invest':
      return 'bg-success-100'
    case 'divest':
      return 'bg-warning-100'
    case 'dividend':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
}

const getTransactionIconColor = (type: string): string => {
  switch (type) {
    case 'invest':
      return 'text-success-600'
    case 'divest':
      return 'text-warning-600'
    case 'dividend':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const getTransactionAmountColor = (transaction: Transaction): string => {
  switch (transaction.type) {
    case 'invest':
      return 'text-success-600'
    case 'divest':
      return 'text-warning-600'
    case 'dividend':
      return 'text-success-600'
    default:
      return 'text-gray-900'
  }
}

const formatTransactionAmount = (transaction: Transaction): string => {
  switch (transaction.type) {
    case 'invest':
      return `+${transaction.amount.toFixed(2)} ${transaction.currency}`
    case 'divest':
      return `-${transaction.amount.toFixed(2)} ${transaction.currency}`
    case 'dividend':
      return `+${formatCurrency(transaction.amount)}`
    default:
      return `${transaction.amount.toFixed(2)} ${transaction.currency}`
  }
}

const getBotStatusBadge = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-success-100 text-success-800'
    case 'paused':
      return 'bg-warning-100 text-warning-800'
    case 'stopped':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      userStore.loadUserData(),
      tradingStore.loadTradingData()
    ])
  }
  await fundStore.loadFundData()
})
</script>