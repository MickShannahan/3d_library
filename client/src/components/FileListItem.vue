<script setup lang="ts">
import { STLMesh } from '@/models/STLMesh';
import { logger } from '@/utils/Logger';
import { watch, onMounted, ref } from 'vue';


const props = defineProps({
  file: STLMesh
})

const progressLoaded = ref(0)

onMounted(()=>{
  props.file.addEventListener('progress', handleFileProgress)
})


function handleFileProgress(progress){
  progressLoaded.value = progress.value
}

</script>


<template>
  <article>
    <div> <i class="bi bi-box text-primary"></i> {{ file.name }}</div>

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
}

.progress{
  height: 3px;
}
</style>