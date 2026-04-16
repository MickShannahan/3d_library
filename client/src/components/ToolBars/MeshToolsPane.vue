<script setup lang="ts">
import { AppState } from '@/AppState';
import { rotate } from '@/utils/3Dtransforms';
import { Vector3 } from 'three';
import { computed, ref } from 'vue';
import InputDraggable from '../InputDraggable.vue';
import { toolState } from '@/utils/ToolState';
import { logger } from '@/utils/Logger';



const selectedMeshes = computed(()=>AppState.selectedMeshIds)
const rotateStep = ref(15)
const positionEditable = ref(new Vector3(0,0,0))

function quickRotate(x,y,z){
  const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m._id))
  meshes.forEach(m => {
    m.targetRotation.x += rotate(x)
    m.targetRotation.y += rotate(y)
    m.targetRotation.z += rotate(z)
  })
}

function resetRotation(){
    const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m._id))
  meshes.forEach(m => {
    m.targetRotation.x = 0
    m.targetRotation.y = 0
    m.targetRotation.z = 0
  })
}

function handleUpdatePosition(x,y,z){
  positionEditable.value = new Vector3(x,y,z)
    const meshes = AppState.meshGroups.flatMap(mg => mg.meshes).filter(m => AppState.selectedMeshIds.includes(m._id))
  meshes.forEach(m => {
    m.targetPosition = new Vector3(positionEditable.value.x, positionEditable.value.y, positionEditable.value.z)
  })
}

// ─── Center Model ─────────────────────────────────────────────────────────────
// Delegates to SceneToolHandler via toolState.centerModel, which has access to
// the Three.js scene context needed for correct world-space bbox computation.
function centerModel() {
  toolState.centerModel?.()
}

// ─── Move-to-Face Toggle ──────────────────────────────────────────────────────
function toggleFaceMoveMode() {
  toolState.mode = toolState.mode === 'move-to-face' ? 'none' : 'move-to-face'
  toolState.faceClickCount = 0
}

const grabToolTip = `
<div>
  <div> <kbd>G</kbd> to start grab move </div>
  <div> <kbd>X/Y/Z</kbd> to lock to axis </div>
  <div> <kbd>shift</kbd> to slow </div>
  <div> <kbd>RBM</kbd> to cancel </div>
</div>
`

</script>


