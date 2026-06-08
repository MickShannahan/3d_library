<script setup lang="ts">
import { AppState } from '@/AppState'
import { ordersService } from '@/services/OrdersService'
import { CustomerContact, Order, type OrderNote } from '@/models/Order'
import { Pop } from '@/utils/Pop'
import { Modal } from 'bootstrap'
import { reactive, ref, computed, watch, onMounted } from 'vue'
import PartPopUp from './PartPopUp.vue'
import { useRoute, useRouter } from 'vue-router'
import { Model } from '@/models/Model'
import { logger } from '@/utils/Logger.js'

const route = useRoute()
const router = useRouter()

onMounted(()=>{
  if(route.query.createOrder) {
    onSelectModel(AppState.models.find(m => m._id == route.query.createOrder) as Model)
    router.push({query: {}})
  }
})

const props = defineProps({
  order: { type: Order, default: null },
  modalId: { type: String, default: 'create-order' }
})

const isEditMode = computed(() => !!props.order)

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
  notes: [] as OrderNote[],
  attachmentImg: null,
})

const loading = ref(false)
const sizeUnit = ref<'mm' | 'in'>('in')
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
  return selectedModel.value.meshData.filter(m => !groupedIds.has(m._id))
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
  return selectedModel.value?.meshData.find(m => m._id === id)
}

function addContact() {
  formData.customerContacts.push(new CustomerContact({ type: 'email', value: '' }))
}

function removeContact(index: number) {
  formData.customerContacts.splice(index, 1)
}

function initializeParts(model: typeof AppState.models[number]) {
  checkedParts.value.clear()
  const groupedIds = new Set(model.partGroups.flatMap(g => g.partIds))
  // All ungrouped parts start selected
  model.meshData.forEach(m => {
    if (!groupedIds.has(m._id)) checkedParts.value.add(m._id)
  })
  // In each group, only the defaultPartId starts selected
  model.partGroups.forEach(g => {
    if (g.defaultPartId) checkedParts.value.add(g.defaultPartId)
  })
  formData.partIds = Array.from(checkedParts.value)
}

function onSelectModel(model: Model) {
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
  if (!formData.customerName.trim()) {
    Pop.error('Please enter a customer name')
    return
  }
  loading.value = true
  try {
    if (isEditMode.value) {
      await ordersService.updateOrder(props.order._id, formData)
      Pop.toast(`Order #${props.order.orderNumber} updated!`)
    } else {
      formData.notes = noteBody.value.trim() ? [{ body: noteBody.value.trim() }] : []
      if(formData.attachmentImg) {
        formData.notes[0].attachmentImg = formData.attachmentImg
      }
      await ordersService.createOrder(formData)
      Pop.toast(`Order for ${formData.customerName} created!`)
      resetForm()
    }
    Modal.getOrCreateInstance(`#${props.modalId}`)?.hide()
  } catch (error) {
    Pop.error(error, isEditMode.value ? 'Could not update order' : 'Could not create order')
  }
  loading.value = false
}

