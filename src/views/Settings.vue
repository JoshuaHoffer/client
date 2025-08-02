<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600 mt-1">Manage your application preferences and account settings</p>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4 animate-in">
      <div class="flex">
        <CheckCircleIcon class="h-5 w-5 text-green-400" />
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4 animate-in">
      <div class="flex">
        <AlertCircleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <nav class="space-y-1 sticky top-6">
          <button
            v-for="section in settingSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="{
              'bg-primary-100 text-primary-700 border-primary-200': activeSection === section.id,
              'text-gray-600 hover:text-gray-900 hover:bg-gray-50': activeSection !== section.id
            }"
          >
            <component :is="section.icon" class="h-5 w-5 mr-3" />
            {{ section.label }}
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-3 space-y-6">
        
        <!-- General Settings -->
        <div v-if="activeSection === 'general'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
          
          <div class="space-y-6">
            <!-- Theme Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  v-for="theme in themeOptions"
                  :key="theme.value"
                  class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                  :class="{
                    'border-primary-500 bg-primary-50': settings.theme === theme.value,
                    'border-gray-300 hover:border-gray-400': settings.theme !== theme.value
                  }"
                >
                  <input
                    v-model="settings.theme"
                    :value="theme.value"
                    type="radio"
                    class="sr-only"
                    @change="updateSettings('theme', theme.value)"
                  />
                  <div class="flex flex-col items-center flex-1">
                    <component :is="theme.icon" class="h-6 w-6 mb-2" />
                    <span class="block text-sm font-medium text-gray-900">
                      {{ theme.label }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Language Selection -->
            <div>
              <label for="language" class="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                v-model="settings.language"
                @change="updateSettings('language', $event.target.value)"
                class="input-field max-w-xs"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <!-- Timezone -->
            <div>
              <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                v-model="settings.timezone"
                @change="updateSettings('timezone', $event.target.value)"
                class="input-field max-w-md"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
              </select>
            </div>

            <!-- Auto-save Settings -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Auto-save</h4>
                <p class="text-sm text-gray-500">Automatically save changes as you work</p>
              </div>
              <button
                type="button"
                @click="toggleSetting('autoSave')"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="{
                  'bg-primary-600': settings.autoSave,
                  'bg-gray-200': !settings.autoSave
                }"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="{
                    'translate-x-5': settings.autoSave,
                    'translate-x-0': !settings.autoSave
                  }"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeSection === 'notifications'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          
          <div class="space-y-4">
            <div
              v-for="notification in notificationSettings"
              :key="notification.key"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
                <p class="text-sm text-gray-500">{{ notification.description }}</p>
              </div>
              <button
                type="button"
                @click="toggleNotification(notification.key)"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="{
                  'bg-primary-600': notifications[notification.key],
                  'bg-gray-200': !notifications[notification.key]
                }"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="{
                    'translate-x-5': notifications[notification.key],
                    'translate-x-0': !notifications[notification.key]
                  }"
                />
              </button>
            </div>

            <!-- Notification Schedule -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Quiet Hours</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="quietStart" class="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    id="quietStart"
                    v-model="notifications.quietHours.start"
                    type="time"
                    class="input-field"
                  />
                </div>
                <div>
                  <label for="quietEnd" class="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    id="quietEnd"
                    v-model="notifications.quietHours.end"
                    type="time"
                    class="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy & Security -->
        <div v-if="activeSection === 'privacy'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Privacy & Security</h2>
          
          <div class="space-y-6">
            <!-- Privacy Settings -->
            <div class="space-y-4">
              <div
                v-for="privacy in privacySettings"
                :key="privacy.key"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ privacy.title }}</h4>
                  <p class="text-sm text-gray-500">{{ privacy.description }}</p>
                </div>
                <button
                  type="button"
                  @click="togglePrivacy(privacy.key)"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="{
                    'bg-primary-600': privacy[privacy.key],
                    'bg-gray-200': !privacy[privacy.key]
                  }"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="{
                      'translate-x-5': privacy[privacy.key],
                      'translate-x-0': !privacy[privacy.key]
                    }"
                  />
                </button>
              </div>
            </div>

            <!-- Session Management -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Active Sessions</h3>
              <div class="space-y-3">
                <div
                  v-for="session in activeSessions"
                  :key="session.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center">
                    <component :is="session.deviceIcon" class="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ session.device }}</p>
                      <p class="text-sm text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
                    </div>
                  </div>
                  <button
                    v-if="!session.current"
                    @click="revokeSession(session.id)"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    Revoke
                  </button>
                  <span v-else class="text-sm text-green-600 font-medium">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trading Settings -->
        <div v-if="activeSection === 'trading'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Trading Preferences</h2>
          
          <div class="space-y-6">
            <!-- Default Order Settings -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-4">Default Order Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="orderType" class="block text-sm font-medium text-gray-700 mb-1">
                    Default Order Type
                  </label>
                  <select
                    id="orderType"
                    v-model="tradingSettings.defaultOrderType"
                    class="input-field"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                    <option value="stop">Stop Order</option>
                    <option value="stop-limit">Stop-Limit Order</option>
                  </select>
                </div>
                
                <div>
                  <label for="timeInForce" class="block text-sm font-medium text-gray-700 mb-1">
                    Time in Force
                  </label>
                  <select
                    id="timeInForce"
                    v-model="tradingSettings.timeInForce"
                    class="input-field"
                  >
                    <option value="day">Day</option>
                    <option value="gtc">Good Till Canceled</option>
                    <option value="ioc">Immediate or Cancel</option>
                    <option value="fok">Fill or Kill</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Risk Management -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-4">Risk Management</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="maxOrderSize" class="block text-sm font-medium text-gray-700 mb-1">
                    Max Order Size ($)
                  </label>
                  <input
                    id="maxOrderSize"
                    v-model="tradingSettings.maxOrderSize"
                    type="number"
                    min="0"
                    step="100"
                    class="input-field"
                  />
                </div>
                
                <div>
                  <label for="stopLossPercent" class="block text-sm font-medium text-gray-700 mb-1">
                    Default Stop Loss (%)
                  </label>
                  <input
                    id="stopLossPercent"
                    v-model="tradingSettings.defaultStopLoss"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    class="input-field"
                  />
                </div>
                
                <div>
                  <label for="takeProfitPercent" class="block text-sm font-medium text-gray-700 mb-1">
                    Default Take Profit (%)
                  </label>
                  <input
                    id="takeProfitPercent"
                    v-model="tradingSettings.defaultTakeProfit"
                    type="number"
                    min="0"
                    step="0.5"
                    class="input-field"
                  />
                </div>
              </div>
            </div>

            <!-- Trading Confirmations -->
            <div class="space-y-4">
              <div
                v-for="confirmation in tradingConfirmations"
                :key="confirmation.key"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ confirmation.title }}</h4>
                  <p class="text-sm text-gray-500">{{ confirmation.description }}</p>
                </div>
                <button
                  type="button"
                  @click="toggleTradingConfirmation(confirmation.key)"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="{
                    'bg-primary-600': tradingSettings.confirmations[confirmation.key],
                    'bg-gray-200': !tradingSettings.confirmations[confirmation.key]
                  }"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="{
                      'translate-x-5': tradingSettings.confirmations[confirmation.key],
                      'translate-x-0': !tradingSettings.confirmations[confirmation.key]
                    }"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- API & Integrations -->
        <div v-if="activeSection === 'api'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">API & Integrations</h2>
          
          <div class="space-y-6">
            <!-- API Keys -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-900">API Keys</h3>
                <button @click="showCreateApiModal = true" class="btn-primary">
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Create API Key
                </button>
              </div>
              
              <div class="space-y-3">
                <div
                  v-for="apiKey in apiKeys"
                  :key="apiKey.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ apiKey.name }}</p>
                    <p class="text-sm text-gray-500">
                      Created {{ apiKey.created }} • Last used {{ apiKey.lastUsed }}
                    </p>
                    <div class="flex gap-2 mt-2">
                      <span
                        v-for="permission in apiKey.permissions"
                        :key="permission"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ permission }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="revokeApiKey(apiKey.id)"
                      class="text-sm text-red-600 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Connected Apps -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Connected Applications</h3>
              <div class="space-y-3">
                <div
                  v-for="app in connectedApps"
                  :key="app.id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      <component :is="app.icon" class="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ app.name }}</p>
                      <p class="text-sm text-gray-500">Connected {{ app.connected }}</p>
                    </div>
                  </div>
                  <button
                    @click="disconnectApp(app.id)"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Management -->
        <div v-if="activeSection === 'account'" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Account Management</h2>
          
          <div class="space-y-6">
            <!-- Data Export -->
            <div class="p-4 border border-gray-200 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Export Your Data</h3>
              <p class="text-sm text-gray-500 mb-4">
                Download a copy of all your account data including trades, transactions, and preferences.
              </p>
              <button @click="exportData" class="btn-secondary" :disabled="exportingData">
                <DownloadIcon class="h-4 w-4 mr-2" />
                {{ exportingData ? 'Preparing Export...' : 'Request Data Export' }}
              </button>
            </div>

            <!-- Account Deactivation -->
            <div class="p-4 border border-red-200 rounded-lg bg-red-50">
              <h3 class="text-sm font-medium text-red-900 mb-2">Deactivate Account</h3>
              <p class="text-sm text-red-700 mb-4">
                Temporarily disable your account. You can reactivate it by logging in again.
              </p>
              <button @click="showDeactivateModal = true" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Deactivate Account
              </button>
            </div>

            <!-- Account Deletion -->
            <div class="p-4 border border-red-300 rounded-lg bg-red-100">
              <h3 class="text-sm font-medium text-red-900 mb-2">Delete Account</h3>
              <p class="text-sm text-red-800 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button @click="showDeleteModal = true" class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Create API Key Modal -->
    <div v-if="showCreateApiModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Create API Key</h3>
          <button @click="showCreateApiModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        
        <form @submit.prevent="createApiKey" class="space-y-4">
          <div>
            <label for="apiKeyName" class="block text-sm font-medium text-gray-700 mb-1">
              API Key Name
            </label>
            <input
              id="apiKeyName"
              v-model="newApiKey.name"
              type="text"
              required
              class="input-field"
              placeholder="My Trading Bot"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div class="space-y-2">
              <label
                v-for="permission in apiPermissions"
                :key="permission.value"
                class="flex items-center"
              >
                <input
                  v-model="newApiKey.permissions"
                  :value="permission.value"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ permission.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary">
              Create API Key
            </button>
            <button
              type="button"
              @click="showCreateApiModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Deletion Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-red-900">Delete Account</h3>
          <button @click="showDeleteModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        
        <div class="mb-4">
          <p class="text-sm text-gray-700 mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <p class="text-sm text-gray-700 mb-4">
            Type <strong>DELETE</strong> to confirm:
          </p>
          <input
            v-model="deleteConfirmation"
            type="text"
            class="input-field"
            placeholder="Type DELETE here"
          />
        </div>
        
        <div class="flex gap-3">
          <button
            @click="deleteAccount"
            :disabled="deleteConfirmation !== 'DELETE'"
            class="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Delete Account
          </button>
          <button
            @click="showDeleteModal = false"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import {
  SettingsIcon,
  BellIcon,
  ShieldIcon,
  TrendingUpIcon,
  CodeIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  PlusIcon,
  DownloadIcon,
  SmartphoneIcon,
  LaptopIcon,
  TabletIcon
} from 'lucide-vue-next'

