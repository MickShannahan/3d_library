<script setup lang="ts">
import { AppState } from '@/AppState';
import { PartGroup } from '@/models/PartGroup';
import { Pop } from '@/utils/Pop';
import { computed } from 'vue';

const selectedParts = computed(()=> AppState.selectedMeshIds)

async function createPartGroup(){
  const partName = await Pop.prompt('text', 'Name of Group')
  const activeModel = AppState.meshGroups[0]
  const newPartGroup = new PartGroup({
    name: partName,
    modelId: activeModel.id || activeModel.uuid,
    partIds: selectedParts.value
  })
  activeModel.partGroups.push(newPartGroup)
}

</script>


<template>
<div v-if="selectedParts.length >= 2" @click="createPartGroup" role="button" class="part-group-btn rounded-3 p-2 mt-2">
  <section  class="d-flex justify-content-between">
    <div><i class="bi bi-box me-1"></i>{{ selectedParts.length }}</div>
    <div>Create Group <i class="bi bi-boxes text-pink"></i></div>
  </section>
</div>

</template>


<style lang="scss" scoped>
.part-group-btn{
  cursor: pointer;
  background-color: rgba(var(--bs-black-rgb), .2);
  &:hover{
  background-color: rgba(var(--bs-pink-rgb), .2);
  }
}
</style>