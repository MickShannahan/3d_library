<script setup lang="ts">
import { AppState } from '@/AppState';
import { PartMesh } from '@/models/PartMesh';
import { meshService } from '@/services/MeshService';
import { logger } from '@/utils/Logger';
import { Pop } from '@/utils/Pop';
import { string } from 'three/tsl';
import { watch, onMounted, ref, computed } from 'vue';


const props = defineProps({
  file: PartMesh,
  accent: {type: String, default: 'blue'}
})
const emit = defineEmits(['dragstart'])
const fileSelected = computed(()=> AppState.selectedMeshIds.includes(props.file.uuid))
const progressLoaded = ref(0)
const accentColor = ref(`rgba(var(--bs-${props.accent}-rgb),.2)`)

onMounted(()=>{
  props.file.addEventListener('progress', handleFileProgress)
})


function handleFileProgress(progress){
  progressLoaded.value = progress.value
}

function handleFileClick(event){
  const heldShift = event.shiftKey
  meshService.selectMeshId(props.file.uuid, !heldShift)
}

function hideMesh(){
  props.file.visible = !props.file.visible
}

async function destroyMesh(){
  const confirm = await Pop.confirm(`Remove ${props.file.name}?`)
  if(!confirm) return
  meshService.destroyMesh(props.file)
}

function handleDragStart(){
  AppState.draggingMesh = props.file
  emit('dragstart', props.file)
}

function handleDragEnd(){
  // If draggingFromPartGroup is still set, the drag didn't land in any PartGroup drop zone
  // so remove this mesh from its source group
  if(AppState.draggingFromPartGroup){
    const ids = AppState.draggingFromPartGroup.partIds
    const idx = ids.indexOf(props.file.uuid)
    if(idx !== -1) ids.splice(idx, 1)
  }
  AppState.draggingMesh = null
  AppState.draggingFromPartGroup = null
}

</script>


<template>
  <article :class="{active: fileSelected}" @click="handleFileClick" @dragstart.stop="handleDragStart" @dragend="handleDragEnd" class="px-1 rounded" draggable="true">
    <div class="d-flex justify-content-between align-items-center">
      <div> 
        <i v-if="file.progress == 1" :class="`bi bi-box text-${accent}`"></i>
        <i v-else :class="`mdi mdi-loading mdi-spin text-${accent}`"></i>
        <img v-if="file.previewImages[0]" :src="file.previewImages[0]" alt="">
         {{ file.name }}
        </div>

      <div>
        <button v-if="file.visible" @click.stop="hideMesh"><i class="bi bi-eye-slash"></i></button>
        <button v-else @click.stop="hideMesh"><i class="bi bi-eye"></i></button>
        <button @click.stop="destroyMesh"><i class="bi bi-trash3"></i></button>
      </div>
    </div>

    <section v-if="progressLoaded > 0 && progressLoaded < 1">
      <div class="progress" role="progressbar">
        <div class="progress-bar" :style="`width: ${progressLoaded * 100}%`">
        </div>
      </div>
    </section>

  </article>
</template>


<style lang="scss" scoped>
article{
  font-family: monospace;
  cursor: pointer;
  user-select: none;
  &:hover{
    background-color: rgba(var(--bs-secondary-rgb),.2);
  }
}

article.active{
  background-color: v-bind(accentColor);
}

.progress{
  height: 3px;
}

img{
  height: 25px;
}
</style>