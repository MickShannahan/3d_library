<script setup lang="ts">
import { computed } from 'vue'
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

// Build image grid data for the cover image area
const gridData = computed(() => {
  const models = props.order.modelsData
  const count = models.length

  if (count === 0) return { layout: 'none' as const, cells: [] }
  if (count === 1) return { layout: 'single' as const, cells: [models[0]?.coverImage ?? ''] }

  // For the grid: show up to 4 cells
  const images = models.slice(0, 4).map(m => m?.coverImage ?? '')
  const overflow = count > 4 ? count - 3 : 0 // "+N more" label for the 4th slot when >4

  if (count === 2) return { layout: 'grid-2' as const, cells: images, overflow: 0 }
  if (count === 3) return { layout: 'grid-3' as const, cells: images, overflow: 0 }
  return { layout: 'grid-4' as const, cells: images.slice(0, 4), overflow }
})

const modelNamesText = computed(() => {
  const names = props.order.modelsData.map(m => m?.name ?? 'Unknown')
  if (names.length <= 2) return names.join(', ')
  return `${names[0]}, ${names[1]} +${names.length - 2} more`
})
</script>

<template>
  <div class="order-card rounded-4 p-2 px-3 mb-3" @click="ordersService.setActiveOrder(order)">
    <div class="row g-3 align-items-center">
      
      <!-- LEFT: Order # + Model Preview -->
      <div class="col-4 col-md-auto order-0">
        <div class="d-flex align-items-center gap-2">
          <div class="order-badge">
            <div class="order-number">{{ order.orderNumber }}</div>
          </div>

          <!-- Split-view image grid -->
          <div class="model-img-grid" :class="`layout-${gridData.layout}`">

            <!-- Single image -->
            <template v-if="gridData.layout === 'single'">
              <img v-if="gridData.cells[0]" :src="gridData.cells[0]"
                class="cell-img" :alt="`Order ${order.orderNumber}`" />
              <div v-else class="cell-img bg-secondary"></div>
            </template>

            <!-- 2-model side by side -->
            <template v-else-if="gridData.layout === 'grid-2'">
              <div v-for="(img, i) in gridData.cells" :key="i" class="grid-cell">
                <img v-if="img" :src="img" class="cell-img" />
                <div v-else class="cell-img bg-secondary"></div>
              </div>
            </template>

            <!-- 3-model: top spans, 2 below -->
            <template v-else-if="gridData.layout === 'grid-3'">
              <div class="grid-cell cell-top-span">
                <img v-if="gridData.cells[0]" :src="gridData.cells[0]" class="cell-img" />
                <div v-else class="cell-img bg-secondary"></div>
              </div>
              <div v-for="i in [1, 2]" :key="i" class="grid-cell">
                <img v-if="gridData.cells[i]" :src="gridData.cells[i]" class="cell-img" />
                <div v-else class="cell-img bg-secondary"></div>
              </div>
            </template>

            <!-- 4+ models: 2×2 grid -->
            <template v-else-if="gridData.layout === 'grid-4'">
              <div v-for="(img, i) in gridData.cells" :key="i" class="grid-cell"
                :class="{ 'overflow-cell': i === 3 && gridData.overflow > 0 }">
                <img v-if="img" :src="img" class="cell-img" />
                <div v-else class="cell-img bg-secondary"></div>
                <div v-if="i === 3 && gridData.overflow > 0" class="overflow-label">
                  +{{ gridData.overflow }}
                </div>
              </div>
            </template>

            <!-- No models (fallback) -->
            <template v-else>
              <div class="cell-img bg-secondary"></div>
            </template>

          </div>
        </div>
      </div>

      <!-- CENTER-LEFT: Order Details -->
      <div class="col-4 col-lg-2 order-1">
        <div class="d-flex flex-column gap-1">
          <div>
            <h6 class="mb-1 text-truncate" :title="modelNamesText">{{ modelNamesText || 'Unknown Model' }}</h6>
              <small class="text-muted d-block"><i class="mdi mdi-calendar me-1"></i>{{ order.createdAtFormatted }}</small>
            <small class="text-muted">Scale: {{ order.modelScale }}%</small>
            <span v-if="order.modelSize" class="text-muted ms-2">
              <small>Size: {{ order.modelSize }}mm</small>
            </span>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-1">
            <span v-if="order.models.length > 1" class="badge bg-info text-dark">
              <i class="mdi mdi-cube-scan me-1"></i>{{ order.models.length }} models
            </span>
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
      <div class="col ps-4 text-end h-100 d-flex align-self-stretch justify-content-end order-2 ">
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

// ── Multi-model image grid ────────────────────────────────
.model-img-grid {
  width: 80px;
  height: 80px;
  border-radius: 0.375rem;
  overflow: hidden;
  flex-shrink: 0;

  // Single: just the image
  &.layout-single {
    .cell-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  }

  // 2 models: side by side
  &.layout-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(var(--bs-border-color-rgb), 0.5);
  }

  // 3 models: top spans full width, 2 bottom
  &.layout-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1px;
    background: rgba(var(--bs-border-color-rgb), 0.5);
    .cell-top-span { grid-column: 1 / span 2; }
  }

  // 4+ models: 2×2 grid
  &.layout-grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1px;
    background: rgba(var(--bs-border-color-rgb), 0.5);
  }
}

.grid-cell {
  position: relative;
  overflow: hidden;
  background: rgba(var(--bs-secondary-rgb), 0.3);

  .cell-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &.overflow-cell {
    .cell-img { filter: brightness(0.4); }
  }
}

.overflow-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  pointer-events: none;
}
</style>