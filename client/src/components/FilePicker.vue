<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';


const emit = defineEmits(['selectedFile'])

const fileInputElm = useTemplateRef('file-input')

const pickerFiles = ref([])

function onInputChange(event){
  const files = event.target.files
  pickerFiles.value = Array(...files)
  fileInputElm.value.value = ''
}

function onSubmit(){
  emit('selectedFile',pickerFiles.value)
  fileInputElm.value.value = ''
}

function removeFileFromList(indexToRemove: number){
  pickerFiles.value.splice(indexToRemove, 1)
}


</script>


<template>
  <div>
    <div class="mb-2">
      <input ref="file-input" @change="onInputChange" class="form-control" type="file" accept="stl" multiple>
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
</template>


<style lang="scss" scoped>
.dots{
  margin: 5px;
  border-bottom: 1px dotted var(--bs-secondary);
}
</style>