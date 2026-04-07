import { azureService } from './AzureService.js'
import { socketProvider } from '../SocketProvider.js'

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

    const results = fileArray.map((file, i) => {
      const onProgress = roomId
        ? (loadedBytes, totalBytes) => {
          socketProvider.messageRoom(roomId, 'UPLOAD_PROGRESS', { roomId, fileIndex: i, loadedBytes, totalBytes })
        }
        : null
      return azureService.fireAndForgetUpload(file, folder, client, onProgress)
    })
    const urls = results.map(r => r.url)

    if (roomId) {
      const total = results.length
      let done = 0
      const trackUploads = async () => {
        try {
          await Promise.all(results.map(async ({ uploadPromise }) => {
            await uploadPromise
            done++
            if (done === total) {
              socketProvider.messageRoom(roomId, 'UPLOAD_COMPLETE', { roomId, urls })
            }
          }))
        } catch (err) {
          socketProvider.messageRoom(roomId, 'UPLOAD_ERROR', { roomId, message: err.message })
        }
      }
      trackUploads()
    }

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
