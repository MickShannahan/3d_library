<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';

const props = defineProps({
  meshes: {type: Array<STLMesh>, default: ()=> []}
})
const tresGroupElm = useTemplateRef('tres-group-elm')
const groupScale = ref([1,1,1])
const targetScale = ref(10)

watch(()=> props.meshes, async  ()=>{
  await nextTick()
  const box = new THREE.Box3().setFromObject(tresGroupElm.value)
  const size = box.getSize(new THREE.Vector3())
  logger.log(size)
  const maxDimension = Math.max(size.x, size.y, size.z)
  const scaledFactor = targetScale.value / maxDimension
  logger.log(scaledFactor)
  // groupScale.value = new THREE.Vector3(scaledFactor, scaledFactor, scaledFactor)
})

</script>


<template>

  <TresCanvas clear-color="#16161d">
    <ThreeDCamera/>

    <TresGroup ref="tres-group-elm" :scale="{x: groupScale[0], y:groupScale[1], z: groupScale[2]}">
      <primitive v-for="mesh in meshes" :object="mesh" :key="mesh.uuid">
        <TresMeshNormalMaterial/>
      </primitive>
    </TresGroup>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>