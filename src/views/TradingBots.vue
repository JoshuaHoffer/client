<template>
  <div class="trading-bots-view">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Trading Bots</h1>
        <p class="text-gray-600 mt-1">Monitor and manage automated trading strategies</p>
      </div>
      <div class="flex space-x-3">
        <button 
          v-if="userRole === 'manager'"
          @click="showAddBotModal = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus class="w-4 h-4 mr-2" />
          Add New Bot
        </button>
        <button 
          @click="refreshBots"
          :disabled="isRefreshing"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center">
          <RefreshCw :class="['w-4 h-4 mr-2', { 'animate-spin': isRefreshing }]" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md border-l-4 border-green-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Bots</p>
            <p class="text-2xl font-bold text-gray-900">{{ activeBots }}</p>
          </div>
          <Activity class="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border-l-4 border-blue-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">24h Profit</p>
            <p class="text-2xl font-bold text-gray-900">${{ totalProfit24h.toLocaleString() }}</p>
            <p :class="['text-sm flex items-center', totalProfit24h >= 0 ? 'text-green-600' : 'text-red-600']">
              <TrendingUp v-if="totalProfit24h >= 0" class="w-4 h-4 mr-1" />
              <TrendingDown v-else class="w-4 h-4 mr-1" />
              {{ profitPercentage }}%
            </p>
          </div>
          <DollarSign class="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md border-l-4 border-purple-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Trades</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalTrades }}</p>
            <p class="text-sm text-gray-500">Last 24h</p>
          </div>
          <BarChart3 class="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md border-l-4 border-orange-500" style="padding: 1.5rem;">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Win Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ winRate }}%</p>
            <p class="text-sm text-gray-500">Success ratio</p>
          </div>
          <Target class="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-md mb-6" style="padding: 1rem;">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-64">
          <div class="relative">
            <Search class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search bots..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <select v-model="statusFilter" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="stopped">Stopped</option>
        </select>
        <select v-model="strategyFilter" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">All Strategies</option>
          <option value="arbitrage">Arbitrage</option>
          <option value="dca">DCA</option>
          <option value="momentum">Momentum</option>
          <option value="mean-reversion">Mean Reversion</option>
          <option value="grid">Grid Trading</option>
        </select>
      </div>
    </div>

    <!-- Trading Bots Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="bot in filteredBots" 
        :key="bot.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        
        <!-- Bot Header -->
        <div style="padding: 1.5rem; padding-bottom: 1rem;">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ bot.name }}</h3>
              <p class="text-sm text-gray-600">{{ bot.strategy }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                bot.status === 'active' ? 'bg-green-100 text-green-800' :
                bot.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              ]">
                {{ bot.status }}
              </span>
              <button 
                v-if="userRole === 'manager'"
                @click="toggleBot(bot)"
                :class="[
                  'p-1 rounded hover:bg-gray-100',
                  bot.status === 'active' ? 'text-red-600' : 'text-green-600'
                ]">
                <Pause v-if="bot.status === 'active'" class="w-4 h-4" />
                <Play v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Bot Metrics -->
        <div style="padding-left: 1.5rem; padding-right: 1.5rem; padding-bottom: 1rem;">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600">24h Profit</p>
              <p :class="[
                'font-semibold',
                bot.profit24h >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                ${{ bot.profit24h >= 0 ? '+' : '' }}{{ bot.profit24h.toLocaleString() }}
              </p>
            </div>
            <div>
              <p class="text-gray-600">Trades</p>
              <p class="font-semibold text-gray-900">{{ bot.trades24h }}</p>
            </div>
            <div>
              <p class="text-gray-600">Win Rate</p>
              <p class="font-semibold text-gray-900">{{ bot.winRate }}%</p>
            </div>
            <div>
              <p class="text-gray-600">Total Return</p>
              <p :class="[
                'font-semibold',
                bot.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ bot.totalReturn >= 0 ? '+' : '' }}{{ bot.totalReturn.toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Bot Performance Chart -->
        <div style="padding-left: 1.5rem; padding-right: 1.5rem; padding-bottom: 1rem;">
          <div class="h-32 bg-gray-50 rounded flex items-center justify-center">
            <canvas :id="'chart-' + bot.id" width="200" height="80"></canvas>
          </div>
        </div>

        <!-- Bot Actions -->
        <div v-if="userRole === 'manager'" class="bg-gray-50 border-t" style="padding: 1.5rem; padding-top: 1rem; padding-bottom: 1rem;">
          <div class="flex space-x-2">
            <button 
              @click="configureBot(bot)"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded flex items-center justify-center">
              <Settings class="w-4 h-4 mr-1" />
              Configure
            </button>
            <button 
              @click="viewBotDetails(bot)"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded flex items-center justify-center">
              <Eye class="w-4 h-4 mr-1" />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bot Modal -->
    <div v-if="showAddBotModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4" style="padding: 1.5rem;">
        <h3 class="text-lg font-semibold mb-4">Add New Trading Bot</h3>
        <form @submit.prevent="addBot">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
              <input 
                v-model="newBot.name"
                type="text" 
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
              <select 
                v-model="newBot.strategy"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Strategy</option>
                <option value="arbitrage">Arbitrage</option>
                <option value="dca">Dollar Cost Averaging</option>
                <option value="momentum">Momentum Trading</option>
                <option value="mean-reversion">Mean Reversion</option>
                <option value="grid">Grid Trading</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Initial Capital ($)</label>
              <input 
                v-model="newBot.capital"
                type="number" 
                min="100"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button 
              type="button"
              @click="showAddBotModal = false"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
              Create Bot
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bot Configuration Modal -->
    <div v-if="showConfigModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto" style="padding: 1.5rem;">
        <h3 class="text-lg font-semibold mb-4">Configure {{ selectedBot?.name }}</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select v-model="botConfig.riskLevel" class="w-full px-3 py-2 border rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max Position Size (%)</label>
              <input v-model="botConfig.maxPosition" type="number" min="1" max="100" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stop Loss (%)</label>
              <input v-model="botConfig.stopLoss" type="number" min="0.1" max="50" step="0.1" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Take Profit (%)</label>
              <input v-model="botConfig.takeProfit" type="number" min="0.1" max="100" step="0.1" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button 
            @click="showConfigModal = false"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
            Cancel
          </button>
          <button 
            @click="saveBotConfig"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { 
  Plus, RefreshCw, Activity, DollarSign, BarChart3, Target, Search, 
  TrendingUp, TrendingDown, Pause, Play, Settings, Eye 
} from 'lucide-vue-next'

// Props/Emits
const props = defineProps({
  userRole: {
    type: String,
    default: 'investor'
  }
})

// State
const isRefreshing = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const strategyFilter = ref('')
const showAddBotModal = ref(false)
const showConfigModal = ref(false)
const selectedBot = ref(null)

// New Bot Form
const newBot = ref({
  name: '',
  strategy: '',
  capital: ''
})

// Bot Configuration
const botConfig = ref({
  riskLevel: 'medium',
  maxPosition: 10,
  stopLoss: 5,
  takeProfit: 15
})

// Sample Bot Data
const tradingBots = ref([
  {
    id: 1,
    name: 'Arbitrage Alpha',
    strategy: 'arbitrage',
    status: 'active',
    profit24h: 2847,
    trades24h: 23,
    winRate: 78,
    totalReturn: 15.3,
    performanceData: [100, 102, 98, 105, 103, 108, 115]
  },
  {
    id: 2,
    name: 'DCA Steady',
    strategy: 'dca',
    status: 'active',
    profit24h: 1923,
    trades24h: 8,
    winRate: 85,
    totalReturn: 22.1,
    performanceData: [100, 105, 110, 108, 115, 118, 122]
  },
  {
    id: 3,
    name: 'Momentum Hunter',
    strategy: 'momentum',
    status: 'paused',
    profit24h: -432,
    trades24h: 12,
    winRate: 65,
    totalReturn: -3.2,
    performanceData: [100, 98, 95, 92, 88, 85, 82]
  },
  {
    id: 4,
    name: 'Mean Reversion Pro',
    strategy: 'mean-reversion',
    status: 'active',
    profit24h: 3421,
    trades24h: 31,
    winRate: 73,
    totalReturn: 28.7,
    performanceData: [100, 103, 101, 107, 110, 115, 129]
  },
  {
    id: 5,
    name: 'Grid Master',
    strategy: 'grid',
    status: 'active',
    profit24h: 1567,
    trades24h: 45,
    winRate: 82,
    totalReturn: 18.4,
    performanceData: [100, 102, 104, 103, 106, 108, 118]
  },
  {
    id: 6,
    name: 'Scalping Beast',
    strategy: 'momentum',
    status: 'stopped',
    profit24h: 0,
    trades24h: 0,
    winRate: 0,
    totalReturn: 8.2,
    performanceData: [100, 105, 108, 108, 108, 108, 108]
  }
])

// Computed
const filteredBots = computed(() => {
  return tradingBots.value.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         bot.strategy.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || bot.status === statusFilter.value
    const matchesStrategy = !strategyFilter.value || bot.strategy === strategyFilter.value
    
    return matchesSearch && matchesStatus && matchesStrategy
  })
})

