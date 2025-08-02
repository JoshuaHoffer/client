import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatar?: string
}

export interface UserProfile {
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
  }
  settings: {
    riskTolerance: 'low' | 'medium' | 'high'
    autoInvest: boolean
    currency: string
  }
}

export interface PortfolioData {
  totalValue: number
  totalInvested: number
  returnPercent: number
  returnAmount: number
  dayChange: number
  dayChangePercent: number
  weekChange: number
  monthChange: number
  yearChange: number
}

export interface FinancialData {
  balance: number
  portfolio: PortfolioData
  dividends: {
    total: number
    monthly: number
    nextPayment: Date | null
  }
  transactions: Array<{
    id: string
    type: 'buy' | 'sell' | 'dividend'
    amount: number
    date: Date
    description: string
  }>
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    financialData: {
      balance: 0,
      portfolio: {
        totalValue: 0,
        totalInvested: 0,
        returnPercent: 0,
        returnAmount: 0,
        dayChange: 0,
        dayChangePercent: 0,
        weekChange: 0,
        monthChange: 0,
        yearChange: 0
      },
      dividends: {
        total: 0,
        monthly: 0,
        nextPayment: null
      },
      transactions: []
    } as FinancialData,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || 'user',
    isAdmin: (state) => state.user?.role === 'admin',
    userPreferences: (state) => state.profile?.preferences || {
      theme: 'light',
      notifications: true,
      language: 'en'
    },

    // Financial getters
    userData: (state) => state.financialData,
    portfolioData: (state) => state.financialData.portfolio,
    totalBalance: (state) => state.financialData.balance + state.financialData.portfolio.totalValue,

    // Portfolio performance getters
    portfolioPerformance: (state) => ({
      returnPercent: state.financialData.portfolio.returnPercent,
      returnAmount: state.financialData.portfolio.returnAmount,
      dayChange: state.financialData.portfolio.dayChange,
      dayChangePercent: state.financialData.portfolio.dayChangePercent,
      weekChange: state.financialData.portfolio.weekChange,
      monthChange: state.financialData.portfolio.monthChange,
      yearChange: state.financialData.portfolio.yearChange
    })
  },

  actions: {
    async fetchUserProfile() {
      this.isLoading = true
      try {
        // Replace with your actual API call
        // const response = await api.get('/user/profile')
        // this.profile = response.data

        // Temporary mock data
        this.profile = {
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          },
          settings: {
            riskTolerance: 'medium',
            autoInvest: false,
            currency: 'USD'
          }
        }
      } catch (error) {
        this.error = 'Failed to fetch user profile'
        console.error('Error fetching user profile:', error)
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(updates: Partial<UserProfile>) {
      this.isLoading = true
      try {
        // Replace with your actual API call
        // const response = await api.patch('/user/profile', updates)
        // this.profile = response.data

        // Temporary mock update
        if (this.profile) {
          this.profile = { ...this.profile, ...updates }
        }
      } catch (error) {
        this.error = 'Failed to update profile'
        console.error('Error updating profile:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadUserData() {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock financial data with realistic values
        this.financialData = {
          balance: 15420.75,
          portfolio: {
            totalValue: 128450.30,
            totalInvested: 115000.00,
            returnPercent: 11.69,
            returnAmount: 13450.30,
            dayChange: 2847.50,
            dayChangePercent: 2.27,
            weekChange: 1.5,
            monthChange: 8.2,
            yearChange: 15.7
          },
          dividends: {
            total: 8920.45,
            monthly: 742.54,
            nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
          },
          transactions: [
            {
              id: 'txn_001',
              type: 'dividend',
              amount: 742.54,
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              description: 'Monthly dividend payment'
            },
            {
              id: 'txn_002',
              type: 'buy',
              amount: -5000,
              date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
              description: 'Portfolio investment'
            },
            {
              id: 'txn_003',
              type: 'dividend',
              amount: 689.32,
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              description: 'Monthly dividend payment'
            }
          ]
        }
      } catch (error) {
        this.error = 'Failed to load user financial data'
        console.error('Error loading user data:', error)
      } finally {
        this.isLoading = false
      }
    },

    getBalanceInCurrency(currency: string = 'USD'): number {
      // Mock currency conversion rates
      const conversionRates: Record<string, number> = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110,
        'CAD': 1.25,
        'AUD': 1.35,
        'ETH': 0.0004,
        'BTC': 0.000025
      }

      const rate = conversionRates[currency.toUpperCase()] || 1
      return this.financialData.balance * rate
    },

    getPortfolioValueInCurrency(currency: string = 'USD'): number {
      const conversionRates: Record<string, number> = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110,
        'CAD': 1.25,
        'AUD': 1.35,
        'ETH': 0.0004,
        'BTC': 0.000025
      }

      const rate = conversionRates[currency.toUpperCase()] || 1
      return this.financialData.portfolio.totalValue * rate
    },

    updatePortfolioData(newData: Partial<PortfolioData>) {
      this.financialData.portfolio = {
        ...this.financialData.portfolio,
        ...newData
      }
    },

    addTransaction(transaction: Omit<FinancialData['transactions'][0], 'id'>) {
      const newTransaction = {
        id: `txn_${Date.now()}`,
        ...transaction
      }

      this.financialData.transactions.unshift(newTransaction)

      // Update balance based on transaction
      if (transaction.type === 'dividend') {
        this.financialData.balance += transaction.amount
      } else if (transaction.type === 'buy') {
        this.financialData.balance += transaction.amount // amount is negative for buys
      } else if (transaction.type === 'sell') {
        this.financialData.balance += transaction.amount
      }
    },

    setUser(user: User) {
      this.user = user
    },

    clearUser() {
      this.user = null
      this.profile = null
      this.financialData = {
        balance: 0,
        portfolio: {
          totalValue: 0,
          totalInvested: 0,
          returnPercent: 0,
          returnAmount: 0,
          dayChange: 0,
          dayChangePercent: 0,
          weekChange: 0,
          monthChange: 0,
          yearChange: 0
        },
        dividends: {
          total: 0,
          monthly: 0,
          nextPayment: null
        },
        transactions: []
      }
      this.error = null
    },

    clearError() {
      this.error = null
    },

    // Legacy methods (kept for backward compatibility)
    calculatePortfolioValue() {
      return {
        totalValue: this.financialData.portfolio.totalValue,
        todayChange: this.financialData.portfolio.dayChange,
        todayChangePercent: this.financialData.portfolio.dayChangePercent
      }
    },

    calculatePortfolioPerformance() {
      return {
        weekChange: this.financialData.portfolio.weekChange,
        monthChange: this.financialData.portfolio.monthChange,
        yearChange: this.financialData.portfolio.yearChange
      }
    },

    // Initialize defaults to prevent undefined errors
    initializeDefaults() {
      if (!this.financialData.portfolio) {
        this.financialData = {
          balance: 0,
          portfolio: {
            totalValue: 0,
            totalInvested: 0,
            returnPercent: 0,
            returnAmount: 0,
            dayChange: 0,
            dayChangePercent: 0,
            weekChange: 0,
            monthChange: 0,
            yearChange: 0
          },
          dividends: {
            total: 0,
            monthly: 0,
            nextPayment: null
          },
          transactions: []
        }
      }
    },

    async refreshData() {
      await this.loadUserData()
    }
  }
})