<template>
  <section class="tools glass-pane border rounded rounded-3 p-2">
  <div data-bs-toggle="collapse" data-bs-target="#tools-collapse" class="selectable-primary rounded-2"><i
      class="mdi mdi-tools mb-3"></i> TOOLS</div>
  <section class="collapse" id="tools-collapse">
    <div class="d-flex flex-column gap-2 ">
      

      <!-- Transform -->
      <section>
        <div class="small-input-group rounded-3 d-flex flex-column gap-1 align-items-start">
          <label>Transform</label>
          <div class="d-flex gap-1 flex-wrap">

            <!-- Center model at world origin -->
            <button class="tool-btn flex-grow-1" :disabled="!selectedMeshes.length"
              v-tooltip="'Move selection center to world origin (0,0,0)'" @click="centerModel">
              <i class="mdi mdi-image-filter-center-focus"></i> Center
            </button>

            <!-- Hot-key grab mode hint -->
            <button class="tool-btn flex-grow-1" :disabled="!selectedMeshes.length"
              :class="{ 'tool-btn--active': toolState.mode === 'grab' }"
              v-tooltip="grabToolTip"
              @click="() => {}">
              <i class="mdi mdi-cursor-move"></i> Grab <kbd>G</kbd>
            </button>

            <!-- Move-to-face mode toggle -->
            <button class="tool-btn flex-grow-1" :disabled="!selectedMeshes.length"
              :class="{ 'tool-btn--active': toolState.mode === 'move-to-face' }"
              v-tooltip="'Click source face, then target face to snap selection in place. Press F to activate.'"
              @click="toggleFaceMoveMode">
              <i class="mdi mdi-target"></i> Face <kbd>F</kbd>
            </button>

          </div>
        </div>
      </section>

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
            <button @click="quickRotate(0,rotateStep,0)"><i
                class="bi bi-arrow-counterclockwise text-green"></i>y</button>
            <button @click="quickRotate(0,0,rotateStep)"><i
                class="bi bi-arrow-counterclockwise text-cyan"></i>z</button>
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
          <div class="d-flex flex-column">

            <div class="input-row">
              <span>x</span>
              <InputDraggable :disabled="!selectedMeshes.length" direction="horizontal" :min="-100" :max="100"
                v-model="positionEditable.x"
                @update:modelValue="(v)=>handleUpdatePosition(v,positionEditable.y,positionEditable.z)" :step="1">
                <span class="d-flex badge border border-normal-x text-normal-x rounded-3"
                  :style="`transform: translateX(clamp(-25%, ${positionEditable.x}%, 25%))`">
                  <i class="mdi mdi-chevron-left pe-3"></i><i class="mdi mdi-chevron-right"></i>
                </span>
              </InputDraggable>
              <button v-tooltip="'Reset'" @click="handleUpdatePosition(0,positionEditable.y,positionEditable.z)"><i
                  class="bi bi-arrow-repeat"></i></button>
            </div>

            <div class="input-row">
              <span>y</span>
              <InputDraggable :disabled="!selectedMeshes.length" direction="horizontal" :min="-100" :max="100"
                v-model="positionEditable.y"
                @update:modelValue="(v)=>handleUpdatePosition(positionEditable.x,v,positionEditable.z)" :step="1">
                <span class="d-flex badge border border-normal-y text-normal-y rounded-3"
                  :style="`transform: translateX(clamp(-25%, ${positionEditable.y}%, 25%))`">
                  <i class="mdi mdi-chevron-left pe-3"></i><i class="mdi mdi-chevron-right"></i>
                </span>
              </InputDraggable>
              <button v-tooltip="'Reset'" @click="handleUpdatePosition(positionEditable.x,0,positionEditable.z)"><i
                  class="bi bi-arrow-repeat"></i></button>
            </div>

            <div class="input-row">
              <span>z</span>
              <InputDraggable :disabled="!selectedMeshes.length" direction="horizontal" :min="-100" :max="100"
                v-model="positionEditable.z"
                @update:modelValue="(v)=>handleUpdatePosition(positionEditable.x,positionEditable.y,v)" :step="1">
                <span class="d-flex badge border border-normal-z text-normal-z rounded-3"
                  :style="`transform: translateX(clamp(-25%, ${positionEditable.z}%, 25%))`">
                  <i class="mdi mdi-chevron-left pe-3"></i><i class="mdi mdi-chevron-right"></i>
                </span>
              </InputDraggable>
              <button v-tooltip="'Reset'" @click="handleUpdatePosition(positionEditable.x,positionEditable.y,0)"><i
                  class="bi bi-arrow-repeat"></i></button>
            </div>

          </div>
        </div>
      </section>

    </div>
  </section>

  <!-- ── Active-mode status bar (always visible, outside the collapse) ─────── -->
  <transition name="slide-down">
    <div v-if="toolState.mode !== 'none'" class="mode-bar rounded-2 mt-1 p-1">

      <template v-if="toolState.mode === 'grab'">
        <span class="mode-bar__icon text-warning"><i class="mdi mdi-cursor-move"></i></span>
        <span class="mode-bar__label">GRAB</span>
        <span class="mode-bar__detail">
          <template v-if="toolState.axisLock !== 'none'">
            <span :class="`text-axis-${toolState.axisLock}`">{{ toolState.axisLock.toUpperCase() }}-axis</span>
          </template>
          <template v-else>free move</template>
          &nbsp;·&nbsp;
          <kbd>X</kbd><kbd>Y</kbd><kbd>Z</kbd> lock &nbsp;·&nbsp;
          <kbd>Shift</kbd> slow &nbsp;·&nbsp;
          RMB cancel
        </span>
      </template>

      <template v-else-if="toolState.mode === 'move-to-face'">
        <span class="mode-bar__icon text-info"><i class="mdi mdi-target"></i></span>
        <span class="mode-bar__label">MOVE TO FACE</span>
        <span class="mode-bar__detail">
          <template v-if="toolState.faceClickCount === 0">click source face</template>
          <template v-else>click target face</template>
          &nbsp;·&nbsp; <kbd>Backspace</kbd> / <kbd>Esc</kbd> cancel
        </span>
      </template>

    </div>
  </transition>

</section>
</template>


<style lang="scss" scoped>
.tools{
  user-select: none;
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

.input-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
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

// ─── Tool buttons ─────────────────────────────────────────────────────────────
.tool-btn {
  background: rgba(var(--bs-black-rgb), .15);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-family: monospace;
  font-size: 12px;
  opacity: 0.75;

  &:hover:not(:disabled) {
    background: rgba(255,255,255,.12);
    opacity: 1;
  }
  &:active:not(:disabled) { transform: scale(0.92); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  &--active {
    opacity: 1;
    border-color: rgba(255,255,255,.35);
    background: rgba(255,255,255,.12);
    box-shadow: 0 0 6px rgba(255,255,255,.15);
  }

  kbd {
    font-size: 10px;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 3px;
    padding: 0 3px;
  }
}

// ─── Mode status bar ──────────────────────────────────────────────────────────
.mode-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  font-size: 11px;
  background: rgba(var(--bs-black-rgb), .35);
  border: 1px solid rgba(255,255,255,.1);
  overflow: hidden;
  white-space: nowrap;

  &__icon { font-size: 13px; }
  &__label { font-weight: 600; letter-spacing: .05em; }
  &__detail { opacity: .6; overflow: hidden; text-overflow: ellipsis; }

  kbd {
    font-size: 10px;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 3px;
    padding: 0 3px;
  }
}

// Axis-lock colour helpers matching the X/Y/Z convention
.text-axis-x { color: var(--bs-normal-x); }
.text-axis-y { color: var(--bs-normal-y); }
.text-axis-z { color: var(--bs-normal-z); }

// Slide-down transition for mode bar
.slide-down-enter-active, .slide-down-leave-active {
  transition: max-height .2s ease, opacity .2s ease;
  max-height: 40px;
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>