const userStore = useUserStore()
const router = useRouter()

// Reactive state
const activeSection = ref('general')
const successMessage = ref('')
const errorMessage = ref('')
const exportingData = ref(false)
const showCreateApiModal = ref(false)
const showDeactivateModal = ref(false)
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')

// Settings sections
const settingSections = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldIcon },
  { id: 'trading', label: 'Trading', icon: TrendingUpIcon },
  { id: 'api', label: 'API & Integrations', icon: CodeIcon },
  { id: 'account', label: 'Account', icon: UserIcon }
]

// Theme options
const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon }
]

// Settings data
const settings = reactive({
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  autoSave: true
})

const notifications = reactive({
  trades: true,
  priceAlerts: true,
  news: false,
  reports: true,
  security: true,
  marketing: false,
  quietHours: {
    start: '22:00',
    end: '08:00'
  }
})

const privacySettings = reactive({
  profileVisibility: true,
  activityTracking: false,
  dataSharing: false,
  analytics: true
})

const tradingSettings = reactive({
  defaultOrderType: 'market',
  timeInForce: 'day',
  maxOrderSize: 10000,
  defaultStopLoss: 5,
  defaultTakeProfit: 10,
  confirmations: {
    orders: true,
    largeOrders: true,
    stopLoss: false,
    takeProfit: false
  }
})

