<script setup lang="ts">
import { Author } from '@/models/Author';
import { AppState } from '@/AppState';
import { computed } from 'vue';

const props = defineProps({
  author: { type: Author }
})

const authorModels = computed(()=> AppState.models.filter(m => m.author?._id ==  props.author._id))

function clearActive() {
  AppState.activeAuthor = null
}
</script>


<template>
<div class="p-2">
  <section class="d-flex justify-content-between">
    <button v-tooltip="'Close'" @click="clearActive">
      <i class="bi bi-x fs-4"></i>
    </button>
  </section>

  <section class="p-2">
    <div class="d-flex align-items-center gap-3 mb-3">
      <img :src="author.image" class="author-avatar rounded-3 border" :alt="`profile image of ${author.name}`">
      <div class="fs-2 fw-bold">{{ author.name }}</div>
    </div>
  </section>

  <section>
    <div v-for="model in authorModels">
      {{ model.name }}
    </div>
  </section>
</div>
</template>


<style lang="scss" scoped>
.author-avatar {
  height: 80px;
  width: 80px;
  object-fit: cover;
}
</style>
