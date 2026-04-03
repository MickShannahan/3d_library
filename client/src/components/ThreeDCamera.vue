<script setup  lang="ts">
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { extend, useLoop, useTres } from '@tresjs/core';
import * as THREE from 'three'
import { onMounted, shallowRef, toRaw, useTemplateRef } from 'vue';
import { nextTick } from 'vue';
import { cameraState } from '@/utils/CameraState';
import { getMeshesCenter, getModelZoom, lerp, rotate } from '@/utils/3Dtransforms';
import { cropSquareFromCanvas } from '@/utils/CanvasUtils';
import { logger } from '@/utils/Logger';
import { Model } from '@/models/Model';
import { PartMesh } from '@/models/PartMesh';
import { MeshImage } from '@/models/MeshImage';
import { meshService } from '@/services/MeshService';


const {camera, renderer} = useTres()
const orbitControls = useTemplateRef<OrbitControls>('orbit-controls')
const { onRender } = useLoop()

const showGrid = shallowRef(true)
const showAxes = shallowRef(true)
const targetPosition = shallowRef(new THREE.Vector3(10, 10, 10))
const targetLookAt = shallowRef(new THREE.Vector3(0, 0, 0))
const lerpCamera = shallowRef(true)

onRender(({ delta }) => {
  if (!camera.value || !orbitControls.value || cameraState.isPanning || !lerpCamera.value) return
  const speed = 10 * delta
  const cam = camera.value
  const rawControls = toRaw(orbitControls.value)

    cam.position.set(
      lerp(cam.position.x, targetPosition.value.x, speed),
      lerp(cam.position.y, targetPosition.value.y, speed),
      lerp(cam.position.z, targetPosition.value.z, speed)
    )

    rawControls.target.set(
      lerp(rawControls.target.x, targetLookAt.value.x, speed),
      lerp(rawControls.target.y, targetLookAt.value.y, speed),
      lerp(rawControls.target.z, targetLookAt.value.z, speed)
  )

  rawControls.update()
})

function pointCamera(point: THREE.Vector3 | number[] = [0, 0, 0]) {
  const coords = point instanceof THREE.Vector3 ? point : new THREE.Vector3(...point)
  targetLookAt.value = coords
}

function positionCamera(position: THREE.Vector3 | number[]) {
  const coords = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)
  targetPosition.value = coords
}

async function snap360(focusModel: Model | PartMesh, shots: number = 8, hideOtherParts = false){
  meshService.clearSelectedMeshIds()
  showAxes.value = false
  showGrid.value = false
  lerpCamera.value = false

  if(hideOtherParts){
    meshService.hideAllMeshes()
    focusModel.visible = true
  }

  const focusCenter = getMeshesCenter(focusModel)

  const zoomDistance = getModelZoom(focusModel, camera)

  const rawControls = toRaw(orbitControls.value)
  const capturedImages = []

  rawControls.target.copy(focusCenter)
  camera.value.position.set(focusCenter.x, focusCenter.y + 2, focusCenter.z + zoomDistance)
  rawControls.update()
  await new Promise(res => setTimeout(res, 50))  

  const angles = []
  for(let i = 0; i < 360; i+= 360/shots){
    angles.push(i)
  }
  for(const deg of angles){
    const angle = rotate(deg)
    camera.value.position.set(
      focusCenter.x + zoomDistance * Math.sin(angle),
      focusCenter.y + 2,
      focusCenter.z + zoomDistance * Math.cos(angle)
    )
    rawControls.target.copy(focusCenter)
    rawControls.update()
    await new Promise(res => requestAnimationFrame(res))
    const imageData = cropSquareFromCanvas(renderer.domElement)
    capturedImages.push(new MeshImage({
      data: imageData,
      angle: Math.round(deg),
      modelName: focusModel.name,
      type: 'base64'
    }))
  }
  focusModel.images = capturedImages

   showAxes.value = true
  showGrid.value = true
  lerpCamera.value = true
  if(hideOtherParts) meshService.showAllMeshes()
}

defineExpose({
  pointCamera,
  positionCamera,
  snap360
})

onMounted( async ()=>{
  await nextTick()
  const rawControls = toRaw(orbitControls.value)
  rawControls.addEventListener('start', () => cameraState.isPanning = true)
  rawControls.addEventListener('end', () => {
    cameraState.isPanning = false
    targetPosition.value = camera.value.position.clone()
    targetLookAt.value = rawControls.target.clone()
  })
  cameraState.cameraRef = { snap360, pointCamera, positionCamera }
})

extend({OrbitControls})

</script>


<template>
  <TresPerspectiveCamera :position="[10,10,10]" :look-at="[0,0,0]"/>
  <TresOrbitControls ref="orbit-controls" v-if="camera" :args="[camera, renderer?.domElement]" />

  <!-- <TresAmbientLight :intensity="1.4" :cast-shadows="true"/> -->
<!-- 
  <TresDirectionalLight :position="[12, 18, 10]" :intensity="3.5" color="#fff4e0" :cast-shadow="true"/>

  <TresDirectionalLight :position="[-10, 6, 8]" :intensity="1.2" color="#ddeeff" />

  <TresDirectionalLight :position="[-4, 12, -14]" :intensity="10.5" color="pink" /> -->

  <TresGridHelper v-if="showGrid"/>
  <TresAxesHelper v-if="showAxes"/>
</template>


<style lang="scss" scoped>

</style>