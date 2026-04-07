<script setup lang="ts">
import { Model } from '@/models/Model';
import { modelsService } from '@/services/ModelsService';
import { Pop } from '@/utils/Pop';


const props = defineProps({
  model: {type: Model}
})

function clearActive(){
  modelsService.setActiveModel(null)
}

async function deleteModel(){
  try{
    const confirmed = await Pop.confirm('Are you sure?', 'Deleting this model will also delete all records attached to it')
    if(!confirmed) return
    const prompted = await Pop.prompt('text', `Delete ${props.model.name}?`, `To confirm the Delete, type the model name into the input`, {confirmText: `Delete ${props.model.name}`})
    if(prompted !== props.model.name) return
    
    await modelsService.deleteModel(props.model._id)
    Pop.toast('Model Deleted')
    clearActive()
  } catch(error){
    Pop.error(error, 'Could Not Delete Model')
  }

}

</script>


<template>

  <div class="p-2">
    <section class="d-flex justify-content-between">
      <button v-tooltip="'Close'" @click="clearActive" >
        <i class="bi bi-x fs-4"></i>
      </button>
      <button class="btn btn-normal-grad">
        Create Order
        <i class="mdi mdi-package-variant-closed-plus fs-5"></i>
      </button>
    </section>

    <section class="p-2">
      <div class="container-fluid">
        <section class="row">
          <div class="fs-2 fw-bold p-0">{{ model.name }}</div>
          <div class="d-flex flex-wrap gap-1 p-0 my-2">
            <span v-for="tag in model.tags" class="bg-primary badge">{{ tag }}</span>
          </div>
          <div v-if="model.author" class="fs-3 p-0">
            <img :src="model.author.image" :alt="`profile image of ${model.author.name}`">
            <span>{{ model.author.name }}</span>
          </div>
          <img :src="model.turnAroundImage" class="img-fluid border p-0 rounded-4" :alt="`Preview of ${model.name}`">
        </section>

        <div class="row">
          <div class="fw-bold mt-3 mb-2 p-0">Meshes</div>
          <section class="part-grid g-1">
            <div v-for="mesh in model._meshData" class="part-image-wrapper">
              <img :src="mesh.images[0]?.data" class="part-image border rounded-4" :alt="`image of part ${mesh.name}`">
              <div class="hover-preview gap-1">
                <img v-for="img in mesh.images" :src="img.data" class="preview-image border border-primary rounded-5 shadow">
              </div>
              <span class="mesh-name">{{ mesh.name }}</span>
          </div>
        </section>
      </div>
    </div>
    </section>

    <section class="danger-zone rounded-4 p-2 mt-5">
      <div class="text-center">Danger Zone</div>
      <div class="text-end">
        <button @click="deleteModel" class="text-secondary btn selectable-danger">Delete Model <i class="mdi mdi-delete-forever"></i></button>
      </div>
    </section>
  </div>

</template>


<style lang="scss" scoped>

.part-grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: .5em;
}

.part-image-wrapper{
  position: relative;
  .mesh-name{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    font-size: .8em;
    font-family: monospace;
    padding: .25em .5em;
    color: rgba(var(--bs-light-rgb),.5);
    overflow: hidden;
  }
}

.part-image{
  width: 100%;
  object-fit: contain;
      &:hover{
    border-color: var(--bs-primary) !important;
  }
}

.hover-preview{
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 105%;
  bottom: -20%;
  display: flex;
  transform-origin: right center;
  z-index: 1;
}

.part-image:hover+.hover-preview{
  opacity: 1;
  transform: scale(.75);
  transition: all .2s ease;
}
.preview-image:last-child{
  border-bottom-right-radius: 0px !important;
}

.danger-zone{
  border: 1px solid rgba(var(--bs-danger-rgb), .5);
  color: rgba(var(--bs-danger-rgb), .5);
}
</style>