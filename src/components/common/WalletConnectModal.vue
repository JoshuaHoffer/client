<template>
  <Modal
    v-model="showModal"
    title="Connect Wallet"
    subtitle="Choose how you'd like to connect to Tesseract Fund"
    size="md"
    :close-on-overlay="!isConnecting"
  >
    <div class="space-y-4">
      <!-- Wallet Options -->
      <div class="grid gap-3">
        <button
          v-for="wallet in walletOptions"
          :key="wallet.id"
          @click="connectWallet(wallet.id)"
          :disabled="isConnecting"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'border-primary-500 bg-primary-50': selectedWallet === wallet.id }"
        >
          <img 
            :src="wallet.icon" 
            :alt="wallet.name"
            class="w-8 h-8 mr-3"
          />
          <div class="flex-1 text-left">
            <div class="font-medium text-gray-900">{{ wallet.name }}</div>
            <div class="text-sm text-gray-500">{{ wallet.description }}</div>
          </div>
          <div v-if="selectedWallet === wallet.id && isConnecting" class="ml-3">
            <LoadingSpinner size="sm" />
          </div>
        </button>
      </div>

      <!-- Connection Status -->
      <div v-if="connectionError" class="p-4 bg-danger-50 border border-danger-200 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-danger-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <div class="font-medium text-danger-900">Connection Failed</div>
            <div class="text-sm text-danger-700">{{ connectionError }}</div>
          </div>
        </div>
      </div>

      <!-- What is a wallet? -->
      <div class="border-t border-gray-200 pt-4">
        <button
          @click="showWalletInfo = !showWalletInfo"
          class="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg 
            class="w-4 h-4 mr-2 transition-transform"
            :class="{ 'rotate-180': showWalletInfo }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          What is a wallet?
        </button>
        
        <div v-if="showWalletInfo" class="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <p class="mb-2">
            A crypto wallet is a secure digital tool that stores your cryptocurrency and allows you to interact with blockchain applications like Tesseract Fund.
          </p>
          <p>
            Don't have a wallet? We recommend <a href="https://metamask.io" target="_blank" class="text-primary-600 hover:underline">MetaMask</a> for beginners.
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Modal from './Modal.vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface WalletOption {
  id: string
  name: string
  description: string
  icon: string
  available: boolean
}

const authStore = useAuthStore()

const isConnecting = ref(false)
const selectedWallet = ref<string | null>(null)
const connectionError = ref<string | null>(null)
const showWalletInfo = ref(false)

const showModal = computed({
  get: () => authStore.showConnectModal,
  set: (value: boolean) => {
    authStore.showConnectModal = value
    if (!value) {
      resetState()
    }
  }
})

const walletOptions = computed<WalletOption[]>(() => [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using browser extension',
    icon: '/icons/metamask.svg',
    available: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect using mobile wallet',
    icon: '/icons/walletconnect.svg',
    available: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: '/icons/coinbase.svg',
    available: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet
  }
])

const connectWallet = async (walletId: string) => {
  if (isConnecting.value) return

  isConnecting.value = true
  selectedWallet.value = walletId
  connectionError.value = null

  try {
    await authStore.connectWallet(walletId)
    showModal.value = false
  } catch (error) {
    connectionError.value = error instanceof Error ? error.message : 'Failed to connect wallet'
  } finally {
    isConnecting.value = false
    selectedWallet.value = null
  }
}

const resetState = () => {
  isConnecting.value = false
  selectedWallet.value = null
  connectionError.value = null
  showWalletInfo.value = false
}
</script>