<script setup lang="ts">
import { TresCanvas, extend} from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { PartMesh } from '@/models/PartMesh';
import { computed, useTemplateRef, watch } from 'vue';
import * as THREE from 'three'
import { logger } from '@/utils/Logger';
import { getMeshesCenter } from '@/utils/3Dtransforms';
import { AppState } from '@/AppState';
import { meshService } from '@/services/MeshService';

import AnimatedGroup from './Meshes/AnimatedGroup.vue';
import CameraControls from './ToolBars/CameraControls.vue';
import FileListPane from './FileListPane.vue';
import ToolBar from './ToolBars/ToolBar.vue';
import MeshToolsPane from './ToolBars/MeshToolsPane.vue';
import StatsWindow from './StatsWindow.vue'
import SceneClickHandler from './SceneClickHandler.vue'
import JobsPane from './JobsPane.vue'
import { delay } from '@/utils/Delay';
import { cameraState } from '@/utils/CameraState';
import WorldControls from './WorldControls.vue';

const camera = useTemplateRef('camera')


const meshGroups = computed(()=> AppState.meshGroups.filter(mg => AppState.loadedMeshGroups.includes(mg._id)))


watch(()=> AppState.loadedMeshGroups.length, async (last)=>{
    const lastLoadedGroup = AppState.meshGroups[last-1]
    if(!lastLoadedGroup) return
    await delay(250)
    const meshCenter = getMeshesCenter(lastLoadedGroup)
    camera.value.positionCamera(new THREE.Vector3(meshCenter.x, meshCenter.y, 15))
    camera.value.pointCamera(meshCenter)
})


</script>


<template>
    <ToolBar :position="['top','left']" class="d-flex flex-column gap-2">
      <FileListPane/>
      <MeshToolsPane/>
    </ToolBar>

    <ToolBar :position="['bottom', 'center']">
      <div class="d-flex gap-1">
        <div class="glass-pane border rounded-3 p-2">
          <CameraControls :camera/>
        </div>
        <div class="glass-pane border rounded-3 p-2">
          <WorldControls />
        </div>
      </div>
    </ToolBar>

  <JobsPane/>

  <TresCanvas :clear-color="cameraState.clearColor" :fps-limit="60">
    <ThreeDCamera  ref="camera"/>
    <AnimatedGroup v-for="meshGroup in meshGroups" :meshGroup/>
    <StatsWindow/>
    <SceneClickHandler/>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>