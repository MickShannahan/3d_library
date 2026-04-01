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


const {camera, renderer} = useTres()
const orbitControls = useTemplateRef<OrbitControls>('orbit-controls')
const { onRender } = useLoop()

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

async function snap360(focusModel: Model | PartMesh, zoom: number = 15, shots: number = 8){
  lerpCamera.value = false
  const focusCenter = getMeshesCenter(focusModel)

  const zoomDistance = getModelZoom(focusModel, camera)

  const rawControls = toRaw(orbitControls.value)
  const capturedImages = []

  rawControls.target.copy(focusCenter)
  camera.value.position.set(focusCenter.x, focusCenter.y + 5, focusCenter.z + zoomDistance)
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
      focusCenter.y + 5,
      focusCenter.z + zoomDistance * Math.cos(angle)
    )
    rawControls.target.copy(focusCenter)
    rawControls.update()
    await new Promise(res => requestAnimationFrame(res))
    capturedImages.push(cropSquareFromCanvas(renderer.domElement))
  }
  focusModel.images = capturedImages

  lerpCamera.value = true
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

  <TresGridHelper/>
  <TresAxesHelper/>
</template>


<style lang="scss" scoped>

</style>