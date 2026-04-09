<script setup lang="ts">
import { Order, STATUS_COLORS, STATUS_ICONS, } from '@/models/Order'
import { ordersService } from '@/services/OrdersService'
import { Pop } from '@/utils/Pop'
import { Modal } from 'bootstrap'
import { computed, ref, watch } from 'vue'
import PartPopUp from './PartPopUp.vue'
import { PartGroup } from '@/models/PartGroup'

const props = defineProps({
  order: { type: Order }
})


const CONTACT_ICONS: Record<string, string> = {
  phone:   'mdi-phone-outline',
  email:   'mdi-email-outline',
  discord: 'mdi-discord',
  etsy:    'mdi-storefront-outline',
  twitter: 'mdi-twitter',
  bluesky: 'mdi-butterfly-outline',
}



const ungroupedOrderedMeshes = computed(() => {
  const model = props.order.model
  if (!model) return []
  const groupedIds = new Set(model.partGroups.flatMap(g => g.partIds))
  const partIdSet = new Set(props.order.partIds)
  return model.meshData.filter((m: any) => !groupedIds.has(m._id) && partIdSet.has(m._id))
})

const orderedGroups = computed(() => {
  const model = props.order.model
  if (!model) return []
  const partIdSet = new Set(props.order.partIds)
  return model.partGroups
    .map((group, gi) => ({
      group,
      color: PartGroup.GROUP_COLORS[gi % PartGroup.GROUP_COLORS.length],
      meshes: group.partIds
        .filter(id => partIdSet.has(id))
        .map(id => model.meshData.find((m: any) => m._id === id))
        .filter(Boolean)
    }))
    .filter(g => g.meshes.length > 0)
})


async function updateStatus(newStatus: string) {
  try {
    await ordersService.updateOrder(props.order._id, { status: newStatus as any })
  } catch (e) {
    Pop.error(e, 'Could Not Update Status')
  }
}

async function togglePaid(field: 'paid' | 'customerPaid') {
  try {
    await ordersService.updateOrder(props.order._id, { [field]: !props.order[field] })
  } catch (e) {
    Pop.error(e, 'Could Not Update')
  }
}


const newNoteBody = ref('')

watch(() => props.order._id, () => { newNoteBody.value = '' })

