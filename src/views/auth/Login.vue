<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Main Card Container -->
      <div class="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
        
        <!-- Header -->
        <div class="p-8 pb-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p class="text-white text-opacity-70">Sign in to your account</p>
          </div>
        </div>

        <!-- Login Form -->
        <div class="px-8 pb-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label class="block text-white text-sm font-medium">Email Address</label>
              <div class="relative">
                <Mail class="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  :class="[
                    'w-full pl-11 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    'text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.email ? 'border-red-400' : ''
                  ]"
                />
              </div>
              <p v-if="errors.email" class="text-red-300 text-sm">{{ errors.email }}</p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label class="block text-white text-sm font-medium">Password</label>
              <div class="relative">
                <Lock class="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="Enter your password"
                  :class="[
                    'w-full pl-11 pr-11 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    'text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.password ? 'border-red-400' : ''
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-white text-opacity-50 hover:text-opacity-100 transition-colors"
                >
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="errors.password" class="text-red-300 text-sm">{{ errors.password }}</p>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input 
                  v-model="form.rememberMe"
                  type="checkbox" 
                  class="w-4 h-4 text-blue-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-white focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-white text-opacity-70">Remember me</span>
              </label>
              <button 
                type="button"
                @click="$emit('forgot-password')"
                class="text-sm text-white text-opacity-70 hover:text-opacity-100 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <!-- Error Message -->
            <div v-if="errors.general" class="bg-red-500 bg-opacity-20 border border-red-400 text-red-300 px-4 py-3 rounded-lg">
              {{ errors.general }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-500 bg-opacity-20 border border-green-400 text-green-300 px-4 py-3 rounded-lg">
              {{ successMessage }}
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
            </button>

            <!-- Social Login -->
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white border-opacity-20"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-transparent text-white text-opacity-70">Or continue with</span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="loginWithGoogle"
                  class="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-sm font-medium text-white hover:bg-opacity-20 transition-all duration-200"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span class="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  @click="loginWithGithub"
                  class="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-sm font-medium text-white hover:bg-opacity-20 transition-all duration-200"
                >
                  <Github class="w-5 h-5" />
                  <span class="ml-2">GitHub</span>
                </button>
              </div>
            </div>

            <!-- Register Link -->
            <div class="text-center mt-6">
              <p class="text-white text-opacity-70">
                Don't have an account? 
                <button 
                  type="button"
                  @click="$emit('switch-to-register')"
                  class="text-white hover:text-opacity-80 font-medium underline transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Shield, Mail, Lock, Eye, EyeOff, Loader, Github } from 'lucide-vue-next'

// Emits
const emit = defineEmits(['switch-to-register', 'forgot-password', 'login-success'])

// State
const isLoading = ref(false)
const showPassword = ref(false)
const successMessage = ref('')

// Form data
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Form errors
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

// Methods
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errors.general = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock login logic - replace with actual API call
    if (form.email === 'user@example.com' && form.password === 'password') {
      successMessage.value = 'Login successful! Redirecting...'
      
      // Emit success event with user data
      setTimeout(() => {
        emit('login-success', {
          email: form.email,
          rememberMe: form.rememberMe
        })
      }, 1000)
    } else {
      errors.general = 'Invalid email or password. Please try again.'
    }
  } catch (error) {
    errors.general = 'An error occurred. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = () => {
  console.log('Login with Google')
  // Implement Google OAuth login
}

const loginWithGithub = () => {
  console.log('Login with GitHub')
  // Implement GitHub OAuth login
}
</script>

<style scoped>
/* Custom checkbox styles */
input[type="checkbox"]:checked {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Smooth animations */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus ring customization */
input:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}
</style>