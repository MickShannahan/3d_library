<script setup>
import { OrbitControls } from '@tresjs/cientos'
</script>


<template>
  <TresPerspectiveCamera :position="[15, 15, 35]" :look-at="[0, 0, 0]" />
  <OrbitControls />


  <TresGridHelper />
  <TresAxesHelper />
</template>


<style lang="scss" scoped></style>