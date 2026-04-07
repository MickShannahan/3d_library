<script setup lang="ts">
import { Model } from '@/models/Model';
import { modelsService } from '@/services/ModelsService';


const props = defineProps({
  model: Model
})

function setActive(){
  modelsService.setActiveModel(props.model)
}

</script>


<template>
<article class="model-card rounded-3 p-2 shadow" role="button" @click="setActive">
  <h3 class="fs-5">{{ model.name }}</h3>
  <div class="img-wrapper">
    <img class="img-cover rounded-4" :src="model.coverImage" height="512" width="512" :alt="`preview of ${model.name} model`">
    <img class="img-turnaround" :src="model.turnAroundImage" height="512" width="512" :alt="`preview of ${model.name} model`">
  </div>
</article>
</template>


<style lang="scss" scoped>


.model-card{
  border: 1px solid transparent;
  background: linear-gradient(0deg, var(--bs-dark), var(--bs-dark)) padding-box,
    linear-gradient(-115deg, var(--bs-normal-x) 0%, var(--bs-normal) 40%, var(--bs-normal-z) 70%, var(--bs-normal-y) 100%) border-box;

    &:hover{
      filter: brightness(1.1);
      transform: translateY(-5px);
      transition: all .2s ease;
    }
}

.img-wrapper{
  position: relative;
  border: 1px solid rgba(var(--bs-light-rgb), .1);



  .img-cover{
      width: 100%;
      height: auto;
    }

    .img-turnaround{
      opacity: 0;
      width: 100%;
      height: auto;
      position: absolute;
      inset: 0;
      transition: opacity .2s ease;
    }

    &:hover .img-turnaround{
      opacity: 1;
    }
}
</style>