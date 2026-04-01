<script setup lang="ts">
import { AppState } from '@/AppState';
import { rotate } from '@/utils/3Dtransforms';
import { Euler } from 'three';
import { computed, ref } from 'vue';
import InputDraggable from '../InputDraggable.vue';



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

function resetRotation(){
    const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m.uuid))
  meshes.forEach(m => {
    m.targetRotation.x = 0
    m.targetRotation.y = 0
    m.targetRotation.z = 0
  })
}

</script>


<template>
  <section class="tools glass-pane border rounded rounded-3 p-2" :class="{disabled: selectedMeshes.length == 0}">
    <div class="d-flex flex-column">
      <div>
        <div>
          <div>
            <div class="small-input-group rounded-top-3 ">
              <label class="w-50">quick rotate</label>
              <span class="flex-grow-1"></span>
              <InputDraggable v-model="rotateStep" direction="horizontal" :step="5" :min="15" :max="90" :pixels="5" />
              <input type="number" v-model="rotateStep" class="text-end ">
            </div>
          </div>

          <div class="small-input-group rounded-bottom-3 justify-content-between">
            <div>
              <button @click="quickRotate(rotateStep,0,0)"><i class="bi bi-arrow-counterclockwise text-red"></i>x</button>
              <button @click="quickRotate(0,rotateStep,0)"><i class="bi bi-arrow-counterclockwise text-green"></i>y</button>
              <button @click="quickRotate(0,0,rotateStep)"><i class="bi bi-arrow-counterclockwise text-cyan"></i>z</button>
            </div>
            <div>
              <button @click="resetRotation()"><i class="bi bi-arrow-repeat"></i></button>
            </div>
            <div>
              <button @click="quickRotate(-rotateStep,0,0)"><i class="bi bi-arrow-clockwise text-red"></i>x</button>
              <button @click="quickRotate(0,-rotateStep,0)"><i class="bi bi-arrow-clockwise text-green"></i>y</button>
              <button @click="quickRotate(0,0,-rotateStep)"><i class="bi bi-arrow-clockwise text-cyan"></i>z</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style lang="scss" scoped>
.tools{
  *{
    transition: color .2s ease;
  }
}

.disabled{
  pointer-events: none;
  backdrop-filter: blur(10px) url(#glass-distortion);
  transition: opacity .2s ease;
  *{
    color: rgba(var(--bs-dark-rgb),.75) !important;
  }
}

.small-input-group{
  font-size: 14px;
  display: flex;
  align-items: center;
  background-color: rgba(var(--bs-black-rgb),.1);
  padding: .25em;
  input{
    background-color: transparent;
    border: unset;
  }
  label{
    width: 50%;
  }
  [type=number]{
    width: 6ch;
    height: 30px;
  }
}
</style>