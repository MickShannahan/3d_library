<script setup lang="ts">
import { PartMesh } from '@/models/PartMesh';


defineProps({
  mesh: PartMesh,
  images: Array
})

</script>


<template>
  <div class="hover-area">
    <slot></slot>
    <div class="hover-preview gap-1">
      <img v-for="img in mesh?.images ?? images" :src="img?.data ?? img" class="preview-image border border-primary rounded-5 shadow">
    </div>
  </div>
</template>


<style lang="scss" scoped>

.hover-area{
  position: relative;
  overflow: visible;
}

.hover-preview{
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  bottom: 50%;
  right: 50%;
  display: flex;
  transform-origin: bottom right;
  z-index: 1;
}

.hover-area:hover .hover-preview{
  opacity: 1;
  transform: scale(.65);
  transition: all .1s .2s ease;
}

.preview-image{
  max-width: min(100dvw, 1200px);
}

.preview-image:last-child{
  border-bottom-right-radius: 0px !important;
}


</style>