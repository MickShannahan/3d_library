<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef,watch } from 'vue';
import {Modal} from 'bootstrap'
import { generateId } from '@/utils/GenerateId';
import { meshService } from '@/services/MeshService';
import { logger } from '@/utils/Logger';

defineProps({
  type: {type: String, default: 'area'},
  class: {type: String}
})
const pickerId = generateId()
const emit = defineEmits(['selectedFiles'])

const fileInputElm = useTemplateRef('file-input')

const pickerFiles = ref([])

watch(pickerFiles, ()=>{
  if(pickerFiles.value.length){
    Modal.getOrCreateInstance('#file-picker-modal'+pickerId).show()
  } else {
    Modal.getOrCreateInstance('#file-picker-modal'+pickerId).hide()
  }
})

onBeforeUnmount(()=> Modal.getOrCreateInstance('#file-picker-modal'+pickerId).dispose())

function onInputChange(event){
  const files = event.target.files
  pickerFiles.value = Array(...files)
  fileInputElm.value.value = ''
}

function onSubmit(){
  emit('selectedFiles', pickerFiles.value)
  pickerFiles.value = []
  fileInputElm.value.value = ''
}

function removeFileFromList(indexToRemove: number){
  pickerFiles.value.splice(indexToRemove, 1)
}

function clickInput(){
  fileInputElm.value.click()
}

function handleDropEvent(e){
  logger.log('dropped', e)
  const files : FileList = e.dataTransfer?.files 
  if(files){
    pickerFiles.value = Array(...files)
  }
}


</script>


<template>

<section v-if="type == 'area'" @drop.prevent="handleDropEvent" @dragover.prevent :class>
  <slot>
    <button class="btn add-files-btn" @click="clickInput" >
      <div>
        Click to Add Files <i class="mdi mdi-plus"></i>
      </div>
      <div>
        <small>or drag files here</small>
      </div>
    </button>
  </slot>
</section>

  <button v-else class="btn btn-primary" @click="clickInput" v-tooltip="'Open File Picker'">
    <i class="bi bi-file-earmark-plus"></i>
  </button>

  <Teleport to="body">
  <div :id="'file-picker-modal'+pickerId" class="modal fade">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">


          <div class="modal-body">
            <div class="mb-2">
              <input ref="file-input" @change="onInputChange" class="form-control" type="file" accept=".stl,.obj,.fbx" multiple placeholder="add more files">
            </div>
            <div>
              <span v-if="pickerFiles.length == 0" class="text-secondary">... no files selected</span>
              <div class="d-flex flex-wrap gap-2" v-else>
                <div v-for="(f,i) in pickerFiles" class="file-badge">
                  <span><i class="bi bi-box text-primary"></i> {{ f.name }}</span>
                  <button @click="removeFileFromList(i)" class="btn"><i class="bi bi-x"></i></button>
                </div>
              </div>
            </div>
            <div class="text-end mt-2">
              <button :disabled="!pickerFiles.length" class="btn btn-primary" @click="onSubmit">Add To Scene <i class="mdi mdi-plus"></i></button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style lang="scss" scoped>
.add-files-btn{
  border: 1px dashed var(--bs-border-color);
  width: 100%;
  color: var(--bs-border-color);
  text-align: center;
  padding: 1em;
  &:hover{
  border: 1px dashed var(--bs-border-color);
  }
}

.file-badge{
  display: inline-block;
  background-color: rgba(var(--bs-black-rgb), .2);
  border: 1px solid rgba(var(--bs-black-rgb), .4);
  border-radius: 16px;
  padding: .2em .2em .2em .6em;
}
</style>