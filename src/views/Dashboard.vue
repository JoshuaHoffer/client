<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content" style="padding: 1.5rem;">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ getWelcomeMessage }}</h1>
        <p class="text-gray-600 mt-2">{{ getCurrentDate }}</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Portfolio Value -->
        <div class="bg-white rounded-lg shadow-md border-l-4 border-blue-500" style="padding: 1.5rem;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(portfolioValue) }}</p>
              <p :class="['text-sm flex items-center mt-1', returnPercent >= 0 ? 'text-green-600' : 'text-red-600']">
                <TrendingUp v-if="returnPercent >= 0" class="w-4 h-4 mr-1" />
                <TrendingDown v-else class="w-4 h-4 mr-1" />
                {{ returnPercent >= 0 ? '+' : '' }}{{ returnPercent.toFixed(2) }}%
              </p>
            </div>
            <TrendingUp class="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <!-- Total Return -->
        <div class="bg-white rounded-lg shadow-md border-l-4 border-green-500" style="padding: 1.5rem;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Return</p>
              <p :class="['text-2xl font-bold', returnAmount >= 0 ? 'text-green-600' : 'text-red-600']">
                {{ returnAmount >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(returnAmount)) }}
              </p>
              <p class="text-sm text-gray-500">Since inception</p>
            </div>
            <DollarSign class="w-8 h-8 text-green-500" />
          </div>
        </div>

        <!-- Monthly Dividends -->
        <div class="bg-white rounded-lg shadow-md border-l-4 border-purple-500" style="padding: 1.5rem;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Monthly Dividends</p>
              <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(monthlyDividends) }}</p>
              <p class="text-sm text-gray-500">Next: {{ nextPaymentDate }}</p>
            </div>
            <Calendar class="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <!-- Available Balance -->
        <div class="bg-white rounded-lg shadow-md border-l-4 border-orange-500" style="padding: 1.5rem;">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Available Balance</p>
              <p class="text-2xl font-bold text-gray-900">${{ formatCurrency(availableBalance) }}</p>
              <p class="text-sm text-gray-500">Ready to invest</p>
            </div>
            <Wallet class="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-md mb-8" style="padding: 1.5rem;">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Plus class="w-6 h-6 text-gray-400 mr-2" />
            <span class="text-gray-600">Invest More</span>
          </button>
          <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <Download class="w-6 h-6 text-gray-400 mr-2" />
            <span class="text-gray-600">Withdraw Funds</span>
          </button>
          <button class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Settings class="w-6 h-6 text-gray-400 mr-2" />
            <span class="text-gray-600">Settings</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-md" style="padding: 1.5rem;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <router-link to="/transactions" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </router-link>
        </div>
        
        <div v-if="recentTransactions.length" class="space-y-4">
          <div 
            v-for="transaction in recentTransactions" 
            :key="transaction.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center mr-3',
                transaction.type === 'dividend' ? 'bg-green-100' : 
                transaction.type === 'buy' ? 'bg-blue-100' : 'bg-red-100'
              ]">
                <DollarSign v-if="transaction.type === 'dividend'" class="w-5 h-5 text-green-600" />
                <TrendingUp v-else-if="transaction.type === 'buy'" class="w-5 h-5 text-blue-600" />
                <TrendingDown v-else class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p :class="[
                'font-semibold',
                transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ transaction.amount >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(transaction.amount)) }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <Activity class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
          <p class="mt-1 text-sm text-gray-500">Your transaction history will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Wallet, 
  Plus, Download, Settings, Activity 
} from 'lucide-vue-next'

// Stores
const userStore = useUserStore()
const authStore = useAuthStore()

// State
const isLoading = ref(true)

// Safe computed properties with fallbacks
const portfolioValue = computed(() => {
  return userStore.portfolioData?.totalValue || 0
})

const returnPercent = computed(() => {
  return userStore.portfolioData?.returnPercent || 0
})

const returnAmount = computed(() => {
  return userStore.portfolioData?.returnAmount || 0
})

const monthlyDividends = computed(() => {
  return userStore.userData?.dividends?.monthly || 0
})

const availableBalance = computed(() => {
  return userStore.userData?.balance || 0
})

const recentTransactions = computed(() => {
  const transactions = userStore.userData?.transactions || []
  return transactions.slice(0, 5) // Show only last 5 transactions
})

const nextPaymentDate = computed(() => {
  const nextPayment = userStore.userData?.dividends?.nextPayment
  if (!nextPayment) return 'TBD'
  
  return new Date(nextPayment).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
})

const getWelcomeMessage = computed(() => {
  const userName = authStore.user?.name || 'Investor'
  const firstName = userName.split(' ')[0]
  
  if (returnPercent.value > 0) {
    return `Welcome back, ${firstName}! Your portfolio is performing well.`
  } else if (returnPercent.value < 0) {
    return `Welcome back, ${firstName}. Stay strong during market fluctuations.`
  } else {
    return `Welcome back, ${firstName}! Ready to start investing?`
  }
})

const getCurrentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  try {
    // Initialize stores in the correct order
    userStore.initializeDefaults()
    
    // Load user data
    await userStore.loadUserData()
    
    // Small delay to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.transition-colors {
  transition: all 0.3s ease;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>