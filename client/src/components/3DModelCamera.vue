<script setup>
import { logger } from '@/utils/Logger';
import { OrbitControls } from '@tresjs/cientos'
import { ref } from 'vue';
import STLModel from './STLModel.vue';
import helmetPath from '../assets/3d_files/H1.stl'

const opacity = ref(1)

function testClick() {
  logger.log('click tested', opacity.value)
  opacity.value -= .1
  if (opacity.value <= 0) opacity.value = 1
}
</script>


<template>
  <TresPerspectiveCamera :position="[7, 7, 7]" :look-at="[0, 0, 0]" />
  <OrbitControls />


  <STLModel :src="helmetPath" />

  <TresGridHelper />
  <TresAxesHelper />
</template>


<style lang="scss" scoped></style>