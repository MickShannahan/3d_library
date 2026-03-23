<script setup  lang="ts">
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { extend, useTres } from '@tresjs/core';
import * as THREE from 'three'
import { onMounted, ref, toRaw, useTemplateRef } from 'vue';
import { logger } from '@/utils/Logger';
import { nextTick } from 'vue';
import { cameraState } from '@/utils/CameraState';


const {camera, renderer} = useTres()
const cameraPosition = ref([10,10,10])
const cameraLookAt = ref([0,0,0])
const orbitControls = useTemplateRef<OrbitControls>('orbit-controls')
const resetControls = ref(false)

function pointCamera(point : number[] = [0,0,0]){
  camera.value.lookAt(new THREE.Vector3(...point))
  resetControls.value = true
  setTimeout(()=> resetControls.value = false, 50)
}

defineExpose({
  pointCamera
})

onMounted( async ()=>{
  await nextTick()
  const rawControls = toRaw(orbitControls.value)
  rawControls.addEventListener('start', ()=> cameraState.isPanning = true)
  rawControls.addEventListener('end', ()=> cameraState.isPanning = false)
})

extend({OrbitControls})

</script>


<template>
  <TresPerspectiveCamera :position="[10,10,10]" :look-at="[0,0,0]"/>
  <TresOrbitControls ref="orbit-controls" v-if="camera && !resetControls" :args="[camera, renderer?.domElement]"/>
  <TresAmbientLight :intensity="1.5" :cast-shadow="true"/>
  <TresDirectionalLight :intensity="1"/>
  <TresGridHelper/>
  <TresAxesHelper/>
</template>


<style lang="scss" scoped>

</style>