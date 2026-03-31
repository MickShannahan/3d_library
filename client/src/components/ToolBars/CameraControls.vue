<script setup lang="ts">
import { Camera, Group } from 'three';
import CamComponent from '../ThreeDCamera.vue'
import ThreeDCamera from '../ThreeDCamera.vue';
import { AppState } from '@/AppState';
import { getModelCenter } from '@/utils/3Dtransforms';
import { logger } from '@/utils/Logger';
import { markRaw } from 'vue';

const {camera} = defineProps({
  camera: ThreeDCamera
})

let doubleClick = false

function resetCamera(){
  camera.pointCamera([0,0,0])
}

function pointTowardModel(){
  const modelCenter = getModelCenter(...AppState.meshGroups.flatMap(g => g.meshes))
  camera.pointCamera(modelCenter)
}

function faceCameraToAxis(axisPosition: number[]){
  const invert = doubleClick ? -1 : 1
  doubleClick = true
  setTimeout(()=> doubleClick = false, 200)
  const modelCenter = getModelCenter(...AppState.meshGroups.flatMap(g => g.meshes))
  const adjustedPosition = [
    axisPosition[0] ? axisPosition[0] * invert: modelCenter.x ,
    axisPosition[1] ? axisPosition[1] * invert: modelCenter.y ,
    axisPosition[2] ? axisPosition[2] * invert: modelCenter.z ,
  ]
  camera.positionCamera(adjustedPosition)
  pointTowardModel()
} 


</script>


<template>
<section class="d-flex gap-1">
  <button @click="pointTowardModel"><i class="mdi mdi-image-filter-center-focus"></i></button>
  <button @click="resetCamera"><i class="mdi mdi-camera-control"></i></button>
  <button @click="faceCameraToAxis([0,0,15])"><i class="bi bi-front text-red"></i>x</button>
  <button @click="faceCameraToAxis([15,0,0])"><i class="mdi bi-front text-green"></i>y</button>
  <button @click="faceCameraToAxis([0,15,0])"><i class="mdi bi-front text-cyan"></i>z</button>
</section>
</template>


<style lang="scss" scoped>

</style>