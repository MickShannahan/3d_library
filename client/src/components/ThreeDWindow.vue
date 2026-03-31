<script setup lang="ts">
import { TresCanvas, extend, useLoop } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';
import { MeshGreyRainboxMaterial, MeshNormalHighlightMaterial, MeshPurpleRainboxMaterial } from '@/utils/Materials';
import { getModelCenter, rotate } from '@/utils/3Dtransforms';
import { AppState } from '@/AppState';
import { meshService } from '@/services/MeshService';
import AnimatedGroup from './Meshes/AnimatedGroup.vue';
import BottomToolBar from './ToolBars/BottomToolBar.vue';
import CameraControls from './ToolBars/CameraControls.vue';

const camera = useTemplateRef('camera')


const meshGroups = computed(()=> AppState.meshGroups.filter(mg => AppState.loadedMeshGroups.includes(mg.uuid)))


function clickOut(){
  meshService.clearSelectedMeshIds()
}

watch(()=> AppState.loadedMeshGroups.length, (last)=>{
  const lastLoadedGroup = AppState.meshGroups[last-1]
  logger.log('loaded mesh group', lastLoadedGroup)
  if(!lastLoadedGroup) return
  const lastLoadCenter = getModelCenter(lastLoadedGroup)
  camera.value.pointCamera(lastLoadCenter)
})




extend({MeshGreyRainboxMaterial, MeshPurpleRainboxMaterial})
</script>


<template>
  <BottomToolBar>
    <CameraControls :camera/>
  </BottomToolBar>

  <TresCanvas clear-color="#16161d" @pointermissed="clickOut" :fps-limit="5" >
    <ThreeDCamera  ref="camera"/>
    <AnimatedGroup v-for="meshGroup in meshGroups" :meshGroup/>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>