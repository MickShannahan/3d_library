<script setup lang="ts">
import { ref } from 'vue';

defineProps<{src: string, height: number, width: number, alt: string}>()
const loaded = ref(false)
</script>


<template>

<div class="img-loader" :class="{loaded}">
  <img @load="loaded=true" loading="lazy" :src :height :width :alt="alt? alt : 'Preview of Model'">
</div>

</template>


<style lang="scss" scoped>

.img-loader{
  position: relative;
  background-color: var(--bs-dark);
  
  img{
    opacity: 0;
    width: 100%;
    height: auto;
    border-radius: inherit;
    filter: brightness(0);
  }
  &.loaded img{
    transition: opacity .2s ease, filter 1.5s ease;
    filter: brightness(1);
    opacity: 1;
  }
}

img::before{
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

</style>