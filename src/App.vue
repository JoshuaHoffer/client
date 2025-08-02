<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Skip Navigation for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50">
      Skip to main content
    </a>

    <!-- Loading overlay -->
    <div v-if="authStore.isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="text-gray-700">Loading...</span>
      </div>
    </div>

    <!-- Main app layout -->
    <div v-if="!$route.meta.hideNavigation" class="flex h-screen">
      <!-- Sidebar Navigation -->
      <aside class="w-64 bg-white shadow-lg flex-shrink-0">
        <div class="flex flex-col h-full">
          <!-- Logo/Brand -->
          <div class="flex items-center justify-center h-16 px-4 bg-blue-600 text-white">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span class="text-lg font-bold">T</span>
              </div>
              <span class="text-xl font-bold">Tesseract</span>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="flex-1 px-4 py-6 space-y-2">
            <router-link
              v-for="item in navigationItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600 border-r-2 border-blue-600': $route.path === item.path }"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <div class="flex-1">
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-gray-500">{{ item.description }}</div>
              </div>
            </router-link>
          </nav>

          <!-- User Menu -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {{ userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ authStore.userName }}</div>
                <div class="text-sm text-gray-500 truncate">{{ authStore.userRole }}</div>
              </div>
            </div>
            
            <!-- Wallet Connection -->
            <div v-if="authStore.walletAddress" class="mb-3 p-2 bg-green-50 rounded-lg">
              <div class="text-xs font-medium text-green-800">Wallet Connected</div>
              <div class="text-xs text-green-600 font-mono">
                {{ authStore.walletAddress.slice(0, 6) }}...{{ authStore.walletAddress.slice(-4) }}
              </div>
            </div>
            
            <div class="space-y-1">
              <router-link
                to="/profile"
                class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                👤 Profile
              </router-link>
              <router-link
                to="/settings"
                class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                ⚙️ Settings
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <!-- Breadcrumb -->
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2">
                <li>
                  <router-link to="/dashboard" class="text-gray-500 hover:text-gray-700">
                    🏠 Home
                  </router-link>
                </li>
                <li v-if="$route.meta.breadcrumb" class="flex items-center">
                  <span class="text-gray-400 mx-2">/</span>
                  <span class="text-gray-900 font-medium">{{ $route.meta.breadcrumb }}</span>
                </li>
              </ol>
            </nav>

            <!-- Header Actions -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <span class="text-xl">🔔</span>
              </button>
              
              <!-- Wallet Status -->
              <div v-if="!authStore.walletAddress" class="flex items-center">
                <button
                  @click="connectWallet"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main id="main-content" class="flex-1 overflow-y-auto">
          <router-view v-slot="{ Component, route }">
            <transition name="page" mode="out-in">
              <component 
                :is="Component" 
                :key="route.path"
                :user-role="authStore.userRole"
                :wallet-address="authStore.walletAddress"
              />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Full-screen routes (login, register, etc.) -->
    <div v-else class="min-h-screen">
      <router-view 
        :user-role="authStore.userRole"
        :wallet-address="authStore.walletAddress"
      />
    </div>

    <!-- Global Error Notification -->
    <div v-if="authStore.error" class="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div class="flex items-center justify-between">
        <span>{{ authStore.error }}</span>
        <button @click="authStore.clearError" class="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { routeHelpers } from '@/router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Computed properties
const navigationItems = computed(() => {
  return routeHelpers.getNavigationItems(authStore.userRole)
})

const userInitials = computed(() => {
  const name = authStore.userName
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : ''
})

// Methods
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const connectWallet = async () => {
  try {
    // Simulate wallet connection
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        await authStore.connectWallet(accounts[0])
      }
    } else {
      // Mock wallet connection for demo
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40)
      await authStore.connectWallet(mockAddress)
    }
  } catch (error) {
    console.error('Wallet connection failed:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()
})
</script>

<style scoped>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Custom scrollbar for main content */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>