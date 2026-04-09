<script setup lang="ts">
import { AppState } from '@/AppState'
import { ordersService } from '@/services/OrdersService'
import { type CustomerContact, type OrderNote } from '@/models/Order'
import { Pop } from '@/utils/Pop'
import { Modal } from 'bootstrap'
import { reactive, ref, computed } from 'vue'

const CONTACT_TYPES = ['phone', 'email', 'discord', 'etsy', 'twitter', 'bluesky'] as const
const STATUS_OPTIONS = ['pending', 'hold', 'printing', 'shipped', 'completed', 'archived'] as const

const CONTACT_ICONS: Record<string, string> = {
  phone:   'mdi-phone',
  email:   'mdi-email-outline',
  discord: 'mdi-discord',
  etsy:    'mdi-shopping-outline',
  twitter: 'mdi-twitter',
  bluesky: 'mdi-cloud-outline',
}

const STATUS_ICONS: Record<string, string> = {
  pending:   'mdi-clock-outline',
  hold:      'mdi-pause-circle-outline',
  printing:  'mdi-printer-outline',
  shipped:   'mdi-truck-outline',
  completed: 'mdi-check-circle-outline',
  archived:  'mdi-archive-outline',
}

const MM_PER_INCH = 25.4

const formData = reactive({
  customerName: '',
  customerPrice: 0,
  customerPaid: false,
  status: 'pending' as typeof STATUS_OPTIONS[number],
  price: 0,
  paid: false,
  modelScale: 100,
  modelSize: 0,
  customerAddress: '',
  customerContacts: [] as CustomerContact[],
  modelId: '',
  partIds: [] as string[],
  notes: [] as OrderNote[]
})

const loading = ref(false)
const sizeUnit = ref<'mm' | 'in'>('mm')
const noteBody = ref('')
const checkedParts = ref<Set<string>>(new Set())
const openDropdowns = ref<Set<string>>(new Set())

// Model search – same pattern as author search in ModelCreationForm
const modelSearch = ref('')
const modelSearchOpen = ref(false)

const filteredModels = computed(() => {
  const q = modelSearch.value.trim().toLowerCase()
  if (!q) return AppState.models
  return AppState.models.filter(m => m.name?.toLowerCase().includes(q))
})

const selectedModel = computed(() =>
  AppState.models.find(m => m._id === formData.modelId) ?? null
)

const ungroupedParts = computed(() => {
  if (!selectedModel.value) return []
  const groupedIds = new Set(selectedModel.value.partGroups.flatMap(g => g.partIds))
  return selectedModel.value.meshes.filter(m => !groupedIds.has(m._id))
})

const sizeDisplay = computed({
  get: () => {
    const mm = formData.modelSize ?? 0
    return sizeUnit.value === 'in' ? parseFloat((mm / MM_PER_INCH).toFixed(3)) : mm
  },
  set: (v: number) => {
    formData.modelSize = sizeUnit.value === 'in' ? parseFloat((v * MM_PER_INCH).toFixed(2)) : v
  }
})

function getMeshById(id: string) {
  return selectedModel.value?.meshes.find(m => m._id === id || m.uuid === id)
}

function addContact() {
  formData.customerContacts.push({ type: 'email', value: '' })
}

function removeContact(index: number) {
  formData.customerContacts.splice(index, 1)
}

function initializeParts(model: typeof AppState.models[number]) {
  checkedParts.value.clear()
  const groupedIds = new Set(model.partGroups.flatMap(g => g.partIds))
  // All ungrouped parts start selected
  model.meshes.forEach(m => {
    if (!groupedIds.has(m._id)) checkedParts.value.add(m._id)
  })
  // In each group, only the defaultPartId starts selected
  model.partGroups.forEach(g => {
    if (g.defaultPartId) checkedParts.value.add(g.defaultPartId)
  })
  formData.partIds = Array.from(checkedParts.value)
}

function onSelectModel(model: typeof AppState.models[number]) {
  formData.modelId = model._id
  modelSearch.value = model.name
  modelSearchOpen.value = false
  // Auto-fill from model data
  if (model.price)         formData.price = model.price
  if (model.size)          formData.modelSize = model.size
  if (model.adjustedScale) formData.modelScale = Math.round(model.adjustedScale * 100)
  initializeParts(model)
}

function clearModel() {
  formData.modelId = ''
  modelSearch.value = ''
  checkedParts.value.clear()
  formData.partIds = []
}

function togglePartCheck(partId: string) {
  if (checkedParts.value.has(partId)) {
    checkedParts.value.delete(partId)
  } else {
    checkedParts.value.add(partId)
  }
  formData.partIds = Array.from(checkedParts.value)
}

function toggleDropdown(id: string) {
  if (openDropdowns.value.has(id)) {
    openDropdowns.value.delete(id)
  } else {
    openDropdowns.value.add(id)
  }
}

