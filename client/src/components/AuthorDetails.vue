<script setup lang="ts">
import { Author } from '@/models/Author';
import { AppState } from '@/AppState';
import { computed } from 'vue';
import { Modal } from 'bootstrap';
import ModelListCard from './ModelListCard.vue';
import PartPopUp from './PartPopUp.vue';

const props = defineProps({
  author: { type: Author }
})

const authorModels = computed(()=> AppState.models.filter(m => m.author?._id ==  props.author._id))

function clearActive() {
  AppState.activeAuthor = null
}

function editAuthor() {
  AppState.editingAuthor = props.author
  Modal.getOrCreateInstance('#create-author').show()
}
</script>


<template>
<div class="p-2">
  <section class="d-flex justify-content-between">
    <button v-tooltip="'Close'" @click="clearActive">
      <i class="bi bi-x fs-4"></i>
    </button>
    <button v-tooltip="'Edit Author'" @click="editAuthor">
      <i class="mdi mdi-pencil fs-5 text-yellow"></i>
    </button>
  </section>

  <section class="p-2 mb-2">
    <div class="d-flex align-items-center gap-3 mb-3">
      <img :src="author.image" class="author-avatar rounded-3 border" :alt="`profile image of ${author.name}`">
      <div class="fs-2 fw-bold">{{ author.name }}</div>
    </div>
  </section>

  <section class="p-2 mb-2">
    <h5>Socials</h5>
    <div class="d-flex flex-wrap gap-2">
      <a v-for="link in author.socials" class="badge rounded-pill bg-blue font-monospace" target="_blank" :href="link.url">
        <span><i class="mdi" :class="link.icon"></i> {{ link.name }}</span>
      </a>
    </div>
  </section>

  <section class="p-2 mb-2">
    <h5>Models</h5>
    <div v-for="model in authorModels" class="mini-card p-2 rounded-4">
      <div class="img-wrapper rounded-4">
        <PartPopUp :images="[model.turnAroundImage]">
        <img :src="model.coverImage" :alt="`preview of ${model.name}`" class="preview rounded-4">
        </PartPopUp>
      </div>
      <div class="ps-2 d-flex flex-column flex-grow-1">
        <div class="fw-semibold">
          {{ model.name }}
        </div>
        <div class="flex-grow-1">
          <span v-for="tag in model.tags" class="badge rounded-pill bg-normal-shadow me-2">{{ tag }}</span>
        </div>
        <div class="d-flex justify-content-between text-secondary">
          <div>
            <i class="mdi mdi-package-variant"></i>Ordered: {{ model.orderCount }}
          </div>
          <div>{{ model.createdAtFormatted }}</div>
        </div>
      </div>
    </div>
  </section>
</div>
</template>


<style lang="scss" scoped>
.author-avatar {
  height: 80px;
  width: 80px;
  object-fit: cover;
}

.mini-card{
  display: flex;
  background-color: rgba(var(--bs-black-rgb),.2);

  .img-wrapper{
    position: relative;
    width: 20%;
    aspect-ratio: 1/1;
    &:hover{
      .turnaround{
        opacity: 1;
      }
    }

    img{
      width: 100%;
      position: absolute;
      inset: 0;
    }

    .turnaround{
      opacity: 0;
      transition: opacity .2s ease;
    }
  }
}
</style>
