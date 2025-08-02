<template>
  <div class="flex">
    <!-- Mobile Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileOpen && isMobile"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="closeMobile"
      ></div>
    </transition>

    <!-- Sidebar -->
    <transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="!isMobile || isMobileOpen"
        class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform lg:transform-none lg:opacity-100 lg:translate-x-0"
        :class="{ 'shadow-xl': isMobile }"
      >
        <!-- Logo Section -->
        <div class="flex items-center h-16 px-6 border-b border-gray-200">
          <router-link to="/" class="flex items-center" @click="closeMobile">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-white font-bold text-lg">T</span>
            </div>
            <h1 class="text-lg font-bold text-gray-900">Tesseract</h1>
          </router-link>
          
          <!-- Mobile Close Button -->
          <button
            v-if="isMobile"
            @click="closeMobile"
            class="ml-auto p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <!-- User Info (if authenticated) -->
          <div v-if="authStore.isAuthenticated" class="px-6 pb-4 border-b border-gray-100 mb-4">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span class="text-white font-medium text-sm">
                  {{ userInitials }}
                </span>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ formatAddress(authStore.userAddress, 12) }}
                </p>
                <div class="flex items-center mt-1">
                  <div class="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                  <p class="text-xs text-gray-500 capitalize">{{ authStore.userRole }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Navigation -->
          <div class="px-3 space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            
            <router-link
              v-for="item in mainNavItems"
              :key="item.path"
              :to="item.path"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              :class="isActiveRoute(item.path) 
                ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
              @click="closeMobile"
            >
              <component 
                :is="item.icon" 
                class="w-5 h-5 mr-3 transition-colors"
                :class="isActiveRoute(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'"
              />
              {{ item.name }}
              <span v-if="item.badge" class="ml-auto">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {{ item.badge }}
                </span>
              </span>
            </router-link>
          </div>

          <!-- Fund Performance Section -->
          <div v-if="authStore.isAuthenticated" class="px-3 mt-8">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Fund Performance
            </h3>
            <div class="px-3 py-3 bg-gray-50 rounded-lg">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">TSRT Price</span>
                  <span class="font-medium text-gray-900">${{ fundData.tesseractPrice.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">24h Change</span>
                  <span :class="fundData.dailyChange >= 0 ? 'text-success-600' : 'text-danger-600'" class="font-medium">
                    {{ fundData.dailyChange >= 0 ? '+' : '' }}{{ fundData.dailyChange.toFixed(2) }}%
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Your Balance</span>
                  <span class="font-medium text-gray-900">{{ userBalance.toFixed(2) }} TSRT</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Section -->
          <div v-if="authStore.isManager" class="px-3 mt-8">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Management
            </h3>
            <div class="space-y-1">
              <router-link
                v-for="item in adminNavItems"
                :key="item.path"
                :to="item.path"
                class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                :class="isActiveRoute(item.path) 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
                @click="closeMobile"
              >
                <component 
                  :is="item.icon" 
                  class="w-5 h-5 mr-3 transition-colors"
                  :class="isActiveRoute(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'"
                />
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="authStore.isAuthenticated" class="px-3 mt-8">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div class="space-y-2">
              <button
                @click="showQuickInvest"
                class="w-full flex items-center px-3 py-2 text-sm font-medium text-success-700 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Quick Invest
              </button>
              <button
                @click="showQuickDivest"
                class="w-full flex items-center px-3 py-2 text-sm font-medium text-warning-700 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
                Quick Divest
              </button>
            </div>
          </div>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200">
          <div v-if="!authStore.isAuthenticated" class="space-y-3">
            <button
              @click="authStore.showConnectModal = true"
              class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
          <div v-else class="space-y-2">
            <button
              @click="handleDisconnect"
              class="w-full flex items-center justify-center px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
          
          <!-- Version Info -->
          <div class="mt-4 text-center">
            <p class="text-xs text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  name: string
  path: string
  icon: string
  badge?: string
}

const route = useRoute()
const authStore = useAuthStore()

const isMobileOpen = ref(false)
const isMobile = ref(false)

// Sample fund data - this would come from a store
const fundData = ref({
  tesseractPrice: 125.67,
  dailyChange: 8.3
})

const userBalance = ref(1250.50)

const mainNavItems = computed<NavItem[]>(() => [
  { name: 'Dashboard', path: '/', icon: 'ChartBarIcon' },
  { name: 'Invest / Divest', path: '/invest', icon: 'TrendingUpIcon' },
  { name: 'Portfolio', path: '/portfolio', icon: 'PieChartIcon' },
  { name: 'Dividends', path: '/dividends', icon: 'CurrencyDollarIcon', badge: '3' },
  { name: 'Trading Bots', path: '/bots', icon: 'CpuChipIcon' }
])

const adminNavItems = computed<NavItem[]>(() => [
  { name: 'Admin Panel', path: '/admin', icon: 'CogIcon' },
  { name: 'Investors', path: '/admin/investors', icon: 'UsersIcon' },
  { name: 'Analytics', path: '/admin/analytics', icon: 'ChartLineIcon' }
])

const userInitials = computed(() => {
  if (!authStore.userAddress) return '?'
  return authStore.userAddress.slice(2, 4).toUpperCase()
})

const formatAddress = (address: string, length: number = 8): string => {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-4)}`
}

const isActiveRoute = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024 // lg breakpoint
}

const closeMobile = () => {
  isMobileOpen.value = false
}

const openMobile = () => {
  isMobileOpen.value = true
}

const showQuickInvest = () => {
  // TODO: Open quick invest modal
  console.log('Quick invest')
  closeMobile()
}

const showQuickDivest = () => {
  // TODO: Open quick divest modal
  console.log('Quick divest')
  closeMobile()
}

const handleDisconnect = async () => {
  try {
    await authStore.disconnect()
    closeMobile()
  } catch (error) {
    console.error('Failed to disconnect:', error)
  }
}

// Expose methods for parent components
defineExpose({
  openMobile,
  closeMobile
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>