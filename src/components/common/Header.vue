<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-white font-bold text-lg">T</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">Tesseract Fund</h1>
          </router-link>
          
          <!-- Connection Status -->
          <div v-if="authStore.isAuthenticated" class="ml-6 text-sm text-gray-600">
            <span class="flex items-center">
              <div class="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
              {{ formatAddress(authStore.userAddress) }}
            </span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.path"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="isActiveRoute(item.path) ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <component :is="item.icon" class="w-4 h-4 mr-2" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Toggle theme"
          >
            <component :is="themeIcon" class="w-5 h-5" />
          </button>

          <!-- Notifications -->
          <button
            v-if="authStore.isAuthenticated"
            @click="showNotifications = !showNotifications"
            class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Notifications"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-4-4V8a8 8 0 10-16 0v5l-4 4h5m0 0v1a3 3 0 006 0v-1m-6 0h6" />
            </svg>
            <span v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </button>

          <!-- User Menu / Connect Wallet -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span class="text-white font-medium">
                  {{ userInitials }}
                </span>
              </div>
            </button>

            <!-- User Dropdown -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                v-click-outside="() => showUserMenu = false"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div class="font-medium">{{ formatAddress(authStore.userAddress, 12) }}</div>
                  <div class="text-xs text-gray-500">{{ authStore.userRole }}</div>
                </div>
                
                <router-link
                  to="/portfolio"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  My Portfolio
                </router-link>
                
                <router-link
                  to="/dividends"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Dividend Settings
                </router-link>
                
                <button
                  @click="handleDisconnect"
                  class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                >
                  Disconnect Wallet
                </button>
              </div>
            </transition>
          </div>

          <button
            v-else
            @click="authStore.showConnectModal = true"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Connect Wallet
          </button>

          <!-- Mobile Menu Button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 pb-3 pt-4">
          <div class="space-y-1 px-2">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              class="flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
              :class="isActiveRoute(item.path) ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
              @click="showMobileMenu = false"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface NavigationItem {
  name: string
  path: string
  icon: string
}

const route = useRoute()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showNotifications = ref(false)
const isDarkMode = ref(false)

const navigationItems = computed<NavigationItem[]>(() => {
  const baseItems = [
    { name: 'Dashboard', path: '/', icon: 'ChartBarIcon' },
    { name: 'Invest', path: '/invest', icon: 'TrendingUpIcon' },
    { name: 'Portfolio', path: '/portfolio', icon: 'PieChartIcon' },
    { name: 'Dividends', path: '/dividends', icon: 'CurrencyDollarIcon' },
    { name: 'Trading Bots', path: '/bots', icon: 'CpuChipIcon' }
  ]

  // Add admin item if user is manager
  if (authStore.isManager) {
    baseItems.push({ name: 'Admin', path: '/admin', icon: 'CogIcon' })
  }

  return baseItems
})

const unreadNotifications = ref(3) // This would come from a notifications store

const userInitials = computed(() => {
  if (!authStore.userAddress) return '?'
  return authStore.userAddress.slice(2, 4).toUpperCase()
})

const themeIcon = computed(() => {
  return isDarkMode.value ? 'SunIcon' : 'MoonIcon'
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

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // TODO: Implement theme switching logic
}

const handleDisconnect = async () => {
  try {
    await authStore.disconnect()
    showUserMenu.value = false
  } catch (error) {
    console.error('Failed to disconnect:', error)
  }
}

// Click outside directive would be implemented as a composable
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>