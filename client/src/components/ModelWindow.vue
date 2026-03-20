<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import DModelCamera from './3DModelCamera.vue';
import { MeshLambertMaterial, MeshNormalMaterial } from 'three';
import { STLMesh } from '@/models/STLMesh';




const normalMaterial = new MeshNormalMaterial()
const selectedMaterial = new MeshLambertMaterial({ color: '#ff0000' })

</script>


<template>
  <section class="model-viewer-window">
    <TresCanvas clear-color="#16161d" width="100%" height="100%">
      <TresDirectionalLight :position="[10, 10, 10]" :intensity="1.5" />
      <TresAmbientLight />
      <DModelCamera />

      <TresGroup :position="[0, 0, 0]">

        <primitive v-for="mesh in meshes" :key="mesh.uuid" :object="mesh">
          <TresMeshNormalMaterial />
        </primitive>

      </TresGroup>

    </TresCanvas>
  </section>
</template>


<style lang="scss" scoped>
.model-viewer-window {
  flex-grow: 1;
  width: 100%;
}
</style>