function addFileAttachment(){
  const file = event.target.files[0]
  if(!file) return
  logger.log(file)
  const previewURL = URL.createObjectURL(file) 
  formData.attachmentImg = {name: file.name, url: previewURL, file: file}
  event.target.value = ''
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

watch(() => props.order, (newOrder) => {
  if (!newOrder) return
  formData.customerName     = newOrder.customerName
  formData.customerPrice    = newOrder.customerPrice
  formData.customerPaid     = newOrder.customerPaid
  formData.status           = newOrder.status
  formData.price            = newOrder.price
  formData.paid             = newOrder.paid
  formData.modelScale       = newOrder.modelScale
  formData.modelSize        = newOrder.modelSize
  formData.customerAddress  = newOrder.customerAddress
  formData.customerContacts = newOrder.customerContacts.map(c => (new CustomerContact({ ...c })))
  formData.modelId          = newOrder.modelId
  formData.partIds          = [...newOrder.partIds]
  formData.notes            = newOrder.notes.map(n => ({ ...n }))
  modelSearch.value         = newOrder.model?.name ?? ''
  checkedParts.value        = new Set(newOrder.partIds)
}, { immediate: true })
</script>

<template>
  <form class="container-fluid p-3" @submit.prevent>

    <!-- Header -->
    <div class="row mb-3 align-items-center">
      <div class="col">
        <h5 class="mb-0">
        <i class="mdi me-2" :class="isEditMode ? 'mdi-pencil' : 'mdi-package-variant-plus'"></i>
        {{ isEditMode ? `Edit Order #${order?.orderNumber}` : 'Create New Order' }}
      </h5>
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
            <label class="form-label"><i class="mdi mdi-card-account-details"></i> Customer Name <span class="text-danger">*</span></label>
            <input v-model="formData.customerName" type="text" class="form-control"
              placeholder="Enter customer name" required />
          </div>
          <div class="col-12">
            <label class="form-label"> <i class="mdi mdi-map-marker"></i> Shipping Address</label>
            <textarea v-model="formData.customerAddress" class="form-control" rows="3"
              placeholder="Street, City, State, Zip"></textarea>
          </div>
        </div>

        <!-- Contacts -->
        <div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0"><i class="mdi mdi-comment-account"></i> Contacts</label>
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
                  class="btn border"
                  :class="{ show: openDropdowns.has(`contact-${index}`) }"
                  @click="toggleDropdown(`contact-${index}`)">
                  <i class="mdi" :class="CONTACT_ICONS[contact.type]"></i>
                  <i class="mdi mdi-chevron-down"></i>
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
        <div class="position-relative">
          <label class="form-label">Order Note <span class="text-muted fw-normal small">(optional)</span></label>
          <textarea v-model="noteBody" class="form-control ps-2 pe-5" rows="3"
            placeholder="Any notes for this order..."></textarea>
            <input @change="addFileAttachment" type="file" accept="image/*" class="file-attachment">
            <div v-if="formData.attachmentImg" class="position-relative">
              <img class="img-fluid rounded" :src="formData.attachmentImg?.url">
              <span @click="formData.attachmentImg = null" class="btn cancel-btn"><i class="mdi mdi-cancel"></i></span>
            </div>
        </div>

      </div>

      <!-- RIGHT: Model + Parts -->
      <div class="col-md-7 d-flex flex-column gap-3">

        <!-- Model Search -->
        <div>
          <label class="form-label"><i class="bi bi-boxes"></i> Select Model</label>
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
                  <small class="text-muted"><img :src="model.author?.image" height="16" width="16" class="rounded-2"> {{ model.author?.name }}</small>
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
                <i class="mdi mdi-cube-outline text-normal-z"></i>
                <span class="fw-semibold small text-uppercase">Parts</span>
                <span class="badge bg-normal ms-auto">{{ ungroupedParts.filter(p => checkedParts.has(p._id)).length }}/{{ ungroupedParts.length }}</span>
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
                  <PartPopUp :mesh="part" v-if="part.images?.[0]?.data">
                    <img
                    :src="part.images[0].data"
                    class="part-chip-img rounded"
                    alt="part"
                    />
                  </PartPopUp>
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
                  <PartPopUp v-if="getMeshById(partId)?.images?.[0]?.data" :mesh="getMeshById(partId)">
                    <img
                    :src="getMeshById(partId).images[0].data"
                    class="part-chip-img rounded"
                    alt="part"
                    />
                  </PartPopUp>
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
            <button type="button" class="btn btn-outline btn-sm"
              :class="sizeUnit === 'mm' ? 'btn-primary' : 'btn-secondary'"
              @click="sizeUnit = 'mm'">mm</button>
            <button type="button" class="btn btn-outline btn-sm"
              :class="sizeUnit === 'in' ? 'btn-primary' : 'btn-secondary'"
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
            class="btn border w-100 text-start d-flex align-items-center gap-2"
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
    <div class="d-flex align-items-center gap-4 mt-4">
      <div class="form-check form-switch">
        <input id="customerPaid" v-model="formData.customerPaid" type="checkbox" class="form-check-input" role="switch" />
        <label for="customerPaid" class="form-check-label">Customer Paid</label>
      </div>
      <div class="form-check form-switch">
        <input id="paid" v-model="formData.paid" type="checkbox" class="form-check-input" role="switch" />
        <label for="paid" class="form-check-label">Paid Out</label>
      </div>
      <div class="ms-auto d-flex gap-2">
        <button type="button" class="btn text-secondary me-4" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-normal-grad px-4" :disabled="loading" @click="submitForm">
          <span v-if="!loading">
            {{ isEditMode ? 'Save Changes' : 'Create Order' }}
            <i class="mdi" :class="isEditMode ? 'mdi-content-save' : 'mdi-check'"></i>
          </span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isEditMode ? 'Saving...' : 'Creating...' }}
          </span>
        </button>
      </div>
    </div>

  </form>
</template>

<style lang="scss" scoped>
.dropdown-menu.show,
.model-dropdown{
  margin: 0;
  padding: 0.25rem 0;
  background: rgba(var(--bs-dark-rgb), .5);
  backdrop-filter: blur(18px);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}


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
}

.model-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(var(--bs-primary-rgb), .2);
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
  background: rgba(var(--bs-black-rgb), .25);
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
  border-radius: 1em;
  padding: 0.5rem;
  background: rgba(var(--bs-black-rgb), .25);
}

.part-group-header {
  // background: rgba(255, 255, 255, 0.05);
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
  border: 1px solid transparent;
  background: rgba(var(--bs-light-rgb), .1);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  max-width: 180px;

  &:hover {
    background: rgba(var(--bs-secondary-rgb), .1);
  }

  &--checked {
    background: rgba(var(--bs-primary-rgb), .15);
    border-color: rgba(var(--bs-primary-rgb), .5);
  }

  input{
    margin: 0;
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
  color: var(--bs-info);
  flex-shrink: 0;
}


// ── Notes ─────────────────────────────────────────────────
.note-chip {
  background: rgba(13, 110, 253, 0.1);
  border: 1px solid rgba(13, 110, 253, 0.25);
  font-size: 0.875rem;
}

.file-attachment{
  width: 0; 
  &::after{
    cursor: pointer;
    border-radius: .5rem;
    padding: .2em .5em;
    color: rgba(var(--bs-primary-rgb), 1);
    background-color: var(--bs-tertiary-bg);
    right: 0rem;
    top: 2rem;
    position: absolute;
    font-family: "Material Design Icons";
    content: "\F1AC9";
    border: 1px solid var(--bs-primary);
    &:hover{
      filter: brightness(1.2) saturate(1.1);
    }
  }
}

.cancel-btn{
  position: absolute;
  right: 0;
  color: var(--bs-light);
  background-color: rgba(var(--bs--rgb), .2);
  text-shadow: 0px 0px 5px var(--bs-dark);
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
