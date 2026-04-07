import { SocketHandler } from '../utils/SocketHandler.js'

export class UploadHandler extends SocketHandler {
  /**
   * @param {import("socket.io").Server} io
   * @param {import("socket.io").Socket} socket
   */
  constructor(io, socket) {
    super(io, socket, false)
    this
      .on('JOIN_UPLOAD_ROOM', this.joinUploadRoom)
  }

  joinUploadRoom(roomId) {
    this.socket.join(roomId)
    this.messageSelf('JOINED_UPLOAD_ROOM', roomId)
  }
}