async function addNote() {
  if (!newNoteBody.value.trim()) return
  try {
    const updatedNotes = [...props.order.notes, { body: newNoteBody.value.trim() }]
    await ordersService.updateOrder(props.order._id, { notes: updatedNotes })
    newNoteBody.value = ''
    Pop.toast('Note Added')
  } catch (error) {
    Pop.error(error, 'Could Not Add Note')
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function clearActive() {
  ordersService.setActiveOrder(null)
}

function openEditModal() {
  Modal.getOrCreateInstance('#edit-order').show()
}

async function deleteOrder() {
  try {
    const confirmed = await Pop.confirm(
      'Are you sure?',
      'This will permanently delete this order and all its data.'
    )
    if (!confirmed) return
    const typed = await Pop.prompt(
      'text',
      `Delete Order #${props.order.orderNumber}?`,
      `Type DELETE to confirm`,
      { confirmText: 'Delete', placeholder: 'DELETE' }
    )
    if (typed !== 'DELETE') return
    await ordersService.deleteOrder(props.order._id)
    Pop.toast('Order Deleted')
    clearActive()
  } catch (error) {
    Pop.error(error, 'Could Not Delete Order')
  }
}
</script>


<template>
<div class="p-2 d-flex flex-column" style="min-height: 100%">

  <!-- Top bar: close + edit -->
  <section class="d-flex justify-content-between align-items-center mb-2">
    <button v-tooltip="'Close'" @click="clearActive">
      <i class="bi bi-x fs-4"></i>
    </button>
    <button class="btn btn-sm btn-normal-grad px-3" @click="openEditModal">
      Edit <i class="mdi mdi-pencil ms-1"></i>
    </button>
  </section>

  <!-- Header: image + order number + model/customer -->
  <section class="px-2 pb-2">
    <div class="d-flex gap-3 align-items-start">
      <img
        v-if="order.model?.coverImage"
        :src="order.model.coverImage"
        class="rounded-3 flex-shrink-0"
        style="width: 140px; height: 140px; object-fit: cover"
        :alt="`Cover of ${order.model?.name}`"
      />
      <div v-else class="bg-secondary rounded-3 flex-shrink-0" style="width: 140px; height: 120px"></div>

      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="order-badge-sm">{{ order.orderNumber }}</div>
          <h5 class="mb-0 text-truncate">{{ order.model?.name ?? 'Unknown Model' }}</h5>
        </div>
        <div class="fs-6 fw-semibold mb-2">{{ order.customerName }}</div>
        <div class="d-flex flex-wrap gap-3 text-muted">
          <small>Scale: {{ order.modelScale }}%</small>
          <small v-if="order.modelSize">Size: {{ order.modelSize }}mm</small>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-1">
          <div v-if="order.customerPrice > 0">
            <small class="text-muted d-block">Customer Price</small>
            <strong class="text-success">${{ order.customerPrice.toFixed(2) }}</strong>
          </div>
          <div v-if="order.price > 0">
            <small class="text-muted d-block">Print Cost</small>
            <strong>${{ order.price.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Paid toggle buttons -->
  <section class="px-2 pb-2">
    <hr class="mt-0 mb-2">
    <div class="d-flex gap-2">
      <button
        class="btn btn-outline btn-sm"
        :class="order.customerPaid ? 'btn-success' : 'btn-secondary'"
        @click="togglePaid('customerPaid')"
      >
        <i class="mdi me-1" :class="order.customerPaid ? 'mdi-check' : 'mdi-circle-outline'"></i>
        Customer Paid
      </button>
      <button
        class="btn btn-outline btn-sm"
        :class="order.paid ? 'btn-green' : 'btn-secondary'"
        @click="togglePaid('paid')"
      >
        <i class="mdi me-1" :class="order.paid ? 'mdi-check' : 'mdi-circle-outline'"></i>
        Printer Paid
      </button>
    </div>
  </section>

  <!-- Status selector -->
  <section class="px-2 pb-2">
    <div class="text-muted small text-uppercase fw-semibold mb-2">Status</div>
    <div class="d-flex flex-wrap gap-1">
      <button
        v-for="status in Order.STATUS_OPTIONS"
        :key="status"
        type="button"
        class="btn btn-outline btn-sm status-btn"
        :class="order.status === status
          ? `btn-${STATUS_COLORS[status]}`
          : 'btn-secondary'"
        @click="updateStatus(status)"
      >
        <i class="mdi me-1" :class="STATUS_ICONS[status]"></i>
        {{ status.charAt(0).toUpperCase() + status.slice(1) }}
      </button>
    </div>
  </section>

  <!-- Parts breakdown (chip-grid style) -->
  <section v-if="ungroupedOrderedMeshes.length || orderedGroups.length" class="px-2 pb-2 my-2">

    <div class="parts-area">

      <!-- Ungrouped parts -->
      <div v-if="ungroupedOrderedMeshes.length" class="mb-2">
        <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
          <i class="mdi mdi-cube-outline text-muted"></i>
          <span class="fw-semibold small text-uppercase">Parts</span>
          <span class="badge bg-primary px-3 ms-auto">{{ ungroupedOrderedMeshes.length }}</span>
        </div>
        <div class="part-chip-grid">
          <div v-for="mesh in ungroupedOrderedMeshes" :key="mesh._id" class="part-chip part-chip--included">
            <PartPopUp v-if="mesh.images?.[0]?.data" :mesh>
              <img :src="mesh.images[0].data" class="part-chip-img rounded" :alt="mesh.name" />
            </PartPopUp>
            <div v-else class="part-chip-img rounded bg-secondary"></div>
            <span class="part-chip-name">{{ mesh.name }}</span>
          </div>
        </div>
      </div>

      <!-- Part groups -->
      <div v-for="{ group, color, meshes } in orderedGroups" :key="group.name" class="mb-2">
        <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
          <i class="mdi mdi-layers-outline" :style="`color: var(${color})`"></i>
          <span class="fw-semibold small text-uppercase">{{ group.name }}</span>
          <span
            class="badge px-3 ms-auto"
            :style="`background: var(${color})`"
          >{{ meshes.length }}</span>
        </div>
        <div class="part-chip-grid">
          <div v-for="mesh in meshes" :key="mesh._id" class="part-chip part-chip--included">
            <PartPopUp v-if="mesh.images?.[0]?.data" :mesh>
              <img :src="mesh.images[0].data" class="part-chip-img rounded" :alt="mesh.name" />
            </PartPopUp>
            <div v-else class="part-chip-img rounded bg-secondary"></div>
            <span class="part-chip-name">{{ mesh.name }}</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Customer info -->
  <section class="px-2 pb-2">
    <hr class="mt-0 mb-2">
    <div class="fw-semibold mb-2">
      <i class="mdi mdi-account-outline me-1 text-muted"></i>Customer
    </div>
    <div v-if="order.customerAddress" class="mb-2">
      <small class="text-muted d-block">Shipping Address</small>
      <div class="small">{{ order.customerAddress }}</div>
    </div>
    <div v-if="order.customerContacts.length">
      <small class="text-muted d-block mb-1">Contacts</small>
      <div class="d-flex flex-column gap-1">
        <div
          v-for="(contact, i) in order.customerContacts"
          :key="i"
          class="d-flex align-items-center gap-2 small"
        >
          <i class="mdi text-muted" :class="CONTACT_ICONS[contact.type] ?? 'mdi-link'"></i>
          <span class="text-muted text-capitalize" style="min-width: 55px">{{ contact.type }}</span>
          <span class="text-truncate">{{ contact.value }}</span>
        </div>
      </div>
    </div>
    <div v-if="!order.customerAddress && !order.customerContacts.length" class="text-muted small">
      No contact information recorded.
    </div>
  </section>

  <!-- Notes -->
  <section class="px-2 pb-2">
    <hr class="mt-0 mb-2">
    <div class="fw-semibold mb-2">
      <i class="mdi mdi-message-text-outline me-1 text-muted"></i>Notes
    </div>
    <div v-if="order.notes.length" class="d-flex flex-column gap-2 mb-3">
      <div v-for="(note, i) in order.notes" :key="i" class="note-card p-2">
        <div class="small mb-1">{{ note.body }}</div>
        <small class="text-muted">{{ formatDate(note.createdAt) || 'No date' }}</small>
      </div>
    </div>
    <div v-else class="text-muted small mb-3">No notes yet.</div>

    <div class="d-flex flex-column gap-2">
      <textarea
        v-model="newNoteBody"
        class="form-control form-control-sm"
        rows="2"
        placeholder="Add a note..."
      ></textarea>
      <button
        @click="addNote"
        :disabled="!newNoteBody.trim()"
        class="btn btn-sm btn-normal align-self-end"
      >
        Add Note <i class="mdi mdi-send ms-1"></i>
      </button>
    </div>
  </section>

  <!-- Danger zone (pushed to bottom) -->
  <section class="my-4"></section>
  <section class="danger-zone rounded-4 p-2 mt-auto mx-2 mb-3">
    <div class="text-center small">Danger Zone</div>
    <div class="text-end">
      <button @click="deleteOrder" class="text-secondary btn selectable-danger">
        Delete Order <i class="mdi mdi-delete-forever"></i>
      </button>
    </div>
  </section>

</div>
</template>


<style lang="scss" scoped>
.order-badge-sm {
  width: 44px;
  height: 44px;
  background: rgba(var(--bs-black-rgb), .4);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  flex-shrink: 0;
}

.status-btn {
  font-size: 0.78rem;
  padding: .2em .6em;
}

.parts-area {
  background: rgba(var(--bs-black-rgb), .2);
  border-radius: 0.75rem;
  padding: 0.5rem;
}

.part-group-header {
  letter-spacing: 0.04em;
}

.part-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.25rem 0.25rem 0.5rem;
}

.part-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.4rem 0.2rem 0.3rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  background: rgba(var(--bs-light-rgb), .08);
  max-width: 180px;

  &--included {
    background: rgba(var(--bs-primary-rgb), .15);
    border-color: rgba(var(--bs-primary-rgb), .4);
  }
}

.part-chip-img {
  width: 22px;
  height: 22px;
  object-fit: cover;
  flex-shrink: 0;
}

.part-chip-name {
  font-size: 0.72rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.part-chip-badge {
  font-size: 0.6rem;
  color: var(--bs-success);
  flex-shrink: 0;
}


.note-card {
  border-left: 2px solid var(--bs-normal-shadow);
  background: rgba(var(--bs-black-rgb), 0.1);
}


.danger-zone {
  border: 1px solid rgba(var(--bs-danger-rgb), .5);
  color: rgba(var(--bs-danger-rgb), .5);
}
</style>
