import { reactive } from "vue"
import { AppState } from "@/AppState"
import { Job } from "@/models/Job"

type JobRunFn = (onProgress: (percent: number) => void, job: Job) => Promise<void>

class JobService {

  addJobToQueue(label: string, run: JobRunFn, options: { indeterminate?: boolean } = {}): this {
    AppState.jobs.push(new Job({ label, indeterminate: false, run, ...options }))
    return this
  }

  async runQueue(): Promise<void> {
    for (const job of AppState.jobs) {
      await job.execute()
    }
  }

  clearJobQueue() {
    AppState.jobs = []
    AppState.downloadJobs = []
  }

  async retryFailedJobs() {
    const failedJobs = AppState.jobs.filter(j => j.status == 'error')
    for (const job of failedJobs) {
      await job.execute()
    }
  }
}

export const jobsService = new JobService()
