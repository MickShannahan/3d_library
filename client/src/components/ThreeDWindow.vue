<script setup lang="ts">
import { TresCanvas, extend } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';
import { MeshGreyRainboxMaterial, MeshNormalHighlightMaterial, MeshPurpleRainboxMaterial } from '@/utils/Materials';
import { rotate } from '@/utils/3Dtransforms';
import { AppState } from '@/AppState';
import { meshService } from '@/services/MeshService';

const cameraElm = useTemplateRef('camera')

const meshGroups = computed(()=> AppState.meshGroups.filter(mg => AppState.loadedMeshGroups.includes(mg.uuid)))
const selectedMeshIds = computed(()=> AppState.selectedMeshIds)


function handleClickMesh(event){
  const clickedMesh = event.object
  const heldShift = event.shiftKey
  meshService.selectMeshId(clickedMesh.uuid, !heldShift)
  logger.log(heldShift)
}

function clickOut(){
  meshService.clearSelectedMeshIds()
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
      <TresGroup v-for="meshGroup in meshGroups" :rotation="[rotate(-90), 0,0]">

        
        <primitive v-for="mesh in meshGroup.meshes" :object="mesh" :key="mesh.uuid"   @click="handleClickMesh">
          <TresMeshGreyRainboxMaterial v-if="selectedMeshIds.includes(mesh.uuid)"/>
          <TresMeshPurpleRainboxMaterial  v-else />
        </primitive>
        
        
      </TresGroup>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>