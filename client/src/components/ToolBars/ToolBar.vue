<script setup lang="ts">

defineProps({
  position: Array<string>
})

</script>


<template>
  <section class="toolbar-wrapper m-4" :class="[...position]">
      <slot>

      </slot>
  </section>
</template>


<style lang="scss" scoped>
.toolbar-wrapper{
  position: absolute;
  z-index: 1;
}

.top{
  top: 0;
}
.left{
  left:0;
}
.bottom{
  bottom:0;
}
.right{
  bottom:0;
}

.toolbar{

}
</style>