<script setup lang="ts">
import { AppState } from '@/AppState';
import { logger } from '@/utils/Logger';
import { sortedArray } from 'three/src/animation/AnimationUtils.js';
import { computed, reactive } from 'vue';

const model = defineModel<string>({ default: '' })
const emit = defineEmits(['sorted'])

const sortButtons = reactive({
  name: true,
  date: true,
  popular: true
})

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
  model.value = tag
}

function sort(by, value){
  sortButtons[by] = !sortButtons[by]
  emit('sorted', by, value)
}

function tagColor(number){
const stops = [
    { threshold: 0, r: 128, g: 128, b: 255 },   // normal-base (blue)
    { threshold: 25, r: 128, g: 212, b: 255 },  // normal-z (cyan)
    { threshold: 35, r: 128, g: 255, b: 154 },  // normal-y (green)
    { threshold: 50, r: 255, g: 128, b: 128 }   // normal-x (red)
  ]

  let lower = stops[0]
  let upper = stops[stops.length - 1]
  
  for (let i = 0; i < stops.length - 1; i++) {
    if (number >= stops[i].threshold && number <= stops[i + 1].threshold) {
      lower = stops[i]
      upper = stops[i + 1]
      break
    }
  }

  const range = upper.threshold - lower.threshold
  const position = Math.max(0, Math.min(1, (number - lower.threshold) / range))

  const r = Math.round(lower.r + (upper.r - lower.r) * position)
  const g = Math.round(lower.g + (upper.g - lower.g) * position)
  const b = Math.round(lower.b + (upper.b - lower.b) * position)

  const opacity = Math.min(number * 0.15, 1)
  return `${r}, ${g}, ${b}, ${opacity}`
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
    <div class="col-md-9 d-flex flex-wrap gap-1">
      <span v-for="tag in tags" role="button" class="btn btn-sm badge  d-inline-block" @click="selectTag(tag[0])" :style="`background: rgba(${tagColor(tag[1])})`" v-tooltip="tag[1]">{{ tag[0] }}</span>
    </div>
  </section>
  


  <section class="d-flex justify-content-between mt-3">
    <div>
      <slot name="buttons">
        <button class="btn"><i class="bi bi-grid"></i> </button>
        <button class="btn"><i class="bi bi-list"></i> </button>
      </slot>
    </div>

    <section>
      <slot></slot>
    </section>

    <div>
      <button v-if="sortButtons.name" @click="sort('name', 1)" v-tooltip="'sort A-Z'" class="btn"><i class="bi bi-sort-alpha-down"></i> </button>
      <button v-else @click="sort('name', -1)" v-tooltip="'sort Z-A'" class="btn"><i class="bi bi-sort-alpha-up"></i> </button>
      <button v-if="sortButtons.date" @click="sort('date', 1)" v-tooltip="'sort Old-New'" class="btn"><i class="mdi mdi-sort-calendar-ascending"></i> </button>
      <button v-else @click="sort('date', -1)" v-tooltip="'sort New-Old'" class="btn"><i class="mdi mdi-sort-calendar-descending"></i> </button>
      <button v-if="sortButtons.popular" @click="sort('popular', 1)" v-tooltip="'sort Most-Least Ordered'" class="btn"><i class="bi bi-sort-numeric-down"></i> </button>
      <button v-else @click="sort('popular', -1)" v-tooltip="'sort Least-Most Ordered'" class="btn"><i class="bi bi-sort-numeric-up"></i> </button>
    </div>
  </section>
</section>
</template>
