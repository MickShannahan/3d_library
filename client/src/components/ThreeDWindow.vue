<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import ThreeDCamera from './ThreeDCamera.vue';
import { STLMesh } from '@/models/STLMesh';

defineProps({
  meshes: {type: Array<STLMesh>, default: ()=> []}
})

</script>


<template>

  <TresCanvas clear-color="#16161d">
    <ThreeDCamera/>

    <TresGroup>
      <primitive v-for="mesh in meshes" :object="mesh" :key="mesh.uuid">
        <TresMeshNormalMaterial/>
      </primitive>
    </TresGroup>
  </TresCanvas>
</template>


<style lang="scss" scoped>

</style>