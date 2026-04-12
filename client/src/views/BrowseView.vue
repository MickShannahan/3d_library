<script setup>
import { AppState } from '@/AppState';
import JobsPane from '@/components/JobsPane.vue';
import { computed } from 'vue';


const downloadJobs = computed(()=>AppState.downloadJobs)

</script>


<template>
<div class="d-flex flex-column flex-grow-1">
  <RouterView />
  <JobsPane :jobs="downloadJobs"/>
</div>
</template>
