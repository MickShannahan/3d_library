<script setup lang="ts">
import { useTres } from '@tresjs/core'
import { onMounted, onUnmounted, toRaw } from 'vue'
import * as THREE from 'three'
import { AppState } from '@/AppState'
import { meshService } from '@/services/MeshService'
import { cameraState } from '@/utils/CameraState'
import { toolState } from '@/utils/ToolState'
import { PartMesh } from '@/models/PartMesh'
import { logger } from '@/utils/Logger'

const { camera, renderer } = useTres()

const meshRaycast = THREE.Mesh.prototype.raycast

// Track mousedown position to detect panning vs. genuine clicks.
// If the mouse moves > 5px from mousedown, it's a pan (ignore the click).
let mouseDownClientX = 0
let mouseDownClientY = 0
const PAN_THRESHOLD_PX = 5


function getIntersects(x,y){
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera.value as THREE.PerspectiveCamera)

  const intersects: THREE.Intersection[] = []
  AppState.meshGroups.forEach(group => {
    group.meshes.forEach(mesh => {
      if (!mesh.visible) return
      meshRaycast.call(toRaw(mesh), raycaster, intersects)
    })
  })
  intersects.sort((a, b) => a.distance - b.distance)
  return intersects
}


function handleClick(event: MouseEvent) {
  // Reject clicks that were actually pans (mousedown moved > threshold)
  const dx = event.clientX - mouseDownClientX
  const dy = event.clientY - mouseDownClientY
  if (Math.sqrt(dx * dx + dy * dy) > PAN_THRESHOLD_PX) return

  if (cameraState.isPanning) return
  if (toolState.mode !== 'none') return

  const canvas = renderer.domElement
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  const intersects = getIntersects(x,y)
  if(intersects.length <= 0) return

  const object = intersects[0].object as PartMesh
  meshService.selectMeshId(object._id, !event.shiftKey)
}

function handleMouseDown(event: MouseEvent) {
  mouseDownClientX = event.clientX
  mouseDownClientY = event.clientY
}

// function handleRightClick(){

//   if(cameraState.isPanning) return
//   if (toolState.mode !== 'none') return
//   meshService.clearSelectedMeshIds()
// }

onMounted(() => {
  renderer.domElement.addEventListener('mousedown', handleMouseDown)
  renderer.domElement.addEventListener('click', handleClick)
})
onUnmounted(() => {
  renderer.domElement.removeEventListener('mousedown', handleMouseDown)
  renderer.domElement.removeEventListener('click', handleClick)
})
</script>

<template></template>