// Notification settings configuration
const notificationSettings = [
  {
    key: 'trades',
    title: 'Trade Executions',
    description: 'Get notified when your trades are executed'
  },
  {
    key: 'priceAlerts',
    title: 'Price Alerts',
    description: 'Receive alerts when price targets are reached'
  },
  {
    key: 'news',
    title: 'Market News',
    description: 'Stay updated with relevant market news'
  },
  {
    key: 'reports',
    title: 'Performance Reports',
    description: 'Weekly and monthly portfolio reports'
  },
  {
    key: 'security',
    title: 'Security Alerts',
    description: 'Important security and login notifications'
  },
  {
    key: 'marketing',
    title: 'Marketing Updates',
    description: 'Product updates and promotional content'
  }
]

// Privacy settings configuration
const privacySettings = [
  {
    key: 'profileVisibility',
    title: 'Profile Visibility',
    description: 'Allow others to view your public profile'
  },
  {
    key: 'activityTracking',
    title: 'Activity Tracking',
    description: 'Track your app usage for analytics'
  },
  {
    key: 'dataSharing',
    title: 'Data Sharing',
    description: 'Share anonymized data for research'
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Help improve the app with usage analytics'
  }
]

// Trading confirmations
const tradingConfirmations = [
  {
    key: 'orders',
    title: 'Order Confirmations',
    description: 'Confirm all trade orders before execution'
  },
  {
    key: 'largeOrders',
    title: 'Large Order Warnings',
    description: 'Extra confirmation for orders above $1,000'
  },
  {
    key: 'stopLoss',
    title: 'Stop Loss Confirmations',
    description: 'Confirm stop loss modifications'
  },
  {
    key: 'takeProfit',
    title: 'Take Profit Confirmations',
    description: 'Confirm take profit modifications'
  }
]

