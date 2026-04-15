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
import { Pop } from '@/utils/Pop';

const fileGroups = computed(()=> AppState.meshGroups)

function handleSelectedFiles(files){
  meshService.addFilesToScene(files)
}

function ungroupedMeshes(group: Model){
  const groupedIds = group.partGroups.flatMap(pg => pg.partIds)
  return group.meshes.filter(m => !groupedIds.includes(m._id))
}

async function clearWorkSpace(){
  const confirm = await Pop.confirm("Remove ALL Files from Workspace?")
  if(!confirm) return
  for(let group of AppState.meshGroups){
    meshService.destroyMeshGroup(group._id)
  }
}

</script>


<template>
  <section id="file-list-pane" class="glass-pane border rounded rounded-3 p-2">
    <div v-if="fileGroups.length" class="d-flex justify-content-between gap-1">

      <button  @click="clearWorkSpace" class="btn " v-tooltip="'Clear 3D Workspace'">
        <i class="mdi mdi-cancel"></i>
      </button>

      <div>
        <FilePicker @selectedFiles="handleSelectedFiles" type="button"/>
        
        <button v-tooltip="'Create model'" class="btn btn-normal-grad ms-1" data-bs-toggle="modal" data-bs-target="#create-model"><i class="mdi mdi-creation"></i></button>
      </div>
    </div>
    <div v-else>
        <FilePicker @selectedFiles="handleSelectedFiles" type="area"/>
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

</style>