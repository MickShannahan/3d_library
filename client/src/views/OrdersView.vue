<script setup>
import { AppState } from '@/AppState';
import OrderListItem from '@/components/OrderListItem.vue';
import OrderDetails from '@/components/OrderDetails.vue';
import OrderForm from '@/components/OrderForm.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import { ordersService } from '@/services/OrdersService';
import { Pop } from '@/utils/Pop';
import { computed, onMounted, ref, shallowRef } from 'vue';
import { Modal } from 'bootstrap';
import { logger } from '@/utils/Logger';
import { Order, STATUS_COLORS, STATUS_ICONS } from '@/models/Order';

const orders = computed(()=> {
  const filtered = AppState.orders.filter(order => {
    // Text search filter
    const searchable = [order.customerName, order.status, order.model?.name, order.model?.tags.join(''), order.model?.size, order.model?.author?.name].join(', ')
    const filterRx = new RegExp(filterText.value, 'ig')
    const passesText = filterRx.test(searchable)
    
    // Status filter
    const passesStatus = filterStatuses.value.length === 0 || filterStatuses.value.includes(order.status)
    
    return passesText && passesStatus
  })
  return filtered
})

const filterText = ref('')
const filterStatuses = ref(['pending', 'hold', 'printing', 'shipped', 'completed'])

const draggingOrder = shallowRef(null)
const overZone = ref(null)

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

function handleDragStart(order){
  draggingOrder.value = order
  logger.log('🫳⬆️', order.orderNumber, order.model.name)
  document.body.addEventListener('dragend', handleDragStop)
}

function handleDragStop(){
if(overZone.value !== null){
  orderDropped(draggingOrder.value, overZone.value)
}
draggingOrder.value = null
document.body.removeEventListener('dragend', handleDragStop)
}

function handleDragEnter(zoneNumber){
  overZone.value = zoneNumber
}

function handleDragExit(){
  setTimeout(()=> overZone.value = null, 10)
}

function handleDragover(event){
  event.dataTransfer.effectAllowed = 'move'
}

function orderDropped(draggedOrder, targetOrderNumber){
  if (draggedOrder.orderNumber === targetOrderNumber) return
  
  const currentPosition = draggedOrder.orderNumber
  
  if (currentPosition < targetOrderNumber) {
    AppState.orders.forEach(o => {
      if (o.orderNumber > currentPosition && o.orderNumber <= targetOrderNumber) {
        o.orderNumber--
      }
    })
  } else {
    AppState.orders.forEach(o => {
      if (o.orderNumber >= targetOrderNumber && o.orderNumber < currentPosition) {
        o.orderNumber++
      }
    })
  }
  
  draggedOrder.orderNumber = targetOrderNumber
  AppState.orders.sort((a, b) => a.orderNumber - b.orderNumber)
  ordersService.syncOrderNumbers(AppState.orders)
}

</script>


<template>
<div class="d-flex flex-grow-1 px-2">
  <div class="flex-grow-1 overflow-auto">
    <!-- filters and tools -->
    <div class="container my-4">
      <section class="row">
        <div class="col-6 ps-0">
          <div class="input-group">
            <input v-model="filterText" type="text" class="form-control" placeholder="search...">
            <label class="input-group-text"><i class="mdi mdi-magnify"></i></label>
          </div>
        </div>
        <div class="col-6 text-end">
          <button class="btn btn-normal-grad px-4" @click="openCreateOrderModal">Create Order <i class="mdi mdi-package-variant-plus"></i></button>
        </div>
        <div class="d-flex justify-content-between px-0 mt-4">
          <div>
            <button class="btn"><i class="bi bi-sort-numeric-down"></i></button>
            <button class="btn"><i class="bi bi-sort-numeric-up"></i></button>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <span><i class="mdi mdi-filter me-3"></i></span>
            <span v-for="status in Order.STATUS_OPTIONS" :key="status">
              <input v-model="filterStatuses" type="checkbox" :id="'filter-'+status" :value="status" class="btn-check">
              <label class="btn btn-sm btn-outline filter rounded-3" :class="`btn-${STATUS_COLORS[status]} ${filterStatuses.includes(status) ? 'active' : ''}`" :for="'filter-'+status">
                <i class="mdi" :class="`${STATUS_ICONS[status]}`"></i>
                {{ status }}
              </label>
            </span>
          </div>
        </div>
      </section>
    </div>

    <div class="container my-4">
      <section class="row">
        <TransitionGroup name="list">
          <template v-for="(order, i) in orders" :key="`order-list-${order.id}`" >

            <div  class="drop-zone" :class="{dragging: draggingOrder && draggingOrder != order && draggingOrder.orderNumber > order.orderNumber, active: overZone == order.orderNumber}"
              @dragenter="handleDragEnter(order.orderNumber)" 
              @dragleave="handleDragExit" 
              @drop="orderDropped(draggingOrder, overZone)"
              @dragover.prevent="handleDragover"
              ></div>

            <OrderListItem :order draggable="true" @dragstart="handleDragStart(order)"/>

            <div class="drop-zone" :class="{dragging: draggingOrder && draggingOrder != order && draggingOrder.orderNumber < order.orderNumber, active: overZone == order.orderNumber }"
              @dragenter="handleDragEnter(order.orderNumber)"
              @dragleave="handleDragExit"
              @drop="orderDropped(draggingOrder, overZone)"
              @dragover.prevent="handleDragover"
              ></div>

          </template>
        </TransitionGroup>
      </section>
    </div>
  </div>

  <!-- Side Details Panel -->
  <div class="side-window shadow text-bg-dark" :class="{ open: AppState.activeOrder }">
    <OrderDetails v-if="AppState.activeOrder" :order="AppState.activeOrder" />
  </div>
</div>

<!-- Create Order Modal -->
<ModalWrapper id="create-order" size="xl">
  <OrderForm />
</ModalWrapper>

<!-- Edit Order Modal -->
<ModalWrapper id="edit-order" size="xl">
  <OrderForm :order="AppState.activeOrder" modalId="edit-order" />
</ModalWrapper>

</template>


<style lang="scss" scoped>

.drop-zone{
  height: 0px;
  opacity: .5;
}

// .drop-zone+.drop-zone{
//   display: none;
// }

.drop-zone.dragging{
  height: 30px;
  opacity: 1;
  background-color: rgba(var(--bs-primary-rgb), .2);
  border: 1px dashed var(--bs-primary);
  border-radius: .8em;
  transition: all .2s ease;
  margin: 1em 0;
  cursor: pointer;
  &.active{
    background-color: rgba(var(--bs-primary-rgb), .5);
    cursor: copy;
  }
}

.filter.btn-sm{
  font-size: 12px;
  border: 1px solid transparent;
  background-color: rgba(var(--bs-dark-rgb),.8);
  color: rgba(var(--bs-light-rgb), .6);
  &.active{
    color: rgba(var(--bs-btn-focus-shadow-rgb), .9) !important;
    border: 1px solid rgba(var(--bs-btn-focus-shadow-rgb), .3) !important;
  }
}


.list-move{
  transition: all 0.4s ease;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

</style>