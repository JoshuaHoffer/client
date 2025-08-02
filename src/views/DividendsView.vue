<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dividend Center</h1>
          <p class="text-gray-600 mt-1">Manage your dividend preferences and track earnings</p>
        </div>
        <div v-if="authStore.isAuthenticated" class="mt-4 lg:mt-0">
          <div class="text-right">
            <p class="text-sm text-gray-600">Total Dividends Earned</p>
            <p class="text-2xl font-bold text-gray-900">${{ userStore.totalDividendsEarned.toFixed(2) }}</p>
          </div>
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
          <p class="text-blue-700 mt-1">Connect your wallet to manage your dividend preferences and view earnings.</p>
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
      <!-- Dividend Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Next Dividend"
          :value="userStore.estimatedNextDividend"
          :subtitle="`${formatDate(fundStore.nextDividend?.distributionDate)} est.`"
          color="blue"
        />
        
        <StatCard
          title="Total Earned"
          :value="userStore.totalDividendsEarned"
          :subtitle="`${userStore.dividendHistory.length} payments`"
          color="green"
        />
        
        <StatCard
          title="Monthly Rate"
          :value="fundStore.lastDividend?.ratePerToken || 0"
          subtitle="Per TSRT token"
          color="purple"
          :format-value="false"
        />
        
        <StatCard
          title="Reinvestment Rate"
          :value="authStore.user?.preferences.reinvestmentPercentage || 0"
          change-unit="%"
          subtitle="Auto-reinvest"
          color="orange"
          :format-value="false"
        />
      </div>

      <!-- Dividend Settings -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Dividend Preferences</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Payout Method -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Payout Method</label>
            <div class="space-y-3">
              <div v-for="option in payoutOptions" :key="option.value" class="flex items-start">
                <input
                  v-model="selectedPayoutMethod"
                  :value="option.value"
                  type="radio"
                  class="mt-1 focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <div class="ml-3">
                  <label class="text-sm font-medium text-gray-900">{{ option.label }}</label>
                  <p class="text-sm text-gray-500">{{ option.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reinvestment Settings -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Reinvestment Allocation</label>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-600">Reinvestment Percentage</label>
                <div class="mt-1 relative">
                  <input
                    v-model="reinvestmentPercentage"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div class="mt-2 text-center">
                  <span class="text-lg font-bold text-primary-600">{{ reinvestmentPercentage }}%</span>
                  <span class="text-sm text-gray-500 ml-2">reinvested</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                <div class="text-center p-3 bg-primary-50 rounded-lg">
                  <div class="text-sm text-primary-600">Reinvested</div>
                  <div class="text-lg font-bold text-primary-900">
                    ${{ (userStore.estimatedNextDividend * reinvestmentPercentage / 100).toFixed(2) }}
                  </div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-600">Cash Payout</div>
                  <div class="text-lg font-bold text-gray-900">
                    ${{ (userStore.estimatedNextDividend * (100 - reinvestmentPercentage) / 100).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            @click="updatePreferences"
            :disabled="userStore.isLoading"
            class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <span v-if="userStore.isLoading">Updating...</span>
            <span v-else>Save Preferences</span>
          </button>
        </div>
      </div>

      <!-- Next Dividend Information -->
      <div v-if="fundStore.nextDividend" class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold mb-2">Next Dividend Distribution</h3>
            <p class="text-blue-100">{{ formatDate(fundStore.nextDividend.distributionDate) }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">${{ fundStore.nextDividend.ratePerToken.toFixed(3) }}</div>
            <div class="text-blue-100">per TSRT token</div>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-400/30 rounded-lg p-4">
            <div class="text-blue-100">Your Estimated Dividend</div>
            <div class="text-xl font-bold">${{ userStore.estimatedNextDividend.toFixed(2) }}</div>
            <div class="text-sm text-blue-200">Based on {{ userStore.tesseractBalance.toFixed(2) }} TSRT</div>
          </div>
          
          <div class="bg-blue-400/30 rounded-lg p-4">
            <div class="text-blue-100">Total Fund Distribution</div>
            <div class="text-xl font-bold">${{ formatLargeNumber(fundStore.nextDividend.totalAmount) }}</div>
            <div class="text-sm text-blue-200">To {{ fundStore.nextDividend.eligibleTokens.toLocaleString() }} tokens</div>
          </div>
          
          <div class="bg-blue-400/30 rounded-lg p-4">
            <div class="text-blue-100">Distribution Status</div>
            <div class="text-xl font-bold">{{ fundStore.nextDividend.status }}</div>
            <div class="text-sm text-blue-200">{{ getDaysUntilDistribution() }} days remaining</div>
          </div>
        </div>
      </div>

      <!-- Dividend History -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Dividend History</h2>
          <button
            @click="exportDividendHistory"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate per Token</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Held</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reinvested</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Received</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="dividend in userStore.dividendHistory" :key="dividend.distributionId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getDistributionPeriod(dividend.distributionId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ getDistributionRate(dividend.distributionId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ dividend.tokensHeld.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ${{ dividend.totalEarned.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ dividend.reinvestedAmount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ dividend.cashAmount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                    {{ dividend.processed ? 'Paid' : 'Pending' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="userStore.dividendHistory.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No dividend history</h3>
          <p class="mt-1 text-sm text-gray-500">
            Your dividend payments will appear here once distributions begin.
          </p>
        </div>
      </div>

      <!-- Dividend Calculator -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Dividend Calculator</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TSRT Token Amount</label>
            <input
              v-model="calculatorTokens"
              type="number"
              placeholder="Enter token amount"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div class="flex justify-between text-sm text-gray-500 mt-1">
              <span>Your balance: {{ userStore.tesseractBalance.toFixed(2) }} TSRT</span>
              <button
                @click="calculatorTokens = userStore.tesseractBalance.toString()"
                class="text-primary-600 hover:text-primary-700"
              >
                Use all
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dividend Rate (per token)</label>
            <input
              v-model="calculatorRate"
              type="number"
              placeholder="0.85"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div class="text-sm text-gray-500 mt-1">
              Last rate: ${{ fundStore.lastDividend?.ratePerToken.toFixed(3) || '0.00' }}
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Projected Dividend</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                ${{ calculateDividend().total.toFixed(2) }}
              </div>
              <div class="text-sm text-gray-600">Total Dividend</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-600">
                ${{ calculateDividend().reinvested.toFixed(2) }}
              </div>
              <div class="text-sm text-gray-600">Reinvested ({{ reinvestmentPercentage }}%)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-success-600">
                ${{ calculateDividend().cash.toFixed(2) }}
              </div>
              <div class="text-sm text-gray-600">Cash Payout ({{ 100 - reinvestmentPercentage }}%)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fund Dividend Information -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Fund Dividend Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Distribution Schedule</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Frequency:</span>
                <span>Monthly</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Payment Date:</span>
                <span>1st of each month</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Record Date:</span>
                <span>Last day of month</span>
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Historical Performance</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Avg. Monthly Rate:</span>
                <span>${{ getAverageDividendRate().toFixed(3) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Highest Rate:</span>
                <span>${{ getHighestDividendRate().toFixed(3) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Distributed:</span>
                <span>${{ getTotalDistributed().toFixed(0) }}K</span>
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Yield Information</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Current Yield:</span>
                <span>{{ getCurrentYield().toFixed(1) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Annualized:</span>
                <span>{{ (getCurrentYield() * 12).toFixed(1) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Source:</span>
                <span>Trading profits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const selectedPayoutMethod = ref(authStore.user?.preferences.dividendPayout || 'reinvest')
const reinvestmentPercentage = ref(authStore.user?.preferences.reinvestmentPercentage || 70)
const calculatorTokens = ref('')
const calculatorRate = ref('0.85')

const payoutOptions = [
  {
    value: 'reinvest',
    label: 'Reinvest (DRIP)',
    description: 'Automatically purchase more TSRT tokens with dividends'
  },
  {
    value: 'usdc',
    label: 'Cash (USDC)',
    description: 'Receive dividends as USDC stablecoin'
  },
  {
    value: 'mixed',
    label: 'Mixed Assets',
    description: 'Receive dividends in proportion to fund holdings'
  },
  {
    value: 'pegged',
    label: 'Pegged Tokens',
    description: 'Receive dividends as pegged tokens (pBTC, pETH, etc.)'
  }
]

// Computed
const hasPendingChanges = computed(() => {
  return selectedPayoutMethod.value !== authStore.user?.preferences.dividendPayout ||
         reinvestmentPercentage.value !== authStore.user?.preferences.reinvestmentPercentage
})

// Methods
const formatDate = (date: Date | undefined): string => {
  if (!date) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toFixed(0)
}

const getDaysUntilDistribution = (): number => {
  if (!fundStore.nextDividend?.distributionDate) return 0
  const now = new Date()
  const distribution = new Date(fundStore.nextDividend.distributionDate)
  const diffTime = distribution.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getDistributionPeriod = (distributionId: string): string => {
  const distribution = fundStore.dividendDistributions.find(d => d.id === distributionId)
  return distribution?.period || 'Unknown'
}

const getDistributionRate = (distributionId: string): string => {
  const distribution = fundStore.dividendDistributions.find(d => d.id === distributionId)
  return distribution?.ratePerToken.toFixed(3) || '0.000'
}

const calculateDividend = () => {
  const tokens = parseFloat(calculatorTokens.value) || 0
  const rate = parseFloat(calculatorRate.value) || 0
  const total = tokens * rate
  const reinvested = total * (reinvestmentPercentage.value / 100)
  const cash = total - reinvested

  return { total, reinvested, cash }
}

const getAverageDividendRate = (): number => {
  const completedDistributions = fundStore.dividendDistributions.filter(d => d.status === 'completed')
  if (completedDistributions.length === 0) return 0
  
  const totalRate = completedDistributions.reduce((sum, d) => sum + d.ratePerToken, 0)
  return totalRate / completedDistributions.length
}

const getHighestDividendRate = (): number => {
  const rates = fundStore.dividendDistributions.map(d => d.ratePerToken)
  return Math.max(...rates, 0)
}

const getTotalDistributed = (): number => {
  return fundStore.dividendDistributions
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.totalAmount, 0) / 1000
}

const getCurrentYield = (): number => {
  if (!fundStore.lastDividend) return 0
  return (fundStore.lastDividend.ratePerToken / fundStore.fundData.tesseractPrice) * 100
}

const updatePreferences = async () => {
  try {
    await userStore.updateDividendPreferences({
      payoutMethod: selectedPayoutMethod.value,
      reinvestmentPercentage: reinvestmentPercentage.value
    })
    
    toast.success('Dividend preferences updated successfully!')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to update preferences')
  }
}

const exportDividendHistory = () => {
  try {
    const data = userStore.dividendHistory.map(dividend => ({
      period: getDistributionPeriod(dividend.distributionId),
      rate: getDistributionRate(dividend.distributionId),
      tokensHeld: dividend.tokensHeld,
      totalEarned: dividend.totalEarned,
      reinvestmentAmount: dividend.reinvestedAmount,
      cashAmount: dividend.cashAmount,
      payoutMethod: dividend.payoutMethod,
      processed: dividend.processed
    }))

    const csv = [
      'Period,Rate Per Token,Tokens Held,Total Earned,Reinvested,Cash Amount,Payout Method,Status',
      ...data.map(row => 
        `${row.period},${row.rate},${row.tokensHeld},${row.totalEarned},${row.reinvestmentAmount},${row.cashAmount},${row.payoutMethod},${row.processed ? 'Paid' : 'Pending'}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tesseract-dividends-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Dividend history exported successfully!')
  } catch (error) {
    toast.error('Failed to export dividend history')
  }
}

// Lifecycle
onMounted(() => {
  if (authStore.isAuthenticated) {
    // Set calculator to user's balance by default
    calculatorTokens.value = userStore.tesseractBalance.toString()
    
    // Set calculator rate to last dividend rate
    if (fundStore.lastDividend) {
      calculatorRate.value = fundStore.lastDividend.ratePerToken.toString()
    }
  }
})
</script>