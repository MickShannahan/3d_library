<script setup lang="ts">
import { AppState } from '@/AppState';
import { STLMesh } from '@/models/STLMesh';
import { lerp } from '@/utils/3Dtransforms';
import { useLoop } from '@tresjs/core';
import { Euler, Vector3 } from 'three';
import { computed, markRaw, onMounted, shallowRef } from 'vue';

const { onRender } = useLoop()

const { mesh } = defineProps({
  mesh: STLMesh
})

const emit = defineEmits(['click'])

const localRotation = shallowRef(new Euler())
const localPosition = shallowRef(new Vector3())
const localScale = shallowRef(new Vector3(1, 1, 1))

onMounted(() => {
  mesh.targetRotation.copy(mesh.rotation)
  mesh.targetPosition.copy(mesh.position)
  mesh.targetScale.copy(mesh.scale)
  localRotation.value = mesh.rotation.clone()
  localPosition.value = mesh.position.clone()
  localScale.value = mesh.scale.clone()
  mesh.rotation.set(0, 0, 0)
  mesh.position.set(0, 0, 0)
  mesh.scale.set(1, 1, 1)
})

onRender(({ delta }) => {
  const speed = 20 * delta

  localRotation.value = new Euler(
    lerp(localRotation.value.x, mesh.targetRotation.x, speed),
    lerp(localRotation.value.y, mesh.targetRotation.y, speed),
    lerp(localRotation.value.z, mesh.targetRotation.z, speed)
  )

  localPosition.value = new Vector3(
    lerp(localPosition.value.x, mesh.targetPosition.x, speed),
    lerp(localPosition.value.y, mesh.targetPosition.y, speed),
    lerp(localPosition.value.z, mesh.targetPosition.z, speed)
  )

  localScale.value = new Vector3(
    lerp(localScale.value.x, mesh.targetScale.x, speed),
    lerp(localScale.value.y, mesh.targetScale.y, speed),
    lerp(localScale.value.z, mesh.targetScale.z, speed)
  )
})

function clickedMesh(ev){
  if(!mesh.visible) return
  emit('click', ev)
}

const selectedMeshIds = computed(() => AppState.selectedMeshIds)
</script>

<template>
  <TresGroup :rotation="localRotation" :position="localPosition" :scale="localScale">
    <primitive :object="markRaw(mesh)" @click="clickedMesh">
      <TresMeshGreyRainboxMaterial v-if="selectedMeshIds.includes(mesh.uuid)"/>
      <TresMeshBasicMaterial v-else-if="mesh.silhouette" color="black" :transparent="true" :opacity=".2"/>
      <TresMeshPurpleRainboxMaterial v-else />
    </primitive>
  </TresGroup>
</template>

<style lang="scss" scoped>

</style>
