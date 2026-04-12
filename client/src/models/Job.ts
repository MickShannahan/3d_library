type JobStatus = 'pending' | 'active' | 'complete' | 'error'

import { reactive } from 'vue'

export interface SubJob {
  name: string
  progress: number
  status: JobStatus
  startTime: Date | null
  endTime: Date | null
}

interface JobOptions {
  label: string
  indeterminate?: boolean
  run: (onProgress: (percent: number) => void, job?: Job) => Promise<void>,
  description?: string
}

export class Job {
  label: string
  description: string
  _status: JobStatus
  startTime: Date | null
  endTime: Date | null
  progress: number
  indeterminate: boolean
  error: string | null
  subJobs: SubJob[]
  _run: (onProgress: (percent: number) => void, job: typeof this) => Promise<void>

  constructor(options: JobOptions) {
    this.label = options.label
    this._status = 'pending'
    this.startTime = null
    this.endTime = null
    this.description = options.description ?? ''
    this.progress = 0
    this.indeterminate = options.indeterminate ?? true
    this.error = null
    this.subJobs = []
    this._run = options.run
  }

  get status(): JobStatus {
    return this._status
  }

  set status(value: JobStatus) {
    this._status = value
    if (value === 'active') this.startTime = new Date()
    else if (value === 'complete' || value === 'error') this.endTime = new Date()
  }

  createSubJob(name: string): SubJob {
    const subJob = reactive<SubJob>({ name, progress: 0, status: 'pending', startTime: null, endTime: null })
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
