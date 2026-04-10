<script setup lang="ts">
import { AppState } from '@/AppState';
import AuthorListCard from '@/components/AuthorListCard.vue';
import AuthorDetails from '@/components/AuthorDetails.vue';
import AuthorForm from '@/components/AuthorForm.vue';
import BrowseNav from '@/components/BrowseNav.vue';
import BrowseSearchBar from '@/components/BrowseSearchBar.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import { authorsService } from '@/services/AuthorsService';
import { Pop } from '@/utils/Pop';
import { computed, onMounted, ref } from 'vue';

const filterText = ref('')
const authors = computed(() => {
  const rg = new RegExp(filterText.value, 'ig')
  return AppState.authors.filter(a => rg.test(a.name))
})

onMounted(async () => {
  try {
    await authorsService.getAuthors()
  } catch (error) {
    Pop.error(error, 'Could Not Fetch Authors')
  }
})
</script>


<template>
<div class="d-flex flex-grow-1">
  <div class="container-fluid p-2 p-md-4">
    <BrowseNav/>
    <BrowseSearchBar v-model="filterText" >
      <button class="btn" data-bs-toggle="modal" data-bs-target="#create-author">Create Author<i class="bi bi-plus"></i></button>
    </BrowseSearchBar>
    <section class="cards-grid">
      <AuthorListCard v-for="author in authors" :author :key="author._id" />
    </section>
  </div>
  <div class="side-window shadow text-bg-dark" :class="{ open: AppState.activeAuthor }">
    <AuthorDetails v-if="AppState.activeAuthor" :author="AppState.activeAuthor" />
  </div>
</div>
<ModalWrapper id="create-author" size="xl">
  <AuthorForm />
</ModalWrapper>
</template>


<style lang="scss" scoped>

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1em;
}

</style>
