<script setup lang="ts">
import { AppState } from '@/AppState';
import { STLMesh } from '@/models/STLMesh';
import { meshService } from '@/services/MeshService';
import { logger } from '@/utils/Logger';
import { Pop } from '@/utils/Pop';
import { watch, onMounted, ref, computed } from 'vue';


const props = defineProps({
  file: STLMesh
})
const fileSelected = computed(()=> AppState.selectedMeshIds.includes(props.file.uuid))
const progressLoaded = ref(0)

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

</script>


<template>
  <article :class="{active: fileSelected}" @click="handleFileClick" class="px-1 rounded">
    <div class="d-flex justify-content-between align-items-center">
      <div> <i class="bi bi-box text-primary"></i> {{ file.name }}</div>

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
  background-color: rgba(var(--bs-primary-rgb),.2);
}

.progress{
  height: 3px;
}
</style>