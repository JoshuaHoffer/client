<template>
  <div class="admin-view p-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Fund Administration</h1>
        <p class="text-gray-600 mt-1">Manage fund operations, investors, and system settings</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="exportData"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          📥 Export Data
        </button>
        <button 
          @click="refreshData"
          :disabled="isRefreshing"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Admin Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button 
          v-for="tab in adminTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center py-2 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Fund Overview Tab -->
    <div v-if="activeTab === 'overview'" class="space-y-6">
      <!-- Fund Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total AUM</p>
              <p class="text-2xl font-bold text-gray-900">${{ fundMetrics.totalAUM.toLocaleString() }}</p>
              <p class="text-sm text-green-600">+{{ fundMetrics.aumGrowth }}% this month</p>
            </div>
            <div class="text-3xl">💰</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Investors</p>
              <p class="text-2xl font-bold text-gray-900">{{ fundMetrics.activeInvestors }}</p>
              <p class="text-sm text-green-600">+{{ fundMetrics.newInvestors }} new this month</p>
            </div>
            <div class="text-3xl">👥</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Management Fees</p>
              <p class="text-2xl font-bold text-gray-900">${{ fundMetrics.managementFees.toLocaleString() }}</p>
              <p class="text-sm text-gray-500">This month</p>
            </div>
            <div class="text-3xl">💳</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Performance Fee</p>
              <p class="text-2xl font-bold text-gray-900">${{ fundMetrics.performanceFee.toLocaleString() }}</p>
              <p class="text-sm text-gray-500">This quarter</p>
            </div>
            <div class="text-3xl">📈</div>
          </div>
        </div>
      </div>

      <!-- Fund Settings -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Fund Settings</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Management Fee (%)</label>
              <input 
                v-model="fundSettings.managementFee"
                type="number" 
                step="0.1"
                min="0"
                max="10"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Performance Fee (%)</label>
              <input 
                v-model="fundSettings.performanceFee"
                type="number" 
                step="0.1"
                min="0"
                max="30"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Investment ($)</label>
              <input 
                v-model="fundSettings.minimumInvestment"
                type="number" 
                min="100"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Exit Fee (%)</label>
              <input 
                v-model="fundSettings.exitFee"
                type="number" 
                step="0.1"
                min="0"
                max="5"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Lock Period (days)</label>
              <input 
                v-model="fundSettings.lockPeriod"
                type="number" 
                min="0"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fund Status</label>
              <select 
                v-model="fundSettings.status"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="open">Open for Investment</option>
                <option value="closed">Closed to New Investors</option>
                <option value="liquidating">Liquidating</option>
              </select>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <button 
            @click="saveFundSettings"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            Save Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Investor Management Tab -->
    <div v-if="activeTab === 'investors'" class="space-y-6">
      <!-- Investor Search and Filters -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-64">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">🔍</span>
              <input 
                v-model="investorSearchQuery"
                type="text" 
                placeholder="Search investors..."
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <select v-model="investorStatusFilter" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending KYC</option>
          </select>
          <button 
            @click="showAddInvestorModal = true"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            ➕ Add Investor
          </button>
        </div>
      </div>

      <!-- Investors Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">Investor Management</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holdings</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Value</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Returns</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="investor in filteredInvestors" :key="investor.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium">{{ investor.initials }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ investor.name }}</div>
                      <div class="text-sm text-gray-500">{{ investor.wallet }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ investor.holdings.toFixed(2) }} TSRT
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ investor.investmentValue.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="investor.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ investor.totalReturns >= 0 ? '+' : '' }}{{ investor.totalReturns.toFixed(2) }}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ investor.joinDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    investor.status === 'active' ? 'bg-green-100 text-green-800' :
                    investor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ investor.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewInvestorDetails(investor)"
                      class="text-blue-600 hover:text-blue-900">
                      View
                    </button>
                    <button 
                      @click="editInvestor(investor)"
                      class="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                    <button 
                      v-if="investor.status === 'active'"
                      @click="suspendInvestor(investor)"
                      class="text-red-600 hover:text-red-900">
                      Suspend
                    </button>
                    <button 
                      v-else-if="investor.status === 'suspended'"
                      @click="activateInvestor(investor)"
                      class="text-green-600 hover:text-green-900">
                      Activate
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Dividend Management Tab -->
    <div v-if="activeTab === 'dividends'" class="space-y-6">
      <!-- Dividend Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h4 class="font-medium text-gray-900 mb-2">Next Distribution</h4>
          <p class="text-2xl font-bold text-blue-900">${{ nextDividend.amount.toLocaleString() }}</p>
          <p class="text-sm text-gray-600">{{ nextDividend.date }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h4 class="font-medium text-gray-900 mb-2">Total Distributed</h4>
          <p class="text-2xl font-bold text-green-900">${{ totalDistributed.toLocaleString() }}</p>
          <p class="text-sm text-gray-600">This year</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h4 class="font-medium text-gray-900 mb-2">Available for Distribution</h4>
          <p class="text-2xl font-bold text-purple-900">${{ availableForDistribution.toLocaleString() }}</p>
          <p class="text-sm text-gray-600">Profit pool</p>
        </div>
      </div>

      <!-- Dividend Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Dividend Distribution</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Distribution Amount ($)</label>
              <input 
                v-model="dividendDistribution.amount"
                type="number" 
                min="0"
                :max="availableForDistribution"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Distribution Date</label>
              <input 
                v-model="dividendDistribution.date"
                type="date" 
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Distribution Type</label>
              <select 
                v-model="dividendDistribution.type"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="regular">Regular Dividend</option>
                <option value="special">Special Distribution</option>
                <option value="return-of-capital">Return of Capital</option>
              </select>
            </div>
          </div>
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium mb-2">Distribution Preview</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Per Token Amount:</span>
                  <span class="font-medium">${{ perTokenAmount }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Recipients:</span>
                  <span class="font-medium">{{ activeInvestorCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Distribution:</span>
                  <span class="font-medium">${{ dividendDistribution.amount || 0 }}</span>
                </div>
              </div>
            </div>
            <button 
              @click="processDividendDistribution"
              :disabled="!canProcessDividend"
              class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg">
              Process Distribution
            </button>
          </div>
        </div>
      </div>

      <!-- Dividend History -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Distribution History</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Token</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="distribution in dividendHistory" :key="distribution.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ distribution.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ distribution.type }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ distribution.totalAmount.toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ distribution.perToken.toFixed(4) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ distribution.recipients }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    distribution.status === 'completed' ? 'bg-green-100 text-green-800' :
                    distribution.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ distribution.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- System Settings Tab -->
    <div v-if="activeTab === 'system'" class="space-y-6">
      <!-- Security Settings -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Security Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Multi-Signature Wallet</h4>
              <p class="text-sm text-gray-600">Require multiple signatures for large transactions</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="securitySettings.multiSig" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">2FA Required</h4>
              <p class="text-sm text-gray-600">Require two-factor authentication for admin access</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="securitySettings.twoFA" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Transaction Limit ($)</label>
            <input 
              v-model="securitySettings.transactionLimit"
              type="number" 
              min="1000"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
      </div>

      <!-- API Settings -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">API & Integration Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Price Feed Provider</label>
            <select 
              v-model="apiSettings.priceFeedProvider"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="chainlink">Chainlink</option>
              <option value="coinbase">Coinbase Pro</option>
              <option value="binance">Binance</option>
              <option value="composite">Composite (Multiple Sources)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Trading API Keys Status</label>
            <div class="space-y-2">
              <div v-for="exchange in tradingExchanges" :key="exchange.name" class="flex items-center justify-between p-3 border rounded-lg">
                <div class="flex items-center">
                  <div :class="['w-3 h-3 rounded-full mr-3', exchange.connected ? 'bg-green-500' : 'bg-red-500']"></div>
                  <span class="font-medium">{{ exchange.name }}</span>
                </div>
                <button 
                  @click="toggleExchangeConnection(exchange)"
                  :class="[
                    'px-3 py-1 rounded text-sm',
                    exchange.connected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  ]">
                  {{ exchange.connected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup & Recovery -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Backup & Recovery</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Automated Backups</h4>
              <p class="text-sm text-gray-600">Last backup: {{ lastBackup }}</p>
            </div>
            <button 
              @click="createBackup"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Create Backup
            </button>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select 
              v-model="backupSettings.frequency"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <div class="text-green-600 text-2xl">✅</div>
          </div>
          <h3 class="text-lg font-semibold mb-2">Success!</h3>
          <p class="text-gray-600 mb-4">{{ successMessage }}</p>
          <button @click="showSuccessModal = false" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Add Investor Modal -->
    <div v-if="showAddInvestorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Add New Investor</h3>
        <form @submit.prevent="addInvestor">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Investor Name</label>
              <input 
                v-model="newInvestor.name"
                type="text" 
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input 
                v-model="newInvestor.wallet"
                type="text" 
                required
                placeholder="0x..."
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
              <select 
                v-model="newInvestor.status"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="pending">Pending KYC</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button 
              type="button"
              @click="showAddInvestorModal = false"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
              Add Investor
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  userRole: {
    type: String,
    default: 'manager'
  }
})

// State
const activeTab = ref('overview')
const isRefreshing = ref(false)
const showSuccessModal = ref(false)
const successMessage = ref('')
const showAddInvestorModal = ref(false)
const investorSearchQuery = ref('')
const investorStatusFilter = ref('')

// Admin Tabs
const adminTabs = [
  { key: 'overview', label: 'Fund Overview', icon: '📊' },
  { key: 'investors', label: 'Investor Management', icon: '👥' },
  { key: 'dividends', label: 'Dividend Management', icon: '💰' },
  { key: 'system', label: 'System Settings', icon: '⚙️' }
]

// Fund Metrics
const fundMetrics = ref({
  totalAUM: 2847392,
  aumGrowth: 12.3,
  activeInvestors: 127,
  newInvestors: 8,
  managementFees: 47456,
  performanceFee: 142369
})

// Fund Settings
const fundSettings = ref({
  managementFee: 2.0,
  performanceFee: 20.0,
  minimumInvestment: 1000,
  exitFee: 0.5,
  lockPeriod: 0,
  status: 'open'
})

// Sample Investors Data
const investors = ref([
  {
    id: 1,
    name: 'Alice Johnson',
    initials: 'AJ',
    wallet: '0x1234...5678',
    holdings: 1250.50,
    investmentValue: 157088,
    totalReturns: 15.3,
    joinDate: '2024-03-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Bob Smith',
    initials: 'BS',
    wallet: '0x9876...4321',
    holdings: 890.25,
    investmentValue: 111846,
    totalReturns: 22.1,
    joinDate: '2024-02-08',
    status: 'active'
  },
  {
    id: 3,
    name: 'Carol Davis',
    initials: 'CD',
    wallet: '0x5555...9999',
    holdings: 0,
    investmentValue: 0,
    totalReturns: 0,
    joinDate: '2024-07-20',
    status: 'pending'
  },
  {
    id: 4,
    name: 'David Wilson',
    initials: 'DW',
    wallet: '0x7777...1111',
    holdings: 2100.75,
    investmentValue: 264000,
    totalReturns: 18.7,
    joinDate: '2024-01-10',
    status: 'active'
  },
  {
    id: 5,
    name: 'Emma Thompson',
    initials: 'ET',
    wallet: '0x3333...8888',
    holdings: 0,
    investmentValue: 0,
    totalReturns: 0,
    joinDate: '2024-07-25',
    status: 'suspended'
  }
])

// New Investor Form
const newInvestor = ref({
  name: '',
  wallet: '',
  status: 'pending'
})

// Dividend Data
const nextDividend = ref({
  amount: 85000,
  date: '2024-08-15'
})

const totalDistributed = ref(340000)
const availableForDistribution = ref(125000)

const dividendDistribution = ref({
  amount: '',
  date: '',
  type: 'regular'
})

const dividendHistory = ref([
  {
    id: 1,
    date: '2024-07-15',
    type: 'regular',
    totalAmount: 75000,
    perToken: 0.85,
    recipients: 118,
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-06-15',
    type: 'regular',
    totalAmount: 68000,
    perToken: 0.78,
    recipients: 112,
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-05-15',
    type: 'special',
    totalAmount: 95000,
    perToken: 1.12,
    recipients: 108,
    status: 'completed'
  }
])

// Security Settings
const securitySettings = ref({
  multiSig: true,
  twoFA: true,
  transactionLimit: 50000
})

// API Settings
const apiSettings = ref({
  priceFeedProvider: 'chainlink'
})

const tradingExchanges = ref([
  { name: 'Binance', connected: true },
  { name: 'Coinbase Pro', connected: true },
  { name: 'Kraken', connected: false },
  { name: 'FTX', connected: false }
])

// Backup Settings
const backupSettings = ref({
  frequency: 'daily'
})

const lastBackup = ref('2024-08-01 03:00 AM')

// Computed
const filteredInvestors = computed(() => {
  return investors.value.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(investorSearchQuery.value.toLowerCase()) ||
                         investor.wallet.toLowerCase().includes(investorSearchQuery.value.toLowerCase())
    const matchesStatus = !investorStatusFilter.value || investor.status === investorStatusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const totalTokenSupply = computed(() => {
  return investors.value.reduce((sum, investor) => sum + investor.holdings, 0)
})

const perTokenAmount = computed(() => {
  const amount = parseFloat(dividendDistribution.value.amount) || 0
  return totalTokenSupply.value > 0 ? (amount / totalTokenSupply.value).toFixed(4) : '0.0000'
})

const activeInvestorCount = computed(() => {
  return investors.value.filter(investor => investor.status === 'active').length
})

const canProcessDividend = computed(() => {
  return dividendDistribution.value.amount > 0 && 
         dividendDistribution.value.date && 
         parseFloat(dividendDistribution.value.amount) <= availableForDistribution.value
})

// Methods
const refreshData = async () => {
  isRefreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshing.value = false
}

const exportData = () => {
  successMessage.value = 'Data exported successfully!'
  showSuccessModal.value = true
}

const saveFundSettings = () => {
  successMessage.value = 'Fund settings saved successfully!'
  showSuccessModal.value = true
}

const viewInvestorDetails = (investor) => {
  console.log('View details for investor:', investor.name)
}

const editInvestor = (investor) => {
  console.log('Edit investor:', investor.name)
}

const suspendInvestor = (investor) => {
  investor.status = 'suspended'
  successMessage.value = `Investor ${investor.name} has been suspended.`
  showSuccessModal.value = true
}

const activateInvestor = (investor) => {
  investor.status = 'active'
  successMessage.value = `Investor ${investor.name} has been activated.`
  showSuccessModal.value = true
}

const addInvestor = () => {
  const investor = {
    id: Date.now(),
    name: newInvestor.value.name,
    initials: newInvestor.value.name.split(' ').map(n => n[0]).join(''),
    wallet: newInvestor.value.wallet,
    holdings: 0,
    investmentValue: 0,
    totalReturns: 0,
    joinDate: new Date().toISOString().split('T')[0],
    status: newInvestor.value.status
  }
  
  investors.value.push(investor)
  showAddInvestorModal.value = false
  
  // Reset form
  newInvestor.value = { name: '', wallet: '', status: 'pending' }
  
  successMessage.value = `Investor ${investor.name} added successfully!`
  showSuccessModal.value = true
}

const processDividendDistribution = () => {
  const newDistribution = {
    id: Date.now(),
    date: dividendDistribution.value.date,
    type: dividendDistribution.value.type,
    totalAmount: parseFloat(dividendDistribution.value.amount),
    perToken: parseFloat(perTokenAmount.value),
    recipients: activeInvestorCount.value,
    status: 'processing'
  }
  
  dividendHistory.value.unshift(newDistribution)
  availableForDistribution.value -= newDistribution.totalAmount
  
  // Reset form
  dividendDistribution.value = { amount: '', date: '', type: 'regular' }
  
  successMessage.value = `Dividend distribution of $${newDistribution.totalAmount.toLocaleString()} processed successfully!`
  showSuccessModal.value = true
  
  // Simulate processing completion
  setTimeout(() => {
    newDistribution.status = 'completed'
  }, 3000)
}

const toggleExchangeConnection = (exchange) => {
  exchange.connected = !exchange.connected
  successMessage.value = `${exchange.name} ${exchange.connected ? 'connected' : 'disconnected'} successfully!`
  showSuccessModal.value = true
}

const createBackup = () => {
  lastBackup.value = new Date().toLocaleString()
  successMessage.value = 'Backup created successfully!'
  showSuccessModal.value = true
}

// Lifecycle
onMounted(() => {
  console.log('Admin panel loaded')
})
</script>

<style scoped>
/* Custom toggle switch styles */
.peer:checked + div {
  background-color: #2563eb;
}

.peer:checked + div:after {
  transform: translateX(100%);
}

/* Table hover effects */
tbody tr:hover {
  background-color: #f9fafb;
}

/* Transition effects */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Modal backdrop */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}
</style>