import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { type PluginOptions } from 'vue-toastification'
import router from './router'
import App from './App.vue'

// Styles
import './assets/css/main.css'
import 'vue-toastification/dist/index.css'

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Toast configuration
const toastOptions: PluginOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Use plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Global properties with TypeScript support
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $formatCurrency: (value: number, currency?: string) => string
    $formatNumber: (value: number, decimals?: number) => string
    $formatPercent: (value: number) => string
  }
}

app.config.globalProperties.$formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

app.config.globalProperties.$formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

app.config.globalProperties.$formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}

// Error handling
app.config.errorHandler = (err: unknown, instance, info: string) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount app
app.mount('#app')