<script setup lang="ts">
import { AppState } from '@/AppState';
import { logger } from '@/utils/Logger';
import { computed } from 'vue';

const model = defineModel<string>({ default: '' })
const tags = computed(()=> {
  let allTags = AppState.models.flatMap(m => m.tags)
  let counts = {}
  allTags.forEach(t => counts[t] ? counts[t]++ : counts[t] = 1)
  let display = []
  for(let t in counts){
    display.push([t, counts[t]])
  }
  return display.sort((a,b)=> b[1] - a[1]) 
})

function selectTag(tag){
  model.value += tag
}

</script>


<template>
<section class="mt-1 mb-4">
  <form @submit.prevent class="row justify-content-center">
    <div class="col-md-8">
      <div class="input-group">
        <input v-model="model" type="text" class="form-control" placeholder="search..." >
        <label class="input-group-text" v-tooltip="'use + to include more results'"><i class="bi bi-search"></i></label>
      </div>
    </div>
  </form>
  <section class="row justify-content-center my-2">
    <div class="col-md-9">
      <span v-for="tag in tags" role="button" class="btn btn-sm badge  me-1 d-inline-block" @click="selectTag(tag[0])" :style="`background: rgba(var(--bs-normal-rgb), ${tag[1]*.15})`" v-tooltip="tag[1]">{{ tag[0] }}</span>
    </div>
  </section>
  


  <section class="d-flex justify-content-between mt-3">
    <div>
      <button class="btn"><i class="bi bi-grid"></i> </button>
      <button class="btn"><i class="bi bi-list"></i> </button>
    </div>

    <section>
      <slot></slot>
    </section>

    <div>
      <button class="btn"><i class="bi bi-sort-alpha-down"></i> </button>
      <button class="btn"><i class="bi bi-sort-alpha-up"></i> </button>
    </div>
  </section>
</section>
</template>