// Active sessions
const activeSessions = ref([
  {
    id: '1',
    device: 'MacBook Pro',
    deviceIcon: LaptopIcon,
    location: 'New York, US',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: '2',
    device: 'iPhone 15',
    deviceIcon: SmartphoneIcon,
    location: 'New York, US',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: '3',
    device: 'iPad Air',
    deviceIcon: TabletIcon,
    location: 'Boston, US',
    lastActive: '3 days ago',
    current: false
  }
])

// API Keys
const apiKeys = ref([
  {
    id: '1',
    name: 'Trading Bot Alpha',
    created: '2024-01-15',
    lastUsed: '2 hours ago',
    permissions: ['read', 'trade']
  },
  {
    id: '2',
    name: 'Portfolio Analyzer',
    created: '2024-02-01',
    lastUsed: '1 day ago',
    permissions: ['read']
  }
])

// Connected Apps
const connectedApps = ref([
  {
    id: '1',
    name: 'TradingView',
    icon: TrendingUpIcon,
    connected: '2 weeks ago'
  },
  {
    id: '2',
    name: 'Portfolio Tracker',
    icon: MonitorIcon,
    connected: '1 month ago'
  }
])

// New API Key form
const newApiKey = reactive({
  name: '',
  permissions: []
})

// API Permissions
const apiPermissions = [
  { value: 'read', label: 'Read portfolio data' },
  { value: 'trade', label: 'Execute trades' },
  { value: 'withdraw', label: 'Withdraw funds' },
  { value: 'admin', label: 'Administrative access' }
]

