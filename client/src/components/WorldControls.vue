<script setup lang="ts">
import { cameraState } from '@/utils/CameraState';
import { MATERIAL_REGISTRY } from '@/utils/Materials';



function selectMaterial(materialName: string) {
  if(!Object.keys(MATERIAL_REGISTRY).includes(materialName)) return
  cameraState.selectedMaterial = materialName
}

</script>


<template>
<section>
  <div class="dropup dropup-center d-inline-block">
    <button data-bs-toggle="dropdown">
        <img :src="MATERIAL_REGISTRY[cameraState.selectedMaterial].preview" class="mat-preview mb-1" alt="image of matcap preview" style="height: 14px">
    </button>
    <div class="dropdown-menu mat-grid glass-pane border p-1 mb-2" >
      <button 
        v-for="(mat, name) in MATERIAL_REGISTRY" 
        :key="name"
        @click="selectMaterial(name)"
        class="p-1 rounded-3"
        :class="{ active: cameraState.selectedMaterial === name }"
        v-tooltip="name"
      >
        <img :src="mat.preview" class="mat-preview" alt="image of matcap preview">
      </button>
    </div>
  </div>
  <button v-if="cameraState.showGrid" @click="cameraState.showGrid = false"><i class="mdi mdi-grid"></i></button>
  <button v-else @click="cameraState.showGrid = true"><i class="mdi mdi-grid-off text-secondary"></i></button>
  <button v-if="cameraState.showAxis" @click="cameraState.showAxis = false"><i class="mdi mdi-axis-arrow"></i></button>
  <button v-else @click="cameraState.showAxis = true"><i class="mdi mdi-axis text-secondary"></i></button>
</section>
</template>


<style lang="scss" scoped>
  .dropdown-menu{
    overflow: visible;
  }

  .mat-grid.show{
    display: grid;
    grid-template-columns: repeat(4, minmax(30px, 1fr));
  }

  .mat-preview{
    height: 24px;
    border-radius: 50px;
  }

  button.active{
    background-color: var(--bs-primary);
  }
</style>