const activeBots = computed(() => {
  return tradingBots.value.filter(bot => bot.status === 'active').length
})

const totalProfit24h = computed(() => {
  return tradingBots.value.reduce((sum, bot) => sum + bot.profit24h, 0)
})

const totalTrades = computed(() => {
  return tradingBots.value.reduce((sum, bot) => sum + bot.trades24h, 0)
})

const winRate = computed(() => {
  const activeBots = tradingBots.value.filter(bot => bot.status === 'active')
  if (activeBots.length === 0) return 0
  
  const totalWinRate = activeBots.reduce((sum, bot) => sum + bot.winRate, 0)
  return Math.round(totalWinRate / activeBots.length)
})

const profitPercentage = computed(() => {
  // Calculate percentage based on total capital (mock calculation)
  const totalCapital = 500000 // Mock total capital
  return ((totalProfit24h.value / totalCapital) * 100).toFixed(2)
})

// Methods
const refreshBots = async () => {
  isRefreshing.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshing.value = false
}

const toggleBot = (bot) => {
  if (bot.status === 'active') {
    bot.status = 'paused'
  } else if (bot.status === 'paused') {
    bot.status = 'active'
  }
}

const configureBot = (bot) => {
  selectedBot.value = bot
  showConfigModal.value = true
}

const viewBotDetails = (bot) => {
  // Navigate to detailed bot view or show detailed modal
  console.log('View details for bot:', bot.name)
}

