/**
 * Crops a square from the center of a source canvas and scales it to the desired size.
 * Useful for capturing fixed-size square thumbnails from a renderer canvas
 * regardless of the window's aspect ratio.
 */
export function cropSquareFromCanvas(source: HTMLCanvasElement, size: number = 512): string {
  const srcWidth = source.width
  const srcHeight = source.height
  const srcSize = Math.min(srcWidth, srcHeight)
  const srcX = (srcWidth - srcSize) / 2
  const srcY = (srcHeight - srcSize) / 2

  const offscreen = document.createElement('canvas')
  offscreen.width = size
  offscreen.height = size
  offscreen.getContext('2d').drawImage(
    source,
    srcX, srcY, srcSize, srcSize,
    0, 0, size, size
  )
  return offscreen.toDataURL('image/png')
}

/**
 * Reformats an array of raw dataURL captures by cropping each to a centered square.
 */
export function reformatCaptures(sources: HTMLCanvasElement[], size: number = 512): string[] {
  return sources.map(src => cropSquareFromCanvas(src, size))
}
