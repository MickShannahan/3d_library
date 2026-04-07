<script setup lang="ts">
import { Model } from '@/models/Model';
import { modelsService } from '@/services/ModelsService';
import { computed } from 'vue';
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

const groupColors = ['--bs-normal','--bs-normal-x','--bs-normal-shadow','--bs-indigo','--bs-blue','--bs-orange','--bs-cyan','--bs-purple',]

const meshGroupMap = computed(() => {
  const map: Record<string, { name: string, color: string }> = {}
  props.model.partGroups.forEach((group, gi) => {
    group.partIds.forEach(id => {
      map[id] = { name: group.name, color: groupColors[gi % groupColors.length] }
    })
  })
  return map
})

</script>


<template>

  <div class="p-2">
    <section class="d-flex justify-content-between">
      <button v-tooltip="'Close'" @click="clearActive" >
        <i class="bi bi-x fs-4"></i>
      </button>
      <div>
        <button class="btn btn-sm selectable-primary me-1">Open 3D<i class="mdi mdi-open-in-new fs-5"></i></button>
        <button class="btn btn-sm btn-normal-grad">
          Create Order
          <i class="mdi mdi-package-variant-closed-plus fs-5"></i>
        </button>
      </div>
    </section>

    <section class="p-2">
      <div class="container-fluid">
        <section class="row">
          <div class="d-flex justify-content-between align-items-center">
            <div class="fs-3 fw-bold p-0">{{ model.name }}</div>
            <div v-if="model.author" class="fs-5 p-0 my-2">
              <img :src="model.author.image" class="author-img rounded-3 bg-black" :alt="`profile image of ${model.author.name}`">
              <span class="ms-1">{{ model.author.name }}</span>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-1 p-0 my-2">
            <span v-for="tag in model.tags" class="bg-normal-shadow badge">{{ tag }}</span>
          </div>
          <img :src="model.turnAroundImage" class="img-fluid border p-0 rounded-4" heigh="512" width="512" :alt="`Preview of ${model.name}`">
          <div class="p-0 text-secondary my-2">
            <span class="me-3"><i class="mdi mdi-currency-usd"></i>{{ model.price }}</span>
            <span class="me-3"><i class="mdi mdi-resize"></i>{{ model.scale }}</span>
            <span class="me-3"><i class="bi bi-person-lines-fill"></i>{{ model.size }}</span>
          </div>
        </section>

        <div class="row">
          <div class="fw-bold mt-3 mb-2 p-0">Meshes</div>
          <section class="part-grid g-1">
            <div v-for="mesh in model._meshData" class="part-image-wrapper">
              <img :src="mesh.images[0]?.data" class="part-image border rounded-4"  :alt="`image of part ${mesh.name}`">
              <div class="hover-preview gap-1">
                <img v-for="img in mesh.images" :src="img.data" class="preview-image border border-primary rounded-5 shadow">
              </div>
              <span class="mesh-name">{{ mesh.name }}</span>
              <span v-if="meshGroupMap[mesh._id]" class="group-name" :style="`background: rgba(var(${meshGroupMap[mesh._id].color}-rgb), .9)`">
                {{ meshGroupMap[mesh._id].name }}
              </span>
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

.author-img{
  width: 40px;
  aspect-ratio: 1/1;
  object-fit: cover;
}

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
  .group-name{
    position: absolute;
    top: 0;
    right: -5px;
    font-size: .8em;
    font-family: monospace;
    padding: .1em .5em;
    border-radius: .6em;
    opacity: .9;
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