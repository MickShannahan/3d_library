<script setup lang="ts">
import { logger } from '@/utils/Logger';
import { throttle } from '@/utils/throttl';
import { reactive, ref } from 'vue';

const props = defineProps({
  modelValue: undefined,
  label: String,
  direction: String,
  max: Number,
  min: Number,
  step: {type: Number, default: 1},
  pixels: {type: Number, default: 6}
})
const emit = defineEmits(['update:modelValue', 'input'])

const mousePosition = reactive({x: 0, y:0})
const isDragging = ref(false)
let pixelsNeeded = props.pixels


function handleDragStart(event){
  isDragging.value = true
  mousePosition.x = event.clientX
  mousePosition.y = event.clientY 
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', dropped)
  document.body.style.cursor = props.direction == 'horizontal' ? 'ew-resize' : 'nw-resize'
}

function handleDrag(event : MouseEvent){
  mousePosition.x = event.clientX
  mousePosition.y = event.clientY 
  let power
  if(props.direction == 'horizontal'){
    power = Math.sign(event.movementX) * props.step
    pixelsNeeded -= Math.abs(event.movementX)
  } else {
    power = Math.sign(event.movementY) * props.step
    pixelsNeeded -= Math.abs(event.movementY)
  }
  if(pixelsNeeded <= 0){
    pixelsNeeded = props.pixels
    throttle(updateValue, 50, props.modelValue + power)
  }
}

function updateValue(val){
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, val)))
}

function dropped(event){
  isDragging.value = false
  mousePosition.x = 0
  mousePosition.y = 0
  window.removeEventListener('mousemove', handleDrag)
  document.body.style.cursor = 'unset'
}

</script>


<template>
<div>
  <i draggable="true" @dragstart.prevent="handleDragStart" @drag.prevent  class="drag-handle mdi mdi-unfold-more-vertical"></i>
  <span v-if="isDragging" :style="`--mx: ${mousePosition.x}px; --my: ${mousePosition.y}px;`" class="value-popup">
    <span v-if="modelValue == min"><i class="mdi mdi-arrow-collapse-left text-secondary"></i></span>
    {{ modelValue }}
    <span>{{ label }}</span>
    <span v-if="modelValue == max"><i class="mdi mdi-arrow-collapse-right text-secondary"></i></span>

  </span>
</div>
</template>


<style lang="scss" scoped>
.drag-handle{
  cursor: grab;
}
.value-popup{
  font-family: monospace;
  user-select: none;
  pointer-events: none;
  position: fixed;
  top: var(--my);
  left: var(--mx);
  background-color: rgba(var(--bs-black-rgb), .2);
  padding: .25em .75em;
  border-radius: 8px;
  transform: translate(-50%, -120%);
}
</style>