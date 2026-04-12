import { SocketHandler } from '../utils/SocketHandler.js'

export class DownloadHandler extends SocketHandler {
  /**
   * @param {import("socket.io").Server} io
   * @param {import("socket.io").Socket} socket
   */
  constructor(io, socket) {
    super(io, socket, false)
    this
      .on('JOIN_DOWNLOAD_ROOM', this.joinDownloadRoom)
  }

  joinDownloadRoom(roomId) {
    this.socket.join(roomId)
    this.messageSelf('JOINED_DOWNLOAD_ROOM', roomId)
  }
}
