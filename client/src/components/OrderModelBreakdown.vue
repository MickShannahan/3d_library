<script setup lang="ts">
import { computed } from 'vue'
import { Order, type ModelOrderEntry } from '@/models/Order'
import { AppState } from '@/AppState'
import { Model } from '@/models/Model'
import { PartGroup } from '@/models/PartGroup'
import PartPopUp from './PartPopUp.vue'
import { logger } from '@/utils/Logger.js'
import { PartMesh } from '@/models/PartMesh.js'

const props = defineProps({
  order: { type: Order, required: true }
})

interface ModelBreakdown {
  entry: ModelOrderEntry
  model: Model
  parts: PartMesh[],
  groupData: any
}

const modelBreakdowns = computed<ModelBreakdown[]>(() => {
  return props.order.models.map((entry, i) => {
    logger.log("📳", entry)
    const model = AppState.models.find(m => m._id === entry.modelId._id as string)

    if (!model) return null

    const groupData = {}
    const parts = []
    entry.partIds.forEach(pid => {
      const part = model.meshData?.find(md => md._id == pid)
      if(part) parts.push(part)
      groupData[pid] = getGroupData(pid, model.partGroups as PartGroup[])
    })

    return { entry, model, parts, groupData}
  }).filter(Boolean) as ModelBreakdown[]
})

function getGroupData(partId: string, groups: PartGroup[]){
  const groupWithPartIndex = groups.findIndex(g => g.partIds.includes(partId))
  if(groupWithPartIndex == -1) return null
  return {...groups[groupWithPartIndex], color: PartGroup.color(groupWithPartIndex)}
}

</script>

<template>
  <div class="d-flex flex-column gap-3">
    <div v-for="({ entry, model, parts, groupData }, i) in modelBreakdowns" :key="entry._id ?? i"
      class="model-breakdown-card rounded-3 p-2">

      <!-- Model header -->
      <div class="d-flex gap-2 align-items-start mb-2">
        <img v-if="model.coverImage" :src="model.coverImage"
          class="model-thumb rounded-2 flex-shrink-0" :alt="model.name" />
        <div v-else class="model-thumb rounded-2 bg-secondary flex-shrink-0"></div>
        <div class="min-w-0">
          <div class="fw-semibold text-truncate">{{ model.name }}</div>
          <div class="d-flex flex-wrap gap-2 mt-1">
            <span class="meta-pill">
              <i class="mdi mdi-currency-usd"></i>{{ entry.price?.toFixed(2) }}
            </span>
            <span v-if="entry.scale && entry.scale !== 100" class="meta-pill">
              <i class="mdi mdi-percent"></i>{{ entry.scale }}%
            </span>
            <span v-if="entry.size" class="meta-pill">
              <i class="mdi mdi-ruler"></i>{{ entry.size }}mm
            </span>
          </div>
        </div>
      </div>

      <!-- No parts selected -->
      <div v-if="!parts.length" class="text-muted small ps-1">
        No parts selected for this model.
      </div>

      <!--  parts -->
      <div v-if="parts.length" class="mb-2">
        <div class="parts-label d-flex align-items-center justify-content-start gap-1 mb-1 px-1">
          <i class="mdi mdi-cube-outline text-muted small"></i>
          <span class="small text-uppercase fw-semibold text-muted">Parts</span>
          <span class="badge bg-normal-shadow px-3">{{ parts.length }}</span>
        </div>
        <div class="part-chip-grid">
          <div v-for="mesh in parts" :key="mesh._id" class="part-chip">
            <PartPopUp v-if="mesh.images?.[0]?.data" :mesh>
              <img :src="mesh.images[0].data" class="part-chip-img rounded-1" :alt="mesh.name" />
            </PartPopUp>
            <div v-else class="part-chip-img rounded-1 bg-secondary"></div>
            <span class="part-chip-name">{{ mesh.name }}</span>
            <span v-if="groupData[mesh._id]" class="part-group-label font-monospace" :class="`bg-${groupData[mesh._id].color}`">
              {{ groupData[mesh._id].name }}
            </span>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<style lang="scss" scoped>
.model-breakdown-card {
  background: rgba(var(--bs-black-rgb), .15);
  border: 1px solid rgba(var(--bs-light-rgb), .07);
}

.model-thumb {
  width: 112px;
  height: 112px;
  object-fit: cover;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  background: rgba(var(--bs-light-rgb), .1);
  border-radius: 99px;
  padding: 0.1rem 0.5rem;
  color: var(--bs-body-color);

  .mdi { font-size: 0.8rem; opacity: 0.7; }
}

.part-group-label {
  position: absolute;
  font-size: 0.6rem;
  padding: 0.1rem 0.5rem;
  letter-spacing: 0.04em;
  border-radius: 50em;
  top: -.65em;
  right: 0;
}

.part-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.1rem 0.25rem 0.4rem;
}

.part-chip {
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.3rem;
  padding: 0.15rem 0.4rem 0.15rem 0.25rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(var(--bs-primary-rgb), .4);
  background: rgba(var(--bs-primary-rgb), .12);
  max-width: 180px;
}

.part-chip-img {
  width: 54px;
  height: 54px;
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
</style>