function closeDropdown(id: string) {
  openDropdowns.value.delete(id)
}

async function submitForm() {
  if (!formData.customerName) {
    Pop.error('Please enter a customer name')
    return
  }
  loading.value = true
  try {
    formData.notes = noteBody.value.trim() ? [{ body: noteBody.value.trim() }] : []
    await ordersService.createOrder(formData)
    Pop.toast(`Order for ${formData.customerName} created!`)
    Modal.getOrCreateInstance('#create-order')?.hide()
    resetForm()
  } catch (error) {
    Pop.error(error, 'Could not create order')
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
  formData.modelScale = 100
  formData.modelSize = 0
  formData.customerAddress = ''
  formData.customerContacts = []
  formData.modelId = ''
  formData.partIds = []
  formData.notes = []
  checkedParts.value.clear()
  noteBody.value = ''
  modelSearch.value = ''
}
</script>

<template>
  <form class="container-fluid p-3" @submit.prevent="submitForm"
    @keydown.enter="(e) => { if (!(e.target instanceof HTMLTextAreaElement)) e.preventDefault() }">

    <!-- Header -->
    <div class="row mb-3 align-items-center">
      <div class="col">
        <h5 class="mb-0"><i class="mdi mdi-package-variant-plus me-2"></i>Create New Order</h5>
      </div>
      <div class="col-auto">
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
    </div>

    <!-- Main 2-column layout -->
    <div class="row g-4">

      <!-- LEFT: Customer Info -->
      <div class="col-md-5 d-flex flex-column gap-3">

        <!-- Name + Address -->
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Customer Name <span class="text-danger">*</span></label>
            <input v-model="formData.customerName" type="text" class="form-control"
              placeholder="Enter customer name" required />
          </div>
          <div class="col-12">
            <label class="form-label">Shipping Address</label>
            <textarea v-model="formData.customerAddress" class="form-control" rows="3"
              placeholder="Street, City, State, Zip"></textarea>
          </div>
        </div>

        <!-- Contacts -->
        <div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Contacts</label>
            <button type="button" class="btn btn-sm btn-outline-light" @click="addContact">
              <i class="mdi mdi-plus"></i> Add
            </button>
          </div>
          <div v-for="(contact, index) in formData.customerContacts" :key="`contact-${index}`"
            class="row g-2 mb-2 align-items-center">
            <!-- Contact type dropdown with icon -->
            <div class="col-auto">
              <div class="dropdown">
                <button type="button"
                  class="btn btn-outline-secondary contact-type-btn"
                  :class="{ show: openDropdowns.has(`contact-${index}`) }"
                  @click="toggleDropdown(`contact-${index}`)">
                  <i class="mdi" :class="CONTACT_ICONS[contact.type]"></i>
                </button>
                <ul class="dropdown-menu" :class="{ show: openDropdowns.has(`contact-${index}`) }">
                  <li v-for="type in CONTACT_TYPES" :key="type">
                    <a href="#" class="dropdown-item d-flex align-items-center gap-2"
                      @click.prevent="contact.type = type; closeDropdown(`contact-${index}`)">
                      <i class="mdi" :class="CONTACT_ICONS[type]"></i>
                      {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col">
              <input v-model="contact.value" type="text" class="form-control form-control-sm"
                :placeholder="`${contact.type.charAt(0).toUpperCase() + contact.type.slice(1)} handle`" />
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeContact(index)">
                <i class="mdi mdi-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Note (single, for initial creation) -->
        <div>
          <label class="form-label">Order Note <span class="text-muted fw-normal small">(optional)</span></label>
          <textarea v-model="noteBody" class="form-control" rows="3"
            placeholder="Any notes for this order..."></textarea>
        </div>

      </div>

      <!-- RIGHT: Model + Parts -->
      <div class="col-md-7 d-flex flex-column gap-3">

        <!-- Model Search -->
        <div>
          <label class="form-label">Select Model</label>
          <div class="model-search-wrap">
            <div class="input-group">
              <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
              <input
                v-model="modelSearch"
                type="text"
                class="form-control"
                placeholder="Search models..."
                autocomplete="off"
                @focus="modelSearchOpen = true"
                @blur="modelSearchOpen = false"
              />
              <button v-if="selectedModel" type="button" class="btn btn-outline-secondary"
                @click="clearModel" title="Clear selection">
                <i class="mdi mdi-close"></i>
              </button>
            </div>
            <ul v-show="modelSearchOpen && filteredModels.length" class="model-dropdown">
              <li v-for="model in filteredModels" :key="model._id"
                class="model-option"
                @mousedown.prevent="onSelectModel(model)">
                <img v-if="model.coverImage" :src="model.coverImage" class="model-thumb rounded" />
                <div v-else class="model-thumb bg-secondary rounded"></div>
                <div class="d-flex flex-column">
                  <span class="fw-semibold">{{ model.name }}</span>
                  <small class="text-muted">{{ model.author?.name }}</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Model Card Preview (after selection) -->
        <div v-if="selectedModel" class="model-preview rounded-3 p-2">
          <div class="row g-2 align-items-center">
            <div class="col-auto">
              <div class="img-wrapper rounded-3">
                <img v-if="selectedModel.coverImage" :src="selectedModel.coverImage"
                  class="img-cover rounded-3" alt="cover" />
                <img v-if="selectedModel.turnAroundImage" :src="selectedModel.turnAroundImage"
                  class="img-turnaround rounded-3" alt="turnaround" />
              </div>
            </div>
            <div class="col">
              <p class="mb-0 fw-semibold">{{ selectedModel.name }}</p>
              <div v-if="selectedModel.author" class="d-flex align-items-center gap-1 mt-1">
                <img :src="selectedModel.author.image" class="rounded" style="width:20px;height:20px;object-fit:cover;" />
                <small class="text-muted">{{ selectedModel.author.name }}</small>
              </div>
              <div class="d-flex gap-3 mt-1">
                <small class="text-muted" v-if="selectedModel.price">
                  <i class="mdi mdi-currency-usd"></i>{{ selectedModel.price.toFixed(2) }}
                </small>
                <small class="text-muted" v-if="selectedModel.size">
                  <i class="mdi mdi-ruler"></i>{{ selectedModel.size }}mm
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Parts Selector by Group -->
        <div v-if="selectedModel">
          <label class="form-label">Parts to Include</label>
          <div class="parts-scroll">

            <!-- Ungrouped Parts (all start selected) -->
            <div v-if="ungroupedParts.length" class="part-group mb-2">
              <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
                <i class="mdi mdi-cube-outline text-secondary"></i>
                <span class="fw-semibold small text-uppercase">Parts</span>
                <span class="badge bg-secondary ms-auto">{{ ungroupedParts.filter(p => checkedParts.has(p._id)).length }}/{{ ungroupedParts.length }}</span>
              </div>
              <div class="part-chip-grid">
                <div v-for="part in ungroupedParts" :key="part._id"
                  class="part-chip" :class="{ 'part-chip--checked': checkedParts.has(part._id) }"
                  @click="togglePartCheck(part._id)">
                  <input
                    :id="`part-${part._id}`"
                    type="checkbox"
                    class="form-check-input flex-shrink-0"
                    :checked="checkedParts.has(part._id)"
                    @change="togglePartCheck(part._id)"
                    @click.stop
                  />
                  <img
                    v-if="part.images?.[0]?.data"
                    :src="part.images[0].data"
                    class="part-chip-img rounded"
                    alt="part"
                  />
                  <div v-else class="part-chip-img rounded bg-secondary"></div>
                  <span class="part-chip-name">{{ part.name }}</span>
                </div>
              </div>
            </div>

            <!-- Part Groups (only default starts selected) -->
            <div v-for="group in selectedModel.partGroups" :key="group.name" class="part-group mb-2">
              <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
                <i class="mdi mdi-layers-outline text-primary"></i>
                <span class="fw-semibold small text-uppercase">{{ group.name }}</span>
                <span class="badge bg-primary-subtle text-primary ms-auto">choose one</span>
              </div>
              <div class="part-chip-grid">
                <div v-for="partId in group.partIds" :key="partId"
                  class="part-chip" :class="{ 'part-chip--checked': checkedParts.has(partId) }"
                  @click="togglePartCheck(partId)">
                  <input
                    :id="`part-${partId}`"
                    type="checkbox"
                    class="form-check-input flex-shrink-0"
                    :checked="checkedParts.has(partId)"
                    @change="togglePartCheck(partId)"
                    @click.stop
                  />
                  <img
                    v-if="getMeshById(partId)?.images?.[0]?.data"
                    :src="getMeshById(partId).images[0].data"
                    class="part-chip-img rounded"
                    alt="part"
                  />
                  <div v-else class="part-chip-img rounded bg-secondary"></div>
                  <span class="part-chip-name">{{ getMeshById(partId)?.name ?? partId }}</span>
                  <span v-if="group.defaultPartId === partId" class="part-chip-badge">★</span>
                </div>
              </div>
            </div>

            <p v-if="!selectedModel.partGroups.length && !ungroupedParts.length" class="text-muted small fst-italic">
              No parts found for this model
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- Separator -->
    <hr class="my-4" />

    <!-- Bottom: Scale, Size, Pricing, Status -->
    <div class="row g-3 align-items-end mb-3">
      <div class="col-md-2">
        <label class="form-label">Scale (%)</label>
        <input v-model.number="formData.modelScale" type="number" class="form-control" placeholder="100" min="0" />
      </div>
      <div class="col-md-3">
        <label class="form-label d-flex align-items-center justify-content-between">
          Size
          <div class="btn-group btn-group-sm ms-2" role="group">
            <button type="button" class="btn btn-sm"
              :class="sizeUnit === 'mm' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="sizeUnit = 'mm'">mm</button>
            <button type="button" class="btn btn-sm"
              :class="sizeUnit === 'in' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="sizeUnit = 'in'">in</button>
          </div>
        </label>
        <input v-model.number="sizeDisplay" type="number" class="form-control" placeholder="0" min="0"
          :step="sizeUnit === 'in' ? '0.001' : '0.1'" />
      </div>
      <div class="col-md-2">
        <label class="form-label">Customer Price</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input v-model.number="formData.customerPrice" type="number" class="form-control"
            placeholder="0.00" step="0.01" min="0" />
        </div>
      </div>
      <div class="col-md-2">
        <label class="form-label">Internal Price</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input v-model.number="formData.price" type="number" class="form-control"
            placeholder="0.00" step="0.01" min="0" />
        </div>
      </div>
      <div class="col-md-3">
        <label class="form-label">Status</label>
        <div class="dropdown w-100">
          <button type="button"
            class="btn btn-outline-light w-100 text-start d-flex align-items-center gap-2"
            :class="{ show: openDropdowns.has('status') }"
            @click="toggleDropdown('status')">
            <i class="mdi" :class="STATUS_ICONS[formData.status]"></i>
            {{ formData.status.charAt(0).toUpperCase() + formData.status.slice(1) }}
            <i class="mdi mdi-chevron-down ms-auto"></i>
          </button>
          <ul class="dropdown-menu w-100" :class="{ show: openDropdowns.has('status') }">
            <li v-for="status in STATUS_OPTIONS" :key="status">
              <a href="#" class="dropdown-item d-flex align-items-center gap-2"
                :class="{ active: formData.status === status }"
                @click.prevent="formData.status = status; closeDropdown('status')">
                <i class="mdi" :class="STATUS_ICONS[status]"></i>
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer: Payment toggles + Actions -->
    <div class="d-flex align-items-center gap-4">
      <div class="form-check form-switch">
        <input id="customerPaid" v-model="formData.customerPaid" type="checkbox" class="form-check-input" role="switch" />
        <label for="customerPaid" class="form-check-label">Customer Paid</label>
      </div>
      <div class="form-check form-switch">
        <input id="paid" v-model="formData.paid" type="checkbox" class="form-check-input" role="switch" />
        <label for="paid" class="form-check-label">Paid Out</label>
      </div>
      <div class="ms-auto d-flex gap-2">
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-normal-grad px-4" :disabled="loading">
          <span v-if="!loading">Create Order <i class="mdi mdi-check"></i></span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>Creating...
          </span>
        </button>
      </div>
    </div>

  </form>
</template>

<style lang="scss" scoped>
// ── Model search ─────────────────────────────────────────
.model-search-wrap {
  position: relative;
}

.model-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 260px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.375rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.model-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
}

.model-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  flex-shrink: 0;
}

