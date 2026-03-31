<script setup lang="ts">

</script>


<template>
  <section id="bottom-toolbar" class="p-4">
    <div class="glass-pane border p-2 d-flex gap-2 rounded rounded-3">
      <slot>
        
      </slot>
    </div>
  </section>

</template>


<style lang="scss" scoped>
#bottom-toolbar{
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
}
</style>