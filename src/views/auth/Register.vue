<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Main Card Container -->
      <div class="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
        
        <!-- Header -->
        <div class="p-8 pb-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus class="w-8 h-8 " />
            </div>
            <h1 class="text-2xl font-bold  mb-2">Create Account</h1>
            <p class=" text-opacity-70">Join us and start your journey</p>
          </div>
        </div>

        <!-- Register Form -->
        <div class="px-8 pb-8">
          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block  text-sm font-medium">First Name</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="First name"
                  :class="[
                    'w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    ' placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.firstName ? 'border-red-400' : ''
                  ]"
                />
                <p v-if="errors.firstName" class="text-red-300 text-sm">{{ errors.firstName }}</p>
              </div>
              <div class="space-y-2">
                <label class="block  text-sm font-medium">Last Name</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  :class="[
                    'w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    ' placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.lastName ? 'border-red-400' : ''
                  ]"
                />
                <p v-if="errors.lastName" class="text-red-300 text-sm">{{ errors.lastName }}</p>
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
              <label class="block  text-sm font-medium">Email Address</label>
              <div class="relative">
                <Mail class="absolute left-3 top-3 w-5 h-5  text-opacity-50" />
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  :class="[
                    'w-full pl-11 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    ' placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.email ? 'border-red-400' : ''
                  ]"
                />
              </div>
              <p v-if="errors.email" class="text-red-300 text-sm">{{ errors.email }}</p>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label class="block  text-sm font-medium">Password</label>
              <div class="relative">
                <Lock class="absolute left-3 top-3 w-5 h-5  text-opacity-50" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="Enter your password"
                  :class="[
                    'w-full pl-11 pr-11 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    ' placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.password ? 'border-red-400' : ''
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3  text-opacity-50 hover:text-opacity-100 transition-colors"
                >
                  <Eye v-if="showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div class="space-y-2">
                <div class="flex space-x-1">
                  <div 
                    v-for="i in 4" 
                    :key="i"
                    :class="[
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      i <= passwordStrength ? getStrengthColor() : 'bg-white bg-opacity-20'
                    ]"
                  ></div>
                </div>
                <p class="text-xs  text-opacity-70">
                  {{ getStrengthText() }}
                </p>
              </div>
              
              <p v-if="errors.password" class="text-red-300 text-sm">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password Field -->
            <div class="space-y-2">
              <label class="block  text-sm font-medium">Confirm Password</label>
              <div class="relative">
                <Lock class="absolute left-3 top-3 w-5 h-5  text-opacity-50" />
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  placeholder="Confirm your password"
                  :class="[
                    'w-full pl-11 pr-11 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg',
                    ' placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
                    'transition-all duration-200',
                    errors.confirmPassword ? 'border-red-400' : ''
                  ]"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-3  text-opacity-50 hover:text-opacity-100 transition-colors"
                >
                  <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="text-red-300 text-sm">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Terms and Conditions -->
            <div class="space-y-2">
              <label class="flex items-start space-x-3">
                <input 
                  v-model="form.agreeToTerms"
                  type="checkbox" 
                  required
                  class="w-4 h-4 mt-1 text-blue-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-white focus:ring-opacity-50"
                />
                <span class="text-sm  text-opacity-70">
                  I agree to the 
                  <button type="button" @click="showTerms = true" class=" underline hover:text-opacity-100 transition-colors">
                    Terms of Service
                  </button> 
                  and 
                  <button type="button" @click="showPrivacy = true" class=" underline hover:text-opacity-100 transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </label>
              <p v-if="errors.agreeToTerms" class="text-red-300 text-sm">{{ errors.agreeToTerms }}</p>
            </div>

            <!-- Marketing Emails -->
            <div>
              <label class="flex items-center space-x-3">
                <input 
                  v-model="form.marketingEmails"
                  type="checkbox" 
                  class="w-4 h-4 text-blue-600 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-white focus:ring-opacity-50"
                />
                <span class="text-sm  text-opacity-70">
                  I'd like to receive marketing emails about new features and updates
                </span>
              </label>
            </div>

            <!-- Error Message -->
            <div v-if="errors.general" class="bg-red-500 bg-opacity-20 border border-red-400 text-red-300 px-4 py-3 rounded-lg">
              {{ errors.general }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-500 bg-opacity-20 border border-green-400 text-green-300 px-4 py-3 rounded-lg">
              {{ successMessage }}
            </div>

            <!-- Register Button -->
            <button
              type="submit"
              :disabled="isLoading || !form.agreeToTerms"
              class="w-full bg-white bg-opacity-20 hover:bg-opacity-30  font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
            </button>

            <!-- Social Register -->
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white border-opacity-20"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-transparent  text-opacity-70">Or sign up with</span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="registerWithGoogle"
                  class="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-sm font-medium  hover:bg-opacity-20 transition-all duration-200"
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
                  @click="registerWithGithub"
                  class="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-20 rounded-lg bg-white bg-opacity-10 text-sm font-medium  hover:bg-opacity-20 transition-all duration-200"
                >
                  <Github class="w-5 h-5" />
                  <span class="ml-2">GitHub</span>
                </button>
              </div>
            </div>

            <!-- Login Link -->
            <div class="text-center mt-6">
              <p class=" text-opacity-70">
                Already have an account? 
                <button 
                  type="button"
                  @click="$emit('switch-to-login')"
                  class=" hover:text-opacity-80 font-medium underline transition-colors"
                >
                  Sign in
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
import { ref, reactive, computed } from 'vue'
import { UserPlus, Mail, Lock, Eye, EyeOff, Loader, Github } from 'lucide-vue-next'

// Emits
const emit = defineEmits(['switch-to-login', 'register-success'])

// State
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')
const showTerms = ref(false)
const showPrivacy = ref(false)

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  marketingEmails: false
})

// Form errors
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: '',
  general: ''
})

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(4, strength)
})

// Methods
const getStrengthColor = () => {
  switch (passwordStrength.value) {
    case 1: return 'bg-red-400'
    case 2: return 'bg-yellow-400'
    case 3: return 'bg-blue-400'
    case 4: return 'bg-green-400'
    default: return 'bg-white bg-opacity-20'
  }
}

const getStrengthText = () => {
  switch (passwordStrength.value) {
    case 0: return 'Enter a password'
    case 1: return 'Weak password'
    case 2: return 'Fair password'
    case 3: return 'Good password'
    case 4: return 'Strong password'
    default: return ''
  }
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  // First name validation
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters'
    isValid = false
  }

  // Last name validation
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters'
    isValid = false
  }

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
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (passwordStrength.value < 3) {
    errors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  // Terms agreement validation
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errors.general = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock registration logic - replace with actual API call
    const userData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.toLowerCase(),
      marketingEmails: form.marketingEmails
    }

    // Check if email already exists (mock check)
    if (form.email.toLowerCase() === 'existing@example.com') {
      errors.general = 'An account with this email already exists'
      return
    }

    successMessage.value = 'Account created successfully! Please check your email to verify your account.'
    
    // Emit success event with user data
    setTimeout(() => {
      emit('register-success', userData)
    }, 1500)

  } catch (error) {
    errors.general = 'An error occurred while creating your account. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const registerWithGoogle = () => {
  console.log('Register with Google')
  // Implement Google OAuth registration
}

const registerWithGithub = () => {
  console.log('Register with GitHub')
  // Implement GitHub OAuth registration
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

/* Password strength indicator animation */
.transition-colors {
  transition: background-color 0.3s ease;
}
</style>