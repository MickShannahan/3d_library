<script setup lang="ts">
import { cameraState } from '@/utils/CameraState';
import { MATERIAL_REGISTRY } from '@/utils/Materials';
import defaultBackground from '../assets/img/blurryBgLowSm.gif'
import darkBackground from '../assets/img/blurryBg2.gif'
import lightGreenBackground from '../assets/img/blurryBg3.gif'
import verdantGreenBackground from '../assets/img/blurryBgGreen.gif'
import cityRedBackground from '../assets/img/blurryBgRed.gif'
import purpleBackground from '../assets/img/blurryBgPurple.gif'
import candyBackground from '../assets/img/blurryCandy.gif'
import blurryBgBubbleGum from '../assets/img/blurryBgBubbleGum.gif'
import blurryBgGloss from '../assets/img/blurryBgGloss.gif'
import blurryBgGlossBeach from '../assets/img/blurryBgGlossBeach.gif'
import blurryBgGrey from '../assets/img/blurryBgGrey.gif'
import blurryBeachPeaches from '../assets/img/blurryBgPeaches.gif'
import blurryBgRed2 from '../assets/img/blurryBgRed2.gif'




function selectMaterial(materialName: string) {
  if(!Object.keys(MATERIAL_REGISTRY).includes(materialName)) return
  cameraState.selectedMaterial = materialName
}

function selectWorld(worldScene){
  cameraState.showBackground = worldScene ? true : false
  if(worldScene) cameraState.background = worldScene
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
  <div class="dropup dropup-center d-inline-block">
    <button data-bs-toggle="dropdown" class="world-icon rounded" :style="`--bg: url(${cameraState.showBackground ? cameraState.background : ''})`">
      <div >
        <i v-if="cameraState.showBackground" class="mdi mdi-earth"></i>
        <i v-else class="mdi mdi-earth-off text-secondary"></i>
      </div>
    </button>
    <div class="dropdown-menu mat-grid glass-pane border p-1 mb-2"> 
      <button @click="selectWorld(false)" ><i class="mdi mdi-cancel"></i></button>
      <button @click="selectWorld(defaultBackground)" class="world-icon" :style="`--bg: url(${defaultBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(darkBackground)" class="world-icon" :style="`--bg: url(${darkBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(lightGreenBackground)" class="world-icon" :style="`--bg: url(${lightGreenBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(verdantGreenBackground)" class="world-icon" :style="`--bg: url(${verdantGreenBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(cityRedBackground)" class="world-icon" :style="`--bg: url(${cityRedBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(purpleBackground)" class="world-icon" :style="`--bg: url(${purpleBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(candyBackground)" class="world-icon" :style="`--bg: url(${candyBackground})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBgBubbleGum)" class="world-icon" :style="`--bg: url(${blurryBgBubbleGum})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBgGloss)" class="world-icon" :style="`--bg: url(${blurryBgGloss})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBgGlossBeach)" class="world-icon" :style="`--bg: url(${blurryBgGlossBeach})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBeachPeaches)" class="world-icon" :style="`--bg: url(${blurryBeachPeaches})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBgRed2)" class="world-icon" :style="`--bg: url(${blurryBgRed2})`"><i class="mdi mdi-earth"></i></button>
      <button @click="selectWorld(blurryBgGrey)" class="world-icon" :style="`--bg: url(${blurryBgGrey})`"><i class="mdi mdi-earth"></i></button>
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
    grid-template-columns: repeat(5, minmax(30px, 1fr));
  }

  .mat-preview{
    height: 24px;
    border-radius: 50px;
  }

  button.active{
    background-color: var(--bs-primary);
  }

  .world-icon{
    background-image: var(--bg);
    background-size: cover;
  }
</style>