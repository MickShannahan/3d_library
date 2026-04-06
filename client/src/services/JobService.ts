import { reactive } from "vue"
import { AppState } from "@/AppState"
import { Job } from "@/models/Job"

type JobRunFn = (onProgress: (percent: number) => void, job: Job) => Promise<void>

class JobService {
  private _queue: Job[] = reactive([])

  addJobToQueue(label: string, run: JobRunFn, options: { indeterminate?: boolean } = {}): this {
    this._queue.push(new Job({ label, indeterminate: false, run, ...options }))
    return this
  }

  async runQueue(): Promise<void> {
    AppState.jobs = this._queue
    for (const job of this._queue) {
      await job.execute()
    }
  }

  clearJobQueue() {
    AppState.jobs = []
  }

  async retryFailedJobs() {
    const failedJobs = AppState.jobs.filter(j => j.status == 'error')
    for (const job of failedJobs) {
      await job.execute()
    }
  }
}

export const jobsService = new JobService()
