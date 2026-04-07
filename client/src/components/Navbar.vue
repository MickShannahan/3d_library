<script setup lang="ts">

</script>


<template>
  <!-- Desktop Nav -->
  <nav class="navbar bg-black border-bottom border-primary shadow p-2">
    <div class="d-flex">


      <section class="d-flex  align-items-center">
        <RouterLink :to="{name: 'home'}" class="border-0 d-flex align-items-center no-underline text-light me-5">
          <img class="site-logo" src="/SlateNormal.gif" alt="slate 3d logo">
          <div class="fs-3 fw-bold ms-2 ">Normal Library</div>
        </RouterLink>
        
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

.router-link{
  color: var(--bs-secondary);
  font-weight: bold;
  &::after{
    opacity: 0;
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0px;
    width: 100%;
    height: 3px;
    border-radius: 5px;
    background: linear-gradient(135deg, var(--bs-normal-x) 0%, var(--bs-normal) 40%, var(--bs-normal-z) 70%, var(--bs-normal-y) 100%);
  }
}

.router-link-active{
  color: var(--bs-light);
  position: relative;
  &::after{
    opacity: 1;
    transition: opacity .2s ease;
  }
}


a{
  text-decoration: none;
}

.site-logo{
  height: 60px;
}
</style>