const addBot = () => {
  const bot = {
    id: Date.now(),
    name: newBot.value.name,
    strategy: newBot.value.strategy,
    status: 'paused',
    profit24h: 0,
    trades24h: 0,
    winRate: 0,
    totalReturn: 0,
    performanceData: [100, 100, 100, 100, 100, 100, 100]
  }
  
  tradingBots.value.push(bot)
  showAddBotModal.value = false
  
  // Reset form
  newBot.value = { name: '', strategy: '', capital: '' }
}

const saveBotConfig = () => {
  // Save configuration for selectedBot
  console.log('Saving config for', selectedBot.value?.name, botConfig.value)
  showConfigModal.value = false
}

const initializeCharts = () => {
  nextTick(() => {
    filteredBots.value.forEach(bot => {
      const canvas = document.getElementById(`chart-${bot.id}`)
      if (canvas) {
        const ctx = canvas.getContext('2d')
        
        // Simple line chart
        const data = bot.performanceData
        const width = canvas.width
        const height = canvas.height
        const padding = 10
        
        ctx.clearRect(0, 0, width, height)
        ctx.strokeStyle = bot.totalReturn >= 0 ? '#10b981' : '#ef4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        
        data.forEach((value, index) => {
          const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
          const y = height - padding - ((value - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * (height - 2 * padding)
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        
        ctx.stroke()
      }
    })
  })
}

// Lifecycle
onMounted(() => {
  initializeCharts()
})

// Watch for changes that require chart re-rendering
watch([filteredBots], () => {
  initializeCharts()
}, { deep: true })
</script>

<style scoped>
.trading-bots-view {
  padding: 1.5rem;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>