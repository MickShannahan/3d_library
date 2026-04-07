<script setup lang="ts">
import { AppState } from '@/AppState';

const model = defineModel<string>({ default: '' })

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
      <span v-for="tag in AppState.tags" role="button" class="btn btn-sm badge bg-normal-shadow me-1 d-inline-block" @click="selectTag(tag)">{{ tag }}</span>
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
