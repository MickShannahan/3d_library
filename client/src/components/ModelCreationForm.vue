<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ModalWrapper from './ModalWrapper.vue'
import {Modal} from 'bootstrap'
import { AppState } from '@/AppState'
import { PartGroup } from '@/models/PartGroup'
import { modelsService } from '@/services/ModelsService'
import { Author } from '@/models/Author'
import { Model } from '@/models/Model'

const model = computed(() => AppState.meshGroups[0])

const authorSearch = ref('')
const authorDropdownOpen = ref(false)
const selectedAuthor = ref<Author | null>(null)

const filteredAuthors = computed(() => {
  const q = authorSearch.value.trim().toLowerCase()
  if (!q) return AppState.authors
  return AppState.authors.filter(a => a.name.toLowerCase().includes(q))
})

function selectAuthor(author: Author) {
  selectedAuthor.value = author
  authorSearch.value = author.name
  authorDropdownOpen.value = false
}
const tagsInput = ref('')
const tags = computed(() =>
  tagsInput.value.split(',').map(t => t.trim()).filter(t => t.length)
)
// ---- 👁️👁️ ----
watch(model, (m)=>{
  if(!m) return
  if(m.author) selectAuthor(m.author)
  if(m.tags.length) tagsInput.value = m.tags.join(', ')
}, {immediate: true})

const newGroupName = ref('')

// --- Scale (stored as 0-3 multiplier, displayed as 0-300% in 0.1% steps) ---
const scaleHundredths = computed({
  get: () => Math.round((model.value?.adjustedScale ?? 1) * 10000),
  set: (v: number) => { if (model.value) model.value.adjustedScale = v / 10000 }
})
const scaleInput = computed({
  get: () => scaleHundredths.value / 100,
  set: (v: number) => { scaleHundredths.value = Math.round(Math.min(300, Math.max(0, v)) * 100) }
})

// --- Size (stored in mm, togglable display) ---
const sizeUnit = ref<'mm' | 'in'>('mm')
const MM_PER_INCH = 25.4
const sizeDisplay = computed({
  get: () => {
    const mm = model.value?.size ?? 0
    return sizeUnit.value === 'in' ? parseFloat((mm / MM_PER_INCH).toFixed(3)) : mm
  },
  set: (v: number) => {
    if (model.value) model.value.size = sizeUnit.value === 'in' ? parseFloat((v * MM_PER_INCH).toFixed(2)) : v
  }
})
const dragging = ref<string | null>(null)         // _id of mesh being dragged
const draggingFrom = ref<PartGroup | null>(null)  // source group, null = ungrouped

const ungroupedMeshes = computed(() => {
  if (!model.value) return []
  const groupedIds = model.value.partGroups.flatMap(pg => pg.partIds)
  return model.value.meshes.filter(m => !groupedIds.includes(m._id))
})

function meshName(id: string) {
  return model.value?.meshes.find(m => m._id === id)?.name ?? id
}

// --- Drag handlers ---
function onDragStart(id: string, fromGroup: PartGroup | null = null) {
  dragging.value = id
  draggingFrom.value = fromGroup
}

function onDropToGroup(group: PartGroup) {
  if (!dragging.value) return
  // Remove from source group if dragged from one
  if (draggingFrom.value && draggingFrom.value !== group) {
    const src = draggingFrom.value.partIds
    src.splice(src.indexOf(dragging.value), 1)
  }
  if (!group.partIds.includes(dragging.value)) {
    group.partIds.push(dragging.value)
    // Set as default if first member
    if (group.partIds.length === 1) group.defaultPartId = dragging.value
  }
  dragging.value = null
  draggingFrom.value = null
}

function onDropToUngrouped() {
  if (!dragging.value || !draggingFrom.value) return
  const src = draggingFrom.value.partIds
  const idx = src.indexOf(dragging.value)
  if (idx !== -1) src.splice(idx, 1)
  dragging.value = null
  draggingFrom.value = null
}

// --- Group actions ---
function addPartGroup() {
  if (!newGroupName.value) return
  model.value.partGroups.push(new PartGroup({
    name: newGroupName.value,
    partIds: [],
    modelId: model.value._id
  }, model.value))
  newGroupName.value = ''
}

function disbandGroup(group: PartGroup) {
  const idx = model.value.partGroups.indexOf(group)
  if (idx !== -1) model.value.partGroups.splice(idx, 1)
}

function removeFromGroup(group: PartGroup, id: string) {
  const idx = group.partIds.indexOf(id)
  if (idx !== -1) group.partIds.splice(idx, 1)
  if (group.defaultPartId === id) group.defaultPartId = group.partIds[0] ?? null
}

