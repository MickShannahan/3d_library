<script setup lang="ts">
import { AppState } from '@/AppState';
import PrintModel from '@/components/PrintModel.vue';
import { ordersService } from '@/services/OrdersService';
import { computed, onMounted, ref } from 'vue';

const orders = computed(()=> AppState.orders)
const selectedOrders = ref([])

onMounted(()=>{
  ordersService.getOrders()
})

function addToSelect(model){
  if(selectedOrders.value.includes(model)){
    selectedOrders.value = selectedOrders.value.filter(m => m != model)
  } else {
    selectedOrders.value = [...selectedOrders.value, model]
  }
}

</script>

<template>
<section class="container">
  <h2>Print Preview</h2>
  <section>
    <div>Select model to add it to print preview</div>
    <section class="d-flex flex-wrap gap-1" >
      <div v-for="order in orders" :key="order.id">
        <button class="btn btn-small" :class="selectedOrders.includes(order) ? 'btn-normal' : 'btn-outline-normal'" @click="addToSelect(order)"> 
          {{ order.customerName }}
        </button>
      </div>
    </section>
  </section>
  
  <h5 class="f-mono mt-5">preview</h5>
  <section class="bg-white p-2 rounded mt-3">
    
    <div class="d-flex gap-1" v-for="order in selectedOrders" :key="order.id">
      <div v-for="entry in order.models" :key="entry._id" class="w-25">
        <PrintModel :entry/>
      </div>
    </div>

  </section>
</section>
</template>