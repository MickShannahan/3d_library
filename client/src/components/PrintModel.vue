<script setup lang="ts">
import { computed } from 'vue';
import { AppState } from '@/AppState';
import { type ModelOrderEntry } from '@/models/Order';
import { Model } from '@/models/Model';

const props = defineProps<{ entry: ModelOrderEntry }>()

const model = computed<Model | null>(() => {
  return AppState.models.find(m => m._id === (props.entry.modelId.id || props.entry.modelId)) ?? null
})

const parts = computed(() => {
  const meshData = model.value?.meshData ?? []
  if (!props.entry?.partIds?.length) return meshData
  return meshData.filter(p => props.entry.partIds.includes(p._id))
})
</script>
<template>
  <div class="text-dark border p-1">
    <div class="bg-dark text-light px-2 text-uppercase d-flex gap-2">
      <div>
        {{ model?.name }}
      </div>
      <i class="mdi mdi-circle-small"></i>
      <div>
        <span class="me-2">Parts</span>
        <span class="font-mono">{{ parts.length }}</span>
      </div>
    </div>
    <section >
      <div v-for="part in parts" :key="part._id" class="d-flex align-items-center">

        <div>
          <img v-if="part.images[0]" :src="part.images[0].data" class="print-img fw-bold f-mono">
          {{ part.name }}
        </div>
        <span class="dots"></span>
        <i class="mdi mdi-square-outline fs-4"></i>
        <i class="mdi mdi-square-outline fs-4"></i>

      </div>
    </section>
  </div>
</template>

<style>
.dots{
  border-bottom: dotted 1px var(--bs-dark);
  flex-grow: 1;
}

.print-img{
  aspect-ratio: 1/1;
  height: 3em;
  filter: saturate(0) invert(.9) contrast(1.8) ;
  font-family: var(--f-mono) !important;
}
</style>