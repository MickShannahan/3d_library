<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';
import { nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';

const props = defineProps({
  meshes: {type: Array<STLMesh>, default: ()=> []}
})
// const tresGroupElm = useTemplateRef('tres-group-elm')
const groupScale = ref([1,1,1])
const groupPosition = ref([0,0,0])
const targetScale = ref(10)

const activeMesh = shallowRef(null)

watch(()=> props.meshes, async  ()=>{
  const group = new THREE.Group()
  group.add(...props.meshes)

  const box = new THREE.Box3().setFromObject(group)
  const boxSize = box.getSize(new THREE.Vector3())
  const maxBoxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z)
  const scaleFactor = targetScale.value / maxBoxDimension
  groupScale.value = [scaleFactor, scaleFactor, scaleFactor]
  group.scale.set(scaleFactor, scaleFactor, scaleFactor)
  box.setFromObject(group)

  const center = box.getCenter(new THREE.Vector3())
  const bottomOffset = -box.min.y
  groupPosition.value = [-center.x, bottomOffset, -center.z]

})


function clickTest(clickedThing){
  const meshClicked : STLMesh = clickedThing.object
  activeMesh.value = meshClicked
  logger.log(meshClicked.name)
}

const BackSide = THREE.BackSide

</script>


<template>

  <TresCanvas clear-color="#16161d">
    <ThreeDCamera/>

      <primitive v-for="mesh in meshes" :object="mesh" :key="mesh.uuid" :scale="groupScale" :position="groupPosition" @click="clickTest">
        <TresMeshNormalMaterial :transparent="true" />
        <TresMesh v-if="mesh == activeMesh" :args="[mesh.geometry]" :scale="[1.01, 1.01, 1.01]">
          <TresMeshNormalMaterial :side="BackSide"/>
        </TresMesh>
      </primitive>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>