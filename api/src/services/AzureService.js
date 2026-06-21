import { AccountSASPermissions, BlobServiceClient, BlockBlobClient, ContainerSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob"
import { socketProvider } from "../SocketProvider.js";
import AdmZip from "adm-zip"

/** @type {{string: BlobServiceClient}} clients */
const clients = {
  '3dmodels': BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION),
  images: BlobServiceClient.fromConnectionString(process.env.AZURE_IMAGE_CONNECTION)
}

const config = {
  blobHTTPHeaders: {
    blobCacheControl: 'max-age=36000'
  }
}

class AzureService {

  async uploadFile(file, folder = '', client = 'images') {
    const blobName = `${folder ? folder + '/' : ''}${file.name}${file.extension ? file.extension : ''}`
    console.log('upload', blobName, folder, client, file)
    const container = clients[client].getContainerClient(client)
    const blockBlob = container.getBlockBlobClient(blobName)
    const blobOptions = {
      blobHTTPHeaders: {
        ...config.blobHTTPHeaders,
        blobContentType: file.mimetype
      }
    }
    const response = await blockBlob.upload(file.data, file.size, blobOptions)
    if (response.errorCode) throw new Error(response.errorCode)
    return blockBlob.url
  }

  async uploadBulkFiles(files, folder = '', client = 'images') {
    const urls = []
    for (const file of files) {
      const url = await this.uploadFile(file, folder, client)
      urls.push(url)
    }
    return urls
  }

  getBlobUrl(file, folder = '', clientName = 'images') {
    const blobName = `${folder ? folder + '/' : ''}${file.name}${file.extension ? file.extension : ''}`
    const container = clients[clientName].getContainerClient(clientName)
    return container.getBlockBlobClient(blobName).url
  }

  fireAndForgetUpload(file, folder = '', clientName = 'images', onProgress = null) {
    const blobName = `${folder ? folder + '/' : ''}${file.name}${file.extension ? file.extension : ''}`
    const container = clients[clientName].getContainerClient(clientName)
    const blockBlob = container.getBlockBlobClient(blobName)
    const BLOCK_SIZE = 4 * 1024 * 1024
    const uploadOptions = {
      blobHTTPHeaders: {
        ...config.blobHTTPHeaders,
        blobContentType: file.mimetype
      },
      blockSize: BLOCK_SIZE,
      // Must be 0 to force block staging — default is 256MB which means
      // any file under 256MB is sent as a single PUT with one progress event at completion
      maxSingleShotSize: 0,
      concurrency: 2,
      onProgress: onProgress ? ev => onProgress(ev.loadedBytes, file.size) : undefined
    }
    const uploadPromise = blockBlob.uploadData(file.data, uploadOptions)
    return { url: blockBlob.url, uploadPromise }
  }

  async deleteFile(url = '') {
    const { hostname, pathname } = new URL(url)
    const [, containerName, ...blobParts] = pathname.split('/')
    const blobName = blobParts.join('/')
    const client = Object.values(clients).find(c => c.url.includes(hostname))
    if (!client) throw new Error(`No Azure client found for host: ${hostname}`)
    const container = client.getContainerClient(containerName)
    await container.deleteBlob(blobName)
  }

  async deleteBulkFiles(urls = []) {
    await Promise.all(urls.map(url => this.deleteFile(url)))
  }


  async generateSASToken(clientName = '3dmodels') {
    /** @type {BlobServiceClient} client */
    const sasQuery = generateBlobSASQueryParameters({
      containerName: clientName,
      expiresOn: new Date(Date.now() + 1000 * 60 * 5),
      permissions: ContainerSASPermissions.parse("rl")
    },
      new StorageSharedKeyCredential('3dlib', process.env.AZURE_STORAGE_KEY)
    )
    console.log(sasQuery.toString())
    return sasQuery.toString()
  }

  async downloadFilesAsZip(files = [], socketRoomId = '') {
    const zip = new AdmZip()
    /** @type {BlobServiceClient} */
    const serviceClient = clients['3dmodels']
    const containerClient = serviceClient.getContainerClient('3dmodels')
    const total = files.length
    let done = 0
    for (let file of files) {
      const blobName = getBlobName(file)
      console.log('📥', blobName)
      const blob = containerClient.getBlobClient(blobName)
      const data = await blob.downloadToBuffer()
      const fileName = file.slice(file.lastIndexOf('/') + 1)
      zip.addFile(fileName, data)
      done++
      if (socketRoomId) socketProvider.messageRoom(socketRoomId, 'DOWNLOAD_PROGRESS', { roomId: socketRoomId, done, total })
    }

    if (socketRoomId) socketProvider.messageRoom(socketRoomId, 'DOWNLOAD_COMPLETE', { roomId: socketRoomId })
    return zip.toBuffer()
  }



}


function getBlobName(blobUrl = '') {
  const { hostname, pathname } = new URL(blobUrl)
  const [, containerName, ...blobParts] = pathname.split('/')
  return blobParts.join('/').replaceAll('%20', ' ')
}

export const azureService = new AzureService()