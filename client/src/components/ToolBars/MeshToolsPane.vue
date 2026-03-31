<script setup lang="ts">
import { AppState } from '@/AppState';
import { rotate } from '@/utils/3Dtransforms';
import { Euler } from 'three';
import { computed, ref } from 'vue';



const selectedMeshes = computed(()=>AppState.selectedMeshIds)
const rotateStep = ref(90)

function quickRotate(x,y,z){
  const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m.uuid))
  meshes.forEach(m => {
    m.targetRotation.x += rotate(x)
    m.targetRotation.y += rotate(y)
    m.targetRotation.z += rotate(z)
  })
}

</script>


<template>
  <section class="glass-pane border rounded rounded-3 p-2">
    <div class="d-flex flex-column">
      <div>
        <div>transform <kbd>{{ selectedMeshes.length }}</kbd></div>
        <div>
          <div>
            <label>quick rotate</label>
            <div class="input-group d-flex">
              <input type="range" v-model="rotateStep" min="15" max="90" step="15" class="form-range w-75 p-2"/>
              <input type="number" v-model="rotateStep" class="form-control w-25">
            </div>
          </div>
          <div>
            
            <button @click="quickRotate(rotateStep,0,0)"><i class="mdi mdi-format-rotate-90 text-red"></i>x</button>
            <button @click="quickRotate(0,rotateStep,0)"><i class="mdi mdi-format-rotate-90 text-green"></i>y</button>
            <button @click="quickRotate(0,0,rotateStep)"><i class="mdi mdi-format-rotate-90 text-cyan"></i>z</button>
          </div>
          </div>
      </div>
    </div>
  </section>
</template>


<style lang="scss" scoped>

</style>