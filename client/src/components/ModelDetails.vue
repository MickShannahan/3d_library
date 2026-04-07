<script setup lang="ts">
import { Model } from '@/models/Model';
import { modelsService } from '@/services/ModelsService';


const props = defineProps({
  model: {type: Model}
})

function clearActive(){
  modelsService.setActiveModel(null)
}

</script>


<template>

  <div class="p-2">
    <section>
      <button v-tooltip="'Close'" @click="clearActive">
        <i class="bi bi-x fs-4"></i>
      </button> 
    </section>

    <section class="p-2">
      <div class="container-fluid">
        <section class="row">
          <div class="fs-2 fw-bold p-0">{{ model.name }}</div>
          <div v-if="model.author" class="fs-3 p-0">
            <img :src="model.author.image" :alt="`profile image of ${model.author.name}`">
            <span>{{ model.author.name }}</span>
          </div>
          <img :src="model.turnAroundImage" class="img-fluid border rounded-4" :alt="`Preview of ${model.name}`">
        </section>

        <section class="row">
          <div class="fw-bold mt-3 p-0">Meshes</div>
          <div v-for="mesh in model._meshData">
            <div class="part-image-wrapper">
              <img :src="mesh.images[0]?.data" class="part-image border rounded-3" :alt="`image of part ${mesh.name}`">
              <div class="hover-preview gap-2">
                <img v-for="img in mesh.images" :src="img.data" class="border rounded-3 shadow">
              </div>
            </div>
            <span>{{ mesh.name }}</span>
          </div>
        </section>
      </div>
    </section>
  </div>

</template>


<style lang="scss" scoped>

.part-image-wrapper{
  position: relative;
}

.part-image{
  height: 100px;
  width: 100px;
  object-fit: contain;
}

.hover-preview{
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 105%;
  bottom: -50%;
  display: flex;
  transform-origin: right center;
}

.part-image:hover+.hover-preview{
  opacity: 1;
  transform: scale(.7);
  transition: all .2s ease;
}
</style>