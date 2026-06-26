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
  text: '',
  sortBy: 'date',
  sort: -1
})

const gridStyle = ref('regular')

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
}).sort((a,b)=> {
  if(filterBy.sortBy == 'name') return a.name.localeCompare(b.name) * filterBy.sort
  if(filterBy.sortBy == 'date') return (a.updatedAt.getTime() - b.updatedAt.getTime()) * filterBy.sort
  if(filterBy.sortBy == 'popular') return (a.orderCount - b.orderCount) * filterBy.sort
  return 0
})
)


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
    <BrowseSearchBar v-model="filterBy.text" @sorted="(by, value)=>{filterBy.sortBy = by; filterBy.sort = value;}">
      <template #buttons>
        <button class="btn" @click="gridStyle = 'regular'"><i class="bi bi-grid-3x3-gap"></i> </button>
        <button class="btn" @click="gridStyle = 'large'"><i class="bi bi-grid"></i> </button>
        <button class="btn" @click="gridStyle = 'list'"><i class="bi bi-list"></i> </button>
      </template>
      <!-- <button class="btn">create model<i class="bi bi-plus"></i></button> -->
    </BrowseSearchBar>
    <section class="cards-grid" :class="[gridStyle]">
      <ModelListCard v-for="model in models" :model :key="model._id" :type="gridStyle == 'list' ? 'list' : 'card'" />
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

.cards-grid.large{
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
}
.cards-grid.list{
  margin: auto;
  max-width: calc(120ch + 10dvw);
  grid-auto-rows: 100px;
  grid-template-columns: 1fr;
}

</style>
