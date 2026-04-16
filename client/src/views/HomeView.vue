<script setup lang="ts">

</script>

<template>
  <section class="home-split flex-grow-1 ">

    <section>

    </section>

    <section class="bg-black d-flex-col justify-content-center align-items-center">
      <div class="d-flex-col align-items-center gap-4 fs-2">
        <div >
          <img class="logo" src="/NormalLibraryLogo.svg" alt="">
        </div>
        <h1 class="mb-5">
          Normal_Library
        </h1>
        <RouterLink :to="{name: 'create'}" class="text-white">
          <i class="bi bi-box"></i> Create
        </RouterLink>
        <RouterLink :to="{name: 'browse'}" class="text-white">
          <i class="mdi mdi-magnify"></i> Browse
        </RouterLink>
        <RouterLink :to="{name: 'orders'}" class="text-white">
          <i class="mdi mdi-list-box-outline"></i> Order
        </RouterLink>
      </div>
    </section>

  </section>
</template>

<style lang="scss">
.logo{
  width: 300px;
}

.home-split{
  display: grid;
  grid-template-columns: minmax(300px, 1fr) 1fr;
  background-color: black;
  background-image: url(../assets/img/background1.png), linear-gradient(15deg, #16161d, black);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: left bottom;
}

</style>
