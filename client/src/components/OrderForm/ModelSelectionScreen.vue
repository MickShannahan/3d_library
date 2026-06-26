<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { AppState } from '@/AppState'
import { Model } from '@/models/Model'
import PartPopUp from '@/components/PartPopUp.vue'

const props = defineProps<{ index: number }>()
const emit = defineEmits<{ (e: 'remove'): void }>()

const formData = inject<any>('orderFormData')
const modelEntry = computed(() => formData.models[props.index])

// Model search state
const modelSearchOpen = ref(false)

const filteredModels = computed(() => {
  const q = (modelEntry.value.modelSearch ?? '').trim().toLowerCase()
  if (!q) return AppState.models
  return AppState.models.filter(m => m.name?.toLowerCase().includes(q))
})

const selectedModel = computed<Model | null>(() =>
  AppState.models.find(m => m._id === modelEntry.value.modelId) ?? null
)

const ungroupedParts = computed(() => {
  if (!selectedModel.value) return []
  const groupedIds = new Set(selectedModel.value.partGroups.flatMap(g => g.partIds))
  return selectedModel.value.meshData.filter((m: any) => !groupedIds.has(m._id))
})

const checkedParts = computed<Set<string>>(() => new Set(modelEntry.value.partIds))

function getMeshById(id: string) {
  return selectedModel.value?.meshData.find((m: any) => m._id === id)
}

function initializeParts(model: Model) {
  const selected = new Set<string>()
  const groupedIds = new Set(model.partGroups.flatMap(g => g.partIds))
  model.meshData.forEach((m: any) => {
    if (!groupedIds.has(m._id)) selected.add(m._id)
  })
  model.partGroups.forEach(g => {
    if (g.defaultPartId) selected.add(g.defaultPartId)
  })
  modelEntry.value.partIds = Array.from(selected)
}

function onSelectModel(model: Model) {
  modelEntry.value.modelId = model._id
  modelEntry.value.modelSearch = model.name
  modelSearchOpen.value = false
  if (model.price) modelEntry.value.price = model.price
  initializeParts(model)
}

function clearModel() {
  modelEntry.value.modelId = ''
  modelEntry.value.modelSearch = ''
  modelEntry.value.partIds = []
}

function togglePartCheck(partId: string) {
  const parts = new Set<string>(modelEntry.value.partIds)
  if (parts.has(partId)) parts.delete(partId)
  else parts.add(partId)
  modelEntry.value.partIds = Array.from(parts)
}
</script>

