import { io, Socket } from 'socket.io-client'
import { baseURL } from '@/env'

class SocketService {
  private socket: Socket

  constructor() {
    this.socket = io(baseURL)
  }

  /**
   * Joins an upload room and waits for UPLOAD_COMPLETE.
   * The promise resolves once all files in the room have finished uploading to Azure.
   * Progress callbacks fire as each individual file completes.
   * @param roomId - The ID of the upload room (e.g. mesh._id)
   * @param onProgress - Optional callback with (done, total) counts as files complete
   */
  waitForUploadComplete(roomId: string, onProgress?: (loadedBytes: number, totalBytes: number) => void): { ready: Promise<void>, complete: Promise<void> } {
    let resolveReady!: () => void
    const ready = new Promise<void>(res => { resolveReady = res })

    const complete = new Promise<void>((resolve, reject) => {
      const progressHandler = ({ roomId: id, loadedBytes, totalBytes }: { roomId: string, loadedBytes: number, totalBytes: number }) => {
        if (id !== roomId) return
        onProgress?.(loadedBytes, totalBytes)
      }

      const completeHandler = ({ roomId: id }: { roomId: string }) => {
        if (id !== roomId) return
        cleanup()
        resolve()
      }

      const errorHandler = ({ roomId: id, message }: { roomId: string, message: string }) => {
        if (id !== roomId) return
        cleanup()
        reject(new Error(message))
      }

      const joinedHandler = (id: string) => {
        if (id !== roomId) return
        this.socket.off('JOINED_UPLOAD_ROOM', joinedHandler)
        resolveReady()
      }

      const cleanup = () => {
        this.socket.off('UPLOAD_PROGRESS', progressHandler)
        this.socket.off('UPLOAD_COMPLETE', completeHandler)
        this.socket.off('UPLOAD_ERROR', errorHandler)
      }

      this.socket.on('JOINED_UPLOAD_ROOM', joinedHandler)
      this.socket.on('UPLOAD_PROGRESS', progressHandler)
      this.socket.on('UPLOAD_COMPLETE', completeHandler)
      this.socket.on('UPLOAD_ERROR', errorHandler)

      this.socket.emit('JOIN_UPLOAD_ROOM', roomId)
    })

    return { ready, complete }
  }
}

export const socketService = new SocketService()
