<script setup lang="ts">

</script>

<template>
  <section class="home-split flex-grow-1 ">

    <section>

    </section>

    <section class="bg-black d-flex-col justify-content-center align-items-center">
      <div class="d-flex-col gap-5 fs-2">
        <RouterLink :to="{name: 'create'}">
          Create
        </RouterLink>
        <RouterLink :to="{name: 'browse'}">
          Browse
        </RouterLink>
        <RouterLink :to="{name: 'orders'}">
          Order
        </RouterLink>
      </div>
    </section>

  </section>
</template>

<style lang="scss">
.home-split{
  display: grid;
  grid-template-columns: minmax(300px, 1fr) 1fr;
  background: url(../assets/img/modelPreview.png);
  background-repeat: no-repeat;
  background-position: 20% -40%
}

</style>
