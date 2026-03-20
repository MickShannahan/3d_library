<script setup lang="ts">
import { ref } from 'vue';


const emit = defineEmits(['selectedFile'])

const pickerFiles = ref([])

function onInputChange(event){
  const files = event.target.files
  pickerFiles.value = files
}

function onSubmit(){
  emit('selectedFile',pickerFiles.value)
}


</script>


<template>
  <div class="input-group">
    <input @change="onInputChange" class="form-control" type="file" accept="stl" multiple>
    <button :disabled="!pickerFiles.length" class="btn btn-primary" @click="onSubmit">Submit</button>
  </div>
</template>


<style lang="scss" scoped>

</style>