<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p class="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="userStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <AlertCircleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ userStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex">
        <CheckCircleIcon class="h-5 w-5 text-green-400" />
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Personal Information</h2>
            <button
              v-if="!editingPersonal"
              @click="editingPersonal = true"
              class="btn-secondary"
            >
              <PenIcon class="h-4 w-4 mr-2" />
              Edit
            </button>
          </div>

          <form @submit.prevent="savePersonalInfo" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  v-model="personalForm.name"
                  :disabled="!editingPersonal"
                  type="text"
                  class="input-field"
                  :class="{ 'bg-gray-50': !editingPersonal }"
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="personalForm.email"
                  :disabled="!editingPersonal"
                  type="email"
                  class="input-field"
                  :class="{ 'bg-gray-50': !editingPersonal }"
                />
              </div>
            </div>

            <div v-if="editingPersonal" class="flex gap-3 pt-4">
              <button type="submit" class="btn-primary" :disabled="savingPersonal">
                <SaveIcon class="h-4 w-4 mr-2" />
                {{ savingPersonal ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                type="button"
                @click="cancelPersonalEdit"
                class="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Investment Preferences -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Investment Preferences</h2>
            <button
              v-if="!editingPreferences"
              @click="editingPreferences = true"
              class="btn-secondary"
            >
              <SettingsIcon class="h-4 w-4 mr-2" />
              Edit
            </button>
          </div>

          <form @submit.prevent="savePreferences" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Risk Tolerance
              </label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label
                  v-for="risk in riskOptions"
                  :key="risk.value"
                  class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                  :class="{
                    'border-primary-500 bg-primary-50': preferencesForm.riskTolerance === risk.value,
                    'border-gray-300': preferencesForm.riskTolerance !== risk.value,
                    'cursor-not-allowed opacity-50': !editingPreferences
                  }"
                >
                  <input
                    v-model="preferencesForm.riskTolerance"
                    :value="risk.value"
                    :disabled="!editingPreferences"
                    type="radio"
                    class="sr-only"
                  />
                  <div class="flex flex-col">
                    <span class="block text-sm font-medium text-gray-900">
                      {{ risk.label }}
                    </span>
                    <span class="block text-sm text-gray-500">
                      {{ risk.description }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Currency
                </label>
                <select
                  id="currency"
                  v-model="preferencesForm.currency"
                  :disabled="!editingPreferences"
                  class="input-field"
                  :class="{ 'bg-gray-50': !editingPreferences }"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Auto-Invest</h4>
                  <p class="text-sm text-gray-500">Automatically invest available funds</p>
                </div>
                <button
                  type="button"
                  :disabled="!editingPreferences"
                  @click="preferencesForm.autoInvest = !preferencesForm.autoInvest"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="{
                    'bg-primary-600': preferencesForm.autoInvest,
                    'bg-gray-200': !preferencesForm.autoInvest,
                    'cursor-not-allowed opacity-50': !editingPreferences
                  }"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="{
                      'translate-x-5': preferencesForm.autoInvest,
                      'translate-x-0': !preferencesForm.autoInvest
                    }"
                  />
                </button>
              </div>
            </div>

            <div v-if="editingPreferences" class="flex gap-3 pt-4">
              <button type="submit" class="btn-primary" :disabled="savingPreferences">
                <SaveIcon class="h-4 w-4 mr-2" />
                {{ savingPreferences ? 'Saving...' : 'Save Preferences' }}
              </button>
              <button
                type="button"
                @click="cancelPreferencesEdit"
                class="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Security Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Security</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Change Password</h4>
                <p class="text-sm text-gray-500">Update your account password</p>
              </div>
              <button
                @click="showPasswordModal = true"
                class="btn-secondary"
              >
                <KeyIcon class="h-4 w-4 mr-2" />
                Change
              </button>
            </div>

            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p class="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <button class="btn-secondary">
                <ShieldIcon class="h-4 w-4 mr-2" />
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Profile Avatar -->
        <div class="card text-center">
          <div class="relative inline-block">
            <div class="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
              <UserIcon class="h-12 w-12 text-gray-600" />
            </div>
            <button class="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
              <CameraIcon class="h-4 w-4" />
            </button>
          </div>
          <h3 class="text-lg font-medium text-gray-900">{{ userStore.userName || 'User' }}</h3>
          <p class="text-sm text-gray-500">{{ userStore.user?.email }}</p>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
            {{ userStore.userRole }}
          </span>
        </div>

        <!-- Account Stats -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Account Type</span>
              <span class="text-sm font-medium text-gray-900 capitalize">{{ userStore.userRole }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Member Since</span>
              <span class="text-sm font-medium text-gray-900">Jan 2024</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Last Login</span>
              <span class="text-sm font-medium text-gray-900">Today</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <router-link to="/dashboard" class="w-full btn-secondary text-left">
              <DashboardIcon class="h-4 w-4 mr-2" />
              Dashboard
            </router-link>
            <router-link to="/portfolio" class="w-full btn-secondary text-left">
              <TrendingUpIcon class="h-4 w-4 mr-2" />
              Portfolio
            </router-link>
            <router-link to="/settings" class="w-full btn-secondary text-left">
              <SettingsIcon class="h-4 w-4 mr-2" />
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Change Password</h3>
          <button @click="showPasswordModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              v-model="passwordForm.current"
              type="password"
              required
              class="input-field"
            />
          </div>
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              v-model="passwordForm.new"
              type="password"
              required
              class="input-field"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirm"
              type="password"
              required
              class="input-field"
            />
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary" :disabled="changingPassword">
              {{ changingPassword ? 'Changing...' : 'Change Password' }}
            </button>
            <button
              type="button"
              @click="showPasswordModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  UserIcon,
  PenIcon,
  SaveIcon,
  SettingsIcon,
  KeyIcon,
  ShieldIcon,
  CameraIcon,
  XIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DashboardIcon,
  TrendingUpIcon
} from 'lucide-vue-next'

const userStore = useUserStore()

// Reactive state
const editingPersonal = ref(false)
const editingPreferences = ref(false)
const savingPersonal = ref(false)
const savingPreferences = ref(false)
const showPasswordModal = ref(false)
const changingPassword = ref(false)
const successMessage = ref('')

// Forms
const personalForm = reactive({
  name: '',
  email: ''
})

const preferencesForm = reactive({
  riskTolerance: 'medium',
  currency: 'USD',
  autoInvest: false
})

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

// Risk tolerance options
const riskOptions = [
  {
    value: 'low',
    label: 'Conservative',
    description: 'Lower risk, stable returns'
  },
  {
    value: 'medium',
    label: 'Moderate',
    description: 'Balanced risk and growth'
  },
  {
    value: 'high',
    label: 'Aggressive',
    description: 'Higher risk, higher potential'
  }
]

// Methods
const loadUserData = () => {
  if (userStore.user) {
    personalForm.name = userStore.user.name
    personalForm.email = userStore.user.email
  }
  
  if (userStore.profile) {
    preferencesForm.riskTolerance = userStore.profile.settings.riskTolerance
    preferencesForm.currency = userStore.profile.settings.currency
    preferencesForm.autoInvest = userStore.profile.settings.autoInvest
  }
}

const savePersonalInfo = async () => {
  savingPersonal.value = true
  try {
    // Here you would typically call an API to update user info
    // await api.updateUser(personalForm)
    
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    editingPersonal.value = false
    showSuccessMessage('Personal information updated successfully!')
  } catch (error) {
    console.error('Error saving personal info:', error)
  } finally {
    savingPersonal.value = false
  }
}

const cancelPersonalEdit = () => {
  editingPersonal.value = false
  loadUserData() // Reset form data
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    await userStore.updateProfile({
      settings: {
        riskTolerance: preferencesForm.riskTolerance,
        currency: preferencesForm.currency,
        autoInvest: preferencesForm.autoInvest
      }
    })
    
    editingPreferences.value = false
    showSuccessMessage('Investment preferences updated successfully!')
  } catch (error) {
    console.error('Error saving preferences:', error)
  } finally {
    savingPreferences.value = false
  }
}

const cancelPreferencesEdit = () => {
  editingPreferences.value = false
  loadUserData() // Reset form data
}

const changePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    alert('New passwords do not match!')
    return
  }
  
  changingPassword.value = true
  try {
    // Here you would call your password change API
    // await api.changePassword(passwordForm)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showPasswordModal.value = false
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''
    showSuccessMessage('Password changed successfully!')
  } catch (error) {
    console.error('Error changing password:', error)
  } finally {
    changingPassword.value = false
  }
}

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

// Lifecycle
onMounted(async () => {
  await userStore.fetchUserProfile()
  loadUserData()
})
</script>

<style scoped>
/* Additional custom styles if needed */
.btn-secondary {
  @apply flex items-center justify-center;
}
</style>