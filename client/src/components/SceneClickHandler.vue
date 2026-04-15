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
  if (cameraState.isPanning) return
  // Let SceneToolHandler own clicks when any tool is active
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

function handleRightClick(){
  // Let SceneToolHandler own right-clicks when any tool is active (e.g. cancel grab)
  if (toolState.mode !== 'none') return
  meshService.clearSelectedMeshIds()
}

onMounted(() => {
  renderer.domElement.addEventListener('click', handleClick)
  renderer.domElement.addEventListener('contextmenu', handleRightClick)
})
onUnmounted(() => {
  renderer.domElement.removeEventListener('click', handleClick)
  renderer.domElement.removeEventListener('contextmenu', handleRightClick)
})
</script>

<template></template>
