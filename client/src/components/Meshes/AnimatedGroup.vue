<script setup lang="ts">
import { MeshGroup } from '@/models/MeshGroup';
import { meshService } from '@/services/MeshService';
import { lerp } from '@/utils/3Dtransforms';
import { logger } from '@/utils/Logger';
import { useLoop } from '@tresjs/core';
import { Euler, Vector3 } from 'three';
import { onMounted, shallowRef } from 'vue';
import AnimatedMesh from './AnimatedMesh.vue';

const {onRender} = useLoop()

const {meshGroup} = defineProps({
  meshGroup: MeshGroup
})
const localRotation = shallowRef(new Euler())
const localPosition = shallowRef(new Vector3())
const localScale = shallowRef(new Vector3())

onMounted(()=>{
  localRotation.value = meshGroup.rotation.clone()
  localPosition.value = meshGroup.position.clone()
  localScale.value = meshGroup.scale.clone()
})

onRender(({delta})=>{
  const speed = 10 * delta

  localRotation.value = new Euler(
    lerp(localRotation.value.x, meshGroup.rotation.x, speed),
    lerp(localRotation.value.y, meshGroup.rotation.y, speed),
    lerp(localRotation.value.z, meshGroup.rotation.z, speed)
  )

  localPosition.value = new Vector3(
    lerp(localPosition.value.x, meshGroup.position.x, speed),
    lerp(localPosition.value.y, meshGroup.position.y, speed),
    lerp(localPosition.value.z, meshGroup.position.z, speed)
  )

  localScale.value = new Vector3(
    lerp(localScale.value.x, meshGroup.scale.x, speed),
    lerp(localScale.value.y, meshGroup.scale.y, speed),
    lerp(localScale.value.z, meshGroup.scale.z, speed)
  )
})


function handleClickMesh(event){
  const clickedMesh = event.object
  const heldShift = event.shiftKey
  meshService.selectMeshId(clickedMesh.uuid, !heldShift)
  logger.log(heldShift)
}


</script>


<template>
      <TresGroup :rotation="localRotation" :scale="localScale" :position="localPosition">
        <AnimatedMesh v-for="mesh in meshGroup.meshes" :mesh="mesh" :key="mesh.uuid" @click="handleClickMesh"/>
      </TresGroup>
</template>


<style lang="scss" scoped>

</style>