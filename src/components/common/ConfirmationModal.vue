<template>
  <Modal
    v-model="showModal"
    :title="modalData.title"
    size="sm"
    show-default-buttons
    :confirm-text="modalData.confirmText"
    :cancel-text="modalData.cancelText"
    :loading="isProcessing"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <!-- Icon -->
    <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full" :class="iconBgClass">
      <component :is="iconComponent" class="w-6 h-6" :class="iconColorClass" />
    </div>

    <!-- Message -->
    <div class="text-center">
      <p class="text-gray-900 mb-2">{{ modalData.message }}</p>
      <p v-if="modalData.description" class="text-sm text-gray-500">
        {{ modalData.description }}
      </p>
    </div>

    <!-- Additional Content -->
    <div v-if="modalData.details" class="mt-4 p-4 bg-gray-50 rounded-lg">
      <div v-for="(value, key) in modalData.details" :key="key" class="flex justify-between text-sm">
        <span class="text-gray-600">{{ key }}:</span>
        <span class="font-medium">{{ value }}</span>
      </div>
    </div>

    <!-- Warning for destructive actions -->
    <div v-if="modalData.type === 'danger'" class="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-danger-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div class="text-sm text-danger-700">
          <strong>Warning:</strong> This action cannot be undone.
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue'

interface ConfirmationData {
  title: string
  message: string
  description?: string
  type?: 'info' | 'success' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  details?: Record<string, string>
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const showModal = ref(false)
const isProcessing = ref(false)
const modalData = ref<ConfirmationData>({
  title: '',
  message: '',
  type: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel'
})

const iconComponent = computed(() => {
  const icons = {
    info: 'InformationCircleIcon',
    success: 'CheckCircleIcon', 
    warning: 'ExclamationTriangleIcon',
    danger: 'ExclamationTriangleIcon'
  }
  return icons[modalData.value.type || 'info']
})

const iconBgClass = computed(() => {
  const classes = {
    info: 'bg-primary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    danger: 'bg-danger-100'
  }
  return classes[modalData.value.type || 'info']
})

const iconColorClass = computed(() => {
  const classes = {
    info: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600'
  }
  return classes[modalData.value.type || 'info']
})

const showConfirmation = (data: ConfirmationData): Promise<boolean> => {
  return new Promise((resolve) => {
    modalData.value = {
      ...data,
      onConfirm: async () => {
        if (data.onConfirm) {
          try {
            isProcessing.value = true
            await data.onConfirm()
            resolve(true)
          } catch (error) {
            console.error('Confirmation action failed:', error)
            resolve(false)
          } finally {
            isProcessing.value = false
            showModal.value = false
          }
        } else {
          resolve(true)
          showModal.value = false
        }
      },
      onCancel: () => {
        if (data.onCancel) {
          data.onCancel()
        }
        resolve(false)
        showModal.value = false
      }
    }
    showModal.value = true
  })
}

const handleConfirm = async () => {
  if (modalData.value.onConfirm) {
    await modalData.value.onConfirm()
  }
}

const handleCancel = () => {
  if (modalData.value.onCancel) {
    modalData.value.onCancel()
  }
}

// Expose the function for use by other components
defineExpose({
  showConfirmation
})
</script>