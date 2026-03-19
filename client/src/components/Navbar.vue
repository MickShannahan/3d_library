<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { loadState, saveState } from '../utils/Store.js';
import { AppState } from '../AppState.js';
import Login from './Login.vue';

const router = useRouter()
const theme = ref(loadState('theme') || 'light')

function toggleTheme() {
  theme.value = theme.value == 'light' ? 'dark' : 'light'
}

watch(theme, () => {
  document.documentElement.setAttribute('data-bs-theme', theme.value)
  saveState('theme', theme.value)
}, { immediate: true })

</script>

<template>
  <nav class="navbar navbar-expand-md bg-codeworks border-bottom border-vue">
    <div class="container gap-2">
      <RouterLink :to="{ name: 'Home' }" class="d-flex align-items-center text-light">
        <img class="navbar-brand" alt="logo" src="/img/cw-logo.png" height="45" />
        <b class="fs-5">3D Library</b>
      </RouterLink>
      <!-- collapse button -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-links"
        aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span class="mdi mdi-menu text-light"></span>
      </button>
      <!-- collapsing menu -->
      <div class="collapse navbar-collapse" id="navbar-links">
        <ul class="navbar-nav">
          <li>
            <RouterLink :to="{ name: 'Library' }" class="btn text-green selectable">
              <i class="mdi mdi-library"></i> Library
            </RouterLink>
          </li>
          <li v-if="AppState.user">
            <RouterLink :to="{ name: 'OrderForm' }" class="btn text-green selectable">
              <i class="mdi mdi-plus-circle"></i> Create Order
            </RouterLink>
          </li>
          <li v-if="AppState.user">
            <RouterLink :to="{ name: 'AdminDashboard' }" class="btn text-green selectable">
              <i class="mdi mdi-clipboard-list"></i> Orders
            </RouterLink>
          </li>
          <li v-if="AppState.user">
            <RouterLink :to="{ name: 'ModelUploadForm' }" class="btn text-green selectable">
              <i class="mdi mdi-upload"></i> Upload
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'About' }" class="btn text-green selectable">
              About
            </RouterLink>
          </li>
        </ul>
        <!-- LOGIN COMPONENT HERE -->
        <div class="ms-auto">
          <button class="btn text-light" @click="toggleTheme"
            :title="`Enable ${theme == 'light' ? 'dark' : 'light'} theme.`">
            <i v-if="theme == 'dark'" class="mdi mdi-weather-sunny"></i>
            <i v-if="theme == 'light'" class="mdi mdi-weather-night"></i>
          </button>
        </div>
        <Login />
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
a {
  text-decoration: none;
}

.nav-link {
  text-transform: uppercase;
}

.navbar-nav .router-link-exact-active {
  border-bottom: 2px solid var(--bs-success);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
