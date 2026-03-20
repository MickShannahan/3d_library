<script setup  lang="ts">
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { extend, useTres } from '@tresjs/core';

extend({OrbitControls})
const {camera, renderer} = useTres()

</script>


<template>
  <TresPerspectiveCamera :position="[10,10,10]" :look-at="[0,0,0]"/>
  <TresOrbitControls v-if="camera" :args="[camera, renderer?.domElement]"/>
  <TresGridHelper/>
  <TresAxesHelper/>
</template>


<style lang="scss" scoped>

</style>