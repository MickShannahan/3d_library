<script setup lang="ts">
import { useTres } from '@tresjs/core'
import { onMounted, onUnmounted, toRaw } from 'vue'
import * as THREE from 'three'
import { AppState } from '@/AppState'
import { meshService } from '@/services/MeshService'
import { cameraState } from '@/utils/CameraState'

const { camera, renderer } = useTres()

const meshRaycast = THREE.Mesh.prototype.raycast

function handleClick(event: MouseEvent) {
  if (cameraState.isPanning) return

  const canvas = renderer.domElement
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

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

  if (intersects.length > 0) {
    meshService.selectMeshId(intersects[0].object.uuid, !event.shiftKey)
  } else {
    meshService.clearSelectedMeshIds()
  }
}

onMounted(() => renderer.domElement.addEventListener('click', handleClick))
onUnmounted(() => renderer.domElement.removeEventListener('click', handleClick))
</script>

<template></template>
