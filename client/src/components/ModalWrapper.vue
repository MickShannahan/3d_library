<script setup lang="ts">

const {id} = defineProps({
  id: String
})

</script>


<template>
<Teleport to="body">
  <div class="modal fade" :id>
    <div class="modal-dialog modal-lg">
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