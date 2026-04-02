<script setup lang="ts">
import { ref, useTemplateRef,watch } from 'vue';
import {Modal} from 'bootstrap'

defineProps({
  type: {type: String, default: 'area'}
})

const emit = defineEmits(['selectedFiles'])

const fileInputElm = useTemplateRef('file-input')

const pickerFiles = ref([])

watch(pickerFiles, ()=>{
  if(pickerFiles.value.length){
    Modal.getOrCreateInstance('#file-picker-modal').show()
  } else {
    Modal.getOrCreateInstance('#file-picker-modal').hide()
  }
})

function onInputChange(event){
  const files = event.target.files
  pickerFiles.value = Array(...files)
  fileInputElm.value.value = ''
}

function onSubmit(){
  emit('selectedFiles',pickerFiles.value)
  pickerFiles.value = []
  fileInputElm.value.value = ''
}

function removeFileFromList(indexToRemove: number){
  pickerFiles.value.splice(indexToRemove, 1)
}

function clickInput(){
  fileInputElm.value.click()
}


</script>


<template>

  <button v-if="type == 'area'" class="btn add-files-btn" @click="clickInput">
    <div>
      Click to Add Files <i class="mdi mdi-plus"></i>
    </div>
    <div>
      <small>or drag files here</small>
    </div>
  </button>

  <button v-else class="btn btn-primary" @click="clickInput">
    <i class="bi bi-file-plus"></i>
  </button>

  <Teleport to="body">
  <div id="file-picker-modal" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">


          <div class="modal-body">
            <div class="mb-2">
              <input ref="file-input" @change="onInputChange" class="form-control" type="file" accept="stl" multiple placeholder="add more files">
            </div>
            <div>
              <span v-if="pickerFiles.length == 0" class="text-secondary">... no files selected</span>
              <div class="d-flex flex-column" v-else>
                <div v-for="(f,i) in pickerFiles" class="d-flex align-items-baseline">
                  <span><i class="bi bi-box text-primary"></i> {{ f.name }}</span>
                  <span class="dots flex-grow-1"></span>
                  <button @click="removeFileFromList(i)" class="btn"><i class="bi bi-x"></i></button>
                </div>
              </div>
            </div>
            <div class="text-end">
              <button :disabled="!pickerFiles.length" class="btn btn-primary" @click="onSubmit">Submit</button>
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

.dots{
  margin: 5px;
  border-bottom: 1px dotted var(--bs-secondary);
}
</style>