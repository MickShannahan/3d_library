<script setup lang="ts">
import { AppState } from '@/AppState'
import { computed, reactive, watch } from 'vue'
import {Collapse} from 'bootstrap'
import { logger } from '@/utils/Logger'
import { jobsService } from '@/services/JobService'

const collapsed = reactive<Record<number, boolean>>({})
const jobs = computed(()=> AppState.jobs)
const allJobsDone = computed(()=> {
  return AppState.jobs.every(j => j.status =='complete') &&
  AppState.jobs.length
})

watch(
  jobs,
  (jobs) => {
    jobs.forEach((job, idx) => {
      if (job.subJobs?.length && job.subJobs.every(s => s.status === 'complete')) {
        toggleCollapsed(idx, true)
      }
    })
  },
  { deep: true }
)

const toggleCollapsed = (idx: number, value: boolean = null) => {
  collapsed[idx] = value === null ? !collapsed[idx] : value
  const collapsable = Collapse.getOrCreateInstance(`#subjobs-${idx}`)
  if(!collapsable) {return}
  if(collapsed[idx]){
    collapsable.hide()
  } else {
    collapsable.show()
  }
}

function clearJobs(){
  jobsService.clearJobQueue()
}
</script>

<template>
  <section id="jobs-pane" v-if="AppState.jobs.length">
    <div class="glass-pane border p-3 rounded rounded-3 d-flex flex-column gap-2">
      <div v-for="(job, idx) in AppState.jobs" :key="job.label" class="d-flex flex-column gap-1">
        <div class="d-flex align-items-center gap-2">

          <span class="job-icon">
            <span v-if="job.status === 'complete'" class="text-success"><i class="bi bi-check-circle"></i></span>
            <span v-else-if="job.status === 'error'" class="text-danger"><i class="bi bi-x-circle"></i></span>
            <span v-else-if="job.status === 'active' && job.indeterminate" ><i class="mdi mdi-loader mdi-spin"></i></span>
            <span v-else class="text-muted"><i class="bi bi-circle"></i></span>
          </span>

          <span :class="{ 'text-muted': job.status === 'pending', 'text-danger': job.status === 'error', 'clickable' : job.subJobs.length }" @click="toggleCollapsed(idx)">
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

        <div v-if="job.subJobs?.length && job.status != 'error'" >
          <div :id="`subjobs-${idx}`" class="collapse show">
            <div v-for="sub in job.subJobs" :key="sub.name">
              <div class="d-flex align-items-center gap-2">
                <span v-if="sub.status === 'complete'" class="text-success" ><i class="bi bi-check"></i></span>
                <span v-else-if="sub.status === 'error'" class="text-danger" ><i class="bi bi-x-"></i></span>
                <span v-else class="text-muted" ><i class="mdi mdi-cog mdi-spin"></i></span>
                <small class="text-secondary">{{ sub.name }}</small>
              </div>
              <div v-if="sub.status !== 'complete'" class="progress" style="height: 3px;">
                <div class="progress-bar" :style="{ width: sub.progress + '%' }" />
              </div>
            </div>
          </div>
        </div>

        <small v-if="job.status === 'error'" class="text-danger">{{ job.error }}</small>
      </div>
      <section>
        <div v-if="allJobsDone">
          <button @click="clearJobs" class="w-100">close <i class="mdi mdi-close"></i></button>
        </div>
      </section>
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

.clickable:hover{
  cursor: pointer;
  background-color: rgba(var(--bs-primary-rgb), .2);
}
</style>
