<script setup lang="ts">
import { Camera, Group } from 'three';
import CamComponent from '../ThreeDCamera.vue'
import ThreeDCamera from '../ThreeDCamera.vue';
import { AppState } from '@/AppState';
import { getModelCenter } from '@/utils/3Dtransforms';
import { logger } from '@/utils/Logger';
import { markRaw } from 'vue';
import { meshService } from '@/services/MeshService';

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

function snap360Shots(){
  camera.snap360(AppState.meshGroups[0], 15, 32)
}

async function snap360AllParts(){
  let meshes = AppState.meshGroups[0].meshes
  for(const mesh of meshes){
    meshService.hideAllMeshes()
    mesh.visible = true
    await camera.snap360(mesh, 15, 3)
  }
  meshService.showAllMeshes()
}


</script>


<template>
<section class="d-flex gap-1">
  <button @click="pointTowardModel"><i class="mdi mdi-image-filter-center-focus"></i></button>
  <button @click="resetCamera"><i class="mdi mdi-camera-control"></i></button>
  <button @click="faceCameraToAxis([0,0,15])"><i class="bi bi-front text-red"></i>x</button>
  <button @click="faceCameraToAxis([15,0,0])"><i class="mdi bi-front text-green"></i>y</button>
  <button @click="faceCameraToAxis([0,15,0])"><i class="mdi bi-front text-cyan"></i>z</button>
  <span class="spacer"></span>
  <button @click="snap360Shots"><i class="mdi mdi-rotate-3d"></i></button>
  <button @click="snap360AllParts"><i class="mdi mdi-rotate-360"></i> <i class="bi bi-boxes"></i></button>
</section>
</template>


<style lang="scss" scoped>
.spacer{
  border-right: 1px solid rgba(var(--bs-light-rgb),.1)
}
</style>