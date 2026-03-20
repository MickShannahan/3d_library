<script setup>
import ModelWindow from '@/components/ModelWindow.vue';
</script>


<template>
  <div class="position-relative flex-grow-1 d-flex flex-column">
    <ModelWindow />
    <section class="floating-controls glass-pane p-3 border">
      <button class="btn btn-primary">Load Model <i class="mdi mdi-printer-3d"></i></button>
    </section>
  </div>
</template>


<style lang="scss" scoped>
.floating-controls {
  position: absolute;

}
</style>