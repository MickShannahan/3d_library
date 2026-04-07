<script setup>
import { AppState } from '@/AppState';
import ModelDetails from '@/components/ModelDetails.vue';
import ModelListCard from '@/components/ModelListCard.vue';
import { modelsService } from '@/services/ModelsService';
import { Pop } from '@/utils/Pop';
import { computed, onMounted } from 'vue';

const models = computed(()=> AppState.models)

onMounted(()=>{
  getModels()
})

async function getModels(){
  try {
    await modelsService.getModels()
  } catch (error) {
    Pop.error(error, "Could Not Fetch Models")
  }
}

</script>


<template>
<div class="d-flex flex-grow-1">
  <div class="container py-4">
    <h2>Models</h2>
    <section>filters</section>
    <section class="row g-2">
      
      <div v-for="model in models" class="col-6 col-md-3">
        <ModelListCard :model :key="model._id"/>
      </div>
      
    </section>
  </div>
  <div class="side-window shadow" :class="{open: AppState.activeModel}">
    <ModelDetails v-if="AppState.activeModel" :model="AppState.activeModel" />
  </div>
</div>
</template>


<style lang="scss" scoped>

.side-window{
  width: 0px;
  transition: all .2s ease;

  &.open{
    width: 600px;
    border-left: 1px solid var(--bs-primary);
  }
}

</style>