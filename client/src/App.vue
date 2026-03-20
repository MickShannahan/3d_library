<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="bg-black border-bottom border-indigo p-2">
    <div class="d-flex align-items-center">
      <img class="site-logo" src="/Slate.png" alt="slate 3d logo">
      <div class="fs-3 fw-bold ms-2">Normal Library</div>
    </div>
  </nav>

  <main>
    <RouterView/>
  </main>
</template>

<style scoped>
.site-logo{
  height: 60px;
}
</style>
