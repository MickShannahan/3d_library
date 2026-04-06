type JobStatus = 'pending' | 'active' | 'complete' | 'error'

import { reactive } from 'vue'

export interface SubJob {
  name: string
  progress: number
  status: JobStatus
}

interface JobOptions {
  label: string
  indeterminate?: boolean
  run: (onProgress: (percent: number) => void, job?: Job) => Promise<void>
}

export class Job {
  label: string
  description: string
  status: JobStatus
  progress: number
  indeterminate: boolean
  error: string | null
  subJobs: SubJob[]
  private _run: (onProgress: (percent: number) => void, job: typeof this) => Promise<void>

  constructor(options: JobOptions) {
    this.label = options.label
    this.status = 'pending'
    this.description = ''
    this.progress = 0
    this.indeterminate = options.indeterminate ?? true
    this.error = null
    this.subJobs = []
    this._run = options.run
  }

  createSubJob(name: string): SubJob {
    const subJob = reactive({ name, progress: 0, status: 'pending' as JobStatus })
    this.subJobs.push(subJob)
    return this.subJobs[this.subJobs.length - 1]
  }

  async execute() {
    this.status = 'active'
    try {
      await this._run((percent) => { this.progress = percent }, this)
      this.status = 'complete'
      this.description = ''
    } catch (e) {
      this.status = 'error'
      this.error = e.message
      throw e
    }
  }
}
