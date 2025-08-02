// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import views
import Dashboard from '@/views/Dashboard.vue'
import Investment from '@/views/InvestmentView.vue'
import Portfolio from '@/views/PortfolioView.vue'
import Dividends from '@/views/DividendsView.vue'
import TradingBots from '@/views/TradingBots.vue'
import Admin from '@/views/AdminView.vue'

// Auth views
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

// Error views
import NotFound from '@/views/errors/NotFound.vue'
import Unauthorized from '@/views/errors/Unauthorized.vue'

const routes = [
  // Root redirect
  {
    path: '/',
    redirect: '/dashboard'
  },

  // Main application routes
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: 'Dashboard - Tesseract Fund',
      breadcrumb: 'Dashboard'
    }
  },

  {
    path: '/invest',
    name: 'Investment',
    component: Investment,
    meta: {
      requiresAuth: true,
      title: 'Invest & Divest - Tesseract Fund',
      breadcrumb: 'Investment'
    }
  },

  {
    path: '/portfolio',
    name: 'Portfolio',
    component: Portfolio,
    meta: {
      requiresAuth: true,
      title: 'Portfolio - Tesseract Fund',
      breadcrumb: 'Portfolio'
    }
  },

  {
    path: '/dividends',
    name: 'Dividends',
    component: Dividends,
    meta: {
      requiresAuth: true,
      title: 'Dividends - Tesseract Fund',
      breadcrumb: 'Dividends'
    }
  },

  {
    path: '/trading-bots',
    name: 'TradingBots',
    component: TradingBots,
    meta: {
      requiresAuth: true,
      title: 'Trading Bots - Tesseract Fund',
      breadcrumb: 'Trading Bots'
    }
  },

  // Admin routes (manager only)
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'Administration - Tesseract Fund',
      breadcrumb: 'Administration'
    }
  },

  // Admin sub-routes for direct access
  {
    path: '/admin/overview',
    name: 'AdminOverview',
    component: Admin,
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'Fund Overview - Admin',
      adminTab: 'overview'
    }
  },

  {
    path: '/admin/investors',
    name: 'AdminInvestors',
    component: Admin,
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'Investor Management - Admin',
      adminTab: 'investors'
    }
  },

  {
    path: '/admin/dividends',
    name: 'AdminDividends',
    component: Admin,
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'Dividend Management - Admin',
      adminTab: 'dividends'
    }
  },

  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: Admin,
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'System Settings - Admin',
      adminTab: 'system'
    }
  },

  // Authentication routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresGuest: true,
      title: 'Login - Tesseract Fund',
      hideNavigation: true
    }
  },

  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresGuest: true,
      title: 'Register - Tesseract Fund',
      hideNavigation: true
    }
  },

  // Profile and settings routes
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'Profile - Tesseract Fund',
      breadcrumb: 'Profile'
    }
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: 'Settings - Tesseract Fund',
      breadcrumb: 'Settings'
    }
  },

  // Transaction routes
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/Transactions.vue'),
    meta: {
      requiresAuth: true,
      title: 'Transaction History - Tesseract Fund',
      breadcrumb: 'Transactions'
    }
  },

  {
    path: '/transactions/:id',
    name: 'TransactionDetail',
    component: () => import('@/views/TransactionDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'Transaction Details - Tesseract Fund',
      breadcrumb: 'Transaction Details'
    }
  },

  // Bot management routes
  {
    path: '/bots/:id',
    name: 'BotDetail',
    component: () => import('@/views/BotDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'Bot Details - Tesseract Fund',
      breadcrumb: 'Bot Details'
    }
  },

  {
    path: '/bots/:id/configure',
    name: 'BotConfigure',
    component: () => import('@/views/BotConfigure.vue'),
    meta: {
      requiresAuth: true,
      requiresManager: true,
      title: 'Configure Bot - Tesseract Fund',
      breadcrumb: 'Configure Bot'
    }
  },

  // Error routes
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: {
      title: 'Unauthorized - Tesseract Fund',
      hideNavigation: true
    }
  },

  // 404 catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Page Not Found - Tesseract Fund',
      hideNavigation: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to saved position if available (browser back/forward)
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to top for new routes
    return { top: 0 }
  }
})

// Global navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login with return URL
      return next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }

    // Check if route requires manager role
    if (to.meta.requiresManager && !authStore.isManager) {
      return next({ name: 'Unauthorized' })
    }
  }

  // Redirect authenticated users away from guest-only routes
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Continue navigation
  next()
})

// After navigation hook for analytics, etc.
router.afterEach((to, from) => {
  // Track page views
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: to.meta.title,
      page_location: window.location.href
    })
  }

  // Update breadcrumb store if you have one
  // const breadcrumbStore = useBreadcrumbStore()
  // breadcrumbStore.updateBreadcrumb(to.meta.breadcrumb)
})

// Route helper functions
export const routeHelpers = {
  // Check if current route is admin
  isAdminRoute: (route) => {
    return route.path.startsWith('/admin')
  },

  // Get admin tab from route
  getAdminTab: (route) => {
    return route.meta?.adminTab || 'overview'
  },

  // Build breadcrumb from route
  buildBreadcrumb: (route) => {
    const segments = route.path.split('/').filter(Boolean)
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/')
      return {
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: path,
        active: index === segments.length - 1
      }
    })
  },

  // Navigation menu items (for sidebar/header)
  getNavigationItems: (userRole) => {
    const baseItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: '📊',
        description: 'Overview and analytics'
      },
      {
        name: 'Invest & Divest',
        path: '/invest',
        icon: '💰',
        description: 'Buy and sell fund tokens'
      },
      {
        name: 'Portfolio',
        path: '/portfolio',
        icon: '📈',
        description: 'Holdings and allocation'
      },
      {
        name: 'Dividends',
        path: '/dividends',
        icon: '💎',
        description: 'Dividend preferences and history'
      },
      {
        name: 'Trading Bots',
        path: '/trading-bots',
        icon: '🤖',
        description: 'Automated trading strategies'
      },
      {
        name: 'Transactions',
        path: '/transactions',
        icon: '📋',
        description: 'Transaction history'
      }
    ]

    // Add admin items for managers
    if (userRole === 'manager') {
      baseItems.push({
        name: 'Administration',
        path: '/admin',
        icon: '⚙️',
        description: 'Fund management and settings'
      })
    }

    return baseItems
  }
}

export default router