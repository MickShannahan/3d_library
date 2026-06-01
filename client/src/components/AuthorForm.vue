<script setup lang="ts">
import { authorsService } from '@/services/AuthorsService';
import { Author, type AuthorLink } from '@/models/Author';
import { Pop } from '@/utils/Pop';
import { AppState } from '@/AppState';
import { Modal } from 'bootstrap';
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { api } from '@/services/AxiosService';
import AuthorListCard from './AuthorListCard.vue';

const DEFAULT_PREVIEW_IMAGE = new URL('@/assets/matcaps/purple_mat_512.png', import.meta.url).href

const ICON_OPTIONS = [
  { label: 'Link',       icon: 'mdi-link-variant' },
  { label: 'Patreon',    icon: 'mdi-patreon' },
  { label: 'Instagram',  icon: 'mdi-instagram' },
  { label: 'Twitter/X',  icon: 'mdi-twitter' },
  { label: 'YouTube',    icon: 'mdi-youtube' },
  { label: 'Twitch',     icon: 'mdi-twitch' },
  { label: 'Discord',    icon: 'mdi-discord' },
  { label: 'GitHub',     icon: 'mdi-github' },
  { label: 'Facebook',   icon: 'mdi-facebook' },
  { label: 'TikTok',     icon: 'mdi-music-note' },
  { label: 'Store',      icon: 'mdi-storefront' },
  { label: 'Website',    icon: 'mdi-web' },
]

const formData = reactive({
  name: '',
  socials: [] as AuthorLink[]
})
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const loading = ref(false)
const openIconDropdown = ref<number | null>(null)

const editMode = computed(() => !!AppState.editingAuthor)

watch(() => AppState.editingAuthor, (author) => {
  if (!author) return
  formData.name = author.name
  formData.socials = author.socials.map(s => ({ ...s }))
  imagePreview.value = author.image
  imageFile.value = null
})

onMounted(() => {
  document.getElementById('create-author')?.addEventListener('hidden.bs.modal', () => {
    AppState.editingAuthor = null
    formData.name = ''
    formData.socials = []
    imageFile.value = null
    imagePreview.value = ''
  })
})

const previewAuthor = computed(() => new Author({
  name: formData.name || 'Author Name',
  image: imagePreview.value || DEFAULT_PREVIEW_IMAGE,
  socials: formData.socials
}))

function handleImagePicked(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function addLink() {
  formData.socials.push({ name: '', icon: 'mdi-link-variant', url: '' })
}

function removeLink(index: number) {
  formData.socials.splice(index, 1)
}

function pickIcon(index: number, icon: string) {
  formData.socials[index].icon = icon
  openIconDropdown.value = null
}

function toggleIconDropdown(index: number) {
  openIconDropdown.value = openIconDropdown.value === index ? null : index
}

async function submitForm() {
  if (!formData.name || (!editMode.value && !imageFile.value)) return

  loading.value = true
  try {
    let imageUrl = AppState.editingAuthor?.image ?? ''

    if (imageFile.value) {
      const form = new FormData()
      form.append('images', imageFile.value, imageFile.value.name)
      const uploadRes = await api.post('upload/images', form)
      imageUrl = uploadRes.data[0]
    }

    if (editMode.value) {
      await authorsService.updateAuthor(AppState.editingAuthor._id, { name: formData.name, image: imageUrl, socials: formData.socials })
      Pop.toast(`${formData.name} updated!`)
    } else {
      await authorsService.createAuthor({ name: formData.name, image: imageUrl, socials: formData.socials })
      Pop.toast(`${formData.name} created!`)
    }

    Modal.getOrCreateInstance('#create-author').hide()
  } catch (error) {
    Pop.error(error, editMode.value ? 'Could not update author' : 'Could not create author')
  }
  loading.value = false
}
</script>


<template>
<div class="p-2">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0">{{ editMode ? 'Edit Author' : 'Create Author' }}</h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
  </div>

  <div class="row g-3">
    <div class="col-md-8">
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="formData.name" type="text" class="form-control" minlength="3" maxlength="50" required placeholder="Author name">
        </div>

        <div class="mb-3">
          <label class="form-label">Profile Image</label>
          <input type="file" class="form-control" accept="image/*" @change="handleImagePicked" :required="!editMode">
        </div>

        <div class="mb-2">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Social Links</label>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="addLink">
              <i class="mdi mdi-plus"></i> Add Link
            </button>
          </div>

          <div v-for="(link, i) in formData.socials" :key="i" class="social-row mb-2">

            <div class="icon-picker position-relative">
              <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click="toggleIconDropdown(i)">
                <i class="mdi" :class="link.icon"></i>
              </button>
              <ul v-if="openIconDropdown === i" class="icon-dropdown list-unstyled">
                <li v-for="opt in ICON_OPTIONS" :key="opt.icon">
                  <button type="button" class="icon-dropdown-item" @click="pickIcon(i, opt.icon)">
                    <i class="mdi" :class="opt.icon"></i>
                    <span>{{ opt.label }}</span>
                  </button>
                </li>
              </ul>
            </div>

            <input v-model="link.name" type="text" class="form-control form-control-sm" placeholder="Label" maxlength="50">
            <input v-model="link.url" type="url" class="form-control form-control-sm" placeholder="https://..." maxlength="400">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeLink(i)">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
        </div>

        <div class="text-end mt-3">
          <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-normal-grad" :disabled="loading">
            <span v-if="loading"><i class="mdi mdi-loading mdi-spin"></i> Saving...</span>
            <span v-else>{{ editMode ? 'Save Changes' : 'Create Author' }} <i class="mdi" :class="editMode ? 'mdi-content-save' : 'mdi-account-plus'"></i></span>
          </button>
        </div>
      </form>
    </div>

    <div class="col-md-4">
      <label class="form-label">Preview</label>
      <div class="no-interact">
        <AuthorListCard :author="previewAuthor" />
      </div>
    </div>
  </div>
</div>
</template>


<style lang="scss" scoped>
.social-row {
  display: grid;
  grid-template-columns: auto 1fr 2fr auto;
  gap: .5em;
  align-items: center;
}

.icon-picker {
  min-width: 48px;
}

.icon-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  background: var(--bs-dark);
  border: 1px solid rgba(var(--bs-primary-rgb), .4);
  border-radius: .375rem;
  padding: .25rem 0;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
}

.icon-dropdown-item {
  display: flex;
  align-items: center;
  gap: .5em;
  width: 100%;
  background: none;
  border: none;
  color: inherit;
  padding: .35rem .75rem;
  cursor: pointer;
  font-size: .875rem;

  &:hover {
    background: rgba(var(--bs-primary-rgb), .15);
  }
}

.no-interact {
  pointer-events: none;
}
</style>

