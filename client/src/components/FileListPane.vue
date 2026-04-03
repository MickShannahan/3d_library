<script setup lang="ts">
import { logger } from '@/utils/Logger';
import FilePicker from './FilePicker.vue';
import { PartMesh } from '@/models/PartMesh';
import { computed, ref } from 'vue';
import { meshService } from '@/services/MeshService';
import { AppState } from '@/AppState';
import FileListGroup from './FileListGroup.vue';
import FileListItem from './FileListItem.vue';
import FileListPartGrouper from './FileListPartGrouper.vue';
import FileListPartGroupItem from './FileListPartGroupItem.vue';
import { Model } from '@/models/Model';

const fileGroups = computed(()=> AppState.meshGroups)

function handleSelectedFiles(files){
  logger.log('📂', files)
    const stlMeshes = files.map(f => {
    return new PartMesh({
      src: URL.createObjectURL(f), 
      objectName : f.name
    })
  })
  meshService.addMeshGroups(stlMeshes)
}

function ungroupedMeshes(group: Model){
  const groupedIds = group.partGroups.flatMap(pg => pg.partIds)
  return group.meshes.filter(m => !groupedIds.includes(m.uuid))
}

</script>


<template>
  <section id="file-list-pane" class="glass-pane border rounded rounded-3 p-2">
    <div class="d-flex justify-content-end">
      <FilePicker @selectedFiles="handleSelectedFiles" :type="fileGroups.length == 0 ? 'area':'button'"/>
    </div>

    <FileListGroup v-for="group in fileGroups" :key="group.uuid" class="mt-2" :group>

      <FileListItem v-for="file in ungroupedMeshes(group)" :file :key="file.uuid"/>

      <FileListPartGroupItem v-for="partGroup in group.partGroups" :partGroup :key="partGroup.name"/>

    </FileListGroup>

    <FileListPartGrouper/>
    
  </section>

</template>


<style lang="scss" scoped>
#file-list-pane{
  width: clamp(300px, 5vw, 500px);
}
</style>