function removeMesh(meshId: string) {
  const idx = model.value.meshes.findIndex(m => m._id === meshId)
  if (idx !== -1) model.value.meshes.splice(idx, 1)
  model.value.partGroups.forEach(pg => {
    const pidx = pg.partIds.indexOf(meshId)
    if (pidx !== -1) pg.partIds.splice(pidx, 1)
  })
}

async function handleSubmit() {
  model.value.author = selectedAuthor.value
  model.value.tags = tags.value
  closeModal()
  await modelsService.createModel(model.value as Model)
}

function closeModal(){
  Modal.getOrCreateInstance('#create-model').hide()
}
</script>

<template>
  <ModalWrapper id="create-model">
    <form v-if="model" class="container-fluid"
      @submit.prevent>

      <!-- Header -->
      <div class="row mb-3 align-items-center">
        <div class="col">
          <h5 class="mb-0">Publish Model</h5>
        </div>
        <div class="col-auto">
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
      </div>

      <!-- Model name + Author -->
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <label class="form-label">Model Name</label>
          <input v-model="model.name" type="text" class="form-control" placeholder="Model name" minlength="3" maxlength="50" required />
        </div>
        <div class="col-md-4">
          <label class="form-label">Author</label>
          <div class="author-search-wrap">
            <input
              v-model="authorSearch"
              type="text"
              class="form-control"
              placeholder="Search authors..."
              @focus="authorDropdownOpen = true"
              @blur="authorDropdownOpen = false"
              autocomplete="off"
            />
            <ul v-show="authorDropdownOpen && filteredAuthors.length" class="author-dropdown">
              <li
                v-for="a in filteredAuthors" :key="a._id"
                class="author-option"
                @mousedown.prevent="selectAuthor(a)">
                <img :src="String(a.image)" :alt="a.name" class="author-avatar" />
                <span>{{ a.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Price + Size + Scale -->
      <div class="row g-3 mb-3 align-items-end">
        <div class="col-md-2">
          <label class="form-label">Price <span class="text-muted small">(USD)</span></label>
          <input v-model.number="model.price" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" />
        </div>
        <div class="col-md-3">
          <label class="form-label d-flex align-items-center justify-content-between">
            Size
            <div class="btn-group btn-group-sm ms-2" role="group">
              <button type="button" class="btn" :class="sizeUnit === 'mm' ? 'btn-normal' : 'btn-outline-secondary'" @click="sizeUnit = 'mm'">mm</button>
              <button type="button" class="btn" :class="sizeUnit === 'in' ? 'btn-normal' : 'btn-outline-secondary'" @click="sizeUnit = 'in'">in</button>
            </div>
          </label>
          <input v-model.number="sizeDisplay" type="number" class="form-control" placeholder="0" min="0" :step="sizeUnit === 'in' ? '0.001' : '0.1'" />
        </div>
        <div class="col-md-7">
          <label class="form-label d-flex align-items-center justify-content-between gap-2">
            Adjusted Scale
            <div class="input-group input-group-sm scale-input">
              <input v-model.number="scaleInput" type="number" class="form-control form-control-sm text-end" min="0" max="300" step="0.01" />
              <span class="input-group-text">%</span>
            </div>
          </label>
          <input v-model.number="scaleHundredths" type="range" class="form-range" min="0" max="30000" step="1" list="scale-ticks" />
          <datalist id="scale-ticks">
            <option value="0"></option>
            <option value="10000"></option>
            <option value="20000"></option>
            <option value="30000"></option>
          </datalist>
          <div class="scale-ticks-labels">
            <span style="left: 0%">0%</span>
            <span style="left: 33.33%">100%</span>
            <span style="left: 66.67%">200%</span>
            <span style="left: 100%">300%</span>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <label class="form-label">Tags</label>
          <div class="d-flex flex-wrap gap-2 mb-1" v-if="tags.length">
            <span v-for="tag in tags" :key="tag" class="badge bg-normal">{{ tag }}</span>
          </div>
          <textarea v-model="tagsInput" class="form-control" rows="2" placeholder="e.g. mechanical, sci-fi, rigged"></textarea>
          <div class="form-text">Separate tags with commas</div>
        </div>
      </div>

      <hr />

      <!-- Meshes + Part Groups drag/drop area -->
      <div class="row g-3">

        <!-- Ungrouped meshes (drag source + drop target) -->
        <div class="col-md-5">
          <label class="form-label fw-semibold">Part Meshes</label>
          <ul class="list-group list-group-flush drop-zone"
            @dragover.prevent
            @drop.prevent="onDropToUngrouped">
            <li v-if="!ungroupedMeshes.length" class="list-group-item text-muted fst-italic px-2 py-1">
              All parts are grouped
            </li>
            <li v-for="mesh in ungroupedMeshes" :key="mesh._id"
              class="list-group-item d-flex align-items-center gap-2 px-2 py-1 mesh-row"
              draggable="true"
              @dragstart="onDragStart(mesh._id)">
              <i class="bi bi-grip-vertical text-muted drag-handle"></i>
              <input v-model="mesh.name" type="text" class="form-control form-control-sm" minlength="3" maxlength="50" @click.stop />
              <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" @click="removeMesh(mesh._id)">
                <i class="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>

        <!-- Part groups (drop targets) -->
        <div class="col-md-7">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <label class="form-label fw-semibold mb-0">Part Groups</label>
            <div class="d-flex gap-2">
              <input v-model="newGroupName" type="text" class="form-control form-control-sm"
                placeholder="Group name" minlength="3" maxlength="50" style="width: 130px" />
              <button type="button" class="btn btn-sm btn-outline-primary" @click="addPartGroup"
                :disabled="!newGroupName">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div v-if="!model.partGroups.length" class="text-muted fst-italic small ps-1">
            No groups yet — create one and drag parts into it
          </div>

          <div v-for="(group, i) in model.partGroups" :key="group.name"
            class="part-group-zone border-start ps-2 mb-2"
            :class="`border-${PartGroup.color(i)}`"
            @dragover.prevent
            @drop.prevent="onDropToGroup(group)">

            <!-- Group header -->
            <div class="d-flex align-items-center gap-2 py-1">
              <i :class="`bi bi-boxes text-${PartGroup.color(i)}`"></i>
              <input v-model="group.name" type="text" class="form-control form-control-sm" minlength="3" maxlength="50" />
              <button type="button" class="btn btn-sm  flex-shrink-0"
                @click="disbandGroup(group)" title="Disband group">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Group members -->
            <div class="d-flex flex-column gap-1 ps-1 pb-1">
              <div v-if="!group.partIds.length" class="text-muted small fst-italic">
                Drop parts here
              </div>
              <div v-for="id in group.partIds" :key="id"
                class="d-flex align-items-center gap-2 mesh-row"
                draggable="true"
                @dragstart="onDragStart(id, group)">
                <i class="bi bi-grip-vertical text-muted drag-handle"></i>

                <!-- Default part radio -->
                <input class="form-check-input mt-0 flex-shrink-0" type="radio"
                  :name="`default-${group.name}`"
                  :value="id"
                  v-model="group.defaultPartId"
                  title="Set as default part" />

                <span class="small flex-grow-1 text-truncate">{{ meshName(id) }}</span>

                <button type="button" class="btn btn-sm text-muted flex-shrink-0 p-0 px-1"
                  @click="removeFromGroup(group, id)" title="Remove from group">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <!-- Submit -->
      <div class="row">
        <div class="col d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-normal-grad" @click="handleSubmit">
            <i class="bi bi-cloud-upload me-1"></i>Publish
          </button>
        </div>
      </div>

    </form>
    <div v-else class="text-muted text-center py-4">No model loaded</div>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
.list-group-item,
.part-group-zone {
  background: transparent;
  border-color: transparent;
}

.drop-zone {
  min-height: 48px;
  border: 1px dashed transparent;
  border-radius: 0.375rem;
  transition: border-color 0.15s;

  &:has(> *[draggable]:hover),
  &[dragover] {
    border-color: rgba(var(--bs-pink-rgb), 0.4);
  }
}

.part-group-zone {
  transition: background-color 0.15s;
  border-radius: 0 0.25rem 0.25rem 0;

  &:has([dragover]) {
    background-color: rgba(var(--bs-pink-rgb), 0.08);
  }
}

.mesh-row {
  cursor: grab;
  &:active { cursor: grabbing; }
}

.drag-handle {
  cursor: grab;
  font-size: 0.75rem;
}

.scale-input {
  width: 120px;
}

.author-search-wrap {
  position: relative;
}

.author-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  list-style: none;
  margin: 2px 0 0;
  padding: 0.25rem 0;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow-sm);
  max-height: 220px;
  overflow-y: auto;
}

.author-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  cursor: pointer;

  &:hover {
    background: rgba(var(--bs-emphasis-color-rgb), 0.06);
  }
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.scale-ticks-labels {
  position: relative;
  height: 1.1rem;
  font-size: 0.7rem;
  color: var(--bs-secondary-color);

  span {
    position: absolute;
    transform: translateX(-50%);
    white-space: nowrap;
    &:first-child { transform: none; }
    &:last-child  { transform: translateX(-100%); }
  }
}
</style>