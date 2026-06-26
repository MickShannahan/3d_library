<script setup lang="ts">
import { AppState } from '@/AppState'
import { ordersService } from '@/services/OrdersService'
import { CustomerContact, Order, type OrderNote } from '@/models/Order'
import { Pop } from '@/utils/Pop'
import { Modal } from 'bootstrap'
import { reactive, ref, computed, watch, provide, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Model } from '@/models/Model'
import OrderDetailsScreen from './OrderDetailsScreen.vue'
import ModelSelectionScreen from './ModelSelectionScreen.vue'
import OrderFormNav from './OrderFormNav.vue'

interface ModelEntry {
  modelId: string
  price: number
  scale: number
  size?: number
  partIds: string[]
  modelSearch: string
}

interface OrderFormData {
  customerName: string
  customerPrice: number
  customerPaid: boolean
  status: 'pending' | 'hold' | 'printing' | 'shipped' | 'completed' | 'archived'
  price: number
  paid: boolean
  customerAddress: string
  customerContacts: CustomerContact[]
  models: ModelEntry[]
  noteBody: string
  attachmentImg: any
}

const props = defineProps({
  order: { type: Order, default: null },
  modalId: { type: String, default: 'create-order' }
})

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!props.order)
const currentStep = ref(0)
const loading = ref(false)

const formData = reactive<OrderFormData>({
  customerName: '',
  customerPrice: 0,
  customerPaid: false,
  status: 'pending',
  price: 0,
  paid: false,
  customerAddress: '',
  customerContacts: [],
  models: [{ modelId: '', price: 0, scale: 100, size: undefined, partIds: [], modelSearch: '' }],
  noteBody: '',
  attachmentImg: null,
})

provide('orderFormData', formData)

// Step labels: "Order Details" + a label per model
const stepLabels = computed(() => {
  const labels = ['Order Details']
  formData.models.forEach((m, i) => {
    const model = AppState.models.find(mdl => mdl._id === m.modelId)
    labels.push(model?.name ?? `Model ${i + 1}`)
  })
  return labels
})

const orderTotal = computed(() =>
  formData.models.reduce((sum, m) => sum + (m.price ?? 0), 0)
)

const modelCount = computed(() => formData.models.length)

// Only allow adding a model when the current model screen has a model selected
const canAddModel = computed(() => {
  if (currentStep.value === 0) return true
  const idx = currentStep.value - 1
  return !!(formData.models[idx]?.modelId)
})

// Pre-populate when order prop changes (edit mode)
watch(() => props.order, (newOrder) => {
  if (!newOrder) return
  formData.customerName = newOrder.customerName
  formData.customerPrice = newOrder.customerPrice
  formData.customerPaid = newOrder.customerPaid
  formData.status = newOrder.status
  formData.price = newOrder.price
  formData.paid = newOrder.paid
  formData.customerAddress = newOrder.customerAddress
  formData.customerContacts = newOrder.customerContacts.map(c => new CustomerContact({ ...c }))
  formData.noteBody = ''
  formData.attachmentImg = null

  // Build model entries from the junction data
  if (newOrder.models?.length) {
    formData.models = newOrder.models.map((entry, idx) => {
      const populated = entry.modelId as Model
      const modelId = (populated as any)?._id ?? (entry.modelId as string) ?? ''
      const modelName = (populated as any)?.name ?? ''
      return {
        modelId,
        price: entry.price ?? 0,
        scale: entry.scale ?? 100,
        size: entry.size,
        partIds: idx === 0 ? [...newOrder.partIds] : [], // partIds are still order-level; assign to first model only
        modelSearch: modelName,
      }
    })
  } else {
    formData.models = [{ modelId: '', price: 0, scale: 100, size: undefined, partIds: [], modelSearch: '' }]
  }
  currentStep.value = 0
}, { immediate: true })

// If creating an order from a model page (route query)
onMounted(() => {
  if (route.query.createOrder) {
    const model = AppState.models.find(m => m._id === route.query.createOrder)
    if (model) {
      formData.models[0].modelId = model._id
      formData.models[0].modelSearch = model.name
      if (model.price) formData.models[0].price = model.price
      formData.models[0].scale = 100
      currentStep.value = 1
    }
    router.push({ query: {} })
  }
})

