import { azureService } from './AzureService.js'
import { socketProvider } from '../SocketProvider.js'

/**
 * Single-worker queue for Azure uploads.
 * All incoming upload requests are enqueued here and processed one at a time,
 * preventing the Heroku dyno from being overwhelmed by concurrent Azure transfers.
 */
class AzureUploadQueue {
  constructor() {
    this._queue = []
    this._processing = false
  }

  enqueue(job) {
    this._queue.push(job)
    console.log(`[UploadQueue] Enqueued: ${job.file.name} (room: ${job.roomId ?? 'none'}) | Queue depth: ${this._queue.length}`)
    this._tick()
  }

  _tick() {
    if (this._processing || this._queue.length === 0) return
    this._processNext()
  }

  async _processNext() {
    this._processing = true
    const job = this._queue.shift()
    console.log(`[UploadQueue] Processing: ${job.file.name} | Remaining: ${this._queue.length}`)
    try {
      const onProgress = job.roomId
        ? (loadedBytes, totalBytes) => {
          socketProvider.messageRoom(job.roomId, 'UPLOAD_PROGRESS', { roomId: job.roomId, fileIndex: 0, loadedBytes, totalBytes })
        }
        : null
      const { uploadPromise } = azureService.fireAndForgetUpload(job.file, job.folder, job.client, onProgress)
      await uploadPromise
      console.log(`[UploadQueue] Complete: ${job.file.name}`)
      if (job.roomId) {
        socketProvider.messageRoom(job.roomId, 'UPLOAD_COMPLETE', { roomId: job.roomId, urls: [job.url] })
      }
    } catch (err) {
      console.error(`[UploadQueue] Failed: ${job.file.name}`, err)
      if (job.roomId) {
        socketProvider.messageRoom(job.roomId, 'UPLOAD_ERROR', { roomId: job.roomId, message: err.message })
      }
    }
    this._processing = false
    this._tick()
  }
}

const azureUploadQueue = new AzureUploadQueue()

class UploadService {

  /**
   * Ensures files parameter is always an array
   */
  ensureArray(files) {
    return Array.isArray(files) ? files : [files]
  }

  /**
   * Unified upload handler for single or multiple files with optional processing
   * @param {File|File[]} files - Single or multiple files to upload
   * @param {Object} options - Configuration options
   * @param {Function} options.processor - Optional function to process each file before upload
   * @param {string?} options.folder - Folder path in Azure
   * @param {string?} options.client - Azure client name (default: '3dmodels')
   * @param {boolean?} options.returnArray - Whether to return as array or single URL (default: true)
   * @returns {Promise<string|string[]>} Uploaded URL(s)
   */
  async uploadFiles(files, options = {}) {
    const {
      processor = null,
      folder = '',
      client = '3dmodels',
      returnArray = true
    } = options

    // Normalize to array
    const fileArray = this.ensureArray(files)

    // Process files if processor provided (e.g., convert images to WebP)
    let filesToUpload = fileArray
    if (processor) {
      filesToUpload = await Promise.all(
        fileArray.map(file => processor(file))
      )
    }

    // Upload all files
    const urls = await azureService.uploadBulkFiles(filesToUpload, folder, client)

    // Return single URL or array based on preference
    return returnArray ? urls : urls[0]
  }

  /**
   * Fire-and-forget upload: responds immediately with URLs, emits socket progress as Azure uploads complete
   * @param {File|File[]} files
   * @param {Object} options
   * @param {Function} options.processor - Optional processor (e.g. sharp)
   * @param {string} options.folder
   * @param {string} options.client
   * @param {string} options.roomId - Socket room to emit progress to
   * @returns {Promise<string[]>} URLs — available before Azure upload completes
   */
  async uploadFilesAsync(files, options = {}) {
    const {
      processor = null,
      folder = '',
      client = 'images',
      roomId = null
    } = options

    let fileArray = this.ensureArray(files)
    if (processor) {
      fileArray = await Promise.all(fileArray.map(file => processor(file)))
    }

    // Compute all URLs upfront — deterministic from filenames, no upload started yet
    const urls = fileArray.map(file => azureService.getBlobUrl(file, folder, client))

    // Add each file to the shared queue — the single worker drains them one at a time
    fileArray.forEach((file, i) => {
      azureUploadQueue.enqueue({ file, folder, client, roomId, url: urls[i] })
    })

    return urls
  }

  /**
   * Special handler for file sequences that are processed into a single output
   * (e.g., image sequence → animated GIF)
   * @param {File|File[]} files - Files to process into sequence
   * @param {Function} sequenceProcessor - Function that takes array of files and returns single processed file
   * @param {Object} options - Configuration options
   * @param {string} options.folder - Folder path in Azure
   * @param {string} options.client - Azure container name (default: '3dmodels')
   * @returns {Promise<string>} Uploaded URL
   */
  async uploadFileSequence(files, sequenceProcessor, options = {}) {
    const {
      folder = '',
      client = '3dmodels'
    } = options

    // Normalize to array
    const fileArray = this.ensureArray(files)

    // Process the entire sequence into a single file
    const processedFile = await sequenceProcessor(fileArray)

    // Upload the single processed file
    const url = await azureService.uploadFile(processedFile, folder, client)

    return url
  }

}

export const uploadService = new UploadService()
