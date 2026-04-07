<script setup lang="ts">
import { AppState } from '@/AppState';
import BrowseNav from '@/components/BrowseNav.vue';
import BrowseSearchBar from '@/components/BrowseSearchBar.vue';
import ModelDetails from '@/components/ModelDetails.vue';
import ModelListCard from '@/components/ModelListCard.vue';
import { modelsService } from '@/services/ModelsService';
import { Pop } from '@/utils/Pop';
import { computed, onMounted, reactive, ref } from 'vue';

onMounted(()=>{
  getModels()
})

const filterBy = reactive({
  text: ''
})
const models = computed(() => AppState.models.filter(model => {
  const input = filterBy.text.trim()
  if (!input) return true

  const searchable = [model.name, model.tags.join(', '), model.author?.name ?? ''].join(' ')

  if (input.includes('+')) {
    const orPattern = input.split('+').filter(Boolean).join('|')
    return new RegExp(orPattern, 'ig').test(searchable)
  } else {
    return input.split(' ').filter(Boolean).every(term => new RegExp(term, 'ig').test(searchable))
  }
}))


async function getModels() {
  try {
    await modelsService.getModels()
  } catch (error) {
    Pop.error(error, 'Could Not Fetch Models')
  }
}

</script>


<template>
<div class="d-flex flex-grow-1">
  <div class="container-fluid p-2 p-md-4">
    <BrowseNav/>
    <BrowseSearchBar v-model="filterBy.text" >
      <button class="btn">create model<i class="bi bi-plus"></i></button>
    </BrowseSearchBar>
    <section class="cards-grid">
      <ModelListCard v-for="model in models" :model :key="model._id" />
    </section>
  </div>
  <div class="side-window shadow text-bg-dark" :class="{ open: AppState.activeModel }">
    <ModelDetails v-if="AppState.activeModel" :model="AppState.activeModel" />
  </div>
</div>
</template>


<style lang="scss" scoped>

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1em;
}

.side-window {
  width: 0px;
  transition: all .2s ease;

  &.open {
    width: 800px;
    border-left: 1px solid var(--bs-primary);
  }
}
</style>
