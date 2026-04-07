<script setup>

</script>


<template>
  <div class="d-flex justify-content-around p-2 p-md-4 pb-0">
    <RouterLink :to="{name: 'browse-models'}" class="router-link">
      <h2><i class="bi bi-box"></i> Models</h2>
    </RouterLink>
    <RouterLink :to="{name: 'browse-authors'}" class="router-link">
      <h2><i class="bi bi-person"></i> Authors</h2>
    </RouterLink>
  </div>
</template>


<style lang="scss" scoped>

</style>