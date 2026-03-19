/**
 * Service for capturing canvas screenshots from Three.js viewers
 */
export class CaptureService {
  /**
   * Capture a canvas element as a Blob image
   * @param {HTMLCanvasElement} canvas - Canvas element to capture
   * @param {string} format - Image format ('png' or 'jpeg')
   * @param {number} quality - JPEG quality (0-1), only applies to jpeg
   * @returns {Promise<Blob>}
   */
  static captureCanvas(canvas, format = 'png', quality = 0.95) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to capture canvas'))
            }
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Convert Blob to File object
   * @param {Blob} blob - Image blob
   * @param {string} filename - File name for the file object
   * @returns {File}
   */
  static blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type })
  }

  /**
   * Download blob as file to user's device
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename for download
   */
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Convert Blob to data URL
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<string>} Data URL
   */
  static blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}
