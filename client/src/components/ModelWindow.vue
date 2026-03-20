<script setup>
import { TresCanvas } from '@tresjs/core';
import DModelCamera from './3DModelCamera.vue';


</script>


<template>
  <section class="model-viewer-window">
    <TresCanvas clear-color="#16161d" width="100%" height="100%">
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="1.5" />
      <TresAmbientLight />
      <DModelCamera />
    </TresCanvas>
  </section>
</template>


<style lang="scss" scoped>
.model-viewer-window {
  flex-grow: 1;
  width: 100%;
}
</style>