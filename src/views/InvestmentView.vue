<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h1 class="text-2xl font-bold text-gray-900">Investment Center</h1>
          <p class="text-gray-600 mt-1">Invest in or divest from the Tesseract Fund</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div class="text-center sm:text-right">
            <p class="text-sm text-gray-600">Current TSRT Price</p>
            <p class="text-xl font-bold text-gray-900">${{ fundStore.fundData.tesseractPrice.toFixed(2) }}</p>
            <p class="text-sm" :class="fundStore.fundData.dailyChange >= 0 ? 'text-success-600' : 'text-danger-600'">
              {{ fundStore.fundData.dailyChange >= 0 ? '+' : '' }}{{ fundStore.fundData.dailyChange.toFixed(2) }}% (24h)
            </p>
          </div>
          <button
            @click="fundStore.refreshPrices"
            :disabled="fundStore.isLoading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
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
          <p class="text-blue-700 mt-1">You need to connect your wallet to invest in or divest from the Tesseract Fund.</p>
        </div>
        <button
          @click="authStore.showConnectModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>

    <!-- Investment/Divestment Panels -->
    <div v-if="authStore.isAuthenticated" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Investment Panel -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="bg-gradient-to-r from-success-500 to-success-600 px-6 py-4">
          <h2 class="text-xl font-semibold text-white flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invest in Tesseract
          </h2>
          <p class="text-success-100 mt-1">Purchase TSRT tokens to join the fund</p>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Investment Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Investment Amount</label>
            <div class="relative">
              <select 
                v-model="investmentCurrency" 
                class="absolute left-3 top-3 border-0 bg-transparent text-sm font-medium z-10 focus:outline-none"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
                <option value="USDT">USDT</option>
              </select>
              <input
                v-model="investmentAmount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                class="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-success-500 focus:border-success-500"
              />
            </div>
            <div class="flex justify-between text-sm mt-2">
              <span class="text-gray-500">
                Balance: {{ userStore.getBalanceInCurrency(investmentCurrency).toFixed(4) }} {{ investmentCurrency }}
              </span>
              <button 
                @click="setMaxInvestment"
                class="text-success-600 hover:text-success-700 font-medium"
              >
                Use Max
              </button>
            </div>
          </div>

          <!-- Investment Preview -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">You will receive:</span>
              <span class="font-medium text-gray-900">{{ calculateTesseractTokens() }} TSRT</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Exchange rate:</span>
              <span class="text-gray-900">1 TSRT = ${{ fundStore.fundData.tesseractPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Management fee:</span>
              <span class="text-gray-900">2% annually</span>
            </div>
            <div class="border-t border-gray-200 pt-3">
              <div class="flex justify-between text-sm font-medium">
                <span class="text-gray-900">Total cost:</span>
                <span class="text-gray-900">${{ getInvestmentCostUSD().toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Investment Button -->
          <button
            @click="handleInvestment"
            :disabled="!canInvest || userStore.isLoading"
            class="w-full py-3 px-4 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="userStore.isLoading" class="flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" class="mr-2" />
              Processing Investment...
            </span>
            <span v-else>Invest Now</span>
          </button>

          <!-- Investment Info -->
          <div class="text-xs text-gray-500 space-y-1">
            <p>• Minimum investment: $10 USD equivalent</p>
            <p>• Investments are processed immediately</p>
            <p>• Management fee is calculated daily</p>
          </div>
        </div>
      </div>

      <!-- Divestment Panel -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="bg-gradient-to-r from-warning-500 to-warning-600 px-6 py-4">
          <h2 class="text-xl font-semibold text-white flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            Divest from Tesseract
          </h2>
          <p class="text-warning-100 mt-1">Sell your TSRT tokens and withdraw funds</p>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Divestment Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TSRT Amount to Sell</label>
            <input
              v-model="divestmentAmount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              :max="userStore.tesseractBalance"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-warning-500 focus:border-warning-500"
            />
            <div class="flex justify-between text-sm mt-2">
              <span class="text-gray-500">
                Balance: {{ userStore.tesseractBalance.toFixed(4) }} TSRT
              </span>
              <div class="flex space-x-2">
                <button
                  v-for="percent in [25, 50, 75, 100]"
                  :key="percent"
                  @click="setDivestmentPercent(percent)"
                  class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  {{ percent }}%
                </button>
              </div>
            </div>
          </div>

          <!-- Payout Currency -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Receive Payment In</label>
            <select 
              v-model="divestmentCurrency" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-warning-500"
            >
              <option value="USDC">USDC (Stablecoin)</option>
              <option value="ETH">ETH (Ethereum)</option>
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="mixed">Mixed Assets (Proportional)</option>
              <option value="pegged">Pegged Tokens (pBTC, pETH, etc.)</option>
            </select>
          </div>
          
          <!-- Divestment Preview -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Gross value:</span>
              <span class="font-medium text-gray-900">${{ calculateDivestmentValue().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Exit fee (0.5%):</span>
              <span class="text-gray-900">-${{ (calculateDivestmentValue() * 0.005).toFixed(2) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-3">
              <div class="flex justify-between text-sm font-medium">
                <span class="text-gray-900">Net amount:</span>
                <span class="text-gray-900">${{ (calculateDivestmentValue() * 0.995).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Divestment Button -->
          <button
            @click="handleDivestment"
            :disabled="!canDivest || userStore.isLoading"
            class="w-full py-3 px-4 bg-warning-600 text-white rounded-lg font-medium hover:bg-warning-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="userStore.isLoading" class="flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" class="mr-2" />
              Processing Divestment...
            </span>
            <span v-else>Divest Now</span>
          </button>

          <!-- Divestment Info -->
          <div class="text-xs text-gray-500 space-y-1">
            <p>• Minimum divestment: 1 TSRT</p>
            <p>• 0.5% exit fee applies to all divestments</p>
            <p>• Funds are transferred immediately</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div v-if="authStore.isAuthenticated" class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <div class="flex space-x-2">
          <button
            v-for="filter in transactionFilters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="selectedFilter === filter.value 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-gray-500 hover:text-gray-700'"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getTransactionBadgeClass(transaction.type)"
                  >
                    {{ transaction.type }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transaction.amount.toFixed(4) }} {{ transaction.currency }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${{ transaction.price.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusBadgeClass(transaction.status)"
                >
                  {{ transaction.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a 
                  v-if="transaction.hash"
                  :href="`https://etherscan.io/tx/${transaction.hash}`"
                  target="_blank"
                  class="text-primary-600 hover:text-primary-800 font-mono"
                >
                  {{ transaction.hash.slice(0, 10) }}...
                </a>
                <span v-else class="text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredTransactions.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ selectedFilter === 'all' ? 'You haven\'t made any transactions yet.' : `No ${selectedFilter} transactions found.` }}
        </p>
      </div>
    </div>

    <!-- Portfolio Summary -->
    <div v-if="authStore.isAuthenticated" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Invested"
        :value="userStore.investmentPerformance.totalInvested"
        subtitle="All time"
        color="blue"
      />
      
      <StatCard
        title="Current Value"
        :value="userStore.investmentPerformance.currentValue"
        :change="userStore.investmentPerformance.returnPercent"
        change-unit="%"
        change-period="Total return"
        color="green"
      />
      
      <StatCard
        title="Unrealized P&L"
        :value="userStore.investmentPerformance.profit"
        :change="userStore.investmentPerformance.returnPercent"
        change-unit="%"
        :color="userStore.investmentPerformance.profit >= 0 ? 'green' : 'red'"
      />
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Stores
const authStore = useAuthStore()
const fundStore = useFundStore()
const userStore = useUserStore()
const toast = useToast()

// Local state
const investmentAmount = ref('')
const investmentCurrency = ref('USDC')
const divestmentAmount = ref('')
const divestmentCurrency = ref('USDC')
const selectedFilter = ref('all')

const transactionFilters = [
  { label: 'All', value: 'all' },
  { label: 'Investments', value: 'invest' },
  { label: 'Divestments', value: 'divest' },
  { label: 'Dividends', value: 'dividend' }
]

// Computed
const canInvest = computed(() => {
  const amount = parseFloat(investmentAmount.value) || 0
  const balance = userStore.getBalanceInCurrency(investmentCurrency.value)
  return amount > 0 && amount <= balance && amount >= 10 // Minimum $10
})

const canDivest = computed(() => {
  const amount = parseFloat(divestmentAmount.value) || 0
  return amount > 0 && amount <= userStore.tesseractBalance && amount >= 1 // Minimum 1 TSRT
})

const filteredTransactions = computed(() => {
  const transactions = userStore.getTransactionHistory()
  if (selectedFilter.value === 'all') {
    return transactions
  }
  return transactions.filter(tx => tx.type === selectedFilter.value)
})

// Methods
const calculateTesseractTokens = (): string => {
  const amount = parseFloat(investmentAmount.value) || 0
  const costUSD = getInvestmentCostUSD()
  const tokens = costUSD / fundStore.fundData.tesseractPrice
  return tokens.toFixed(4)
}

const calculateDivestmentValue = (): number => {
  const amount = parseFloat(divestmentAmount.value) || 0
  return amount * fundStore.fundData.tesseractPrice
}

const getInvestmentCostUSD = (): number => {
  const amount = parseFloat(investmentAmount.value) || 0
  // For simplification, assume all currencies are worth $1 except ETH and BTC
  const rates: Record<string, number> = {
    USDC: 1,
    USDT: 1,
    ETH: 3100,
    BTC: 51200
  }
  return amount * (rates[investmentCurrency.value] || 1)
}

const setMaxInvestment = () => {
  const balance = userStore.getBalanceInCurrency(investmentCurrency.value)
  investmentAmount.value = balance.toString()
}

const setDivestmentPercent = (percent: number) => {
  const amount = (userStore.tesseractBalance * percent) / 100
  divestmentAmount.value = amount.toFixed(4)
}

const handleInvestment = async () => {
  try {
    const amount = parseFloat(investmentAmount.value)
    await userStore.investInFund(amount, investmentCurrency.value)
    
    toast.success(`Successfully invested ${amount} ${investmentCurrency.value}!`)
    
    // Reset form
    investmentAmount.value = ''
    
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Investment failed')
  }
}

const handleDivestment = async () => {
  try {
    const amount = parseFloat(divestmentAmount.value)
    await userStore.divestFromFund(amount, divestmentCurrency.value)
    
    toast.success(`Successfully divested ${amount} TSRT!`)
    
    // Reset form
    divestmentAmount.value = ''
    
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Divestment failed')
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getTransactionBadgeClass = (type: string): string => {
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

const getStatusBadgeClass = (status: string): string => {
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
</script>