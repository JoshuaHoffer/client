<template>
  <div class="space-y-8">
    <!-- Portfolio Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="mb-4 lg:mb-0">
          <h1 class="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
          <p class="text-gray-600 mt-1">Track your Tesseract Fund investment performance</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="userStore.refreshBalances"
            :disabled="userStore.isLoading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            @click="exportData"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Connect Wallet Prompt -->
    <div v-if="!authStore.isAuthenticated" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div class="flex-1">
          <h3 class="text-lg font-medium text-blue-900">Connect Your Wallet</h3>
          <p class="text-blue-700 mt-1">Connect your wallet to view your portfolio details and transaction history.</p>
        </div>
        <button
          @click="authStore.showConnectModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>

    <div v-if="authStore.isAuthenticated">
      <!-- Portfolio Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portfolio Value"
          :value="userStore.totalPortfolioValue"
          :change="userStore.investmentPerformance.returnPercent"
          change-unit="%"
          change-period="Total return"
          color="blue"
        />
        
        <StatCard
          title="TSRT Holdings"
          :value="userStore.tesseractBalance"
          :subtitle="`${((userStore.tesseractBalance / fundStore.fundData.totalSupply) * 100).toFixed(3)}% of fund`"
          color="green"
        />
        
        <StatCard
          title="Total Invested"
          :value="userStore.investmentPerformance.totalInvested"
          subtitle="Lifetime investments"
          color="purple"
        />
        
        <StatCard
          title="Unrealized P&L"
          :value="Math.abs(userStore.investmentPerformance.profit)"
          :change="userStore.investmentPerformance.returnPercent"
          change-unit="%"
          :color="userStore.investmentPerformance.profit >= 0 ? 'green' : 'red'"
        />
      </div>

      <!-- Portfolio Allocation -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Your Share of Fund Assets -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Share of Fund Assets</h2>
          <div class="space-y-4">
            <div v-for="allocation in userStore.portfolioAllocation" :key="allocation.symbol" 
                 class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-white font-bold text-sm">{{ allocation.symbol.slice(0, 2) }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ allocation.name }}</div>
                  <div class="text-sm text-gray-500">{{ allocation.allocation }}% allocation</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">${{ formatNumber(allocation.userValue) }}</div>
                <div class="text-sm text-gray-500">{{ formatNumber(allocation.userTokens) }} {{ allocation.symbol }}</div>
                <div class="text-xs" :class="allocation.change24h >= 0 ? 'text-success-600' : 'text-danger-600'">
                  {{ allocation.change24h >= 0 ? '+' : '' }}{{ allocation.change24h.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Balances -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Wallet Balances</h2>
            <button
              @click="userStore.refreshBalances"
              :disabled="userStore.isLoading"
              class="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400"
            >
              {{ userStore.isLoading ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white font-bold text-xs">T</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">TSRT</div>
                  <div class="text-xs text-gray-500">Tesseract Token</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">{{ userStore.tesseractBalance.toFixed(4) }}</div>
                <div class="text-xs text-gray-500">${{ (userStore.tesseractBalance * fundStore.fundData.tesseractPrice).toFixed(2) }}</div>
              </div>
            </div>
            
            <div v-for="(balance, currency) in userStore.walletBalances" :key="currency" 
                 class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white font-bold text-xs">{{ currency.slice(0, 2) }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ currency }}</div>
                  <div class="text-xs text-gray-500">{{ getCurrencyName(currency) }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">{{ balance.toFixed(4) }}</div>
                <div class="text-xs text-gray-500">${{ (balance * getCurrencyRate(currency)).toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fund Holdings & Pegged Tokens -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Fund Holdings & Pegged Tokens</h2>
          <div class="flex space-x-2">
            <button
              v-for="view in viewOptions"
              :key="view.value"
              @click="selectedView = view.value"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="selectedView === view.value 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              {{ view.label }}
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund Holdings</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Share</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pegged Token</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="asset in fundStore.assets" :key="asset.symbol" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                      <span class="text-white font-bold text-sm">{{ asset.symbol.slice(0, 2) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ asset.name }}</div>
                      <div class="text-sm text-gray-500">{{ asset.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ formatLargeNumber(asset.value) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ formatNumber(getUserShareValue(asset)) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ asset.allocation }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="asset.change24h >= 0 ? 'text-success-600' : 'text-danger-600'">
                    {{ asset.change24h >= 0 ? '+' : '' }}{{ asset.change24h.toFixed(2) }}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm text-gray-900 mr-2">{{ asset.peggedToken }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      1:1
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Chart -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
            <select v-model="performancePeriod" class="text-sm border-gray-300 rounded-md">
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="font-medium">Performance Chart</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ performancePeriod }} return: {{ userStore.investmentPerformance.returnPercent.toFixed(1) }}%
              </p>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div class="text-center">
              <div class="text-gray-500">Return</div>
              <div class="font-semibold" :class="userStore.investmentPerformance.returnPercent >= 0 ? 'text-success-600' : 'text-danger-600'">
                {{ userStore.investmentPerformance.returnPercent.toFixed(1) }}%
              </div>
            </div>
            <div class="text-center">
              <div class="text-gray-500">vs Fund</div>
              <div class="font-semibold text-gray-900">0.0%</div>
            </div>
            <div class="text-center">
              <div class="text-gray-500">vs Market</div>
              <div class="font-semibold text-success-600">+2.3%</div>
            </div>
          </div>
        </div>

        <!-- Dividend Summary -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Dividend Summary</h2>
            <router-link to="/dividends" class="text-sm text-primary-600 hover:text-primary-700">
              View Details →
            </router-link>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-blue-700 font-medium">Next Dividend</span>
                <span class="text-blue-600 text-sm">{{ formatDate(fundStore.nextDividend?.distributionDate) }}</span>
              </div>
              <div class="text-2xl font-bold text-blue-900">
                ${{ userStore.estimatedNextDividend.toFixed(2) }}
              </div>
              <div class="text-blue-700 text-sm">
                Based on {{ userStore.tesseractBalance.toFixed(2) }} TSRT @ ${{ fundStore.nextDividend?.ratePerToken.toFixed(3) }}/token
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900">
                  ${{ userStore.totalDividendsEarned.toFixed(2) }}
                </div>
                <div class="text-sm text-gray-600">Total Earned</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900">
                  {{ userStore.dividendHistory.length }}
                </div>
                <div class="text-sm text-gray-600">Payments</div>
              </div>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Recent Dividends</h4>
              <div v-for="dividend in userStore.dividendHistory.slice(-3)" :key="dividend.distributionId" 
                   class="flex justify-between text-sm">
                <span class="text-gray-600">{{ getDistributionPeriod(dividend.distributionId) }}</span>
                <span class="font-medium text-gray-900">${{ dividend.totalEarned.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Transaction History</h2>
          <div class="flex space-x-2">
            <select v-model="transactionFilter" class="text-sm border-gray-300 rounded-md">
              <option value="all">All Transactions</option>
              <option value="invest">Investments</option>
              <option value="divest">Divestments</option>
              <option value="dividend">Dividends</option>
            </select>
            <button
              @click="exportTransactions"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in filteredTransactionHistory" :key="transaction.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(transaction.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getTransactionTypeClass(transaction.type)">
                    {{ transaction.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transaction.amount.toFixed(4) }} {{ transaction.currency }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ transaction.price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ transaction.fee.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusClass(transaction.status)">
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a v-if="transaction.hash" 
                     :href="`https://etherscan.io/tx/${transaction.hash}`" 
                     target="_blank"
                     class="text-primary-600 hover:text-primary-800 font-mono">
                    {{ transaction.hash.slice(0, 8) }}...
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredTransactionHistory.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ transactionFilter === 'all' ? 'Start investing to see your transaction history.' : `No ${transactionFilter} transactions found.` }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useFundStore } from '@/stores/fund'
import { useUserStore } from '@/stores/user'
import StatCard from '@/components/common/StatCard.vue'

// Stores
const authStore = useAuthStore()
const fundStore = useFundStore()
const userStore = useUserStore()
const toast = useToast()

// Local state
const selectedView = ref('holdings')
const performancePeriod = ref('30d')
const transactionFilter = ref('all')

const viewOptions = [
  { label: 'Holdings', value: 'holdings' },
  { label: 'Pegged Tokens', value: 'pegged' }
]

// Computed
const filteredTransactionHistory = computed(() => {
  if (transactionFilter.value === 'all') {
    return userStore.getTransactionHistory()
  }
  return userStore.getTransactionHistory(transactionFilter.value as any)
})

// Methods
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
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
  return formatNumber(value)
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const getCurrencyName = (currency: string): string => {
  const names: Record<string, string> = {
    USDC: 'USD Coin',
    ETH: 'Ethereum',
    BTC: 'Bitcoin',
    USDT: 'Tether'
  }
  return names[currency] || currency
}

const getCurrencyRate = (currency: string): number => {
  const rates: Record<string, number> = {
    USDC: 1,
    USDT: 1,
    ETH: 3100,
    BTC: 51200
  }
  return rates[currency] || 1
}

const getUserShareValue = (asset: any): number => {
  const userShare = userStore.tesseractBalance / fundStore.fundData.totalSupply
  return asset.value * userShare
}

const getDistributionPeriod = (distributionId: string): string => {
  const distribution = fundStore.dividendDistributions.find(d => d.id === distributionId)
  return distribution?.period || 'Unknown'
}

const getTransactionTypeClass = (type: string): string => {
  switch (type) {
    case 'invest':
      return 'bg-success-100 text-success-800'
    case 'divest':
      return 'bg-warning-100 text-warning-800'
    case 'dividend':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-success-100 text-success-800'
    case 'pending':
      return 'bg-warning-100 text-warning-800'
    case 'failed':
      return 'bg-danger-100 text-danger-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const exportData = () => {
  try {
    const data = {
      portfolio: {
        totalValue: userStore.totalPortfolioValue,
        tesseractBalance: userStore.tesseractBalance,
        performance: userStore.investmentPerformance
      },
      allocation: userStore.portfolioAllocation,
      walletBalances: userStore.walletBalances,
      transactions: userStore.getTransactionHistory()
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tesseract-portfolio-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Portfolio data exported successfully!')
  } catch (error) {
    toast.error('Failed to export portfolio data')
  }
}

const exportTransactions = () => {
  try {
    const csv = userStore.exportTransactionHistory('csv')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tesseract-transactions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Transaction history exported successfully!')
  } catch (error) {
    toast.error('Failed to export transaction history')
  }
}
</script>