<script setup>
import { AppState } from '@/AppState';
import OrderListItem from '@/components/OrderListItem.vue';
import OrderForm from '@/components/OrderForm.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import { ordersService } from '@/services/OrdersService';
import { Pop } from '@/utils/Pop';
import { computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';

const orders = computed(()=> AppState.orders)

async function getOrders(){
  try {
    await ordersService.getOrders()
  } catch (error) {
    Pop.error(error, 'Could Not Get Orders')
  }
}

onMounted(()=>{getOrders()})

function openCreateOrderModal() {
  const modal = Modal.getOrCreateInstance('#create-order')
  modal.show()
}

</script>


<template>
  <!-- filters and tools -->
<div class="container my-4">
  <section class="row">
    <div class="col-6">

    </div>
    <div class="col-6 text-end">
      <button class="btn btn-normal-grad px-4" @click="openCreateOrderModal">Create Order <i class="mdi mdi-package-variant-plus"></i></button>
    </div>
  </section>
</div>

<div class="container my-4">
  <section class="row">
    <article v-for="order in orders" :key="`order-list-${order.id}`">
      <OrderListItem :order/>
    </article>
  </section>
</div>

<!-- Create Order Modal -->
<ModalWrapper id="create-order" size="xl">
  <OrderForm />
</ModalWrapper>

</template>


<style lang="scss" scoped>

</style>