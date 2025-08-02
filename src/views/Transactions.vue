<template>
  <div class="transactions-view" style="padding: 1.5rem;">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p class="text-gray-600 mt-1">View all your investment transactions and activity</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="exportTransactions"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center">
          <Download class="w-4 h-4 mr-2" />
          Export
        </button>
        <button 
          @click="refreshTransactions"
          :disabled="isLoading"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
          <RefreshCw :class="['w-4 h-4 mr-2', { 'animate-spin': isLoading }]" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md border-l-4 border-green-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Invested</p>
            <p class="text-2xl font-bold text-gray-900">${{ (totalInvested || 0).toLocaleString() }}</p>
          </div>
          <TrendingUp class="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border-l-4 border-blue-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Dividends</p>
            <p class="text-2xl font-bold text-gray-900">${{ (totalDividends || 0).toLocaleString() }}</p>
          </div>
          <DollarSign class="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md border-l-4 border-purple-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Transactions</p>
            <p class="text-2xl font-bold text-gray-900">{{ transactions?.length || 0 }}</p>
          </div>
          <Activity class="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md mb-6" style="padding: 1rem;">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-64">
          <div class="relative">
            <Search class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search transactions..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <select v-model="typeFilter" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="buy">Investments</option>
          <option value="sell">Sales</option>
          <option value="dividend">Dividends</option>
        </select>
        <select v-model="periodFilter" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  transaction.type === 'buy' ? 'bg-blue-100 text-blue-800' :
                  transaction.type === 'sell' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                ]">
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ transaction.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span :class="[
                  'font-medium',
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ transaction.amount >= 0 ? '+' : '' }}${{ Math.abs(transaction.amount).toLocaleString() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!filteredTransactions?.length" class="text-center py-12">
        <Activity class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || typeFilter || periodFilter ? 'Try adjusting your filters' : 'Start investing to see your transaction history here' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { 
  Download, RefreshCw, TrendingUp, DollarSign, Activity, Search 
} from 'lucide-vue-next'

// Store
const userStore = useUserStore()

// State
const isLoading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const periodFilter = ref('')

// Computed
const transactions = computed(() => userStore.userData?.transactions || [])

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(transaction => 
      transaction.description.toLowerCase().includes(query) ||
      transaction.type.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (typeFilter.value) {
    filtered = filtered.filter(transaction => transaction.type === typeFilter.value)
  }

  // Period filter
  if (periodFilter.value) {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (periodFilter.value) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    filtered = filtered.filter(transaction => new Date(transaction.date) >= cutoffDate)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalInvested = computed(() => {
  return transactions.value
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
})

const totalDividends = computed(() => {
  return transactions.value
    .filter(t => t.type === 'dividend')
    .reduce((sum, t) => sum + t.amount, 0)
})

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTypeLabel = (type) => {
  switch (type) {
    case 'buy': return 'Investment'
    case 'sell': return 'Sale'
    case 'dividend': return 'Dividend'
    default: return type
  }
}

const refreshTransactions = async () => {
  isLoading.value = true
  try {
    await userStore.refreshData()
  } finally {
    isLoading.value = false
  }
}

const exportTransactions = () => {
  // Mock export functionality
  console.log('Exporting transactions...')
  // In a real app, this would generate and download a CSV/Excel file
}

// Lifecycle
onMounted(async () => {
  // Initialize defaults and load data
  userStore.initializeDefaults()
  await userStore.loadUserData()
})
</script>

<style scoped>
.transactions-view {
  min-height: 100vh;
  background-color: #f9fafb;
}

table {
  border-collapse: collapse;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}
</style>