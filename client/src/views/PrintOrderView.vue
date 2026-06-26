<script setup lang="ts">
import { AppState } from '@/AppState'
import PrintModel from '@/components/PrintModel.vue'
import { ordersService } from '@/services/OrdersService'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(async () => {
  if (!AppState.orders.length) {
    await ordersService.getOrders()
  }
})

const order = computed(() => AppState.orders.find(o => o._id === route.params.id))
</script>

<template>
  <div class="p-3">
    <div v-if="order" class="d-flex flex-column gap-2">
      <div class="d-flex gap-1 flex-wrap">
        <div v-for="entry in order.models" :key="entry._id" class="w-25">
          <PrintModel :entry />
        </div>
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<style>
@media print {
  body * { visibility: hidden; }
  #app, #app * { visibility: visible; }
  #app { position: absolute; top: 0; left: 0; }
}
</style>
