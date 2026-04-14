<script setup lang="ts">
import { AppState } from '@/AppState';
import { Model } from '@/models/Model';
import { modelsService } from '@/services/ModelsService';
import { computed } from 'vue';


const props = defineProps({
  model: Model
})
const isActive = computed(()=> AppState.activeModel?._id == props.model._id)

function setActive(){
  modelsService.setActiveModel(props.model)
}

</script>


<template>
<article class="model-card rounded-3 p-2 shadow" :class="{active: isActive}" role="button" @click="setActive">
  <div class="img-wrapper">
    <img class="img-cover rounded-4" :src="model.coverImage" height="512" width="512" :alt="`preview of ${model.name} model`">
    <img class="img-turnaround rounded-4" :src="model.turnAroundImage" height="512" width="512" :alt="`preview of ${model.name} model`">
  </div>
  <div class="px-1 d-flex  flex-column justify-content-between">
    <div>
      <h3 class="fs-6">{{ model.name }}</h3>
      <img v-if="model.author" :src="model.author.image" class="bg-dark object-fit-cover rounded-3" height="24" width="24" alt="">
      <small class="ms-1">{{ model.author?.name }}</small>
    </div>
    <div class="text-end text-secondary">
      <small v-if="model.lastOrdered" >last ordered: {{ model.lastOrdered?.createdAtFormatted }}</small>
      <small >{{ model.createdAtFormatted }}</small>
    </div>
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

    &.active{
      background: rgba(var(--bs-primary-rgb), .2);
      border: 1px solid rgba(var(--bs-primary-rgb), .5);
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