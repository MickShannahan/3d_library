<script setup lang="ts">
import { Author } from '@/models/Author';
import { AppState } from '@/AppState';

const props = defineProps({
  author: Author
})

function setActive() {
  AppState.activeAuthor = props.author
}
</script>


<template>
<article class="author-card rounded-3 p-2 shadow" role="button" @click="setActive">
  <img class="author-avatar rounded-3" :src="author.image" height="64" width="64" :alt="`profile image of ${author.name}`">
  <div class="d-flex flex-column justify-content-center px-2">
    <h3 class="fs-6 mb-0">{{ author.name }}</h3>
  </div>
</article>
</template>


<style lang="scss" scoped>
.author-card {
  display: flex;
  align-items: center;
  border: 1px solid rgba(var(--bs-black-rgb), .1);
  background: rgba(var(--bs-black-rgb), .2);

  &:hover {
    filter: brightness(1.2) saturate(1.2);
    transition: all .2s ease;
    border-color: rgba(var(--bs-primary-rgb), .5);
  }
}

.author-avatar {
  object-fit: cover;
  flex-shrink: 0;
}
</style>
