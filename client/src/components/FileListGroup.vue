<script setup lang="ts">
import { Model } from '@/models/Model';
import { ref, watch } from 'vue';
import {Collapse} from 'bootstrap'
import { getModelBottom, resetGroupBase, rotate } from '@/utils/3Dtransforms';
import { logger } from '@/utils/Logger';
import { meshService } from '@/services/MeshService';
import ModalWrapper from './ModalWrapper.vue';
import { Pop } from '@/utils/Pop';
import { imageUploadService } from '@/services/ImageUploadService';
import { modelsService } from '@/services/ModelsService';

const {group} = defineProps({
  group: Model
})
const collapsed = ref(false)
const editingName = ref(false)

watch(collapsed, (value)=>{
  const elm = Collapse.getOrCreateInstance(`#file-list-collapse-${group._id}`)
  if(!value) elm.show()
  else elm.hide()
})

function rotateGroup(){
  group.rotateX(rotate(90))
  resetGroupBase(group)
}

function selectGroup(){
  meshService.selectGroupOfMeshId(group.meshes.map(m => m._id))
}

function rename(){
  editingName.value = false
}


async function createModel(){
  try {
    await modelsService.createModel(group)
  } catch (error) {
    Pop.error(error)
    logger.error(error)
  }
}

</script>


<template>

  <section>
    <div @click="selectGroup" class="group-header ps-2 mt-1 d-flex justify-content-between align-items-center">

      <div class="w-75">
        <i class="mdi mdi-printer-3d me-1"></i>
        <span v-if="!editingName" v-doubleClick.stop="()=> editingName = true"> {{ group.name  || 'unamed'}}</span>
        <div v-else class="input-group">
          <input @blur="rename" type="text" minlength="3" maxlength="50" required v-model="group.name" class="form-control">
        </div>
      </div>
      <div class="d-flex">
        <button class="" @click.stop="rotateGroup" v-tooltip="'flip model base'">
          <i class="mdi mdi-format-rotate-90"></i>
        </button>
      </div>
      <button role="button" @click.stop="collapsed = !collapsed">
        <i v-if="!collapsed" class="mdi mdi-arrow-collapse-up"></i>
        <i v-else class="mdi mdi-arrow-expand-down"></i>
      </button>

    </div>
    <section :id="`file-list-collapse-${group.uuid}`" class="group-files gap-1 p-2 pe-0 collapse show">
      <slot></slot>
    </section>
  </section>


</template>


<style lang="scss" scoped>
.icon-3d{
  height: 25px;
  width: 25px;
}

.group-header{
  background: var(--bs-primary);
}

.group-files{
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--bs-primary);
}

button{
  background: transparent;
  border: none;
  &:hover{
    background-color: rgba(var(--bs-light-rgb),.2);
  }
}

.mdi-printer-3d::before{
  transform: rotate(180deg);
}
</style>