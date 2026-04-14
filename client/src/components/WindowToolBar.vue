<script setup>

</script>


<template>
<section class="window-toolbar">
  <div class="left">
    <slot name="left">

    </slot>
  </div>  


  <div class="center">
    <slot name="center">

    </slot>
  </div>

  <div class="right">
    <slot name="right">

    </slot>
  </div>


  <div class="bottom-left">
    <slot name="bottom-left">

    </slot>
  </div>

  <div class="bottom-center">
  <slot name="bottom-center">

    </slot>
  </div>

  <div class="bottom-right">
  <slot name="bottom-right">

    </slot>
  </div>



</section>
</template>


<style lang="scss" scoped>

.window-toolbar{
  --sidebar: calc(300px + 4dvw);
  position: absolute;
  flex-grow: 1;
  inset: 0;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: var(--sidebar) 4fr var(--sidebar);
  grid-template-rows: 1fr 64px;
  pointer-events: none;
}

div{
  display: flex;
  position: relative;
  z-index: 10;
}

div > *{
  pointer-events: all;
}

div[class*="center"]{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

div.left,
div.right{
  flex-direction: column;
}


</style>