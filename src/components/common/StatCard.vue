<template>
  <div 
    class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
    :class="[borderColorClass, { 'cursor-pointer': clickable }]"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">
          {{ title }}
        </p>
        <p class="text-2xl font-bold text-gray-900 mb-2">
          {{ formattedValue }}
        </p>
        <div v-if="change !== undefined" class="flex items-center">
          <div 
            class="flex items-center text-sm font-medium"
            :class="changeColorClass"
          >
            <component 
              :is="changeIcon" 
              class="w-4 h-4 mr-1" 
              v-if="changeIcon"
            />
            {{ Math.abs(change) }}{{ changeUnit }}
          </div>
          <span v-if="changePeriod" class="text-xs text-gray-500 ml-2">
            {{ changePeriod }}
          </span>
        </div>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="icon" class="flex-shrink-0 ml-4">
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :class="iconBgClass"
        >
          <component :is="icon" class="w-6 h-6" :class="iconColorClass" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

interface Props {
  title: string
  value: string | number
  change?: number
  changeUnit?: string
  changePeriod?: string
  subtitle?: string
  icon?: Component
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  clickable?: boolean
  formatValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  changeUnit: '%',
  color: 'blue',
  clickable: false,
  formatValue: true
})

const emit = defineEmits<{
  click: []
}>()

const formattedValue = computed(() => {
  if (!props.formatValue) return props.value.toString()
  
  if (typeof props.value === 'number') {
    // Format large numbers
    if (props.value >= 1000000) {
      return `${(props.value / 1000000).toFixed(1)}M`
    } else if (props.value >= 1000) {
      return `${(props.value / 1000).toFixed(1)}K`
    }
    return props.value.toLocaleString()
  }
  
  return props.value.toString()
})

const changeIcon = computed(() => {
  if (props.change === undefined) return null
  return props.change >= 0 ? 'TrendingUpIcon' : 'TrendingDownIcon'
})

const changeColorClass = computed(() => {
  if (props.change === undefined) return 'text-gray-500'
  return props.change >= 0 ? 'text-success-600' : 'text-danger-600'
})

const borderColorClass = computed(() => {
  const colors = {
    blue: 'border-l-4 border-l-primary-500',
    green: 'border-l-4 border-l-success-500',
    purple: 'border-l-4 border-l-purple-500',
    orange: 'border-l-4 border-l-warning-500',
    red: 'border-l-4 border-l-danger-500',
    gray: 'border-l-4 border-l-gray-400'
  }
  return colors[props.color]
})

const iconBgClass = computed(() => {
  const colors = {
    blue: 'bg-primary-100',
    green: 'bg-success-100',
    purple: 'bg-purple-100',
    orange: 'bg-warning-100',
    red: 'bg-danger-100',
    gray: 'bg-gray-100'
  }
  return colors[props.color]
})

const iconColorClass = computed(() => {
  const colors = {
    blue: 'text-primary-600',
    green: 'text-success-600',
    purple: 'text-purple-600',
    orange: 'text-warning-600',
    red: 'text-danger-600',
    gray: 'text-gray-600'
  }
  return colors[props.color]
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>