<script setup lang="ts">
import OrderFormContainer from './OrderForm/OrderFormContainer.vue'
import { Order } from '@/models/Order'

defineProps({
  order: { type: Order, default: null },
  modalId: { type: String, default: 'create-order' }
})
</script>

<template>
  <OrderFormContainer v-bind="$props" />
</template>
