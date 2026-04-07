<script setup lang="ts">

const { id, size } = defineProps({
  id: String,
  size: { type: String, default: '' }
})

</script>


<template>
<Teleport to="body">
  <div class="modal fade" :id>
    <div class="modal-dialog" :class="size ? `modal-${size}` : 'modal-lg'">
      <div class="modal-content">
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>


<style lang="scss" scoped>

</style>