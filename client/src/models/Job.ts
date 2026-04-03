type JobStatus = 'pending' | 'active' | 'complete' | 'error'

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
  private _run: (onProgress: (percent: number) => void, job: typeof this) => Promise<void>

  constructor(options: JobOptions) {
    this.label = options.label
    this.status = 'pending'
    this.description = ''
    this.progress = 0
    this.indeterminate = options.indeterminate ?? true
    this.error = null
    this._run = options.run
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