// Methods
const updateSettings = async (key: string, value: any) => {
  try {
    // Here you would call your API to update settings
    // await api.updateSettings({ [key]: value })
    
    showSuccess(`${key} updated successfully`)
  } catch (error) {
    showError(`Failed to update ${key}`)
  }
}

const toggleSetting = async (key: string) => {
  settings[key] = !settings[key]
  await updateSettings(key, settings[key])
}

const toggleNotification = async (key: string) => {
  notifications[key] = !notifications[key]
  try {
    // await api.updateNotificationSettings(notifications)
    showSuccess('Notification preferences updated')
  } catch (error) {
    showError('Failed to update notification preferences')
  }
}

const togglePrivacy = async (key: string) => {
  privacySettings[key] = !privacySettings[key]
  try {
    // await api.updatePrivacySettings(privacySettings)
    showSuccess('Privacy settings updated')
  } catch (error) {
    showError('Failed to update privacy settings')
  }
}

const toggleTradingConfirmation = async (key: string) => {
  tradingSettings.confirmations[key] = !tradingSettings.confirmations[key]
  try {
    // await api.updateTradingSettings(tradingSettings)
    showSuccess('Trading preferences updated')
  } catch (error) {
    showError('Failed to update trading preferences')
  }
}

const revokeSession = async (sessionId: string) => {
  try {
    // await api.revokeSession(sessionId)
    activeSessions.value = activeSessions.value.filter(session => session.id !== sessionId)
    showSuccess('Session revoked successfully')
  } catch (error) {
    showError('Failed to revoke session')
  }
}

const createApiKey = async () => {
  try {
    // await api.createApiKey(newApiKey)
    const newKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions: [...newApiKey.permissions]
    }
    
    apiKeys.value.push(newKey)
    showCreateApiModal.value = false
    newApiKey.name = ''
    newApiKey.permissions = []
    showSuccess('API key created successfully')
  } catch (error) {
    showError('Failed to create API key')
  }
}

const revokeApiKey = async (keyId: string) => {
  try {
    // await api.revokeApiKey(keyId)
    apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
    showSuccess('API key revoked successfully')
  } catch (error) {
    showError('Failed to revoke API key')
  }
}

const disconnectApp = async (appId: string) => {
  try {
    // await api.disconnectApp(appId)
    connectedApps.value = connectedApps.value.filter(app => app.id !== appId)
    showSuccess('Application disconnected successfully')
  } catch (error) {
    showError('Failed to disconnect application')
  }
}

const exportData = async () => {
  exportingData.value = true
  try {
    // await api.requestDataExport()
    // Simulate export preparation
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccess('Data export has been requested. You will receive an email when ready.')
  } catch (error) {
    showError('Failed to request data export')
  } finally {
    exportingData.value = false
  }
}

const deleteAccount = async () => {
  try {
    // await api.deleteAccount()
    showSuccess('Account deletion initiated. You will be logged out shortly.')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    showError('Failed to delete account')
  }
}

const showSuccess = (message: string) => {
  successMessage.value = message
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showError = (message: string) => {
  errorMessage.value = message
  successMessage.value = ''
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Load settings on mount
onMounted(async () => {
  try {
    // Load user settings from API
    // const userSettings = await api.getSettings()
    // Object.assign(settings, userSettings)
    
    // Load notification preferences
    // const notificationPrefs = await api.getNotificationSettings()
    // Object.assign(notifications, notificationPrefs)
    
    // Load privacy settings
    // const privacyPrefs = await api.getPrivacySettings()
    // Object.assign(privacySettings, privacyPrefs)
    
    // Load trading settings
    // const tradingPrefs = await api.getTradingSettings()
    // Object.assign(tradingSettings, tradingPrefs)
    
  } catch (error) {
    showError('Failed to load settings')
  }
})
</script>

<style scoped>
/* Additional custom styles */
.btn-primary, .btn-secondary {
  @apply flex items-center justify-center;
}

/* Custom scrollbar for settings navigation */
.settings-nav::-webkit-scrollbar {
  width: 4px;
}

.settings-nav::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.settings-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.settings-nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>