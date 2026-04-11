<script setup lang="ts">
import { logger } from '@/utils/Logger';
import FilePicker from './FilePicker.vue';
import { PartMesh } from '@/models/PartMesh';
import { computed, markRaw, ref } from 'vue';
import { meshService } from '@/services/MeshService';
import { AppState } from '@/AppState';
import FileListGroup from './FileListGroup.vue';
import FileListItem from './FileListItem.vue';
import FileListPartGrouper from './FileListPartGrouper.vue';
import FileListPartGroupItem from './FileListPartGroupItem.vue';
import { Model } from '@/models/Model';
import ModelCreationForm from './ModelCreationForm.vue';

const fileGroups = computed(()=> AppState.meshGroups)

function handleSelectedFiles(files){
  logger.log('📂', files)
  const currentFileGroup = fileGroups.value[0]
    const stlMeshes = files.map(f => markRaw(new PartMesh({
    src: URL.createObjectURL(f),
    objectName: f.name
  })))
  if(currentFileGroup){
    currentFileGroup.meshes.push(...stlMeshes)
  } else {
    meshService.addMeshGroups(stlMeshes)
  }
}

function ungroupedMeshes(group: Model){
  const groupedIds = group.partGroups.flatMap(pg => pg.partIds)
  return group.meshes.filter(m => !groupedIds.includes(m._id))
}

</script>


<template>
  <section id="file-list-pane" class="glass-pane border rounded rounded-3 p-2">
    <div class="d-flex justify-content-end gap-1">
      <FilePicker @selectedFiles="handleSelectedFiles" :type="fileGroups.length == 0 ? 'area':'button'"/>

      <button v-if="fileGroups.length" v-tooltip="'Create model'" class="btn btn-normal-grad" data-bs-toggle="modal" data-bs-target="#create-model"><i class="mdi mdi-creation"></i></button>
    </div>

    <FileListGroup v-for="group in fileGroups" :key="group._id"  :group>

      <FileListItem v-for="file in ungroupedMeshes(group)" :file :key="`file-item-${file._id}`"/>

      <FileListPartGroupItem v-for="(partGroup, i) in group.partGroups" :partGroup :index="i" :key="partGroup.name"/>

    </FileListGroup>

    <FileListPartGrouper/>

    <ModelCreationForm/>
    
  </section>

</template>


<style lang="scss" scoped>
#file-list-pane{
  width: clamp(350px, 6vw, 650px);
}
</style>