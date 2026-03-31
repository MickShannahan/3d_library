<script setup lang="ts">
import { logger } from '@/utils/Logger';
import FilePicker from './FilePicker.vue';
import { STLMesh } from '@/models/STLMesh';
import { computed, ref } from 'vue';
import { meshService } from '@/services/MeshService';
import { AppState } from '@/AppState';
import FileListGroup from './FileListGroup.vue';
import FileListItem from './FileListItem.vue';

const fileGroups = computed(()=> AppState.meshGroups)

function handleSelectedFiles(files){
  logger.log('📂', files)
    const stlMeshes = files.map(f => {
    return new STLMesh(URL.createObjectURL(f), {
      objectName : f.name
    })
  })
  meshService.addMeshGroups(stlMeshes)
}

</script>


<template>
  <section id="file-list-pane" class="glass-pane border rounded rounded-3 p-2">
    <div class="">
      <FilePicker @selectedFiles="handleSelectedFiles"/>
    </div>

    <FileListGroup v-for="group in fileGroups" :key="group.uuid" class="mt-2" :group>
      <FileListItem v-for="file in group.meshes" :file :key="file.uuid"/>
    </FileListGroup>
    
  </section>

</template>


<style lang="scss" scoped>
#file-list-pane{
  width: clamp(300px, 5vw, 500px);
}
</style>