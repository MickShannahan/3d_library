<script setup lang="ts">
import { PartGroup } from '@/models/PartGroup';
import { ref } from 'vue';
import FileListItem from './FileListItem.vue';
import { AppState } from '@/AppState';
import { logger } from '@/utils/Logger';

const props = defineProps({
  partGroup : PartGroup
})

const selectedPart = ref(props.partGroup.parts[0])

function selectActivePart(part){
  props.partGroup.parts.forEach(p => p.visible = false)
  part.visible = true
  selectedPart.value = part
}

function handlePartDragStart(mesh){
  AppState.draggingMesh = mesh
  AppState.draggingFromPartGroup = props.partGroup
}

function removePartFromGroup(mesh){
  const id = mesh.uuid
  const idx = props.partGroup.partIds.indexOf(id)
  if(idx !== -1) props.partGroup.partIds.splice(idx, 1)
}

function partDropped(){
  const meshDropped = AppState.draggingMesh
  if(!meshDropped) return

  // If coming from another part group, remove it from there first
  if(AppState.draggingFromPartGroup && AppState.draggingFromPartGroup !== props.partGroup){
    const srcIds = AppState.draggingFromPartGroup.partIds
    const idx = srcIds.indexOf(meshDropped.uuid)
    if(idx !== -1) srcIds.splice(idx, 1)
  }

  const id = meshDropped.uuid
  if(!props.partGroup.partIds.includes(id)){
    props.partGroup.partIds.push(id)
  }

  AppState.draggingMesh = null
  AppState.draggingFromPartGroup = null
}

</script>


<template>
<section class="border-start border-pink" @dragover.prevent @drop.prevent="partDropped">
  <div class="bg-pink ps-2 ">
    <i class="bi bi-boxes"></i>
    {{ partGroup.name }}
  </div>
  <section class="d-flex flex-column gap-1 p-2 pe-0">
    <div v-for="part in partGroup.parts" :key="part.uuid" class="d-flex align-items-center gap-1">
      <FileListItem 
        @click="selectActivePart(part)" 
        :file="part" 
        accent="pink"
        @dragstart="handlePartDragStart(part)"
        class="flex-grow-1"
      />
      <button class="remove-btn" @click.stop="removePartFromGroup(part)" title="Remove from group">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </section>
</section>
</template>


<style lang="scss" scoped>
.part{
  &:hover{
  background: rgba(var(--bs-pink-rgb),.4);
  }
}

.active{
  background: rgba(var(--bs-pink-rgb),.2);
}

.remove-btn {
  background: transparent;
  border: none;
  opacity: 0.4;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover {
    opacity: 1;
    background: rgba(var(--bs-danger-rgb), 0.2);
  }
}
</style>