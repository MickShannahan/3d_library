<script setup lang="ts">
import { isDev } from '@/env';
import { useRoute } from 'vue-router';
const route = useRoute()


</script>


<template>
  <!-- Desktop Nav -->
  <nav class="navbar bg-black border-bottom border-primary shadow p-2" v-if="route.name != 'home'">
    <div class="d-flex">


      <section class="d-flex  align-items-center">
        <div class="d-flex align-items-center no-underline text-light me-5">
          <RouterLink :to="{name: 'home'}" class="border-0 ">
            <img class="site-logo" src="/NormalLibraryLogo.svg" alt="slate 3d logo">
          </RouterLink>
          <!-- <img class="site-logo" src="/SlateNormal.gif" alt="slate 3d logo"> -->
          <h1 class="m-0">
            <div class="fs-3 fw-bold ms-2 ">Normal Library</div>
          </h1>
        </div>
          <!-- <span class="badge bg-warning" v-if="isDev">dev</span> -->
        
        <div>
          <div class="d-flex gap-4 mt-2">
            <RouterLink :to="{name: 'create'}" class="router-link">
              <i class="mdi mdi-creation text-normal-grad"></i> Create
            </RouterLink>
            <RouterLink :to="{name: 'browse'}" class="router-link">
              <i class="mdi mdi-bookmark-box-multiple text-normal-grad"></i> Browse
            </RouterLink>
            <RouterLink :to="{name: 'orders'}" class="router-link">
              <i class="mdi mdi-view-list text-normal-grad"></i> Orders
            </RouterLink>
          </div>
        </div>
      </section>

    </div>
  </nav>

  <!-- Mobile Nav -->
  <nav>

  </nav>
</template>


<style lang="scss" scoped>



.site-logo{
  height: 40px;
  padding: 5px;
}
</style>