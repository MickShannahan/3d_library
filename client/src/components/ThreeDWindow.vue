<script setup lang="ts">
import { TresCanvas, extend } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';
import { ref, shallowRef, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';
import { MeshGreyRainboxMaterial, MeshNormalHighlightMaterial, MeshPurpleRainboxMaterial } from '@/utils/Materials';
import { rotate } from '@/utils/3Dtransforms';

const cameraElm = useTemplateRef('camera')

const props = defineProps({
  meshes: {type: Array<STLMesh>, default: ()=> []}
})
const groupScale = ref([1,1,1])
const groupPosition = ref([0,0,0])
const targetScale = ref(10)

const activeMesh = shallowRef(null)

watch(()=> props.meshes, async  ()=>{
  logger.log('👁️')
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

}, {immediate: true})


function clickTest(clickedThing){
  const meshClicked : STLMesh = clickedThing.object
  activeMesh.value = meshClicked
  logger.log(meshClicked.name)
}

function clickOut(){
  logger.log('🔳')
  activeMesh.value = null
}

function resetCamera(){
  cameraElm.value.pointCamera()
}


extend({MeshGreyRainboxMaterial, MeshPurpleRainboxMaterial})
</script>


<template>
  <div class="position-fixed top-0 right-0">
    Howdy
    <button @click="resetCamera" class="btn btn-primary">👁️</button>
  </div>
  <TresCanvas clear-color="#16161d" @pointermissed="clickOut" >
    <ThreeDCamera  ref="camera"/>
    <!-- Full World Rotate -->
      <TresGroup :rotation="[rotate(-90), 0,0]">

        
        <primitive v-for="mesh in meshes" :object="mesh" :key="mesh.uuid" :scale="groupScale" :position="groupPosition" @click="clickTest">
          <TresMeshGreyRainboxMaterial v-if="mesh !== activeMesh"/>
          <TresMeshPurpleRainboxMaterial  v-else />
        </primitive>
        
        
      </TresGroup>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>