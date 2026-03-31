<script setup lang="ts">



</script>


<template>

  <section>
    <div class="group-header px-2 ">Group</div>
    <section class="group-files gap-1 p-2">
      <slot></slot>
    </section>
  </section>

</template>


<style lang="scss" scoped>
.group-header{
  background: var(--bs-primary);
}

.group-files{
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--bs-primary);
}
</style>