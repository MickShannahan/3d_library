<script setup lang="ts">
import { AppState } from '@/AppState';
import { rotate } from '@/utils/3Dtransforms';
import { Euler, Vector3 } from 'three';
import { computed, reactive, ref } from 'vue';
import InputDraggable from '../InputDraggable.vue';
import { logger } from '@/utils/Logger';



const selectedMeshes = computed(()=>AppState.selectedMeshIds)
const rotateStep = ref(90)
const positionEditable = ref(new Vector3(0,0,0))

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

function handleUpdatePosition(x,y,z){
  positionEditable.value = new Vector3(x,y,z)
    const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m.uuid))
  meshes.forEach(m => {
    m.targetPosition = new Vector3(positionEditable.value.x, positionEditable.value.y, positionEditable.value.z)
  })
}

</script>


<template>
  <section class="tools glass-pane border rounded rounded-3 p-2" :class="{disabled: selectedMeshes.length == 0}">
    <div class="d-flex flex-column gap-2">
      <!-- Rotation -->
      <section>
            <div class="small-input-group d-flex rounded-top-3 ">
              <label class="w-50">Rotation</label>
              <span class="flex-grow-1"></span>
              <InputDraggable v-model="rotateStep" direction="horizontal" :step="5" :min="15" :max="90" :pixels="5" />
              <input type="number" v-model="rotateStep" class="text-end ">
            </div>

          <div class="small-input-group d-flex rounded-bottom-3 justify-content-between">
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
      </section>

      <!-- Position -->
      <section>
        <div class="small-input-group rounded-3">
            <label>Position</label>
            <div class="d-flex flex-column gap-1">
              <div class="d-flex">
                <label>x</label>
                <div class="d-flex justify-content-between">
                  <InputDraggable direction="horizontal" :min="-100" :max="100" v-model="positionEditable.x" @update:modelValue="(v)=>handleUpdatePosition(v,positionEditable.y,positionEditable.z)" :step=".5"/>
                </div>
                <label></label>
              </div>
              <div class="d-flex">
                <label>y</label>
                <div class="d-flex justify-content-between">
                  <InputDraggable direction="horizontal" :min="-100" :max="100" v-model="positionEditable.y" @update:modelValue="(v)=>handleUpdatePosition(positionEditable.x,v,positionEditable.z)" :step=".5"/>
                </div>
                <label></label>
              </div>
              <div class="d-flex">
                <label>z</label>
                <div class="d-flex justify-content-between">
                  <InputDraggable direction="horizontal" :min="-100" :max="100" v-model="positionEditable.z" @update:modelValue="(v)=>handleUpdatePosition(positionEditable.x,positionEditable.y,v)" :step=".5"/>
                </div>
                <label></label>
              </div>
            </div>
        </div>
      </section>
    </div>
  </section>
</template>


<style lang="scss" scoped>
.tools{
  *{
    transition: color .2s ease, background .15s ease, opacity .15s ease, transform .1s ease;
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

button {
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    opacity: 1;
  }
  &:active {
    transform: scale(0.92);
  }
}

.small-input-group{
  font-family: monospace;
  font-size: 14px;
  align-items: center;
  background-color: rgba(var(--bs-black-rgb),.1);
  padding: .25em;

  label{
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.5;
    font-weight: 500;
    width: 50%;
  }
  input{
    background-color: transparent;
    border: unset;
    color: inherit;
  }
  [type=number]{
    width: 6ch;
    height: 30px;
  }
}
</style>