function addModel() {
  formData.models.push({ modelId: '', price: 0, scale: 100, size: undefined, partIds: [], modelSearch: '' })
  currentStep.value = formData.models.length // jump to the new model screen
}

function removeModel(index: number) {
  formData.models.splice(index, 1)
  // Adjust current step if needed
  if (currentStep.value > formData.models.length) {
    currentStep.value = formData.models.length
  }
}

function goToStep(step: number) {
  currentStep.value = step
}

async function submitForm() {
  if (!formData.customerName.trim()) {
    Pop.error('Please enter a customer name')
    goToStep(0)
    return
  }
  const firstModel = formData.models[0]
  if (!firstModel?.modelId) {
    Pop.error('Please select at least one model')
    goToStep(1)
    return
  }

  loading.value = true
  try {
    const notes: OrderNote[] = formData.noteBody.trim()
      ? [{ body: formData.noteBody.trim(), attachmentImg: formData.attachmentImg ?? undefined }]
      : []

    const payload = {
      customerName: formData.customerName,
      customerPrice: formData.customerPrice,
      customerPaid: formData.customerPaid,
      status: formData.status,
      price: orderTotal.value,
      paid: formData.paid,
      customerAddress: formData.customerAddress,
      customerContacts: formData.customerContacts,
      models: formData.models
        .filter(m => m.modelId)
        .map(m => ({ 
          modelId: m.modelId, 
          price: m.price,
          scale: m.scale ?? 100,
          size: m.size,
          partIds: m.partIds,
        })),
      notes,
    }

    if (isEditMode.value) {
      await ordersService.updateOrder(props.order._id, payload)
      Pop.toast(`Order #${props.order.orderNumber} updated!`)
    } else {
      await ordersService.createOrder(payload)
      Pop.toast(`Order for ${formData.customerName} created!`)
      resetForm()
    }
    Modal.getOrCreateInstance(`#${props.modalId}`)?.hide()
  } catch (error) {
    Pop.error(error, isEditMode.value ? 'Could not update order' : 'Could not create order')
  }
  loading.value = false
}

function resetForm() {
  formData.customerName = ''
  formData.customerPrice = 0
  formData.customerPaid = false
  formData.status = 'pending'
  formData.price = 0
  formData.paid = false
  formData.customerAddress = ''
  formData.customerContacts = []
  formData.models = [{ modelId: '', price: 0, scale: 100, size: undefined, partIds: [], modelSearch: '' }]
  formData.noteBody = ''
  formData.attachmentImg = null
  currentStep.value = 0
}
</script>

<template>
  <form @submit.prevent class="order-form-container d-flex flex-column">

    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3 px-3 pt-3">
      <h5 class="mb-0">
        <i class="mdi me-2" :class="isEditMode ? 'mdi-pencil' : 'mdi-package-variant-plus'"></i>
        {{ isEditMode ? `Edit Order #${order?.orderNumber}` : 'Create New Order' }}
      </h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
    </div>

    <!-- Scrollable screen area -->
    <div class="screen-body flex-grow-1 px-1 pb-2">
      <Transition name="screen-fade" mode="out-in">

        <!-- Step 0: Order Details -->
        <div v-if="currentStep === 0" key="order-details">
          <OrderDetailsScreen />
        </div>

        <!-- Steps 1+: Model screens -->
        <div v-else :key="`model-${currentStep}`">
          <ModelSelectionScreen
            :index="currentStep - 1"
            @remove="removeModel(currentStep - 1)"
          />
        </div>

      </Transition>
    </div>

    <!-- Bottom nav (fixed) -->
    <div class="px-3 pb-3">
      <OrderFormNav
        :step-labels="stepLabels"
        :current-step="currentStep"
        :order-total="orderTotal"
        :model-count="modelCount"
        :loading="loading"
        :is-edit-mode="isEditMode"
        :can-add-model="canAddModel"
        @go="goToStep"
        @add-model="addModel"
        @submit="submitForm"
      />
    </div>

  </form>
</template>

<style lang="scss" scoped>
.order-form-container {
  min-height: 0;
  // max-height: 85dvh;
}

.screen-body {
  min-height: 0;
  overflow: visible;
}

// Screen transition
.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.screen-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.screen-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
