<script setup lang="ts">
import FilePicker from '@/components/FilePicker.vue';
import ThreeDWindow from '@/components/ThreeDWindow.vue';
import { STLMesh } from '@/models/STLMesh';
import { logger } from '@/utils/Logger';
import { shallowRef } from 'vue';

const meshes = shallowRef([])

async function onSelectedFiles(files : File[]){
  logger.log('📂',files)
  const stlMeshes = files.map(f => new STLMesh(URL.createObjectURL(f)))
  await Promise.all(stlMeshes.map(s => s.loaded))
  logger.log(stlMeshes)
  meshes.value = stlMeshes
}

</script>

<template>
  <div class="flex-grow-1 d-flex flex-column position-relative">
    <section class="side-menu">
      <div class="pane border rounded p-2">
        <FilePicker @selectedFile="onSelectedFiles"/>
      </div>
    </section>
    <ThreeDWindow :meshes/>
    <section>

    </section>
  </div>
</template>

<style lang="scss">
.side-menu{
  position: absolute;
  z-index: 1;
}


</style>