<template>
  <div class="model-selection-screen container-fluid px-2 py-1">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0 text-muted">
        <i class="mdi mdi-cube-outline me-1"></i>
        Model {{ index + 1 }}
      </h6>
      <button v-if="index > 0" type="button" class="btn btn-sm btn-outline-danger"
        @click="emit('remove')" title="Remove this model">
        <i class="mdi mdi-trash-can-outline me-1"></i>Remove
      </button>
    </div>

    <div class="row g-3">

      <!-- Model Search -->
      <div class="col-12 col-md-7">
        <label class="form-label"><i class="bi bi-boxes me-1"></i>Select Model <span class="text-danger">*</span></label>
        <div class="model-search-wrap">
          <div class="input-group">
            <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
            <input
              v-model="modelEntry.modelSearch"
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
                <small class="text-muted">
                  <img :src="model.author?.image" height="16" width="16" class="rounded-2" />
                  {{ model.author?.name }}
                </small>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Price for this model -->
      <div class="col-12 col-md-5">
        <label class="form-label"><i class="mdi mdi-currency-usd me-1"></i>Print Price</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input v-model.number="modelEntry.price" type="number" class="form-control"
            placeholder="0.00" step="0.01" min="0" />
        </div>
        <small class="text-muted">Cost to print this model</small>
      </div>

      <!-- Scale % for this model -->
      <div class="col-12 col-md-6">
        <label class="form-label"><i class="mdi mdi-percent me-1"></i>Scale</label>
        <div class="input-group">
          <input v-model.number="modelEntry.scale" type="number" class="form-control"
            placeholder="100" min="1" max="500" step="1" />
          <span class="input-group-text">%</span>
        </div>
        <small class="text-muted">Print scale (100% = original size)</small>
      </div>

      <!-- Size (mm) for this model -->
      <div class="col-12 col-md-6">
        <label class="form-label"><i class="mdi mdi-ruler me-1"></i>Size</label>
        <div class="input-group">
          <input v-model.number="modelEntry.size" type="number" class="form-control"
            placeholder="Optional" min="1" step="1" />
          <span class="input-group-text">mm</span>
        </div>
        <small class="text-muted">Bounding box dimension (optional)</small>
      </div>

      <!-- Model Preview Card -->
      <div v-if="selectedModel" class="col-12">
        <div class="model-preview rounded-3 p-2">
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
                <img :src="selectedModel.author.image" class="rounded"
                  style="width:20px;height:20px;object-fit:cover;" />
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
      </div>

      <!-- Parts Selector -->
      <div v-if="selectedModel" class="col-12">
        <label class="form-label">Parts to Include</label>
        <div class="parts-scroll">

          <!-- Ungrouped Parts -->
          <div v-if="ungroupedParts.length" class="part-group mb-2">
            <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
              <i class="mdi mdi-cube-outline text-normal-z"></i>
              <span class="fw-semibold small text-uppercase">Parts</span>
              <span class="badge bg-normal ms-auto">
                {{ ungroupedParts.filter(p => checkedParts.has(p._id)).length }}/{{ ungroupedParts.length }}
              </span>
            </div>
            <div class="part-chip-grid">
              <div v-for="part in ungroupedParts" :key="part._id"
                class="part-chip" :class="{ 'part-chip--checked': checkedParts.has(part._id) }"
                @click="togglePartCheck(part._id)">
                <input :id="`part-${part._id}-${index}`" type="checkbox" class="form-check-input flex-shrink-0"
                  :checked="checkedParts.has(part._id)" @change="togglePartCheck(part._id)" @click.stop />
                <PartPopUp :mesh="part" v-if="part.images?.[0]?.data">
                  <img :src="part.images[0].data" class="part-chip-img rounded" alt="part" />
                </PartPopUp>
                <div v-else class="part-chip-img rounded bg-secondary"></div>
                <span class="part-chip-name">{{ part.name }}</span>
              </div>
            </div>
          </div>

          <!-- Part Groups -->
          <div v-for="group in selectedModel.partGroups" :key="group.name" class="part-group mb-2">
            <div class="part-group-header d-flex align-items-center gap-2 px-2 py-1 mb-1 rounded">
              <i class="mdi mdi-layers-outline text-primary"></i>
              <span class="fw-semibold small text-uppercase">{{ group.name }}</span>
            </div>
            <div class="part-chip-grid">
              <div v-for="partId in group.partIds" :key="partId"
                class="part-chip" :class="{ 'part-chip--checked': checkedParts.has(partId) }"
                @click="togglePartCheck(partId)">
                <input :id="`part-${partId}-${index}`" type="checkbox" class="form-check-input flex-shrink-0"
                  :checked="checkedParts.has(partId)" @change="togglePartCheck(partId)" @click.stop />
                <PartPopUp v-if="getMeshById(partId)?.images?.[0]?.data" :mesh="getMeshById(partId)">
                  <img :src="getMeshById(partId).images[0].data" class="part-chip-img rounded" alt="part" />
                </PartPopUp>
                <div v-else class="part-chip-img rounded bg-secondary"></div>
                <span class="part-chip-name">{{ getMeshById(partId)?.name ?? partId }}</span>
                <span v-if="group.defaultPartId === partId" class="part-chip-badge">★</span>
              </div>
            </div>
          </div>

          <p v-if="!selectedModel.partGroups.length && !ungroupedParts.length"
            class="text-muted small fst-italic">No parts found for this model</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.model-selection-screen{
  min-height: 45dvh;
}

.model-search-wrap { position: relative; }

.model-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 260px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  background: rgba(var(--bs-dark-rgb), .5);
  backdrop-filter: blur(18px);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.model-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(var(--bs-primary-rgb), .2); }
}

.model-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  flex-shrink: 0;
}

.model-preview { background: rgba(var(--bs-black-rgb), .25); }

.img-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  overflow: hidden;
  .img-cover, .img-turnaround {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  }
  .img-turnaround { opacity: 0; transition: opacity 0.2s ease; }
  &:hover .img-turnaround { opacity: 1; }
}

.parts-scroll {
  border-radius: 1em;
  padding: 0.5rem;
  background: rgba(var(--bs-black-rgb), .25);
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
  background: rgba(var(--bs-light-rgb), .1);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  max-width: 180px;
  &:hover { background: rgba(var(--bs-secondary-rgb), .1); }
  &--checked {
    background: rgba(var(--bs-primary-rgb), .15);
    border-color: rgba(var(--bs-primary-rgb), .5);
  }
  input { margin: 0; }
}

.part-chip-img { width: 32px; height: 32px; object-fit: cover; flex-shrink: 0; }
.part-chip-name {
  font-size: 0.72rem; line-height: 1.2; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 110px;
}
.part-chip-badge { font-size: 0.6rem; color: var(--bs-info); flex-shrink: 0; }
</style>
