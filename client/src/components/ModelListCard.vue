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
  <div class="img-wrapper">
    <img class="img-cover rounded-4" :src="model.coverImage" height="512" width="512" :alt="`preview of ${model.name} model`">
    <img class="img-turnaround rounded-4" :src="model.turnAroundImage" height="512" width="512" :alt="`preview of ${model.name} model`">
  </div>
  <div class="px-1 d-flex  flex-column justify-content-between">
    <div>
      <h3 class="fs-6">{{ model.name }}</h3>
      <img src="https://images2.myminifactory.com/insecure/rt:fill-down/w:400/h:400/el:1/plain/https://dl4.myminifactory.com/public-assets/profile-images/e9b100b47258334e198851a0042738d5e25a5580.png" class="rounded-3" height="24" width="24" alt="">
      <small class="ms-1">Twin Goddess Minis</small>
    </div>
    <small class="text-secondary text-end">last ordered: Aug 13</small>
  </div>
</article>
</template>


<style lang="scss" scoped>


.model-card{
  display: grid;
  grid-template-columns: minmax(100px, 4fr) 5fr;
  border: 1px solid rgba(var(--bs-black-rgb), .1);
  background: rgba(var(--bs-black-rgb), .2);

    &:hover{
      filter: brightness(1.2) saturate(1.2);
      transition: all .2s ease;
      border-color: rgba(var(--bs-primary-rgb),.5);
    }
}

.img-wrapper{
  position: relative;



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