<script setup  lang="ts">
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { extend, useLoop, useTres } from '@tresjs/core';
import * as THREE from 'three'
import { onMounted, ref, shallowRef, toRaw, useTemplateRef } from 'vue';
import { nextTick } from 'vue';
import { cameraState } from '@/utils/CameraState';
import { lerp } from '@/utils/3Dtransforms';


const {camera, renderer} = useTres()
const orbitControls = useTemplateRef<OrbitControls>('orbit-controls')
const { onRender } = useLoop()

const targetPosition = shallowRef(new THREE.Vector3(10, 10, 10))
const targetLookAt = shallowRef(new THREE.Vector3(0, 0, 0))

onRender(({ delta }) => {
  if (!camera.value || !orbitControls.value || cameraState.isPanning) return
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

defineExpose({
  pointCamera,
  positionCamera
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
  <TresAmbientLight :intensity="1.5" :cast-shadow="true"/>
  <TresDirectionalLight :intensity="1"/>
  <TresGridHelper/>
  <TresAxesHelper/>
</template>


<style lang="scss" scoped>

</style>