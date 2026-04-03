<script setup lang="ts">
import { AppState } from '@/AppState'
</script>

<template>
  <section id="jobs-pane" v-if="AppState.jobs.length">
    <div class="glass-pane border p-3 rounded rounded-3 d-flex flex-column gap-2">
      <div v-for="job in AppState.jobs" :key="job.label" class="d-flex flex-column gap-1">
        <div class="d-flex align-items-center gap-2">

          <span class="job-icon">
            <span v-if="job.status === 'complete'" class="text-success"><i class="bi bi-check-circle"></i></span>
            <span v-else-if="job.status === 'error'" class="text-danger"><i class="bi bi-x-circle"></i></span>
            <span v-else-if="job.status === 'active' && job.indeterminate" ><i class="mdi mdi-loader mdi-spin"></i></span>
            <span v-else class="text-muted"><i class="bi bi-circle"></i></span>
          </span>

          <span :class="{ 'text-muted': job.status === 'pending', 'text-danger': job.status === 'error' }">
            {{ job.label }}
          </span>
        </div>

        <div v-if="job.description" class="ps-3 text-secondary">
          <i class="mdi mdi-cog mdi-spin"></i>
          {{ job.description }}
        </div>

        <div v-if="job.status === 'active' && !job.indeterminate" class="progress" style="height: 4px;">
          <div class="progress-bar" :style="{ width: job.progress + '%' }" />
        </div>

        <small v-if="job.status === 'error'" class="text-danger">{{ job.error }}</small>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
#jobs-pane {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
  min-width: 260px;
}
</style>
