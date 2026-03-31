<script setup lang="ts">
import FileListPane from '@/components/FileListPane.vue';
import FilePicker from '@/components/FilePicker.vue';
import ThreeDWindow from '@/components/ThreeDWindow.vue';
import { MeshGroup } from '@/models/MeshGroup';
import { STLMesh } from '@/models/STLMesh';
import { meshService } from '@/services/MeshService';
import { logger } from '@/utils/Logger';

async function onSelectedFiles(files : File[]){
  logger.log('📂',files)

  // stlMeshes.forEach(stl => stl.addEventListener('progress', (v)=>{
  //   logger.log(stl.name, v)
  // }))
  await Promise.all(stlMeshes.map(s => s.loaded))
  logger.log(stlMeshes)
  meshService.addMeshGroups(stlMeshes)
}

</script>

<template>
  <div class="flex-grow-1 d-flex flex-column position-relative">
    <ThreeDWindow />
    <section>

    </section>
  </div>
</template>

<style lang="scss">


</style>