// ── Model preview card ────────────────────────────────────
.model-preview {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.img-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  overflow: hidden;

  .img-cover,
  .img-turnaround {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .img-turnaround {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .img-turnaround {
    opacity: 1;
  }
}

// ── Parts selector ────────────────────────────────────────
.parts-scroll {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.375rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
}

.part-group-header {
  background: rgba(255, 255, 255, 0.05);
  letter-spacing: 0.04em;
}

// Chip grid — wrapping row of compact part chips
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  max-width: 180px;

  &:hover {
    background: rgba(255, 255, 255, 0.09);
  }

  &--checked {
    background: rgba(13, 110, 253, 0.15);
    border-color: rgba(13, 110, 253, 0.4);
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
  max-width: 110px;
}

.part-chip-badge {
  font-size: 0.6rem;
  color: rgba(13, 110, 253, 0.9);
  flex-shrink: 0;
}

// ── Contact type button ───────────────────────────────────
.contact-type-btn {
  width: 40px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 1.1rem;
}

// ── Notes ─────────────────────────────────────────────────
.note-chip {
  background: rgba(13, 110, 253, 0.1);
  border: 1px solid rgba(13, 110, 253, 0.25);
  font-size: 0.875rem;
}

// ── Shared dropdown styling ───────────────────────────────
.dropdown-menu {
  background-color: #1e1e2e;
  border-color: rgba(255, 255, 255, 0.12);

  .dropdown-item {
    color: #fff;

    &:hover,
    &:focus {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    &.active {
      background-color: rgba(13, 110, 253, 0.3);
      color: #fff;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
