<script setup lang="ts">
import { Order } from '@/models/Order'
import { ordersService } from '@/services/OrdersService'

const props = defineProps({
  order: { type: Order }
})

const STATUS_COLORS: Record<string, string> = {
  pending:   'warning',
  hold:      'info',
  printing:  'primary',
  shipped:   'success',
  completed: 'success',
  archived:  'secondary',
}

const STATUS_ICONS: Record<string, string> = {
  pending:   'mdi-clock-outline',
  hold:      'mdi-pause-circle-outline',
  printing:  'mdi-printer-outline',
  shipped:   'mdi-truck-outline',
  completed: 'mdi-check-circle-outline',
  archived:  'mdi-archive-outline',
}

const statusColor = STATUS_COLORS[props.order.status] || 'secondary'
const statusIcon = STATUS_ICONS[props.order.status] || 'mdi-help-circle'
</script>

<template>
  <div class="order-card rounded-4 p-2 px-3 mb-3" @click="ordersService.setActiveOrder(order)">
    <div class="row g-3 align-items-center">
      
      <!-- LEFT: Order # + Model Preview -->
      <div class="col-4 col-md-auto order-0">
        <div class="d-flex  align-items-center gap-2">
          <div class="order-badge">
            <div class="order-number">{{ order.orderNumber }}</div>
          </div>
          <img
            v-if="order.model?.coverImage"
            :src="order.model.coverImage"
            class="rounded-2"
            style="width: 80px; height: 80px; object-fit: cover"
            :alt="`Order ${order.orderNumber}`"
          />
          <div v-else class="bg-secondary rounded-2" style="width: 80px; height: 80px"></div>
        </div>
      </div>

      <!-- CENTER-LEFT: Order Details -->
      <div class="col-4 col-md-2 order-1">
        <div class="d-flex flex-column gap-1">
          <div>
            <h6 class="mb-1">{{ order.model?.name ?? 'Unknown Model' }}</h6>
              <small class="text-muted d-block"><i class="mdi mdi-calendar me-1"></i>{{ order.createdAtFormatted }}</small>
            <small class="text-muted">Scale: {{ order.modelScale }}%</small>
            <span v-if="order.modelSize" class="text-muted ms-2">
              <small>Size: {{ order.modelSize }}mm</small>
            </span>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-1">
            <span v-if="order.notes.length" class="badge bg-normal-z text-dark">
              <i class="mdi mdi-message-text-outline me-1"></i>{{ order.notes.length }} note{{ order.notes.length > 1 ? 's' : '' }}
            </span>
            <span v-if="order.partIds.length" class="badge bg-normal text-dark">
              <i class="mdi mdi-cube-outline me-1"></i>{{ order.partIds.length }} part{{ order.partIds.length > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- CENTER-RIGHT: Customer & Pricing -->
      <div class="col-lg-6 border-start border-end order-3 order-lg-2">
        <div class="d-flex gap-2">
          <div>
            <strong class="d-block">{{ order.customerName }}</strong>
            <small v-if="order.customerAddress" class="text-muted text-truncate d-block">
              {{ order.customerAddress }}
            </small>
            <span class="d-flex justify-content-between">
            <small v-if="order.customerPaid" class="text-success">customer paid <i class="mdi mdi-check"></i></small>
            <small v-else class="text-warning">needs payment <i class="mdi mdi-dots-horizontal"></i></small>
              <small class="fw-semibold">
                <i class="mdi mdi-currency-usd"></i>
                {{ order.customerPrice }}
              </small>
            </span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Status + Actions -->
      <div class="col ps-4 text-end h-100 d-flex align-self-stretch justify-content-end order-2 order-lg-3">
        <div class="d-flex flex-column align-items-end gap-2">
          <div class="status-badge" :class="`bg-${order.statusColor} border border-${order.statusColor} text-${order.statusColor}`" style="--bs-bg-opacity: .2">
            <i class="mdi" :class="order.statusIcon"></i>
            {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
          </div>
          <div>
            <small v-if="order.paid" class="badge bg-success text-success px-2" style="--bs-bg-opacity: .5"><i class="mdi mdi-check"></i> printer paid </small>
            <small v-else class="badge bg-secondary text-dark px-2" style="--bs-bg-opacity: .5">printer unpaid </small>
          </div>
          <div class="fw-semibold">
            <i class="mdi mdi-currency-usd"></i>
            {{ order.price }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-card {
  background: rgba(var(--bs-body-bg-rgb), 0.5);
  border: 1px solid rgba(var(--bs-black-rgb), 0.2) ;
  transition: all 0.2s ease;
  max-width: 1320px;

  &:hover {
    cursor: pointer;
    background: rgba(var(--bs-body-bg-rgb), 0.7);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    filter: brightness(1.1) saturate(1.1);
  }
}

.order-badge {
  width: 60px;
  height: 60px;
  background: rgba(var(--bs-black-rgb), .2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.status-badge{
  font-weight: 600;
  padding: .2em .75em;
  border-radius: .8em;
}
</style>